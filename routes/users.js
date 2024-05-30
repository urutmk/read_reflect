const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const axios = require('axios');

function isLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl
    req.flash('error', 'You must be signed in first!');
    return res.redirect('/login');
  }
  next();
}

router.get('/register', (req, res,next) => {
  if(req.user){
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
  });
  res.redirect('register')
}

  res.render('users/register');
});

router.post('/register', async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, err => {
      if (err) return next(err);
      req.flash('success', 'Welcome!');
      res.redirect(`/books/${username}`);
    })
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('register');
  }
});

router.get('/login', (req, res) => {
  if(req.user)
    res.redirect(`/books/${req.user.username}`)
  res.render('users/login');
  
})

router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
  req.flash('success', 'welcome back!');

  const redirectUrl = req.session.returnTo || `/books/${req.user.username}`;
  delete req.session.returnTo;
  res.redirect(redirectUrl);
})

router.get('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash('success', 'Goodbye!');
    res.redirect('/');
  });
});

router.get('/home', isLoggedIn, (req, res) => {
  const username = req.user.username;
  res.render('index', { username })
})

router.get('/search', isLoggedIn, (req, res) => {
  const username = req.user.username;
  res.render('search', { error: null, books: null });
});

router.get('/notes', isLoggedIn, (req, res) => {
  const username = req.user.username;
  res.render('note', { username });
});

router.get('/bsearch', isLoggedIn, async (req, res, next) => {
  try {
    const { query, author } = req.query;


    // Construct the API request URL with error handling
    const baseUrl = 'https://www.googleapis.com/books/v1/volumes';
    const key=process.env.GOOGLE_API
    let url = `${baseUrl}?q=${query}+inauthor:${author}&key=${key}`;

    try {
      const response = await axios.get(url);
      const books = response.data.items;

      if (books && books.length > 0) {
        res.render('search', { books, error: null });
      }
      else {
        books=null
        return next({ statusCode: 400, message: 'No search results found. Try refining your search terms.' });
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      return next({ message: 'Internal Server Error. Please try again later.' });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return next({ message: 'Internal Server Error. Please try again later.' });
  }
})

module.exports = router;
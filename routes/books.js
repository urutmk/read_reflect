const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const passport = require('passport');

function isLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl
    req.flash('error', 'You must be signed in first!');
    return res.redirect('/login');
  }
  next();
}

function isAuthorized(req, res, next) {
  if (req.params.username !== req.user.username) {
   return next({message:'You are not authorized to access this page!'}); 
  }
  next();
}

// GET all books for a specific user
router.get('/:username', isLoggedIn, isAuthorized,async (req, res,next) => {
  try {
    const { username } = req.params;
    const user = await Book.findOne({ username });
    if (!user) {
      res.render('list',{books:null})
    }
    const books=user.books
   
    res.render('list',{books});
  } catch (err) {
    console.error('Error fetching books:', err);
    return next({ message: 'Internal server error' });
  }
});

// POST a new book for a specific user
router.post('/:username',isLoggedIn, isAuthorized, async (req, res) => {
  try {
    const { username } = req.params;
    const { title, author, isbn } = req.body;

    let user = await Book.findOne({ username });
    if (!user) {
      user = new Book({
        username,
        books: []
      });
    }

      const newBook = {
        title,
        author,
        isbn
      };

      user.books.push(newBook);
      await user.save();

      res.status(201).json(newBook);
    } 
  catch (err) {
    console.error('Error adding book:', err);
    return next({ message: 'Internal server error:could not post book' });
  }
});

// DELETE a book for a specific user
router.delete('/:username/:id',isLoggedIn, isAuthorized, async (req, res, next) => {
  try {
    const { username, id } = req.params;
    const user = await Book.findOne({ username });

    if (!user) {
      return next({ message: 'User not found' });
    }

    // Find the index of the book to be deleted
    const bookIndex = user.books.findIndex(book => book._id == id);

    if (bookIndex === -1) {
      return next({ message: 'Book not found' });
    }

    // Remove the book from the array
    user.books.splice(bookIndex, 1);

    // Save the updated user object
    await user.save();

    res.redirect(`/books/${username}`);
    
  } catch (err) {
    console.error('Error deleting book:', err);
    next({ message: 'Internal server error' });
  }
});


module.exports = router;

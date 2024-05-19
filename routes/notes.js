
const express = require('express');
const router = express.Router();
const Note = require('../models/note');
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

// GET all notes for a specific user
router.get('/:username',isLoggedIn,isAuthorized, async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await Note.findOne({ username });
    if (!user) {
      res.render('note', { notes:null });
    }
    const notes = user.notes;
    res.render('note', { notes });
  } catch (err) {
    console.error('Error fetching notes:', err);
    next({ message: 'Internal server error' });
  }
});

// POST a new note for a specific user
router.post('/:username',isLoggedIn,isAuthorized, async (req, res, next) => {
  try {
    const { username } = req.params;
    const { title,note } = req.body;

    let userNotes = await Note.findOne({ username });
    if (!userNotes) {
      userNotes = new Note({
        username,
        notes: []
      });
    }
    const newNote = {
      title,
      note
    };
    userNotes.notes.push(newNote);
    await userNotes.save();
    res.redirect(`/notes/${username}`);
  } 
  catch (err) {
    console.error('Error adding note:', err);
    next({ message: 'Internal server error' });
  }
});
router.get('/:username/:noteId/edit',isLoggedIn,isAuthorized, async (req, res,next) => {
  try {
    const { username, noteId } = req.params;
    const userNotes = await Note.findOne({ username });

    if (!userNotes) {
      return next({ message: 'User not found' });
    }

    const noteIndex = userNotes.notes.findIndex(note => note._id == noteId);
    console.log(noteIndex);
    if (noteIndex === -1) {
      return next({ message: 'Note not found' });
    }
    const title=userNotes.notes[noteIndex].title;
    const note=userNotes.notes[noteIndex].note;
    res.render('edit', { noteId ,title,note})

  } catch (err) {
    console.error('Error finding note:', err);
    next({ message: 'Internal server error' });
  }
  
})
// PUT route to update a note for a specific user
router.put('/:username/:noteId',isLoggedIn,isAuthorized, async (req, res, next) => {
  try {
    const { username, noteId } = req.params;
    const { newTitle,newNote } = req.body;

    const userNotes = await Note.findOne({ username });

    if (!userNotes) {
      return next({ message: 'User not found' });
    }

    const noteIndex = userNotes.notes.findIndex(note => note._id == noteId);
    userNotes.notes[noteIndex].title = newTitle;
    userNotes.notes[noteIndex].note = newNote;
    await userNotes.save();
    res.redirect(`/notes/${username}`)
  } catch (err) {
    console.error('Error updating note:', err);
    next({ message: 'Internal server error' });
  }
});

// DELETE a note for a specific user
router.delete('/:username/:noteId',isLoggedIn,isAuthorized, async (req, res, next) => {
  try {
    const { username, noteId } = req.params;
    const userNotes = await Note.findOne({ username });

    if (!userNotes) {
      return next({ message: 'User not found' });
    }

    const noteIndex = userNotes.notes.findIndex(note => note._id == noteId);
    if (noteIndex === -1) {
      return next({ message: 'Note not found' });
    }

    userNotes.notes.splice(noteIndex, 1);
    await userNotes.save();
    res.redirect(`/notes/${username}`);
  } catch (err) {
    console.error('Error deleting note:', err);
    next({ message: 'Internal server error' });
  }
});

module.exports = router;


const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    notes: [{
        title: {
            type: String,
            required: true
        },
        note:{
        type: String,
        required: true
        }
    }]
});

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;

const mongoose = require('mongoose');


const bookSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    books:[{
        title: {
            type: String,
            required: true
        },
        author: {
            type: String,
            required: true
        },
        isbn: {
            type: String,
            default:""
        }
    }]
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;

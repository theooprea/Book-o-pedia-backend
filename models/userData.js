const mongoose = require('mongoose')
const Schema = mongoose.Schema

var bookSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    genre: {
        type: String,
        required: true
    },
    pages: {
        type: Number,
        required: true,
        min: 0
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    seller: {
        type: String,
        required: true
    }
})

var userDataSchema = new Schema ({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    wishList: [bookSchema],
    books: [bookSchema]
})

module.exports = mongoose.model('userData', userDataSchema)
const express = require('express')
const bodyParser = require('body-parser')
const authenticate = require('../middleware/authenticate')

const userData = require('../models/userData')
const userCredentials = require('../models/userCredentials')

const booksRouter = express.Router()
booksRouter.use(bodyParser.json())

booksRouter.route('/')
.get(authenticate, (req, res) => {
    userData.find({}).then((users) => {
        console.log('GET /books')
        
        var booksResponse = []

        users.forEach((userIterator) => {
            var userBooks = userIterator.books

            userBooks.forEach((bookIterator) => {
                booksResponse.push(bookIterator)
            })
        })

        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(booksResponse)
    }, (err) => {
        console.log('GET /books error ' + err)
        res.statusCode = 500
        res.send(err)
    })
})

module.exports = booksRouter
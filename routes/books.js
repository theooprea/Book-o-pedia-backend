let Books = [
    {
        "id": 1,
        "title": 'salut',
        "author": 'scuze'
    }, 
    {
        "id": 2,
        "title": 'aaaaaa salut',
        "author": 'aaaaaaaa scuze'
    }
]

const express = require('express')
const bodyParser = require('body-parser')
const booksRouter = express.Router()
booksRouter.use(bodyParser.json())

booksRouter.route('/')
.get((req, res) => {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.json(Books)
})
.post((req, res) => {
    const reqBook = req.body
    let index = Books.length
    console.log(index)
    const newBook = {
        "id": index + 1,
        "title": reqBook.title,
        "author": reqBook.author
    }

    Books.push(newBook)

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(Books);
})
.delete((req, res) => {
    Books = []
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(Books);
})

booksRouter.route('/:id')
.get()
.delete()

module.exports = booksRouter
const express = require('express')
const app = express()
const PORT = 3000

const booksRouter = require('./routes/books')
const userDataRouter = require('./routes/userDataRouter')
const userCredentialsRouter = require('./routes/auth')

const authenticate = require('./middleware/authenticate')
const mongoose = require('mongoose')
const connect = mongoose.connect('mongodb://localhost:27017/bookOLX')

connect.then((db) => {
    console.log("Connected succesfully")
}, (err) => {console.log(err)})

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.use('/books', booksRouter)
app.use('/users', userDataRouter)
app.use('/auth', userCredentialsRouter)

app.listen(PORT, () => {
    console.log('o pornit ba!')
})
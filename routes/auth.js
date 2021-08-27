const express = require('express')
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const options = require('../config')

const userData = require('../models/userData')
const userCredentials = require('../models/userCredentials')

const userCredentialsRouter = express.Router()
userCredentialsRouter.use(bodyParser.json())

userCredentialsRouter.route('/')
.get((req, res) => {
    res.statusCode = 418
    res.send("I'm a teapot")
})

userCredentialsRouter.route('/register')
.post((req, res) => {
    const inputUserCredentials = {}
    const inputUserData = {}

    if (!(req.body.email && req.body.password && req.body.username && req.body.phone)) {
        res.statusCode = 400
        res.send('All input is required')
        return
    }

    userCredentials.findOne({ email: req.body.email }).then((user) => {
        console.log('Register ' + user)
        if (!user) {
            inputUserCredentials.email = req.body.email
            inputUserCredentials.password = req.body.password
        
            inputUserData.username = req.body.username
            inputUserData.email = req.body.email
            inputUserData.phone = req.body.phone
            inputUserData.wishList = []
            inputUserData.books = []
        
            responseMessage = {}
            responseMessage.credentials = inputUserCredentials
            responseMessage.data = inputUserData
        
            try {
                userCredentials.create(inputUserCredentials)
                userData.create(inputUserData)
        
                res.statusCode = 201
                res.setHeader('Content-Type', 'application/json')
                res.json(responseMessage)
            } catch (error) {
                res.statusCode = 500
                res.send(error)
            }
        }
        else {
            res.statusCode = 409
            res.send('Email address already used, please login')
        }
    }, (err) => {
        console.log('Register error ' + err)
        res.statusCode = 500
        res.send(error)
    })
})

userCredentialsRouter.route('/login')
.post((req, res) => {
    if (!(req.body.email && req.body.password)) {
        res.statusCode = 400
        res.send('All input is required')
        return
    }

    userCredentials.findOne({ email: req.body.email }).then((user) => {
        if (user.password === req.body.password) {
            const token = jwt.sign({email:user.email}, options.secretKey, {expiresIn: 3600})
            const responseMessage = {}
            responseMessage.user = user
            responseMessage.token = token

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.json(responseMessage)
        }
        else {
            res.statusCode = 400
            res.send('Invalid credentials')
        }
    }, (err) => {
        console.log('Login error ' + err)
        res.statusCode = 500
        res.send(error)
    })
})
// TODO: add logout route

module.exports = userCredentialsRouter
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
    console.log('POST /register')
    const inputUserCredentials = {}
    const inputUserData = {}

    if (!(req.body.email && req.body.password && req.body.username && req.body.phone)) {
        res.statusCode = 400
        res.send('All input is required')
        return
    }

    userCredentials.findOne({ email: req.body.email }).then((user) => {
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
    console.log('POST /login')
    if (!(req.body.email && req.body.password)) {
        res.statusCode = 400
        res.send('All input is required')
        return
    }

    userCredentials.findOne({ email: req.body.email }).then((user) => {
        if (user) {
            if (user.password === req.body.password) {
                const token = jwt.sign(
                    {email:user.email},
                    options.secretKey,
                    {expiresIn: 3600}
                )
    
                userData.findOne( { email: req.body.email }).then((userdata) => {
                    const responseMessage = {}
                    responseMessage.username = userdata.username
                    responseMessage.email = user.email
                    responseMessage.token = token
        
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.json(responseMessage)
                }, (err) => {
                    res.statusCode = 500
                    res.send(err)
                })
            }
            else {
                res.statusCode = 400
                res.send('Invalid credentials')
            }
        }
        else {
            res.statusCode = 404
            res.send('User not found')
        }
    }, (err) => {
        console.log('Login error ' + err)
        res.statusCode = 500
        res.send(error)
    })
})

module.exports = userCredentialsRouter
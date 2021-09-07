const jwt = require('jsonwebtoken')
const config = require('../config')
const userData = require('../models/userData')

const verifyToken = async (req, res, next) => {
    var token = req.headers['authorization']

    if (token && (token.includes('bearer') || token.includes('Bearer') || token.includes('BEARER'))) {
        token = token.split(' ')[1]
    }

    if (!token) {
        res.statusCode = 403
        res.send('A token is required for authentication')
        return
    }

    try {
        const decoded = jwt.verify(token, config.secretKey)

        await userData.findOne({ email: decoded.email }).then((user) => {
            req.username = user.username
            req.email = user.email
        })
    }
    catch (err) {
        res.statusCode = 401
        res.send('Invalid Token')
        return
    }

    next()
}

module.exports = verifyToken
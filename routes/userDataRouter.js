const express = require('express')
const bodyParser = require('body-parser')

const userData = require('../models/userData')

const userDataRouter = express.Router()
userDataRouter.use(bodyParser.json())

userDataRouter.route('/')
.get((req, res) => {
    userData.find({}).then((users) => {
        console.log('GET /userData')
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(users)
    }, (err) => {
        console.log('GET /userData error ' + err)
        res.statusCode = 500
        res.send(err)
    })
})
.post((req, res) => {
    userData.create(req.body).then((user) => {
        console.log('POST /userData ' + req.body.username + " " + req.body.email + " " + req.body.phone)
        res.statusCode = 201
        res.setHeader('Content-Type', 'application/json')
        res.json(user)
    }, (err) => {
        console.log('POST /userData error ' + err)
        res.statusCode = 500
        res.send(err)
    })
})
.put((req, res) => {
    res.statusCode = 403;
    res.send('PUT operation not supported on /users');
})
.delete((req, res) => {
    userData.remove({}).then((users) => {
        console.log('DELETE /userData')
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(users)
    }, (err) => {
        console.log('DELETE /userData error ' + err)
        res.statusCode = 500
        res.send(err)
    })
})

// TODO: fix put to update all wishLists everywhere
userDataRouter.route('/:username')
.get((req, res) => {
    userData.findOne({ username: req.params.username }).then((user) => {
        console.log('GET /userData/' + req.params.username)
        if (user != null) {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.json(user)
        }
        else {
            res.statusCode = 404
            res.send('No ' + req.params.username + ' user found')
        }
    }, (err) => {
        console.log('GET /userData/' + req.params.username + ' error ' + err)
        res.statusCode = 500
        res.send(err)
    })
})
.post((req, res) => {
    res.statusCode = 403;
    res.send('POST operation not supported on /users/' + req.params.username);
})
// TODO: fix put to update all wishLists everywhere
.put((req, res) => {
    userData.findOne( { username: req.params.username }).then((user) => {
        console.log('PUT /userData/' + req.params.username + ' ' +
            req.body.username + " " + req.body.email + " " + req.body.phone)

        if (user != null) {
            user.username = req.body.username
            user.email = req.body.email
            user.phone = req.body.phone

            user.save().then((user) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(user);
            }, (err) => {
                res.statusCode = 500
                res.send(err)
            })
        }
        else {
            res.statusCode
            res.send('No ' + req.params.username + ' user found')
        }
    }, (err) => {
        console.log('PUT /userData/' + req.params.username + ' error ' + err)
        res.statusCode = 500
        res.send(err)
    })
})
.delete((req, res) => {
    userData.remove({ username: req.params.username }).then((resp) => {
        console.log('DELETE /userData/' + req.params.username)
        res.statusCode = 200
        res.setHeader('Content-Type', 'application/json')
        res.json(resp)
    }, (err) => {
        console.log('DELETE /userData/' + req.params.username + ' error ' + err)
        res.statusCode = 500
        res.send(err)
    })
})

userDataRouter.route('/:username/wishList')
.get((req, res) => {
    userData.findOne({ username: req.params.username }).then((user) => {
        console.log('GET /userData/' + req.params.username + '/wishList')
        if (user != null) {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.json(user.wishList)
        }
        else {
            res.statusCode = 404
            res.send(user)
        }
    }, (err) => {
        console.log('GET /userData/' + req.params.username + '/wishList error ' + err)
        res.statusCode = 500
        res.send(err)
    })
})
.post((req, res) => {
    userData.findOne({ username: req.params.username }).then((user) => {
        console.log('POST /userData/' + req.params.username + '/wishList')
        if (user != null) {
            var filtered = user.wishList.filter(bookIterator => {
                return bookIterator.title === req.body.title
            })

            if (filtered.length == 0) {
                user.wishList.push(req.body)
                user.save().then((user) => {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.json(user.wishList)
                }, (err) => {
                    res.statusCode = 500
                    res.send(err)
                })
            }
            else {
                res.statusCode = 409
                res.send('Already added to wishList')
            }
        }
        else {
            res.statusCode = 404
            res.send(user)
        }
    }, (err) => {
        console.log('POST /userData/' + req.params.username + '/wishList error ' + err)
        res.statusCode = 500
        res.send(err)
    })
})
.put((req, res) => {
    res.statusCode = 403;
    res.send('PUT operation not supported on /users/' + req.params.username + '/wishList');
})
.delete((req, res) => {
    userData.findOne({ username: req.params.username }).then((user) => {
        console.log('DELETE /userData/' + req.params.username + 'wishList')
        if (user != null) {
            user.wishList = []
            user.save().then((user) => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(user.wishList)
            }, (err) => {
                res.statusCode = 500
                res.send(err)
            })
        }
        else {
            res.statusCode = 404
            res.send(user)
        }
    }, (err) => {
        console.log('DELETE /userData/' + req.params.username + '/wishList error ' + err)
        res.statusCode = 500
        res.send(err)
    })
})

userDataRouter.route('/:username/books')
.get((req, res) => {
    userData.findOne({ username: req.params.username }).then((user) => {
        console.log('GET /userData/' + req.params.username + '/books')
        if (user != null) {
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.json(user.books)
        }
        else {
            res.statusCode = 404
            res.send(user)
        }
    }, (err) => {
        console.log('GET /userData/' + req.params.username + '/books error ' + err)
        res.statusCode = 500
        res.send(err)
    })
})
.post((req, res) => {
    userData.findOne({ username: req.params.username }).then((user) => {
        console.log('POST /userData/' + req.params.username + '/books')
        if (user != null) {
            var filtered = user.wishList.filter(bookIterator => {
                return bookIterator.title === req.body.title
            })

            if (filtered.length == 0) {
                user.books.push(req.body)
                user.save().then((user) => {
                    res.statusCode = 200
                    res.setHeader('Content-Type', 'application/json')
                    res.json(user.books)
                }, (err) => {
                    res.statusCode = 500
                    res.send(err)
                })
            }
            else {
                res.statusCode = 409
                res.send('Another book with the same title already exists')
            }
        }
        else {
            res.statusCode = 404
            res.send(user)
        }
    }, (err) => {
        console.log('POST /userData/' + req.params.username + '/books error ' + err)
        res.statusCode = 500
        res.send(err)
    })
})
.put((req, res) => {
    res.statusCode = 403;
    res.send('PUT operation not supported on /users/' + req.params.username + "/books");
})
.delete((req, res) => {
    userData.findOne({ username: req.params.username }).then((user) => {
        console.log('DELETE /userData/' + req.params.username + '/books')
        if (user != null) {
            user.books = []
            user.save().then((user) => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(user.books)
            }, (err) => {
                res.statusCode = 500
                res.send(err)
            })
        }
        else {
            res.statusCode = 404
            res.send(user)
        }
    }, (err) => {
        console.log('DELETE /userData/' + req.params.username + '/books error ' + err)
        res.statusCode = 500
        res.send(err)
    })
})

userDataRouter.route('/:username/wishList/:book')
.get((req, res) => {
    userData.findOne({ username: req.params.username }).then((user) => {
        console.log('GET /userData/' + req.params.username + '/wishList/' + req.params.book)
        if (user != null) {
            var filtered = user.wishList.filter(bookIterator => {
                return bookIterator.title === req.params.book
            })

            if (filtered.length == 0) {
                res.statusCode = 404
                res.send('Book ' + req.params.book + ' not found')
            }
            else {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(filtered[0])
            }
        }
        else {
            res.statusCode = 404
            res.send('User ' + req.params.username + ' not found')
        }
    }, (err) => {
        console.log('GET /userData/' + req.params.username + '/wishList/' + req.params.book + ' error ' + err)
        res.statusCode = 500
        res.send(err)
    })
})
.post((req, res) => {
    res.statusCode = 403;
    res.send('POST operation not supported on /users/' + req.params.username + '/wishList/' + req.params.book);
})
.put((req, res) => {
    res.statusCode = 403;
    res.send('PUT operation not supported on /users/' + req.params.username + '/wishList/' + req.params.book);
})
.delete((req, res) => {
    userData.findOne({ username: req.params.username }).then((user) => {
        console.log('DELETE /userData/' + req.params.username + '/wishList/' + req.params.book)
        if (user != null) {
            user.wishList = user.wishList.filter(bookIterator => {
                return bookIterator.title != req.params.book
            })
            user.save().then((resp) => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(resp)
            }, (err) => {
                res.statusCode = 500
                res.send(err)
            })
        }
        else {
            res.statusCode = 404
            res.send('User ' + req.params.username + ' not found')
        }
    }, (err) => {
        console.log('DELETE /userData/' + req.params.username + '/wishList/' + req.params.book + ' error ' + err)
        res.statusCode = 500
        res.send(err)
    })
})

userDataRouter.route('/:username/books/:book')
.get((req, res) => {
    userData.findOne({ username: req.params.username }).then((user) => {
        console.log('GET /userData/' + req.params.username + '/books/' + req.params.book)
        if (user != null) {
            var filtered = user.books.filter(bookIterator => {
                return bookIterator.title === req.params.book
            })

            if (filtered.length == 0) {
                res.statusCode = 404
                res.send('Book ' + req.params.book + ' not found')
            }
            else {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(filtered[0])
            }
        }
        else {
            res.statusCode = 404
            res.send('User ' + req.params.username + ' not found')
        }
    }, (err) => {
        console.log('GET /userData/' + req.params.username + '/books error ' + err)
        res.statusCode = 500
        res.send(err)
    })
})
.post((req, res) => {
    res.statusCode = 403;
    res.send('POST operation not supported on /users/' + req.params.username + "/books/" + req.params.book);
})
.put()
.delete((req, res) => {
    userData.findOne({ username: req.params.username }).then((user) => {
        console.log('DELETE /userData/' + req.params.username + '/wishList/' + req.params.book)
        if (user != null) {
            user.wishList = user.wishList.filter(bookIterator => {
                return bookIterator.title != req.params.book
            })
            user.save().then((resp) => {
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(resp)
            }, (err) => {
                res.statusCode = 500
                res.send(err)
            })
        }
        else {
            res.statusCode = 404
            res.send('User ' + req.params.username + ' not found')
        }
    }, (err) => {
        console.log('DELETE /userData/' + req.params.username + '/wishList/' + req.params.book + ' error ' + err)
        res.statusCode = 500
        res.send(err)
    })
})

module.exports = userDataRouter
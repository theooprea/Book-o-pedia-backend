const express = require('express')
const bodyParser = require('body-parser')
const authenticate = require('../middleware/authenticate')

const userData = require('../models/userData')
const userCredentials = require('../models/userCredentials')

const userDataRouter = express.Router()
userDataRouter.use(bodyParser.json())

userDataRouter.route('/')
.get(authenticate, (req, res) => {
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
.post(authenticate, (req, res) => {
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
.put(authenticate, (req, res) => {
    res.statusCode = 403;
    res.send('PUT operation not supported on /users');
})
.delete(authenticate, (req, res) => {
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
.get(authenticate, (req, res) => {
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
.post(authenticate, (req, res) => {
    res.statusCode = 403;
    res.send('POST operation not supported on /users/' + req.params.username);
})
// TODO: fix put to update all wishLists everywhere
.put(authenticate, (req, res) => {
    userData.findOne( { username: req.params.username }).then((user) => {
        console.log('PUT /userData/' + req.params.username + ' ' +
            req.body.email + " " + req.body.phone)

        if (user != null) {
            if (user.username != req.body.username) {
                console.log('Username changed')

                userData.find({}).then((users) => {
                    try {
                        users.forEach((userIterator) => {
                            var wishList = userIterator.wishList
    
                            wishList.forEach((wishListBook) => {
                                if (wishListBook.seller === user.username) {
                                    wishListBook.seller = req.body.username
                                }
                            })
                        
                            userIterator.wishList = wishList
                            userIterator.save()
                        })

                        userCredentials.findOne({ email: user.email }).then((userCredential) => {
                            console.log("intra aici")
                            user.username = req.body.username
                            user.email = req.body.email
                            user.phone = req.body.phone

                            var books = user.books

                            books.forEach((book) => {
                                book.seller = user.username
                            })

                            user.books = books
                            user.save()

                            userCredential.email = req.body.email
                            userCredential.save()

                            res.statusCode = 200
                            res.setHeader('Content-Type', 'application/json')
                            res.json(user)
                        }, (err) => {
                            res.statusCode = 500
                            res.send(err)
                        })
                    }
                    catch (err) {
                        res.statusCode = 500
                        res.send(err)
                    }
                }, (err) => {
                    res.statusCode = 500
                    res.send(err)
                })
            }
            else {
                userCredentials.findOne({ email: user.email }).then((userCredentials) => {
                    user.username = req.body.username
                    user.email = req.body.email
                    user.phone = req.body.phone
        
                    userCredentials.email = req.body.email
                    userCredentials.save()

                    user.save().then((user) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(user);
                    }, (err) => {
                        res.statusCode = 500
                        res.send(err)
                    })
                }, (err) => {
                    res.statusCode = 500
                    res.send(err)
                })
            }
        }
        else {
            res.statusCode = 404
            res.send('No ' + req.params.username + ' user found')
        }
    }, (err) => {
        console.log('PUT /userData/' + req.params.username + ' error ' + err)
        res.statusCode = 500
        res.send(err)
    })
})
.delete(authenticate, (req, res) => {
    if (req.username === req.params.username) {
        var response = {}
        userData.remove({ username: req.params.username }).then((resp) => {
            console.log('DELETE /userData/' + req.params.username)
            userCredentials.remove({ email: req.email }).then((resp2) => {
                response.deleteData = resp
                response.deleteCredentials = resp2

                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.json(response)
            }, (err) => {
                console.log('DELETE /userData/' + req.params.username + ' error ' + err)
                res.statusCode = 500
                res.send(err)
            })
        }, (err) => {
            console.log('DELETE /userData/' + req.params.username + ' error ' + err)
            res.statusCode = 500
            res.send(err)
        })
    }
    else {
        res.statusCode = 403
        res.send('Not allowed to delete other user')
    }
    
})

userDataRouter.route('/:username/wishList')
.get(authenticate, (req, res) => {
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
.post(authenticate, (req, res) => {
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
.put(authenticate, (req, res) => {
    res.statusCode = 403;
    res.send('PUT operation not supported on /users/' + req.params.username + '/wishList');
})
.delete(authenticate, (req, res) => {
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
.get(authenticate, (req, res) => {
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
.post(authenticate, (req, res) => {
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
.put(authenticate, (req, res) => {
    res.statusCode = 403;
    res.send('PUT operation not supported on /users/' + req.params.username + "/books");
})
.delete(authenticate, (req, res) => {
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
.get(authenticate, (req, res) => {
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
.post(authenticate, (req, res) => {
    res.statusCode = 403;
    res.send('POST operation not supported on /users/' + req.params.username + '/wishList/' + req.params.book);
})
.put(authenticate, (req, res) => {
    res.statusCode = 403;
    res.send('PUT operation not supported on /users/' + req.params.username + '/wishList/' + req.params.book);
})
.delete(authenticate, (req, res) => {
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
.get(authenticate, (req, res) => {
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
.post(authenticate, (req, res) => {
    res.statusCode = 403;
    res.send('POST operation not supported on /users/' + req.params.username + "/books/" + req.params.book);
})
// TODO PUT to modify everything
.put(authenticate, (req, res) => {
    userData.findOne({ username: req.params.username }).then((user) => {
        if (user != null) {
            var filtered = user.books.filter(bookIterator => {
                return bookIterator.title === req.params.book
            })

            if (filtered.length != 1) {
                res.statusCode = 500
                res.send('Book not unique')
            }
            else {
                var book = filtered[0]
                book.title = req.body.title
                book.author = req.body.author
                book.genre = req.body.genre
                book.pages = req.body.pages
                book.price = req.body.price
                book.quantity = req.body.quantity


                userData.find({}).then((users) => {
                    try {
                        users.forEach((userIterator) => {
                            var wishList = userIterator.wishList

                            wishList.forEach((bookIterator) => {
                                if (bookIterator.title === req.params.book) {
                                    bookIterator.title = req.body.title
                                    bookIterator.author = req.body.author
                                    bookIterator.genre = req.body.genre
                                    bookIterator.pages = req.body.pages
                                    bookIterator.price = req.body.price
                                    bookIterator.quantity = req.body.quantity
                                }
                            })

                            userIterator.wishList = wishList
                            userIterator.save()
                        })

                        var books = user.books

                        books.forEach((bookIterator) => {
                            bookIterator.title = req.body.title
                            bookIterator.author = req.body.author
                            bookIterator.genre = req.body.genre
                            bookIterator.pages = req.body.pages
                            bookIterator.price = req.body.price
                            bookIterator.quantity = req.body.quantity
                        })

                        user.books = books
                        user.save()

                        res.statusCode = 200
                        res.setHeader('Content-Type', 'application/json')
                        res.json(book)
                    }
                    catch (err) {
                        res.statusCode = 500
                        res.send(err)
                    }
                }, (err) => {
                    res.statusCode = 500
                    res.send(err)
                })
            }
        }
        else {
            res.statusCode = 404
            res.send('User ' + req.params.username + ' not found')
        }
    }, (err) => {
        console.log('PUT /userData/' + req.params.username + '/books/' + req.params.book + ' error ' + err)
        res.statusCode = 500
        res.send(err)
    })
})
// TODO fix delete
.delete(authenticate, (req, res) => {
    userData.findOne({ username: req.params.username }).then((user) => {
        console.log('DELETE /userData/' + req.params.username + '/books/' + req.params.book)
        if (user != null) {
            user.books = user.books.filter(bookIterator => {
                return bookIterator.title != req.params.book
            })
            user.save().then((resp) => {
                userData.find({}).then((users) => {
                    try {
                        users.forEach((userIterator) => {
                            userIterator.wishList = userIterator.wishList.filter(bookIterator => {
                                return bookIterator.title != req.params.book
                            })

                            userIterator.save()
                        })

                        res.statusCode = 200
                        res.setHeader('Content-Type', 'application/json')
                        res.json(resp)
                    }
                    catch (err) {
                        res.statusCode = 500
                        res.send(err)
                    }
                }, (err) => {
                    res.statusCode = 500
                    res.send(err)
                })
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
const jwt = require('jsonwebtoken')
const UserModel = require('../models/user.model')
// https://www.youtube.com/watch?v=SUPDFHuvhRc from 2:10:15
// check current user 
module.exports.checkUser = (req, res, next) => {
  const token = req.cookies.jwt
  if (token) {
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
      if (err) {
        console.log('L10', err.message)
        // pour ne pas avoir d'erreur s'il n'y a pas de token
        res.locals.user = null
        // supprime le cookie
        res.cookie('jwt', '', { maxAge: 1 })
        next()
      } else {
        console.log('L17Y', decodedToken)
        let user = await UserModel.findById(decodedToken.id)
        res.locals.user = user
        console.log('L20', res.locals.user)
        next()
      }
    })
  } else {
    // pour ne pas avoir d'erreur s'il n'y a pas de token
    res.locals.user = null
    next()
  }
}

// check json web token exists & is verified
module.exports.requireAuth = (req, res, next) => {
  const token = req.cookies.jwt
  if (token) {
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
      if (err) {
        console.log('L37', err)
        res.send(200).send('Aucun Token !')
        // res.redirect('/api/user')
      } else {
        console.log('L41', decodedToken.id)
        next()
      }
    })
  } else {
    console.log('L46 Pas de Token :(')
    // res.redirect('/api/user')
    res.status(400).send('Pas de Token :(')
  }
}

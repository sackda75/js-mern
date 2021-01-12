const UserModel = require('../models/user.model')
const jwt = require('jsonwebtoken')
const { signUpErrors, signInErrors } = require('../utils/errors.utils')

// 3 jours en secondes
const maxAge = 3 * 24 * 60 * 60

// ici maxAge doit être exprimé en seconde
const createToken = (id) => {
  return jwt.sign({id}, process.env.TOKEN_SECRET, {
    expiresIn: maxAge
  })
}

module.exports.signUp = async (req, res) => {
  const { pseudo, email, password } = req.body
  console.log('L17', req.body)

  try {
    const user = await UserModel.create({ pseudo, email, password })
    const token = createToken(user._id)
    // ici maxAge: maxAge * 1000 doit être exprimé en milliseconde
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
    res.status(201).json({ user: user._id })
  }
  catch(err) {
    const errors = signUpErrors(err)
    res.status(200).send({ errors })
  }
}

module.exports.signIn = async (req, res) => {
  const { email, password } = req.body
  console.log('L34', req.body)
  // login from userSchema.statics.login = async function(email, password) {
  try {
    const user = await UserModel.login(email, password)
    const token = createToken(user._id)
    // ici maxAge: maxAge * 1000 doit être exprimé en milliseconde
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 })
    res.status(200).json({ user: user._id})
  } catch(err) {
    const errors = signInErrors(err)
    res.status(200).json({ errors })
  }
}

// maxAge: 1 milliseconde
module.exports.logout = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 })
  res.redirect('/api/user')
  // res.send('User is not logged')
}

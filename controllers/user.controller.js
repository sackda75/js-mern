const UserModel = require('../models/user.model')
const ObjectID = require('mongoose').Types.ObjectId

module.exports.getAllUsers = async (req, res) => {
  // const users = await UserModel.find().select('-password')
  const users = await UserModel.find()
  res.status(200).json(users)
}

module.exports.userInfo = (req, res) => {
  console.log('L11', req.params)

  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID unknown ' + req.params.id)

  UserModel.findById(req.params.id, (err, docs) => {
    if (!err) res.send({ messageBody: 'User found ⬇️', userDocs: docs })
    else console.log('L18 ID unknown ' + err)
  }).select('-password')
}

module.exports.updateUser = async (req, res) => {
  console.log('L23', req.params)

  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID unknown ' + req.params.id)

  try {
    await UserModel.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          bio: req.body.bio
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true },
      (err, docs) => {
        // if (!err) return res.send(docs)
        if (!err) return res.send({ messageBody: 'User updated ⬇️', updatedDocs: docs })
        if (err) return res.status(500).send({ message: err })
      }
    )
  } catch (err) {
    return res.status(500).json({ message: err })
  }
}

module.exports.deleteUser = async (req, res) => {
  console.log('L49', req.params)

  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID unknown ' + req.params.id)
  
  try {
    await UserModel.remove({ _id: req.params.id }).exec()
    res.status(200).json({ message: 'Sucessfully deleted' })
  } catch (err) {
    return res.status(500).json({ message: err })
  }
}

// PATCH dans Postman
module.exports.follow = async (req, res) => {
  console.log('L64', req.params)

  if (!ObjectID.isValid(req.params.id) || !ObjectID.isValid(req.body.idToFollow))
    return res.status(400).send('ID unknown ' + req.params.id)

  try {
    // add to the follower list
    await UserModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { following: req.body.idToFollow }},
      { new: true, upsert: true },
      (err, docs) => {
        if (!err) res.status(201).json(docs)
        else return res.status(400).json(err)
      }
    )
    // add to the following list
    await UserModel.findByIdAndUpdate(
      req.body.idToFollow,
      { $addToSet: { followers: req.params.id }},
      { new: true, upsert: true },
      (err, docs) => {
        // if (!err) res.status(201).json(docs)
        if (err) return res.status(400).json(err)
      }
    )
  } catch (err) {
    return res.status(500).json({ message: err })
  }
}

module.exports.unfollow = async (req, res) => {
  console.log('L96', req.params)

  if (!ObjectID.isValid(req.params.id) || !ObjectID.isValid(req.body.idToUnFollow))
    return res.status(400).send('ID unknown ' + req.params.id)

  try {
    await UserModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { following: req.body.idToUnFollow }},
      { new: true, upsert: true },
      (err, docs) => {
        if (!err) res.status(201).json(docs)
        else return res.status(400).json(err)
      }
    )
    await UserModel.findByIdAndUpdate(
      req.body.idToUnFollow,
      { $pull: { followers: req.params.id }},
      { new: true, upsert: true },
      (err, docs) => {
        // if (!err) res.status(201).json(docs)
        if (err) return res.status(400).json(err)
      }
    )
  } catch (err) {
    return res.status(500).json({ message: err })
  }
}

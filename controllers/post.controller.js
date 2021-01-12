const PostModel = require('../models/post.model')
const UserModel = require('../models/user.model')
const { uploadErrors } = require('../utils/errors.utils')
const ObjectID = require('mongoose').Types.ObjectId
const fs = require('fs')
const { promisify } = require('util')
const pipeline = promisify(require('stream').pipeline)

module.exports.readPost = (req, res) => {
  PostModel.find((err, docs) => {
    if (!err) res.send(docs)
    else console.log('L12 Error to get data : ' + err)
  }).sort({ createdAt: -1 })
}

module.exports.createPost = async (req, res) => {
  let fileName

  if (req.file !== null) {
    try {
      if (
        req.file.detectedMimeType != 'image/jpg' &&
        req.file.detectedMimeType != 'image/png' &&
        req.file.detectedMimeType != 'image/jpeg'
      )
        throw Error('invalid file')

      if (req.file.size > 500000) throw Error('max size')
    } catch (err) {
      const errors = uploadErrors(err)
      return res.status(201).json({ errors })
    }

    fileName = req.body.posterId + Date.now() + '.jpg'

    await pipeline(
      req.file.stream,
      fs.createWriteStream(
        `${__dirname}/../client/public/uploads/posts/${fileName}`
      )
    )
  }
  console.log('L43', req.body)
  const newPost = new PostModel({
    posterId: req.body.posterId,
    message: req.body.message,
    picture: req.file !== null ? './uploads/posts/' + fileName : '',
    video: req.body.video,
    likers: [],
    comments: []
  })

  try {
    const post = await newPost.save()
    return res.status(201).json({ message: 'Post created ⬇️', post })
  } catch (err) {
    return res.status(400).send(err)
  }
}

module.exports.updatePost = (req, res) => {
  console.log('L61', req.params.id)
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID unknown : ' + req.params.id)

  const updatedRecord = {
    message: req.body.message
  }
  console.log('L68', updatedRecord)
  PostModel.findByIdAndUpdate(
    req.params.id,
    { $set: updatedRecord },
    { new: true },
    (err, docs) => {
      if (!err) res.send({ message: 'Post modified ⬇️', docs })
      else console.log('L75 Update error : ' + err)
    }
  )
}

module.exports.deletePost = (req, res) => {
  console.log('L81', req.params.id)
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID unknown : ' + req.params.id)

  PostModel.findByIdAndRemove(
    req.params.id, 
    (err, docs) => {
    if (!err) res.send({ message: 'Post deleted ⬇️', docs })
    else console.log('L89 Delete error : ' + err)
  })
}

module.exports.likePost = async (req, res) => {
  console.log('L94', req.params.id)
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID unknown : ' + req.params.id)

  try {
    await PostModel.findByIdAndUpdate (
      req.params.id,
      {
        $addToSet: { likers: req.body.id }
      },
      { new: true },
      (err, docs) => {
        if (err) return res.status(400).send(err)
      }
    )
    await UserModel.findByIdAndUpdate(
      req.body.id,
      {
        $addToSet: { likes: req.params.id }
      },
      { new: true },
      (err, docs) => {
        if (!err) res.send({ message: 'Post updated 💚', docs })
        else return res.status(400).send(err)
      }
    )
  } catch (err) {
    return res.status(400).send(err)
  }
}

module.exports.unlikePost = async (req, res) => {
  console.log('L126', req.params.id)
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID unknown : ' + req.params.id)

  try {
    await PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { likers: req.body.id }
      },
      { new: true },
      (err, docs) => {
        if (err) return res.status(400).send(err)
      }
    )
    await UserModel.findByIdAndUpdate(
      req.body.id,
      {
        $pull: { likes: req.params.id }
      },
      { new: true },
      (err, docs) => {
        if (!err) res.send({ message: 'Post updated 💔', docs })
        else return res.status(400).send(err)
      }
    )
  } catch (err) {
    return res.status(400).send(err)
  }
}

module.exports.commentPost = (req, res) => {
  console.log('L158', req.params.id)
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID unknown : ' + req.params.id)
  
  try {
    return PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            commenterId: req.body.commenterId,
            commenterPseudo: req.body.commenterPseudo,
            text: req.body.text,
            timestamp: new Date().getTime()
          }
        }
      },
      { new: true },
      (err, docs) => {
        if (!err) return res.send({ message: 'Comment created ⬇️', docs })
        else return res.status(400).send(err)
      }
    )
  } catch (err) {
    return res.status(400).send(err)
  }
}

module.exports.editCommentPost = (req, res) => {
  console.log('L187', req.params.id)
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID unknown : ' + req.params.id)

  try {
    return PostModel.findById(
      req.params.id, 
      (err, docs) => {
      const theComment = docs.comments.find((comment) =>
        comment._id.equals(req.body.commentId)
      )

      if (!theComment) return res.status(404).send('Comment not found')
      theComment.text = req.body.text

      return docs.save((err) => {
        if (!err) return res.status(200).send({ message: 'Comment modified ⬇️', docs })
        return res.status(500).send(err)
      })
    })
  } catch (err) {
    return res.status(400).send(err)
  }
}

module.exports.deleteCommentPost = (req, res) => {
  console.log('L213', req.params.id)
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send('ID unknown : ' + req.params.id)

  try {
    return PostModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: {
          comments: {
            _id: req.body.commentId
          }
        }
      },
      { new: true },
      (err, docs) => {
        if (!err) return res.send({ message: 'Comment deleted ⬇️', docs })
        else return res.status(400).send(err)
      }
    )
  } catch (err) {
    return res.status(400).send(err)
  }
}

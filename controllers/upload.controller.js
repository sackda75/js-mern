const UserModel = require('../models/user.model')
const fs = require('fs')
const { promisify } = require('util')
const pipeline = promisify(require('stream').pipeline)
const { uploadErrors } = require('../utils/errors.utils')

module.exports.uploadProfil = async (req, res) => {
  try {
    // seuls les fichiers au format jpg png jpeg sont acceptés
    if (
      req.file.detectedMimeType != 'image/jpg' &&
      req.file.detectedMimeType != 'image/png' &&
      req.file.detectedMimeType != 'image/jpeg'
    )
      throw Error('invalid file')
    // les fichiers supérieurs à 500000 ko sont rejetés
    if (req.file.size > 500000) 
      throw Error('max size')

  } catch (err) {
    const errors = uploadErrors(err)
    console.log('L22', errors)
    return res.status(201).json({ errors })
  }
  // tous les fichiers sont transfornés en jpg
  const fileName = req.body.name + '.jpg'
  // Postman > Body > form-data > file (cf video 4:03:47)
  await pipeline(
    req.file.stream,
    fs.createWriteStream(
      `${__dirname}/../client/public/uploads/profil/${fileName}`
    )
  )
  // enregistrer le chemin de l'image dans MongoDB
  try {
    await UserModel.findByIdAndUpdate(
      req.body.userId,
      { $set : { picture: './uploads/profil/' + fileName }},
      { new: true, upsert: true, setDefaultsOnInsert: true },
      (err, docs) => {
        if (!err) return res.send({ message: 'picture uploaded ✔️', docs});
        else return res.status(500).send({ message: err })
      }
    )
  } catch (err) {
    return res.status(500).send({ message: err })
  }
}

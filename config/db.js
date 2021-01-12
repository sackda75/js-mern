const mongoose = require('mongoose')

// connexion + création de la base de données bdd mern-project
mongoose
  .connect('mongodb+srv://'+process.env.DB_USER_PASS+'@cluster-a1.pilu8.mongodb.net/mern-project',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    }
  )
  .then(() => console.log('Connected to MongoDB []'))
  .catch((err) => console.log('Failed to connect to MongoDB', err))

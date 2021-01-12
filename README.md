### Source
https://www.youtube.com/watch?v=SUPDFHuvhRc

#### Source
https://github.com/JustFS/mern-project

### config > .env
PORT=5000
CLIENT_URL=http://localhost:5000
DB_USER_PASS=siakloby:fleuwG7FFCN25uRo
TOKEN_SECRET=TWAMcG66shzmCt2XTWAMcG66shzmCt2XTWAcG66shzmCt2XTWAMcG66shAMcG66shzmCt2XTWAMshzmCt2XTWAcG66shzmCt2XTWAMcG66shAMcG66shzm

### config > db.js
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

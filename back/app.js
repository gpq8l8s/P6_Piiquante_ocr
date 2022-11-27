const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const userRoutes = require('./routes/auth');
const sauceRoutes = require('./routes/sauces');


// Connect to MongoDB
mongoose
.connect(process.env.MONGODB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connexion à MongoDB réussi !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();
app.use(express.json());
app.use(cookieParser())

// CORS POLICY
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  next();
});


app.use(bodyParser.json());

// LOGIN & SIGNUP
app.use('/api/auth', userRoutes);

// Create / Modify / Delete / Like a Sauce
app.use('/api/sauces', sauceRoutes);

// grant access to images from localhost:3000/images
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;

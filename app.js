const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');

//Initiate our app
const app = express();

//Configure our app
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: 'passport-tutorial', cookie: { maxAge: 60000 }, resave: false, saveUninitialized: false }));

//Configure Mongoose
// mongoose.connect('mongodb://localhost/jobportal');
// mongodb://<user>:<pass>@ds147190.mlab.com:47190/jobportal
mongoose.connect('mongodb://localhost/jobportal', (error)=> {
  if (error) {
    console.log("Database Failed to connect"+ error);
  } else {
    console.log("Database Connected Succefully");
  }
});
mongoose.set('debug', true);

//Models & routes
require('./models/Users');
require('./models/UserDetails');
require('./models/JobsModel');
require('./config/passport');
app.use(require('./routes'));

app.listen(3000, () => console.log('Server running on http://localhost:3000/'));

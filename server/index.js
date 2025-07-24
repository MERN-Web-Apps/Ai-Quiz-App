const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userRoutes = require('./routes/user');
const mongoose = require('mongoose');
const { handleGoogleCallback } = require('./middleWares/googleAuth');
require('dotenv').config();


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(passport.initialize());

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
  // Here you would save user to database
  // For now, just return the profile
  return done(null, profile);
}));

app.get ('/', (req, res) => {
  res.send('Welcome to the Quiz App!');
});
app.use(cors({credentials: true, origin: 'http://localhost:3000'}));
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/quizapp';
mongoose.connect(MONGODB_URI).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/signin', session: false }),
  handleGoogleCallback,
  (req, res) => {
    // Successful authentication, redirect to frontend
    res.redirect('http://localhost:3000/');
  }
);

app.use("/user", userRoutes);
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

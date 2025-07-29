const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const userRoutes = require('./routes/user');
const profileRoutes = require('./routes/profile');
const quizRoutes = require('./routes/quiz');
const LeaderboardRoutes = require('./routes/leaderboard');
const mongoose = require('mongoose');
const { handleGoogleCallback } = require('./middleWares/googleAuth');
require('dotenv').config();

// Validate required environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('Error: Missing required Google OAuth environment variables');
  console.error('Please ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in your .env file');
  process.exit(1);
}

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
  try {
    const User = require('./models/user');
    const crypto = require('crypto');
    
    // Extract user data from Google profile
    const googleEmail = profile.emails[0].value;
    const googleName = profile.displayName;
    
    // Check if user already exists by email
    let user = await User.findOne({ email: googleEmail });
    
    if (user) {
      // User exists - login
      return done(null, user);
    } else {
      // User doesn't exist - create new account
      const randomSuffix = crypto.randomBytes(4).toString('hex');
      const username = googleName.replace(/\s+/g, '').toLowerCase() + '_' + randomSuffix;
      const randomPassword = crypto.randomBytes(32).toString('hex'); 
      
      user = await User.create({
        username: username,
        email: googleEmail,
        password: randomPassword
      });
      return done(null, user);
    }
  } catch (error) {
    console.error('Google OAuth error:', error);
    return done(error, null);
  }
}));

app.use('/imgs', express.static(path.join(__dirname, 'public', 'imgs')));
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
app.use("/profile", profileRoutes);
app.use('/quiz', quizRoutes);
app.use("/leaderboard", LeaderboardRoutes);
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

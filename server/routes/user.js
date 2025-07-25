const {Router} = require('express');
const User = require('../models/user');
const authMiddleware = require('../middleWares/auth');
const router = Router();
router.get('/me', authMiddleware("token"), (req, res) => {
  res.json(req.user);
});
router.post('/signup', async(req, res) => {
  try {
    const {username, email, password} = req.body;
    
    // Check for required fields
    if (!username || !email || !password) {
      return res.status(400).json({message: 'Username, email, and password are required'});
    }
    
    // Check if user already exists by email or username
    const existingUser = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { username: username }
      ]
    });
    
    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        return res.status(400).json({ message: 'Email already registered' });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }
    
    // Create new user
    const user = await User.create({
      username, 
      email: email.toLowerCase(), 
      password
    });
    
    res.status(201).json({message: 'User created successfully', user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    }});
  } catch (err) {
    console.error('Signup error:', err);
    
    // Handle MongoDB duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({ 
        message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists` 
      });
    }
    
    res.status(400).json({message: 'Error creating user', error: err.message});
  }
});
router.post('/signin', async(req, res) => {
  const {email, password} = req.body;
  
  // Check for required fields
  if (!email || !password) {
    return res.status(400).json({message: 'Email and password are required'});
  }
  
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    res.cookie('token', token, { httpOnly: true });
    res.status(201).json({message: 'Signin successful', token});
  } catch (err) {
    res.status(401).json({message: 'Invalid email or password'});
  }
});
router.post('/logout', authMiddleware("token"), (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logout successful' });
});

module.exports = router;
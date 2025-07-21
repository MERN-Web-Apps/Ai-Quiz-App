const {Router} = require('express');
const User = require('../models/user');
const authMiddleware = require('../middleWares/auth');
const router = Router();
router.use(authMiddleware("token"));
router.get('/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  res.json(req.user);
});
router.post('/signup', async(req, res) => {
  const {username, email, password} = req.body;
  const user = await User.create({username, email, password});
  res.status(201).json({message: 'User created', user});
});
router.post('/signin', async(req, res) => {
  const {email, password} = req.body;
  try {
    const token = await User.matchPasswordAndGenerateToken(email, password);
    res.cookie('token', token, { httpOnly: true });
    res.status(201).json({message: 'Signin successful', token});
  } catch (err) {
    res.status(401).json({message: 'Invalid email or password'});
  }
});
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logout successful' });
});

module.exports = router;
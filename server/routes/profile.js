const {Router} = require('express');
const User = require('../models/user');
const {generateToken} = require('../services/auth');
const authMiddleware = require('../middleWares/auth');
const router = Router();
const path = require('path');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/imgs'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const userId = req.user && req.user.id ? req.user.id.toString() : 'unknown';
    cb(null, userId + ext);
  }
});
const upload = multer({ storage });

router.use(authMiddleware("token"));

router.get('/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user, edit: req.user.username === username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});
router.put('/:username', upload.single('profileImage'), async (req, res) => {
    const { username } = req.params;
    const { username: newUsername, email, currentPassword, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!(await user.comparePassword(currentPassword))) {
            console.error('Current password is incorrect');
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        user.username = newUsername || user.username;
        user.email = email || user.email;
        if (password) {
            user.password = password;
        }
        if (req.file) {
            user.profileImage = req.file.filename;
        }
        await user.save();
        if(password) {
            // If password is updated, clear the token cookie
            res.clearCookie('token');
            res.status(200).json({ message: 'password updated' });
        }else{
            const token = generateToken(user);
            res.cookie('token', token, { httpOnly: true });
            res.status(200).json({ message: 'Profile updated successfully' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});
module.exports = router;
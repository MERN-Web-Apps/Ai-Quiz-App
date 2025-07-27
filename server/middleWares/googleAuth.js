const { generateToken } = require('../services/auth');

const handleGoogleCallback = async (req, res, next) => {
  try {
    const user = req.user;
    
    const token = generateToken(user);

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    next();
  } catch (error) {
    console.error('Google callback error:', error);
    res.status(500).json({ message: 'Google authentication failed' });
  }
};

module.exports = { handleGoogleCallback };

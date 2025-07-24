const { generateToken } = require('../services/auth');

const handleGoogleCallback = async (req, res, next) => {
  try {
    // Extract user data from Google OAuth profile
    const { id, emails, displayName } = req.user;
    
    // Create JWT payload
    const payload = {
      googleId: id,
      email: emails[0].value,
      name: displayName,
      provider: 'google'
    };

    // Generate JWT token
    const token = generateToken(payload);

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });

    next();
  } catch (error) {
    res.status(500).json({ message: 'Google authentication failed' });
  }
};

module.exports = { handleGoogleCallback };

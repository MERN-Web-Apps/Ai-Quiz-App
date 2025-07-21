const { verifyToken } = require('../services/auth');
function authMiddleware(cookieName) {
  return (req, res, next) => {
    const token = req.cookies[cookieName];
    if (!token) {
      return next(); // No token, proceed without authentication
    }
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch (err) {
    //   return res.status(401).json({ message: 'Invalid token' });
    }
    return next(); // If token is valid, proceed to the next middleware or route handler
  };
}
module.exports = authMiddleware;

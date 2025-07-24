const { verifyToken } = require('../services/auth');
function authMiddleware(cookieName) {
  return (req, res, next) => {
    const token = req.cookies[cookieName];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch (err) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    return next(); // If token is valid, proceed to the next middleware or route handler
  };
}
module.exports = authMiddleware;

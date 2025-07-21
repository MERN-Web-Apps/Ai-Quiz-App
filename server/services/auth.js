const JWT = require('jsonwebtoken');
require('dotenv').config();
const secretKey = process.env.JWT_SECRET || 'defaultSecretKey';
function generateToken(user) {
  const payload = { id: user._id, username: user.username, email: user.email, role: user.role };
  const token = JWT.sign(payload, secretKey, { expiresIn: '1h' });
  return token;
}

function verifyToken(token) {
    const decoded = JWT.verify(token, secretKey);
    return decoded;
}
module.exports = { generateToken, verifyToken };
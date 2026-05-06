const jwt = require('jsonwebtoken');
const config = require('../../../config/env');

function userScope(req, res, next) {
  try {
    const auth = req.header('authorization') || '';
    const parts = auth.split(' ');

    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return res.status(401).json({ message: 'Missing or invalid Authorization header' });
    }

    const token = parts[1];

    const payload = jwt.verify(token, config.JWT_SECRET);

    // Expect the token to contain a userId
    if (!payload || !payload.userId) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = userScope;

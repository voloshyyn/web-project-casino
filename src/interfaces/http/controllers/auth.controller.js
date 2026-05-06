const jwt = require('jsonwebtoken');
const config = require('../../../config/env');

function issueToken(req, res, next) {
  try {
    const { username } = req.body || {};

    // No registration / password flow — accept dummy username and map to a userId
    const userId = username && String(username).trim() ? String(username).trim() : `anon-${Date.now()}-${Math.floor(Math.random()*10000)}`;

    const payload = { userId };

    const token = jwt.sign(payload, config.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ token, userId });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  issueToken
};

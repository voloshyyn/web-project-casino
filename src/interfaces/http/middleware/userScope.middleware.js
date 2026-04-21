function userScope(req, res, next) {
  req.userId = req.header('x-user-id') || 'anonymous';
  next();
}

module.exports = userScope;

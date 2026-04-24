function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;


  if (statusCode === 400 || statusCode === 404 || statusCode === 409) {
    return res.status(statusCode).json({ error: err.message });
  }


  console.error('[ErrorHandler]', err.stack || err.message || err);
  return res.status(500).json({ error: 'Internal Server Error' });
}

module.exports = errorHandler;

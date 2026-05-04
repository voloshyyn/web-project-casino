require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  DB_PATH: process.env.DB_PATH || './data/casino.db',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info'
};

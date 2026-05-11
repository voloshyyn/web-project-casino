require('dotenv').config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 3000,
  DB_PATH: process.env.DB_PATH || './data/casino.db',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret',
  RABBITMQ_URL: process.env.RABBITMQ_URL || process.env.AMQP_URL || 'amqp://localhost',
  RABBITMQ_QUEUE: process.env.RABBITMQ_QUEUE || 'game.requests',
  RABBITMQ_EVENT_QUEUE: process.env.RABBITMQ_EVENT_QUEUE || 'game.events'
};

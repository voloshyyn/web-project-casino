/**
 * ValidationError - Represents a business logic or input validation error
 */
class ValidationError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = statusCode;
  }
}

module.exports = ValidationError;

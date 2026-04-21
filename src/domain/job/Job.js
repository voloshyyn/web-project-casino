const JobStatus = require('./JobStatus');

class Job {
  constructor({ id, userId, gameId, amount, status = JobStatus.CREATED, errorMessage = null, createdAt, updatedAt }) {
    this.id = id;
    this.userId = userId;
    this.gameId = gameId;
    this.amount = amount;
    this.status = status;
    this.errorMessage = errorMessage;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

module.exports = Job;

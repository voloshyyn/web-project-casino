const JobStatus = require('./JobStatus');

class Job {
  constructor({ id, userId, gameId, amount, requestId = null, status = JobStatus.CREATED, result = null, createdAt, updatedAt }) {
    this.id = id;
    this.userId = userId;
    this.gameId = gameId;
    this.amount = amount;
    this.requestId = requestId;
    this.status = status;
    this.result = result;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  /**
   * Validate that the job status is one of the allowed values
   */
  isValidStatus() {
    return Object.values(JobStatus).includes(this.status);
  }
}

module.exports = Job;

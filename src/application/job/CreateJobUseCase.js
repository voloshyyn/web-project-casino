class CreateJobUseCase {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }

  /**
   * Execute job creation use case
   * @param {Object} payload - Creation payload
   * @param {string} payload.userId - User ID
   * @param {string} payload.gameId - Game ID
   * @param {number} payload.amount - Bet amount (must be > 0)
   * @returns {Job} Created job with CREATED status
   * @throws {ValidationError} If amount is invalid
   */
  execute(payload) {
    const ValidationError = require('../../shared/errors/ValidationError');
    const Job = require('../../domain/job/Job');
    const JobStatus = require('../../domain/job/JobStatus');

    // Validate required fields
    if (!payload.userId || !payload.gameId) {
      throw new ValidationError('userId and gameId are required', 400);
    }

    // Validate amount
    if (typeof payload.amount !== 'number' || payload.amount <= 0) {
      throw new ValidationError('amount must be a positive number', 400);
    }

    // Create Job domain object with CREATED status
    const job = new Job({
      userId: payload.userId,
      gameId: payload.gameId,
      amount: payload.amount,
      status: JobStatus.CREATED,
      result: null
    });

    // Persist to repository
    return this.jobRepository.create(job);
  }
}

module.exports = CreateJobUseCase;

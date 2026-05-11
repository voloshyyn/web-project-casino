class CreateJobUseCase {
  constructor(jobRepository, messagePublisher, queueName) {
    this.jobRepository = jobRepository;
    this.messagePublisher = messagePublisher;
    this.queueName = queueName;
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
  async execute(payload) {
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

    if (!payload.requestId || typeof payload.requestId !== 'string' || !payload.requestId.trim()) {
      throw new ValidationError('requestId is required for idempotency', 400);
    }

    const requestId = payload.requestId.trim();

    const existingJob = await this.jobRepository.findByRequestId({
      userId: payload.userId,
      requestId
    });

    if (existingJob) {
      return {
        job: existingJob,
        wasCreated: false
      };
    }

    // Create Job domain object with CREATED status
    const job = new Job({
      userId: payload.userId,
      gameId: payload.gameId,
      amount: payload.amount,
      requestId,
      status: JobStatus.CREATED,
      result: null
    });

    let createdJob;

    try {
      createdJob = await this.jobRepository.create(job);
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        const duplicateJob = await this.jobRepository.findByRequestId({
          userId: payload.userId,
          requestId
        });

        if (duplicateJob) {
          return {
            job: duplicateJob,
            wasCreated: false
          };
        }
      }

      throw error;
    }

    try {
      await this.messagePublisher.publishToQueue(this.queueName, {
        jobId: createdJob.id,
        requestId: createdJob.requestId,
        userId: createdJob.userId,
        gameId: createdJob.gameId,
        amount: createdJob.amount
      });
    } catch (error) {
      const brokerError = new Error(`Failed to publish job ${createdJob.id} to RabbitMQ: ${error.message}`);
      brokerError.statusCode = 503;
      brokerError.cause = error;
      throw brokerError;
    }

    const queuedJob = await this.jobRepository.updateStatus({
      id: createdJob.id,
      userId: createdJob.userId,
      status: JobStatus.QUEUED
    });

    return {
      job: queuedJob,
      wasCreated: true
    };
  }
}

module.exports = CreateJobUseCase;

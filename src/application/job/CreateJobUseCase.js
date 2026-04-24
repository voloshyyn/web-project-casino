const crypto = require('crypto');
const Job = require('../../domain/job/Job');

class CreateJobUseCase {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }

  async execute({ userId, gameId, amount }) {
    const now = new Date().toISOString();
    const job = new Job({
      id: crypto.randomUUID(),
      userId,
      gameId,
      amount,
      createdAt: now,
      updatedAt: now
    });

    return this.jobRepository.create(job);
  }
}

module.exports = CreateJobUseCase;

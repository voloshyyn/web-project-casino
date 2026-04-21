const JobStatus = require('../../domain/job/JobStatus');

class QueueJobUseCase {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }

  async execute({ id, userId }) {
    return this.jobRepository.updateStatus({ id, userId, status: JobStatus.QUEUED });
  }
}

module.exports = QueueJobUseCase;

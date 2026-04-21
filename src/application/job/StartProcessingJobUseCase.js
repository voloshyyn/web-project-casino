const JobStatus = require('../../domain/job/JobStatus');

class StartProcessingJobUseCase {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }

  async execute({ id, userId }) {
    return this.jobRepository.updateStatus({ id, userId, status: JobStatus.PROCESSING });
  }
}

module.exports = StartProcessingJobUseCase;

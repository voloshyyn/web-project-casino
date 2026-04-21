const JobStatus = require('../../domain/job/JobStatus');

class FailJobUseCase {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }

  async execute({ id, userId, errorMessage }) {
    return this.jobRepository.updateStatus({
      id,
      userId,
      status: JobStatus.ERROR,
      errorMessage
    });
  }
}

module.exports = FailJobUseCase;

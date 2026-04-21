const JobStatus = require('../../domain/job/JobStatus');

class CompleteJobUseCase {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }

  async execute({ id, userId }) {
    return this.jobRepository.updateStatus({ id, userId, status: JobStatus.DONE });
  }
}

module.exports = CompleteJobUseCase;

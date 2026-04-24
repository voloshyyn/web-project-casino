const JobStatus = require('../../domain/job/JobStatus');

const VALID_TRANSITIONS = {
  [JobStatus.QUEUED]: [JobStatus.IN_PROGRESS, JobStatus.ERROR],
  [JobStatus.IN_PROGRESS]: [JobStatus.DONE, JobStatus.ERROR],
  [JobStatus.DONE]: [],
  [JobStatus.ERROR]: []
};

class UpdateJobStatusUseCase {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }

  async execute(id, newStatus, errorMessage = null) {
    const job = await this.jobRepository.findById(id);

    if (!job) {
      const error = new Error('Job not found');
      error.statusCode = 404;
      throw error;
    }

    const allowed = VALID_TRANSITIONS[job.status];
    if (!allowed || !allowed.includes(newStatus)) {
      const error = new Error(
        `Invalid status transition: ${job.status} -> ${newStatus}`
      );
      error.statusCode = 409;
      throw error;
    }

    await this.jobRepository.updateStatus(id, newStatus, errorMessage);
    return this.jobRepository.findById(id);
  }
}

module.exports = UpdateJobStatusUseCase;

class GetJobByIdUseCase {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }

  async execute(id) {
    const job = await this.jobRepository.findById(id);
    if (!job) {
      const error = new Error('Job not found');
      error.statusCode = 404;
      throw error;
    }
    return job;
  }
}

module.exports = GetJobByIdUseCase;

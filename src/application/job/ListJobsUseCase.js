class ListJobsUseCase {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }

  async execute(filters = {}) {
    return this.jobRepository.findAll(filters);
  }
}

module.exports = ListJobsUseCase;

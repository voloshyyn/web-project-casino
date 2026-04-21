class CreateJobUseCase {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }

  async execute(payload) {
    return this.jobRepository.create(payload);
  }
}

module.exports = CreateJobUseCase;

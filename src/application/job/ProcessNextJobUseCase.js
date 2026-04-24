class ProcessNextJobUseCase {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }

  async execute() {
    const job = await this.jobRepository.dequeueNext();
    return job || null;
  }
}

module.exports = ProcessNextJobUseCase;

class ListJobsByUserUseCase {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }

  async execute(userId) {
    return this.jobRepository.findAllByUserId(userId);
  }
}

module.exports = ListJobsByUserUseCase;

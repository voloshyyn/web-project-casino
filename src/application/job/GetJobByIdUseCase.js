class GetJobByIdUseCase {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }

  async execute({ id, userId }) {
    return this.jobRepository.findById({ id, userId });
  }
}

module.exports = GetJobByIdUseCase;

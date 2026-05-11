class UpdateJobStatusUseCase {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }

  execute(payload) {
    const { id, userId, status, result } = payload;
    
    if (!id || !userId || !status) {
      throw new Error('id, userId, and status are required');
    }

    return this.jobRepository.updateStatus({
      id,
      userId,
      status,
      result
    });
  }
}

module.exports = UpdateJobStatusUseCase;

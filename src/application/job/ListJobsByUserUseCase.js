class ListJobsByUserUseCase {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }

  /**
   * Execute list jobs use case
   * @param {string} userId - User ID to list jobs for
   * @returns {Array<Job>} Array of jobs for the user, ordered by most recent first
   * @throws {Error} If database operation fails
   */
  execute(userId) {
    if (!userId) {
      throw new Error('userId is required');
    }
    return this.jobRepository.findAllByUserId(userId);
  }
}

module.exports = ListJobsByUserUseCase;

class GetJobByIdUseCase {
  constructor(jobRepository) {
    this.jobRepository = jobRepository;
  }

  /**
   * Execute get job by ID use case
   * @param {Object} params - Query parameters
   * @param {number} params.id - Job ID
   * @param {string} params.userId - User ID (for authorization)
   * @returns {Job|null} The job if found and authorized, null otherwise
   * @throws {Error} If database operation fails
   */
  execute({ id, userId }) {
    if (!id || !userId) {
      throw new Error('id and userId are required');
    }
    return this.jobRepository.findById({ id, userId });
  }
}

module.exports = GetJobByIdUseCase;

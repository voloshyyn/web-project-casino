class JobRepository {
  async create(job) {
    throw new Error('Method not implemented: create');
  }

  async updateStatus({ id, userId, status, errorMessage = null }) {
    throw new Error('Method not implemented: updateStatus');
  }

  async findById({ id, userId }) {
    throw new Error('Method not implemented: findById');
  }

  async findAllByUserId(userId) {
    throw new Error('Method not implemented: findAllByUserId');
  }
}

module.exports = JobRepository;

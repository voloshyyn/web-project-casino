class JobRepository {
  async create(job) {
    throw new Error('Method not implemented: create');
  }

  async findById(id) {
    throw new Error('Method not implemented: findById');
  }

  async updateStatus(id, newStatus, errorMessage = null) {
    throw new Error('Method not implemented: updateStatus');
  }

  async dequeueNext() {
    throw new Error('Method not implemented: dequeueNext');
  }
}

module.exports = JobRepository;

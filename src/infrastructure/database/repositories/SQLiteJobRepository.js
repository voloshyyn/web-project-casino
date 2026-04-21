const JobRepository = require('../../../domain/job/JobRepository');

class SQLiteJobRepository extends JobRepository {}

module.exports = SQLiteJobRepository;

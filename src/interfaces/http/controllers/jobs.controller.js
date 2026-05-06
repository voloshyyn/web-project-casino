function createJob(req, res, next) {
  try {
    const CreateJobUseCase = require('../../../application/job/CreateJobUseCase');
    const SQLiteJobRepository = require('../../../infrastructure/database/repositories/SQLiteJobRepository');

    const repository = new SQLiteJobRepository();
    const createJobUseCase = new CreateJobUseCase(repository);

    // Extract payload from request body
    const { gameId, amount } = req.body;
    const userId = req.userId; // From userScope middleware

    // Execute use case
    const job = createJobUseCase.execute({
      userId,
      gameId,
      amount
    });

    // Return created job with 201 status
    res.status(201).json(job);
  } catch (error) {
    // Delegate error handling to error middleware
    next(error);
  }
}

function listJobs(req, res, next) {
  try {
    const ListJobsByUserUseCase = require('../../../application/job/ListJobsByUserUseCase');
    const SQLiteJobRepository = require('../../../infrastructure/database/repositories/SQLiteJobRepository');

    const repository = new SQLiteJobRepository();
    const listJobsUseCase = new ListJobsByUserUseCase(repository);

    const userId = req.userId; // From userScope middleware

    // Execute use case
    const jobs = listJobsUseCase.execute(userId);

    // Return jobs array
    res.status(200).json(jobs);
  } catch (error) {
    // Delegate error handling to error middleware
    next(error);
  }
}

function getJobById(req, res, next) {
  try {
    const GetJobByIdUseCase = require('../../../application/job/GetJobByIdUseCase');
    const SQLiteJobRepository = require('../../../infrastructure/database/repositories/SQLiteJobRepository');

    const repository = new SQLiteJobRepository();
    const getJobUseCase = new GetJobByIdUseCase(repository);

    const userId = req.userId; // From userScope middleware
    const id = Number(req.params.id);

    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ message: 'Invalid job id' });
    }

    const job = getJobUseCase.execute({ id, userId });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json(job);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createJob,
  listJobs,
  getJobById
};

const SQLiteJobRepository = require('../../../infrastructure/database/repositories/SQLiteJobRepository');
const CreateJobUseCase = require('../../../application/job/CreateJobUseCase');
const GetJobByIdUseCase = require('../../../application/job/GetJobByIdUseCase');
const ListJobsUseCase = require('../../../application/job/ListJobsUseCase');

const jobRepository = new SQLiteJobRepository();

async function createJob(req, res) {
  try {
    const { userId, gameId, amount } = req.body;
    const useCase = new CreateJobUseCase(jobRepository);
    const job = await useCase.execute({ userId, gameId, amount });
    return res.status(201).json(job);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

async function getJob(req, res) {
  try {
    const useCase = new GetJobByIdUseCase(jobRepository);
    const job = await useCase.execute(req.params.id);
    return res.status(200).json(job);
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ error: error.message });
  }
}

async function listJobs(req, res) {
  try {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.userId) filters.userId = req.query.userId;

    const useCase = new ListJobsUseCase(jobRepository);
    const jobs = await useCase.execute(filters);
    return res.status(200).json(jobs);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createJob,
  getJob,
  listJobs
};

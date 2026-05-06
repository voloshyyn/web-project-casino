const express = require('express');

const userScope = require('../middleware/userScope.middleware');
const jobsController = require('../controllers/jobs.controller');

const router = express.Router();

router.use(userScope);
router.post('/', jobsController.createJob);
router.get('/', jobsController.listJobs);
router.get('/:id', jobsController.getJobById);

module.exports = router;

const express = require('express');

const userScope = require('../middleware/userScope.middleware');
const jobsController = require('../controllers/jobs.controller');

const router = express.Router();

router.use(userScope);
router.post('/process-next', jobsController.processNext);
router.post('/', jobsController.createJob);
router.patch('/:id/status', jobsController.updateStatus);
router.get('/:id', jobsController.getJob);
router.get('/', jobsController.listJobs);

module.exports = router;

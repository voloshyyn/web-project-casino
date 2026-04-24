const express = require('express');

const userScope = require('../middleware/userScope.middleware');
const jobsController = require('../controllers/jobs.controller');

const router = express.Router();

router.use(userScope);
router.post('/', jobsController.createJob);
router.get('/:id', jobsController.getJob);
router.get('/', jobsController.listJobs);

module.exports = router;

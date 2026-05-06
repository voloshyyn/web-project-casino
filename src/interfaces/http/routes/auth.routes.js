const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.post('/token', authController.issueToken);

module.exports = router;

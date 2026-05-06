const express = require('express');

const jobsRouter = require('./interfaces/http/routes/jobs.routes');
const authRouter = require('./interfaces/http/routes/auth.routes');
const errorHandler = require('./interfaces/http/middleware/errorHandler.middleware');

const app = express();

app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/jobs', jobsRouter);
app.use(errorHandler);

module.exports = app;

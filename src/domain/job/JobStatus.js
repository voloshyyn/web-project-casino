const JobStatus = Object.freeze({
  CREATED: 'CREATED',
  QUEUED: 'QUEUED',
  PROCESSING: 'PROCESSING',
  DONE: 'DONE',
  ERROR: 'ERROR'
});

module.exports = JobStatus;

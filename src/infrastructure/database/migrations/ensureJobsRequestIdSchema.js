function ensureJobsRequestIdSchema(db) {
  const columns = db.prepare('PRAGMA table_info(jobs)').all();

  if (!columns || columns.length === 0) {
    return;
  }

  const hasRequestId = columns.some((column) => column.name === 'request_id');

  if (!hasRequestId) {
    db.exec('ALTER TABLE jobs ADD COLUMN request_id TEXT');
  }

  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_jobs_user_request_id ON jobs (user_id, request_id)');
}

module.exports = {
  ensureJobsRequestIdSchema
};
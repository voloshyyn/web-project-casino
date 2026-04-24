CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('QUEUED', 'IN_PROGRESS', 'DONE', 'ERROR')),
  error_message TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs (user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs (status);

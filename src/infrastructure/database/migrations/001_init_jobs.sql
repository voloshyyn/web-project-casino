CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  request_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('CREATED', 'QUEUED', 'PROCESSING', 'DONE', 'ERROR')),
  result TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs (user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs (status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs (created_at);

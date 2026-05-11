const app = require('./app');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const config = require('./config/env');
const { ensureJobsRequestIdSchema } = require('./infrastructure/database/migrations/ensureJobsRequestIdSchema');

function runMigrations() {
  try {
    const dbDir = path.resolve(process.cwd(), 'data');
    const dbPath = path.resolve(dbDir, 'casino.db');
    const migrationsDir = path.resolve(process.cwd(), 'src', 'infrastructure', 'database', 'migrations');

    fs.mkdirSync(dbDir, { recursive: true });

    const db = new Database(dbPath);

    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith('.sql'))
      .sort();

    if (migrationFiles.length === 0) {
      console.log('[DB] No migration files found.');
      db.close();
      return;
    }

    migrationFiles.forEach((file) => {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      const statements = sql.split(';').filter(stmt => stmt.trim());
      statements.forEach(stmt => {
        db.exec(stmt);
      });
      console.log(`[DB] ✓ Applied migration: ${file}`);
    });

    ensureJobsRequestIdSchema(db);

    console.log('[DB] ✓ All migrations completed successfully.');
    db.close();
  } catch (error) {
    console.error('[DB] ✗ Migration failed:', error.message);
    process.exit(1);
  }
}

console.log('[Server] Starting database initialization...');
runMigrations();

const { consumeEvents } = require('./infrastructure/messaging/rabbitmq');
const UpdateJobStatusUseCase = require('./application/job/UpdateJobStatusUseCase');
const SQLiteJobRepository = require('./infrastructure/database/repositories/SQLiteJobRepository');

async function startEventConsumer() {
  try {
    const repository = new SQLiteJobRepository();
    const updateJobStatusUseCase = new UpdateJobStatusUseCase(repository);

    await consumeEvents(config.RABBITMQ_EVENT_QUEUE, async (event) => {
      const { jobId, userId, status, result } = event;

      const statusMap = {
        'progress': 'PROCESSING',
        'completed': 'DONE',
        'failed': 'ERROR'
      };

      updateJobStatusUseCase.execute({
        id: jobId,
        userId,
        status: statusMap[status] || status,
        result
      });
    });
    console.log(`[RabbitMQ] Consumer listening on queue: ${config.RABBITMQ_EVENT_QUEUE}`);
  } catch (error) {
    console.error('[RabbitMQ] Failed to start consumer:', error.message);
  }
}

startEventConsumer();

const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(`[Server] ✓ Distributed Gaming Engine API listening on http://localhost:${PORT}`);
  console.log(`[Server] Environment: ${config.NODE_ENV}`);
  console.log(`[Server] Database: data/casino.db`);
});

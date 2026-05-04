const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.resolve(process.cwd(), 'data', 'casino.db');
const migrationsDir = path.resolve(process.cwd(), 'src', 'infrastructure', 'database', 'migrations');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

try {
  const db = new Database(dbPath);

  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort();

  if (migrationFiles.length === 0) {
    console.log('No migration files found.');
    db.close();
    process.exit(0);
  }

  migrationFiles.forEach((file) => {
    try {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

      const statements = sql.split(';').filter(stmt => stmt.trim());
      statements.forEach(stmt => {
        db.exec(stmt);
      });
      console.log(`✓ Applied migration: ${file}`);
    } catch (error) {
      console.error(`✗ Failed to apply migration ${file}:`, error.message);
      throw error;
    }
  });

  console.log('\n✓ All migrations completed successfully.');
  db.close();
  process.exit(0);
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
}

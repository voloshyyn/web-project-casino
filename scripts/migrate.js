const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.resolve(process.cwd(), 'data', 'casino.db');
const migrationsDir = path.resolve(process.cwd(), 'src', 'infrastructure', 'database', 'migrations');

fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new sqlite3.Database(dbPath);

const migrationFiles = fs
  .readdirSync(migrationsDir)
  .filter((file) => file.endsWith('.sql'))
  .sort();

db.serialize(() => {
  migrationFiles.forEach((file) => {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    db.exec(sql);
    console.log(`Applied migration: ${file}`);
  });
});

db.close();

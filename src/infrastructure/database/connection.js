const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const config = require('../../config/env');

// Ensure data directory exists
const dbDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.resolve(dbDir, 'casino.db');

// Initialize better-sqlite3 connection with options
const db = new Database(dbPath, {
  timeout: 5000,
  verbose: config.LOG_LEVEL === 'debug' ? console.log : undefined
});

// Enable foreign keys and WAL mode for concurrent access
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('synchronous = NORMAL');

module.exports = db;

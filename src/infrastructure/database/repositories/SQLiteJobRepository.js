const JobRepository = require('../../../domain/job/JobRepository');
const db = require('../connection');
const Job = require('../../../domain/job/Job');

class SQLiteJobRepository extends JobRepository {
  async create(job) {
    const query = `
      INSERT INTO jobs (id, user_id, game_id, amount, status, error_message, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      job.id,
      job.userId,
      job.gameId,
      job.amount,
      job.status,
      job.errorMessage,
      job.createdAt,
      job.updatedAt
    ];
    
    return new Promise((resolve, reject) => {
      db.run(query, params, function(err) {
        if (err) return reject(err);
        resolve(job);
      });
    });
  }

  async findById(id) {
    const query = `SELECT * FROM jobs WHERE id = ?`;
    
    return new Promise((resolve, reject) => {
      db.get(query, [id], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        resolve(new Job({
          id: row.id,
          userId: row.user_id,
          gameId: row.game_id,
          amount: row.amount,
          status: row.status,
          errorMessage: row.error_message,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));
      });
    });
  }

  async updateStatus(id, newStatus, errorMessage = null) {
    const updatedAt = new Date().toISOString();
    const query = `
      UPDATE jobs 
      SET status = ?, error_message = ?, updated_at = ?
      WHERE id = ?
    `;
    
    return new Promise((resolve, reject) => {
      db.run(query, [newStatus, errorMessage, updatedAt, id], function(err) {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  async dequeueNext() {
    const updatedAt = new Date().toISOString();
    const query = `
      UPDATE jobs 
      SET status = 'IN_PROGRESS', updated_at = ? 
      WHERE id = (SELECT id FROM jobs WHERE status = 'QUEUED' ORDER BY created_at ASC LIMIT 1) 
      RETURNING *;
    `;
    
    return new Promise((resolve, reject) => {
      db.get(query, [updatedAt], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        resolve(new Job({
          id: row.id,
          userId: row.user_id,
          gameId: row.game_id,
          amount: row.amount,
          status: row.status,
          errorMessage: row.error_message,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        }));
      });
    });
  }
  async findAll(filters = {}) {
    let query = 'SELECT * FROM jobs';
    const conditions = [];
    const params = [];

    if (filters.status) {
      conditions.push('status = ?');
      params.push(filters.status);
    }
    if (filters.userId) {
      conditions.push('user_id = ?');
      params.push(filters.userId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    return new Promise((resolve, reject) => {
      db.all(query, params, (err, rows) => {
        if (err) return reject(err);
        resolve((rows || []).map(row => new Job({
          id: row.id,
          userId: row.user_id,
          gameId: row.game_id,
          amount: row.amount,
          status: row.status,
          errorMessage: row.error_message,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        })));
      });
    });
  }
}

module.exports = SQLiteJobRepository;

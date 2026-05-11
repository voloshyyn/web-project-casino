const JobRepository = require('../../../domain/job/JobRepository');
const Job = require('../../../domain/job/Job');
const JobStatus = require('../../../domain/job/JobStatus');
const db = require('../connection');

class SQLiteJobRepository extends JobRepository {
	/**
	 * Create a new job in the database
	 * @param {Job} job - The job object to create
	 * @returns {Job} The created job with auto-generated ID
	 * @throws {Error} If database operation fails
	 */
	create(job) {
		try {
			const now = new Date().toISOString();
      
			const stmt = db.prepare(
				`INSERT INTO jobs (user_id, game_id, amount, request_id, status, result, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
			);

			const info = stmt.run(
				job.userId,
				job.gameId,
				job.amount,
				job.requestId || null,
				job.status,
				job.result || null,
				now,
				now
			);

			// Return the created job with the auto-generated ID
			return new Job({
				id: info.lastInsertRowid,
				userId: job.userId,
				gameId: job.gameId,
				amount: job.amount,
				requestId: job.requestId || null,
				status: job.status,
				result: job.result || null,
				createdAt: now,
				updatedAt: now
			});
		} catch (error) {
			throw new Error(`Failed to create job: ${error.message}`);
		}
	}

	/**
	 * Find a job by its idempotency key
	 * @param {Object} params - Query parameters
	 * @param {string} params.userId - User ID
	 * @param {string} params.requestId - Idempotency key
	 * @returns {Job|null} The found job or null
	 */
	findByRequestId({ userId, requestId }) {
		try {
			const stmt = db.prepare(
				`SELECT * FROM jobs WHERE user_id = ? AND request_id = ? LIMIT 1`
			);

			const row = stmt.get(userId, requestId);

			if (!row) {
				return null;
			}

			return this._rowToJob(row);
		} catch (error) {
			throw new Error(`Failed to find job by request ID: ${error.message}`);
		}
	}

	/**
	 * Update a job's status and optional result
	 * @param {Object} params - Update parameters
	 * @param {number} params.id - Job ID
	 * @param {string} params.userId - User ID (for authorization)
	 * @param {string} params.status - New status
	 * @param {string} [params.result] - Optional result field
	 * @returns {Job} The updated job
	 * @throws {Error} If job not found or update fails
	 */
	updateStatus({ id, userId, status, result = null }) {
		try {
			// Verify job exists and belongs to user
			const existing = this.findById({ id, userId });
			if (!existing) {
				throw new Error(`Job ${id} not found for user ${userId}`);
			}

			const now = new Date().toISOString();

			const stmt = db.prepare(
				`UPDATE jobs 
				 SET status = ?, result = ?, updated_at = ?
				 WHERE id = ? AND user_id = ?`
			);

			const info = stmt.run(status, result || null, now, id, userId);

			if (info.changes === 0) {
				throw new Error(`Failed to update job ${id}`);
			}

			// Return updated job
			return new Job({
				id: existing.id,
				userId: existing.userId,
				gameId: existing.gameId,
				amount: existing.amount,
				requestId: existing.requestId,
				status: status,
				result: result || null,
				createdAt: existing.createdAt,
				updatedAt: now
			});
		} catch (error) {
			throw new Error(`Failed to update job status: ${error.message}`);
		}
	}

	/**
	 * Find a job by ID
	 * @param {Object} params - Query parameters
	 * @param {number} params.id - Job ID
	 * @param {string} params.userId - User ID (for authorization/verification)
	 * @returns {Job|null} The found job or null
	 * @throws {Error} If database operation fails
	 */
	findById({ id, userId }) {
		try {
			const stmt = db.prepare(
				`SELECT * FROM jobs WHERE id = ? AND user_id = ?`
			);

			const row = stmt.get(id, userId);

			if (!row) {
				return null;
			}

			return this._rowToJob(row);
		} catch (error) {
			throw new Error(`Failed to find job by ID: ${error.message}`);
		}
	}

	/**
	 * Find all jobs for a specific user
	 * @param {string} userId - User ID
	 * @returns {Array<Job>} Array of jobs for the user
	 * @throws {Error} If database operation fails
	 */
	findAllByUserId(userId) {
		try {
			const stmt = db.prepare(
				`SELECT * FROM jobs WHERE user_id = ? ORDER BY created_at DESC`
			);

			const rows = stmt.all(userId);

			return rows.map(row => this._rowToJob(row));
		} catch (error) {
			throw new Error(`Failed to find jobs by user ID: ${error.message}`);
		}
	}

	/**
	 * Find all jobs with a specific status
	 * Useful for processing workers to query jobs by status
	 * @param {string} status - Job status to filter by
	 * @returns {Array<Job>} Array of jobs with the specified status
	 * @throws {Error} If database operation fails
	 */
	findByStatus(status) {
		try {
			// Validate status
			if (!Object.values(JobStatus).includes(status)) {
				throw new Error(`Invalid status: ${status}`);
			}

			const stmt = db.prepare(
				`SELECT * FROM jobs WHERE status = ? ORDER BY created_at ASC`
			);

			const rows = stmt.all(status);

			return rows.map(row => this._rowToJob(row));
		} catch (error) {
			throw new Error(`Failed to find jobs by status: ${error.message}`);
		}
	}

	/**
	 * Convert database row to Job domain object
	 * @private
	 * @param {Object} row - Database row
	 * @returns {Job} Job domain object
	 */
	_rowToJob(row) {
		return new Job({
			id: row.id,
			userId: row.user_id,
			gameId: row.game_id,
			amount: row.amount,
			requestId: row.request_id || null,
			status: row.status,
			result: row.result || null,
			createdAt: row.created_at,
			updatedAt: row.updated_at
		});
	}
}

module.exports = SQLiteJobRepository;

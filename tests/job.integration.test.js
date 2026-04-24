const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const sqlite3 = require('sqlite3').verbose();


const testDbPath = path.resolve(__dirname, '..', 'data', 'test_casino.db');


if (fs.existsSync(testDbPath)) {
  fs.unlinkSync(testDbPath);
}


fs.mkdirSync(path.dirname(testDbPath), { recursive: true });


const testDb = new sqlite3.Database(testDbPath);
const connectionModulePath = require.resolve('../src/infrastructure/database/connection');
require.cache[connectionModulePath] = {
  id: connectionModulePath,
  filename: connectionModulePath,
  loaded: true,
  exports: testDb
};


function runMigrations() {
  return new Promise((resolve, reject) => {
    const migrationsDir = path.resolve(__dirname, '..', 'src', 'infrastructure', 'database', 'migrations');
    const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

    testDb.serialize(() => {
      files.forEach(file => {
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        testDb.exec(sql);
      });
      resolve();
    });
  });
}


const BASE_URL = 'http://127.0.0.1';
let server;
let port;

function request(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port,
      path: urlPath,
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'test-user-1'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(data); } catch (_) {}
        resolve({ status: res.statusCode, body: parsed });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}


before(async () => {
  await runMigrations();


  const app = require('../src/app');
  server = app.listen(0);
  port = server.address().port;
});

after(() => {
  return new Promise((resolve) => {
    server.close(() => {
      testDb.close(() => {

        if (fs.existsSync(testDbPath)) {
          fs.unlinkSync(testDbPath);
        }
        resolve();
      });
    });
  });
});



describe('Job Lifecycle – Successful Path', () => {
  let jobId;

  it('POST /api/jobs → 201 QUEUED', async () => {
    const res = await request('POST', '/api/jobs', {
      userId: 'test-user-1',
      gameId: 'game-42',
      amount: 250
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.status, 'QUEUED');
    assert.ok(res.body.id);
    jobId = res.body.id;
  });

  it('POST /api/jobs/process-next → 200 IN_PROGRESS', async () => {
    const res = await request('POST', '/api/jobs/process-next');

    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'IN_PROGRESS');
    assert.equal(res.body.id, jobId);
  });

  it('PATCH /api/jobs/:id/status → 200 DONE', async () => {
    const res = await request('PATCH', `/api/jobs/${jobId}/status`, {
      status: 'DONE'
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'DONE');
  });

  it('GET /api/jobs/:id → 200 confirms DONE', async () => {
    const res = await request('GET', `/api/jobs/${jobId}`);

    assert.equal(res.status, 200);
    assert.equal(res.body.status, 'DONE');
    assert.equal(res.body.id, jobId);
  });
});

describe('FSM Constraint – Invalid Transitions', () => {
  let jobId;

  before(async () => {

    const createRes = await request('POST', '/api/jobs', {
      userId: 'test-user-1',
      gameId: 'game-99',
      amount: 500
    });
    jobId = createRes.body.id;

    await request('POST', '/api/jobs/process-next');
    await request('PATCH', `/api/jobs/${jobId}/status`, { status: 'DONE' });
  });

  it('PATCH DONE → QUEUED returns 409 Conflict', async () => {
    const res = await request('PATCH', `/api/jobs/${jobId}/status`, {
      status: 'QUEUED'
    });

    assert.equal(res.status, 409);
    assert.ok(res.body.error);
    assert.match(res.body.error, /Invalid status transition/);
  });

  it('PATCH DONE → IN_PROGRESS returns 409 Conflict', async () => {
    const res = await request('PATCH', `/api/jobs/${jobId}/status`, {
      status: 'IN_PROGRESS'
    });

    assert.equal(res.status, 409);
  });
});

describe('404 Not Found – Invalid UUID', () => {
  it('GET /api/jobs/:id with fake UUID returns 404', async () => {
    const res = await request('GET', '/api/jobs/00000000-0000-0000-0000-000000000000');

    assert.equal(res.status, 404);
    assert.ok(res.body.error);
  });

  it('PATCH /api/jobs/:id/status with fake UUID returns 404', async () => {
    const res = await request('PATCH', '/api/jobs/00000000-0000-0000-0000-000000000000/status', {
      status: 'DONE'
    });

    assert.equal(res.status, 404);
    assert.ok(res.body.error);
  });
});

describe('Empty Queue – Process Next', () => {
  it('POST /api/jobs/process-next with empty queue returns 204', async () => {

    const res = await request('POST', '/api/jobs/process-next');

    assert.equal(res.status, 204);
    assert.equal(res.body, null);
  });
});

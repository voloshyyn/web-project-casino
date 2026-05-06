// Automated test script for auth and job isolation
const base = 'http://localhost:3000';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForServer() {
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(base + '/api/auth/token', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username: 'ping' })
      });
      // server responded
      return;
    } catch (err) {
      await wait(500);
    }
  }
  throw new Error('Server did not become ready in time');
}

async function run() {
  await waitForServer();

  const doAuth = async (username) => {
    const res = await fetch(base + '/api/auth/token', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username })
    });
    return res.json();
  };

  const alice = await doAuth('alice');
  console.log('alice:', alice.userId);
  const bob = await doAuth('bob');
  console.log('bob:', bob.userId);

  // Alice creates a job
  const create = await fetch(base + '/api/jobs', {
    method: 'POST',
    headers: { 'content-type': 'application/json', Authorization: 'Bearer ' + alice.token },
    body: JSON.stringify({ gameId: 'g1', amount: 10 })
  });
  const job = await create.json();
  console.log('created job id:', job.id);

  // Bob lists jobs (should not see Alice's job)
  const listBob = await fetch(base + '/api/jobs', { headers: { Authorization: 'Bearer ' + bob.token } });
  console.log('bob list status:', listBob.status, 'body:', await listBob.text());

  // Bob tries to fetch Alice's job by id (should 404)
  const getByBob = await fetch(base + `/api/jobs/${job.id}`, { headers: { Authorization: 'Bearer ' + bob.token } });
  console.log('bob get status:', getByBob.status, 'body:', await getByBob.text());

  // Alice fetches her job
  const getByAlice = await fetch(base + `/api/jobs/${job.id}`, { headers: { Authorization: 'Bearer ' + alice.token } });
  console.log('alice get status:', getByAlice.status, 'body:', await getByAlice.json());
}

run().catch((err) => {
  console.error('Test script failed:', err);
  process.exit(1);
});

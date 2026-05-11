# AsyncBet Engine — Backend Lab 2: Authentication & Authorization

This repository implements a minimal JWT-based identification flow (no registration, no passwords) and job isolation by `userId`.

Quick start

1. Copy `.env.example` to `.env` and set `JWT_SECRET` to a secure value.

2. Install dependencies and run the server:

```bash
npm install
npm run dev
```

3. Issue a token (no password required):

```bash
curl -s -X POST http://localhost:3000/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username":"alice"}'
```

Response will contain `token` and `userId`.

4. Use the token for job endpoints:

```bash
curl -s -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -H "Idempotency-Key: bet-123" \
  -d '{"gameId":"g1","amount":10}'

curl -s -X GET http://localhost:3000/api/jobs \
  -H "Authorization: Bearer <token>"
```

The POST `/api/jobs` endpoint now queues the bet request in RabbitMQ and returns immediately with a queued job. Reusing the same `Idempotency-Key` for the same user returns the existing job instead of publishing a duplicate message.

Set these env vars for the broker:

- `RABBITMQ_URL=amqp://localhost`
- `RABBITMQ_QUEUE=game.requests`

Automated test

Run the provided integration script which issues tokens for two users, creates a job as `alice`, and verifies `bob` cannot access it:

```bash
npm run test:auth
```

Files of interest

- `src/interfaces/http/controllers/auth.controller.js` — issues JWTs with `{ userId }` payload
- `src/interfaces/http/middleware/userScope.middleware.js` — verifies JWT and exposes `req.userId`
- `src/infrastructure/database/repositories/SQLiteJobRepository.js` — SQL queries enforce `user_id` for lookups/updates

Notes

- No registration or password flows (requirement).
- Tokens are signed with `JWT_SECRET` from env; rotate or harden in production.

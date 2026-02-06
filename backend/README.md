# ReachInbox Email Job Scheduler

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up `.env` with DB, Redis, Ethereal credentials.
3. Run Prisma migrations and generate client:
   ```bash
   npx prisma generate
   ```
4. Start backend:
   ```bash
   npm start
   ```
5. Start email worker:
   ```bash
   ts-node src/emailWorker.ts
   ```

## Architecture Overview
- Express.js API for scheduling and viewing emails
- BullMQ + Redis for persistent job scheduling
- MySQL/PostgreSQL via Prisma ORM
- Ethereal Email for SMTP
- Rate limiting: MAX_EMAILS_PER_HOUR (env), per sender, Redis-backed
- Delay between sends: EMAIL_SEND_DELAY (env, ms)
- Idempotency: BullMQ jobId, DB status
- Persistence: Jobs and DB survive restarts

## Rate Limiting & Delay
- Min 2 seconds between sends (configurable)
- Per-sender/hour limit (configurable)
- Jobs rescheduled if limit exceeded

## API Endpoints
- `POST /emails`: Schedule new email
- `GET /emails/scheduled`: View scheduled emails
- `GET /emails/sent`: View sent emails

## Features
- Scheduler, persistence, rate limiting, concurrency
- Frontend: login, dashboard, compose, tables (see frontend folder)

## Demo
- Schedule emails via API or frontend
- Dashboard shows scheduled/sent emails
- Restart scenario: jobs persist
- Rate limiting/delay under load

## Assumptions & Trade-offs
- No cron jobs used
- Idempotency via jobId and DB
- Rate limiting safe across workers

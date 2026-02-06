# Quick Start Guide - ReachBox Email Scheduler

Get up and running in 5 minutes! 🚀

## Prerequisites

- Docker & Docker Compose (easiest option)
- OR Node.js 18+, PostgreSQL 15+, Redis 7+ (manual setup)

## Option 1: Docker Compose (Recommended) ⭐

### Step 1: Setup Credentials

1. **Ethereal Email** (Required): Create free account at https://ethereal.email/register
2. **Google OAuth** (Optional - can use test login): See [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) for detailed instructions

3. Create `.env` file in project root:

```bash
# .env
ETHEREAL_USER=your_ethereal_email@ethereal.email
ETHEREAL_PASS=your_ethereal_password

# Optional - Leave empty to use test login instead
REACT_APP_GOOGLE_CLIENT_ID=
```

### Step 2: Run Everything

```bash
docker-compose up --build
```

### Step 3: Access Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:4000
- **Database:** localhost:5432 (PostgreSQL)
- **Redis:** localhost:6379

### Step 4: Login & Test

**Option A: Test Login (No Google OAuth needed)**
1. Go to http://localhost:3000
2. You'll see a simple login form
3. Enter any email (e.g., `test@example.com`)
4. Click "Login for Testing"
5. You're in! ✅

**Option B: Google OAuth Login**
1. Follow [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md) to configure OAuth
2. Add your Client ID to `frontend/.env.local`
3. Restart frontend
4. Click "Login with Google" on http://localhost:3000
5. Complete Google OAuth flow

**Then:**
3. Click "Compose New Email"
4. Upload test CSV with emails (or paste directly)
5. Set start time to 1 minute from now
6. Click "Schedule Emails"
7. Watch emails move from "Scheduled" to "Sent" tab!

## Option 2: Local Development Setup

### Backend

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your Ethereal & Google credentials

# Setup database
npx prisma generate
npx prisma migrate dev --name init

# Start backend (Terminal 1)
npm run dev

# Start worker (Terminal 2, same directory)
npm run worker
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
echo "REACT_APP_API_URL=http://localhost:4000" > .env.local
echo "REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id" >> .env.local

# Start frontend (Terminal 3)
npm start
```

## Test Email Scheduling

### Via Dashboard UI

1. Login to http://localhost:3000
2. Click "Compose New Email"
3. Fill form:
   - **From:** your_email@example.com
   - **Subject:** Test Email
   - **Body:** This is a test email
   - **Upload:** Create test.csv with:
     ```
     test1@example.com
     test2@example.com
     test3@example.com
     ```
   - **Schedule:** 1 minute from now
4. Click "Schedule Emails"
5. Watch status change in tabs

### Via API (cURL)

```bash
# Get auth token
TOKEN=$(curl -X POST http://localhost:4000/auth/token \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"Test User"}' \
  | jq -r '.token')

# Schedule bulk email
curl -X POST http://localhost:4000/emails/bulk \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": ["test1@example.com", "test2@example.com"],
    "subject": "API Test",
    "body": "Testing via API",
    "sender": "api@example.com",
    "scheduledAt": "'$(date -u -d '+2 minutes' +%Y-%m-%dT%H:%M:%SZ)'",
    "delayBetween": 1000
  }'

# Check scheduled emails
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:4000/emails/scheduled | jq .
```

## Verify Rate Limiting Works

1. **Schedule 250 emails** for the same time
2. **Expected behavior:**
   - First 200 emails sent in current hour window
   - Emails 201-250 automatically rescheduled to next hour
   - System respects global 200/hour limit

## Check Persistence on Restart

1. Schedule emails for 5 minutes from now
2. Stop backend: `Ctrl+C`
3. Wait 30 seconds
4. Restart backend: `npm run dev`
5. **Result:** Emails still in queue and send at scheduled time! ✓

## View Test Emails

Email successfully sent emails can be viewed at Ethereal:

1. Go to https://ethereal.email/
2. Login with your test account
3. Check "Messages" tab to see delivered emails

## Troubleshooting

### Port Already in Use
```bash
# Kill process using port 3000/4000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### Database Connection Error
```bash
# Check PostgreSQL is running
docker ps | grep reachbox-db

# Or if local:
psql -h localhost -U reachbox -d reachbox
```

### Google OAuth Not Working
1. Verify Client ID in `.env`
2. Check http://localhost:3000 is in authorized redirect URIs
3. Ensure popup is allowed in browser

### No Emails Being Sent
1. Check ETHEREAL_USER and ETHEREAL_PASS are correct
2. Verify Redis is running: `redis-cli ping`
3. Check worker logs: `npm run worker`
4. Verify scheduled time is in future

## Next Steps

- [ ] Review [README.md](./README.md) for full documentation
- [ ] Explore API endpoints (see Backend README)
- [ ] Load test with thousands of emails
- [ ] Configure custom SMTP provider (Gmail, SendGrid, etc.)
- [ ] Deploy to production (Heroku, AWS, etc.)

## Getting Help

- Check [README.md](./README.md) for detailed documentation
- Review [docker-compose.yml](./docker-compose.yml) for service configuration
- Check backend `.env.example` for all configuration options

Happy scheduling! 🎉

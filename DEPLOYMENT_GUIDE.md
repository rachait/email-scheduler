# 🚀 Deployment Guide - Host ReachBox Email Scheduler

## Quick Deploy: Railway + Vercel (Recommended)

### Part 1: Deploy Backend + Database + Redis on Railway

**Railway** provides PostgreSQL, Redis, and Node.js hosting in one platform with a free tier.

#### Step 1: Sign up for Railway
1. Go to https://railway.app/
2. Sign in with GitHub
3. Click **New Project**

#### Step 2: Deploy PostgreSQL
1. Click **+ New** → **Database** → **Add PostgreSQL**
2. Wait for deployment (30 seconds)
3. Click on PostgreSQL service → **Connect** tab
4. Copy the **DATABASE_URL** (looks like: `postgresql://postgres:...@containers-us-west-xxx.railway.app:7633/railway`)

#### Step 3: Deploy Redis
1. Click **+ New** → **Database** → **Add Redis**
2. Wait for deployment (30 seconds)
3. Click on Redis service → **Connect** tab
4. Copy **REDIS_URL** (looks like: `redis://default:...@containers-us-west-xxx.railway.app:6379`)

#### Step 4: Deploy Backend API
1. **Push your code to GitHub first** (if you haven't):
   ```bash
   # Install Git for Windows: https://git-scm.com/download/win
   # Then run:
   cd "d:\ReachBox Ai"
   git init
   git add .
   git commit -m "feat: ReachBox Email Scheduler"
   git branch -M main
   git remote add origin https://github.com/rachait/email-scheduler.git
   git push -u origin main
   ```

2. **In Railway Dashboard:**
   - Click **+ New** → **GitHub Repo**
   - Select: `rachait/email-scheduler`
   - ROOT DIRECTORY: Set to `backend`
   - Click **Deploy**

3. **Add Environment Variables:**
   - Go to backend service → **Variables** tab
   - Add these variables:
   
   ```env
   NODE_ENV=production
   PORT=4000
   DATABASE_URL=<paste from PostgreSQL service>
   REDIS_HOST=<from Redis service - just the host part>
   REDIS_PORT=<from Redis service - just the port part>
   ETHEREAL_USER=bynncp32ffsrs7yq@ethereal.email
   ETHEREAL_PASS=2yjmCyMfNbj76E2bR5
   WORKER_CONCURRENCY=5
   EMAIL_SEND_DELAY=2000
   MAX_EMAILS_PER_HOUR=200
   ```

4. **Get your backend URL:**
   - Go to backend service → **Settings** tab
   - Click **Generate Domain**
   - Copy URL (e.g., `https://reachbox-backend-production-xxxx.up.railway.app`)

#### Step 5: Run Database Migration
Railway will automatically run `npm start`, but you need to push database schema first.

Add this to `backend/package.json` scripts:
```json
"scripts": {
  "start": "npx prisma db push --accept-data-loss && ts-node src/index.ts",
  "worker": "ts-node src/emailWorker.ts",
  "build": "tsc"
}
```

Or manually run in Railway's terminal:
1. Go to backend service → **Deployments** tab
2. Click latest deployment → **View Logs**
3. If you see database errors, go to **Settings** → **Custom Start Command**
4. Set: `npx prisma db push --accept-data-loss && npm start`

---

### Part 2: Deploy Frontend on Vercel

**Vercel** is optimized for React apps with instant deployments.

#### Step 1: Sign up for Vercel
1. Go to https://vercel.com/
2. Sign in with GitHub

#### Step 2: Import Project
1. Click **Add New...** → **Project**
2. Select your repository: `rachait/email-scheduler`
3. **Root Directory**: Select `frontend`
4. **Framework Preset**: Auto-detected as Create React App

#### Step 3: Configure Environment Variables
Before deploying, add these in Vercel:

```env
REACT_APP_API_URL=https://your-railway-backend-url.up.railway.app
REACT_APP_GOOGLE_CLIENT_ID=988886768752-g9ln6v7d6j24qffd0dqgmmq4oosugbia.apps.googleusercontent.com
```

#### Step 4: Deploy
1. Click **Deploy**
2. Wait 2-3 minutes
3. Copy your live URL (e.g., `https://email-scheduler-abc123.vercel.app`)

---

### Part 3: Update Backend CORS

Once you have your Vercel frontend URL, update backend CORS to allow requests:

Add to `backend/src/index.ts`:
```typescript
app.use(cors({
  origin: [
    'http://localhost:3001',
    'https://email-scheduler-abc123.vercel.app', // Your Vercel URL
  ],
  credentials: true
}));
```

Push changes:
```bash
git add .
git commit -m "fix: Update CORS for production"
git push
```

Railway will auto-deploy the update.

---

### Part 4: Update Google OAuth Redirect URIs

1. Go to https://console.cloud.google.com/
2. Select your OAuth client
3. Add Authorized JavaScript origins:
   - `https://email-scheduler-abc123.vercel.app` (your Vercel URL)
4. Add Authorized redirect URIs:
   - `https://email-scheduler-abc123.vercel.app/auth/callback`

---

## 🎉 Your Hosted Application

After deployment, you'll have:

- **Frontend**: `https://email-scheduler-abc123.vercel.app`
- **Backend API**: `https://reachbox-backend-production-xxxx.up.railway.app`
- **Database**: PostgreSQL on Railway
- **Queue**: Redis on Railway

**Test it:**
1. Visit your Vercel URL
2. Login with Google OAuth or test email
3. Schedule emails
4. Check Ethereal inbox: https://ethereal.email/messages

---

## Alternative: Render.com (Simpler but Slower)

If Railway is complex, try **Render**:

### Deploy on Render (All-in-One)

1. Go to https://render.com/
2. Sign in with GitHub
3. Click **New +** → **Web Service**
4. Connect `rachait/email-scheduler` repo
5. Root Directory: `backend`
6. Build Command: `npm install && npx prisma generate`
7. Start Command: `npx prisma db push --accept-data-loss && npm start`
8. Add PostgreSQL: Click **New +** → **PostgreSQL**
9. Add Redis: Click **New +** → **Redis**
10. Link databases to web service in environment variables

---

## 🚨 Important Notes

### For Submission:
- **Backend URL**: Must be publicly accessible (use Railway/Render URL)
- **Frontend URL**: Must be publicly accessible (use Vercel/Netlify URL)
- **Database**: Must be cloud-hosted (Railway/Render PostgreSQL)
- **Redis**: Must be cloud-hosted (Railway/Render/Upstash Redis)

### Free Tier Limitations:
- **Railway**: $5 credit (enough for ~1 month)
- **Vercel**: Unlimited for hobby projects
- **Render**: Free tier sleeps after 15 mins inactivity (cold starts)

### Production Checklist:
- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Database migrations run successfully
- [ ] Environment variables set correctly
- [ ] CORS configured for production URL
- [ ] Google OAuth redirect URIs updated
- [ ] Test email scheduling works
- [ ] Test emails arrive in Ethereal inbox

---

## 📝 What to Submit

**Submission Format:**
```
Live Application Links:

Frontend: https://email-scheduler-abc123.vercel.app
Backend API: https://reachbox-backend-production-xxxx.up.railway.app/
GitHub Repository: https://github.com/rachait/email-scheduler

Demo Video: [Your Loom/YouTube link]

Credentials for Testing:
- Test Login Email: test@example.com
- Ethereal SMTP: bynncp32ffsrs7yq@ethereal.email
- View Sent Emails: https://ethereal.email/messages
  (Password: 2yjmCyMfNbj76E2bR5)

Tech Stack:
- Backend: Node.js, Express, BullMQ, Redis, Prisma, PostgreSQL
- Frontend: React, TypeScript, Tailwind CSS
- Hosting: Railway (Backend/DB/Redis), Vercel (Frontend)
```

---

## Need Help?

**Common Issues:**

1. **Database connection failed**: Check DATABASE_URL in Railway environment variables
2. **CORS errors**: Update backend CORS with your Vercel URL
3. **Worker not processing emails**: Deploy worker as separate Railway service or use Railway's background workers
4. **Cold starts on Render**: Upgrade to paid plan or use Railway

**Quick Fix for Worker on Railway:**
Add to `backend/src/index.ts` (start worker in same process):
```typescript
// Start email worker in same process
startEmailWorker();
```

This way you don't need a separate worker service.

---

Good luck with your deployment! 🚀

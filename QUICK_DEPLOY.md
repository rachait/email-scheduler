# ⚡ Quick Deployment - Get Your Hosted Link in 15 Minutes

## Prerequisites
- [ ] Code must be on GitHub (public or private repo)
- [ ] Git installed on your computer

## Step 1: Push Code to GitHub (5 minutes)

### Install Git
Download: https://git-scm.com/download/win (keep default settings)

### Push your code:
```bash
cd "d:\ReachBox Ai"

# Initialize git
git init
git add .
git commit -m "feat: ReachBox Email Scheduler - Complete"

# Connect to GitHub (use your existing repo)
git branch -M main
git remote add origin https://github.com/rachait/email-scheduler.git
git push -u origin main
```

---

## Step 2: Deploy Backend on Railway (5 minutes)

### A. Sign Up
1. Go to https://railway.app/
2. Click **Login** → **Login with GitHub**
3. Authorize Railway

### B. Create PostgreSQL Database
1. Click **+ New Project**
2. Click **Deploy PostgreSQL**
3. Wait 30 seconds
4. Click on PostgreSQL → **Connect** tab
5. **Copy the DATABASE_URL** (save it!)

### C. Create Redis Database
1. Click **+ New** 
2. Click **Deploy Redis**
3. Wait 30 seconds
4. Click on Redis → **Variables** tab
5. Note the REDIS_HOST and REDIS_PORT

### D. Deploy Backend from GitHub
1. Click **+ New**
2. Click **GitHub Repo**
3. Select: `rachait/email-scheduler`
4. Wait for project to be created
5. Click on the service → **Settings**
6. **Root Directory**: Set to `backend`
7. **Start Command**: `npx prisma db push --accept-data-loss && npm start`

### E. Add Environment Variables
Click on backend service → **Variables** tab → **Raw Editor**

Paste this (update with your DATABASE_URL from step B):
```
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://postgres:PASSWORD@containers-us-west-xxx.railway.app:7643/railway
REDIS_HOST=containers-us-west-xxx.railway.app
REDIS_PORT=6379
ETHEREAL_USER=bynncp32ffsrs7yq@ethereal.email
ETHEREAL_PASS=2yjmCyMfNbj76E2bR5
WORKER_CONCURRENCY=5
EMAIL_SEND_DELAY=2000
MAX_EMAILS_PER_HOUR=200
```

### F. Get Your Backend URL
1. Go to backend service → **Settings** tab
2. Scroll to **Networking**
3. Click **Generate Domain**
4. Copy URL (e.g., `https://reachbox-backend-production-abc123.up.railway.app`)
5. **Save this URL!** You need it for frontend

---

## Step 3: Deploy Frontend on Vercel (3 minutes)

### A. Sign Up
1. Go to https://vercel.com/
2. Click **Sign Up** → **Continue with GitHub**

### B. Import Project
1. Click **Add New...** → **Project**
2. Find `rachait/email-scheduler` → Click **Import**
3. **Root Directory**: Click **Edit** → Select `frontend`
4. **Framework Preset**: Create React App (auto-detected)

### C. Add Environment Variables
Click **Environment Variables** and add:

```
REACT_APP_API_URL=https://your-railway-backend-url.up.railway.app
REACT_APP_GOOGLE_CLIENT_ID=988886768752-g9ln6v7d6j24qffd0dqgmmq4oosugbia.apps.googleusercontent.com
```

**Replace** `your-railway-backend-url` with your Railway URL from Step 2F.

### D. Deploy
1. Click **Deploy**
2. Wait 2-3 minutes ☕
3. Copy your live URL (e.g., `https://email-scheduler-abc123.vercel.app`)

---

## Step 4: Test Your Hosted Application (2 minutes)

1. **Visit your Vercel URL**
2. **Login** with test email: `test@example.com`
3. **Schedule an email:**
   - Sender: `bynncp32ffsrs7yq@ethereal.email`
   - Recipient: `recipient@example.com`
   - Subject: "Test Email"
   - Body: "Testing deployment"
   - Schedule: Now
4. **Check Sent Emails tab** - should see email status
5. **View email** at https://ethereal.email/messages
   - Email: `bynncp32ffsrs7yq@ethereal.email`
   - Password: `2yjmCyMfNbj76E2bR5`

---

## 🎉 Your Submission Links

```
✅ Frontend (Live Application): https://email-scheduler-abc123.vercel.app
✅ Backend API: https://reachbox-backend-production-abc123.up.railway.app
✅ GitHub Repository: https://github.com/rachait/email-scheduler
```

**Submit these 3 links!**

---

## ⚠️ Troubleshooting

### Backend not starting?
1. Check Railway **Deployments** tab for logs
2. Verify DATABASE_URL is correct (must be from Railway PostgreSQL)
3. Check start command: `npx prisma db push --accept-data-loss && npm start`

### Frontend can't connect to backend?
1. Verify REACT_APP_API_URL in Vercel environment variables
2. Check Railway backend URL is correct and accessible
3. Redeploy frontend after fixing env vars

### Database errors?
1. Make sure Railway PostgreSQL is deployed and running
2. DATABASE_URL must match exactly (copy from Railway)
3. Check backend logs for specific error messages

### Worker not processing emails?
Worker starts automatically with backend. Check Railway logs for:
```
📧 Email worker started with concurrency: 5
```

If missing, worker may have failed to start. Check Redis connection.

---

## Alternative: Deploy Everything on Render (Slower but Simpler)

If Railway is confusing, use **Render** (one platform for everything):

1. Go to https://render.com/
2. Sign up with GitHub
3. Click **New +** → **Blueprint**
4. Connect `rachait/email-scheduler` repo
5. Render will auto-detect `render.yaml` config
6. Click **Apply**
7. Wait 10-15 minutes for all services to deploy
8. Get URLs from Render dashboard

**Note**: Render free tier has cold starts (15-30 second delay on first request).

---

## 📹 Don't Forget Demo Video!

Record 5-minute demo showing:
1. Login to your hosted app
2. Schedule emails (single + CSV)
3. View scheduled/sent emails
4. Show emails in Ethereal inbox

Upload to: **Loom** (loom.com) or **YouTube** (unlisted)

---

## Need Help?

**My deployment failed!**
- Check Railway/Vercel deployment logs for specific errors
- Verify all environment variables are set correctly
- Make sure backend is deployed BEFORE frontend

**Railway says "Build failed"**
- Check `backend/package.json` has all dependencies
- Try manual build command: `npm install && npx prisma generate`

**Vercel says "Build failed"**  
- Check `frontend/package.json` scripts has `build` command
- Try local build: `cd frontend && npm run build`

**Still stuck?**
- Railway docs: https://docs.railway.app/
- Vercel docs: https://vercel.com/docs
- Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for detailed instructions

---

🚀 **Good luck with your deployment!**

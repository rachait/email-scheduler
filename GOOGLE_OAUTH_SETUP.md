# Google OAuth Setup Guide

Follow these steps to enable Google login for ReachBox Email Scheduler.

## Quick Setup (5 minutes)

### Step 1: Go to Google Cloud Console
Visit: https://console.cloud.google.com

### Step 2: Create or Select a Project
1. Click the project dropdown at the top
2. Click "New Project"
3. Name it "ReachBox Email Scheduler" (or any name)
4. Click "Create"

### Step 3: Enable Google+ API (Required)
1. In the left sidebar, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and press **Enable**

### Step 4: Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** at the top
3. Select **OAuth client ID**
4. If prompted to configure consent screen:
   - Click "Configure Consent Screen"
   - Select "External" (unless you have a Google Workspace)
   - Click "Create"
   - Fill in required fields:
     - App name: **ReachBox Email Scheduler**
     - User support email: Your email
     - Developer contact: Your email
   - Click "Save and Continue"
   - Skip the Scopes section (click "Save and Continue")
   - Add test users if needed
   - Click "Save and Continue"

5. Back to Create OAuth client ID:
   - Application type: **Web application**
   - Name: **ReachBox Web Client**
   
6. Under **Authorized JavaScript origins**, click **+ ADD URI**:
   - Add: `http://localhost:3000`
   
7. Under **Authorized redirect URIs**, click **+ ADD URI**:
   - Add: `http://localhost:3000`
   
8. Click **CREATE**

### Step 5: Copy Your Client ID
1. A dialog will appear with your credentials
2. Copy the **Client ID** (looks like: `123456789.apps.googleusercontent.com`)
3. ⚠️ **Don't close this yet!**

### Step 6: Configure ReachBox
1. Open `frontend/.env.local` in your project
2. Find the line: `REACT_APP_GOOGLE_CLIENT_ID=`
3. Paste your Client ID after the `=` sign:
   ```
   REACT_APP_GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
   ```
4. Save the file

### Step 7: Restart the Frontend
```bash
# Stop the frontend server (Ctrl+C)
# Restart it:
cd frontend
npm start
```

### Step 8: Test Login
1. Go to http://localhost:3000
2. You should now see a "Sign in with Google" button
3. Click it and complete the OAuth flow
4. You'll be redirected back to the dashboard ✅

---

## Troubleshooting

### Error: "OAuth client was not found"
**Solution:** The Client ID is incorrect or missing.
- Double-check you copied the entire Client ID
- Make sure there are no extra spaces
- Restart the frontend after changing `.env.local`

### Error: "Access blocked: Authorization Error"
**Solution:** The redirect URI is not authorized.
- In Google Cloud Console, go to **Credentials**
- Click on your OAuth client
- Make sure `http://localhost:3000` is in both:
  - Authorized JavaScript origins
  - Authorized redirect URIs

### Error: "This app isn't verified"
**Solution:** This is normal for development.
- Click "Advanced" → "Go to ReachBox (unsafe)"
- This only appears in testing mode

### Google login button doesn't appear
**Solution:** Check your `.env.local` file.
- Make sure `REACT_APP_GOOGLE_CLIENT_ID` is set
- Restart the frontend: `Ctrl+C` then `npm start`
- Clear browser cache/cookies

### Still seeing "Google OAuth Not Configured"
**Solution:** Environment variable not loaded.
- Stop the server completely
- Verify `.env.local` has the Client ID
- Start again: `npm start`
- Hard refresh browser: `Ctrl+Shift+R`

---

## Using Test Login (Without Google OAuth)

If you don't want to set up Google OAuth yet, you can use the simple test login:

1. Leave `REACT_APP_GOOGLE_CLIENT_ID` empty or commented out
2. Go to http://localhost:3000
3. You'll see a simple email/name login form
4. Enter any email (e.g., `test@example.com`)
5. Click "Login for Testing"
6. You're in! ✅

**Note:** Test login is only for development. Use Google OAuth for production.

---

## Production Deployment

When deploying to production:

1. **Update Authorized Origins:**
   - Add your production domain: `https://yourapp.com`
   
2. **Update Authorized Redirect URIs:**
   - Add: `https://yourapp.com`
   
3. **Verify OAuth Consent Screen:**
   - Submit for verification if you want the "verified" badge
   - Add privacy policy and terms of service URLs

4. **Update Environment Variables:**
   ```bash
   REACT_APP_API_URL=https://api.yourapp.com
   REACT_APP_GOOGLE_CLIENT_ID=your_production_client_id
   ```

5. **Build Frontend:**
   ```bash
   npm run build
   ```

---

## Security Notes

⚠️ **Never commit `.env.local` to Git!**
- It's already in `.gitignore`
- Don't share your Client ID publicly
- Use different credentials for dev/staging/production

---

## Need Help?

- Google OAuth Documentation: https://developers.google.com/identity/protocols/oauth2
- Google Sign-In for Web: https://developers.google.com/identity/gsi/web/guides/overview

---

**You're all set! 🎉**

Once configured, users can sign in with their Google accounts and start scheduling emails.

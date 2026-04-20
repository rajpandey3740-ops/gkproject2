# 🚀 Production Deployment Guide - GK General Store

## 📋 Architecture Overview

```
┌─────────────────────┐
│   Vercel            │
│   Frontend          │
│   React/Vite        │
│   Port: 3000        │
└──────────┬──────────┘
           │
           │ VITE_API_URL
           │ https://your-backend.railway.app
           │
           ▼
┌─────────────────────┐
│   Railway           │
│   Backend API       │
│   Node.js/Express   │
│   Port: 3001        │
└──────────┬──────────┘
           │
           │ MONGODB_URI
           │
           ▼
┌─────────────────────┐
│   MongoDB Atlas     │
│   Database          │
│   Cloud Hosted      │
└─────────────────────┘
```

---

## 🔍 Issues Found & Fixed

### Issue 1: Backend Not Starting in Production
**Problem**: Server only started in development mode (`NODE_ENV !== 'production'`)
**Impact**: Railway deployment would have no server listening
**Fix**: Removed development-only check, server now starts on `process.env.PORT` in all environments

**Fixed Code** (`api/index.ts`):
```typescript
// Before: Only started in dev mode
if (process.env.NODE_ENV !== 'production') {
  const PORT = Number(process.env.PORT) || 3005;
  app.listen(PORT, () => { ... });
}

// After: Starts in both dev and production
const PORT = Number(process.env.PORT) || 3001;
app.listen(PORT, () => {
  Logger.info(`✅ Server running on port ${PORT}`);
  Logger.info(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});
```

### Issue 2: Railway Health Check Path Incorrect
**Problem**: Health check pointed to `/api/health` but should be `/health` when api/ is root
**Impact**: Railway would mark deployment as failed
**Fix**: Updated `railway.json` healthcheckPath to `/health`

### Issue 3: Unnecessary Build Step
**Problem**: TypeScript compilation required .js extensions in imports (ES modules)
**Impact**: Build would fail or require rewriting all imports
**Fix**: Using `tsx` for production (handles TypeScript natively without compilation)

---

## ✅ Current Configuration

### Backend (api/package.json)
```json
{
  "scripts": {
    "start": "tsx index.ts",
    "dev": "tsx index.ts"
  }
}
```

### Frontend (package.json)
```json
{
  "scripts": {
    "build": "tsc && vite build",
    "vercel-build": "npm run build"
  }
}
```

---

## 🛠️ STEP-BY-STEP DEPLOYMENT

### PART 1: Deploy Backend to Railway

#### Step 1: Create MongoDB Atlas Database

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free account
3. Create a new project (e.g., "GK Store")
4. Build a Database → Select **FREE** tier (M0)
5. Choose a cloud provider and region (closest to your users)
6. Click **Create Cluster**

#### Step 2: Configure MongoDB Access

1. **Create Database User**:
   - Click **Database Access** in left sidebar
   - Click **Add New Database User**
   - Authentication Method: Password
   - Username: `gkstoreadmin`
   - Password: Click "Autogenerate Secure Password" and **SAVE IT**
   - User Privileges: Read and write to any database
   - Click **Add User**

2. **Allow Network Access**:
   - Click **Network Access** in left sidebar
   - Click **Add IP Address**
   - Click **Allow Access from Anywhere** (0.0.0.0/0)
   - Click **Confirm**

3. **Get Connection String**:
   - Click **Database** in left sidebar
   - Click **Connect** on your cluster
   - Select **Drivers**
   - Copy the connection string (looks like):
   ```
   mongodb+srv://gkstoreadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - Replace `<password>` with your actual password
   - Add database name at end: `/gkshop`
   - Final format:
   ```
   mongodb+srv://gkstoreadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/gkshop?retryWrites=true&w=majority&appName=Cluster0&authSource=admin
   ```

#### Step 3: Deploy to Railway

1. **Create Railway Account**:
   - Go to https://railway.app
   - Click **Login** → Sign in with GitHub
   - Authorize Railway

2. **Create New Project**:
   - Click **New Project**
   - Select **Deploy from GitHub repo**
   - Select your repository: `gkproject2`
   - Click **Deploy Now**

3. **Configure Service**:
   - Click on your deployed service
   - Go to **Settings** tab
   - Find **Root Directory**
   - Set to: `api` (IMPORTANT!)
   - Railway will auto-detect `api/package.json`

4. **Add Environment Variables**:
   - Go to **Variables** tab
   - Click **Raw Editor**
   - Paste the following (update with your values):

```env
NODE_ENV=production
PORT=3001

# MongoDB Atlas (REQUIRED for database features)
MONGODB_URI=mongodb+srv://gkstoreadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/gkshop?retryWrites=true&w=majority&appName=Cluster0&authSource=admin

# JWT Secret (Generate strong secret)
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
JWT_EXPIRY=7d

# Frontend URL (update after Vercel deployment)
FRONTEND_URL=https://your-app.vercel.app

# Email Configuration (for email authentication)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password

# Owner Credentials (update these)
OWNER_PHONE=9876543210
OWNER_PASSWORD=YourSecureOwnerPassword123!

# Optional: Twilio SMS (for phone OTP)
# TWILIO_ACCOUNT_SID=your-twilio-account-sid
# TWILIO_AUTH_TOKEN=your-twilio-auth-token
# TWILIO_PHONE_NUMBER=+1234567890
```

5. **Generate JWT Secret**:
   - Run this command in terminal:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   - Copy the output and use it for `JWT_SECRET`

6. **Deploy**:
   - Railway will automatically start deploying
   - Go to **Deployments** tab to view logs
   - Wait for "SUCCESS" status

7. **Get Backend URL**:
   - Go to **Settings** tab
   - Find **Domains** section
   - Copy the URL (looks like): `https://gk-general-store-api.up.railway.app`
   - **SAVE THIS URL** - you'll need it for Vercel

#### Step 4: Test Backend

Test these URLs in your browser:
- Health: `https://your-backend.railway.app/health`
- Categories: `https://your-backend.railway.app/categories`
- Products: `https://your-backend.railway.app/products`
- Ping: `https://your-backend.railway.app/ping`

Expected response for health:
```json
{
  "success": true,
  "message": "API is running",
  "env": "production",
  "timestamp": "2026-04-20T..."
}
```

---

### PART 2: Deploy Frontend to Vercel

#### Step 1: Prepare Environment

1. **Update Frontend .env.production**:
   - Open `.env.production` in project root
   - Update `VITE_API_URL` with your Railway backend URL:
   ```env
   VITE_API_URL=https://your-backend.railway.app/api
   ```
   - Keep Firebase config as is (already configured)

#### Step 2: Deploy to Vercel

**Option A: Using Vercel Dashboard (Recommended)**

1. Go to https://vercel.com
2. Click **Login** → Sign in with GitHub
3. Click **Add New...** → **Project**
4. Import your repository: `gkproject2`
5. Configure Project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (root, not api/)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

6. **Add Environment Variables**:
   - Click **Environment Variables**
   - Add the following:

   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | `https://your-backend.railway.app/api` |
   | `VITE_FIREBASE_API_KEY` | `AIzaSyBWbW_pfk9B-juxtH01Qqd7hNJW9G1of08` |
   | `VITE_FIREBASE_AUTH_DOMAIN` | `gk-store-a3365.firebaseapp.com` |
   | `VITE_FIREBASE_PROJECT_ID` | `gk-store-a3365` |
   | `VITE_FIREBASE_STORAGE_BUCKET` | `gk-store-a3365.firebasestorage.app` |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | `36277072139` |
   | `VITE_FIREBASE_APP_ID` | `1:36277072139:web:b48a7087adf487d032b20e` |
   | `VITE_DEV_MODE` | `false` |

7. Click **Deploy**
8. Wait for deployment to complete (~2-3 minutes)

**Option B: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy from project root
cd "d:\gkshop project"
vercel --prod
```

#### Step 3: Get Frontend URL

- After deployment, Vercel provides a URL like: `https://gk-general-store.vercel.app`
- You can also set a custom domain in Vercel settings

#### Step 4: Update Backend CORS

1. Go back to Railway dashboard
2. Open your backend service
3. Go to **Variables** tab
4. Update `FRONTEND_URL` with your Vercel URL:
   ```env
   FRONTEND_URL=https://your-app.vercel.app
   ```
5. Railway will automatically redeploy

---

## ✅ Verification Checklist

### Backend (Railway)
- [ ] Health endpoint returns 200: `/health`
- [ ] Categories endpoint returns data: `/categories`
- [ ] Products endpoint returns data: `/products`
- [ ] Environment variables are set correctly
- [ ] MongoDB is connected (check logs)
- [ ] CORS allows your Vercel domain

### Frontend (Vercel)
- [ ] Site loads without errors
- [ ] Categories display correctly
- [ ] Products display correctly
- [ ] User can signup/login
- [ ] Cart and checkout work
- [ ] No console errors about API calls

### Database (MongoDB Atlas)
- [ ] Connection string is correct
- [ ] IP whitelist includes 0.0.0.0/0
- [ ] Database user has read/write permissions

---

## 🔧 Troubleshooting

### Problem: "Failed to load resource: status code 500"

**Solution**:
1. Check Railway logs for errors
2. Verify `MONGODB_URI` is correct
3. Test backend directly: `curl https://your-backend.railway.app/health`

### Problem: "CORS error" in browser console

**Solution**:
1. Update `FRONTEND_URL` in Railway to match your Vercel URL
2. Ensure it starts with `https://` (no trailing slash)
3. Railway will redeploy automatically

### Problem: Products/categories not showing

**Solution**:
1. Check if `VITE_API_URL` is set correctly in Vercel
2. Verify it points to Railway backend (not localhost)
3. Check browser console for API errors
4. Test backend endpoints directly

### Problem: OTP not sending

**Solution**:
1. Verify Twilio credentials in Railway (if using SMS)
2. Check Railway logs for email errors
3. Verify Gmail App Password is correct

### Problem: MongoDB connection failed

**Solution**:
1. Check MongoDB Atlas IP whitelist (should be 0.0.0.0/0)
2. Verify username/password in connection string
3. Check Railway logs for detailed error
4. App will still work with fallback data if MongoDB fails

---

## 💰 Cost Estimate

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Hobby | FREE |
| Railway | Developer | $5/month (includes $5 credit) |
| MongoDB Atlas | M0 Shared | FREE (512MB) |
| Firebase | Spark | FREE |
| Twilio | Pay-per-use | ~$0.0075/SMS (optional) |

**Total**: ~$5/month (or FREE without SMS)

---

## 🔐 Security Checklist

- [ ] Never commit `.env` files to Git
- [ ] Use strong `JWT_SECRET` (64+ characters)
- [ ] Enable MongoDB IP whitelist (Railway IPs only if possible)
- [ ] Use HTTPS everywhere (automatic on Vercel/Railway)
- [ ] Rotate secrets regularly
- [ ] Enable 2FA on all accounts
- [ ] Use Gmail App Password (not regular password)

---

## 📊 Monitoring

### Railway Logs
- Dashboard → Your Service → Logs
- View real-time logs and errors

### Vercel Logs
- Dashboard → Your Project → Deployments
- Click on deployment → View logs

### MongoDB Atlas Monitoring
- Dashboard → Metrics
- View connection count, operations, storage

---

## 🎯 Next Steps

1. **Set up custom domains** (optional)
   - Vercel: Settings → Domains
   - Railway: Settings → Domains

2. **Enable automatic deployments**
   - Both platforms auto-deploy on git push to main

3. **Set up monitoring alerts**
   - Railway: Settings → Alerts
   - Vercel: Settings → Notifications

4. **Backup database**
   - MongoDB Atlas: Automated backups (paid)
   - Manual: mongodump weekly

---

## 📞 Support

If you encounter issues:
1. Check Railway logs: Dashboard → Logs
2. Check Vercel logs: Dashboard → Deployments
3. Test API endpoints directly
4. Review browser console for frontend errors

---

**Last Updated**: 2026-04-20  
**Status**: ✅ Ready for Production Deployment

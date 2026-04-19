# Production Deployment Guide

## 📋 Overview

This guide covers deploying your GK General Store application to production:
- **Frontend**: Vercel (React/Vite)
- **Backend**: Railway (Node.js/Express)
- **Database**: MongoDB Atlas (Optional)

---

## 🔍 Issues Fixed

### 1. **500 Error on /api/categories**
**Problem**: Backend crashed when MongoDB wasn't connected
**Fix**: Modified `database.ts` to gracefully handle missing MongoDB URI and continue with fallback data

### 2. **CORS Blocking Production Requests**
**Problem**: Backend only allowed localhost, blocking Vercel frontend
**Fix**: Added dynamic CORS configuration that allows:
- localhost (development)
- *.vercel.app (production frontend)
- Custom FRONTEND_URL from environment

### 3. **Hardcoded Localhost URLs**
**Problem**: Frontend API calls used hardcoded `/api` paths
**Fix**: All components now use `VITE_API_URL` environment variable

### 4. **No Separate Backend Deployment**
**Problem**: Backend and frontend mixed in single package.json
**Fix**: Created separate `api/package.json` for Railway deployment

### 5. **Database Connection Crashing App**
**Problem**: MongoDB connection failure threw error and crashed server
**Fix**: Connection now fails gracefully, app continues with fallback category/product data

---

## 🚀 Backend Deployment (Railway)

### Step 1: Prepare MongoDB Atlas (Optional but Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user
4. Get connection string: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/gkshop`
5. Whitelist IP: 0.0.0.0/0 (allow all IPs for Railway)

### Step 2: Deploy Backend to Railway

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository: `gkproject2`

3. **Configure Service**
   ```
   Service Name: gk-general-store-api
   Root Directory: api
   ```

4. **Add Environment Variables** (Railway Dashboard → Variables)
   ```env
   NODE_ENV=production
   PORT=3001
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/gkshop?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   JWT_EXPIRY=7d
   FRONTEND_URL=https://your-app.vercel.app
   TWILIO_ACCOUNT_SID=your-twilio-account-sid
   TWILIO_AUTH_TOKEN=your-twilio-auth-token
   TWILIO_PHONE_NUMBER=+1234567890
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-gmail-app-password
   OWNER_PHONE=owner-phone-number
   OWNER_PASSWORD=owner-password
   ```

   **Note**: `MONGODB_URI` is optional. Without it, the app uses fallback static data.

5. **Deploy**
   - Railway will automatically detect `api/package.json`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
   - Click "Deploy"

6. **Get Your Backend URL**
   - After deployment, Railway provides a URL like: `https://gk-general-store-api.up.railway.app`
   - Copy this URL for frontend configuration

### Step 3: Test Backend

Visit these URLs to verify:
- Health check: `https://your-backend.railway.app/api/health`
- Categories: `https://your-backend.railway.app/api/categories`
- Products: `https://your-backend.railway.app/api/products`
- Ping: `https://your-backend.railway.app/api/ping`

Expected response:
```json
{
  "success": true,
  "count": 14,
  "data": [...]
}
```

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Update Frontend Environment Variables

1. **Update `.env.production`** (already created)
   ```env
   VITE_API_URL=https://your-backend.railway.app/api
   VITE_FIREBASE_API_KEY=AIzaSyBWbW_pfk9B-juxtH01Qqd7hNJW9G1of08
   VITE_FIREBASE_AUTH_DOMAIN=gk-store-a3365.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=gk-store-a3365
   VITE_FIREBASE_STORAGE_BUCKET=gk-store-a3365.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=36277072139
   VITE_FIREBASE_APP_ID=1:36277072139:web:b48a7087adf487d032b20e
   VITE_DEV_MODE=false
   ```

   **Important**: Replace `https://your-backend.railway.app/api` with your actual Railway URL

### Step 2: Deploy to Vercel

1. **Install Vercel CLI** (if not installed)
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd "d:\gkshop project"
   vercel --prod
   ```

   OR use Vercel Dashboard:
   - Go to https://vercel.com
   - Click "Add New..." → "Project"
   - Import your GitHub repository: `gkproject2`
   - Framework Preset: Vite
   - Root Directory: `./` (root)

4. **Add Environment Variables** (Vercel Dashboard → Settings → Environment Variables)
   ```env
   VITE_API_URL=https://your-backend.railway.app/api
   VITE_FIREBASE_API_KEY=AIzaSyBWbW_pfk9B-juxtH01Qqd7hNJW9G1of08
   VITE_FIREBASE_AUTH_DOMAIN=gk-store-a3365.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=gk-store-a3365
   VITE_FIREBASE_STORAGE_BUCKET=gk-store-a3365.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=36277072139
   VITE_FIREBASE_APP_ID=1:36277072139:web:b48a7087adf487d032b20e
   VITE_DEV_MODE=false
   ```

5. **Redeploy** after adding environment variables
   ```bash
   vercel --prod
   ```

### Step 3: Update Backend CORS

After Vercel deployment, update the `FRONTEND_URL` in Railway:
```env
FRONTEND_URL=https://your-app.vercel.app
```

Railway will automatically redeploy with the new CORS setting.

---

## ✅ Verification Checklist

### Backend (Railway)
- [ ] Health endpoint returns 200: `/api/health`
- [ ] Categories endpoint returns data: `/api/categories`
- [ ] Products endpoint returns data: `/api/products`
- [ ] CORS allows your Vercel domain
- [ ] Environment variables are set correctly

### Frontend (Vercel)
- [ ] Site loads without errors
- [ ] Categories display correctly
- [ ] Products display correctly
- [ ] User can signup/login
- [ ] Cart and checkout work
- [ ] Owner dashboard accessible

### Database (MongoDB Atlas) - Optional
- [ ] Connection string is correct
- [ ] IP whitelist includes 0.0.0.0/0
- [ ] Database user has read/write permissions

---

## 🔧 Troubleshooting

### Problem: "Failed to load resource: status code 500"
**Solution**: 
1. Check Railway logs for errors
2. Verify `MONGODB_URI` is correct (or remove it to use fallback)
3. Test backend directly: `curl https://your-backend.railway.app/api/categories`

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
1. Verify Twilio credentials in Railway
2. Check Railway logs for SMS errors
3. In development mode, OTP shows in console/logs

### Problem: Email not sending
**Solution**:
1. Use Gmail App Password (not regular password)
2. Enable 2FA on Gmail first
3. Generate App Password: https://myaccount.google.com/apppasswords

---

## 📊 Architecture

```
┌─────────────────┐
│   Vercel        │
│   (Frontend)    │
│   React/Vite    │
└────────┬────────┘
         │
         │ VITE_API_URL
         │ https://your-backend.railway.app/api
         ▼
┌─────────────────┐
│   Railway       │
│   (Backend)     │
│   Express API   │
└────────┬────────┘
         │
         │ MONGODB_URI
         ▼
┌─────────────────┐
│   MongoDB Atlas │
│   (Database)    │
│   Optional      │
└─────────────────┘
```

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use strong JWT_SECRET** - Generate with: `openssl rand -hex 32`
3. **Enable MongoDB IP whitelist** - Only allow Railway IPs
4. **Use HTTPS everywhere** - Vercel and Railway provide this automatically
5. **Rotate secrets regularly** - Especially JWT_SECRET and database passwords
6. **Enable Railway deploy protections** - Require manual approval for production

---

## 💰 Cost Estimate

- **Vercel**: Free (Hobby tier)
- **Railway**: $5/month (Developer tier, includes $5 credit)
- **MongoDB Atlas**: Free (M0 Shared Cluster - 512MB)
- **Twilio**: Pay-per-use (~$0.0075/SMS)
- **Firebase**: Free (Spark plan)

**Total**: ~$5-10/month depending on usage

---

## 🎯 Next Steps After Deployment

1. **Set up custom domain** (optional)
   - Vercel: Settings → Domains → Add your domain
   - Railway: Settings → Domains → Add custom domain

2. **Enable monitoring**
   - Railway: Built-in logs and metrics
   - Vercel: Analytics dashboard

3. **Set up CI/CD**
   - Both platforms auto-deploy on git push to main branch

4. **Backup database**
   - MongoDB Atlas: Automated backups (paid feature)
   - Manual: mongodump weekly

---

## 📞 Support

If you encounter issues:
1. Check Railway logs: Dashboard → Logs
2. Check Vercel logs: Dashboard → Deployments → View logs
3. Test API endpoints directly with curl or Postman
4. Review browser console for frontend errors

---

**Last Updated**: 2026-04-19
**Version**: 1.0.0

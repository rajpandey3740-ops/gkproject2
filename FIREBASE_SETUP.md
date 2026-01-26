# Firebase Authentication Setup Guide

This guide will help you set up Firebase Authentication for phone number OTP verification.

## Prerequisites

- A Google account
- A Firebase project

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: `GK General Store` (or your preferred name)
4. Disable Google Analytics (optional) or enable it
5. Click **"Create project"**
6. Wait for project creation to complete

## Step 2: Enable Phone Authentication

1. In Firebase Console, go to **Authentication**
2. Click **"Get started"** if you haven't set up Authentication
3. Go to **"Sign-in method"** tab
4. Click on **"Phone"** provider
5. Enable it by toggling the switch
6. Click **"Save"**

## Step 3: Get Web App Configuration

1. In Firebase Console, click the gear icon ⚙️ next to "Project Overview"
2. Select **"Project settings"**
3. Scroll down to **"Your apps"** section
4. Click the **Web icon** `</>` to add a web app
5. Register your app (nickname: "GK General Store Web")
6. Copy the **Firebase configuration object**

It will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## Step 4: Get Service Account (for Backend)

1. In Firebase Console, go to **Project settings**
2. Go to **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Download the JSON file (keep it secure!)
5. Copy the contents of this JSON file

## Step 5: Configure Environment Variables

### Frontend Configuration

Create or update your `.env` file in the project root:

```env
# Firebase Web App Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### Backend Configuration

Add to your `.env` file:

```env
# Firebase Admin SDK Configuration
# Option 1: Service Account JSON (recommended)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}

# Option 2: Individual credentials
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

**Important Notes:**
- For `FIREBASE_SERVICE_ACCOUNT`: Paste the entire JSON content as a single line string
- For `FIREBASE_PRIVATE_KEY`: Keep the `\n` characters in the key
- Never commit `.env` file to Git (already in .gitignore)

## Step 6: Configure reCAPTCHA (Automatic)

Firebase automatically handles reCAPTCHA for phone authentication. No additional setup needed!

## Step 7: Test Phone Authentication

1. **Restart your servers:**
   ```bash
   # Backend
   npm run server
   
   # Frontend (in another terminal)
   npm run dev
   ```

2. **Test the flow:**
   - Go to http://localhost:3000/login
   - Enter your phone number
   - You should receive an OTP via SMS
   - Enter the OTP to verify

## Troubleshooting

### "Firebase not configured" warning

- Check that all `VITE_FIREBASE_*` variables are set in `.env`
- Make sure variables start with `VITE_` for Vite to pick them up
- Restart the frontend dev server after changing `.env`

### "Firebase Admin not initialized" error

- Verify `FIREBASE_SERVICE_ACCOUNT` or individual credentials are set
- Check that the JSON is valid (if using service account)
- Ensure private key has `\n` characters preserved

### OTP not received

- Check Firebase Console → Authentication → Sign-in method → Phone
- Verify phone authentication is enabled
- Check your phone number format (should include country code)
- For testing, Firebase may use test phone numbers

### reCAPTCHA issues

- Make sure you're testing on `localhost` or a verified domain
- Check browser console for reCAPTCHA errors
- Try in incognito mode to clear cache

## Firebase Console Features

### View Authentication Logs
- Go to Authentication → Users
- See all authenticated users
- View phone numbers (masked for privacy)

### Test Phone Numbers
- Firebase allows test phone numbers for development
- Go to Authentication → Sign-in method → Phone → Phone numbers for testing
- Add test numbers with test OTPs

### Quotas and Limits
- Free tier: 10K phone authentications/month
- Check usage in Firebase Console → Usage and billing

## Security Best Practices

1. **Never expose Firebase credentials:**
   - Keep `.env` file secure
   - Don't commit credentials to Git
   - Use environment variables in production

2. **Enable App Check (Production):**
   - Go to Firebase Console → App Check
   - Protect your app from abuse

3. **Set up Security Rules:**
   - Configure Firestore/Realtime Database rules
   - Restrict access based on authentication

## Cost Information

- **Free Tier:** 10,000 phone authentications/month
- **Paid Tier:** $0.06 per verification after free tier
- **No credit card required** for free tier

## Next Steps

1. ✅ Set up Firebase project
2. ✅ Enable phone authentication
3. ✅ Configure environment variables
4. ✅ Test authentication flow
5. 🚀 Deploy to production!

## Support

- Firebase Documentation: https://firebase.google.com/docs/auth
- Firebase Support: https://firebase.google.com/support

---

**Your Firebase Authentication is now ready! 🎉**




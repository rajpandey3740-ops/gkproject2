# Environment Variables Setup

Create a `.env` file in the project root with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration (optional)
MONGODB_URI=mongodb://localhost:27017/gkshop

# JWT Secret (change this in production!)
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRY=7d

# Twilio SMS Configuration (Optional - if not using Firebase)
# Get these from https://console.twilio.com/
SMS_ENABLED=false
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Firebase Configuration (Recommended for Production)
# Get these from https://console.firebase.google.com/
# Frontend Config
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Backend Config (Service Account JSON as string)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}
# OR use individual credentials:
# FIREBASE_PROJECT_ID=your-project-id
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
# FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

## Quick Setup Options

### Option 1: Firebase (Recommended)
1. Create Firebase project at https://console.firebase.google.com/
2. Enable Phone Authentication
3. Get Web app config and Service Account
4. Add to `.env` file (see FIREBASE_SETUP.md for details)
5. Restart servers

### Option 2: Twilio SMS
1. Sign up at https://www.twilio.com/
2. Get your Account SID and Auth Token
3. Get a phone number from Twilio
4. Update the `.env` file:
   - Set `SMS_ENABLED=true`
   - Add your Twilio credentials
5. Restart your server

### Option 3: Development Mode (No Setup)
If you don't set up Firebase or Twilio, the system will:
- Log OTPs to the console
- Still work for testing
- Show OTP in API response (development only)

This is perfect for development and testing!


const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
const serviceAccount = {
  type: "service_account",
  project_id: process.env.VITE_FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
};

if (!process.env.VITE_FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY || !process.env.FIREBASE_CLIENT_EMAIL) {
  console.log('Firebase service account not configured. Please set FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL in .env file');
  console.log('You can get these from Firebase Console > Project Settings > Service Accounts > Generate new private key');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: process.env.VITE_FIREBASE_PROJECT_ID
});

async function clearAllFirebaseUsers() {
  try {
    console.log('Fetching all Firebase users...');
    
    const users = [];
    let nextPageToken;
    
    // List all users
    do {
      const result = await admin.auth().listUsers(1000, nextPageToken);
      users.push(...result.users);
      nextPageToken = result.pageToken;
    } while (nextPageToken);
    
    console.log(`Found ${users.length} users in Firebase Auth`);
    
    if (users.length === 0) {
      console.log('No users to delete');
      return;
    }
    
    // Delete all users
    const uidList = users.map(user => user.uid);
    await admin.auth().deleteUsers(uidList);
    
    console.log(`Successfully deleted ${uidList.length} users from Firebase Auth`);
    
  } catch (error) {
    console.error('Error clearing Firebase users:', error.message);
  } finally {
    await admin.app().delete();
  }
}

clearAllFirebaseUsers();
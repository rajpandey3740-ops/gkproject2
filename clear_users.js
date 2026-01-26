require('dotenv').config();
const mongoose = require('mongoose');
const UserModel = require('./api/models/UserModel').default;

async function clearUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const result = await UserModel.deleteMany({});
    console.log(`Deleted ${result.deletedCount} users from the database`);
    
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error clearing users:', error);
  }
}

clearUsers();
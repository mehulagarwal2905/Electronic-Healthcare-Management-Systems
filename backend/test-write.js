import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Prescription from './models/Prescription.js';

dotenv.config();

async function testWrite() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB!');
    
    // Generate a unique test email
    const uniqueId = Date.now();
    const testEmail = `test-user-${uniqueId}@example.com`;
    
    console.log(`Creating test user with email: ${testEmail}`);
    
    // Test user creation
    const testUser = new User({
      firstName: 'Test',
      lastName: 'User',
      email: testEmail,
      password: 'password123',
      role: 'patient'
    });
    
    // Save without using .create() to see if there's a difference
    const savedUser = await testUser.save();
    console.log('User saved successfully:', savedUser._id);
    
    // Verify user was saved
    const foundUser = await User.findOne({ email: testEmail });
    if (foundUser) {
      console.log('User found in database:', foundUser._id);
    } else {
      console.log('ERROR: User was not found after saving!');
    }
    
    // Clean up - remove test user
    await User.deleteOne({ email: testEmail });
    console.log('Test user removed from database');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testWrite();

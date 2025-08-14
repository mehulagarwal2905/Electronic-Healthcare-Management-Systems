import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function checkUsers() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB!');
    
    console.log('\n--- All Users in Database ---');
    const users = await User.find({}).lean();
    
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      console.log(`Found ${users.length} users:`);
      users.forEach((user, index) => {
        console.log(`\nUser ${index + 1}:`);
        console.log(`ID: ${user._id}`);
        console.log(`Name: ${user.firstName} ${user.lastName}`);
        console.log(`Email: ${user.email}`);
        console.log(`Role: ${user.role}`);
        console.log(`Created At: ${user.createdAt}`);
        console.log(`My Doctors: ${user.myDoctors.length}`);
        console.log(`My Patients: ${user.myPatients.length}`);
      });
    }
    
    // Check for the specific email
    const specificEmail = 'raj@gmail.com';
    console.log(`\n--- Checking for email: ${specificEmail} ---`);
    const specificUser = await User.findOne({ email: specificEmail }).lean();
    
    if (specificUser) {
      console.log('Email found in database:');
      console.log(`ID: ${specificUser._id}`);
      console.log(`Name: ${specificUser.firstName} ${specificUser.lastName}`);
      console.log(`Role: ${specificUser.role}`);
      console.log(`Created At: ${specificUser.createdAt}`);
    } else {
      console.log('Email not found in database.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();

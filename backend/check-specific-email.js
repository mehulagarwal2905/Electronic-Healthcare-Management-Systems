import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function checkSpecificEmail() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB!');
    
    const emailToCheck = 'raj@gmail.com';
    console.log(`\nChecking for exact email: "${emailToCheck}"`);
    
    // Check for exact match
    const exactMatch = await User.findOne({ email: emailToCheck }).lean();
    if (exactMatch) {
      console.log('FOUND EXACT MATCH:');
      console.log(`ID: ${exactMatch._id}`);
      console.log(`Name: ${exactMatch.firstName} ${exactMatch.lastName}`);
      console.log(`Email: ${exactMatch.email}`);
      console.log(`Role: ${exactMatch.role}`);
    } else {
      console.log('No exact match found.');
    }
    
    // Check for case-insensitive match
    console.log('\nChecking for case-insensitive match:');
    const regexMatch = await User.findOne({ 
      email: { $regex: new RegExp('^' + emailToCheck + '$', 'i') } 
    }).lean();
    
    if (regexMatch) {
      console.log('FOUND CASE-INSENSITIVE MATCH:');
      console.log(`ID: ${regexMatch._id}`);
      console.log(`Name: ${regexMatch.firstName} ${regexMatch.lastName}`);
      console.log(`Email: ${regexMatch.email}`);
      console.log(`Role: ${regexMatch.role}`);
    } else {
      console.log('No case-insensitive match found.');
    }
    
    // List all emails for comparison
    console.log('\nAll emails in the database:');
    const allEmails = await User.find({}, 'email').lean();
    allEmails.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkSpecificEmail();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Prescription from '../models/Prescription.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB successfully');
    
    try {
      // Check users collection
      const userCount = await User.countDocuments();
      console.log(`\nUsers collection: ${userCount} documents`);
      
      if (userCount > 0) {
        const users = await User.find({}).limit(5);
        console.log('Sample users:');
        users.forEach(user => {
          console.log(`- ${user.firstName} ${user.lastName} (${user.email}), Role: ${user.role}`);
        });
      } else {
        console.log('No users found in the database');
      }
      
      // Check prescriptions collection
      const prescriptionCount = await Prescription.countDocuments();
      console.log(`\nPrescriptions collection: ${prescriptionCount} documents`);
      
      if (prescriptionCount > 0) {
        const prescriptions = await Prescription.find({}).limit(5);
        console.log('Sample prescriptions:');
        prescriptions.forEach(prescription => {
          console.log(`- Medication: ${prescription.medication}, Dosage: ${prescription.dosage}`);
        });
      } else {
        console.log('No prescriptions found in the database');
      }
      
      // Check database collections directly
      const db = mongoose.connection.db;
      const collections = await db.listCollections().toArray();
      
      console.log('\nAll collections in database:');
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`- ${collection.name}: ${count} documents`);
      }
      
    } catch (error) {
      console.error('Error checking database:', error);
    } finally {
      // Close the connection
      await mongoose.connection.close();
      console.log('\nConnection closed');
      process.exit(0);
    }
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

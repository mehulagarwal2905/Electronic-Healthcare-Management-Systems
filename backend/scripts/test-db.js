import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Prescription from '../models/Prescription.js';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Test database operations
const testDB = async () => {
  try {
    // Connect to the database
    const conn = await connectDB();
    
    console.log('Testing database operations...');
    
    // 1. Check if we can read data
    console.log('\n--- Testing Read Operations ---');
    const users = await User.find({}).limit(5);
    console.log(`Found ${users.length} users`);
    if (users.length > 0) {
      users.forEach(user => {
        console.log(`- ${user.firstName} ${user.lastName} (${user.email}), Role: ${user.role}`);
      });
    }
    
    const prescriptions = await Prescription.find({}).limit(5);
    console.log(`\nFound ${prescriptions.length} prescriptions`);
    if (prescriptions.length > 0) {
      prescriptions.forEach(prescription => {
        console.log(`- Medication: ${prescription.medication}, Dosage: ${prescription.dosage}`);
      });
    }
    
    // 2. Test creating a new prescription
    console.log('\n--- Testing Write Operations ---');
    
    // Find a doctor and patient for our test
    const doctor = await User.findOne({ role: 'doctor' });
    const patient = await User.findOne({ role: 'patient' });
    
    if (doctor && patient) {
      console.log(`Using doctor: ${doctor.email} and patient: ${patient.email}`);
      
      // Create a test prescription
      const testPrescription = new Prescription({
        patient: patient._id,
        doctor: doctor._id,
        medication: 'Test Medication',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '7 days',
        instructions: 'Test instructions',
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      });
      
      // Save the prescription
      const savedPrescription = await testPrescription.save();
      console.log('Test prescription created successfully:');
      console.log(savedPrescription);
      
      // Update the doctor's myPatients list if patient not already in the list
      if (!doctor.myPatients.includes(patient._id)) {
        doctor.myPatients.push(patient._id);
        await doctor.save();
        console.log('Updated doctor\'s patient list');
      }
      
      // Update the patient's myDoctors list if doctor not already in the list
      if (!patient.myDoctors.includes(doctor._id)) {
        patient.myDoctors.push(doctor._id);
        await patient.save();
        console.log('Updated patient\'s doctor list');
      }
      
      // Verify the prescription was saved
      const verifyPrescription = await Prescription.findById(savedPrescription._id);
      if (verifyPrescription) {
        console.log('Successfully verified prescription in database');
      } else {
        console.log('Failed to verify prescription in database');
      }
    } else {
      console.log('Could not find a doctor and patient for testing');
    }
    
    console.log('\nDatabase test completed');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error testing database:', error);
  }
};

// Run the test
testDB();

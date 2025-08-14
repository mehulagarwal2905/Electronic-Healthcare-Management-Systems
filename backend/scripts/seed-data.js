import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Prescription from '../models/Prescription.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

// Create sample users and prescriptions
const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Prescription.deleteMany({});
    console.log('Data cleared');

    // Create doctors
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);

    const doctor1 = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'doctor1@example.com',
      password: hashedPassword,
      role: 'doctor'
    });

    const doctor2 = await User.create({
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'doctor2@example.com',
      password: hashedPassword,
      role: 'doctor'
    });

    console.log('Doctors created');

    // Create patients
    const patient1 = await User.create({
      firstName: 'Michael',
      lastName: 'Smith',
      email: 'patient1@example.com',
      password: hashedPassword,
      role: 'patient'
    });

    const patient2 = await User.create({
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'patient2@example.com',
      password: hashedPassword,
      role: 'patient'
    });

    const patient3 = await User.create({
      firstName: 'Robert',
      lastName: 'Wilson',
      email: 'patient3@example.com',
      password: hashedPassword,
      role: 'patient'
    });

    console.log('Patients created');

    // Create prescriptions
    const oneWeekFromNow = new Date();
    oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

    const prescription1 = await Prescription.create({
      patient: patient1._id,
      doctor: doctor1._id,
      medication: 'Amoxicillin',
      dosage: '500mg',
      frequency: 'Twice daily',
      duration: '7 days',
      instructions: 'Take with food',
      expiryDate: oneWeekFromNow
    });

    const prescription2 = await Prescription.create({
      patient: patient2._id,
      doctor: doctor1._id,
      medication: 'Ibuprofen',
      dosage: '400mg',
      frequency: 'Three times daily',
      duration: '5 days',
      instructions: 'Take after meals',
      expiryDate: oneWeekFromNow
    });

    const prescription3 = await Prescription.create({
      patient: patient1._id,
      doctor: doctor2._id,
      medication: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      duration: '30 days',
      instructions: 'Take in the morning',
      expiryDate: twoWeeksFromNow
    });

    const prescription4 = await Prescription.create({
      patient: patient3._id,
      doctor: doctor2._id,
      medication: 'Metformin',
      dosage: '850mg',
      frequency: 'Twice daily',
      duration: '30 days',
      instructions: 'Take with meals',
      expiryDate: twoWeeksFromNow
    });

    console.log('Prescriptions created');

    // Update relationships - Doctor 1
    doctor1.myPatients = [patient1._id, patient2._id];
    await doctor1.save();

    // Update relationships - Doctor 2
    doctor2.myPatients = [patient1._id, patient3._id];
    await doctor2.save();

    // Update relationships - Patient 1
    patient1.myDoctors = [doctor1._id, doctor2._id];
    await patient1.save();

    // Update relationships - Patient 2
    patient2.myDoctors = [doctor1._id];
    await patient2.save();

    // Update relationships - Patient 3
    patient3.myDoctors = [doctor2._id];
    await patient3.save();

    console.log('Relationships updated');

    console.log('Data seeded successfully!');
    console.log(`
    Created:
    - 2 Doctors (email: doctor1@example.com, doctor2@example.com)
    - 3 Patients (email: patient1@example.com, patient2@example.com, patient3@example.com)
    - 4 Prescriptions
    - All passwords are: 123456
    `);

    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData();

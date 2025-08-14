// Simple script to check MongoDB Atlas data
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './backend/.env' });

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function checkData() {
  try {
    await client.connect();
    console.log('Connected to MongoDB Atlas');
    
    const db = client.db('ehms');
    
    // Check users collection
    const usersCount = await db.collection('users').countDocuments();
    console.log(`Users count: ${usersCount}`);
    
    if (usersCount > 0) {
      const users = await db.collection('users').find({}).limit(3).toArray();
      console.log('Sample users:');
      users.forEach(user => {
        console.log(`- ${user.firstName} ${user.lastName} (${user.email}), Role: ${user.role}`);
      });
    }
    
    // Check prescriptions collection
    const prescriptionsCount = await db.collection('prescriptions').countDocuments();
    console.log(`\nPrescriptions count: ${prescriptionsCount}`);
    
    if (prescriptionsCount > 0) {
      const prescriptions = await db.collection('prescriptions').find({}).limit(3).toArray();
      console.log('Sample prescriptions:');
      prescriptions.forEach(prescription => {
        console.log(`- Medication: ${prescription.medication}, Dosage: ${prescription.dosage}`);
        console.log(`  Doctor ID: ${prescription.doctor}, Patient ID: ${prescription.patient}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

checkData();

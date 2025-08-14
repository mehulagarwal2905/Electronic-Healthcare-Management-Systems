const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// __dirname is already available in CommonJS

// Load environment variables from backend/.env
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

// MongoDB connection string
const uri = process.env.MONGO_URI;

async function main() {
  console.log('Connecting to MongoDB Atlas...');
  console.log(`Connection string: ${uri}`);
  
  const client = new MongoClient(uri);

  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log('Connected successfully to MongoDB Atlas');

    // List all databases
    const databasesList = await client.db().admin().listDatabases();
    console.log('Databases:');
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));

    // Connect to the ehms database
    const db = client.db('ehms');
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\nCollections in ehms database:');
    collections.forEach(collection => console.log(` - ${collection.name}`));

    // Check for prescriptions collection
    if (collections.some(collection => collection.name === 'prescriptions')) {
      // Get all prescriptions
      const prescriptions = await db.collection('prescriptions').find({}).toArray();
      console.log(`\nFound ${prescriptions.length} prescriptions:`);
      prescriptions.forEach((prescription, index) => {
        console.log(`\nPrescription ${index + 1}:`);
        console.log(` - Patient: ${prescription.patient}`);
        console.log(` - Doctor: ${prescription.doctor}`);
        console.log(` - Medication: ${prescription.medication}`);
        console.log(` - Issued: ${prescription.issuedDate}`);
      });
    } else {
      console.log('\nNo prescriptions collection found.');
    }

  } catch (e) {
    console.error('Error connecting to MongoDB Atlas:', e);
  } finally {
    // Close the connection
    await client.close();
    console.log('Connection closed');
  }
}

main().catch(console.error);

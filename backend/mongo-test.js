import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  try {
    console.log('Connecting to MongoDB with URI:', process.env.MONGO_URI);
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('Connected to MongoDB!');
    console.log('Database Name:', conn.connection.db.databaseName);
    
    // Test a simple insert
    const testDoc = await conn.connection.db.collection('test').insertOne({
      test: 'connection',
      timestamp: new Date()
    });
    
    console.log('Inserted test document:', testDoc.insertedId);
    
    // Verify the insert
    const foundDoc = await conn.connection.db.collection('test').findOne({
      _id: testDoc.insertedId
    });
    
    console.log('Found document:', foundDoc);
    
    process.exit(0);
  } catch (error) {
    console.error('Connection Error:', error);
    process.exit(1);
  }
}

testConnection();

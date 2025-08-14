const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './backend/.env' });

const app = express();
const port = 3500; // Using a different port than your main application

// MongoDB connection string from .env
const uri = process.env.MONGO_URI;

app.get('/', (req, res) => {
  res.send(`
    <h1>MongoDB Connection Test</h1>
    <p>Click the button below to test your MongoDB connection:</p>
    <button id="testButton">Test Connection</button>
    <div id="results" style="margin-top: 20px; white-space: pre-wrap;"></div>
    
    <script>
      document.getElementById('testButton').addEventListener('click', async () => {
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = 'Testing connection...';
        
        try {
          const response = await fetch('/test-connection');
          const data = await response.json();
          
          resultsDiv.innerHTML = JSON.stringify(data, null, 2);
        } catch (error) {
          resultsDiv.innerHTML = 'Error: ' + error.message;
        }
      });
    </script>
  `);
});

app.get('/test-connection', async (req, res) => {
  const client = new MongoClient(uri);
  const results = {
    connection: false,
    databases: [],
    collections: [],
    prescriptions: []
  };

  try {
    // Connect to the MongoDB cluster
    await client.connect();
    results.connection = true;
    console.log('Connected successfully to MongoDB Atlas');

    // List all databases
    const databasesList = await client.db().admin().listDatabases();
    results.databases = databasesList.databases.map(db => db.name);
    
    // Connect to the ehms database
    const db = client.db('ehms');
    
    // List all collections
    const collections = await db.listCollections().toArray();
    results.collections = collections.map(collection => collection.name);

    // Check for prescriptions collection
    if (collections.some(collection => collection.name === 'prescriptions')) {
      // Get all prescriptions
      const prescriptions = await db.collection('prescriptions').find({}).toArray();
      results.prescriptions = prescriptions;
    }

    res.json(results);
  } catch (e) {
    console.error('Error connecting to MongoDB Atlas:', e);
    res.status(500).json({ 
      error: e.message,
      connectionString: uri.replace(/mongodb\+srv:\/\/([^:]+):[^@]+@/, 'mongodb+srv://$1:****@')
    });
  } finally {
    // Close the connection
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Test server running at http://localhost:${port}`);
});

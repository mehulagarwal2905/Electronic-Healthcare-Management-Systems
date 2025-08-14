import express from 'express';
import User from '../models/User.js';
import mongoose from 'mongoose';

const router = express.Router();

// Test route to verify database operations
router.get('/test-db', async (req, res) => {
  try {
    // Verify connection
    const db = mongoose.connection;
    if (db.readyState !== 1) {
      return res.status(500).json({ message: 'MongoDB not connected', readyState: db.readyState });
    }

    // Test insert
    const testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      role: 'patient'
    });

    // Test query
    const users = await User.find({});
    
    res.json({
      connectionStatus: 'active',
      insertedUser: testUser,
      totalUsers: users.length,
      database: db.db.databaseName
    });
  } catch (error) {
    console.error('Test Error:', error);
    res.status(500).json({ 
      message: 'Database test failed',
      error: error.message 
    });
  }
});

export default router;

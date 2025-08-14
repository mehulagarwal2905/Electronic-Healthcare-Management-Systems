import express from 'express';
import User from '../models/User.js';
import Prescription from '../models/Prescription.js';

const router = express.Router();

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all prescriptions
router.get('/prescriptions', async (req, res) => {
  try {
    const prescriptions = await Prescription.find({}).populate('doctor patient');
    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get database stats
router.get('/stats', async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const doctorCount = await User.countDocuments({ role: 'doctor' });
    const patientCount = await User.countDocuments({ role: 'patient' });
    const prescriptionCount = await Prescription.countDocuments();
    
    res.json({
      collections: {
        users: userCount,
        doctors: doctorCount,
        patients: patientCount,
        prescriptions: prescriptionCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

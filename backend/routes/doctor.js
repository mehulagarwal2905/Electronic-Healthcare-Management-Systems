import express from 'express';
import { getMyPatients, getPatientDetails } from '../controllers/doctor.js';
import { protect, doctor } from '../middleware/auth.js';

const router = express.Router();

// Routes for doctors
router.get('/patients', protect, doctor, getMyPatients);
router.get('/patients/:id', protect, doctor, getPatientDetails);

export default router;

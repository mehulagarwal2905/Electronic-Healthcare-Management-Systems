import express from 'express';
import { getMyDoctors, getDoctorDetails, findPatientByEmail } from '../controllers/patient.js';
import { protect, patient, doctor } from '../middleware/auth.js';

const router = express.Router();

// Routes for patients
router.get('/doctors', protect, patient, getMyDoctors);
router.get('/doctors/:id', protect, patient, getDoctorDetails);

// Route for doctors to find patients
router.get('/find', protect, findPatientByEmail);

export default router;

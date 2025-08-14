import express from 'express';
import { 
  createPrescription, 
  getMyPrescriptions, 
  getPrescriptionsByDoctor, 
  getPrescriptionById 
} from '../controllers/prescription.js';
import { protect, doctor, patient } from '../middleware/auth.js';
import { ensureOwnPrescription } from '../middleware/doctorAuth.js';

const router = express.Router();

// Routes for prescriptions
router.post('/', protect, doctor, createPrescription);
router.get('/patient', protect, patient, getMyPrescriptions);
router.get('/doctor', protect, doctor, getPrescriptionsByDoctor);
router.get('/:id', protect, ensureOwnPrescription, getPrescriptionById);

export default router;

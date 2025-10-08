import express from 'express';
import multer from 'multer';
import { 
  createPrescription, 
  getMyPrescriptions, 
  getPrescriptionsByDoctor, 
  getPrescriptionById,
  processPrescriptionOCR,
  createPrescriptionFromOCR
} from '../controllers/prescription.js';
import { protect, doctor, patient } from '../middleware/auth.js';
import { ensureOwnPrescription } from '../middleware/doctorAuth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Routes for prescriptions
router.post('/', protect, doctor, createPrescription);
router.post('/ocr', protect, doctor, upload.single('image'), processPrescriptionOCR);
router.post('/from-ocr', protect, doctor, createPrescriptionFromOCR);
router.get('/patient', protect, patient, getMyPrescriptions);
router.get('/doctor', protect, doctor, getPrescriptionsByDoctor);
router.get('/:id', protect, ensureOwnPrescription, getPrescriptionById);

export default router;

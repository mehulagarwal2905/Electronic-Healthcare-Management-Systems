import mongoose from 'mongoose';

const PrescriptionSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  medication: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  instructions: {
    type: String
  },
  issuedDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: true
  },
  nextVisitDate: {
    type: Date,
    required: true
  },
  // OCR-related fields
  ocrData: {
    extractedData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    confidenceScores: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    overallConfidence: {
      type: Number,
      default: 0
    },
    needsReview: {
      type: Boolean,
      default: false
    },
    rawOutput: {
      type: String,
      default: ''
    },
    imagePath: {
      type: String,
      default: ''
    },
    processedAt: {
      type: Date,
      default: Date.now
    }
  },
  // Source of prescription data
  source: {
    type: String,
    enum: ['manual', 'ocr', 'imported'],
    default: 'manual'
  }
});

const Prescription = mongoose.model('Prescription', PrescriptionSchema);

export default Prescription;

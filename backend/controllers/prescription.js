import Prescription from '../models/Prescription.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import FormData from 'form-data';
import fs from 'fs';
import axios from 'axios';
import sharp from 'sharp';

// @desc    Create a new prescription
// @route   POST /api/prescriptions
// @access  Private/Doctor
const createPrescription = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // Verify MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB connection not established');
    }

    const {
      patientId,
      medication,
      dosage,
      frequency,
      duration,
      instructions,
      expiryDate,
      nextVisitDate
    } = req.body;

    const doctorId = req.user._id;

    // Verify patient exists and is a patient
    const patient = await User.findById(patientId).session(session);
    if (!patient || patient.role !== 'patient') {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Verify doctor exists and is a doctor
    const doctor = await User.findById(doctorId).session(session);
    if (!doctor || doctor.role !== 'doctor') {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Doctor not authorized' });
    }

    // Log the incoming data
    console.log('Creating prescription with data:', {
      patientId,
      doctorId,
      medication,
      dosage,
      frequency,
      duration,
      instructions,
      expiryDate,
      nextVisitDate
    });

    // Create prescription with proper date handling
    const prescriptionData = {
      patient: patientId,
      doctor: doctorId,
      medication,
      dosage,
      frequency,
      duration,
      instructions,
      expiryDate: new Date(expiryDate),
      nextVisitDate: new Date(nextVisitDate)
    };
    
    console.log('Processed prescription data:', JSON.stringify(prescriptionData, null, 2));
    
    const prescription = await Prescription.create([prescriptionData], { session });
    
    // Verify the created document
    const savedPrescription = await Prescription.findById(prescription[0]._id).session(session);
    console.log('Saved prescription from DB:', JSON.stringify(savedPrescription, null, 2));

    // Update doctor-patient relationships
    if (!doctor.myPatients.includes(patientId)) {
      doctor.myPatients.push(patientId);
      await doctor.save({ session });
    }

    if (!patient.myDoctors.includes(doctorId)) {
      patient.myDoctors.push(doctorId);
      await patient.save({ session });
    }

    await session.commitTransaction();
    
    res.status(201).json({
      _id: prescription[0]._id,
      patient: prescription[0].patient,
      doctor: prescription[0].doctor,
      medication: prescription[0].medication,
      dosage: prescription[0].dosage,
      frequency: prescription[0].frequency,
      duration: prescription[0].duration,
      issuedDate: prescription[0].issuedDate,
      nextVisitDate: prescription[0].nextVisitDate
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Prescription Creation Error:', error);
    res.status(500).json({ 
      message: 'Failed to create prescription',
      error: error.message 
    });
  } finally {
    session.endSession();
  }
};

// @desc    Get prescriptions for a patient
// @route   GET /api/prescriptions/patient
// @access  Private/Patient
const getMyPrescriptions = async (req, res) => {
  try {
    console.log('Patient ID requesting prescriptions:', req.user._id);
    
    const prescriptions = await Prescription.find({ patient: req.user._id })
      .populate('doctor', 'firstName lastName email')
      .sort({ nextVisitDate: 1 }); // Sort by next visit date
    
    console.log(`Found ${prescriptions.length} prescriptions for patient ${req.user._id}`);
    
    // Log each prescription's doctor ID for verification
    prescriptions.forEach((prescription, index) => {
      console.log(`Prescription ${index + 1} - Doctor ID: ${prescription.doctor._id}, Email: ${prescription.doctor.email}`);
    });

    res.json(prescriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get prescriptions created by a doctor
// @route   GET /api/prescriptions/doctor
// @access  Private/Doctor
const getPrescriptionsByDoctor = async (req, res) => {
  try {
    console.log('Doctor ID requesting prescriptions:', req.user._id);
    
    // Get upcoming visits (limited to 3 most recent)
    const upcomingPrescriptions = await Prescription.find({ 
      doctor: req.user._id,
      nextVisitDate: { $gte: new Date() }
    })
      .sort({ nextVisitDate: 1 }) // Sort by next visit date (ascending)
      .limit(3) // Limit to 3 most recent
      .populate({
        path: 'patient',
        select: 'firstName lastName email',
        model: 'User'
      })
      .populate('doctor', 'firstName lastName email')
      .lean();
    
    console.log(`Found ${upcomingPrescriptions.length} upcoming prescriptions for doctor ${req.user._id}`);
    
    // Format dates and verify data
    const formattedPrescriptions = upcomingPrescriptions.map(prescription => {
      // Ensure dates are properly formatted
      const formatted = {
        ...prescription,
        nextVisitDate: prescription.nextVisitDate?.toISOString(),
        issuedDate: prescription.issuedDate?.toISOString(),
        expiryDate: prescription.expiryDate?.toISOString(),
        patient: {
          ...prescription.patient,
          _id: prescription.patient?._id?.toString()
        }
      };
      
      console.log('Processed prescription:', JSON.stringify(formatted, null, 2));
      return formatted;
    });

    res.json(formattedPrescriptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a specific prescription by ID
// @route   GET /api/prescriptions/:id
// @access  Private
const getPrescriptionById = async (req, res) => {
  try {
    console.log(`User ${req.user._id} (${req.user.role}) requesting prescription ${req.params.id}`);
    
    const prescription = await Prescription.findById(req.params.id)
      .populate('doctor', 'firstName lastName email')
      .populate('patient', 'firstName lastName');

    if (prescription) {
      console.log(`Prescription found. Doctor ID: ${prescription.doctor._id}, Patient ID: ${prescription.patient._id}`);
      
      // Check if the user is authorized to view this prescription
      if (
        (req.user.role === 'patient' && prescription.patient._id.toString() === req.user._id.toString()) ||
        (req.user.role === 'doctor' && prescription.doctor._id.toString() === req.user._id.toString())
      ) {
        console.log('Authorization check passed');
        res.json(prescription);
      } else {
        console.log('Authorization check failed');
        res.status(403).json({ 
          message: 'Not authorized to view this prescription',
          userRole: req.user.role,
          userId: req.user._id,
          prescriptionDoctorId: prescription.doctor._id,
          prescriptionPatientId: prescription.patient._id
        });
      }
    } else {
      res.status(404).json({ message: 'Prescription not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Process prescription image with OCR
// @route   POST /api/prescriptions/ocr
// @access  Private/Doctor
const processPrescriptionOCR = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const doctorId = req.user._id;

    // Verify doctor exists and is a doctor
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(403).json({ message: 'Doctor not authorized' });
    }

    // Call OCR service

    const formData = new FormData();
    // Pre-resize/compress to speed up OCR service and reduce timeout risk
    try {
      const inputBuffer = fs.readFileSync(req.file.path);
      const processedBuffer = await sharp(inputBuffer)
        .resize({
          width: 1600,
          height: 1600,
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 80 })
        .toBuffer();
      formData.append('image', processedBuffer, {
        filename: 'upload.jpg',
        contentType: 'image/jpeg'
      });
    } catch (imgErr) {
      // Fallback to raw stream if processing fails
      formData.append('image', fs.createReadStream(req.file.path));
    }

    const ocrResponse = await axios.post(
      'http://localhost:5001/extract-prescription',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 180000
      }
    );

    if (ocrResponse.data.success) {
      res.json({
        success: true,
        extractedData: ocrResponse.data.extracted_data,
        confidenceScores: ocrResponse.data.confidence_scores,
        overallConfidence: ocrResponse.data.overall_confidence,
        needsReview: ocrResponse.data.needs_review,
        rawOutput: ocrResponse.data.raw_output
      });
    } else {
      res.status(500).json({ 
        message: 'OCR processing failed',
        error: ocrResponse.data.error 
      });
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

  } catch (error) {
    console.error('OCR Processing Error:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }
    
    res.status(500).json({ 
      message: 'Failed to process prescription image',
      error: error.message 
    });
  }
};

// @desc    Create prescription from OCR data
// @route   POST /api/prescriptions/from-ocr
// @access  Private/Doctor
const createPrescriptionFromOCR = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const {
      patientId,
      patientEmail,
      ocrData,
      extractedData,
      confidenceScores,
      overallConfidence,
      needsReview,
      rawOutput,
      imagePath
    } = req.body;

    const doctorId = req.user._id;

    // Resolve patient by email if provided, else by id
    let patient = null;
    if (patientEmail) {
      patient = await User.findOne({ email: patientEmail }).session(session);
      if (!patient) {
        await session.abortTransaction();
        return res.status(404).json({ message: 'Patient email not found' });
      }
    } else if (patientId) {
      patient = await User.findById(patientId).session(session);
    }

    // Verify patient exists and is a patient
    if (!patient || patient.role !== 'patient') {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Verify doctor exists and is a doctor
    const doctor = await User.findById(doctorId).session(session);
    if (!doctor || doctor.role !== 'doctor') {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Doctor not authorized' });
    }

    // Create prescription with OCR data
    const prescriptionData = {
      patient: patient._id,
      doctor: doctorId,
      medication: extractedData.medication || '',
      dosage: extractedData.dosage || '',
      frequency: extractedData.frequency || '',
      duration: extractedData.duration || '',
      instructions: extractedData.instructions || '',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      nextVisitDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      ocrData: {
        // store both original and edited values if provided by client later
        originalExtracted: req.body.originalExtracted || null,
        extractedData: extractedData || {},
        editedDiff: req.body.editedDiff || null,
        confidenceScores: confidenceScores || {},
        overallConfidence: overallConfidence || 0,
        needsReview: needsReview || false,
        rawOutput: rawOutput || '',
        imagePath: imagePath || '',
        processedAt: new Date()
      },
      source: 'ocr'
    };
    
    const prescription = await Prescription.create([prescriptionData], { session });

    // Update doctor-patient relationships
    if (!doctor.myPatients.includes(patient._id)) {
      doctor.myPatients.push(patient._id);
      await doctor.save({ session });
    }

    if (!patient.myDoctors.includes(doctorId)) {
      patient.myDoctors.push(doctorId);
      await patient.save({ session });
    }

    await session.commitTransaction();
    
    res.status(201).json({
      _id: prescription[0]._id,
      patient: prescription[0].patient,
      doctor: prescription[0].doctor,
      medication: prescription[0].medication,
      dosage: prescription[0].dosage,
      frequency: prescription[0].frequency,
      duration: prescription[0].duration,
      issuedDate: prescription[0].issuedDate,
      nextVisitDate: prescription[0].nextVisitDate,
      ocrData: prescription[0].ocrData,
      source: prescription[0].source
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('OCR Prescription Creation Error:', error);
    res.status(500).json({ 
      message: 'Failed to create prescription from OCR data',
      error: error.message 
    });
  } finally {
    session.endSession();
  }
};

export { createPrescription, getMyPrescriptions, getPrescriptionsByDoctor, getPrescriptionById, processPrescriptionOCR, createPrescriptionFromOCR };

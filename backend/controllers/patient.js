import User from '../models/User.js';
import Prescription from '../models/Prescription.js';

// @desc    Get all doctors for a patient
// @route   GET /api/patients/doctors
// @access  Private/Patient
const getMyDoctors = async (req, res) => {
  try {
    const patientId = req.user._id;
    
    // Find the patient and populate their doctors
    const patient = await User.findById(patientId).populate('myDoctors', 'firstName lastName email');
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(patient.myDoctors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get doctor details with prescription history
// @route   GET /api/patients/doctors/:id
// @access  Private/Patient
const getDoctorDetails = async (req, res) => {
  try {
    const patientId = req.user._id;
    const doctorId = req.params.id;
    
    // Check if this doctor is in the patient's doctor list
    const patient = await User.findById(patientId);
    if (!patient.myDoctors.includes(doctorId)) {
      return res.status(401).json({ message: 'Not authorized to view this doctor' });
    }
    
    // Get doctor details
    const doctor = await User.findById(doctorId).select('-password');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Get prescription history for this patient by this doctor
    const prescriptions = await Prescription.find({
      doctor: doctorId,
      patient: patientId
    }).sort({ issuedDate: -1 });
    
    res.json({
      doctor,
      prescriptions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Find a patient by email
// @route   GET /api/patients/find
// @access  Private/Doctor
const findPatientByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    // Find the patient by email and ensure they are a patient
    const patient = await User.findOne({ 
      email, 
      role: 'patient' 
    }).select('_id firstName lastName email');
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(patient);
  } catch (error) {
    console.error('Find Patient Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { getMyDoctors, getDoctorDetails, findPatientByEmail };

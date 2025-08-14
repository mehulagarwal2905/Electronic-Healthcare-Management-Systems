import User from '../models/User.js';
import Prescription from '../models/Prescription.js';

// @desc    Get all patients for a doctor
// @route   GET /api/doctors/patients
// @access  Private/Doctor
const getMyPatients = async (req, res) => {
  try {
    const doctorId = req.user._id;
    
    // Find the doctor and populate their patients
    const doctor = await User.findById(doctorId).populate('myPatients', 'firstName lastName email');
    
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    res.json(doctor.myPatients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get patient details with prescription history
// @route   GET /api/doctors/patients/:id
// @access  Private/Doctor
const getPatientDetails = async (req, res) => {
  try {
    const doctorId = req.user._id;
    const patientId = req.params.id;
    
    // Check if this patient is in the doctor's patient list
    const doctor = await User.findById(doctorId);
    if (!doctor.myPatients.includes(patientId)) {
      return res.status(401).json({ message: 'Not authorized to view this patient' });
    }
    
    // Get patient details
    const patient = await User.findById(patientId).select('-password');
    
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    // Get prescription history for this patient by this doctor
    const prescriptions = await Prescription.find({
      doctor: doctorId,
      patient: patientId
    }).sort({ issuedDate: -1 });
    
    res.json({
      patient,
      prescriptions
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { getMyPatients, getPatientDetails };

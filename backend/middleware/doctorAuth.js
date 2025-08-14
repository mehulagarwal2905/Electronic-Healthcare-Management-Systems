import Prescription from '../models/Prescription.js';

// Middleware to ensure a doctor can only access their own prescriptions
const ensureOwnPrescription = async (req, res, next) => {
  try {
    const doctorId = req.user._id;
    const prescriptionId = req.params.id;
    
    // If there's no prescription ID in the params, it's a general route
    if (!prescriptionId) {
      return next();
    }
    
    // Find the prescription
    const prescription = await Prescription.findById(prescriptionId);
    
    // If prescription doesn't exist, return 404
    if (!prescription) {
      return res.status(404).json({ message: 'Prescription not found' });
    }
    
    // Check if the logged-in doctor is the one who created this prescription
    if (prescription.doctor.toString() !== doctorId.toString()) {
      return res.status(403).json({ 
        message: 'Access denied. Doctors can only view their own prescriptions.'
      });
    }
    
    // If all checks pass, proceed
    next();
  } catch (error) {
    console.error('Error in ensureOwnPrescription middleware:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export { ensureOwnPrescription };

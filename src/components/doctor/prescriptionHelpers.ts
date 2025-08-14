
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface Prescription {
  _id?: string;
  patient: string | User;
  patientId?: string;
  patientEmail?: string;
  doctor?: string | User;
  doctorId?: string;
  medication: string;
  dosage: string;
  frequency: string;
  issuedDate?: string;
  duration: string;
  expiryDate?: string;
  instructions?: string;
  diagnosis?: string;
  nextVisitDate?: string;
}

export function getSamplePrescriptions(): Prescription[] {
  return [
    {
      _id: '1',
      patient: "Alice Johnson",
      patientEmail: "alice@example.com",
      medication: "Amoxicillin",
      dosage: "500mg",
      frequency: "3 times daily",
      issuedDate: "2025-04-10",
      duration: "10 days",
      diagnosis: "Bacterial infection"
    },
    {
      _id: '2',
      patient: "Bob Williams",
      patientEmail: "bob@example.com",
      medication: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      issuedDate: "2025-04-15",
      duration: "30 days",
      diagnosis: "Hypertension"
    }
  ];
}

/**
 * Loads prescriptions from the backend API
 */
export async function loadPrescriptionsFromAPI(): Promise<Prescription[]> {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    if (!token) {
      return getSamplePrescriptions();
    }
    
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/prescriptions/doctor`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to load prescriptions');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error loading prescriptions:', error);
    return getSamplePrescriptions();
  }
}

/**
 * Calculates expiry date from issued date and duration.
 */
export function getExpiryDate(issuedDate: string, duration: string) {
  const durationDays = parseInt(duration.split(' ')[0]);
  const date = new Date(issuedDate);
  date.setDate(date.getDate() + durationDays);
  return date.toISOString().split('T')[0];
}

/**
 * Create a new prescription via the backend API
 */
export async function createPrescription(prescription: Prescription): Promise<Prescription> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    // Calculate expiry date
    const issuedDate = new Date().toISOString().split('T')[0];
    const expiryDate = getExpiryDate(issuedDate, prescription.duration);
    
    // Find patient ID by email
    const patientId = await getPatientIdByEmail(prescription.patientEmail || '');
    
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/prescriptions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patientId,
          medication: prescription.medication,
          dosage: prescription.dosage,
          frequency: prescription.frequency,
          duration: prescription.duration,
          instructions: prescription.instructions || prescription.diagnosis,
          expiryDate,
          nextVisitDate: prescription.nextVisitDate
        })
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create prescription');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating prescription:', error);
    throw error;
  }
}

/**
 * Helper function to get patient ID by email
 */
async function getPatientIdByEmail(email: string): Promise<string> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    // Log the URL to ensure it's correct
    const apiUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/patients/find?email=${encodeURIComponent(email)}`;
    console.log('Looking up patient with URL:', apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // First check if we got a valid content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Invalid content type:', contentType);
      console.error('Response status:', response.status);
      // Try to get the response text for debugging
      const text = await response.text();
      console.error('Response text:', text.substring(0, 200) + '...');
      throw new Error('Server did not return JSON. The patient lookup service may be unavailable.');
    }
    
    if (!response.ok) {
      // We know it's JSON now, so we can parse it safely
      const errorData = await response.json();
      if (response.status === 404) {
        throw new Error(`Patient with email ${email} not found. They must register as a patient first.`);
      }
      throw new Error(errorData.message || 'Failed to find patient');
    }
    
    const data = await response.json();
    if (!data._id) {
      throw new Error('Patient data is missing ID field');
    }
    return data._id;
  } catch (error: any) {
    console.error('Error finding patient:', error);
    
    // Provide a clear message for common errors
    if (error.message.includes('<!DOCTYPE')) {
      throw new Error('Connection to server failed. Please try again or contact support.');
    }
    if (error.message.includes('not found')) {
      throw new Error(`Patient with email ${email} not found. They must register as a patient first.`);
    }
    throw new Error(error.message || 'Could not find patient with that email');
  }
}

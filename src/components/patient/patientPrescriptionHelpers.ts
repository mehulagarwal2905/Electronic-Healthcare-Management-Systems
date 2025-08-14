import { useToast } from "@/hooks/use-toast";

export interface PatientPrescription {
  _id?: string;
  medication: string;
  dosage: string;
  frequency: string;
  issuedBy?: string;
  issuedDate?: string;
  expiryDate?: string;
  instructions?: string;
  diagnosis?: string;
  status?: string;
  doctor?: string;
  doctorId?: string;
}

/**
 * Load patient prescriptions from the backend API
 */
export async function loadPatientPrescriptions(): Promise<PatientPrescription[]> {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return getDefaultPrescriptions();
    }
    
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/prescriptions/patient`,
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
    
    // Transform data to match our component's expected interface if needed
    const transformedData = data.map((prescription: any) => ({
      _id: prescription._id,
      medication: prescription.medication,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      issuedBy: prescription.doctor?.firstName ? `Dr. ${prescription.doctor.firstName} ${prescription.doctor.lastName}` : 'Doctor',
      issuedDate: prescription.issuedDate,
      expiryDate: prescription.expiryDate,
      diagnosis: prescription.instructions || 'No diagnosis provided',
      doctorId: prescription.doctor?._id
    }));
    
    return transformedData.length > 0 ? transformedData : getDefaultPrescriptions();
  } catch (error) {
    console.error('Error loading prescriptions:', error);
    return getDefaultPrescriptions();
  }
}

/**
 * Provides default prescriptions for display when API fails or no data exists
 */
export function getDefaultPrescriptions(): PatientPrescription[] {
  return [
    {
      _id: '1',
      medication: "Paracetamol, Cough Syrup",
      dosage: "500mg",
      frequency: "3 times daily",
      issuedBy: "Dr. Anil Menon",
      issuedDate: "2024-11-15",
      expiryDate: "2024-11-22",
      diagnosis: "Viral Fever"
    },
    {
      _id: '2',
      medication: "Liv 52, Multivitamin",
      dosage: "10mg",
      frequency: "Once daily",
      issuedBy: "Dr. Shweta Kapoor",
      issuedDate: "2024-11-20",
      expiryDate: "2024-11-30",
      diagnosis: "Mild Jaundice"
    }
  ];
}

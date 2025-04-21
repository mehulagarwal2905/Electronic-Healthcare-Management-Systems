
export interface Prescription {
  id: number;
  patient: string;
  patientEmail: string;
  medication: string;
  dosage: string;
  frequency: string;
  issuedDate: string;
  duration: string;
  diagnosis?: string;
}

export function getSamplePrescriptions(): Prescription[] {
  return [
    {
      id: 1,
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
      id: 2,
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
 * Loads prescriptions from localStorage, falling back to sample data.
 */
export function loadPrescriptionsFromStorage(): Prescription[] {
  const savedPrescriptions = localStorage.getItem("doctorPrescriptions");
  return savedPrescriptions
    ? JSON.parse(savedPrescriptions)
    : getSamplePrescriptions();
}

export function savePrescriptionsToStorage(prescriptions: Prescription[]) {
  localStorage.setItem("doctorPrescriptions", JSON.stringify(prescriptions));
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
 * Update patient prescriptions in localStorage
 */
export function updatePatientPrescriptions(prescription: Prescription) {
  try {
    const doctorStr = localStorage.getItem("user");
    if (!doctorStr) return;
    const doctor = JSON.parse(doctorStr);
    const patientPrescriptionsStr = localStorage.getItem("patientPrescriptions") || "[]";
    const patientPrescriptions = JSON.parse(patientPrescriptionsStr);
    const patientPrescription = {
      id: prescription.id,
      medication: prescription.medication,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      issuedBy: `Dr. ${doctor.email.split('@')[0]}`,
      issuedDate: prescription.issuedDate,
      expiryDate: getExpiryDate(prescription.issuedDate, prescription.duration),
      diagnosis: prescription.diagnosis,
      patientEmail: prescription.patientEmail
    };
    patientPrescriptions.unshift(patientPrescription);
    localStorage.setItem("patientPrescriptions", JSON.stringify(patientPrescriptions));
  } catch (error) {
    console.error("Error updating patient prescriptions:", error);
  }
}

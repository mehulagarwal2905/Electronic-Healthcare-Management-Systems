
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PatientPrescription {
  id: number;
  medication: string;
  dosage: string;
  frequency: string;
  issuedBy: string;
  issuedDate: string;
  expiryDate: string;
  diagnosis: string;
  patientEmail?: string;
}

export function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<PatientPrescription[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");

  // Initialize default prescriptions
  const defaultPrescriptions: PatientPrescription[] = [
    {
      id: 1,
      medication: "Paracetamol, Cough Syrup",
      dosage: "500mg",
      frequency: "3 times daily",
      issuedBy: "Dr. Anil Menon",
      issuedDate: "2024-11-15",
      expiryDate: "2024-11-22",
      diagnosis: "Viral Fever"
    },
    {
      id: 2,
      medication: "Liv 52, Multivitamin",
      dosage: "10mg",
      frequency: "Once daily",
      issuedBy: "Dr. Shweta Kapoor",
      issuedDate: "2024-11-20",
      expiryDate: "2024-11-30",
      diagnosis: "Mild Jaundice"
    },
    {
      id: 3,
      medication: "Atorvastatin",
      dosage: "20mg",
      frequency: "Once daily",
      issuedBy: "Dr. Ramesh Iyer",
      issuedDate: "2024-11-18",
      expiryDate: "2024-12-18",
      diagnosis: "High Cholesterol"
    },
    {
      id: 4,
      medication: "Levothyroxine",
      dosage: "100mcg",
      frequency: "Once daily",
      issuedBy: "Dr. Priya Nair",
      issuedDate: "2024-11-22",
      expiryDate: "2025-02-22",
      diagnosis: "Hypothyroidism"
    }
  ];

  // Load prescriptions and user info
  useEffect(() => {
    // Get current user email
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userData = JSON.parse(userStr);
      setUserEmail(userData.email);
    }

    // Initialize patient prescriptions if they don't exist
    const storedPrescriptions = localStorage.getItem("patientPrescriptions");
    if (!storedPrescriptions) {
      localStorage.setItem("patientPrescriptions", JSON.stringify(defaultPrescriptions));
      setPrescriptions(defaultPrescriptions);
    } else {
      // Load all prescriptions
      const allPrescriptions = JSON.parse(storedPrescriptions);
      
      // Filter prescriptions if we have a valid user email
      if (userEmail) {
        const filteredPrescriptions = allPrescriptions.filter(
          (p: PatientPrescription) => !p.patientEmail || p.patientEmail === userEmail
        );
        setPrescriptions(filteredPrescriptions);
      } else {
        setPrescriptions(allPrescriptions);
      }
    }
  }, [userEmail]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Prescriptions</h2>
      
      {prescriptions.length === 0 ? (
        <p className="text-gray-500">You don't have any active prescriptions.</p>
      ) : (
        <div className="grid gap-4">
          {prescriptions.map((prescription) => (
            <Card key={prescription.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{prescription.medication}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Diagnosis:</span>
                    <span className="text-sm font-medium">{prescription.diagnosis}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Dosage:</span>
                    <span className="text-sm font-medium">{prescription.dosage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Frequency:</span>
                    <span className="text-sm font-medium">{prescription.frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Prescribed by:</span>
                    <span className="text-sm font-medium">{prescription.issuedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Issued Date:</span>
                    <span className="text-sm font-medium">{prescription.issuedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Valid Until:</span>
                    <span className="text-sm font-medium">{prescription.expiryDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

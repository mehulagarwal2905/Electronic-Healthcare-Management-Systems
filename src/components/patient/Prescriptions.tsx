
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientPrescription, loadPatientPrescriptions } from "./patientPrescriptionHelpers";
import { useToast } from "@/hooks/use-toast";



export function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState<PatientPrescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load prescriptions from the API
  useEffect(() => {
    async function fetchPrescriptions() {
      try {
        setIsLoading(true);
        // Get prescriptions from API
        const prescriptions = await loadPatientPrescriptions();
        setPrescriptions(prescriptions);
      } catch (error) {
        toast({
          title: "Failed to load prescriptions",
          description: "Could not retrieve your prescriptions",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPrescriptions();
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Prescriptions</h2>
      
      {prescriptions.length === 0 ? (
        <p className="text-gray-500">You don't have any active prescriptions.</p>
      ) : (
        <div className="grid gap-4">
          {prescriptions.map((prescription) => (
            <Card key={prescription._id}>
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

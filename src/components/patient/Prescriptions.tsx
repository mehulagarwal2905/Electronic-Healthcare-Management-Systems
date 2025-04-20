
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PatientPrescriptions() {
  // In a real app, you would fetch prescriptions from the backend
  const prescriptions = [
    {
      id: 1,
      medication: "Amoxicillin",
      dosage: "500mg",
      frequency: "3 times daily",
      issuedBy: "Dr. John Smith",
      issuedDate: "2025-04-10",
      expiryDate: "2025-05-10"
    },
    {
      id: 2,
      medication: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      issuedBy: "Dr. Jane Doe",
      issuedDate: "2025-04-15",
      expiryDate: "2025-07-15"
    }
  ];

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
                <CardTitle className="text-lg">{prescription.medication} {prescription.dosage}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
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


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Prescription, User } from "./prescriptionHelpers";

interface PrescriptionListProps {
  prescriptions: Prescription[];
}

export function PrescriptionList({ prescriptions }: PrescriptionListProps) {
  return (
    <div className="grid gap-4">
      {prescriptions.map((prescription) => (
        <Card key={prescription._id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between">
              <span>
                {prescription.medication} {prescription.dosage}
              </span>
              <span className="text-sm text-gray-500">
                {prescription.issuedDate}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Patient:</span>
                <span className="text-sm font-medium">
                  {typeof prescription.patient === 'object' && prescription.patient ? 
                    `${(prescription.patient as User).firstName || ''} ${(prescription.patient as User).lastName || ''}`.trim() : 
                    (prescription.patient as string) || 'Unknown Patient'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Email:</span>
                <span className="text-sm font-medium">
                  {prescription.patientEmail}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Diagnosis:</span>
                <span className="text-sm font-medium">
                  {prescription.diagnosis || "Not specified"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Frequency:</span>
                <span className="text-sm font-medium">
                  {prescription.frequency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Duration:</span>
                <span className="text-sm font-medium">
                  {prescription.duration}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

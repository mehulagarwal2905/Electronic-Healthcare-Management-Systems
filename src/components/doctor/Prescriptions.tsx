
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Prescription {
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

export function DoctorPrescriptions() {
  const [patientName, setPatientName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  // Demo/preset prescriptions (could be mapped from Mongo sample, here minimal for brevity)
  const samplePrescriptions: Prescription[] = [
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

  const [recentPrescriptions, setRecentPrescriptions] = useState<Prescription[]>(() => {
    const savedPrescriptions = localStorage.getItem("doctorPrescriptions");
    return savedPrescriptions ? JSON.parse(savedPrescriptions) : samplePrescriptions;
  });

  // Save prescriptions to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("doctorPrescriptions", JSON.stringify(recentPrescriptions));
  }, [recentPrescriptions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName || !patientEmail || !medication || !dosage || !frequency || !duration || !diagnosis) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      
      // Create new prescription
      const newPrescription = {
        id: Number(Date.now()),
        patient: patientName,
        patientEmail: patientEmail,
        medication,
        dosage,
        frequency,
        issuedDate: new Date().toISOString().split('T')[0],
        duration,
        diagnosis
      };
      
      // Add to doctor's prescriptions
      const updatedDoctorPrescriptions = [newPrescription, ...recentPrescriptions];
      setRecentPrescriptions(updatedDoctorPrescriptions);
      localStorage.setItem("doctorPrescriptions", JSON.stringify(updatedDoctorPrescriptions));
      
      // Also update patient prescriptions
      updatePatientPrescriptions(newPrescription);
      
      toast({
        title: "Prescription created",
        description: "The prescription has been successfully created",
      });
      
      // Reset form
      setPatientName("");
      setPatientEmail("");
      setMedication("");
      setDosage("");
      setFrequency("");
      setDuration("");
      setDiagnosis("");
      setInstructions("");
    }, 1000);
  };

  // Update patient prescriptions
  const updatePatientPrescriptions = (prescription: Prescription) => {
    try {
      // Get logged in doctor's info
      const doctorStr = localStorage.getItem("user");
      if (!doctorStr) return;
      
      const doctor = JSON.parse(doctorStr);
      
      // Get existing patient prescriptions
      const patientPrescriptionsStr = localStorage.getItem("patientPrescriptions") || "[]";
      const patientPrescriptions = JSON.parse(patientPrescriptionsStr);
      
      // Create patient prescription format
      const patientPrescription = {
        id: prescription.id,
        medication: prescription.medication,
        dosage: prescription.dosage,
        frequency: prescription.frequency,
        issuedBy: `Dr. ${doctor.email.split('@')[0]}`, // Simple formatting for demo
        issuedDate: prescription.issuedDate,
        expiryDate: getExpiryDate(prescription.issuedDate, prescription.duration),
        diagnosis: prescription.diagnosis,
        patientEmail: prescription.patientEmail
      };
      
      // Add to patient prescriptions
      patientPrescriptions.unshift(patientPrescription);
      
      // Save updated patient prescriptions
      localStorage.setItem("patientPrescriptions", JSON.stringify(patientPrescriptions));
    } catch (error) {
      console.error("Error updating patient prescriptions:", error);
    }
  };

  // Helper to calculate expiry date
  const getExpiryDate = (issuedDate: string, duration: string) => {
    const durationDays = parseInt(duration.split(' ')[0]);
    const date = new Date(issuedDate);
    date.setDate(date.getDate() + durationDays);
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-bold">Write Prescriptions</h2>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>New Prescription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="patient">Patient Name</Label>
              <Input
                id="patient"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                placeholder="Enter patient's full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="patientEmail">Patient Email</Label>
              <Input
                id="patientEmail"
                type="email"
                value={patientEmail}
                onChange={e => setPatientEmail(e.target.value)}
                placeholder="Enter patient's email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Input
                id="diagnosis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Enter diagnosis"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="medication">Medication</Label>
                <Input
                  id="medication"
                  value={medication}
                  onChange={(e) => setMedication(e.target.value)}
                  placeholder="Enter medication name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g., 500mg"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Input
                  id="frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  placeholder="e.g., Twice daily"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="e.g., 7 days"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructions">Special Instructions</Label>
              <Textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Any special instructions for the patient"
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="bg-medconnect-primary hover:bg-medconnect-secondary ml-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Prescription"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <h3 className="text-xl font-semibold mt-6">Recent Prescriptions</h3>
      <div className="grid gap-4">
        {recentPrescriptions.map((prescription) => (
          <Card key={prescription.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between">
                <span>{prescription.medication} {prescription.dosage}</span>
                <span className="text-sm text-gray-500">{prescription.issuedDate}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Patient:</span>
                  <span className="text-sm font-medium">{prescription.patient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Email:</span>
                  <span className="text-sm font-medium">{prescription.patientEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Diagnosis:</span>
                  <span className="text-sm font-medium">{prescription.diagnosis || "Not specified"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Frequency:</span>
                  <span className="text-sm font-medium">{prescription.frequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Duration:</span>
                  <span className="text-sm font-medium">{prescription.duration}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

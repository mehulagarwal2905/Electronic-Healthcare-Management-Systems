
// ... imports
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Prescription, updatePatientPrescriptions } from "./prescriptionHelpers";

interface PrescriptionFormProps {
  onCreate: (presc: Prescription) => void;
}

export function PrescriptionForm({ onCreate }: PrescriptionFormProps) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !patientName ||
      !patientEmail ||
      !medication ||
      !dosage ||
      !frequency ||
      !duration ||
      !diagnosis
    ) {
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
      const today = new Date().toISOString().split("T")[0];
      const newPrescription: Prescription = {
        id: Number(Date.now()),
        patient: patientName,
        patientEmail: patientEmail,
        medication,
        dosage,
        frequency,
        issuedDate: today,
        duration,
        diagnosis,
      };
      // Update patient prescriptions
      updatePatientPrescriptions(newPrescription);
      onCreate(newPrescription);
      toast({
        title: "Prescription created",
        description: "The prescription has been successfully created",
      });
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

  return (
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
              onChange={e => setDiagnosis(e.target.value)}
              placeholder="Enter diagnosis"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="medication">Medication</Label>
              <Input
                id="medication"
                value={medication}
                onChange={e => setMedication(e.target.value)}
                placeholder="Enter medication name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                value={dosage}
                onChange={e => setDosage(e.target.value)}
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
                onChange={e => setFrequency(e.target.value)}
                placeholder="e.g., Twice daily"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                placeholder="e.g., 7 days"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="instructions">Special Instructions</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
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
  );
}

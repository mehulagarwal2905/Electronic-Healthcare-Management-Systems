
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Prescription {
  id: number;
  patient: string;
  medication: string;
  dosage: string;
  frequency: string;
  issuedDate: string;
  duration: string;
}

export function DoctorPrescriptions() {
  const [patientName, setPatientName] = useState("");
  const [medication, setMedication] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [duration, setDuration] = useState("");
  const [instructions, setInstructions] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  // Demo/preset prescriptions (could be mapped from Mongo sample, here minimal for brevity)
  const samplePrescriptions: Prescription[] = [
    {
      id: 1,
      patient: "Alice Johnson",
      medication: "Amoxicillin",
      dosage: "500mg",
      frequency: "3 times daily",
      issuedDate: "2025-04-10",
      duration: "10 days",
    },
    {
      id: 2,
      patient: "Bob Williams",
      medication: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      issuedDate: "2025-04-15",
      duration: "30 days",
    }
  ];

  const [recentPrescriptions, setRecentPrescriptions] = useState<Prescription[]>(samplePrescriptions);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName || !medication || !dosage || !frequency || !duration) {
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
      toast({
        title: "Prescription created",
        description: "The prescription has been successfully created",
      });
      // Add to top of recentPrescriptions list
      setRecentPrescriptions(prev => ([
        {
          id: Number(Date.now()),
          patient: patientName,
          medication,
          dosage,
          frequency,
          issuedDate: new Date().toISOString().split('T')[0],
          duration,
        },
        ...prev,
      ]));
      setPatientName("");
      setMedication("");
      setDosage("");
      setFrequency("");
      setDuration("");
      setInstructions("");
    }, 1000);
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

// NOTE FOR USER: This file is now getting large (over 200 lines). Please consider asking me to refactor it into smaller focused components for easier maintenance.

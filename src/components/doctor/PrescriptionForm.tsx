
// ... imports
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, FileImage, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Prescription, createPrescription } from "./prescriptionHelpers";
import { PrescriptionOCR } from "./PrescriptionOCR";

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
  const [nextVisitDate, setNextVisitDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !patientName ||
      !patientEmail ||
      !medication ||
      !dosage ||
      !frequency ||
      !duration ||
      !diagnosis ||
      !nextVisitDate
    ) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields including next visit date",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const newPrescription: Prescription = {
        patient: patientName,
        patientEmail: patientEmail,
        medication,
        dosage,
        frequency,
        duration,
        diagnosis,
        instructions,
        nextVisitDate: nextVisitDate.toISOString().split('T')[0]
      };
      
      // Create prescription in the database
      const createdPrescription = await createPrescription(newPrescription);
      
      // Inform parent component
      onCreate(createdPrescription);
      
      toast({
        title: "Prescription created",
        description: "The prescription has been successfully saved to the database",
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
    } catch (error: any) {
      toast({
        title: "Failed to create prescription",
        description: error.message || "An error occurred while creating the prescription",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOCRComplete = (result: any) => {
    // Auto-fill form with OCR data if confidence is high
    if (result.overallConfidence > 0.7) {
      if (result.extractedData.patient) setPatientName(result.extractedData.patient);
      if (result.extractedData.medication) setMedication(result.extractedData.medication);
      if (result.extractedData.dosage) setDosage(result.extractedData.dosage);
      if (result.extractedData.frequency) setFrequency(result.extractedData.frequency);
      if (result.extractedData.duration) setDuration(result.extractedData.duration);
      if (result.extractedData.instructions) setInstructions(result.extractedData.instructions);
    }
  };

  const handleOCRPrescriptionCreate = (prescription: any) => {
    onCreate(prescription);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>New Prescription</CardTitle>
          <div className="text-sm text-muted-foreground">
            Today: {format(new Date(), 'PPP')}
          </div>
        </div>
      </CardHeader>
      
      <Tabs defaultValue="manual" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Manual Entry
          </TabsTrigger>
          <TabsTrigger value="ocr" className="flex items-center gap-2">
            <FileImage className="h-4 w-4" />
            OCR Scanner
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="manual" className="space-y-0">
          <form onSubmit={handleSubmit}>
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
          <div className="space-y-2">
            <Label htmlFor="nextVisitDate">Next Visit Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !nextVisitDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {nextVisitDate ? format(nextVisitDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={nextVisitDate}
                  onSelect={setNextVisitDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
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
        </TabsContent>
        
        <TabsContent value="ocr" className="space-y-0">
          <CardContent>
            <PrescriptionOCR 
              onOCRComplete={handleOCRComplete}
              onPrescriptionCreate={handleOCRPrescriptionCreate}
            />
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

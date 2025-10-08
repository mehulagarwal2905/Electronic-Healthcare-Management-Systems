import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, FileImage, CheckCircle, AlertCircle, Eye, Edit3, Bot } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ApplyMLOutputModal } from './ApplyMLOutputModal';
import { IssueBanner } from './IssueBanner';
import { FieldWithIssues } from './FieldWithIssues';
import { normalizePrescription, NormalizedPrescription, Issue } from '@/lib/normalizePrescription';

interface OCRMedication {
  name?: string;
  strength?: string;
  dose?: string;
  frequency?: string;
  duration?: string;
}

interface OCRResult {
  extractedData: {
    patient?: string; // legacy flat fields
    medication?: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
    // structured fields from Gemini
    patient_name?: string;
    doctor_name?: string;
    date?: string;
    medications?: OCRMedication[];
  };
  confidenceScores: {
    [key: string]: number;
  };
  overallConfidence: number;
  needsReview: boolean;
  rawOutput: string;
}

interface PrescriptionOCRProps {
  onOCRComplete: (result: OCRResult) => void;
  onPrescriptionCreate: (prescriptionData: any) => void;
}

type StructuredState = {
  patientName: string;
  doctorName: string;
  date: string;
  instructions: string;
  medications: OCRMedication[];
};

export function PrescriptionOCR({ onOCRComplete, onPrescriptionCreate }: PrescriptionOCRProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>({});
  const [structured, setStructured] = useState<StructuredState>({
    patientName: '',
    doctorName: '',
    date: '',
    instructions: '',
    medications: [{ name: '', strength: '', dose: '', frequency: '', duration: '' }],
  });
  const [originalStructured, setOriginalStructured] = useState<StructuredState | null>(null);
  const [patientEmail, setPatientEmail] = useState('');
  const [issues, setIssues] = useState<Issue[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      setOcrResult(null);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleOCRProcess = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/prescriptions/ocr`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('OCR processing failed');
      }

      const result = await response.json();
      setOcrResult(result);
      setEditedData(result.extractedData);

      // normalize into structured state for doctor-friendly review
      const ed = result.extractedData || {};
      
      // Extract medications from structured format or fallback to flat format
      let meds: OCRMedication[] = [];
      if (Array.isArray(ed.medications) && ed.medications.length > 0) {
        // Use structured medications array from Gemini
        meds = ed.medications.map(med => ({
          name: med.name || '',
          strength: med.strength || '',
          dose: med.dose || '',
          frequency: med.frequency || '',
          duration: med.duration || ''
        }));
      } else {
        // Fallback to flat format from legacy OCR
        meds = [{
          name: ed.medication || '',
          strength: ed.dosage || '',
          dose: '',
          frequency: ed.frequency || '',
          duration: ed.duration || ''
        }];
      }
      
      // If no medications found, add empty row for doctor to fill
      if (meds.length === 0) {
        meds = [{ name: '', strength: '', dose: '', frequency: '', duration: '' }];
      }
      
      const normalized: StructuredState = {
        patientName: ed.patient_name || ed.patient || '',
        doctorName: ed.doctor_name || '',
        date: ed.date || '',
        instructions: ed.instructions || '',
        medications: meds,
      };
      
      setStructured(normalized);
      setOriginalStructured(normalized);
      setIssues([]); // Clear any previous issues
      onOCRComplete(result);

      toast({
        title: "OCR Processing Complete",
        description: result.needsReview 
          ? "Please review the extracted data as some fields have low confidence"
          : "Prescription data extracted successfully",
        variant: result.needsReview ? "destructive" : "default",
      });

    } catch (error: any) {
      toast({
        title: "OCR Processing Failed",
        description: error.message || "Failed to process the prescription image",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreatePrescription = async () => {
    if (!ocrResult || !patientEmail) {
      toast({
        title: "Missing Information",
        description: "Please provide patient email and ensure OCR processing is complete",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // Build an extractedData payload from structured fields for backend
      const flattened = {
        patient: structured.patientName,
        instructions: structured.instructions,
        // keep first medication mapped to legacy fields (backend expects strings)
        medication: structured.medications?.[0]?.name || '',
        dosage: structured.medications?.[0]?.strength || '',
        frequency: structured.medications?.[0]?.frequency || '',
        duration: structured.medications?.[0]?.duration || '',
        // also send full medications array for future use
        medications: structured.medications,
        doctor_name: structured.doctorName,
        date: structured.date,
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/prescriptions/from-ocr`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            patientEmail,
            extractedData: flattened,
            confidenceScores: ocrResult.confidenceScores,
            overallConfidence: ocrResult.overallConfidence,
            needsReview: ocrResult.needsReview,
            rawOutput: ocrResult.rawOutput,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create prescription');
      }

      const prescription = await response.json();
      onPrescriptionCreate(prescription);

      toast({
        title: "Prescription Created",
        description: "Prescription has been successfully created from OCR data",
      });

      // Reset form
      setSelectedFile(null);
      setOcrResult(null);
      setPreviewUrl(null);
      setEditedData({});
      setPatientEmail('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error: any) {
      toast({
        title: "Failed to Create Prescription",
        description: error.message || "An error occurred while creating the prescription",
        variant: "destructive",
      });
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  const updateMedication = (idx: number, key: keyof OCRMedication, value: string) => {
    setStructured(prev => {
      const copy = [...prev.medications];
      copy[idx] = { ...copy[idx], [key]: value };
      return { ...prev, medications: copy };
    });
  };

  const addMedication = () => {
    setStructured(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', strength: '', dose: '', frequency: '', duration: '' }],
    }));
  };

  const removeMedication = (idx: number) => {
    setStructured(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== idx),
    }));
  };

  const handleApplyMLOutput = (normalized: NormalizedPrescription, mlIssues: Issue[]) => {
    // Convert normalized prescription to structured state
    const newStructured: StructuredState = {
      patientName: normalized.patient_name,
      doctorName: normalized.doctor_name,
      date: normalized.date,
      instructions: normalized.instructions,
      medications: normalized.medications.map(med => ({
        name: med.name,
        strength: med.strength,
        dose: med.dose,
        frequency: med.frequency,
        duration: med.duration
      }))
    };

    setStructured(newStructured);
    setOriginalStructured(newStructured);
    setIssues(mlIssues);

    toast({
      title: "ML Output Applied",
      description: mlIssues.length > 0 
        ? `Applied with ${mlIssues.length} issues to review`
        : "ML output applied successfully",
      variant: mlIssues.length > 0 ? "destructive" : "default",
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileImage className="h-5 w-5" />
          Prescription OCR Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Upload Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prescription-image">Upload Prescription Image</Label>
            <div className="flex items-center gap-4">
              <Input
                id="prescription-image"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                ref={fileInputRef}
                className="flex-1"
              />
              <Button
                onClick={handleOCRProcess}
                disabled={!selectedFile || isProcessing}
                className="bg-medconnect-primary hover:bg-medconnect-secondary"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Process OCR
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Image Preview */}
          {previewUrl && (
            <div className="space-y-2">
              <Label>Image Preview</Label>
              <div className="border rounded-lg p-4 bg-gray-50">
                <img
                  src={previewUrl}
                  alt="Prescription preview"
                  className="max-w-full h-auto max-h-64 mx-auto rounded"
                />
              </div>
            </div>
          )}
        </div>

        {/* OCR Results */}
        {ocrResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">OCR Results</h3>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={ocrResult.needsReview ? "destructive" : "default"}
                  className="flex items-center gap-1"
                >
                  {ocrResult.needsReview ? (
                    <AlertCircle className="h-3 w-3" />
                  ) : (
                    <CheckCircle className="h-3 w-3" />
                  )}
                  {ocrResult.needsReview ? 'Needs Review' : 'High Confidence'}
                </Badge>
                <Badge variant="outline">
                  {Math.round(ocrResult.overallConfidence * 100)}% Confidence
                </Badge>
              </div>
            </div>

            {/* Overall Confidence Progress */}
            <div className="space-y-2">
              <Label>Overall Confidence</Label>
              <Progress 
                value={ocrResult.overallConfidence * 100} 
                className="h-2"
              />
            </div>

            {/* Raw OCR Data Debug */}
            <div className="space-y-2">
              <Label>Raw OCR Data (for debugging)</Label>
              <div className="bg-gray-100 p-3 rounded-lg text-sm">
                <pre className="whitespace-pre-wrap overflow-auto max-h-32">
                  {JSON.stringify(ocrResult.extractedData, null, 2)}
                </pre>
              </div>
            </div>

            {/* Doctor-friendly editable form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Patient Name</Label>
                <div className="flex gap-2">
                  <FieldWithIssues issues={issues} fieldPath="patient_name">
                    <Input
                      value={structured.patientName}
                      onChange={(e) => setStructured(prev => ({ ...prev, patientName: e.target.value }))}
                      placeholder="Enter patient name"
                    />
                  </FieldWithIssues>
                  {originalStructured && structured.patientName !== originalStructured.patientName && (
                    <Badge variant="secondary">edited</Badge>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Doctor Name</Label>
                <div className="flex gap-2">
                  <FieldWithIssues issues={issues} fieldPath="doctor_name">
                    <Input
                      value={structured.doctorName}
                      onChange={(e) => setStructured(prev => ({ ...prev, doctorName: e.target.value }))}
                      placeholder="Enter doctor name"
                    />
                  </FieldWithIssues>
                  {originalStructured && structured.doctorName !== originalStructured.doctorName && (
                    <Badge variant="secondary">edited</Badge>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <div className="flex gap-2">
                  <FieldWithIssues issues={issues} fieldPath="date">
                    <Input
                      value={structured.date}
                      onChange={(e) => setStructured(prev => ({ ...prev, date: e.target.value }))}
                      placeholder="YYYY-MM-DD or DD/MM/YY"
                    />
                  </FieldWithIssues>
                  {originalStructured && structured.date !== originalStructured.date && (
                    <Badge variant="secondary">edited</Badge>
                  )}
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Instructions</Label>
                <div className="flex gap-2 items-start">
                  <FieldWithIssues issues={issues} fieldPath="instructions">
                    <Textarea
                      value={structured.instructions}
                      onChange={(e) => setStructured(prev => ({ ...prev, instructions: e.target.value }))}
                      className="min-h-[80px]"
                      placeholder="General instructions"
                    />
                  </FieldWithIssues>
                  {originalStructured && structured.instructions !== originalStructured.instructions && (
                    <Badge variant="secondary" className="h-6 mt-1">edited</Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Medications table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Medications</Label>
                <Button size="sm" variant="outline" onClick={addMedication}>Add medication</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-2">Name</th>
                      <th className="py-2 pr-2">Strength</th>
                      <th className="py-2 pr-2">Dose</th>
                      <th className="py-2 pr-2">Frequency</th>
                      <th className="py-2 pr-2">Duration</th>
                      <th className="py-2 pr-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {structured.medications.map((m, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="py-2 pr-2">
                          <div className="flex gap-2">
                            <FieldWithIssues issues={issues} fieldPath={`medications[${idx}].name`}>
                              <Input value={m.name || ''} onChange={(e) => updateMedication(idx, 'name', e.target.value)} placeholder="e.g. Amoxicillin" />
                            </FieldWithIssues>
                            {originalStructured && (originalStructured.medications?.[idx]?.name || '') !== (m.name || '') && (
                              <Badge variant="secondary">edited</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-2 pr-2">
                          <div className="flex gap-2">
                            <FieldWithIssues issues={issues} fieldPath={`medications[${idx}].strength`}>
                              <Input value={m.strength || ''} onChange={(e) => updateMedication(idx, 'strength', e.target.value)} placeholder="e.g. 500mg" />
                            </FieldWithIssues>
                            {originalStructured && (originalStructured.medications?.[idx]?.strength || '') !== (m.strength || '') && (
                              <Badge variant="secondary">edited</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-2 pr-2">
                          <div className="flex gap-2">
                            <FieldWithIssues issues={issues} fieldPath={`medications[${idx}].dose`}>
                              <Input value={m.dose || ''} onChange={(e) => updateMedication(idx, 'dose', e.target.value)} placeholder="e.g. 1 tab" />
                            </FieldWithIssues>
                            {originalStructured && (originalStructured.medications?.[idx]?.dose || '') !== (m.dose || '') && (
                              <Badge variant="secondary">edited</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-2 pr-2">
                          <div className="flex gap-2">
                            <FieldWithIssues issues={issues} fieldPath={`medications[${idx}].frequency`}>
                              <Input value={m.frequency || ''} onChange={(e) => updateMedication(idx, 'frequency', e.target.value)} placeholder="e.g. BID" />
                            </FieldWithIssues>
                            {originalStructured && (originalStructured.medications?.[idx]?.frequency || '') !== (m.frequency || '') && (
                              <Badge variant="secondary">edited</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-2 pr-2">
                          <div className="flex gap-2">
                            <FieldWithIssues issues={issues} fieldPath={`medications[${idx}].duration`}>
                              <Input value={m.duration || ''} onChange={(e) => updateMedication(idx, 'duration', e.target.value)} placeholder="e.g. 5 days" />
                            </FieldWithIssues>
                            {originalStructured && (originalStructured.medications?.[idx]?.duration || '') !== (m.duration || '') && (
                              <Badge variant="secondary">edited</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-2 pr-2 text-right">
                          <Button size="sm" variant="ghost" onClick={() => removeMedication(idx)}>Remove</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Patient Email Input */}
            <div className="space-y-2">
              <Label htmlFor="patient-email">Patient Email *</Label>
              <Input
                id="patient-email"
                type="email"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                placeholder="Enter patient's email address"
                required
              />
            </div>

            {/* Issue Banner */}
            <IssueBanner issues={issues} />

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={handleCreatePrescription}
                disabled={!patientEmail}
                className="bg-medconnect-primary hover:bg-medconnect-secondary"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Create Prescription
              </Button>
              
              <ApplyMLOutputModal onApply={handleApplyMLOutput}>
                <Button variant="outline">
                  <Bot className="h-4 w-4 mr-2" />
                  Apply ML Output
                </Button>
              </ApplyMLOutputModal>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Raw Output
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Raw OCR Output</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap">
                        {ocrResult.rawOutput}
                      </pre>
                    </div>
                    <div className="space-y-2">
                      <Label>Confidence Scores</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(ocrResult.confidenceScores).map(([field, score]) => (
                          <div key={field} className="flex justify-between">
                            <span className="capitalize text-sm">{field}:</span>
                            <Badge variant="outline">
                              {Math.round(score * 100)}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Review Alert */}
            {ocrResult.needsReview && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Some fields have low confidence scores. Please review and correct the extracted data before creating the prescription.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

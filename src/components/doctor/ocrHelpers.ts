/**
 * OCR Helper Functions for Prescription Processing
 */

export interface OCRResult {
  extractedData: {
    patient?: string;
    medication?: string;
    dosage?: string;
    frequency?: string;
    duration?: string;
    instructions?: string;
  };
  confidenceScores: {
    [key: string]: number;
  };
  overallConfidence: number;
  needsReview: boolean;
  rawOutput: string;
}

export interface PrescriptionFromOCR {
  patientEmail: string;
  extractedData: any;
  confidenceScores: { [key: string]: number };
  overallConfidence: number;
  needsReview: boolean;
  rawOutput: string;
}

/**
 * Process prescription image with OCR
 */
export async function processPrescriptionOCR(imageFile: File): Promise<OCRResult> {
  const formData = new FormData();
  formData.append('image', imageFile);

  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

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
    const errorData = await response.json();
    throw new Error(errorData.message || 'OCR processing failed');
  }

  return await response.json();
}

/**
 * Create prescription from OCR data
 */
export async function createPrescriptionFromOCR(prescriptionData: PrescriptionFromOCR): Promise<any> {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/prescriptions/from-ocr`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prescriptionData),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create prescription');
  }

  return await response.json();
}

/**
 * Validate image file for OCR processing
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  // Check file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    return { isValid: false, error: 'File size must be less than 10MB' };
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'File must be an image' };
  }

  // Check supported formats
  const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!supportedFormats.includes(file.type)) {
    return { isValid: false, error: 'Unsupported image format. Please use JPEG, PNG, or WebP' };
  }

  return { isValid: true };
}

/**
 * Get confidence level color class
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'bg-green-500';
  if (confidence >= 0.6) return 'bg-yellow-500';
  return 'bg-red-500';
}

/**
 * Get confidence level text
 */
export function getConfidenceText(confidence: number): string {
  if (confidence >= 0.8) return 'High';
  if (confidence >= 0.6) return 'Medium';
  return 'Low';
}

/**
 * Check if OCR result needs manual review
 */
export function needsManualReview(ocrResult: OCRResult): boolean {
  return ocrResult.needsReview || 
         ocrResult.overallConfidence < 0.7 || 
         Object.values(ocrResult.confidenceScores).some(score => score < 0.5);
}

/**
 * Format confidence score as percentage
 */
export function formatConfidenceScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

/**
 * Get field display name
 */
export function getFieldDisplayName(field: string): string {
  const displayNames: { [key: string]: string } = {
    patient: 'Patient Name',
    medication: 'Medication',
    dosage: 'Dosage',
    frequency: 'Frequency',
    duration: 'Duration',
    instructions: 'Instructions',
  };
  
  return displayNames[field] || field.charAt(0).toUpperCase() + field.slice(1);
}

/**
 * Convert base64 to File object
 */
export function base64ToFile(base64: string, filename: string, mimeType: string): File {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new File([byteArray], filename, { type: mimeType });
}

/**
 * Convert File to base64
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

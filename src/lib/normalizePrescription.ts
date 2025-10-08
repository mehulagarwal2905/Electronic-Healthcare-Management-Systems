import { z } from 'zod';

// Core types
export interface NormalizedMedication {
  name: string;
  strength: string;
  dose: string;
  dose_amount?: number;
  dose_unit?: 'tab' | 'cap' | 'ml' | 'drops' | 'puff' | 'mg' | 'mcg';
  dose_text?: string;
  frequency: string;
  duration: string;
  duration_raw?: string;
  duration_days?: number;
}

export interface NormalizedPrescription {
  patient_name: string;
  doctor_name: string;
  date: string;
  instructions: string;
  medications: NormalizedMedication[];
}

export interface Issue {
  path: string;
  code: 'missing' | 'ambiguous' | 'invalid';
  note: string;
}

// Zod schema for validation
const MedicationSchema = z.object({
  name: z.string().optional(),
  strength: z.string().optional(),
  dose: z.string().optional(),
  frequency: z.string().optional(),
  duration: z.string().optional(),
});

const PrescriptionSchema = z.object({
  patient_name: z.string().optional(),
  doctor_name: z.string().optional(),
  date: z.string().optional(),
  instructions: z.string().optional(),
  medications: z.array(MedicationSchema).optional(),
});

// Utility functions
function capitalizeName(name: string): string {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function normalizeDate(dateStr: string): { date: string; issues: Issue[] } {
  const issues: Issue[] = [];
  let normalized = dateStr.trim();
  
  if (!normalized) {
    issues.push({ path: 'date', code: 'missing', note: 'Date is required' });
    return { date: '', issues };
  }

  // Handle DD/MM/YY format
  if (/^\d{1,2}\/\d{1,2}\/\d{2}$/.test(normalized)) {
    const [day, month, year] = normalized.split('/');
    const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`;
    normalized = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  // Handle DD-MM-YYYY format
  else if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(normalized)) {
    const [day, month, year] = normalized.split('-');
    normalized = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  // Handle DD/MM/YYYY format
  else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(normalized)) {
    const [day, month, year] = normalized.split('/');
    normalized = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  else {
    issues.push({ path: 'date', code: 'invalid', note: 'Date format not recognized' });
  }

  // Validate the final date
  const dateObj = new Date(normalized);
  if (isNaN(dateObj.getTime())) {
    issues.push({ path: 'date', code: 'invalid', note: 'Invalid date' });
  }

  return { date: normalized, issues };
}

function normalizeFrequency(freq: string): { frequency: string; issues: Issue[] } {
  const issues: Issue[] = [];
  const normalized = freq.toLowerCase().trim();
  
  if (!normalized) {
    issues.push({ path: 'frequency', code: 'missing', note: 'Frequency is required' });
    return { frequency: '', issues };
  }

  const frequencyMap: Record<string, string> = {
    'once daily': 'OD',
    'twice daily': 'BID',
    'thrice daily': 'TID',
    'three times daily': 'TID',
    'four times daily': 'QID',
    'at night': 'HS',
    'at bedtime': 'HS',
    'every 8 hours': 'q8h',
    'every 12 hours': 'q12h',
    'every 6 hours': 'q6h',
    'every 4 hours': 'q4h',
    'as needed': 'PRN',
    'prn': 'PRN',
    'od': 'OD',
    'bid': 'BID',
    'tid': 'TID',
    'qid': 'QID',
    'hs': 'HS',
  };

  const mapped = frequencyMap[normalized];
  if (mapped) {
    return { frequency: mapped, issues };
  }

  // Check if it's already a valid code
  if (['OD', 'BID', 'TID', 'QID', 'HS', 'PRN', 'q4h', 'q6h', 'q8h', 'q12h'].includes(normalized.toUpperCase())) {
    return { frequency: normalized.toUpperCase(), issues };
  }

  issues.push({ path: 'frequency', code: 'ambiguous', note: 'Frequency not recognized' });
  return { frequency: normalized, issues };
}

function normalizeDuration(duration: string): { duration: string; duration_raw: string; duration_days?: number; issues: Issue[] } {
  const issues: Issue[] = [];
  const normalized = duration.toLowerCase().trim();
  
  if (!normalized) {
    issues.push({ path: 'duration', code: 'missing', note: 'Duration is required' });
    return { duration: '', duration_raw: '', issues };
  }

  const duration_raw = duration.trim();
  let duration_days: number | undefined;

  // Parse duration to days
  const weekMatch = normalized.match(/(\d+)\s*week/);
  if (weekMatch) {
    duration_days = parseInt(weekMatch[1]) * 7;
  }

  const dayMatch = normalized.match(/(\d+)\s*day/);
  if (dayMatch) {
    duration_days = parseInt(dayMatch[1]);
  }

  const monthMatch = normalized.match(/(\d+)\s*month/);
  if (monthMatch) {
    duration_days = parseInt(monthMatch[1]) * 30;
  }

  // If we couldn't parse, flag as issue
  if (duration_days === undefined) {
    issues.push({ path: 'duration', code: 'ambiguous', note: 'Duration format not recognized' });
  }

  return { duration: normalized, duration_raw, duration_days, issues };
}

function normalizeDose(dose: string): { dose: string; dose_amount?: number; dose_unit?: 'tab' | 'cap' | 'ml' | 'drops' | 'puff' | 'mg' | 'mcg'; dose_text?: string; issues: Issue[] } {
  const issues: Issue[] = [];
  const normalized = dose.toLowerCase().trim();
  
  if (!normalized) {
    issues.push({ path: 'dose', code: 'missing', note: 'Dose is required' });
    return { dose: '', issues };
  }

  const dose_text = dose.trim();
  
  // Parse dose patterns
  const patterns = [
    { regex: /(\d+)\s*(tab|tablet)s?/i, unit: 'tab' as const },
    { regex: /(\d+)\s*(cap|capsule)s?/i, unit: 'cap' as const },
    { regex: /(\d+)\s*ml/i, unit: 'ml' as const },
    { regex: /(\d+)\s*drops?/i, unit: 'drops' as const },
    { regex: /(\d+)\s*puffs?/i, unit: 'puff' as const },
    { regex: /(\d+)\s*mg/i, unit: 'mg' as const },
    { regex: /(\d+)\s*mcg/i, unit: 'mcg' as const },
  ];

  for (const pattern of patterns) {
    const match = normalized.match(pattern.regex);
    if (match) {
      return {
        dose: normalized,
        dose_amount: parseInt(match[1]),
        dose_unit: pattern.unit,
        dose_text,
        issues
      };
    }
  }

  // If no pattern matched, flag as issue
  issues.push({ path: 'dose', code: 'ambiguous', note: 'Dose format not recognized' });
  return { dose: normalized, dose_text, issues };
}

function normalizeStrength(strength: string): { strength: string; issues: Issue[] } {
  const issues: Issue[] = [];
  const normalized = strength.trim();
  
  if (!normalized) {
    issues.push({ path: 'strength', code: 'missing', note: 'Strength is required' });
    return { strength: '', issues };
  }

  // Check if it has a unit
  const hasUnit = /(mg|mcg|%|iu|ml|g)$/i.test(normalized);
  if (!hasUnit && /^\d+/.test(normalized)) {
    issues.push({ path: 'strength', code: 'invalid', note: 'Strength missing unit (mg, mcg, %, IU, etc.)' });
  }

  return { strength: normalized, issues };
}

// Main normalization function
export function normalizePrescription(json: unknown): NormalizedPrescription & { issues: Issue[] } {
  const issues: Issue[] = [];
  
  // Validate input
  const parseResult = PrescriptionSchema.safeParse(json);
  if (!parseResult.success) {
    issues.push({ path: 'root', code: 'invalid', note: 'Invalid JSON structure' });
    return {
      patient_name: '',
      doctor_name: '',
      date: '',
      instructions: '',
      medications: [],
      issues
    };
  }

  const data = parseResult.data;

  // Normalize patient name
  const patient_name = data.patient_name ? capitalizeName(data.patient_name.trim()) : '';
  if (!patient_name) {
    issues.push({ path: 'patient_name', code: 'missing', note: 'Patient name is required' });
  }

  // Normalize doctor name
  const doctor_name = data.doctor_name ? capitalizeName(data.doctor_name.trim()) : '';
  if (!doctor_name) {
    issues.push({ path: 'doctor_name', code: 'missing', note: 'Doctor name is required' });
  }

  // Normalize date
  const dateResult = normalizeDate(data.date || '');
  issues.push(...dateResult.issues.map(issue => ({ ...issue, path: `date.${issue.path}` })));

  // Normalize instructions
  const instructions = data.instructions ? data.instructions.trim() : '';

  // Normalize medications
  const medications: NormalizedMedication[] = [];
  const meds = data.medications || [];
  
  meds.forEach((med, index) => {
    const medIssues: Issue[] = [];
    
    // Skip completely empty medication rows
    const isEmpty = !med.name && !med.strength && !med.dose && !med.frequency && !med.duration;
    if (isEmpty) return;

    // Normalize name
    const name = med.name ? med.name.trim() : '';
    if (!name) {
      medIssues.push({ path: 'name', code: 'missing', note: 'Medication name is required' });
    }

    // Normalize strength
    const strengthResult = normalizeStrength(med.strength || '');
    medIssues.push(...strengthResult.issues.map(issue => ({ ...issue, path: `medications[${index}].${issue.path}` })));

    // Normalize dose
    const doseResult = normalizeDose(med.dose || '');
    medIssues.push(...doseResult.issues.map(issue => ({ ...issue, path: `medications[${index}].${issue.path}` })));

    // Normalize frequency
    const frequencyResult = normalizeFrequency(med.frequency || '');
    medIssues.push(...frequencyResult.issues.map(issue => ({ ...issue, path: `medications[${index}].${issue.path}` })));

    // Normalize duration
    const durationResult = normalizeDuration(med.duration || '');
    medIssues.push(...durationResult.issues.map(issue => ({ ...issue, path: `medications[${index}].${issue.path}` })));

    medications.push({
      name,
      strength: strengthResult.strength,
      dose: doseResult.dose,
      dose_amount: doseResult.dose_amount,
      dose_unit: doseResult.dose_unit,
      dose_text: doseResult.dose_text,
      frequency: frequencyResult.frequency,
      duration: durationResult.duration,
      duration_raw: durationResult.duration_raw,
      duration_days: durationResult.duration_days,
    });

    issues.push(...medIssues);
  });

  return {
    patient_name,
    doctor_name,
    date: dateResult.date,
    instructions,
    medications,
    issues
  };
}

// Helper function to get issues for a specific field
export function getIssuesForField(issues: Issue[], path: string): Issue[] {
  return issues.filter(issue => issue.path === path || issue.path.startsWith(path + '.'));
}

// Helper function to check if field has issues
export function hasIssues(issues: Issue[], path: string): boolean {
  return getIssuesForField(issues, path).length > 0;
}

// Simple test script to verify ML normalization works
import { normalizePrescription } from './src/lib/normalizePrescription.ts';

const exampleMLOutput = {
  "patient_name": "Sachin Sansare",
  "doctor_name": "Amita",
  "medications": [
    { "name": "Augmentin", "strength": "625mg", "dose": "1 tablet", "frequency": "twice daily", "duration": "5 days" },
    { "name": "Enzoflam", "strength": "", "dose": "1 tablet", "frequency": "twice daily", "duration": "5 days" },
    { "name": "Pan D", "strength": "40mg", "dose": "1 tablet", "frequency": "once daily", "duration": "5 days" },
    { "name": "Hexigel gum paint", "strength": "", "dose": "", "frequency": "twice daily", "duration": "1 week" }
  ],
  "date": "12/10/22",
  "instructions": "Augmentin 625mg and Enzoflam: Take after meals. Pan D 40mg: Take before meals. Hexigel gum paint: Apply with massage."
};

console.log('Testing ML normalization...');
const result = normalizePrescription(exampleMLOutput);

console.log('\n=== NORMALIZED RESULT ===');
console.log('Patient:', result.patient_name);
console.log('Doctor:', result.doctor_name);
console.log('Date:', result.date);
console.log('Instructions:', result.instructions);

console.log('\n=== MEDICATIONS ===');
result.medications.forEach((med, idx) => {
  console.log(`\nMedication ${idx + 1}:`);
  console.log(`  Name: ${med.name}`);
  console.log(`  Strength: ${med.strength}`);
  console.log(`  Dose: ${med.dose} (${med.dose_amount} ${med.dose_unit})`);
  console.log(`  Frequency: ${med.frequency}`);
  console.log(`  Duration: ${med.duration} (${med.duration_days} days)`);
});

console.log('\n=== ISSUES ===');
result.issues.forEach((issue, idx) => {
  console.log(`${idx + 1}. ${issue.path}: ${issue.note} (${issue.code})`);
});

console.log('\n=== EXPECTED RESULTS ===');
console.log('✅ Patient: "Sachin Sansare"');
console.log('✅ Doctor: "Amita"');
console.log('✅ Date: "2022-10-12" (DD/MM/YY -> YYYY-MM-DD)');
console.log('✅ Augmentin: 625mg, 1 tab, BID, 5 days');
console.log('✅ Enzoflam: (missing strength), 1 tab, BID, 5 days');
console.log('✅ Pan D: 40mg, 1 tab, OD, 5 days');
console.log('✅ Hexigel: (missing strength & dose), BID, 7 days');
console.log('✅ Issues: 2 missing strength issues');

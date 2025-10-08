import { normalizePrescription } from '../normalizePrescription';

describe('normalizePrescription', () => {
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

  it('should normalize the example ML output correctly', () => {
    const result = normalizePrescription(exampleMLOutput);

    // Check basic fields
    expect(result.patient_name).toBe('Sachin Sansare');
    expect(result.doctor_name).toBe('Amita');
    expect(result.date).toBe('2022-10-12'); // DD/MM/YY -> YYYY-MM-DD
    expect(result.instructions).toBe('Augmentin 625mg and Enzoflam: Take after meals. Pan D 40mg: Take before meals. Hexigel gum paint: Apply with massage.');

    // Check medications
    expect(result.medications).toHaveLength(4);

    // Augmentin - should be perfect
    expect(result.medications[0]).toEqual({
      name: 'Augmentin',
      strength: '625mg',
      dose: '1 tablet',
      dose_amount: 1,
      dose_unit: 'tab',
      dose_text: '1 tablet',
      frequency: 'BID', // twice daily -> BID
      duration: '5 days',
      duration_raw: '5 days',
      duration_days: 5
    });

    // Enzoflam - missing strength
    expect(result.medications[1]).toEqual({
      name: 'Enzoflam',
      strength: '',
      dose: '1 tablet',
      dose_amount: 1,
      dose_unit: 'tab',
      dose_text: '1 tablet',
      frequency: 'BID',
      duration: '5 days',
      duration_raw: '5 days',
      duration_days: 5
    });

    // Pan D - should be perfect
    expect(result.medications[2]).toEqual({
      name: 'Pan D',
      strength: '40mg',
      dose: '1 tablet',
      dose_amount: 1,
      dose_unit: 'tab',
      dose_text: '1 tablet',
      frequency: 'OD', // once daily -> OD
      duration: '5 days',
      duration_raw: '5 days',
      duration_days: 5
    });

    // Hexigel - missing strength and dose
    expect(result.medications[3]).toEqual({
      name: 'Hexigel gum paint',
      strength: '',
      dose: '',
      frequency: 'BID',
      duration: '1 week',
      duration_raw: '1 week',
      duration_days: 7 // 1 week -> 7 days
    });

    // Check issues
    expect(result.issues).toHaveLength(2); // 2 missing strength issues
    expect(result.issues[0]).toEqual({
      path: 'medications[1].strength',
      code: 'missing',
      note: 'Strength is required'
    });
    expect(result.issues[1]).toEqual({
      path: 'medications[3].strength',
      code: 'missing',
      note: 'Strength is required'
    });
  });

  it('should handle edge cases', () => {
    // Test empty input
    const emptyResult = normalizePrescription({});
    expect(emptyResult.issues.length).toBeGreaterThan(0);
    expect(emptyResult.issues.some(issue => issue.path === 'patient_name' && issue.code === 'missing')).toBe(true);

    // Test invalid date
    const invalidDateResult = normalizePrescription({
      patient_name: 'Test',
      doctor_name: 'Doctor',
      date: 'invalid-date',
      medications: []
    });
    expect(invalidDateResult.issues.some(issue => issue.path.includes('date') && issue.code === 'invalid')).toBe(true);

    // Test weird frequency
    const weirdFreqResult = normalizePrescription({
      patient_name: 'Test',
      doctor_name: 'Doctor',
      date: '12/10/22',
      medications: [{
        name: 'Test Med',
        strength: '100mg',
        dose: '1 tab',
        frequency: 'every 6 hrs',
        duration: '3 days'
      }]
    });
    expect(weirdFreqResult.issues.some(issue => 
      issue.path.includes('frequency') && issue.code === 'ambiguous'
    )).toBe(true);
  });

  it('should normalize various date formats', () => {
    const testCases = [
      { input: '12/10/22', expected: '2022-10-12' },
      { input: '12/10/2022', expected: '2022-10-12' },
      { input: '12-10-2022', expected: '2022-10-12' },
      { input: '01/01/50', expected: '2050-01-01' }, // 50 -> 2050
      { input: '01/01/99', expected: '1999-01-01' }, // 99 -> 1999
    ];

    testCases.forEach(({ input, expected }) => {
      const result = normalizePrescription({
        patient_name: 'Test',
        doctor_name: 'Doctor',
        date: input,
        medications: []
      });
      expect(result.date).toBe(expected);
    });
  });

  it('should normalize various frequency formats', () => {
    const testCases = [
      { input: 'once daily', expected: 'OD' },
      { input: 'twice daily', expected: 'BID' },
      { input: 'thrice daily', expected: 'TID' },
      { input: 'at night', expected: 'HS' },
      { input: 'every 8 hours', expected: 'q8h' },
      { input: 'as needed', expected: 'PRN' },
      { input: 'BID', expected: 'BID' }, // already normalized
    ];

    testCases.forEach(({ input, expected }) => {
      const result = normalizePrescription({
        patient_name: 'Test',
        doctor_name: 'Doctor',
        date: '12/10/22',
        medications: [{
          name: 'Test Med',
          strength: '100mg',
          dose: '1 tab',
          frequency: input,
          duration: '3 days'
        }]
      });
      expect(result.medications[0].frequency).toBe(expected);
    });
  });

  it('should normalize various duration formats', () => {
    const testCases = [
      { input: '1 week', expected: 7 },
      { input: '2 weeks', expected: 14 },
      { input: '5 days', expected: 5 },
      { input: '1 month', expected: 30 },
      { input: '2 months', expected: 60 },
    ];

    testCases.forEach(({ input, expected }) => {
      const result = normalizePrescription({
        patient_name: 'Test',
        doctor_name: 'Doctor',
        date: '12/10/22',
        medications: [{
          name: 'Test Med',
          strength: '100mg',
          dose: '1 tab',
          frequency: 'BID',
          duration: input
        }]
      });
      expect(result.medications[0].duration_days).toBe(expected);
    });
  });

  it('should normalize various dose formats', () => {
    const testCases = [
      { input: '1 tablet', expected: { amount: 1, unit: 'tab' } },
      { input: '2 tablets', expected: { amount: 2, unit: 'tab' } },
      { input: '1 cap', expected: { amount: 1, unit: 'cap' } },
      { input: '5 ml', expected: { amount: 5, unit: 'ml' } },
      { input: '10 drops', expected: { amount: 10, unit: 'drops' } },
      { input: '2 puffs', expected: { amount: 2, unit: 'puff' } },
    ];

    testCases.forEach(({ input, expected }) => {
      const result = normalizePrescription({
        patient_name: 'Test',
        doctor_name: 'Doctor',
        date: '12/10/22',
        medications: [{
          name: 'Test Med',
          strength: '100mg',
          dose: input,
          frequency: 'BID',
          duration: '3 days'
        }]
      });
      expect(result.medications[0].dose_amount).toBe(expected.amount);
      expect(result.medications[0].dose_unit).toBe(expected.unit);
    });
  });
});

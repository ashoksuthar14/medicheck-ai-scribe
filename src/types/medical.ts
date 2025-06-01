
export interface PatientInfo {
  name: string;
  age: number;
  weight: number;
  height: number;
  gender: 'male' | 'female' | 'other';
  conditions: string[];
  allergies: string[];
  currentMedications: string[];
  symptoms: string[];
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface ValidationAlert {
  type: 'error' | 'warning' | 'info';
  category: 'dosage' | 'interaction' | 'allergy' | 'duplicate' | 'compliance' | 'contraindication';
  message: string;
  severity: 'high' | 'medium' | 'low';
  medication?: string;
}

export interface ValidationResult {
  isValid: boolean;
  confidence: number;
  extractedMedications: Medication[];
  alerts: ValidationAlert[];
  recommendations: string[];
  overallRisk: 'low' | 'medium' | 'high';
}


import { PatientInfo, ValidationResult, ValidationAlert, Medication } from '@/types/medical';

const GEMINI_API_KEY = "AIzaSyAqRZ32VyNcWCoqIkGZew5R5jQUTWaDLNs";

export async function validatePrescription(prescriptionText: string, patientInfo: PatientInfo): Promise<ValidationResult> {
  try {
    const prompt = createValidationPrompt(prescriptionText, patientInfo);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: 8192,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const analysisText = data.candidates[0].content.parts[0].text;
      return parseValidationResponse(analysisText);
    } else {
      throw new Error('No validation response received');
    }
  } catch (error) {
    console.error('Error validating prescription:', error);
    
    // Return a fallback result
    return {
      isValid: false,
      confidence: 0.5,
      extractedMedications: parseMedicationsFromText(prescriptionText),
      alerts: [{
        type: 'error',
        category: 'compliance',
        message: 'Unable to complete validation due to technical issues. Please review manually.',
        severity: 'high'
      }],
      recommendations: ['Manual review recommended due to validation system error'],
      overallRisk: 'medium'
    };
  }
}

function createValidationPrompt(prescriptionText: string, patientInfo: PatientInfo): string {
  return `
You are a medical prescription validation AI. Analyze the following prescription for a specific patient and provide a detailed validation report.

PRESCRIPTION TEXT:
${prescriptionText}

PATIENT INFORMATION:
- Name: ${patientInfo.name}
- Age: ${patientInfo.age} years
- Weight: ${patientInfo.weight} kg
- Height: ${patientInfo.height} cm
- Gender: ${patientInfo.gender}
- Medical Conditions: ${patientInfo.conditions.join(', ') || 'None reported'}
- Known Allergies: ${patientInfo.allergies.join(', ') || 'None reported'}
- Current Medications: ${patientInfo.currentMedications.join(', ') || 'None reported'}
- Current Symptoms: ${patientInfo.symptoms.join(', ') || 'None reported'}

Please provide your analysis in the following JSON format:

{
  "isValid": boolean,
  "confidence": number (0-1),
  "extractedMedications": [
    {
      "name": "medication name",
      "dosage": "dosage amount",
      "frequency": "how often",
      "duration": "treatment duration",
      "instructions": "additional instructions"
    }
  ],
  "alerts": [
    {
      "type": "error|warning|info",
      "category": "dosage|interaction|allergy|duplicate|compliance|contraindication",
      "message": "detailed alert message",
      "severity": "high|medium|low",
      "medication": "affected medication name (optional)"
    }
  ],
  "recommendations": [
    "recommendation text"
  ],
  "overallRisk": "low|medium|high"
}

VALIDATION CRITERIA:
1. Extract all medications with their dosages, frequencies, and durations
2. Check for appropriate dosages based on patient age, weight, and conditions
3. Identify potential drug interactions with current medications
4. Check for allergic reactions based on known allergies
5. Look for duplicate or conflicting medications
6. Verify prescription completeness and legibility
7. Check for contraindications based on patient conditions
8. Assess overall safety and compliance

Provide specific, actionable alerts and recommendations. Be thorough but practical.
`;
}

function parseValidationResponse(responseText: string): ValidationResult {
  try {
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // If no JSON found, parse manually
    throw new Error('No valid JSON found in response');
  } catch (error) {
    console.error('Error parsing validation response:', error);
    
    // Return a basic analysis if parsing fails
    const medications = parseMedicationsFromText(responseText);
    const alerts = parseAlertsFromText(responseText);
    
    return {
      isValid: alerts.filter(a => a.type === 'error').length === 0,
      confidence: 0.7,
      extractedMedications: medications,
      alerts: alerts,
      recommendations: [
        'Manual review recommended due to parsing limitations',
        'Verify all medication dosages with medical references',
        'Check for potential drug interactions'
      ],
      overallRisk: alerts.some(a => a.severity === 'high') ? 'high' : 'medium'
    };
  }
}

function parseMedicationsFromText(text: string): Medication[] {
  const medications: Medication[] = [];
  
  // Basic regex patterns for common medication formats
  const medicationPatterns = [
    /(\w+(?:\s+\w+)*)\s+(\d+(?:\.\d+)?(?:mg|mcg|g|ml|cc|units?))\s*[-–—]\s*(.+?)(?=\n|$)/gi,
    /(\w+(?:\s+\w+)*)\s+(\d+(?:\.\d+)?(?:mg|mcg|g|ml|cc|units?))\s+(.+?)(?=\n|$)/gi
  ];
  
  medicationPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const [, name, dosage, rest] = match;
      
      medications.push({
        name: name.trim(),
        dosage: dosage.trim(),
        frequency: extractFrequency(rest) || 'As directed',
        duration: extractDuration(rest) || 'Not specified',
        instructions: rest.trim()
      });
    }
  });
  
  return medications.length > 0 ? medications : [{
    name: 'Unable to parse medication',
    dosage: 'Not specified',
    frequency: 'Not specified',
    duration: 'Not specified',
    instructions: 'Manual review required'
  }];
}

function extractFrequency(text: string): string | null {
  const frequencyPatterns = [
    /(\d+\s*times?\s*(?:a\s*|per\s*)?day)/i,
    /(\d+\s*times?\s*daily)/i,
    /(once\s*daily)/i,
    /(twice\s*daily)/i,
    /(thrice\s*daily)/i,
    /(every\s*\d+\s*hours?)/i,
    /(morning|evening|night)/i
  ];
  
  for (const pattern of frequencyPatterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

function extractDuration(text: string): string | null {
  const durationPatterns = [
    /(\d+\s*days?)/i,
    /(\d+\s*weeks?)/i,
    /(\d+\s*months?)/i,
    /(for\s*\d+\s*days?)/i,
    /(for\s*\d+\s*weeks?)/i
  ];
  
  for (const pattern of durationPatterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  
  return null;
}

function parseAlertsFromText(text: string): ValidationAlert[] {
  const alerts: ValidationAlert[] = [];
  
  // Look for common alert keywords
  if (text.toLowerCase().includes('interaction')) {
    alerts.push({
      type: 'warning',
      category: 'interaction',
      message: 'Potential drug interaction detected',
      severity: 'medium'
    });
  }
  
  if (text.toLowerCase().includes('dosage') && text.toLowerCase().includes('high')) {
    alerts.push({
      type: 'warning',
      category: 'dosage',
      message: 'Dosage may be higher than recommended',
      severity: 'medium'
    });
  }
  
  if (text.toLowerCase().includes('allergy') || text.toLowerCase().includes('allergic')) {
    alerts.push({
      type: 'error',
      category: 'allergy',
      message: 'Potential allergic reaction risk identified',
      severity: 'high'
    });
  }
  
  return alerts;
}

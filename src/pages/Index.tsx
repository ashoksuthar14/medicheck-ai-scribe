
import { useState } from 'react';
import Header from '@/components/Header';
import PrescriptionUpload from '@/components/PrescriptionUpload';
import PatientForm from '@/components/PatientForm';
import ValidationResults from '@/components/ValidationResults';
import { Card } from '@/components/ui/card';
import { PatientInfo, ValidationResult } from '@/types/medical';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<'upload' | 'patient' | 'results'>('upload');
  const [prescriptionData, setPrescriptionData] = useState<string>('');
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [validationResults, setValidationResults] = useState<ValidationResult | null>(null);

  const handlePrescriptionExtracted = (extractedText: string) => {
    setPrescriptionData(extractedText);
    setCurrentStep('patient');
  };

  const handlePatientInfoSubmitted = (info: PatientInfo) => {
    setPatientInfo(info);
    setCurrentStep('results');
  };

  const resetFlow = () => {
    setCurrentStep('upload');
    setPrescriptionData('');
    setPatientInfo(null);
    setValidationResults(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className={`flex items-center space-x-2 ${currentStep === 'upload' ? 'text-blue-600' : currentStep === 'patient' || currentStep === 'results' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'upload' ? 'bg-blue-600 text-white' : currentStep === 'patient' || currentStep === 'results' ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>
                  1
                </div>
                <span className="font-medium">Upload Prescription</span>
              </div>
              
              <div className={`flex items-center space-x-2 ${currentStep === 'patient' ? 'text-blue-600' : currentStep === 'results' ? 'text-green-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'patient' ? 'bg-blue-600 text-white' : currentStep === 'results' ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>
                  2
                </div>
                <span className="font-medium">Patient Information</span>
              </div>
              
              <div className={`flex items-center space-x-2 ${currentStep === 'results' ? 'text-blue-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'results' ? 'bg-blue-600 text-white' : 'bg-gray-300'}`}>
                  3
                </div>
                <span className="font-medium">Validation Results</span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-in-out"
                style={{ 
                  width: currentStep === 'upload' ? '33%' : currentStep === 'patient' ? '66%' : '100%' 
                }}
              ></div>
            </div>
          </div>

          {/* Main Content */}
          <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            {currentStep === 'upload' && (
              <PrescriptionUpload onTextExtracted={handlePrescriptionExtracted} />
            )}
            
            {currentStep === 'patient' && (
              <PatientForm 
                prescriptionData={prescriptionData}
                onSubmit={handlePatientInfoSubmitted}
                onBack={() => setCurrentStep('upload')}
              />
            )}
            
            {currentStep === 'results' && patientInfo && (
              <ValidationResults
                prescriptionData={prescriptionData}
                patientInfo={patientInfo}
                onStartOver={resetFlow}
              />
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;

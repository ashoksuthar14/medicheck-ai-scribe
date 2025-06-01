
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Shield, 
  Pill, 
  Clock,
  FileText,
  Loader,
  RefreshCw
} from 'lucide-react';
import { PatientInfo, ValidationResult } from '@/types/medical';
import { validatePrescription } from '@/utils/prescriptionValidator';
import { useToast } from '@/hooks/use-toast';

interface ValidationResultsProps {
  prescriptionData: string;
  patientInfo: PatientInfo;
  onStartOver: () => void;
}

const ValidationResults = ({ prescriptionData, patientInfo, onStartOver }: ValidationResultsProps) => {
  const [results, setResults] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const runValidation = async () => {
      setIsValidating(true);
      try {
        const validationResults = await validatePrescription(prescriptionData, patientInfo);
        setResults(validationResults);
        
        toast({
          title: "Validation Complete",
          description: `Prescription validation completed with ${validationResults.alerts.length} alerts found.`,
        });
      } catch (error) {
        console.error('Validation error:', error);
        toast({
          title: "Validation Failed",
          description: "Failed to validate prescription. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsValidating(false);
      }
    };

    runValidation();
  }, [prescriptionData, patientInfo, toast]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getAlertBadgeVariant = (type: string) => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-green-600 bg-green-50';
    }
  };

  if (isValidating) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Validating Prescription</h2>
          <p className="text-gray-600">AI is analyzing the prescription for safety and compliance</p>
        </div>

        <Card className="p-8 bg-blue-50 border-blue-200">
          <div className="flex flex-col items-center space-y-4">
            <Loader className="h-12 w-12 text-blue-600 animate-spin" />
            <div className="text-center">
              <p className="text-lg font-medium text-blue-900 mb-2">Processing with Gemini AI</p>
              <p className="text-sm text-blue-700">Checking dosages, interactions, and compliance...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center p-8">
        <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Validation Failed</h3>
        <p className="text-gray-600 mb-4">Unable to validate the prescription. Please try again.</p>
        <Button onClick={onStartOver} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Start Over
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Validation Results</h2>
        <p className="text-gray-600">AI-powered analysis of prescription safety and compliance</p>
      </div>

      {/* Overall Status */}
      <Card className={`p-6 ${results.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {results.isValid ? (
              <CheckCircle className="h-8 w-8 text-green-600" />
            ) : (
              <XCircle className="h-8 w-8 text-red-600" />
            )}
            <div>
              <h3 className={`text-xl font-bold ${results.isValid ? 'text-green-900' : 'text-red-900'}`}>
                {results.isValid ? 'Prescription Valid' : 'Prescription Requires Attention'}
              </h3>
              <p className={`text-sm ${results.isValid ? 'text-green-700' : 'text-red-700'}`}>
                Confidence: {Math.round(results.confidence * 100)}%
              </p>
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full ${getRiskColor(results.overallRisk)}`}>
            <span className="font-medium text-sm">
              {results.overallRisk.toUpperCase()} RISK
            </span>
          </div>
        </div>
      </Card>

      {/* Extracted Medications */}
      <Card className="p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Pill className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Extracted Medications</h3>
        </div>
        <div className="space-y-3">
          {results.extractedMedications.map((medication, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Medication:</span>
                  <p className="text-gray-900">{medication.name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Dosage:</span>
                  <p className="text-gray-900">{medication.dosage}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Frequency:</span>
                  <p className="text-gray-900">{medication.frequency}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Duration:</span>
                  <p className="text-gray-900">{medication.duration}</p>
                </div>
              </div>
              {medication.instructions && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <span className="font-medium text-gray-700 text-sm">Instructions:</span>
                  <p className="text-sm text-gray-900">{medication.instructions}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Alerts */}
      {results.alerts.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold">Safety Alerts</h3>
            <Badge variant="outline">{results.alerts.length}</Badge>
          </div>
          <div className="space-y-3">
            {results.alerts.map((alert, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant={getAlertBadgeVariant(alert.type)} className="text-xs">
                        {alert.category.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-gray-900 font-medium">{alert.message}</p>
                    {alert.medication && (
                      <p className="text-sm text-gray-600 mt-1">
                        Related to: {alert.medication}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Recommendations */}
      {results.recommendations.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Recommendations</h3>
          </div>
          <ul className="space-y-2">
            {results.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Patient Summary */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-center space-x-2 mb-4">
          <Info className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">Patient Summary</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-800">Patient:</span>
            <p className="text-blue-700">{patientInfo.name}, {patientInfo.age} years, {patientInfo.gender}</p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Physical:</span>
            <p className="text-blue-700">{patientInfo.weight}kg, {patientInfo.height}cm</p>
          </div>
          {patientInfo.conditions.length > 0 && (
            <div>
              <span className="font-medium text-blue-800">Conditions:</span>
              <p className="text-blue-700">{patientInfo.conditions.join(', ')}</p>
            </div>
          )}
          {patientInfo.allergies.length > 0 && (
            <div>
              <span className="font-medium text-blue-800">Allergies:</span>
              <p className="text-blue-700">{patientInfo.allergies.join(', ')}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex space-x-3">
        <Button onClick={onStartOver} variant="outline" className="flex-1">
          <RefreshCw className="h-4 w-4 mr-2" />
          Validate Another
        </Button>
        <Button 
          onClick={() => window.print()} 
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>
    </div>
  );
};

export default ValidationResults;

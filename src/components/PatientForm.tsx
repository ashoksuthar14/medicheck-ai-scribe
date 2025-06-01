
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, User, Activity, AlertTriangle } from 'lucide-react';
import { PatientInfo } from '@/types/medical';

interface PatientFormProps {
  prescriptionData: string;
  onSubmit: (patientInfo: PatientInfo) => void;
  onBack: () => void;
}

const PatientForm = ({ prescriptionData, onSubmit, onBack }: PatientFormProps) => {
  const [formData, setFormData] = useState<PatientInfo>({
    name: '',
    age: 0,
    weight: 0,
    height: 0,
    gender: 'male',
    conditions: [],
    allergies: [],
    currentMedications: [],
    symptoms: [],
  });

  const [newCondition, setNewCondition] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');
  const [newSymptom, setNewSymptom] = useState('');

  const addItem = (field: keyof Pick<PatientInfo, 'conditions' | 'allergies' | 'currentMedications' | 'symptoms'>, value: string, setter: (value: string) => void) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
      setter('');
    }
  };

  const removeItem = (field: keyof Pick<PatientInfo, 'conditions' | 'allergies' | 'currentMedications' | 'symptoms'>, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormValid = formData.name.trim() && formData.age > 0 && formData.weight > 0 && formData.height > 0;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Patient Information</h2>
        <p className="text-gray-600">Provide patient details for accurate prescription validation</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">Basic Information</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter patient's full name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                min="1"
                max="120"
                value={formData.age || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                placeholder="Age in years"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg) *</Label>
              <Input
                id="weight"
                type="number"
                min="1"
                step="0.1"
                value={formData.weight || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                placeholder="Weight in kg"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="height">Height (cm) *</Label>
              <Input
                id="height"
                type="number"
                min="1"
                value={formData.height || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, height: parseInt(e.target.value) || 0 }))}
                placeholder="Height in cm"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={formData.gender} onValueChange={(value: 'male' | 'female' | 'other') => setFormData(prev => ({ ...prev, gender: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Medical History */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold">Medical History</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Medical Conditions */}
            <div className="space-y-3">
              <Label>Medical Conditions</Label>
              <div className="flex space-x-2">
                <Input
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  placeholder="Enter medical condition"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('conditions', newCondition, setNewCondition))}
                />
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={() => addItem('conditions', newCondition, setNewCondition)}
                  className="px-3"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.conditions.map((condition, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{condition}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500" 
                      onClick={() => removeItem('conditions', index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Current Medications */}
            <div className="space-y-3">
              <Label>Current Medications</Label>
              <div className="flex space-x-2">
                <Input
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  placeholder="Enter current medication"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('currentMedications', newMedication, setNewMedication))}
                />
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={() => addItem('currentMedications', newMedication, setNewMedication)}
                  className="px-3"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.currentMedications.map((medication, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                    <span>{medication}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500" 
                      onClick={() => removeItem('currentMedications', index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Allergies and Symptoms */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold">Allergies & Symptoms</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Allergies */}
            <div className="space-y-3">
              <Label>Known Allergies</Label>
              <div className="flex space-x-2">
                <Input
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  placeholder="Enter allergy"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('allergies', newAllergy, setNewAllergy))}
                />
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={() => addItem('allergies', newAllergy, setNewAllergy)}
                  className="px-3"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.allergies.map((allergy, index) => (
                  <Badge key={index} variant="destructive" className="flex items-center space-x-1">
                    <span>{allergy}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-300" 
                      onClick={() => removeItem('allergies', index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Current Symptoms */}
            <div className="space-y-3">
              <Label>Current Symptoms</Label>
              <div className="flex space-x-2">
                <Input
                  value={newSymptom}
                  onChange={(e) => setNewSymptom(e.target.value)}
                  placeholder="Enter symptom"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addItem('symptoms', newSymptom, setNewSymptom))}
                />
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={() => addItem('symptoms', newSymptom, setNewSymptom)}
                  className="px-3"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.symptoms.map((symptom, index) => (
                  <Badge key={index} variant="outline" className="flex items-center space-x-1">
                    <span>{symptom}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-red-500" 
                      onClick={() => removeItem('symptoms', index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex space-x-3">
          <Button type="button" variant="outline" onClick={onBack} className="flex-1">
            Back to Upload
          </Button>
          <Button 
            type="submit" 
            disabled={!isFormValid}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Validate Prescription
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;

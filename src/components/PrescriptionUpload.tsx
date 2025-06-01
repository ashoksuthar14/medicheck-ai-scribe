
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Camera, FileText, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { extractTextFromImage } from '@/utils/geminiOCR';

interface PrescriptionUploadProps {
  onTextExtracted: (text: string) => void;
}

const PrescriptionUpload = ({ onTextExtracted }: PrescriptionUploadProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setUploadedFile(file);
    setIsProcessing(true);

    try {
      const text = await extractTextFromImage(file);
      setExtractedText(text);
      
      toast({
        title: "Prescription Processed",
        description: "Text has been successfully extracted from your prescription.",
      });
    } catch (error) {
      console.error('Error processing prescription:', error);
      toast({
        title: "Processing Failed",
        description: "Failed to extract text from the prescription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleConfirm = () => {
    if (extractedText.trim()) {
      onTextExtracted(extractedText);
    }
  };

  const handleEdit = (newText: string) => {
    setExtractedText(newText);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Prescription</h2>
        <p className="text-gray-600">Upload a clear image or PDF of the medical prescription</p>
      </div>

      {!uploadedFile ? (
        <Card 
          {...getRootProps()} 
          className={`p-8 border-2 border-dashed transition-all duration-300 cursor-pointer ${
            isDragActive 
              ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-[1.02]' 
              : 'border-gray-300 hover:border-blue-400 hover:shadow-md'
          }`}
        >
          <input {...getInputProps()} />
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className={`p-4 rounded-full ${isDragActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                <Upload className={`h-8 w-8 ${isDragActive ? 'text-blue-600' : 'text-gray-400'}`} />
              </div>
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop your prescription here' : 'Drag & drop your prescription'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or click to browse files
              </p>
            </div>
            
            <div className="flex justify-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <Camera className="h-4 w-4" />
                <span>JPG, PNG</span>
              </div>
              <div className="flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span>PDF</span>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">File Uploaded</p>
                <p className="text-sm text-green-700">{uploadedFile.name}</p>
              </div>
            </div>
          </Card>

          {isProcessing ? (
            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex items-center justify-center space-x-3">
                <Loader className="h-6 w-6 text-blue-600 animate-spin" />
                <span className="text-blue-900 font-medium">Processing prescription with AI...</span>
              </div>
            </Card>
          ) : extractedText ? (
            <div className="space-y-4">
              <Card className="p-4 bg-yellow-50 border-yellow-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900">Please Review Extracted Text</p>
                    <p className="text-sm text-yellow-700">Verify the accuracy of the extracted information before proceeding.</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Extracted Prescription Text:
                </label>
                <textarea
                  value={extractedText}
                  onChange={(e) => handleEdit(e.target.value)}
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Extracted text will appear here..."
                />
              </Card>

              <div className="flex space-x-3">
                <Button 
                  onClick={handleConfirm}
                  disabled={!extractedText.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Proceed to Validation
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setUploadedFile(null);
                    setExtractedText('');
                  }}
                >
                  Upload Different File
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default PrescriptionUpload;

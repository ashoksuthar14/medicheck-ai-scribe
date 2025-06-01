
import { Shield, Heart, CheckCircle } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-white/95 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Shield className="h-8 w-8 text-blue-600" />
              <Heart className="h-4 w-4 text-red-500 absolute -top-1 -right-1" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                MedValidate AI
              </h1>
              <p className="text-sm text-gray-600">Intelligent Prescription Validation</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">AI-Powered</span>
            </div>
            <div className="hidden md:flex items-center space-x-1 text-sm text-gray-600">
              <span>Trusted by</span>
              <span className="font-semibold text-blue-600">1000+</span>
              <span>Healthcare Professionals</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

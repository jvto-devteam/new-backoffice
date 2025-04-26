import React, { useState, useEffect } from 'react';
import { 
  User, Heart, HeartPulse, Thermometer, Stethoscope, Droplet, 
  Lock, CheckCircle, AlertCircle, Calendar, MapPin, Info,
  ArrowLeft
} from 'lucide-react';

const ScanResultPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [error, setError] = useState(null);
  
  // Simulasi data pasien (dalam aplikasi nyata akan diambil dari server berdasarkan QR code)
  useEffect(() => {
    // Mengambil ID dari URL
    const urlParams = new URLSearchParams(window.location.search);
    const patientId = urlParams.get('id') || 'IJN230515001'; // Default ID jika tidak ada
    
    // Simulasi fetch data
    setTimeout(() => {
      // Dalam aplikasi nyata, ini akan menjadi API call
      const mockPatient = {
        id: patientId,
        name: "Arif Hassan",
        age: 35,
        gender: "Male",
        examDate: "May 15, 2023",
        examTime: "05:10 AM",
        location: "Paltuding Entry Point",
        status: "Approved",
        vitalSigns: {
          bloodPressure: { systolic: 120, diastolic: 80 },
          heartRate: 72,
          temperature: 36.5,
          respirationRate: 16,
          oxygenSaturation: 98
        },
        recommendations: "Healthy. Approved for hiking.",
        doctor: "Dr. Maya Wijaya"
      };
      
      setPatientData(mockPatient);
      setIsLoading(false);
    }, 1500);
  }, []);
  
  // Simulasi verifikasi password - dalam aplikasi nyata akan melakukan verifikasi dengan server
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    // Untuk demo, password adalah tanggal lahir "DDMM" atau "1234"
    if (passwordInput === '1234' || passwordInput === '0505') {
      setIsAuthenticated(true);
      
      // Trigger celebration animation
      setTimeout(() => {
        setShowCelebration(true);
        
        // Hide celebration after 4 seconds
        setTimeout(() => {
          setShowCelebration(false);
        }, 4000);
      }, 500);
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  // Cek apakah hasil pemeriksaan normal
  const isVitalSignNormal = (type, value) => {
    const normalRanges = {
      systolic: [90, 120],
      diastolic: [60, 80],
      heartRate: [60, 100],
      temperature: [36.1, 37.2],
      respirationRate: [12, 20],
      oxygenSaturation: [95, 100]
    };
    
    if (normalRanges[type]) {
      const [min, max] = normalRanges[type];
      return value >= min && value <= max;
    }
    return true;
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-20 h-20 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-6"></div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Loading Results</h2>
        <p className="text-gray-600 text-center">Please wait while we fetch your examination results...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-600 to-indigo-700 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6">
          <div className="text-center mb-6">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock size={32} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Health Check Results</h2>
            <p className="text-gray-600 mt-1">Please enter the password to view your results</p>
          </div>
          
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password 
                <span className="text-xs text-gray-500 ml-1">(Birth date DDMM or provided code)</span>
              </label>
              <input 
                type="password" 
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setError(null); // Clear error when typing
                }}
                className="w-full border border-gray-300 rounded-lg p-3 text-center text-2xl tracking-wider" 
                placeholder="••••"
                maxLength={4}
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            
            <button 
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium transition-colors"
            >
              View Results
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Having trouble? Please contact the medical staff or call<br />
              <span className="text-blue-600 font-medium">+62 812 3456 7890</span>
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center text-white text-opacity-70 text-sm">
          <p>&copy; Copyright Health Screening Verification Portal</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative overflow-hidden">
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="absolute inset-0 z-30 pointer-events-none">
          {/* Confetti Explosion */}
          <div className="confetti-container">
            {[...Array(50)].map((_, i) => (
              <div 
                key={i} 
                className="confetti"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10%`,
                  width: `${Math.random() * 10 + 5}px`,
                  height: `${Math.random() * 10 + 5}px`,
                  backgroundColor: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'][Math.floor(Math.random() * 6)],
                  animation: `fall ${Math.random() * 3 + 2}s linear forwards, sway ${Math.random() * 4 + 2}s ease-in-out infinite alternate`
                }}
              ></div>
            ))}
          </div>
          
          {/* Central glow effect */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="celebration-circle"></div>
          </div>
        </div>
      )}
      
      <div className="bg-white p-4 flex items-center shadow-sm">
        <button onClick={() => window.history.back()} className="mr-2">
          <ArrowLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-800 flex-1 text-center">Health Examination Results</h1>
      </div>
      
      <div className="p-6">
        {/* Status Banner */}
        <div className={`rounded-xl overflow-hidden shadow-md mb-6 ${patientData.status === 'Approved' ? 'bg-green-500' : 'bg-red-500'}`}>
          <div className="flex items-center p-4">
            <div className="bg-white rounded-full p-2 mr-3">
              {patientData.status === 'Approved' 
                ? <CheckCircle size={24} className="text-green-500" />
                : <AlertCircle size={24} className="text-red-500" />
              }
            </div>
            <div className="text-white">
              <h2 className="font-bold">{patientData.status === 'Approved' ? 'Approved for Ijen Trek' : 'Not Approved'}</h2>
              <p className="text-sm opacity-90">Health check completed on {patientData.examDate}</p>
            </div>
          </div>
          <div className="bg-black bg-opacity-20 p-2 text-center text-white text-sm">
            Please show this screen or your wristband at the entrance checkpoint
          </div>
        </div>
        
        {/* Patient Information */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <h2 className="font-bold text-lg text-gray-800 mb-3">Patient Information</h2>
          
          <div className="flex items-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <User size={32} className="text-blue-500" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-800">{patientData.name}</h3>
              <p className="text-gray-600">{patientData.age} years • {patientData.gender}</p>
              <div className="mt-1">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                  ID: {patientData.id}
                </span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Examination Date</p>
              <p className="font-medium text-gray-800">{patientData.examDate}</p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Examination Time</p>
              <p className="font-medium text-gray-800">{patientData.examTime}</p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Location</p>
              <p className="font-medium text-gray-800">{patientData.location}</p>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500">Examined By</p>
              <p className="font-medium text-gray-800">{patientData.doctor}</p>
            </div>
          </div>
        </div>
        
        {/* Vital Signs */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <h2 className="font-bold text-lg text-gray-800 mb-3">Vital Signs</h2>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className={`p-3 rounded-lg flex justify-between items-center ${
              isVitalSignNormal('systolic', patientData.vitalSigns.bloodPressure.systolic) && 
              isVitalSignNormal('diastolic', patientData.vitalSigns.bloodPressure.diastolic) 
                ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div>
                <p className="text-xs text-gray-600">Blood Pressure</p>
                <p className="font-medium text-gray-800">{patientData.vitalSigns.bloodPressure.systolic}/{patientData.vitalSigns.bloodPressure.diastolic} mmHg</p>
              </div>
              <Heart size={20} className={`${
                isVitalSignNormal('systolic', patientData.vitalSigns.bloodPressure.systolic) && 
                isVitalSignNormal('diastolic', patientData.vitalSigns.bloodPressure.diastolic) 
                  ? 'text-green-500' : 'text-red-500'
              }`} />
            </div>
            
            <div className={`p-3 rounded-lg flex justify-between items-center ${
              isVitalSignNormal('heartRate', patientData.vitalSigns.heartRate) 
                ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div>
                <p className="text-xs text-gray-600">Heart Rate</p>
                <p className="font-medium text-gray-800">{patientData.vitalSigns.heartRate} bpm</p>
              </div>
              <HeartPulse size={20} className={`${
                isVitalSignNormal('heartRate', patientData.vitalSigns.heartRate) 
                  ? 'text-green-500' : 'text-red-500'
              }`} />
            </div>
            
            <div className={`p-3 rounded-lg flex justify-between items-center ${
              isVitalSignNormal('temperature', patientData.vitalSigns.temperature) 
                ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div>
                <p className="text-xs text-gray-600">Temperature</p>
                <p className="font-medium text-gray-800">{patientData.vitalSigns.temperature}°C</p>
              </div>
              <Thermometer size={20} className={`${
                isVitalSignNormal('temperature', patientData.vitalSigns.temperature) 
                  ? 'text-green-500' : 'text-red-500'
              }`} />
            </div>
            
            <div className={`p-3 rounded-lg flex justify-between items-center ${
              isVitalSignNormal('respirationRate', patientData.vitalSigns.respirationRate) 
                ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div>
                <p className="text-xs text-gray-600">Respiration</p>
                <p className="font-medium text-gray-800">{patientData.vitalSigns.respirationRate} br/min</p>
              </div>
              <Stethoscope size={20} className={`${
                isVitalSignNormal('respirationRate', patientData.vitalSigns.respirationRate) 
                  ? 'text-green-500' : 'text-red-500'
              }`} />
            </div>
            
            <div className={`p-3 rounded-lg flex justify-between items-center col-span-2 ${
              isVitalSignNormal('oxygenSaturation', patientData.vitalSigns.oxygenSaturation) 
                ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <div>
                <p className="text-xs text-gray-600">Oxygen Saturation</p>
                <p className="font-medium text-gray-800">{patientData.vitalSigns.oxygenSaturation}%</p>
              </div>
              <Droplet size={20} className={`${
                isVitalSignNormal('oxygenSaturation', patientData.vitalSigns.oxygenSaturation) 
                  ? 'text-green-500' : 'text-red-500'
              }`} />
            </div>
          </div>
        </div>
        
        {/* Recommendations */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <h2 className="font-bold text-lg text-gray-800 mb-3">Recommendations</h2>
          
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-4">
            <p className="text-gray-800">{patientData.recommendations}</p>
          </div>
          
          {patientData.status === 'Approved' && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-100 flex items-start">
              <CheckCircle size={20} className="text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-800">Ready for Ijen Crater Trek</p>
                <p className="text-green-700 text-sm">Your health screening has been approved. Please keep your wristband on throughout your journey.</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Help verification and validity */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <h2 className="font-bold text-lg text-gray-800 mb-3">Validity Information</h2>
          
          <div className="flex items-start mb-4">
            <div className="bg-yellow-100 p-2 rounded-full mr-3 flex-shrink-0">
              <Info size={16} className="text-yellow-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Valid for 72 Hours</p>
              <p className="text-sm text-gray-600">This health verification expires on {patientData.examDate} at {patientData.examTime}</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-full mr-3 flex-shrink-0">
              <CheckCircle size={16} className="text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-800">Verification</p>
              <p className="text-sm text-gray-600">Entry checkpoint staff will verify this health pass by scanning your wristband QR code.</p>
            </div>
          </div>
        </div>
        
        {/* Contact Support */}
        <div className="bg-gray-100 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-700 mb-2">Need assistance?</p>
          <p className="text-xs text-gray-500">
            If you need help or have questions, please contact Ijen Health Support
            <br/>
            <span className="text-blue-600 font-medium">support@ijenhealth.id</span> or call <span className="text-blue-600 font-medium">+62 812 3456 7890</span>
          </p>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fall {
          0% {
            top: -10%;
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            top: 100%;
            transform: translateY(1000px) rotate(360deg);
            opacity: 0;
          }
        }
        
        @keyframes sway {
          0% {
            margin-left: -30px;
          }
          100% {
            margin-left: 30px;
          }
        }
        
        .confetti-container {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        .confetti {
          position: absolute;
          z-index: 1;
          border-radius: 3px;
        }
        
        @keyframes pulse {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(50);
            opacity: 0;
          }
        }
        
        .celebration-circle {
          width: 20px;
          height: 20px;
          background: radial-gradient(circle, rgba(74,222,128,0.8) 0%, rgba(52,211,153,0.4) 70%, rgba(52,211,153,0) 100%);
          border-radius: 50%;
          animation: pulse 2s ease-out;
        }
        
        @keyframes zoom {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .zoom-in-out {
          animation: zoom 1.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ScanResultPage;
import React, { useState, useEffect } from 'react';
import { 
  User, Heart, Activity, Home, Calendar, Clock, Plus, 
  ChevronRight, ArrowLeft, LogOut, CheckCircle, AlertCircle, 
  Search, FileText, HeartPulse, Thermometer, Stethoscope, Droplet, X, 
  Info, Check, Mail, Lock, BellRing,
  ArrowRight, Clipboard, ThumbsUp, ThumbsDown, 
  HelpCircle, Sun, MessageCircle, Languages, ExternalLink, Pencil, MapPin,Phone,Globe,Printer, Smartphone, Shield, Database
} from 'lucide-react';

const MedicalStaffApp = () => {
  const [currentScreen, setCurrentScreen] = useState('login'); // login, home, patientList, exam, results, patientDetail, settings
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [vitalSigns, setVitalSigns] = useState({
    bloodPressure: { systolic: '', diastolic: '' },
    heartRate: '',
    temperature: '',
    respirationRate: '',
    oxygenSaturation: ''
  });
  const [recommendations, setRecommendations] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New patient waiting for checkup', time: '5 minutes ago', read: false },
    { id: 2, text: 'Reminder: Submit your shift report', time: '1 hour ago', read: true },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(1);

  // Mock data for patients
  const pendingPatients = [
    { 
      id: 1, 
      name: 'Arif Hassan', 
      age: 35, 
      gender: 'Male', 
      location: 'Paltuding Entry Point',
      bookingDate: 'May 15, 2023',
      bookingTime: '05:00 AM',
      status: 'waiting',
      ticketId: 'IJN230515001',
      arrivalTime: '04:45 AM',
      photo: 'https://cdn-icons-png.flaticon.com/128/17561/17561717.png'
    },
    { 
      id: 2, 
      name: 'Sarah Lee', 
      age: 28, 
      gender: 'Female', 
      location: 'Paltuding Entry Point',
      bookingDate: 'May 15, 2023',
      bookingTime: '05:30 AM',
      status: 'waiting',
      ticketId: 'IJN230515002',
      arrivalTime: '05:20 AM',
      photo: 'https://cdn-icons-png.flaticon.com/128/17561/17561717.png'
    },
    { 
      id: 3, 
      name: 'John Smith', 
      age: 42, 
      gender: 'Male', 
      location: 'Banyuwangi Entry Point',
      bookingDate: 'May 15, 2023',
      bookingTime: '06:00 AM',
      status: 'waiting',
      ticketId: 'IJN230515003',
      arrivalTime: '05:50 AM',
      photo: 'https://cdn-icons-png.flaticon.com/128/17561/17561717.png'
    }
  ];

  const completedPatients = [
    { 
      id: 4, 
      name: 'Maria Garcia', 
      age: 32, 
      gender: 'Female', 
      location: 'Paltuding Entry Point',
      bookingDate: 'May 14, 2023',
      bookingTime: '05:00 AM',
      status: 'completed',
      ticketId: 'IJN230514001',
      examTime: '05:10 AM',
      examDate: 'May 14, 2023',
      vitalSigns: {
        bloodPressure: { systolic: 120, diastolic: 80 },
        heartRate: 72,
        temperature: 36.5,
        respirationRate: 16,
        oxygenSaturation: 98
      },
      recommendations: 'Healthy. Approved for hiking.',
      photo: 'https://cdn-icons-png.flaticon.com/128/17561/17561717.png'
    },
    { 
      id: 5, 
      name: 'Robert Chen', 
      age: 45, 
      gender: 'Male', 
      location: 'Banyuwangi Entry Point',
      bookingDate: 'May 14, 2023',
      bookingTime: '06:30 AM',
      status: 'completed',
      ticketId: 'IJN230514002',
      examTime: '06:35 AM',
      examDate: 'May 14, 2023',
      vitalSigns: {
        bloodPressure: { systolic: 138, diastolic: 88 },
        heartRate: 78,
        temperature: 36.7,
        respirationRate: 18,
        oxygenSaturation: 96
      },
      recommendations: 'Slightly elevated blood pressure. Advised to take it easy and stay hydrated.',
      photo: 'https://cdn-icons-png.flaticon.com/128/17561/17561717.png'
    }
  ];

  // Handle login
  const handleLogin = () => {
    setLoading(true);
    // Simulate API call with setTimeout
    setTimeout(() => {
      setIsLoggedIn(true);
      setLoading(false);
      setCurrentScreen('home');
    }, 1500);
  };

  // Handle start exam
  const handleStartExam = (patient) => {
    setSelectedPatient(patient);
    setCurrentScreen('exam');
  };

  // Handle save vital signs and proceed to results
  const handleSaveVitalSigns = () => {
    setCurrentScreen('results');
  };

  // Handle submit results
  const handleSubmitResults = () => {
    // Simulate saving results
    setLoading(true);
    setTimeout(() => {
      // Update the patient's status
      const updatedPatient = {
        ...selectedPatient,
        status: 'completed',
        examTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        examDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        vitalSigns: vitalSigns,
        recommendations: recommendations
      };
      
      // Here in a real app, you would update the database
      setLoading(false);
      setCurrentScreen('patientDetail');
    }, 1500);
  };

  // Handle notification dot
  useEffect(() => {
    const unreadCount = notifications.filter(n => !n.read).length;
    setNotificationCount(unreadCount);
  }, [notifications]);

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Bottom navigation
  const renderBottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg flex justify-around py-3 border-t z-10">
      <button onClick={() => setCurrentScreen('home')} className={`flex flex-col items-center ${currentScreen === 'home' ? 'text-blue-500' : 'text-gray-500'}`}>
        <Home size={20} />
        <span className="text-xs mt-1">Dashboard</span>
      </button>
      <button onClick={() => setCurrentScreen('patientList')} className={`flex flex-col items-center ${currentScreen === 'patientList' ? 'text-blue-500' : 'text-gray-500'}`}>
        <User size={20} />
        <span className="text-xs mt-1">Patients</span>
      </button>
      <button onClick={() => setCurrentScreen('settings')} className={`flex flex-col items-center ${currentScreen === 'settings' ? 'text-blue-500' : 'text-gray-500'}`}>
        <FileText size={20} />
        <span className="text-xs mt-1">Settings</span>
      </button>
    </div>
  );

  // Login Screen
  const LoginScreen = () => (
    <div className="min-h-screen flex flex-col p-6 bg-gradient-to-b from-blue-600 to-indigo-700">
      <div className="flex-1 flex flex-col justify-center items-center text-white">
        <div className="mb-12 text-center">
          <div className="bg-white rounded-full p-5 inline-block mb-4">
            <HeartPulse size={40} className="text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold">Ijen Health Staff</h1>
          <p className="opacity-80 mt-2">Health screening management system</p>
        </div>
        
        <div className="w-full max-w-md bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white border-opacity-20">
          <h2 className="text-xl font-bold mb-6 text-center">Medical Staff Login</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Email</label>
              <div className="relative">
                <input 
                  type="email" 
                  className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg p-3 pl-10 text-white placeholder-white placeholder-opacity-60"
                  placeholder="your.email@example.com"
                />
                <Mail className="absolute left-3 top-3.5 text-white opacity-70" size={18} />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-1">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  className="w-full bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg p-3 pl-10 text-white placeholder-white placeholder-opacity-60"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-3 top-3.5 text-white opacity-70" size={18} />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input type="checkbox" id="remember" className="h-4 w-4 rounded border-gray-300" />
                <label htmlFor="remember" className="ml-2 block text-sm text-white">Remember me</label>
              </div>
              <a href="#" className="text-sm text-white text-opacity-90 hover:text-opacity-100">Forgot password?</a>
            </div>
          </div>
          
          <button 
            onClick={handleLogin} 
            className="w-full bg-blue-500 py-3 px-6 rounded-xl flex items-center justify-center space-x-2 text-white font-medium hover:bg-blue-400 transition-colors"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                <span>Logging in...</span>
              </div>
            ) : (
              <span>Login</span>
            )}
          </button>
        </div>
      </div>
      
      <div className="mt-8 text-center text-white text-opacity-70 text-sm">
        <p>Ijen Health Medical Staff Portal</p>
        <p className="mt-1">v2.0.1</p>
      </div>
    </div>
  );

  // Home / Dashboard Screen
  const HomeScreen = () => (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 pt-12 rounded-b-3xl shadow-md relative">
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-blue-100">Welcome back</p>
            <h1 className="text-2xl font-bold">Dr. Maya Wijaya</h1>
            <p className="text-sm text-blue-100">Paltuding Health Station</p>
          </div>
          
          <div className="flex items-center">
            <button 
              onClick={() => setShowNotifications(!showNotifications)} 
              className="mr-3 relative"
            >
              <BellRing size={24} className="text-white" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {notificationCount}
                </span>
              )}
            </button>
            <div className="w-12 h-12 bg-white rounded-full overflow-hidden">
              <img src="https://randomuser.me/api/portraits/women/76.jpg" alt="Doctor" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
        
        {/* Notifications dropdown */}
        {showNotifications && (
          <div className="absolute top-28 right-6 bg-white rounded-xl shadow-lg z-20 w-80">
            <div className="p-3 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-700">Notifications</h3>
              <button 
                onClick={markAllAsRead}
                className="text-blue-500 text-sm"
              >
                Mark all as read
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`p-3 border-b border-gray-100 ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                >
                  <div className="flex items-start">
                    <div className={`w-2 h-2 rounded-full mt-2 mr-2 ${notification.read ? 'bg-gray-300' : 'bg-blue-500'}`}></div>
                    <div className="flex-1">
                      <p className="text-gray-800 text-sm">{notification.text}</p>
                      <p className="text-gray-500 text-xs mt-1">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 text-center">
              <button className="text-blue-500 text-sm font-medium">View all notifications</button>
            </div>
          </div>
        )}
        
        <div className="flex flex-wrap -mx-2">
          <div className="w-1/2 px-2">
            <div className="bg-white bg-opacity-20 rounded-xl p-3 text-center">
              <h3 className="text-2xl font-bold">{pendingPatients.length}</h3>
              <p className="text-xs text-blue-100">Waiting Today</p>
            </div>
          </div>
          <div className="w-1/2 px-2">
            <div className="bg-white bg-opacity-20 rounded-xl p-3 text-center">
              <h3 className="text-2xl font-bold">{completedPatients.length}</h3>
              <p className="text-xs text-blue-100">Completed Today</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-6">
        {/* Today's schedule */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg text-gray-800">Today's Schedule</h2>
            <p className="text-sm text-gray-500">May 15, 2023</p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="mr-3 text-blue-500">
                <Clock size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Morning Shift</p>
                <p className="text-xs text-gray-500">04:00 AM - 12:00 PM</p>
              </div>
              <div className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded-full">
                Now
              </div>
            </div>
            
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="mr-3 text-gray-500">
                <Clipboard size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Health Reports Submission</p>
                <p className="text-xs text-gray-500">Due by 11:00 AM</p>
              </div>
              <div className="text-gray-400">
                <ChevronRight size={20} />
              </div>
            </div>
          </div>
        </div>
        
        {/* Waiting patients */}
        <h2 className="font-bold text-lg mb-3 text-gray-800 flex items-center">
            Recent Examinations
            <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">{pendingPatients.length} patients</span>
        </h2>
        
        <div className="space-y-3 mb-6">
          {pendingPatients.map((patient) => (
            <div 
              key={patient.id}
              className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 relative"
              onClick={() => handleStartExam(patient)}
            >
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden mr-3">
                  <img src={patient.photo} alt={patient.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-800">{patient.name}</h3>
                      <p className="text-xs text-gray-500">{patient.age} years • {patient.gender}</p>
                    </div>
                    <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                      Success
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <p className="flex items-center"><Clock size={12} className="mr-1" /> Arrived: {patient.arrivalTime}</p>
                    <p className="flex items-center"><Calendar size={12} className="mr-1" /> {patient.bookingDate}</p>
                  </div>
                </div>
              </div>
              <button 
                className="w-full mt-3 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white"
                onClick={() => handleStartExam(patient)}
              >
                Start Exam
              </button>
            </div>
          ))}
        </div>
        
        <button 
          onClick={() => setCurrentScreen('patientList')}
          className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium flex items-center justify-center"
        >
          <User size={18} className="mr-2" />
          View All Patients
        </button>
      </div>

      {renderBottomNav()}
    </div>
  );

    // Patient List Screen
    const PatientListScreen = () => {
        const [searchQuery, setSearchQuery] = useState('');
        const filteredPendingPatients = pendingPatients.filter(patient => 
            patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.ticketId.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        const filteredCompletedPatients = completedPatients.filter(patient => 
            patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            patient.ticketId.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        return (
            <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-white p-4 flex items-center shadow-sm">
                <h1 className="text-xl font-bold text-gray-800 flex-1 text-center">Patient List</h1>
            </div>

            <div className="p-4 flex space-x-2 mb-2">
                <button 
                className={`flex-1 py-2 px-4 rounded-full ${activeTab === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} font-medium`}
                onClick={() => setActiveTab('pending')}
                >
                Waiting ({filteredPendingPatients.length})
                </button>
                <button 
                className={`flex-1 py-2 px-4 rounded-full ${activeTab === 'complete' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} font-medium`}
                onClick={() => setActiveTab('complete')}
                >
                Completed
                </button>
            </div>

            <div className="px-4 mb-3">
                <div className="relative">
                <input 
                    type="text" 
                    placeholder="Search patients or ticket IDs..." 
                    className="w-full bg-white rounded-lg py-3 px-4 pl-10 shadow-sm border border-gray-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
                </div>
            </div>

            <div className="px-4 py-2">
                {activeTab === 'pending' ? (
                <>
                    {filteredPendingPatients.length > 0 ? (
                    filteredPendingPatients.map(patient => (
                        <div 
                        key={patient.id}
                        className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100"
                        onClick={() => handleStartExam(patient)}
                        >
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center">
                            <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden mr-3">
                                <img src={patient.photo} alt={patient.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-800">{patient.name}</h3>
                                <p className="text-xs text-gray-500">{patient.age} years • {patient.gender}</p>
                            </div>
                            </div>
                            <div className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                            Waiting
                            </div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-3">
                            <span className="text-gray-700 text-sm">Ticket ID</span>
                            <span className="font-medium text-gray-800 text-sm">{patient.ticketId}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 mb-3">
                            <div>
                            <p className="flex items-center"><Calendar size={14} className="mr-1" /> {patient.bookingDate}</p>
                            </div>
                            <div>
                            <p className="flex items-center"><Clock size={14} className="mr-1" /> {patient.bookingTime}</p>
                            </div>
                        </div>
                        <button 
                            className="w-full bg-blue-500 text-white py-2 rounded-lg text-sm font-medium"
                            onClick={() => handleStartExam(patient)}
                        >
                            Start Examination
                        </button>
                        </div>
                    ))
                    ) : (
                    <div className="text-center py-8">
                        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clipboard size={24} className="text-gray-400" />
                        </div>
                        <h3 className="font-medium text-gray-700 mb-1">No patients found</h3>
                        <p className="text-sm text-gray-500">There are no waiting patients matching your search.</p>
                    </div>
                    )}
                </>
                ) : (
                <>
                    {filteredCompletedPatients.length > 0 ? (
                    filteredCompletedPatients.map(patient => (
                        <div 
                        key={patient.id}
                        className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100"
                        onClick={() => {
                            setSelectedPatient(patient);
                            setCurrentScreen('patientDetail');
                        }}
                        >
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center">
                            <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden mr-3">
                                <img src={patient.photo} alt={patient.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className="font-medium text-gray-800">{patient.name}</h3>
                                <p className="text-xs text-gray-500">{patient.age} years • {patient.gender}</p>
                            </div>
                            </div>
                            <div className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                            Completed
                            </div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 mb-3">
                            <div>
                            <p className="flex items-center"><Calendar size={14} className="mr-1" /> {patient.examDate}</p>
                            </div>
                            <div>
                            <p className="flex items-center"><Clock size={14} className="mr-1" /> {patient.examTime}</p>
                            </div>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg mb-3">
                            <div className="flex space-x-2 mb-2">
                            <div className="flex-1 bg-white p-2 rounded-lg text-center">
                                <p className="text-xs text-gray-500">BP</p>
                                <p className="font-medium text-gray-800">{patient.vitalSigns.bloodPressure.systolic}/{patient.vitalSigns.bloodPressure.diastolic}</p>
                            </div>
                            <div className="flex-1 bg-white p-2 rounded-lg text-center">
                                <p className="text-xs text-gray-500">HR</p>
                                <p className="font-medium text-gray-800">{patient.vitalSigns.heartRate}</p>
                            </div>
                            <div className="flex-1 bg-white p-2 rounded-lg text-center">
                                <p className="text-xs text-gray-500">Temp</p>
                                <p className="font-medium text-gray-800">{patient.vitalSigns.temperature}°C</p>
                            </div>
                            </div>
                        </div>
                        <button 
                            className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium"
                            onClick={() => {
                            setSelectedPatient(patient);
                            setCurrentScreen('patientDetail');
                            }}
                        >
                            View Details
                        </button>
                        </div>
                    ))
                    ) : (
                    <div className="text-center py-8">
                        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clipboard size={24} className="text-gray-400" />
                        </div>
                        <h3 className="font-medium text-gray-700 mb-1">No completed exams found</h3>
                        <p className="text-sm text-gray-500">There are no completed examinations matching your search.</p>
                    </div>
                    )}
                </>
                )}
            </div>

            {renderBottomNav()}
            </div>
        );
    }
// Patient Detail Screen
const PatientDetailScreen = () => (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-4 flex items-center shadow-sm">
        <button onClick={() => setCurrentScreen('patientList')} className="mr-2">
          <ArrowLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Patient Details</h1>
      </div>
  
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex items-start mb-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden mr-4">
              <img src={selectedPatient.photo} alt={selectedPatient.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between">
                <div>
                  <h2 className="font-bold text-lg text-gray-800">{selectedPatient.name}</h2>
                  <p className="text-sm text-gray-500">{selectedPatient.age} years • {selectedPatient.gender}</p>
                </div>
                <div className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium h-fit">
                  Completed
                </div>
              </div>
              
              <div className="mt-2 flex items-center">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                  {selectedPatient.ticketId}
                </span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-4">
            <h3 className="font-medium text-gray-800 mb-3">Examination Details</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Exam Date</p>
                <p className="font-medium text-gray-800">{selectedPatient.examDate || "May 15, 2023"}</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Exam Time</p>
                <p className="font-medium text-gray-800">{selectedPatient.examTime || "05:15 AM"}</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Location</p>
                <p className="font-medium text-gray-800">{selectedPatient.location}</p>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500">Examined By</p>
                <p className="font-medium text-gray-800">Dr. Maya Wijaya</p>
              </div>
            </div>
            
            <h3 className="font-medium text-gray-800 mb-3">Vital Signs</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 bg-green-50 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-600">Blood Pressure</p>
                  <p className="font-medium text-gray-800">{selectedPatient.vitalSigns?.bloodPressure.systolic || "120"}/{selectedPatient.vitalSigns?.bloodPressure.diastolic || "80"} mmHg</p>
                </div>
                <Heart size={20} className="text-green-500" />
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-600">Heart Rate</p>
                  <p className="font-medium text-gray-800">{selectedPatient.vitalSigns?.heartRate || "72"} bpm</p>
                </div>
                <HeartPulse size={20} className="text-green-500" />
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-600">Temperature</p>
                  <p className="font-medium text-gray-800">{selectedPatient.vitalSigns?.temperature || "36.5"}°C</p>
                </div>
                <Thermometer size={20} className="text-green-500" />
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-600">Respiration</p>
                  <p className="font-medium text-gray-800">{selectedPatient.vitalSigns?.respirationRate || "16"} br/min</p>
                </div>
                <Stethoscope size={20} className="text-green-500" />
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg flex justify-between items-center col-span-2">
                <div>
                  <p className="text-xs text-gray-600">Oxygen Saturation</p>
                  <p className="font-medium text-gray-800">{selectedPatient.vitalSigns?.oxygenSaturation || "98"}%</p>
                </div>
                <Droplet size={20} className="text-green-500" />
              </div>
            </div>
            
            <h3 className="font-medium text-gray-800 mb-3">Recommendations</h3>
            
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 mb-6">
              <p className="text-gray-800">{selectedPatient.recommendations || "Healthy. Approved for hiking."}</p>
            </div>
            
            <button 
            className="flex-1 w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-medium transition-colors"
            onClick={() => setCurrentScreen('printWristband')}
            >
            <div className="flex items-center justify-center">
                <FileText size={18} className="mr-2" />
                <span>Print Wristband</span>
            </div>
            </button>
          </div>
        </div>

      </div>
  
      {renderBottomNav()}
    </div>
  );
  const PrintWristbandScreen = () => {
    const [showInstructions, setShowInstructions] = useState(false);
    
    // Menggunakan selectedPatient dari state global
    const patientData = selectedPatient || {
      name: "Arif Hassan",
      age: 35,
      ticketId: "IJN230515001",
      examDate: "May 15, 2023",
      location: "Paltuding Entry Point"
    };
    
    // Format tanggal
    const formattedDate = patientData.examDate;
    
    // QR Code value berisi ID yang dapat digunakan untuk lookup data pasien
    const qrValue = `https://ijen-health.id/check/${patientData.ticketId}`;
    
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white p-4 flex items-center shadow-sm">
          <button onClick={() => setCurrentScreen('patientDetail')} className="mr-2">
            <ArrowLeft size={24} className="text-gray-800" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Print Wristband</h1>
        </div>
  
        <div className="p-6">
          {/* Preview & Instructions */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg text-gray-800">Wristband Preview</h2>
              <button 
                className="text-blue-500 text-sm flex items-center"
                onClick={() => setShowInstructions(!showInstructions)}
              >
                {showInstructions ? 'Hide Instructions' : 'How to Use'} 
                <Info size={16} className="ml-1" />
              </button>
            </div>
            
            {showInstructions && (
              <div className="bg-blue-50 p-4 rounded-lg mb-4 text-sm">
                <h3 className="font-medium text-gray-800 mb-2">How to Use the QR Wristband</h3>
                <ol className="list-decimal pl-4 space-y-2 text-gray-700">
                  <li>Print the wristband on waterproof paper (recommended) or regular paper.</li>
                  <li>Cut along the dotted lines and wrap around patient's wrist.</li>
                  <li>Secure with adhesive tab or medical tape.</li>
                  <li>The QR code can be scanned by any medical staff to quickly view patient's health examination results.</li>
                  <li>The wristband serves as proof of health screening completion for Ijen trek access.</li>
                </ol>
                <div className="flex items-center mt-3 bg-yellow-100 p-2 rounded text-yellow-800">
                  <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                  <p>Ensure the QR code remains visible and undamaged for scanning at checkpoints.</p>
                </div>
              </div>
            )}
            
            {/* Wristband Preview */}
            <div className="max-w-md mx-auto my-6 relative wristband-preview">
              {/* Wristband Container - Cut line indicator */}
              <div className="border-2 border-dashed border-gray-300 p-2 rounded-lg mb-2">
                {/* Actual Wristband Design */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg overflow-hidden relative">
                  {/* Left End Pattern */}
                  <div className="absolute left-0 top-0 bottom-0 w-12 bg-white opacity-20">
                    <div className="h-full w-full flex flex-col justify-between py-1">
                      <div className="h-1 w-8 mx-auto bg-white rounded-full"></div>
                      <div className="h-1 w-8 mx-auto bg-white rounded-full"></div>
                      <div className="h-1 w-8 mx-auto bg-white rounded-full"></div>
                      <div className="h-1 w-8 mx-auto bg-white rounded-full"></div>
                      <div className="h-1 w-8 mx-auto bg-white rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="flex p-3">
                    {/* QR Code section */}
                    <div className="bg-white p-2 rounded-lg mr-3 flex-shrink-0">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrValue)}`} 
                        alt="QR Code"
                        className="w-20 h-20"
                      />
                    </div>
                    
                    {/* Info section */}
                    <div className="text-white flex-1">
                      <div className="mb-1">
                        <h3 className="text-xs uppercase tracking-wider opacity-80">IJEN HEALTH PASS</h3>
                        <p className="text-lg font-bold truncate">{patientData.name}</p>
                        <div className="flex items-center text-xs mt-1">
                          <span className="bg-white bg-opacity-20 px-2 py-0.5 rounded-full">
                            ID: {patientData.ticketId}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-xs grid grid-cols-2 gap-1 mt-2">
                        <div className="flex items-center">
                          <Calendar size={12} className="mr-1 text-blue-100" />
                          <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin size={12} className="mr-1 text-blue-100" />
                          <span className="truncate">{patientData.location}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center mt-1">
                        <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                          APPROVED
                        </span>
                      </div>
                    </div>
                    
                    {/* Right End Pattern */}
                    <div className="absolute right-0 top-0 bottom-0 w-12 bg-white opacity-20">
                      <div className="h-full w-full flex flex-col justify-between py-1">
                        <div className="h-1 w-8 mx-auto bg-white rounded-full"></div>
                        <div className="h-1 w-8 mx-auto bg-white rounded-full"></div>
                        <div className="h-1 w-8 mx-auto bg-white rounded-full"></div>
                        <div className="h-1 w-8 mx-auto bg-white rounded-full"></div>
                        <div className="h-1 w-8 mx-auto bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Scan instructions */}
                  <div className="bg-indigo-700 text-center text-white text-xs py-1 px-2">
                    SCAN QR CODE TO VERIFY HEALTH EXAMINATION RESULTS
                  </div>
                </div>
              </div>
              
              {/* Cut line indicators */}
              <div className="text-center text-xs text-gray-500 mb-4">
                Cut along dotted line
              </div>
            </div>
            
            <div className="flex flex-col space-y-3">
              <button 
                onClick={() => window.print()}
                className="bg-blue-500 text-white py-3 rounded-xl font-medium flex items-center justify-center"
              >
                <Printer size={18} className="mr-2" />
                Print Wristband
              </button>
              
              <button 
                onClick={() => setCurrentScreen('patientDetail')}
                className="bg-gray-100 text-gray-700 py-3 rounded-xl font-medium"
              >
                Back to Patient Details
              </button>
            </div>
          </div>
          
          {/* Information about QR code scanning */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
            <h3 className="font-medium text-gray-800 mb-3">About QR Code Scanning</h3>
            
            <div className="space-y-4 text-sm text-gray-700">
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3 mt-1">
                  <Smartphone size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Medical Staff Verification</p>
                  <p>Medical staff can scan the QR code using Ijen Health Staff App to verify examination results.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3 mt-1">
                  <Shield size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Checkpoint Verification</p>
                  <p>Entry checkpoint officers will scan the wristband to confirm approved health status before allowing trail access.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-3 mt-1">
                  <Database size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Secure Data</p>
                  <p>The QR code only contains a reference ID. Personal and health data remains secure in our system.</p>
                </div>
              </div>
              
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <p className="font-medium flex items-center text-yellow-800">
                  <AlertCircle size={16} className="mr-2" /> 
                  Important Note
                </p>
                <p className="text-yellow-800">The wristband must be worn throughout the Ijen journey. It serves as proof of health screening and helps in case of emergency.</p>
              </div>
            </div>
          </div>
        </div>
  
        {renderBottomNav()}
      </div>
    );
  };
  
  // Examination Screen
  const ExamScreen = () => {
    // State digunakan untuk menyimpan form values
    const [formValues, setFormValues] = useState({
      systolic: '',
      diastolic: '',
      heartRate: '',
      temperature: '',
      respirationRate: '',
      oxygenSaturation: ''
    });
  
    // Fungsi untuk menangani perubahan input
    const handleInputChange = (field, value) => {
      setFormValues(prev => ({
        ...prev,
        [field]: value
      }));
    };
  
    // Fungsi untuk menyimpan data ke vitalSigns saat pindah ke hasil
    const saveVitalSigns = () => {
      setVitalSigns({
        bloodPressure: {
          systolic: formValues.systolic,
          diastolic: formValues.diastolic
        },
        heartRate: formValues.heartRate,
        temperature: formValues.temperature,
        respirationRate: formValues.respirationRate,
        oxygenSaturation: formValues.oxygenSaturation
      });
      setCurrentScreen('results');
    };
  
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white p-4 flex items-center shadow-sm">
          <button onClick={() => setCurrentScreen('patientList')} className="mr-2">
            <ArrowLeft size={24} className="text-gray-800" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Health Examination</h1>
        </div>
  
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 overflow-hidden mr-4">
                <img src={selectedPatient.photo} alt={selectedPatient.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-800">{selectedPatient.name}</h2>
                <p className="text-sm text-gray-500">{selectedPatient.age} years • {selectedPatient.gender}</p>
                <div className="flex items-center mt-1">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                    {selectedPatient.ticketId}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Location:</span>
                <span className="text-gray-800 font-medium">{selectedPatient.location}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Booking:</span>
                <span className="text-gray-800 font-medium">{selectedPatient.bookingDate} • {selectedPatient.bookingTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Arrival Time:</span>
                <span className="text-gray-800 font-medium">{selectedPatient.arrivalTime}</span>
              </div>
            </div>
          </div>
          
          <h2 className="font-bold text-lg mb-3 text-gray-800">Vital Signs</h2>
          
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Heart size={16} className="text-red-500 mr-2" />
                  Blood Pressure (mmHg)
                </label>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-lg p-3 text-center" 
                      placeholder="Systolic"
                      value={formValues.systolic}
                      onChange={(e) => handleInputChange('systolic', e.target.value)}
                    />
                    <p className="text-xs text-center text-gray-500 mt-1">Systolic</p>
                  </div>
                  <div className="flex items-center text-gray-400">/</div>
                  <div className="flex-1">
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-lg p-3 text-center" 
                      placeholder="Diastolic"
                      value={formValues.diastolic}
                      onChange={(e) => handleInputChange('diastolic', e.target.value)}
                    />
                    <p className="text-xs text-center text-gray-500 mt-1">Diastolic</p>
                  </div>
                </div>
                <div className="mt-1 flex items-center text-xs text-gray-500">
                  <Info size={12} className="mr-1" />
                  Normal range: 90-120 / 60-80 mmHg
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <HeartPulse size={16} className="text-pink-500 mr-2" />
                  Heart Rate (bpm)
                </label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg p-3" 
                  placeholder="Heart rate in beats per minute"
                  value={formValues.heartRate}
                  onChange={(e) => handleInputChange('heartRate', e.target.value)}
                />
                <div className="mt-1 flex items-center text-xs text-gray-500">
                  <Info size={12} className="mr-1" />
                  Normal range: 60-100 bpm
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Thermometer size={16} className="text-orange-500 mr-2" />
                  Body Temperature (°C)
                </label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg p-3" 
                  placeholder="Body temperature in Celsius"
                  value={formValues.temperature}
                  onChange={(e) => handleInputChange('temperature', e.target.value)}
                />
                <div className="mt-1 flex items-center text-xs text-gray-500">
                  <Info size={12} className="mr-1" />
                  Normal range: 36.1-37.2°C
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Stethoscope size={16} className="text-blue-500 mr-2" />
                  Respiration Rate (breaths/min)
                </label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg p-3" 
                  placeholder="Breaths per minute"
                  value={formValues.respirationRate}
                  onChange={(e) => handleInputChange('respirationRate', e.target.value)}
                />
                <div className="mt-1 flex items-center text-xs text-gray-500">
                  <Info size={12} className="mr-1" />
                  Normal range: 12-20 breaths/min
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Droplet size={16} className="text-indigo-500 mr-2" />
                  Oxygen Saturation (%)
                </label>
                <input 
                  type="text" 
                  className="w-full border border-gray-300 rounded-lg p-3" 
                  placeholder="SpO2 percentage"
                  value={formValues.oxygenSaturation}
                  onChange={(e) => handleInputChange('oxygenSaturation', e.target.value)}
                />
                <div className="mt-1 flex items-center text-xs text-gray-500">
                  <Info size={12} className="mr-1" />
                  Normal range: 95-100%
                </div>
              </div>
            </div>
            
            <button 
              onClick={saveVitalSigns}
              className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium mt-6"
              disabled={
                !formValues.systolic ||
                !formValues.diastolic ||
                !formValues.heartRate ||
                !formValues.temperature ||
                !formValues.respirationRate ||
                !formValues.oxygenSaturation
              }
            >
              Continue to Results
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Results Screen - truncated for brevity, similar fixes applied for input fields
  const ResultsScreen = () => {
    // Helper function to determine if a vital sign is normal
    const isNormal = {
      systolic: (value) => value >= 90 && value <= 120,
      diastolic: (value) => value >= 60 && value <= 80,
      heartRate: (value) => value >= 60 && value <= 100,
      temperature: (value) => value >= 36.1 && value <= 37.2,
      respirationRate: (value) => value >= 12 && value <= 20,
      oxygenSaturation: (value) => value >= 95 && value <= 100
    };

    // Count abnormal values
    const abnormalCount = [
      !isNormal.systolic(vitalSigns.bloodPressure.systolic),
      !isNormal.diastolic(vitalSigns.bloodPressure.diastolic),
      !isNormal.heartRate(vitalSigns.heartRate),
      !isNormal.temperature(vitalSigns.temperature),
      !isNormal.respirationRate(vitalSigns.respirationRate),
      !isNormal.oxygenSaturation(vitalSigns.oxygenSaturation)
    ].filter(Boolean).length;

    // Suggested recommendations based on abnormal count
    const suggestionOptions = [
      {
        title: "Fit for hiking",
        description: "All vital signs are within normal ranges. The patient is healthy and fit for hiking activities.",
        recommended: abnormalCount === 0,
        approvalLevel: "Approved"
      },
      {
        title: "Mild caution advised",
        description: "Some slight deviations from normal values. Advise patient to stay hydrated and take regular breaks.",
        recommended: abnormalCount === 1,
        approvalLevel: "Approved with caution"
      },
      {
        title: "Moderate risk - proceed with care",
        description: "Multiple abnormal vital signs detected. Recommend slower pace, frequent breaks, and staying on easier trails.",
        recommended: abnormalCount === 2,
        approvalLevel: "Limited approval"
      },
      {
        title: "Not recommended for hiking",
        description: "Several vital signs outside normal ranges. Hiking in this condition could pose health risks. Medical consultation recommended.",
        recommended: abnormalCount >= 3,
        approvalLevel: "Not approved"
      }
    ];

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white p-4 flex items-center shadow-sm">
          <button onClick={() => setCurrentScreen('exam')} className="mr-2">
            <ArrowLeft size={24} className="text-gray-800" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Examination Results</h1>
        </div>

        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-100 overflow-hidden mr-3">
                <img src={selectedPatient.photo} alt={selectedPatient.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-gray-800">{selectedPatient.name}</h2>
                <p className="text-sm text-gray-500">{selectedPatient.age} years • {selectedPatient.gender}</p>
              </div>
            </div>
            
            <h3 className="font-medium text-gray-800 mb-3">Vital Signs Summary</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className={`p-3 rounded-lg flex flex-col items-center ${isNormal.systolic(vitalSigns.bloodPressure.systolic) && isNormal.diastolic(vitalSigns.bloodPressure.diastolic) ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center mb-1">
                  <Heart size={16} className={`${isNormal.systolic(vitalSigns.bloodPressure.systolic) && isNormal.diastolic(vitalSigns.bloodPressure.diastolic) ? 'text-green-500' : 'text-red-500'} mr-1`} />
                  <span className="text-xs text-gray-600">Blood Pressure</span>
                </div>
                <span className="text-lg font-medium">{vitalSigns.bloodPressure.systolic}/{vitalSigns.bloodPressure.diastolic}</span>
                <span className="text-xs text-gray-500">mmHg</span>
              </div>
              
              <div className={`p-3 rounded-lg flex flex-col items-center ${isNormal.heartRate(vitalSigns.heartRate) ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center mb-1">
                  <HeartPulse size={16} className={`${isNormal.heartRate(vitalSigns.heartRate) ? 'text-green-500' : 'text-red-500'} mr-1`} />
                  <span className="text-xs text-gray-600">Heart Rate</span>
                </div>
                <span className="text-lg font-medium">{vitalSigns.heartRate}</span>
                <span className="text-xs text-gray-500">bpm</span>
              </div>
              
              <div className={`p-3 rounded-lg flex flex-col items-center ${isNormal.temperature(vitalSigns.temperature) ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center mb-1">
                  <Thermometer size={16} className={`${isNormal.temperature(vitalSigns.temperature) ? 'text-green-500' : 'text-red-500'} mr-1`} />
                  <span className="text-xs text-gray-600">Temperature</span>
                </div>
                <span className="text-lg font-medium">{vitalSigns.temperature}</span>
                <span className="text-xs text-gray-500">°C</span>
              </div>
              
              <div className={`p-3 rounded-lg flex flex-col items-center ${isNormal.respirationRate(vitalSigns.respirationRate) ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center mb-1">
                  <Stethoscope size={16} className={`${isNormal.respirationRate(vitalSigns.respirationRate) ? 'text-green-500' : 'text-red-500'} mr-1`} />
                  <span className="text-xs text-gray-600">Respiration</span>
                </div>
                <span className="text-lg font-medium">{vitalSigns.respirationRate}</span>
                <span className="text-xs text-gray-500">breaths/min</span>
              </div>
              
              <div className={`p-3 rounded-lg flex flex-col items-center ${isNormal.oxygenSaturation(vitalSigns.oxygenSaturation) ? 'bg-green-50' : 'bg-red-50'} col-span-2`}>
                <div className="flex items-center mb-1">
                  <Droplet size={16} className={`${isNormal.oxygenSaturation(vitalSigns.oxygenSaturation) ? 'text-green-500' : 'text-red-500'} mr-1`} />
                  <span className="text-xs text-gray-600">Oxygen Saturation</span>
                </div>
                <span className="text-lg font-medium">{vitalSigns.oxygenSaturation}%</span>
                <span className="text-xs text-gray-500">SpO2</span>
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-gray-50 mb-4">
              <h3 className="font-medium text-gray-800 mb-2">Suggested Recommendations</h3>
              
              <div className="space-y-3">
                {suggestionOptions.map((suggestion, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border ${suggestion.recommended ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} cursor-pointer`}
                    onClick={() => setRecommendations(suggestion.description)}
                  >
                    <div className="flex items-center mb-1">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 ${suggestion.recommended ? 'bg-blue-500 text-white' : 'border border-gray-300'}`}>
                        {suggestion.recommended && <Check size={12} />}
                      </div>
                      <h4 className="font-medium text-gray-800">{suggestion.title}</h4>
                      <span className={`ml-auto text-xs font-medium ${
                        suggestion.approvalLevel === "Approved" ? "text-green-600" :
                        suggestion.approvalLevel === "Approved with caution" ? "text-yellow-600" :
                        suggestion.approvalLevel === "Limited approval" ? "text-orange-600" :
                        "text-red-600"
                      }`}>
                        {suggestion.approvalLevel}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 ml-7">{suggestion.description}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recommendations & Notes
              </label>
              <textarea 
                className="w-full border border-gray-300 rounded-lg p-3" 
                rows={4}
                placeholder="Add your recommendations, notes, or special instructions for the patient..."
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
              ></textarea>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={handleSubmitResults}
                disabled={!recommendations || loading}
                className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-medium disabled:bg-gray-300 disabled:text-gray-500"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <ThumbsUp size={18} className="mr-2" />
                    <span>Approve & Submit</span>
                  </div>
                )}
              </button>
              
              <button 
                className="flex-1 bg-red-500 text-white py-3 rounded-xl font-medium"
                onClick={() => setCurrentScreen('patientList')}
              >
                <div className="flex items-center justify-center">
                  <ThumbsDown size={18} className="mr-2" />
                  <span>Not Approved</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Patient Detail and Settings screens remain largely the same
  
  // Render the appropriate screen based on the currentScreen state
  return (
    <div className="font-sans">
      {currentScreen === 'login' && <LoginScreen />}
      {currentScreen === 'home' && <HomeScreen />}
      {currentScreen === 'patientList' && <PatientListScreen />}
      {currentScreen === 'exam' && <ExamScreen />}
      {currentScreen === 'results' && <ResultsScreen />}
      {currentScreen === 'patientDetail' && <PatientDetailScreen />}
      {currentScreen === 'settings' && <SettingsScreen />}
      {currentScreen === 'printWristband' && <PrintWristbandScreen />}
    </div>
  );
};

export default MedicalStaffApp;
import React, { useState } from 'react';
import { MapPin, Calendar, Clock, User, Heart, Activity, TrendingUp, Home, Map, FileText, Settings, LogOut, Plus, ChevronRight, ArrowLeft, CloudSun, X, CheckCircle, AlertCircle, DollarSign, Mail, Search, Upload, Download, Eye } from 'lucide-react';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('login'); // login, home, screening, location, profile, form1, form2, form3, form4, form5, form6, partner, details, receipt, viewTicket
  const [language, setLanguage] = useState('en');
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('bank');
  const [selectedDate, setSelectedDate] = useState(15);
  const [selectedTime, setSelectedTime] = useState('morning');
  const [participants, setParticipants] = useState([{ title: 'Mr', name: '', age: '', nationality: '', hasMedicalHistory: false, allergies: '', pastMedicalHistory: '', currentMedications: '', familyMedicalHistory: '' }]);

  const texts = {
    en: {
      login: "Login",
      email: "Email",
      password: "Password",
      loginWithGoogle: "Login with Google",
      loginWithEmail: "Login with Email",
      hello: "Hello",
      weather: "Ijen Weather Forecast",
      healthScreening: "Health Screening",
      history: "Submission History",
      track: "Ijen Track Map",
      prepare: "What to Prepare",
      partner: "Become a Partner",
      pending: "Pending",
      complete: "Complete",
      location: "Location",
      profile: "Profile",
      privacy: "Privacy Policy",
      terms: "Terms and Conditions",
      logout: "Logout",
      selectLocation: "Select Location",
      yourData: "Your Data",
      name: "Name",
      age: "Age",
      nationality: "Nationality",
      medicalHistory: "Medical History",
      allergies: "Allergies",
      pastMedical: "Past Medical History",
      currentMeds: "Current Medications",
      familyMedical: "Family Medical History",
      summary: "Summary",
      total: "Total",
      payment: "Payment Options",
      submit: "Submit",
      next: "Next",
      addParticipant: "Add Participant"
    },
    id: {
      login: "Masuk",
      email: "Email",
      password: "Kata Sandi",
      loginWithGoogle: "Masuk dengan Google",
      loginWithEmail: "Masuk dengan Email",
      hello: "Halo",
      weather: "Prakiraan Cuaca Ijen",
      healthScreening: "Pemeriksaan Kesehatan",
      history: "Riwayat Pengajuan",
      track: "Peta Jalur Ijen",
      prepare: "Apa yang Harus Disiapkan",
      partner: "Menjadi Mitra",
      pending: "Tertunda",
      complete: "Selesai",
      location: "Lokasi",
      profile: "Profil",
      privacy: "Kebijakan Privasi",
      terms: "Syarat dan Ketentuan",
      logout: "Keluar",
      selectLocation: "Pilih Lokasi",
      yourData: "Data Anda",
      name: "Nama",
      age: "Usia",
      nationality: "Kewarganegaraan",
      medicalHistory: "Riwayat Kesehatan",
      allergies: "Alergi",
      pastMedical: "Riwayat Medis",
      currentMeds: "Obat yang Sedang Dikonsumsi",
      familyMedical: "Riwayat Kesehatan Keluarga",
      summary: "Ringkasan",
      total: "Total",
      payment: "Pilihan Pembayaran",
      submit: "Kirim",
      next: "Selanjutnya",
      addParticipant: "Tambah Peserta"
    }
  };

  const t = texts[language];

  const addParticipant = () => {
    setParticipants([...participants, { title: 'Mr', name: '', age: '', nationality: '', hasMedicalHistory: false, allergies: '', pastMedicalHistory: '', currentMedications: '', familyMedicalHistory: '' }]);
  };

  const renderBottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg flex justify-around py-3 border-t">
      <button onClick={() => setCurrentScreen('home')} className={`flex flex-col items-center ${currentScreen === 'home' ? 'text-blue-500' : 'text-gray-500'}`}>
        <Home size={20} />
        <span className="text-xs mt-1">Home</span>
      </button>
      <button onClick={() => setCurrentScreen('screening')} className={`flex flex-col items-center ${currentScreen === 'screening' ? 'text-blue-500' : 'text-gray-500'}`}>
        <Heart size={20} />
        <span className="text-xs mt-1">Screening</span>
      </button>
      <button onClick={() => setCurrentScreen('location')} className={`flex flex-col items-center ${currentScreen === 'location' ? 'text-blue-500' : 'text-gray-500'}`}>
        <Map size={20} />
        <span className="text-xs mt-1">Location</span>
      </button>
      <button onClick={() => setCurrentScreen('profile')} className={`flex flex-col items-center ${currentScreen === 'profile' ? 'text-blue-500' : 'text-gray-500'}`}>
        <User size={20} />
        <span className="text-xs mt-1">Profile</span>
      </button>
    </div>
  );

  const LoginScreen = () => (
    <div className="min-h-screen flex flex-col p-6 bg-gradient-to-b from-blue-500 to-indigo-600">
      <div className="flex justify-end mb-6">
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-white bg-opacity-20 text-white border border-white border-opacity-20 rounded-md px-2 py-1"
        >
          <option value="en">English</option>
          <option value="id">Bahasa</option>
        </select>
      </div>
      
      <div className="flex-1 flex flex-col justify-center items-center text-white">
        <div className="mb-12 text-center">
          <div className="bg-white rounded-full p-5 inline-block mb-4">
            <Activity size={40} className="text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold">Ijen Health</h1>
          <p className="opacity-80 mt-2">Health screening for your safe journey</p>
        </div>
        
        <div className="w-full space-y-4">
          <button 
            onClick={() => setCurrentScreen('home')} 
            className="w-full bg-white py-3 px-6 rounded-xl flex items-center justify-center space-x-2 text-blue-600 font-medium"
          >
            <img src="https://cdn.pixabay.com/photo/2021/05/24/09/15/google-logo-6278331_1280.png" alt="Google logo" className="w-5 h-5 rounded-full" />
            <span>{t.loginWithGoogle}</span>
          </button>
          
          <button 
            onClick={() => setCurrentScreen('home')}
            className="w-full bg-blue-400 bg-opacity-20 border border-white border-opacity-30 py-3 px-6 rounded-xl flex items-center justify-center space-x-2 text-white font-medium"
          >
            <Mail size={18} />
            <span>{t.loginWithEmail}</span>
          </button>
        </div>
      </div>
      
      <div className="mt-8 text-center text-white text-opacity-70 text-sm">
        <p>By continuing, you agree to our</p>
        <div className="flex justify-center space-x-1">
          <button className="underline">{t.terms}</button>
          <span>&</span>
          <button className="underline">{t.privacy}</button>
        </div>
      </div>
    </div>
  );

  const HomeScreen = () => (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-blue-500 text-white p-6 pt-12 rounded-b-3xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-blue-100">{t.hello}</p>
            <h1 className="text-2xl font-bold">Arif Hassan</h1>
          </div>
          <div className="w-12 h-12 bg-white rounded-full overflow-hidden">
            <img src="https://cdn-icons-png.flaticon.com/128/17561/17561717.png" alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
        
        <div className="bg-white bg-opacity-20 p-4 rounded-xl flex items-center mb-2">
          <CloudSun size={24} className="mr-3 text-yellow-300" />
          <div>
            <h3 className="font-medium">{t.weather}</h3>
            <p className="text-sm text-blue-100">16°C - 22°C, Partly Cloudy</p>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-6">
        <div className="bg-blue-600 rounded-xl p-5 mb-6 text-white flex justify-between items-center shadow-md">
          <div>
            <h3 className="font-bold text-lg">{t.healthScreening}</h3>
            <p className="text-sm text-blue-100">Complete your health check</p>
          </div>
          <button 
            onClick={() => setCurrentScreen('form1')}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium text-sm"
          >
            Start
          </button>
        </div>
        
        <h2 className="font-bold text-lg mb-3 text-gray-800">Recent Submissions</h2>
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
                <FileText size={18} />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Paltuding Entry Point</h3>
                <p className="text-xs text-gray-500">15 May 2023 • 2 participants</p>
              </div>
            </div>
            <div className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
              {t.pending}
            </div>
          </div>
          <button 
            className="w-full flex justify-center items-center py-2 text-blue-500 text-sm font-medium border-t border-gray-100 mt-2"
            onClick={() => setCurrentScreen('screening')}
          >
            View Details
          </button>
        </div>
        
        <h2 className="font-bold text-lg mb-3 text-gray-800">Ijen Track Map</h2>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6 border border-gray-100">
          <div className="h-40 bg-blue-100 relative">
            <img src="https://tracedetrail.fr/traces/maps/MapTrace269148_3463.jpg" alt="Map" className="w-full h-full object-cover" />
          </div>
          <div className="p-4">
            <h3 className="font-medium text-gray-800">3 Entry Points Available</h3>
            <p className="text-xs text-gray-500 mb-3">Check the best route for your journey</p>
            <button 
              className="w-full flex justify-center items-center py-2 text-blue-500 text-sm font-medium border-t border-gray-100 mt-2"
              onClick={() => setCurrentScreen('location')}
            >
              View Full Map
            </button>
          </div>
        </div>
        
        <h2 className="font-bold text-lg mb-3 text-gray-800">What to Prepare</h2>
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
          <div className="flex items-start mb-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-3 mt-1 flex-shrink-0">
              <CheckCircle size={16} />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Warm Clothing</h3>
              <p className="text-xs text-gray-500">Temperature can drop to 2°C at night</p>
            </div>
          </div>
          <div className="flex items-start mb-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-3 mt-1 flex-shrink-0">
              <CheckCircle size={16} />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Gas Mask</h3>
              <p className="text-xs text-gray-500">Protect yourself from sulfur gas</p>
            </div>
          </div>
          <div className="flex items-start mb-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-500 mr-3 mt-1 flex-shrink-0">
              <CheckCircle size={16} />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Water & Snacks</h3>
              <p className="text-xs text-gray-500">Stay hydrated and energized</p>
            </div>
          </div>
          <button 
            className="w-full flex justify-center items-center py-2 text-blue-500 text-sm font-medium border-t border-gray-100 mt-2"
          >
            View Complete List
          </button>
        </div>
      </div>

      {renderBottomNav()}
    </div>
  );

  const ScreeningScreen = () => (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-4 flex items-center shadow-sm">
        <h1 className="text-xl font-bold text-gray-800 flex-1 text-center">{t.healthScreening}</h1>
      </div>

      <div className="p-4 flex space-x-2 mb-2">
        <button 
          className={`flex-1 py-2 px-4 rounded-full ${activeTab === 'pending' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} font-medium`}
          onClick={() => setActiveTab('pending')}
        >
          {t.pending}
        </button>
        <button 
          className={`flex-1 py-2 px-4 rounded-full ${activeTab === 'complete' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} font-medium`}
          onClick={() => setActiveTab('complete')}
        >
          {t.complete}
        </button>
      </div>

      <div className="px-4 py-2">
        {activeTab === 'pending' ? (
          <>
            <div 
              className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100"
              onClick={() => setCurrentScreen('details')}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Paltuding Entry Point</h3>
                    <p className="text-xs text-gray-500">15 May 2023 • 2 participants</p>
                  </div>
                </div>
                <div className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
                  {t.pending}
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-500 border-t border-gray-100 pt-3 mt-2">
                <div>
                  <p className="flex items-center"><Calendar size={14} className="mr-1" /> 15 May 2023</p>
                </div>
                <div>
                  <p className="flex items-center"><Clock size={14} className="mr-1" /> 05:00 AM</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div 
              className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-gray-100"
              onClick={() => setCurrentScreen('details')}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">Banyuwangi Entry Point</h3>
                    <p className="text-xs text-gray-500">10 May 2023 • 1 participant</p>
                  </div>
                </div>
                <div className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                  {t.complete}
                </div>
              </div>
              <div className="flex justify-between text-sm text-gray-500 border-t border-gray-100 pt-3 mt-2">
                <div>
                  <p className="flex items-center"><Calendar size={14} className="mr-1" /> 10 May 2023</p>
                </div>
                <div>
                  <p className="flex items-center"><Clock size={14} className="mr-1" /> 04:30 AM</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <button className="fixed right-6 bottom-20 w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center shadow-lg text-white" onClick={() => setCurrentScreen('form1')}>
        <Plus size={24} />
      </button>

      {renderBottomNav()}
    </div>
  );

  const LocationScreen = () => (
    <div className="min-h-screen bg-gray-50 pb-20 relative">
      <div className="bg-white p-4 flex items-center shadow-sm">
        <button onClick={() => setCurrentScreen('home')} className="mr-2">
          <ArrowLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-800 flex-1">{t.location}</h1>
      </div>

      <div className="p-4">
        <div className="relative mb-4">
          <input 
            type="text" 
            placeholder="Search locations..." 
            className="w-full bg-white rounded-lg py-3 px-4 pl-10 shadow-sm border border-gray-200"
          />
          <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
        </div>
      </div>

      <div className="h-96 bg-blue-100 relative">
        <img src="https://i.ibb.co.com/cc2L21Q0/Screenshot-9.jpg" alt="Map" className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white p-3 rounded-full shadow-md">
            <MapPin size={24} className="text-blue-500" />
          </div>
        </div>
        <div className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md">
          <Search size={20} className="text-gray-600" />
        </div>
      </div>

      <div className="bg-white rounded-t-3xl -mt-6 p-6 relative z-10 shadow-md">
        <h2 className="font-bold text-lg mb-4 text-gray-800">Entry Points</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3">
                <MapPin size={18} />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Paltuding</h3>
                <p className="text-xs text-gray-500">Most popular entry point</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3">
                <MapPin size={18} />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Banyuwangi</h3>
                <p className="text-xs text-gray-500">Eastern entry point</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3">
                <MapPin size={18} />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Bondowoso</h3>
                <p className="text-xs text-gray-500">Northern entry point</p>
              </div>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </div>
        </div>
        
        <button 
          className="mt-6 w-full bg-blue-500 text-white py-3 rounded-xl font-medium"
          onClick={() => setCurrentScreen('partner')}
        >
          {t.partner}
        </button>
      </div>

      {renderBottomNav()}
    </div>
  );

  const ProfileScreen = () => (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-4 flex items-center shadow-sm">
        <h1 className="text-xl font-bold text-gray-800 flex-1 text-center">Profile</h1>
      </div>

      <div className="p-6 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-blue-100 overflow-hidden mb-3">
          <img src="/api/placeholder/96/96" alt="Profile" className="w-full h-full object-cover" />
        </div>
        <h2 className="font-bold text-xl text-gray-800">Arif Hassan</h2>
        <p className="text-gray-500 mb-6">arif.hassan@example.com</p>

        <div className="w-full space-y-4">
          <button className="w-full flex justify-between items-center p-4 bg-white rounded-xl shadow-sm">
            <div className="flex items-center">
              <Settings size={20} className="text-gray-500 mr-3" />
              <span>Account Settings</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
          
          <button className="w-full flex justify-between items-center p-4 bg-white rounded-xl shadow-sm">
            <div className="flex items-center">
              <FileText size={20} className="text-gray-500 mr-3" />
              <span>{t.privacy}</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
          
          <button className="w-full flex justify-between items-center p-4 bg-white rounded-xl shadow-sm">
            <div className="flex items-center">
              <FileText size={20} className="text-gray-500 mr-3" />
              <span>{t.terms}</span>
            </div>
            <ChevronRight size={20} className="text-gray-400" />
          </button>
          
          <button 
            className="w-full flex justify-between items-center p-4 bg-white rounded-xl shadow-sm text-red-500"
            onClick={() => setCurrentScreen('login')}
          >
            <div className="flex items-center">
              <LogOut size={20} className="mr-3" />
              <span>{t.logout}</span>
            </div>
          </button>
        </div>
      </div>

      {renderBottomNav()}
    </div>
  );

  const Form1Screen = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 flex items-center shadow-sm">
        <button onClick={() => setCurrentScreen('home')} className="mr-2">
          <ArrowLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">{t.selectLocation}</h1>
      </div>

      <div className="h-64 bg-blue-100 relative">
        <img src="https://i.ibb.co.com/cc2L21Q0/Screenshot-9.jpg" alt="Map" className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white p-3 rounded-full shadow-md">
            <MapPin size={24} className="text-blue-500" />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <h2 className="font-bold text-lg mb-4 text-gray-800">Selected Location</h2>
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Paltuding Entry Point</h3>
              <p className="text-xs text-gray-500">Most popular route to Ijen Crater</p>
            </div>
          </div>
          
          <h3 className="font-medium text-gray-800 mb-2">Select Date & Time</h3>
          <div className="flex overflow-x-auto pb-2 mb-4 space-x-2">
            {[14, 15, 16, 17, 18, 19, 20].map(day => (
              <div 
                key={day} 
                className={`flex-shrink-0 w-12 h-16 rounded-lg ${day === selectedDate ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'} flex flex-col items-center justify-center cursor-pointer`}
                onClick={() => setSelectedDate(day)}
              >
                <span className="text-xs opacity-80">MAY</span>
                <span className="text-lg font-bold">{day}</span>
              </div>
            ))}
          </div>
          
          <div className="flex space-x-2 mb-4">
            <div 
              className={`flex-1 p-3 rounded-lg ${selectedTime === 'morning' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'} flex flex-col items-center cursor-pointer`}
              onClick={() => setSelectedTime('morning')}
            >
              <span className="text-xs opacity-80">Start Time</span>
              <span className="text-lg font-bold">04:30 AM</span>
            </div>
            <div 
              className={`flex-1 p-3 rounded-lg ${selectedTime === 'afternoon' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'} flex flex-col items-center cursor-pointer`}
              onClick={() => setSelectedTime('afternoon')}
            >
              <span className="text-xs opacity-80">End Time</span>
              <span className="text-lg font-bold">10:00 AM</span>
            </div>
          </div>

          <button 
            onClick={() => setCurrentScreen('form2')} 
            className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium"
          >
            {t.next}
          </button>
        </div>
      </div>
    </div>
  );

  const Form2Screen = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 flex items-center shadow-sm">
        <button onClick={() => setCurrentScreen('form1')} className="mr-2">
          <ArrowLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Participant Information</h1>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <h2 className="font-bold text-lg mb-4 text-gray-800">{t.yourData}</h2>
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.name}</label>
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg p-3"
                value="Arif Hassan"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.email}</label>
              <input 
                type="email" 
                className="w-full border border-gray-300 rounded-lg p-3"
                value="arif.hassan@example.com"
                readOnly
              />
            </div>
          </div>
        </div>

        {participants.map((participant, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg text-gray-800">Participant {index + 1}</h2>
              {index > 0 && (
                <button className="text-red-500" onClick={() => setParticipants(participants.filter((_, i) => i !== index))}>
                  <X size={20} />
                </button>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="flex space-x-3">
                <div className="w-24">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <select className="w-full border border-gray-300 rounded-lg p-3">
                    <option>Mr</option>
                    <option>Mrs</option>
                    <option>Ms</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.name}</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg p-3" />
                </div>
              </div>
              
              <div className="flex space-x-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.age}</label>
                  <input type="number" className="w-full border border-gray-300 rounded-lg p-3" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.nationality}</label>
                  <select className="w-full border border-gray-300 rounded-lg p-3">
                    <option>Indonesia</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">{t.medicalHistory}</span>
                <div className={`w-12 h-6 rounded-full ${participant.hasMedicalHistory ? 'bg-blue-500' : 'bg-gray-300'} flex items-center p-1 transition-all duration-200`}>
                  <div 
                    className={`w-4 h-4 rounded-full bg-white transform transition-all duration-200 ${participant.hasMedicalHistory ? 'translate-x-6' : ''}`}
                    onClick={() => {
                      const newParticipants = [...participants];
                      newParticipants[index].hasMedicalHistory = !newParticipants[index].hasMedicalHistory;
                      setParticipants(newParticipants);
                    }}
                  ></div>
                </div>
              </div>
              
              {participant.hasMedicalHistory && (
                <div className="space-y-4 p-3 bg-blue-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.allergies}</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg p-3" placeholder="List any allergies" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.pastMedical}</label>
                    <textarea className="w-full border border-gray-300 rounded-lg p-3" rows={2} placeholder="Describe any past medical conditions"></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.currentMeds}</label>
                    <input type="text" className="w-full border border-gray-300 rounded-lg p-3" placeholder="List current medications" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.familyMedical}</label>
                    <textarea className="w-full border border-gray-300 rounded-lg p-3" rows={2} placeholder="Any relevant family medical history"></textarea>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        <button 
          onClick={addParticipant}
          className="w-full mb-4 border-2 border-dashed border-blue-300 text-blue-500 py-3 rounded-xl font-medium flex items-center justify-center"
        >
          <Plus size={20} className="mr-2" />
          {t.addParticipant}
        </button>

        <button 
          onClick={() => setCurrentScreen('form3')} 
          className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium mb-6"
        >
          {t.next}
        </button>
      </div>
    </div>
  );

  const Form3Screen = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 flex items-center shadow-sm">
        <button onClick={() => setCurrentScreen('form2')} className="mr-2">
          <ArrowLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">{t.summary}</h1>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <h2 className="font-bold text-lg mb-4 text-gray-800">Screening Details</h2>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-3">
            <span className="text-gray-700">Location</span>
            <span className="font-medium">Paltuding Entry Point</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-3">
            <span className="text-gray-700">Date</span>
            <span className="font-medium">15 May 2023</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-3">
            <span className="text-gray-700">Time</span>
            <span className="font-medium">04:30 AM - 10:00 AM</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-3">
            <span className="text-gray-700">Participants</span>
            <span className="font-medium">{participants.length}</span>
          </div>

          <h2 className="font-bold text-lg my-4 text-gray-800">{t.payment}</h2>
          
          <div className="space-y-3 mb-4">
            <div 
              className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer"
              onClick={() => setSelectedPaymentMethod('bank')}
            >
              <div className="w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center mr-3">
                {selectedPaymentMethod === 'bank' && (
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Bank Transfer</h3>
                <p className="text-xs text-gray-500">Manual verification (1-2 hours)</p>
              </div>
            </div>
            
            <div 
              className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer"
              onClick={() => setSelectedPaymentMethod('card')}
            >
              <div className="w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center mr-3">
                {selectedPaymentMethod === 'card' && (
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Credit/Debit Card</h3>
                <p className="text-xs text-gray-500">Instant verification</p>
              </div>
            </div>
            
            <div 
              className="flex items-center p-3 bg-gray-50 rounded-lg cursor-pointer"
              onClick={() => setSelectedPaymentMethod('ewallet')}
            >
              <div className="w-6 h-6 rounded-full border-2 border-blue-500 flex items-center justify-center mr-3">
                {selectedPaymentMethod === 'ewallet' && (
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">E-Wallet</h3>
                <p className="text-xs text-gray-500">Instant verification</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">Screening Fee</span>
              <span>Rp 50,000 x {participants.length}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">Service Fee</span>
              <span>Rp 5,000</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-4">
              <span>{t.total}</span>
              <span>Rp {50000 * participants.length + 5000}</span>
            </div>
          </div>

          <button 
            onClick={() => setCurrentScreen('form4')} 
            className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium"
          >
            {t.submit}
          </button>
        </div>
      </div>
    </div>
  );

  const Form4Screen = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white p-4 flex items-center shadow-sm">
        <h1 className="text-xl font-bold text-gray-800 flex-1 text-center">Confirmation</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-6">
          <CheckCircle size={48} className="text-blue-500" />
        </div>
        
        <h2 className="font-bold text-2xl text-gray-800 mb-2">Screening Submitted</h2>
        <p className="text-gray-600 mb-8">Please complete the payment to finalize your screening</p>
        
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 w-full">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-700">Amount</span>
            <span className="font-bold text-xl">Rp {50000 * participants.length + 5000}</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-3">
            <span className="text-gray-700">Reference ID</span>
            <span className="font-medium">IJN230515001</span>
          </div>
        </div>
        
        <button 
          onClick={() => setCurrentScreen('form5')} 
          className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium mb-3"
        >
          <DollarSign size={18} className="inline mr-2" />
          Proceed to Payment
        </button>
        
        <button 
          onClick={() => setCurrentScreen('home')} 
          className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-medium"
        >
          Back to Home
        </button>
      </div>
    </div>
  );

  const Form5Screen = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white p-4 flex items-center shadow-sm">
        <button onClick={() => setCurrentScreen('form4')} className="mr-2">
          <ArrowLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Payment</h1>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <h2 className="font-bold text-lg mb-4 text-gray-800">Payment Details</h2>
          
          <div className="p-4 bg-blue-50 rounded-lg mb-4">
            <h3 className="font-medium mb-2">Bank Transfer Instructions</h3>
            <ol className="text-sm text-gray-700 space-y-2 pl-5 list-decimal">
              <li>Transfer the exact amount shown below</li>
              <li>Include the reference ID in the transfer notes</li>
              <li>Complete payment within 24 hours</li>
              <li>Upload your payment receipt</li>
            </ol>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-3">
            <span className="text-gray-700">Bank</span>
            <span className="font-medium">Bank Central Asia (BCA)</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-3">
            <span className="text-gray-700">Account Number</span>
            <div className="flex items-center">
              <span className="font-medium mr-2">1234567890</span>
              <button className="text-blue-500 text-xs">Copy</button>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-3">
            <span className="text-gray-700">Account Name</span>
            <span className="font-medium">Ijen Health Services</span>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-3">
            <span className="text-gray-700">Amount</span>
            <div className="flex items-center">
              <span className="font-medium mr-2">Rp {50000 * participants.length + 5000}</span>
              <button className="text-blue-500 text-xs">Copy</button>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-3">
            <span className="text-gray-700">Reference ID</span>
            <div className="flex items-center">
              <span className="font-medium mr-2">IJN230515001</span>
              <button className="text-blue-500 text-xs">Copy</button>
            </div>
          </div>
          
          <div className="mt-4 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Payment Receipt</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                <Upload size={24} className="text-blue-500" />
              </div>
              <p className="text-sm text-gray-500 text-center mb-2">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-400 text-center">PNG, JPG up to 5MB</p>
            </div>
          </div>
          
          <button 
            onClick={() => setCurrentScreen('form6')} 
            className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium"
          >
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  );

  const Form6Screen = () => (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <CheckCircle size={48} className="text-green-500" />
        </div>
        
        <h2 className="font-bold text-2xl text-gray-800 mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-8">Your health screening has been confirmed</p>
        
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 w-full">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700">Location</span>
            <span className="font-medium">Paltuding Entry Point</span>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700">Date</span>
            <span className="font-medium">15 May 2023</span>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700">Time</span>
            <span className="font-medium">04:30 AM</span>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700">Participants</span>
            <span className="font-medium">{participants.length}</span>
          </div>
          
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start">
              <AlertCircle size={18} className="text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-green-800">Please arrive 15 minutes before your scheduled time for check-in</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setCurrentScreen('home')} 
          className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium mb-3"
        >
          Back to Home
        </button>
        
        <button onClick={() => setCurrentScreen('viewTicket')} className="text-blue-500 font-medium">
          View E-Ticket
        </button>
      </div>
    </div>
  );

  const DetailScreen = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 flex items-center shadow-sm">
        <button onClick={() => setCurrentScreen('screening')} className="mr-2">
          <ArrowLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Screening Details</h1>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 mr-3">
                <MapPin size={20} />
              </div>
              <div>
                <h3 className="font-medium text-gray-800">Paltuding Entry Point</h3>
                <p className="text-xs text-gray-500">15 May 2023</p>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
              {t.pending}
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Reference ID</span>
              <span className="font-medium">IJN230515001</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Date</span>
              <span className="font-medium">15 May 2023</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Time</span>
              <span className="font-medium">04:30 AM - 10:00 AM</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Status</span>
              <span className="font-medium text-yellow-600">Waiting for Payment</span>
            </div>
          </div>

          <h3 className="font-medium text-gray-800 mb-3">Participants (2)</h3>
          
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <div className="flex justify-between mb-1">
              <span className="text-gray-700">Mr. Arif Hassan</span>
              <span className="text-sm text-gray-500">35 years</span>
            </div>
            <p className="text-xs text-gray-500">No medical history</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex justify-between mb-1">
              <span className="text-gray-700">Mrs. Sarah Lee</span>
              <span className="text-sm text-gray-500">32 years</span>
            </div>
            <p className="text-xs text-gray-500">Allergic to dust</p>
          </div>

          <div className="border-t border-gray-200 pt-4 mb-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">Screening Fee</span>
              <span>Rp 50,000 x 2</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-700">Service Fee</span>
              <span>Rp 5,000</span>
            </div>
            <div className="flex justify-between font-bold text-lg mt-4">
              <span>{t.total}</span>
              <span>Rp 105,000</span>
            </div>
          </div>
          
          <button 
            onClick={() => setCurrentScreen('form4')}
            className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium"
          >
            Continue to Payment
          </button>
        </div>
      </div>
    </div>
  );
  
  const PartnerScreen = () => (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 flex items-center shadow-sm">
        <button onClick={() => setCurrentScreen('location')} className="mr-2">
          <ArrowLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">{t.partner}</h1>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <h2 className="font-bold text-lg mb-4 text-gray-800">Partner Application</h2>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg p-3" placeholder="Enter your business name" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
              <select className="w-full border border-gray-300 rounded-lg p-3">
                <option>Tour Guide</option>
                <option>Tour Operator</option>
                <option>Transportation Provider</option>
                <option>Accommodation</option>
                <option>Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
              <input type="text" className="w-full border border-gray-300 rounded-lg p-3" placeholder="Full name" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input type="email" className="w-full border border-gray-300 rounded-lg p-3" placeholder="email@example.com" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" className="w-full border border-gray-300 rounded-lg p-3" placeholder="+62..." />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Address</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3" rows={3} placeholder="Enter your business address"></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Why do you want to become a partner?</label>
              <textarea className="w-full border border-gray-300 rounded-lg p-3" rows={3} placeholder="Tell us about your interest"></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business License</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <Upload size={24} className="text-blue-500" />
                </div>
                <p className="text-sm text-gray-500 text-center mb-2">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-400 text-center">PDF, PNG, JPG up to 5MB</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={() => setCurrentScreen('home')}
            className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium"
          >
            Submit Application
          </button>
        </div>
      </div>
    </div>
  );

  const ReceiptScreen = () => {
    return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white p-4 flex items-center shadow-sm">
        <button onClick={() => setCurrentScreen('form6')} className="mr-2">
          <ArrowLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">E-Ticket</h1>
        <button onClick={() => setCurrentScreen('viewTicket')} className="ml-auto text-blue-500">
          <Eye size={20} />
        </button>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-bold text-lg text-gray-800">Ijen Health Screening</h2>
              <p className="text-xs text-gray-500">E-Ticket for Health Check</p>
            </div>
            <div className="w-16 h-16">
              <Activity size={24} className="text-blue-500" />
            </div>
          </div>
          
          <div className="border-t border-b border-dashed border-gray-200 py-4 mb-4">
            <div className="flex justify-center mb-4">
              <div className="p-2 bg-white rounded-lg border border-gray-200">
                <img src="https://docs.lightburnsoftware.com/legacy/img/QRCode/ExampleCode.png" alt="QR Code" className="w-32 h-32" />
              </div>
            </div>
            <p className="text-center text-sm text-gray-500 mb-1">Reference ID</p>
            <p className="text-center font-bold text-lg">IJN230515001</p>
          </div>
          
          <div className="space-y-3 mb-5">
            <div className="flex justify-between">
              <span className="text-gray-600">Location</span>
              <span className="font-medium">Paltuding Entry Point</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Date</span>
              <span className="font-medium">15 May 2023</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Time</span>
              <span className="font-medium">04:30 AM</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span className="font-medium text-green-600">Confirmed</span>
            </div>
          </div>
          
          <h3 className="font-medium text-gray-800 mb-2">Participants</h3>
          <div className="bg-gray-50 rounded-lg p-3 mb-2">
            <div className="flex justify-between">
              <span className="font-medium">Mr. Arif Hassan</span>
              <span className="text-sm text-gray-500">35 years</span>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <div className="flex justify-between">
              <span className="font-medium">Mrs. Sarah Lee</span>
              <span className="text-sm text-gray-500">32 years</span>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500 mb-2">Please arrive 15 minutes before your scheduled time. Present this e-ticket to the health screening staff upon arrival.</p>
            <p className="text-xs text-gray-500">For any questions or changes, please contact our support at support@ijen-health.com</p>
          </div>
        </div>
        
        <div className="space-y-3">
          <button 
            onClick={() => setCurrentScreen('viewTicket')}
            className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium"
          >
            <Eye size={18} className="inline mr-2" />
            View E-Ticket
          </button>
          
          <button 
            onClick={() => setCurrentScreen('home')}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
    );
  };

  const ViewTicketScreen = () => (
    <div className="min-h-screen bg-blue-600">
      <div className="bg-white p-4 flex items-center shadow-sm">
        <button onClick={() => setCurrentScreen('form6')} className="mr-2">
          <ArrowLeft size={24} className="text-gray-800" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">E-Ticket</h1>
        <button onClick={() => window.print()} className="ml-auto text-blue-500">
          <Download size={20} />
        </button>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="bg-blue-500 p-5 text-white">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-bold text-xl">Ijen Health Pass</h2>
                <p className="text-sm opacity-90">Health Screening Confirmation</p>
              </div>
              <Activity size={28} />
            </div>
          </div>
          
          <div className="p-5">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-white rounded-lg shadow-md border border-gray-200">
                <img src="https://docs.lightburnsoftware.com/legacy/img/QRCode/ExampleCode.png" alt="QR Code" className="w-48 h-48" />
              </div>
            </div>
            
            <div className="text-center mb-6">
              <p className="text-sm text-gray-500">Reference ID</p>
              <p className="text-2xl font-bold text-gray-800">IJN230515001</p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <MapPin size={20} className="text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="font-medium">Paltuding Entry Point</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar size={20} className="text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium">15 May 2023</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock size={20} className="text-blue-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-medium">04:30 AM</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-dashed border-gray-200 pt-4">
              <h3 className="font-medium text-gray-800 mb-3">Participants</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                    <User size={16} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">Mr. Arif Hassan</p>
                    <p className="text-xs text-gray-500">35 years</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                    <User size={16} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">Mrs. Sarah Lee</p>
                    <p className="text-xs text-gray-500">32 years</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="flex">
                <CheckCircle size={20} className="text-green-500 mr-2 flex-shrink-0" />
                <p className="text-sm text-green-800">Health screening confirmed. Please show this e-ticket upon arrival.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 border-t border-gray-200">
            <div className="flex justify-between">
              <div>
                <p className="text-xs text-gray-500">Issued by</p>
                <p className="text-sm font-medium text-gray-800">Ijen Health Services</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-sm font-medium text-green-600">CONFIRMED</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="font-sans">
      {currentScreen === 'login' && <LoginScreen />}
      {currentScreen === 'home' && <HomeScreen />}
      {currentScreen === 'screening' && <ScreeningScreen />}
      {currentScreen === 'location' && <LocationScreen />}
      {currentScreen === 'profile' && <ProfileScreen />}
      {currentScreen === 'form1' && <Form1Screen />}
      {currentScreen === 'form2' && <Form2Screen />}
      {currentScreen === 'form3' && <Form3Screen />}
      {currentScreen === 'form4' && <Form4Screen />}
      {currentScreen === 'form5' && <Form5Screen />}
      {currentScreen === 'form6' && <Form6Screen />}
      {currentScreen === 'details' && <DetailScreen />}
      {currentScreen === 'partner' && <PartnerScreen />}
      {currentScreen === 'receipt' && <ReceiptScreen />}
      {currentScreen === 'viewTicket' && <ViewTicketScreen />}
    </div>
  );
};

export default App;
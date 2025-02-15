import React, { useState } from 'react';
import { Calendar, MapPin, Users, Coffee, Moon, Bed, ChevronDown, ChevronUp, FileText, Upload, X, Download } from 'lucide-react';
import { router } from '@inertiajs/react';
import Main from '@/Layouts/Main';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Accommodation = ({hotelData,initialFilters}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dragActive, setDragActive] = useState(false);  
  const [dateRange, setDateRange] = useState({
    start: initialFilters.start || '',
    end: initialFilters.end || ''
  });
  
  const handleFilter = () => {
    
    router.get(`/vendor/accommodation/${hotelData.hotel.id}`, {
      start: dateRange.start,
      end: dateRange.end
    }, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };

  const clearFilters = () => {
    setDateRange({ start: '', end: '' });
    router.get(`/vendor/accommodation/${hotelData.hotel.id}`, {}, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };
  const handleDownloadPDF = () => {
    const params = new URLSearchParams({
      start: dateRange.start || '',
      end: dateRange.end || '',
      download: true
    });
    
    
    window.location.href = `/vendor/accommodation/${hotelData.hotel.id}?${params.toString()}`;
  };  // Date Range Filters Component
  const DateRangeFilters = () => (
    <div className="bg-white rounded-lg shadow-sm p-4">
    <div className="flex justify-between items-center mb-4">
    <h3 className="text-lg font-medium text-gray-900">Filter by Date Range</h3>
    <button
        onClick={() => handleDownloadPDF()}
        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
        <FileText className="w-4 h-4 mr-2" />
        Download PDF
    </button>
    </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end space-x-3">
        {(dateRange.start || dateRange.end) && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Clear Filters
          </button>
        )}
        <button
          onClick={handleFilter}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
  const RoomCard = ({ room }) => {
    // Default placeholder image if no photos available
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden bg-gray-200 group">
          <img
            src={room.photo}
            alt={`${room.room_name} view`}
            className="w-full h-full object-cover"
          />
        <button 
          className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70"
          onClick={(e) => {
            e.preventDefault();
            // Handle edit click
            console.log('Edit room photos:', room.room_name);
          }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
          </svg>
        </button>          
        </div>
  
        {/* Content Section */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{room.room_name}</h3>
          
          {/* Price */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                Rp {room.rate.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">per night</p>
            </div>
          </div>
  
          {/* Room Features - You can add more based on your data */}
          {/* <div className="space-y-2">
            <div className="flex items-center text-gray-600">
              <Bed className="w-4 h-4 mr-2" />
              <span className="text-sm">{room.room_name}</span>
            </div>
          </div> */}
  
          {/* Action Button */}
          {/* <div className="mt-4">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center">
              Book Now
            </button>
          </div> */}
        </div>
      </div>
    );
  };
  
  const RoomsSection = () => {
    const rooms = hotelData?.hotel?.room_hotel || [];
    
    if (rooms.length === 0) {
      return (
        <div className="p-8 text-center text-gray-500">
          No rooms available
        </div>
      );
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {rooms.map((room, index) => (
            <RoomCard key={index} room={room} />
          ))}
        </div>
      );
    };      
  // Component for the hero banner section
  const HeroBanner = () => (
    <div 
      className="relative h-64 md:h-96 w-full overflow-hidden rounded-lg shadow-lg mb-8 bg-cover bg-center"
      style={{
        backgroundImage: `url('https://javavolcano-touroperator.com/assets/img/hotels/${hotelData.hotel.banner}')`
      }}
    >
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
      
      {/* Content */}
      <div className="relative h-full flex flex-col justify-end px-6 md:px-12 pb-8 md:pb-12">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
          {hotelData.hotel.name}
        </h1>
        <div className="flex items-center text-white/90">
          <MapPin className="w-5 h-5 mr-2 drop-shadow" />
          <a href={hotelData.hotel.map_url} 
             target="_blank" 
             rel="noopener noreferrer"
             className="hover:underline transition-all duration-200 drop-shadow"
          >
            View on Maps
          </a>
        </div>
      </div>
    </div>
  );

  // Tab navigation component
  const TabNavigation = () => (
    <nav className="flex space-x-1 overflow-x-auto scrollbar-hide mb-8 border-b border-gray-200">
      {['overview','schedule','rooms','meals','documents'].map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`
            px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200
            ${activeTab === tab 
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
          `}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </nav>
  );
  const calculateGrandTotal = () => {
    if (!hotelData?.schedule) return 0;
    
    return hotelData.schedule.reduce((total, booking) => {
      const totalMeals = (booking.meals || []).reduce((sum, meal) => 
        sum + (parseFloat(meal.subtotal) || 0), 0);
      const totalRooms = (booking.rooms || []).reduce((sum, room) => 
        sum + (room.subtotal || 0), 0);
      return total + totalMeals + totalRooms;
    }, 0);
  };
  
  // File upload handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Handle file upload
      console.log("File upload:", e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      // Handle file upload
      console.log("File upload:", e.target.files[0]);
    }
  };

  // ... Previous HeroBanner and TabNavigation components ...

  // Document Card Component
  const DocumentCard = ({ document }) => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <FileText className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">{document.filename}</h3>
              <p className="text-sm text-gray-500">{document.size}</p>
              <p className="text-xs text-gray-400">Uploaded on {document.uploaded_at}</p>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  // Documents Section Component
  const DocumentsSection = () => {
    const documents = hotelData?.hotel?.document || [];
    
    return (
    <div className="space-y-6">
      {/* Upload area */}
      <div 
        className={`
          border-2 border-dashed rounded-lg p-8
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
          transition-colors duration-200
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center text-center">
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">Drag and drop your files here, or</p>
          <label className="cursor-pointer">
            <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
              Browse Files
            </span>
            <input
              type="file"
              className="hidden"
              onChange={handleFileInput}
              multiple
            />
          </label>
        </div>
      </div>

      {/* Documents list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hotelData.document.map((doc) => (
          <DocumentCard key={doc.id} document={doc} />
        ))}
      </div>
    </div>
  );
  }
  const ScheduleSection = () => {
    const grandTotal = calculateGrandTotal();
    
    return (
      <div className="space-y-6">
        <DateRangeFilters />        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <ScheduleTable />
        </div>
        
        {/* Grand Total Summary */}
        <div className="bg-blue-50 rounded-lg p-4 flex justify-between items-center">
          <div className="text-blue-900">
            <h3 className="text-lg font-semibold">Grand Total</h3>
            <p className="text-sm">Total from all bookings</p>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            Rp {grandTotal.toLocaleString()}
          </div>
        </div>
      </div>
    );
  };


 

  // Meals section component
  const MealsSection = () => (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Coffee className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-xl font-semibold">Lunch</h3>
        </div>
        <p className="text-2xl font-bold text-blue-600 mb-2">
          Rp {hotelData.hotel.lunch_rate.toLocaleString()}
        </p>
        <p className="text-gray-600">Per person</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Moon className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-xl font-semibold">Dinner</h3>
        </div>
        <p className="text-2xl font-bold text-blue-600 mb-2">
          Rp {hotelData.hotel.dinner_rate.toLocaleString()}
        </p>
        <p className="text-gray-600">Per person</p>
      </div>
    </div>
  );
  const ScheduleTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Check In
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Room Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Participants
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Meals
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {hotelData.schedule.map((booking, index) => {
            const totalMeals = booking.meals.reduce((sum, meal) => sum + parseFloat(meal.subtotal), 0);
            const totalRooms = booking.rooms.reduce((sum, room) => sum + room.subtotal, 0);
            const grandTotal = totalMeals + totalRooms;
            
            return (
              <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{booking.customer}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.check_in}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {booking.rooms.map(room => `${room.quantity}x ${room.room_name}`).join(', ')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.participants}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {booking.meals.length > 0 
                      ? booking.meals.map(meal => 
                          `${meal.meals} (${meal.quantity}x)`
                        ).join(', ')
                      : '-'
                    }
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    Rp {grandTotal.toLocaleString()}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
  // Content sections
  const TabContent = () => {
    switch (activeTab) {
      case 'rooms':
        return <RoomsSection/>
    case 'schedule':
        return <ScheduleSection />;
      case 'documents':
        return <DocumentsSection />;
      case 'meals':
        return <MealsSection />;
      default:
        return (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">About {hotelData.hotel.name}</h2>
              <p className="text-gray-600">
                {hotelData.hotel.address}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Active Bookings</p>
                  <p className="text-2xl font-bold text-blue-600">{hotelData.schedule.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Rooms</p>
                  <p className="text-2xl font-bold text-blue-600">{hotelData.hotel.room_hotel.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Document</p>
                  <p className="text-2xl font-bold text-blue-600">{hotelData.document.length}</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Main>
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <HeroBanner />
        <TabNavigation />
        <main className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <TabContent />
        </main>
      </div>
    </div>
    </Main>
  );
};

export default Accommodation;
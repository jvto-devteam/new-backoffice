import Main from '@/Layouts/Main';
import React, { useState, useEffect } from 'react';
import {Link,router} from '@inertiajs/react';
import { 
  Bell, 
  CheckCircle, 
  Moon, 
  Sun, 
  Car, 
  MapPin, 
  Users, 
  CreditCard, 
  Home, 
  ShoppingBag, 
  Image, 
  Menu, 
  Calendar,
  TrendingUp,
  BarChart4,
  ArrowUp,
  ArrowDown,
  Star,
  Clock,
  Filter,
  TriangleAlert,
  ShieldAlert,
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


// Main Dashboard Component
const TravelDashboard = ({alertData,upcoming}) => {
  const [darkMode, setDarkMode] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [alertStats, setAlertStats] = useState({
    total: 0,
    categories: {}
  });
  const [selectedType, setSelectedType] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('day');
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [bookingStats, setBookingStats] = useState([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);
  const [topPackages, setTopPackages] = useState([]);
  const [channelStats, setChannelStats] = useState([]);

  // Sample data - in a real app, this would come from an API
  useEffect(() => {

    // Mapping dari nama alert baru ke nama alert lama
    const alertMapping = {
      'no_pickup': 'pickup_not_set',
      'no_drop': 'drop_not_set',
      'no_car': 'vehicle_not_assign',
      'no_crew': 'crew_not_assign',
      'no_payment_method': 'payment_method_not_set',
      'no_hotel': 'accommodation_not_assign',
      'no_tshirt': 't_shirt_not_set',
      'no_trip_media': 'trip_media_not_set'
    };

    // Alert types untuk label
    const alertTypes = {
      'pickup_not_set': 'Pickup not set',
      'drop_not_set': 'Drop not set',
      'vehicle_not_assign': 'Vehicle not assign',
      'crew_not_assign': 'Crew not assign',
      'expense_not_created': 'Expense not created',
      'payment_method_not_set': 'Payment Method not set',
      'accommodation_not_assign': 'Accommodation not assign',
      't_shirt_not_set': 'T-Shirt not set',
      'trip_media_not_set': 'Trip Media not set'
    };

    // Transformasi data booking
    const transformedBookings = [];
    const alertsById = {};

    const orderChannel = (agentId,bookingCategoryId) => {
      if(agentId === 1){
        return 'TWT'
      }
      else{
        if(bookingCategoryId !== 3){
          return 'JVTO'
        }
        else{
          return 'KLOOK'
        }
      }
    }

    // Process each alert type and create bookings
    Object.keys(alertMapping).forEach(newAlertKey => {
      const oldAlertKey = alertMapping[newAlertKey];
      
      alertData[newAlertKey].forEach(booking => {
        const bookingId = `${orderChannel(booking.agent_id,booking.booking_category_id)}-${booking.id}`;
        
        // If booking doesn't exist yet, create it
        if (!alertsById[bookingId]) {
          alertsById[bookingId] = {
            booking_id: bookingId,
            id: booking.id,
            customer: booking.name,
            destination: `${booking.package_duration}D ${booking.package_duration-1}N Package`,
            date: booking.travel_date_start,
            orderChannel : orderChannel(booking.agent_id,booking.booking_category_id),
            pax: booking.total_pax,
            alerts: []
          };
          transformedBookings.push(alertsById[bookingId]);
        }
        
        // Add this alert type to the booking if not already there
        if (!alertsById[bookingId].alerts.includes(oldAlertKey)) {
          alertsById[bookingId].alerts.push(oldAlertKey);
        }
      });
    });

    setBookings(transformedBookings);

    // Calculate alert statistics
    const stats = { total: 0, categories: {} };
    
    Object.keys(alertTypes).forEach(key => {
      stats.categories[key] = 0;
    });

    transformedBookings.forEach(booking => {
      booking.alerts.forEach(alert => {
        stats.categories[alert]++;
        stats.total++;
      });
    });

    setAlertStats(stats);
    
    // Set default selected type to the first one with alerts
    const firstAlertType = Object.keys(stats.categories).find(key => stats.categories[key] > 0);
    setSelectedType(firstAlertType);

    // Sample booking statistics by day for the last 30 days
    const currentDate = new Date();
    const dailyBookingStats = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(currentDate.getDate() - 29 + i);
      
      // Generate different values for different channels
      const jvtoCount = Math.floor(Math.random() * 15) + 5;
      const klookCount = Math.floor(Math.random() * 10) + 2;
      const twtCount = Math.floor(Math.random() * 8) + 1;
      
      return {
        date: date.toISOString().split('T')[0],
        day: `${date.getDate()}/${date.getMonth() + 1}`,
        all: jvtoCount + klookCount + twtCount,
        jvto: jvtoCount,
        klook: klookCount,
        twt: twtCount
      };
    });
    
    setBookingStats(dailyBookingStats);

    // Sample weekly booking stats
    const weeklyBookingStats = Array.from({ length: 4 }, (_, i) => {
      const weekNum = i + 1;
      
      // Generate different values for different channels
      const jvtoCount = Math.floor(Math.random() * 70) + 30;
      const klookCount = Math.floor(Math.random() * 50) + 15;
      const twtCount = Math.floor(Math.random() * 40) + 10;
      
      return {
        week: `Week ${weekNum}`,
        all: jvtoCount + klookCount + twtCount,
        jvto: jvtoCount,
        klook: klookCount,
        twt: twtCount
      };
    });

    // Sample channel statistics
    const channelData = [
      {
        name: 'JVTO',
        total: 425,
        color: '#4287f5',
        increase: 12,
        id: 'jvto'
      },
      {
        name: 'KLOOK',
        total: 318,
        color: '#f54242',
        increase: -5,
        id: 'klook'
      },
      {
        name: 'TWT',
        total: 254,
        color: '#42f563',
        increase: 8,
        id: 'twt'
      }
    ];
    
    setChannelStats(channelData);
    
    // Sample upcoming schedules
    const sampleSchedules = [
      {
        id: 'SCH001',
        destination: 'Bali Sunset Tour',
        date: '2025-03-18',
        time: '16:30',
        pax: 12,
        guide: 'Wayan Dharma'
      },
      {
        id: 'SCH002',
        destination: 'Mount Bromo Sunrise',
        date: '2025-03-19',
        time: '03:00',
        pax: 8,
        guide: 'Budi Prakoso'
      },
      {
        id: 'SCH003',
        destination: 'Komodo Island Expedition',
        date: '2025-03-20',
        time: '07:30',
        pax: 6,
        guide: 'Eko Nugroho'
      },
      {
        id: 'SCH004',
        destination: 'Raja Ampat Diving',
        date: '2025-03-21',
        time: '09:00',
        pax: 4,
        guide: 'Andre Wijaya'
      }
    ];
    
    setUpcomingSchedules(upcoming);
    
    // Sample top packages
    const sampleTopPackages = [
      {
        id: 'PKG001',
        name: 'Bali 3 Days 2 Nights Adventure',
        sales: 145,
        revenue: 87000000,
        rating: 4.8,
        image: 'bali.jpg'
      },
      {
        id: 'PKG002',
        name: 'Lombok Beach Getaway',
        sales: 112,
        revenue: 67200000,
        rating: 4.7,
        image: 'lombok.jpg'
      },
      {
        id: 'PKG003',
        name: 'Yogyakarta Cultural Tour',
        sales: 98,
        revenue: 49000000,
        rating: 4.6,
        image: 'yogyakarta.jpg'
      }
    ];
    
    setTopPackages(sampleTopPackages);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Alert type to icon mapping
  const alertIcons = {
    'pickup_not_set': <MapPin className="w-4 h-4" />,
    'drop_not_set': <MapPin className="w-4 h-4" />,
    'vehicle_not_assign': <Car className="w-4 h-4" />,
    'crew_not_assign': <Users className="w-4 h-4" />,
    'expense_not_created': <CreditCard className="w-4 h-4" />,
    'payment_method_not_set': <CreditCard className="w-4 h-4" />,
    'accommodation_not_assign': <Home className="w-4 h-4" />,
    't_shirt_not_set': <ShoppingBag className="w-4 h-4" />,
    'trip_media_not_set': <Image className="w-4 h-4" />
  };

  // Alert type to human-readable format
  const alertLabels = {
    'pickup_not_set': 'Pickup not set',
    'drop_not_set': 'Drop not set',
    'vehicle_not_assign': 'Vehicle not assign',
    'crew_not_assign': 'Crew not assign',
    'expense_not_created': 'Expense not created',
    'payment_method_not_set': 'Payment Method not set',
    'accommodation_not_assign': 'Accommodation not assign',
    't_shirt_not_set': 'T-Shirt not set',
    'trip_media_not_set': 'Trip Media not set'
  };

  // Take action function
  const takeAction = (bookingId, alertType) => {
    router.visit("/bookings/edit-booking/"+bookingId);
  };

  // Group alerts by type
  const getAlertsByType = () => {
    const alertsByType = {};
    
    bookings.forEach(booking => {
      booking.alerts.forEach(alertType => {
        if (!alertsByType[alertType]) {
          alertsByType[alertType] = [];
        }
        alertsByType[alertType].push({
          bookingId: booking.booking_id,
          id: booking.id,
          alertType,
          customer: booking.customer,
          destination: booking.destination,
          date: booking.date,
          orderChannel: booking.orderChannel,
          pax: booking.pax,
        });
      });
    });
    
    // Remove any alert types with zero items
    Object.keys(alertsByType).forEach(key => {
      if (alertsByType[key].length === 0) {
        delete alertsByType[key];
      }
    });
    
    return alertsByType;
  };

  // Alert Item Component
  const AlertItem = ({ id,bookingId, alertType, customer, destination,orderChannel,date,pax }) => {
    return (
      <div className={`flex items-center justify-between p-4 rounded-lg mb-2 transition-all duration-200 hover:shadow-md ${
        darkMode 
          ? 'bg-gray-700 border border-gray-600' 
          : 'bg-white border border-gray-100 shadow-sm'
      }`}>
        <div className="flex items-center">
          <div className={`p-3 mr-4 rounded-full ${
            darkMode 
              ? 'bg-gray-800 text-red-400' 
              : 'bg-red-50 text-red-500'
          }`}>
            {alertIcons[alertType]}
          </div>
          <div>
            <div className="font-medium text-base">{customer} <span className="text-xs">({pax} Pax)</span></div>
            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <span className="inline-flex items-center">
                <Calendar className="w-4 h-4 mr-1" />

                {date}
                <span className="mx-2 w-1 h-1 rounded-full bg-gray-400"></span>
                {destination}
                <span className="mx-2 w-1 h-1 rounded-full bg-gray-400"></span>
                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full 
                  ${orderChannel === 'JVTO' ? 'bg-blue-100 text-blue-800' :
                    orderChannel === 'TWT' ? 'bg-yellow-100 text-yellow-800' :
                    orderChannel === 'KLOOK' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'}`}
                >
                {bookingId}
                </span>
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => takeAction(id, alertType)}
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
            darkMode 
              ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white' 
              : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white shadow-sm'
          }`}
        >
          Fix Now
        </button>
      </div>
    );
  };

  // Unified Alert Dashboard
  const UnifiedAlertDashboard = () => {
    const alertsByType = getAlertsByType();
    
    // Filter out alert types with zero count
    const activeAlertTypes = Object.keys(alertStats.categories).filter(
      type => alertStats.categories[type] > 0
    );
    
    // Handle empty state
    if (Object.keys(alertsByType).length === 0) {
      return (
        <div className={`p-8 text-center rounded-xl shadow-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
          <CheckCircle className="mx-auto w-12 h-12 text-green-500 mb-4" />
          <h3 className="text-xl font-medium mb-2">All Clear!</h3>
          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            No bookings require attention at this time.
          </p>
        </div>
      );
    }
    
    // Effect to select first active alert type if none selected
    useEffect(() => {
      if (!selectedType || alertStats.categories[selectedType] === 0) {
        setSelectedType(activeAlertTypes[0] || null);
      }
    }, [selectedType, alertStats, activeAlertTypes]);
    
    return (
      <div className={`overflow-hidden rounded-xl shadow-lg ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        {/* Header with subtle gradient background */}
        <div className={`px-6 py-4 ${darkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Alert Management Center
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {alertStats.total} issues requiring your attention
          </p>
        </div>

        {/* Alert Type Selector Buttons - Only show active alert types */}
        <div className="p-4 overflow-x-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-4 gap-2">
            {activeAlertTypes.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`group relative flex flex-col items-center p-3 rounded-lg transition-all duration-200 transform hover:scale-105 ${
                  selectedType === type
                    ? darkMode 
                      ? 'bg-gradient-to-br from-red-600 to-red-700 text-white shadow-md' 
                      : 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-md'
                    : darkMode
                      ? 'bg-gray-700 hover:bg-gray-600'
                      : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <div className={`flex items-center justify-center w-10 h-10 mb-2 rounded-full ${
                  selectedType === type
                    ? 'bg-red-400 bg-opacity-30'
                    : darkMode
                      ? 'bg-gray-600'
                      : 'bg-white shadow-sm'
                }`}>
                  {alertIcons[type]}
                </div>
                <span className="text-center text-sm font-medium">{alertLabels[type]}</span>
                <span className={`text-lg font-bold mt-1 ${selectedType === type ? 'text-white' : ''}`}>
                  {alertStats.categories[type]}
                </span>
                {selectedType === type && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-t-full bg-red-400"></div>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* Show message when no active alerts */}
        {activeAlertTypes.length === 0 && (
          <div className="p-8 text-center">
            <CheckCircle className="mx-auto w-12 h-12 text-green-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">All Clear!</h3>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              No bookings require attention at this time.
            </p>
          </div>
        )}
        
        {/* Divider - only show if we have active alerts */}
        {activeAlertTypes.length > 0 && (
          <div className={`h-px mx-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
        )}
        
        {/* Alert List */}
        {selectedType && alertsByType[selectedType] && alertsByType[selectedType].length > 0 && (
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className={`p-2 mr-3 rounded-full ${
                darkMode ? 'bg-red-500 bg-opacity-20' : 'bg-red-100'
              }`}>
                {alertIcons[selectedType]}
              </div>
              <h3 className="text-lg font-medium">
                {alertLabels[selectedType]} 
                <span className={`ml-2 text-sm font-normal ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  ({alertsByType[selectedType].length} issues)
                </span>
              </h3>
            </div>
            
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {alertsByType[selectedType].map((alert, index) => (
                <AlertItem 
                  key={index}
                  id={alert.id}
                  bookingId={alert.bookingId}
                  alertType={alert.alertType}
                  customer={alert.customer}
                  destination={alert.destination}
                  date={alert.date}
                  orderChannel={alert.orderChannel}
                  pax={alert.pax}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Booking Chart Component
  const BookingChartSection = () => {
    // Filter data based on selected channel
    const filteredData = bookingStats.map(item => ({
      ...item,
      value: selectedChannel === 'all' ? item.all : item[selectedChannel]
    }));

    // For weekly view, group the data accordingly
    const weeklyData = selectedTimeframe === 'week' 
      ? Array.from({ length: 4 }, (_, weekIdx) => {
          const weekStart = weekIdx * 7;
          const weekEnd = weekStart + 6;
          const weekData = bookingStats.slice(weekStart, weekEnd + 1);
          
          return {
            week: `Week ${weekIdx + 1}`,
            value: selectedChannel === 'all' 
              ? weekData.reduce((sum, day) => sum + day.all, 0)
              : weekData.reduce((sum, day) => sum + day[selectedChannel], 0)
          };
        })
      : null;

    const displayData = selectedTimeframe === 'day' ? filteredData : weeklyData;
    const dataKey = selectedTimeframe === 'day' ? 'day' : 'week';

    // Calculate total bookings and compare with previous period to show growth
    const totalBookings = displayData.reduce((sum, item) => sum + item.value, 0);
    // Simulate previous period data (this would come from API in real app)
    const previousPeriodTotal = Math.floor(totalBookings * 0.9); // Assuming 10% growth
    const growthPercentage = Math.round((totalBookings - previousPeriodTotal) / previousPeriodTotal * 100);

    return (
      <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        <div className={`px-6 py-4 ${darkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Booking Statistics
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {selectedTimeframe === 'day' ? 'Daily' : 'Weekly'} booking overview
              </p>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => setSelectedTimeframe('day')}
                className={`px-3 py-1 text-xs rounded-full ${
                  selectedTimeframe === 'day'
                    ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                    : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                }`}
              >
                Daily
              </button>
              <button 
                onClick={() => setSelectedTimeframe('week')}
                className={`px-3 py-1 text-xs rounded-full ${
                  selectedTimeframe === 'week'
                    ? darkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                    : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                }`}
              >
                Weekly
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Channel Filter Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
            <div 
              onClick={() => setSelectedChannel('all')}
              className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                selectedChannel === 'all'
                  ? darkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'
                  : darkMode ? 'bg-gray-700' : 'bg-gray-50'
              } border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>All Channels</p>
                  <h4 className="text-2xl font-bold">{totalBookings}</h4>
                </div>
                <div className={`p-3 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-white'}`}>
                  <BarChart4 className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                </div>
              </div>
              <div className={`flex items-center mt-2 text-sm ${growthPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {growthPercentage >= 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                <span>{Math.abs(growthPercentage)}% vs previous {selectedTimeframe}</span>
              </div>
            </div>

            {channelStats.map(channel => {
              // Calculate percentage change for each channel
              const channelTotal = displayData.reduce((sum, item) => sum + (selectedTimeframe === 'day' ? item[channel.id] : item[channel.id]), 0);
              
              return (
                <div 
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedChannel === channel.id
                      ? darkMode ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'
                      : darkMode ? 'bg-gray-700' : 'bg-gray-50'
                  } border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{channel.name}</p>
                      <h4 className="text-2xl font-bold">{channelTotal}</h4>
                    </div>
                    <div className={`p-3 rounded-full ${darkMode ? 'bg-gray-600' : 'bg-white'}`} style={{ color: channel.color }}>
                      <BarChart4 className="w-5 h-5" />
                    </div>
                  </div>
                  <div className={`flex items-center mt-2 text-sm ${channel.increase >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {channel.increase >= 0 ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                    <span>{Math.abs(channel.increase)}% vs previous month</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {selectedTimeframe === 'day' ? (
                <LineChart data={displayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#555' : '#eee'} />
                  <XAxis 
                    dataKey={dataKey} 
                    stroke={darkMode ? '#aaa' : '#666'}
                    tick={{ fill: darkMode ? '#aaa' : '#666' }}
                  />
                  <YAxis stroke={darkMode ? '#aaa' : '#666'} tick={{ fill: darkMode ? '#aaa' : '#666' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#333' : '#fff',
                      color: darkMode ? '#fff' : '#333',
                      border: `1px solid ${darkMode ? '#555' : '#ddd'}`
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={selectedChannel === 'all' ? '#3b82f6' : 
                            selectedChannel === 'jvto' ? '#4287f5' :
                            selectedChannel === 'klook' ? '#f54242' : '#42f563'} 
                    strokeWidth={2} 
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              ) : (
                <BarChart data={displayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#555' : '#eee'} />
                  <XAxis 
                    dataKey={dataKey}
                    stroke={darkMode ? '#aaa' : '#666'}
                    tick={{ fill: darkMode ? '#aaa' : '#666' }}
                  />
                  <YAxis stroke={darkMode ? '#aaa' : '#666'} tick={{ fill: darkMode ? '#aaa' : '#666' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: darkMode ? '#333' : '#fff',
                      color: darkMode ? '#fff' : '#333',
                      border: `1px solid ${darkMode ? '#555' : '#ddd'}`
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill={selectedChannel === 'all' ? '#3b82f6' : 
                        selectedChannel === 'jvto' ? '#4287f5' :
                        selectedChannel === 'klook' ? '#f54242' : '#42f563'} 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  // Upcoming Schedule Component
  const UpcomingScheduleSection = () => {
    return (
      <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        <div className={`px-6 py-4 ${darkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Upcoming Schedules
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Next 7 days departure
          </p>
        </div>
        
        <div className="p-4">
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {upcomingSchedules.map(schedule => (
              <div 
                key={schedule.id} 
                className={`p-4 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                } transition-all hover:shadow-md`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{schedule.user}</h4>
                    <div className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{schedule.date}</span>
                      <span className="mx-2 w-1 h-1 rounded-full bg-gray-400"></span>
                      <span>{schedule.package}</span>
                      <span className="mx-2 w-1 h-1 rounded-full bg-gray-400"></span>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full 
                        ${schedule.order_channel === 'JVTO' ? 'bg-blue-100 text-blue-800' :
                          schedule.order_channel === 'TWT' ? 'bg-yellow-100 text-yellow-800' :
                          schedule.order_channel === 'KLOOK' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'}`}
                      >
                      {schedule.order_channel}-{schedule.id}
                      </span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs ${
                    darkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {schedule.total_pax} pax
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-dashed flex justify-between items-center">
                  <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span>
                      Crews:
                      <span className="ml-1">
                      {schedule.crews.map((data,index) => (
                        <>
                          {data.name}{data.is_ijen === '1' ? ' (Ijen)' : ''}
                          {(index+1)!==schedule.crews.length ? ', ' : ''}
                        </>
                      ))}  
                      </span>
                    </span> 
                    <span className="font-medium ml-1"></span>
                  </div>
                  <Link href={`/bookings/details/${schedule.id}`} className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'} font-medium`}>
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Top Packages Component
  const TopPackagesSection = () => {
    return (
      <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
        <div className={`px-6 py-4 ${darkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Top Selling Packages
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Best performers this month
          </p>
        </div>
        
        <div className="p-4">
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {topPackages.map((pkg, index) => (
              <div 
                key={pkg.id} 
                className={`p-4 rounded-lg border ${
                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                } transition-all hover:shadow-md`}
              >
                <div className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 mr-4 rounded-full ${
                    index === 0 
                      ? 'bg-yellow-100 text-yellow-600' 
                      : index === 1 
                        ? 'bg-gray-100 text-gray-600' 
                        : 'bg-amber-100 text-amber-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{pkg.name}</h4>
                    <div className="flex items-center">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                        <span className="ml-1 text-sm">{pkg.rating}</span>
                      </div>
                      <span className="mx-2 w-1 h-1 rounded-full bg-gray-400"></span>
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{pkg.sales} sold</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                      {new Intl.NumberFormat('id-ID', {
                        style: 'currency',
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                      }).format(pkg.revenue)}
                    </div>
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Revenue
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <button 
              className={`px-4 py-2 rounded-lg font-medium transition-all hover:shadow-md ${
                darkMode 
                  ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              View All Packages
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Quick Stats Component
  const QuickStatsSection = () => {
    const stats = [
      {
        title: 'Total Bookings',
        value: '1,358',
        icon: <BarChart4 className="w-5 h-5" />,
        change: '+12%',
        positive: true
      },
      {
        title: 'Monthly Revenue',
        value: 'Rp 875.4M',
        icon: <TrendingUp className="w-5 h-5" />,
        change: '+8%',
        positive: true
      },
      {
        title: 'Active Tours',
        value: '42',
        icon: <MapPin className="w-5 h-5" />,
        change: '-5%',
        positive: false
      },
      // {
      //   title: 'Issues',
      //   value: alertStats.total,
      //   icon: <Star className="w-5 h-5" fill="currentColor" />,
      //   change: '+0.2',
      //   positive: true
      // }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div 
            key={index}
            className={`p-4 rounded-xl shadow-md ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.title}</p>
                <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-full ${
                darkMode ? 'bg-gray-700 text-blue-400' : 'bg-blue-50 text-blue-500'
              }`}>
                {stat.icon}
              </div>
            </div>
            <div className={`mt-2 flex items-center text-sm ${
              stat.positive ? 'text-green-500' : 'text-red-500'
            }`}>
              {stat.positive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
              <span>{stat.change} vs last month</span>
            </div>
          </div>
        ))}
          <div 
            className={`p-4 rounded-xl shadow-md ${
              darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Current Issues</p>
                <h3 className={`text-2xl font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{alertStats.total}</h3>
              </div>
              <div className={`p-3 rounded-full ${
                darkMode ? 'bg-gray-700 text-red-400' : 'bg-red-50 text-red-500'
              }`}>
                <TriangleAlert/>
              </div>
            </div>
            <div className={`mt-2 flex items-center text-sm text-red-500`}>
              <ShieldAlert className="w-3 h-3 mr-1"/>              
              <span> Need to fix</span>
            </div>
          </div>
      </div>
    );
  };

  return (
    <Main>
      <div className={`transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
        {/* Header - Added back */}
        <header className={`py-4 px-6 flex justify-between items-center shadow-md ${
          darkMode 
            ? 'bg-gray-800 border-b border-gray-700' 
            : 'bg-white border-b border-gray-100'
        }`}>
          <div className="flex items-center">
            <h1 className="text-xl font-bold">Dashboard</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          {/* Quick Stats Section */}
          <div className="mb-6">
            <QuickStatsSection />
          </div>

          {/* Booking Chart Section */}
          <div className="mb-6">
            <BookingChartSection />
          </div>
          
          {/* Two Column Layout for Alerts, Schedule, and Top Packages */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <UnifiedAlertDashboard />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <UpcomingScheduleSection />
              <TopPackagesSection />
            </div>
          </div>
        </main>
      </div>
    </Main>
  );
};

export default TravelDashboard;
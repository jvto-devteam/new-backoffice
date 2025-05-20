import React, { useState, useRef, useEffect, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import Main from '@/Layouts/Main';
import { 
  Users, Calendar, CheckCircle, Clock, AlertTriangle, CreditCard, 
  Filter, Search, Package, DollarSign, TrendingUp, List, MoreHorizontal,
  Layers, MapPin, Car, UserCheck, CreditCard as CardIcon, Hotel, Shirt, Camera,
  ChevronDown, ChevronUp, ChevronRight,
  X, Calendar as CalendarIcon
} from 'lucide-react';
import {Link,router} from '@inertiajs/react';

export default function Dashboard({ dashboardData }) {
  const { summaryOrderChannel, summary, paymentHistory, trips, alert, month } = dashboardData;
  const [activeTab, setActiveTab] = useState('active');
  const [hoveredCrew, setHoveredCrew] = useState(null);
  const [expandedPayments, setExpandedPayments] = useState([]);
  console.log(trips.filter(booking => booking.is_active && booking.status == 'active'));
  

  // Function to toggle a payment's expanded state
  const togglePaymentDetail = (paymentId) => {
    if (expandedPayments.includes(paymentId)) {
        setExpandedPayments(expandedPayments.filter(id => id !== paymentId));
    } else {
        setExpandedPayments([...expandedPayments, paymentId]);
    }
  };
  
  // States for interactive elements
  const [paymentsExpanded, setPaymentsExpanded] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState('no_car');
  const [scheduleExpanded, setScheduleExpanded] = useState(true);
  const [calendarExpanded, setCalendarExpanded] = useState(true);
  const [alertsExpanded, setAlertsExpanded] = useState(true);  
  const [showAllPayments, setShowAllPayments] = useState(false);
  
  // Colors for order channels
  const channelColors = {
    jvto: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    klook: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    twt: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Get channel badge
  const getChannelBadge = (channel) => {
    const channelMap = {
      'JVTO': channelColors.jvto,
      'KLOOK': channelColors.klook,
      'TWT': channelColors.twt
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${channelMap[channel] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
        {channel}
      </span>
    );
  };
  
  // Get payment badge
  const getPaymentBadge = (method) => {
    const methodMap = {
      'Debit/Credit Card': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      'Bank Transfer': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      'WISE': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
      'cash': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      'cc': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${methodMap[method] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}>
        {method}
      </span>
    );
  };
  
  // Format date
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };
  const TripCalendar = ({ trips }) => {
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [hoveredCrew, setHoveredCrew] = useState(null);
    const calendarRef = useRef(null);
    const initialDate = useMemo(() => {
      // If month is provided (e.g., '04' for April), create a date for that month in the current year
      if (month) {
          const currentYear = new Date().getFullYear();
          // Month in JavaScript is 0-indexed, so we subtract 1
          return new Date(currentYear, parseInt(month) - 1, 1);
      }
      // Default to current date if no month is specified
      return new Date();
  }, [month]);
    
    // Channel-specific colors
    const channelColors = {
      'JVTO': {
        background: '#DBEAFE', // blue-100
        textColor: '#1E40AF', // blue-800
        borderColor: '#93C5FD', // blue-300
        darkBackground: 'rgba(30, 64, 175, 0.2)', // blue-800 with opacity
        darkTextColor: '#BFDBFE' // blue-200
      },
      'KLOOK': {
        background: '#DCFCE7', // green-100
        textColor: '#166534', // green-800
        borderColor: '#86EFAC', // green-300
        darkBackground: 'rgba(22, 101, 52, 0.2)', // green-800 with opacity
        darkTextColor: '#BBF7D0' // green-200
      },
      'TWT': {
        background: '#FEF9C3', // yellow-100
        textColor: '#854D0E', // yellow-800
        borderColor: '#FDE047', // yellow-300
        darkBackground: 'rgba(133, 77, 14, 0.2)', // yellow-800 with opacity
        darkTextColor: '#FEF08A' // yellow-200
      }
    };
    
    // Status colors
    const statusColors = {
      'active': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
      'upcoming': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200',
      'complete': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200'
    };

    // Format currency
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    };
    
    // Transform trips data for FullCalendar
    const events = trips.map(trip => {
      const channel = trip.order_channel;
      const colors = channelColors[channel];
      const isActive = trip.status === 'active';
      
      // Get crew photos for the event content
      const crewPhotos = trip.crews.slice(0, 2).map(crew => crew.photo);
      
      return {
        id: trip.id.toString(),
        title: trip.user,
        start: trip.start_date,
        end: new Date(new Date(trip.end_date).setDate(new Date(trip.end_date).getDate() + 1)).toISOString().split('T')[0], // End date is exclusive in FullCalendar
        backgroundColor: document.documentElement.classList.contains('dark') ? colors.darkBackground : colors.background,
        textColor: document.documentElement.classList.contains('dark') ? colors.darkTextColor : colors.textColor,
        borderColor: colors.borderColor,
        extendedProps: {
          trip: trip,
          crewPhotos: crewPhotos,
          isActive: isActive
        }
      };
    });
    
    // Handle dark mode changes
    useEffect(() => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class' && 
              (document.documentElement.classList.contains('dark') || 
              !document.documentElement.classList.contains('dark'))) {
            // Refresh calendar to update colors
            if (calendarRef.current) {
              calendarRef.current.getApi().refetchEvents();
            }
          }
        });
      });
      
      observer.observe(document.documentElement, { attributes: true });
      
      return () => {
        observer.disconnect();
      };
    }, []);
    
    // Custom event render to include crew photos
    // Custom event render to include crew photos
    const renderEventContent = (eventInfo) => {
      const { trip, crewPhotos, isActive } = eventInfo.event.extendedProps;
      
      return (
        <div className="flex justify-between h-full overflow-hidden p-1 cursor-pointer">
          <div className="flex flex-col overflow-hidden">
            <div className="text-xs font-medium truncate">{eventInfo.event.title}</div>
            <div className="text-xs opacity-80 truncate">{trip.package} ({trip.total_pax} pax)</div>
          </div>
          
          {crewPhotos.length > 0 && (
            <div className="flex flex-shrink-0 -space-x-2 items-start">
              {crewPhotos.map((photo, i) => (
                <img 
                  key={i} 
                  src={photo} 
                  alt="Crew" 
                  className="w-8 h-8 rounded-full border border-white dark:border-gray-800 object-cover"
                />
              ))}
              {trip.crews.length > 2 && (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs border border-white dark:border-gray-800">
                  +{trip.crews.length - 2}
                </div>
              )}
            </div>
          )}
        </div>
      );
    };
    // Handle event click
    const handleEventClick = (info) => {
      setSelectedTrip(info.event.extendedProps.trip);
    };
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            {/* Title and collapse button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Trip Calendar</h2>
              </div>
              <button 
                onClick={() => setCalendarExpanded(!calendarExpanded)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 sm:hidden"
              >
                {calendarExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>
            
            {/* Filter options and collapse button for larger screens */}
            <div className="flex items-center justify-between mt-2 sm:mt-0">
              <div className="flex items-center gap-2 overflow-x-auto py-1 max-w-full">
                <div className="flex items-center whitespace-nowrap">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: channelColors['JVTO'].borderColor}}></div>
                  <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">JVTO</span>
                </div>
                <div className="flex items-center whitespace-nowrap">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: channelColors['KLOOK'].borderColor}}></div>
                  <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">KLOOK</span>
                </div>
                <div className="flex items-center whitespace-nowrap">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: channelColors['TWT'].borderColor}}></div>
                  <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">TWT</span>
                </div>
              </div>
              <button 
                onClick={() => setCalendarExpanded(!calendarExpanded)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 hidden sm:block ml-2"
              >
                {calendarExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
        {calendarExpanded && (
          <div className="p-4">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={events}
              initialDate={initialDate}
              eventContent={renderEventContent}
              eventClick={handleEventClick}
              headerToolbar={false}
              height="auto"
              aspectRatio={window.innerWidth < 640 ? 0.8 : 1.8}
              dayMaxEvents={window.innerWidth < 640 ? 2 : 3}
              moreLinkClick="popover"
              eventTimeFormat={{
                hour: 'numeric',
                minute: '2-digit',
                meridiem: 'short'
              }}
              firstDay={1}
              nowIndicator={true}
              eventClassNames="overflow-hidden rounded-md shadow-sm"
              dayHeaderClassNames="text-xs font-medium text-gray-500 dark:text-gray-400"
              dayHeaderFormat={{  weekday: window.innerWidth < 640 ? 'narrow' : 'short' }}
              weekNumberClassNames="text-xs text-gray-400 dark:text-gray-500"
              moreLinkClassNames="text-xs px-1 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-sm hover:bg-blue-100 dark:hover:bg-blue-800/30"
            />
          </div>
        )}
        
        {/* Trip Detail Modal */}
        {selectedTrip && calendarExpanded &&  (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
            onClick={() => setSelectedTrip(null)}
          >
            <div 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" 
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trip Details</h3>
                <button 
                  onClick={() => setSelectedTrip(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Booking ID</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">#{selectedTrip.id}</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedTrip.order_channel === 'JVTO'
                      ? 'bg-blue-200 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200'
                      : selectedTrip.order_channel === 'KLOOK'
                        ? 'bg-green-200 text-green-800 dark:bg-green-900/40 dark:text-green-200'
                        : 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200'
                  }`}>
                    {selectedTrip.order_channel}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Guest</div>
                    <div className="text-gray-900 dark:text-white font-medium">{selectedTrip.user}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Package</div>
                    <div className="text-gray-900 dark:text-white">{selectedTrip.package}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Trip Date</div>
                    <div className="text-gray-900 dark:text-white">
                      {selectedTrip.date}
                      <div className="text-xs text-gray-500 dark:text-gray-400">{selectedTrip.date_day}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Participants</div>
                    <div className="text-gray-900 dark:text-white">{selectedTrip.total_pax} Pax</div>
                  </div>
                </div>
                
                <div className="mb-2">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Crew Members</div>
                  {selectedTrip.crews && selectedTrip.crews.length > 0 ? (
                    <div className="flex flex-wrap gap-4">
                      {selectedTrip.crews.map((crew, index) => (
                        <Link
                          href={`/data-master-management/crew/${crew.id}`} 
                          key={index} 
                          className="flex flex-col items-center relative"
                          onMouseEnter={() => setHoveredCrew(crew)}
                          onMouseLeave={() => setHoveredCrew(null)}
                        >
                          <div className="h-16 w-16 rounded-full overflow-hidden">
                            <img 
                              src={crew.photo} 
                              alt={crew.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="mt-1 text-center">
                            <div className="font-medium text-gray-900 dark:text-white text-sm">{crew.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{crew.type}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">No crew assigned yet.</div>
                  )}
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Link 
                    href={`/bookings/details/${selectedTrip.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    View Full Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  
  return (
    <Main>
      <div className="p-4 sm:p-6 space-y-6">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Booking Dashboard
          </h1>
          <div>
            <select
            value={month}
              className="border border-gray-300 dark:border-gray-700 rounded-lg py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              onChange={(e) => {
                const value = e.target.value;
                if (value) {
                  window.location = `/?month=${value}`;
                }
              }}
            >
              {Array.from({ length: 12 }, (_, i) => {
                const month = i + 1; // April (4) to December (12)
                const value = month.toString().padStart(2, '0');
                const label = new Date(2025, month - 1).toLocaleString('id-ID', {
                  month: 'long',
                });
                return (
                  <option key={value} value={value}>
                    {label}
                  </option>
                );
              })}
            </select>

          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total_booking} Trips ({summary.total_booking_pax} Pax)</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All JVTO, KLOOK & TWT bookings this month</p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.complete_booking}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Trips that have been completed</p>
            </div>
            <div className="bg-emerald-100 dark:bg-emerald-900/50 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                Active Bookings
                <span className="ml-2 relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.active_booking}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Trips currently in progress</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.upcoming_booking}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Future trips scheduled this month</p>
            </div>
            <div className="bg-purple-100 dark:bg-purple-900/50 p-3 rounded-full">
                <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            </div>
        </div>
        </div>        
        {/* Order Channel Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Booking by Order Channel</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center p-4 bg-blue-100 dark:bg-blue-900/20 rounded-lg relative">
                <div className="bg-blue-200 dark:bg-blue-800 p-2 rounded-full mr-4">
                    <img src="https://javavolcano-touroperator.com/assets/img/download.png" className="h-10" alt="" srcset="" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">JVTO</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{summaryOrderChannel.jvto} Trips ({summaryOrderChannel.jvto_pax} Pax)</p>
                </div>
                <Link href={dashboardData.orderChannelLinks.jvto} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-700 p-2 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
                    <ChevronRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </Link>
                </div>
                
                <div className="flex items-center p-4 bg-green-100 dark:bg-green-900/20 rounded-lg relative">
                <div className="bg-green-200 dark:bg-green-800 p-2 rounded-full mr-4">
                    <img src="https://play-lh.googleusercontent.com/M4QPJdAObEXZu15ZOS4wfn_MZD4N2kWggqCwQERwwN6cHZ6ROrp1LNwol07KssZ_rg" className="h-10 rounded-full" alt="" srcset="" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">KLOOK</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{summaryOrderChannel.klook} Trips ({summaryOrderChannel.klook_pax} Pax)</p>
                </div>
                <Link href={dashboardData.orderChannelLinks.klook} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-700 p-2 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400">
                    <ChevronRight className="h-5 w-5 text-green-600 dark:text-green-400" />
                </Link>
                </div>
                
                <div className="flex items-center p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg relative">
                <div className="bg-yellow-200 dark:bg-yellow-800 p-2 rounded-full mr-4">
                    <img src="https://static.wixstatic.com/media/096aa7_9a15b0951a7441caa3d8323cc6b8da8b~mv2.png/v1/fit/w_2500,h_1330,al_c/096aa7_9a15b0951a7441caa3d8323cc6b8da8b~mv2.png" className="h-10 w-10 object-cover rounded-full" alt="" srcset="" />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">TWT</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{summaryOrderChannel.twt} Trips ({summaryOrderChannel.twt_pax} Pax)</p>
                </div>
                <Link href={dashboardData.orderChannelLinks.twt} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-700 p-2 rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 dark:focus:ring-yellow-400">
                    <ChevronRight className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </Link>
                </div>
            </div>
        </div>       
        {TripCalendar({ trips })}
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Bookings - Takes 2/3 of the space */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Trip Schedule</h2>
              <button 
                onClick={() => setScheduleExpanded(!scheduleExpanded)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {scheduleExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>            
            {scheduleExpanded && (
                <>
                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button 
                    onClick={() => setActiveTab('active')}
                    className={`px-4 py-2 text-sm font-medium ${
                        activeTab === 'active' 
                        ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                    >
                    Active Trips <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {trips.filter(booking => booking.is_active && booking.status == 'active').length}
                    </span>
                    </button>
                    <button 
                    onClick={() => setActiveTab('upcoming')}
                    className={`px-4 py-2 text-sm font-medium ${
                        activeTab === 'upcoming' 
                        ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400' 
                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                    >
                    Upcoming Trips <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {trips.filter(booking => !booking.is_active && booking.status == 'upcoming').length}
                    </span>
                    </button>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Guest & PAx</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">CHANNEL</th>
                        {activeTab == 'active' ? (
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Itinerary Today</th>
                        ) : (
                            <>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Balance</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment Method</th>
                            </>
                        )}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Crew</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {trips
                        .filter(booking => activeTab === 'active' ? booking.is_active && booking.status == 'active' : !booking.is_active && booking.status == 'upcoming')
                        .map((booking) => {
                            const isToday = new Date(booking.date).toDateString() === new Date().toDateString();
                            return (
                            <tr onClick={() => {
                                router.visit(`/bookings/details/${booking.id}`, {
                                    method: 'get',
                                    data: { booking_id: booking.id },
                                    preserveState: true,
                                    preserveScroll: true,
                                });
                            }} key={booking.id} className={`cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50`}>
                                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">
                                <div className="flex flex-col">
                                    <span className="font-bold">{booking.date}</span>
                                    <span>{booking.date_day}</span>
                                </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="font-medium mb-1 text-sm text-gray-900 dark:text-white">{booking.user}</span>
                                        <span className="text-xs">{booking.package} / <span>{booking.total_pax} PAX</span></span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                <span className="text-xs mb-2 text-gray-500 dark:text-gray-400">{booking.order_channel}{getChannelBadge(booking.order_channel)}</span>
                                </td>
                                {activeTab == 'active' ? (
                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300 max-w-48">{booking.todayItinerary}</td>
                                ) : (
                                    <>
                                    <td className="px-6 py-4">
                                        {booking.balance != '-' ? formatCurrency(booking.balance) : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                                        {booking.payment_method == 'cc' ? (
                                            <>
                                            {booking.outstanding_payment_link && booking.outstanding_payment_link != '-' ? (
                                                <a href={booking.outstanding_payment_link} target="_blank" rel="noopener noreferrer">
                                                    <img src="/assets/images/icon/xendit.png" className="w-24" alt="" srcset="" />
                                                </a>
                                            ) : (
                                                <img src="/assets/images/icon/xendit.png" className="w-24" alt="" srcset="" />
                                            )}
                                            </>
                                        ) : booking.payment_method == 'wise' ? (
                                            <img src="/assets/images/icon/wise.png" className="w-24" alt="" srcset="" />
                                        ) : booking.payment_method == 'cash' ? (
                                            <img src="/assets/images/icon/cash.png" className="w-24" alt="" srcset="" />
                                        ) : booking.payment_method == 'edc' ? (
                                            <img src="/assets/images/icon/edc.png" className="w-24" alt="" srcset="" />
                                        ) : booking.payment_method}
                                    </td>
                                    </>
                                )}
                              <td className="px-6 py-4 whitespace-nowrap">
                                {booking.crews.length > 0 ? (
                                  <div className="flex gap-2 whitespace-nowrap">
                                    {booking.crews.map((crew, index) => (
                                      <div 
                                        className="text-center relative" 
                                        key={index}
                                        onMouseEnter={() => setHoveredCrew({...crew, bookingId: booking.id})}
                                        onMouseLeave={() => setHoveredCrew(null)}
                                      >
                                        <div className='rounded-full'>
                                          <img 
                                            src={crew.photo} 
                                            className="h-10 rounded-full bg-gray-100 w-10 object-cover" 
                                            alt={crew.name} 
                                          />
                                        </div>
                                        <span className="text-xs font-medium text-gray-900 dark:text-white block mt-1">{crew.name}</span>
                                        
                                        {/* Crew profile popup on hover - check for both crew ID and booking ID match */}
                                        {hoveredCrew && hoveredCrew.id === crew.id && hoveredCrew.bookingId === booking.id && (
                                          <div className="absolute z-10 right-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3">
                                            <div className="flex items-start gap-3">
                                              <div className="h-16 w-16 rounded-full overflow-hidden flex-shrink-0">
                                                <img 
                                                  src={crew.photo} 
                                                  alt={crew.name}
                                                  className="h-full w-full object-cover"
                                                />
                                              </div>
                                              <div>
                                                <div className="font-medium text-gray-900 dark:text-white text-left">{crew.name}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize flex items-center">
                                                  {crew.type}
                                                </div>
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                  {crew.tags.split(',').map((tag, i) => (
                                                    <span 
                                                      key={i} 
                                                      className="px-1.5 py-0.5 text-xs rounded bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                                    >
                                                      {tag}
                                                    </span>
                                                  ))}
                                                </div>
                                              </div>
                                            </div>
                                            
                                            <div className={`mt-3 grid ${crew.type == 'guide' ? 'grid-cols-2' : 'grid-cols-1'} gap-2 text-center`}>
                                              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                                <div className="text-xs text-gray-500 dark:text-gray-400">Escort Trips</div>
                                                <div className="font-medium text-gray-900 dark:text-white">{crew.recap_this_month_escort}</div>
                                              </div>
                                              {crew.type === 'guide' && (
                                                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                                                  <div className="text-xs text-gray-500 dark:text-gray-400">Ijen Trips</div>
                                                  <div className="font-medium text-gray-900 dark:text-white">{crew.recap_this_month_ijen}</div>
                                                </div>
                                              )}
                                            </div>
                                            
                                            {/* Add View Profile button */}
                                            <Link 
                                              href={`/data-master-management/crew/${crew.id}`}
                                              className="mt-3 w-full block py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                              }}
                                            >
                                              View Profile
                                            </Link>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200">
                                    No crew
                                  </span>
                                )}
                              </td>
                            </tr>
                            );
                        })}
                    </tbody>
                    </table>
                    
                    {/* Empty state */}
                    {trips.filter(booking => activeTab === 'active' ? booking.is_active && booking.status == 'active' : !booking.is_active && booking.status == 'upcoming').length === 0 && (
                    <div className="p-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400">
                        {activeTab === 'active' ? 'No active trips at the moment.' : 'No upcoming trips in the next 7 days.'}
                        </p>
                    </div>
                    )}
                </div>
                </>
            )}
        </div>          
          {/* Recent Payments - Takes 1/3 of the space */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Payments</h2>
              <button 
                onClick={() => setPaymentsExpanded(!paymentsExpanded)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {paymentsExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>     
            {paymentsExpanded && (
              <div className="overflow-hidden max-h-[500px] overflow-y-auto">
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {paymentHistory.slice(0, paymentsExpanded ? paymentHistory.length : 5).map((payment) => {
                      // Add state to track expanded state for this payment
                      const isExpanded = expandedPayments.includes(payment.id);
                      
                      return (
                      <li key={payment.id} className="transition-colors">
                          <div 
                          className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                          onClick={() => togglePaymentDetail(payment.id)}
                          >
                          <div className="flex justify-between items-start mb-1">
                              <span className="font-medium text-gray-900 dark:text-white">{payment.user}</span>
                              {payment.payment_method_id == 3 ? (
                              <img src="/assets/images/icon/xendit.png" className="w-18" alt="" srcSet="" />
                              ) : payment.payment_method_id == 5 ? (
                              <img src="/assets/images/icon/wise.png" className="w-18" alt="" srcSet="" />
                              ) : payment.payment_method_id == 1 ? (
                              <img src="/assets/images/icon/cash.png" className="w-18" alt="" srcSet="" />
                              ) : payment.payment_method_id == 4 ? (
                              <img src="/assets/images/icon/edc.png" className="w-18" alt="" srcSet="" />
                              ) : payment.payment_method_id == 6 ? (
                              <img src="/assets/images/icon/bank-transfer.png" className="w-20" alt="" srcSet="" />
                              ) : payment.payment_method}
                          </div>
                          <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-700 dark:text-gray-300">{payment.created_at}</span>
                              <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(payment.nominal)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                              <div className="flex items-center">
                              <span className="text-xs text-gray-500 dark:text-gray-400">{payment.description}</span>
                              <ChevronDown className={`h-4 w-4 ml-2 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </div>
                              {payment.reference && payment.reference != '' ? (
                              <a href={payment.reference} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline dark:text-blue-400">
                                  {payment.reference.substr(0,30)}{payment.reference.length > 30 && '...'}
                              </a>
                              ) : '-'}
                          </div>
                          </div>
                          
                          {/* Collapsible detail section */}
                          {isExpanded && (
                          <div className="px-4 py-4 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-100 dark:border-gray-700">
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Booking ID</p>
                                      <Link href={`/bookings/details/${payment.booking_id}`} className="text-blue-900 hover:underline dark:text-white">#{payment.booking_id}</Link>
                                  </div>
                                  <div>
                                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Receipt No</p>
                                      <button onClick={() => {
                                          window.open("https://javavolcano-touroperator.com/backoffice/invoice/view-receipt/"+payment.booking_id+"/partial/"+payment.id,'_blank')
                                      }} className="text-blue-900 hover:underline dark:text-white">{payment.receipt}</button>
                                  </div>
                                  <div>
                                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Invoice No</p>
                                      <button onClick={() => {
                                          window.open('https://javavolcano-touroperator.com/backoffice/invoice/view-invoice/'+payment.booking_id,'_blank')
                                          if(payment.is_add_on){
                                              window.open('https://javavolcano-touroperator.com/backoffice/invoice/view-invoice/'+payment.booking_id+"?addon=true",'_blank')
                                          }
                                      }} className="text-blue-900 hover:underline dark:text-white">{payment.booking_code}</button>
                                  </div>
                                  <div>
                                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Trip Date</p>
                                      <p className="text-gray-900 dark:text-white">{formatDate(payment.trip_date)}</p>
                                  </div>
                                  <div>
                                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Participant</p>
                                      <p className="text-gray-900 dark:text-white">{payment.pax} PAX</p>
                                  </div>
                                  <div>
                                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Grand Total</p>
                                      <p className="text-gray-900 dark:text-white">{formatCurrency(payment.grand_total)}</p>
                                  </div>
                              </div>
                              <div className="mt-3">
                                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Package</p>
                                  {
                                      payment.package_url ? (
                                          <a href={payment.package_url} target="_blank" className="text-blue-900 hover:underline text-sm dark:text-white">{payment.package}</a>
                                      ) : (
                                          <p className="text-gray-900 text-sm dark:text-white">{payment.package}</p>
                                      )
                                  }
                              </div>

                          </div>
                          )}
                      </li>
                      );
                  })}
                  </ul>
                  
                  {!showAllPayments && paymentHistory.length > 5 && (
                  <div className="p-3 text-center border-t border-gray-200 dark:border-gray-700">
                      <button 
                      onClick={() => setShowAllPayments(true)}
                      className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                      >
                      View all payments
                      </button>
                  </div>
                  )}
              </div>
            )}       
        </div>
        </div>
        
        {/* Alerts Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              Alerts & Warnings
            </h2>
            <button 
              onClick={() => setAlertsExpanded(!alertsExpanded)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              {alertsExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>         
          {alertsExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-8 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700">
              <div className="md:col-span-2 p-4">
                <nav className="flex flex-col space-y-1">
                  {Object.entries(alert).map(([key, items]) => {
                    const alertCount = items.length;
                    const isActive = selectedAlert === key;
                    
                    // Map alert types to icons
                    const alertIcons = {
                      no_pickup: <MapPin className="h-4 w-4" />,
                      no_drop: <MapPin className="h-4 w-4" />,
                      no_car: <Car className="h-4 w-4" />,
                      no_crew: <UserCheck className="h-4 w-4" />,
                      no_payment_method: <CardIcon className="h-4 w-4" />,
                      no_hotel: <Hotel className="h-4 w-4" />,
                      no_tshirt: <Shirt className="h-4 w-4" />,
                      no_trip_media: <Camera className="h-4 w-4" />
                    };
                    
                    // Format alert name
                    const formatAlertName = (name) => {
                      return name.replace('no_', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    };
                    
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedAlert(key)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                          isActive 
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium' 
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className={`mr-3 ${isActive ? 'text-blue-500 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            {alertIcons[key]}
                          </span>
                          <span>{formatAlertName(key)}</span>
                        </div>
                        {alertCount > 0 && (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            isActive 
                              ? 'bg-blue-200 text-blue-800 dark:bg-blue-800 dark:text-blue-200' 
                              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {alertCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
              
              <div className="md:col-span-6 p-4">
                <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  {selectedAlert && alert[selectedAlert].length > 0 
                    ? `${alert[selectedAlert].length} bookings with missing ${selectedAlert.replace('no_', '').replace(/_/g, ' ')}`
                    : `No issues with ${selectedAlert.replace('no_', '').replace(/_/g, ' ')}`}
                </h3>
                
                {alert[selectedAlert].length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Guest</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Package</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pax</th>
                          <th scope="col" className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {alert[selectedAlert].map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">#{item.id}</td>
                            <td className="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                            <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{item.package_duration}D {item.package_duration-1}N</td>
                            <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{formatDate(item.travel_date_start)}</td>
                            <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{item.total_pax}</td>
                            <td className="px-3 py-2 text-center">
                              <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                <ChevronRight className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 text-center">
                      All bookings have the required {selectedAlert.replace('no_', '').replace(/_/g, ' ')} information.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )} 
        </div>
      </div>
    </Main>
  );
}
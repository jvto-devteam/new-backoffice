import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import Main from '@/Layouts/Main';
import { 
  User, Calendar, Star, ChevronLeft, MapPin, Clock, Users, 
  CreditCard, Award, MessageCircle, ThumbsUp, ChevronRight, 
  ChevronDown, ChevronUp, ArrowLeft, Shield, Compass,X,
  Calendar as CalendarIcon, Activity, BarChart2
} from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

export default function CrewDetails({ res }) {
  const { crew, year, month } = res;
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    profile: true,
    stats: true,
    schedule: true,
    reviews: true
  });

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  // Calculate average rating
  const averageRating = crew.crew_review.length > 0 
    ? crew.crew_review.reduce((sum, review) => sum + review.rate, 0) / crew.crew_review.length 
    : 0;

  // Format date
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };
  
  // Get month name
  const getMonthName = (monthNum) => {
    const date = new Date();
    date.setMonth(parseInt(monthNum) - 1);
    return date.toLocaleString('en-US', { month: 'long' });
  };

  // Channel-specific colors
  const channelColors = {
    'JVTO': {
      background: '#DBEAFE', // blue-100
      textColor: '#1E40AF', // blue-800
      borderColor: '#93C5FD', // blue-300
      darkBackground: 'rgba(30, 64, 175, 0.2)', // blue-800 with opacity
      darkTextColor: '#BFDBFE', // blue-200
      lightBadge: 'bg-blue-50 text-blue-700', // Changed for better contrast
      darkBadge: 'dark:bg-blue-900/30 dark:text-blue-200'
    },
    'KLOOK': {
      background: '#DCFCE7', // green-100
      textColor: '#166534', // green-800
      borderColor: '#86EFAC', // green-300
      darkBackground: 'rgba(22, 101, 52, 0.2)', // green-800 with opacity
      darkTextColor: '#BBF7D0', // green-200
      lightBadge: 'bg-green-50 text-green-700', // Changed for better contrast
      darkBadge: 'dark:bg-green-900/30 dark:text-green-200'
    },
    'TWT': {
      background: '#FEF9C3', // yellow-100
      textColor: '#854D0E', // yellow-800
      borderColor: '#FDE047', // yellow-300
      darkBackground: 'rgba(133, 77, 14, 0.2)', // yellow-800 with opacity
      darkTextColor: '#FEF08A', // yellow-200
      lightBadge: 'bg-yellow-50 text-yellow-700', // Changed for better contrast
      darkBadge: 'dark:bg-yellow-900/30 dark:text-yellow-200'
    }
  };

  // Generate calendar events
  const calendarEvents = crew.book_guide_driver.map(booking => {
    const channel = booking.booking.channel;
    const colors = channelColors[channel];
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    return {
      id: booking.id.toString(),
      title: booking.booking.user.name,
      start: booking.start_date,
      end: new Date(new Date(booking.end_date).setDate(new Date(booking.end_date).getDate() + 1)).toISOString().split('T')[0],
      backgroundColor: isDarkMode ? colors.darkBackground : colors.background,
      textColor: isDarkMode ? colors.darkTextColor : colors.textColor,
      borderColor: colors.borderColor,
      extendedProps: {
        booking: booking,
        channel: channel,
        isIjen: booking.guide_ijen === "1"
      }
    };
  });

  // Render custom event content in calendar
  const renderEventContent = (eventInfo) => {
    const { booking, channel, isIjen } = eventInfo.event.extendedProps;
    
    return (
      <div className="flex items-center justify-between p-1 overflow-hidden cursor-pointer">
        <div className="overflow-hidden">
          <div className="text-xs font-medium truncate">{eventInfo.event.title}</div>
          <div className="text-xs opacity-80 truncate flex items-center">
            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${channelColors[channel].lightBadge} ${channelColors[channel].darkBadge} mr-1`}>
              {channel}
            </span>
            {isIjen && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
                Ijen
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Handle calendar event click
  const handleEventClick = (info) => {
    setSelectedBooking(info.event.extendedProps.booking);
  };

  // Group bookings by date for the timeline view
  const bookingsByDate = {};
  crew.book_guide_driver.forEach(booking => {
    const startDate = new Date(booking.start_date);
    const dateKey = startDate.toISOString().split('T')[0];
    
    if (!bookingsByDate[dateKey]) {
      bookingsByDate[dateKey] = [];
    }
    
    bookingsByDate[dateKey].push(booking);
  });

  // Sort dates for timeline
  const sortedDates = Object.keys(bookingsByDate).sort();

  return (
    <Main>
      <Head title={`Crew Details - ${crew.name}`} />
      
      <div className="p-4 sm:p-6 space-y-6">
        {/* Top navigation */}
        <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Crew Details
          </h1>
          <div className="flex items-center space-x-2">
            <select 
              value={month}
              onChange={(e) => window.location.href = `/data-master-management/crew/${crew.id}?year=${year}&month=${e.target.value}`}
              className="border border-gray-300 dark:border-gray-700 rounded-lg py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              {Array.from({ length: 12 }, (_, i) => {
                const monthNum = (i + 1).toString().padStart(2, '0');
                return (
                  <option key={monthNum} value={monthNum}>
                    {getMonthName(monthNum)}
                  </option>
                );
              })}
            </select>
            
            <select 
              value={year}
              onChange={(e) => window.location.href = `/data-master-management/crew/${crew.id}?year=${e.target.value}&month=${month}`}
              className="border border-gray-300 dark:border-gray-700 rounded-lg py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            >
              {[2025].map(yearVal => (
                <option key={yearVal} value={yearVal}>{yearVal}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Profile section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <User className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              Profile
            </h2>
            <button 
              onClick={() => toggleSection('profile')}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              {expandedSections.profile ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>
          
          {expandedSections.profile && (
            <div className="p-4 sm:p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="h-48 w-48 rounded-xl overflow-hidden border-4 border-white dark:border-gray-700 shadow-md">
                      <img 
                        src={crew.photo} 
                        alt={crew.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="absolute bottom-3 right-3">
                      <div className="bg-white dark:bg-gray-700 rounded-full p-2 shadow-md">
                        <Star className="h-5 w-5 text-yellow-500" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex-grow">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{crew.name}</h1>
                  <div className="flex items-center mb-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200">
                      {crew.role}
                    </span>
                    <div className="flex items-center ml-4">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-4 w-4 ${star <= Math.round(averageRating) ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                            fill={star <= Math.round(averageRating) ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        {averageRating.toFixed(1)} ({crew.crew_review.length} reviews)
                      </span>
                    </div>
                  </div>

                  <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4`}>
                    <div className="bg-gray-100 dark:bg-gray-700/40 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                          <Award className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                          <span className="font-medium">Total Trips</span>
                        </div>
                        <span className="text-xl font-bold text-gray-900 dark:text-white">{crew.escort_trips + crew.ijen_trips}</span>
                      </div>
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                        This month
                      </div>
                    </div>


                    {crew.is_driver == '0' && (
                        <>
                            <div className="bg-gray-100 dark:bg-gray-700/40 p-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                                    <Compass className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                                    <span className="font-medium">Escort Trips</span>
                                    </div>
                                    <span className="text-xl font-bold text-gray-900 dark:text-white">{crew.escort_trips}</span>
                                </div>
                                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                    This month
                                </div>
                            </div>                        
                            <div className="bg-gray-100 dark:bg-gray-700/40 p-4 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-gray-700 dark:text-gray-300">
                                    <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
                                    <span className="font-medium">Ijen Trips</span>
                                    </div>
                                    <span className="text-xl font-bold text-gray-900 dark:text-white">{crew.ijen_trips}</span>
                                </div>
                                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                    This month
                                </div>
                            </div>
                        </>
                    )}
                    <div>
                        <div className="text-sm text-black mb-1 font-medium">Available for :</div>
                        <div className="flex flex-wrap gap-2">
                            {crew.tags.split(',').map((tag, index) => (
                            <span 
                                key={index}
                                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${channelColors[tag].lightBadge}`}
                            >
                                {tag}
                            </span>
                            ))}
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Statistics summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <BarChart2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              Statistics Summary
            </h2>
            <button 
              onClick={() => toggleSection('stats')}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              {expandedSections.stats ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>
          
          {expandedSections.stats && (
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">JVTO Bookings</h3>
                    <div className="p-2 bg-blue-200/50 dark:bg-blue-800/30 rounded-full">
                      <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {crew.book_guide_driver.filter(b => b.booking.channel === 'JVTO').length}
                  </div>
                  <div className="mt-2 text-sm text-blue-800/70 dark:text-blue-300/70">
                    {getMonthName(month)} {year}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-green-800 dark:text-green-300">KLOOK Bookings</h3>
                    <div className="p-2 bg-green-200/50 dark:bg-green-800/30 rounded-full">
                      <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {crew.book_guide_driver.filter(b => b.booking.channel === 'KLOOK').length}
                  </div>
                  <div className="mt-2 text-sm text-green-800/70 dark:text-green-300/70">
                    {getMonthName(month)} {year}
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">TWT Bookings</h3>
                    <div className="p-2 bg-yellow-200/50 dark:bg-yellow-800/30 rounded-full">
                      <Activity className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {crew.book_guide_driver.filter(b => b.booking.channel === 'TWT').length}
                  </div>
                  <div className="mt-2 text-sm text-yellow-800/70 dark:text-yellow-300/70">
                    {getMonthName(month)} {year}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Schedule section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              Monthly Schedule
            </h2>
            <button 
              onClick={() => toggleSection('schedule')}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              {expandedSections.schedule ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>
          
          {expandedSections.schedule && (
            <div>
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <div className="flex">
                        <button
                        onClick={() => setActiveTab('schedule')}
                        className={`relative px-4 py-4 text-sm font-medium ${
                            activeTab === 'schedule'
                            ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                        >
                        Calendar View
                        </button>
                        <button
                        onClick={() => setActiveTab('timeline')}
                        className={`relative px-4 py-4 text-sm font-medium ${
                            activeTab === 'timeline'
                            ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                        }`}
                        >
                        Table View
                        </button>
                    </div>
                </div>

              <div className="p-4">
                {activeTab === 'schedule' ? (
                  <div>
                    <FullCalendar
                      plugins={[dayGridPlugin, interactionPlugin]}
                      initialView="dayGridMonth"
                      events={calendarEvents}
                      eventContent={renderEventContent}
                      eventClick={handleEventClick}
                      headerToolbar={{
                        left: '',
                        center: 'title',
                        right: ''
                      }}
                      height="auto"
                      dayMaxEvents={3}
                      moreLinkClick="popover"
                      firstDay={1}
                      dayHeaderClassNames="text-xs font-medium text-gray-500 dark:text-gray-400"
                      dayHeaderFormat={{ weekday: 'short' }}
                      weekNumberClassNames="text-xs text-gray-400 dark:text-gray-500"
                      moreLinkClassNames="text-xs px-1 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-sm hover:bg-blue-100 dark:hover:bg-blue-800/30"
                    />
                  </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Guest</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Channel</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trip Type</th>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {crew.book_guide_driver
                            .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
                            .map(booking => {
                                const channel = booking.booking.channel;
                                const colors = channelColors[channel];
                                const isIjen = booking.guide_ijen === "1";
                                
                                return (
                                <tr 
                                    key={booking.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer"
                                    onClick={() => setSelectedBooking(booking)}
                                >
                                    <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 dark:text-white">{formatDate(booking.start_date)}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{booking.booking.user.name}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors.lightBadge} ${colors.darkBadge}`}>
                                        {channel}
                                    </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                    {isIjen ? (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
                                        Ijen Trip
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                                        Escort Trip
                                        </span>
                                    )}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                                    </td>
                                </tr>
                                );
                            })}
                        </tbody>
                        </table>
                    </div>
                    )}
              </div>
            </div>
          )}
        </div>
        
        {/* Reviews section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
              Customer Reviews
            </h2>
            <button 
              onClick={() => toggleSection('reviews')}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              {expandedSections.reviews ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>
          
          {expandedSections.reviews && (
            <div className="p-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-6 text-center">
                    <div className="text-5xl font-bold text-gray-900 dark:text-white mb-3">
                      {averageRating.toFixed(1)}
                    </div>
                    <div className="flex justify-center mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`h-6 w-6 ${star <= Math.round(averageRating) ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                          fill={star <= Math.round(averageRating) ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Based on {crew.crew_review.length} reviews
                    </div>
                    
                    <div className="mt-6 space-y-3">
                      {[5, 4, 3, 2, 1].map(rating => {
                        const count = crew.crew_review.filter(review => review.rate === rating).length;
                        const percentage = crew.crew_review.length > 0 
                          ? Math.round((count / crew.crew_review.length) * 100) 
                          : 0;
                        
                        return (
                          <div key={rating} className="flex items-center text-sm">
                            <div className="w-10 text-right mr-3 text-gray-600 dark:text-gray-400">
                              {rating} {rating === 1 ? 'star' : 'stars'}
                            </div>
                            <div className="flex-grow">
                              <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                                <div 
                                  style={{ width: `${percentage}%` }} 
                                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                                    rating >= 4 ? 'bg-green-500 dark:bg-green-600' : 
                                    rating >= 3 ? 'bg-yellow-500 dark:bg-yellow-600' : 
                                    'bg-red-500 dark:bg-red-600'
                                  }`}
                                ></div>
                              </div>
                            </div>
                            <div className="w-5 text-right ml-3 text-gray-600 dark:text-gray-400">
                              {count}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="md:w-2/3">
                    {crew.crew_review.length > 0 ? (
                        <div className="space-y-4 h-96 overflow-y-auto pr-2">
                        {crew.crew_review.map(review => {
                            const channel = review.booking.channel;
                            const colors = channelColors[channel];
                            // Assuming created_at exists on review
                            const reviewDate = review.created_at ? formatDate(review.created_at) : "N/A";
                            
                            return (
                            <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                                <div className="flex justify-between items-start">
                                <div className="flex items-start">
                                    <div className="mr-3">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                        <User className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                                    </div>
                                    </div>
                                    <div>
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {review.booking.user.name}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors.lightBadge} ${colors.darkBadge} mr-2`}>
                                        {channel}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                                        {reviewDate}
                                        </span>
                                        <Link 
                                        href={`/bookings/details/${review.booking.id}`}
                                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                        View Booking
                                        </Link>
                                    </div>
                                    </div>
                                </div>
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                        key={star} 
                                        className={`h-4 w-4 ${star <= review.rate ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                                        fill={star <= review.rate ? 'currentColor' : 'none'}
                                    />
                                    ))}
                                </div>
                                </div>
                                
                                {review.note && (
                                <div className="mt-3 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
                                    "{review.note}"
                                </div>
                                )}
                            </div>
                            );
                        })}
                        </div>
                    ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <MessageCircle className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 text-center">
                        No reviews yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" 
          onClick={() => setSelectedBooking(null)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" 
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trip Details</h3>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Guest</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedBooking.booking.user.name}
                  </div>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  channelColors[selectedBooking.booking.channel].lightBadge
                } ${
                  channelColors[selectedBooking.booking.channel].darkBadge
                }`}>
                  {selectedBooking.booking.channel}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Booking ID</div>
                  <div className="text-gray-900 dark:text-white">#{selectedBooking.booking.id}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Trip Type</div>
                  <div className="text-gray-900 dark:text-white">
                    {selectedBooking.guide_ijen === "1" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
                        Ijen Trip
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                        Escort Trip
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Start Date</div>
                  <div className="text-gray-900 dark:text-white">{formatDate(selectedBooking.start_date)}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">End Date</div>
                  <div className="text-gray-900 dark:text-white">{formatDate(selectedBooking.end_date)}</div>
                </div>
              </div>
              
              {/* Customer Reviews Section in Modal, if any */}
              {selectedBooking.booking.crew_review && selectedBooking.booking.crew_review.length > 0 ? (
                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center">
                    <ThumbsUp className="h-4 w-4 mr-2 text-green-500" />
                    Customer Feedback
                  </h4>
                  
                  {selectedBooking.booking.crew_review.map(review => (
                    <div key={review.id} className="bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
                      <div className="flex items-center mb-2">
                        <div className="flex mr-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                              key={star} 
                              className={`h-4 w-4 ${star <= review.rate ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'}`}
                              fill={star <= review.rate ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                          {review.rate}/5
                        </span>
                      </div>
                      
                      {review.note && (
                        <div className="text-gray-700 dark:text-gray-300 text-sm">
                          "{review.note}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    No reviews for this trip yet.
                  </div>
                </div>
              )}
              
              <div className="mt-4 flex justify-end">
                <Link 
                  href={`/bookings/details/${selectedBooking.booking.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  View Booking Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </Main>
  );
}
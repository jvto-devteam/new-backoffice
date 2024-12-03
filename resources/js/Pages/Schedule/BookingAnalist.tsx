import Main from '@/Layouts/Main';
import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { format, parse, addDays } from 'date-fns';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell,
  ResponsiveContainer
} from 'recharts';
import { 
  BedDouble, Mountain, Bus, Shirt,
  Users, Calendar, Wallet, ArrowRight,
  TrendingUp, TrendingDown, ArrowUpRight, 
  ArrowDownRight, Filter, Download, Minus,
  ChevronDown, Search
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
const useClickOutside = (handler) => {
    const ref = React.useRef();
  
    React.useEffect(() => {
      const handleClickOutside = (event) => {
        if (ref.current && !ref.current.contains(event.target)) {
          handler();
        }
      };
  
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [handler]);
  
    return ref;
};
  
const FilterDropdown = ({ label, value, options, onChange, currentFilters }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useClickOutside(() => setIsOpen(false));
  
  
  const handleChange = (id) => {
    onChange(id);

    const updatedFilters = {
      ...currentFilters,
      [label.toLowerCase()]: id,
    };

    router.get('', updatedFilters, { preserveScroll: true });
  };
  
  return (
    <div className="relative w-full md:w-auto" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex justify-between w-full md:w-auto items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        {label}: {options.find(opt => opt.id == value)?.name || 'Select'} <ChevronDown className="ml-1 h-4 w-4" />
      </button>
      {isOpen && (
        <div className="absolute mt-1 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg z-10">
          {options.map((option) => (
            <button
              key={option.id}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={() => {
                handleChange(option.id);
                setIsOpen(false);
              }}
            >
              {option.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
export default function BookingAnalist({data,total}) {
  // State for all filters
  const [month, setMonth] = useState(data.filter.month);
  const [year, setYear] = useState(data.filter.year);
  const [channel, setChannel] = useState(data.filter.channel);
  const [hotel, setHotel] = useState(data.filter.hotel);
  const [activity, setActivity] = useState(data.filter.activity);
  const [activeTab, setActiveTab] = useState(data.filter.activeTab);

  // Filter options
  const months = [
    { id: '01', name: 'January' },
    { id: '02', name: 'February' },
    { id: '03', name: 'March' },
    { id: '04', name: 'April' }, 
    { id: '05', name: 'May' },
    { id: '06', name: 'June' },
    { id: '07', name: 'July' },
    { id: '08', name: 'August' },
    { id: '09', name: 'September' },
    { id: '10', name: 'October' },
    { id: '11', name: 'November' }, 
    { id: '12', name: 'December' }
  ];
  const years = [
    { id: '2024', name: '2024' },
    { id: '2025', name: '2025' }
  ];
  const channels = [
    { id: 'all', name: 'All' },
    { id: 'twt', name: 'TWT' },
    { id: 'jvto', name: 'JVTO' },
    { id: 'klook', name: 'KLOOK' }
  ];
  const hotels = data.hotel
  
  
  const activities = data.destination;
  

  // T-shirt data
  const tshirtData = {
    totalStock: 850,
    distributed: 505,
    mostPopularSize: 'L',
    remainingStock: 345,
    sizeDistribution: [
      { size: 'S', stock: 150, distributed: 76, remaining: 74 },
      { size: 'M', stock: 200, distributed: 126, remaining: 74 },
      { size: 'L', stock: 250, distributed: 177, remaining: 73 },
      { size: 'XL', stock: 150, distributed: 126, remaining: 24 }
    ],
    monthlyDistribution: [
      { month: 'Sep', total: 155, popularSize: 'L' },
      { month: 'Oct', total: 168, popularSize: 'L' },
      { month: 'Nov', total: 182, popularSize: 'L' }
    ]
  };

  // Compounded data statistics
  const compoundStats = {
    totalBookings: {
      value: data.total_booking_current_month,
      change: data.total_booking_percentage_change,
      trend: data.total_booking_percentage_change_trend
    },
    totalInvoice: {
      value: data.total_invoice_current_month,
      change: data.total_invoice_percentage_change,
      trend: data.total_invoice_percentage_change_trend
    },
    totalProfit: {
      value: data.total_profit_current_month,
      change: data.total_profit_percentage_change,
      trend: data.total_profit_percentage_change_trend
    }
  };

  const reports = {
    accommodations: {
      title: "Accommodation Report",
      summary: {
        totalBookings: {
          value: 156,
          change: '+8.2%',
          trend: 'up'
        },
        totalRevenue: {
          value: 'Rp 152,350,000',
          change: '+12.4%',
          trend: 'up'
        },
        occupancyRate: {
          value: '85%',
          change: '+5.3%',
          trend: 'up'
        },
        avgNights: {
          value: '2.3',
          change: '-0.2%',
          trend: 'down'
        }
      },
      monthlyTrends: [
        { month: 'Aug', bookings: 42, revenue: 128450000 },
        { month: 'Sep', bookings: 45, revenue: 138650000 },
        { month: 'Oct', bookings: 52, revenue: 142750000 },
        { month: 'Nov', bookings: 59, revenue: 152350000 }
      ],
      roomDistribution: [
        { name: "Twin", value: 45, revenue: 68558000 },
        { name: "Double", value: 30, revenue: 45705000 },
        { name: "Extra Bed", value: 25, revenue: 38087000 }
      ],
      detailedBookings: [
        {
          id: '875',
          guest: 'Nethmi Hettiarachchi',
          checkIn: '06-Dec-2024',
          checkOut: '07-Dec-2024',
          room: 'Twin x 2, Extra Bed x 1',
          status: 'Confirmed',
          revenue: '1,480,000'
        },
        // Add more booking details...
      ]
    },
    activities: {
      title: "Activities Report",
      summary: {
        totalBookings: {
          value: 284,
          change: '+15.3%',
          trend: 'up'
        },
        totalRevenue: {
          value: 'Rp 98,560,000',
          change: '+18.7%',
          trend: 'up'
        },
        avgRating: {
          value: '4.8/5',
          change: '+0.2',
          trend: 'up'
        },
        completionRate: {
          value: '98%',
          change: '+1.2%',
          trend: 'up'
        }
      }
      // Include similar detailed data structure...
    },
    transportation: {
      title: "Transportation Report",
      summary: {
        totalBookings: {
          value: 284,
          change: '+15.3%',
          trend: 'up'
        },
        totalRevenue: {
          value: 'Rp 98,560,000',
          change: '+18.7%',
          trend: 'up'
        },
        avgRating: {
          value: '4.8/5',
          change: '+0.2',
          trend: 'up'
        },
        completionRate: {
          value: '98%',
          change: '+1.2%',
          trend: 'up'
        }
      }
      // Include similar detailed data structure...
    },
    tshirt: {
      title: "T-Shirts Report",
      summary: {
        totalBookings: {
          value: 284,
          change: '+15.3%',
          trend: 'up'
        },
        totalRevenue: {
          value: 'Rp 98,560,000',
          change: '+18.7%',
          trend: 'up'
        },
        avgRating: {
          value: '4.8/5',
          change: '+0.2',
          trend: 'up'
        },
        completionRate: {
          value: '98%',
          change: '+1.2%',
          trend: 'up'
        }
      }
      // Include similar detailed data structure...
    }
    // Add other report categories...
  };

  return (
    <Main>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Top Stats Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            {/* <div className="flex flex-col md:flex-row justify-between items-center gap-4"> */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center flex-col md:flex-row gap-4">
                <div className="flex justify-between w-full md:w-auto">
                    <h1 className="text-xl font-semibold">Booking Analytics</h1>
                    <button className="inline-flex md:hidden items-center px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-gray-50 dark:hover:bg-gray-700 bg-green-600">
                        <Download className="h-4 w-4 mr-1" /> Export
                    </button>
                </div>
                {/* <div className="flex flex-wrap flex-col md:flex-row items-center gap-3"> */}
                <div className="flex flex-wrap items-center gap-3">
                    <FilterDropdown 
                        label="Month"
                        value={month}
                        options={months}
                        onChange={setMonth}
                        currentFilters={{month, year, channel, activeTab}}
                    />
                    <FilterDropdown 
                        label="Year"
                        value={year}
                        options={years}
                        onChange={setYear}
                        currentFilters={{month, year, channel, activeTab}}
                    />
                    <FilterDropdown 
                        label="Channel"
                        value={channel}
                        options={channels}
                        onChange={setChannel}
                        currentFilters={{month, year, channel, activeTab}}
                    />
                </div>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <button className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-white hover:bg-gray-50 dark:hover:bg-gray-700 bg-green-600">
                  <Download className="h-4 w-4 mr-1" /> Export
                </button>
              </div>
            </div>
            
            {/* Compound Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              {Object.entries(compoundStats).map(([key, stat]) => (
                <div key={key} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="mt-1 text-xl font-semibold">{stat.value}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-sm ${
                    stat.trend === 'up' 
                      ? 'text-green-600 bg-green-100 dark:bg-green-900/50'
                      : stat.trend === 'down'
                        ? 'text-red-600 bg-red-100 dark:bg-red-900/50'
                        : 'text-gray-600 bg-gray-100 dark:bg-gray-900/50'
                    }`}>
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                    ) : stat.trend === 'down' ? (
                      <ArrowDownRight className="h-4 w-4 mr-1" /> 
                    ) : (
                      <Minus className="h-4 w-4 mr-1" />
                    )}
                    {stat.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8 overflow-auto">
              {['All Reports', 'Accommodations', 'Activities', 'Transportation', 'T-Shirts'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab.toLowerCase().replace(' ', '-'))
                    router.get('', {
                      month : month,
                      year : year,
                      channel : channel,
                      activeTab : tab.toLowerCase().replace(' ', '-'),
                    }, { preserveScroll: true });
                  }}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.toLowerCase().replace(' ', '-')
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'}
                  `}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
          {/* Report Content */}

          {activeTab === 'accommodations' && (
            <div className="mb-6">
                <FilterDropdown 
                label="Hotel"
                value={hotel}
                options={hotels}
                onChange={setHotel}
                currentFilters={{month, year, channel, activeTab, hotel}}
                />
            </div>
            )}

            {activeTab === 'activities' && (
            <div className="mb-6">
                <FilterDropdown 
                label="Activity"
                value={activity}
                options={activities}
                onChange={setActivity}
                currentFilters={{month, year, channel, activeTab, activity}}
                />
            </div>
            )}

          {activeTab === 'all-reports' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Summary Cards */}
              {Object.entries(reports).map(([key, report]) => (
                <SummaryCard key={key} report={report} />
              ))}
            </div>
          ) : (
            <DetailedReport 
              totalProps={total} 
              dataReport={data.report} 
              report={reports[activeTab]} 
              type={activeTab} 
              currentFilters={{month, year, channel, activeTab, activity}}
              />
          )}
        </div>
      </div>
    </Main>
  );
}
const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID').format(angka);
};

function SummaryCard({ report }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">{report.title}</h3>
        <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm flex items-center">
          View Details <ArrowRight className="h-4 w-4 ml-1" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(report.summary).map(([key, stat]) => (
          <div key={key} className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </p>
            <div className="mt-1 flex items-center justify-between">
              <p className="text-lg font-semibold">{stat.value}</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-sm ${
              stat.trend === 'up' 
                ? 'text-green-600 bg-green-100 dark:bg-green-900/50'
                : stat.trend === 'down'
                  ? 'text-red-600 bg-red-100 dark:bg-red-900/50'
                  : 'text-gray-600 bg-gray-100 dark:bg-gray-900/50'
              }`}>
              {stat.trend === 'up' ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : stat.trend === 'down' ? (
                <ArrowDownRight className="h-4 w-4 mr-1" /> 
              ) : (
                <Minus className="h-4 w-4 mr-1" />
              )}
              {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DetailedReport({ totalProps,dataReport,type,currentFilters }) {
    const getContent = () => {
      switch(type) {
        case 'accommodations':
          const totalRoom = Object.values(dataReport.data_hotel.book_hotel).flatMap((book) => book.book_room).reduce((total, room) => total + room.quantity, 0)

          const totalAmount = Object.values(dataReport.data_hotel.book_hotel).flatMap((book) => book.book_room).reduce((total, room) => total + (room.subtotal !== null ? room.subtotal : (room.room_hotel.rate * room.quantity )), 0)

          let roomSummary = []
          let grandTotalSummary = 0
          let totalRoomSummary = 0

          Object.values(dataReport.data_hotel.book_hotel)
          .map((data,index) => {
            data.book_room.map((res,key) => {
              const cek = roomSummary.find((d) => d.room_id == res.room_hotel.id)
              const subtotal = (res.subtotal !== null ? res.subtotal : (res.room_hotel.rate * res.quantity ))

              if(typeof cek === 'undefined'){
                roomSummary.push({
                  room_id: res.room_hotel.id,
                  room_name: res.room_hotel.room_name,
                  quantity: res.quantity,
                  amount: subtotal,
                });
              }              
              else{
                roomSummary.find((d) => d.room_id == res.room_hotel.id).quantity += res.quantity
                roomSummary.find((d) => d.room_id == res.room_hotel.id).amount += subtotal
              }
              
              grandTotalSummary += subtotal
              totalRoomSummary += res.quantity
            })
          });

          return (
            currentFilters.hotel !== '' ? (
              <div className="space-y-6">
                {/* Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Bookings</h3>
                    <div className="mt-2 flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{dataReport.data_hotel.total_booking}</p>
                      {/* <p className="ml-2 text-sm font-medium text-green-600">
                        +8% from last month
                      </p> */}
                    </div>
                  </div>
    
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Guests</h3>
                    <div className="mt-2 flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{dataReport.data_hotel.total_pax}</p>
                      {/* <p className="ml-2 text-sm font-medium text-green-600">
                        +12% from last month
                      </p> */}
                    </div>
                  </div>
    
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Rooms</h3>
                    <div className="mt-2 flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalRoom}</p>
                      {/* <p className="ml-2 text-sm font-medium text-green-600">
                        +15% from last month
                      </p> */}
                    </div>
                  </div>
    
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Amount</h3>
                    <div className="mt-2 flex items-baseline">
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">IDR {formatRupiah(totalAmount)}</p>
                      {/* <p className="ml-2 text-sm font-medium text-red-600">
                        -2% from last month
                      </p> */}
                    </div>
                  </div>
                </div>
    
                {/* Room Distribution Summary */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold">Room Distribution</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900/50">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room Type</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Booked</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {roomSummary.map((data,index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{data.room_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{data.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">IDR {formatRupiah(data.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">Total</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{totalRoomSummary}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">IDR {formatRupiah(grandTotalSummary)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
    
                {/* Booking List */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold">Recent Bookings</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900/50">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pax</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rooms</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {Object.values(dataReport.data_hotel.book_hotel).map((data,index)=>{
                          const night = data.booking_itinerary.day - 1
                          const subtotal = data.book_room.reduce((total, room) => total + (room.subtotal !== null ? room.subtotal : (room.room_hotel.rate * room.quantity )), 0)
                          
                          return (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{data.booking.user.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {format(addDays(data.booking.travel_date_start,night),'dd-MMM')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{data.booking.total_pax} Pax</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {Object.values(data.book_room).map((res,key) => {
                                return (
                                  <div>{res.room_hotel.room_name} x {res.quantity}</div>
                                )
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatRupiah(subtotal)}</td>
                          </tr>
                        )})}
                        {/* Add more rows as needed */}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : null
          );
  
        case 'activities':
          return (
            <div className="space-y-6">
              {/* Activity Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Activities</h3>
                  <div className="mt-2 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalProps}</p>
                    <p className="ml-2 text-sm font-medium text-green-600">+4 new</p>
                  </div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Bookings</h3>
                  <div className="mt-2 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">156</p>
                    <p className="ml-2 text-sm font-medium text-green-600">+12%</p>
                  </div>
                </div>
  
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</h3>
                  <div className="mt-2 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">Rp 15,600,000</p>
                    <p className="ml-2 text-sm font-medium text-green-600">+18%</p>
                  </div>
                </div>
  
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average Rating</h3>
                  <div className="mt-2 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">4.8/5.0</p>
                    <p className="ml-2 text-sm font-medium text-green-600">+0.2</p>
                  </div>
                </div>
              </div>
  
              {/* Popular Activities */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Popular Activities</h2>
                </div>
                <div className="overflow-x-auto">
                  {currentFilters.activity === '1' ? (
                    <h1>Bromo</h1> 
                  ) : ''}

                  {currentFilters.activity === '2' ? (
                  <h1>Ijen</h1> 
                  ) : ''}

                  {currentFilters.activity === '7' ? (
                    <h1>Tumpak Sewu</h1> 
                  ) : ''}
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-900/50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Mount Bromo Sunrise</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">48</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">5,760,000</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">4.9</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Ijen Crater Blue Fire</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">42</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">4,620,000</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">4.8</td>
                      </tr>
                      {/* Continuing Activities Content */}
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Madakaripura Waterfall</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">36</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">3,600,000</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">4.7</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Tumpak Sewu</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">30</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">3,000,000</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">4.8</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
  
              {/* Recent Activity Bookings */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Recent Activity Bookings</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-900/50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pax</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Add activity booking rows here */}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
  
        case 'transportation':
          return (
            <div className="space-y-6">
              {/* Transportation Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Vehicles</h3>
                  <div className="mt-2 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">15</p>
                    <p className="ml-2 text-sm font-medium text-green-600">+2 new</p>
                  </div>
                </div>
  
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Trips</h3>
                  <div className="mt-2 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">245</p>
                    <p className="ml-2 text-sm font-medium text-green-600">+15%</p>
                  </div>
                </div>
  
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Revenue</h3>
                  <div className="mt-2 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">86,450,000</p>
                    <p className="ml-2 text-sm font-medium text-green-600">+18%</p>
                  </div>
                </div>
  
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Avg Distance/Trip</h3>
                  <div className="mt-2 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">350km</p>
                    <p className="ml-2 text-sm font-medium text-red-600">-5%</p>
                  </div>
                </div>
              </div>
  
              {/* Vehicle Distribution */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Vehicle Distribution</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-900/50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rate/Day</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Trips</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Avanza</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">1-3 pax</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">480,000</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">98</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">32,560,000</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Innova</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">4-6 pax</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">550,000</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">86</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">36,800,000</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Hiace</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">7-12 pax</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">1,100,000</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">61</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">17,090,000</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
  
              {/* Recent Trips */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Recent Trips</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-900/50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Add trip rows here */}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
  
        case 't-shirts':
          return (
            <div className="space-y-6">
              {/* T-Shirt Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Stock</h3>
                  <div className="mt-2 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">850</p>
                    <p className="ml-2 text-sm font-medium text-green-600">+200 new</p>
                  </div>
                </div>
  
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Distributed</h3>
                  <div className="mt-2 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">505</p>
                    <p className="ml-2 text-sm font-medium text-green-600">+15%</p>
                  </div>
                </div>
  
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Most Popular Size</h3>
                  <div className="mt-2 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">L</p>
                    <p className="ml-2 text-sm font-medium text-gray-500">35% of total</p>
                  </div>
                </div>
  
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Reorder Point</h3>
                  <div className="mt-2 flex items-baseline">
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">100</p>
                    <p className="ml-2 text-sm font-medium text-gray-500">per size</p>
                  </div>
                </div>
              </div>
  
              {/* Size Distribution */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Size Distribution</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-900/50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Initial Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distributed</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">S</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">150</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">76</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">74</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Good Stock
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">M</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">200</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">126</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">74</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Good Stock
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">L</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">250</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">177</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">73</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Low Stock
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">XL</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">150</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">126</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">24</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Reorder
                          </span>
                        </td>
                      </tr>
                    </tbody>
                    <tfoot className="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Total</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">750</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">505</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">245</td>
                        <td className="px-6 py-4"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
  
              {/* Monthly Distribution */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Monthly Distribution</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-900/50">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Distributed</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Most Popular Size</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">September</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">155</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">L (35%)</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Regular distribution</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">October</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">168</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">L (38%)</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">High season</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">November</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">182</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">L (40%)</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">Peak season</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
  
              {/* Action Items */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">Action Items</h2>
                </div>
                <div className="space-y-4">
                  {/* Reorder Alert */}
                  <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Reorder Required</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>Size XL stock is below reorder point. Current stock: 24 pcs</p>
                        </div>
                      </div>
                    </div>
                  </div>
  
                  {/* Low Stock Warning */}
                  <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Low Stock Warning</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>Size L stock is approaching reorder point. Current stock: 73 pcs</p>
                        </div>
                      </div>
                    </div>
                  </div>
  
                  {/* Recommendation */}
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Stock Optimization Suggestion</h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>Consider adjusting the stock distribution based on size popularity: Increase L size proportion to 40% of total stock.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        default:
          return null;
      }
    };
  
    return getContent();
}

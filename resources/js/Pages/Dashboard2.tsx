import Main from '@/Layouts/Main';
import { Dialog } from '@headlessui/react';
import React,{useState,useRef,useEffect} from 'react';
import { format, parse } from 'date-fns';
import Chart from 'react-apexcharts';
import { 
  MoreHorizontal, 
  MoreVertical, 
  Trash2,
  ChevronDown,
  BadgeCheck,
  Compass,
  MapPin, 
  Clock, 
  Car, 
  LifeBuoy, 
  Backpack,
  X as XIcon,
  Activity, 
  AlertTriangle, 
  Calendar, 
  Users, 
  Truck, 
  Hotel, 
  CreditCard, 
  Plus,
  DollarSign  
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';


// Chart Options and Data
const paymentChartOptions = {
  chart: {
    type: 'area',
    height: 300,
    toolbar: { show: false },
    background: 'transparent',
    foreColor: '#888'
  },
  stroke: {
    curve: 'smooth',
    width: 2
  },
  colors: ['#3b82f6', '#ddd'],
  fill: {
    type: 'gradient',
    gradient: {
      opacityFrom: 0.2,
      opacityTo: 0.1
    }
  },
  grid: {
    borderColor: '#2a3447',
    strokeDashArray: 3,
    yaxis: { lines: { show: true } },
    xaxis: { lines: { show: false } }
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    show: true,
    min: 0,
    max: 100,
    tickAmount: 5
  },
  tooltip: {
    theme: 'dark',
    x: { show: false }
  }
};

const paymentChartSeries = [
  {
    name: 'Received',
    data: [10, 25, 35, 30, 60, 65, 70, 75, 70, 75, 65, 60]
  },
  {
    name: 'Due',
    data: [15, 20, 30, 35, 55, 70, 75, 80, 85, 80, 70, 65]
  }
];

const devicesChartOptions = {
  chart: {
    type: 'donut',
    background: 'transparent'
  },
  colors: ['#3b82f6', '#38bdf8', '#38bdf8'],
  plotOptions: {
    pie: {
      donut: {
        size: '85%'
      }
    }
  },
  legend: { show: false },
  dataLabels: { enabled: false },
  tooltip: { enabled: false }
};

const devicesChartSeries = [50, 30, 20];

const campaignChartOptions = {
  chart: {
    type: 'bar',
    height: 300,
    toolbar: { show: false },
    background: 'transparent',
    foreColor: '#888'
  },
  plotOptions: {
    bar: {
      borderRadius: 4,
      columnWidth: '40%',
    }
  },
  colors: ['#3b82f6', 'rgba(59, 130, 246, 0.3)'],
  grid: {
    borderColor: '#2a3447',
    strokeDashArray: 3,
    yaxis: { lines: { show: true } },
    xaxis: { lines: { show: false } }
  },
  dataLabels: { enabled: false },
  xaxis: {
    categories: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    show: true,
    min: 0,
    max: 400,
    tickAmount: 4
  },
  tooltip: {
    theme: 'dark',
    x: { show: false }
  }
};

const campaignChartSeries = [
  {
    name: 'Value 1',
    data: [350, 400, 300, 300, 200, 300, 300]
  },
  {
    name: 'Value 2',
    data: [300, 150, 250, 200, 250, 250, 200]
  }
];

// Sample data for other components
const leadsData = [
  {
    name: 'Charlie Donin',
    email: 'wdavis@aol.com',
    project: '25 Dec 2024 - 28 Dec 2024',
    duration: '3 Days',
    status: 'Lost Lead',
    avatar: '/api/placeholder/32/32'
  },
  {
    name: 'Makenna Carder',
    email: 'ltorres@aol.com',
    project: '25 Dec 2024 - 28 Dec 2024',
    duration: '3 Days',
    status: 'Active',
    avatar: '/api/placeholder/32/32'
  },
  {
    name: 'Talan Dokidis',
    email: 'rtaylor@aol.com',
    project: '25 Dec 2024 - 28 Dec 2024',
    duration: '3 Days',
    status: 'Active',
    avatar: '/api/placeholder/32/32'
  },
  {
    name: 'Cheyenne Levin',
    email: 'ebrown@aol.com',
    project: '25 Dec 2024 - 28 Dec 2024',
    duration: '3 Days',
    status: 'Active',
    avatar: '/api/placeholder/32/32'
  },
  {
    name: 'James Aminoff',
    email: 'slee@aol.com',
    project: '25 Dec 2024 - 28 Dec 2024',
    duration: '3 Days',
    status: 'Lost Lead',
    avatar: '/api/placeholder/32/32'
  }
];

const todoData = [
  {
    icon: 'U',
    title: 'Uideck Yearly Meetings',
    time: '10:20 AM - 3:00 PM',
    date: '14 February,2025',
    status: 'Completed',
    bgColor: 'bg-blue-600'
  },
  {
    icon: 'D',
    title: '2025 Dribbble Meet Up',
    time: '09:30 AM - 12:00 AM',
    date: '14 February,2025',
    status: 'Upcoming',
    bgColor: 'bg-pink-500'
  },
  {
    icon: 'L',
    title: '2025 Linkedin Meet Up',
    time: '10:30 AM - 11:00 PM',
    date: '14 February,2025',
    status: 'Cancelled',
    bgColor: 'bg-blue-500'
  }
];

// Custom gauge chart component for overview cards
function GaugeChart({ percentage, color }) {
  const radius = 20;
  const strokeWidth = 6;
  const normalizedPercentage = percentage > 100 ? 100 : percentage;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(normalizedPercentage / 100) * circumference} ${circumference}`;
  
  return (
    <svg width="50" height="50" className="transform rotate-[150deg]">
      <circle
        cx="25"
        cy="25"
        r={radius}
        fill="none"
        stroke="#435a76"
        strokeWidth={strokeWidth}
        className=""
      />
      <circle
        cx="25"
        cy="25"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={strokeDasharray}
        strokeLinecap="round"
        className="transition-all duration-1000"
      />
    </svg>
  );
}

// Overview Card Component
function OverviewCard({ title, value, change, percentage, color }) {
    const isPositive = change > 0;
    
    return (
      <div className="p-4 rounded-lg bg-white dark:bg-[#24303f] shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium text-gray-600 dark:text-gray-400 text-sm">{title}</p>
            <p className="text-gray-900 dark:text-white text-4xl font-semibold mt-1">{value}</p>
              <div className="flex items-center mt-2">
                {
                  !isNaN(change) ? (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      isPositive 
                        ? 'bg-emerald-400/10 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-red-400/10 text-red-600 dark:text-red-400'
                    }`}>
                      {isPositive ? '+' : ''}{change}%
                    </span>
                  ) : (
                    <span className={`flex space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      title == 'Complete' 
                        ? 'bg-emerald-400/10 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-blue-400/10 text-blue-600 dark:text-blue-400'
                    }`}>
                      {
                        title == 'Complete' ? (
                          <BadgeCheck className="w-4 h-4" />                          
                        ) : (
                          <Compass className="w-4 h-4" />                          
                        )
                      } <span>{title} Trip</span>
                    </span>
                  )
                }
                {
                  change ? (
                    <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">Since last month</span>
                  ) : ''
                }
              </div>
          </div>
          <GaugeChart percentage={percentage} color={color} />
        </div>
      </div>
    );
}
//dropdown components
function SortDropdown({ label, options, defaultValue }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(defaultValue);
    const dropdownRef = useRef(null);
  
    useEffect(() => {
      function handleClickOutside(event) {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      }
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
  
    return (
      <div className="flex items-center gap-2 relative" ref={dropdownRef}>
        <span className="text-gray-400 hidden sm:inline">{label}</span>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="flex items-center gap-1 text-gray-500 dark:text-gray-300 hover:text-gray-400 dark:hover:text-gray-400 transition-colors"
        >
          {selected}
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute right-0 top-full mt-1 py-1 w-48 bg-white dark:bg-[#24303f] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  setSelected(option);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  option === selected 
                    ? 'text-blue-500 dark:text-blue-400' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    );
}
// action dropdown
function ActionDropdown({ booking }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const dropdownRef = useRef(null);

  const actions = [
      { 
          label: 'Detail', 
          onClick: () => {
              setShowDetails(true);
              setIsOpen(false);
          }
      },
      { 
          label: 'Edit', 
          onClick: () => window.location.href = `/bookings/${booking.id}/edit`
      }
  ];

  return (
      <div className="relative" ref={dropdownRef}>
          <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
              <MoreVertical className="text-gray-400 w-5 h-5" />
          </button>
          
          {isOpen && (
              <div className="absolute right-0 top-full mt-1 py-1 w-40 bg-white dark:bg-[#24303f] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  {actions.map((action, index) => (
                      <button
                          key={index}
                          onClick={action.onClick}
                          className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                          {action.label}
                      </button>
                  ))}
              </div>
          )}

          <BookingDetails 
              isOpen={showDetails}
              onClose={() => setShowDetails(false)}
              booking={booking}
          />
      </div>
  );
}// Device Item Component
function DeviceItem({ label, percentage, color }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <span className="text-gray-700 dark:text-gray-300">{label}</span>
      <span className="ml-auto text-gray-700 dark:text-gray-300">{percentage}%</span>
    </div>
  );
}

// Todo Item Component
function TodoItem({ item }) {
  const statusColors = {
    Completed: 'text-emerald-600 dark:text-emerald-400',
    Upcoming: 'text-blue-600 dark:text-blue-400',
    Cancelled: 'text-red-600 dark:text-red-400'
  };  
  return (
    <div className="flex items-center gap-4 mb-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center text-white`}>
        {item.icon}
      </div>
      <div className="flex-1">
        <h4 className="text-gray-900 dark:text-white font-medium">{item.title}</h4>
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <span>{item.time}</span>
          <span>{item.date}</span>
        </div>
      </div>
      <div className={`text-sm ${statusColors[item.status]}`}>
        {item.status}
      </div>
    </div>
  );
}
const TabButton = ({ isActive, onClick, children }) => (
  <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
          isActive 
              ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
  >
      {children}
  </button>
);

const DetailField = ({ label, value, className = '' }) => (
  <div className={className}>
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</h3>
      <p className="mt-1 text-gray-900 dark:text-gray-100">{value || '-'}</p>
  </div>
);
function BookingDetails({ isOpen, onClose, booking }) {
  
  const [activeTab, setActiveTab] = useState('customer');

  const tabs = [
      { id: 'customer', label: 'Client Information' },
      { id: 'booking', label: 'Booking Information' },
      { id: 'finance', label: 'Finance' },
      { id: 'itinerary', label: 'Itinerary' },
      { id: 'accommodation', label: 'Accommodation' },
      { id: 'resource', label: 'Resource & Allocations' }
  ];
  booking ? 
    (
        <Dialog 
            open={isOpen} 
            onClose={onClose}
            className="relative z-50"
        >
            <div className="fixed inset-0">
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300" aria-hidden="true" />
            </div>
            
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl">
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b dark:border-gray-700">
                        <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                            Booking Details
                        </Dialog.Title>
                        <button 
                            onClick={onClose}
                            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>
  
                    {/* Tab Navigation */}
                    <div className="p-4 border-b dark:border-gray-700 overflow-x-auto">
                        <div className="flex gap-2 min-w-max">
                            {tabs.map(tab => (
                                <TabButton
                                    key={tab.id}
                                    isActive={activeTab === tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    {tab.label}
                                </TabButton>
                            ))}
                        </div>
                    </div>
  
                    {/* Tab Content */}
                    <div className="p-6 max-h-[calc(100vh-250px)] overflow-y-auto">
                        {/* Customer Info */}
                        {activeTab === 'customer' && (
                            <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <DetailField label="Name" value={booking.user.name} />
                                    {booking.agent_id != 1 && (
                                        <>
                                            <DetailField label="Nationality" value={booking.user.country?.long_name || '-'} />
                                            <DetailField label="Phone" value={booking.user.phone} />
                                            <DetailField label="Email" value={booking.user.email} />
                                        </>
                                    )}
                                    <DetailField 
                                        label="T-Shirt Sizes" 
                                        value={Object.entries(booking.booking_detail[0])
                                            .filter(([key, value]) => ['xss', 'xxs', 'xs', 's', 'l', 'xl', 'xxl', 'xxxl'].includes(key) && value)
                                            .map(([size, count]) => `${size.toUpperCase()} × ${count}`)
                                            .join(', ')
                                        } 
                                    />
                                </div>
                            </div>
                        )}
  
                        {/* Booking Info */}
                        {activeTab === 'booking' && (
                            <div className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <DetailField 
                                        label="Duration" 
                                        value={`${booking?.booking_detail?.[0]?.package?.duration?.day || booking?.package_duration || 0}D ${booking?.booking_detail?.[0]?.package?.duration?.night || (booking?.package_duration || 1) - 1}N`} 
                                    />
                                    <DetailField 
                                        label="Travel Dates" 
                                        value={`${format(booking?.travel_date_start, 'dd MMM yyyy')} - ${format(booking?.travel_date_end, 'dd MMM yyyy')}`} 
                                    />
                                    {/* Add other booking details */}
                                </div>
                            </div>
                        )}
  
                        {/* Other tabs content... */}
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    ) : ''
}
const BookingDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const options = [
    { label: 'JVTO', href: '/bookings/create/jvto' },
    { label: 'KLOOK', href: '/bookings/create/klook' },
    { label: 'TWT', href: '/bookings/create/twt' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-meta-3 hover:bg-opacity-90 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-150 flex items-center gap-2"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" 
            clipRule="evenodd" 
          />
        </svg>
        Add Booking
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-[#24303f] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          {options.map((option) => (
            <a
              key={option.label}
              href={option.href}
              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              {option.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Dashboard2(data) {
  const [metrics, setMetrics] = useState({
    activeBookings: 12,
    pendingBookings: 5,
    confirmedBookings: 4,
    completedBookings: 3,
    totalPax: 87,
    unassignedCrewCount: 3,
    pendingPayments: 4,
    pendingHotels: 2
  });

  const [alerts, setAlerts] = useState([
    { id: 1, type: 'warning', message: 'Hotel booking pending for Tour #123', timestamp: '2h ago' },
    { id: 2, type: 'error', message: 'Payment overdue for Tour #456', timestamp: '4h ago' },
    { id: 3, type: 'info', message: 'Crew assignment needed for tomorrow', timestamp: '1h ago' }
  ]);

  const [schedule, setSchedule] = useState([
    {
      id: 1,
      tourId: 'T123',
      clientName: 'Smith Group',
      pax: 6,
      pickup: '05:00',
      destination: 'Bromo Sunrise',
      crew: 'John Driver, Mary Guide',
      vehicle: 'Van 01',
      status: 'On Time'
    },
    {
      id: 2,
      tourId: 'T124',
      clientName: 'Johnson Family',
      pax: 4,
      pickup: '07:30',
      destination: 'Ijen Crater',
      crew: 'Mike Driver',
      vehicle: 'Jeep 03',
      status: 'Delayed'
    }
  ]);

  const [financialData, setFinancialData] = useState([
    { name: 'Mon', revenue: 4000, expenses: 2400, profit: 1600 },
    { name: 'Tue', revenue: 3000, expenses: 1398, profit: 1602 },
    { name: 'Wed', revenue: 2000, expenses: 1800, profit: 200 },
    { name: 'Thu', revenue: 2780, expenses: 1908, profit: 872 },
    { name: 'Fri', revenue: 1890, expenses: 1800, profit: 90 }
  ]);

  // Metric Card Component
  const MetricCard = ({ title, value, icon: Icon, subtitle }) => (
    <div className="bg-white rounded-lg shadow p-6 dark:bg-[#24303f]">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</h3>
        <Icon className="h-5 w-5 text-gray-400 dark:text-blue-400" />
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
        {subtitle && (
          <span className="text-xs text-gray-500 mt-1 dark:text-gray-400">{subtitle}</span>
        )}
      </div>
    </div>
  );

  // Alert Component
  const AlertItem = ({ type, message, timestamp }) => (
    <div className={`
      p-4 rounded-lg mb-3
      ${type === 'error' ? 'bg-red-50 border-l-4 border-red-400' :
        type === 'warning' ? 'bg-yellow-50 border-l-4 border-yellow-400' :
        'bg-blue-50 border-l-4 border-blue-400'}
    `}>
      <div className="flex justify-between items-center">
        <span className={`
          text-sm
          ${type === 'error' ? 'text-red-700' :
            type === 'warning' ? 'text-yellow-700' :
            'text-blue-700'}
        `}>
          {message}
        </span>
        <span className="text-xs text-gray-500">{timestamp}</span>
      </div>
    </div>
  );

  // Schedule Item Component
  const ScheduleItem = ({ tour }) => (
    <div className="bg-white rounded-lg shadow p-4 mb-4 dark:bg-[#1a222c]">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <span className="font-medium text-gray-900 dark:text-blue-400">{tour.tourId}</span>
          <span className="mx-2 text-gray-300">|</span>
          <span className="text-gray-600 dark:text-white">{tour.clientName}</span>
        </div>
        <span className={`
          px-3 py-1 rounded-full text-xs
          ${tour.status === 'On Time' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
        `}>
          {tour.status}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center">
          <Clock className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-600 dark:text-gray-400">{tour.pickup}</span>
        </div>
        <div className="flex items-center">
          <MapPin className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-600 dark:text-gray-400">{tour.destination}</span>
        </div>
        <div className="flex items-center">
          <Users className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-600 dark:text-gray-400">{tour.crew}</span>
        </div>
        <div className="flex items-center">
          <Truck className="h-4 w-4 text-gray-400 mr-2" />
          <span className="text-sm text-gray-600 dark:text-gray-400">{tour.vehicle}</span>
        </div>
      </div>
    </div>
  );

  // Quick Action Button Component
  const QuickActionButton = ({ icon: Icon, label, onClick }) => (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow
        hover:bg-gray-50 transition-colors duration-200  dark:bg-[#1a222c]"
    >
      <Icon className="h-6 w-6 text-gray-600 mb-2 dark:text-white" />
      <span className="text-sm text-gray-700 dark:text-gray-400">{label}</span>
    </button>
  );

  // Financial Chart Component
  const FinancialChart = ({ data }) => (
    <div className="bg-white rounded-lg shadow p-6 dark:bg-[#24303f]">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Financial Overview</h3>
        <div className="flex items-center space-x-4">
          <span className="flex items-center text-xs text-gray-500">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            Revenue
          </span>
          <span className="flex items-center text-xs text-gray-500">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            Profit
          </span>
        </div>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ fill: '#3B82F6' }}
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke="#10B981" 
              strokeWidth={2}
              dot={{ fill: '#10B981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const res = data.data
  return (
    <Main>
        <div className="min-h-screen text-gray-900 dark:text-white p-6">
        <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold">
                Booking This Month
            </h2>
            {/* <SortDropdown 
                label="SHORT BY:" 
                options={['Current Month', 'Last Month']}
                defaultValue="Current Month"
            /> */}
        </div>
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          title="Active Bookings"
          value={res.total_booking}
          icon={Calendar}
          subtitle={`${res.total_booking_complete} complete, ${res.total_booking_on_going} on going`}
        />
        <MetricCard 
          title="Total Guests"
          value={data.data.user}
          icon={Users}
          subtitle="Across all active tours"
        />
        <MetricCard 
          title="Pending Actions"
          value={data.data.no_crew}
          icon={AlertTriangle}
          subtitle="Crew assignments needed"
        />
        <MetricCard 
          title="Payments Due"
          value={metrics.pendingPayments}
          icon={DollarSign}
          subtitle="Outstanding payments"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Alerts & Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* Alerts Section */}
          <div className="bg-white rounded-lg shadow p-6 dark:bg-[#24303f]">
            <h2 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">Recent Alerts</h2>
            <div className="space-y-3">
              {alerts.map(alert => (
                <AlertItem key={alert.id} {...alert} />
              ))}
            </div>
          </div>

          {/* Today's Schedule Section */}
          <div className="bg-white rounded-lg shadow p-6 dark:bg-[#24303f]">
            <h2 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">Today's Schedule</h2>
            <div className="space-y-4">
              {schedule.map(tour => (
                <ScheduleItem key={tour.id} tour={tour} />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions & Financial Summary */}
        <div className="space-y-6">
          {/* Quick Actions Grid */}
          <div className="bg-white rounded-lg shadow p-6 dark:bg-[#24303f]">
            <h2 className="text-lg font-medium text-gray-900 mb-4 dark:text-white">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <QuickActionButton 
                icon={Plus} 
                label="New Booking"
                onClick={() => console.log('New Booking')}
              />
              <QuickActionButton 
                icon={Users} 
                label="Assign Crew"
                onClick={() => console.log('Assign Crew')}
              />
              <QuickActionButton 
                icon={Hotel} 
                label="Update Hotels"
                onClick={() => console.log('Update Hotels')}
              />
              <QuickActionButton 
                icon={Truck} 
                label="Vehicle Status"
                onClick={() => console.log('Vehicle Status')}
              />
            </div>
          </div>

          {/* Financial Chart */}
          <FinancialChart data={financialData} />
        </div>
      </div>

        {/* Overview Cards */}
        {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <OverviewCard
            title="Total Bookings"
            value={res.total_booking}
            change={res.change_total_boking}
            percentage={100}
            color="#3b82f6"
            />
            <OverviewCard
            title="Complete"
            value={res.total_booking_complete}
            percentage={res.total_booking_complete/res.total_booking*100}
            color="rgb(52 211 153)"
            />
            <OverviewCard
            title="On Going"
            value={res.total_booking_on_going}
            percentage={res.total_booking_on_going/res.total_booking*100}
            color="#3b82f6"
            />
        </div> */}

        {/* Charts Section */}
        {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-[#24303f] p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg text-gray-900 dark:text-white font-bold">Payments Overview</h3>
                <SortDropdown 
                    label="SHORT BY:" 
                    options={['Monthly', 'Weekly', 'Daily']}
                    defaultValue="Monthly"
                />
            </div>
            <Chart
                options={paymentChartOptions}
                series={paymentChartSeries}
                type="area"
                height={300}
            />
            <div className="mt-4 flex justify-between text-gray-300">
                <div>
                <p className="text-sm text-gray-400 dark:text-gray-400">Received Amount</p>
                <p className="text-lg text-gray-500 dark:text-gray-100 font-medium">$45,070.00</p>
                </div>
                <div>
                <p className="text-sm text-gray-400 dark:text-gray-400">Due Amount</p>
                <p className="text-lg text-gray-500 dark:text-gray-100 font-medium">$32,400.00</p>
                </div>
            </div>
            </div>

            <div className="bg-white dark:bg-[#24303f] p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Used Devices</h3>
                <SortDropdown 
                    label="SHORT BY:" 
                    options={['Monthly', 'Weekly', 'Daily']}
                    defaultValue="Monthly"
                />
            </div>
            <div className="flex justify-center mb-8 h-64">
                <Chart
                options={devicesChartOptions}
                series={devicesChartSeries}
                type="donut"
                height={256}
                />
            </div>
            <div className="space-y-4">
                <DeviceItem label="Mobile" percentage={50} color="bg-[#3b82f6]" />
                <DeviceItem label="Tablet" percentage={30} color="bg-[#38bdf8]" />
                <DeviceItem label="Desktop" percentage={20} color="bg-[#38bdf8]" />
            </div>
            </div>
        </div> */}

        {/* Leads Report */}
        <div className="mt-5 bg-white dark:bg-[#24303f] p-6 rounded-lg shadow-sm mb-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Upcoming Trip</h3>
                <BookingDropdown/>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                  <thead>
                      <tr className="text-left text-gray-400 text-sm">
                          <th className="pb-4">Booking ID</th>
                          <th className="pb-4">Guest & Package</th>
                          <th className="pb-4">Date</th>
                          <th className="pb-4">Pickup</th>
                          <th className="pb-4">Activity</th>
                          <th className="pb-4">T-Shirt Size</th>
                          <th className="pb-4">Drop</th>
                          <th className="pb-4">Resource Allocation</th>
                          {/* <th className="pb-4">Actions</th> */}
                      </tr>
                  </thead>
                  <tbody>
                      {res.booking.map((booking, index) => (
                          <tr key={index} className="border-t dark:border-[#2a3447]">
                              <td className="py-4">
                                  <div className="flex items-center">
                                      <span className={`inline-flex px-2 py-1 text-xs font-bold rounded ${
                                          booking.agent_id == 2 && booking.booking_category_id == 3 
                                              ? 'bg-[#13C296] text-white' 
                                              : booking.agent_id == 2 
                                                  ? 'bg-primary text-white hover:bg-opacity-90'
                                                  : 'bg-[#F9C107] text-[#212B36]'
                                      }`}>
                                          {booking.agent_id == 2 && booking.booking_category_id == 3 ? 'KLOOK' : booking.agent.name}-{booking.id}
                                      </span>
                                  </div>
                              </td>
                              <td className="py-4">
                                  <div className="font-medium">{booking.user.name}</div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {booking.booking_detail[0].package 
                                          ? `${booking.booking_detail[0].package.duration.day}D ${booking.booking_detail[0].package.duration.night}N` 
                                          : `${booking.package_duration}D ${booking.package_duration - 1}N`} / {booking.total_pax} PAX
                                  </div>
                              </td>
                              <td className="py-4 whitespace-nowrap">
                                  <div className="font-medium">
                                      {format(booking.travel_date_start, 'dd-MMM')} - {format(booking.travel_date_end, 'dd-MMM')}
                                  </div>
                                  <div className="text-gray-500 dark:text-gray-400">
                                      {format(booking.travel_date_start, 'E')} - {format(booking.travel_date_end, 'E')}
                                  </div>
                              </td>
                              <td className="py-4">
                                  <div className="flex items-center space-x-2">
                                      <MapPin className="h-4 w-4 text-gray-400"/>
                                      <span>{booking.pickup === 'Terminal 2 Juanda International Airport' ? 'T2' : booking.pickup}</span>
                                  </div>
                                  {booking.pickup_time && (
                                      <div className="flex items-center space-x-2 mt-1">
                                          <Clock className="h-4 w-4 text-gray-400"/>
                                          <span>{format(parse(booking.pickup_time, 'HH:mm:ss', new Date()), 'HH:mm')}</span>
                                      </div>
                                  )}
                              </td>
                              <td className="py-4">
                                  {booking.booking_itinerary.map((data, index) => (
                                      data.activity_start.destination && (
                                          <div key={index} className="text-sm">
                                              #{data.day} {data.activity_start.destination.name}
                                          </div>
                                      )
                                  ))}
                              </td>
                              <td className="py-4">
                                  {Object.entries(booking.booking_detail[0])
                                      .filter(([key, value]) => ['xss', 'xxs', 'xs', 's', 'l', 'xl', 'xxl', 'xxxl'].includes(key) && value)
                                      .map(([size, count]) => (
                                          <div key={size} className="text-sm">
                                              {size.toUpperCase()} x {count}
                                          </div>
                                      ))
                                  }
                              </td>
                              <td className="py-4">
                                  <div className="flex items-center space-x-2">
                                      <MapPin className="h-4 w-4 text-gray-400"/>
                                      <span>{booking.drop === 'Terminal 2 Juanda International Airport' ? 'T2' : booking.drop}</span>
                                  </div>
                                  {booking.drop_time && (
                                      <div className="flex items-center space-x-2 mt-1">
                                          <Clock className="h-4 w-4 text-gray-400"/>
                                          <span>{format(parse(booking.drop_time, 'HH:mm:ss', new Date()), 'HH:mm')}</span>
                                      </div>
                                  )}
                              </td>
                              <td className="py-4">
                                  {booking.book_car?.map((car, idx) => (
                                      <div key={idx} className="flex items-center space-x-2">
                                          <Car className="h-4 w-4 text-gray-400"/>
                                          <span>{car.car.name}</span>
                                      </div>
                                  ))}
                                  {booking.guide_driver
                                      .filter(gd => gd.type === 'guide')
                                      .map((guide, idx) => (
                                          <div key={idx} className="flex items-center space-x-2 mt-1">
                                              <Backpack className="h-4 w-4 text-gray-400"/>
                                              <span>{guide.person.name}</span>
                                          </div>
                                      ))
                                  }
                                  {booking.guide_driver
                                      .filter(gd => gd.type === 'driver')
                                      .map((driver, idx) => (
                                          <div key={idx} className="flex items-center space-x-2 mt-1">
                                              <LifeBuoy className="h-4 w-4 text-gray-400"/>
                                              <span>{driver.person.name}</span>
                                          </div>
                                      ))
                                  }
                              </td>
                              {/* <td className="py-4">
                                  <ActionDropdown booking={booking}/>
                              </td> */}
                          </tr>
                      ))}
                  </tbody>
              </table>
            </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Campaigns */}
            <div className="bg-white dark:bg-[#24303f] p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Campaigns</h3>
                <SortDropdown 
                    label="SHORT BY:" 
                    options={['Monthly', 'Weekly', 'Daily']}
                    defaultValue="Monthly"
                />
            </div>
            <Chart
                options={campaignChartOptions}
                series={campaignChartSeries}
                type="bar"
                height={300}
            />
            </div>

            {/* To Do List */}
            <div className="bg-white dark:bg-[#24303f] p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">To Do List</h3>
                <ActionDropdown />
            </div>
            <div className="space-y-4">
                {todoData.map((item, index) => (
                <TodoItem key={index} item={item} />
                ))}
            </div>
            </div>
        </div>
        </div>
    </Main>
  );
}
import Main from '@/Layouts/Main';
import React,{useState,useRef,useEffect} from 'react';
import Chart from 'react-apexcharts';
import { 
  MoreHorizontal, 
  Trash2,
  ChevronDown
} from 'lucide-react';

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
  colors: ['#3b82f6', '#fff'],
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
        stroke="#2e3a47"
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
      <div className="p-4 rounded-lg bg-[#24303f] dark:bg-[#24303f] relative">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-400 text-sm">{title}</p>
            <p className="text-white dark:text-white text-4xl font-semibold mt-1">{value}</p>
            <div className="flex items-center mt-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                isPositive 
                  ? 'bg-emerald-400/10 text-emerald-400' 
                  : 'bg-red-400/10 text-red-400'
              }`}>
                {isPositive ? '+' : ''}{change}%
              </span>
              <span className="text-sm text-gray-400 ml-2">Since last week</span>
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
          className="flex items-center gap-1 text-gray-300 hover:text-gray-100 transition-colors"
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
function ActionDropdown() {
    const [isOpen, setIsOpen] = useState(false);
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
  
    const actions = [
      { label: 'Edit', onClick: () => console.log('Edit clicked') },
      { label: 'Delete', onClick: () => console.log('Delete clicked') },
      { label: 'Archive', onClick: () => console.log('Archive clicked') }
    ];
  
    return (
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <MoreHorizontal className="text-gray-400 w-5 h-5" />
        </button>
        
        {isOpen && (
          <div className="absolute right-0 top-full mt-1 py-1 w-40 bg-white dark:bg-[#24303f] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
}
// Device Item Component
function DeviceItem({ label, percentage, color }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <span className="text-gray-300">{label}</span>
      <span className="ml-auto text-gray-300">{percentage}%</span>
    </div>
  );
}

// Todo Item Component
function TodoItem({ item }) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center text-white`}>
        {item.icon}
      </div>
      <div className="flex-1">
        <h4 className="text-white font-medium">{item.title}</h4>
        <div className="text-sm text-gray-400 flex items-center gap-2">
          <span>{item.time}</span>
          <span>{item.date}</span>
        </div>
      </div>
      <div className={`text-sm ${
        item.status === 'Completed' ? 'text-emerald-400' :
        item.status === 'Upcoming' ? 'text-blue-400' :
        'text-red-400'
      }`}>
        {item.status}
      </div>
    </div>
  );
}

export default function Dashboard2() {
  return (
    <Main>
        <div className="min-h-screen text-white">
        <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                This Week's Overview
            </h2>
            <SortDropdown 
                label="SHORT BY:" 
                options={['Current Week', 'Last Week', 'Last Month']}
                defaultValue="Current Week"
            />
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <OverviewCard
            title="Clients Added"
            value="197"
            change={2.5}
            percentage={75}
            color="#3b82f6"
            />
            <OverviewCard
            title="Contracts Signed"
            value="745"
            change={-1.5}
            percentage={65}
            color="#3b82f6"
            />
            <OverviewCard
            title="Invoice Sent"
            value="512"
            change={0.5}
            percentage={70}
            color="#3b82f6"
            />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Payments Chart */}
            <div className="bg-[#24303f] p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg text-gray-900 dark:text-white">Payments Overview</h3>
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
                <p className="text-sm text-gray-400">Received Amount</p>
                <p className="text-lg">$45,070.00</p>
                </div>
                <div>
                <p className="text-sm text-gray-400">Due Amount</p>
                <p className="text-lg">$32,400.00</p>
                </div>
            </div>
            </div>

            {/* Device Usage */}
            <div className="bg-[#24303f] p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg">Used Devices</h3>
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
        </div>

        {/* Leads Report */}
        <div className="bg-[#24303f] p-6 rounded-lg mb-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg">Leads Report</h3>
                <ActionDropdown />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                    <thead>
                        <tr className="text-left text-gray-400 text-sm">
                        <th className="pb-4">Name</th>
                        <th className="pb-4">Email</th>
                        <th className="pb-4">Project</th>
                        <th className="pb-4">Duration</th>
                        <th className="pb-4">Status</th>
                        <th className="pb-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leadsData.map((lead, index) => (
                        <tr key={index} className="border-t border-[#2a3447]">
                            <td className="py-4">
                            <div className="flex items-center gap-3">
                                <img src={lead.avatar} alt="" className="w-8 h-8 rounded-full" />
                                <span>{lead.name}</span>
                            </div>
                            </td>
                            <td className="text-gray-400">{lead.email}</td>
                            <td>{lead.project}</td>
                            <td>{lead.duration}</td>
                            <td>
                            <span className={`${
                                lead.status === 'Active' ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                                {lead.status}
                            </span>
                            </td>
                            <td>
                            <button className="text-gray-400 hover:text-gray-300">
                                <Trash2 size={18} />
                            </button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Campaigns */}
            <div className="bg-[#24303f] p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg">Campaigns</h3>
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
            <div className="bg-[#24303f] p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg">To Do List</h3>
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
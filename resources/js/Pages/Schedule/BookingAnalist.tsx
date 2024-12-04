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
export default function BookingAnalist({ data, total }) {
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
                                        currentFilters={{ month, year, channel, activeTab }}
                                    />
                                    <FilterDropdown
                                        label="Year"
                                        value={year}
                                        options={years}
                                        onChange={setYear}
                                        currentFilters={{ month, year, channel, activeTab }}
                                    />
                                    <FilterDropdown
                                        label="Channel"
                                        value={channel}
                                        options={channels}
                                        onChange={setChannel}
                                        currentFilters={{ month, year, channel, activeTab }}
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
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-sm ${stat.trend === 'up'
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
                                            month: month,
                                            year: year,
                                            channel: channel,
                                            activeTab: tab.toLowerCase().replace(' ', '-'),
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
                                currentFilters={{ month, year, channel, activeTab, hotel }}
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
                                currentFilters={{ month, year, channel, activeTab, activity }}
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
                            currentFilters={{ month, year, channel, activeTab, activity }}
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
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-sm ${stat.trend === 'up'
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

const TShirtReport = ({ data_tshirt }) => {
    // Guard clause for empty/undefined data
    if (!data_tshirt || !Array.isArray(data_tshirt) || data_tshirt.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">No t-shirt data available.</p>
            </div>
        );
    }
    // Calculate totals for each size
    const totals = data_tshirt.reduce((acc, item) => ({
        xss: (acc.xss || 0) + item.xss,
        xxs: (acc.xxs || 0) + item.xxs,
        xs: (acc.xs || 0) + item.xs,
        s: (acc.s || 0) + item.s,
        m: (acc.m || 0) + item.m,
        l: (acc.l || 0) + item.l,
        xl: (acc.xl || 0) + item.xl,
        xxl: (acc.xxl || 0) + item.xxl,
        xxxl: (acc.xxxl || 0) + item.xxxl,
    }), {});

    // Calculate total t-shirts per booking
    const getTotalTShirts = (item) => {
        return item.xss + item.xxs + item.xs + item.s + item.m + item.l + item.xl + item.xxl + item.xxxl;
    };

    // Calculate grand total
    const grandTotal = Object.values(totals).reduce((sum, val) => sum + val, 0);

    // Find most popular size safely
    const getMostPopularSize = () => {
        if (Object.keys(totals).length === 0) return 'N/A';
        const mostPopular = Object.entries(totals)
            .reduce((a, b) => (a[1] > b[1] ? a : b), ['none', 0]);
        return mostPopular[1] > 0 ? mostPopular[0].toUpperCase() : 'N/A';
    };

    return (
        <div className="space-y-6">
            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Orders</h3>
                    <div className="mt-2">
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{data_tshirt.length}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total T-Shirts</h3>
                    <div className="mt-2">
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">{grandTotal}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Average per Order</h3>
                    <div className="mt-2">
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {(grandTotal / data_tshirt.length).toFixed(1)}
                        </p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Most Popular Size</h3>
                    <div className="mt-2">
                        <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                            {getMostPopularSize()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold">T-Shirt Distribution Details</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50">
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trip Date</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">XSS</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">XXS</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">XS</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">S</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">M</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">L</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">XL</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">XXL</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">XXXL</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {data_tshirt.map((item, index) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{item.customer}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{item.agent_name}</td>
                                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                        {format(new Date(item.travel_date_start), 'dd-MMM-yyyy')}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-center text-gray-500 dark:text-gray-400">{item.xss != 0 ? item.xss : '-'}</td>
                                    <td className="px-4 py-3 text-sm text-center text-gray-500 dark:text-gray-400">{item.xxs != 0 ? item.xxs : '-'}</td>
                                    <td className="px-4 py-3 text-sm text-center text-gray-500 dark:text-gray-400">{item.xs != 0 ? item.xs : '-'}</td>
                                    <td className="px-4 py-3 text-sm text-center text-gray-500 dark:text-gray-400">{item.s != 0 ? item.s : '-'}</td>
                                    <td className="px-4 py-3 text-sm text-center text-gray-500 dark:text-gray-400">{item.m != 0 ? item.m : '-'}</td>
                                    <td className="px-4 py-3 text-sm text-center text-gray-500 dark:text-gray-400">{item.l != 0 ? item.l : '-'}</td>
                                    <td className="px-4 py-3 text-sm text-center text-gray-500 dark:text-gray-400">{item.xl != 0 ? item.xl : '-'}</td>
                                    <td className="px-4 py-3 text-sm text-center text-gray-500 dark:text-gray-400">{item.xxl != 0 ? item.xxl : '-'}</td>
                                    <td className="px-4 py-3 text-sm text-center text-gray-500 dark:text-gray-400">{item.xxxl != 0 ? item.xxxl : '-'}</td>
                                    <td className="px-4 py-3 text-sm text-center font-medium text-gray-900 dark:text-white">
                                        {getTotalTShirts(item)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <td colSpan="4" className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">Total</td>
                                <td className="px-4 py-3 text-sm text-center font-medium text-gray-900 dark:text-white">{totals.xss}</td>
                                <td className="px-4 py-3 text-sm text-center font-medium text-gray-900 dark:text-white">{totals.xxs}</td>
                                <td className="px-4 py-3 text-sm text-center font-medium text-gray-900 dark:text-white">{totals.xs}</td>
                                <td className="px-4 py-3 text-sm text-center font-medium text-gray-900 dark:text-white">{totals.s}</td>
                                <td className="px-4 py-3 text-sm text-center font-medium text-gray-900 dark:text-white">{totals.m}</td>
                                <td className="px-4 py-3 text-sm text-center font-medium text-gray-900 dark:text-white">{totals.l}</td>
                                <td className="px-4 py-3 text-sm text-center font-medium text-gray-900 dark:text-white">{totals.xl}</td>
                                <td className="px-4 py-3 text-sm text-center font-medium text-gray-900 dark:text-white">{totals.xxl}</td>
                                <td className="px-4 py-3 text-sm text-center font-medium text-gray-900 dark:text-white">{totals.xxxl}</td>
                                <td className="px-4 py-3 text-sm text-center font-medium text-gray-900 dark:text-white">{grandTotal}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 mt-6">
                <div className="mb-4">
                    <h2 className="text-lg font-semibold">Channel Summary</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total T-Shirt</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {/* Calculate and display summary by channel */}
                            {Object.entries(data_tshirt.reduce((acc, item) => {
                                const channel = item.agent_name;
                                const tShirtCount = item.xss + item.xxs + item.xs + item.s + item.m + item.l + item.xl + item.xxl + item.xxxl;

                                if (!acc[channel]) {
                                    acc[channel] = {
                                        totalShirts: 0,
                                        totalAmount: 0
                                    };
                                }
                                acc[channel].totalShirts += tShirtCount;
                                // Assuming each t-shirt costs 50000
                                acc[channel].totalAmount += tShirtCount * 60000;

                                return acc;
                            }, {})).map(([channel, data]) => (
                                <tr key={channel}>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{channel}</td>
                                    <td className="px-6 py-4 text-sm text-center text-gray-500 dark:text-gray-400">
                                        {data.totalShirts}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right text-gray-500 dark:text-gray-400">
                                        IDR {data.totalAmount.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 dark:bg-gray-900/50">
                            <tr>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Total</td>
                                <td className="px-6 py-4 text-sm text-center font-medium text-gray-900 dark:text-white">
                                    {grandTotal}
                                </td>
                                <td className="px-6 py-4 text-sm text-right font-medium text-gray-900 dark:text-white">
                                    IDR {(grandTotal * 60000).toLocaleString()}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

        </div>
    );
};

function DetailedReport({ totalProps, dataReport, type, currentFilters }) {
    const getContent = () => {
        switch (type) {
            case 'accommodations':
                const totalRoom = Object.values(dataReport.data_hotel.book_hotel).flatMap((book) => book.book_room).reduce((total, room) => total + room.quantity, 0)

                const totalAmount = Object.values(dataReport.data_hotel.book_hotel).flatMap((book) => book.book_room).reduce((total, room) => total + (room.subtotal !== null ? room.subtotal : (room.room_hotel.rate * room.quantity)), 0)

                let roomSummary = []
                let grandTotalSummary = 0
                let totalRoomSummary = 0

                Object.values(dataReport.data_hotel.book_hotel)
                    .map((data, index) => {
                        data.book_room.map((res, key) => {
                            const cek = roomSummary.find((d) => d.room_id == res.room_hotel.id)
                            const subtotal = (res.subtotal !== null ? res.subtotal : (res.room_hotel.rate * res.quantity))

                            if (typeof cek === 'undefined') {
                                roomSummary.push({
                                    room_id: res.room_hotel.id,
                                    room_name: res.room_hotel.room_name,
                                    quantity: res.quantity,
                                    amount: subtotal,
                                });
                            }
                            else {
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
                                            {roomSummary.map((data, index) => (
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
                                            {Object.values(dataReport.data_hotel.book_hotel).map((data, index) => {
                                                const night = data.booking_itinerary.day - 1
                                                const subtotal = data.book_room.reduce((total, room) => total + (room.subtotal !== null ? room.subtotal : (room.room_hotel.rate * room.quantity)), 0)

                                                return (
                                                    <tr key={index}>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{data.booking.user.name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {format(addDays(data.booking.travel_date_start, night), 'dd-MMM')}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{data.booking.total_pax} Pax</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                            {Object.values(data.book_room).map((res, key) => {
                                                                return (
                                                                    <div>{res.room_hotel.room_name} x {res.quantity}</div>
                                                                )
                                                            })}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatRupiah(subtotal)}</td>
                                                    </tr>
                                                )
                                            })}
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
                return <TShirtReport data_tshirt={dataReport.data_tshirt} />;

            default:
                return null;
        }
    };

    return getContent();
}

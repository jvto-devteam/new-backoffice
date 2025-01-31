import Main from '@/Layouts/Main';
import React, { useState } from 'react';
import {format, parse, addDays} from 'date-fns';
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  Plane,
  CreditCard,
  Info,Ticket,Hotel,TrainFront,MapPin,Clock,Car,AlertCircle,LifeBuoy,Backpack
} from 'lucide-react';

// A custom date range picker component
function DateRangePicker({ startDate, endDate, onChange }) {
  return (
    <div className="flex space-x-2 items-center">
      <input
        type="date"
        className="border p-1 rounded"
        value={startDate}
        onChange={(e) => onChange(e.target.value, endDate)}
      />
      <span>-</span>
      <input
        type="date"
        className="border p-1 rounded"
        value={endDate}
        onChange={(e) => onChange(startDate, e.target.value)}
      />
    </div>
  );
}

// Helper function to format currency
function formatCurrency(amountString) {
    amountString = amountString.toString()
  if (!amountString.startsWith('IDR')) {
    return amountString;
  }
  const numericValue = parseInt(amountString.replace('IDR', '').replace(/\D+/g, '')) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(numericValue);
}

// Example initial data
const initialBookings = [
  {
    id: 'TWT-917',
    orderChannel: 'TWT',
    guest: 'Alicia Hong',
    package: '5D4N / 6 PAX (TWT)',
    date: {
      start: '2025-02-05',
      end: '2025-02-09',
      days: 'Wed - Sun',
    },
    pickup: {
      flight: 'KUL-SUB (T2)',
      flightNo: 'TR264',
      location: 'T2 Harris Hotel',
      time: '12:40',
    },
    dropoff: {
      terminal: 'T2',
      time: '04:30',
      station: 'Gubeng Station (Sancaka 84)',
      stationTime: '10:00',
    },
    itinerary: ['Surabaya-Malang', 'Bromo Sunrise', 'Mount Bromo', 'Mount Ijen'],
    accommodation: [
      { hotel: 'THE 101 Malang', room: 'Deluxe Double x1', day: 1 },
      { hotel: 'Joglo Kecombrang', room: 'Twin x2', day: 2 },
      { hotel: 'Riverside', room: 'Emerald Twin x1', day: 3 },
    ],
    tshirtSize: 'L x 2',
    vehicle: {
      type: 'Hiace',
      assigned: true,
    },
    crew: {
      driver: 'John',
      escortGuide: 'Pending',
      ijenGuide: 'Assigned',
    },
    financial: {
      invoice: 'IDR 23,896,000',
      expenses: 'IDR 0',
      profit: 'IDR 23,896,000',
      deposit: null,
      paymentStatus: 'Paid',
      paymentHistory: [
        {
          date: '2025-01-15',
          amount: 'IDR 10,000,000',
          method: 'Credit Card',
          status: 'Paid',
        },
        {
          date: '2025-01-25',
          amount: 'IDR 13,896,000',
          method: 'Bank Transfer',
          status: 'Paid',
        },
      ],
    },
    notes: 'Birthday cake request',
  },
  {
    id: 'JVTO-120',
    orderChannel: 'JVTO',
    guest: 'Michael Smith',
    package: '3D2N / 4 PAX (JVTO)',
    date: {
      start: '2025-03-10',
      end: '2025-03-12',
      days: 'Mon - Wed',
    },
    pickup: {
      flight: 'SUB - Jak (T1)',
      flightNo: 'GA144',
      location: 'Hotel Majapahit',
      time: '08:00',
    },
    dropoff: {
      terminal: 'T1',
      time: '15:00',
      station: '',
      stationTime: '',
    },
    itinerary: ['Mount Bromo', 'Madakaripura', 'Back to Surabaya'],
    accommodation: [
      { hotel: 'Cafe Lava', room: 'Standard Twin x2', day: 1 },
      { hotel: 'Hotel Majapahit', room: 'Superior Double x1', day: 2 },
    ],
    tshirtSize: 'M x 2',
    vehicle: {
      type: 'Avanza',
      assigned: false,
    },
    crew: {
      driver: 'Pending',
      escortGuide: 'Assigned',
      ijenGuide: 'N/A',
    },
    financial: {
      invoice: 'IDR 12,500,000',
      expenses: 'IDR 2,300,000',
      profit: 'IDR 10,200,000',
      deposit: {
        amount: 'IDR 5,632,000',
        method: 'Bank Transfer',
      },
      paymentStatus: 'Pending',
      paymentHistory: [
        {
          date: '2025-02-01',
          amount: 'IDR 5,632,000',
          method: 'Bank Transfer',
          status: 'Paid',
        },
        {
          date: '2025-02-20',
          amount: 'IDR 6,868,000',
          method: 'Cash',
          status: 'Pending',
        },
      ],
    },
    notes: 'Need child seat',
  },
];

export default function Index({data}) {
  // Local state
  const [bookings] = useState(initialBookings);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('');
  const [pickupFilter, setPickupFilter] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [startDate, setStartDate] = useState('2025-02-01');
  const [endDate, setEndDate] = useState('2025-03-31');

  // State to track which booking is expanded
  const [expandedBookingId, setExpandedBookingId] = useState(null);
  
  const Alert = ({message}) => (
    <div className="flex">
        <div
            className="flex items-center space-x-1 text-[#DC3545] px-1 py-0.5 rounded text-xs mb-1">
            <AlertCircle className="h-3 w-3"/>
            <span>{message}</span>
        </div>
    </div>
);
  // Update date range
  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  // Filter logic
  const filteredBookings = bookings.filter((b) => {
    // Date filter
    const bookingStart = new Date(b.date.start);
    const bookingEnd = new Date(b.date.end);
    const filterStart = new Date(startDate);
    const filterEnd = new Date(endDate);
    const isWithinRange = bookingStart >= filterStart && bookingEnd <= filterEnd;

    // Search term (ID or Guest)
    const matchesSearch =
      b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.guest.toLowerCase().includes(searchTerm.toLowerCase());

    // Order channel
    const matchesChannel = selectedChannel ? b.orderChannel === selectedChannel : true;

    // Pickup/Drop-off location
    let hasPickup = true;
    if (pickupFilter) {
      const locations = [
        b.pickup.location.toLowerCase(),
        b.dropoff.terminal.toLowerCase(),
        b.dropoff.station ? b.dropoff.station.toLowerCase() : '',
      ];
      hasPickup = locations.some((loc) => loc.includes(pickupFilter.toLowerCase()));
    }

    // Payment Status
    const matchesPayment = paymentStatus ? b.financial.paymentStatus === paymentStatus : true;

    return isWithinRange && matchesSearch && matchesChannel && hasPickup && matchesPayment;
  });

  return (
    <Main>
        <div className="w-full mx-auto">
        {/* Gradient header area (like the MS Rewards style) */}
        <div className="bg-gradient-to-r from-blue-200 via-blue-50 to-blue-200 p-6 flex items-center justify-between">
            <div>
            <h1 className="text-2xl font-bold mb-1">Hi</h1>
            <div className="text-sm text-gray-700">Level 1</div>
            </div>
            <div className="text-right">
            <div className="text-sm text-gray-600">Available points: 199</div>
            <div className="text-xs text-gray-600">Today's points: 0</div>
            </div>
        </div>

        {/* Hero or Banner Section */}
        <div className="bg-white p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
                <h2 className="text-2xl font-bold">Plan a trip</h2>
                <p className="text-gray-700">Explore the vibrant city of Venice</p>
                <button className="mt-2 px-4 py-2 bg-black text-white rounded hover:opacity-90">Take a look</button>
            </div>
            <div className="mt-4 md:mt-0">
                <img
                src="https://via.placeholder.com/400x200.png?text=Venice+Image"
                alt="Venice"
                className="rounded-lg"
                />
            </div>
            </div>
        </div>

        {/* Filter Bar (like the daily set cards) */}
        <div className="bg-white p-4 shadow rounded-md mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Date Range */}
            <div className="flex flex-col border p-3 rounded">
                <label className="font-medium text-gray-800 mb-2">Date Range</label>
                <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onChange={handleDateChange}
                />
            </div>

            {/* Search by ID/Guest */}
            <div className="flex flex-col border p-3 rounded">
                <label className="font-medium text-gray-800 mb-2">Search</label>
                <input
                type="text"
                placeholder="ID or Guest name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border p-1 rounded"
                />
            </div>

            {/* Order Channel */}
            <div className="flex flex-col border p-3 rounded">
                <label className="font-medium text-gray-800 mb-2">Channel</label>
                <select
                className="border p-1 rounded"
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                >
                <option value="">All</option>
                <option value="TWT">TWT</option>
                <option value="KLOOK">KLOOK</option>
                <option value="JVTO">JVTO</option>
                <option value="Others">Others</option>
                </select>
            </div>

            {/* Pickup / Drop-off */}
            <div className="flex flex-col border p-3 rounded">
                <label className="font-medium text-gray-800 mb-2">Pickup/Drop-off</label>
                <select
                className="border p-1 rounded"
                value={pickupFilter}
                onChange={(e) => setPickupFilter(e.target.value)}
                >
                <option value="">All</option>
                <option value="airport">Airport</option>
                <option value="hotel">Hotel</option>
                <option value="station">Train Station</option>
                </select>
            </div>

            {/* Payment Status */}
            <div className="flex flex-col border p-3 rounded">
                <label className="font-medium text-gray-800 mb-2">Payment</label>
                <select
                className="border p-1 rounded"
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                >
                <option value="">All</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Overdue">Overdue</option>
                </select>
            </div>
            </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white shadow rounded-md p-4 mb-8">
            <table className="min-w-full text-left text-sm text-gray-700">
            <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
                <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Guest & Pax</th>
                <th className="py-3 px-4">Booking Info</th>
                <th className="py-3 px-4">Pickup</th>
                <th className="py-3 px-4">Drop-off</th>
                <th className="py-3 px-4">Vehicle & Crew</th>
                <th className="py-3 px-4">Financial</th>
                <th className="py-3 px-4">Notes</th>
                </tr>
            </thead>
            <tbody>
                {data.booking.map((booking, index) => {
                const isExpanded = expandedBookingId === booking.id;
                const hasCar = booking.book_car && booking.book_car.length > 0;
                const hasDriver = booking.guide_driver && booking.guide_driver.some(gd => gd.type === 'driver');
                const hasGuide = booking.guide_driver && booking.guide_driver.some(gd => gd.type === 'guide');
            
                return (
                    <React.Fragment key={booking.id}>
                    <tr className="border-b">
                        {/* Expand/Collapse Button + Row Index */}
                        <td className="py-3 px-4 align-top">
                        <button
                            onClick={() => setExpandedBookingId(isExpanded ? null : booking.id)}
                            className="text-gray-600 hover:text-gray-800 mr-2"
                        >
                            {isExpanded ? (
                            <ChevronDown className="inline w-5 h-5" />
                            ) : (
                            <ChevronRight className="inline w-5 h-5" />
                            )}
                        </button>
                        {index + 1}
                        </td>

                        {/* Date Column */}
                        <td className="py-3 px-4 align-top">
                        <div>
                            {format(new Date(booking.travel_date_start), 'dd-MMM')} - {format(
                            new Date(booking.travel_date_end),
                            'dd-MMM'
                            )}
                        </div>
                        <div className="text-xs text-gray-400">
                            {format(new Date(booking.travel_date_start), 'E')} - {format(
                                new Date(booking.travel_date_end),
                                'E'
                            )}
                        </div>
                        </td>

                        {/* Guest & Pax */}
                        <td className="py-3 px-4 align-top">
                        <div className="font-medium">{booking.user.name}</div>
                        <div className="text-xs text-gray-500">
                            {booking.total_pax} PAX
                        </div>
                        </td>

                        {/* Booking Info (ID, Duration, Package ID) */}
                        <td className="py-3 px-4 align-top">
                        <div className="font-medium">
                            {
                                booking.agent_id == 1 ? (
                                    <span>TWT-{booking.id}</span>
                                ) : (
                                    booking.agent_id == 2 && booking.booking_category_id != 3 ? (
                                        <span>JVTO-{booking.id}</span>
                                    ) : (
                                        <span>KLOOK-{booking.id}</span>
                                    )
                                )
                            }
                        </div>
                        <div className="text-xs text-gray-500">{/* Duration if needed */}</div>
                        <div className="text-xs text-gray-400">
                            {
                                booking.agent_id == 1 ? (
                                    <span>TWT</span>
                                ) : (
                                    booking.agent_id == 2 && booking.booking_category_id != 3 ? (
                                        <span>JVTO</span>
                                    ) : (
                                        <span>KLOOK</span>
                                    )
                                )
                            }
                        </div>
                        </td>

                        {/* Pickup Details */}
                        <td className="py-3 px-4 align-top whitespace-pre">
                        <div>
                            {
                                booking.meeting_point == 'Surabaya Airport' || booking.meeting_point == 'Denpasar Airport' ? (
                                <>
                                    <div className="flex space-x-2">
                                        <div>
                                            <Plane className="mt-1 h-3.5 w-3.5 text-gray-400 dark:text-gray-500"/>
                                        </div>
                                        <span className="text-sm">{booking.meeting_point}</span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <div>
                                            <Ticket className="mt-1 h-3.5 w-3.5 text-gray-400 dark:text-gray-500"/>
                                        </div>
                                        <span className="text-sm">{booking.meeting_point_value ? booking.meeting_point_value : '-'}</span>
                                    </div>
                                </>
                                ) : ""
                            }
                            {
                                booking.meeting_point == 'Surabaya Hotel' || booking.meeting_point == 'Denpasar Hotel' ? (
                                <>
                                    <div className="flex space-x-2">
                                        <div>
                                            <Hotel className="mt-1 h-3.5 w-3.5 text-gray-400 dark:text-gray-500"/>
                                        </div>
                                        <span className="text-sm">{booking.meeting_point}</span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <div>
                                            <Hotel className="mt-1 h-3.5 w-3.5 text-gray-400 dark:text-gray-500"/>
                                        </div>
                                        <span className="text-sm">{booking.meeting_point_value ? booking.meeting_point_value : '-'}</span>
                                    </div>
                                </>
                                ) : ""
                            }
                            {
                                booking.meeting_point == 'Surabaya Train Station' ? (
                                <>
                                    <div className="flex space-x-2">
                                        <div>
                                            <TrainFront className="mt-1 h-3.5 w-3.5 text-gray-400 dark:text-gray-500"/>
                                        </div>
                                        <span className="text-sm">{booking.meeting_point}</span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <div>
                                            <Ticket className="mt-1 h-3.5 w-3.5 text-gray-400 dark:text-gray-500"/>
                                        </div>
                                        <span className="text-sm">{booking.meeting_point_value ? booking.meeting_point_value : '-'}</span>
                                    </div>
                                </>
                                ) : ""
                            }
                            {
                                booking.meeting_point == 'Others' || booking.meeting_point == null  ? (
                                <>
                                    <div className="flex space-x-2">
                                        <div>
                                            <MapPin className="mt-1 h-3.5 w-3.5 text-gray-400 dark:text-gray-500"/>
                                        </div>
                                        <span className="text-sm">{booking.pickup}</span>
                                    </div>
                                </>
                                ) : ""
                            }
                            <div className="flex space-x-2">
                                <div>
                                <Clock className="mt-1 h-3.5 w-3.5 text-gray-400 dark:text-gray-500"/>
                                </div>
                                <span className="text-sm">
                                {booking.pickup_time ? format(parse(booking.pickup_time, 'HH:mm:ss', new Date()), 'HH:mm') : '-'}
                                </span>
                            </div>
                        </div>
                        <div className="text-xs text-gray-500">{booking.pickup.time}</div>
                        <div className="text-xs text-gray-400">{booking.pickup.location}</div>
                        </td>

                        {/* Drop-off Details */}
                        <td className="py-3 px-4 align-top whitespace-pre">
                            {
                                booking.drop_point == 'Surabaya Airport' || booking.drop_point == 'Denpasar Airport' ? (
                                <>
                                    <div className="flex space-x-2">
                                        <div>
                                            <Plane className="mt-1 h-3.5 w-3.5 text-gray-400 dark:text-gray-500"/>
                                        </div>
                                        <span className="text-sm">{booking.drop_point}</span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <div>
                                            <Ticket className="mt-1 h-3.5 w-3.5 text-gray-400 dark:text-gray-500"/>
                                        </div>
                                        <span className="text-sm">{booking.drop_point_value ? booking.drop_point_value : '-'}</span>
                                    </div>
                                </>
                                ) : ""
                            }
                            {
                                booking.drop_point == 'Surabaya Hotel' || booking.drop_point == 'Denpasar Hotel' ? (
                                <>
                                    <div className="flex space-x-2">
                                        <div>
                                            <Hotel className="mt-1 h-3.5 w-3.5 text-gray-400 dark:text-gray-500"/>
                                        </div>
                                        <span className="text-sm">{booking.drop_point}</span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <div>
                                            <Hotel className="mt-1 h-3.5 w-3.5 text-gray-400 dark:text-gray-500"/>
                                        </div>
                                        <span className="text-sm">{booking.drop_point_value ? booking.drop_point_value : '-'}</span>
                                    </div>
                                </>
                                ) : ""
                            }
                            {
                                booking.drop_point == 'Surabaya Train Station' ? (
                                <>
                                    <div className="flex space-x-2">
                                        <div>
                                            <TrainFront className="mt-1 h-3.5 w-3.5 text-gray-400 dark:text-gray-500"/>
                                        </div>
                                        <span className="text-sm">{booking.drop_point}</span>
                                    </div>
                                    <div className="flex space-x-2">
                                        <div>
                                            <Ticket className="mt-1 h-3.5 w-3.5 text-gray-400 dark:text-gray-500"/>
                                        </div>
                                        <span className="text-sm">{booking.drop_point_value ? booking.drop_point_value : '-'}</span>
                                    </div>
                                </>
                                ) : ""
                            }
                            {
                                booking.drop_point == 'Others' || booking.drop_point == null  ? (
                                <>
                                    <div className="flex space-x-2">
                                        <div>
                                            <MapPin className="mt-1 h-3.5 w-3.5 text-gray-400 dark:text-gray-500"/>
                                        </div>
                                        <span className="text-sm">{booking.drop != null ? booking.drop : '-'}</span>
                                    </div>
                                </>
                                ) : ""
                            }
                            <div className="flex space-x-2">
                                <div>
                                <Clock className="mt-1 h-3.5 w-3.5 text-gray-400 dark:text-gray-500"/>
                                </div>
                                <span className="text-sm">
                                {
                                booking.drop_time ? format(parse(booking.drop_time, 'HH:mm:ss', new Date()), 'HH:mm') : '-'
                                }
                                </span>
                            </div>
                        </td>

                        {/* Vehicle & Crew */}
                        <td className="py-3 px-4 align-top">
                            <div>
                            {hasCar ? (
                                booking.book_car.map((bookCar, key) => (
                                    <div key={key} className="flex mb-1">
                                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-md text-sm mr-2 bg-green-100 ${bookCar.car.name == 'Hiace' || bookCar.car.name == 'Premio' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-600'} `}>
                                            <div>
                                                🚗 
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium">{bookCar.car.name}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <Alert message="No car assigned"/>
                            )}
                            </div>
                            <div className="text-xs text-gray-600">
                                {hasDriver ? (
                                        booking.guide_driver
                                            .filter((bookDriver) => bookDriver.type === 'driver')
                                            .map((bookDriver, keyDriver) => (
                                                <div key={keyDriver} className="flex space-x-2">
                                                    <div>
                                                        <div className="text-xs text-gray-600">Driver: {bookDriver.person.name}</div>
                                                    </div>
                                                </div>
                                            ))
                                ) : (
                                    <Alert message="No driver assigned"/>
                                )}
                            </div>
                            <div className="text-xs text-gray-600">
                                {hasGuide ? (
                                booking.guide_driver
                                        .filter((bookGuide) => bookGuide.type === 'guide')
                                        .map((bookGuide, keyGuide) => (
                                            <div key={keyGuide} className="flex space-x-2">
                                                <div>
                                                    <div className="text-xs text-gray-600">{bookGuide.guide_ijen == '0' ? 'Escort' : 'Ijen'}: {bookGuide.person.name}</div>
                                                </div>
                                            </div>
                                        ))
                                ) : (
                                    <Alert message="No guide assigned"/>
                                )}
                            </div>
                        </td>

                        {/* Financial */}
                        <td className="py-3 px-4 align-top">
                        <div className="text-sm text-blue-500">
                            Invoice: {formatCurrency(booking.grand_total + booking.book_add_on_total)}
                        </div>
                        <div className="text-xs text-gray-600">
                            Expenses: {formatCurrency(booking.expense_internal_total)}
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                            Profit: {formatCurrency(booking.grand_total + booking.book_add_on_total - booking.expense_internal_total)}
                        </div>
                        </td>

                        {/* Notes */}
                        <td className="py-3 px-4 align-top">
                        <div className="text-xs text-gray-600">{booking.note || '-'}</div>
                        </td>
                    </tr>

                    {/* Expanded row for details */}
                    {isExpanded && (
                        <tr className="border-b bg-gray-50">
                        <td colSpan={9} className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Itinerary Overview */}
                            <div>
                                <h3 className="font-medium mb-2">Itinerary Overview</h3>
                                <ul className="space-y-1 list-disc list-inside text-gray-700">
                                {booking.itinerary.map((item, idx) => (
                                    <li key={idx}>{item}</li>
                                ))}
                                </ul>
                            </div>

                            {/* Accommodation Details */}
                            <div>
                                <h3 className="font-medium mb-2">Accommodation Details</h3>
                                <div className="space-y-2 text-gray-700">
                                {booking.accommodation.map((acc, index) => (
                                    <div key={index}>
                                    <span className="text-sm font-semibold mr-2">Day {acc.day}:</span>
                                    <span className="mr-2">{acc.hotel}</span>
                                    <span className="text-xs text-gray-500">{acc.room}</span>
                                    </div>
                                ))}
                                </div>
                            </div>

                            {/* T-Shirt Size */}
                            <div>
                                <h3 className="font-medium mb-2">T-Shirt Size</h3>
                                <div className="text-gray-700">{booking.tshirtSize || '-'}</div>
                            </div>

                            {/* Payment History */}
                            {booking.financial.paymentHistory && (
                                <div>
                                <h3 className="font-medium mb-2">Payment History</h3>
                                <div className="bg-white border rounded-md p-2 space-y-2">
                                    {booking.financial.paymentHistory.map((payment, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between text-sm p-2 rounded border-b last:border-none"
                                    >
                                        <span className="w-24">{format(new Date(payment.date), 'dd-MMM-yyyy')}</span>
                                        <span className="flex-1 ml-4">{formatCurrency(payment.amount)}</span>
                                        <span className="flex-1 ml-4">{payment.method}</span>
                                        <span
                                        className={
                                            payment.status === 'Pending'
                                            ? 'text-red-500'
                                            : 'text-green-600'
                                        }
                                        >
                                        {payment.status}
                                        </span>
                                    </div>
                                    ))}
                                </div>
                                </div>
                            )}

                            {/* Deposit (if any) */}
                            {booking.financial.deposit && (
                                <div>
                                <h3 className="font-medium mb-2">Deposit</h3>
                                <div className="bg-white border rounded-md p-2 text-sm text-gray-700">
                                    Amount: {formatCurrency(booking.financial.deposit.amount)} (<em>{booking.financial.deposit.method}</em>)
                                </div>
                                </div>
                            )}
                            </div>
                        </td>
                        </tr>
                    )}
                    </React.Fragment>
                );
                })}
            </tbody>
            </table>
        </div>
        </div>
    </Main>
  );
}

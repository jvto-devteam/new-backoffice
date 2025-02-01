import Main from '@/Layouts/Main';

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  Plane,
  CreditCard,
  Info,
  Hotel,  // Ditambahkan
  Train,  // Ditambahkan 
  MapPin,  // Ditambahkan 
  AlertCircle  
} from 'lucide-react';

/********************************************************************************************
 * This version showcases how you can blend the original booking dashboard layout
 * with a style reminiscent of the Microsoft Rewards page, including:
 * - A gradient header with summary info.
 * - A "hero" or "banner" section at the top.
 * - Card-like elements for the daily set or tasks.
 *
 * Tailwind CSS classes are used extensively for styling.
 * Adjust colors and layout classes to refine the look.
 ********************************************************************************************/

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
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}
// Example initial data
const initialBookings = [
    {
      "id": "JVTO-867",
      "orderChannel": "JVTO",
      "guest": "Tan Day Peng",
      "package": "Ultimate East Java Experience: 5D4N Ijen Crater, Tumpak Sewu & Bromo",
      "date": {
        "start": "08 Jan 2025",
        "end": "12 Jan 2025",
        "days": "Wed - Sun"
      },
      "pickup": {
        "meeting_point": "Surabaya Airport",
        "meeting_point_value": "MH871",
        "pickup_time": "09:30:00"
      },
      "dropoff": {
        "meeting_point": "Surabaya Airport",
        "meeting_point_value": "MH872",
        "pickup_time": "13:50:00"
      },
      "itinerary": [
        { "day": 1, "itinerary": "Surabaya Airport - Bondowoso" },
        { "day": 2, "itinerary": "Ijen Crater - Papuma Beach Sunset" },
        { "day": 3, "itinerary": "Tumpak Sewu - Bromo Area" },
        { "day": 4, "itinerary": "Bromo Sunrise - Surabaya City" },
        { "day": 5, "itinerary": "Hotel - Surabaya Airport" }
      ],
      "hotels": [
        {
          "day": 1,
          "checkIn": "08 Jan 2025",
          "hotel": "Grand Padis Hotel",
          "rooms": { "roomName": "Extra Bed", "quantity": 1 }
        },
        {
          "day": 2,
          "checkIn": "09 Jan 2025",
          "hotel": "Doho Homestay",
          "rooms": { "roomName": "Family", "quantity": 1 }
        },
        {
          "day": 3,
          "checkIn": "10 Jan 2025",
          "hotel": "Joglo Kecombrang Bromo",
          "rooms": { "roomName": "Family", "quantity": 1 }
        },
        {
          "day": 4,
          "checkIn": "11 Jan 2025",
          "hotel": "Holiday Inn Express Surabaya Centerpoint, an IHG Hotel",
          "rooms": { "roomName": "Twin", "quantity": 3 }
        }
      ],
      "tshirtSize": "XS x 1, S x 1, M x 3, L x 1, XL x 1",
      "vehicles": ["Avanza Pratama", "Hiace"],
      "drivers": [],
      "guides": [
        { "name": "Taufik", "type": "Escort" },
        { "name": "Rendi", "type": "Ijen" }
      ],
      "financial": {
        "invoice": {
          "total": 28000000,
          "invoiceLink": ["https://javavolcano-touroperator.com/backoffice/invoice/view-invoice/867"]
        },
        "expense": {
          "total": 20070000,
          "expenseLink": "https://1drv.ms/x/s!AghHmKdq9e7UhfU59yPwVJiQ-eLJ-g?e=aeXlxz"
        },
        "profit": 7930000
      },
      "paymentHistory": [
        {
          "nominal": 2800000,
          "paymentMethod": "Debit/Credit Card",
          "description": "Down Payment",
          "reference": "https://checkout.xendit.co/web/673d919b569aeb83628cd0d6",
          "date": "20 Nov 2024 15:13"
        },
        {
          "nominal": 25200000,
          "paymentMethod": "Cash",
          "description": "Full Payment",
          "reference": null,
          "date": "08 Jan 2025 16:59"
        }
      ],
      "notes": null
    },
    {
      "id": "JVTO-898",
      "orderChannel": "JVTO",
      "guest": "Ting Yang Leow",
      "package": "East Java Highlights: 3D2N Bromo & Ijen Tour",
      "date": {
        "start": "12 Jan 2025",
        "end": "14 Jan 2025",
        "days": "Sun - Tue"
      },
      "pickup": {
        "meeting_point": "Surabaya Hotel",
        "meeting_point_value": "DoubleTree by Hilton Surabaya",
        "pickup_time": "10:30:00"
      },
      "dropoff": {
        "meeting_point": "Others",
        "meeting_point_value": "Separate: Surabaya and Ketapang Harbour",
        "pickup_time": null
      },
      "itinerary": [
        { "day": 1, "itinerary": "Surabaya Hotel - Bromo Area" },
        { "day": 2, "itinerary": "Bromo Sunrise - Bondowoso" },
        { "day": 3, "itinerary": "Ijen Crater - Surabaya City" }
      ],
      "hotels": [
        {
          "day": 1,
          "checkIn": "12 Jan 2025",
          "hotel": "Whizz Bromo",
          "rooms": { "roomName": "Capsule", "quantity": 2 }
        },
        {
          "day": 2,
          "checkIn": "13 Jan 2025",
          "hotel": "Baratha Hotel and Resto",
          "rooms": { "roomName": "Deluxe Twin", "quantity": 1 }
        }
      ],
      "tshirtSize": "S x 2",
      "vehicles": ["Ertiga"],
      "drivers": ["Holili"],
      "guides": [
        { "name": "Gufron", "type": "Escort" }
      ],
      "financial": {
        "invoice": {
          "total": 5450000,
          "invoiceLink": [
            "https://javavolcano-touroperator.com/backoffice/invoice/view-invoice/898",
            "https://javavolcano-touroperator.com/backoffice/invoice/view-invoice/898?addon=true"
          ]
        },
        "expense": {
          "total": 5141000,
          "expenseLink": "https://1drv.ms/x/s!AghHmKdq9e7UhfVDwXVAz5W1UFYVWw?e=6eYWnG"
        },
        "profit": 309000
      },
      "paymentHistory": [
        {
          "nominal": 545000,
          "paymentMethod": "Debit/Credit Card",
          "description": "Down Payment",
          "reference": null,
          "date": "15 Dec 2024 21:05"
        },
        {
          "nominal": 5605000,
          "paymentMethod": "Debit/Credit Card",
          "description": "Full Payment",
          "reference": "https://xen.to/J83z_fXj",
          "date": "20 Dec 2024 16:45"
        }
      ],
      "notes": null
    }
  ];
  export default function Index({data}) {
    // Local state
    const [bookings] = useState(data.booking);
  
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedChannel, setSelectedChannel] = useState('');
    const [pickupFilter, setPickupFilter] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [startDate, setStartDate] = useState('2025-01-01');
    const [endDate, setEndDate] = useState('2025-12-31');
  
    // State to track which booking is expanded
    const [expandedBookingId, setExpandedBookingId] = useState(null);
  
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
          b.pickup.meeting_point?.toLowerCase(),
          b.dropoff.meeting_point?.toLowerCase()
        ];
        hasPickup = locations.some((loc) => loc?.includes(pickupFilter.toLowerCase()));
      }
  
      // Payment Status
      let matchesPayment = true;
      if (paymentStatus === 'Paid') {
        const totalPayments = b.paymentHistory.reduce((sum, payment) => sum + payment.nominal, 0);
        matchesPayment = totalPayments >= b.financial.invoice.total;
      } else if (paymentStatus === 'Pending') {
        const totalPayments = b.paymentHistory.reduce((sum, payment) => sum + payment.nominal, 0);
        matchesPayment = totalPayments < b.financial.invoice.total;
      }
  
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
                    <div className="text-sm text-gray-600">
                        Total Value: {formatCurrency(bookings.reduce((sum, b) => sum + b.financial.invoice.total, 0))}
                    </div>
                    <div className="text-xs text-gray-600">
                        Total Profit: {formatCurrency(bookings.reduce((sum, b) => sum + b.financial.profit, 0))}
                    </div>
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
            
                {/* Filter Bar */}
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
                    <th className="py-3 px-4">Pickup</th>
                    <th className="py-3 px-4">Drop-off</th>
                    <th className="py-3 px-4">Vehicle & Crew</th>
                    <th className="py-3 px-4">Financial</th>
                    <th className="py-3 px-4">Notes</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBookings.map((booking, index) => {
                    const isExpanded = expandedBookingId === booking.id;

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
                            <div>{booking.date.start} - {booking.date.end}</div>
                            <div className="text-xs text-gray-400">{booking.date.days}</div>
                            </td>

                            {/* Guest & Package */}
                            <td className="py-3 px-4 align-top">
                            <div className="font-medium">{booking.guest}</div>
                            <div className="text-xs text-gray-500">{booking.package}</div>
                            <div className="mt-1">
                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full 
                                ${booking.orderChannel === 'JVTO' ? 'bg-blue-100 text-blue-800' :
                                    booking.orderChannel === 'TWT' ? 'bg-green-100 text-green-800' :
                                    booking.orderChannel === 'KLOOK' ? 'bg-purple-100 text-purple-800' :
                                    'bg-gray-100 text-gray-800'}`}>
                                {booking.id}
                                </span>
                            </div>
                            </td>

                            {/* Pickup Details */}
                            <td className="py-3 px-4 align-top space-y-1">
                                <div className="flex">
                                    {booking.pickup.meeting_point === "Surabaya Airport" ? (
                                        <div>
                                            <Plane className="inline-block w-4 h-4 mr-1" />
                                        </div>
                                    ) : booking.pickup.meeting_point === "Surabaya Hotel" ? (
                                        <div>
                                            <Hotel className="inline-block w-4 h-4 mr-1" />
                                        </div>
                                    ) : booking.pickup.meeting_point === "Surabaya Train Station" ? (
                                        <div>
                                            <Train className="inline-block w-4 h-4 mr-1" />
                                        </div>
                                    ) : (
                                            booking.pickup.meeting_point_value && (
                                                <div>
                                                    <MapPin className="inline-block w-4 h-4 mr-1" />
                                                </div>
                                            )
                                    )}
                                    {booking.pickup.meeting_point_value || (
                                    <span className="flex items-center text-red-500">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        No pickup location
                                    </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {booking.pickup.pickup_time ? (
                                    <>⏰ {booking.pickup.pickup_time}</>
                                    ) : (
                                    <span className="flex items-center text-red-500">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        No pickup time
                                    </span>
                                    )}
                                </div>
                                </td>

                            {/* Drop-off Details */}
                            <td className="py-3 px-4 align-top space-y-1">
                                <div className="flex">
                                    {booking.dropoff.meeting_point === "Surabaya Airport" ? (
                                        <div>
                                            <Plane className="inline-block w-4 h-4 mr-1" />
                                        </div>
                                    ) : booking.dropoff.meeting_point === "Surabaya Hotel" ? (
                                        <div>
                                            <Hotel className="inline-block w-4 h-4 mr-1" />
                                        </div>
                                    ) : booking.dropoff.meeting_point === "Surabaya Train Station" ? (
                                        <div>
                                            <Train className="inline-block w-4 h-4 mr-1" />
                                        </div>
                                    ) : (
                                        booking.dropoff.meeting_point_value && (
                                            <div>
                                                <MapPin className="inline-block w-4 h-4 mr-1" />
                                            </div>
                                        )
                                    )}
                                    {booking.dropoff.meeting_point_value || (
                                    <span className="flex items-center text-red-500">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        No dropoff location
                                    </span>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {booking.dropoff.pickup_time ? (
                                    <>⏰ {booking.dropoff.pickup_time}</>
                                    ) : (
                                    <span className="flex items-center text-red-500">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        No dropoff time
                                    </span>
                                    )}
                                </div>
                                </td>

                            {/* Vehicle & Crew */}
                            <td className="py-3 px-4 align-top space-y-1 tracking-wider">
                                <div className="space-y-1">
                                    {booking.vehicles && booking.vehicles.length > 0 ? (
                                    booking.vehicles.map((vehicle, idx) => (
                                        <div key={idx} className="flex">
                                        <div className="flex px-3 py-1 rounded-md text-sm mr-2 bg-green-100 text-green-800">
                                        🚗 {vehicle}
                                        </div>

                                        </div>
                                    ))
                                    ) : (
                                    <div className="flex text-xs items-center text-red-500">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        No vehicle assigned
                                    </div>
                                    )}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                    {booking.drivers && booking.drivers.length > 0 ? (
                                    booking.drivers.map((driver, idx) => (
                                        <div key={idx}>Driver: {driver}</div>
                                    ))
                                    ) : (
                                    <div className="flex items-center text-red-500">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        No driver assigned
                                    </div>
                                    )}
                                </div>
                                <div className="text-xs text-gray-600">
                                    {booking.guides && booking.guides.length > 0 ? (
                                    booking.guides.map((guide, idx) => (
                                        <div key={idx}>{guide.type}: {guide.name}</div>
                                    ))
                                    ) : (
                                    <div className="flex items-center text-red-500">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        No guide assigned
                                    </div>
                                    )}
                                </div>
                                </td>


                            {/* Financial */}
{/* Financial */}
<td className="py-3 px-4 align-top">
                      <div className="text-sm">
                        {booking.financial.invoice.invoiceLink ? (
                          <div 
                            onClick={() => {
                              booking.financial.invoice.invoiceLink.forEach(link => 
                                window.open(link, '_blank')
                              );
                            }}
                            className="text-blue-500 cursor-pointer hover:text-blue-700"
                          >
                            Invoice: {formatCurrency(booking.financial.invoice.total)}
                          </div>
                        ) : (
                          <div className="text-blue-500">
                            Invoice: {formatCurrency(booking.financial.invoice.total)}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-600">
                        {booking.financial.expense.expenseLink ? (
                          <div 
                            onClick={() => window.open(booking.financial.expense.expenseLink, '_blank')}
                            className="cursor-pointer hover:text-blue-600"
                          >
                            Expenses: {formatCurrency(booking.financial.expense.total)}
                          </div>
                        ) : (
                          <span>Expenses: {formatCurrency(booking.financial.expense.total)}</span>
                        )}
                      </div>
                      <div className="text-xs text-green-600 font-medium">
                        Profit: {formatCurrency(booking.financial.profit)}
                      </div>
                    </td>
                            {/* Notes */}
                            <td className="py-3 px-4 align-top">
                            <div className="text-xs text-gray-600">{booking.notes || '-'}</div>
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
                                        <li key={idx}>Day {item.day}: {item.itinerary}</li>
                                    ))}
                                    </ul>
                                </div>

                                {/* Accommodation Details */}
                                <div>
                                    <h3 className="font-medium mb-2">Accommodation Details</h3>
                                    <div className="space-y-2 text-gray-700">
                                    {booking.hotels.map((acc, index) => (
                                        <div key={index}>
                                        <span className="text-sm font-semibold mr-2">Day {acc.day}:</span>
                                        <span className="mr-2">{acc.hotel}</span>
                                        <span className="text-xs text-gray-500">
                                            {acc.rooms.roomName} x {acc.rooms.quantity}
                                        </span>
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
                                {booking.paymentHistory && booking.paymentHistory.length > 0 && (
                                    <div>
                                    <h3 className="font-medium mb-2">Payment History</h3>
                                    <div className="bg-white border rounded-md p-2 space-y-2">
                                        {booking.paymentHistory.map((payment, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between text-sm p-2 rounded border-b last:border-none"
                                        >
                                            <span className="w-24">{payment.date}</span>
                                            <span className="flex-1 ml-4">{formatCurrency(payment.nominal)}</span>
                                            <span className="flex-1 ml-4">{payment.paymentMethod}</span>
                                            <span className="text-gray-600">
                                            {payment.description}
                                            </span>
                                        </div>
                                        ))}
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
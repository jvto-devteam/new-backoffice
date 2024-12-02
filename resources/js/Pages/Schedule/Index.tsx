import Main from '@/Layouts/Main';
import React, { useState, useMemo } from 'react';
import { format, parse, addDays } from 'date-fns';
import { 
  ChevronDown, ChevronRight, Search, Calendar, 
  Hotel, Car, DollarSign, AlertCircle, Package,
  Users, Clock, MapPin, LifeBuoy, Backpack
} from 'lucide-react';

// Integrated Card Components
const Card = ({ className, children, ...props }) => (
  <div className={`rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader = ({ className, children, ...props }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle = ({ className, children, ...props }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props}>
    {children}
  </h3>
);

const CardContent = ({ className, children, ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props}>
    {children}
  </div>
);

// Sample package templates for auto-population
const PACKAGE_TEMPLATES = {
  'BRM3D': {
    name: 'Bromo 3D2N Package',
    duration: '3D2N',
    defaultItinerary: [
      { day: 1, activity: 'Surabaya to Bromo - Stargazing', hotel: 'Manis Ae Bromo' },
      { day: 2, activity: 'Bromo Sunrise - Madakaripura Waterfall', hotel: 'Manis Ae Bromo' },
      { day: 3, activity: 'Return to Surabaya', hotel: null }
    ]
  },
  'IJN4D': {
    name: 'Ijen Crater 4D3N Package',
    duration: '4D3N',
    defaultItinerary: [
      { day: 1, activity: 'Arrival - Transfer to Hotel', hotel: 'Astons Banyuwangi' },
      { day: 2, activity: 'Ijen Crater Trek', hotel: 'Astons Banyuwangi' },
      { day: 3, activity: 'Local Activities', hotel: 'Astons Banyuwangi' },
      { day: 4, activity: 'Departure', hotel: null }
    ]
  }
};
const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID').format(angka);
};

const BookingRow = ({ no,booking, isExpanded, onToggle }) => {
    
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100';
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100';
      case 'overdue': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100';
    }
  };

  const getSourceColor = (source) => {
    switch (source) {
      case 'JVTO': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100';
      case 'KLOOK': return 'bg-orange-100 dark:bg-orange-500 text-orange-800 dark:text-orange-100';
      case 'TWT': return 'bg-yellow-100 dark:bg-yellow-500 text-black';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100';
    }
  };

  const source = booking.agent_id == 2 && booking.booking_category_id == 3 ? 'KLOOK' : booking.agent.name
  
  return (
    <>
      <tr 
        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b dark:border-gray-700" 
        onClick={onToggle}
      >
        <td className="align-top px-4 py-3 text-sm whitespace-nowrap">
          <div className="flex items-center">
            {isExpanded ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
            {no}
          </div>
        </td>
        <td className="align-top px-4 py-3 text-sm whitespace-nowrap">
          <div className="flex items-center">
                {source}-{booking.id}
          </div>
        </td>
        <td className="align-top px-4 py-3 text-sm whitespace-nowrap">
          <div className="font-medium">{format(booking.travel_date_start,'dd-MMM')} - {format(booking.travel_date_end,'dd-MMM')}</div>
          <div className="text-gray-500 dark:text-gray-400">{format(booking.travel_date_start,'E')} - {format(booking.travel_date_end,'E')}</div>
        </td>
         <td className="align-top px-4 py-3">
          <div className="space-y-1">
            <div className="font-medium">{booking.user.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{booking.booking_detail[0].package ? `${booking.booking_detail[0].package.duration.day}D ${booking.booking_detail[0].package.duration.night}N` : ''}</div>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSourceColor(source)}`}>
              {source}
            </span>
          </div>
        </td>
        <td className="align-top px-4 py-3">
          <div className="flex space-x-2">
            <div>
                <MapPin className="mt-1 h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
            </div>
            <span className="text-sm">{booking.pickup}</span>
          </div>
          <div className="flex space-x-2">
            {booking.pickup_time ? (
                <>
                <div>
                    <Clock className="mt-1 h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                </div>
                <span className="text-sm">
                    {format(parse(booking.pickup_time, 'HH:mm:ss', new Date()), 'HH:mm')}
                </span>
                </>
            ) : ''}
          </div>
        </td>
        <td className="align-top px-4 py-3 text-sm max-w-md">
            {booking.booking_detail[0].xss ? (<span className="mr-2">XSS x {booking.booking_detail[0].xss}</span>) : ''}
            {booking.booking_detail[0].xxs ? (<span className="mr-2">XXS x {booking.booking_detail[0].xxs}</span>) : ''}
            {booking.booking_detail[0].xs ? (<span className="mr-2">XS x {booking.booking_detail[0].xs}</span>) : ''}
            {booking.booking_detail[0].s ? (<span className="mr-2">S x {booking.booking_detail[0].s}</span>) : ''}
            {booking.booking_detail[0].l ? (<span className="mr-2">L x {booking.booking_detail[0].l}</span>) : ''}
            {booking.booking_detail[0].xl ? (<span className="mr-2">XL x {booking.booking_detail[0].xl}</span>) : ''}
            {booking.booking_detail[0].xxl ? (<span className="mr-2">XXL x {booking.booking_detail[0].xxl}</span>) : ''}
            {booking.booking_detail[0].xxxl ? (<span className="mr-2">XXXL x {booking.booking_detail[0].xxxl}</span>) : ''}

        </td>
        <td className="align-top px-4 py-3">
          <div className="flex space-x-2">
            <div>
                <MapPin className="mt-1 h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
            </div>
            <span className='text-sm'>{booking.drop}</span>
          </div>
          <div className="flex space-x-2">
            {booking.drop_time ? (
                <>
                <div>
                    <Clock className="mt-1 h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                </div>
                <span className='text-sm'>
                    {format(parse(booking.drop_time, 'HH:mm:ss', new Date()), 'HH:mm')}
                </span>
                </>
            ) : ''}
          </div>
        </td>
        <td className="align-top px-4 py-3">
            <div>
                {booking.book_car.map((bookCar,key) => (
                    <div key={key} className="flex space-x-2">
                        <Car className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <div>
                            <div className="text-sm font-medium">{bookCar.car.name}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div>
                {booking.guide_driver
                .filter((bookDriver) => bookDriver.type === 'driver')
                .map((bookDriver,keyDriver) => (
                    <div key={keyDriver} className="flex space-x-2" key={bookDriver.id}>
                        <LifeBuoy className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <div>
                            <div className="text-sm font-medium">{bookDriver.person.name}</div>
                        </div>
                    </div>
                ))}
            </div>
            <div>
                {booking.guide_driver
                .filter((bookGuide) => bookGuide.type === 'guide')
                .map((bookGuide,keyGuide) => (
                    <div key={keyGuide} className="flex space-x-2" key={bookGuide.id}>
                        <Backpack className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                        <div>
                            <div className="text-sm font-medium">{bookGuide.person.name}</div>
                        </div>
                    </div>
                ))}
            </div>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan="8" className="bg-gray-50 dark:bg-gray-800 px-4 py-4">
            <div className="grid grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Full Itinerary
                </h4>
                <div className="space-y-2">
                  {booking.booking_itinerary.map((item, idx) => (
                    <div key={idx} className="text-sm">
                      <div className="font-medium">Day {item.day}</div>
                      <div className="text-gray-600 dark:text-gray-300">{item.itinerary}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <Hotel className="h-4 w-4 mr-2" />
                  Accommodation Details
                </h4>
                <div className="space-y-2 text-sm">
                    {booking.booking_itinerary.map((item, idx) => (
                        item.book_hotel.length !== 0 ? (
                            <div key={idx} className="text-sm">
                                <div className="font-medium">Check In : {format(addDays(booking.travel_date_start,item.day-1),'dd-MMM')}</div>
                                <div className="text-gray-600 dark:text-gray-300">
                                    {item.book_hotel[0].hotel.name} (
                                    {item.book_hotel[0].book_room.length !== 0 ? (
                                        item.book_hotel[0].book_room.map((room,keyRoom) =>  {
                                            return (
                                            <span key={keyRoom} className="mr-1">
                                                {room.room_hotel.room_name} x { room.quantity }{keyRoom+1 != item.book_hotel[0].book_room.length ? ',' : ''} 
                                            </span>
                                        )})
                                    ) : ''})
                                </div>
                            </div>
                        ) : ''
                    ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Financial Breakdown
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Invoice Total:</span> IDR {formatRupiah(booking.grand_total)}
                  </div>
                  <div>
                    <span className="font-medium">Expenses:</span> IDR {formatRupiah(booking.expense_internal_total)}
                  </div>
                  <div>
                    <span className="font-medium">Profit:</span> IDR  {formatRupiah(booking.grand_total-booking.expense_internal_total)}
                  </div>
                  {/* {booking.financial.notes && (
                    <div className="mt-2 text-yellow-600 dark:text-yellow-400 flex items-start">
                      <AlertCircle className="h-4 w-4 mr-1 mt-0.5" />
                      {booking.financial.notes}
                    </div>
                  )} */}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}

    </>
  );
};

const DashboardFilters = ({ onFilterChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div>
        <label className="block text-sm font-medium mb-1">Date Range</label>
        <input
          type="date"
          className="w-full border dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          onChange={(e) => onFilterChange('dateRange', e.target.value)}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Package</label>
        <select
          className="w-full border dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          onChange={(e) => onFilterChange('package', e.target.value)}
        >
          <option value="">All Packages</option>
          {Object.entries(PACKAGE_TEMPLATES).map(([id, pkg]) => (
            <option key={id} value={id}>{pkg.name}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <select
          className="w-full border dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          onChange={(e) => onFilterChange('status', e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Source</label>
        <select
          className="w-full border dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          onChange={(e) => onFilterChange('source', e.target.value)}
        >
          <option value="">All Sources</option>
          <option value="JVTO">JVTO</option>
          <option value="KLOOK">KLOOK</option>
          <option value="TWT">TWT</option>
        </select>
      </div>
    </div>
  );
};

const Index = ({data}) => {    
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [filters, setFilters] = useState({
    dateRange: '',
    package: '',
    status: '',
    source: ''
  });

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  const toggleRowExpansion = (bookingNo) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookingNo)) {
        newSet.delete(bookingNo);
      } else {
        newSet.add(bookingNo);
      }
      return newSet;
    });
  };

  // Sample booking data structure
  const bookings = [
    {
      no: 1,
      dates: {
        start: '02 Dec',
        end: '06 Dec',
        days: 'Mon - Fri'
      },
      guestName: 'Lin Chun Hong',
      packageId: 'BRM3D',
      source: 'JVTO',
      pickup: {
        time: '09:00',
        location: 'Surabaya Airport'
      },
      itinerary: [
        { day: 1, activity: 'Surabaya Airport - Bondowoso', hotel: 'Grand Padis Hotel' },
        { day: 2, activity: 'Ijen Crater - Papuma Beach Sunset', hotel: 'Dana Homestay' }
      ],
      accommodation: {
        hotel: 'Grand Padis Hotel',
        roomType: 'Deluxe Double',
        checkIn: '02 Dec 2024',
        checkOut: '06 Dec 2024',
        rooms: [
          { type: 'Deluxe Double', quantity: 2 },
          { type: 'Twin', quantity: 1 }
        ]
      },
      transport: {
        vehicle: 'Toyota Hiace',
        driver: 'Yandi'
      },
      financial: {
        invoice: 4500000,
        expenses: 3172500,
        profit: 1327500,
        status: 'PAID',
        notes: 'Early bird discount applied'
      }
    }
  ];

  return (
    <Main>
        <div className="min-h-screen">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Booking Overview</h1>
                <DashboardFilters onFilterChange={handleFilterChange} />
            </div>

            <Card>
                <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">No</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Booking ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Guest & Package</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Pick Up</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">T-Shirt Size</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Drop</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Resource Allocation</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {data.booking.map((booking,key) => (
                        <BookingRow
                            key={key}
                            no={key+1}
                            booking={booking}
                            isExpanded={expandedRows.has(key)}
                            onToggle={() => toggleRowExpansion(key)}
                        />
                        ))}
                    </tbody>
                    </table>
                </div>
                </CardContent>
            </Card>

            {/* Quick Actions Panel */}
            <div className="fixed bottom-6 right-6">
                <div className="flex flex-col space-y-2">
                <button 
                    className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    title="Add New Booking"
                >
                    <Package className="h-5 w-5" />
                </button>
                <button 
                    className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                    title="Export to Excel"
                >
                    <DollarSign className="h-5 w-5" />
                </button>
                </div>
            </div>

            {/* Notifications Panel */}
            <div className="fixed top-6 right-6 max-w-sm">
                {bookings.some(b => b.financial.status === 'OVERDUE') && (
                <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 dark:border-red-600 p-4 mb-4">
                    <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 mr-2" />
                    <div>
                        <h3 className="text-sm font-medium text-red-800 dark:text-red-100">Overdue Payments Alert</h3>
                        <p className="text-sm text-red-700 dark:text-red-200 mt-1">
                        There are bookings with overdue payments that require immediate attention.
                        </p>
                    </div>
                    </div>
                </div>
                )}
            </div>
        </div>
    </Main>
  );
};

export default Index;
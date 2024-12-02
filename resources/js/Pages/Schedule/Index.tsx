import Main from '@/Layouts/Main';
import React, { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { format, parse, addDays } from 'date-fns';
import { 
  ChevronDown, ChevronRight, Search, Calendar, 
  Hotel, Car, DollarSign, AlertCircle, Package,
  Users, Clock, MapPin, LifeBuoy, Backpack 
} from 'lucide-react';

// Integrated Card Components
const Card = ({ children, className = '' }) => (
  <div className={`bg-white/80 dark:bg-gray-800/90 backdrop-blur-lg rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg transition-all duration-300 hover:shadow-xl ${className}`}>
    {children}
  </div>
);

const GlassCard = ({ children, className = '', glow = false }) => (
  <div className={`
    relative backdrop-blur-xl bg-white/40 dark:bg-gray-800/40
    border border-white/20 dark:border-gray-700/20 
    rounded-2xl shadow-lg
    ${glow ? 'before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-blue-500/10 before:to-purple-500/10 before:animate-pulse before:-z-10' : ''}
    transition-all duration-500 ease-out
    hover:shadow-xl hover:shadow-blue-500/10
    ${className}
  `}>
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
  <div className={`${className}`} {...props}>
    {children}
  </div>
);

// Sample package templates for auto-population
const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID').format(angka);
};
const Alert = ({ message }) => (
  <div className="flex items-center space-x-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 px-1 py-0.5 rounded text-xs mb-1">
    <AlertCircle className="h-3 w-3" />
    <span>{message}</span>
  </div>
);

const BookingRow = ({ no,booking, isExpanded, onToggle }) => {

  const getSourceColor = (source) => {
    switch (source) {
      case 'JVTO': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100';
      case 'KLOOK': return 'bg-orange-100 dark:bg-orange-500 text-orange-800 dark:text-orange-100';
      case 'TWT': return 'bg-yellow-100 dark:bg-yellow-500 text-black';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100';
    }
  };

  const source = booking.agent_id == 2 && booking.booking_category_id == 3 ? 'KLOOK' : booking.agent.name
  const hasCar = booking.book_car && booking.book_car.length > 0;
  const hasDriver = booking.guide_driver && booking.guide_driver.some(gd => gd.type === 'driver');
  const hasGuide = booking.guide_driver && booking.guide_driver.some(gd => gd.type === 'guide');

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
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {booking.booking_detail[0].package ? `${booking.booking_detail[0].package.duration.day}D ${booking.booking_detail[0].package.duration.night}N` : `${booking.package_duration}D ${booking.package_duration-1}N`} / {booking.total_pax} PAX
              </div>
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
        <td className="align-top px-4 py-3 text-sm whitespace-nowrap">
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
        <td className="align-top px-4 py-3 whitespace-nowrap">
            <div>
              {hasCar ? (
                booking.book_car.map((bookCar, key) => (
                  <div key={key} className="flex space-x-2">
                    <Car className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">{bookCar.car.name}</div>
                    </div>
                  </div>
                ))
              ) : (
                <Alert message="No car assigned" />
              )}
            </div>
            <div>
              {hasDriver ? (
                booking.guide_driver
                  .filter((bookDriver) => bookDriver.type === 'driver')
                  .map((bookDriver, keyDriver) => (
                    <div key={keyDriver} className="flex space-x-2">
                      <LifeBuoy className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">{bookDriver.person.name}</div>
                      </div>
                    </div>
                  ))
              ) : (
                <Alert message="No driver assigned" />
              )}
            </div>
            <div>
              {hasGuide ? (
                booking.guide_driver
                  .filter((bookGuide) => bookGuide.type === 'guide')
                  .map((bookGuide, keyGuide) => (
                    <div key={keyGuide} className="flex space-x-2">
                      <Backpack className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      <div>
                        <div className="text-sm font-medium">{bookGuide.person.name}</div>
                      </div>
                    </div>
                  ))
              ) : (
                <Alert message="No guide assigned" />
              )}
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
                    <span className="font-medium">Expenses:</span> <span className=" text-blue-400 underline"><a href={booking.expense_file_internal} target="_blank">IDR {formatRupiah(booking.expense_internal_total)}</a></span>
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

const DashboardFilters = ({ filter }) => {
  const [filters, setFilters] = useState({
    month: filter.month,
    year: filter.year,
    source: filter.source
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Remove empty filters

    router.get('', filters, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div>
        <label className="block text-sm font-medium mb-1">Date</label>
        <div className="flex">
          <select
            className="w-full border dark:border-gray-700 rounded-tl-lg rounded-bl-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            value={filters.month}
            onChange={(e) => handleFilterChange('month', e.target.value)}
          >
            <option value="">Month</option>
            {[
              ["01", "January"],
              ["02", "February"],
              ["03", "March"],
              ["04", "April"], 
              ["05", "May"],
              ["06", "June"],
              ["07", "July"],
              ["08", "August"],
              ["09", "September"],
              ["10", "October"],
              ["11", "November"],
              ["12", "December"]
            ].map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
          <select
            className="w-full border dark:border-gray-700 rounded-tr-lg rounded-br-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            value={filters.year}
            onChange={(e) => handleFilterChange('year', e.target.value)}
          >
            <option value="">Year</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>
            
      <div>
        <label className="block text-sm font-medium mb-1">Order Channel</label>
        <select
          className="w-full border dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          value={filters.source}
          onChange={(e) => handleFilterChange('source', e.target.value)}
        >
          <option value="">All Order Channel</option>
          <option value="2">JVTO</option>
          <option value="3">KLOOK</option>
          <option value="1">TWT</option>
        </select>
      </div>

      <div className="flex items-end">
        <button
          type="submit"
          className=" bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
        >
          Apply Filters
        </button>
      </div>      
    </form>
  );
};

const Index = ({data}) => {    
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [filters, setFilters] = useState({
    month: data.month,
    year: data.year,
    source: data.source
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

  return (
    <Main>
        <div className="min-h-screen">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Booking Overview</h1>
                <DashboardFilters filter={filters}/>
            </div>

            <GlassCard>
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
            </GlassCard>
        </div>
    </Main>
  );
};

export default Index;
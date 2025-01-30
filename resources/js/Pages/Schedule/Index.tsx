import Main from '@/Layouts/Main';
import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  Plane,
  CreditCard,
  Info,
  AlertCircle,
  Car,
  Backpack,
  LifeBuoy,
  Eye,
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  FileSpreadsheet,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, parse, addDays } from 'date-fns';
function formatCurrency(amountString) {
    if (!amountString) return 'IDR 0';
    
    amountString = amountString.toString();
    const numericValue = parseInt(amountString.replace('IDR', '').replace(/\D+/g, '')) || 0;
    
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericValue);
  }
// Enhanced DateRangePicker with modern styling

const DateRangePicker = ({ startDate, endDate, onChange }) => (
  <div className="flex items-center gap-2">
    <div className="relative flex-1">
      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"/>
      <input
        type="date"
        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
        value={startDate}
        onChange={(e) => onChange(e.target.value, endDate)}
      />
    </div>
    <ArrowRight className="h-4 w-4 text-gray-400" />
    <div className="relative flex-1">
      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"/>
      <input
        type="date"
        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
        value={endDate}
        onChange={(e) => onChange(startDate, e.target.value)}
      />
    </div>
  </div>
);
// Enhanced Alert Component
const Alert = ({message}) => (
  <div className="flex items-center px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-sm font-medium animate-fadeIn group hover:bg-red-100 transition-colors duration-200">
    <AlertCircle className="h-3.5 w-3.5 mr-1.5 group-hover:scale-110 transition-transform duration-200"/>
    <span>{message}</span>
  </div>
);

// Badge Component for T-Shirt Sizes
const SizeBadge = ({ size, count }) => {
  if (!count || count === 0) return null;
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
      {size.toUpperCase()}: {count}
    </span>
  );
};

const Index = ({data}) => {
  // State management code remains the same
  const [filters, setFilters] = React.useState({
    search: data.filters.search,
    startDate: data.filters.startDate,
    endDate: data.filters.endDate,
    channel: data.filters.channel,
    // paymentStatus: data.filters.status
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(filters);
    
    router.get('/booking-overview', filters, {
      preserveState: true,
      preserveScroll: true
    });
  };  
  const [expandedBookingId, setExpandedBookingId] = useState(null);

  // Enhanced source color mapping
  const getSourceColor = (source) => {
    const colors = {
      'JVTO': 'bg-indigo-600 text-white',
      'KLOOK': 'bg-emerald-600 text-white',
      'TWT': 'bg-amber-500 text-gray-900',
      'default': 'bg-blue-600 text-white'
    };
    return `${colors[source] || colors.default} shadow-sm hover:opacity-90 transition-opacity duration-200`;
  };

  return (
    <Main>
      <div className="min-h-screen bg-white">
        <div className=" mx-auto p-4 space-y-6">
          {/* Enhanced Filter Section */}
          <Card className="transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-6 pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid items-end grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Search Input */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guest Name
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"/>
                      <input
                        type="text"
                        placeholder="Search by guest name..."
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                      />
                    </div>
                  </div>

                  {/* Date Range */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date Range
                    </label>
                    <DateRangePicker
                      startDate={filters.startDate}
                      endDate={filters.endDate}
                      onChange={(start, end) => setFilters(prev => ({ ...prev, startDate: start, endDate: end }))}
                    />
                  </div>

                  {/* Channel Select */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Channel
                    </label>
                    <div className="relative">
                      <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"/>
                      <select
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm appearance-none bg-white"
                        value={filters.channel}
                        onChange={(e) => setFilters(prev => ({ ...prev, channel: e.target.value }))}
                      >
                        <option value="">All Channels</option>
                        <option value="TWT">TWT</option>
                        <option value="KLOOK">KLOOK</option>
                        <option value="JVTO">JVTO</option>
                      </select>
                    </div>
                  </div>

                  {/* Payment Status Select */}
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Status
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"/>
                      <select
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm appearance-none bg-white"
                        value={filters.paymentStatus}
                        onChange={(e) => setFilters(prev => ({ ...prev, paymentStatus: e.target.value }))}
                      >
                        <option value="">All Payments</option>
                        <option value="Paid">Paid</option>
                        <option value="Pending">Pending</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </div>
                  </div> */}
                  {/* Submit Button */}
                </div>
                <div className='flex justify-between'>
                  <div>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                    >
                      <Filter className="h-4 w-4" />
                      Apply Filters
                    </Button>
                  </div>
                  <div className='flex gap-2'>
                    <a href={`/booking-overview?channel=${filters.channel}&endDate=${filters.endDate}&search=${filters.search}&startDate=${filters.startDate}&export=true`}>
                      <Button
                        type="button"
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <FileSpreadsheet className="h-4 w-4" />
                        Export Excel
                      </Button>
                    </a>
                    <a href={`/booking-overview?channel=${filters.channel}&endDate=${filters.endDate}&search=${filters.search}&startDate=${filters.startDate}&pdf=true`}>
                      <Button
                        type="button"
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Export PDF
                      </Button>
                    </a>
                  </div>
                </div>

              </form>
            </CardContent>
          </Card>

          {/* Booking List */}
          <div className="space-y-4">
            {data.booking.map((booking) => {
              const isExpanded = expandedBookingId === booking.id;
              const source = booking.agent_id == 2 && booking.booking_category_id == 3 ? 'KLOOK' : booking.agent.name;
              const hasCar = booking.book_car && booking.book_car.length > 0;
              const hasDriver = booking.guide_driver && booking.guide_driver.some(gd => gd.type === 'driver');
              const hasGuide = booking.guide_driver && booking.guide_driver.some(gd => gd.type === 'guide');

              return (
                <Card 
                  key={booking.id} 
                  className={`transition-all duration-300 hover:shadow-lg ${
                    isExpanded ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <CardContent className="p-6 pt-6">
                    <div className="flex flex-col lg:flex-row lg:space-x-6">
                      {/* Expand/Collapse Button */}
                      <button
                        onClick={() => setExpandedBookingId(isExpanded ? null : booking.id)}
                        className="text-gray-500 hover:text-gray-700 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100 self-start"
                        aria-label={isExpanded ? "Collapse details" : "Expand details"}
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </button>

                      {/* Main Content */}
                      <div className="flex-1 space-y-4">
                        {/* Header Section */}
                        <div className="flex flex-wrap items-center gap-3">
                          <span className={`inline-flex px-3 py-1.5 text-sm font-medium rounded-full ${getSourceColor(source)}`}>
                            {source}-{booking.id}
                          </span>
                          <h2 className="text-xl font-semibold text-gray-900">{booking.user.name}</h2>
                          
                          {/* T-shirt sizes moved to header */}
                          <div className="flex flex-wrap gap-2">
                            {['xss', 'xxs', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl'].map(size => (
                              <SizeBadge 
                                key={size} 
                                size={size} 
                                count={booking.booking_detail[0][size]}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Travel Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Date Range */}
                          <div className="flex items-center text-blue-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span className="text-sm">
                              {format(new Date(booking.travel_date_start), 'dd MMM')} - {format(
                                new Date(booking.travel_date_end),
                                'dd MMM'
                              )}
                            </span>
                          </div>

                          {/* Pickup */}
                          <div className="flex  text-gray-700">
                            <div>
                                <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                            </div>
                            <div className="text-sm">
                              <span className="font-medium">Pickup:</span>
                              <span className="ml-1">{booking.pickup || "-"}</span>
                              {booking.pickup && <span className="mx-1">•</span>}
                              <span>{booking.pickup_time}</span>
                              <span className="text-gray-500 ml-1">({booking.booking_itinerary[0].itinerary})</span>
                            </div>
                          </div>

                          {/* Drop-off */}
                          <div className="flex  text-gray-700">
                            <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                            <div className="text-sm">
                              <span className="font-medium">Drop:</span>
                              <span className="ml-1">{booking.drop || "-"}</span>
                              {booking.drop && <span className="mx-1">•</span>}
                              <span>{booking.drop_time}</span>
                            </div>
                          </div>
                        </div>

                        {/* Services Status */}
                        <div className="flex flex-wrap gap-3">
                          {hasCar ? (
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full text-sm">
                              <Car className="h-4 w-4 text-gray-500"/>
                              <span className="text-gray-700">
                                {booking.book_car.map((bc, i) => (
                                  <span key={i}>
                                    {bc.car.name}
                                    {i < booking.book_car.length - 1 ? ', ' : ''}
                                  </span>
                                ))}
                              </span>
                            </div>
                          ) : (
                            <Alert message="No car assigned"/>
                          )}

                          {hasDriver ? (
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full text-sm">
                              <LifeBuoy className="h-4 w-4 text-gray-500"/>
                              <span className="text-gray-700">
                                {booking.guide_driver
                                  .filter(gd => gd.type === 'driver')
                                  .map((gd, i, arr) => (
                                    <span key={i}>
                                      {gd.person.name}
                                      {i < arr.length - 1 ? ', ' : ''}
                                    </span>
                                  ))}
                              </span>
                            </div>
                          ) : (
                            <Alert message="No driver assigned"/>
                          )}

                          {hasGuide ? (
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full text-sm">
                              <Backpack className="h-4 w-4 text-gray-500"/>
                              <span className="text-gray-700">
                                {booking.guide_driver
                                  .filter(gd => gd.type === 'guide')
                                  .map((gd, i, arr) => (
                                    <span key={i}>
                                      {gd.person.name}
                                      {i < arr.length - 1 ? ', ' : ''}
                                    </span>
                                  ))}
                              </span>
                            </div>
                          ) : (
                            <Alert message="No guide assigned"/>
                          )}
                        </div>
                      </div>

{/* Financial Summary */}
                      <div className="mt-4 lg:mt-0 min-w-[240px] space-y-3 bg-gray-50 p-4 rounded-lg">
                        {/* Invoice */}
                        <div className="flex flex-col space-y-1">
                          <button 
                            onClick={(e) => {
                              e.preventDefault();
                              window.open(`http://127.0.0.1:8001/backoffice/invoice/download/${booking.id}`, '_blank');
                              if(booking.book_add_on_total) {
                                window.open(`http://127.0.0.1:8001/backoffice/invoice/download/${booking.id}?addon=true`, '_blank');
                              }
                            }}
                            className="flex items-center justify-between group"
                          >
                            <div className="flex items-center text-blue-600">
                              <CreditCard className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                              <span className="text-sm font-medium group-hover:underline">Invoice</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {formatCurrency(booking.grand_total + booking.book_add_on_total)}
                            </span>
                          </button>
                        </div>

                        {/* Expenses */}
                        <div className="flex flex-col space-y-1">
                          <a 
                            href={booking.expense_file_internal}
                            className="flex items-center justify-between group"
                            target="_blank"
                          >
                            <div className="flex items-center text-gray-600">
                              <Info className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                              <span className="text-sm font-medium group-hover:underline">Expenses</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {formatCurrency(booking.expense_internal_total)}
                            </span>
                          </a>
                        </div>

                        {/* Profit */}
                        <div className="pt-2 border-t border-gray-200">
                          <div className="flex items-center justify-between text-green-600">
                            <span className="text-sm font-medium">Profit</span>
                            <span className="text-sm font-bold">
                              {formatCurrency(booking.grand_total + booking.book_add_on_total - booking.expense_internal_total)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-gray-200 space-y-8 animate-fadeIn">
                        {/* Itinerary Overview */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                            Itinerary Overview
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {booking.booking_itinerary.map((item, idx) => (
                              <div key={idx} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border">
                                <div className="flex items-start space-x-3">
                                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                                    {item.day}
                                  </span>
                                  <span className="text-gray-700 text-sm">{item.itinerary}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Accommodation Details */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                            Accommodation Details
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {booking.booking_itinerary.map((item, idx) => (
                              item.book_hotel.length !== 0 && (
                                <div key={idx} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 border">
                                  <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                                        {item.day}
                                      </span>
                                      <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-900">
                                          Check In: {format(addDays(new Date(booking.travel_date_start), item.day - 1), 'dd MMM')}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="pl-11 space-y-1">
                                      <div className="text-sm font-medium text-gray-900">
                                        {item.book_hotel[0].hotel.name}
                                      </div>
                                      <div className="text-sm text-gray-600">
                                        {item.book_hotel[0].book_room.map((room, keyRoom) => (
                                          <span key={keyRoom} className="inline-block">
                                            {room.room_hotel.room_name} × {room.quantity}
                                            {keyRoom + 1 !== item.book_hotel[0].book_room.length ? ', ' : ''}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            ))}
                          </div>
                        </div>

                        {/* Payment History */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            <CreditCard className="w-5 h-5 mr-2 text-blue-600" />
                            Payment History
                          </h3>
                          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Date & Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Description
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Payment Method
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Amount
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Action
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                  {booking.booking_payment.map((payment, index) => (
                                    <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                                      <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                          {format(new Date(payment.created_at), 'dd MMM yyyy')}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {format(new Date(payment.created_at), 'HH:mm')}
                                        </div>
                                      </td>
                                      <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{payment.description}</div>
                                      </td>
                                      <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{payment.payment_method.name}</div>
                                      </td>
                                      <td className="px-6 py-4 text-right">
                                        <div className="text-sm font-medium text-gray-900">
                                          {formatCurrency(payment.nominal)}
                                        </div>
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                        {payment.reference ? (
                                          <a
                                            href={payment.reference}
                                            target="_blank"
                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                                          >
                                            <Eye className="h-3.5 w-3.5 mr-1" />
                                            View
                                          </a>
                                        ) : (
                                          <span className="text-gray-400">-</span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }

        /* Custom scrollbar for better UX */
        .overflow-x-auto {
          scrollbar-width: thin;
          scrollbar-color: #CBD5E0 #F7FAFC;
        }

        .overflow-x-auto::-webkit-scrollbar {
          height: 6px;
        }

        .overflow-x-auto::-webkit-scrollbar-track {
          background: #F7FAFC;
        }

        .overflow-x-auto::-webkit-scrollbar-thumb {
          background-color: #CBD5E0;
          border-radius: 3px;
        }
      `}</style>
    </Main>
  );
};

export default Index;
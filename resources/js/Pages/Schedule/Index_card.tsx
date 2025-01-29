import Main from '@/Layouts/Main';

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  Plane,
  CreditCard,
  Info,
  AlertCircle,
  Car,Backpack,LifeBuoy,Eye
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import {format, parse, addDays} from 'date-fns';

// Minimal date picker for demonstration (replace with your preferred date picker library)
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

function formatCurrency(amountString) {
amountString = amountString.toString()
  const numericValue = parseInt(amountString.replace('IDR', '').replace(/\D+/g, '')) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(numericValue);
}

// Example dataset with multiple bookings


const Index = ({data}) => {
//   const [bookings] = useState(initialBookings);
  const [bookings] = useState(data.booking);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("");
  const [pickupFilter, setPickupFilter] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [startDate, setStartDate] = useState("2025-02-01");
  const [endDate, setEndDate] = useState("2025-03-31");

  const [expandedBookingId, setExpandedBookingId] = useState(null);

  // Filter logic
  const filteredBookings = bookings.filter((b) => {
    // Date filter
    const bookingStart = new Date(b.travel_date_start);
    const bookingEnd = new Date(b.travel_date_end);
    const filterStart = new Date(startDate);
    const filterEnd = new Date(endDate);
    const isWithinRange = bookingStart >= filterStart && bookingEnd <= filterEnd;
    
    // Search term (ID or Guest)
    const matchesSearch =
    //   b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.user.name.toLowerCase().includes(searchTerm.toLowerCase());

    // Order channel
    const matchesChannel = selectedChannel ? b.orderChannel === selectedChannel : true;

    // Pickup/Drop-off location
    let hasPickup = true;
    if (pickupFilter) {
      const locations = [
        b.pickup.location.toLowerCase(),
        b.dropoff.terminal.toLowerCase(),
        b.dropoff.station?.toLowerCase() || ""
      ];
      hasPickup = locations.some((loc) => loc.includes(pickupFilter.toLowerCase()));
    }

    // Payment Status
    const matchesPayment = paymentStatus ? b.financial.paymentStatus === paymentStatus : true;

    return isWithinRange && matchesSearch && matchesChannel && hasPickup && matchesPayment;
  });
  const getSourceColor = (source) => {
    switch (source) {
        case 'JVTO':
            return 'bg-primary text-white hover:bg-opacity-90';
        case 'KLOOK':
            return 'bg-[#13C296] text-white';
        case 'TWT':
            return 'bg-[#F9C107] text-[#212B36]';
        default:
            return 'bg-primary text-white hover:bg-opacity-90';
    }
};

const Alert = ({message}) => (
    <div className="flex">
        <div
            className="flex items-center space-x-1 text-[#DC3545] px-1 py-0.5 rounded">
            <AlertCircle className="h-3 w-3"/>
            <span>{message}</span>
        </div>
    </div>
);
  
//   console.log(filteredBookings);
  
  const handleDateChange = (start, end) => {
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <Main>
        <div className="w-full mx-auto p-4 space-y-4">
        {/* Filters */}
        <div className="bg-white p-4 shadow rounded-md flex flex-wrap items-center space-x-4">
            {/* Date Range */}
            <div className="flex items-center space-x-2">
            <label className="font-medium">Date Range:</label>
            <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onChange={handleDateChange}
            />
            </div>
            {/* Search by ID/Guest */}
            <div className="flex items-center space-x-2">
            <label className="font-medium">Search:</label>
            <input
                type="text"
                placeholder="ID or Guest name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border p-1 rounded"
            />
            </div>
            {/* Order Channel */}
            <div className="flex items-center space-x-2">
            <label className="font-medium">Channel:</label>
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
            <div className="flex items-center space-x-2">
            <label className="font-medium">Pickup/Drop-off:</label>
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
            <div className="flex items-center space-x-2">
            <label className="font-medium">Payment:</label>
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

        {/* Booking List */}
        {data.booking.map((booking) => {
            const isExpanded = expandedBookingId === booking.id;
            const source = booking.agent_id == 2 && booking.booking_category_id == 3 ? 'KLOOK' : booking.agent.name
            const hasCar = booking.book_car && booking.book_car.length > 0;
            const hasDriver = booking.guide_driver && booking.guide_driver.some(gd => gd.type === 'driver');
            const hasGuide = booking.guide_driver && booking.guide_driver.some(gd => gd.type === 'guide');
            let countTshirt = 0
            return (
            <Card key={booking.id} className="bg-white shadow-lg mb-4">
                <CardContent className="p-6 pt-6">
                <div className="flex space-x-4">
                    <button
                        onClick={() => {
                            setExpandedBookingId(isExpanded ? null : booking.id);
                        }}
                        className="text-gray-600 hover:text-gray-800"
                        >
                        {isExpanded ? (
                            <ChevronDown className="w-5 h-5" />
                        ) : (
                            <ChevronRight className="w-5 h-5" />
                        )}
                    </button>

                    <div className="flex-1">
                        <div className="flex items-center space-x-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-bold rounded ${getSourceColor(source)}`}>{source}-{booking.id}</span>
                            <h2 className="text-xl font-bold">{booking.user.name}</h2>

                        </div>
                        <div className="flex items-center mt-2 gap-4">
                            <div className="flex items-center  text-blue-500">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>
                                {format(new Date(booking.travel_date_start), 'dd MMM')} - {format(
                                    new Date(booking.travel_date_end),
                                    'dd MMM'
                                )}
                                </span>
                            </div>
                            <div className="flex items-center">
                                <span className=" mr-3 text-orange-500 ">Pickup : </span>
                                {booking.pickup ? (
                                    <>
                                        <span className="">{booking.pickup}</span>
                                        <span className="mx-2">•</span>
                                    </>
                                ) : "-"
                                }
                                <span>{booking.pickup_time} ({booking.booking_itinerary[0].itinerary})</span>
                            </div>
                            <div className="flex items-center">
                                <span className=" mr-3 text-orange-500 ">Drop : </span>
                                {booking.drop ? (
                                    <>
                                        <span className="">{booking.drop}</span>
                                        <span className="mx-2">•</span>
                                    </>
                                ) : "-"
                                }
                                <span>{booking.drop_time}</span>
                            </div>
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                            {hasCar ? (
                                <div className="flex gap-1 items-center">
                                    <Car className="h-5 w-5 text-gray-400 dark:text-gray-500"/>
                                    <div>
                                        {booking.book_car.map((bookCar, key) => (
                                            <span key={key}>{bookCar.car.name}{booking.book_car.length != (key+1) ? ', ' : ''}</span>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <Alert message="No car assigned"/>
                            )}
                            {hasDriver ? (
                                <div className="flex gap-1 items-center">
                                    <LifeBuoy className="h-4 w-4 text-gray-400 dark:text-gray-500"/>
                                    <div>
                                        {booking.guide_driver
                                            .filter((bookDriver) => bookDriver.type === 'driver')
                                            .map((bookDriver, keyDriver) => (
                                                <span key={keyDriver}>{bookDriver.person.name}{booking.guide_driver
                                                    .filter((bookDriver) => bookDriver.type === 'driver').length != (keyDriver+1) ? ', ' : ''}</span>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <Alert message="No driver assigned"/>
                            )}
                            {hasGuide ? (
                                <div className="flex gap-1 items-center">
                                    <Backpack className="h-4 w-4 text-gray-400 dark:text-gray-500"/>
                                    <div>
                                        {booking.guide_driver
                                            .filter((bookGuide) => bookGuide.type === 'guide')
                                            .map((bookGuide, keyGuide) => (
                                                <span key={keyGuide}>{bookGuide.person.name}{booking.guide_driver
                                                    .filter((bookGuide) => bookGuide.type === 'guide').length != (keyGuide+1) ? ', ' : ''}</span>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <Alert message="No guide assigned"/>
                            )}

                        </div>                        
                    </div>
                    <div className="space-y-1">
                        <div className="justify-end flex items-center space-x-2 text-blue-500">
                            <CreditCard className="w-4 h-4" />
                            <a href="#" onClick={(e) => {
                                e.preventDefault()
                                window.open(`http://127.0.0.1:8001/backoffice/invoice/download/${booking.id}`,'_blank')
                                if(booking.book_add_on_total){
                                    window.open(`http://127.0.0.1:8001/backoffice/invoice/download/${booking.id}?addon=true`,'_blank')
                                }
                            }} className="underline" title="View PDF Invoice">[PDF]</a>
                            <span>Invoice: {formatCurrency(booking.grand_total+booking.book_add_on_total)}</span>
                        </div>
                        <div className="justify-end flex items-center space-x-2 text-gray-600">
                            <Info className="w-4 h-4" />
                            <a href={booking.expense_file_internal} className="underline" title="View PDF Expenses">[EXCEL]</a>
                            <span>Expenses: {formatCurrency(booking.expense_internal_total)}</span>
                        </div>
                        <div className="flex justify-end items-center space-x-2 text-green-500">
                            <span>
                                Profit: {formatCurrency(booking.grand_total+booking.book_add_on_total-booking.expense_internal_total)}
                            </span>
                        </div>
                    </div>

                </div>

                {isExpanded && (
                    <div className="pl-9 space-y-7 mt-6 border-t-2 pt-5">
                        {/* Pickup Details */}
                        <div>
                            <div className="flex">
                                <span className={`flex gap-3 px-2 py-1 font-bold rounded-full text-black border bg-gray-100 `}>
                                        {booking.booking_detail[0].xss && booking.booking_detail[0].xss != 0 ? (
                                            <span className="uppercase">
                                                XSS : {booking.booking_detail[0].xss}
                                            </span>
                                        ) : ''}
                                        {booking.booking_detail[0].xxs && booking.booking_detail[0].xxs != 0 ? (
                                            <span className="uppercase">
                                                XXS : {booking.booking_detail[0].xxs}
                                            </span>
                                        ) : ''}
                                        {booking.booking_detail[0].xs && booking.booking_detail[0].xs != 0 ? (
                                            <span className="uppercase">
                                                xs : {booking.booking_detail[0].xs}
                                            </span>
                                        ) : ''}
                                        {booking.booking_detail[0].s && booking.booking_detail[0].s != 0 ? (
                                            <span className="uppercase">
                                                s : {booking.booking_detail[0].s}
                                            </span>
                                        ) : ''}
                                        {booking.booking_detail[0].m && booking.booking_detail[0].m != 0 ? (
                                            <span className="uppercase">
                                                m : {booking.booking_detail[0].m}
                                            </span>
                                        ) : ''}
                                        {booking.booking_detail[0].l && booking.booking_detail[0].l != 0 ? (
                                            <span className="uppercase">
                                                l : {booking.booking_detail[0].l}
                                            </span>
                                        ) : ''}
                                        {booking.booking_detail[0].xl && booking.booking_detail[0].xl != 0 ? (
                                            <span className="uppercase">
                                                xl : {booking.booking_detail[0].xl}
                                            </span>
                                        ) : ''}
                                        {booking.booking_detail[0].xxl && booking.booking_detail[0].xxl != 0 ? (
                                            <span className="uppercase">
                                                xxl : {booking.booking_detail[0].xxl}
                                            </span>
                                        ) : ''}
                                        {booking.booking_detail[0].xxxl && booking.booking_detail[0].xxxl != 0 ? (
                                            <span className="uppercase">
                                                xxxl : {booking.booking_detail[0].xxxl}
                                            </span>
                                        ) : ''}
                                </span>
                            </div>
                        </div>

                        {/* Itinerary */}
                        <div>
                            <h3 className="font-medium mb-2 text-black">Itinerary Overview</h3>
                            <div className="grid grid-cols-4 gap-4 mt-4">
                            {booking.booking_itinerary.map((item, idx) => (
                                <div key={idx} className="flex">
                                    <div>
                                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm mr-2">
                                            {item.day}
                                        </span>
                                    </div>
                                <span className="text-gray-600">{item.itinerary}</span>
                                </div>
                            ))}
                            </div>
                        </div>

                        {/* Accommodation */}
                        <div>
                            <h3 className="font-medium mb-2 text-black">Accommodation Details</h3>
                            <div className="grid grid-cols-4 mt-4 gap-5">
                                {booking.booking_itinerary.map((item, idx) => (
                                    item.book_hotel.length !== 0 ? (
                                        <div key={idx} className="flex">
                                            <div>
                                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm mr-2">
                                                    {item.day}
                                                </span>
                                            </div>
                                            <div>
                                                <div className="font-medium">
                                                    Check In
                                                    : {format(addDays(booking.travel_date_start, item.day - 1), 'dd-MMM')}
                                                </div>
                                                <div className="text-gray-600 dark:text-gray-300">
                                                    {item.book_hotel[0].hotel.name} (
                                                    {item.book_hotel[0].book_room.length !== 0 ? (
                                                        item.book_hotel[0].book_room.map((room, keyRoom) => {
                                                            return (
                                                                <span key={keyRoom} className="mr-1">
                                                                    {room.room_hotel.room_name} x {room.quantity}{keyRoom + 1 != item.book_hotel[0].book_room.length ? ',' : ''}
                                                                </span>
                                                            )
                                                        })
                                                    ) : ''})
                                                </div>
                                            </div>
                                        </div>
                                    ) : ''
                                ))}
                            </div>
                        </div>

                        {/* <div>
                            <h3 className="font-medium mb-2 text-black">Vehicle & Crew</h3>
                            <div className="flex gap-3">
                            <div className="space-y-2">
                                {hasCar ? (
                                    booking.book_car.map((bookCar, key) => (
                                        <div key={key} className="flex space-x-2">
                                            <Car className="h-5 w-5 text-gray-400 dark:text-gray-500"/>
                                            <div>
                                                <div>{bookCar.car.name}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <Alert message="No car assigned"/>
                                )}
                            </div>
                            <div className="space-y-2">
                                {hasDriver ? (
                                    booking.guide_driver
                                        .filter((bookDriver) => bookDriver.type === 'driver')
                                        .map((bookDriver, keyDriver) => (
                                            <div key={keyDriver} className="flex space-x-2">
                                                <LifeBuoy className="h-5 w-5 text-gray-400 dark:text-gray-500"/>
                                                <div>
                                                    <div>{bookDriver.person.name}</div>
                                                </div>
                                            </div>
                                        ))
                                ) : (
                                    <Alert message="No driver assigned"/>
                                )}
                            </div>
                            <div className="space-y-2">
                                {hasGuide ? (
                                    booking.guide_driver
                                        .filter((bookGuide) => bookGuide.type === 'guide')
                                        .map((bookGuide, keyGuide) => (
                                            <div key={keyGuide} className="flex space-x-2">
                                                <Backpack className="h-5 w-5 text-gray-400 dark:text-gray-500"/>
                                                <div>
                                                    <div>{bookGuide.person.name}</div>
                                                </div>
                                            </div>
                                        ))
                                ) : (
                                    <Alert message="No guide assigned"/>
                                )}
                            </div>

                            </div>
                        </div> */}

                        {/* <div>
                            <h3 className="font-medium mb-2 text-black">Financial Breakdown</h3>
                            <div className="flex items-center space-x-8 mb-2">
                            <div className="flex items-center space-x-2 text-blue-500">
                                <CreditCard className="w-4 h-4" />
                                <a href="#" onClick={(e) => {
                                    e.preventDefault()
                                    window.open(`http://127.0.0.1:8001/backoffice/invoice/download/${booking.id}`,'_blank')
                                    if(booking.book_add_on_total){
                                        window.open(`http://127.0.0.1:8001/backoffice/invoice/download/${booking.id}?addon=true`,'_blank')
                                    }
                                }} className="underline" title="View PDF Invoice">[PDF]</a>
                                <span>Invoice: {formatCurrency(booking.grand_total+booking.book_add_on_total)}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-600">
                                <Info className="w-4 h-4" />
                                <a href={booking.expense_file_internal} className="underline" title="View PDF Expenses">[EXCEL]</a>
                                <span>Expenses: {formatCurrency(booking.expense_internal_total)}</span>
                            </div>
                            </div>
                            <div className="flex items-center space-x-2 text-green-500">
                            <span>
                                Profit: {formatCurrency(booking.grand_total+booking.book_add_on_total-booking.expense_internal_total)}
                            </span>
                            </div>
                        </div> */}
                        <div>
                            <h3 className="font-medium mb-2 text-black">Payment History</h3>
                            <div className="relative overflow-x-auto mt-4">
                                <table className="w-full text-sm text-gray-500 dark:text-gray-400">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                        <tr>
                                            <th scope="col" className="text-left px-6 py-3 whitespace-nowrap">
                                                Date
                                            </th>
                                            <th scope="col" className="text-left px-6 py-3">
                                                Description
                                            </th>
                                            <th scope="col" className="text-left px-6 py-3">
                                                Payment Method
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right">
                                                Nominal
                                            </th>
                                            <th scope="col" className="px-6 py-3">
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {booking.booking_payment.map((item, index) => (
                                            <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                                <td className="px-6 py-4 align-top">
                                                    <div className="whitespace-nowrap">{format(item.created_at, 'dd MMM yyyy')}</div>
                                                    <div className="text-gray-400 text-xs">{format(item.created_at, 'HH:mm')}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {item.description}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {item.payment_method.name}
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium">
                                                    {formatCurrency(item.nominal)}
                                                </td>
                                                <td className="px-6 py-4 font-medium">
                                                    {
                                                        item.reference ? (
                                                            <a href={item.reference} target="_blank">
                                                                <button type="button" className="px-3 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                                                    <Eye className="h-4 w-4"/>
                                                                </button>
                                                            </a>
                                                        ) : '-'
                                                    }
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
                {/* <div className="pt-6">
                    <span className="font-bold">NOTE: {booking.note}</span>
                </div> */}
                </CardContent>
            </Card>
            );
        })}
        </div>
    </Main>
  );
};

export default Index;

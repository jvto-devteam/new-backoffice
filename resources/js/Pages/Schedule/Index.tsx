import Main from '@/Layouts/Main';
import React, {useState, useMemo, useEffect, useRef} from 'react';
import {router} from '@inertiajs/react';
import {format, parse, addDays} from 'date-fns';
import {
    ChevronDown, ChevronRight, Search, Calendar,
    Hotel, Car, DollarSign, AlertCircle, Package,
    Users, Clock, MapPin, LifeBuoy, Backpack
} from 'lucide-react';
import { Dialog } from '@headlessui/react';
import { 
    X as XIcon,
    UserCircle2, // untuk Client Information
    Info,        // untuk Booking Information 
    Route,       // untuk Activity
    ScrollText,  // untuk Itinerary     
} from 'lucide-react';

// Integrated Card Components
const Card = ({children, className = ''}) => (
    <div
        className={`bg-white/80 dark:bg-gray-800/90 backdrop-blur-lg rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg transition-all duration-300 hover:shadow-xl ${className}`}>
        {children}
    </div>
);

const GlassCard = ({children, className = '', glow = false}) => (
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

const CardHeader = ({className, children, ...props}) => (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>
        {children}
    </div>
);

const CardTitle = ({className, children, ...props}) => (
    <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props}>
        {children}
    </h3>
);

const CardContent = ({className, children, ...props}) => (
    <div className={`${className}`} {...props}>
        {children}
    </div>
);

// Sample package templates for auto-population
const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID').format(angka);
};
const Alert = ({message}) => (
    <div className="flex">
        <div
            className="flex items-center space-x-1 bg-[#DC3545] text-white px-1 py-0.5 rounded text-xs mb-1">
            <AlertCircle className="h-3 w-3"/>
            <span>{message}</span>
        </div>
    </div>
);
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
};
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
const BookingDetails = ({ isOpen, onClose, booking }) => {
    return (
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

            {/* Content - Now using cards */}
            <div className="p-6 space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">
                {/* Client Information Card */}
                <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <UserCircle2 className="h-5 w-5 mr-2 text-gray-500" />
                        Client Information
                    </h3>
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
                            value={
                                Object.entries(booking.booking_detail[0])
                                .filter(([key, value]) => ['xss', 'xxs', 'xs', 's', 'l', 'xl', 'xxl', 'xxxl'].includes(key) && value)
                                .map(([size, count]) => `${size.toUpperCase()} × ${count}`)
                                .join(', ')
                            } 
                        />
                        {booking.agent_id != 1 && (
                            <DetailField 
                                label="Voucher Code" 
                                value={booking.user.discount ? booking.user.discount.name : `${booking.user.name.toUpperCase().replace(' ','')}450`} 
                            />
                        )}
                    </div>
                </div>

                {/* Booking Information Card */}
                <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Info className="h-5 w-5 mr-2 text-gray-500" />
                        Booking Information
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <DetailField 
                            label="Duration" 
                            value={`${booking?.booking_detail?.[0]?.package?.duration?.day || booking?.package_duration || 0}D ${booking?.booking_detail?.[0]?.package?.duration?.night || (booking?.package_duration || 1) - 1}N`} 
                        />
                        <DetailField 
                            label="Travel Dates" 
                            value={`${format(booking?.travel_date_start, 'dd MMM yyyy')} - ${format(booking?.travel_date_end, 'dd MMM yyyy')}`} 
                        />
                        <DetailField 
                            label="Pickup" 
                            value={`${booking?.pickup === 'Terminal 2 Juanda International Airport' ? 'T2' : booking?.pickup} (${format(parse(booking?.pickup_time || '00:00:00', 'HH:mm:ss', new Date()), 'HH:mm')})`} 
                        />
                        <DetailField 
                            label="Drop" 
                            value={`${booking?.drop === 'Terminal 2 Juanda International Airport' ? 'T2' : booking?.drop} (${format(parse(booking?.drop_time || '00:00:00', 'HH:mm:ss', new Date()), 'HH:mm')})`} 
                        />
                        <DetailField 
                            label="Participants" 
                            value={`${booking?.total_pax || 0} PAX`} 
                        />
                        <DetailField 
                            label="Grand Total" 
                            value={formatCurrency(booking?.grand_total+booking?.book_add_on_total || 0)} 
                        />
                    </div>
                </div>

                {/* Itinerary Card */}
                <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <ScrollText className="h-5 w-5 mr-2 text-gray-500" />
                        Itinerary
                    </h3>
                    <div className="space-y-4">
                        {booking.booking_itinerary.map((item, idx) => (
                            <div key={idx} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <h4 className="font-medium mb-2 text-gray-600 dark:text-gray-300">Day {item.day}</h4>
                                <p className="text-sm text-blue-600 dark:text-blue-400 whitespace-pre-line">
                                    {item.itinerary}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Route className="h-5 w-5 mr-2 text-gray-500" />
                        Activity
                    </h3>
                    <div className="space-y-4">
                        {booking.booking_itinerary.map((item, idx) => (
                            item.activity_start.destination && (
                                <div key={idx} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                    <div className="flex items-center">
                                        <span className="font-medium text-gray-600 dark:text-gray-300 mr-2">Day {item.day}</span>
                                        <span className="text-blue-600 dark:text-blue-400">
                                            {item.activity_start.destination.name}
                                        </span>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>

                {/* Accommodation Card */}
                <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Hotel className="h-5 w-5 mr-2 text-gray-500" />
                        Accommodation
                    </h3>
                    <div className="space-y-4">
                        {booking.booking_itinerary.map((item, idx) => (
                            item.book_hotel.length > 0 && (
                                <div key={idx} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                    <h4 className="font-medium mb-2 text-gray-600 dark:text-gray-300">
                                        Day {item.day} - {format(addDays(booking.travel_date_start, item.day - 1), 'dd MMM yyyy')}
                                    </h4>
                                    <p className="text-blue-600 dark:text-blue-400">{item.book_hotel[0].hotel.name}</p>
                                    <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                                        {item.book_hotel[0].book_room.map((room, i) => (
                                            `${room.room_hotel.room_name} × ${room.quantity}`
                                        )).join(', ')}
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>

                {/* Resource Card */}
                <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <Users className="h-5 w-5 mr-2 text-gray-500" />
                        Resource & Allocations
                    </h3>

                    {/* Transportation */}
                    <div className="mb-6">
                        <h4 className="text-md font-medium text-gray-600 dark:text-gray-300 mb-3">Transportation</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            {booking.book_car?.map((car, idx) => (
                                <div key={idx} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                    <div className="flex items-center">
                                        <Car className="h-5 w-5 text-gray-400 mr-2" />
                                        <span className="text-blue-600 dark:text-blue-400">{car.car.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Crew */}
                    <div>
                        <h4 className="text-md font-medium text-gray-600 dark:text-gray-300 mb-3">Crew Assignment</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            {booking.guide_driver
                                .filter(gd => gd.type === 'driver')
                                .map((driver, idx) => (
                                    <div key={idx} className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                        <div className="flex items-center">
                                            <LifeBuoy className="h-5 w-5 text-gray-400 mr-2" />
                                            <div>
                                                <p className="text-blue-600 dark:text-blue-400">{driver.person.name}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">Driver</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            {booking.guide_driver
                                .filter(gd => gd.type === 'guide')
                                .map((guide, idx) => (
                                    <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="flex items-center">
                                            <Backpack className="h-5 w-5 text-gray-400 mr-2" />
                                            <div>
                                                <p className="text-blue-600 dark:text-blue-400">{guide.person.name}</p>
                                                <p className="text-sm text-gray-600 dark:text-gray-300">Guide</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
                {/* Finance Card */}
                <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                        <DollarSign className="h-5 w-5 mr-2 text-gray-500" />
                        Finance
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <DetailField label="Invoice Total" value={formatCurrency(booking.grand_total+booking.book_add_on_total)} />
                        {booking.agent_id != 1 && (
                            <>
                                <DetailField label="Payment Received" value={formatCurrency(booking.payment)} />
                                <DetailField label="Balance" value={formatCurrency(booking.grand_total+booking.book_add_on_total-booking.payment)} />
                            </>
                        )}
                        <DetailField label="Expenses" value={booking.expense_internal_total ? formatCurrency(booking.expense_internal_total) : '-'} />
                    </div>
                    {booking.agent_id == 2 && booking.booking_category_id != 3 && (
                        <div className="mt-6">
                            <h4 className="text-md font-medium mb-3">Payment History</h4>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
                                {/* Payment history table */}
                            </div>
                        </div>
                    )}
                </div>

            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    );
};
const BookingRow = ({no, booking, isExpanded, onToggle}) => {

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
    const source = booking.agent_id == 2 && booking.booking_category_id == 3 ? 'KLOOK' : booking.agent.name

    const hasCar = booking.book_car && booking.book_car.length > 0;
    const hasDriver = booking.guide_driver && booking.guide_driver.some(gd => gd.type === 'driver');
    const hasGuide = booking.guide_driver && booking.guide_driver.some(gd => gd.type === 'guide');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showDetails, setShowDetails] = useState(false);    
    const dropdownRef = useRef(null);

    // Handle outside clicks
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <>
            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b dark:border-gray-700"
                onClick={onToggle}>
                <td className="align-top px-4 py-3 text-sm whitespace-nowrap">
                    <div className="flex items-center">
                        {isExpanded ? <ChevronDown className="h-4 w-4 mr-2"/> :
                            <ChevronRight className="h-4 w-4 mr-2"/>}
                        {no}
                    </div>
                </td>
                <td className="align-top px-4 py-3 text-sm whitespace-nowrap">
                    <div className="flex items-center mt-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-bold rounded ${getSourceColor(source)}`}>{source}-{booking.id}</span>
                    </div>
                </td>
                {/* <td className="align-top px-4 py-3 text-sm whitespace-nowrap">
                    {
                        booking.booking_detail[0].package_id ? (
                            <span className="inline-flex px-2 py-1 text-xs font-bold rounded bg-meta-3 hover:bg-opacity-90 text-white mt-2">
                                {booking.booking_detail[0].package_id}
                            </span>          
                        ) : "-"
                    }
                </td> */}
                <td className="align-top px-4 py-3 space-y-1">
                    <div className="font-medium">{booking.user.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {booking.booking_detail[0].package ? `${booking.booking_detail[0].package.duration.day}D ${booking.booking_detail[0].package.duration.night}N` : `${booking.package_duration}D ${booking.package_duration - 1}N`} / {booking.total_pax} PAX
                    </div>
                </td>
                <td className="align-top px-4 py-3 text-sm whitespace-nowrap space-y-1">
                    <div
                        className="font-medium">{format(booking.travel_date_start, 'dd-MMM')} - {format(booking.travel_date_end, 'dd-MMM')}</div>
                    <div
                        className="text-gray-500 dark:text-gray-400">{format(booking.travel_date_start, 'E')} - {format(booking.travel_date_end, 'E')}</div>
                </td>
                <td className="align-top px-4 py-3 space-y-1">
                    <div className="flex space-x-2">
                        <div>
                            <MapPin className="mt-1 h-3.5 w-3.5 text-gray-400 dark:text-gray-500"/>
                        </div>
                        <span className="text-sm">{booking.pickup == 'Terminal 2 Juanda International Airport' ? 'T2' : booking.pickup}</span>
                    </div>
                    <div className="flex space-x-2">
                        {booking.pickup_time ? (
                            <>
                                <div>
                                    <Clock className="mt-1 h-3.5 w-3.5 text-gray-400 dark:text-gray-500"/>
                                </div>
                                <span className="text-sm">
                                    {format(parse(booking.pickup_time, 'HH:mm:ss', new Date()), 'HH:mm')}
                                </span>
                            </>
                        ) : ''}
                    </div>
                </td>
                <td className="py-3 align-top space-y-1">
                    {booking.booking_itinerary.map((data,index) => {
                        return data.activity_start.destination ? (
                            <div key={index} className="text-sm">
                                #{data.day} {data.activity_start.destination.name}
                            </div>
                        ) : ''
                    })}
                </td>
                <td className="align-top px-4 py-3 text-sm whitespace-nowrap space-y-1">
                    {booking.booking_detail[0].xss ? (
                        <div className="mr-2">XSS x {booking.booking_detail[0].xss}</div>) : ''}
                    {booking.booking_detail[0].xxs ? (
                        <div className="mr-2">XXS x {booking.booking_detail[0].xxs}</div>) : ''}
                    {booking.booking_detail[0].xs ? (
                        <div className="mr-2">XS x {booking.booking_detail[0].xs}</div>) : ''}
                    {booking.booking_detail[0].s ? (
                        <div className="mr-2">S x {booking.booking_detail[0].s}</div>) : ''}
                    {booking.booking_detail[0].l ? (
                        <div className="mr-2">L x {booking.booking_detail[0].l}</div>) : ''}
                    {booking.booking_detail[0].xl ? (
                        <div className="mr-2">XL x {booking.booking_detail[0].xl}</div>) : ''}
                    {booking.booking_detail[0].xxl ? (
                        <div className="mr-2">XXL x {booking.booking_detail[0].xxl}</div>) : ''}
                    {booking.booking_detail[0].xxxl ? (
                        <div className="mr-2">XXXL x {booking.booking_detail[0].xxxl}</div>) : ''}

                </td>
                <td className="align-top px-4 py-3 space-y-1">
                    <div className="flex space-x-2">
                        <div>
                            <MapPin className="mt-1 h-3.5 w-3.5 text-gray-400 dark:text-gray-500"/>
                        </div>
                        <span className='text-sm'>{booking.drop == 'Terminal 2 Juanda International Airport' ? 'T2' : booking.drop}</span>
                    </div>
                    <div className="flex space-x-2">
                        {booking.drop_time ? (
                            <>
                                <div>
                                    <Clock className="mt-1 h-3.5 w-3.5 text-gray-400 dark:text-gray-500"/>
                                </div>
                                <span className='text-sm'>
                                    {format(parse(booking.drop_time, 'HH:mm:ss', new Date()), 'HH:mm')}
                                </span>
                            </>
                        ) : ''}
                    </div>
                </td>
                <td className="align-top px-4 py-3 whitespace-nowrap space-y-1">
                    <div>
                        {hasCar ? (
                            booking.book_car.map((bookCar, key) => (
                                <div key={key} className="flex space-x-2">
                                    <Car className="h-4 w-4 text-gray-400 dark:text-gray-500"/>
                                    <div>
                                        <div className="text-sm font-medium">{bookCar.car.name}</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <Alert message="No car assigned"/>
                        )}
                    </div>
                    <div>
                        {hasDriver ? (
                            booking.guide_driver
                                .filter((bookDriver) => bookDriver.type === 'driver')
                                .map((bookDriver, keyDriver) => (
                                    <div key={keyDriver} className="flex space-x-2">
                                        <LifeBuoy className="h-4 w-4 text-gray-400 dark:text-gray-500"/>
                                        <div>
                                            <div className="text-sm font-medium">{bookDriver.person.name}</div>
                                        </div>
                                    </div>
                                ))
                        ) : (
                            <Alert message="No driver assigned"/>
                        )}
                    </div>
                    <div>
                        {hasGuide ? (
                            booking.guide_driver
                                .filter((bookGuide) => bookGuide.type === 'guide')
                                .map((bookGuide, keyGuide) => (
                                    <div key={keyGuide} className="flex space-x-2">
                                        <Backpack className="h-4 w-4 text-gray-400 dark:text-gray-500"/>
                                        <div>
                                            <div className="text-sm font-medium">{bookGuide.person.name}</div>
                                        </div>
                                    </div>
                                ))
                        ) : (
                            <Alert message="No guide assigned"/>
                        )}
                    </div>
                </td>
                <td className="align-top px-4 py-3 relative">
                    <div className="relative" ref={dropdownRef}>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsDropdownOpen(!isDropdownOpen);
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors duration-150"
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-5 w-5 text-gray-500" 
                                viewBox="0 0 20 20" 
                                fill="currentColor"
                            >
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                        </button>

                        {isDropdownOpen && (
                        <div 
                            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 py-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button 
                            onClick={() => {
                                setIsDropdownOpen(false);
                                setShowDetails(true);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                            >
                            Detail
                            </button>
                            <a 
                            href={`/bookings/${booking.id}/edit`}
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                            >
                            Edit
                            </a>
                        </div>
                        )}   
                        <BookingDetails 
                        isOpen={showDetails} 
                        onClose={() => setShowDetails(false)}
                        booking={booking}
                        />                                             
                    </div>
                </td>
            </tr>
            {isExpanded && (
                <tr>
                    <td colSpan="10" className="bg-gray-50 dark:bg-gray-800 px-4 py-4">
                        <div className="grid grid-cols-3 gap-6">
                            <div>
                                <h4 className="font-medium mb-2 flex items-center">
                                    <Package className="h-4 w-4 mr-2"/>
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
                                    <Hotel className="h-4 w-4 mr-2"/>
                                    Accommodation Details
                                </h4>
                                <div className="space-y-2 text-sm">
                                    {booking.booking_itinerary.map((item, idx) => (
                                        item.book_hotel.length !== 0 ? (
                                            <div key={idx} className="text-sm">
                                                <div className="font-medium">Check In
                                                    : {format(addDays(booking.travel_date_start, item.day - 1), 'dd-MMM')}</div>
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
                                        ) : ''
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2 flex items-center">
                                    <DollarSign className="h-4 w-4 mr-2"/>
                                    Financial Breakdown
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="font-medium">Invoice Total:</span> IDR {formatRupiah(booking.grand_total+booking.book_add_on_total)}
                                    </div>
                                    <div>
                                        <span className="font-medium">Expenses:</span> 
                                        <span className=" text-blue-400 underline">
                                            <a href={booking.expense_file_internal} target="_blank">
                                                IDR {formatRupiah(booking.expense_internal_total)}
                                            </a>
                                        </span>
                                    </div>
                                <div>
                                <span className="font-medium">Profit:</span> IDR {formatRupiah((booking.grand_total+booking.book_add_on_total) - booking.expense_internal_total)}
                            </div>
                            {
                                booking.agent_id == 2 && booking.booking_category_id != 3 ? (
                                    <>
                                        <div>
                                            <span className="font-medium">Deposit:</span> IDR {formatRupiah(booking.payment)}
                                        </div>
                                        <div>
                                            <span className="font-medium">Balance:</span> IDR {formatRupiah((booking.grand_total+booking.book_add_on_total)-booking.payment)}
                                        </div>
                                        <div>
                                            <span className="font-medium">Payment Method:</span> {booking.outstanding_payment_method ? booking.outstanding_payment_method.toUpperCase() : ''}
                                        </div>
                                    </>
                                ) : ''
                            }

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
)
;
}
;

const DashboardFilters = ({filter}) => {
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
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">        
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Date</label>
                    <div className="flex">
                        <div>
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
                        </div>
                        <div>
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
            <div className="flex items-end">
                <a 
                    href="/bookings/create" 
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
                </a>
            </div>        
        </div>        
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
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Booking
                                        ID
                                    </th>
                                    {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Package ID
                                    </th> */}
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Guest
                                        & Package
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Pick
                                        Up
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Activity
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">T-Shirt
                                        Size
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Drop</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Resource
                                        Allocation
                                    </th>
                                    <th></th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {data.booking.map((booking, key) => (
                                    <BookingRow
                                        key={key}
                                        no={key + 1}
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

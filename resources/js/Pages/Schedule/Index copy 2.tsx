import Main from '@/Layouts/Main';
import { router } from '@inertiajs/react'
import React, { useState,useRef,useEffect,useMemo } from 'react';
import { format,addDays } from 'date-fns';
import {Link} from '@inertiajs/react';
import Swal, {Toast} from '@/utils/swal';
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
  AlertCircle,
  Clock,Ticket,
  MoreVertical,X
} from 'lucide-react';
import { Button } from "@/components/ui/button";

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
const DateRangeSelector = ({ startDate, endDate, onChange }) => {
  // Helper function to format dates for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="flex flex-col space-y-2">
      <label className="text-sm font-medium text-gray-700">Date Range</label>
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onChange(e.target.value, endDate)}
            className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <span className="text-gray-500">—</span>
        
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onChange(startDate, e.target.value)}
            className="block w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div className="text-xs text-gray-500">
        Selected: {formatDate(startDate)} - {formatDate(endDate)}
      </div>
    </div>
  );
};

// Helper function to format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

  export default function Index({data}) {
    // Local state
    const [bookings, setBookings] = useState(data.booking);  
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedChannel, setSelectedChannel] = useState('');
    const [pickupFilter, setPickupFilter] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [startDate, setStartDate] = useState('2025-02-01');
    const [endDate, setEndDate] = useState('2025-02-28');
  
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
        const bookingStart = b.date.start_ymd;
        const bookingEnd = new Date(b.date.end);
        const filterStart = startDate;
        const filterEnd = endDate;
        const isWithinRange = bookingStart >= filterStart && bookingStart <= filterEnd;
        
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
          b.dropoff.drop_point?.toLowerCase()
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
    const [selectedBooking, setSelectedBooking] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState(null);
    const [modalPlottingData, setModalPlottingData] = useState(null); 

    const CustomMultiSelect = ({ 
      options, 
      value = [], 
      onChange,
      placeholder = "Select..." 
  }) => {
      const [isOpen, setIsOpen] = useState(false);
      const [search, setSearch] = useState('');
      const dropdownRef = useRef(null);
      const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });
  
      useEffect(() => {
          const handleClickOutside = (event) => {
              if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                  setIsOpen(false);
              }
          };
  
          document.addEventListener('mousedown', handleClickOutside);
          return () => document.removeEventListener('mousedown', handleClickOutside);
      }, []);
  
      const showTooltip = (e, scheduleInfo) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setTooltip({
              show: true,
              text: scheduleInfo,
              x: rect.left + (rect.width / 2),
              y: rect.top - 10
          });
      };
  
      const hideTooltip = () => {
          setTooltip({ show: false, text: '', x: 0, y: 0 });
      };
  
      const filteredOptions = options.filter(option => 
          option.label.toLowerCase().includes(search.toLowerCase())
      );
  
      const toggleOption = (option) => {
          if (option.disabled) return;
          
          const isSelected = value.find(item => item.value === option.value);
          if (isSelected) {
              onChange(value.filter(item => item.value !== option.value));
          } else {
              onChange([...value, option]);
          }
      };
  
      const removeOption = (optionToRemove) => {
          onChange(value.filter(option => option.value !== optionToRemove.value));
      };
      
  
      return (
          <>
              {/* Fixed position tooltip */}
              {tooltip.show && (
                  <div 
                      style={{
                          position: 'fixed',
                          left: `${tooltip.x}px`,
                          top: `${tooltip.y}px`,
                          transform: 'translate(-50%, -100%)',
                          zIndex: 1000
                      }}
                      className="px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap shadow-lg"
                  >
                      {tooltip.text}
                      <div 
                          className="border-solid border-4 border-transparent border-t-gray-900"
                          style={{
                              position: 'absolute',
                              bottom: '-8px',
                              left: '50%',
                              transform: 'translateX(-50%)'
                          }}
                      />
                  </div>
              )}
  
              <div className="relative" ref={dropdownRef}>
                  {/* Selected items display */}
                  <div 
                      className="min-h-[38px] p-1 border rounded-md bg-white flex flex-wrap gap-1 cursor-pointer"
                      onClick={() => setIsOpen(!isOpen)}
                  >
                      {value.length === 0 && (
                          <span className="p-1 text-gray-500">{placeholder}</span>
                      )}
                      {value.map(item => (
                          <span 
                              key={item.value} 
                              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md flex items-center gap-1 text-sm"
                          >
                              {item.label}
                              <button
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      removeOption(item);
                                  }}
                                  className="hover:text-blue-600"
                              >
                                  ×
                              </button>
                          </span>
                      ))}
                  </div>
  
                  {/* Dropdown */}
                  {isOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                          {/* Search input */}
                          <div className="p-2 border-b">
                              <input
                                  type="text"
                                  className="w-full px-2 py-1 border rounded-md"
                                  placeholder="Search..."
                                  value={search}
                                  onChange={(e) => setSearch(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                              />
                          </div>
  
                          {/* Options list */}
                          <div className="max-h-48 overflow-y-auto">
                              {filteredOptions.length === 0 ? (
                                  <div className="p-2 text-gray-500 text-center">No options found</div>
                              ) : (
                                  filteredOptions.map(option => (
                                      <div
                                          key={option.value}
                                          className={`p-2 flex items-center gap-2 
                                              ${option.disabled 
                                                  ? 'bg-gray-50 cursor-not-allowed text-gray-400' 
                                                  : 'cursor-pointer hover:bg-gray-100'}
                                              ${value.find(item => item.value === option.value) ? 'bg-gray-50' : ''}`}
                                          onClick={() => toggleOption(option)}
                                      >
                                          <input
                                              type="checkbox"
                                              checked={value.some(item => item.value === option.value)}
                                              disabled={option.disabled}
                                              onChange={() => {}}
                                              className="h-4 w-4"
                                          />
                                          <span className="flex-1">{option.label}</span>
                                          {option.disabled && (
                                              <div 
                                                  onMouseEnter={(e) => showTooltip(e, option.scheduleInfo)}
                                                  onMouseLeave={hideTooltip}
                                              >
                                                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                                              </div>
                                          )}
                                      </div>
                                  ))
                              )}
                          </div>
                      </div>
                  )}
              </div>
          </>
      );
  };

    const DetailsModal = ({ isOpen, onClose, booking, plottingData }) => {
      // Set default values based on booking data      
      const defaultVehicles = useMemo(() => {
          return booking?.vehicles?.map(vehicleName => {
              const vehicle = plottingData?.car?.find(v => v.name === vehicleName);
              return vehicle ? {
                  value: vehicle.id,
                  label: vehicle.name
              } : null;
          }).filter(Boolean) || [];
      }, [booking?.vehicles, plottingData?.car]);
  
      const defaultDrivers = useMemo(() => {
          return booking?.drivers?.map(driverName => {
              const driver = plottingData?.driver?.find(d => d.name === driverName);
              return driver ? {
                  value: driver.id,
                  label: driver.name
              } : null;
          }).filter(Boolean) || [];
      }, [booking?.drivers, plottingData?.driver]);
  
      // Split guides by type
      const defaultGuides = useMemo(() => {
          const escortGuides = [];
          const ijenGuides = [];
          
          booking?.guides?.forEach(bookingGuide => {
              const guide = plottingData?.guide?.find(g => g.name === bookingGuide.name);
              if (guide) {
                  const guideOption = {
                      value: guide.id,
                      label: guide.name
                  };
                  
                  if (bookingGuide.type === 'Escort') {
                      escortGuides.push(guideOption);
                  } else if (bookingGuide.type === 'Ijen') {
                      ijenGuides.push(guideOption);
                  }
              }
          });
  
          return { escortGuides, ijenGuides };
      }, [booking?.guides, plottingData?.guide]);
  
      const [vehicles, setVehicles] = useState(defaultVehicles);
      const [drivers, setDrivers] = useState(defaultDrivers);
      const [escortGuides, setEscortGuides] = useState(defaultGuides.escortGuides);
      const [ijenGuides, setIjenGuides] = useState(defaultGuides.ijenGuides);
      const [notes, setNotes] = useState(booking?.notes || '');  
      // Transform API data into options format with IDs
      const vehicleOptions = useMemo(() => {
        return plottingData?.car?.map(vehicle => {
            // Always enable Hiace (id: 5) and Premio (id: 21)
            const alwaysEnabled = [5, 21].includes(vehicle.id);
            
            return {
                value: vehicle.id,
                label: vehicle.name,
                // Only disable if it's not in the alwaysEnabled list and status is 'Tidak Tersedia'
                disabled: !alwaysEnabled && vehicle.status === 'Tidak Tersedia',
                scheduleInfo: vehicle.schedule_info
            };
        }) || [];
    }, [plottingData?.car]);
    
    const driverOptions = useMemo(() => {
      return plottingData?.driver?.map(driver => {
          // Always enable GARAGE (id: 9)
          const alwaysEnabled = driver.id === 9;
          
          return {
              value: driver.id,
              label: driver.name,
              // Only disable if it's not GARAGE and status is 'Tidak Tersedia'
              disabled: !alwaysEnabled && driver.status === 'Tidak Tersedia',
              scheduleInfo: driver.schedule_info
          };
      }) || [];
  }, [plottingData?.driver]);

  const escortGuideOptions = useMemo(() => {
    return plottingData?.guide
        ?.filter(guide => guide.id !== 56)  // Still exclude Local Ijen from escort
        .map(guide => ({
            value: guide.id,
            label: guide.name,
            disabled: guide.status === 'Tidak Tersedia' || !guide.dynamic_roles?.includes('Escort'),
            scheduleInfo: guide.status === 'Tidak Tersedia' 
                ? guide.schedule_info 
                : !guide.dynamic_roles?.includes('Escort')
                ? 'Hanya tersedia untuk Ijen'
                : undefined
        })) || [];
  }, [plottingData?.guide]);

  const ijenGuideOptions = useMemo(() => {
      return plottingData?.guide
          ?.map(guide => ({
              value: guide.id,
              label: guide.name,
              disabled: guide.status === 'Tidak Tersedia' || !guide.dynamic_roles?.includes('Ijen'),
              scheduleInfo: guide.status === 'Tidak Tersedia' 
                  ? guide.schedule_info 
                  : !guide.dynamic_roles?.includes('Ijen')
                  ? 'Hanya tersedia untuk Escort'
                  : undefined
          })) || [];
  }, [plottingData?.guide]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setApiError(null);

        const paramData = {
            booking_id: booking.booking_id,
            vehicles: vehicles.map(v => v.value),
            drivers: drivers.map(d => d.value),
            escortGuides: escortGuides.map(g => g.value),
            ijenGuides: ijenGuides.map(g => g.value),
            notes: notes
        };

        // Use Inertia to make the POST request
        router.post('/plotting', paramData, {
            onSuccess: (page) => {
                setIsLoading(false);
                setIsModalOpen(false);
                
                if (page.props.flash.message) {
                    // Update the booking data in the parent component
                    const updatedBookings = bookings.map(b => {
                        if (b.booking_id === booking.booking_id) {
                            return {
                                ...b,
                                vehicles: vehicles.map(v => v.label),
                                drivers: drivers.map(d => d.label),
                                guides: [
                                    ...escortGuides.map(g => ({ type: 'Escort', name: g.label })),
                                    ...ijenGuides.map(g => ({ type: 'Ijen', name: g.label }))
                                ],
                                notes: notes
                            };
                        }
                        return b;
                    });

                    // Update state
                    setBookings(updatedBookings);

                    Toast.fire({
                        icon: 'success',
                        title: 'Crew and vehicle assigned successfully'
                    });
                }
            },
            onError: (errors) => {
                setIsLoading(false);
                setApiError(errors);
                
                Swal.fire({
                    title: 'Error!',
                    text: errors.error || 'Failed to assign crew and vehicle',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#d33'
                });
            },
            preserveScroll: true
        });
    };
  
      if (!isOpen) return null;
  
      return (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                  <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Assign Crew & Vehicle</h3>
                      <button 
                          onClick={onClose}
                          className="text-gray-500 hover:text-gray-700"
                      >
                          ×
                      </button>
                  </div>
  
                  <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Vehicle Selection */}
                      <div className="space-y-2">
                          <label className="block text-sm font-medium">
                              Vehicles:
                          </label>
                          <CustomMultiSelect
                              options={vehicleOptions}
                              value={vehicles}
                              onChange={setVehicles}
                              placeholder="Select vehicles..."
                          />
                      </div>
  
                      {/* Driver Selection */}
                      <div className="space-y-2">
                          <label className="block text-sm font-medium">
                              Drivers:
                          </label>
                          <CustomMultiSelect
                              options={driverOptions}
                              value={drivers}
                              onChange={setDrivers}
                              placeholder="Select drivers..."
                          />
                      </div>
  
                      {/* Escort Guide Selection */}
                      <div className="space-y-2">
                          <label className="block text-sm font-medium">
                              Escort Guides (Optional):
                          </label>
                          <CustomMultiSelect
                              options={escortGuideOptions}
                              value={escortGuides}
                              onChange={setEscortGuides}
                              placeholder="Select escort guides..."
                          />
                      </div>
  
                      {/* Ijen Guide Selection */}
                      <div className="space-y-2">
                          <label className="block text-sm font-medium">
                              Ijen Guides (Optional):
                          </label>
                          <CustomMultiSelect
                              options={ijenGuideOptions}
                              value={ijenGuides}
                              onChange={setIjenGuides}
                              placeholder="Select ijen guides..."
                          />
                      </div>
  
                      {/* Special Notes */}
                      <div className="space-y-2">
                          <label className="block text-sm font-medium">
                              Notes:
                          </label>
                          <textarea 
                              className="w-full border border-gray-300 rounded-md p-2 h-24"
                              placeholder="Enter any special notes..."
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                          />
                      </div>
  
                      {/* Action Buttons */}
                      <div className="flex space-x-3 pt-4">
                          <button
                              type="button"
                              onClick={onClose}
                              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                          >
                              Cancel
                          </button>
                          <button
                                type="submit"
                                disabled={isLoading}
                                className={`flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                            >
                                {isLoading ? (
                                    <>
                                        <svg 
                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            fill="none" 
                                            viewBox="0 0 24 24"
                                        >
                                            <circle 
                                                className="opacity-25" 
                                                cx="12" 
                                                cy="12" 
                                                r="10" 
                                                stroke="currentColor" 
                                                strokeWidth="4"
                                            ></circle>
                                            <path 
                                                className="opacity-75" 
                                                fill="currentColor" 
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    'Save'
                                )}
                            </button>
                      </div>
                  </form>
              </div>
          </div>
      );
  };
    const handleMoreVerticalClick = async (booking) => {
        try {        
            setIsLoading(true);
            setApiError(null);
            
            // Format the URL with query parameters
            const url = `https://legacy.javavolcano-touroperator.com/backoffice/plotting/get-plotting?id=${booking.booking_id}&order_channel=${booking.orderChannel.toLowerCase()}`;
            
            // Make the GET request
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'Origin': `https://new-backoffice.javavolcano-touroperator.com`
                },
                mode: 'cors'
            });
    
            if (!response.ok) {
                throw new Error('Failed to fetch booking details');
            }
    
            const plottingData = await response.json();
            
            // After successful API call, open the modal with the plotting data
            openDetailsModal(booking, plottingData);
            
        } catch (error) {
            console.error('Error fetching booking details:', error);
            setApiError(error.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Update the openDetailsModal function
    const openDetailsModal = (booking, plottingData) => {
        setSelectedBooking(booking);
        setModalPlottingData(plottingData);
        setIsModalOpen(true);
    };  
    const BookingDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const options = [
        { label: 'JVTO', href: '/bookings/add-booking/jvto' },
        { label: 'KLOOK', href: '/bookings/add-booking/klook' },
        { label: 'TWT', href: '/bookings/add-booking/twt' }
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
            className="px-4 py-2 bg-black text-white rounded hover:opacity-90 flex items-center gap-3"
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
                <Link
                key={option.label}
                href={option.href}
                className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                >
                {option.label}
                </Link>
            ))}
            </div>
        )}
        </div>
    );
    };


    return (
        <Main>
            <div className="w-full mx-auto">
                {/* Gradient header area (like the MS Rewards style) */}
                <div className="bg-gradient-to-r from-blue-200 via-blue-50 to-blue-200 p-6 flex items-center justify-between">
                    <div>
                    <h1 className="text-2xl font-bold mb-1">Booking</h1>
                    <div className="text-sm text-gray-700">Booking Overview</div>
                    </div>
                    <div className="text-right">
                    {/* <div className="text-sm text-gray-600">
                        Total Value: {formatCurrency(bookings.reduce((sum, b) => sum + b.financial.invoice.total, 0))}
                    </div>
                    <div className="text-xs text-gray-600">
                        Total Profit: {formatCurrency(bookings.reduce((sum, b) => sum + b.financial.profit, 0))}
                    </div> */}
                    </div>
                </div>
            
                {/* Hero or Banner Section */}
                <div className="bg-white p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <BookingDropdown/>
                    <div className="mt-4 md:mt-0">
                        <img
                        src="https://legacy.javavolcano-touroperator.com/assets/img/download.png"
                        alt="Venice"
                        width="100"
                        className="rounded-lg"
                        />
                    </div>
                    </div>
                </div>
            
                {/* Filter Bar */}
                <div className="bg-white p-4 shadow rounded-md mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
                    <div className="flex flex-col border p-3 rounded  min-w-[280px]">
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
            <div className="bg-white shadow rounded-md p-4 mb-8 overflow-x-auto">
                <table className="min-w-full text-left text-sm text-gray-700">
                <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
                    <tr>
                    <th className="py-3 px-4 min-w-15">#</th>
                    <th className="py-3 px-4 min-w-35">Date</th>
                    <th className="py-3 px-4 min-w-35">Guest & Pax</th>
                    <th className="py-3 px-4 min-w-45">Pickup</th>
                    <th className="py-3 px-4 min-w-45">Drop-off</th>
                    <th className="py-3 px-4 min-w-50">Vehicle & Crew</th>
                    <th className="py-3 px-4 min-w-50">Financial</th>
                    <th className="py-3 px-4 min-w-40 md:min-w-1">Notes</th>
                    <th className="py-3 px-4"></th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBookings.map((booking, index) => {
                    const isExpanded = expandedBookingId === booking.id;

                    const [openDropdownId, setOpenDropdownId] = useState(null);
                    const dropdownRefs = useRef({});
                    
                    // Keep the existing useEffect for handling outside clicks
                    useEffect(() => {
                        const handleClickOutside = (event) => {
                            if (openDropdownId && dropdownRefs.current[openDropdownId] && 
                                !dropdownRefs.current[openDropdownId].contains(event.target)) {
                                setOpenDropdownId(null);
                            }
                        };
                    
                        if (openDropdownId) {
                            document.addEventListener('mousedown', handleClickOutside);
                            return () => document.removeEventListener('mousedown', handleClickOutside);
                        }
                    }, [openDropdownId]);                    

                    return (
                        <React.Fragment key={booking.id}>
                        <tr className="border-b">
                            {/* Expand/Collapse Button + Row Index */}
                            <td className="py-3 px-2 align-top">
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
                            <div className="text-blue-600 font-bold">{format(booking.date.start, 'dd MMM')} - {format(booking.date.end, 'dd MMM')}</div>
                            <div className="text-xs text-gray-400">{booking.date.days}</div>
                            </td>

                            {/* Guest & Package */}
                            <td className="py-3 px-4 align-top space-y-1">
                            <div>
                                <Link href={`bookings/edit-booking/${booking.booking_id}`}>
                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full 
                                    ${booking.orderChannel === 'JVTO' ? 'bg-blue-100 text-blue-800' :
                                        booking.orderChannel === 'TWT' ? 'bg-yellow-100 text-yellow-800' :
                                        booking.orderChannel === 'KLOOK' ? 'bg-green-100 text-green-800' :
                                        'bg-gray-100 text-gray-800'}`}>
                                    {booking.id}
                                    </span>
                                </Link>
                            </div>
                            {booking.orderChannel != 'TWT' ? (
                              <div className="font-medium underline">
                                <a target="_blank" href={`/client-management/details/${booking.guest_id}`}>
                                  {booking.guest}
                                </a>
                              </div>
                            ) : (
                              <div className="font-medium">
                                  {booking.guest}
                              </div>
                            )}
                            <div className="text-xs text-gray-500">{booking.duration} / {booking.total_pax} PAX</div>
                            </td>

                            {/* Pickup Details */}
                            <td className="py-3 px-4 align-top space-y-2">
                                <div className="flex">
                                    {booking.pickup.meeting_point === "Surabaya Airport" ? (
                                      booking.pickup.meeting_point_arrival ? (
                                        <>
                                          <div>
                                              <Plane className="inline-block w-4 h-4 mr-1" />
                                          </div>
                                          <div>{booking.pickup.meeting_point_arrival}</div>
                                        </>
                                      ) : (
                                      <span className="flex items-center text-red-500">
                                          <AlertCircle className="w-4 h-4 mr-1" />
                                          No pickup location
                                      </span>
                                      )
                                      ) : booking.pickup.meeting_point === "Surabaya Train Station" ? (
                                        booking.pickup.meeting_point ? (
                                          <>
                                            <div>
                                                <Train className="inline-block w-4 h-4 mr-1" />
                                            </div>
                                            <div>{booking.pickup.meeting_point_arrival}</div>
                                          </>
                                        ) : (
                                          <span className="flex items-center text-red-500">
                                              <AlertCircle className="w-4 h-4 mr-1" />
                                              No pickup location
                                          </span>
                                        )
                                    ) : ""}
                                </div>
                                <div className="flex">
                                    {booking.pickup.meeting_point === "Surabaya Airport" ? (
                                        <div>
                                            <Ticket className="inline-block w-4 h-4 mr-1" />
                                        </div>
                                    ) : booking.pickup.meeting_point === "Surabaya Hotel" ? (
                                        <div>
                                            <Hotel className="inline-block w-4 h-4 mr-1" />
                                        </div>
                                    ) : booking.pickup.meeting_point === "Surabaya Train Station" ? (
                                        <div>
                                            <Ticket className="inline-block w-4 h-4 mr-1" />
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
                                <div className="text-xs">
                                    {booking.pickup.pickup_time ? (
                                    <div className="flex"><Clock className="w-4 h-4 mr-1" /> <span className="text-gray-500"> {booking.pickup.pickup_time}</span></div>
                                    ) : (
                                    <span className="flex items-center text-red-500">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        No pickup time
                                    </span>
                                    )}
                                </div>
                                </td>

                            {/* Drop-off Details */}
                            <td className="py-3 px-4 align-top space-y-2">
                            <div className="flex">
                                    {booking.dropoff.drop_point === "Surabaya Airport" ? (
                                      booking.dropoff.drop_point_arrival ? (
                                        <>
                                          <div>
                                              <Plane className="inline-block w-4 h-4 mr-1" />
                                          </div>
                                          <div>{booking.dropoff.drop_point_arrival}</div>
                                        </>
                                      ) : (
                                      <span className="flex items-center text-red-500">
                                          <AlertCircle className="w-4 h-4 mr-1" />
                                          No dropoff location
                                      </span>
                                      )
                                      ) : booking.dropoff.drop_point === "Surabaya Train Station" ? (
                                        booking.dropoff.drop_point ? (
                                          <>
                                            <div>
                                                <Train className="inline-block w-4 h-4 mr-1" />
                                            </div>
                                            <div>{booking.dropoff.drop_point_arrival}</div>
                                          </>
                                        ) : (
                                          <span className="flex items-center text-red-500">
                                              <AlertCircle className="w-4 h-4 mr-1" />
                                              No dropoff location
                                          </span>
                                        )
                                    ) : ""}
                                </div>
                                <div className="flex">
                                    {booking.dropoff.drop_point === "Surabaya Airport" ? (
                                        <div>
                                            <Ticket className="inline-block w-4 h-4 mr-1" />
                                        </div>
                                    ) : booking.dropoff.drop_point === "Surabaya Hotel" ? (
                                        <div>
                                            <Hotel className="inline-block w-4 h-4 mr-1" />
                                        </div>
                                    ) : booking.dropoff.drop_point === "Surabaya Train Station" ? (
                                        <div>
                                            <Ticket className="inline-block w-4 h-4 mr-1" />
                                        </div>
                                    ) : (
                                        booking.dropoff.drop_point_value && (
                                            <div>
                                                <MapPin className="inline-block w-4 h-4 mr-1" />
                                            </div>
                                        )
                                    )}
                                    {booking.dropoff.drop_point_value || (
                                    <span className="flex items-center text-red-500">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        No dropoff location
                                    </span>
                                    )}
                                </div>
                                <div className="text-xs">
                                    {booking.dropoff.drop_time ? (
                                    <div className="flex"><Clock className="w-4 h-4 mr-1" /> <span className="text-gray-500"> {booking.pickup.pickup_time}</span></div>
                                    ) : (
                                    <span className="flex items-center text-red-500">
                                        <AlertCircle className="w-4 h-4 mr-1" />
                                        No dropoff time
                                    </span>
                                    )}
                                </div>
                                </td>

                            {/* Vehicle & Crew */}
                            <td className="py-3 px-4 align-top space-y-1">
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
                            <td className="py-3 px-4 align-top space-y-1">
                              <div className="text-sm">
                                {booking.financial.invoice.invoiceLink.length ? (
                                  <div 
                                    onClick={() => {
                                      booking.financial.invoice.invoiceLink.forEach(link => 
                                        window.open(link, '_blank')
                                      );
                                    }}
                                    className="text-blue-500 underline cursor-pointer hover:text-blue-700"
                                  >
                                    Invoice: {formatCurrency(booking.financial.invoice.total)}
                                  </div>
                                ) : (
                                  <div className="text-blue-500">
                                    Invoice: {formatCurrency(booking.financial.invoice.total)}
                                  </div>
                                )}
                              </div>
                              {
                                booking.orderChannel == 'JVTO' && (
                                  <>
                                    <div className="text-xs text-gray-600">
                                        <span>Deposit: {formatCurrency(booking.financial.payment)}</span>
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        <span>Balance: {formatCurrency(booking.financial.balance)}</span>
                                    </div>
                                    <div className="text-xs text-gray-600">
                                        <span>Payment Method: {booking.financial.paymentMethod ? booking.financial.paymentMethod.toUpperCase() : '-'}</span>
                                    </div>
                                  </>
                                )
                              }
                              <div className="text-xs text-gray-600">
                                {booking.financial.expense.expenseLink ? (
                                    booking.financial.expense.target == '_blank' ? (
                                        <div 
                                            onClick={() => window.open(booking.financial.expense.expenseLink, '_blank')}
                                            className="cursor-pointer underline hover:text-blue-600"
                                        >
                                            Expenses: {formatCurrency(booking.financial.expense.total)}
                                        </div>
                                    ) : (
                                        <Link href={booking.financial.expense.expenseLink}>
                                            <div className="cursor-pointer underline hover:text-blue-600">
                                                Expenses: {formatCurrency(booking.financial.expense.total)}
                                            </div>
                                        </Link>
                                    )
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
                            <td className="py-3 px-4 align-top">
  <div className="relative" ref={el => dropdownRefs.current[booking.id] = el}>
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.stopPropagation();
        setOpenDropdownId(openDropdownId === booking.id ? null : booking.id);
      }}
    >
      <MoreVertical className="h-4 w-4" />
    </Button>

    {openDropdownId === booking.id && (
      <div 
        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 py-1"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={() => window.open(`/bookings/details/${booking.booking_id}`, '_blank')}
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
        >
          Details
        </button>
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleMoreVerticalClick(booking);
            setOpenDropdownId(null);
          }}
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
        >
          Plotting
        </button>
      </div>
    )}
  </div>
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
                                        <li key={idx}><span className="font-semibold"> Day {item.day}</span>: {item.itinerary}</li>
                                    ))}
                                    </ul>
                                </div>

                                {/* Accommodation Details */}
                                <div>
                                    <h3 className="font-medium mb-2">Accommodation Details</h3>
                                    <div className="space-y-2 text-gray-700">
                                    {booking.hotels.map((acc, index) => (
                                        <div key={index}>
                                        <div className="text-sm font-semibold mr-2">Day {acc.day}:</div>
                                        <span className="text-sm font-medium">Check In {format(addDays(booking.date.start, acc.day - 1), 'dd-MMM')}: </span>                                        
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
            {selectedBooking && (
              <DetailsModal 
                  isOpen={isModalOpen}
                  onClose={() => setIsModalOpen(false)}
                  booking={selectedBooking}
                  plottingData={modalPlottingData}
                  setBookings={setBookings}  // Add this prop
                  bookings={bookings}                    
              />
              )}

            </div>
        </Main>

  );
}
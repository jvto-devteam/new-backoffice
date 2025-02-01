import React, { useState, useRef, useEffect } from 'react';
import Main from '@/Layouts/Main';
import { router } from '@inertiajs/react';
import { Check, ChevronsUpDown,ChevronDown, Search } from 'lucide-react';

const Create = ({ data }) => {
    const [tripDate, setTripDate] = useState('');  // Tambahkan ini
    const [numberOfPax, setNumberOfPax] = useState(2);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [openNationality, setOpenNationality] = useState(false);
    const [openPackage, setOpenPackage] = useState(false);
    const [selectedNationality, setSelectedNationality] = useState(null);
    const [searchNationality, setSearchNationality] = useState('');
    const [searchPackage, setSearchPackage] = useState('');

    const [formData, setFormData] = useState({
      // Customer Information
      customerName: '',
      nationality: null,
      phoneNumber: '',
      email: '',
      tShirtSizes: {
        XSS: 0, XXS: 0, XS: 0, S: 0, M: 0, L: 0, XL: 0, XXL: 0, XXXL: 0
      },
      
      // Booking Information
      bookingFile: null,
      tripDate: '',
      numberOfPax: 2,
      package: null,
      pickupLocation: '',
      pickupTime: '',
      dropLocation: '',
      dropTime: '',
      orderChannel : data.order_channel,
    
      // Booking Items akan ditambahkan saat submit
      bookingItems: []
    });
    
    // Fungsi handler untuk update form
    const handleInputChange = (field, value) => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    };

    const handleTShirtSizeChange = (size, value) => {
      setFormData(prev => ({
        ...prev,
        tShirtSizes: {
          ...prev.tShirtSizes,
          [size]: parseInt(value) || 0
        }
      }));
    };

    const handleFileChange = (e) => {
      setFormData(prev => ({
        ...prev,
        bookingFile: e.target.files[0]
      }));
    };    
    const getDateForDay = (dayNumber) => {
      if (!tripDate) return null;
      const date = new Date(tripDate);
      date.setDate(date.getDate() + (dayNumber - 1));
      return date.toLocaleDateString('en-GB', { 
        day: 'numeric',
        month: 'short', 
        year: 'numeric' 
      });
    };

    // Fungsi untuk mengumpulkan semua data
    const collectAllData = () => {
      // Dapatkan booking items dari PackageDetailCard component
      const bookingItems = bookingDetailRef.current?.collectBookingItems() || [];
      const financialCalculations = bookingDetailRef.current?.getFinancialCalculations() || {
        totalExpense: 0,
        packagePrice: 0,
        grandTotal: 0,
        profit: 0
      };
      
      const groupedItems = {
        accommodation: [],
        room_hotels: [],
        activity: [],
        meal: [],
        other: [],
        resource: []
      };    
      const hotelTracking = {};
      
      bookingItems.forEach(item => {
        switch(item.type) {
          case 'accommodation':
            groupedItems.room_hotels.push({
              day: item.day,
              hotel_id: item.meta.hotel_id,
              room_id: item.meta.room_id,
              room_config_id: item.meta.room_config_id,
              qty: item.qty,
              rate: item.price,
              total: item.total
            });
            const hotelKey = `${item.day}_${item.meta.hotel_id}`;
            if (!hotelTracking[hotelKey]) {
              hotelTracking[hotelKey] = true;
              groupedItems.accommodation.push({
                day: item.day,
                hotel_id: item.meta.hotel_id,
                name: item.name.split(' - ')[0], // Ambil nama hotel saja
                total: item.total
              });
            }
            break;
    
          case 'activity':
            groupedItems.activity.push({
              day: item.day,
              activity_id: item.meta.activity_id,
              destination_id: item.meta.destination_id,
              is_second_destination: item.meta.is_second_destination,
              name: item.name,
              qty: item.qty,
              unit: item.unit,
              price: item.price,
              total: item.total
            });
            break;
    
          case 'meal':
            groupedItems.meal.push({
              day: item.day,
              hotel_id: item.meta.hotel_id,
              meal_type: item.meta.meal_type,
              name: item.name,
              qty: item.qty,
              price: item.price,
              total: item.total
            });
            break;
    
          case 'other':
            groupedItems.other.push({
              other_activity_id: item.meta.other_activity_id,
              name: item.name,
              qty: item.qty,
              unit: item.unit,
              price: item.price,
              total: item.total
            });
            break;
    
          case 'resource':
            groupedItems.resource.push({
              sub_type: item.sub_type,
              name: item.name,
              qty: item.qty,
              unit: item.unit,
              price: item.price,
              total: item.total,
              meta: item.sub_type === 'vehicle' ? {
                car_id: item.meta.car_id,
                car_config_id: item.meta.car_config_id,
                pax_capacity: item.meta.pax_capacity
              } : {
                crew_role: item.meta.crew_role,
                order_channel: item.meta.order_channel
              }
            });
            break;
        }
      });     

  const itineraryDetails = selectedPackage?.itinerary.map(day => {
    return {
      day: day.day,
      date: getDateForDay(day.day), // Menggunakan fungsi getDateForDay yang sudah ada
      itinerary: day.title,
      activities: [
        // Activities dari destination utama
        ...(day.itinerary_destination?.destination?.activity?.map(act => ({
          activity_name: act.name,
          destination_id: day.itinerary_destination.destination.id,
          destination_name: day.itinerary_destination.destination.name,
          is_second_destination: false
        })) || []),
        // Activities dari second destination jika ada
        ...(day.itinerary_destination?.second_destination?.activity?.map(act => ({
          activity_name: act.name,
          destination_id: day.itinerary_destination.second_destination.id,
          destination_name: day.itinerary_destination.second_destination.name,
          is_second_destination: true
        })) || [])
      ],
      destinations: [
        {
          destination_id: day.itinerary_destination?.destination?.id,
          destination_name: day.itinerary_destination?.destination?.name
        },
        // Tambahkan second destination jika ada
        day.itinerary_destination?.second_destination ? {
          destination_id: day.itinerary_destination.second_destination.id,
          destination_name: day.itinerary_destination.second_destination.name
        } : null
      ].filter(Boolean) // Hapus null values
    };
  }) || [];       
    
      // Gabungkan semua data
      const completeData = {
        customer_info: {
          name: formData.customerName,
          nationality_id: formData.nationality,
          phone: formData.phoneNumber,
          email: formData.email,
          t_shirt_sizes: formData.tShirtSizes
        },
        booking_info: {
          booking_file: formData.bookingFile,
          trip_date: formData.tripDate,
          number_of_pax: formData.numberOfPax,
          package_id: formData.package,
          pickup_location: formData.pickupLocation,
          pickup_time: formData.pickupTime,
          drop_location: formData.dropLocation,
          drop_time: formData.dropTime,
          order_channel: formData.orderChannel
        },
        booking_items: groupedItems,
        itinerary_details: itineraryDetails,
        financial_summary: {
          total_expense: financialCalculations.totalExpense,
          package_price: financialCalculations.packagePrice/formData.numberOfPax,
          grand_total: financialCalculations.grandTotal,
          profit: financialCalculations.profit
        }
      };
    
      return completeData;
    };
    
// Fungsi untuk handle submit
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const data = collectAllData();
  
  // Create FormData instance untuk handle file upload
  const formData = new FormData();
  
  // Append booking file jika ada
  if (data.booking_info.booking_file) {
    formData.append('booking_file', data.booking_info.booking_file);
  }
  
  // Append data lainnya sebagai JSON string
  formData.append('customer_info', JSON.stringify(data.customer_info));
  formData.append('booking_info', JSON.stringify({
    ...data.booking_info,
    booking_file: null // Remove file dari JSON karena sudah di-append terpisah
  }));
  formData.append('booking_items', JSON.stringify(data.booking_items));
  formData.append('itinerary_details', JSON.stringify(data.itinerary_details));  
  formData.append('financial_summary', JSON.stringify(data.financial_summary));
  
  try {
    // Post request menggunakan Inertia
    await router.post('/bookings/store', formData, {
      forceFormData: true,
      preserveScroll: true,
      preserveState: true,
      onBefore: () => confirm('Are you sure you want to submit this booking?'),
      onSuccess: () => {
        // Reset form atau redirect
        alert('Booking created successfully!');
        // Optional: redirect ke halaman lain
        // router.visit('/bookings');
      },
      onError: (errors) => {
        console.error('Submission errors:', errors);
        alert('Error creating booking. Please check the form and try again.');
      }
    });
  } catch (error) {
    console.error('Submission error:', error);
    alert('An error occurred while creating the booking.');
  }
};
  // Custom Card Component
  const Card = ({ children, className = '' }) => (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {children}
    </div>
  );

  // Custom Card Header
  const CardHeader = ({ title }) => (
    <div className="px-6 py-4 border-b">
      <h2 className="text-xl font-semibold">{title}</h2>
    </div>
  );

  // Custom Form Field
  const FormField = ({ label, children, error, className = '' }) => (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm text-gray-600 mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );

  // Custom Input with flat style
  const Input = ({ type = 'text', className = '', ...props }) => (
    <input
      type={type}
      className={`w-full px-3 py-2 bg-gray-50 border border-gray-200 focus:outline-none focus:border-blue-500 transition-colors ${className}`}
      {...props}
    />
  );

  // Searchable Select with Click Outside Handler
  const SearchableSelect = ({
    options,
    value,
    onChange,
    placeholder,
    searchValue,
    onSearchChange,
    open,
    setOpen,
    displayKey
  }) => {
    const selectRef = useRef(null);
    const searchInputRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (selectRef.current && !selectRef.current.contains(event.target)) {
          setOpen(false);
          onSearchChange(''); // Clear search when closing dropdown
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setOpen]);

    // Prevent search input from causing page scroll
    const handleSearchChange = (e) => {
      e.preventDefault();
      onSearchChange(e.target.value);
      // Keep focus on search input
      searchInputRef.current?.focus();
    };

    return (
      <div className="relative" ref={selectRef}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-left focus:outline-none focus:border-blue-500 transition-colors flex justify-between items-center"
        >
          <span className="truncate text-gray-700">
            {value ? options.find(item => item.id === value)?.[displayKey] : placeholder}
          </span>
          <ChevronsUpDown className="h-4 w-4 text-gray-400" />
        </button>

        {open && (
          <div className="absolute z-50 w-full mt-1 bg-white rounded shadow-lg border">
            <div className="sticky top-0 bg-white border-b px-3 py-2">
              <div className="flex items-center">
                <Search className="h-4 w-4 text-gray-400 mr-2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchValue}
                  onChange={handleSearchChange}
                  className="w-full bg-transparent border-none focus:outline-none"
                  placeholder="Search..."
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            <div className="max-h-60 overflow-auto">
              {options
                .filter(item => 
                  item[displayKey].toLowerCase().includes(searchValue.toLowerCase())
                )
                .map(item => (
                  <div
                    key={item.id}
                    onClick={() => {
                      onChange(item.id);
                      setOpen(false);
                    }}
                    className={`px-3 py-2 cursor-pointer flex items-center hover:bg-gray-50 ${
                      value === item.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <Check 
                      className={`h-4 w-4 mr-2 text-blue-500 ${value === item.id ? 'opacity-100' : 'opacity-0'}`} 
                    />
                    <span>{item[displayKey]}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // T-Shirt Size Inputs
  const TShirtSizes = () => {
    const sizes = ['XSS', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
    return (
      <div className="grid grid-cols-3 gap-4">
        {sizes.map((size) => (
          <div key={size} className="flex items-center gap-2">
            <label className="w-12 text-sm text-gray-600">{size}</label>
            <Input
              type="number"
              min="0"
              className="w-20"
              placeholder="0"
            />
          </div>
        ))}
      </div>
    );
  };

  const getDestinationActivities = (destination) => {
    if (!destination) return [];
    if (destination.activity_destination) {
      return [destination.activity_destination.name];
    }
    return [];
  };

  // Custom Card Component with detail rendering for Package Details
  const PackageDetailCard = React.forwardRef(({ selectedPackage, tripDate, numberOfPax, carConfiguration, othersActivities, orderChannel }, ref) => {
    const [expandedSections, setExpandedSections] = useState({
      itinerary: false,
      activities: false,
      others: false,
      resource: false,
      accommodation: false      
    });
    const toggleSection = (section) => {
      setExpandedSections(prev => ({
        ...prev,
        [section]: !prev[section]
      }));
    };
    if (!selectedPackage) return (
      <div className="p-6">
        <p className="text-gray-500">Select a package to view details</p>
      </div>
    );
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    };
  
    // Function to get date for specific day
    const getCrewRate = (resourceInfo, orderChannel) => {
      switch(orderChannel) {
        case 'klook':
          return resourceInfo.crew_klook_role?.rate || 0;
        case 'jvto':
          return resourceInfo.crew_jvto_role?.rate || 0;
        case 'twt':
          return resourceInfo.crew_twt_role?.rate || 0;
        default:
          return 0;
      }
    };
    
    const getCrewRole = (resourceInfo, orderChannel) => {
      switch(orderChannel) {
        case 'klook':
          return resourceInfo.crew_klook_role?.role;
        case 'jvto':
          return resourceInfo.crew_jvto_role?.role;
        case 'twt':
          return resourceInfo.crew_twt_role?.role;
        default:
          return '';
      }
    };    

    const getResourceInfo = () => {
        if (!numberOfPax || !carConfiguration) return null;
        return carConfiguration.find(config => config.pax === parseInt(numberOfPax));
    };
    const collectBookingItems = () => {
      let items = [];
    
      // Accommodation Items
      if (selectedPackage?.package_hotel) {
        selectedPackage.package_hotel.forEach(hotelDay => {
          const roomConfigs = getRoomConfiguration(hotelDay.hotel, numberOfPax);
          roomConfigs.forEach(config => {
            items.push({
              type: 'accommodation',
              day: hotelDay.day,
              name: `${hotelDay.hotel.name} - ${config.room.room_name}`,
              qty: config.qty,
              unit: 'room',
              price: config.room.rate,
              total: config.qty * config.room.rate,
              meta: {
                hotel_id: hotelDay.hotel.id,
                room_id: config.room.id,
                room_config_id: config.id
              }
            });
          });
        });
      }
    
      // Activities Items
      selectedPackage.itinerary.forEach(day => {
        // Main destination activities
        if (day.itinerary_destination?.destination?.activity) {
          day.itinerary_destination.destination.activity.forEach(act => {
            const qty = act.unit === 'pax' ? numberOfPax : eval(act.formula.replace(/pax/g, numberOfPax));
            items.push({
              type: 'activity',
              day: day.day,
              name: act.name,
              qty: qty,
              unit: act.unit,
              price: act.price,
              total: qty * act.price,
              meta: {
                activity_id: act.id,
                destination_id: day.itinerary_destination.destination.id,
                is_second_destination: false
              }
            });
          });
        }
    
        // Second destination activities
        if (day.itinerary_destination?.second_destination?.activity) {
          day.itinerary_destination.second_destination.activity.forEach(act => {
            const qty = act.unit === 'pax' ? numberOfPax : eval(act.formula.replace(/pax/g, numberOfPax));
            items.push({
              type: 'activity',
              day: day.day,
              name: act.name,
              qty: qty,
              unit: act.unit,
              price: act.price,
              total: qty * act.price,
              meta: {
                activity_id: act.id,
                destination_id: day.itinerary_destination.second_destination.id,
                is_second_destination: true
              }
            });
          });
        }
    
        // Meals for Ijen Crater
        const dayHotel = selectedPackage.package_hotel.find(h => h.day === day.day-1);
        if (day.itinerary_destination?.destination?.id === 2 && dayHotel) {
          // Dinner
          items.push({
            type: 'meal',
            day: day.day,
            name: `Dinner at ${dayHotel.hotel.name}`,
            qty: numberOfPax,
            unit: 'pax',
            price: dayHotel.hotel.dinner_rate || 0,
            total: (dayHotel.hotel.dinner_rate || 0) * numberOfPax,
            meta: {
              meal_type: 'dinner',
              hotel_id: dayHotel.hotel.id
            }
          });
    
          // Lunch (with conditions)
          if (orderChannel !== 'klook' && 
              day.day !== selectedPackage.duration.day && 
              selectedPackage.end_destination_id !== 3) {
            items.push({
              type: 'meal',
              day: day.day,
              name: `Lunch at ${dayHotel.hotel.name}`,
              qty: numberOfPax,
              unit: 'pax',
              price: dayHotel.hotel.lunch_rate || 0,
              total: (dayHotel.hotel.lunch_rate || 0) * numberOfPax,
              meta: {
                meal_type: 'lunch',
                hotel_id: dayHotel.hotel.id
              }
            });
          }
        }
      });
    
      // Others Activities Items
      if (othersActivities) {
        othersActivities.forEach(act => {
          const qty = calculateQuantity(act.formula, numberOfPax, selectedPackage?.duration?.day);
          items.push({
            type: 'other',
            day: null,
            name: act.name,
            qty: qty,
            unit: act.unit,
            price: act.price,
            total: qty * act.price,
            meta: {
              other_activity_id: act.id
            }
          });
        });
      }
    
      // Resource Requirements Items
      if (resourceInfo) {
        // Vehicle
        items.push({
          type: 'resource',
          sub_type: 'vehicle',
          day: null,
          name: `Vehicle - ${resourceInfo.car.name}`,
          qty: selectedPackage.duration.day,
          unit: 'day',
          price: resourceInfo.price,
          total: resourceInfo.price * selectedPackage.duration.day,
          meta: {
            car_id: resourceInfo.car.id,
            car_config_id: resourceInfo.id,
            pax_capacity: resourceInfo.pax
          }
        });
    
        // Crew
        const crewRate = getCrewRate(resourceInfo, orderChannel);
        const crewRole = getCrewRole(resourceInfo, orderChannel);
        items.push({
          type: 'resource',
          sub_type: 'crew',
          day: null,
          name: `Crew - ${crewRole}`,
          qty: selectedPackage.duration.day,
          unit: 'day',
          price: crewRate,
          total: crewRate * selectedPackage.duration.day,
          meta: {
            crew_role: crewRole,
            order_channel: orderChannel
          }
        });
      }
    
      return items;
    };    
    React.useImperativeHandle(ref, () => ({
      collectBookingItems: () => {
        return collectBookingItems();
      },
      // Tambahkan fungsi kalkulasi yang dibutuhkan
      getFinancialCalculations: () => {
        return {
          totalExpense: calculateTotalExpense(),
          packagePrice: getPackagePrice(),
          grandTotal: getPackagePrice(),
          profit: getPackagePrice() - calculateTotalExpense()
        };
      }
    }));
    const resourceInfo = getResourceInfo();

    // Calculate grand totals
    const calculateActivitiesTotal = () => {
      return selectedPackage.itinerary.reduce((total, day) => {
        // Main destination activities
        const mainDestTotal = day.itinerary_destination?.destination?.activity?.reduce((subTotal, act) => {
          const qty = act.unit === 'pax' ? numberOfPax : eval(act.formula.replace(/pax/g, numberOfPax));
          return subTotal + (qty * act.price);
        }, 0) || 0;
    
        // Second destination activities
        const secondDestTotal = day.itinerary_destination?.second_destination?.activity?.reduce((subTotal, act) => {
          const qty = act.unit === 'pax' ? numberOfPax : eval(act.formula.replace(/pax/g, numberOfPax));
          return subTotal + (qty * act.price);
        }, 0) || 0;
    
        // Get hotel for current day
        const dayHotel = selectedPackage.package_hotel.find(h => h.day === day.day-1);
    
        // Calculate meals cost for Ijen Crater
        let mealsCost = 0;
        if (day.itinerary_destination?.destination?.id === 2 && dayHotel) {
          // Add lunch cost only if meets all conditions
          if (orderChannel !== 'klook' && 
              day.day !== selectedPackage.duration.day && 
              selectedPackage.end_destination_id !== 3) {
            mealsCost += (dayHotel.hotel.lunch_rate || 0) * numberOfPax;
          }
          // Add dinner cost
          mealsCost += (dayHotel.hotel.dinner_rate || 0) * numberOfPax;
        }
    
        return total + mainDestTotal + secondDestTotal + mealsCost;
      }, 0);
    };

    const calculateOthersActivitiesTotal = () => {
      return othersActivities.reduce((total, act) => {
        const qty = calculateQuantity(act.formula, numberOfPax, selectedPackage?.duration?.day);
        return total + (qty * act.price);
      }, 0);
    };
    const calculateResourceTotal = () => {
      if (!resourceInfo) return 0;
      const crewRate = getCrewRate(resourceInfo, orderChannel);
      return (resourceInfo.price * selectedPackage.duration.day) + 
             (crewRate * selectedPackage.duration.day);
    };
    const calculateAccommodationTotal = () => {
      if (!selectedPackage?.package_hotel || !numberOfPax) return 0;
      
      return selectedPackage.package_hotel.reduce((total, hotelDay) => {
        const roomConfigs = getRoomConfiguration(hotelDay.hotel, numberOfPax);
        const dayTotal = roomConfigs.reduce((sum, config) => 
          sum + (config.qty * config.room.rate), 0);
        return total + dayTotal;
      }, 0);
    };    

    const calculateTotalExpense = () => {
      const activitiesTotal = calculateActivitiesTotal();
      const othersTotal = calculateOthersActivitiesTotal();
      const resourceTotal = calculateResourceTotal();
      const accommodationTotal = calculateAccommodationTotal();
      
      return activitiesTotal + othersTotal + resourceTotal + accommodationTotal;
    };
    const getPackagePrice = () => {
      if (!selectedPackage || !numberOfPax) return 0;
      
      const priceCategory = selectedPackage.package_price.find(price => 
        numberOfPax >= price.price_category.start && numberOfPax <= price.price_category.end
      );
    
      if (!priceCategory) return 0;
      
      return priceCategory.price * numberOfPax;
    };
    
    const SectionHeader = ({ title, total, isExpanded, onToggle }) => (
      <div 
        onClick={onToggle}
        className="px-6 py-4 border-b border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-50"
      >
        <div className="flex items-center gap-2">
          <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? '' : '-rotate-90'}`} />
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        {total && (
          <div className="text-sm font-medium text-black">
            Total: {total}
          </div>
        )}
      </div>
    );
    const getRoomConfiguration = (hotel, pax) => {
      return hotel.room_hotel_configuration
        .filter(config => config.pax === parseInt(pax))
        .map(config => ({
          ...config,
          subtotal: config.qty * config.room.rate
        }));
    };


    return (
      <div className="space-y-8 p-6">
        {/* Package Overview Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Package Name</h4>
              <p className="mt-1 text-lg font-semibold text-gray-800">{selectedPackage.name}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Duration</h4>
              <p className="mt-1 text-lg font-semibold text-gray-800">{selectedPackage.duration.name}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Category</h4>
              <p className="mt-1 text-lg font-semibold text-gray-800">{selectedPackage.category.name}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Total Pax</h4>
              <p className="mt-1 text-lg font-semibold text-gray-800">{numberOfPax || '-'}</p>
            </div>
          </div>
        </div>
  
        {/* Sections Wrapper */}
        <div className="grid grid-cols-1 gap-4">
          {/* Itinerary Section */}
          
          <section className="bg-white rounded-xl shadow-sm border border-gray-100">
            <SectionHeader 
              title="Itinerary Details"
              isExpanded={expandedSections.itinerary}
              onToggle={() => toggleSection('itinerary')}
            />
            {expandedSections.itinerary && (
            <div className="p-6 space-y-4">
              {selectedPackage.itinerary.map((day, index) => {
                const dayHotel = selectedPackage.package_hotel.find(h => h.day === day.day);
                const dateString = getDateForDay(day.day);
                return (
                  <div key={day.day} className="relative bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {/* Day Header */}
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-800">
                          Day {day.day}
                        </h3>
                        {dateString && (
                          <span className="text-sm text-gray-600">
                            {dateString}
                          </span>
                        )}
                      </div>
                    </div>
    
                    {/* Day Content */}
                    <div className="p-4 space-y-3">
                      {/* Itinerary */}
                      <div className="flex gap-3">
                        <div className="w-24 flex-shrink-0">
                          <span className="text-sm font-medium text-gray-500">Itinerary</span>
                        </div>
                        <div className="flex-grow">
                          <span className="text-gray-800">{day.title}</span>
                        </div>
                      </div>
    
                      {/* Activities */}
                      <div className="flex gap-3">
                        <div className="w-24 flex-shrink-0">
                          <span className="text-sm font-medium text-gray-500">Activity</span>
                        </div>
                        <div className="flex-grow">
                          <div className="space-y-1">
                            {day.itinerary_destination && (
                              <div className="text-gray-800">
                                {day.itinerary_destination.destination?.name}
                                {day.itinerary_destination.second_destination && (
                                  <>
                                    <span className="text-gray-400 mx-2">→</span>
                                    {day.itinerary_destination.second_destination.name}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
    
                      {/* Hotel */}
                      <div className="flex gap-3">
                        <div className="w-24 flex-shrink-0">
                          <span className="text-sm font-medium text-gray-500">Hotel</span>
                        </div>
                        <div className="flex-grow">
                          {dayHotel ? (
                            <div>
                              <span className="text-gray-800">{dayHotel.hotel.name}</span>
                              <div className="text-sm text-gray-500 mt-0.5">{dayHotel.hotel.address}</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">No hotel assigned</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
    
              })}
            </div>
            )}
          </section>

          {/* Accommodation Section */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100">
            <SectionHeader 
              title="Accommodation"
              total={formatCurrency(calculateAccommodationTotal())}
              isExpanded={expandedSections.accommodation}
              onToggle={() => toggleSection('accommodation')}
            />
            {expandedSections.accommodation && (
              <div className="p-6 space-y-6">
                {selectedPackage.package_hotel.map((hotelDay, index) => {
                  const roomConfigs = getRoomConfiguration(hotelDay.hotel, numberOfPax);
                  const dayTotal = roomConfigs.reduce((sum, config) => 
                    sum + (config.qty * config.room.rate), 0);

                  return (
                    <div key={hotelDay.id} className="space-y-4">
                      <h4 className="font-medium text-gray-700">
                        Day {hotelDay.day} - {hotelDay.hotel.name}
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="w-16 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Room Name</th>
                              <th className="w-24 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                              <th className="w-32 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase text-right">Rate</th>
                              <th className="w-32 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {roomConfigs.map((config, idx) => (
                              <tr key={config.id}>
                                <td className="px-4 py-2 text-sm text-gray-900">{idx + 1}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">{config.room.room_name}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">{config.qty}</td>
                                <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(config.room.rate)}</td>
                                <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(config.qty * config.room.rate)}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-50 font-medium">
                            <tr>
                              <td colSpan="4" className="px-4 py-3 text-sm text-right text-gray-600">
                                Total
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-800 text-right">{formatCurrency(dayTotal)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Activities Section */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100">
              <SectionHeader 
                title="Activities"
                total={formatCurrency(calculateActivitiesTotal())}
                isExpanded={expandedSections.activities}
                onToggle={() => toggleSection('activities')}
              />
              {expandedSections.activities && (
            <div className="p-6 space-y-6">
              {selectedPackage.itinerary.map((day) => {
                const hasDestinationActivities = day.itinerary_destination?.destination?.activity?.length > 0;
                const hasSecondDestinationActivities = day.itinerary_destination?.second_destination?.activity?.length > 0;
                  // Get hotel for current day
                const dayHotel = selectedPackage.package_hotel.find(h => h.day === day.day - 1);
      
                if (hasDestinationActivities || hasSecondDestinationActivities) {
                  return (
                    <div key={`activities-${day.day}`} className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
                      {/* Main Destination Activities */}
                      {hasDestinationActivities && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-700 mb-2">
                            {day.itinerary_destination.destination.name}
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="w-16 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                                  <th className="w-[35%] px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                  <th className="w-24 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                                  <th className="w-24 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                                  <th className="w-32 px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                  <th className="w-32 px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {day.itinerary_destination.destination.activity.map((act, idx) => {
                                  const qty = act.unit === 'pax' ? numberOfPax : 1;
                                  const total = qty * act.price;

                                  return (
                                    <tr key={act.id}>
                                      <td className="px-4 py-2 text-sm text-gray-900">{idx + 1}</td>
                                      <td className="px-4 py-2 text-sm text-gray-900">{act.name}</td>
                                      <td className="px-4 py-2 text-sm text-gray-900">{act.unit}</td>
                                      <td className="px-4 py-2 text-sm text-gray-900">{qty}</td>
                                      <td className="px-4 py-2 text-sm text-right text-gray-900">
                                        {new Intl.NumberFormat('id-ID', {
                                          style: 'currency',
                                          currency: 'IDR',
                                          minimumFractionDigits: 0,
                                          maximumFractionDigits: 0
                                        }).format(act.price)}
                                      </td>
                                      <td className="px-4 py-2 text-sm text-right text-gray-900">
                                        {new Intl.NumberFormat('id-ID', {
                                          style: 'currency',
                                          currency: 'IDR',
                                          minimumFractionDigits: 0,
                                          maximumFractionDigits: 0
                                        }).format(total)}
                                      </td>
                                    </tr>
                                  )
                                })}
                                {day.itinerary_destination?.destination?.id === 2 && dayHotel && (
                                  <tr key={`dinner-${day.day}`}>
                                    <td className="px-4 py-2 text-sm text-gray-900">
                                      {day.itinerary_destination.destination.activity.length + 1}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-900">
                                      Dinner at {dayHotel.hotel.name}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-900">pax</td>
                                    <td className="px-4 py-2 text-sm text-gray-900">{numberOfPax}</td>
                                    <td className="px-4 py-2 text-sm text-right text-gray-900">
                                      {formatCurrency(dayHotel.hotel.dinner_rate || 0)}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-right text-gray-900">
                                      {formatCurrency((dayHotel.hotel.dinner_rate || 0) * numberOfPax)}
                                    </td>
                                  </tr>
                                )}       
                              {/* Add lunch row if conditions met */}
                              {day.itinerary_destination?.destination?.id === 2 && dayHotel && (
                                (orderChannel !== 'klook' && 
                                day.day !== selectedPackage.duration.day && 
                                selectedPackage.end_destination_id !== 3) && (
                                  <tr key={`lunch-${day.day}`}>
                                    <td className="px-4 py-2 text-sm text-gray-900">
                                      {day.itinerary_destination.destination.activity.length + 2}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-900">
                                      Lunch at {dayHotel.hotel.name}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-900">pax</td>
                                    <td className="px-4 py-2 text-sm text-gray-900">{numberOfPax}</td>
                                    <td className="px-4 py-2 text-sm text-gray-900">
                                      {formatCurrency(dayHotel.hotel.lunch_rate || 0)}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-900">
                                      {formatCurrency((dayHotel.hotel.lunch_rate || 0) * numberOfPax)}
                                    </td>
                                  </tr>
                                )
                              )}
                              </tbody>
                              <tfoot className="bg-gray-50 font-medium">
                                <tr>
                                  <td colSpan="5" className="px-4 py-3 text-sm text-right text-gray-600">
                                    Total {day.itinerary_destination.destination.name}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right text-gray-800">
                                    {(() => {
                                      // Calculate lunch cost
                                      const lunchCost = (
                                        day.itinerary_destination?.destination?.id === 2 && 
                                        dayHotel && 
                                        orderChannel !== 'klook' && 
                                        day.day !== selectedPackage.duration.day && 
                                        selectedPackage.end_destination_id !== 3
                                      ) ? (dayHotel.hotel.lunch_rate || 0) * numberOfPax : 0;

                                      // Calculate total including activities and meals
                                      return formatCurrency(
                                        day.itinerary_destination.destination.activity.reduce((total, act) => {
                                          const qty = act.unit === 'pax' ? numberOfPax : 1;
                                          return total + (qty * act.price);
                                        }, 0) + 
                                        lunchCost +
                                        // Add dinner cost if this is Ijen Crater
                                        (day.itinerary_destination.destination.id === 2 && dayHotel ? 
                                          (dayHotel.hotel.dinner_rate || 0) * numberOfPax : 0)
                                      );
                                    })()}
                                  </td>
                                </tr>
                              </tfoot>                              
                            </table>
                          </div>
                        </div>
                      )}
      
                      {/* Second Destination Activities */}
                      {hasSecondDestinationActivities && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">
                            {day.itinerary_destination.second_destination.name}
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="w-16 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                                  <th className="w-[35%] px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                  <th className="w-24 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                                  <th className="w-24 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                                  <th className="w-32 px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                                  <th className="w-32 px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {day.itinerary_destination.second_destination.activity.map((act, idx) => {
                                  const qty = act.unit === 'pax' ? numberOfPax : 1;
                                  const total = qty * act.price;
      
                                  return (
                                    <tr key={act.id}>
                                      <td className="px-4 py-2 text-sm text-gray-900">{idx + 1}</td>
                                      <td className="px-4 py-2 text-sm text-gray-900">{act.name}</td>
                                      <td className="px-4 py-2 text-sm text-gray-900">{act.unit}</td>
                                      <td className="px-4 py-2 text-sm text-gray-900">{qty}</td>
                                      <td className="px-4 py-2 text-right text-gray-900">
                                        {new Intl.NumberFormat('id-ID', {
                                          style: 'currency',
                                          currency: 'IDR',
                                          minimumFractionDigits: 0,
                                          maximumFractionDigits: 0
                                        }).format(act.price)}
                                      </td>
                                      <td className="px-4 py-2 text-right text-gray-900">
                                        {new Intl.NumberFormat('id-ID', {
                                          style: 'currency',
                                          currency: 'IDR',
                                          minimumFractionDigits: 0,
                                          maximumFractionDigits: 0
                                        }).format(total)}
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                              <tfoot className="bg-gray-50 font-medium">
                                <tr>
                                  <td colSpan="5" className="px-4 py-3 text-sm text-right text-gray-600">
                                    Total {day.itinerary_destination.second_destination.name}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-right text-gray-800">
                                    {formatCurrency(day.itinerary_destination.second_destination.activity.reduce((total, act) => {
                                      const qty = act.unit === 'pax' ? numberOfPax : 1;
                                      return total + (qty * act.price);
                                    }, 0))}
                                  </td>
                                </tr>
                              </tfoot>                              
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                return null;
              })}
      
            </div>
              )}
          </section>
  
          {/* Others Activities Section */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100">
            <SectionHeader 
              title="Others Activities"
              total={formatCurrency(calculateOthersActivitiesTotal())}
              isExpanded={expandedSections.others}
              onToggle={() => toggleSection('others')}
            />            
            
            {expandedSections.others && (
              <div className="p-6">
                {data.others_activities && (
                  <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
                    <h3 className="text-lg font-medium text-gray-800 mb-3">Others Activities</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full divide-y divide-gray-200 bg-white rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="w-16 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                            <th className="w-[35%] px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="w-24 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                            <th className="w-24 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                            <th className="w-32 px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="w-32 px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
        
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {data.others_activities.map((act, idx) => {
                            const qty = calculateQuantity(act.formula, numberOfPax, selectedPackage?.duration?.day);
                            const total = qty * act.price;
                            
                            return (
                              <tr key={act.id}>
                                <td className="w-16 px-4 py-2 text-sm text-gray-900">{idx + 1}</td>
                                <td className="w-[35%] px-4 py-2 text-sm text-gray-900">{act.name}</td>
                                <td className="w-24 px-4 py-2 text-sm text-gray-900">{act.unit}</td>
                                <td className="w-24 px-4 py-2 text-sm text-gray-900">{qty}</td>
                                <td className="w-32 px-4 py-2 text-right text-sm text-gray-900">
                                  {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                  }).format(act.price)}
                                </td>
                                <td className="w-32 px-4 py-2 text-right text-sm text-gray-900">
                                  {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                  }).format(total)}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-gray-50 font-medium">
                          <tr>
                            <td colSpan="5" className="px-4 py-3 text-sm text-right text-gray-600">
                              Total Others Activities
                            </td>
                            <td className="px-4 py-3 text-sm text-right text-gray-800">
                              {formatCurrency(othersActivities.reduce((total, act) => {
                                const qty = calculateQuantity(act.formula, numberOfPax, selectedPackage?.duration?.day);
                                return total + (qty * act.price);
                              }, 0))}
                            </td>
                          </tr>
                        </tfoot>                        
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
  
          {/* Resource Requirements Section */}
          {/* Resource Requirements Section */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100">
          <SectionHeader 
              title="Resource Requirements"
              total={resourceInfo ? formatCurrency(
                (resourceInfo.price * selectedPackage.duration.day) + 
                (getCrewRate(resourceInfo, orderChannel) * selectedPackage.duration.day)
              ) : '-'}
              isExpanded={expandedSections.resource}
              onToggle={() => toggleSection('resource')}
            />
            {expandedSections.resource && (
              <div className="p-6">
                {resourceInfo && (
                  <div className="space-y-6">
                    {/* Vehicle Info */}
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <h4 className="font-medium text-gray-700 mb-3">Vehicle</h4>
                      <div className="grid gap-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type</span>
                          <span className="font-medium">{resourceInfo.car.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Pax Capacity</span>
                          <span className="font-medium">{resourceInfo.pax} Person</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price per Day</span>
                          <span className="font-medium">{formatCurrency(resourceInfo.price)}</span>
                        </div>
                        <div className="flex justify-between text-blue-600 font-medium border-t pt-2">
                          <span>Total Price ({selectedPackage.duration.day} days)</span>
                          <span>{formatCurrency(resourceInfo.price * selectedPackage.duration.day)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Crew Info */}
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <h4 className="font-medium text-gray-700 mb-3">Crew</h4>
                      <div className="grid gap-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type</span>
                          <span className="font-medium">{getCrewRole(resourceInfo, orderChannel)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rate per Day</span>
                          <span className="font-medium">{formatCurrency(getCrewRate(resourceInfo, orderChannel))}</span>
                        </div>
                        <div className="flex justify-between text-blue-600 font-medium border-t pt-2">
                          <span>Total Price ({selectedPackage.duration.day} days)</span>
                          <span>{formatCurrency(getCrewRate(resourceInfo, orderChannel) * selectedPackage.duration.day)}</span>
                        </div>
                      </div>
                    </div>
                    {/* Total */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-medium">
                        <span>Total Resource Requirements</span>
                        <span>{formatCurrency(
                          (resourceInfo.price * selectedPackage.duration.day) + 
                          (getCrewRate(resourceInfo, orderChannel) * selectedPackage.duration.day)
                        )}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
          <section className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6">
            <div className="space-y-4">
              {/* Total Expense */}
              <div className="flex justify-between items-center text-gray-600">
                <h3 className="text-lg font-medium">Total Expense</h3>
                <div className="text-lg">
                  {formatCurrency(calculateTotalExpense())}
                </div>
              </div>

              {/* Package Price */}
              <div className="flex justify-between items-center border-t pt-4 text-gray-600">
                <div>
                  <h3 className="text-lg font-medium">Package Price</h3>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(getPackagePrice() / numberOfPax)} × {numberOfPax} pax
                  </p>
                </div>
                <div className="text-lg">
                  {formatCurrency(getPackagePrice())}
                </div>
              </div>

              {/* Grand Total */}
              <div className="flex justify-between items-center border-t pt-4 text-blue-600 font-semibold">
                <h3 className="text-xl">Grand Total</h3>
                <div className="text-xl">
                  {formatCurrency(getPackagePrice())}
                </div>
              </div>

              {/* Profit */}
              <div className="flex justify-between items-center border-t pt-4 text-green-600 font-semibold">
                <h3 className="text-xl">Profit</h3>
                <div className="text-xl">
                  {formatCurrency(getPackagePrice() - calculateTotalExpense())}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  });
  const calculateQuantity = (formula, pax, day) => {
    try {
      // Replace variabel dalam formula dengan nilai aktual
      const formulaWithValues = formula
        .replace(/pax/g, pax || 0)
        .replace(/day/g, selectedPackage?.duration?.day || 0);
      
      // Evaluasi formula
      return eval(formulaWithValues);
    } catch (error) {
      console.error("Error calculating quantity:", error);
      return 0;
    }
  };
  const bookingDetailRef = useRef();
  // Searchable select states
  const [nationalitySearch, setNationalitySearch] = useState('');
  const [packageSearch, setPackageSearch] = useState('');
  const [showNationalityDropdown, setShowNationalityDropdown] = useState(false);
  const [showPackageDropdown, setShowPackageDropdown] = useState(false);
  
  // Refs for click outside handling
  const nationalityRef = useRef(null);
  const packageRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (nationalityRef.current && !nationalityRef.current.contains(event.target)) {
        setShowNationalityDropdown(false);
      }
      if (packageRef.current && !packageRef.current.contains(event.target)) {
        setShowPackageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter functions for searchable selects
  const filteredNationalities = data.nationality?.filter(nat =>
    nat.long_name.toLowerCase().includes(nationalitySearch.toLowerCase())
  );

  const filteredPackages = data.packages?.filter(pkg =>
    pkg.name.toLowerCase().includes(packageSearch.toLowerCase())
  );

  return (
    <Main>
      <div className="p-6">
        <div className="space-y-6">
          {/* Forms Section */}
            <form onSubmit={(e) => handleSubmit(e)} className="space-y-8">
              <div className="w-full">
                <h2 className="mb-6 text-xl text-black font-semibold">
                    Create Booking
                </h2>
                {/* Client Information */}
                <div className="bg-white shadow rounded-lg">
                  <div className="border-b border-gray-200 p-4">
                    <h2 className="text-lg font-semibold">Client Information</h2>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Customer Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Customer Name
                        </label>
                        <input
                          type="text"
                          value={formData.customerName}
                          onChange={(e) => handleInputChange('customerName', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Enter customer name"
                        />
                      </div>

                      {/* Nationality */}
                      <div ref={nationalityRef} className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nationality
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowNationalityDropdown(!showNationalityDropdown)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left flex justify-between items-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <span className="text-gray-700">
                            {formData.nationality ? 
                              data.nationality.find(n => n.id === formData.nationality)?.long_name : 
                              'Select nationality'
                            }
                          </span>
                          <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                        </button>

                        {showNationalityDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
                            <div className="p-2 border-b">
                              <div className="flex items-center bg-gray-50 rounded-md">
                                <Search className="h-4 w-4 text-gray-400 ml-2" />
                                <input
                                  type="text"
                                  className="w-full p-2 bg-transparent border-none focus:outline-none focus:ring-0"
                                  placeholder="Search nationality..."
                                  value={nationalitySearch}
                                  onChange={(e) => setNationalitySearch(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            </div>
                            <div className="max-h-60 overflow-auto">
                              {filteredNationalities.map((nat) => (
                                <div
                                  key={nat.id}
                                  className={`px-3 py-2 cursor-pointer flex items-center hover:bg-gray-50 
                                    ${formData.nationality === nat.id ? 'bg-blue-50' : ''}`}
                                  onClick={() => {
                                    handleInputChange('nationality', nat.id);
                                    setShowNationalityDropdown(false);
                                    setNationalitySearch('');
                                  }}
                                >
                                  <Check 
                                    className={`h-4 w-4 mr-2 ${
                                      formData.nationality === nat.id ? 'text-blue-500' : 'text-transparent'
                                    }`} 
                                  />
                                  <span>{nat.long_name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Phone Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Enter phone number"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>

                    {/* T-Shirt Sizes */}
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        T-Shirt Sizes
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.keys(formData.tShirtSizes).map((size) => (
                          <div key={size} className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-600 w-12">{size}</label>
                            <input
                              type="number"
                              min="0"
                              value={formData.tShirtSizes[size]}
                              onChange={(e) => handleTShirtSizeChange(size, e.target.value)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Information */}
                <div className="mt-6 bg-white shadow rounded-lg">
                  <div className="border-b border-gray-200 p-4">
                    <h2 className="text-lg font-semibold">Booking Information</h2>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Booking File */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Booking File
                        </label>
                        <input
                          type="file"
                          onChange={handleFileChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      {/* Trip Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Trip Date
                        </label>
                        <input
                          type="date"
                          value={formData.tripDate}
                          onChange={(e) => {
                            handleInputChange('tripDate', e.target.value)
                            setTripDate(e.target.value)                            
                          }
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      {/* Number of Pax */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Number of Pax
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.numberOfPax}
                          onChange={
                            (e) => {
                              handleInputChange('numberOfPax', parseInt(e.target.value))
                              setNumberOfPax(e.target.value)
                            }
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Enter number of passengers"
                        />
                      </div>

                      {/* Package Selection */}
                      <div ref={packageRef} className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Package
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPackageDropdown(!showPackageDropdown)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-left flex justify-between items-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <span className="text-gray-700">
                      {formData.package ? 
                        data.packages.find(p => p.id === formData.package)?.name : 
                        'Select package'
                      }
                    </span>
                    <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                  </button>

                  {showPackageDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
                      <div className="p-2 border-b">
                        <div className="flex items-center bg-gray-50 rounded-md">
                          <Search className="h-4 w-4 text-gray-400 ml-2" />
                          <input
                            type="text"
                            className="w-full p-2 bg-transparent border-none focus:outline-none focus:ring-0"
                            placeholder="Search package..."
                            value={packageSearch}
                            onChange={(e) => setPackageSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-auto">
                        {filteredPackages.map((pkg) => (
                          <div
                            key={pkg.id}
                            className={`px-3 py-2 cursor-pointer flex items-center hover:bg-gray-50 
                              ${formData.package === pkg.id ? 'bg-blue-50' : ''}`}
                            onClick={() => {
                              handleInputChange('package', pkg.id);
                              setSelectedPackage(data.packages.find(p => p.id === pkg.id));                 
                              setShowPackageDropdown(false);
                              setPackageSearch('');
                            }}
                          >
                            <Check 
                              className={`h-4 w-4 mr-2 ${
                                formData.package === pkg.id ? 'text-blue-500' : 'text-transparent'
                              }`} 
                            />
                            <span>{pkg.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                    </div>

                    {/* Pickup Details */}
                    <div className="mt-8">
                      <h3 className="text-md font-medium mb-4">Pickup Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pickup Location
                          </label>
                          <input
                            type="text"
                            value={formData.pickupLocation}
                            onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter pickup location"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pickup Time
                          </label>
                          <input
                            type="time"
                            value={formData.pickupTime}
                            onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Drop-off Details */}
                    <div className="mt-8">
                      <h3 className="text-md font-medium mb-4">Drop-off Details</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Drop-off Location
                          </label>
                          <input
                            type="text"
                            value={formData.dropLocation}
                            onChange={(e) => handleInputChange('dropLocation', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter drop-off location"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Drop-off Time
                          </label>
                          <input
                            type="time"
                            value={formData.dropTime}
                            onChange={(e) => handleInputChange('dropTime', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              <div>
              <Card>
                <CardHeader title="Selected Package Details" />
                <PackageDetailCard 
                    ref={bookingDetailRef}            
                    selectedPackage={selectedPackage} 
                    tripDate={tripDate}
                    numberOfPax={numberOfPax}
                    carConfiguration={data.car_configuration}
                    othersActivities={data.others_activities} // Tambahkan ini
                    orderChannel={data.order_channel} // Tambahkan ini
                    />
              </Card>
              </div>
                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Create Booking
                  </button>
                </div>
            </form>
          </div>
        </div>
    </Main>
  );
};

export default Create;
import React, { useState, useRef, useEffect } from 'react';
import Main from '@/Layouts/Main';
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
  const PackageDetailCard = ({ selectedPackage, tripDate, numberOfPax, carConfiguration, othersActivities,orderChannel }) => {
    const [expandedSections, setExpandedSections] = useState({
      itinerary: false,
      activities: false,
      others: false,
      resource: false
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

    const getResourceInfo = () => {
        if (!numberOfPax || !carConfiguration) return null;
        return carConfiguration.find(config => config.pax === parseInt(numberOfPax));
    };
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
      return (resourceInfo.price * selectedPackage.duration.day) + 
             (resourceInfo.crew_klook_role.rate * selectedPackage.duration.day);
    };
    const calculateTotalExpense = () => {
      const activitiesTotal = calculateActivitiesTotal();
      const othersTotal = calculateOthersActivitiesTotal();
      const resourceTotal = calculateResourceTotal();
      
      return activitiesTotal + othersTotal + resourceTotal;
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
              total={resourceInfo ? formatCurrency((resourceInfo.price * selectedPackage.duration.day) + (resourceInfo.crew_klook_role.rate * selectedPackage.duration.day)) : '-'}
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
                          <span className="font-medium">{resourceInfo.crew_klook_role.role}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rate per Day</span>
                          <span className="font-medium">{formatCurrency(resourceInfo.crew_klook_role.rate)}</span>
                        </div>
                        <div className="flex justify-between text-blue-600 font-medium border-t pt-2">
                          <span>Total Price ({selectedPackage.duration.day} days)</span>
                          <span>{formatCurrency(resourceInfo.crew_klook_role.rate * selectedPackage.duration.day)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-lg font-medium">
                        <span>Total Resource Requirements</span>
                        <span>{formatCurrency(
                          (resourceInfo.price * selectedPackage.duration.day) + 
                          (resourceInfo.crew_klook_role.rate * selectedPackage.duration.day)
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
  };
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
  return (
    <Main>
      <div className="p-6">
        <div className="space-y-6">
          {/* Forms Section */}
          <div className="w-full">
            <h2 className="mb-6 text-xl text-black font-semibold">
                Create Booking
            </h2>

            {/* Customer Information Card */}
            <Card className="mb-6">
              <CardHeader title="Customer Information" />
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Customer Name">
                    <Input placeholder="Enter customer name" />
                  </FormField>

                  <FormField label="Nationality">
                    <SearchableSelect
                      options={data.nationality}
                      value={selectedNationality}
                      onChange={setSelectedNationality}
                      placeholder="Select nationality"
                      searchValue={searchNationality}
                      onSearchChange={setSearchNationality}
                      open={openNationality}
                      setOpen={setOpenNationality}
                      displayKey="long_name"
                    />
                  </FormField>

                  <FormField label="Phone Number">
                    <Input type="tel" placeholder="Enter phone number" />
                  </FormField>

                  <FormField label="Email">
                    <Input type="email" placeholder="Enter email address" />
                  </FormField>
                </div>

                <FormField label="T-Shirt Sizes" className="mt-4">
                  <TShirtSizes />
                </FormField>
              </div>
            </Card>

            {/* Booking Information Card */}
            <Card>
              <CardHeader title="Booking Information" />
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Booking File">
                    <Input type="file" className="bg-white" />
                  </FormField>

                  <FormField label="Trip Date">
                  <Input 
                        type="date" 
                        value={tripDate}
                        onChange={(e) => setTripDate(e.target.value)}
                    />
                  </FormField>

                  <FormField label="Number of Pax">
                    <Input 
                        type="number" 
                        min="1" 
                        value={numberOfPax}
                        onChange={(e) => setNumberOfPax(e.target.value)}
                        placeholder="Enter number of passengers" 
                    />
                    </FormField>
                  <FormField label="Package">
                    <SearchableSelect
                      options={data.packages}
                      value={selectedPackage?.id}
                      onChange={(id) => setSelectedPackage(data.packages.find(p => p.id === id))}
                      placeholder="Select package"
                      searchValue={searchPackage}
                      onSearchChange={setSearchPackage}
                      open={openPackage}
                      setOpen={setOpenPackage}
                      displayKey="name"
                    />
                  </FormField>
                </div>

                {/* Pickup Details */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium mb-4">Pickup Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Pickup Location">
                      <Input type="text" placeholder="Select pickup location" />
                    </FormField>

                    <FormField label="Pickup Time">
                      <Input type="time" />
                    </FormField>
                  </div>
                </div>

                {/* Drop-off Details */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium mb-4">Drop-off Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField label="Drop-off Location">
                      <Input type="text" placeholder="Select drop-off location" />
                    </FormField>

                    <FormField label="Drop-off Time">
                      <Input type="time" />
                    </FormField>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          <Card>
            <CardHeader title="Selected Package Details" />
            <PackageDetailCard 
                selectedPackage={selectedPackage} 
                tripDate={tripDate}
                numberOfPax={numberOfPax}
                carConfiguration={data.car_configuration}
                othersActivities={data.others_activities} // Tambahkan ini
                orderChannel={data.order_channel} // Tambahkan ini
                />
            </Card>
          </div>
        </div>
    </Main>
  );
};

export default Create;
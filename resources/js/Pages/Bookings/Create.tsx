import React, { useState, useRef, useEffect } from 'react';
import Main from '@/Layouts/Main';
import { Check, ChevronsUpDown, Search } from 'lucide-react';

const Create = ({ data }) => {
    const [tripDate, setTripDate] = useState('');  // Tambahkan ini
    const [numberOfPax, setNumberOfPax] = useState('');
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
  const PackageDetailCard = ({ selectedPackage, tripDate, numberOfPax, carConfiguration }) => {
    if (!selectedPackage) return (
      <div className="p-6">
        <p className="text-gray-500">Select a package to view details</p>
      </div>
    );

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

    return (
      <div className="p-6 space-y-6">
        {/* Basic Package Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="text-sm font-medium text-blue-600">Package Name</h3>
              <p className="mt-1 text-gray-800">{selectedPackage.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-600">Duration</h3>
              <p className="mt-1 text-gray-800">{selectedPackage.duration.name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-600">Category</h3>
              <p className="mt-1 text-gray-800">{selectedPackage.category.name}</p>
            </div>
          </div>
        </div>

        {/* Daily Itinerary */}
        <div className="space-y-4">
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

        {/* Activities Section */}
        {selectedPackage.itinerary.map((day) => {
        const hasDestinationActivities = day.itinerary_destination?.destination?.activity?.length > 0;
        const hasSecondDestinationActivities = day.itinerary_destination?.second_destination?.activity?.length > 0;

        if (hasDestinationActivities || hasSecondDestinationActivities) {
            return (
            <div key={`activities-${day.day}`} className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
                {/* <h3 className="text-lg font-medium text-gray-800 mb-4">Activities Day {day.day}</h3> */}
                
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
                            <th className="w-[45%] px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="w-24 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                            <th className="w-32 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {day.itinerary_destination.destination.activity.map((act, idx) => (
                            <tr key={act.id}>
                            <td className="px-4 py-2 text-sm text-gray-900">{idx + 1}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{act.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{act.unit}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                                {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                                }).format(act.price)}
                            </td>
                            </tr>
                        ))}
                        </tbody>
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
                            <th className="w-[45%] px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="w-24 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                            <th className="w-32 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {day.itinerary_destination.second_destination.activity.map((act, idx) => (
                            <tr key={act.id}>
                            <td className="px-4 py-2 text-sm text-gray-900">{idx + 1}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{act.name}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">{act.unit}</td>
                            <td className="px-4 py-2 text-sm text-gray-900">
                                {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                                }).format(act.price)}
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                </div>
                )}
            </div>
            );
        }
        return null;
        })}        
        {/* Others Activities */}
        {data.others_activities && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mt-4">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Others Activities</h3>
                <div className="overflow-x-auto">
                <table className="w-full divide-y divide-gray-200 bg-white rounded-lg">
                    <thead className="bg-gray-50">
                    <tr>
                        <th className="w-16 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                        <th className="w-[45%] px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="w-24 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                        <th className="w-32 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                    {data.others_activities.map((act, idx) => (
                        <tr key={idx}>
                        <td className="w-16 px-4 py-2 text-sm text-gray-900">{idx + 1}</td>
                        <td className="w-[45%] px-4 py-2 text-sm text-gray-900">{act.name}</td>
                        <td className="w-24 px-4 py-2 text-sm text-gray-900">{act.unit}</td>
                        <td className="w-32 px-4 py-2 text-sm text-gray-900">
                            {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                            }).format(act.price)}
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>
            </div>
        )}
        
        {/* Resource Requirements */}
        {resourceInfo && (
            <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Resource Requirements</h3>
                <div className="space-y-4">
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                    <div>
                    <span className="text-sm font-medium text-gray-600">Pax:</span>
                    <span className="ml-2 text-gray-800">{resourceInfo.pax} Person</span>
                    </div>
                    <div>
                    <span className="text-sm font-medium text-gray-600">Vehicle:</span>
                    <span className="ml-2 text-gray-800">{resourceInfo.car.name}</span>
                    </div>
                    <div>
                    <span className="text-sm font-medium text-gray-600">Crew Type:</span>
                    <span className="ml-2 text-gray-800">
                        {resourceInfo.crew_klook_role?.role || 
                        resourceInfo.crew_jvto_role?.role || 
                        resourceInfo.crew_twt_role?.role}
                    </span>
                    </div>
                    <div>
                    <span className="text-sm font-medium text-gray-600">Price:</span>
                    <span className="ml-2 text-gray-800">
                        {new Intl.NumberFormat('id-ID', { 
                        style: 'currency', 
                        currency: 'IDR',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0
                        }).format(resourceInfo.price)}
                    </span>
                    </div>
                </div>
                </div>
            </div>
        )}        
      </div>
    );
  };

  return (
    <Main>
      <div className="p-6">
        <div className="space-y-6">
          {/* Forms Section */}
          <div className="w-full">
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
                />
            </Card>
          </div>
        </div>
    </Main>
  );
};

export default Create;
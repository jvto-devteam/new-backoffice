import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import Authenticated from '@/Layouts/Main';
import { Head } from '@inertiajs/react';
import CurrencyInput from 'react-currency-input-field';
import { Card } from '@/components/ui/card';
import { Check, ChevronsUpDown,X,ChevronDown,ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import Swal from '@/utils/swal';
import { Button } from "@/components/ui/button";
import SearchableSelect from '@/components/SearchableSelect';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const LocationForm = ({ type, value, onChange, className = '' }) => {
    const [location, setLocation] = useState(value?.location || '');
    const [locationOpen, setLocationOpen] = useState(false);
    const [terminalOpen, setTerminalOpen] = useState(false);
    const [stationOpen, setStationOpen] = useState(false);
    
    const [additionalInfo, setAdditionalInfo] = useState({
        terminal: value?.terminal || '',
        ticketNumber: value?.ticketNumber || '',
        station: value?.station || '',
        hotelName: value?.hotelName || '',
        customLocation: value?.customLocation || '',
    });

    const locationOptions = [
        { id: 'Surabaya Airport', name: 'Surabaya Airport' },
        { id: 'Surabaya Train Station', name: 'Surabaya Train Station' },
        { id: 'Surabaya Hotel', name: 'Surabaya Hotel' },
        { id: 'Denpasar Airport', name: 'Denpasar Airport' },
        { id: 'Bali Hotel', name: 'Bali Hotel' },
        { id: 'Others', name: 'Others' }
    ];

    const terminalOptions = [
        { id: 'Terminal 1', name: 'Terminal 1' },
        { id: 'Terminal 2', name: 'Terminal 2' }
    ];

    const stationOptions = [
        { id: 'Gubeng Station', name: 'Gubeng Station' },
        { id: 'Pasar Turi Station', name: 'Pasar Turi Station' }
    ];

    useEffect(() => {
        onChange({
            location,
            ...additionalInfo
        });
    }, [location, additionalInfo]);

    const handleAdditionalInfoChange = (field, value) => {
        setAdditionalInfo(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const renderAdditionalFields = () => {
        switch (location) {
            case 'Surabaya Airport':
            case 'Denpasar Airport':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Terminal</label>
                            <SearchableSelect 
                                options={terminalOptions}
                                value={additionalInfo.terminal}
                                onChange={(value) => handleAdditionalInfoChange('terminal', value)}
                                placeholder="Select terminal"
                                open={terminalOpen}
                                setOpen={setTerminalOpen}
                                displayKey="name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Flight Ticket Number</label>
                            <input
                                type="text"
                                value={additionalInfo.ticketNumber}
                                onChange={(e) => handleAdditionalInfoChange('ticketNumber', e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                                placeholder="Enter flight ticket number"
                            />
                        </div>
                    </div>
                );

            case 'Surabaya Train Station':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Station</label>
                            <SearchableSelect 
                                options={stationOptions}
                                value={additionalInfo.station}
                                onChange={(value) => handleAdditionalInfoChange('station', value)}
                                placeholder="Select station"
                                open={stationOpen}
                                setOpen={setStationOpen}
                                displayKey="name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Train Ticket Number</label>
                            <input
                                type="text"
                                value={additionalInfo.ticketNumber}
                                onChange={(e) => handleAdditionalInfoChange('ticketNumber', e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                                placeholder="Enter train ticket number"
                            />
                        </div>
                    </div>
                );

            case 'Surabaya Hotel':
            case 'Bali Hotel':
                return (
                    <div className="space-y-2 mt-4">
                        <label className="block text-sm font-medium text-gray-700">Hotel Name</label>
                        <input
                            type="text"
                            value={additionalInfo.hotelName}
                            onChange={(e) => handleAdditionalInfoChange('hotelName', e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                            placeholder="Enter hotel name"
                        />
                    </div>
                );

            case 'Others':
                return (
                    <div className="space-y-2 mt-4">
                        <label className="block text-sm font-medium text-gray-700">Custom Location</label>
                        <input
                            type="text"
                            value={additionalInfo.customLocation}
                            onChange={(e) => handleAdditionalInfoChange('customLocation', e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                            placeholder="Enter location details"
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className={className}>
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">{type} Location</label>
                <SearchableSelect 
                    options={locationOptions}
                    value={location}
                    onChange={setLocation}
                    placeholder={`Select ${type} location`}
                    open={locationOpen}
                    setOpen={setLocationOpen}
                    displayKey="name"
                />
            </div>
            {renderAdditionalFields()}
        </div>
    );
};

const typeOptions = [
  { value: 1, label: 'Regular' },
  { value: 2, label: 'Student' },
];


const discountTypes = [
  { value: 'percent', label: 'Percent' },
  { value: 'nominal', label: 'Nominal' }
];

const AddBooking = ({channel,countries,packages,startActivityOptions,endActivityOptions,hotelOptions,hotelRoomOptions,addOns,discountCodes}) => {
  const [searchValues, setSearchValues] = useState({
    country: "",
    package: "",
    addOns: ""
  });  

  const [openType, setOpenType] = useState(false);
  const [openCountry, setOpenCountry] = useState(false);
  const [openPackage, setOpenPackage] = useState(false);
  const [openAddOns, setOpenAddOns] = useState(false);
  const [activityDropdowns, setActivityDropdowns] = useState({});
  const [expandedDays, setExpandedDays] = useState({});    
  const [currentStep, setCurrentStep] = useState(1);
  const [isCustomPackage, setIsCustomPackage] = useState(false);
  const [customPackageDuration, setCustomPackageDuration] = useState('');  
  const [addOnItems, setAddOnItems] = useState([]);
  const [isCustomDiscount, setIsCustomDiscount] = useState(false);
  const [discountData, setDiscountData] = useState({
      id : '',
      type: '',
      code: '',
      value: 0
  });
  const [isShuttle, setIsShuttle] = useState(false); 
  
  const [formData, setFormData] = useState({
    channel: channel,   
    customer: '',
    numOfPax: '',
    bookingDate: '',
    travelDate: '',
    email: '',
    phone: '',
    nationality: '',
    type: 1,
    tripDate: '',
    dateOfIssue: '',
    dueDate: '',
    sizes: {
      xss: 0,
      xxs: 0,
      xs: 0,
      s: 0,
      m: 0,
      l: 0,
      xl: 0,
      xxl: 0,
      xxxl: 0
    },
    pickupLocation: {
      location: '',
      terminal: '',
      ticketNumber: '',
      station: '',
      hotelName: '',
      customLocation: ''
    },
    pickupTime: '',
    dropLocation: {
      location: '',
      terminal: '',
      ticketNumber: '',
      station: '',
      hotelName: '',
      customLocation: ''
    },
    dropTime: '',
    packageName: '',
    addOns: [],
    discountCode: '',
    packageDays: [],  
    pricePerPax : 0,
    totalPrice : 0,    
    bookingCodeOrigin: '',
    bookingFileOrigin: null,     
    isShuttle: false,
    isSendWa: false,    
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSizeChange = (size, value) => {
    setFormData(prev => ({
      ...prev,
      sizes: {
        ...prev.sizes,
        [size]: parseInt(value) || 0
      }
    }));
  };

  const handleSearchValueChange = (type, value) => {
    setSearchValues(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const toggleActivityDropdown = (dayIndex, type) => {
      setActivityDropdowns(prev => ({
          ...prev,
          [`${dayIndex}-${type}`]: !prev[`${dayIndex}-${type}`]
      }));
  };  

  const getPackageDays = (packageValue) => {
    const selectedPackage = packages.find(pkg => pkg.value === packageValue);
    return selectedPackage ? selectedPackage.day : 0;
  };

  const RoomSelection = ({ dayIndex, roomIndex, roomSelection, onChange, onDelete }) => {
    return (
        <div className="flex gap-4 items-start">
            <div className="flex-1">
                <SearchableSelect 
                    options={roomOptions}
                    value={roomSelection.room}
                    onChange={(value) => onChange(dayIndex, roomIndex, 'room', value)}
                    placeholder="Select room type"
                    open={roomSelection.isOpen} // Tambahkan state untuk setiap room selection
                    setOpen={(value) => onChange(dayIndex, roomIndex, 'isOpen', value)}
                    displayKey="name"
                />
            </div>
            <div className="w-24">
                <input
                    type="number"
                    value={roomSelection.quantity}
                    onChange={(e) => onChange(dayIndex, roomIndex, 'quantity', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Qty"
                    min="1"
                />
            </div>
            <button
                type="button"
                onClick={() => onDelete(dayIndex, roomIndex)}
                className="p-2 text-red-500 hover:text-red-700"
            >
                <X className="h-5 w-5" />
            </button>
        </div>
    );
  };

  const [dropdownState, setDropdownState] = useState({});

  // Helper function untuk mengontrol dropdown
  const toggleDropdown = (dayIndex, field) => {
      setDropdownState(prev => {
          // Tutup semua dropdown dulu
          const newState = {};
          // Buka/tutup dropdown yang diklik
          newState[`${dayIndex}-${field}`] = !prev[`${dayIndex}-${field}`];
          return newState;
      });
  };
  
  // Fungsi untuk mengecek apakah dropdown tertentu sedang terbuka
  const isDropdownOpen = (dayIndex, field) => {
      return !!dropdownState[`${dayIndex}-${field}`];
  };

  const [dropdowns, setDropdowns] = useState({});

  const handleDropdownChange = (identifier, value) => {
      setDropdowns(prev => ({
          ...prev,
          [identifier]: value
      }));
  };

  const toggleDayExpansion = (dayIndex) => {
      setExpandedDays(prev => ({
          ...prev,
          [dayIndex]: !prev[dayIndex]
      }));
  };

  const getPricePerPax = (packagePrices, numOfPax) => {
    // Cari harga yang sesuai dengan jumlah pax
    const matchedPrice = packagePrices.find(price => {
      // Jika end adalah 0, berarti tidak ada batas atas
      if (price.end === 0) {
        return numOfPax >= price.start;
      }
      // Cek apakah jumlah pax berada di antara start dan end
      return numOfPax >= price.start && numOfPax <= price.end;
    });
  
    // Kembalikan harga per pax, default 0 jika tidak ditemukan
    return matchedPrice ? matchedPrice.pricePerPax : 0;
  };

  const addAddOnItem = () => {
    setAddOnItems([...addOnItems, {
        addOn: '',
        price: 0,
        qty: 1,
        subtotal: 0
    }]);
  };

  const removeAddOnItem = (indexToRemove) => {
      setAddOnItems(addOnItems.filter((_, index) => index !== indexToRemove));
  };

  const updateAddOnItem = (index, field, value) => {
      const updatedAddOnItems = [...addOnItems];
      
      if (field === 'addOn') {
          // Cari harga default untuk add-on yang dipilih
          const selectedAddOn = addOns.find(addon => addon.value === value);
          updatedAddOnItems[index] = {
              addOn: value,
              price: selectedAddOn ? selectedAddOn.defaultPrice : 0,
              qty: 1,
              subtotal: selectedAddOn ? selectedAddOn.defaultPrice : 0
          };
      } else if (field === 'price') {
          // Update harga dan subtotal
          updatedAddOnItems[index] = {
              ...updatedAddOnItems[index],
              price: value || 0,
              subtotal: (value || 0) * updatedAddOnItems[index].qty
          };
      } else if (field === 'qty') {
          // Update qty dan subtotal
          updatedAddOnItems[index] = {
              ...updatedAddOnItems[index],
              qty: value || 1,
              subtotal: updatedAddOnItems[index].price * (value || 1)
          };
      }

      setAddOnItems(updatedAddOnItems);
  };
  
  const calculateDiscount = (totalPackage) => {
      const { type, value } = discountData;

      if (type === 'percent') {
          return Math.floor(totalPackage * (value / 100));
      } else if (type === 'nominal') {
          return Math.min(value, totalPackage);
      }
      return 0;
  };

  const calculateSummary = () => {
    // For TWT, calculate price per pax by dividing total price by number of pax
    if (channel === 'TWT') {
      const totalPackage = parseInt(formData.totalPrice) || 0;
      const numOfPax = formData.numOfPax || 1;
      const pricePerPax = formData.pricePerPax;
      
      
      // Calculate total add-on
      const totalAddOn = addOnItems.reduce((total, item) => total + item.subtotal, 0);
      // Calculate discount
      const discount = calculateDiscount(totalPackage);
      
      // Calculate grand total
      const grandTotal = totalPackage + totalAddOn - discount;
  
      return {
        pricePerPax: pricePerPax, // Total price divided by number of pax
        totalPackage,
        totalAddOn,
        discount,
        subTotal: totalPackage + totalAddOn,
        grandTotal
      };
    }
  
    // Existing calculation for other channels
    const pricePerPax = parseInt(formData.pricePerPax) || 0;
    const numOfPax = formData.numOfPax || 1;
    
    // Total package calculation
    const totalPackage = pricePerPax * numOfPax;
    
    // Calculate total add-on
    const totalAddOn = addOnItems.reduce((total, item) => total + item.subtotal, 0);
    
    // Calculate discount
    const discount = calculateDiscount(totalPackage);
    
    // Calculate grand total
    const subTotal = totalPackage + totalAddOn;
    const grandTotal = subTotal - discount;
  
    return {
      pricePerPax,
      totalPackage,
      totalAddOn,
      discount,
      subTotal,
      grandTotal
    };
  };

  useEffect(() => {
    if (formData.packageName && !isCustomPackage) {
      const selectedPackage = packages.find(pkg => pkg.value === formData.packageName);
      if (selectedPackage) {
        const pricePerPax = getPricePerPax(selectedPackage.prices, formData.numOfPax || 2);
        setFormData(prev => ({
          ...prev,
          pricePerPax: pricePerPax
        }));
      }
    }
  }, [formData.numOfPax, formData.packageName, isCustomPackage]);

  useEffect(() => {
    setFormData(prev => ({
        ...prev,
        addOns: addOnItems
    }));
  }, [addOnItems]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      channel
    }));
  }, [channel]);  

  console.log(channel);
  
  const renderStep1 = () => {
    // Function to check if a field should be rendered based on channel
    const shouldRenderField = (fieldName) => {
      switch (channel) {
        case 'KLOOK':
          const klookExcludedFields = ['type', 'dueDate'];
          return !klookExcludedFields.includes(fieldName);
        case 'JVTO':
          return true;
        case 'TWT':
          const twtAllowedFields = [
            'customer', 
            'numOfPax', 
            'travelDate', 
            'bookingDate', 
            'bookingCodeOrigin', 
            'bookingFileOrigin',
            'sizes'
          ];
          return twtAllowedFields.includes(fieldName);
        default:
          return true;
      }
    };
  
    return (
      <div className="space-y-6 border rounded-lg">
        <div className="bg-gray-800 text-white p-4 rounded-t-lg">
          <h2 className="text-lg font-semibold">Customer Information</h2>
        </div>
        <div className="space-y-6 p-6 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shouldRenderField('customer') && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                <input
                  type="text"
                  name="customer"
                  value={formData.customer}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter customer name"
                />
              </div>
            )}
  
            {shouldRenderField('numOfPax') && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Number of Pax</label>
                <input
                  type="number"
                  name="numOfPax"
                  value={formData.numOfPax}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter number of pax"
                />
              </div>
            )}
  
            {shouldRenderField('travelDate') && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Travel Date</label>
                <input
                  type="date"
                  name="travelDate"
                  value={formData.travelDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shouldRenderField('email') && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter email address"
                />
              </div>
            )}
  
            {shouldRenderField('phone') && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter phone number"
                />
              </div>
            )}
  
            {shouldRenderField('nationality') && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Nationality</label>
                <SearchableSelect 
                  options={countries.map(country => ({
                    id: country.value,
                    name: country.label
                  }))}
                  value={formData.nationality}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    nationality: value
                  }))}
                  placeholder="Select country"
                  open={openCountry}
                  setOpen={setOpenCountry}
                  displayKey="name"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {shouldRenderField('type') && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <SearchableSelect 
                  options={typeOptions.map(type => ({
                    id: type.value,
                    name: type.label
                  }))}
                  value={formData.type}
                  onChange={(value) => setFormData(prev => ({
                    ...prev,
                    type: value
                  }))}
                  placeholder="Select type"
                  open={openType}
                  setOpen={setOpenType}
                  displayKey="name"
                />
              </div>
            )}
            {shouldRenderField('bookingDate') && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Booking Date</label>
                <input
                  type="date"
                  name="bookingDate"
                  value={formData.bookingDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
              </div>
            )}
            {(channel === 'KLOOK' || channel === 'TWT') && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Booking Code (Origin)</label>
                <input
                  type="text"
                  name="bookingCodeOrigin"
                  value={formData.bookingCodeOrigin}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter booking code"
                />
              </div>
            )}
            {(channel === 'KLOOK' || channel === 'TWT') && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Booking File (Origin)</label>
                <input
                  type="file"
                  name="bookingFileOrigin"
                  onChange={(e) => {
                    setFormData(prev => ({
                      ...prev,
                      bookingFileOrigin: e.target.files[0]
                    }));
                  }}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
              </div>
            )}
            {shouldRenderField('dueDate') && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
              </div>
            )}
          </div>
    
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Tshirt Distribution</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-9 md:grid-cols-6 gap-4">
              {Object.entries(formData.sizes).map(([size, value]) => (
                <div key={size} className="space-y-2">
                  <label className="block text-xs font-medium text-gray-600 uppercase">{size}</label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => handleSizeChange(size, e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                    min="0"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStep2 = () => (
    <div className="space-y-6 border rounded-lg">
      <div className="bg-gray-800 text-white p-4 rounded-t-lg">
        <h2 className="text-lg font-semibold">Pickup & Drop Point</h2>
      </div>
      <div className="space-y-6 p-6 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <LocationForm 
              type="Pickup"
              value={formData.pickupLocation}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                pickupLocation: value
              }))}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Pickup Time</label>
            <input
              type="time"
              name="pickupTime"
              value={formData.pickupTime}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <LocationForm 
              type="Drop"
              value={formData.dropLocation}
              onChange={(value) => setFormData(prev => ({
                ...prev,
                dropLocation: value
              }))}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Drop Time</label>
            <input
              type="time"
              name="dropTime"
              value={formData.dropTime}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
            />
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
            <label className="block text-sm font-medium text-gray-700">
                Shuttle Service
            </label>
            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                <input
                    type="checkbox"
                    name="shuttle"
                    id="shuttle-toggle"
                    checked={isShuttle}
                    onChange={() => {
                        setIsShuttle(!isShuttle);
                        // Reset atau set shuttle-related data if needed
                        setFormData(prev => ({
                            ...prev,
                            isShuttle: !isShuttle
                        }));
                    }}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                />
                <label
                    htmlFor="shuttle-toggle"
                    className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                        isShuttle 
                            ? 'bg-blue-500' 
                            : 'bg-gray-300'
                    }`}
                />
            </div>
        </div>        
      </div>
    </div>
  );
  const renderStep3 = () => {
    const handlePackageSelection = (value) => {
      const selectedPackage = packages.find(pkg => pkg.value === value);
      
      if (channel === 'TWT') {
        // Existing TWT specific logic
        const totalPrice = selectedPackage.prices[0].pricePerPax * (formData.numOfPax || 1);
        
        setFormData(prev => ({
          ...prev,
          packageName: value,
          pricePerPax: totalPrice,
          packageDays: Array(selectedPackage.prices[0].start).fill().map(() => ({
            startActivity: '',
            endActivity: '',
            itinerary: '',
            hotel: '',
            meals: {
              breakfast: true,
              lunch: false,
              dinner: false
            },
            rooms: [{ 
              room: '',
              quantity: 1
            }]
          }))
        }));
      } else {
        // For other channels
        const packageDays = getPackageDays(value);
        
        setFormData(prev => {
          const pricePerPax = selectedPackage 
            ? getPricePerPax(selectedPackage.prices, prev.numOfPax || 2) 
            : 0;
          
          // Create packageDays array with data from selected package
          const mappedPackageDays = Array(packageDays).fill().map((_, index) => {
            // Find itinerary data for current day
            const dayItinerary = selectedPackage.itineraries.find(it => it.day === index + 1);
            // Find hotel data for current day
            const dayHotel = selectedPackage.hotels.find(h => h.day === index + 1);
            
            return {
              startActivity: dayItinerary ? dayItinerary.activity_start_id : '',
              endActivity: dayItinerary ? dayItinerary.activity_end_id : '',
              itinerary: dayItinerary ? dayItinerary.itinerary : '',
              hotel: dayHotel ? dayHotel.hotel_id : '',
              meals: {
                breakfast: true,
                lunch: false,
                dinner: false
              },
              rooms: [{ 
                room: '',
                quantity: 1
              }]
            };
          });
    
          return {
            ...prev,
            packageName: value,
            pricePerPax: pricePerPax,
            packageDays: mappedPackageDays
          };
        });
      }
    };  
    const handleActivityChange = (dayIndex, field, value) => {
      setFormData(prev => {
          const updatedDays = [...prev.packageDays];
          if (!updatedDays[dayIndex]) {
              updatedDays[dayIndex] = {};
          }
          
          // Dapatkan itinerary dari aktivitas yang dipilih
          const selectedActivity = field === 'startActivity' 
          ? startActivityOptions.find(activity => activity.id === value)
          : endActivityOptions.find(activity => activity.id === value)          
          // Update aktivitas
          updatedDays[dayIndex][field] = value;
          
          // Generate itinerary gabungan jika kedua aktivitas sudah dipilih
          if (field === 'startActivity') {
            const endActivity = updatedDays[dayIndex].endActivity;
            const startItinerary = selectedActivity ? selectedActivity.itinerary : '';
            const endItinerary = endActivity 
              ? endActivityOptions.find(activity => activity.id === endActivity)?.itinerary 
              : '';
            
            updatedDays[dayIndex].itinerary = endItinerary
              ? `${startItinerary} - ${endItinerary}`
              : startItinerary;
          } else if (field === 'endActivity') {
            const startActivity = updatedDays[dayIndex].startActivity;
            const endItinerary = selectedActivity ? selectedActivity.itinerary : '';
            const startItinerary = startActivity 
              ? startActivityOptions.find(activity => activity.id === startActivity)?.itinerary 
              : '';
            
            updatedDays[dayIndex].itinerary = startItinerary
              ? `${startItinerary} - ${endItinerary}`
              : endItinerary;
          }
      
  
          return { ...prev, packageDays: updatedDays };
      });
    };
  
    const handleRoomChange = (dayIndex, roomIndex, field, value) => {
      setFormData(prev => {
          const updatedDays = [...prev.packageDays];
          if (!updatedDays[dayIndex].rooms) {
              updatedDays[dayIndex].rooms = [];
          }
          if (!updatedDays[dayIndex].rooms[roomIndex]) {
              updatedDays[dayIndex].rooms[roomIndex] = { room: '', quantity: 1 };
          }
          
          // Jika field adalah 'room', reset room jika hotel berubah
          if (field === 'room') {
              updatedDays[dayIndex].rooms[roomIndex] = {
                  room: value,
                  quantity: 1
              };
          } else {
              updatedDays[dayIndex].rooms[roomIndex] = {
                  ...updatedDays[dayIndex].rooms[roomIndex],
                  [field]: value
              };
          }
          
          return { ...prev, packageDays: updatedDays };
      });
    };    
  
    const addRoom = (dayIndex) => {
        setFormData(prev => {
            const updatedDays = [...prev.packageDays];
            if (!updatedDays[dayIndex].rooms) {
                updatedDays[dayIndex].rooms = [];
            }
            updatedDays[dayIndex].rooms.push({ 
                room: '', 
                quantity: 1
            });
            return { ...prev, packageDays: updatedDays };
        });
    };
  
    const deleteRoom = (dayIndex, roomIndex) => {
        setFormData(prev => {
            const updatedDays = [...prev.packageDays];
            updatedDays[dayIndex].rooms.splice(roomIndex, 1);
            return { ...prev, packageDays: updatedDays };
        });
    };
  
    return (
      <div className="space-y-6 border rounded-lg">
        <div className="bg-gray-800 text-white p-4 rounded-t-lg">
          <h2 className="text-lg font-semibold">Package Selection</h2>
        </div>
        <div className="space-y-6 p-6 pt-0">
          {/* For TWT, disable custom package and force package selection */}
          {channel === 'TWT' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Package Duration (Days)
                </label>
                <input
                    type="number"
                    value={customPackageDuration}
                    onChange={(e) => {
                    const duration = Math.max(1, parseInt(e.target.value) || 1);
                    setCustomPackageDuration(duration);
                    setFormData(prev => ({
                        ...prev,
                        packageName: 'Custom',
                        packageDays: Array(duration).fill().map(() => ({
                        startActivity: '',
                        endActivity: '',
                        itinerary: '',
                        hotel: '',
                        meals: {
                            breakfast: true,
                            lunch: false,
                            dinner: false
                        },
                        rooms: [{ 
                            room: '',
                            quantity: 1
                        }]
                        }))
                    }));
                    }}
                    min="1"
                    max="10"
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Enter number of days"
                />
                </div>

                <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                    Total Price (IDR)
                </label>
                <CurrencyInput
                    id="total-price"
                    name="totalPrice"
                    prefix="Rp "
                    decimalSeparator=","
                    groupSeparator="."
                    value={formData.totalPrice}
                    onValueChange={(value) => {
                    setFormData(prev => ({
                        ...prev,
                        totalPrice: value || 0,
                        pricePerPax: ((value || 0) / (prev.numOfPax || 1)).toFixed(0) // Hitung price per pax
                    }));
                    }}
                    className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    placeholder="Enter total price"
                />
                </div>
            </div>
            )}  
          {/* Existing package selection for other channels */}
          {channel !== 'TWT' && (
            <>
                <div className="flex items-center justify-between mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                        Custom Package
                    </label>
                    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                        <input
                        type="checkbox"
                        name="toggle"
                        id="custom-package-toggle"
                        checked={isCustomPackage}
                        onChange={() => {
                            setIsCustomPackage(!isCustomPackage);
                            // Reset package selection and price
                            setFormData(prev => ({
                            ...prev,
                            packageName: '',
                            packageDays: [],
                            pricePerPax: 0
                            }));
                        }}
                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                        />
                        <label
                        htmlFor="custom-package-toggle"
                        className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                            isCustomPackage 
                            ? 'bg-blue-500' 
                            : 'bg-gray-300'
                        }`}
                        />
                    </div>
                </div>
                {!isCustomPackage ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Package Name
                        </label>
                        <SearchableSelect 
                            options={packages.map(pkg => ({
                            id: pkg.value,
                            name: pkg.label
                            }))}
                            value={formData.packageName}
                            onChange={handlePackageSelection}
                            placeholder="Select package"
                            open={openPackage}
                            setOpen={setOpenPackage}
                            displayKey="name"
                        />
                        </div>
            
                        <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Price Per Pax (IDR)
                        </label>
                        <CurrencyInput
                            id="price-per-pax"
                            name="pricePerPax"
                            prefix="Rp "
                            decimalSeparator=","
                            groupSeparator="."
                            value={formData.pricePerPax}
                            onValueChange={(value) => {
                            setFormData(prev => ({
                                ...prev,
                                pricePerPax: value || 0
                            }));
                            }}
                            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            placeholder="Enter price per pax"
                        />
                        {!isCustomPackage && (
                            <p className="text-xs text-gray-500 mt-1">
                            Default price can be manually adjusted
                            </p>
                        )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Package Duration (Days)
                        </label>
                        <input
                            type="number"
                            value={customPackageDuration}
                            onChange={(e) => {
                            const duration = Math.max(1, parseInt(e.target.value) || 1);
                            setCustomPackageDuration(duration);
                            setFormData(prev => ({
                                ...prev,
                                packageName: 'Custom',
                                packageDays: Array(duration).fill().map(() => ({
                                startActivity: '',
                                endActivity: '',
                                itinerary: '',
                                hotel: '',
                                meals: {
                                    breakfast: true,
                                    lunch: false,
                                    dinner: false
                                },
                                rooms: [{ 
                                    room: '',
                                    quantity: 1
                                }]
                                }))
                            }));
                            }}
                            min="1"
                            max="10"
                            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            placeholder="Enter number of days"
                        />
                        </div>
            
                        <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Price Per Pax (IDR)
                        </label>
                        <CurrencyInput
                            id="custom-price-per-pax"
                            name="pricePerPax"
                            prefix="Rp "
                            decimalSeparator=","
                            groupSeparator="."
                            value={formData.pricePerPax}
                            onValueChange={(value) => {
                            setFormData(prev => ({
                                ...prev,
                                pricePerPax: value || 0
                            }));
                            }}
                            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                            placeholder="Enter price per pax"
                        />
                        </div>
                    </div>
                )}
            </>

            )}
  
          {/* Existing package details rendering */}
          {(formData.packageName || formData.packageDays.length > 0) && (
            <div className="mt-6 space-y-4">
              {formData.packageDays.map((day, index) => (
                <div key={index} className="border rounded-lg space-y-4">
                    <div 
                        className="flex justify-between items-center p-4 cursor-pointer rounded-t-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                        onClick={() => toggleDayExpansion(index)}
                    >
                        <h3 className="font-medium text-lg text-gray-600">Day {index + 1}</h3>
                        <button className="text-gray-900 hover:text-gray-900">
                            {expandedDays[index] ? (
                                <ChevronUp className="h-5 w-5" />
                            ) : (
                                <ChevronDown className="h-5 w-5" />
                            )}
                        </button>
                    </div>          
                    {expandedDays[index] && (
                    <div className="px-6 pb-6 pt-4 space-y-4">                                                      
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">Start Activity</label>
                              <SearchableSelect 
                                    options={startActivityOptions}
                                    value={day.startActivity}
                                    onChange={(value) => handleActivityChange(index, 'startActivity', value)}
                                    placeholder="Select start activity"
                                    open={dropdowns[`day-${index}-start-activity`] || false}
                                    setOpen={(value) => handleDropdownChange(`day-${index}-start-activity`, value)}
                                    displayKey="name"
                                />
                          </div>
                          <div className="space-y-2">
                              <label className="block text-sm font-medium text-gray-700">End Activity</label>
                              <SearchableSelect 
                                    options={endActivityOptions}
                                    value={day.endActivity}
                                    onChange={(value) => handleActivityChange(index, 'endActivity', value)}
                                    placeholder="Select end activity"
                                    open={dropdowns[`day-${index}-end-activity`] || false}
                                    setOpen={(value) => handleDropdownChange(`day-${index}-end-activity`, value)}
                                    displayKey="name"
                                />
                          </div>
                      </div>
  
                      <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Itinerary</label>
                          <textarea
                              value={day.itinerary || ''}
                              onChange={(e) => handleActivityChange(index, 'itinerary', e.target.value)}
                              className="w-full px-4 py-2 rounded-lg border"
                              rows={4}
                              placeholder="Itinerary will be auto-generated based on selected activities"
                          />
                      </div>
  
                      <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Hotel</label>
                          <SearchableSelect 
                              options={hotelOptions}
                              value={day.hotel}
                              onChange={(value) => handleActivityChange(index, 'hotel', value)}
                              placeholder="Select hotel"
                              open={dropdowns[`day-${index}-hotel`] || false}
                              setOpen={(value) => handleDropdownChange(`day-${index}-hotel`, value)}
                              displayKey="name"
                          />
                      </div>
  
                      <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Meals Hotel</label>
                          <div className="flex gap-4">
                              <label className="flex items-center space-x-2">
                                  <input
                                      type="checkbox"
                                      checked={day.meals?.breakfast}
                                      onChange={(e) => handleActivityChange(index, 'meals', {
                                          ...day.meals,
                                          breakfast: e.target.checked
                                      })}
                                      className="rounded border-gray-300"
                                  />
                                  <span>Breakfast</span>
                              </label>
                              <label className="flex items-center space-x-2">
                                  <input
                                      type="checkbox"
                                      checked={day.meals?.lunch}
                                      onChange={(e) => handleActivityChange(index, 'meals', {
                                          ...day.meals,
                                          lunch: e.target.checked
                                      })}
                                      className="rounded border-gray-300"
                                  />
                                  <span>Lunch</span>
                              </label>
                              <label className="flex items-center space-x-2">
                                  <input
                                      type="checkbox"
                                      checked={day.meals?.dinner}
                                      onChange={(e) => handleActivityChange(index, 'meals', {
                                          ...day.meals,
                                          dinner: e.target.checked
                                      })}
                                      className="rounded border-gray-300"
                                  />
                                  <span>Dinner</span>
                              </label>
                          </div>
                      </div>
  
                      <div className="space-y-2">
                          <div className="flex justify-between items-center">
                              <label className="block text-sm font-medium text-gray-700">Rooms</label>
                              <button
                                  type="button"
                                  onClick={() => addRoom(index)}
                                  className="text-sm text-blue-600 hover:text-blue-700"
                              >
                                  + Add Room
                              </button>
                          </div>
                          <div className="space-y-3">
                            {day.rooms?.map((roomSelection, roomIndex) => (
                                <div key={roomIndex} className="flex gap-4 items-start">
                                    <div className="flex-1">
                                        <SearchableSelect 
                                            options={
                                                // Filter room options berdasarkan hotel yang dipilih
                                                day.hotel 
                                                    ? hotelRoomOptions[day.hotel] || [] 
                                                    : []
                                            }
                                            value={roomSelection.room}
                                            onChange={(value) => handleRoomChange(index, roomIndex, 'room', value)}
                                            placeholder="Select room type"
                                            disabled={!day.hotel} // Disable jika belum memilih hotel
                                            open={dropdowns[`day-${index}-room-${roomIndex}`] || false}
                                            setOpen={(value) => handleDropdownChange(`day-${index}-room-${roomIndex}`, value)}
                                            displayKey="name"
                                        />
                                    </div>
                                    <div className="w-24">
                                        <input
                                            type="number"
                                            value={roomSelection.quantity}
                                            onChange={(e) => handleRoomChange(index, roomIndex, 'quantity', e.target.value)}
                                            className="w-full px-3 py-2 border rounded-md"
                                            placeholder="Qty"
                                            min="1"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => deleteRoom(index, roomIndex)}
                                        className="p-2 text-red-500 hover:text-red-700"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                          </div>
                      </div>
                    </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  
  const renderStep4 = () => (
    <div className="space-y-6 border rounded-lg">
        <div className="bg-gray-800 text-white p-4 rounded-t-lg">
            <h2 className="text-lg font-semibold">Additional Services</h2>
        </div>
        <div className="space-y-6 p-6 pt-0">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-md font-medium">Add-Ons</h3>
                <button
                    type="button"
                    onClick={addAddOnItem}
                    className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                >
                    + Add Add-On
                </button>
            </div>

            {addOnItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4">
                        <label className="block text-sm font-medium text-gray-700">Add-On</label>
                        <SearchableSelect 
                            options={addOns.map(addon => ({
                                id: addon.value,
                                name: addon.label
                            }))}
                            value={item.addOn}
                            onChange={(value) => updateAddOnItem(index, 'addOn', value)}
                            placeholder="Select add-on"
                            displayKey="name"
                            open={dropdowns[`addon-${index}`] || false}
                            setOpen={(value) => handleDropdownChange(`addon-${index}`, value)}
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Price</label>
                        <CurrencyInput
                            prefix="Rp "
                            decimalSeparator=","
                            groupSeparator="."
                            value={item.price}
                            onValueChange={(value) => updateAddOnItem(index, 'price', value)}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="Price"
                        />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Qty</label>
                        <input
                            type="number"
                            value={item.qty}
                            onChange={(e) => updateAddOnItem(index, 'qty', parseInt(e.target.value))}
                            min="1"
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="Qty"
                        />
                    </div>
                    <div className="col-span-3">
                        <label className="block text-sm font-medium text-gray-700">Subtotal</label>
                        <div className="px-3 py-2 border rounded-md bg-gray-100">
                            Rp {new Intl.NumberFormat('id-ID').format(item.subtotal)}
                        </div>
                    </div>
                    <div className="col-span-1">
                        <button
                            type="button"
                            onClick={() => removeAddOnItem(index)}
                            className="text-red-500 hover:text-red-700 mt-6"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            ))}

            {addOnItems.length > 0 && (
                <div className="mt-4 text-right font-bold">
                    Total Add-Ons: Rp {new Intl.NumberFormat('id-ID').format(
                        addOnItems.reduce((total, item) => total + item.subtotal, 0)
                    )}
                </div>
            )}
        </div>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-6 border rounded-lg">
        <div className="bg-gray-800 text-white p-4 rounded-t-lg">
            <h2 className="text-lg font-semibold">Discount</h2>
        </div>
        <div className="space-y-6 p-6 pt-0">
            <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                    Custom Discount
                </label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input
                        type="checkbox"
                        name="toggle"
                        id="custom-discount-toggle"
                        checked={isCustomDiscount}
                        onChange={() => {
                            setIsCustomDiscount(!isCustomDiscount);
                            // Reset discount data
                            setDiscountData({
                                id: '',
                                type: '',
                                code: '',
                                value: 0
                            });
                        }}
                        className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                    />
                    <label
                        htmlFor="custom-discount-toggle"
                        className={`toggle-label block overflow-hidden h-6 rounded-full cursor-pointer ${
                            isCustomDiscount 
                                ? 'bg-blue-500' 
                                : 'bg-gray-300'
                        }`}
                    />
                </div>
            </div>

            {!isCustomDiscount ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Discount Code
                        </label>
                        <SearchableSelect 
                            options={discountCodes.map(discount => ({
                                id: discount.id,
                                name: discount.name
                            }))}
                            value={discountData.id}
                            onChange={(value) => {
                                const selectedDiscount = discountCodes.find(d => d.id === value);
                                if (selectedDiscount) {
                                    setDiscountData({
                                        id: value,
                                        code: selectedDiscount.code,
                                        type: selectedDiscount.type,
                                        value: selectedDiscount.value
                                    });
                                }
                            }}
                            placeholder="Select discount code"
                            displayKey="name"
                            open={dropdowns[`discount-code`] || false}
                            setOpen={(value) => handleDropdownChange(`discount-code`, value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Discount Amount
                        </label>
                        <div className="px-3 py-2 border rounded-md bg-gray-100">
                            {discountData.type === 'percent' 
                                ? `${discountData.value}%` 
                                : `Rp ${new Intl.NumberFormat('id-ID').format(discountData.value)}`
                            }
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Discount Type
                        </label>
                        <SearchableSelect 
                            options={discountTypes.map(type => ({
                                id: type.value,
                                name: type.label
                            }))}
                            value={discountData.type}
                            onChange={(value) => {
                                setDiscountData(prev => ({
                                    ...prev,
                                    type: value,
                                    value: 0
                                }));
                            }}
                            placeholder="Select discount type"
                            displayKey="name"
                            open={dropdowns[`discount-type`] || false}
                            setOpen={(value) => handleDropdownChange(`discount-type`, value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            {discountData.type === 'percent' ? 'Discount Percentage' : 'Discount Amount'}
                        </label>
                        {discountData.type === 'percent' ? (
                            <input
                                type="number"
                                value={discountData.value}
                                onChange={(e) => {
                                    const value = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                                    setDiscountData(prev => ({
                                        ...prev,
                                        value
                                    }));
                                }}
                                min="0"
                                max="100"
                                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                placeholder="Enter discount percentage"
                            />
                        ) : (
                            <CurrencyInput
                                prefix="Rp "
                                decimalSeparator=","
                                groupSeparator="."
                                value={discountData.value}
                                onValueChange={(value) => {
                                    setDiscountData(prev => ({
                                        ...prev,
                                        value: value || 0
                                    }));
                                }}
                                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                                placeholder="Enter discount amount"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    </div>
  );

  const renderCurrentStep = () => {
      switch (currentStep) {
          case 1:
              return renderStep1();
          case 2:
              return renderStep2();
          case 3:
              return renderStep3();
          case 4:
              return renderStep4();
          case 5:
              return renderStep5();
          default:
              return null;
      }
  };

  const handleSubmit = () => {
      Swal.fire({
          title: 'Are you sure?',
          html: `
              <p>Do you want to submit this booking?</p>
              ${channel != 'TWT' ? `
                  <div class="mt-4 flex items-center justify-center">
                      <input 
                          type="checkbox" 
                          id="whatsapp-itinerary" 
                          class="mr-2"
                      />
                      <label for="whatsapp-itinerary">
                          Send itinerary via WhatsApp
                      </label>                  
                  </div>              
                ` : '' }
          `,
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes, submit it!',
          cancelButtonText: 'Cancel'
      }).then((result) => {
          if (result.isConfirmed) {
              const isWhatsappSelected = channel != 'TWT' ? document.getElementById('whatsapp-itinerary').checked : false;
  
              // Create FormData object untuk handling file upload
              const formDataObj = new FormData();
  
              // Basic Information
              const basicInfo = {
                  customer: formData.customer,
                  numOfPax: parseInt(formData.numOfPax) || 0,
                  travelDate: formData.travelDate,
                  email: formData.email,
                  phone: formData.phone,
                  nationality: formData.nationality,
                  type: formData.type,
                  bookingDate: formData.bookingDate,
                  dueDate: formData.dueDate,
                  channel: formData.channel,
                  bookingCodeOrigin: formData.bookingCodeOrigin
              };
  
              // T-Shirt Sizes
              const sizes = formData.sizes;
  
              // Location Information
              const locationInfo = {
                  pickupLocation: formData.pickupLocation,
                  pickupTime: formData.pickupTime,
                  dropLocation: formData.dropLocation,
                  dropTime: formData.dropTime,
                  isShuttle: formData.isShuttle
              };
  
              // Package Information
              const packageInfo = {
                  packageName: formData.packageName,
                  pricePerPax: parseFloat(formData.pricePerPax) || 0,
                  totalPrice: parseFloat(formData.totalPrice) || 0,
                  packageDays: formData.packageDays.map(day => ({
                      startActivity: day.startActivity,
                      endActivity: day.endActivity,
                      itinerary: day.itinerary,
                      hotel: day.hotel,
                      meals: day.meals,
                      rooms: day.rooms.map(room => ({
                          room: room.room,
                          quantity: parseInt(room.quantity) || 1
                      }))
                  }))
              };
  
              // Add-ons Information
              const addOnsInfo = addOnItems.map(item => ({
                  addOn: item.addOn,
                  price: parseFloat(item.price) || 0,
                  quantity: parseInt(item.qty) || 1,
                  subtotal: parseFloat(item.subtotal) || 0
              }));
  
              // Discount Information
              const discountInfo = {
                  type: discountData.type,
                  code: discountData.code,
                  value: parseFloat(discountData.value) || 0,
                  discountId: !isCustomDiscount ? discountData.id : null                  
              };
  
              // Summary Calculations
              const summary = calculateSummary();
  
              // Combine all data
              const completeData = {
                  ...basicInfo,
                  sizes,
                  ...locationInfo,
                  ...packageInfo,
                  addOns: addOnsInfo,
                  discount: discountInfo,
                  summary,
                  isSendWa: isWhatsappSelected
              };
  
              // Append all data to FormData
              Object.keys(completeData).forEach(key => {
                  if (typeof completeData[key] === 'object') {
                      formDataObj.append(key, JSON.stringify(completeData[key]));
                  } else {
                      formDataObj.append(key, completeData[key]);
                  }
              });
  
              // Append file if exists
              if (formData.bookingFileOrigin) {
                  formDataObj.append('bookingFileOrigin', formData.bookingFileOrigin);
              }
              
              // Post request using Inertia
              router.post('/bookings', formDataObj, {
                  onBefore: () => {
                      // Show loading state
                      Swal.fire({
                          title: 'Processing...',
                          html: 'Please wait while we process your booking.',
                          allowOutsideClick: false,
                          didOpen: () => {
                              Swal.showLoading();
                          }
                      });
                  },
                  onSuccess: () => {
                      // Show success message
                      Swal.fire({
                          title: 'Success!',
                          text: 'Booking has been successfully submitted',
                          icon: 'success'
                      }).then(() => {
                          // Redirect to booking list
                          router.visit('/booking-overview');
                      });
                  },
                  onError: (errors) => {
                      // Show error message
                      Swal.fire({
                          title: 'Error!',
                          text: 'There was a problem submitting your booking. Please check your input and try again.',
                          icon: 'error'
                      });
                      console.error('Submission errors:', errors);
                  },
                  preserveState: true,
                  preserveScroll: true
              });
          }
      });
  };
  

  return (
    <Authenticated>
      <Head title="Client Management" />
      <h1 className="text-2xl mb-4 font-bold text-gray-900 dark:text-white">Add Booking {channel}</h1>
      <Card className="mx-auto bg-white">
        <div className="p-6">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
                {[1, 2, 3, 4, 5].map((step) => (
                    <div
                        key={step}
                        className={`text-center ${
                            currentStep === step ? 'text-blue-600 font-bold' : 'text-gray-500'
                        }`}
                    >
                        Step {step}
                    </div>
                ))}
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full bg-gray-200 h-1 rounded-full">
                  <div className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
                  />
                </div>
              </div>
              <div className="relative flex justify-between">
                  {[1, 2, 3, 4, 5].map((step) => (
                      <button
                          key={step}
                          onClick={() => setCurrentStep(step)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                              currentStep >= step
                                  ? 'bg-blue-600 text-white shadow-lg'
                                  : 'bg-white border-2 border-gray-300 text-gray-500'
                          }`}
                      >
                          {step}
                      </button>
                  ))}
              </div>
            </div>
          </div>

          <form className="space-y-6">
            {renderCurrentStep()}
            <div className="border-t pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Price per Pax</span>
                            <span className="font-semibold">
                                Rp {new Intl.NumberFormat('id-ID').format(calculateSummary().pricePerPax)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Package ({formData.numOfPax} pax)</span>
                            <span className="font-semibold">
                                Rp {new Intl.NumberFormat('id-ID').format(calculateSummary().totalPackage)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Total Add-on</span>
                            <span className="font-semibold">
                                Rp {new Intl.NumberFormat('id-ID').format(calculateSummary().totalAddOn)}
                            </span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-semibold">
                                Rp {new Intl.NumberFormat('id-ID').format(calculateSummary().subTotal)}
                            </span>
                        </div>                      
                        <div className="flex justify-between">
                            <span className="text-gray-600">Discount</span>
                            <span className="font-semibold text-red-500">
                                - Rp {new Intl.NumberFormat('id-ID').format(calculateSummary().discount)}
                            </span>
                        </div>
                        <div className="border-t my-2"></div>
                        <div className="flex justify-between">
                            <span className="text-lg font-bold">Grand Total</span>
                            <span className="text-lg font-bold text-blue-600">
                                Rp {new Intl.NumberFormat('id-ID').format(calculateSummary().grandTotal)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Existing previous and next buttons */}
                <div className="flex justify-between pt-6 border-t">
                    <button
                        type="button"
                        onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                        className={`px-6 py-2 bg-gray-100 border-2 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 ${
                            currentStep === 1 ? 'invisible' : ''
                        }`}
                    >
                        Previous
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            if (currentStep === 5) {
                                handleSubmit();
                            } else {
                                setCurrentStep(prev => Math.min(5, prev + 1));
                            }
                        }}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                        {currentStep === 5 ? 'Submit' : 'Next'}
                    </button>
                </div>
            </div>            
          </form>
        </div>
      </Card>
    </Authenticated>
  );
};

export default AddBooking;
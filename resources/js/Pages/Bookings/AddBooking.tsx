import React, { useState,useEffect } from 'react';
import Authenticated from '@/Layouts/Main';
import { Head, router } from '@inertiajs/react';
import { Card } from '@/components/ui/card';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

// Location Form Component
const LocationForm = ({ type, value, onChange, className = '' }) => {
  const [location, setLocation] = useState(value?.location || '');
  const [additionalInfo, setAdditionalInfo] = useState({
    terminal: value?.terminal || '',
    ticketNumber: value?.ticketNumber || '',
    station: value?.station || '',
    hotelName: value?.hotelName || '',
    customLocation: value?.customLocation || '',
  });

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
              <select
                value={additionalInfo.terminal}
                onChange={(e) => handleAdditionalInfoChange('terminal', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 bg-white"
              >
                <option value="">Select Terminal</option>
                <option value="Terminal 1">Terminal 1</option>
                <option value="Terminal 2">Terminal 2</option>
              </select>
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
              <select
                value={additionalInfo.station}
                onChange={(e) => handleAdditionalInfoChange('station', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 bg-white"
              >
                <option value="">Select Station</option>
                <option value="Gubeng Station">Gubeng Station</option>
                <option value="Pasar Turi Station">Pasar Turi Station</option>
              </select>
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
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 bg-white"
        >
          <option value="">Select location</option>
          <option value="Surabaya Airport">Surabaya Airport</option>
          <option value="Surabaya Train Station">Surabaya Train Station</option>
          <option value="Surabaya Hotel">Surabaya Hotel</option>
          <option value="Denpasar Airport">Denpasar Airport</option>
          <option value="Bali Hotel">Bali Hotel</option>
          <option value="Others">Others</option>
        </select>
      </div>
      {renderAdditionalFields()}
    </div>
  );
};

const countries = [
  { label: "Indonesia", value: "ID" },
  { label: "Singapore", value: "SG" },
  { label: "Malaysia", value: "MY" },
  { label: "Thailand", value: "TH" },
  { label: "Vietnam", value: "VN" },
  { label: "Philippines", value: "PH" },
];

const packages = [
  { label: "2D1N Geopark and Bromo Adventure", value: "2D1N" },
  { label: "3D2N Mount Bromo Sunrise Tour", value: "3D2N" },
  { label: "4D3N Bromo Trekking Experience", value: "4D3N" },
];

const addOns = [
  { label: "No Add-On", value: "" },
  { label: "Extra Meal", value: "extraMeal" },
  { label: "Travel Insurance", value: "insurance" },
  { label: "Photography Session", value: "photo" },
  { label: "Local Guide", value: "guide" },
];

const AddBooking = () => {
  const [openCountry, setOpenCountry] = useState(false);
  const [openPackage, setOpenPackage] = useState(false);
  const [openAddOns, setOpenAddOns] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    customer: '',
    numOfPax: '',
    bookingDate: '',
    travelDate: '',
    email: '',
    phone: '',
    nationality: '',
    type: 'Regular',
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
    discountCode: ''
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

  const renderStep1 = () => (
    <div className="space-y-6 border rounded-lg">
      <div className="bg-gray-800 text-white p-4 rounded-t-lg">
        <h2 className="text-lg font-semibold">Customer Information</h2>
      </div>
      <div className="space-y-6 p-6 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Customer Name</label>
            <input
              type="text"
              name="customer"
              value={formData.customer}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Enter customer name"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Number of Pax</label>
            <input
              type="number"
              name="numOfPax"
              value={formData.numOfPax}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Enter number of pax"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Travel Date</label>
            <input
              type="date"
              name="travelDate"
              value={formData.travelDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Enter email address"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Enter phone number"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Nationality</label>
            <Popover open={openCountry} onOpenChange={setOpenCountry}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openCountry}
                  className="w-full justify-between"
                >
                  {formData.nationality
                    ? countries.find((country) => country.value === formData.nationality)?.label
                    : "Select country..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search country..." />
                  <CommandEmpty>No country found.</CommandEmpty>
                  <CommandGroup>
                    {countries.map((country) => (
                      <CommandItem
                        key={country.value}
                        value={country.value}
                        onSelect={(currentValue) => {
                          setFormData(prev => ({
                            ...prev,
                            nationality: currentValue === formData.nationality ? "" : currentValue
                          }));
                          setOpenCountry(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.nationality === country.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {country.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white"
            >
              <option value="Regular">Regular</option>
              <option value="VIP">VIP</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Booking Date</label>
            <input
              type="date"
              name="bookingDate"
              value={formData.bookingDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            />
          </div>
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
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  min="0"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

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
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
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
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 border rounded-lg">
      <div className="bg-gray-800 text-white p-4 rounded-t-lg">
        <h2 className="text-lg font-semibold">Items</h2>
      </div>
      <div className="space-y-6 p-6 pt-0">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Package Name</label>
          <Popover open={openPackage} onOpenChange={setOpenPackage}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openPackage}
                className="w-full justify-between bg-white text-gray-900"
              >
                {formData.packageName
                  ? packages.find((pkg) => pkg.value === formData.packageName)?.label
                  : "Select package..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 bg-white border shadow-lg" align="start">
              <Command className="bg-white">
                <CommandInput placeholder="Search package..." className="bg-white" />
                <CommandEmpty className="py-2 px-4 text-sm text-gray-500">
                  No package found.
                </CommandEmpty>
                <CommandGroup className="overflow-auto max-h-[200px]">
                  {packages.map((pkg) => (
                    <CommandItem
                      key={pkg.value}
                      value={pkg.value}
                      onSelect={(currentValue) => {
                        setFormData(prev => ({
                          ...prev,
                          packageName: currentValue === formData.packageName ? "" : currentValue
                        }));
                        setOpenPackage(false);
                      }}
                      className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          formData.packageName === pkg.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {pkg.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Add-Ons</label>
          <Popover open={openAddOns} onOpenChange={setOpenAddOns}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openAddOns}
                className="w-full justify-between"
              >
                {formData.addOns
                  ? addOns.find((addon) => addon.value === formData.addOns)?.label
                  : "Select add-ons..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search add-ons..." />
                <CommandEmpty>No add-on found.</CommandEmpty>
                <CommandGroup>
                  {addOns.map((addon) => (
                    <CommandItem
                      key={addon.value}
                      value={addon.value}
                      onSelect={(currentValue) => {
                        setFormData(prev => ({
                          ...prev,
                          addOns: currentValue === formData.addOns ? "" : currentValue
                        }));
                        setOpenAddOns(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          formData.addOns === addon.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {addon.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6 border rounded-lg">
      <div className="bg-gray-800 text-white p-4 rounded-t-lg">
        <h2 className="text-lg font-semibold">Discount</h2>
      </div>
      <div className="space-y-6 p-6 pt-0">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Discount Code</label>
          <input
            type="text"
            name="discountCode"
            value={formData.discountCode}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            placeholder="Enter discount code"
          />
        </div>
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
      default:
        return null;
    }
  };

  return (
    <Authenticated>
      <Head title="Client Management" />
      <h1 className="text-2xl mb-4 font-bold text-gray-900 dark:text-white">Add Booking</h1>
      <Card className="mx-auto bg-white">
        <div className="p-6">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              {[1, 2, 3, 4].map((step) => (
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
                  <div 
                    className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                  />
                </div>
              </div>
              <div className="relative flex justify-between">
                {[1, 2, 3, 4].map((step) => (
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
                onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
              >
                {currentStep === 4 ? 'Submit' : 'Next'}
              </button>
            </div>
          </form>
        </div>
      </Card>
    </Authenticated>
  );
};

export default AddBooking;            
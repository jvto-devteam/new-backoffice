import Main from '@/Layouts/Main';
import React,{useState,useRef,useEffect} from 'react';
import {router} from '@inertiajs/react';
import { Dialog } from '@headlessui/react';
import { 
  MoreVertical, 
  X as XIcon,
  Users, 
  CarFront, 
  Car, 
  Ticket, 
  HeartPulse, 
  Shirt, 
  Droplet,
  ChevronDown  
} from 'lucide-react';
import QRCode from 'qrcode';
const inclusions = [
  {
    icon: Users,
    title: "Licensed Tour Guides",
    description: "Trekking tour with license and certified tour guides at Ijen & Bromo"
  },
  {
    icon: CarFront,
    title: "Private Transport",
    description: "Private Transport with licensed driver"
  },
  {
    icon: Car,
    title: "Private 4WD Jeep",
    description: "Private 4WD Jeep at Bromo area for 1-4 Pax (Not Sharing)"
  },
  {
    icon: Ticket,
    title: "Permits & Entry Fees",
    description: "All permits and entry fees as mentioned in the itinerary"
  },
  {
    icon: HeartPulse,
    title: "Safety Equipment",
    description: "Trekking Equipment and Medical Aid are also included"
  },
  {
    icon: Shirt,
    title: "Souvenir T-Shirt",
    description: "Free Travel T-Shirts with 100% Cotton fabric"
  },
  {
    icon: Droplet,
    title: "Mineral Water",
    description: "We would provide mineral water during the trip"
  }
];
const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
  }).format(price);
};
const CustomSelect = ({ value, onChange, options, placeholder, className }) => {      
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={selectRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      >
        <span className="text-gray-700 dark:text-gray-200">
          {value ? options.find(opt => opt.value == value)?.label : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="py-1 max-h-60 overflow-auto">
            <button
              onClick={() => {
                onChange({ target: { value: '' }});
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {placeholder}
            </button>
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange({ target: { value: option.value }});
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PackageDetails = ({ isOpen, onClose, packages,paxConfiguration,orderChannel }) => {
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
              Package Details
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

              <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  Overview
                </h3>
                <div className="grid md:grid-cols-1 gap-6">
                  <div>
                    <h3 className="text-md font-medium text-gray-500 dark:text-gray-400">Package ID</h3>
                    <p className="mt-1 text-gray-900 dark:text-gray-100">{packages.id}</p>
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-gray-500 dark:text-gray-400">Package Name</h3>
                    <p className="mt-1 text-gray-900 dark:text-gray-100">{packages.name}</p>
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-gray-500 dark:text-gray-400">Duration</h3>
                    <p className="mt-1 text-gray-900 dark:text-gray-100">{packages.duration.name}</p>
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-gray-500 dark:text-gray-400">Category</h3>
                    <p className="mt-1 text-gray-900 dark:text-gray-100">{packages.category.name}</p>
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-gray-500 dark:text-gray-400">Start</h3>
                    <p className="mt-1 text-gray-900 dark:text-gray-100">{formatPrice(packages.min_price)}</p>
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-gray-500 dark:text-gray-400">Start</h3>
                    <p className="mt-1 text-gray-900 dark:text-gray-100">{packages.start_destination.name}</p>
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-gray-500 dark:text-gray-400">End</h3>
                    <p className="mt-1 text-gray-900 dark:text-gray-100">{packages.end_destination.name}</p>
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-gray-500 dark:text-gray-400">Link</h3>
                    <a href={`https://javavolcano-touroperator.com/${packages.new_slug}`} className="mt-1 underline text-blue-900 dark:text-blue-300">{`https://javavolcano-touroperator.com/${packages.new_slug}`}</a>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  Banner
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                {packages.package_banner.map((data,key) => (
  <React.Fragment key={key}>
    <a href={`https://legacy.javavolcano-touroperator.com/assets/img/destinations/${data.gallery.image}`} 
       target="_blank" 
       className="block group">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 
                      group-hover:shadow-2xl group-hover:scale-[1.02] group-hover:ring-2 group-hover:ring-blue-500">
        <div className="relative">
          <img
            src={`https://legacy.javavolcano-touroperator.com/assets/img/destinations/${data.gallery.image}` || 'https://via.placeholder.com/300'}
            alt={data.title || 'Itinerary Image'}
            className="w-full h-48 object-cover transition-transform duration-300"
          />
          {/* Overlay saat hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
              Click to view full image
            </span>
          </div>
        </div>
        
        <div className="p-4 border-t dark:border-gray-700">
          <p className="text-sm text-blue-600 dark:text-blue-300 font-bold">
            Alt Text : 
          </p>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
            {data.gallery.alt_text ? data.gallery.alt_text : data.gallery.caption}
          </h3>
        </div>
      </div>
    </a>
  </React.Fragment>
))}                </div>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  Activity
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {packages.itinerary.map((data,key) => (
                    <React.Fragment key={key}>
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div
                          className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center">
                            <span className=" bg-blue-500 text-white rounded px-3 py-1 text-sm font-medium">
                              Day {data.day}
                            </span>
                            <h4 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">{data.itinerary_destination.destination.name}</h4>
                          </div>
                        </div>
                      </div>
                    {
                      data.itinerary_destination.second_destination_id ? (
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <div
                          className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center">
                            <span className=" bg-blue-500 text-white rounded px-3 py-1 text-sm font-medium">
                              Day {data.day}
                            </span>
                            <h4 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">{data.itinerary_destination.second_destination.name}</h4>
                          </div>
                        </div>
                      </div>
                      ) : ''
                    }
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  Itinerary
                </h3>
                <div className="space-y-4">
                  {packages.itinerary.map((day, index) => {
                    const [isOpen, setIsOpen] = useState(false);
                    return (
                      <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setIsOpen(!isOpen)}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex flex-column md:flex-row items-center">
                            <span className=" bg-blue-500 text-white rounded px-3 py-1 text-sm font-medium">
                              Day {day.day}
                            </span>
                            <h4 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">{day.title}</h4>
                          </div>
                          <svg
                            className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </button>
                        
                        {isOpen && (
                          <div className="p-4 bg-white dark:bg-gray-900">
                            <div 
                              className="prose dark:prose-invert max-w-none"
                              dangerouslySetInnerHTML={{ 
                                __html: day.activity.split('#next-stop#').map(activity => 
                                  `<div class="mb-4">${activity.trim()}</div>`
                                ).join('')
                              }} 
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  Hotel
                </h3>
                <div className="space-y-4">
                  {packages.package_hotel && packages.package_hotel.map((hotel, index) => (
                    <div key={index} className="flex gap-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      <div className="w-24 h-24 flex-shrink-0">
                        <img
                          src={`https://legacy.javavolcano-touroperator.com/assets/img/hotels/${hotel.hotel.banner}`}
                          alt={hotel.hotel.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm text-blue-600 dark:text-blue-300 font-bold">
                            DAY {hotel.day}
                          </p>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {hotel.hotel.name}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          {hotel.hotel.address}
                        </p>
                        <a 
                          href={hotel.hotel.map_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <svg 
                            className="w-4 h-4 mr-1"
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24" 
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                            />
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                            />
                          </svg>
                          View on Google Maps
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  Meals Schedule
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th scope="col" className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Day
                        </th>
                        <th scope="col" className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Breakfast
                        </th>
                        <th scope="col" className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Lunch
                        </th>
                        <th scope="col" className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Dinner
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {packages.itinerary.map((day, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            Day {day.day}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex justify-center">
                              {
                                day.itinerary_meals.length != 0 ? (
                                  <svg
                                      className={`w-5 h-5 ${
                                        day.itinerary_meals[0].breakfast === '1' ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'
                                      }`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d={
                                          day.itinerary_meals[0].breakfast === '1'
                                            ? 'M5 13l4 4L19 7'
                                            : 'M6 18L18 6M6 6l12 12'
                                        }
                                      />
                                    </svg>
                                ) : ''
                              }

                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex justify-center">
                              {
                                day.itinerary_meals.length != 0 ? (
                                  <svg
                                      className={`w-5 h-5 ${
                                        day.itinerary_meals[0].lunch === '1' ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'
                                      }`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d={
                                          day.itinerary_meals[0].lunch === '1'
                                            ? 'M5 13l4 4L19 7'
                                            : 'M6 18L18 6M6 6l12 12'
                                        }
                                      />
                                    </svg>
                                ) : ''
                              }

                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex justify-center">
                              {
                                day.itinerary_meals.length != 0 ? (
                                  <svg
                                      className={`w-5 h-5 ${
                                        day.itinerary_meals[0].dinner === '1' ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'
                                      }`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d={
                                          day.itinerary_meals[0].dinner === '1'
                                            ? 'M5 13l4 4L19 7'
                                            : 'M6 18L18 6M6 6l12 12'
                                        }
                                      />
                                    </svg>
                                ) : ''
                              }

                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex gap-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Included</span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-gray-300 dark:text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Not Included</span>
                  </div>
                </div>
            </div>
            <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                Price List
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th scope="col" className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Participant Range
                      </th>
                      <th scope="col" className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Price per Person
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {packages.package_price
                      .sort((a, b) => a.price_category.start - b.price_category.start)
                      .map((price, index) => (
                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {price.price_category.end === 0 
                              ? `${price.price_category.start}+ Pax`
                              : price.price_category.start === price.price_category.end
                                ? `${price.price_category.start} Pax`
                                : `${price.price_category.start} - ${price.price_category.end} Pax`
                            }
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                            <div className="flex items-center justify-end space-x-2">
                              <span className="font-semibold">
                                {new Intl.NumberFormat('id-ID', {
                                  style: 'currency',
                                  currency: 'IDR'
                                }).format(price.price)}
                              </span>
                            </div>
                          </td>
                        </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <p>Notes:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Prices are per person and subject to change without prior notice</li>
                  <li>Special rates apply during peak season and holidays</li>
                  <li>Additional charges may apply for special requests</li>
                </ul>
              </div>
            </div>      
            <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                Pax Details
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th scope="col" className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Pax
                      </th>
                      <th scope="col" className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Accommodations
                      </th>
                      <th scope="col" className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Transportation
                      </th>
                      <th scope="col" className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Crew Role
                      </th>
                      <th scope="col" className="px-4 py-3 bg-gray-50 dark:bg-gray-800 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {paxConfiguration.map((data,index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {data.pax}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {data.pax}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {data.car.name}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {orderChannel == 'jvto' ? data.crew_jvto_role.role : data.crew_klook_role.role}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">
                Other Inclusions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inclusions.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div 
                      key={index}
                      className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex items-start space-x-4"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                          {item.title}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>                  
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

const PackageRow = ({paxConfiguration,dataKey,packages,order_channel}) => {
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);   
  const [showQRCode, setShowQRCode] = useState(false);   
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
    <tr key={dataKey} className="border-t border-stroke dark:border-strokedark">
      <td className="py-4.5 px-4 md:px-6 2xl:px-7.5">
        <p className="text-sm text-black dark:text-white">
          {dataKey + 1}
        </p>
      </td>
      <td className="py-4.5 px-4 md:px-6 2xl:px-7.5">
        <div className="h-20 w-20 overflow-hidden rounded-md">
          {packages.package_banner ? (
            <img
              src={`https://legacy.javavolcano-touroperator.com/assets/img/destinations/${packages.package_banner[0].gallery.image}`}
              alt={packages.name}
              className="h-full w-full object-cover rounded-md"
            />
          ) : ''}
        </div>
      </td>
      <td className="py-4.5 px-4 md:px-6 3xl:px-7.5">
          <p className="text-sm text-black dark:text-white">
            <a target="_blank" className="text-blue-600 dark:text-blue-300 underline" href={`https://javavolcano-touroperator.com/${packages.new_slug}`}>{packages.name}</a>
          </p>
      </td>
      <td className="py-4.5 px-4 md:px-6 2xl:px-7.5 hidden sm:table-cell">
        <p className="text-sm text-black dark:text-white">
          {packages.duration.name}
        </p>
      </td>
      {
        order_channel == 'jvto' ? (
          <td className="py-4.5 px-4 md:px-6 2xl:px-7.5">
            <p className="text-sm text-black dark:text-white">
              {packages.category.name}
            </p>
          </td>
        ) : ''
      }
      <td className="py-4.5 px-4 md:px-6 2xl:px-7.5">
        <p className="text-sm text-black dark:text-white">
          {formatPrice(packages.min_price)}
        </p>
      </td>
      <td className="py-4.5 px-4 md:px-6 2xl:px-7.5">
        <p className="text-sm text-black dark:text-white">
          {packages.start_destination ? packages.start_destination.name : '-'}
        </p>
      </td>
      <td className="py-4.5 px-4 md:px-6 2xl:px-7.5">
        <p className="text-sm text-black dark:text-white">
          {packages.end_destination ? packages.end_destination.name : '-'}
        </p>
      </td>
      <td className="py-4.5 px-4 md:px-6 2xl:px-7.5">
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
                <a href={`/package-inventory/${order_channel}?id=${packages.id}&json=true`} 
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                >
                Json
                </a>
                <button 
                onClick={() => {
                  setIsDropdownOpen(false);
                  setShowQRCode(true);
                }}                
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                >
                QR Code
                </button>
                <button 
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                >
                PDF
                </button>
                <button 
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                >
                Flipbook
                </button>
                <button 
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                >
                Edit
                </button>
            </div>
            )}   
            <PackageDetails 
            isOpen={showDetails} 
            onClose={() => setShowDetails(false)}
            packages={packages}
            paxConfiguration={paxConfiguration}
            orderChannel={order_channel}
            />          
          <QRCodeModal
            isOpen={showQRCode}
            onClose={() => setShowQRCode(false)}
            packageData={packages}
          />                                               
        </div>
      </td>
    </tr>

  )
}
const QRCodeModal = ({ isOpen, onClose, packageData }) => {
  const canvasRef = useRef(null);
  console.log(canvasRef);
  
  useEffect(() => {
    const generateQR = async () => {
      if (!isOpen || !packageData) return;

      // Tambahkan setTimeout untuk memastikan canvas sudah ter-render
      setTimeout(async () => {
        try {
          if (!canvasRef.current) {
            console.error('Canvas reference is null');
            return;
          }

          const url = `https://javavolcano-touroperator.com/${packageData.new_slug}`;

          console.log('Generating QR for URL:', url);
          
          await QRCode.toCanvas(canvasRef.current, url, {
            width: 256,
            margin: 2,
            color: {
              dark: '#000000',
              light: '#ffffff'
            }
          });
        } catch (err) {
          console.error('Error generating QR code:', err);
        }
      }, 100); // Tunggu 100ms untuk memastikan canvas sudah ter-render
    };

    generateQR();
  }, [isOpen, packageData]);

  const handleDownload = () => {
    const packageName = packageData.name.replaceAll(' ','-').toLowerCase()
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `qr-code-${packageName}.png`;
      link.href = canvasRef.current.toDataURL('image/png');
      link.click();
    }
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      className="relative z-50"
    >
      {/* Tambahkan overlay background */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-sm w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl">
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <Dialog.Title className="text-lg font-semibold text-gray-900 dark:text-white">
              QR Code - {packageData?.name}
            </Dialog.Title>
            <button 
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 flex flex-col items-center">
            {/* Tambahkan loading state jika perlu */}
            <canvas ref={canvasRef} className="mb-6" />
            
            <button
              onClick={handleDownload}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Download QR Code
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
export default function Index(data) {

    const fromEnd = [
      {
        value : 4,
        label : 'Surabaya'
      },
      {
        value : 3,
        label : 'Bali'
      },
      {
        value : 17,
        label : 'Yogyakarta'
      },
    ]
    
    // State for filters
    const [filters, setFilters] = useState({
      from: new URLSearchParams(window.location.search).get('from') || '',
      end: new URLSearchParams(window.location.search).get('end') || ''
    });

    // Handle filter changes
    const handleFilterChange = (name, value) => {
      const newFilters = { ...filters, [name]: value };
      setFilters(newFilters);
      
      // Update URL with Inertia
      router.get(window.location.pathname, {
        ...newFilters,
      });
    };    
    console.log(filters.from);
    return (
        <Main>
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="py-6 px-4 md:px-6 xl:px-7.5 flex justify-between items-center">
              <h4 className="text-xl font-semibold text-black dark:text-white">
                {data.data.title}
              </h4>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <CustomSelect
                value={filters.from}
                onChange={(e) => handleFilterChange('from', e.target.value)}
                options={fromEnd}
                placeholder="All Start Points"
                className="w-full sm:w-48"
              />

              <CustomSelect
                value={filters.end}
                onChange={(e) => handleFilterChange('end', e.target.value)}
                options={fromEnd}
                placeholder="All End Points"
                className="w-full sm:w-48"
              />

              <a href="/package-inventory/create" 
                    className="bg-meta-3 hover:bg-opacity-90 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-150 flex items-center gap-2">
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5" 
                        viewBox="0 0 20 20" 
                        fill="currentColor">
                        <path 
                            fillRule="evenodd" 
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" 
                            clipRule="evenodd" />
                    </svg>
                    Add Package
              </a>
            </div>

            </div>

            <table className="w-full">
              <thead>
                <tr className="border-t border-stroke dark:border-strokedark">
                  <th className="py-4.5 px-4 md:px-6 2xl:px-7.5 text-left">
                    <p className="font-medium">#</p>
                  </th>
                  <th className="py-4.5 px-4 md:px-6 2xl:px-7.5 text-left">
                    <p className="font-medium">Banner</p>
                  </th>
                  <th className="py-4.5 px-4 md:px-6 2xl:px-7.5 text-left">
                    <p className="font-medium">Package Name</p>
                  </th>
                  <th className="py-4.5 px-4 md:px-6 2xl:px-7.5 text-left">
                    <p className="font-medium">Duration</p>
                  </th>
                  {
                    data.data.order_channel == 'jvto' ? (
                      <th className="py-4.5 px-4 md:px-6 2xl:px-7.5 text-left">
                        <p className="font-medium">Category</p>
                      </th>
                    ) : ''
                  }
                  <th className="py-4.5 px-4 md:px-6 2xl:px-7.5 text-left">
                    <p className="font-medium">Start</p>
                  </th>
                  <th className="py-4.5 px-4 md:px-6 2xl:px-7.5 text-left">
                    <p className="font-medium">From</p>
                  </th>
                  <th className="py-4.5 px-4 md:px-6 2xl:px-7.5 text-left">
                    <p className="font-medium">End</p>
                  </th>
                  <th className="py-4.5 px-4 md:px-6 2xl:px-7.5 text-left">
                  </th>
                </tr>
              </thead>

              <tbody>
                {Object.values(data.data.packages).map((dataPackage, key) => {
                  return (
                  <PackageRow paxConfiguration={data.data.pax_configuration} dataKey={key} packages={dataPackage} order_channel={data.data.order_channel}/>
                )})}
              </tbody>
            </table>
          </div>
        </Main>
    )
}
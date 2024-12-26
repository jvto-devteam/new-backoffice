import Main from '@/Layouts/Main';
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp,XIcon } from 'lucide-react';
import { Dialog } from '@headlessui/react';
import {
  Users,
  CarFront,
  Car,
  Ticket,
  HeartPulse,
  Shirt,
  Droplet
} from 'lucide-react';
const Index = (data) => {
  // Sample data structure
  const packages = data.data.packages;
  const orderChannel = data.data.order_channel;
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

  const [expandedSections, setExpandedSections] = useState(() => {
    // Initialize all sections to be open
    const initialState = {};
    Object.keys(packages).forEach(section => {
      initialState[section] = true;
    });
    return initialState;
  });

  const [openDropdowns, setOpenDropdowns] = useState({});
  const [showDetails, setShowDetails] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const dropdownRefs = useRef({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(dropdownRefs.current).forEach(key => {
        if (dropdownRefs.current[key] && !dropdownRefs.current[key].contains(event.target)) {
          setOpenDropdowns(prev => ({...prev, [key]: false}));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleDropdown = (packageId) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [packageId]: !prev[packageId]
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
    }).format(price);
  };

  return (
    <Main>
      <div className="space-y-4">
        {Object.entries(packages).map(([section, items]) => (
          <div key={section} className="border rounded-lg shadow-sm">
            <button
              onClick={() => toggleSection(section)}
              className="w-full px-4 py-3 flex justify-between items-center bg-white hover:bg-gray-50 rounded-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900">{section}</h3>
              {expandedSections[section] ? (
                <ChevronUp className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              )}
            </button>

            {expandedSections[section] && (
              <div className="p-4 bg-white">
                <div>
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 w-32">Package ID</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 w-64">Package Name</th>
                        <th className="px-4 py-2 text-left text-sm font-semibold text-gray-900 w-96">Destination</th>
                        <th className="px-4 py-2 text-right text-sm font-semibold text-gray-900 w-32">Price</th>
                        <th className="px-4 py-2 text-center text-sm font-semibold text-gray-900 w-20">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900">{item.package_code}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{item.itinerary.map((data,index) => (
                            <div className="inline" key={index}>
                              <span>{data.itinerary_destination.destination.name}, </span>
                              {data.itinerary_destination.second_destination_id ? (
                                <span>{data.itinerary_destination.second_destination.name}, </span>
                              ) : ''}
                            </div>
                          ))}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatPrice(item.min_price)}</td>
                          <td className="px-4 py-2 text-sm text-center">
                          <div className="relative" ref={el => dropdownRefs.current[item.id] = el}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleDropdown(item.id);
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

                            {openDropdowns[item.id] && (
                              <div
                                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 py-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  onClick={() => {
                                    setSelectedPackage(item);
                                    setShowDetails(true);
                                    toggleDropdown(item.id);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                                >
                                  Detail
                                </button>
                                <a
                                  href={`/package-inventory/${orderChannel}?id=${item.id}&json=true`}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                                >
                                  Json
                                </a>
                                <button
                                  onClick={() => {
                                    setSelectedPackage(item);
                                    setShowQRCode(true);
                                    toggleDropdown(item.id);
                                  }}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                                >
                                  QR Code
                                </button>
                                  <a
                                      href={`/package-detail`} target="_blank"
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                                  >
                                      {/*PDF*/}
                                      Landing Page
                                  </a>
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
                          </div>
                        </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      <Dialog
        open={showDetails}
        onClose={() => setShowDetails(false)}
        className="relative z-50"
      >
        <div className="fixed inset-0">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </div>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white rounded-xl shadow-xl">
            {/* Modal content similar to the provided PackageDetails component */}
            <div className="flex justify-between items-center p-6 border-b">
              <Dialog.Title className="text-xl font-semibold">
                Package Details
              </Dialog.Title>
              <button
                onClick={() => setShowDetails(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {selectedPackage && (
              <div className="p-6 space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">
                {/* Overview Section */}
                <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-4">Overview</h3>
                  <div className="grid md:grid-cols-1 gap-6">
                    <div>
                      <h3 className="text-md font-medium text-gray-500 dark:text-gray-400">Package ID</h3>
                      <p className="mt-1 text-gray-900 dark:text-gray-100">{selectedPackage.package_code}</p>
                    </div>
                    <div>
                      <h3 className="text-md font-medium text-gray-500 dark:text-gray-400">Package Name</h3>
                      <p className="mt-1 text-gray-900 dark:text-gray-100">{selectedPackage.name}</p>
                    </div>
                    <div>
                      <h3 className="text-md font-medium text-gray-500 dark:text-gray-400">Duration</h3>
                      <p className="mt-1 text-gray-900 dark:text-gray-100">{selectedPackage.duration.name}</p>
                    </div>
                    <div>
                      <h3 className="text-md font-medium text-gray-500 dark:text-gray-400">Category</h3>
                      <p className="mt-1 text-gray-900 dark:text-gray-100">{selectedPackage.category.name}</p>
                    </div>
                    <div>
                      <h3 className="text-md font-medium text-gray-500 dark:text-gray-400">Price</h3>
                      <p className="mt-1 text-gray-900 dark:text-gray-100">{formatPrice(selectedPackage.min_price)}</p>
                    </div>
                    <div>
                      <h3 className="text-md font-medium text-gray-500 dark:text-gray-400">Starting Point</h3>
                      <p className="mt-1 text-gray-900 dark:text-gray-100">{selectedPackage.start_destination.name}</p>
                    </div>
                    <div>
                      <h3 className="text-md font-medium text-gray-500 dark:text-gray-400">Ending Point</h3>
                      <p className="mt-1 text-gray-900 dark:text-gray-100">{selectedPackage.end_destination.name}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-4">Itinerary</h3>
                  <div className="grid md:grid-cols-1 gap-6">
                    <div className="space-y-4">
                      {selectedPackage.itinerary.map((day, index) => {
                        return (
                          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                              <div className="flex flex-column md:flex-row items-center">
                                <span className=" bg-blue-500 text-white rounded px-3 py-1 text-sm font-medium">
                                  Day {day.day}
                                </span>
                                <h4 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">{day.title}</h4>
                              </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-4">Accommodation</h3>
                  <div className="grid md:grid-cols-1 gap-6">
                    <div className="space-y-4">
                      {selectedPackage.package_hotel && selectedPackage.package_hotel.map((hotel, index) => {
                        return (
                          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                              <div className="flex flex-column md:flex-row items-center">
                                <span className=" bg-blue-500 text-white rounded px-3 py-1 text-sm font-medium">
                                  Day {hotel.day}
                                </span>
                                <h4 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">{hotel.hotel.name}</h4>
                              </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-4">Activities</h3>
                  <div className="grid md:grid-cols-1 gap-6">
                    <div className="space-y-4">
                      {selectedPackage.itinerary.map((data, index) => {
                        return (
                          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                              <div className="flex flex-column md:flex-row items-center">
                                <span className=" bg-blue-500 text-white rounded px-3 py-1 text-sm font-medium">
                                  Day {data.day}
                                </span>
                                <h4 className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
                                  {data.itinerary_destination.destination.activity_id ? data.itinerary_destination.destination.activity_destination.name : data.day == 1 ? 'Departure' : ''}
                                  {data.itinerary_destination.second_destination_id && data.itinerary_destination.second_destination.activity_id ? ', '+data.itinerary_destination.second_destination.activity_destination.name : ''}
                                  </h4>
                              </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-4">Others</h3>
                  <div className="grid md:grid-cols-1 gap-6">
                    <div>
                      <h3 className="text-md font-medium text-gray-500">Key Features</h3>
                      <p className="mt-1 text-gray-900">
                      Guided tours, Stargazing, Sunrise at Bromo, Blue flames at Ijen, Turquoise crater lake, Waterfall trek.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-md font-medium text-gray-500">Physical Rating</h3>
                      <p className="mt-1 text-gray-900">Moderate</p>
                    </div>
                    <div>
                      <h3 className="text-md font-medium text-gray-500">Entry Requirements</h3>
                      <p className="mt-1 text-gray-900">Valid passport (6+ months), Visa depending on traveler’s nationality.</p>
                    </div>
                    <div>
                      <h3 className="text-md font-medium text-gray-500">Additional Notes</h3>
                      <p className="mt-1 text-gray-900">Ideal for adventure seekers and nature lovers. Seamless transfer from Surabaya to Bali.</p>
                    </div>
                    <div>
                      <h3 className="text-md font-medium text-gray-500">Destinations</h3>
                      <p className="mt-1 text-gray-900">
                      {selectedPackage.itinerary.map((data, index) => {
                        return (
                          <span className="text-sm mr-1  text-gray-900 dark:text-white">
                            {data.itinerary_destination.destination.name}
                            {data.itinerary_destination.second_destination_id ? ', '+data.itinerary_destination.second_destination.name : ''},
                          </span>
                        );
                      })}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-md font-medium text-gray-500 dark:text-gray-400">Link</h3>
                      <a href={selectedPackage.id_url ? `https://javavolcano-touroperator.com/packages/${selectedPackage.start_destination.name.toLowerCase()}/${selectedPackage.duration.day}d${selectedPackage.duration.night}n/${selectedPackage.id_url}` : `https://javavolcano-touroperator.com/packages/details/${selectedPackage.url}`} className="mt-1 underline text-blue-900 dark:text-blue-300">{selectedPackage.id_url ? `https://javavolcano-touroperator.com/packages/${selectedPackage.start_destination.name.toLowerCase()}/${selectedPackage.duration.day}d/${selectedPackage.duration.night}n/${selectedPackage.id_url}` : `https://javavolcano-touroperator.com/packages/details/${selectedPackage.url}`}</a>
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-4">
                    Inclusions
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
                {/* Exclusions Section */}
                <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold mb-4">
                    Exclusions
                  </h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-400 list-none pl-0">
                    <li className="text-sm flex gap-2 items-center"><XIcon className="w-5 h-5 text-red"/> Indonesian visa</li>
                    <li className="text-sm flex gap-2 items-center"><XIcon className="w-5 h-5 text-red"/> Tips</li>
                    <li className="text-sm flex gap-2 items-center"><XIcon className="w-5 h-5 text-red"/> Personal expenses</li>
                    <li className="text-sm flex gap-2 items-center"><XIcon className="w-5 h-5 text-red"/> Domestic/International air tickets</li>
                  </ul>
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
                      {selectedPackage.itinerary.map((day, index) => (
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
                    {selectedPackage.package_price
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
              </div>
          )}

          </Dialog.Panel>
        </div>
      </Dialog>

      </div>
    </Main>
  );
};

export default Index;

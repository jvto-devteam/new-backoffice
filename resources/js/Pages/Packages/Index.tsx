import Main from '@/Layouts/Main';
import React,{useState,useRef,useEffect} from 'react';
import { Dialog } from '@headlessui/react';
import { 
  MoreVertical, 
  X as XIcon,
} from 'lucide-react';

const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
  }).format(price);
};
const PackageDetails = ({ isOpen, onClose, packages }) => {
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
                    <a href={packages.id_url ? `https://javavolcano-touroperator.com/packages/${packages.start_destination.name.toLowerCase()}/${packages.duration.day}d/${packages.duration.night}n/${packages.id_url}` : `https://javavolcano-touroperator.com/packages/details/${packages.url}`} className="mt-1 underline text-blue-900 dark:text-blue-300">{packages.id_url ? `https://javavolcano-touroperator.com/packages/${packages.start_destination.name.toLowerCase()}/${packages.duration.day}d/${packages.duration.night}n/${packages.id_url}` : `https://javavolcano-touroperator.com/packages/details/${packages.url}`}</a>
                  </div>
                </div>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  Activity
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {packages.itinerary.map((data,key) => (
                    <React.Fragment key={key}>
                      <div
                        className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                      >
                        <img
                          src={`https://javavolcano-touroperator.com/assets/img/destinations/`+data.itinerary_destination.destination.gallery.image || 'https://via.placeholder.com/300'}
                          alt={data.title || 'Itinerary Image'}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <p className="text-sm text-blue-600 dark:text-blue-300 font-bold">
                            DAY {data.day}
                          </p>
                          <h3 className="text-lg font-semibold text-gray-800">{data.itinerary_destination.destination.name}</h3>
                        </div>
                      </div>
                    {
                      data.itinerary_destination.second_destination_id ? (
                        <div
                        className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                      >
                        <img
                          src={`https://javavolcano-touroperator.com/assets/img/destinations/`+data.itinerary_destination.second_destination.gallery.image || 'https://via.placeholder.com/300'}
                          alt={data.title || 'Itinerary Image'}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <p className="text-sm text-blue-600 dark:text-blue-300 font-bold">
                            DAY {data.day}
                          </p>
                          <h3 className="text-lg font-semibold text-gray-800">{data.itinerary_destination.second_destination.name}</h3>
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
                <div className="grid md:grid-cols-1 gap-6">
                </div>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  Hotel
                </h3>
                <div className="grid md:grid-cols-1 gap-6">
                </div>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  Inclussion
                </h3>
                <div className="grid md:grid-cols-1 gap-6">
                </div>
              </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

const PackageRow = ({dataKey,packages,order_channel}) => {
  
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
              src={`https://javavolcano-touroperator.com/assets/img/destinations/${packages.package_banner[0].gallery.image}`}
              alt={packages.name}
              className="h-full w-full object-cover rounded-md"
            />
          ) : ''}
        </div>
      </td>
      <td className="py-4.5 px-4 md:px-6 3xl:px-7.5">
          <p className="text-sm text-black dark:text-white">
            <a target="_blank" className="text-blue-600 dark:text-blue-300 underline" href={`https://javavolcano-touroperator.com/packages/details/${packages.url}`}>{packages.name}</a>
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
                <button 
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
            />                                             
        </div>
      </td>
    </tr>

  )
}
export default function Index(data) {
    
    return (
        <Main>
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="py-6 px-4 md:px-6 xl:px-7.5 flex justify-between items-center">
              <h4 className="text-xl font-semibold text-black dark:text-white">
                {data.data.title}
              </h4>
              <a 
                    href="/package-inventory/create" 
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
                    Add Package
                </a>

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
                  <PackageRow dataKey={key} packages={dataPackage} order_channel={data.data.order_channel}/>
                )})}
              </tbody>
            </table>
          </div>
        </Main>
    )
}
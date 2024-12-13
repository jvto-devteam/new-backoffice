import Main from '@/Layouts/Main';
import React,{useState,useRef,useEffect} from 'react';
import { 
  MoreVertical, 
} from 'lucide-react';

const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
  }).format(price);
};
function ActionDropdown({ booking }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const dropdownRef = useRef(null);

  const actions = [
      { 
          label: 'Detail', 
          onClick: () => {
              setShowDetails(true);
              setIsOpen(false);
          }
      },
      { 
          label: 'Download QR', 
          onClick: () => window.location.href = `/bookings/${booking.id}/edit`
      },
      { 
          label: 'PDF', 
          onClick: () => window.location.href = `/bookings/${booking.id}/edit`
      },
      { 
          label: 'Flipbook', 
          onClick: () => window.location.href = `/bookings/${booking.id}/edit`
      },
      { 
          label: 'Edit', 
          onClick: () => window.location.href = `/bookings/${booking.id}/edit`
      },
  ];

  return (
      <div className="relative" ref={dropdownRef}>
          <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
              <MoreVertical className="text-gray-400 w-5 h-5" />
          </button>
          
          {isOpen && (
              <div className="absolute right-0 top-full mt-1 py-1 w-40 bg-white dark:bg-[#24303f] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  {actions.map((action, index) => (
                      <button
                          key={index}
                          onClick={action.onClick}
                          className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                          {action.label}
                      </button>
                  ))}
              </div>
          )}
      </div>
  );
}// Device Item Component

export default function Index(data) {
    console.log(data.data.packages);
    
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
                {Object.values(data.data.packages).map((dataPackage, key) => (
                  <tr 
                    key={key}
                    className="border-t border-stroke dark:border-strokedark"
                  >
                    <td className="py-4.5 px-4 md:px-6 2xl:px-7.5">
                      <p className="text-sm text-black dark:text-white">
                        {key + 1}
                      </p>
                    </td>
                    <td className="py-4.5 px-4 md:px-6 2xl:px-7.5">
                      <div className="h-20 w-20 overflow-hidden rounded-md">
                        {dataPackage.package_banner ? (
                          <img
                            src={`https://javavolcano-touroperator.com/assets/img/destinations/${dataPackage.package_banner[0].gallery.image}`}
                            alt={dataPackage.name}
                            className="h-full w-full object-cover rounded-md"
                          />
                        ) : ''}
                      </div>
                    </td>
                    <td className="py-4.5 px-4 md:px-6 3xl:px-7.5">
                        <p className="text-sm text-black dark:text-white">
                          {dataPackage.name}
                        </p>
                    </td>
                    <td className="py-4.5 px-4 md:px-6 2xl:px-7.5 hidden sm:table-cell">
                      <p className="text-sm text-black dark:text-white">
                        {dataPackage.duration.name}
                      </p>
                    </td>
                    {
                      data.data.order_channel == 'jvto' ? (
                        <td className="py-4.5 px-4 md:px-6 2xl:px-7.5">
                          <p className="text-sm text-black dark:text-white">
                            {dataPackage.category.name}
                          </p>
                        </td>
                      ) : ''
                    }
                    <td className="py-4.5 px-4 md:px-6 2xl:px-7.5">
                      <p className="text-sm text-black dark:text-white">
                        {formatPrice(dataPackage.min_price)}
                      </p>
                    </td>
                    <td className="py-4.5 px-4 md:px-6 2xl:px-7.5">
                      <p className="text-sm text-black dark:text-white">
                        {dataPackage.start_destination ? dataPackage.start_destination.name : '-'}
                      </p>
                    </td>
                    <td className="py-4.5 px-4 md:px-6 2xl:px-7.5">
                      <p className="text-sm text-black dark:text-white">
                        {dataPackage.end_destination ? dataPackage.end_destination.name : '-'}
                      </p>
                    </td>
                    <td className="py-4.5 px-4 md:px-6 2xl:px-7.5">
                      <p className="text-sm text-black dark:text-white">
                        <ActionDropdown booking={dataPackage}/>
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Main>
    )
}
import React, { useState, useEffect, useRef } from 'react';
import { Copy } from 'lucide-react';
import Main from '@/Layouts/Main';


const Detail = ({initialData}) => {
  const [activeTab, setActiveTab] = useState('transaction');
  const sectionsRef = useRef({});
  
//   const initialData = {
//     client_information: {
//       client_id: 978,
//       client_name: "Christine Hoffmann",
//       contact_number: "+491759228396",
//       email_address: "hoffmannchristine94@gmail.com",
//       nationality: "Germany (Deutschland)"
//     },
//     booking_information: {
//       booking_id: "JVTO-921",
//       booking_reference_id: "JVR/008/01/25",
//       order_channel: "JVTO",
//       tour_package: "SUB-3D2N-002 | Java Volcano Tour: 3D2N Bromo & Ijen Crater Expedition",
//       number_of_participants: 2,
//       travel_date: "2025-01-14",
//       pickup: {
//         location: "Surabaya Airport",
//         arrival: "-",
//         location_value: "JT645",
//         time: "10:00:00"
//       },
//       drop: {
//         location: "Surabaya Train Station",
//         arrival: "-",
//         location_value: "Wijaya Kusuma(157)",
//         time: "17:20:00"
//       },
//       special_requirements: null,
//       notes: null
//     },
//     itinerary_information: [
//       {
//         day: 1,
//         date: "2025-01-14",
//         itinerary: "Surabaya Airport - Bondowoso"
//       },
//       {
//         day: 2,
//         date: "2025-01-15",
//         itinerary: "Ijen Crater - Bromo Area"
//       },
//       {
//         day: 3,
//         date: "2025-01-16",
//         itinerary: "Bromo Sunrise - Madakaripura Waterfall - Malang City"
//       }
//     ],
//     accommodation_information: [
//       {
//         day: 1,
//         hotel: "Riverside Homestay",
//         check_in: "2025-01-15",
//         rooms: [{
//           room_name: "Deluxe Double",
//           quantity: 1
//         }]
//       },
//       {
//         day: 2,
//         hotel: "Joglo Kecombrang Bromo",
//         check_in: "2025-01-15",
//         rooms: [{
//           room_name: "Double",
//           quantity: 1
//         }]
//       }
//     ],
//     resource_allocation_information: {
//       cars: ["Avanza Pratama"],
//       crews: {
//         driver: ["Fredi"],
//         escort: [],
//         ijen: ["Taufik"]
//       }
//     },
//     financial_data: {
//       payment: 7040000,
//       balance: 0,
//       paymentMethod: "edc",
//       invoice: {
//         total: 7040000,
//         invoiceLink: ["https://javavolcano-touroperator.com/backoffice/invoice/view-invoice/921"]
//       },
//       expense: {
//         total: 5537500,
//         expenseLink: "https://1drv.ms/x/s!AghHmKdq9e7UhvMmnxic3dr_XArscg",
//         target: "_blank"
//       },
//       profit: 1502500,
//       payment_history: [
//         {
//           nominal: 704000,
//           paymentMethod: "Debit/Credit Card",
//           description: "Down Payment",
//           reference: "https://checkout.xendit.co/web/67838e9b89b1ec591eafd750",
//           date: "12 Jan 25 16:45"
//         },
//         {
//           nominal: 6336000,
//           paymentMethod: "Cash",
//           description: "Full Payment",
//           reference: null,
//           date: "14 Jan 25 16:46"
//         }
//       ]
//     }
//   };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const tabs = [
    { id: 'transaction', label: 'Transaction Details' },
    { id: 'booking', label: 'Booking Information' },
    { id: 'itinerary', label: 'Itinerary' },
    { id: 'accommodation', label: 'Accommodation' },
    { id: 'resource', label: 'Resource Allocation' },
    { id: 'financial', label: 'Financial Data' }
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      for (const [id, ref] of Object.entries(sectionsRef.current)) {
        if (ref) {
          const element = ref;
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveTab(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const section = sectionsRef.current[sectionId];
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const CopyButton = ({ text }) => (
    <button 
      onClick={() => navigator.clipboard.writeText(text)}
      className="ml-2 p-1 hover:bg-gray-100 rounded"
    >
      <Copy size={16} className="text-gray-500" />
    </button>
  );

  const DetailRow = ({ label, value, copyable }) => (
    <div className="flex items-start py-3 border-b border-gray-200">
      <div className="w-1/3 text-sm text-gray-600">{label}</div>
      <div className="w-2/3 text-sm flex items-center">
        <span className="text-gray-900">{value || '-'}</span>
        {copyable && value !== '-' && <CopyButton text={value} />}
      </div>
    </div>
  );

  return (
    <Main>
        <div className="flex gap-5">
        {/* Left sidebar with fixed tabs */}
        <div className="w-64">
            <div className="sticky top-30 bg-white shadow-sm">
            <nav className="p-4">
                {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => scrollToSection(tab.id)}
                    className={`w-full text-left px-4 py-2 mb-2 rounded text-sm font-medium transition-colors
                    ${activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    {tab.label}
                </button>
                ))}
            </nav>
            </div>
        </div>

        {/* Main content area */}
        <div className="flex-1">
            {/* Transaction Details Card */}
            <div 
            ref={el => sectionsRef.current['transaction'] = el}
            className="bg-white rounded-lg shadow mb-6"
            >
            <div className="p-6">
                <h2 className="text-lg font-medium mb-4">Transaction Details</h2>
                <div className="mb-6">
                <div className="text-sm text-gray-600 mb-1">Transaction Amount</div>
                <div className="text-2xl font-semibold">
                    {formatCurrency(initialData.financial_data.invoice.total)}
                </div>
                </div>
                <DetailRow label="CLIENT ID" value={initialData.client_information.client_id.toString()} copyable />
                <DetailRow label="CLIENT NAME" value={initialData.client_information.client_name} />
                <DetailRow label="CONTACT" value={initialData.client_information.contact_number} copyable />
                <DetailRow label="EMAIL" value={initialData.client_information.email_address} copyable />
                <DetailRow label="NATIONALITY" value={initialData.client_information.nationality} />
            </div>
            </div>

            {/* Booking Information Card */}
            <div 
            ref={el => sectionsRef.current['booking'] = el}
            className="bg-white rounded-lg shadow mb-6"
            >
            <div className="p-6">
                <h2 className="text-lg font-medium mb-4">Booking Information</h2>
                <DetailRow label="BOOKING ID" value={initialData.booking_information.booking_id} copyable />
                <DetailRow label="REFERENCE ID" value={initialData.booking_information.booking_reference_id} copyable />
                <DetailRow label="ORDER CHANNEL" value={initialData.booking_information.order_channel} />
                <DetailRow label="TOUR PACKAGE" value={initialData.booking_information.tour_package} />
                <DetailRow label="PARTICIPANTS" value={initialData.booking_information.number_of_participants.toString()} />
                <DetailRow label="TRAVEL DATE" value={initialData.booking_information.travel_date} />
                <DetailRow label="PICKUP LOCATION" value={`${initialData.booking_information.pickup.location} (${initialData.booking_information.pickup.location_value})`} />
                <DetailRow label="PICKUP TIME" value={initialData.booking_information.pickup.time} />
                <DetailRow label="DROP LOCATION" value={`${initialData.booking_information.drop.location} (${initialData.booking_information.drop.location_value})`} />
                <DetailRow label="DROP TIME" value={initialData.booking_information.drop.time} />
            </div>
            </div>

            {/* Itinerary Card */}
            <div 
            ref={el => sectionsRef.current['itinerary'] = el}
            className="bg-white rounded-lg shadow mb-6"
            >
                <div className="p-6">
                    <h2 className="text-lg font-medium mb-4">Itinerary</h2>
                    <div>
                        {initialData.itinerary_information.map((day, index) => (
                            <div key={index} className="mb-4 p-3 bg-gray-50 rounded">
                            <div className="font-medium mb-1">Day {day.day} - {day.date}</div>
                            <div className="text-sm text-gray-600">{day.itinerary}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Accommodation Card */}
            <div 
            ref={el => sectionsRef.current['accommodation'] = el}
            className="bg-white rounded-lg shadow mb-6"
            >
                <div className='p-6'>
                    <h2 className="text-lg font-medium mb-4">Accommodation</h2>
                    {initialData.accommodation_information.map((acc, index) => (
                        <div key={index} className="mb-4 p-3 bg-gray-50 rounded">
                        <div className="font-medium mb-1">Day {acc.day} - {acc.hotel}</div>
                        <div className="text-sm text-gray-600">
                            Check-in: {acc.check_in}
                            {acc.rooms.map((room, roomIndex) => (
                            <div key={roomIndex}>
                                {room.quantity}x {room.room_name}
                            </div>
                            ))}
                        </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Resource Allocation Card */}
            <div 
            ref={el => sectionsRef.current['resource'] = el}
            className="bg-white rounded-lg shadow mb-6"
            >
            <div className="p-6">
                <h2 className="text-lg font-medium mb-4">Resource Allocation</h2>
                <DetailRow label="VEHICLE" value={initialData.resource_allocation_information.cars.join(', ')} />
                <DetailRow label="DRIVER" value={initialData.resource_allocation_information.crews.driver.join(', ')} />
                <DetailRow label="IJEN GUIDE" value={initialData.resource_allocation_information.crews.ijen.join(', ')} />
                <DetailRow label="ESCORT" value={initialData.resource_allocation_information.crews.escort.length ? initialData.resource_allocation_information.crews.escort.join(', ') : '-'} />
            </div>
            </div>

            {/* Financial Data Card */}
            <div 
            ref={el => sectionsRef.current['financial'] = el}
            className="bg-white rounded-lg shadow mb-6"
            >
            <div className="p-6">
                <h2 className="text-lg font-medium mb-4">Financial Data</h2>
                <DetailRow label="TOTAL INVOICE" value={formatCurrency(initialData.financial_data.invoice.total)} />
                <DetailRow label="TOTAL PAYMENT" value={formatCurrency(initialData.financial_data.payment)} />
                <DetailRow label="BALANCE" value={formatCurrency(initialData.financial_data.balance)} />
                <DetailRow label="PAYMENT METHOD" value={initialData.financial_data.paymentMethod} />
                <div className="flex items-start py-3 border-b border-gray-200">
                    <div className="w-1/3 text-sm text-gray-600">EXPENSE</div>
                    <div className="w-2/3 text-sm flex items-center">
                        <a href={initialData.financial_data.expense.expenseLink} target="_blank" className="text-blue-600 underline">{formatCurrency(initialData.financial_data.expense.total)}</a>
                    </div>
                </div>
                <DetailRow label="PROFIT" value={formatCurrency(initialData.financial_data.profit)} />
                
                <div className="mt-6 mb-3">
                <h3 className="text-md font-medium">Payment History</h3>
                </div>
                {initialData.financial_data.payment_history.map((payment, index) => (
                <div key={index} className="mb-4 p-3 bg-gray-50 rounded">
                    <div className="flex justify-between mb-2">
                    <span className="font-medium">{payment.description}</span>
                    <span>{formatCurrency(payment.nominal)}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                    <div>Method: {payment.paymentMethod}</div>
                    <div>Date: {payment.date}</div>
                    {payment.reference && (
                        <div>
                        Reference: 
                        <a href={payment.reference} className="text-blue-600 ml-1 hover:underline" target="_blank" rel="noopener noreferrer">
                            View Receipt
                        </a>
                        </div>
                    )}
                    </div>
                </div>
                ))}
            </div>
            </div>
        </div>
        </div>
    </Main>
  );
};

export default Detail;
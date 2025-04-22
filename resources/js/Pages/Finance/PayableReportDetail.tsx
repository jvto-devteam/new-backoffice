import Main from '@/Layouts/Main';
import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { 
  CalendarIcon, 
  File, 
  CreditCardIcon, 
  UserIcon, 
  ExternalLinkIcon,
  ChevronsLeftIcon,
  PrinterIcon,
  DollarSignIcon,
  ClipboardIcon,
  MessageSquareIcon,
  Tag,
  InfoIcon
} from 'lucide-react';

export default function PayableReportDetail({ payment }) {
    // Helper function to normalize data that might be in different formats
    const normalizeData = (data) => {
        if (Array.isArray(data)) {
            return data;
        }
        
        // If it's a string (JSON representation), try to parse it
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                // If parsed result is an array, return it
                if (Array.isArray(parsed)) {
                    return parsed;
                }
                // If it's an object (possibly with numeric keys), convert to array
                if (typeof parsed === 'object' && parsed !== null) {
                    return Object.values(parsed);
                }
            } catch (e) {
                console.error("Error parsing JSON:", e);
            }
        }
        
        // If it's an object with numeric keys but not an array
        if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
            return Object.values(data);
        }
        
        // Fallback to empty array if all else fails
        return [];
    };
    
    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Function to render proof of payment
    const renderPaymentProof = () => {
        if (!payment.payment_proof) {
            return <div className="text-gray-500 italic">Tidak ada bukti pembayaran</div>;
        }
        
        // Check if it's an URL
        if (payment.payment_proof.startsWith('http')) {
            return (
                <div>
                    <a 
                        href={payment.payment_proof} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                    >
                        <ExternalLinkIcon size={16} className="mr-1" />
                        Lihat Bukti Pembayaran
                    </a>
                </div>
            );
        } else {
            // It's a file path
            return (
                <div>
                    <a 
                        href={payment.payment_proof} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center"
                    >
                        <File size={16} className="mr-1" />
                        Lihat Bukti Pembayaran
                    </a>
                </div>
            );
        }
    };
    
    // Get colspan for the table footer
    const getColspan = () => {
        switch (payment.item_type) {
            case 'hotel': return 8; // No + Guest + Check In + Pax + Rooms + Room Cost + Meals + Meal Cost + Total
            case 'bromo': return 8; // No + Guest + Activity Date + Hotel + Pax + Bromo Ticket + Jeep Units + Jeep Cost + Total
            case 'car': return 8; // No + Guest + Pickup Date + Drop Date + Car + Days + Rate + Total
            case 'activity': return 6; // No + Guest + Activity Date + Item + Qty + Rate + Total
            case 'others': return 5; // No + Guest + Item + Qty + Rate + Total
            default: return 5;
        }
    };
    
    return (
        <Main>
            <div className="p-6">
                {/* Header */}
                <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg mb-0 shadow-md">
                    <h1 className="text-2xl font-bold flex items-center">
                        <DollarSignIcon className="mr-2" size={24} />
                        Detail Pembayaran
                    </h1>
                    <p className="mt-1 text-blue-100">Informasi lengkap pembayaran hutang kepada vendor</p>
                </div>
                
                <div className="bg-white rounded-b-lg shadow-md px-6 py-6 mb-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Informasi Pembayaran */}
                        <div className="space-y-4 lg:col-span-1">
                            <h3 className="text-lg font-medium text-gray-800 pb-2 border-b border-gray-200 flex items-center">
                                <ClipboardIcon className="h-5 w-5 text-blue-500 mr-2" />
                                Informasi Pembayaran
                            </h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    No Pembayaran
                                </label>
                                <div className="flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                        <File size={16} />
                                    </span>
                                    <div className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 py-2 px-3 bg-gray-50 border">
                                        {payment.payment_number}
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Vendor
                                </label>
                                <div className="flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                        <UserIcon size={16} />
                                    </span>
                                    <div className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 py-2 px-3 bg-gray-50 border">
                                        {payment.vendor.name}
                                    </div>
                                </div>
                                <div className="mt-1 text-xs text-gray-500">Kategori: {payment.vendor.category}</div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tanggal Pembayaran
                                </label>
                                <div className="flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                        <CalendarIcon size={16} />
                                    </span>
                                    <div className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 py-2 px-3 bg-gray-50 border">
                                        {payment.payment_date}
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Metode Pembayaran
                                </label>
                                <div className="flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                        <CreditCardIcon size={16} />
                                    </span>
                                    <div className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 py-2 px-3 bg-gray-50 border">
                                        {payment.payment_method}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Detail & Bukti Pembayaran */}
                        <div className="space-y-4 lg:col-span-1">
                            <h3 className="text-lg font-medium text-gray-800 pb-2 border-b border-gray-200 flex items-center">
                                <File className="h-5 w-5 text-blue-500 mr-2" />
                                Detail & Bukti Pembayaran
                            </h3>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Jenis Item
                                </label>
                                <div className="bg-gray-50 p-2 rounded-md border border-gray-300 flex items-center">
                                    <Tag size={16} className="text-gray-500 mr-2" />
                                    <span className="capitalize">{payment.item_type}</span>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Bukti Pembayaran
                                </label>
                                <div className="bg-gray-50 p-2 rounded-md border border-gray-300">
                                    {renderPaymentProof()}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Catatan
                                </label>
                                <div className="bg-gray-50 p-2 rounded-md border border-gray-300 min-h-20 flex items-start">
                                    <MessageSquareIcon size={16} className="text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span className="whitespace-pre-wrap">{payment.note || 'Tidak ada catatan'}</span>
                                </div>
                            </div>
                            
                            <div className="text-xs text-gray-500 mt-2">
                                <p>Dibuat pada: {payment.created_at}</p>
                                {payment.updated_at && <p>Terakhir diperbarui: {payment.updated_at}</p>}
                            </div>
                        </div>
                        
                        {/* Ringkasan Pembayaran */}
                        <div className="space-y-4 lg:col-span-1">
                            <h3 className="text-lg font-medium text-gray-800 pb-2 border-b border-gray-200 flex items-center">
                                <InfoIcon className="h-5 w-5 text-blue-500 mr-2" />
                                Ringkasan Pembayaran
                            </h3>
                            
                            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">No Pembayaran:</span>
                                        <span className="font-medium">{payment.payment_number}</span>
                                    </div>
                                    
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Vendor:</span>
                                        <span className="font-medium">{payment.vendor.name}</span>
                                    </div>
                                    
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Kategori Vendor:</span>
                                        <span className="font-medium">{payment.vendor.category}</span>
                                    </div>
                                    
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tanggal Pembayaran:</span>
                                        <span className="font-medium">{payment.payment_date}</span>
                                    </div>
                                    
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Metode Pembayaran:</span>
                                        <span className="font-medium">{payment.payment_method}</span>
                                    </div>
                                    
                                    <div className="border-t border-gray-200 my-2 pt-2"></div>
                                    
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Item:</span>
                                        <span className="font-medium">{payment.details.length} item</span>
                                    </div>
                                    
                                    <div className="flex justify-between text-lg font-bold">
                                        <span className="text-gray-700">Total Pembayaran:</span>
                                        <span className="text-blue-600">{formatCurrency(payment.total_amount)}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex space-x-2">
                                <Link
                                    href="/finance/payable-report"
                                    className="flex-1 inline-flex justify-center items-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <ChevronsLeftIcon className="mr-1" size={16} />
                                    Kembali
                                </Link>
                                <button
                                    onClick={() => window.print()}
                                    className="flex-1 inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    <PrinterIcon className="mr-1" size={16} />
                                    Cetak
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Tabel Data Item */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-800 flex items-center">
                            <ClipboardIcon className="h-5 w-5 text-blue-500 mr-2" />
                            Detail Item Pembayaran
                            <span className="ml-2 text-sm font-normal text-gray-500">
                                ({payment.details.length} item)
                            </span>
                        </h2>
                    </div>
                    
                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        No
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Guest
                                    </th>
                                    
                                    {/* Dynamic columns based on item type */}
                                    {payment.item_type === 'hotel' && (
                                        <>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Check In
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Pax
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Rooms
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Room Cost
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Meals
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Meal Cost
                                            </th>
                                        </>
                                    )}
                                    
                                    {payment.item_type === 'bromo' && (
                                        <>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Activity Date
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Hotel
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Pax
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Bromo Ticket
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Jeep Units
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Jeep Cost
                                            </th>
                                        </>
                                    )}
                                    
                                    {payment.item_type === 'car' && (
                                        <>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Pickup Date
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Drop Date
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Car
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Days
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Rate
                                            </th>
                                        </>
                                    )}
                                    
                                    {payment.item_type === 'activity' && (
                                        <>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Activity Date
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Item
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Qty
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Rate
                                            </th>
                                        </>
                                    )}
                                    
                                    {payment.item_type === 'others' && (
                                        <>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Item
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Qty
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Rate
                                            </th>
                                        </>
                                    )}

                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {payment.details.map((detail, index) => (
                                <tr key={detail.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <a 
                                            href={`/bookings/details/${detail.booking_id}`} 
                                            target="_blank" 
                                            className="font-medium text-blue-600 hover:underline"
                                        >
                                            {detail.customer}
                                        </a>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {detail.duration} / {detail.pax} Pax
                                        </div>
                                    </td>
                                    
                                    {/* Dynamic cells based on item type */}
                                    {payment.item_type === 'hotel' && (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {detail.check_in}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                {detail.pax}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {(() => {
                                                    const normalizedRooms = normalizeData(detail.rooms);
                                                    return normalizedRooms.length > 0 ? (
                                                        normalizedRooms.map((room, i) => (
                                                            <div key={i} className="mb-1">
                                                                {room.room} x {room.quantity}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-400 italic">No room data</span>
                                                    )
                                                })()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatCurrency(detail.room_total || 0)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {(() => {
                                                    const normalizedMeals = normalizeData(detail.meals);
                                                    return normalizedMeals.length > 0 ? (
                                                        normalizedMeals.map((meal, i) => (
                                                            <div key={i} className="mb-1">
                                                                {meal.meals} x {meal.quantity}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="text-gray-400 italic">No meal data</span>
                                                    )
                                                })()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatCurrency(detail.meals_total || 0)}
                                            </td>
                                        </>
                                    )}
                                    
                                    {payment.item_type === 'bromo' && (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {detail.activity_date}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {detail.hotel_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                {detail.pax}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatCurrency(detail.bromo_ticket || 0)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                {detail.jeep_unit || 0}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatCurrency(detail.bromo_jeep || 0)}
                                            </td>
                                        </>
                                    )}
                                    
                                    {payment.item_type === 'car' && (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {detail.pickup_date}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {detail.drop_date}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {detail.car}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                {detail.qty}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatCurrency(detail.rate || 0)}
                                            </td>
                                        </>
                                    )}
                                    
                                    {payment.item_type === 'activity' && (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {detail.activity_date}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {detail.item}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                {detail.qty}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatCurrency(detail.rate || 0)}
                                            </td>
                                        </>
                                    )}
                                    
                                    {payment.item_type === 'others' && (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {detail.item}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                {detail.qty}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatCurrency(detail.rate || 0)}
                                            </td>
                                        </>
                                    )}
                                    
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {formatCurrency(detail.amount)}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td colSpan={getColspan()} className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                                        Total Pembayaran:
                                    </td>
                                    <td className="px-6 py-3 text-left text-sm font-bold text-blue-600">
                                        {formatCurrency(payment.total_amount)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Mobile Actions - Shown only on mobile */}
                <div className="lg:hidden bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="space-y-3">
                        <h3 className="text-lg font-medium text-gray-800 flex items-center mb-2">
                            <InfoIcon className="h-5 w-5 text-blue-500 mr-2" />
                            Tindakan
                        </h3>
                        
                        <div className="flex space-x-2">
                            <Link
                                href="/finance/payable-report"
                                className="flex-1 inline-flex justify-center items-center py-3 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            >
                                <ChevronsLeftIcon className="mr-1" size={16} />
                                Kembali
                            </Link>
                            <button
                                onClick={() => window.print()}
                                className="flex-1 inline-flex justify-center items-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                            >
                                <PrinterIcon className="mr-1" size={16} />
                                Cetak
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Main>
    );
}
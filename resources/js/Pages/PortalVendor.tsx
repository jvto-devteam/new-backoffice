import Main from '@/Layouts/Main';
import { useState } from 'react';
import { ChevronDown, Hotel, Mountain, Car, ShoppingBag } from 'lucide-react';

export default function PortalVendor(props) {
    const [isHotelDropdownOpen, setIsHotelDropdownOpen] = useState(false);
    
    const hotels = [
        { name: "Baratha Hotel", url: "https://partner.javavolcano-touroperator.com/reservation/baratha-hotel" },
        { name: "Riverside Homestay", url: "https://partner.javavolcano-touroperator.com/reservation/riverside-homestay" },
        { name: "Joglo Kecombrang", url: "https://partner.javavolcano-touroperator.com/reservation/joglo-kecombrang" },
        { name: "Grand Padis", url: "https://partner.javavolcano-touroperator.com/reservation/grand-padis" }
    ];

    return (
        <Main>
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Portal Vendor</h1>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Hotel Portal Card with Dropdown on Kunjungi button */}
                        <div className="col-span-1 relative">
                            <div className="bg-blue-100 rounded-lg shadow-md border border-blue-200 overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="bg-white p-2 rounded-full">
                                            <Hotel className="h-8 w-8 text-blue-600" />
                                        </div>
                                        <h2 className="text-xl font-semibold text-blue-800">Portal Hotel</h2>
                                    </div>
                                    <p className="mt-3 text-blue-700">
                                        Rekap dan Schedule Hotel serta Pantau Status Hutang
                                    </p>
                                    <div className="mt-4 text-right">
                                        <button 
                                            onClick={() => setIsHotelDropdownOpen(!isHotelDropdownOpen)}
                                            className="inline-flex items-center px-3 py-1 rounded-full bg-white text-blue-800 text-sm font-medium focus:outline-none"
                                        >
                                            <span>Kunjungi</span>
                                            <ChevronDown 
                                                className={`ml-1 h-4 w-4 transition-transform duration-200 ${isHotelDropdownOpen ? 'transform rotate-180' : ''}`} 
                                            />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Dropdown Content */}
                            {isHotelDropdownOpen && (
                                <div className="absolute right-0 z-10 mt-2 w-56 bg-white rounded-md shadow-lg border border-blue-100">
                                    <div className="py-1">
                                        <p className="px-4 py-2 text-sm text-gray-600 border-b border-gray-100">Pilih Hotel:</p>
                                        {hotels.map((hotel, index) => (
                                            <a 
                                                key={index}
                                                href={hotel.url}
                                                target="_blank"
                                                className="block px-4 py-2 text-sm text-blue-700 hover:bg-blue-50"
                                            >
                                                {hotel.name}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Portal Ijen */}
                        <div className="col-span-1 bg-indigo-100 rounded-lg shadow-md border border-indigo-200 overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-white p-2 rounded-full">
                                        <Mountain className="h-8 w-8 text-indigo-600" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-indigo-800">Portal Ijen</h2>
                                </div>
                                <p className="mt-3 text-indigo-700">
                                    Rekap Ticket Ijen dan Pantau Kerawanan Destinasi Ijen
                                </p>
                                <div className="mt-4 text-right">
                                    <a
                                        target="_blank" 
                                        href="https://partner.javavolcano-touroperator.com/doggy-style"
                                        className="inline-block px-3 py-1 rounded-full bg-white text-indigo-800 text-sm font-medium"
                                    >
                                        Kunjungi
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Portal Bromo */}
                        <div className="col-span-1 bg-emerald-100 rounded-lg shadow-md border border-emerald-200 overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-white p-2 rounded-full">
                                        <Mountain className="h-8 w-8 text-emerald-600" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-emerald-800">Portal Bromo</h2>
                                </div>
                                <p className="mt-3 text-emerald-700">
                                    Schedule dan Rekap Ticket, Jeep serta Kerawanan Destinasi Bromo
                                </p>
                                <div className="mt-4 text-right">
                                    <a
                                        target="_blank" 
                                        href="https://partner.javavolcano-touroperator.com/bromo-recap"
                                        className="inline-block px-3 py-1 rounded-full bg-white text-emerald-800 text-sm font-medium"
                                    >
                                        Kunjungi
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Portal Garasi */}
                        <div className="col-span-1 bg-amber-100 rounded-lg shadow-md border border-amber-200 overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-white p-2 rounded-full">
                                        <Car className="h-8 w-8 text-amber-600" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-amber-800">Portal Garasi</h2>
                                </div>
                                <p className="mt-3 text-amber-700">
                                    Rekap dan Schedule Garasi serta Rekapitulasi Hutang
                                </p>
                                <div className="mt-4 text-right">
                                    <a
                                        target="_blank" 
                                        href="https://partner.javavolcano-touroperator.com/garage-recap"
                                        className="inline-block px-3 py-1 rounded-full bg-white text-amber-800 text-sm font-medium"
                                    >
                                        Kunjungi
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Portal Tshirt */}
                        <div className="col-span-1 bg-rose-100 rounded-lg shadow-md border border-rose-200 overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-white p-2 rounded-full">
                                        <ShoppingBag className="h-8 w-8 text-rose-600" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-rose-800">Portal Tshirt</h2>
                                </div>
                                <p className="mt-3 text-rose-700">
                                    Rekap Tshirt dan Pantau Status Proses Pembuatan Tshirt
                                </p>
                                <div className="mt-4 text-right">
                                    <a
                                        target="_blank" 
                                        href="https://partner.javavolcano-touroperator.com/travel-tshirt/kubik"
                                        className="inline-block px-3 py-1 rounded-full bg-white text-rose-800 text-sm font-medium"
                                    >
                                        Kunjungi
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Main>
    );
}
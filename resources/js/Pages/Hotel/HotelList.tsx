import React, { useState } from 'react';
import Main from '@/Layouts/Main';
import { router } from '@inertiajs/react';
import {
    Search, Hotel, MapPin, Phone, ChevronDown, ChevronRight,
    BedDouble, Building2
} from 'lucide-react';

// Card Components from your example
const GlassCard = ({ children, className = '', glow = false }) => (
    <div className={`
    relative backdrop-blur-xl bg-white/40 dark:bg-gray-800/40
    border border-white/20 dark:border-gray-700/20
    rounded-2xl shadow-lg
    ${glow ? 'before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-blue-500/10 before:to-purple-500/10 before:animate-pulse before:-z-10' : ''}
    transition-all duration-500 ease-out
    hover:shadow-xl hover:shadow-blue-500/10
    ${className}
  `}>
        {children}
    </div>
);

const CardContent = ({ className, children, ...props }) => (
    <div className={`${className}`} {...props}>
        {children}
    </div>
);

const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID').format(angka);
};

const HotelRow = ({ hotel, isExpanded, onToggle }) => {
    return (
        <>
            <tr
                className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b dark:border-gray-700"
                onClick={onToggle}
            >
                <td className="align-top px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                        {isExpanded ? (
                            <ChevronDown className="h-4 w-4 mr-2" />
                        ) : (
                            <ChevronRight className="h-4 w-4 mr-2" />
                        )}
                        <div className="font-medium">{hotel.id}</div>
                    </div>
                </td>
                <td className="align-top px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                        <Hotel className="h-4 w-4 text-gray-400"/>
                        <span>{hotel.name}</span>
                    </div>
                </td>
                <td className="align-top px-4 py-3">
                    <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{hotel.phone}</span>
                    </div>
                </td>
                <td className="align-top px-4 py-3">
                    <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{hotel.address}</span>
                    </div>
                </td>
                <td className="align-top px-4 py-3 text-center">
                    <div className="text-sm font-medium">
                        {hotel.room_hotel.length} Rooms
                    </div>
                </td>
            </tr>

            {isExpanded && (
                <tr>
                    <td colSpan="4" className="bg-gray-50 dark:bg-gray-800 px-4 py-4">
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <h4 className="font-medium mb-3 flex items-center">
                                    <BedDouble className="h-4 w-4 mr-2" />
                                    Available Room Types
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {hotel.room_hotel.map((room, idx) => (
                                        <div key={idx} className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="font-medium text-lg mb-1">
                                                        {room.room_name}
                                                    </div>
                                                    {room.room_type && (
                                                        <div className="text-sm text-gray-600 dark:text-gray-300">
                                                            Type: {room.room_type}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        Rate/Night
                                                    </div>
                                                    <div className="font-bold text-blue-600 dark:text-blue-400">
                                                        IDR {formatRupiah(room.rate)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

const HotelsFilters = ({ filter }) => {
    const [filters, setFilters] = useState({
        search: filter.search || '',
    });

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        router.get('', filters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search hotels..."
                    className="w-full border dark:border-gray-700 rounded-lg pl-10 pr-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                />
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
        </form>
    );
};

const Index = ({ data }) => {
    const [expandedRows, setExpandedRows] = useState(new Set());
    const [filters, setFilters] = useState({
        search: data.search,
    });

    const toggleRowExpansion = (hotelId) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(hotelId)) {
                newSet.delete(hotelId);
            } else {
                newSet.add(hotelId);
            }
            return newSet;
        });
    };

    return (
        <Main>
            <div className="min-h-screen">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                        Manage Hotel Listings
                    </h1>
                    <HotelsFilters filter={filters} />
                </div>

                <GlassCard>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Hotel ID
                                    </th><th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Hotel Name
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Contact
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Address
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Room Types
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {data.hotels.map((hotel) => (
                                    <HotelRow
                                        key={hotel.id}
                                        hotel={hotel}
                                        isExpanded={expandedRows.has(hotel.id)}
                                        onToggle={() => toggleRowExpansion(hotel.id)}
                                    />
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </GlassCard>
            </div>
        </Main>
    );
};

export default Index;

import React, { useState } from 'react';
import { Map, Car, Activity, ListChecks, ChevronDown, ChevronRight } from 'lucide-react';
import Main from '@/Layouts/Main';

export default function ExpenseItem(data) {
    const res = data.data
    
    
    const [expandedDestinations, setExpandedDestinations] = useState({});
    const [expandedHotels, setExpandedHotels] = useState({});

    const destinations = [
        {
            "id": 2,
            "code": "1",
            "name": "Ijen Crater",
            "hotels": [{
                "id": 1,
                "destination_id": 2,
                "name": "Baratha Hotel and Resto",
                "room_hotel": [
                    {"id": 1,"room_name": "Deluxe Twin","rate": 275000},
                    {"id": 9,"room_name": "Deluxe Double","rate": 275000},
                    {"id": 12,"room_name": "Family","rate": 450000},
                    {"id": 43,"room_name": "Apartment","rate": 450000},
                    {"id": 64,"room_name": "Apartment + Extra Bed","rate": 625000},
                    {"id": 122,"room_name": "Extra Bed","rate": 175000},
                    {"id": 160,"room_name": "Superior Twin","rate": 250000},
                    {"id": 161,"room_name": "Superior Double","rate": 250000}
                ]
            }],
            "activity": [
                {"id": 3,"name": "Ijen Ticket","unit": "pax","price": "75000.00"},
                {"id": 4,"name": "Coffee + Indomie","unit": "pax","price": "25000.00"},
                {"id": 5,"name": "Local Guide (Ijen)","unit": "no","price": "250000.00"},
                {"id": 6,"name": "Ijen Certificate","unit": "no","price": "35000.00"}
            ]
        },
        {
            "id": 1,
            "code": "2",
            "name": "Mount Bromo",
            "hotels": [{
                "id": 2,
                "destination_id": 1,
                "name": "Whizz Bromo",
                "room_hotel": [
                    {"id": 11,"room_name": "Superior","rate": 550000},
                    {"id": 173,"room_name": "Capsule","rate": 200000}
                ]
            }],
            "activity": [
                {"id": 1,"name": "Bromo Ticket","unit": "pax","price": "150000.00"},
                {"id": 2,"name": "Bromo Jeep","unit": "no","price": "550000.00"}
            ]
        },
        {
            "id": 7,
            "code": "3",
            "name": "Tumpak Sewu",
            "hotels": [{
                "id": 38,
                "destination_id": 7,
                "name": "Artha Cottage",
                "room_hotel": [
                    {"id": 76,"room_name": "Double","rate": 425000},
                    {"id": 77,"room_name": "Twin","rate": 425000}
                ]
            }],
            "activity": [
                {"id": 7,"name": "Tumpak Sewu - Ticket","unit": "pax","price": "120000.00"},
                {"id": 8,"name": "Tumpak Sewu - Local Guide","unit": "no","price": "200000.00"},
                {"id": 9,"name": "Tumpak Sewu - Breakfast","unit": "pax","price": "50000.00"},
                {"id": 10,"name": "Tumpak Sewu - Lunch","unit": "pax","price": "50000.00"}
            ]
        },
        {
            "id": 4,
            "code": "4",
            "name": "Surabaya",
            "hotels": [{
                "id": 6,
                "destination_id": 4,
                "name": "Holiday Inn Express Surabaya Centerpoint, an IHG Hotel",
                "room_hotel": [
                    {"id": 5,"room_name": "Standart","rate": 495000},
                    {"id": 29,"room_name": "Double","rate": 595000}
                ]
            }],
            "activity": []
        }
    ];

    const vehicles = [
        {"id": 1,"name": "Avanza","price": 200000},
        {"id": 2,"name": "Innova Reborn","price": 350000},
        {"id": 5,"name": "Hiace","price": 600000}
    ];

    const othersActivity = [
        {"id": 1,"name": "Driver","unit": "person","price": "250000.00"},
        {"id": 2,"name": "Transport Allowance","unit": "trip","price": "100000.00"},
        {"id": 3,"name": "Mineral Water","unit": "bottle","price": "50000.00"},
        {"id": 4,"name": "T-shirt","unit": "piece","price": "60000.00"},
        {"id": 5,"name": "Toll & Parking","unit": "trip","price": "200000.00"}
    ];

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
        }).format(price);
    };

    const toggleDestination = (destId) => {
        setExpandedDestinations(prev => ({
            ...prev,
            [destId]: !prev[destId]
        }));
    };

    const toggleHotel = (hotelId) => {
        setExpandedHotels(prev => ({
            ...prev,
            [hotelId]: !prev[hotelId]
        }));
    };
    const DestinationsHotelsCard = ({ destinations, formatPrice }) => (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
                <Map className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl font-semibold dark:text-white">Accommodations</h2>
            </div>
            <div className="h-96 overflow-auto">
                {destinations.map((destination) => (
                    <div key={destination.id} className="mb-6 last:mb-0">
                        {/* Destination Level */}
                        <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 font-medium text-gray-900 dark:text-gray-100">
                            {destination.name}
                        </div>
                        
                        {/* Hotels Level */}
                        {destination.hotels.map((hotel) => (
                            <div key={hotel.id} className="ml-4 mt-2 mb-4 last:mb-0">
                                <div className="bg-gray-50 dark:bg-gray-600 px-4 py-2 text-sm font-medium text-gray-800 dark:text-gray-200">
                                    {hotel.name}
                                </div>
                                
                                {/* Rooms Level */}
                                <div className="ml-4 mt-2">
                                    <table className="min-w-full">
                                        <thead className="bg-white dark:bg-gray-800">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Room Type
                                                </th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                    Rate
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                            {hotel.room_hotel.map((room) => (
                                                <tr key={room.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                    <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">
                                                        {room.room_name}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300 text-right">
                                                        {formatPrice(room.rate)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
    
    const ActivitiesCard = ({ destinations, formatPrice }) => (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
                <Activity className="w-6 h-6 text-green-500" />
                <h2 className="text-xl font-semibold dark:text-white">Activities</h2>
            </div>
            <div className="h-96 overflow-auto">
                {destinations.map((destination) => (
                    destination.activity.length > 0 && (
                        <div key={destination.id} className="mb-6 last:mb-0">
                            {/* Destination Level */}
                            <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 font-medium text-gray-900 dark:text-gray-100">
                                {destination.name}
                            </div>
    
                            {/* Activities Level */}
                            <div className="ml-4 mt-2">
                                <table className="min-w-full table-fixed">
                                    <thead className="bg-white dark:bg-gray-800">
                                        <tr>
                                            <th className="w-1/2 px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Activity
                                            </th>
                                            <th className="w-1/4 px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Unit
                                            </th>
                                            <th className="w-1/4 px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Price
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {destination.activity.map((activity) => (
                                            <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-4 w-1/2 py-2 text-sm text-gray-500 dark:text-gray-300">
                                                    {activity.name}
                                                </td>
                                                <td className="px-4 w-1/4 py-2 text-sm text-gray-500 dark:text-gray-300">
                                                    {activity.unit}
                                                </td>
                                                <td className="px-4 w-1/4 py-2 text-sm text-gray-500 dark:text-gray-300 text-right">
                                                    {formatPrice(activity.price)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                ))}
            </div>
        </div>
    );
    
    const VehiclesCard = ({ vehicles, formatPrice }) => (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
                <Car className="w-6 h-6 text-red-500" />
                <h2 className="text-xl font-semibold dark:text-white">Vehicles</h2>
            </div>
            <div className="">
                <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr className="border-b dark:border-gray-600">
                            <th scope="col" className="sticky top-0 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                Vehicle Type
                            </th>
                            <th scope="col" className="sticky top-0 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                Price
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {vehicles.map((vehicle) => (
                            <tr key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-2 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {vehicle.name}
                                    </div>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-right">
                                    <div className="text-sm text-gray-500 dark:text-gray-300">
                                        {formatPrice(vehicle.price)}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    const OtherActivitiesCard = ({ othersActivity, formatPrice }) => (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
                <ListChecks className="w-6 h-6 text-purple-500" />
                <h2 className="text-xl font-semibold dark:text-white">Other Activities</h2>
            </div>
            <div className="">
                <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr className="border-b dark:border-gray-600">
                            <th scope="col" className="sticky top-0 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                Activity
                            </th>
                            <th scope="col" className="sticky top-0 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                Unit
                            </th>
                            <th scope="col" className="sticky top-0 bg-gray-50 dark:bg-gray-700 px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                                Price
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {othersActivity.map((activity) => (
                            <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="px-4 py-2 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {activity.name}
                                    </div>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                    <div className="text-sm text-gray-500 dark:text-gray-300">
                                        {activity.unit}
                                    </div>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-right">
                                    <div className="text-sm text-gray-500 dark:text-gray-300">
                                        {formatPrice(activity.price)}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
    
    return (
        <Main>
            <div className="p-4 grid grid-cols-1 gap-4">
                <DestinationsHotelsCard destinations={res.destination} formatPrice={formatPrice} />
                <ActivitiesCard destinations={res.destination} formatPrice={formatPrice} />
                <VehiclesCard vehicles={res.vehicle} formatPrice={formatPrice} />
                <OtherActivitiesCard othersActivity={res.others_activity} formatPrice={formatPrice} />
            </div>
        </Main>
    );
}
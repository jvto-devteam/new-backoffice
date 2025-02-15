import React, { useState } from 'react';
import { Calendar, MapPin, Users, Coffee, Moon, Bed } from 'lucide-react';
import Main from '@/Layouts/Main';

const Accommodation = ({hotelData}) => {
  const [activeTab, setActiveTab] = useState('overview');
//   const hotelData = {
//     "hotel": {
//       "id": 1,
//       "name": "Baratha Hotel and Resto",
//       "banner": "1722672641_Baratha-Hotel-Resto-Bondowoso-Exterior.jfif",
//       "map_url": "https://maps.app.goo.gl/bdDZAXDUfHADV24T8",
//       "lunch_rate": 60000,
//       "dinner_rate": 60000,
//       "room_hotel_configuration": [/* ... */],
//       "room_hotel": [/* ... */],
//       "schedule": [/* ... */]
//     }
//   };

  // Component for the hero banner section
  const HeroBanner = () => (
    <div className="relative h-64 md:h-96 w-full overflow-hidden rounded-lg shadow-lg mb-8">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-400">
        <div className="absolute inset-0 bg-black/40" />
      </div>
      <div className="relative h-full flex flex-col justify-center px-6 md:px-12">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 animate-fade-in">
          {hotelData.hotel.name}
        </h1>
        <div className="flex items-center text-white/90">
          <MapPin className="w-5 h-5 mr-2" />
          <a href={hotelData.hotel.map_url} 
             target="_blank" 
             rel="noopener noreferrer"
             className="hover:underline transition-all duration-200"
          >
            View on Maps
          </a>
        </div>
      </div>
    </div>
  );

  // Tab navigation component
  const TabNavigation = () => (
    <nav className="flex space-x-1 overflow-x-auto scrollbar-hide mb-8 border-b border-gray-200">
      {['overview','schedule','rooms','meals'].map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`
            px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200
            ${activeTab === tab 
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
          `}
        >
          {tab.charAt(0).toUpperCase() + tab.slice(1)}
        </button>
      ))}
    </nav>
  );

  // Schedule card component
  const ScheduleCard = ({ schedule }) => (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{schedule.customer}</h3>
        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm">
          {schedule.check_in}
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-600">
        <div className="flex items-center">
          <Users className="w-4 h-4 mr-2 text-gray-400" />
          {schedule.participants} Participants
        </div>
        <div className="flex items-center">
          <Bed className="w-4 h-4 mr-2 text-gray-400" />
          {schedule.rooms[0].room_name}
        </div>
        {schedule.meals.length > 0 && (
          <div className="flex items-center">
            <Coffee className="w-4 h-4 mr-2 text-gray-400" />
            {schedule.meals.length} Meals
          </div>
        )}
      </div>
    </div>
  );

  // Room card component
  const RoomCard = ({ room }) => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{room.room_name}</h3>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-blue-600">
            Rp {room.rate.toLocaleString()}
          </span>
          {/* <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
            Book Now
          </button> */}
        </div>
      </div>
    </div>
  );

  // Meals section component
  const MealsSection = () => (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Coffee className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-xl font-semibold">Lunch</h3>
        </div>
        <p className="text-2xl font-bold text-blue-600 mb-2">
          Rp {hotelData.hotel.lunch_rate.toLocaleString()}
        </p>
        <p className="text-gray-600">Per person</p>
      </div>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-4">
          <Moon className="w-6 h-6 text-blue-600 mr-3" />
          <h3 className="text-xl font-semibold">Dinner</h3>
        </div>
        <p className="text-2xl font-bold text-blue-600 mb-2">
          Rp {hotelData.hotel.dinner_rate.toLocaleString()}
        </p>
        <p className="text-gray-600">Per person</p>
      </div>
    </div>
  );
  const ScheduleTable = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Check In
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Room Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Participants
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Meals
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {hotelData.schedule.map((booking, index) => {
            const totalMeals = booking.meals.reduce((sum, meal) => sum + parseFloat(meal.subtotal), 0);
            const totalRooms = booking.rooms.reduce((sum, room) => sum + room.subtotal, 0);
            const grandTotal = totalMeals + totalRooms;
            
            return (
              <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{booking.customer}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.check_in}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {booking.rooms.map(room => `${room.quantity}x ${room.room_name}`).join(', ')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{booking.participants}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {booking.meals.length > 0 
                      ? booking.meals.map(meal => 
                          `${meal.meals} (${meal.quantity}x)`
                        ).join(', ')
                      : '-'
                    }
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    Rp {grandTotal.toLocaleString()}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
  // Content sections
  const TabContent = () => {
    switch (activeTab) {
      case 'rooms':
        return (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotelData.hotel.room_hotel.map((room, index) => (
              <RoomCard key={index} room={room} />
            ))}
          </div>
        );
      case 'schedule':
        return (
          <div className="space-y-4">
            <ScheduleTable/>
          </div>
        );
      case 'meals':
        return <MealsSection />;
      default:
        return (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">About {hotelData.hotel.name}</h2>
              <p className="text-gray-600">
                Experience comfort and luxury at {hotelData.hotel.name}. We offer a range of 
                accommodations perfect for both business and leisure travelers.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Rooms</p>
                  <p className="text-2xl font-bold text-blue-600">{hotelData.hotel.room_hotel.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Bookings</p>
                  <p className="text-2xl font-bold text-blue-600">{hotelData.schedule.length}</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <Main>
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <HeroBanner />
        <TabNavigation />
        <main className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <TabContent />
        </main>
      </div>
    </div>
    </Main>
  );
};

export default Accommodation;
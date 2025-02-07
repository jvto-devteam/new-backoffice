import React, { useState, useMemo, useEffect } from 'react';
import Swal from '@/utils/swal';
import { router } from '@inertiajs/react';
import Authenticated from '@/Layouts/Main';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const RoomTable = ({ rooms, isPaid, onTotalChange, onDataChange }) => {
  const [roomStates, setRoomStates] = useState(
    rooms.map(room => ({
      quantity: room.quantity,
      rate: room.room_hotel.rate
    }))
  );
 
  const handleQuantityChange = (index, value) => {
    const newStates = [...roomStates];
    newStates[index].quantity = value;
    setRoomStates(newStates);
 
    const newRooms = rooms.map((room, i) => ({
      ...room,
      quantity: i === index ? value : room.quantity
    }));
    onDataChange(newRooms);
  };
 
  const handleRateChange = (index, value) => {
    const newStates = [...roomStates];
    newStates[index].rate = value;
    setRoomStates(newStates);
 
    const newRooms = rooms.map((room, i) => ({
      ...room,
      room_hotel: {
        ...room.room_hotel,
        rate: i === index ? value : room.room_hotel.rate
      }
    }));
    onDataChange(newRooms);
  };
 
  const total = useMemo(() => 
    roomStates.reduce((sum, state) => sum + (state.quantity * state.rate), 0)
  , [roomStates]);
 
  useEffect(() => {
    onTotalChange(total);
  }, [total, onTotalChange]);
 
  const handleDelete = (index) => {
    setRoomStates(prev => prev.filter((_, i) => i !== index));
    onDataChange(rooms.filter((_, i) => i !== index));
  };
 
  return (
    <div className="mb-6">
      <h4 className="font-medium mb-2 dark:text-black">Rooms</h4>
      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-600 bg-gray-100">
            <th className="px-3 py-2 w-16">NO</th>
            <th className="px-3">ROOM NAME</th>
            <th className="px-3 w-24 text-right">QTY</th>
            <th className="px-3 w-40 text-right">RATE</th>
            <th className="px-3 w-40 text-right">SUBTOTAL</th>
            <th className="px-3 w-16"></th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((room, index) => (
            <tr key={room.id} className="border-t border-gray-100">
              <td className="px-3 py-4 text-blue-600">{index + 1}</td>
              <td className="px-3 dark:text-black">{room.room_hotel.room_name}</td>
              <td className="px-3">
                <input
                  type="number"
                  value={roomStates[index].quantity}
                  onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                  className="w-16 p-1 border rounded text-right disabled:bg-gray-100 dark:text-black"
                  min="1"
                  readonly="true"
                  disabled={isPaid}
                />
              </td>
              <td className="px-3">
                <input
                  type="text"
                  value={formatCurrency(roomStates[index].rate)}
                  onChange={(e) => handleRateChange(index, parseInt(e.target.value.replace(/\D/g, '')) || 0)}
                  className="w-32 p-1 border rounded text-right disabled:bg-gray-100 dark:text-black"
                  readonly="true"
                  disabled={isPaid}
                />
              </td>
              <td className="px-3 text-right dark:text-black">
                {formatCurrency(roomStates[index].quantity * roomStates[index].rate)}
              </td>
              <td className="px-3">
                {/* {!isPaid && (
                  <button 
                    onClick={() => handleDelete(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )} */}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="4" className="dark:text-black px-3 py-4 text-right font-medium">Total</td>
            <td className={`px-3 text-right font-medium dark:text-black ${isPaid ? 'line-through text-gray-400' : ''}`}>
              {formatCurrency(total)}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
 };
 const MealTable = ({ meals, hotelInfo, pax, isPaid, onTotalChange, onDataChange }) => {
  const [mealStates, setMealStates] = useState({
    lunch: {
      enabled: hotelInfo.b === '1',
      qty: meals.find(m => m.meals === 'lunch')?.qty || pax,
      price: meals.find(m => m.meals === 'lunch')?.price || hotelInfo.lunch_rate
    },
    dinner: {
      enabled: hotelInfo.d === '1',
      qty: meals.find(m => m.meals === 'dinner')?.qty || pax,
      price: meals.find(m => m.meals === 'dinner')?.price || hotelInfo.dinner_rate
    }
  });
 
  const handleQuantityChange = (type, value) => {
    setMealStates(prev => ({
      ...prev,
      [type]: { ...prev[type], qty: value }
    }));
    
    const newMeals = meals.map(meal => {
      if (meal.meals === type) {
        return { ...meal, qty: value };
      }
      return meal;
    });
    onDataChange(newMeals);
  };
 
  const handlePriceChange = (type, value) => {
    setMealStates(prev => ({
      ...prev,
      [type]: { ...prev[type], price: value }
    }));
    
    const newMeals = meals.map(meal => {
      if (meal.meals === type) {
        return { ...meal, price: value };
      }
      return meal;
    });
    onDataChange(newMeals);
  };
 
  const total = useMemo(() => {
    return Object.values(mealStates).reduce((sum, meal) => {
      return sum + (meal.enabled ? meal.qty * meal.price : 0);
    }, 0);
  }, [mealStates]);
 
  useEffect(() => {
    onTotalChange(total);
  }, [total, onTotalChange]);
 
  const handleDelete = (type) => {
    setMealStates(prev => ({
      ...prev,
      [type]: { ...prev[type], enabled: false }
    }));
    
    onDataChange(meals.filter(meal => meal.meals !== type));
  };
 
  return (
    <div className="mb-6">
       <h4 className="font-medium mb-2 dark:text-black">Meals</h4>
       <table className="w-full">
         <thead>
           <tr className="text-left text-gray-600 bg-gray-100">
             <th className="px-3 py-2 w-16">NO</th>
             <th className="px-3">MEAL TYPE</th>
             <th className="px-3 w-24 text-right">QTY</th>
             <th className="px-3 w-40 text-right">RATE</th>
             <th className="px-3 w-40 text-right">SUBTOTAL</th>
             <th className="px-3 w-16"></th>
           </tr>
         </thead>
         <tbody>
           {mealStates.lunch.enabled && (
             <tr className="border-t border-gray-100">
               <td className="px-3 py-4 text-blue-600">1</td>
               <td className="px-3 dark:text-black">Lunch</td>
               <td className="px-3 dark:text-black">
                 <input
                   type="number"
                   value={mealStates.lunch.qty}
                   onChange={(e) => handleQuantityChange('lunch', parseInt(e.target.value) || 0)}
                   className="w-16 p-1 border rounded text-right disabled:bg-gray-100"
                   min="1"
                   readonly="true"
                   disabled={isPaid}
                 />
               </td>
               <td className="px-3">
                 <input
                   type="text"
                   value={formatCurrency(mealStates.lunch.price)}
                   onChange={(e) => handlePriceChange('lunch', parseInt(e.target.value.replace(/\D/g, '')) || 0)}
                   className="w-32 dark:text-black p-1 border rounded text-right disabled:bg-gray-100"
                   readonly="true"
                   disabled={isPaid}
                 />
               </td>
               <td className="px-3 text-right dark:text-black">
                 {formatCurrency(mealStates.lunch.qty * mealStates.lunch.price)}
               </td>
               <td className="px-3">
                 {/* {!isPaid && (
                   <button 
                     onClick={() => handleDelete('lunch')}
                     className="text-red-600 hover:text-red-800"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                     </svg>
                   </button>
                 )} */}
               </td>              
             </tr>
           )}
           {mealStates.dinner.enabled && (
             <tr className="border-t border-gray-100">
               <td className="px-3 py-4 text-blue-600">{mealStates.lunch.enabled ? 2 : 1}</td>
               <td className="px-3 dark:text-black">Dinner</td>
               <td className="px-3">
                 <input
                   type="number"
                   value={mealStates.dinner.qty}
                   onChange={(e) => handleQuantityChange('dinner', parseInt(e.target.value) || 0)}
                   className="w-16 p-1 border rounded dark:text-black text-right disabled:bg-gray-100"
                   min="1"
                   readonly="true"
                   disabled={isPaid}
                 />
               </td>
               <td className="px-3">
                 <input
                   type="text"
                   value={formatCurrency(mealStates.dinner.price)}
                   onChange={(e) => handlePriceChange('dinner', parseInt(e.target.value.replace(/\D/g, '')) || 0)}
                   className="w-32 p-1 border rounded dark:text-black text-right disabled:bg-gray-100"
                   readonly="true"
                   disabled={isPaid}
                 />
               </td>
               <td className="px-3 text-right dark:text-black">
                 {formatCurrency(mealStates.dinner.qty * mealStates.dinner.price)}
               </td>
               <td className="px-3">
                 {/* {!isPaid && (
                   <button 
                     onClick={() => handleDelete('dinner')}
                     className="text-red-600 hover:text-red-800"
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                     </svg>
                   </button>
                 )} */}
               </td>              
             </tr>
           )}
         </tbody>
         {(mealStates.lunch.enabled || mealStates.dinner.enabled) && (
           <tfoot>
             <tr>
               <td colSpan="4" className="dark:text-black px-3 py-4 text-right font-medium">Total</td>
               <td className={`px-3 text-right font-medium dark:text-black ${isPaid ? 'line-through text-gray-400' : ''}`}>
                 {formatCurrency(total)}
               </td>
               <td></td>
             </tr>
           </tfoot>
         )}
       </table>
    </div>
  );
 };
const Hotel = ({ hotel, onStatusChange, onDataChange, pax }) => {
  const isPaid = hotel.isPaid;
  const isDebt = hotel.isDebt;
  const [roomData, setRoomData] = useState(hotel.book_room);
  const [mealData, setMealData] = useState(hotel.book_hotel_meal);
  const [roomTotal, setRoomTotal] = useState(
    hotel.book_room.reduce((sum, room) => sum + (room.quantity * room.room_hotel.rate), 0)
  );
  const [mealTotal, setMealTotal] = useState(
    hotel.book_hotel_meal.reduce((sum, meal) => sum + parseFloat(meal.subtotal), 0)
  );
 
  useEffect(() => {
    onDataChange(hotel.id, roomData, mealData);
  }, [roomData, mealData, hotel.id, onDataChange]);
 
  const handleRoomTotalChange = (newTotal) => {
    setRoomTotal(newTotal);
    onStatusChange(hotel.id, isPaid, isDebt, newTotal + mealTotal);
  };
 
  const handleMealTotalChange = (newTotal) => {
    setMealTotal(newTotal);
    onStatusChange(hotel.id, isPaid, isDebt, roomTotal + newTotal);
  };
 
  const handlePaidChange = (checked) => {
    onStatusChange(hotel.id, checked, false, roomTotal + mealTotal);
  };
 
  const handleDebtChange = (checked) => {
    onStatusChange(hotel.id, isPaid, checked, roomTotal + mealTotal);
  };
 
  return (
    <div className="mt-4">
      <h3 className="font-bold">
        <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full">
          {hotel.hotel?.name}
        </span>
      </h3>
      <div className="flex gap-4 my-5">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isPaid}
            onChange={(e) => handlePaidChange(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="dark:text-black">Paid</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isDebt}
            onChange={(e) => handleDebtChange(e.target.checked)}
            className="w-4 h-4"
            disabled={isPaid}
          />
          <span className="dark:text-black">Hutang</span>
        </label>
      </div>
      <RoomTable 
        rooms={roomData}
        isPaid={isPaid}
        onTotalChange={handleRoomTotalChange}
        onDataChange={setRoomData}
      />
      {mealData.length > 0 && (
        <MealTable
          meals={mealData}
          hotelInfo={hotel}
          pax={pax}
          isPaid={isPaid}
          onTotalChange={handleMealTotalChange}
          onDataChange={setMealData}
        />
      )}
    </div>
  );
 };
 const AccommodationCard = ({ accommodations, onTotalsChange = () => {}, onChange = () => {} }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [hotelData, setHotelData] = useState(accommodations);
  const [hotelStatus, setHotelStatus] = useState(
    Object.fromEntries(accommodations.map(hotel => [hotel.id, { 
      isPaid: hotel.is_paid == '1' ? true : false, 
      isDebt: hotel.is_debt == '1' ? true : false,
      amount: 0
    }]))
  );
 
  const handleHotelDataChange = (hotelId, newRoomData, newMealData) => {
    setHotelData(prev => prev.map(hotel => {
      if (hotel.id === hotelId) {
        return {
          ...hotel,
          book_room: newRoomData,
          book_hotel_meal: newMealData
        };
      }
      return hotel;
    }));
  };
 
  const handleStatusChange = (hotelId, isPaid, isDebt, amount) => {
    setHotelStatus(prev => ({
      ...prev,
      [hotelId]: { isPaid, isDebt, amount }
    }));
  };
 
  const totals = useMemo(() => {
    const amounts = Object.values(hotelStatus).reduce((acc, status) => {
      return {
        total: acc.total + status.amount,
        paid: acc.paid + (status.isPaid ? status.amount : 0),
        debt: acc.debt + (status.isDebt && !status.isPaid ? status.amount : 0)
      };
    }, { total: 0, paid: 0, debt: 0 });
 
    const result = {
      totalAmount: amounts.total,
      paidAmount: amounts.paid,
      debtAmount: amounts.debt,
      balanceAmount: amounts.total - amounts.paid - amounts.debt
    };
    onTotalsChange(result);
    return result;
  }, [hotelStatus, onTotalsChange]);

  useEffect(() => {
    // Send full accommodation data to parent
    onChange({
      hotelData,     // full hotel data
      hotelStatus   // status tracking
    });
  }, [hotelData, hotelStatus, onChange]);  
 
  return (
    <div className="bg-white rounded shadow">
      <div className="p-4 border-b cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span className="font-medium dark:text-black">Accommodation</span>
          </div>
          <div className="flex gap-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Total: {formatCurrency(totals.totalAmount)}</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Paid: {formatCurrency(totals.paidAmount)}</span>
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">Hutang: {formatCurrency(totals.debtAmount)}</span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Balance: {formatCurrency(totals.balanceAmount)}</span>
          </div>
        </div>
      </div>
 
      {isExpanded && (
        <div className="p-4">
          {hotelData.map(hotel => (
            <div key={hotel.id} className="border rounded-md p-3 mb-3">
              <Hotel 
                key={hotel.id}
                hotel={{
                  ...hotel,
                  isPaid: hotelStatus[hotel.id]?.isPaid,
                  isDebt: hotelStatus[hotel.id]?.isDebt
                }}
                onStatusChange={handleStatusChange}
                onDataChange={handleHotelDataChange}
                pax={hotel.pax}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
 };
 
const BookingInfo = ({ booking }) => {
  const startDate = new Date(booking.travel_date_start).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="bg-white rounded shadow mb-4">
      <div className="p-4 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold text-lg dark:text-black">{booking.user.name}</h2>
            <p className="text-gray-600 text-sm">
              {booking.booking_detail[0]?.package?.name || `${booking.package_duration}D ${booking.package_duration-1}N Packages`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-gray-500 text-sm">Total Pax:</div>
            <div className="font-semibold dark:text-black">{booking.total_pax} Pax</div>
          </div>
        </div>
        <div className="flex justify-between items-center pt-2">
          <div>
            <div className="text-gray-500 text-sm dark:text-black">Travel Date:</div>
            <div className="dark:text-black">{startDate}</div>
          </div>
          <div className="text-right">
            <div className="text-gray-500 text-sm dark:text-black">Grand Total:</div>
            <div className="font-semibold dark:text-black">{formatCurrency(booking.grand_total)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
const DestinationTable = ({ items, onItemChange, onItemDelete  }) => {
  return (
    <div className="mb-10">
      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-600 bg-gray-100">
            <th className="px-3 w-48 text-center"></th>
            <th className="px-3 py-2 w-16">NO</th>
            <th className="px-3">ACTIVITY</th>
            <th className="px-3 w-24 text-right">QTY</th>
            <th className="px-3 w-40 text-right">PRICE</th>
            <th className="px-3 w-40 text-right">SUBTOTAL</th>
            <th className="px-3 w-16"></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id} className="border-t border-gray-100">
              <td className="px-3">
                <div className="flex justify-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.isPaid}
                      onChange={(e) => onItemChange(index, 'isPaid', e.target.checked)}
                      className="w-4 h-4 "
                    />
                    <span className="dark:text-black">Paid</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.isDebt}
                      onChange={(e) => onItemChange(index, 'isDebt', e.target.checked)}
                      className="w-4 h-4"
                      disabled={item.isPaid}
                    />
                    <span className="dark:text-black">Hutang</span>
                  </label>
                </div>
              </td>
              <td className="px-3 py-4 text-blue-600">{index + 1}</td>
              <td className="px-3 dark:text-black">{item.destination_activity.name}</td>
              <td className="px-3">
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => onItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                  className="w-16 dark:text-black p-1 border rounded text-right disabled:bg-gray-100"
                  min="1"
                  disabled={item.isPaid}
                />
              </td>
              <td className="px-3">
                <input
                  type="text"
                  value={formatCurrency(item.price)}
                  onChange={(e) => onItemChange(index, 'price', parseInt(e.target.value.replace(/\D/g, '')) || 0)}
                  className="w-32 dark:text-black p-1 border rounded text-right disabled:bg-gray-100"
                  disabled={item.isPaid}
                />
              </td>
              <td className={`px-3 text-right dark:text-black ${item.isPaid ? 'line-through text-gray-400' : ''}`}>
                {formatCurrency(item.quantity * item.price)}
              </td>
              <td className="px-3">
               {!item.isPaid && (
                 <button 
                   onClick={() => onItemDelete(index)}
                   className="text-red-600 hover:text-red-800"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                   </svg>
                 </button>
               )}
             </td>              
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="5" className="px-3 py-4 text-right font-medium dark:text-black">Total</td>
            <td className="px-3 text-right font-medium dark:text-black">
              {formatCurrency(items.reduce((sum, item) => sum + (item.quantity * item.price), 0))}
            </td>
            <td></td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
 
const Destination = ({ name, items, onItemChange,onItemDelete  }) => {
return (
  <div className="mt-4 border rounded-md p-3">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-bold mt-2">
        <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full">
          {name}
        </span>
      </h3>
    </div>
    <DestinationTable 
      items={items}
      onItemChange={onItemChange}
      onItemDelete={onItemDelete}        
    />
  </div>
);
};

const AddActivityModal = ({ 
  isOpen, 
  onClose, 
  destinationName, 
  listForNewItems, 
  onAddActivity, 
  existingItems 
  }) => {
  const [selectedActivity, setSelectedActivity] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  
  const availableActivities = useMemo(() => {
    return (listForNewItems[destinationName] || [])
      .filter(activity => 
        !existingItems.some(item => 
          item.destination_activity.name === activity.name)
      )
      .map(activity => activity.name);
  }, [destinationName, listForNewItems, existingItems]);

  // Find the price for the selected activity
  const getActivityPrice = (activityName) => {
    const activity = (listForNewItems[destinationName] || [])
      .find(a => a.name === activityName);
    return activity ? parseFloat(activity.price) : 0;
  };

  const handleSubmit = () => {
    if (selectedActivity) {
      onAddActivity(destinationName, {
        destination_activity: { name: selectedActivity },
        quantity: quantity,
        price: price || getActivityPrice(selectedActivity),
        isPaid: false,
        isDebt: false
      });
      setSelectedActivity('')
      setQuantity(1)
      setPrice(0)
      onClose();
    }
  };

  const isSubmitDisabled = 
    !selectedActivity || 
    quantity <= 0 || 
    price <= 0;  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-xl font-bold mb-4">Add New Activity for {destinationName}</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Select Activity</label>
          <select
            value={selectedActivity}
            onChange={(e) => {
              const activity = e.target.value;
              setSelectedActivity(activity);
              setPrice(getActivityPrice(activity));
            }}
            className="w-full p-2 border rounded"
          >
            <option value="">Select an activity</option>
            {availableActivities.map((activity) => (
              <option key={activity} value={activity}>{activity}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            min="1"
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Price</label>
          <input
            type="text"
            value={formatCurrency(price)}
            onChange={(e) => setPrice(parseInt(e.target.value.replace(/\D/g, '')) || 0)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={isSubmitDisabled}
          >
            Add Activity
          </button>
        </div>
      </div>
    </div>
  );
};

const DestinationsCard = ({ destinations, onTotalsChange = () => {},listForNewItemsDestinations, onChange = () => {} }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [destinationData, setDestinationData] = useState(() => {
    const data = {};
    Object.entries(destinations).forEach(([name, destItems]) => {
      data[name] = destItems.map(item => ({
        ...item,
        id: item.id,
        quantity: parseInt(item.qty),
        price: parseFloat(item.price),
        isPaid: item.status_paid === 'paid',
        isDebt: item.is_debt === '1',
        destination_activity: item.destination_activity
      }));
    });
    return data;
  });

  const [selectedDestination, setSelectedDestination] = useState(null)

  
  const handleItemChange = (destName, index, field, value) => {
    setDestinationData(prev => {
      const newData = { ...prev };
      newData[destName] = [...prev[destName]];
      if (field === 'isPaid' && value === true) {
        newData[destName][index] = {
          ...newData[destName][index],
          [field]: value,
          isDebt: false
        };
      } else {
        newData[destName][index] = {
          ...newData[destName][index],
          [field]: value
        };
      }
      return newData;
    });
  };

  const totals = useMemo(() => {
    let total = 0;
    let paid = 0;
    let debt = 0;

    Object.values(destinationData).forEach(items => {
      items.forEach(item => {
        const subtotal = item.quantity * item.price;
        total += subtotal;
        if (item.isPaid) {
          paid += subtotal;
        } else if (item.isDebt) {
          debt += subtotal;
        }
      });
    });
    

    return {
      totalAmount: total,
      paidAmount: paid,
      debtAmount: debt,
      balanceAmount: total - paid - debt
    };
  }, [destinationData]);

  useEffect(() => {
    onTotalsChange(totals);
  }, [totals, onTotalsChange]);

  useEffect(() => {
    onChange(destinationData);
  }, [destinationData, onChange]);

  const handleItemDelete = (destName, index) => {
    setDestinationData(prev => {
      const newData = { ...prev };
      newData[destName] = [...prev[destName]];
      newData[destName].splice(index, 1);
      return newData;
    });
  };

  const handleAddActivity = (destName, newActivity) => {
    setDestinationData(prev => {
      const newData = { ...prev };
      if (!newData[destName]) {
        newData[destName] = [];
      }
      newData[destName].push({
        ...newActivity,
        id: `new_${Date.now()}` // Temporary unique ID
      });
      return newData;
    });
  };

  return (
    <div className="bg-white rounded shadow">
      <div 
        className="p-4 border-b cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span className="font-medium dark:text-black">Activities</span>
          </div>
          <div className="flex gap-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Total: {formatCurrency(totals.totalAmount)}</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Paid: {formatCurrency(totals.paidAmount)}</span>
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">Hutang: {formatCurrency(totals.debtAmount)}</span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Balance: {formatCurrency(totals.balanceAmount)}</span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4">
          {Object.entries(destinationData).map(([name, items]) => (
            <div key={name} className="mb-4">
              <Destination 
                name={name}
                items={items}
                onItemChange={(index, field, value) => handleItemChange(name, index, field, value)}
                onItemDelete={(index) => handleItemDelete(name, index)}
              />
              <div className="flex justify-end mt-2">
                <button 
                  onClick={() => setSelectedDestination(name)}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add New Activity
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddActivityModal
        isOpen={!!selectedDestination}
        onClose={() => setSelectedDestination(null)}
        destinationName={selectedDestination || ''}
        listForNewItems={listForNewItemsDestinations}
        onAddActivity={handleAddActivity}
        existingItems={destinationData[selectedDestination] || []}        
      />
    </div>
  );
};
const AddOthersModal = ({ 
    isOpen, 
    onClose, 
    onAddItem, 
    listForNewItems,
    existingItems 
  }) => {
    const [selectedActivity, setSelectedActivity] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [price, setPrice] = useState(0);

    const availableActivities = useMemo(() => 
      (listForNewItems || [])
        .filter(activity => 
          !existingItems.some(item => 
            item.others_activity.id === activity.id)
        )
        .map(activity => ({
          id: activity.id,
          name: activity.name
        })), 
      [listForNewItems, existingItems]
    );

  const getActivityPrice = (activityName) => {
    const activity = listForNewItems.find(a => a.name === activityName);
    return activity ? parseFloat(activity.price) : 0;
  };

  const handleSubmit = () => {
    if (selectedActivity) {
      const selectedActivityData = listForNewItems.find(a => a.name === selectedActivity);      
      onAddItem({
        others_activity: { id:selectedActivityData.id, name: selectedActivity },
        quantity: quantity,
        price: price || getActivityPrice(selectedActivity),
        status_paid: 'unpaid',
        is_debt: '0'
      });
      setSelectedActivity('');
      setQuantity(1);
      setPrice(0);
      onClose();
    }
  };

  const isSubmitDisabled = 
    !selectedActivity || 
    quantity <= 0 || 
    price <= 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-xl font-bold mb-4">Add New Others Item</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Select Others</label>
          <select
              value={selectedActivity}
              onChange={(e) => {
                const activity = e.target.value;
                setSelectedActivity(activity);
                setPrice(getActivityPrice(activity));
              }}
              className="w-full p-2 border rounded"
            >
              <option value="">Select others</option>
              {availableActivities.map((activity) => (
                <option key={activity.id} value={activity.name}>{activity.name}</option>
              ))}
            </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            min="1"
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Price</label>
          <input
            type="text"
            value={formatCurrency(price)}
            onChange={(e) => setPrice(parseInt(e.target.value.replace(/\D/g, '')) || 0)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={isSubmitDisabled}
          >
            Add Item
          </button>
        </div>
      </div>
    </div>
  );
};

const OthersCard = ({ others, onTotalsChange = () => {},listForNewItems, onChange = () => {}   }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [items, setItems] = useState([...others]);
  const [itemStates, setItemStates] = useState(
    others.map(item => ({
      id: item.id,
      others_activity_id : item.others_activity.id,
      quantity: item.qty,
      price: parseFloat(item.price),
      isPaid: item.status_paid === 'paid',
      isDebt: item.is_debt === '1'
    }))
  );

  useEffect(() => {
      // Send full others data to parent
      onChange({
        items,
        itemStates
      });
    }, [items, itemStates, onChange]);  

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleQuantityChange = (index, value) => {
    setItemStates(prev => {
      const newStates = [...prev];
      newStates[index].quantity = value;
      return newStates;
    });
  };

  const handlePriceChange = (index, value) => {
    setItemStates(prev => {
      const newStates = [...prev];
      newStates[index].price = value;
      return newStates;
    });
  };

  const handlePaidChange = (index, checked) => {
    setItemStates(prev => {
      const newStates = [...prev];
      newStates[index].isPaid = checked;
      if (checked) newStates[index].isDebt = false;
      return newStates;
    });
  };

  const handleDebtChange = (index, checked) => {
    setItemStates(prev => {
      const newStates = [...prev];
      newStates[index].isDebt = checked;
      return newStates;
    });
  };

  const totals = useMemo(() => {
    let total = 0;
    let paid = 0;
    let debt = 0;

    itemStates.forEach((state, index) => {
      const subtotal = state.quantity * state.price;
      total += subtotal;
      if (state.isPaid) {
        paid += subtotal;
      } else if (state.isDebt) {
        debt += subtotal;
      }
    });

    const result = {
      totalAmount: total,
      paidAmount: paid,
      debtAmount: debt,
      balanceAmount: total - paid - debt
    };
    onTotalsChange(result);
    return result

  }, [itemStates]);

  const handleDelete = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
    setItemStates(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddItem = (newItem) => {
    console.log(newItem);
    
    const newItemState = {
      id: `new_${Date.now()}`,
      others_activity_id:newItem.others_activity.id,
      quantity: newItem.quantity,
      price: parseFloat(newItem.price),
      isPaid: false,
      isDebt: false
    };

    setItems(prev => [...prev, newItem]);
    setItemStates(prev => [...prev, newItemState]);
  };

  return (
    <div className="bg-white rounded shadow">
      <div 
        className="p-4 border-b cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span className="font-medium dark:text-black">Others</span>
          </div>
          <div className="flex gap-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Total: {formatCurrency(totals.totalAmount)}</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Paid: {formatCurrency(totals.paidAmount)}</span>
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">Hutang: {formatCurrency(totals.debtAmount)}</span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Balance: {formatCurrency(totals.balanceAmount)}</span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4">
          <div className="border rounded-md p-3">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-600 bg-gray-100">
                  <th className="px-3 w-48 text-center"></th>
                  <th className="px-3 py-2 w-16">NO</th>
                  <th className="px-3">ACTIVITY</th>
                  <th className="px-3 w-24 text-right">QTY</th>
                  <th className="px-3 w-40 text-right">PRICE</th>
                  <th className="px-3 w-40 text-right">SUBTOTAL</th>
                  <th className="px-3 w-16"></th>
                </tr>
              </thead>
              <tbody>
                {itemStates.map((state, index) => (
                  <tr key={state.id} className="border-t border-gray-100">
                    <td className="px-3">
                      <div className="flex justify-center gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={state.isPaid}
                            onChange={(e) => handlePaidChange(index, e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span className="dark:text-black">Paid</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={state.isDebt}
                            onChange={(e) => handleDebtChange(index, e.target.checked)}
                            className="w-4 h-4"
                            disabled={state.isPaid}
                          />
                          <span className="dark:text-black">Hutang</span>
                        </label>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-blue-600">{index + 1}</td>
                    <td className="px-3 dark:text-black">{items[index].others_activity.name}</td>
                    <td className="px-3">
                      <input
                        type="number"
                        value={state.quantity}
                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                        className="dark:text-black w-16 p-1 border rounded text-right disabled:bg-gray-100"
                        min="1"
                        disabled={state.isPaid}
                      />
                    </td>
                    <td className="px-3">
                      <input
                        type="text"
                        value={formatCurrency(state.price)}
                        onChange={(e) => handlePriceChange(index, parseInt(e.target.value.replace(/\D/g, '')) || 0)}
                        className="dark:text-black w-32 p-1 border rounded text-right disabled:bg-gray-100"
                        disabled={state.isPaid}
                      />
                    </td>
                    <td className={`dark:text-black px-3 text-right ${state.isPaid ? 'line-through text-gray-400' : ''}`}>
                      {formatCurrency(state.quantity * state.price)}
                    </td>
                    <td className="px-3">
                      {!state.isPaid && (
                        <button 
                          onClick={() => handleDelete(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" 
                               className="w-5 h-5" 
                               viewBox="0 0 24 24" 
                               fill="none" 
                               stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </td>                    
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="5" className="px-3 py-4 text-right font-medium dark:text-black">Total</td>
                  <td className="px-3 text-right font-medium dark:text-black">
                    {formatCurrency(totals.totalAmount)}
                  </td>
                  <td></td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
            <div className="flex justify-end mt-2">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add New Others
              </button>
            </div>            
          </div>
        </div>
      )}
      <AddOthersModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddItem={handleAddItem}
        listForNewItems={listForNewItems}
        existingItems={items}        
      />
    </div>
  );
};
const ResourceTable = ({ items, states, type, onStateChange, onDelete }) => (
  <div className="mb-6">
    <h4 className="font-medium mb-5 mt-3">
      <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full">
          {type}
      </span>
    </h4>
    <table className="w-full">
      <thead>
        <tr className="text-left text-gray-600 bg-gray-100">
          <th className="px-3 w-48 text-center"></th>
          <th className="px-3 py-2 w-16">NO</th>
          <th className="px-3">NAME</th>
          <th className="px-3 w-24 text-right">QTY</th>
          <th className="px-3 w-40 text-right">PRICE</th>
          <th className="px-3 w-40 text-right">SUBTOTAL</th>
          <th className="px-3 w-16"></th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={item.id} className="border-t border-gray-100">
            <td className="px-3">
              <div className="flex justify-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={states[index].isPaid}
                    onChange={(e) => onStateChange(index, 'isPaid', e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="dark:text-black">Paid</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={states[index].isDebt}
                    onChange={(e) => onStateChange(index, 'isDebt', e.target.checked)}
                    className="w-4 h-4"
                    disabled={states[index].isPaid}
                  />
                  <span className="dark:text-black">Hutang</span>
                </label>
              </div>
            </td>
            <td className="px-3 py-4 text-blue-600">{index + 1}</td>
            <td className="px-3 dark:text-black">{type === 'Transportations' ? item.car.name : item.crew_role.role}</td>
            <td className="px-3">
              <input
                type="number"
                value={states[index].quantity}
                onChange={(e) => onStateChange(index, 'quantity', parseInt(e.target.value) || 0)}
                className="w-16 dark:text-black p-1 border rounded text-right disabled:bg-gray-100"
                min="1"
                disabled={states[index].isPaid}
              />
            </td>
            <td className="px-3">
              <input
                type="text"
                value={formatCurrency(states[index].price)}
                onChange={(e) => onStateChange(index, 'price', parseInt(e.target.value.replace(/\D/g, '')) || 0)}
                className="w-32 dark:text-black p-1 border rounded text-right disabled:bg-gray-100"
                disabled={states[index].isPaid}
              />
            </td>
            <td className={`px-3 dark:text-black text-right ${states[index].isPaid ? 'line-through text-gray-400' : ''}`}>
              {formatCurrency(states[index].quantity * states[index].price)}
            </td>
            <td className="px-3">
              {!states[index].isPaid && (
                <button 
                  onClick={() => onDelete(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </td>              
          </tr>
        ))}
      </tbody>
      {items.length > 0 && (
        <tfoot>
          <tr>
            <td colSpan="5" className="px-3 py-4 text-right font-medium dark:text-black">Total</td>
            <td className="px-3 text-right font-medium dark:text-black">
              {formatCurrency(states.reduce((sum, state) => sum + (state.quantity * state.price), 0))}
            </td>
            <td></td>
          </tr>
        </tfoot>
      )}
    </table>
  </div>
);

const ResourceCard = ({ resources, onTotalsChange = () => {},listForNewItemsCars,listForNewItemsCrews, onChange = () => {} }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [cars, setCars] = useState(resources.cars);
  const [crews, setCrews] = useState(resources.crews);
  const [carStates, setCarStates] = useState(
    resources.cars.map(item => ({
      id: item.id,
      quantity: item.qty,
      price: parseFloat(item.price),
      isPaid: item.status_paid === 'paid',
      isDebt: item.is_debt === '1'
    }))
  );
  const [isTransportationModalOpen, setIsTransportationModalOpen] = useState(false); 
  const [isCrewModalOpen, setIsCrewModalOpen] = useState(false); 

  const [crewStates, setCrewStates] = useState(
    resources.crews.map(item => ({
      id: item.id,
      quantity: item.qty,
      price: parseFloat(item.price),
      isPaid: item.status_paid === 'paid',
      isDebt: item.is_debt === '1'
    }))
  );
  useEffect(() => {
    // Send full resource data to parent
    onChange({
      cars,
      crews,
      carStates,
      crewStates
    });
  }, [cars, crews, carStates, crewStates, onChange]);


  const handleCarChange = (index, field, value) => {
    setCarStates(prev => {
      const newStates = [...prev];
      newStates[index][field] = value;
      if (field === 'isPaid' && value) {
        newStates[index].isDebt = false;
      }
      return newStates;
    });
  };

  const handleCrewChange = (index, field, value) => {
    setCrewStates(prev => {
      const newStates = [...prev];
      newStates[index][field] = value;
      if (field === 'isPaid' && value) {
        newStates[index].isDebt = false;
      }
      return newStates;
    });
  };

  const handleCarDelete = (index) => {
    setCars(prev => prev.filter((_, i) => i !== index));
    setCarStates(prev => prev.filter((_, i) => i !== index));
  };

  const handleCrewDelete = (index) => {
    setCrews(prev => prev.filter((_, i) => i !== index));
    setCrewStates(prev => prev.filter((_, i) => i !== index));
  };

  const totals = useMemo(() => {
    const calculateTotal = (states) => states.reduce((sum, state) => 
      sum + (state.quantity * state.price), 0
    );

    const calculatePaid = (states) => states.reduce((sum, state) => 
      sum + (state.isPaid ? state.quantity * state.price : 0), 0
    );

    const calculateDebt = (states) => states.reduce((sum, state) => 
      sum + (state.isDebt && !state.isPaid ? state.quantity * state.price : 0), 0
    );

    const carTotal = calculateTotal(carStates);
    const carPaid = calculatePaid(carStates);
    const carDebt = calculateDebt(carStates);

    const crewTotal = calculateTotal(crewStates);
    const crewPaid = calculatePaid(crewStates);
    const crewDebt = calculateDebt(crewStates);

    const result = {
      totalAmount: carTotal + crewTotal,
      paidAmount: carPaid + crewPaid,
      debtAmount: carDebt + crewDebt,
      balanceAmount: (carTotal + crewTotal) - (carPaid + crewPaid) - (carDebt + crewDebt)
    };
    onTotalsChange(result);
    return result
  }, [carStates, crewStates]);

  const handleAddTransportation = (newItem) => {
    const newItemState = {
      id: `new_${Date.now()}`,
      quantity: newItem.qty,
      price: parseFloat(newItem.price),
      isPaid: false,
      isDebt: false
    };

    setCars(prev => [...prev, newItem]);
    setCarStates(prev => [...prev, newItemState]);
  };
  const handleAddCrew = (newItem) => {
    const newItemState = {
      id: `new_${Date.now()}`,
      quantity: newItem.qty,
      price: parseFloat(newItem.price),
      isPaid: false,
      isDebt: false
    };
  
    setCrews(prev => [...prev, newItem]);
    setCrewStates(prev => [...prev, newItemState]);
  };
  return (
    <div className="bg-white rounded shadow mb-4">
      <div 
        className="p-4 border-b cursor-pointer" 
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span className="font-medium dark:text-black">Resource Requirements</span>
          </div>
          <div className="flex gap-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Total: {formatCurrency(totals.totalAmount)}</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Paid: {formatCurrency(totals.paidAmount)}</span>
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">Hutang: {formatCurrency(totals.debtAmount)}</span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Balance: {formatCurrency(totals.balanceAmount)}</span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4">
          <div className="border rounded-md p-3 mb-3">
            <ResourceTable 
              items={cars} 
              states={carStates}
              type="Transportations"
              onStateChange={handleCarChange}
              onDelete={handleCarDelete}
            />
            <div className="flex justify-end mt-2">
              <button 
                onClick={() => setIsTransportationModalOpen(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Transportation
              </button>
            </div>          
          </div>
          <div className="border rounded-md p-3">
            <ResourceTable 
              items={crews} 
              states={crewStates}
              type="Crews"
              onStateChange={handleCrewChange}
              onDelete={handleCrewDelete}
            />
            <div className="flex justify-end mt-2">
              <button 
                onClick={() => setIsCrewModalOpen(true)}
                className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Crew
              </button>
            </div>            
          </div>
        </div>
      )}
      <AddTransportationModal
        isOpen={isTransportationModalOpen}
        onClose={() => setIsTransportationModalOpen(false)}
        onAddItem={handleAddTransportation}
        listForNewItems={listForNewItemsCars}
        existingItems={cars}
      />      
      <AddCrewModal
        isOpen={isCrewModalOpen}
        onClose={() => setIsCrewModalOpen(false)}
        onAddItem={handleAddCrew}
        listForNewItems={listForNewItemsCrews}
        existingItems={crews}
      />      
    </div>
  );
};
const AddCrewModal = ({ 
  isOpen, 
  onClose, 
  onAddItem, 
  listForNewItems,
  existingItems 
}) => {
  const [selectedCrew, setSelectedCrew] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  
  const availableCrews = useMemo(() => 
    (listForNewItems || [])
      .filter(crew => 
        !existingItems.some(item => 
          item.crew_role.id === crew.id)
      )
      .map(crew => crew.role), 
    [listForNewItems, existingItems]
  );

  const getCrewPrice = (crewRole) => {
    const crew = listForNewItems.find(c => c.role === crewRole);
    return crew ? parseFloat(crew.rate) : 0;
  };

  const handleSubmit = () => {
    if (selectedCrew) {
      const crew = listForNewItems.find(c => c.role === selectedCrew);
      onAddItem({
        crew_role: crew,
        qty: quantity,
        price: price || getCrewPrice(selectedCrew),
        status_paid: 'unpaid',
        is_debt: '0'
      });
      setSelectedCrew('');
      setQuantity(1);
      setPrice(0);
      onClose();
    }
  };

  const isSubmitDisabled = 
    !selectedCrew || 
    quantity <= 0 || 
    price <= 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-xl font-bold mb-4">Add New Crew</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Select Crew</label>
          <select
            value={selectedCrew}
            onChange={(e) => {
              const crew = e.target.value;
              setSelectedCrew(crew);
              setPrice(getCrewPrice(crew));
            }}
            className="w-full p-2 border rounded"
          >
            <option value="">Select a crew</option>
            {availableCrews.map((crew) => (
              <option key={crew} value={crew}>{crew}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            min="1"
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Price</label>
          <input
            type="text"
            value={formatCurrency(price)}
            onChange={(e) => setPrice(parseInt(e.target.value.replace(/\D/g, '')) || 0)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={isSubmitDisabled}
          >
            Add Crew
          </button>
        </div>
      </div>
    </div>
  );
};
const AddTransportationModal = ({ 
  isOpen, 
  onClose, 
    onAddItem, 
    listForNewItems,
    existingItems 
  }) => {
  const [selectedTransportation, setSelectedTransportation] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
    
  const availableTransportations = useMemo(() => 
    (listForNewItems || [])
      .filter(car => 
        !existingItems.some(item => 
          item.car.id === car.id)
      )
      .map(car => car.name), 
    [listForNewItems, existingItems]
  );

  const getTransportationPrice = (transportationName) => {
    const transportation = listForNewItems.find(c => c.name === transportationName);
    return transportation ? parseFloat(transportation.price) : 0;
  };

  const handleSubmit = () => {
    if (selectedTransportation) {
      const transportation = listForNewItems.find(c => c.name === selectedTransportation);
      onAddItem({
        car: transportation,
        qty: quantity,
        price: price || getTransportationPrice(selectedTransportation),
        status_paid: 'unpaid',
        is_debt: '0'
      });
      setSelectedTransportation('');
      setQuantity(1);
      setPrice(0);
      onClose();
    }
  };

  const isSubmitDisabled = 
    !selectedTransportation || 
    quantity <= 0 || 
    price <= 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-96">
        <h2 className="text-xl font-bold mb-4">Add New Transportation</h2>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Select Transportation</label>
          <select
            value={selectedTransportation}
            onChange={(e) => {
              const transportation = e.target.value;
              setSelectedTransportation(transportation);
              setPrice(getTransportationPrice(transportation));
            }}
            className="w-full p-2 border rounded"
          >
            <option value="">Select a transportation</option>
            {availableTransportations.map((transportation) => (
              <option key={transportation} value={transportation}>{transportation}</option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Quantity</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            min="1"
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Price</label>
          <input
            type="text"
            value={formatCurrency(price)}
            onChange={(e) => setPrice(parseInt(e.target.value.replace(/\D/g, '')) || 0)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={isSubmitDisabled}
          >
            Add Transportation
          </button>
        </div>
      </div>
    </div>
  );
};
const useExpenseData = (initialData) => {
  const [accommodationTotals, setAccommodationTotals] = useState({
    totalAmount: 0,
    paidAmount: 0,
    debtAmount: 0,
    balanceAmount: 0
  });

  const [destinationTotals, setDestinationTotals] = useState({
    totalAmount: 0,
    paidAmount: 0,
    debtAmount: 0,
    balanceAmount: 0
  });

  const [othersTotals, setOthersTotals] = useState({
    totalAmount: 0,
    paidAmount: 0,
    debtAmount: 0,
    balanceAmount: 0
  });

  const [resourceTotals, setResourceTotals] = useState({
    totalAmount: 0,
    paidAmount: 0,
    debtAmount: 0,
    balanceAmount: 0
  });

  const summaryTotals = useMemo(() => {
    const totalAmount = accommodationTotals.totalAmount + destinationTotals.totalAmount + 
                       othersTotals.totalAmount + resourceTotals.totalAmount;
    const paidAmount = accommodationTotals.paidAmount + destinationTotals.paidAmount + 
                      othersTotals.paidAmount + resourceTotals.paidAmount;
    const debtAmount = accommodationTotals.debtAmount + destinationTotals.debtAmount + 
                      othersTotals.debtAmount + resourceTotals.debtAmount;
                
    return {
      totalAmount,
      paidAmount,
      debtAmount,
      balanceAmount: totalAmount - paidAmount - debtAmount,
      profit: initialData.booking.grand_total - totalAmount
    };
  }, [
    accommodationTotals, 
    destinationTotals, 
    othersTotals, 
    resourceTotals, 
    initialData.booking.grand_total
  ]);

  return {
    summaryTotals,
    setters: {
      setAccommodationTotals,
      setDestinationTotals,
      setOthersTotals,
      setResourceTotals
    }
  };
};

const SummaryCard = ({ totals }) => {
  return (
    <div className="bg-white rounded shadow p-4">
      <div className="flex flex-col gap-4">
        <h2 className="font-bold text-xl dark:text-black">Summary</h2>
        <div className="grid grid-cols-5 gap-4">
          <div className="p-4 rounded-lg bg-blue-100">
            <div className="text-blue-800 font-medium">Total Cost</div>
            <div className="text-2xl font-bold text-blue-900">{formatCurrency(totals.totalAmount)}</div>
          </div>
          <div className="p-4 rounded-lg bg-green-100">
            <div className="text-green-800 font-medium">Total Paid</div>
            <div className="text-2xl font-bold text-green-900">{formatCurrency(totals.paidAmount)}</div>
          </div>
          <div className="p-4 rounded-lg bg-red-100">
            <div className="text-red-800 font-medium">Total Hutang</div>
            <div className="text-2xl font-bold text-red-900">{formatCurrency(totals.debtAmount)}</div>
          </div>
          <div className="p-4 rounded-lg bg-yellow-100">
            <div className="text-yellow-800 font-medium">Balance</div>
            <div className="text-2xl font-bold text-yellow-900">{formatCurrency(totals.balanceAmount)}</div>
          </div>
          <div className="p-4 rounded-lg bg-purple-100">
            <div className="text-purple-800 font-medium">Profit</div>
            <div className="text-2xl font-bold text-purple-900">{formatCurrency(totals.profit)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default function EditExpenseManager({ booking,accommodations,destinations,others,resources,listForNewItems }) {
  const { summaryTotals, setters } = useExpenseData({ booking });  

  const [accommodationState, setAccommodationState] = useState({});
  const [destinationState, setDestinationState] = useState({});
  const [othersState, setOthersState] = useState({});
  const [resourceState, setResourceState] = useState({ cars: [], crews: [] });

  const handleSubmit = () => {
    // console.log(resourceState);
    
    const submitData = {
      booking_id: booking.id,
      accommodations: accommodationState.hotelData?.map(hotel => ({
        hotel_id: hotel.id,
        is_paid: accommodationState.hotelStatus[hotel.id]?.isPaid ? '1' : '0', 
        is_debt: accommodationState.hotelStatus[hotel.id]?.isDebt ? '1' : '0',
        rooms: hotel.book_room.map(room => ({
          id: room.id,
          quantity: room.quantity,
          rate: room.room_hotel.rate
        })),
        meals: hotel.book_hotel_meal.map(meal => ({
          id: meal.id,
          type: meal.meals,
          qty: meal.qty,
          price: meal.price
        }))
      })) || [],
      
      destinations: Object.entries(destinationState).map(([name, items]) => ({
        destination: name,
        activities: items.map(item => ({
          id: item.id,
          destination_id : item.destination_id,
          destination_activity_id : item.destination_activity_id,
          quantity: item.quantity,
          price: item.price,
          status_paid: item.isPaid ? 'paid' : 'unpaid',
          is_debt: item.isDebt ? '1' : '0'
        }))
      })),
  
      others: othersState.items?.map((item, index) => ({
        id: item.id, 
        others_activity_id: othersState.itemStates[index].others_activity_id,
        quantity: othersState.itemStates[index].quantity,
        price: othersState.itemStates[index].price,
        status_paid: othersState.itemStates[index].isPaid ? 'paid' : 'unpaid',
        is_debt: othersState.itemStates[index].isDebt ? '1' : '0'
      })) || [],
  
      resources: {
        cars: resourceState.cars?.map((car, index) => ({
          id: car.id,
          car_id: resourceState.cars[index].car.id,
          quantity: resourceState.carStates[index].quantity,
          price: resourceState.carStates[index].price,
          status_paid: resourceState.carStates[index].isPaid ? 'paid' : 'unpaid',
          is_debt: resourceState.carStates[index].isDebt ? '1' : '0'
        })) || [],
        crews: resourceState.crews?.map((crew, index) => ({
          id: crew.id,
          crew_role_id: resourceState.crews[index].crew_role.id,
          quantity: resourceState.crewStates[index].quantity,
          price: resourceState.crewStates[index].price,
          status_paid: resourceState.crewStates[index].isPaid ? 'paid' : 'unpaid',
          is_debt: resourceState.crewStates[index].isDebt ? '1' : '0'
        })) || []
      },
      summary: summaryTotals
    };

    router.post(`/finance/expense-manager/${booking.id}/update`, submitData, {
      onBefore: () => {
          // Show loading state
          Swal.fire({
              title: 'Processing...',
              html: 'Please wait while we process your expense.',
              allowOutsideClick: false,
              didOpen: () => {
                  Swal.showLoading();
              }
          });
      },
      onSuccess: () => {
          // Show success message
          Swal.fire({
              title: 'Success!',
              text: 'Expense has been successfully submitted',
              icon: 'success'
          }).then(() => {
              // Redirect to booking list
              router.visit(`/finance/expense-manager/${booking.id}/edit`);
          });
      },
      onError: (errors) => {
          // Show error message
          Swal.fire({
              title: 'Error!',
              text: 'There was a problem submitting your expense. Please check your input and try again.',
              icon: 'error'
          });
          console.error('Submission errors:', errors);
      },
      preserveState: true,
      preserveScroll: true
    });

    console.log('Data to submit:', submitData);
  };
  return (
    <Authenticated>
        <BookingInfo booking={booking} />
        <AccommodationCard 
            accommodations={accommodations} 
            onTotalsChange={setters.setAccommodationTotals}
            onChange={setAccommodationState} 
          />
          <DestinationsCard 
            destinations={destinations} 
            onTotalsChange={setters.setDestinationTotals}
            listForNewItemsDestinations={listForNewItems.destinations}
            onChange={setDestinationState}
          />
          <OthersCard 
            others={others} 
            onTotalsChange={setters.setOthersTotals}
            listForNewItems={listForNewItems.others}
            onChange={setOthersState}
          />
          <ResourceCard 
            resources={resources} 
            onTotalsChange={setters.setResourceTotals}
            listForNewItemsCars={listForNewItems.cars}
            listForNewItemsCrews={listForNewItems.crews}
            onChange={setResourceState}
          />
        <SummaryCard totals={summaryTotals} />
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Submit Changes
          </button>
        </div>        
    </Authenticated>
  );
}

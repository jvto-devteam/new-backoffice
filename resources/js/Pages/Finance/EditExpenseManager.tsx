import React, { useState, useMemo, useEffect } from 'react';
import Authenticated from '@/Layouts/Main';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const RoomTable = ({ rooms, isPaid, onTotalChange }) => {
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
  };

  const handleRateChange = (index, value) => {
    const newStates = [...roomStates];
    newStates[index].rate = value;
    setRoomStates(newStates);
  };

  const total = useMemo(() => 
    roomStates.reduce((sum, state) => sum + (state.quantity * state.rate), 0)
  , [roomStates]);

  useEffect(() => {
    onTotalChange(total);
  }, [total, onTotalChange]);
  const handleDelete = (index) => {
    setRoomStates(prev => prev.filter((_, i) => i !== index));
    rooms.splice(index, 1); // Menghapus dari data asli
  };

  return (
    <div className="mb-6">
      <h4 className="font-medium mb-2">Rooms</h4>
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
              <td className="px-3">{room.room_hotel.room_name}</td>
              <td className="px-3">
                <input
                  type="number"
                  value={roomStates[index].quantity}
                  onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                  className="w-16 p-1 border rounded text-right disabled:bg-gray-100"
                  min="1"
                  disabled={isPaid}
                />
              </td>
              <td className="px-3">
                <input
                  type="text"
                  value={formatCurrency(roomStates[index].rate)}
                  onChange={(e) => handleRateChange(index, parseInt(e.target.value.replace(/\D/g, '')) || 0)}
                  className="w-32 p-1 border rounded text-right disabled:bg-gray-100"
                  disabled={isPaid}
                />
              </td>
              <td className="px-3 text-right">
                {formatCurrency(roomStates[index].quantity * roomStates[index].rate)}
              </td>
              <td className="px-3">
                {!isPaid && (
                  <button 
                    onClick={() => handleDelete(index)}
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
            <td colSpan="4" className="px-3 py-4 text-right font-medium">Total</td>
            <td className={`px-3 text-right font-medium ${isPaid ? 'line-through text-gray-400' : ''}`}>
              {formatCurrency(total)}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

const MealTable = ({ meals, hotelInfo, pax, isPaid, onTotalChange }) => {
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
  };

  const handlePriceChange = (type, value) => {
    setMealStates(prev => ({
      ...prev,
      [type]: { ...prev[type], price: value }
    }));
  };

  const total = useMemo(() => {
    return Object.values(mealStates).reduce((sum, meal) => {
      return sum + (meal.enabled ? meal.qty * meal.price : 0)
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
  };

  return (
    <div className="mb-6">
      <h4 className="font-medium mb-2">Meals</h4>
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
              <td className="px-3">Lunch</td>
              <td className="px-3">
                <input
                  type="number"
                  value={mealStates.lunch.qty}
                  onChange={(e) => handleQuantityChange('lunch', parseInt(e.target.value) || 0)}
                  className="w-16 p-1 border rounded text-right disabled:bg-gray-100"
                  min="1"
                  disabled={isPaid}
                />
              </td>
              <td className="px-3">
                <input
                  type="text"
                  value={formatCurrency(mealStates.lunch.price)}
                  onChange={(e) => handlePriceChange('lunch', parseInt(e.target.value.replace(/\D/g, '')) || 0)}
                  className="w-32 p-1 border rounded text-right disabled:bg-gray-100"
                  disabled={isPaid}
                />
              </td>
              <td className="px-3 text-right">
                {formatCurrency(mealStates.lunch.qty * mealStates.lunch.price)}
              </td>
              <td className="px-3">
                {!isPaid && (
                  <button 
                    onClick={() => handleDelete('lunch')}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </td>              
            </tr>
          )}
          {mealStates.dinner.enabled && (
            <tr className="border-t border-gray-100">
              <td className="px-3 py-4 text-blue-600">{mealStates.lunch.enabled ? 2 : 1}</td>
              <td className="px-3">Dinner</td>
              <td className="px-3">
                <input
                  type="number"
                  value={mealStates.dinner.qty}
                  onChange={(e) => handleQuantityChange('dinner', parseInt(e.target.value) || 0)}
                  className="w-16 p-1 border rounded text-right disabled:bg-gray-100"
                  min="1"
                  disabled={isPaid}
                />
              </td>
              <td className="px-3">
                <input
                  type="text"
                  value={formatCurrency(mealStates.dinner.price)}
                  onChange={(e) => handlePriceChange('dinner', parseInt(e.target.value.replace(/\D/g, '')) || 0)}
                  className="w-32 p-1 border rounded text-right disabled:bg-gray-100"
                  disabled={isPaid}
                />
              </td>
              <td className="px-3 text-right">
                {formatCurrency(mealStates.dinner.qty * mealStates.dinner.price)}
              </td>
              <td className="px-3">
                {!isPaid && (
                  <button 
                    onClick={() => handleDelete('dinner')}
                    className="text-red-600 hover:text-red-800"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </td>              
            </tr>
          )}
        </tbody>
        {(mealStates.lunch.enabled || mealStates.dinner.enabled) && (
          <tfoot>
            <tr>
              <td colSpan="4" className="px-3 py-4 text-right font-medium">Total</td>
              <td className={`px-3 text-right font-medium ${isPaid ? 'line-through text-gray-400' : ''}`}>
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

const Hotel = ({ hotel, onStatusChange, pax }) => {
  const isPaid = hotel.isPaid;
  const isDebt = hotel.isDebt;
  const [roomTotal, setRoomTotal] = useState(
    hotel.book_room.reduce((sum, room) => sum + (room.quantity * room.room_hotel.rate), 0)
  );
  const [mealTotal, setMealTotal] = useState(
    hotel.book_hotel_meal.reduce((sum, meal) => sum + parseFloat(meal.subtotal), 0)
  );

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
          <span>Paid</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isDebt}
            onChange={(e) => handleDebtChange(e.target.checked)}
            className="w-4 h-4"
            disabled={isPaid}
          />
          <span>Hutang</span>
        </label>
      </div>
      <RoomTable 
        rooms={hotel.book_room} 
        isPaid={isPaid} 
        onTotalChange={handleRoomTotalChange} 
      />
      {
        (hotel.book_hotel_meal.length != 0) && (
          <MealTable 
            meals={hotel.book_hotel_meal} 
            hotelInfo={hotel}
            pax={pax}
            isPaid={isPaid}
            onTotalChange={handleMealTotalChange}
          />
        )
      }
    </div>
  );
};
const AccommodationCard = ({ accommodations, onTotalsChange = () => {} }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [hotelStatus, setHotelStatus] = useState(
    Object.fromEntries(accommodations.map(hotel => [hotel.id, { 
      isPaid: hotel.is_paid == '1' ? true : false, 
      isDebt: hotel.is_debt == '1' ? true : false, 
      amount: hotel.book_room.reduce((sum, room) => sum + (room.quantity * room.room_hotel.rate), 0)
    }]))
  );
  
  const totals = useMemo(() => {
    const amounts = Object.values(hotelStatus).reduce((acc, status) => {
      return {
        total: acc.total + status.amount,
        paid: acc.paid + (status.isPaid ? status.amount : 0),
        debt: acc.debt + (status.isDebt && !status.isPaid ? status.amount : 0)
      };
    }, { total: 0, paid: 0, debt: 0 });

    const result =  {
      totalAmount: amounts.total,
      paidAmount: amounts.paid,
      debtAmount: amounts.debt,
      balanceAmount: amounts.total - amounts.paid
    };
    onTotalsChange(result);
    return result
  }, [hotelStatus]);

  const handleStatusChange = (hotelId, isPaid, isDebt, amount) => {
    setHotelStatus(prev => ({
      ...prev,
      [hotelId]: { isPaid, isDebt, amount }
    }));
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
            <span className="font-medium">Accommodation</span>
          </div>
          <div className="flex gap-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Total: {formatCurrency(totals.totalAmount)}</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Paid: {formatCurrency(totals.paidAmount)}</span>
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">Debt: {formatCurrency(totals.debtAmount)}</span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Balance: {formatCurrency(totals.balanceAmount)}</span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4">
          {accommodations.map(hotel => (
            <div className="border rounded-md p-3 mb-3">
              <Hotel 
                key={hotel.id} 
                hotel={{...hotel, isPaid: hotelStatus[hotel.id]?.isPaid, isDebt: hotelStatus[hotel.id]?.isDebt}}
                onStatusChange={handleStatusChange}
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
            <h2 className="font-bold text-lg">{booking.user.name}</h2>
            <p className="text-gray-600 text-sm">
              {booking.booking_detail[0]?.package?.name || 'No Package Selected'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-gray-500 text-sm">Total Pax:</div>
            <div className="font-semibold">{booking.total_pax} Pax</div>
          </div>
        </div>
        <div className="flex justify-between items-center pt-2">
          <div>
            <div className="text-gray-500 text-sm">Travel Date:</div>
            <div>{startDate}</div>
          </div>
          <div className="text-right">
            <div className="text-gray-500 text-sm">Grand Total:</div>
            <div className="font-semibold">{formatCurrency(booking.grand_total)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
const DestinationTable = ({ items, onItemStatusChange, onTotalChange }) => {
  const [activityStates, setActivityStates] = useState(
    items.map(item => ({
      quantity: item.qty,
      price: parseFloat(item.price),
      isPaid: item.status_paid === 'paid',
      isDebt: item.is_debt === '1'
    }))
  );

  const allPaid = activityStates.every(state => state.isPaid);
  const anyPaid = activityStates.some(state => state.isPaid);

  const handleQuantityChange = (index, value) => {
    const newStates = [...activityStates];
    newStates[index].quantity = value;
    setActivityStates(newStates);
  };

  const handlePriceChange = (index, value) => {
    const newStates = [...activityStates];
    newStates[index].price = value;
    setActivityStates(newStates);
  };

  const handlePaidChange = (index, checked) => {
    const newStates = [...activityStates];
    newStates[index].isPaid = checked;
    if (checked) {
      newStates[index].isDebt = false;
    }
    setActivityStates(newStates);
    onItemStatusChange(items[index].id, checked, false);
  };

  const handleDebtChange = (index, checked) => {
    const newStates = [...activityStates];
    newStates[index].isDebt = checked;
    setActivityStates(newStates);
    onItemStatusChange(items[index].id, activityStates[index].isPaid, checked);
  };

  const total = useMemo(() => 
    activityStates.reduce((sum, state) => sum + (state.quantity * state.price), 0)
  , [activityStates]);

  useEffect(() => {
    onTotalChange(total);
  }, [total, onTotalChange]);

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
                      checked={activityStates[index].isPaid}
                      onChange={(e) => handlePaidChange(index, e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span>Paid</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={activityStates[index].isDebt}
                      onChange={(e) => handleDebtChange(index, e.target.checked)}
                      className="w-4 h-4"
                      disabled={activityStates[index].isPaid}
                    />
                    <span>Hutang</span>
                  </label>
                </div>
              </td>
              <td className="px-3 py-4 text-blue-600">{index + 1}</td>
              <td className="px-3">{item.destination_activity.name}</td>
              <td className="px-3">
                <input
                  type="number"
                  value={activityStates[index].quantity}
                  onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                  className="w-16 p-1 border rounded text-right disabled:bg-gray-100"
                  min="1"
                  disabled={activityStates[index].isPaid}
                />
              </td>
              <td className="px-3">
                <input
                  type="text"
                  value={formatCurrency(activityStates[index].price)}
                  onChange={(e) => handlePriceChange(index, parseInt(e.target.value.replace(/\D/g, '')) || 0)}
                  className="w-32 p-1 border rounded text-right disabled:bg-gray-100"
                  disabled={activityStates[index].isPaid}
                />
              </td>
              <td className={`px-3 text-right ${anyPaid ? 'line-through text-gray-400' : ''}`}>
                {formatCurrency(activityStates[index].quantity * activityStates[index].price)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="5" className="px-3 py-4 text-right font-medium">Total</td>
            <td className={`px-3 text-right font-medium ${anyPaid ? 'line-through text-gray-400' : ''}`}>
              {formatCurrency(total)}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

const Destination = ({ name, items, onStatusChange }) => {
  const [currentTotal, setCurrentTotal] = useState(
    items.reduce((sum, item) => sum + (parseFloat(item.qty) * parseFloat(item.price)), 0)
  );

  const handleTotalChange = (newTotal) => {
    setCurrentTotal(newTotal);
    onStatusChange(name, newTotal);
  };

  const handleItemStatusChange = (itemId, isPaid, isDebt) => {
    onStatusChange(name, currentTotal, { itemId, isPaid, isDebt });
  };

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
        onTotalChange={handleTotalChange}
        onItemStatusChange={handleItemStatusChange}
      />
    </div>
  );
};

const DestinationsCard = ({ destinations, onTotalsChange = () => {} }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [destinationStatus, setDestinationStatus] = useState(
    Object.fromEntries(Object.entries(destinations).map(([name, items]) => [
      name,
      {
        amount: items.reduce((sum, item) => sum + (parseFloat(item.qty) * parseFloat(item.price)), 0),
        items: items.map(item => ({
          id: item.id,
          isPaid: item.status_paid === 'paid',
          isDebt: item.is_debt === '1'
        }))
      }
    ]))
  );

  const totals = useMemo(() => {
    let total = 0;
    let paid = 0;
    let debt = 0;

    Object.entries(destinationStatus).forEach(([destName, status]) => {
      total += status.amount;
      destinations[destName].forEach((item, index) => {
        const subtotal = parseFloat(item.qty) * parseFloat(item.price);
        const itemStatus = status.items.find(i => i.id === item.id);
        if (itemStatus?.isPaid) {
          paid += subtotal;
        } else if (itemStatus?.isDebt) {
          debt += subtotal;
        }
      });
    });

    const result = {
      totalAmount: total,
      paidAmount: paid,
      debtAmount: debt,
      balanceAmount: total - paid
    };
    onTotalsChange(result);
    return result

  }, [destinationStatus, destinations]);

  const handleStatusChange = (destinationName, amount, itemStatus) => {
    setDestinationStatus(prev => {
      const newStatus = { ...prev };
      newStatus[destinationName] = {
        ...newStatus[destinationName],
        amount
      };

      if (itemStatus) {
        const itemIndex = newStatus[destinationName].items.findIndex(
          item => item.id === itemStatus.itemId
        );
        if (itemIndex !== -1) {
          newStatus[destinationName].items[itemIndex] = {
            ...newStatus[destinationName].items[itemIndex],
            isPaid: itemStatus.isPaid,
            isDebt: itemStatus.isDebt
          };
        }
      }

      return newStatus;
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
            <span className="font-medium">Activities</span>
          </div>
          <div className="flex gap-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Total: {formatCurrency(totals.totalAmount)}</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Paid: {formatCurrency(totals.paidAmount)}</span>
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">Debt: {formatCurrency(totals.debtAmount)}</span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Balance: {formatCurrency(totals.balanceAmount)}</span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4">
          {Object.entries(destinations).map(([name, items]) => (
            <Destination 
              key={name} 
              name={name}
              items={items}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};
const OthersCard = ({ others, onTotalsChange = () => {} }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [itemStates, setItemStates] = useState(
    others.map(item => ({
      id: item.id,
      quantity: item.qty,
      price: parseFloat(item.price),
      isPaid: item.status_paid === 'paid',
      isDebt: item.is_debt === '1'
    }))
  );

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
      balanceAmount: total - paid
    };
    onTotalsChange(result);
    return result

  }, [itemStates]);

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
            <span className="font-medium">Others</span>
          </div>
          <div className="flex gap-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Total: {formatCurrency(totals.totalAmount)}</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Paid: {formatCurrency(totals.paidAmount)}</span>
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">Debt: {formatCurrency(totals.debtAmount)}</span>
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
                </tr>
              </thead>
              <tbody>
                {others.map((item, index) => (
                  <tr key={item.id} className="border-t border-gray-100">
                    <td className="px-3">
                      <div className="flex justify-center gap-4">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={itemStates[index].isPaid}
                            onChange={(e) => handlePaidChange(index, e.target.checked)}
                            className="w-4 h-4"
                          />
                          <span>Paid</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={itemStates[index].isDebt}
                            onChange={(e) => handleDebtChange(index, e.target.checked)}
                            className="w-4 h-4"
                            disabled={itemStates[index].isPaid}
                          />
                          <span>Hutang</span>
                        </label>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-blue-600">{index + 1}</td>
                    <td className="px-3">{item.others_activity.name}</td>
                    <td className="px-3">
                      <input
                        type="number"
                        value={itemStates[index].quantity}
                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
                        className="w-16 p-1 border rounded text-right disabled:bg-gray-100"
                        min="1"
                        disabled={itemStates[index].isPaid}
                      />
                    </td>
                    <td className="px-3">
                      <input
                        type="text"
                        value={formatCurrency(itemStates[index].price)}
                        onChange={(e) => handlePriceChange(index, parseInt(e.target.value.replace(/\D/g, '')) || 0)}
                        className="w-32 p-1 border rounded text-right disabled:bg-gray-100"
                        disabled={itemStates[index].isPaid}
                      />
                    </td>
                    <td className={`px-3 text-right ${itemStates[index].isPaid ? 'line-through text-gray-400' : ''}`}>
                      {formatCurrency(itemStates[index].quantity * itemStates[index].price)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="5" className="px-3 py-4 text-right font-medium">Total</td>
                  <td className="px-3 text-right font-medium">
                    {formatCurrency(totals.totalAmount)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
const ResourceTable = ({ items, states, type, onStateChange }) => (
  <div className="mb-6 border rounded-md p-3">
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
                  <span>Paid</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={states[index].isDebt}
                    onChange={(e) => onStateChange(index, 'isDebt', e.target.checked)}
                    className="w-4 h-4"
                    disabled={states[index].isPaid}
                  />
                  <span>Hutang</span>
                </label>
              </div>
            </td>
            <td className="px-3 py-4 text-blue-600">{index + 1}</td>
            <td className="px-3">{type === 'Transportations' ? item.car.name : item.crew_role.role}</td>
            <td className="px-3">
              <input
                type="number"
                value={states[index].quantity}
                onChange={(e) => onStateChange(index, 'quantity', parseInt(e.target.value) || 0)}
                className="w-16 p-1 border rounded text-right disabled:bg-gray-100"
                min="1"
                disabled={states[index].isPaid}
              />
            </td>
            <td className="px-3">
              <input
                type="text"
                value={formatCurrency(states[index].price)}
                onChange={(e) => onStateChange(index, 'price', parseInt(e.target.value.replace(/\D/g, '')) || 0)}
                className="w-32 p-1 border rounded text-right disabled:bg-gray-100"
                disabled={states[index].isPaid}
              />
            </td>
            <td className={`px-3 text-right ${states[index].isPaid ? 'line-through text-gray-400' : ''}`}>
              {formatCurrency(states[index].quantity * states[index].price)}
            </td>
          </tr>
        ))}
      </tbody>
      {items.length > 0 && (
        <tfoot>
          <tr>
            <td colSpan="5" className="px-3 py-4 text-right font-medium">Total</td>
            <td className="px-3 text-right font-medium">
              {formatCurrency(states.reduce((sum, state) => sum + (state.quantity * state.price), 0))}
            </td>
            <td></td>
          </tr>
        </tfoot>
      )}
    </table>
  </div>
);

const ResourceCard = ({ resources, onTotalsChange = () => {} }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [carStates, setCarStates] = useState(
    resources.cars.map(item => ({
      id: item.id,
      quantity: item.qty,
      price: parseFloat(item.price),
      isPaid: item.status_paid === 'paid',
      isDebt: item.is_debt === '1'
    }))
  );

  const [crewStates, setCrewStates] = useState(
    resources.crews.map(item => ({
      id: item.id,
      quantity: item.qty,
      price: parseFloat(item.price),
      isPaid: item.status_paid === 'paid',
      isDebt: item.is_debt === '1'
    }))
  );

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
      balanceAmount: (carTotal + crewTotal) - (carPaid + crewPaid)
    };
    onTotalsChange(result);
    return result

  }, [carStates, crewStates]);

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
            <span className="font-medium">Resource Requirements</span>
          </div>
          <div className="flex gap-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Total: {formatCurrency(totals.totalAmount)}</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Paid: {formatCurrency(totals.paidAmount)}</span>
            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">Debt: {formatCurrency(totals.debtAmount)}</span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Balance: {formatCurrency(totals.balanceAmount)}</span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4">
          <ResourceTable 
            items={resources.cars} 
            states={carStates}
            type="Transportations"
            onStateChange={handleCarChange}
          />
          <ResourceTable 
            items={resources.crews} 
            states={crewStates}
            type="Crews"
            onStateChange={handleCrewChange}
          />
        </div>
      )}
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
      balanceAmount: totalAmount - paidAmount,
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
        <h2 className="font-bold text-xl">Summary</h2>
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
            <div className="text-red-800 font-medium">Total Debt</div>
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
export default function EditExpenseManager({ booking,accommodations,destinations,others,resources }) {
  const { summaryTotals, setters } = useExpenseData({ booking });  
  return (
    <Authenticated>
        <BookingInfo booking={booking} />
        <AccommodationCard 
          accommodations={accommodations} 
          onTotalsChange={setters.setAccommodationTotals} 
        />
        <DestinationsCard 
          destinations={destinations} 
          onTotalsChange={setters.setDestinationTotals}
        />
        <OthersCard 
          others={others} 
          onTotalsChange={setters.setOthersTotals}
        />
        <ResourceCard 
          resources={resources} 
          onTotalsChange={setters.setResourceTotals}
        />
        <SummaryCard totals={summaryTotals} />
    </Authenticated>
  );
}
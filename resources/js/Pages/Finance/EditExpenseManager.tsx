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

  return (
    <div className="mb-10">
      <table className="w-full">
        <thead>
          <tr className="text-left text-gray-600 bg-gray-100">
            <th className="px-3 py-2 w-16">NO</th>
            <th className="px-3">ROOM NAME</th>
            <th className="px-3 w-24 text-right">QTY</th>
            <th className="px-3 w-40 text-right">RATE</th>
            <th className="px-3 w-40 text-right">SUBTOTAL</th>
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
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="4" className="px-3 py-4 text-right font-medium">Total</td>
            <td className={`px-3 text-right font-medium ${isPaid ? 'line-through text-gray-400' : ''}`}>
              {formatCurrency(total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

const Hotel = ({ hotel, onStatusChange }) => {
  const isPaid = hotel.isPaid;
  const isDebt = hotel.isDebt;
  const [currentTotal, setCurrentTotal] = useState(
    hotel.book_room.reduce((sum, room) => sum + (room.quantity * room.room_hotel.rate), 0)
  );

  const handleTotalChange = (newTotal) => {
    setCurrentTotal(newTotal);
    onStatusChange(hotel.id, isPaid, isDebt, newTotal);
  };

  const handlePaidChange = (checked) => {
    onStatusChange(hotel.id, checked, false, currentTotal);
  };

  const handleDebtChange = (checked) => {
    onStatusChange(hotel.id, isPaid, checked, currentTotal);
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-4">
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
        <h3 className="font-bold">{hotel.hotel?.name || `Hotel ID: ${hotel.hotel_id}`}</h3>
      </div>
      <RoomTable rooms={hotel.book_room} isPaid={isPaid} onTotalChange={handleTotalChange} />
    </div>
  );
};

const AccommodationCard = ({ accommodations }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [hotelStatus, setHotelStatus] = useState(
    Object.fromEntries(accommodations.map(hotel => [hotel.id, { 
      isPaid: false, 
      isDebt: false, 
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

    return {
      totalAmount: amounts.total,
      paidAmount: amounts.paid,
      debtAmount: amounts.debt,
      balanceAmount: amounts.total - amounts.paid
    };
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
            <Hotel 
              key={hotel.id} 
              hotel={{...hotel, isPaid: hotelStatus[hotel.id]?.isPaid, isDebt: hotelStatus[hotel.id]?.isDebt}}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function EditExpenseManager({ accommodations }) {
  return (
    <Authenticated>
      <AccommodationCard accommodations={accommodations} />
    </Authenticated>
  );
}
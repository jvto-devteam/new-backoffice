import React, { useState, useMemo } from 'react';
import Swal from '@/utils/swal';
import { router } from '@inertiajs/react';
import Authenticated from '@/Layouts/Main';

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value).replace('IDR', 'Rp');
};

const BookingInfo = ({ booking }) => {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold mb-4">Tour Expense Details</h1>
      <div className="text-gray-600 space-y-1">
        <p>Reference: {booking.id}</p>
        <p>Client: {booking.user.name}</p>
        <p>Package: {booking.booking_detail[0]?.package?.name || `${booking.package_duration}D ${booking.package_duration-1}N Packages`}</p>
        <p>Number of Pax: {booking.total_pax}</p>
      </div>
    </div>
  );
};

const SummaryCards = ({ totals }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {/* Total Expenses */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm">Total Expenses</span>
          <span className="text-blue-600">$</span>
        </div>
        <div className="text-blue-600 text-2xl font-bold mt-1">
          {formatCurrency(totals.totalAmount)}
        </div>
      </div>

      {/* Net Total */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm">Net Total</span>
          <div className="flex gap-1">
            <span className="text-green-600">↓</span>
            <span className="text-green-600">□</span>
          </div>
        </div>
        <div className="text-green-600 text-2xl font-bold mt-1">
          {formatCurrency(totals.paidAmount)}
        </div>
      </div>

      {/* Pay Later Total */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm">Pay Later Total</span>
          <div className="flex gap-1">
            <span className="text-orange-500">↓</span>
            <span className="text-orange-500">$</span>
          </div>
        </div>
        <div className="text-orange-500 text-2xl font-bold mt-1">
          {formatCurrency(totals.debtAmount)}
        </div>
      </div>

      {/* Pay Later Items */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-500 text-sm">Pay Later Items</span>
          <span className="text-red-500">◯</span>
        </div>
        <div className="text-red-500 text-2xl font-bold mt-1">
          {totals.payLaterItemsCount}
        </div>
      </div>
    </div>
  );
};

const ExpenseTable = ({ items, onPayLaterChange }) => {
  // Group items berdasarkan hotel untuk accommodation
  const hotelGroups = items.reduce((acc, item, index) => {
    if (item.category === 'Accommodation') {
      const hotelId = item.originalData.hotelId;
      if (!acc[hotelId]) {
        acc[hotelId] = {
          index,
          isDebt: item.isDebt
        };
      }
    }
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold p-4 border-b">Expense Items</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">NO</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">CATEGORY</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">SUB CATEGORY</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">DESCRIPTION</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">UNIT</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">QTY</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">RATE</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">AMOUNT</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500">PAY LATER</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item, index) => {
              const hotelId = item.originalData?.hotelId;
              const showToggle = item.category !== 'Accommodation' || 
                               (hotelGroups[hotelId] && hotelGroups[hotelId].index === index);

              return (
                <tr 
                  key={item.id} 
                  className={item.isDebt ? 'bg-yellow-50' : 'bg-white'}
                >
                  <td className="px-4 py-3 text-sm">{index + 1}</td>
                  <td className="px-4 py-3 text-sm">{item.category}</td>
                  <td className="px-4 py-3 text-sm">{item.subCategory}</td>
                  <td className="px-4 py-3 text-sm">{item.description}</td>
                  <td className="px-4 py-3 text-sm">{item.unit}</td>
                  <td className="px-4 py-3 text-sm text-right">{item.qty}</td>
                  <td className="px-4 py-3 text-sm text-right">{formatCurrency(item.rate)}</td>
                  <td className="px-4 py-3 text-sm text-right">{formatCurrency(item.amount)}</td>
                  <td className="px-4 py-3">
                    {showToggle && (
                      <div className="flex justify-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.isDebt}
                            onChange={(e) => onPayLaterChange(index, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const EditExpenseManager = ({ booking, accommodations, destinations, others, resources }) => {
  // Initialize items state with all expense items
  const [items, setItems] = useState(() => {
    // Pertama, kumpulkan semua item accommodation dan kelompokkan berdasarkan hotel
    const accommodationItems = accommodations.reduce((acc, hotel) => {
      // Room items
      const roomItems = hotel.book_room.map(room => ({
        id: room.id,
        category: 'Accommodation',
        subCategory: hotel.hotel.name,
        description: room.room_hotel.room_name,
        unit: 'No',
        qty: room.quantity,
        rate: room.room_hotel.rate,
        amount: room.quantity * room.room_hotel.rate,
        isDebt: hotel.is_debt === '1',
        originalData: { 
          type: 'room', 
          hotelId: hotel.id, 
          roomId: room.id,
          isPaid: hotel.is_paid
        }
      }));
   
      // Meal items
      const mealItems = hotel.book_hotel_meal.map(meal => ({
        id: `meal-${meal.id}`,
        category: 'Accommodation',
        subCategory: hotel.hotel.name,
        description: `${meal.meals.charAt(0).toUpperCase() + meal.meals.slice(1)} Meal`,
        unit: 'Pax',
        qty: meal.qty,
        rate: meal.price,
        amount: meal.qty * meal.price,
        isDebt: hotel.is_debt === '1',
        originalData: { 
          type: 'meal', 
          hotelId: hotel.id, 
          mealId: meal.id,
          mealType: meal.meals,
          isPaid: hotel.is_paid
        }
      }));
   
      // Gabungkan room dan meal untuk hotel ini
      acc.push(...roomItems, ...mealItems);
      return acc;
    }, []);
   
    // Sort accommodation items berdasarkan subCategory (nama hotel)
    const sortedAccommodationItems = accommodationItems.sort((a, b) => {
      // Pertama sort berdasarkan nama hotel
      const hotelCompare = a.subCategory.localeCompare(b.subCategory);
      if (hotelCompare !== 0) return hotelCompare;
      
      // Jika hotel sama, room ditampilkan dulu baru meal
      if (a.originalData.type === 'room' && b.originalData.type === 'meal') return -1;
      if (a.originalData.type === 'meal' && b.originalData.type === 'room') return 1;
      
      // Jika keduanya meal, sort berdasarkan tipe meal (lunch dulu, dinner kemudian)
      if (a.originalData.type === 'meal' && b.originalData.type === 'meal') {
        return a.originalData.mealType.localeCompare(b.originalData.mealType);
      }
      
      return 0;
    });
   
    const initialItems = [
      ...sortedAccommodationItems,
      // Destination items
      ...Object.entries(destinations).flatMap(([destName, activities]) =>
        activities.map(activity => ({
          id: activity.id,
          category: 'Destination',
          subCategory: destName,
          description: activity.destination_activity.name,
          unit: 'Pax',
          qty: activity.qty,
          rate: activity.price,
          amount: activity.qty * activity.price,
          isDebt: activity.is_debt === '1',
          originalData: { 
            type: 'destination', 
            destName, 
            destination_id: activity.destination_id,
            destination_activity_id: activity.destination_activity_id,
            activityId: activity.id
          }
        }))
      ),
      // Others items
      ...others.map(item => ({
        id: item.id,
        category: 'Others',
        subCategory: 'Additional',
        description: item.others_activity.name,
        unit: 'Item',
        qty: item.qty,
        rate: item.price,
        amount: item.qty * item.price,
        isDebt: item.is_debt === '1',
        originalData: { 
          type: 'other', 
          others_activity_id: item.others_activity.id,
          itemId: item.id
        }
      })),
      // Transport items
      ...resources.cars.map(car => ({
        id: car.id,
        category: 'Transport',
        subCategory: 'Airport Transfer',
        description: car.car.name,
        unit: 'Unit',
        qty: car.qty,
        rate: car.price,
        amount: car.qty * car.price,
        isDebt: car.is_debt === '1',
        originalData: { 
          type: 'transport', 
          car_id: car.car.id,
          carId: car.id
        }
      })),
      // Crew items
      ...resources.crews.map(crew => ({
        id: crew.id,
        category: 'Resource',
        subCategory: 'Crew',
        description: crew.crew_role.role,
        unit: 'Person',
        qty: crew.qty,
        rate: crew.price,
        amount: crew.qty * crew.price,
        isDebt: crew.is_debt === '1',
        originalData: { 
          type: 'crew',
          crew_role_id: crew.crew_role.id,
          crewId: crew.id
        }
      }))
    ];
   
    return initialItems;
   });
  // Handle pay later toggle
  const handlePayLaterChange = (index, isDebt) => {
    setItems(prevItems => {
      const newItems = [...prevItems];
      const targetItem = newItems[index];
  
      // Jika item adalah accommodation, update semua item dari hotel yang sama
      if (targetItem.category === 'Accommodation') {
        const hotelId = targetItem.originalData.hotelId;
        return newItems.map(item => {
          if (item.category === 'Accommodation' && item.originalData.hotelId === hotelId) {
            return { ...item, isDebt };
          }
          return item;
        });
      }
  
      // Untuk item non-accommodation, hanya update item tersebut
      newItems[index] = { ...newItems[index], isDebt };
      return newItems;
    });
  };

  // Calculate summary totals
  const summaryTotals = useMemo(() => {
    const payLaterItems = items.filter(item => item.isDebt);
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
    const debtAmount = payLaterItems.reduce((sum, item) => sum + item.amount, 0);
    
    return {
      totalAmount,
      paidAmount: totalAmount - debtAmount,
      debtAmount,
      payLaterItemsCount: payLaterItems.length
    };
  }, [items]);
  const handleSubmit = () => {
    const formatDecimal = (num) => Number(num).toFixed(2);
   
    // Pertama, kelompokkan items akomodasi berdasarkan hotel
    const groupedAccommodations = items
      .filter(item => item.category === 'Accommodation')
      .reduce((acc, item) => {
        const hotelId = item.originalData.hotelId;
        if (!acc[hotelId]) {
          acc[hotelId] = {
            rooms: [],
            meals: [],
            isDebt: item.isDebt
          };
        }
        if (item.originalData.type === 'room') {
          acc[hotelId].rooms.push(item);
        } else {
          acc[hotelId].meals.push(item);
        }
        return acc;
      }, {});
   
    // Kelompokkan destinasi
    const groupedDestinations = items
      .filter(item => item.category === 'Destination')
      .reduce((acc, item) => {
        const destName = item.subCategory;
        if (!acc[destName]) {
          acc[destName] = [];
        }
        acc[destName].push(item);
        return acc;
      }, {});
   
    const submitData = {
      booking_id: booking.id,
      
      // Transform accommodations
      accommodations: Object.entries(groupedAccommodations).map(([hotelId, data]) => ({
        hotel_id: parseInt(hotelId),
        is_paid: !data.isDebt ? '1' : '0',
        is_debt: data.isDebt ? '1' : '0',
        rooms: data.rooms.map(room => ({
          id: room.originalData.roomId,
          quantity: room.qty,
          rate: parseInt(room.rate)
        })),
        meals: data.meals.map(meal => ({
          id: meal.originalData.mealId,
          type: meal.originalData.mealType,
          qty: meal.qty,
          price: formatDecimal(meal.rate)
        }))
      })),
   
      // Transform destinations
      destinations: Object.entries(groupedDestinations).map(([destName, activities]) => ({
        destination: destName,
        activities: activities.map(item => ({
          id: item.id,
          destination_id: item.originalData.destination_id,
          destination_activity_id: item.originalData.destination_activity_id,
          name: item.description,
          quantity: item.qty,
          price: parseInt(item.rate),
          status_paid: item.isDebt ? 'unpaid' : 'paid',
          is_debt: item.isDebt ? '1' : '0'
        }))
      })),
   
      // Transform others
      others: items
        .filter(item => item.category === 'Others')
        .map(item => ({
          id: item.id,
          others_activity_id: item.originalData.others_activity_id,
          quantity: item.qty,
          name: null,
          price: parseInt(item.rate),
          status_paid: item.isDebt ? 'unpaid' : 'paid',
          is_debt: item.isDebt ? '1' : '0'
        })),
   
      // Transform resources
      resources: {
        cars: items
          .filter(item => item.category === 'Transport')
          .map(item => ({
            id: item.id,
            car_id: item.originalData.car_id,
            quantity: item.qty,
            price: parseInt(item.rate),
            status_paid: item.isDebt ? 'unpaid' : 'paid',
            is_debt: item.isDebt ? '1' : '0'
          })),
        crews: items
          .filter(item => item.category === 'Resource')
          .map(item => ({
            id: item.id,
            crew_role_id: item.originalData.crew_role_id,
            quantity: item.qty,
            price: parseInt(item.rate),
            status_paid: item.isDebt ? 'unpaid' : 'paid',
            is_debt: item.isDebt ? '1' : '0'
          }))
      },
   
      summary: {
        totalAmount: summaryTotals.totalAmount,
        paidAmount: summaryTotals.paidAmount,
        debtAmount: summaryTotals.debtAmount,
        balanceAmount: summaryTotals.balanceAmount,
        profit: summaryTotals.profit
      }
    };
   
    router.post(`/finance/expense-manager/${booking.id}/update`, submitData, {
      onBefore: () => {
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
        Swal.fire({
          title: 'Success!',
          text: 'Expense has been successfully updated',
          icon: 'success'
        }).then(() => {
          router.visit(`/finance/expense-manager/${booking.id}/edit`);
        });
      },
      onError: (errors) => {
        Swal.fire({
          title: 'Error!',
          text: 'There was a problem updating your expense.',
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BookingInfo booking={booking} />
        <SummaryCards totals={summaryTotals} />
        <ExpenseTable 
          items={items} 
          onPayLaterChange={handlePayLaterChange}
        />
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Submit Changes
          </button>
        </div>
      </div>
    </Authenticated>
  );
};

export default EditExpenseManager;
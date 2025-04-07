import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import SearchableSelect from '@/components/SearchableSelect';
import Main from '@/Layouts/Main';


const formatCurrency = (value) => {
  if (value === null || value === undefined || isNaN(value)) return 'Rp 0';
  return `Rp ${parseFloat(value).toLocaleString('id-ID')}`;
};

const ExpenseRecap = ({ masters, filters, data }) => {
  const [selectedType, setSelectedType] = useState(filters.type);
  const [selectedId, setSelectedId] = useState(filters.id || '');
  const [dateRange, setDateRange] = useState({
    startDate: filters.startDate || format(new Date(), 'yyyy-MM-dd'),
    endDate: filters.endDate || format(new Date(), 'yyyy-MM-dd')
  });
  const [totalAmount, setTotalAmount] = useState(0);

  // Get current type from URL
  const getCurrentType = () => {
    return filters.type;
  };

  // Calculate total amount when data changes
  useEffect(() => {
    if (!data || data.length === 0) {
      setTotalAmount(0);
      return;
    }
    
    const currentType = getCurrentType();
    let total = 0;

    if (currentType === 'hotel') {
      total = data.reduce((sum, item) => {
        const itemTotal = parseFloat(item.total || 0);
        return sum + (isNaN(itemTotal) ? 0 : itemTotal);
      }, 0);
    } else {
      total = data.reduce((sum, item) => {
        const itemAmount = parseFloat(item.amount || 0);
        return sum + (isNaN(itemAmount) ? 0 : itemAmount);
      }, 0);
    }

    setTotalAmount(total);
  }, [data, window.location.search]);

  // Filter options based on type
  const getFilterOptions = () => {
    switch (selectedType) {
      case 'hotel':
        return masters.hotel || [];
      case 'activity':
        return flattenActivityOptions() || [];
      case 'miscellaneous':
        return masters.miscellaneous || [];
      case 'role':
        return masters.role || [];
      case 'car':
        return masters.car || [];
      default:
        return [];
    }
  };

  // Flatten the activity options which are grouped by destination
  const flattenActivityOptions = () => {
    if (!masters.activity) return [];
    
    let options = [];
    Object.entries(masters.activity).forEach(([destination, activities]) => {
      activities.forEach(activity => {
        options.push({
          id: activity.id,
          name: `${activity.name} (${destination})`,
          original: activity
        });
      });
    });
    
    return options;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically trigger a request to fetch new data
    window.history.pushState(
      {}, 
      '', 
      `?type=${selectedType}&id=${selectedId}&start_date=${dateRange.startDate}&end_date=${dateRange.endDate}`
    );
    
    // In a real app, you would call an API or reload the page
    window.location.reload();
  };

  // Prepare type options for dropdown
  const typeOptions = [
    { id: 'hotel', name: 'Hotel' },
    { id: 'activity', name: 'Activity' },
    { id: 'miscellaneous', name: 'Miscellaneous' },
    { id: 'role', name: 'Role' },
    { id: 'car', name: 'Car' }
  ];

  // Render different table based on type
  const renderDataTable = () => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No data available for the selected criteria.</p>
        </div>
      );
    }

    // Use URL type parameter rather than the state
    const currentType = getCurrentType();
    
    switch (currentType) {
      case 'hotel':
        return renderHotelTable();
      case 'activity':
        return renderActivityTable();
      case 'miscellaneous':
        return renderMiscellaneousTable();
      case 'role':
        return renderRoleTable();
      case 'car':
        return renderCarTable();
      default:
        return <p>Please select a type</p>;
    }
  };

  const renderHotelTable = () => {
    // Calculate the total correctly
    const grandTotal = data.reduce((sum, item) => {
      const itemTotal = parseFloat(item.total || 0);
      return sum + (isNaN(itemTotal) ? 0 : itemTotal);
    }, 0);

    return (
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pax</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rooms</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rooms Cost</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Meals</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Meals Cost</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{index+1}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.guest}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.check_in}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.check_out}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{item.pax}</td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {item.rooms && Array.isArray(item.rooms) ? item.rooms.map((room, idx) => (
                    <div key={idx}>{room.room_name} x{room.quantity}</div>
                  )) : '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatCurrency(item.rooms_cost)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {item.meals && Array.isArray(item.meals) ? item.meals.map((meal, idx) => (
                    <div key={idx}>{meal.meals} x{meal.quantity}</div>
                  )) : '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                  {formatCurrency(item.meals_cost)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                  {formatCurrency(item.total)}
                </td>
              </tr>
            ))}
            <tr className="bg-blue-50">
              <td colSpan="9" className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                Grand Total:
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-blue-700 text-right">
                {formatCurrency(grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderGeneralTable = (columns) => {
    // Calculate the total correctly
    const grandTotal = data.reduce((sum, item) => {
      const amount = parseFloat(item.amount || 0);
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    return (
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
            <th className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider`}>#</th>
              {columns.map((column, index) => (
                <th 
                  key={index} 
                  className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${column.align === 'right' ? 'text-right' : 'text-left'}`}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td 
                      className={`px-4 py-3 whitespace-nowrap text-sm text-gray-500`}
                    >
                      {index+1}
                    </td>
                {columns.map((column, colIndex) => {
                  let cellValue = item[column.key];
                  
                  // Format currency values
                  if (column.key === 'amount' || column.key === 'rate') {
                    cellValue = formatCurrency(cellValue);
                  }
                  
                  return (
                    <td 
                      key={colIndex} 
                      className={`px-4 py-3 whitespace-nowrap text-sm ${column.bold ? 'font-medium text-gray-900' : 'text-gray-500'} ${column.align === 'right' ? 'text-right' : 'text-left'}`}
                    >
                      {cellValue}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="bg-blue-50">
              <td colSpan={columns.length} className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                Grand Total:
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-blue-700 text-right">
                {formatCurrency(grandTotal)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  const renderActivityTable = () => renderGeneralTable([
    { title: 'Guest', key: 'guest', bold: true },
    { title: 'Travel Date', key: 'travel_date' },
    { title: 'Activity Date', key: 'activity_date' },
    { title: 'Quantity', key: 'qty' },
    { title: 'Rate', key: 'rate', align: 'right' },
    { title: 'Amount', key: 'amount', align: 'right' }
  ]);

  const renderMiscellaneousTable = () => renderGeneralTable([
    { title: 'Guest', key: 'guest', bold: true },
    { title: 'Travel Date', key: 'travel_date' },
    { title: 'Quantity', key: 'qty' },
    { title: 'Rate', key: 'rate', align: 'right' },
    { title: 'Amount', key: 'amount', align: 'right' }
  ]);

  const renderRoleTable = () => renderGeneralTable([
    { title: 'Guest', key: 'guest', bold: true },
    { title: 'Travel Date', key: 'travel_date' },
    { title: 'Quantity', key: 'qty' },
    { title: 'Rate', key: 'rate', align: 'right' },
    { title: 'Amount', key: 'amount', align: 'right' }
  ]);

  const renderCarTable = () => renderGeneralTable([
    { title: 'Guest', key: 'guest', bold: true },
    { title: 'Travel Date', key: 'travel_date' },
    { title: 'Quantity', key: 'qty' },
    { title: 'Rate', key: 'rate', align: 'right' },
    { title: 'Amount', key: 'amount', align: 'right' }
  ]);

  // Calculate summary data
  const getSummaryData = () => {
    if (!data || data.length === 0) return [];

    const guests = [...new Set(data.map(item => item.guest))];
    const count = data.length;
    const currentType = getCurrentType();
    
    if (currentType === 'hotel') {
      const totalNights = data.reduce((sum, item) => {
        if (!item.check_in || !item.check_out) return sum;
        try {
          const checkIn = new Date(item.check_in);
          const checkOut = new Date(item.check_out);
          const nights = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
          return sum + (isNaN(nights) ? 0 : nights);
        } catch (e) {
          return sum;
        }
      }, 0);
      
      const totalRevenue = data.reduce((sum, item) => {
        const itemTotal = parseFloat(item.total || 0);
        return sum + (isNaN(itemTotal) ? 0 : itemTotal);
      }, 0);
      
      return [
        { 
          label: 'Total Guests', 
          value: guests.length,
          icon: 'user' 
        },
        { 
          label: 'Total Bookings', 
          value: count,
          icon: 'calendar' 
        },
        { 
          label: 'Total Nights', 
          value: totalNights,
          icon: 'moon' 
        },
        { 
          label: 'Total Revenue', 
          value: formatCurrency(totalRevenue),
          icon: 'dollar',
          highlight: true
        }
      ];
    } else {
      const totalQty = data.reduce((sum, item) => {
        const qty = parseInt(item.qty || 0);
        return sum + (isNaN(qty) ? 0 : qty);
      }, 0);
      
      const totalRevenue = data.reduce((sum, item) => {
        const amount = parseFloat(item.amount || 0);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);
      
      return [
        { 
          label: 'Total Guests', 
          value: guests.length,
          icon: 'user' 
        },
        { 
          label: 'Total Transactions', 
          value: count,
          icon: 'receipt' 
        },
        { 
          label: 'Total Quantity', 
          value: totalQty,
          icon: 'hash' 
        },
        { 
          label: 'Total Revenue', 
          value: formatCurrency(totalRevenue),
          icon: 'dollar',
          highlight: true
        }
      ];
    }
  };

  // Icon components
  const icons = {
    user: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    calendar: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    moon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
    dollar: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    receipt: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    hash: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
      </svg>
    )
  };

  return (
    <Main>
        <div>
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-500 text-white">
            <h1 className="text-xl font-medium">Expense Recap</h1>
            <div className="text-sm opacity-80">
                {dateRange.startDate} to {dateRange.endDate}
            </div>
            </div>

            {/* Filter Form */}
            <form onSubmit={handleSubmit} className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-1">
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Type
                </label>
                <SearchableSelect
                    options={typeOptions}
                    value={selectedType}
                    onChange={setSelectedType}
                    placeholder="Select type"
                    displayKey="name"
                />
                </div>

                <div className="space-y-1">
                <label htmlFor="id" className="block text-sm font-medium text-gray-700">
                    {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
                </label>
                <SearchableSelect
                    options={getFilterOptions()}
                    value={selectedId}
                    onChange={setSelectedId}
                    placeholder={`Select ${selectedType}`}
                    displayKey="name"
                />
                </div>

                <div className="space-y-1">
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                    Start Date
                </label>
                <input
                    type="date"
                    id="startDate"
                    name="start_date"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                    required
                />
                </div>

                <div className="space-y-1">
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                    End Date
                </label>
                <input
                    type="date"
                    id="endDate"
                    name="end_date"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                    required
                />
                </div>

                <div className="flex items-end">
                <button
                    type="submit"
                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm transition-colors"
                >
                    Apply Filter
                </button>
                </div>
            </div>
            </form>

            {/* Data Table */}
            <div className="p-6 border-t border-gray-200">
            {renderDataTable()}
            </div>
        </div>
        </div>
    </Main>
  );
};

export default ExpenseRecap;
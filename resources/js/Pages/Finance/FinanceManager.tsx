import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import Authenticated from '@/Layouts/Main';

const FinanceDashboard = ({ booking = [], filters = {} }) => {
  const [currentTab, setCurrentTab] = useState('ALL');
  const [localFilters, setLocalFilters] = useState({
    search: ''
  });

  const tabs = [
    { label: 'All Bookings', key: 'ALL' },
    { label: 'Pending Payment', key: 'pending' },
    { label: 'Paid', key: 'paid' },
    { label: 'Outstanding', key: 'outstanding' }
  ];

  const formatRupiah = (val) => {
    if (!val || val === 0) return 'Rp 0';
    return 'Rp ' + parseInt(val).toLocaleString('id-ID');
  };

  const formatDateRange = (startDate, endDate) => {
    if (!startDate || !endDate) return '-';
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const options = { year: 'numeric', month: 'short', day: '2-digit' };
      return start.toLocaleDateString('id-ID', options) + ' – ' + end.toLocaleDateString('id-ID', options);
    } catch {
      return `${startDate} – ${endDate}`;
    }
  };

  const getFilteredData = () => {
    return booking.filter(row => {
      // Filter by search
      if (localFilters.search) {
        const searchTerm = localFilters.search.toLowerCase();
        const searchString = `${row.booking_id} ${row.name} ${row.duration}`.toLowerCase();
        if (!searchString.includes(searchTerm)) return false;
      }

      // Tab-specific filter
      if (currentTab !== 'ALL' && row.status !== currentTab) return false;

      return true;
    });
  };

  const calculateSummary = (data) => {
    let totalBookings = data.length;
    let totalPaid = 0;
    let totalPending = 0;
    let totalOutstanding = 0;
    let totalProfit = 0;

    data.forEach(item => {
      const grandTotal = item.grand_total || 0;
      const expense = item.expense || 0;

      if (item.status === 'paid') {
        totalPaid += grandTotal;
        totalProfit += (grandTotal - expense);
      } else if (item.status === 'pending') {
        totalPending += grandTotal;
      } else if (item.status === 'outstanding') {
        totalOutstanding += item.final_payment || 0;
      }
    });

    return {
      total: totalBookings,
      paid: totalPaid,
      pending: totalPending,
      outstanding: totalOutstanding,
      profit: totalProfit
    };
  };

  const filteredData = getFilteredData();
  const summary = calculateSummary(booking); // Use all data for summary

  const handleSearchChange = (value) => {
    setLocalFilters(prev => ({
      ...prev,
      search: value
    }));
  };

  // Handle month filter change with Inertia
  const handleMonthChange = (monthValue) => {
    router.get('/finance', {
      year_month: monthValue
    }, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };

  const clearFilters = () => {
    setLocalFilters({
      search: ''
    });
    
    // Reset month filter via Inertia
    router.get('/finance', {}, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };

  return (
    <Authenticated>
      <div className="bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Booking & Financial Dashboard JVTO</h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-blue-600">{summary.total}</div>
            <div className="text-gray-600 text-sm">Total Bookings</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-xl font-bold text-green-600">{formatRupiah(summary.paid)}</div>
            <div className="text-gray-600 text-sm">Total Paid</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-xl font-bold text-orange-600">{formatRupiah(summary.pending)}</div>
            <div className="text-gray-600 text-sm">Pending Payment</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-xl font-bold text-red-600">{formatRupiah(summary.outstanding)}</div>
            <div className="text-gray-600 text-sm">Outstanding</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-xl font-bold text-blue-600">{formatRupiah(summary.profit)}</div>
            <div className="text-gray-600 text-sm">Profit (Closed)</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setCurrentTab(tab.key)}
              className={`px-6 py-3 font-medium text-sm border-b-2 ${
                currentTab === tab.key 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center mb-6 p-4 bg-white rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Month:</label>
            <input
              type="month"
              value={filters.year_month || ''}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <input
            type="text"
            placeholder="Search client, booking, package..."
            value={localFilters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Channel
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking/Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Package & Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deposit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Final Payment
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Expense
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Crew Expense
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Outstanding Debt
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length > 0 ? filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-700">
                        JVTO
                      </span>
                    </td>
                    
                    <td className="px-4 py-4">
                      <div>
                        <div className="font-semibold text-blue-600">{row.booking_id}</div>
                        <div className="text-gray-900">{row.name}</div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium">{row.duration}</div>
                        <div className="text-sm text-gray-600">
                          {formatDateRange(row.start_date, row.end_date)}
                        </div>
                        <div className="text-sm text-gray-500">{row.numb_of_pax} Pax</div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        row.deposit > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {row.deposit > 0 ? formatRupiah(row.deposit).replace('Rp ', '') : '0'}
                      </span>
                    </td>
                    
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        row.final_payment > 0 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {row.final_payment > 0 ? formatRupiah(row.final_payment).replace('Rp ', '') : '0'}
                      </span>
                    </td>
                    
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {row.payment_method ? row.payment_method.toUpperCase() : '-'}
                    </td>
                    
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {row.paid_date || '-'}
                    </td>
                    
                    <td className="px-4 py-4 text-sm">
                      {formatRupiah(row.expense).replace('Rp ', '')}
                    </td>
                    
                    <td className="px-4 py-4 text-sm">
                      {formatRupiah(row.expense_crew).replace('Rp ', '')}
                    </td>
                    
                    <td className="px-4 py-4 text-sm">
                      {formatRupiah(row.expense_debt).replace('Rp ', '')}
                    </td>
                    
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                          Detail
                        </button>
                        <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                          Export
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                      No bookings found for the selected criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredData.length} of {booking.length} bookings
          {filters.year_month && ` for ${filters.year_month}`}
          {currentTab !== 'ALL' && ` with status: ${currentTab}`}
        </div>
      </div>
    </Authenticated>
  );
};

export default FinanceDashboard;
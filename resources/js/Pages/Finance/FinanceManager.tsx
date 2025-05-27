import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import Authenticated from '@/Layouts/Main';

const FinanceDashboard = ({ booking = [], summary = {}, filters = {} }) => {
  const [localFilters, setLocalFilters] = useState({
    search: ''
  });

  // Extract current filters from props
  const currentTab = filters.tab || 'all';
  const currentChannel = filters.channel || 'all';
  const currentMonth = filters.year_month || '';
  const currentDateType = filters.date_type || 'trip';

  const tabs = [
    { label: 'All Bookings', key: 'all' },
    { label: 'Paid', key: 'paid' },
    { label: 'Pending Payment', key: 'pending' },
    { label: 'Outstanding Debt', key: 'debt' },
    { label: 'Expense', key: 'expense' }
  ];

  const channels = [
    { label: 'All Channels', key: 'all' },
    { label: 'JVTO', key: 'jvto' },
    { label: 'TWT', key: 'twt' },
    { label: 'KLOOK', key: 'klook' }
  ];

  const dateTypes = [
    { label: 'Trip Date', key: 'trip' },
    { label: 'Payment Date', key: 'payment' }
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

  const getBookingStatus = (startDate, endDate) => {
    if (!startDate || !endDate) return 'Unknown';
    
    const today = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Reset time to compare dates only
    today.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    if (end < today) return 'Complete';
    if (start <= today && end >= today) return 'Active';
    if (start > today) return 'Upcoming';
    
    return 'Unknown';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Complete: { class: 'bg-green-100 text-green-700', text: 'Complete' },
      Active: { class: 'bg-blue-100 text-blue-700', text: 'Active' },
      Upcoming: { class: 'bg-orange-100 text-orange-700', text: 'Upcoming' },
      Unknown: { class: 'bg-gray-100 text-gray-700', text: 'Unknown' }
    };
    
    const config = statusConfig[status] || { class: 'bg-gray-100 text-gray-700', text: status };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const getPaymentMethodImage = (method) => {
    if (!method || method === '-') return null;
    
    const methodLower = method.toLowerCase();
    let imagePath = '';
    
    if (methodLower.includes('transfer') || methodLower.includes('bank')) {
      imagePath = '/assets/images/icon/bank-transfer.png';
    } else if (methodLower.includes('cc') || methodLower.includes('credit')) {
      imagePath = '/assets/images/icon/xendit.png';
    } else if (methodLower.includes('cash')) {
      imagePath = '/assets/images/icon/cash.png';
    } else if (methodLower.includes('edc')) {
      imagePath = '/assets/images/icon/edc.png';
    }

    if (imagePath) {
      return (
        <div className="flex items-center gap-2">
          <img 
            src={imagePath} 
            alt={method}
            className="h-8 object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      );
    }

    return <span className="text-sm">{method}</span>;
  };

  const getFilteredData = () => {
    if (!Array.isArray(booking)) return [];
    
    return booking.filter(row => {
      // Filter by search
      if (localFilters.search) {
        const searchTerm = localFilters.search.toLowerCase();
        let searchString = '';
        
        if (row.user) {
          searchString += (row.user.name || row.user.user || '') + ' ';
        }
        if (row.booking) {
          searchString += (row.booking.booking_code || '') + ' ';
        }
        if (row.package) {
          searchString += (row.package.package_name || '') + ' ';
        }
        
        if (!searchString.toLowerCase().includes(searchTerm)) return false;
      }

      return true;
    });
  };

  const filteredData = getFilteredData();

  const handleSearchChange = (value) => {
    setLocalFilters(prev => ({
      ...prev,
      search: value
    }));
  };

  const handleFilterChange = (key, value) => {
    const params = {
      tab: currentTab,
      channel: currentChannel,
      year_month: currentMonth,
      date_type: currentDateType,
      [key]: value
    };

    Object.keys(params).forEach(k => {
      if (!params[k] || params[k] === 'all') {
        delete params[k];
      }
    });

    router.get('finance', params, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };

  const clearFilters = () => {
    setLocalFilters({ search: '' });
    router.get('finance', {}, {
      preserveState: true,
      preserveScroll: true,
      replace: true
    });
  };

  const getChannelBadge = (channel) => {
    const channelConfig = {
      JVTO: { class: 'bg-blue-100 text-blue-700' },
      TWT: { class: 'bg-green-100 text-green-700' },
      KLOOK: { class: 'bg-orange-100 text-orange-700' }
    };
    
    const config = channelConfig[channel] || { class: 'bg-gray-100 text-gray-700' };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.class}`}>
        {channel}
      </span>
    );
  };

  const getTableHeaders = () => {
    switch (currentTab) {
      case 'all':
        return [
          'No',
          'Channel',
          'Booking/Client',
          'Package & Date',
          'Price per Pax',
          'Grand Total',
          'Status'
        ];
      case 'paid':
        return [
          'No',
          'Channel',
          'Booking/Client',
          'Package & Date',
          'Nominal',
          'Description',
          'Payment Method',
          'Reference',
          'Receipt',
          'Paid at'
        ];
      case 'pending':
        return [
          'No',
          'Channel',
          'Booking/Client',
          'Package & Date',
          'Nominal',
          'Payment Method'
        ];
      case 'debt':
        return [
          'No',
          'Channel',
          'Booking/Client',
          'Package & Date',
          'Total Debt'
        ];
      case 'expense':
        return [
          'No',
          'Channel',
          'Booking/Client',
          'Package & Date',
          'Grand Total',
          'Total Expense',
          'Crew Expense'
        ];
      default:
        return ['No', 'Channel', 'Booking/Client'];
    }
  };

  const renderTableRow = (row, index) => {
    const channel = row.channel || 'JVTO';
    const userName = row.user?.name || row.user?.user || '-';
    const userPax = row.user?.pax || 0;
    const packageDuration = row.package?.duration || '-';
    const packageName = row.package?.package_name || '-';
    const bookingCode = row.booking?.booking_code || '-';
    const travelStart = row.booking?.travel_date_start || '-';
    const travelEnd = row.booking?.travel_date_end || '-';
    const grandTotal = row.booking?.grand_total || 0;
    const pricePerPax = row.package?.price_per_pax || 0;

    const bookingInfo = (
      <div>
        <div className="font-semibold text-blue-600">{channel}-{row.id}</div>
        <div className="text-gray-900">{userName}</div>
        <div className="text-sm text-gray-500">{userPax} Pax</div>
      </div>
    );

    const packageInfo = (
      <div>
        <div className="font-medium">{packageName}</div>
        <div className="text-sm text-gray-600">{packageDuration}</div>
        <div className="text-sm text-gray-600">
          {formatDateRange(travelStart, travelEnd)}
        </div>
      </div>
    );

    switch (currentTab) {
      case 'all':
        const status = getBookingStatus(travelStart, travelEnd);
        return (
          <tr key={`${row.id}-${currentTab}`} className="hover:bg-gray-50">
            <td className="px-4 py-4 text-sm text-gray-600">
              {index + 1}
            </td>
            <td className="px-4 py-4">
              {getChannelBadge(channel)}
            </td>
            <td className="px-4 py-4">
              {bookingInfo}
            </td>
            <td className="px-4 py-4">
              {packageInfo}
            </td>
            <td className="px-4 py-4 text-sm">
              {formatRupiah(pricePerPax)}
            </td>
            <td className="px-4 py-4 text-sm font-semibold">
              {formatRupiah(grandTotal)}
            </td>
            <td className="px-4 py-4">
              {getStatusBadge(status)}
            </td>
          </tr>
        );

      case 'paid':
        const payment = row.payment || {};
        return (
          <tr key={`${row.id}-${currentTab}`} className="hover:bg-gray-50">
            <td className="px-4 py-4 text-sm text-gray-600">
              {index + 1}
            </td>
            <td className="px-4 py-4">
              {getChannelBadge(channel)}
            </td>
            <td className="px-4 py-4">
              {bookingInfo}
            </td>
            <td className="px-4 py-4">
              {packageInfo}
            </td>
            <td className="px-4 py-4 text-sm font-semibold text-green-600">
              {formatRupiah(payment.nominal || 0)}
            </td>
            <td className="px-4 py-4 text-sm text-gray-600">
              {payment.description || '-'}
            </td>
            <td className="px-4 py-4">
              {getPaymentMethodImage(payment.payment_method)}
            </td>
            <td className="px-4 py-4 text-sm">
              {payment.reference || '-'}
            </td>
            <td className="px-4 py-4 text-sm">
              {payment.receipt || '-'}
            </td>
            <td className="px-4 py-4 text-sm text-gray-600">
              {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString('id-ID') : '-'}
            </td>
          </tr>
        );

      case 'pending':
        const pendingPayment = row.pending_payment || {};
        return (
          <tr key={`${row.id}-${currentTab}`} className="hover:bg-gray-50">
            <td className="px-4 py-4 text-sm text-gray-600">
              {index + 1}
            </td>
            <td className="px-4 py-4">
              {getChannelBadge(channel)}
            </td>
            <td className="px-4 py-4">
              {bookingInfo}
            </td>
            <td className="px-4 py-4">
              {packageInfo}
            </td>
            <td className="px-4 py-4 text-sm font-semibold text-orange-600">
              {formatRupiah(pendingPayment.nominal || 0)}
            </td>
            <td className="px-4 py-4">
              {getPaymentMethodImage(pendingPayment.payment_method)}
            </td>
          </tr>
        );

      case 'debt':
        const debt = row.booking?.debt || 0;
        return (
          <tr key={`${row.id}-${currentTab}`} className="hover:bg-gray-50">
            <td className="px-4 py-4 text-sm text-gray-600">
              {index + 1}
            </td>
            <td className="px-4 py-4">
              {getChannelBadge(channel)}
            </td>
            <td className="px-4 py-4">
              {bookingInfo}
            </td>
            <td className="px-4 py-4">
              {packageInfo}
            </td>
            <td className="px-4 py-4 text-sm font-semibold text-red-600">
              {formatRupiah(debt)}
            </td>
          </tr>
        );

      case 'expense':
        const totalExpense = row.booking?.total_expense || 0;
        const crewExpense = row.booking?.crew_expense || 0;
        return (
          <tr key={`${row.id}-${currentTab}`} className="hover:bg-gray-50">
            <td className="px-4 py-4 text-sm text-gray-600">
              {index + 1}
            </td>
            <td className="px-4 py-4">
              {getChannelBadge(channel)}
            </td>
            <td className="px-4 py-4">
              {bookingInfo}
            </td>
            <td className="px-4 py-4">
              {packageInfo}
            </td>
            <td className="px-4 py-4 text-sm font-semibold">
              {formatRupiah(grandTotal)}
            </td>
            <td className="px-4 py-4 text-sm">
              {formatRupiah(totalExpense)}
            </td>
            <td className="px-4 py-4 text-sm">
              {formatRupiah(crewExpense)}
            </td>
          </tr>
        );

      default:
        return (
          <tr key={`${row.id}-${currentTab}`} className="hover:bg-gray-50">
            <td className="px-4 py-4 text-sm text-gray-600">
              {index + 1}
            </td>
            <td className="px-4 py-4">
              {getChannelBadge(channel)}
            </td>
            <td className="px-4 py-4">
              {bookingInfo}
            </td>
          </tr>
        );
    }
  };

  const renderTableContent = () => {
    if (filteredData.length === 0) {
      return (
        <tr>
          <td colSpan={getTableHeaders().length} className="px-4 py-8 text-center text-gray-500">
            No bookings found for the selected criteria.
          </td>
        </tr>
      );
    }

    return filteredData.map((row, index) => renderTableRow(row, index));
  };

  return (
    <Authenticated>
      <div className="bg-gray-50">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Booking & Financial Dashboard JVTO</h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-2xl font-bold text-blue-600">{summary.total_bookings || 0}</div>
            <div className="text-gray-600 text-sm">Total Bookings</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-xl font-bold text-green-600">{formatRupiah(summary.total_paid || 0)}</div>
            <div className="text-gray-600 text-sm">Total Paid</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-xl font-bold text-orange-600">{formatRupiah(summary.total_pending || 0)}</div>
            <div className="text-gray-600 text-sm">Pending Payment</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-xl font-bold text-red-600">{formatRupiah(summary.total_debt || 0)}</div>
            <div className="text-gray-600 text-sm">Outstanding Debt</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-xl font-bold text-purple-600">{formatRupiah(summary.total_expense || 0)}</div>
            <div className="text-gray-600 text-sm">Total Expense</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleFilterChange('tab', tab.key)}
              className={`px-6 py-3 font-medium text-sm border-b-2 whitespace-nowrap ${
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
            <label className="text-sm font-medium text-gray-700">Channel:</label>
            <select
              value={currentChannel}
              onChange={(e) => handleFilterChange('channel', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {channels.map(channel => (
                <option key={channel.key} value={channel.key}>
                  {channel.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Month:</label>
            <input
              type="month"
              value={currentMonth}
              onChange={(e) => handleFilterChange('year_month', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {(currentTab === 'paid' || currentTab === 'pending') && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Date Type:</label>
              <select
                value={currentDateType}
                onChange={(e) => handleFilterChange('date_type', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {dateTypes.map(type => (
                  <option key={type.key} value={type.key}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          )}
          
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

        {/* Current Filter Display */}
        {(currentChannel !== 'all' || currentMonth || currentTab !== 'all' || currentDateType !== 'trip') && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-sm text-blue-800 flex flex-wrap gap-2">
              <span className="font-medium">Active filters:</span>
              {currentTab !== 'all' && (
                <span className="bg-blue-200 px-2 py-1 rounded">
                  Tab: {tabs.find(t => t.key === currentTab)?.label}
                </span>
              )}
              {currentChannel !== 'all' && (
                <span className="bg-blue-200 px-2 py-1 rounded">
                  Channel: {channels.find(c => c.key === currentChannel)?.label}
                </span>
              )}
              {currentMonth && (
                <span className="bg-blue-200 px-2 py-1 rounded">
                  Month: {currentMonth}
                </span>
              )}
              {currentDateType !== 'trip' && (
                <span className="bg-blue-200 px-2 py-1 rounded">
                  Date Type: {dateTypes.find(d => d.key === currentDateType)?.label}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {getTableHeaders().map((header, index) => (
                    <th key={index} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {renderTableContent()}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredData.length} of {Array.isArray(booking) ? booking.length : 0} bookings
          {currentMonth && ` for ${currentMonth}`}
          {currentTab !== 'all' && ` in ${tabs.find(t => t.key === currentTab)?.label} tab`}
          {currentChannel !== 'all' && ` from ${channels.find(c => c.key === currentChannel)?.label} channel`}
        </div>
      </div>
    </Authenticated>
  );
};

export default FinanceDashboard;
import React, { useState, useEffect } from 'react';
import { Search, Calendar, Filter, ChevronDown, ChevronUp, Download, RefreshCw } from 'lucide-react';
import Authenticated from '@/Layouts/Main';

const Invoices = ({inv}) => {
  // Data invoice sebagai initial state
//   const initialInvoices = [
//     {
//       "id": 214,
//       "booking_id": 970,
//       "booking_code": "JVR/001/06/25",
//       "inv_number": "INV/001/06/25-DP1",
//       "inv_date": "26 Feb 2025",
//       "description": "Deposit Payment",
//       "travel_date_start": "17 Jun 2025",
//       "customer": "Mr Gui",
//       "total_pax": 14,
//       "duration": 6,
//       "nominal": 20947500,
//       "package_id": null,
//       "package_name": "6 Days 5 Nights Package",
//       "status": "PAID",
//       "receipt": "RCP/001/06/25-DP1"
//     },
//     {
//       "id": 194,
//       "booking_id": 927,
//       "booking_code": "JVR/001/08/25",
//       "inv_number": "INV/001/08/25-DP1",
//       "inv_date": "16 Jan 2025",
//       "description": "Deposit Payment",
//       "travel_date_start": "29 Aug 2025",
//       "customer": "Marina Garcia Marcos",
//       "total_pax": 2,
//       "duration": 4,
//       "nominal": 900000,
//       "package_id": 34,
//       "package_name": "Java to Bali Adventure: 4D3N Bromo, Ijen & Tumpak Sewu Highlights",
//       "status": "PAID",
//       "receipt": "RCP/001/08/25-DP1"
//     },
//     {
//       "id": 236,
//       "booking_id": 981,
//       "booking_code": "JVR/002/06/25",
//       "inv_number": "INV/002/06/25-DP0",
//       "inv_date": "26 Mar 2025",
//       "description": "Deposit Payment",
//       "travel_date_start": "28 Jun 2025",
//       "customer": "Sachin Garg",
//       "total_pax": 6,
//       "duration": 3,
//       "nominal": 1500000,
//       "package_id": null,
//       "package_name": "3 Days 2 Nights Package",
//       "status": "UNPAID",
//       "receipt": null
//     },
//     {
//       "id": 207,
//       "booking_id": 944,
//       "booking_code": "JVR/002/08/25",
//       "inv_number": "INV/002/08/25-DP1",
//       "inv_date": "04 Feb 2025",
//       "description": "Deposit Payment",
//       "travel_date_start": "12 Aug 2025",
//       "customer": "Mrs Virginie Group JAVA 1 08",
//       "total_pax": 27,
//       "duration": 3,
//       "nominal": 8710000,
//       "package_id": 28,
//       "package_name": "East Java to Bali Adventure: 3D2N Bromo & Ijen Volcano Journey",
//       "status": "PAID",
//       "receipt": "RCP/002/08/25-DP1"
//     },
//     {
//       "id": 217,
//       "booking_id": 910,
//       "booking_code": "JVR/003/05/25",
//       "inv_number": "INV/003/05/25-DP1",
//       "inv_date": "01 Mar 2025",
//       "description": "Deposit Payment",
//       "travel_date_start": "31 May 2025",
//       "customer": "Lem Poay Yee",
//       "total_pax": 34,
//       "duration": 5,
//       "nominal": 10323000,
//       "package_id": 56,
//       "package_name": "Ultimate East Java Experience: 5D4N Ijen Crater, Tumpak Sewu & Bromo",
//       "status": "PAID",
//       "receipt": "RCP/003/05/25-DP1"
//     },
//     {
//       "id": 220,
//       "booking_id": 930,
//       "booking_code": "JVR/003/07/25",
//       "inv_number": "INV/003/07/25-DP2",
//       "inv_date": "08 Mar 2025",
//       "description": "Deposit Payment",
//       "travel_date_start": "19 Jul 2025",
//       "customer": "Hui Bin",
//       "total_pax": 12,
//       "duration": 5,
//       "nominal": 900000,
//       "package_id": 56,
//       "package_name": "Ultimate East Java Experience: 5D4N Ijen Crater, Tumpak Sewu & Bromo",
//       "status": "PAID",
//       "receipt": "RCP/003/07/25-DP2"
//     },
//     {
//       "id": 222,
//       "booking_id": 991,
//       "booking_code": "JVR/006/03/25",
//       "inv_number": "INV/006/03/25-FULL",
//       "inv_date": "12 Mar 2025",
//       "description": "Full Payment",
//       "travel_date_start": "13 Mar 2025",
//       "customer": "Adam Fuller",
//       "total_pax": 2,
//       "duration": 3,
//       "nominal": 5632000,
//       "package_id": 28,
//       "package_name": "East Java to Bali Adventure: 3D2N Bromo & Ijen Volcano Journey",
//       "status": "PAID",
//       "receipt": "RCP/006/03/25-FULL"
//     },
//     {
//       "id": 237,
//       "booking_id": 973,
//       "booking_code": "JVR/005/07/25",
//       "inv_number": "INV/005/07/25-DP0",
//       "inv_date": "26 Mar 2025",
//       "description": "Deposit Payment",
//       "travel_date_start": "10 Jul 2025",
//       "customer": "Mr TKampeng",
//       "total_pax": 21,
//       "duration": 5,
//       "nominal": 7200000,
//       "package_id": 56,
//       "package_name": "Ultimate East Java Experience: 5D4N Ijen Crater, Tumpak Sewu & Bromo",
//       "status": "UNPAID",
//       "receipt": null
//     },
//     {
//       "id": 234,
//       "booking_id": 1008,
//       "booking_code": "JVR/019/04/25",
//       "inv_number": "INV/019/04/25-DP1",
//       "inv_date": "21 Mar 2025",
//       "description": "Deposit Payment",
//       "travel_date_start": "18 Apr 2025",
//       "customer": "YU CHUN LIN",
//       "total_pax": 4,
//       "duration": 3,
//       "nominal": 2400000,
//       "package_id": 28,
//       "package_name": "East Java to Bali Adventure: 3D2N Bromo & Ijen Volcano Journey",
//       "status": "PAID",
//       "receipt": "RCP/019/04/25-DP1"
//     }
//   ];
  const initialInvoices = inv

  // State
  const [invoices, setInvoices] = useState(initialInvoices);
  const [filteredInvoices, setFilteredInvoices] = useState(initialInvoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'inv_date', direction: 'desc' });
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const [selectedDuration, setSelectedDuration] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState([]);
  const [selectedDescription, setSelectedDescription] = useState([]);
  const [minPax, setMinPax] = useState('');
  const [maxPax, setMaxPax] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Mendapatkan unique values untuk filter
  const getUniqueValues = (key) => {
    return [...new Set(invoices.map(item => item[key]))];
  };

  const statuses = getUniqueValues('status');
  const durations = getUniqueValues('duration');
  const descriptions = getUniqueValues('description');
  
  // Mendapatkan bulan-bulan unik dari travel_date_start
  const months = [...new Set(invoices.map(item => {
    const date = new Date(item.travel_date_start);
    return date.getMonth() + 1; // JavaScript months are 0-indexed
  }))].sort((a, b) => a - b);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Fungsi untuk menangani sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Fungsi untuk menangani filter
  const applyFilters = () => {
    let filtered = [...invoices];

    // Filter berdasarkan pencarian
    if (searchTerm) {
      filtered = filtered.filter(invoice => 
        invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.inv_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.booking_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.package_name && invoice.package_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter berdasarkan status
    if (selectedStatus.length > 0) {
      filtered = filtered.filter(invoice => selectedStatus.includes(invoice.status));
    }

    // Filter berdasarkan durasi
    if (selectedDuration.length > 0) {
      filtered = filtered.filter(invoice => selectedDuration.includes(invoice.duration));
    }

    // Filter berdasarkan bulan
    if (selectedMonth.length > 0) {
      filtered = filtered.filter(invoice => {
        const date = new Date(invoice.travel_date_start);
        return selectedMonth.includes(date.getMonth() + 1);
      });
    }

    // Filter berdasarkan deskripsi
    if (selectedDescription.length > 0) {
      filtered = filtered.filter(invoice => selectedDescription.includes(invoice.description));
    }

    // Filter berdasarkan jumlah pax
    if (minPax) {
      filtered = filtered.filter(invoice => invoice.total_pax >= parseInt(minPax));
    }
    if (maxPax) {
      filtered = filtered.filter(invoice => invoice.total_pax <= parseInt(maxPax));
    }

    // Filter berdasarkan nominal
    if (minAmount) {
      filtered = filtered.filter(invoice => invoice.nominal >= parseInt(minAmount));
    }
    if (maxAmount) {
      filtered = filtered.filter(invoice => invoice.nominal <= parseInt(maxAmount));
    }

    // Menerapkan sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredInvoices(filtered);
    setCurrentPage(1);
  };

  // Menerapkan filter setiap kali ada perubahan pada filter
  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedStatus, selectedDuration, selectedMonth, selectedDescription, minPax, maxPax, minAmount, maxAmount, sortConfig]);

  // Fungsi untuk reset filter
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus([]);
    setSelectedDuration([]);
    setSelectedMonth([]);
    setSelectedDescription([]);
    setMinPax('');
    setMaxPax('');
    setMinAmount('');
    setMaxAmount('');
    setSortConfig({ key: 'inv_date', direction: 'desc' });
  };

  // Fungsi untuk menangani perubahan filter checkbox
  const handleCheckboxChange = (setValue, value) => {
    setValue(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInvoices.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  // Menghitung total nominal
  const totalNominal = filteredInvoices.reduce((sum, invoice) => sum + invoice.nominal, 0);

  // Menghitung total pax
  const totalPax = filteredInvoices.reduce((sum, invoice) => sum + invoice.total_pax, 0);

  // Fungsi untuk mendapatkan nama bulan
  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('id-ID', { month: 'short' });
  };

  return (
    <Authenticated>
    
    <div className="bg-gray-50 min-h-screen p-4 md:p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Invoice</h1>
          <p className="text-gray-600">Kelola dan pantau data invoice perjalanan dengan mudah</p>
        </div>
        
        {/* Statistik Ringkasan */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <p className="text-sm font-medium text-gray-500">Total Invoice</p>
            <p className="text-2xl font-bold text-gray-800">{filteredInvoices.length}</p>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-600">Dari {invoices.length} total invoice</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <p className="text-sm font-medium text-gray-500">Total Nominal</p>
            <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalNominal)}</p>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-600">Rata-rata {formatCurrency(totalNominal / filteredInvoices.length)}</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
            <p className="text-sm font-medium text-gray-500">Total Penumpang</p>
            <p className="text-2xl font-bold text-gray-800">{totalPax}</p>
            <div className="mt-2 flex items-center text-sm">
              <span className="text-gray-600">Rata-rata {(totalPax / filteredInvoices.length).toFixed(1)} per invoice</span>
            </div>
          </div>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Cari berdasarkan nama, nomor invoice..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <button
                className="flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => setFilterOpen(!filterOpen)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {filterOpen ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
              </button>
              
              <button
                className="flex items-center justify-center rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                onClick={resetFilters}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </button>
              
              <button
                className="flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
          
          {/* Filter Options */}
          {filterOpen && (
            <div className="border-t border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
                  <div className="space-y-2">
                    {statuses.map(status => (
                      <label key={status} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                          checked={selectedStatus.includes(status)}
                          onChange={() => handleCheckboxChange(setSelectedStatus, status)}
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {status === 'PAID' ? (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">PAID</span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">UNPAID</span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Duration Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Durasi (Hari)</h3>
                  <div className="space-y-2">
                    {durations.map(duration => (
                      <label key={duration} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                          checked={selectedDuration.includes(duration)}
                          onChange={() => handleCheckboxChange(setSelectedDuration, duration)}
                        />
                        <span className="ml-2 text-sm text-gray-700">{duration} hari</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Month Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Bulan Perjalanan</h3>
                  <div className="space-y-2">
                    {months.map(month => (
                      <label key={month} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                          checked={selectedMonth.includes(month)}
                          onChange={() => handleCheckboxChange(setSelectedMonth, month)}
                        />
                        <span className="ml-2 text-sm text-gray-700">{getMonthName(month)}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Description Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Deskripsi</h3>
                  <div className="space-y-2">
                    {descriptions.map(description => (
                      <label key={description} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                          checked={selectedDescription.includes(description)}
                          onChange={() => handleCheckboxChange(setSelectedDescription, description)}
                        />
                        <span className="ml-2 text-sm text-gray-700">{description}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Pax Range Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Jumlah Penumpang</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500">Min</label>
                      <input
                        type="number"
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Min"
                        value={minPax}
                        onChange={(e) => setMinPax(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Max</label>
                      <input
                        type="number"
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Max"
                        value={maxPax}
                        onChange={(e) => setMaxPax(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Amount Range Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Nominal (IDR)</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500">Min</label>
                      <input
                        type="number"
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Min"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Max</label>
                      <input
                        type="number"
                        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Max"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Invoice Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {sortConfig.key === 'status' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>

                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('inv_number')}
                  >
                    <div className="flex items-center">
                      No. Invoice
                      {sortConfig.key === 'inv_number' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('description')}
                  >
                    <div className="flex items-center">
                      INV Type
                      {sortConfig.key === 'description' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('inv_date')}
                  >
                    <div className="flex items-center">
                      INV Date
                      {sortConfig.key === 'inv_date' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('customer')}
                  >
                    <div className="flex items-center">
                      Customer
                      {sortConfig.key === 'customer' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('nominal')}
                  >
                    <div className="flex items-center">
                      Nominal
                      {sortConfig.key === 'nominal' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('paid_at')}
                  >
                    <div className="flex items-center">
                      PAID AT
                      {sortConfig.key === 'paid_at' && (
                        <span className="ml-1">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentItems.length > 0 ? (
                  currentItems.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {invoice.status === 'PAID' ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            PAID
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                            UNPAID
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{invoice.inv_number}</div>
                        {/* <div className="text-xs text-gray-500">{invoice.booking_code}</div> */}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                        {invoice.description === 'Deposit Payment' ? (
                          <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                            Deposit Payment
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                            Full Payment
                          </span>
                        )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{invoice.inv_date}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{invoice.customer}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(invoice.nominal)}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{invoice.paid_at ? invoice.paid_at : '-'}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900 mr-3">Detail</button>
                        <button className="text-gray-600 hover:text-gray-900">Edit</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center text-sm text-gray-500">
                      Tidak ada data invoice yang sesuai dengan filter
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to <span className="font-medium">
                    {Math.min(indexOfLastItem, filteredInvoices.length)}
                  </span> of <span className="font-medium">{filteredInvoices.length}</span> results
                </p>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">Rows per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  >
                    {[5, 10, 20, 50].map(size => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronDown className="h-5 w-5 transform rotate-90" />
                  </button>
                  
                  {/* Page Numbers */}
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNumber = i + 1;
                    // Show limited number of pages to avoid clutter
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            pageNumber === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          } text-sm font-medium`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      (pageNumber === 2 && currentPage > 3) ||
                      (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                      // Show ellipsis
                      return (
                        <span
                          key={pageNumber}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className="sr-only">Next</span>
                    <ChevronDown className="h-5 w-5 transform -rotate-90" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Authenticated>
  );
};

export default Invoices;
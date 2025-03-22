import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Authenticated from '@/Layouts/Main';
import { 
  Search, Filter, Calendar, Download, 
  ChevronsUp, ChevronsDown, Eye, 
  DollarSign, CheckCircle, XCircle, Building
} from 'lucide-react';

const PayableReport = ({ vendors = [], categories = [], months = [] }) => {
  // Sample data - replace with props in production
  const initialData = [
    {
      id: 1,
      vendorName: 'PT Sejahtera Abadi',
      category: 'Transportasi',
      totalAmount: 7500000,
      status: 'Lunas'
    },
    {
      id: 2,
      vendorName: 'Hotel Bromo Permai',
      category: 'Akomodasi',
      totalAmount: 4250000,
      status: 'Sebagian'
    },
    {
      id: 3,
      vendorName: 'CV Transport Wisata',
      category: 'Transportasi',
      totalAmount: 3800000,
      status: 'Belum Lunas'
    },
    {
      id: 4,
      vendorName: 'Resto Bumi Indah',
      category: 'Katering',
      totalAmount: 2150000,
      status: 'Lunas'
    },
    {
      id: 5,
      vendorName: 'PT Penyewaan Alat',
      category: 'Peralatan',
      totalAmount: 5200000,
      status: 'Belum Lunas'
    },
    {
      id: 6,
      vendorName: 'CV Media Kreatif',
      category: 'Promosi',
      totalAmount: 1875000,
      status: 'Lunas'
    },
    {
      id: 7,
      vendorName: 'Toko Souvenir Nusantara',
      category: 'Merchandise',
      totalAmount: 2500000,
      status: 'Sebagian'
    }
  ];

  const initialCategories = ['Semua', 'Transportasi', 'Akomodasi', 'Katering', 'Peralatan', 'Promosi', 'Merchandise'];
  
  const initialMonths = [
    { value: '2025-03', label: 'Maret 2025' },
    { value: '2025-02', label: 'Februari 2025' },
    { value: '2025-01', label: 'Januari 2025' },
    { value: '2024-12', label: 'Desember 2024' }
  ];

  // State management
  const [data, setData] = useState(vendors.length ? vendors : initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');
  const [monthFilter, setMonthFilter] = useState(months.length ? months[0].value : initialMonths[0].value);
  const [sortField, setSortField] = useState('vendorName');
  const [sortDirection, setSortDirection] = useState('asc');

  // Calculate summary data
  const totalVendors = data.length;
  const totalOutstanding = data
    .filter(item => item.status !== 'Lunas')
    .reduce((sum, item) => sum + item.totalAmount, 0);
    
  const totalPaid = data
    .filter(item => item.status === 'Lunas')
    .reduce((sum, item) => sum + item.totalAmount, 0);
    
  const fullyPaidVendors = data.filter(item => item.status === 'Lunas').length;
  const partiallyPaidVendors = data.filter(item => item.status === 'Sebagian').length;
  const unpaidVendors = data.filter(item => item.status === 'Belum Lunas').length;

  // Handlers
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryFilter = (category) => {
    setCategoryFilter(category);
  };

  const handleMonthChange = (e) => {
    const newMonth = e.target.value;
    setMonthFilter(newMonth);
    
    // Call Inertia for actual data
    router.get('', { month: newMonth }, {
      preserveState: true,
      replace: true,
      onSuccess: (page) => {
        // If your backend returns updated data
        if (page.props.vendors) {
          setData(page.props.vendors);
        }
      }
    });
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const navigateToDetail = (vendorId, vendorName) => {
    router.get('', { 
      month: monthFilter,
      vendor: vendorName
    });
  };

  // Filter and sort data
  const filteredData = data
    .filter(item => {
      const matchesSearch = 
        item.vendorName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = 
        categoryFilter === 'Semua' || 
        item.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortField === 'totalAmount') {
        return sortDirection === 'asc' 
          ? a.totalAmount - b.totalAmount
          : b.totalAmount - a.totalAmount;
      } else {
        return sortDirection === 'asc'
          ? String(a[sortField]).localeCompare(String(b[sortField]))
          : String(b[sortField]).localeCompare(String(a[sortField]));
      }
    });

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Lunas':
        return 'bg-green-100 text-green-800';
      case 'Sebagian':
        return 'bg-blue-100 text-blue-800';
      case 'Belum Lunas':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Authenticated>
      <Head title="Laporan Vendor" />
      <div className="bg-gray-50 min-h-screen p-6">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Rekap Pembayaran Vendor</h1>
          <p className="text-gray-600 mt-1">Ringkasan pembayaran vendor berdasarkan kategori dan status pembayaran</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Vendor</p>
                <p className="text-2xl font-bold text-gray-800">{totalVendors}</p>
              </div>
              <div className="bg-indigo-100 p-3 rounded-full">
                <Building size={24} className="text-indigo-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Transaksi</p>
                <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalOutstanding + totalPaid)}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <DollarSign size={24} className="text-blue-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Lunas</p>
                <p className="text-2xl font-bold text-gray-800">{fullyPaidVendors} Vendor</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle size={24} className="text-green-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Bayar Sebagian</p>
                <p className="text-2xl font-bold text-gray-800">{partiallyPaidVendors} Vendor</p>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <XCircle size={24} className="text-amber-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Belum Lunas</p>
                <p className="text-2xl font-bold text-gray-800">{unpaidVendors} Vendor</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <XCircle size={24} className="text-red-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2 flex-grow">
              <div className="relative flex-grow max-w-md">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Cari nama vendor..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              
              <div className="relative">
                <select
                  className="bg-gray-50 pr-10 border border-gray-300 text-gray-900 text-sm rounded-lg block p-2.5 focus:ring-indigo-500 focus:border-indigo-500"
                  value={categoryFilter}
                  onChange={(e) => handleCategoryFilter(e.target.value)}
                >
                  {(categories.length ? categories : initialCategories).map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="relative flex items-center bg-gray-50 border border-gray-300 rounded-lg pl-3">
                <Calendar size={18} className="text-gray-400 mr-2" />
                <select
                  className="bg-transparent text-gray-900 text-sm  pr-10 py-2.5 focus:outline-none focus:ring-0 border-0"
                  value={monthFilter}
                  onChange={handleMonthChange}
                >
                  {(months.length ? months : initialMonths).map((month) => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium rounded-lg text-sm px-4 py-2.5 flex items-center"
              >
                <Download size={16} className="mr-1" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('vendorName')}
                  >
                    <div className="flex items-center">
                      Nama Vendor
                      {sortField === 'vendorName' && (
                        sortDirection === 'asc' ? 
                          <ChevronsUp size={16} className="ml-1" /> : 
                          <ChevronsDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center">
                      Kategori
                      {sortField === 'category' && (
                        sortDirection === 'asc' ? 
                          <ChevronsUp size={16} className="ml-1" /> : 
                          <ChevronsDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('totalAmount')}
                  >
                    <div className="flex items-center">
                      Total Transaksi
                      {sortField === 'totalAmount' && (
                        sortDirection === 'asc' ? 
                          <ChevronsUp size={16} className="ml-1" /> : 
                          <ChevronsDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {sortField === 'status' && (
                        sortDirection === 'asc' ? 
                          <ChevronsUp size={16} className="ml-1" /> : 
                          <ChevronsDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">{item.vendorName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{item.category}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(item.totalAmount)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button 
                          onClick={() => navigateToDetail(item.id, item.vendorName)}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg transition-colors flex items-center ml-auto"
                        >
                          <Eye size={14} className="mr-1" />
                          Detail
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Tidak ada data yang sesuai dengan filter
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Menampilkan <span className="font-medium">{filteredData.length}</span> dari <span className="font-medium">{data.length}</span> vendor
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <a
                    href="#"
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    onClick={(e) => e.preventDefault()}
                  >
                    <span className="sr-only">Previous</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    aria-current="page"
                    className="z-10 bg-indigo-50 border-indigo-500 text-indigo-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium"
                    onClick={(e) => e.preventDefault()}
                  >
                    1
                  </a>
                  <a
                    href="#"
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    onClick={(e) => e.preventDefault()}
                  >
                    <span className="sr-only">Next</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </a>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Authenticated>
  );
};

export default PayableReport;
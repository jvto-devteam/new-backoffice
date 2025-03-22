import React, { useState,useEffect } from 'react';
import { router } from '@inertiajs/react';
import { Head, Link } from '@inertiajs/react';
import Authenticated from '@/Layouts/Main';
import { 
  Search, ArrowLeft, Calendar, Download, 
  ChevronsUp, ChevronsDown, FileText, DollarSign,
  Mail, Phone, User, MapPin, CheckCircle, XCircle,
  Upload, X, Check, CheckSquare
} from 'lucide-react';

const VendorDetailPage = ({ vendor = {}, invoices = [], months = [] }) => {
  // Sample data - replace with props in production
  const vendorData = vendor.id ? vendor : {
    id: 1,
    name: 'PT Sejahtera Abadi',
    category: 'Transportasi',
    address: 'Jl. Raya Kuta No. 123, Bali',
    phone: '(0361) 123-4567',
    email: 'info@sejahtera-abadi.co.id',
    contactPerson: 'Budi Santoso'
  };

  const initialInvoices = [
    {
      id: 101,
      invoiceNo: 'INV-2023-001',
      customerName: 'Kelompok Wisata Malam',
      itemName: 'Tiket Ijen (15 pax)',
      quantity: 15,
      amount: 200000,
      subtotal: 3000000,
      date: '2025-03-05',
      paymentStatus: 'Belum Dibayar',
      paymentDate: null,
      paymentProof: null
    },
    {
      id: 102,
      invoiceNo: 'INV-2023-002',
      customerName: 'Keluarga Hadi',
      itemName: 'Tiket Ijen (5 pax)',
      quantity: 5,
      amount: 200000,
      subtotal: 1000000,
      date: '2025-03-12',
      paymentStatus: 'Dibayar',
      paymentDate: '2025-03-15',
      paymentProof: 'bukti_102.jpg'
    },
    {
      id: 103,
      invoiceNo: 'INV-2023-003',
      customerName: 'PT Wisata Nusantara',
      itemName: 'Tiket Ijen (10 pax)',
      quantity: 10,
      amount: 250000,
      subtotal: 2500000,
      date: '2025-03-18',
      paymentStatus: 'Belum Dibayar',
      paymentDate: null,
      paymentProof: null
    },
    {
      id: 104,
      invoiceNo: 'INV-2023-004',
      customerName: 'Sekolah Dasar Cendekia',
      itemName: 'Tiket Ijen Group (25 pax)',
      quantity: 25,
      amount: 180000,
      subtotal: 4500000,
      date: '2025-03-22',
      paymentStatus: 'Belum Dibayar',
      paymentDate: null,
      paymentProof: null
    },
    {
      id: 105,
      invoiceNo: 'INV-2023-005',
      customerName: 'Komunitas Fotografi Alam',
      itemName: 'Tiket Ijen (8 pax)',
      quantity: 8,
      amount: 200000,
      subtotal: 1600000,
      date: '2025-03-10',
      paymentStatus: 'Belum Dibayar',
      paymentDate: null,
      paymentProof: null
    }
  ];

  const initialMonths = [
    { value: '2025-03', label: 'Maret 2025' },
    { value: '2025-02', label: 'Februari 2025' },
    { value: '2025-01', label: 'Januari 2025' },
    { value: '2024-12', label: 'Desember 2024' }
  ];

  // State management
  const [data, setData] = useState(invoices.length ? invoices : initialInvoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState(months.length ? months[0].value : initialMonths[0].value);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [paymentModal, setPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [paymentForm, setPaymentForm] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Transfer Bank',
    paymentReference: '',
    notes: '',
    file: null
  });
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [bulkPaymentMode, setBulkPaymentMode] = useState(false);
  const [proofPreviewUrl, setProofPreviewUrl] = useState(null);
  const [viewProofModal, setViewProofModal] = useState(false);
  const [viewingInvoice, setViewingInvoice] = useState(null);


  // Calculate summary data
  const totalAmount = data.reduce((sum, item) => sum + item.subtotal, 0);
  const totalInvoices = data.length;
  const totalPaid = data
    .filter(item => item.paymentStatus === 'Dibayar')
    .reduce((sum, item) => sum + item.subtotal, 0);
  const totalUnpaid = totalAmount - totalPaid;
  const paidCount = data.filter(item => item.paymentStatus === 'Dibayar').length;
  const unpaidCount = data.filter(item => item.paymentStatus === 'Belum Dibayar').length;
  
  // Calculate selected invoices total
  const selectedInvoicesTotal = selectedInvoices.length > 0
    ? data
        .filter(item => selectedInvoices.includes(item.id))
        .reduce((sum, item) => sum + item.subtotal, 0)
    : 0;

  // Handlers
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleMonthChange = (e) => {
    const newMonth = e.target.value;
    setMonthFilter(newMonth);
    
    // Call Inertia for actual data
    router.get(route('vendor.detail', { id: vendorData.id }), { 
      month: newMonth,
      vendor: vendorData.name,
      status: statusFilter
    }, {
      preserveState: true,
      replace: true,
      onSuccess: (page) => {
        // If your backend returns updated data
        if (page.props.invoices) {
          setData(page.props.invoices);
        }
      }
    });
  };

  const handleStatusFilterChange = (e) => {
    const newStatus = e.target.value;
    setStatusFilter(newStatus);
    
    // Call Inertia for actual data
    router.get(route('vendor.detail', { id: vendorData.id }), { 
      month: monthFilter,
      vendor: vendorData.name,
      status: newStatus
    }, {
      preserveState: true,
      replace: true,
      onSuccess: (page) => {
        // If your backend returns updated data
        if (page.props.invoices) {
          setData(page.props.invoices);
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

  const handleBackToSummary = () => {
    router.get(route('vendor.summary'), { month: monthFilter });
  };

  const openPaymentModal = (invoice = null) => {
    if (invoice) {
      // Single invoice payment
      setSelectedInvoice(invoice);
      setBulkPaymentMode(false);
    } else {
      // Bulk payment mode
      setBulkPaymentMode(true);
    }
    setPaymentModal(true);
  };

  const closePaymentModal = () => {
    setPaymentModal(false);
    setSelectedInvoice(null);
    setBulkPaymentMode(false);
    if (proofPreviewUrl) {
      URL.revokeObjectURL(proofPreviewUrl);
      setProofPreviewUrl(null);
    }
    setPaymentForm({
      paymentDate: new Date().toISOString().split('T')[0],
      paymentMethod: 'Transfer Bank',
      paymentReference: '',
      notes: '',
      file: null
    });
  };

  const handlePaymentFormChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm({
      ...paymentForm,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPaymentForm({
        ...paymentForm,
        file: file
      });
      
      // Create preview URL for the uploaded file
      const fileUrl = URL.createObjectURL(file);
      setProofPreviewUrl(fileUrl);
    }
  };

  const openProofModal = (invoice) => {
    setViewingInvoice(invoice);
    setViewProofModal(true);
  };

  const closeProofModal = () => {
    setViewingInvoice(null);
    setViewProofModal(false);
  };
  
  useEffect(() => {
    return () => {
      if (proofPreviewUrl) {
        URL.revokeObjectURL(proofPreviewUrl);
      }
    };
  }, [proofPreviewUrl]);  

  const submitPaymentForm = (e) => {
    e.preventDefault();
    
    // In a real app, you'd upload the file and submit form data
    // For demo, we'll just update the local state
    
    if (bulkPaymentMode) {
      const updatedData = data.map(item => {
        if (selectedInvoices.includes(item.id)) {
          return {
            ...item,
            paymentStatus: 'Dibayar',
            paymentDate: paymentForm.paymentDate,
            paymentProof: paymentForm.file ? paymentForm.file.name : 'bukti_bulk.jpg'
          };
        }
        return item;
      });
      
      setData(updatedData);
      setSelectedInvoices([]);
    } else {
      const updatedData = data.map(item => {
        if (item.id === selectedInvoice.id) {
          return {
            ...item,
            paymentStatus: 'Dibayar',
            paymentDate: paymentForm.paymentDate,
            paymentProof: paymentForm.file ? paymentForm.file.name : 'bukti_pembayaran.jpg'
          };
        }
        return item;
      });
      
      setData(updatedData);
    }
    
    closePaymentModal();
    
    // In a real app, you'd use Inertia to submit this data
    // router.post(route('payment.store'), { 
    //   invoiceIds: bulkPaymentMode ? selectedInvoices : [selectedInvoice.id],
    //   ...paymentForm
    // });
  };

  const toggleInvoiceSelection = (invoiceId) => {
    if (selectedInvoices.includes(invoiceId)) {
      setSelectedInvoices(selectedInvoices.filter(id => id !== invoiceId));
    } else {
      setSelectedInvoices([...selectedInvoices, invoiceId]);
    }
  };

  const toggleAllInvoices = () => {
    if (selectedInvoices.length === unpaidInvoices.length) {
      // If all are selected, deselect all
      setSelectedInvoices([]);
    } else {
      // Otherwise select all unpaid invoices
      setSelectedInvoices(unpaidInvoices.map(invoice => invoice.id));
    }
  };

  // Filter and sort data
  const filteredData = data
    .filter(item => {
      const matchesSearch = (
        item.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      const matchesStatus = 
        statusFilter === 'Semua' || 
        item.paymentStatus === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortField === 'quantity' || sortField === 'amount' || sortField === 'subtotal') {
        return sortDirection === 'asc' 
          ? a[sortField] - b[sortField]
          : b[sortField] - a[sortField];
      } else if (sortField === 'date' || sortField === 'paymentDate') {
        const aDate = a[sortField] ? new Date(a[sortField]) : new Date(0);
        const bDate = b[sortField] ? new Date(b[sortField]) : new Date(0);
        return sortDirection === 'asc'
          ? aDate - bDate
          : bDate - aDate;
      } else {
        return sortDirection === 'asc'
          ? String(a[sortField]).localeCompare(String(b[sortField]))
          : String(b[sortField]).localeCompare(String(a[sortField]));
      }
    });

  // Get unpaid invoices for bulk selection
  const unpaidInvoices = filteredData.filter(item => item.paymentStatus === 'Belum Dibayar');

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const getStatusColor = (status) => {
    return status === 'Dibayar' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-amber-100 text-amber-800';
  };

  return (
    <Authenticated>
      <Head title={`Detail Vendor - ${vendorData.name}`} />
      <div className="bg-gray-50 min-h-screen p-6">
        {/* Back Button */}
        <button 
          onClick={handleBackToSummary}
          className="inline-flex items-center text-indigo-600 hover:text-indigo-900 mb-4"
        >
          <ArrowLeft size={16} className="mr-1" />
          Kembali ke Daftar Vendor
        </button>

        {/* Vendor Info Card */}
        <div className="bg-white rounded-lg shadow mb-6 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="px-6 py-5">
              <h2 className="text-xl font-semibold text-gray-800">{vendorData.name}</h2>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 mt-1">
                {vendorData.category}
              </span>
            </div>
          </div>
          
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Informasi Kontak</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <MapPin size={16} className="text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{vendorData.address}</span>
                  </li>
                  <li className="flex items-center">
                    <Phone size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{vendorData.phone}</span>
                  </li>
                  <li className="flex items-center">
                    <Mail size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{vendorData.email}</span>
                  </li>
                  <li className="flex items-center">
                    <User size={16} className="text-gray-400 mr-2 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{vendorData.contactPerson}</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Ringkasan Transaksi</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <p className="text-xs text-indigo-600 font-medium">Total Invoice</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">{totalInvoices}</p>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Lunas: {paidCount}</span>
                      <span>Belum: {unpaidCount}</span>
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-xs text-green-600 font-medium">Total Nilai</p>
                    <p className="text-xl font-bold text-gray-800 mt-1">{formatCurrency(totalAmount)}</p>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span className="text-green-600">Dibayar: {formatCurrency(totalPaid)}</span>
                      <span className="text-amber-600">Hutang: {formatCurrency(totalUnpaid)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3 flex-grow">
              <div className="relative flex-grow max-w-md">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Cari invoice, pelanggan, atau item..."
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              
              <div className="relative flex items-center bg-gray-50 border border-gray-300 rounded-lg pl-3">
                <Calendar size={18} className="text-gray-400 mr-2" />
                <select
                  className="bg-transparent text-gray-900 text-sm py-2.5 pr-10 focus:outline-none focus:ring-0 border-0"
                  value={monthFilter}
                  onChange={handleMonthChange}
                >
                  {(months.length ? months : initialMonths).map((month) => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="relative">
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 pr-10 text-sm rounded-lg block p-2.5 focus:ring-indigo-500 focus:border-indigo-500"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                >
                  <option value="Semua">Semua Status</option>
                  <option value="Dibayar">Sudah Dibayar</option>
                  <option value="Belum Dibayar">Belum Dibayar</option>
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
                  <th scope="col" className="px-4 py-3 w-10">
                    <div className="flex items-center">
                      <input
                        id="selectAll"
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                        checked={unpaidInvoices.length > 0 && selectedInvoices.length === unpaidInvoices.length}
                        onChange={toggleAllInvoices}
                        disabled={unpaidInvoices.length === 0}
                      />
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('invoiceNo')}
                  >
                    <div className="flex items-center">
                      No. Invoice
                      {sortField === 'invoiceNo' && (
                        sortDirection === 'asc' ? 
                          <ChevronsUp size={16} className="ml-1" /> : 
                          <ChevronsDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center">
                      Tanggal
                      {sortField === 'date' && (
                        sortDirection === 'asc' ? 
                          <ChevronsUp size={16} className="ml-1" /> : 
                          <ChevronsDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('customerName')}
                  >
                    <div className="flex items-center">
                      Nama Pelanggan
                      {sortField === 'customerName' && (
                        sortDirection === 'asc' ? 
                          <ChevronsUp size={16} className="ml-1" /> : 
                          <ChevronsDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hidden md:table-cell"
                    onClick={() => handleSort('itemName')}
                  >
                    <div className="flex items-center">
                      Nama Item
                      {sortField === 'itemName' && (
                        sortDirection === 'asc' ? 
                          <ChevronsUp size={16} className="ml-1" /> : 
                          <ChevronsDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hidden md:table-cell"
                    onClick={() => handleSort('quantity')}
                  >
                    <div className="flex items-center justify-center">
                      Qty
                      {sortField === 'quantity' && (
                        sortDirection === 'asc' ? 
                          <ChevronsUp size={16} className="ml-1" /> : 
                          <ChevronsDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hidden md:table-cell"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center justify-end">
                      Harga
                      {sortField === 'amount' && (
                        sortDirection === 'asc' ? 
                          <ChevronsUp size={16} className="ml-1" /> : 
                          <ChevronsDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('subtotal')}
                  >
                    <div className="flex items-center justify-end">
                      Subtotal
                      {sortField === 'subtotal' && (
                        sortDirection === 'asc' ? 
                          <ChevronsUp size={16} className="ml-1" /> : 
                          <ChevronsDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('paymentStatus')}
                  >
                    <div className="flex items-center justify-center">
                      Status
                      {sortField === 'paymentStatus' && (
                        sortDirection === 'asc' ? 
                          <ChevronsUp size={16} className="ml-1" /> : 
                          <ChevronsDown size={16} className="ml-1" />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${item.paymentStatus === 'Dibayar' ? 'bg-green-50' : ''}`}>
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                          checked={selectedInvoices.includes(item.id)}
                          onChange={() => toggleInvoiceSelection(item.id)}
                          disabled={item.paymentStatus === 'Dibayar'}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <FileText size={14} className="text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-indigo-600">{item.invoiceNo}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{formatDate(item.date)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{item.customerName}</div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <div className="text-sm text-gray-900">{item.itemName}</div>
                      </td>
                      <td className="px-6 py-4 text-center hidden md:table-cell">
                        <div className="text-sm text-gray-900">{item.quantity}</div>
                      </td>
                      <td className="px-6 py-4 text-right hidden md:table-cell">
                        <div className="text-sm text-gray-900">{formatCurrency(item.amount)}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(item.subtotal)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.paymentStatus)}`}>
                            {item.paymentStatus}
                          </span>
                          {item.paymentStatus === 'Dibayar' && (
                            <span className="text-xs text-gray-500 mt-1">{formatDate(item.paymentDate)}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {item.paymentStatus === 'Belum Dibayar' ? (
                            <button
                              onClick={() => openPaymentModal(item)}
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded bg-green-100 text-green-800 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <CheckCircle size={14} className="mr-1" />
                              Bayar
                            </button>
                          ) : (
                            <button
                              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded bg-indigo-100 text-indigo-800 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              onClick={() => openProofModal(item)}
                            >
                              <FileText size={14} className="mr-1" />
                              Lihat Bukti
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-6 py-4 text-center text-gray-500">
                      Tidak ada data yang sesuai dengan filter
                    </td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-right font-medium">
                    Total
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">
                    {formatCurrency(totalAmount)}
                  </td>
                  <td colSpan={2}></td>
                </tr>
                {selectedInvoices.length > 0 && (
                  <tr className="bg-indigo-50">
                    <td colSpan={7} className="px-6 py-4 text-right font-medium text-indigo-700">
                      Total Terpilih ({selectedInvoices.length} invoice)
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-indigo-700">
                      {formatCurrency(selectedInvoicesTotal)}
                    </td>
                    <td colSpan={2} className="px-6 py-2">
                      <button
                        onClick={() => openPaymentModal()}
                        className="w-full inline-flex justify-center items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <CheckSquare size={14} className="mr-1" />
                        Bayar Invoice Terpilih
                      </button>
                    </td>
                  </tr>
                )}
              </tfoot>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Menampilkan <span className="font-medium">{filteredData.length}</span> dari <span className="font-medium">{data.length}</span> invoice
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

        {/* Payment Modal */}
        {paymentModal && (
          <div className="fixed inset-0 z-[1000] overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
              
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="flex justify-between items-center px-6 py-4 bg-indigo-50 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-indigo-900">
                    {bulkPaymentMode ? 'Konfirmasi Pembayaran Massal' : 'Konfirmasi Pembayaran Invoice'}
                  </h3>
                  <button onClick={closePaymentModal} className="text-gray-400 hover:text-gray-500">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="px-6 py-4">
                  {/* Invoice Summary */}
                  <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    {bulkPaymentMode ? (
                      <div className="text-sm">
                        <p className="text-gray-700 mb-2">Anda akan melakukan pembayaran untuk <span className="font-semibold">{selectedInvoices.length} invoice</span> dengan total:</p>
                        <p className="text-xl font-bold text-indigo-600">{formatCurrency(selectedInvoicesTotal)}</p>
                      </div>
                    ) : selectedInvoice && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Nomor Invoice</p>
                          <p className="font-medium">{selectedInvoice.invoiceNo}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Tanggal Invoice</p>
                          <p className="font-medium">{formatDate(selectedInvoice.date)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Pelanggan</p>
                          <p className="font-medium">{selectedInvoice.customerName}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Jumlah</p>
                          <p className="font-medium text-indigo-700">{formatCurrency(selectedInvoice.subtotal)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <form onSubmit={submitPaymentForm}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700">
                          Tanggal Pembayaran
                        </label>
                        <input
                          type="date"
                          id="paymentDate"
                          name="paymentDate"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={paymentForm.paymentDate}
                          onChange={handlePaymentFormChange}
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700">
                          Metode Pembayaran
                        </label>
                        <select
                          id="paymentMethod"
                          name="paymentMethod"
                          className="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={paymentForm.paymentMethod}
                          onChange={handlePaymentFormChange}
                          required
                        >
                          <option value="Transfer Bank">Transfer Bank</option>
                          <option value="Tunai">Tunai</option>
                          <option value="Kartu Kredit">Kartu Kredit</option>
                          <option value="QRIS">QRIS</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="paymentReference" className="block text-sm font-medium text-gray-700">
                          Nomor Referensi
                        </label>
                        <input
                          type="text"
                          id="paymentReference"
                          name="paymentReference"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Contoh: Nomor transfer, kode QRIS, dll."
                          value={paymentForm.paymentReference}
                          onChange={handlePaymentFormChange}
                        />
                      </div>
                      
                      <div>
  <label htmlFor="paymentProof" className="block text-sm font-medium text-gray-700">
    Bukti Pembayaran
  </label>
  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
    <div className="space-y-1 text-center">
      {!paymentForm.file ? (
        <>
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            stroke="currentColor" 
            fill="none" 
            viewBox="0 0 48 48"
          >
            <path 
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          </svg>
          <div className="flex text-sm text-gray-600">
            <label 
              htmlFor="file-upload" 
              className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
            >
              <span>Upload bukti pembayaran</span>
              <input 
                id="file-upload" 
                name="file-upload" 
                type="file" 
                className="sr-only"
                onChange={handleFileChange}
                accept="image/*,.pdf"
              />
            </label>
            <p className="pl-1">atau drag and drop</p>
          </div>
          <p className="text-xs text-gray-500">
            PNG, JPG, PDF hingga 10MB
          </p>
        </>
      ) : (
        <div className="relative">
          {paymentForm.file.type.startsWith('image/') && proofPreviewUrl ? (
            <div className="text-center">
              <img 
                src={proofPreviewUrl} 
                alt="Preview bukti pembayaran" 
                className="max-h-48 mx-auto object-contain rounded"
              />
              <p className="mt-2 text-sm text-gray-600">{paymentForm.file.name}</p>
              <p className="text-xs text-gray-500">
                {(paymentForm.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          ) : (
            <div className="p-4 text-center">
              <FileText size={48} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">{paymentForm.file.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                {(paymentForm.file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}
          <button 
            type="button"
            onClick={() => {
              setPaymentForm({...paymentForm, file: null});
              if (proofPreviewUrl) {
                URL.revokeObjectURL(proofPreviewUrl);
                setProofPreviewUrl(null);
              }
            }}
            className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200 focus:outline-none"
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  </div>
</div>
                      
                      <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                          Catatan (Opsional)
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          rows="3"
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Catatan tambahan tentang pembayaran ini"
                          value={paymentForm.notes}
                          onChange={handlePaymentFormChange}
                        ></textarea>
                      </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={closePaymentModal}
                        className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <Check size={16} className="mr-1" />
                        Konfirmasi Pembayaran
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {viewProofModal && viewingInvoice && (
  <div className="fixed inset-0 z-50 overflow-y-auto">
    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div className="fixed inset-0 transition-opacity">
        <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>
      
      <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
      
      <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
        <div className="flex justify-between items-center px-6 py-4 bg-green-50 border-b border-gray-200">
          <h3 className="text-lg font-medium text-green-900">
            Bukti Pembayaran Invoice
          </h3>
          <button onClick={closeProofModal} className="text-gray-400 hover:text-gray-500">
            <X size={20} />
          </button>
        </div>
        
        <div className="px-6 py-4">
          {/* Invoice Summary */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Nomor Invoice</p>
                <p className="font-medium">{viewingInvoice.invoiceNo}</p>
              </div>
              <div>
                <p className="text-gray-500">Tanggal Invoice</p>
                <p className="font-medium">{formatDate(viewingInvoice.date)}</p>
              </div>
              <div>
                <p className="text-gray-500">Pelanggan</p>
                <p className="font-medium">{viewingInvoice.customerName}</p>
              </div>
              <div>
                <p className="text-gray-500">Jumlah</p>
                <p className="font-medium text-green-700">{formatCurrency(viewingInvoice.subtotal)}</p>
              </div>
              <div>
                <p className="text-gray-500">Tanggal Pembayaran</p>
                <p className="font-medium">{formatDate(viewingInvoice.paymentDate)}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  {viewingInvoice.paymentStatus}
                </span>
              </div>
            </div>
          </div>
          
          {/* Payment Proof Display */}
          <div className="border rounded-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-2 border-b">
              <span className="text-sm font-medium text-gray-700">Bukti Pembayaran</span>
            </div>
            <div className="p-4 bg-white">      
      {viewingInvoice.paymentProof && viewingInvoice.paymentProof.endsWith('.jpg') ? (
                  <div className="text-center">
                    {/* In a real app, this would be a real image path */}
                    <img 
                      src={`/storage/payment-proofs/${viewingInvoice.paymentProof}`} 
                      alt="Bukti pembayaran" 
                      className="max-h-64 mx-auto object-contain border rounded-md"
                      onError={(e) => {
                        // Fallback if image doesn't load - simplified
                        e.target.onerror = null;
                        e.target.src = "/images/placeholder-payment.jpg";
                      }}
                    />
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <div className="p-4 rounded-lg bg-gray-50 inline-block">
                      <FileText size={64} className="mx-auto text-gray-400 mb-3" />
                      <p className="text-sm font-medium text-gray-700">{viewingInvoice.paymentProof || "bukti_pembayaran.pdf"}</p>
                      <p className="text-xs text-gray-500 mt-2">Dokumen PDF</p>
                    </div>
                    <p className="mt-4 text-sm text-gray-600">
                      Klik tombol di bawah untuk mengunduh bukti pembayaran
                    </p>
                  </div>
                )}
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 border-t">
                  <button
                    onClick={() => window.open(`/storage/payment-proofs/${viewingInvoice.paymentProof}`, '_blank')}
                    className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Download size={16} className="mr-1" />
                    Unduh Bukti Pembayaran
                  </button>
                  <button
                    onClick={closeProofModal}
                    className="inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
      )}      
    </Authenticated>
  );
};

export default VendorDetailPage;
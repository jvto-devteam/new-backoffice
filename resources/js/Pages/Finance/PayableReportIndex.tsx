import Main from '@/Layouts/Main';
import { useState, useEffect } from 'react';
import { Link, router } from '@inertiajs/react';
import { 
  CalendarIcon, 
  FileIcon, 
  DollarSignIcon,
  UserIcon, 
  EyeIcon, 
  PlusCircleIcon,
  SearchIcon, 
  FilterIcon, 
  ChevronRightIcon,
  CreditCard
} from 'lucide-react';

export default function PayableReportIndex({ data }) {
    const { payments, vendors, filters, summary } = data;
    
    // State untuk filter
    const [filterData, setFilterData] = useState({
        month: filters.month || '',
        year: filters.year || '',
        vendor: filters.vendor || '',
    });
    
    // State untuk pencarian
    const [searchTerm, setSearchTerm] = useState('');
    
    // Data untuk bulan dan tahun
    const months = [
        { value: '01', label: 'Januari' },
        { value: '02', label: 'Februari' },
        { value: '03', label: 'Maret' },
        { value: '04', label: 'April' },
        { value: '05', label: 'Mei' },
        { value: '06', label: 'Juni' },
        { value: '07', label: 'Juli' },
        { value: '08', label: 'Agustus' },
        { value: '09', label: 'September' },
        { value: '10', label: 'Oktober' },
        { value: '11', label: 'November' },
        { value: '12', label: 'Desember' }
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 1}, (_, i) => (currentYear).toString());
    
    // Filter data berdasarkan pencarian
    const filteredPayments = payments.filter(payment => {
        if (!searchTerm) return true;
        
        const lowerSearchTerm = searchTerm.toLowerCase();
        return (
            payment.payment_number.toLowerCase().includes(lowerSearchTerm) ||
            payment.vendor_name.toLowerCase().includes(lowerSearchTerm) ||
            payment.payment_date.toLowerCase().includes(lowerSearchTerm)
        );
    });
    
    // Handle perubahan filter
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        
        setFilterData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    // Handle penerapan filter
    const applyFilters = () => {
        router.get('/finance/payable-report', filterData, {
            preserveState: true,
            replace: true,
            only: ['data']
        });
    };
    
    // Handle reset filter
    const resetFilters = () => {
        const resetData = {
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear().toString(),
            vendor: '',
        };
        
        setFilterData(resetData);
        
        router.get('/finance/payable-report', resetData, {
            preserveState: true,
            replace: true,
            only: ['data']
        });
    };
    
    // Handle perubahan pencarian
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };
    
    // Format string menjadi title case
    const toTitleCase = (str) => {
        return str.replace(
            /\w\S*/g,
            function(txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
    };
    
    // Mendapatkan label item type
    const getItemTypeLabel = (type) => {
        switch(type) {
            case 'hotel': return 'Hotel';
            case 'bromo': return 'Bromo Activity';
            case 'activity': return 'Activity';
            case 'car': return 'Car';
            case 'others': return 'Others';
            default: return toTitleCase(type);
        }
    };
    
    return (
        <Main>
            <div className="p-6">
                {/* Header */}
                <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg mb-0 shadow-md">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center">
                                <DollarSignIcon className="mr-2" size={24} />
                                Daftar Pembayaran Hutang
                            </h1>
                            <p className="mt-1 text-blue-100">
                                Menampilkan {filteredPayments.length} pembayaran dengan total {summary.formatted_total}
                            </p>
                        </div>
                        <Link
                            href="/finance/payable-report/create"
                            className="bg-white text-blue-600 py-2 px-4 rounded shadow-sm hover:bg-blue-50 flex items-center"
                        >
                            <PlusCircleIcon size={16} className="mr-2" />
                            Tambah Pembayaran
                        </Link>
                    </div>
                </div>
                
                {/* Filter dan pencarian */}
                <div className="bg-white rounded-b-lg shadow-md px-6 py-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Bulan
                                    </label>
                                    <select
                                        name="month"
                                        value={filterData.month}
                                        onChange={handleFilterChange}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                                    >
                                        <option value="">Semua Bulan</option>
                                        {months.map(month => (
                                            <option key={month.value} value={month.value}>
                                                {month.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tahun
                                    </label>
                                    <select
                                        name="year"
                                        value={filterData.year}
                                        onChange={handleFilterChange}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                                    >
                                        {/* <option value="">Semua Tahun</option> */}
                                        {years.map(year => (
                                            <option key={year} value={year}>
                                                {year}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Vendor
                                    </label>
                                    <select
                                        name="vendor"
                                        value={filterData.vendor}
                                        onChange={handleFilterChange}
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                                    >
                                        <option value="">Semua Vendor</option>
                                        {Object.keys(vendors).map(category => (
                                            <optgroup key={category} label={category}>
                                                {vendors[category].map(vendor => (
                                                    <option key={vendor.id} value={vendor.id}>
                                                        {vendor.name}
                                                    </option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-end space-x-2">
                            <button
                                type="button"
                                onClick={applyFilters}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                            >
                                <FilterIcon size={16} className="mr-2" />
                                Filter
                            </button>
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Ringkasan Data */}
                {/* <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Ringkasan Pembayaran</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                            <div className="text-sm text-blue-600 font-medium">Total Pembayaran</div>
                            <div className="text-2xl font-bold text-blue-800 mt-2">{summary.total_payments}</div>
                        </div>
                        
                        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                            <div className="text-sm text-green-600 font-medium">Total Nominal</div>
                            <div className="text-2xl font-bold text-green-800 mt-2">{summary.formatted_total}</div>
                        </div>
                    </div>
                </div> */}
                
                {/* Tabel Pembayaran */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-lg font-medium text-gray-800 mb-4">Data Pembayaran</h2>
                    
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        No. Pembayaran
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tanggal
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Vendor
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Item
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Payment Method
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPayments.length > 0 ? (
                                    filteredPayments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                                {payment.payment_number}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {payment.payment_date}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {payment.vendor_name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <a
                                                    href={payment.payment_proof}
                                                    target="_blank"
                                                    className="text-blue-600 hover:underline hover:text-blue-800 flex items-center"
                                                >
                                                <CreditCard size={16} className="mr-1" /> {payment.payment_method}
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {payment.item_count} item
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {payment.formatted_amount}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Link
                                                    href={`/finance/payable-report/details/${payment.id}`}
                                                    className="text-blue-600 hover:underline hover:text-blue-800 flex items-center"
                                                >
                                                    <EyeIcon size={16} className="mr-1" />
                                                    Detail
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-8 text-center text-sm text-gray-500 bg-gray-50">
                                            <div className="flex flex-col items-center justify-center">
                                                <FileIcon className="h-10 w-10 text-gray-400 mb-2" />
                                                <p className="text-gray-600 font-medium">Tidak ada data pembayaran</p>
                                                <p className="text-gray-500">Tidak ditemukan data pembayaran yang sesuai dengan filter</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </Main>
    );
}
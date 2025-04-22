import Main from '@/Layouts/Main';
import { useState, useEffect } from 'react';
import { Link,router } from '@inertiajs/react';
import Swal from '@/utils/swal';
import { 
  CheckIcon, 
  CalendarIcon, 
  File, 
  CreditCardIcon, 
  UserIcon, 
  LinkIcon, 
  UploadIcon, 
  SearchIcon, 
  FilterIcon, 
  InfoIcon, 
  AlertCircleIcon,
  DollarSignIcon,
  ClipboardIcon,
  CheckCircleIcon
} from 'lucide-react';

export default function PayableReportCreate({data}) {
    const { vendors,paymentMethods,paymentNo, filters, debts } = data;

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
    const years = Array.from({length: 3}, (_, i) => currentYear - 1 + i);
    
    // State untuk data hutang
    const [bookHotel, setBookHotel] = useState(debts || []);
    
    // State untuk form pembayaran
    const [paymentData, setPaymentData] = useState({
        paymentNumber: paymentNo,
        vendorId: filters.vendor || '',
        paymentDate: new Date().toISOString().slice(0, 10),
        paymentMethodId: '',
        paymentProofType: 'upload', // 'upload' atau 'link'
        paymentProofFile: null,
        paymentProofLink: '',
        note: '',
        debtMonth: filters.month || '',
        debtYear: filters.year || '',
    });
    
    // State untuk check all di tabel
    const [allSelected, setAllSelected] = useState(false);
    
    // State untuk total pembayaran
    const [totalAmount, setTotalAmount] = useState(0);
    
    // State untuk pencarian
    const [searchTerm, setSearchTerm] = useState('');
    
    // State untuk menampilkan pesan sukses
    const [showSuccess, setShowSuccess] = useState(false);

    const isActivityDebt = (hotel) => {
        return hotel.hasOwnProperty('activity_date');
    };
    
    const isBromoActivity = (hotel) => {
        return isActivityDebt(hotel) && hotel.hasOwnProperty('bromo_ticket') && hotel.hasOwnProperty('bromo_jeep');
    };
    
    const isCarDebt = (hotel) => {
        return hotel.hasOwnProperty('pickup_date') && hotel.hasOwnProperty('drop_date') && hotel.hasOwnProperty('car');
    };
    
    const isOtherDebt = (hotel) => {
        return hotel.hasOwnProperty('item') && !hotel.hasOwnProperty('activity_date');
    };
    const getColspan = () => {
        if (bookHotel && bookHotel.length > 0) {
            if (!isActivityDebt(bookHotel[0]) && !isCarDebt(bookHotel[0]) && !isOtherDebt(bookHotel[0])) {
                return 9; // Hotel
            } else if (isBromoActivity(bookHotel[0])) {
                return 9; // Bromo
            } else if (isCarDebt(bookHotel[0])) {
                return 8; // Car
            } else if (isOtherDebt(bookHotel[0])) {
                return 6; // Others
            } else {
                return 7; // Activity regular
            }
        }
        return 9; // Default
    };    
    // Hook untuk hitung total pembayaran
    useEffect(() => {
        if (bookHotel && bookHotel.length > 0) {
            calculateTotal();
        }
    }, [bookHotel]);
    
    // Update bookHotel ketika debts berubah
    useEffect(() => {
        if (debts) {
            // Tambahkan properti selected ke setiap item
            const debtsWithSelection = debts.map(debt => ({
                ...debt,
                selected: false
            }));
            setBookHotel(debtsWithSelection);
            setAllSelected(false);
            setTotalAmount(0); // Reset total saat data berubah
        } else {
            setBookHotel([]);
        }
    }, [debts]);
    
    // Filter data hutang berdasarkan pencarian
    const filteredHotels = bookHotel.filter(hotel => {
        if (!searchTerm) return true;
        
        const lowerSearchTerm = searchTerm.toLowerCase();
        
        if (isBromoActivity(hotel)) {
            // Filter untuk aktivitas Bromo
            return (
                (hotel.customer && hotel.customer.toLowerCase().includes(lowerSearchTerm)) ||
                (hotel.activity_date && hotel.activity_date.toLowerCase().includes(lowerSearchTerm))
            );
        } else if (isActivityDebt(hotel)) {
            // Filter untuk aktivitas lain
            return (
                (hotel.customer && hotel.customer.toLowerCase().includes(lowerSearchTerm)) ||
                (hotel.activity_date && hotel.activity_date.toLowerCase().includes(lowerSearchTerm)) ||
                (hotel.item && hotel.item.toLowerCase().includes(lowerSearchTerm))
            );
        } else {
            // Filter untuk data hotel
            return (
                (hotel.customer && hotel.customer.toLowerCase().includes(lowerSearchTerm)) ||
                (hotel.check_in && hotel.check_in.toLowerCase().includes(lowerSearchTerm)) ||
                (hotel.rooms && hotel.rooms.some(room => room.room.toLowerCase().includes(lowerSearchTerm)))
            );
        }
    });

    // Handle perubahan input form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Update state lokal terlebih dahulu
        setPaymentData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Jika perubahan terjadi di field vendor, bulan, atau tahun, lakukan Inertia router get
        if (name === 'vendorId' || name === 'debtMonth' || name === 'debtYear') {
            // Siapkan parameter yang akan dikirim
            const params = {
                vendor: name === 'vendorId' ? value : paymentData.vendorId,
                month: name === 'debtMonth' ? value : paymentData.debtMonth,
                year: name === 'debtYear' ? value : paymentData.debtYear,
            };
            
            // Lakukan Inertia router get dengan parameter
            router.get('/finance/payable-report/create', params, {
                preserveState: true,
                replace: true,
                preserveScroll: true,
                only: ['data']
            });
        }
    };
    
    // Handle perubahan input pencarian
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };
    
    // Handle upload file
    const handleFileChange = (e) => {
        setPaymentData(prev => ({
            ...prev,
            paymentProofFile: e.target.files[0]
        }));
    };
    
    // Toggle tipe bukti pembayaran (upload atau link)
    const toggleProofType = (type) => {
        setPaymentData(prev => ({
            ...prev,
            paymentProofType: type
        }));
    };
    
    // Toggle select all pada tabel
    const toggleSelectAll = () => {
        const newAllSelected = !allSelected;
        setAllSelected(newAllSelected);
        
        // Update semua item
        const updatedBookHotel = bookHotel.map(item => ({
            ...item,
            selected: newAllSelected
        }));
        
        setBookHotel(updatedBookHotel);
        
        // Hitung ulang total
        calculateTotal(updatedBookHotel);
    };
    
    
    // Toggle select satu item pada tabel
    const toggleSelectDebt = (id) => {
        // Cek apakah item dengan id tersebut ada
        const itemExists = bookHotel.find(item => item.id === id);
        
        if (!itemExists) {
            console.warn(`Item dengan id ${id} tidak ditemukan.`);
            return;
        }
        
        const updatedBookHotel = bookHotel.map(item => 
            item.id === id ? { ...item, selected: !item.selected } : item
        );
        
        setBookHotel(updatedBookHotel);
        
        // Hitung ulang total
        calculateTotal(updatedBookHotel);
        
        // Update state allSelected
        const allItemsSelected = updatedBookHotel.every(item => item.selected);
        setAllSelected(allItemsSelected);
    };    
    // Hitung total pembayaran
    const calculateTotal = (hotelData = bookHotel) => {
        if (!hotelData || hotelData.length === 0) {
            setTotalAmount(0);
            return;
        }
        
        const total = hotelData
            .filter(item => item.selected === true) // Memastikan hanya yang dipilih
            .reduce((sum, item) => {
                // Tentukan field amount berdasarkan tipe data
                let amount = 0;
                
                if (isCarDebt(item)) {
                    // Untuk car
                    amount = parseFloat(item.amount || 0);
                } else if (isOtherDebt(item)) {
                    // Untuk others
                    amount = parseFloat(item.amount || 0);
                } else if (isActivityDebt(item)) {
                    // Untuk aktivitas (termasuk Bromo)
                    amount = parseFloat(item.amount || 0);
                } else {
                    // Untuk hotel
                    amount = parseFloat(item.total || 0);
                }
                
                // Validasi nilai
                if (isNaN(amount)) {
                    console.warn('Nilai tidak valid ditemukan:', item);
                    amount = 0;
                }
                
                return sum + amount;
            }, 0);
        
        setTotalAmount(total);
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };
    
    // Format tanggal ke format Indonesia
    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return dateString;
    };
    
    // Handle submit form
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validasi
        if (paymentData.vendorId === '') {
            alert('Silakan pilih vendor terlebih dahulu');
            return;
        }
        
        if (paymentData.paymentMethodId === '') {
            alert('Silakan pilih metode pembayaran terlebih dahulu');
            return;
        }
        
        if (paymentData.paymentProofType === 'upload' && !paymentData.paymentProofFile) {
            alert('Silakan upload bukti pembayaran terlebih dahulu');
            return;
        }
        
        if (paymentData.paymentProofType === 'link' && !paymentData.paymentProofLink) {
            alert('Silakan masukkan link bukti pembayaran terlebih dahulu');
            return;
        }
        
        // Hutang yang diseleksi
        const selectedItems = bookHotel.filter(item => item.selected);
        
        if (selectedItems.length === 0) {
            alert('Silakan pilih minimal satu hutang yang akan dibayar');
            return;
        }
        
        // Persiapkan FormData untuk upload file
        const formData = new FormData();
        formData.append('paymentNumber', paymentData.paymentNumber);
        formData.append('vendorId', paymentData.vendorId);
        formData.append('paymentDate', paymentData.paymentDate);
        formData.append('paymentMethodId', paymentData.paymentMethodId);
        formData.append('paymentProofType', paymentData.paymentProofType);
        formData.append('note', paymentData.note);
        formData.append('totalAmount', totalAmount);
        
        // Tambahkan file atau link
        if (paymentData.paymentProofType === 'upload' && paymentData.paymentProofFile) {
            formData.append('paymentProofFile', paymentData.paymentProofFile);
        } else if (paymentData.paymentProofType === 'link') {
            formData.append('paymentProofLink', paymentData.paymentProofLink);
        }
        
        // Tambahkan items
        selectedItems.forEach((item, index) => {
            Object.keys(item).forEach(key => {
                if (typeof item[key] === 'object' && item[key] !== null) {
                    formData.append(`items[${index}][${key}]`, JSON.stringify(item[key]));
                } else {
                    formData.append(`items[${index}][${key}]`, item[key]);
                }
            });
        });
        
        // Kirim ke server dengan Inertia
        router.post('/finance/payable-report/store', formData, {
            forceFormData: true,
            onBefore: () => {
                Swal.fire({
                  title: 'Processing...',
                  html: 'Please wait while we process...',
                  allowOutsideClick: false,
                  didOpen: () => {
                    Swal.showLoading();
                  }
                });
            },
            onSuccess: () => {
                // Tampilkan pesan sukses
                Swal.fire({
                    title: 'Success!',
                    text: 'Pembayaran hutang berhasil',
                    icon: 'success'
                  }).then(() => {
                    router.visit(`/finance/payable-report/`);
                  });
          
                setShowSuccess(true);
                
                // Sembunyikan pesan sukses setelah 3 detik
                setTimeout(() => {
                    setShowSuccess(false);
                    // Redirect ke halaman daftar pembayaran
                    router.visit('/finance/payable-report/create');
                }, 3000);
            },
            onError: (errors) => {
                console.error('Error:', errors);
                alert('Terjadi kesalahan saat menyimpan pembayaran: ' + 
                    (errors.message || Object.values(errors).join(', ')));
            }
        });
    };
    // Mendapatkan nama vendor berdasarkan ID
    const getVendorName = (id) => {
        if (!id) return '-';
        
        // Mengubah id ke format number untuk memastikan perbandingan yang tepat
        const idNum = parseInt(id);
        
        // Cari vendor di semua kategori
        for (const category in vendors) {
            const vendor = vendors[category].find(v => v.id === idNum);
            if (vendor) {
                return vendor.name;
            }
        }
        
        return '-';
    };    
    
    // Mendapatkan nama metode pembayaran berdasarkan ID
    const getPaymentMethodName = (id) => {
        if (!id) return '-';
        const method = paymentMethods.find(m => m.id === parseInt(id));
        return method ? method.name : '-';
    };
    
    return (
        <Main>
            {/* Pesan sukses */}
            {showSuccess && (
                <div className="fixed top-4 right-4 bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-md shadow-md z-50 flex items-center">
                    <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                    <span>Pembayaran berhasil disimpan!</span>
                </div>
            )}
            
            <div className="p-6">
                {/* Header */}
                <div className="bg-blue-600 text-white px-6 py-4 rounded-t-lg mb-0 shadow-md">
                    <h1 className="text-2xl font-bold flex items-center">
                        <DollarSignIcon className="mr-2" size={24} />
                        Pembayaran Hutang
                    </h1>
                    <p className="mt-1 text-blue-100">Kelola pembayaran hutang dengan mudah dan efisien</p>
                </div>
                
                <div className="bg-white rounded-b-lg shadow-md px-6 py-6 mb-6">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                            {/* Form Pembayaran */}
                            <div className="space-y-4 lg:col-span-1">
                                <h3 className="text-lg font-medium text-gray-800 pb-2 border-b border-gray-200 flex items-center">
                                    <ClipboardIcon className="h-5 w-5 text-blue-500 mr-2" />
                                    Informasi Pembayaran
                                </h3>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        No Pembayaran
                                    </label>
                                    <div className="flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                            <File size={16} />
                                        </span>
                                        <input
                                            type="text"
                                            name="paymentNumber"
                                            value={paymentData.paymentNumber}
                                            onChange={handleInputChange}
                                            className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                                            readOnly
                                        />
                                    </div>
                                    <div className="mt-1 text-xs text-gray-500">Nomor transaksi dibuat otomatis</div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Vendor <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                            <UserIcon size={16} />
                                        </span>
                                        <select
                                            name="vendorId"
                                            value={paymentData.vendorId}
                                            onChange={handleInputChange}
                                            className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                                            required
                                        >
                                            <option value="">Pilih Vendor</option>
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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tanggal Pembayaran <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                            <CalendarIcon size={16} />
                                        </span>
                                        <input
                                            type="date"
                                            name="paymentDate"
                                            value={paymentData.paymentDate}
                                            onChange={handleInputChange}
                                            className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Metode Pembayaran <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex rounded-md shadow-sm">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                            <CreditCardIcon size={16} />
                                        </span>
                                        <select
                                            name="paymentMethodId"
                                            value={paymentData.paymentMethodId}
                                            onChange={handleInputChange}
                                            className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                                            required
                                        >
                                            <option value="">Pilih Metode Pembayaran</option>
                                            {paymentMethods.map(method => (
                                                <option key={method.id} value={method.id}>
                                                    {method.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Detail dan Bukti Pembayaran */}
                            <div className="space-y-4 lg:col-span-1">
                                <h3 className="text-lg font-medium text-gray-800 pb-2 border-b border-gray-200 flex items-center">
                                    <File className="h-5 w-5 text-blue-500 mr-2" />
                                    Detail & Bukti Pembayaran
                                </h3>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Bulan
                                        </label>
                                        <select
                                            name="debtMonth"
                                            value={paymentData.debtMonth}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                                        >
                                            <option value="">Pilih Bulan</option>
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
                                            name="debtYear"
                                            value={paymentData.debtYear}
                                            onChange={handleInputChange}
                                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
                                        >
                                            <option value="">Pilih Tahun</option>
                                            {years.map(year => (
                                                <option key={year} value={year}>
                                                    {year}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bukti Pembayaran <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex space-x-3 mb-3">
                                        <button
                                            type="button"
                                            className={`px-4 py-2 rounded-md text-sm font-medium ${
                                                paymentData.paymentProofType === 'upload'
                                                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                                            }`}
                                            onClick={() => toggleProofType('upload')}
                                        >
                                            <UploadIcon size={14} className="inline mr-1" /> Upload File
                                        </button>
                                        <button
                                            type="button"
                                            className={`px-4 py-2 rounded-md text-sm font-medium ${
                                                paymentData.paymentProofType === 'link'
                                                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                                    : 'bg-gray-100 text-gray-700 border border-gray-300'
                                            }`}
                                            onClick={() => toggleProofType('link')}
                                        >
                                            <LinkIcon size={14} className="inline mr-1" /> Gunakan Link
                                        </button>
                                    </div>
                                    
                                    {paymentData.paymentProofType === 'upload' ? (
                                        <input
                                            type="file"
                                            name="paymentProofFile"
                                            onChange={handleFileChange}
                                            className="block w-full text-sm text-gray-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-md file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-blue-50 file:text-blue-700
                                                hover:file:bg-blue-100
                                                shadow-sm border border-gray-300 rounded-md"
                                        />
                                    ) : (
                                        <div className="flex rounded-md shadow-sm">
                                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                                                <LinkIcon size={16} />
                                            </span>
                                            <input
                                                type="text"
                                                name="paymentProofLink"
                                                value={paymentData.paymentProofLink}
                                                onChange={handleInputChange}
                                                placeholder="https://example.com/bukti-pembayaran.jpg"
                                                className="focus:ring-blue-500 focus:border-blue-500 flex-1 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300"
                                            />
                                        </div>
                                    )}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Catatan
                                    </label>
                                    <textarea
                                        name="note"
                                        value={paymentData.note}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                        placeholder="Tambahkan catatan (opsional)"
                                    ></textarea>
                                </div>
                            </div>
                            
                            {/* Summary Payment */}
                            <div className="space-y-4 lg:col-span-1">
                                <h3 className="text-lg font-medium text-gray-800 pb-2 border-b border-gray-200 flex items-center">
                                    <InfoIcon className="h-5 w-5 text-blue-500 mr-2" />
                                    Ringkasan Pembayaran
                                </h3>
                                
                                <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">No Pembayaran:</span>
                                            <span className="font-medium">{paymentData.paymentNumber}</span>
                                        </div>
                                        
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Vendor:</span>
                                            <span className="font-medium">{paymentData.vendorId ? getVendorName(paymentData.vendorId) : '-'}</span>
                                        </div>
                                        
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Tanggal Pembayaran:</span>
                                            <span className="font-medium">{paymentData.paymentDate ? formatDate(paymentData.paymentDate) : '-'}</span>
                                        </div>
                                        
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Metode Pembayaran:</span>
                                            <span className="font-medium">{paymentData.paymentMethodId ? getPaymentMethodName(paymentData.paymentMethodId) : '-'}</span>
                                        </div>
                                        
                                        <div className="border-t border-gray-200 my-2 pt-2"></div>
                                        
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Total Hutang Dipilih:</span>
                                            <span className="font-medium">{bookHotel.filter(hotel => hotel.selected).length} item</span>
                                        </div>
                                        
                                        <div className="flex justify-between text-lg font-bold">
                                            <span className="text-gray-700">Total Pembayaran:</span>
                                            <span className="text-blue-600">{formatCurrency(totalAmount)}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <button
                                    type="submit"
                                    className={`w-full mt-4 inline-flex justify-center items-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                                        totalAmount === 0
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                    }`}
                                    disabled={totalAmount === 0}
                                >
                                    <CheckIcon className="mr-2" size={16} />
                                    Bayar Sekarang
                                </button>
                                
                                {totalAmount === 0 && (
                                    <div className="text-xs text-gray-500 text-center mt-2">
                                        Pilih minimal satu hutang untuk melakukan pembayaran
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
                
                {/* Tabel Data Hutang */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-medium text-gray-800 flex items-center">
                            <ClipboardIcon className="h-5 w-5 text-blue-500 mr-2" />
                            Data Hutang
                            <span className="ml-2 text-sm font-normal text-gray-500">
                                ({bookHotel ? bookHotel.length : 0} item)
                            </span>
                        </h2>
                        
                        <div className="flex items-center">
                            <div className="relative rounded-md shadow-sm max-w-xs">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cari hutang..."
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 py-2 sm:text-sm border-gray-300 rounded-md"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-4 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                checked={allSelected}
                                                onChange={toggleSelectAll}
                                            />
                                        </div>
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        No
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Guest
                                    </th>
                                    
                                    {/* Kolom yang berbeda berdasarkan tipe data */}
                                    {bookHotel && bookHotel.length > 0 && !isActivityDebt(bookHotel[0]) && !isCarDebt(bookHotel[0]) && !isOtherDebt(bookHotel[0]) ? (
                                        // Kolom untuk hotel
                                        <>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Check In
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Pax
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Rooms
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Room Cost
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Meals
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Meal Cost
                                            </th>
                                        </>
                                    ) : bookHotel && bookHotel.length > 0 && isBromoActivity(bookHotel[0]) ? (
                                        // Kolom untuk aktivitas Bromo
                                        <>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Activity Date
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Hotel
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Pax
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Bromo Ticket
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Jeep Units
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Jeep Cost
                                            </th>
                                        </>
                                    ) : bookHotel && bookHotel.length > 0 && isCarDebt(bookHotel[0]) ? (
                                        // Kolom untuk car
                                        <>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Pickup Date
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Drop Date
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Car
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Days
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Rate
                                            </th>
                                        </>
                                    ) : bookHotel && bookHotel.length > 0 && isOtherDebt(bookHotel[0]) ? (
                                        // Kolom untuk others
                                        <>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Item
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Qty
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Rate
                                            </th>
                                        </>
                                    ) : (
                                        // Kolom untuk aktivitas lain
                                        <>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Activity Date
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Item
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Qty
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Rate
                                            </th>
                                        </>
                                    )}
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {bookHotel && bookHotel.length > 0 ? (
                                    filteredHotels.map((hotel, index) => (
                                        <tr 
                                            key={hotel.id}
                                            className={hotel.selected ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-50"}
                                            onClick={() => toggleSelectDebt(hotel.id)}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    checked={hotel.selected || false}
                                                    onChange={() => toggleSelectDebt(hotel.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <a onClick={(e) => {
                                                    e.stopPropagation();
                                                }} target="_blank" href={'/bookings/details/'+hotel.booking_id} className="font-medium text-blue-600 hover:underline">
                                                    {hotel.customer}
                                                </a>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {hotel.duration} / {hotel.pax} Pax
                                                </div>
                                            </td>
                                            
                                            {/* Konten yang berbeda berdasarkan tipe data */}
                                            {!isActivityDebt(hotel) && !isCarDebt(hotel) && !isOtherDebt(hotel) ? (
                                                // Kolom untuk hotel
                                                <>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {hotel.check_in}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                        {hotel.pax}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {hotel.rooms && hotel.rooms.map((room, i) => (
                                                            <div key={i} className="mb-1">
                                                                {room.room} x {room.quantity}
                                                            </div>
                                                        ))}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatCurrency(hotel.room_total || 0)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {hotel.meals && hotel.meals.map((meal, i) => (
                                                            <div key={i} className="mb-1">
                                                                {meal.meals} x {meal.quantity}
                                                            </div>
                                                        ))}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatCurrency(hotel.meals_total || 0)}
                                                    </td>
                                                </>
                                            ) : isBromoActivity(hotel) ? (
                                                // Kolom untuk aktivitas Bromo
                                                <>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {hotel.activity_date}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {hotel.hotel_name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                        {hotel.pax}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatCurrency(hotel.bromo_ticket || 0)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                        {hotel.jeep_unit || 0}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatCurrency(hotel.bromo_jeep || 0)}
                                                    </td>
                                                </>
                                            ) : isCarDebt(hotel) ? (
                                                // Kolom untuk car
                                                <>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {hotel.pickup_date}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {hotel.drop_date}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {hotel.car}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                        {hotel.qty}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatCurrency(hotel.rate || 0)}
                                                    </td>
                                                </>
                                            ) : isOtherDebt(hotel) ? (
                                                // Kolom untuk others
                                                <>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {hotel.item}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                        {hotel.qty}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatCurrency(hotel.rate || 0)}
                                                    </td>
                                                </>
                                            ) : (
                                                // Kolom untuk aktivitas lain
                                                <>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {hotel.activity_date}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {hotel.item}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                                                        {hotel.qty}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {formatCurrency(hotel.rate || 0)}
                                                    </td>
                                                </>
                                            )}
                                            
                                            {/* Total untuk semua jenis */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                {formatCurrency(
                                                    isCarDebt(hotel) || isOtherDebt(hotel) || isActivityDebt(hotel) 
                                                        ? hotel.amount 
                                                        : hotel.total || 0
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="10" className="px-6 py-8 text-center text-sm text-gray-500 bg-gray-50">
                                            <div className="flex flex-col items-center justify-center">
                                                <AlertCircleIcon className="h-10 w-10 text-gray-400 mb-2" />
                                                <p className="text-gray-600 font-medium">Tidak ada data hutang</p>
                                                <p className="text-gray-500">Tidak ditemukan data hutang pada bulan dan tahun yang dipilih</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {bookHotel && bookHotel.length > 0 && (
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan={getColspan()} className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                                            Total Seluruh Hutang:
                                        </td>
                                        <td className="px-6 py-3 text-left text-sm font-bold text-gray-900">
                                            {formatCurrency(bookHotel.reduce((sum, hotel) => {
                                                // Pilih field yang tepat berdasarkan tipe data
                                                let amount = 0;
                                                
                                                if (isCarDebt(hotel) || isOtherDebt(hotel) || isActivityDebt(hotel)) {
                                                    amount = parseFloat(hotel.amount || 0);
                                                } else {
                                                    amount = parseFloat(hotel.total || 0);
                                                }
                                                
                                                // Pastikan amount adalah angka yang valid
                                                if (isNaN(amount)) {
                                                    console.warn('Nilai tidak valid ditemukan:', hotel);
                                                    amount = 0;
                                                }
                                                
                                                return sum + amount;
                                            }, 0))}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={getColspan()} className="px-6 py-3 text-right text-sm font-medium text-blue-700">
                                            Total Hutang Dipilih:
                                        </td>
                                        <td className="px-6 py-3 text-left text-sm font-bold text-blue-600">
                                            {formatCurrency(totalAmount || 0)}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
                
                {/* Mobile Summary - Hanya ditampilkan di mobile */}
                <div className="lg:hidden bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="space-y-3">
                        <h3 className="text-lg font-medium text-gray-800 flex items-center">
                            <InfoIcon className="h-5 w-5 text-blue-500 mr-2" />
                            Ringkasan Pembayaran
                        </h3>
                        
                        <div className="flex justify-between py-2">
                            <span className="text-gray-600">Total Hutang Dipilih:</span>
                            <span className="font-medium">{bookHotel.filter(hotel => hotel.selected).length} item</span>
                        </div>
                        
                        <div className="flex justify-between py-2 text-lg font-bold">
                            <span className="text-gray-700">Total Pembayaran:</span>
                            <span className="text-blue-600">{formatCurrency(totalAmount)}</span>
                        </div>
                        
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className={`w-full mt-2 inline-flex justify-center items-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                                totalAmount === 0
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                            }`}
                            disabled={totalAmount === 0}
                        >
                            <CheckIcon className="mr-2" size={16} />
                            Bayar Sekarang
                        </button>
                    </div>
                </div>
            </div>
        </Main>
    );
}                                    
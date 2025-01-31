import React, { useState, useRef, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import Authenticated from '@/Layouts/Main';
import {format} from 'date-fns';
import { 
    Calendar, 
    Phone, 
    Mail, 
    Users, 
    Package, 
    MoreVertical,
    Clock, FileText, DollarSign, Handshake,BookUser,Filter, X, Search, ChevronsUpDown, Check,Eye
} from 'lucide-react';
import { Dialog } from '@headlessui/react';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
const SearchableSelect = ({ options, value, onChange, placeholder, open, setOpen, displayKey }) => {
    const selectRef = useRef(null);
    const [searchQuery, setSearchQuery] = useState('');
    
    useEffect(() => {
        const handleClickOutside = (event) => {            
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [setOpen]);

    return (
        <div className="relative w-full" ref={selectRef}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full px-3 py-2 bg-gray-50 border border-input rounded-md text-left focus:outline-none focus:border-blue-500 transition-colors flex justify-between items-center"
            >
                <span className="truncate text-gray-700">
                    {value ? options.find(item => item.id.toString() === value.toString())?.[displayKey] : placeholder}
                </span>
                <ChevronsUpDown className="h-4 w-4 text-gray-400" />
            </button>

            {open && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded shadow-lg border">
                    <div className="sticky top-0 bg-white border-b px-3 py-2">
                        <div className="flex items-center">
                            <Search className="h-4 w-4 text-gray-400 mr-2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent border-none focus:outline-none"
                                placeholder="Search..."
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    <div className="max-h-60 overflow-auto">
                        {options
                            .filter(item => 
                                item[displayKey].toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => {
                                        onChange(item.id);
                                        setOpen(false);
                                        setSearchQuery('');
                                    }}
                                    className={`px-3 py-2 cursor-pointer flex items-center hover:bg-gray-50 ${
                                        value === item.id ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <Check 
                                        className={`h-4 w-4 mr-2 text-blue-500 ${value === item.id ? 'opacity-100' : 'opacity-0'}`} 
                                    />
                                    <span>{item[displayKey]}</span>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const FilterDropdown = ({ isOpen, onClose, filters, onChange, packages, onSubmit }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border p-4 z-50">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Filters</h3>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
            
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Search</label>
                    <Input
                        type="text"
                        placeholder="Search clients..."
                        value={filters.search}
                        onChange={(e) => onChange('search', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Date Range</label>
                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => onChange('startDate', e.target.value)}
                            className="w-full"
                        />
                        <Input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => onChange('endDate', e.target.value)}
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Package</label>
                    <SearchableSelect 
                        options={packages.map(pkg => ({
                            id: pkg.id, 
                            name: `${pkg.package_code} - ${pkg.name}`
                        }))}
                        value={filters.selectedPackage}
                        onChange={(value) => onChange('selectedPackage', value)}
                        placeholder="Select Package"
                        open={filters.packageOpen}
                        setOpen={(value) => onChange('packageOpen', value)}
                        displayKey="name"
                    />
                </div>

                {/* <div className="space-y-2">
                    <label className="text-sm font-medium">Order Channel</label>
                    <SearchableSelect 
                        options={[
                            { id: 'jvto', name: 'JVTO' },
                            { id: 'klook', name: 'KLOOK' }
                        ]}
                        value={filters.selectedChannel}
                        onChange={(value) => onChange('selectedChannel', value)}
                        placeholder="Select Order Channel"
                        open={filters.channelOpen}
                        setOpen={(value) => onChange('channelOpen', value)}
                        displayKey="name"
                    />
                </div> */}

                <div className="flex justify-end gap-2 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            onChange('search', '');
                            onChange('startDate', '');
                            onChange('endDate', '');
                            onChange('selectedPackage', null);
                            onChange('selectedChannel', null);
                        }}
                    >
                        Reset
                    </Button>
                    <Button type="submit">Apply Filters</Button>
                </div>
            </form>
        </div>
    );
};

const SummaryCard = ({ icon: Icon, title, value, subtitle, type }) => {
    const badgeColors = {
        paid: 'bg-green-100 text-green-600',
        dp: 'bg-yellow-100 text-yellow-600',
        unpaid: 'bg-red-100 text-red-600',
        default: 'bg-blue-100 text-blue-600'
    };
    const iconColors = {
        paid: 'text-green-600',
        dp: 'text-yellow-600',
        unpaid: 'text-red-600',
        default: 'text-blue-600'
    };

    const badgeColor = badgeColors[type] || badgeColors.default;
    const iconColor = iconColors[type] || iconColors.default;

    return (
        <div className="bg-white dark:bg-[#24303f] p-4 rounded-lg border">
            <div className="flex gap-2">
                <div className={`${iconColor} mt-1`}>
                    <Icon className="w-6 h-6" />
                </div>
                <p className="text-2xl font-bold">{value}</p>
            </div>
            <div className="mt-2">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${badgeColor}`}>
                    {subtitle}
                </div>
            </div>
        </div>
    );
};
export default function InvoiceManager({booking,summary,packages,filters}){
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount);
    };
    const [filterState, setFilterState] = useState({
        search: filters.search || '',
        startDate: filters.start_date || '',
        endDate: filters.end_date || '',
        selectedPackage: filters.package || '',
        selectedChannel: filters.channel || '',
        packageOpen: false,
        channelOpen: false
    });
    
    
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsFilterOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleFilterChange = (key, value) => {
        setFilterState(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get(
            '/finance/invoice-manager',
            { 
                search: filterState.search,
                start_date: filterState.startDate,
                end_date: filterState.endDate,
                package: filterState.selectedPackage,
                channel: filterState.selectedChannel,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
        setIsFilterOpen(false);
    };
    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === '-') return '-';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const dropdownRefs = useRef({});

    const handleOpenDetails = (bookingData) => {
        console.log('Opening details for:', bookingData); // Tambahkan logging
        setSelectedBooking(bookingData);
        setShowDetailsDialog(true);  // Pastikan ini dipanggil setelah setSelectedBooking
        setOpenDropdownId(null);
    };
    
        // Handle outside clicks for dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openDropdownId && dropdownRefs.current[openDropdownId] && 
                !dropdownRefs.current[openDropdownId].contains(event.target)) {
                setOpenDropdownId(null);
            }
        };

        if (openDropdownId) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [openDropdownId]);

    const ProgressBar = ({ percentage, status }) => {
        const getStatusColor = (status) => {
            switch (status.toLowerCase()) {
                case 'paid': return 'bg-green-500';
                case 'dp paid': return 'bg-yellow-500';
                case 'unpaid': return 'bg-red-500';
                default: return 'bg-gray-500';
            }
        };
    
        return (
            <div className="relative w-full">
                <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                        className={`h-full rounded-full ${getStatusColor(status)}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <span className="text-xs text-gray-600 mt-1 block">{percentage}% paid</span>
            </div>
        );
    };

// PaymentStatusBadge Component
const PaymentStatusBadge = ({ status }) => {
    const getStatusStyle = (status) => {
        const baseStyle = "px-2 py-1 rounded-full text-xs font-medium";
        switch (status.toLowerCase()) {
            case 'paid':
                return `${baseStyle} bg-green-100 text-green-800`;
            case 'dp paid':
                return `${baseStyle} bg-yellow-100 text-yellow-800`;
            case 'unpaid':
                return `${baseStyle} bg-red-100 text-red-800`;
            default:
                return `${baseStyle} bg-gray-100 text-gray-800`;
        }
    };

    return (
        <span className={getStatusStyle(status)}>
            {status}
        </span>
    );
};

    
    const PaymentHistory = ({ isOpen, onClose, selectedBooking }) => {
        if (!selectedBooking) return null;
            
        return (
            <Dialog 
                open={isOpen} 
                onClose={onClose}
                className="relative z-50"
            >
                <div className="fixed inset-0">
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300" aria-hidden="true" />
                </div>        
                
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className="mx-auto max-w-4xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl">
                        <div className="p-6 space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">
                        <div className="space-y-4">
                                <h4 className="font-medium text-gray-900">Packages</h4>
                                <div className="overflow-x-auto rounded-lg border border-gray-200">
                                    <table className="min-w-full divide-y divide-gray-200 table-fixed">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase w-80">Name</th>
                                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Pax</th>
                                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Price Per Pax</th>
                                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            <tr>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">1</td>
                                                <td className="px-4 py-2 text-sm text-gray-900">
                                                    <div className="font-medium">{selectedBooking.package_code}</div>
                                                    <div>
                                                        {selectedBooking.package}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">{selectedBooking.numb_of_pax}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(selectedBooking.total/selectedBooking.numb_of_pax)}</td>
                                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                                                    {formatCurrency(selectedBooking.total)}
                                                </td>
                                            </tr>
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-gray-50">
                                                <td colSpan="4" className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                                                    Total
                                                </td>
                                                <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                                                    {formatCurrency(selectedBooking.total)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                        </div>
                        
                        {selectedBooking.add_on && selectedBooking.add_on.length > 0 && (
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-900">Additional Services</h4>
                                <div className="overflow-x-auto rounded-lg border border-gray-200">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Add On</th>
                                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                                <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {selectedBooking.add_on.map((addon, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{addon.add_on.add_on}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">{addon.qty}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(addon.add_on.price)}</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                                                        {formatCurrency(addon.qty * addon.add_on.price)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="bg-gray-50">
                                                <td colSpan="4" className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                                                    Total Additional Services:
                                                </td>
                                                <td className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                                                    {formatCurrency(selectedBooking.add_on.reduce((total, addon) => 
                                                        total + (addon.qty * addon.add_on.price), 0
                                                    ))}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                {/* <p className="text-xs text-gray-500 italic">*Total additional services are included in the grand total above</p> */}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <p className="text-sm text-gray-600">Grand Total</p>
                                    <p className="font-medium">{formatCurrency(selectedBooking.grand_total)}</p>
                                </div>
                                {
                                    selectedBooking.channel == 'JVTO' && (
                                        <>
                                            <div>
                                                <p className="text-sm text-gray-600">Amount Paid</p>
                                                <p className="font-medium">{formatCurrency(selectedBooking.payment)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Balance</p>
                                                <p className="font-medium">{formatCurrency(selectedBooking.balance)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Status</p>
                                                <PaymentStatusBadge status={selectedBooking.payment_status} />
                                            </div>
                                        </>
                                )
                                }
                            </div>
                            {
                                selectedBooking.channel == 'JVTO' && (
                                    <div className="w-full">
                                        <ProgressBar 
                                            percentage={Math.round((selectedBooking.payment / selectedBooking.grand_total) * 100)} 
                                            status={selectedBooking.payment_status}
                                        />
                                    </div>
                                )
                            }

                        </div>

                        <h4 className="text-md font-medium mb-3 text-gray-900">Payment History</h4>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden">
                                <div className="relative overflow-x-auto">
                                    <table className="w-full text-sm text-gray-500 dark:text-gray-400">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                            <tr>
                                                <th scope="col" className="text-left px-6 py-3 whitespace-nowrap">
                                                    Date
                                                </th>
                                                <th scope="col" className="text-left px-6 py-3">
                                                    Description
                                                </th>
                                                <th scope="col" className="text-left px-6 py-3">
                                                    Payment Method
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-right">
                                                    Nominal
                                                </th>
                                                <th scope="col" className="px-6 py-3">
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedBooking.booking_payment.map((item, index) => (
                                                <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                                    <td className="px-6 py-4 align-top">
                                                        <div className="whitespace-nowrap">{format(item.created_at, 'dd MMM yyyy')}</div>
                                                        <div className="text-gray-400 text-xs">{format(item.created_at, 'HH:mm')}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {item.description}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {item.payment_method.name}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-medium">
                                                        {formatCurrency(item.nominal)}
                                                    </td>
                                                    <td className="px-6 py-4 font-medium">
                                                        {
                                                            item.reference ? (
                                                                <a href={item.reference} target="_blank">
                                                                    <button type="button" className="px-3 py-2 text-xs font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                                                        <Eye className="h-4 w-4"/>
                                                                    </button>
                                                                </a>
                                                            ) : '-'
                                                        }
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <th colSpan="3" scope="col" className="text-left px-6 py-3 whitespace-nowrap" >
                                                Payment Received
                                                </th>
                                                <th scope="col" className="text-right px-6 py-3 whitespace-nowrap" >
                                                    {formatCurrency(selectedBooking.payment)}
                                                </th>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
        );
    };    

    return (
        <Authenticated>
            <Head title="Invoice Manager" />
            
            <div className="p-6 space-y-6 bg-white rounded-xl dark:bg-[#24303f]">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice Manager</h1>
                    <div className="relative" ref={filterRef}>
                        <Button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            variant="outline"
                            className="gap-2"
                        >
                            <Filter className="h-4 w-4" />
                            Filters
                        </Button>

                        <FilterDropdown 
                            isOpen={isFilterOpen}
                            onClose={() => setIsFilterOpen(false)}
                            filters={filterState}
                            onChange={handleFilterChange}
                            packages={packages}
                            onSubmit={handleFilterSubmit}
                        />
                    </div>                    
                </div>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <SummaryCard
                        icon={Handshake}
                        value={`${summary.paid}`}
                        subtitle="Status Invoice Paid"
                        type="paid"
                        />
                    <SummaryCard
                        icon={FileText}
                        value={summary.dp_paid}
                        subtitle="Status Invoice DP Paid"
                        type="dp"
                        />
                    <SummaryCard
                        icon={Clock}
                        value={summary.unpaid}
                        subtitle="Status Invoice Unpaid"
                        type="unpaid"
                    />
                    <SummaryCard
                        icon={BookUser}
                        value={summary.paxs}
                        subtitle="Total Participants"
                    />
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border flex items-center gap-4">
                        <div className="flex-1">
                            <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary.grand_total)}</p>
                            <p className="text-sm text-gray-500">From {summary.bookings} Invoices</p>
                        </div>
                    </div>
                </div>


                {/* Responsive Table */}
                <div className="rounded-md border bg-white dark:bg-[#24303f]">
                    <Table>
                    <TableHeader className="bg-gray-100 dark:bg-[#1a222c]">
                        <TableRow>
                            <TableHead className="w-48">Client</TableHead>
                            <TableHead className="w-48">Trip Details</TableHead>
                            <TableHead className="w-96">Package Info</TableHead>
                            <TableHead>Grand Total</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Balance</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {booking.data.map((data) => (
                            <TableRow key={data.id}>
                                <TableCell>
                                    <div className="font-bold">
                                        {data.name}
                                    </div>
                                    <div className="mt-1 flex gap-1">
                                        <Users className="w-4 h-4" />
                                        {data.numb_of_pax} pax
                                    </div>
                                    <div className="mt-2">
                                        {
                                            data.channel == 'KLOOK' ? (
                                                <span className="bg-orange-200 text-orange-600 rounded-full text-xs font-bold px-2 py-1">KLOOK</span>
                                            ) : (
                                                <span className="bg-blue-200 text-blue-600 rounded-full text-xs font-bold px-2 py-1">JVTO</span>
                                            )
                                        }
                                    </div>
                                </TableCell>
                                <TableCell>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Booking ID : {data.id}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {formatDate(data.trip_date)}
                                    </div>
                                </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Package className="w-4 h-4" />
                                            <span className="font-bold">{data.package_code}</span>
                                        </div>
                                        <div className="text-sm text-gray-600">{data.package}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <span>{formatCurrency(data.grand_total)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <span>{formatCurrency(data.payment)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <span>{formatCurrency(data.balance)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {
                                        data.channel == 'JVTO' && (
                                            <div className="space-y-1">
                                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${data.payment_status == 'Paid' ? 'bg-green-100 text-green-700' : (data.payment_status == 'Unpaid' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700')}`}>
                                                    {data.payment_status}
                                                </div>
                                            </div>
                                        )
                                    }
                                </TableCell>
                                <TableCell>
                                    {
                                        data.channel == 'JVTO' && (
                                            <div className="relative"  ref={el => dropdownRefs.current[data.id] = el}>
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenDropdownId(openDropdownId === data.id ? null : data.id);
                                                    }}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full transition-colors duration-150"
                                                >
                                                    <svg 
                                                        xmlns="http://www.w3.org/2000/svg" 
                                                        className="h-5 w-5 text-gray-500" 
                                                        viewBox="0 0 20 20" 
                                                        fill="currentColor"
                                                    >
                                                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                                    </svg>
                                                </button>

                                                {openDropdownId === data.id && (
                                                    <div 
                                                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 py-1"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <button 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleOpenDetails(data);
                                                            }}
                                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                                                        >
                                                            Details
                                                        </button>
                                                        <button 
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            window.open(`https://javavolcano-touroperator.com/backoffice/invoice/view-invoice/${data.id}`, '_blank');
                                                            if(data.total_add_on && data.total_add_on != 0) {
                                                            window.open(`https://javavolcano-touroperator.com/backoffice/invoice/view-invoice/${data.id}?addon=true`, '_blank');
                                                            }
                                                        }}

                                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150"
                                                        >
                                                            View Invoice
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    }
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                </div>

                {/* Pagination */}
                {booking.links && booking.links.length > 3 && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-500">
                            Showing {booking.from} to {booking.to} of {booking.total} results
                        </div>
                        <div className="flex gap-2">
                            {booking.links.map((link, i) => {
                                if ((!link.url && (i === 0 || i === booking.links.length - 1))) {
                                    return null;
                                }

                                return (
                                    <button
                                        key={i}
                                        onClick={() => link.url && handlePageChange(link.url)}
                                        disabled={!link.url}
                                        className={`px-3 py-1 rounded border ${
                                            link.active 
                                                ? 'bg-blue-600 text-white' 
                                                : 'bg-white hover:bg-gray-50'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}
                <PaymentHistory 
                    isOpen={showDetailsDialog}
                    onClose={() => {
                        setShowDetailsDialog(false);
                        setSelectedBooking(null);
                    }}
                    selectedBooking={selectedBooking}  // <- Nama prop sudah sesuai
                />                                
            </div>
        </Authenticated>
    );

}
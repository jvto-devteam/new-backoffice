import React, { useState, useRef, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import Authenticated from '@/Layouts/Main';
import { format } from 'date-fns';
import { 
    Filter, X, Search, ChevronsUpDown, Check, Download,
    DollarSign, FileText, ClipboardCheck, ClipboardList
} from 'lucide-react';
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
import * as XLSX from 'xlsx';

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
    }, [setOpen, open]);

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
                        {/* Reset option */}
                        {value && (
                            <div
                                onClick={() => {
                                    onChange(null);
                                    setOpen(false);
                                    setSearchQuery('');
                                }}
                                className="px-3 py-2 cursor-pointer flex items-center hover:bg-gray-50 border-b text-gray-500"
                            >
                                <X className="h-4 w-4 mr-2 text-gray-400" />
                                <span>Clear selection</span>
                            </div>
                        )}
                        
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
const FilterDropdown = ({ isOpen, onClose, filters, onChange, sources, paymentMethods, onSubmit }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border p-4 z-50">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium dark:text-black">Filters</h3>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
            
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium dark:text-black">Search</label>
                    <Input
                        type="text"
                        placeholder="Search customers..."
                        value={filters.search}
                        onChange={(e) => onChange('search', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium dark:text-black">Payment Date Range</label>
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
                    <label className="text-sm font-medium dark:text-black">Source</label>
                    <SearchableSelect 
                        options={sources.map(source => ({
                            id: source, 
                            name: source
                        }))}
                        value={filters.selectedSource}
                        onChange={(value) => onChange('selectedSource', value)}
                        placeholder="Select Source"
                        open={filters.sourceOpen}
                        setOpen={(value) => onChange('sourceOpen', value)}
                        displayKey="name"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium dark:text-black">Payment Method</label>
                    <SearchableSelect 
                        options={paymentMethods.map(method => ({
                            id: method.id, 
                            name: method.name
                        }))}
                        value={filters.selectedPaymentMethod}
                        onChange={(value) => onChange('selectedPaymentMethod', value)}
                        placeholder="Select Payment Method"
                        open={filters.paymentMethodOpen}
                        setOpen={(value) => onChange('paymentMethodOpen', value)}
                        displayKey="name"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium dark:text-black">Payment Status</label>
                    <SearchableSelect 
                        options={[
                            { id: 'PAID', name: 'PAID' },
                            { id: 'UNPAID', name: 'UNPAID' }
                        ]}
                        value={filters.selectedStatus}
                        onChange={(value) => onChange('selectedStatus', value)}
                        placeholder="Select Status"
                        open={filters.statusOpen}
                        setOpen={(value) => onChange('statusOpen', value)}
                        displayKey="name"
                    />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            onChange('search', '');
                            onChange('startDate', '');
                            onChange('endDate', '');
                            onChange('selectedSource', null);
                            onChange('selectedPaymentMethod', null);
                            onChange('selectedStatus', null);
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
        unpaid: 'bg-red-100 text-red-600',
        default: 'bg-blue-100 text-blue-600'
    };
    const iconColors = {
        paid: 'text-green-600',
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

export default function ReceivableIncome({ payments, summary, filters, paymentMethod }) {
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount);
    };
    const handleExportCSV = () => {
        // Format the data for Excel export
        const excelData = payments.map(payment => ({
            'Source': payment.source,
            'Invoice No': payment.booking_code,
            'Customer': payment.customer,
            'Payment Date': payment.date,
            'Payment Method': payment.payment_method,
            'Amount (IDR)': payment.nominal,
            'Status': payment.status
        }));
    
        // Create a worksheet
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        
        // Set column widths
        const columns = [
            { wch: 10 },  // Source
            { wch: 15 },  // Invoice No
            { wch: 25 },  // Customer
            { wch: 15 },  // Payment Date
            { wch: 20 },  // Payment Method
            { wch: 15 },  // Amount
            { wch: 10 },  // Status
        ];
        worksheet['!cols'] = columns;
    
        // Create a workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Receivable Income');
        
        // Generate Excel file
        const today = new Date();
        const formattedDate = format(today, 'yyyy-MM-dd');
        const fileName = `receivable-income-${formattedDate}.xlsx`;
        
        // Export to file
        XLSX.writeFile(workbook, fileName);
    };
    
    
    const [filterState, setFilterState] = useState({
        search: filters?.search || '',
        startDate: filters?.start_date || '',
        endDate: filters?.end_date || '',
        selectedSource: filters?.source || '',
        selectedPaymentMethod: filters?.payment_method || '',
        selectedStatus: filters?.status || '',
        sourceOpen: false,
        paymentMethodOpen: false,
        statusOpen: false
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
            '/finance/receivable-income',
            { 
                search: filterState.search,
                start_date: filterState.startDate,
                end_date: filterState.endDate,
                source: filterState.selectedSource,
                payment_method: filterState.selectedPaymentMethod,
                status: filterState.selectedStatus
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
        setIsFilterOpen(false);
    };

    // Calculate summary totals
    const totalPaid = payments
        .filter(payment => payment.status === 'PAID')
        .reduce((sum, payment) => sum + payment.nominal, 0);
    
    const totalUnpaid = payments
        .filter(payment => payment.status === 'UNPAID')
        .reduce((sum, payment) => sum + payment.nominal, 0);

    return (
        <Authenticated>
            <Head title="Receivable Income" />
            
            <div className="p-6 space-y-6 bg-white rounded-xl dark:bg-[#24303f]">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Receivable Income</h1>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleExportCSV}
                            variant="outline"
                            className="gap-2 dark:text-white"
                        >
                            <Download className="h-4 w-4" />
                            Export Excel
                        </Button>
                        <div className="relative" ref={filterRef}>
                            <Button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                variant="outline"
                                className="gap-2 dark:text-white"
                            >
                                <Filter className="h-4 w-4" />
                                Filters
                            </Button>

                            <FilterDropdown 
                                isOpen={isFilterOpen}
                                onClose={() => setIsFilterOpen(false)}
                                filters={filterState}
                                sources={['JVTO','KLOOK','TWT']}
                                paymentMethods={paymentMethod}
                                onChange={handleFilterChange}
                                onSubmit={handleFilterSubmit}
                            />
                        </div>
                    </div>                    
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SummaryCard
                        icon={ClipboardCheck}
                        value={formatCurrency(totalPaid)}
                        subtitle="Total Paid"
                        type="paid"
                    />
                    <SummaryCard
                        icon={ClipboardList}
                        value={formatCurrency(totalUnpaid)}
                        subtitle="Total Unpaid"
                        type="unpaid"
                    />
                    <SummaryCard
                        icon={FileText}
                        value={payments.length}
                        subtitle="Total Transactions"
                    />
                </div>

                {/* Responsive Table */}
                <div className="rounded-md border bg-white dark:bg-[#24303f]">
                    <Table>
                        <TableHeader className="bg-gray-100 dark:bg-[#1a222c]">
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Source</TableHead>
                                <TableHead>Invoice No</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Payment Date</TableHead>
                                <TableHead>Payment Method</TableHead>
                                <TableHead>Amount (IDR)</TableHead>
                                <TableHead>Payment Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.map((payment,index) => (
                                <TableRow key={payment.id}>
                                    <TableCell>{index+1}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            payment.source === 'JVTO' ? 'bg-blue-100 text-blue-800' : 
                                            payment.source === 'KLOOK' ? 'bg-green-100 text-green-800' :
                                            'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {payment.source}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-medium">{payment.booking_code}</TableCell>
                                    <TableCell>{payment.customer}</TableCell>
                                    <TableCell>{payment.date}</TableCell>
                                    <TableCell>{payment.payment_method}</TableCell>
                                    <TableCell className="font-medium">{formatCurrency(payment.nominal)}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            payment.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {payment.status}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination can be added here if needed */}
            </div>
        </Authenticated>
    );
}
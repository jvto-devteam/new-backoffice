import React, { useState, useRef, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import Authenticated from '@/Layouts/Main';
import { format } from 'date-fns';
import { 
    Filter, X, Search, ChevronsUpDown, Check, Download,
    DollarSign, FileText, ClipboardCheck, ClipboardList,
    TrendingUp, ArrowUpRight, ArrowDownRight, Calendar
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

// Enhanced SearchableSelect with animations
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
                className="w-full px-3 py-2 bg-gray-50 border border-input rounded-md text-left focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-all duration-200 flex justify-between items-center hover:bg-gray-100"
            >
                <span className="truncate text-gray-700">
                    {value ? options.find(item => item.id.toString() === value.toString())?.[displayKey] : placeholder}
                </span>
                <ChevronsUpDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border animate-in fade-in-0 zoom-in-95 duration-100">
                    <div className="sticky top-0 bg-white border-b px-3 py-2 rounded-t-md">
                        <div className="flex items-center">
                            <Search className="h-4 w-4 text-gray-400 mr-2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent border-none focus:outline-none"
                                placeholder="Search..."
                                onClick={(e) => e.stopPropagation()}
                                autoFocus
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
                                className="px-3 py-2 cursor-pointer flex items-center hover:bg-gray-50 border-b text-gray-500 transition-colors duration-150"
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
                                    className={`px-3 py-2 cursor-pointer flex items-center hover:bg-blue-50 transition-colors duration-150 ${
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

// Enhanced Filter Dropdown with better styling
const FilterDropdown = ({ isOpen, onClose, filters, onChange, sources, paymentMethods, onSubmit }) => {
    if (!isOpen) return null;

    return (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border p-5 z-50 animate-in slide-in-from-top-5 duration-200">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                    <Filter className="h-5 w-5 text-blue-500 mr-2" />
                    Filters
                </h3>
                <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-gray-100 rounded-full">
                    <X className="h-4 w-4" />
                </Button>
            </div>
            
            <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                        <Search className="h-4 w-4 mr-1 text-gray-500" />
                        Search
                    </label>
                    <Input
                        type="text"
                        placeholder="Search customers..."
                        value={filters.search}
                        onChange={(e) => onChange('search', e.target.value)}
                        className="focus:ring-2 focus:ring-blue-300 transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                        Payment Date Range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <Input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => onChange('startDate', e.target.value)}
                            className="w-full focus:ring-2 focus:ring-blue-300"
                        />
                        <Input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => onChange('endDate', e.target.value)}
                            className="w-full focus:ring-2 focus:ring-blue-300"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Source</label>
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
                    <label className="text-sm font-medium text-gray-700">Payment Method</label>
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
                    <label className="text-sm font-medium text-gray-700">Payment Status</label>
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

                <div className="flex justify-end gap-2 pt-3 border-t mt-3">
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
                        className="hover:bg-gray-100 transition-colors"
                    >
                        Reset
                    </Button>
                    <Button 
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                        Apply Filters
                    </Button>
                </div>
            </form>
        </div>
    );
};

// Enhanced Summary Card with animations and gradients
const SummaryCard = ({ icon: Icon, title, value, subtitle, type }) => {
    const cardStyles = {
        paid: {
            bg: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20',
            iconBg: 'bg-green-500/10',
            iconColor: 'text-green-600 dark:text-green-400',
            border: 'border-green-200 dark:border-green-800/30',
            badge: 'bg-green-100 text-green-600 dark:bg-green-800/40 dark:text-green-400'
        },
        unpaid: {
            bg: 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20',
            iconBg: 'bg-red-500/10',
            iconColor: 'text-red-600 dark:text-red-400',
            border: 'border-red-200 dark:border-red-800/30',
            badge: 'bg-red-100 text-red-600 dark:bg-red-800/40 dark:text-red-400'
        },
        default: {
            bg: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20',
            iconBg: 'bg-blue-500/10',
            iconColor: 'text-blue-600 dark:text-blue-400',
            border: 'border-blue-200 dark:border-blue-800/30',
            badge: 'bg-blue-100 text-blue-600 dark:bg-blue-800/40 dark:text-blue-400'
        }
    };

    const style = cardStyles[type] || cardStyles.default;

    return (
        <div className={`p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-300 ${style.bg} ${style.border}`}>
            <div className="flex items-center justify-between">
                <div className={`p-3 rounded-full ${style.iconBg}`}>
                    <Icon className={`w-6 h-6 ${style.iconColor}`} />
                </div>
                <div className={`${style.badge} py-1 px-3 rounded-full text-xs font-medium`}>
                    {subtitle}
                </div>
            </div>
            <p className="text-2xl font-bold mt-4 dark:text-white">{value}</p>
            <div className="flex items-center mt-2">
                {type === 'paid' && <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />}
                {type === 'unpaid' && <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />}
                {type !== 'paid' && type !== 'unpaid' && <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />}
                <p className="text-xs text-gray-500 dark:text-gray-400">{title || 'Updated recently'}</p>
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
    
    const handleExportSQL = () => {
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

    // Get source distribution for visualization
    const sourceDistribution = payments.reduce((acc, payment) => {
        acc[payment.source] = (acc[payment.source] || 0) + 1;
        return acc;
    }, {});

    // Badge color variants
    const getBadgeColor = (source) => {
        switch(source) {
            case 'JVTO': return 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300';
            case 'KLOOK': return 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300';
            case 'TWT': return 'bg-amber-100 text-amber-800 dark:bg-amber-800/30 dark:text-amber-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300';
        }
    };

    return (
        <Authenticated>
            <Head title="Receivable Income" />
            
            <div className="p-6 space-y-6 bg-white dark:bg-gray-900 rounded-xl shadow-sm">
                {/* Header with improved styling */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 pb-4 border-b dark:border-gray-800">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Receivable Income</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and track all receivable transactions</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleExportSQL}
                            variant="outline"
                            className="gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors dark:text-white"
                        >
                            <Download className="h-4 w-4" />
                            Export Excel
                        </Button>
                        <div className="relative" ref={filterRef}>
                            <Button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                variant={isFilterOpen ? "default" : "outline"}
                                className={`gap-2 transition-colors ${
                                    isFilterOpen ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                                }`}
                            >
                                <Filter className="h-4 w-4" />
                                Filters
                                {(filterState.search || filterState.startDate || filterState.endDate || 
                                  filterState.selectedSource || filterState.selectedPaymentMethod || 
                                  filterState.selectedStatus) && 
                                    <span className="flex h-2 w-2 rounded-full bg-blue-500 absolute -top-0.5 -right-0.5"></span>
                                }
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

                {/* Summary Cards with improved layout */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SummaryCard
                        icon={ClipboardCheck}
                        value={formatCurrency(totalPaid)}
                        subtitle="Total Paid"
                        type="paid"
                        title="Successfully collected"
                    />
                    <SummaryCard
                        icon={ClipboardList}
                        value={formatCurrency(totalUnpaid)}
                        subtitle="Total Unpaid"
                        type="unpaid"
                        title="Pending collection"
                    />
                    <SummaryCard
                        icon={FileText}
                        value={payments.length}
                        subtitle="Total Transactions"
                        type="default"
                        title="All time transactions"
                    />
                </div>

                {/* Enhanced Table */}
                <div className="rounded-lg border overflow-hidden shadow-sm bg-white dark:bg-gray-900 dark:border-gray-800">
                    <Table>
                        <TableHeader className="bg-gray-50 dark:bg-gray-800/50">
                            <TableRow className="hover:bg-gray-50 dark:hover:bg-gray-800/70">
                                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">#</TableHead>
                                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Source</TableHead>
                                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Invoice No</TableHead>
                                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Customer</TableHead>
                                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Payment Date</TableHead>
                                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Payment Method</TableHead>
                                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Amount (IDR)</TableHead>
                                <TableHead className="font-semibold text-gray-600 dark:text-gray-300">Payment Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.length > 0 ? (
                                payments.map((payment, index) => (
                                    <TableRow 
                                        key={payment.id} 
                                        className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-150 cursor-pointer"
                                    >
                                        <TableCell className="font-medium">{index+1}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(payment.source)}`}>
                                                {payment.source}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-medium text-blue-600 dark:text-blue-400">{payment.booking_code}</TableCell>
                                        <TableCell>{payment.customer}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <Calendar className="h-3.5 w-3.5 text-gray-400 mr-1.5" />
                                                {payment.date}
                                            </div>
                                        </TableCell>
                                        <TableCell>{payment.payment_method}</TableCell>
                                        <TableCell className="font-medium">{formatCurrency(payment.nominal)}</TableCell>
                                        <TableCell>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                payment.status === 'PAID' 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300' 
                                                    : 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300'
                                            }`}>
                                                {payment.status === 'PAID' && <Check className="h-3 w-3 mr-1" />}
                                                {payment.status === 'UNPAID' && <X className="h-3 w-3 mr-1" />}
                                                {payment.status}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                                        No transactions found. Try adjusting your filters.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Footer area for additional stats or info */}
                <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
                    Showing {payments.length} transactions
                    {filterState.search || filterState.startDate || filterState.endDate || 
                        filterState.selectedSource || filterState.selectedPaymentMethod || 
                        filterState.selectedStatus ? ' with applied filters' : ''}
                </div>
            </div>
        </Authenticated>
    );
}
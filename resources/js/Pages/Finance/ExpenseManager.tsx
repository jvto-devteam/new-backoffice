import React, { useState, useRef, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import { Head, router } from '@inertiajs/react';
import Authenticated from '@/Layouts/Main';
import { 
    Calendar, 
    Phone, 
    Mail, 
    Users, 
    Package, 
    MoreVertical,
    Clock, FileText, DollarSign, Handshake,BookUser,Filter, X, Search, ChevronsUpDown, Check, Pencil
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
                        placeholder="Search clients..."
                        value={filters.search}
                        onChange={(e) => onChange('search', e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium dark:text-black">Date Range</label>
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
                    <label className="text-sm font-medium dark:text-black">Package</label>
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

                <div className="space-y-2">
                    <label className="text-sm font-medium dark:text-black">Order Channel</label>
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
                </div>

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
        debt: 'bg-orange-100 text-orange-600',
        default: 'bg-blue-100 text-blue-600'
    };
    const iconColors = {
        paid: 'text-green-600',
        dp: 'text-yellow-600',
        unpaid: 'text-red-600',
        debt: 'text-orange-600',
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
export default function ExpenseManager({booking,summary,packages,filters}){
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0            
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
    const handlePageChange = (url) => {
        router.get(url, {
            search: filterState.search,
            start_date: filterState.startDate,
            end_date: filterState.endDate,
            package: filterState.selectedPackage,
            channel: filterState.selectedChannel,
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    
    
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
            '/finance/expense-manager',
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

    return (
        <Authenticated>
            <Head title="Expense Manager" />
            
            <div className="p-6 space-y-6 bg-white rounded-xl dark:bg-[#24303f]">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expense Manager</h1>
                    <div className="relative" ref={filterRef}>
                        <Button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            variant="outline"
                            className="gap-2 dark:text-black"
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
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
                    <SummaryCard
                        icon={BookUser}
                        value={`${summary.bookings}`}
                        subtitle="Total Bookings"
                    />
                    <SummaryCard
                        icon={FileText}
                        value={formatCurrency(summary.total_expense)}
                        subtitle="Total Expense"
                        />
                    <SummaryCard
                        icon={BookUser}
                        value={formatCurrency(summary.debt)}
                        subtitle="Total Hutang"
                        type="debt"
                    />
                </div>


                {/* Responsive Table */}
                <div className="rounded-md border bg-white dark:bg-[#24303f]">
                    <Table>
                    <TableHeader className="bg-gray-100 dark:bg-[#1a222c]">
                        <TableRow>
                        <TableHead className="w-48">Client</TableHead>
                            <TableHead className="w-48">Trip Details</TableHead>
                            <TableHead className="w-96">Package Info</TableHead>
                            <TableHead>Total Invoice</TableHead>
                            <TableHead>Total Expense</TableHead>
                            <TableHead>Profit</TableHead>
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
                                        <div className="text-sm text-gray-600 dark:text-gray-100">{data.package}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <span>{formatCurrency(data.total)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <span>{formatCurrency(data.expense)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <span>{formatCurrency(data.total-data.expense)}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="space-x-3 flex justify-between text-green-600">
                                            <span>Crew Expense:</span>
                                            <span>{formatCurrency(data.expense_paid)}</span>
                                        </div>
                                        <div className="space-x-3 flex justify-between  text-orange-600">
                                            <span>Hutang:</span>
                                            <span>{formatCurrency(data.expense_debt)}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableHead>
                                    <Link href={`/finance/expense-manager/${data.id}/edit`}>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </Link>
                                </TableHead>
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
            </div>
        </Authenticated>
    );

}
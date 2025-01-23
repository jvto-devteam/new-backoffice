import React, { useState, useRef, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import Authenticated from '@/Layouts/Main';
import { 
    Calendar, 
    Phone, 
    Mail, 
    Users, 
    Package, 
    Search, 
    MoreVertical,
    DollarSign,
    Shirt,
    FileText,
    Check, 
    ChevronsUpDown,
    ChevronDown,    
    Filter, 
    Download,   
    X,
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

// SearchableSelect Component
const SearchableSelect = ({
    options,
    value,
    onChange,
    placeholder,
    searchValue,
    onSearchChange,
    open,
    setOpen,
    displayKey
}) => {
    const selectRef = useRef(null);
    const searchInputRef = useRef(null);
    
    useEffect(() => {
        const handleClickOutside = (event) => {            
            
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setOpen(false);
                // onSearchChange('');
            }
        };
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [setOpen, onSearchChange]);

    const handleSearchChange = (e) => {
        e.preventDefault();
        onSearchChange(e.target.value);
        searchInputRef.current?.focus();
    };

    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="relative w-full" ref={selectRef}>
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full px-3 py-2 bg-gray-50 border border-input rounded-md text-left focus:outline-none focus:border-blue-500 transition-colors flex justify-between items-center"
            >
                <span className="truncate text-gray-700">
                    {value ? options.find(item => item.id === value)?.[displayKey] : placeholder}
                </span>
                <ChevronsUpDown className="h-4 w-4 text-gray-400" />
            </button>

            {open && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded shadow-lg border">
                    <div className="sticky top-0 bg-white border-b px-3 py-2">
                        <div className="flex items-center">
                            <Search className="h-4 w-4 text-gray-400 mr-2" />
                            <input
                                ref={searchInputRef}
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
const FilterDropdown = ({ isOpen, onClose, filters, onChange, countries, packages, onSubmit }) => {
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
                    <label className="text-sm font-medium">Country</label>
                    <SearchableSelect 
                        options={countries.map(country => ({
                            id: country.id, 
                            name: country.long_name
                        }))}
                        value={filters.selectedCountry}
                        onChange={(value) => onChange('selectedCountry', value)}
                        placeholder="Select Country"
                        open={filters.countryOpen}
                        setOpen={(value) => onChange('countryOpen', value)}
                        displayKey="name"
                    />
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

                <div className="space-y-2">
                    <label className="text-sm font-medium">Order Channel</label>
                    <SearchableSelect 
                        options={[
                            {
                                id : 'jvto',
                                name : 'JVTO',
                            },
                            {
                                id : 'klook',
                                name : 'KLOOK',
                            }
                        ].map(chn => ({
                            id: chn.id, 
                            name: `${chn.name}`
                        }))}
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
                            onChange('selectedCountry', null);
                            onChange('selectedPackage', null);
                            onChange('selectedChannel', null);
                        }}
                    >
                        Reset
                    </Button>
                    <Button type="submit">
                        Apply Filters
                    </Button>
                </div>
            </form>
        </div>
    );
};
// ProgressBar Component
const ProgressBar = ({ percentage, status }) => {
    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'paid': return 'bg-green-500';
            case 'partial': return 'bg-yellow-500';
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
            case 'partial':
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

// TShirtSizeGrid Component
const TShirtSizeGrid = ({ sizes }) => {
    const nonEmptySizes = Object.entries(sizes)
        .filter(([_, quantity]) => quantity > 0)
        .sort((a, b) => {
            const sizeOrder = ['xss', 'xs', 's', 'm', 'l', 'xl', 'xxl', 'xxxl'];
            return sizeOrder.indexOf(a[0]) - sizeOrder.indexOf(b[0]);
        });

    if (nonEmptySizes.length === 0) {
        return <p className="text-gray-500">No t-shirts allocated</p>;
    }

    return (
        <div className="grid grid-cols-4 gap-4">
            {nonEmptySizes.map(([size, quantity]) => (
                <div key={size} className="bg-white p-3 rounded-md border">
                    <p className="text-sm font-medium text-gray-900">{size.toUpperCase()}</p>
                    <p className="text-2xl font-semibold mt-1">{quantity}</p>
                </div>
            ))}
        </div>
    );
};

// DetailsModal Component
const DetailsModal = ({ isOpen, onClose, client }) => {
    if (!isOpen) return null;

    const tshirtSizes = {
        xss: client.xss || 0,
        xs: client.xs || 0,
        s: client.s || 0,
        m: client.m || 0,
        l: client.l || 0,
        xl: client.xl || 0,
        xxl: client.xxl || 0,
        xxxl: client.xxxl || 0
    };

    const totalShirts = Object.values(tshirtSizes).reduce((sum, qty) => sum + qty, 0);

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === '-') return '-';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Client Details</h3>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Payment Information</h4>
                        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                            <div>
                                <p className="text-sm text-gray-600">Grand Total</p>
                                <p className="font-medium">{formatCurrency(client.grand_total)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Amount Paid</p>
                                <p className="font-medium">{formatCurrency(client.payment)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Balance</p>
                                <p className="font-medium">{formatCurrency(client.balance)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <PaymentStatusBadge status={client.payment_status} />
                            </div>
                        </div>
                        <div className="w-full">
                            <ProgressBar 
                                percentage={Math.round((client.payment / client.grand_total) * 100)} 
                                status={client.payment_status}
                            />
                        </div>
                    </div>

                    {client.add_on && client.add_on.length > 0 && (
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
                                        {client.add_on.map((addon, index) => (
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
                                                {formatCurrency(client.add_on.reduce((total, addon) => 
                                                    total + (addon.qty * addon.add_on.price), 0
                                                ))}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            <p className="text-xs text-gray-500 italic">*Total additional services are included in the grand total above</p>
                        </div>
                    )}                    

                    {totalShirts > 0 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="font-medium text-gray-900">T-Shirt Allocation</h4>
                                <span className="text-sm text-gray-600">
                                    Total: {totalShirts} {totalShirts === 1 ? 'shirt' : 'shirts'}
                                </span>
                            </div>
                            <TShirtSizeGrid sizes={tshirtSizes} />
                        </div>
                    )}

                    <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Special Requirements</h4>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-4 h-4 text-gray-500" />
                                <p className="text-sm text-gray-600">Notes & Requirements</p>
                            </div>
                            <p className="font-medium">{client.special_requirements || 'None specified'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Component
export default function Index({ clients, filters, countries, packages }) {
    const [search, setSearch] = useState(filters.search || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [selectedCountry, setSelectedCountry] = useState(filters.country || null);
    const [selectedPackage, setSelectedPackage] = useState(filters.package || null);
    const [selectedChannel, setSelectedChannel] = useState(filters.channel || null);
    const [selectedClient, setSelectedClient] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [countryOpen, setCountryOpen] = useState(false);
    const [packageOpen, setPackageOpen] = useState(false);
    const [channelOpen, setChannelOpen] = useState(false);

    const [filterState, setFilterState] = useState({
        search: filters.search || '',
        startDate: filters.start_date || '',
        endDate: filters.end_date || '',
        selectedCountry: filters.country || null,
        selectedPackage: filters.package || null,
        selectedChannel: filters.channel || null,
        countryOpen: false,
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
    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            '/client-management',
            { 
                search: search,
                start_date: startDate,
                end_date: endDate,
                country: selectedCountry,
                package: selectedPackage,
                channel: selectedChannel,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };
    const handleFilterSubmit = (e) => {
        e.preventDefault();
        router.get(
            '/client-management',
            { 
                search: filterState.search,
                start_date: filterState.startDate,
                end_date: filterState.endDate,
                country: filterState.selectedCountry,
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

    const handlePageChange = (url) => {
        router.get(url, {
            search: search,
            start_date: startDate,
            end_date: endDate,
            country: selectedCountry,
            package: selectedPackage,
            channel: selectedChannel,
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const formatDate = (dateStr) => {
        if (!dateStr || dateStr === '-') return '-';
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount);
    };

    const openDetailsModal = (client) => {
        setSelectedClient(client);
        setIsModalOpen(true);
    };

    const handleExport = () => {
        const params = new URLSearchParams({
            ...filterState,
            export: true
        });
        window.location.href = `/client-management?${params.toString()}`;
    };    

    return (
        <Authenticated>
            <Head title="Client Management" />
            
            <div className="p-6 space-y-6 bg-white rounded-xl dark:bg-[#24303f]">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Client Management</h1>
                    <div className="flex gap-2">
                        <Button
                            onClick={handleExport}
                            variant="outline"
                            className="gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Export Excel
                        </Button>
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
                                countries={countries}
                                packages={packages}
                                onSubmit={handleFilterSubmit}
                            />
                        </div>
                    </div>
                </div>

                {/* Responsive Table */}
                <div className="rounded-md border bg-white dark:bg-[#24303f]">
                    <Table>
                        <TableHeader className="bg-gray-100 dark:bg-[#1a222c]">
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Country</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Package</TableHead>
                                <TableHead>Trip Details</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {clients.data.map((client) => (
                                <TableRow key={client.id}>
                                    <TableCell className="font-medium">
                                        <div className="font-bold">
                                            {client.name}
                                        </div>
                                        <div className="mt-1 flex gap-1">
                                            <Users className="w-4 h-4" />
                                            {client.numb_of_pax} pax
                                        </div>
                                        <div className="mt-2">
                                            {
                                                client.channel == 'KLOOK' ? (
                                                    <span className="bg-orange-200 text-orange-600 rounded-full text-xs font-bold px-2 py-1">KLOOK</span>
                                                ) : (
                                                    <span className="bg-blue-200 text-blue-600 rounded-full text-xs font-bold px-2 py-1">JVTO</span>
                                                )
                                            }
                                        </div>
                                    </TableCell>
                                    <TableCell>{client.country}</TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4" />
                                                {client.email}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                {client.phone}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Package className="w-4 h-4" />
                                                <span className="font-bold">{client.package_code}</span>
                                            </div>
                                            {client.package}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                Booking ID : {client.id}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(client.trip_date)}
                                            </div>
                                        </div>
                                        {client.trip_media !== '-' && (
                                            <div className="mt-2">
                                                <a 
                                                    href={client.trip_media}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    View Trip Media
                                                </a>
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openDetailsModal(client)}
                                        >
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {clients.links && clients.links.length > 3 && (
                    <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-500">
                            Showing {clients.from} to {clients.to} of {clients.total} results
                        </div>
                        <div className="flex gap-2">
                            {clients.links.map((link, i) => {
                                if ((!link.url && (i === 0 || i === clients.links.length - 1))) {
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

                {/* Details Modal */}
                {selectedClient && (
                    <DetailsModal 
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        client={selectedClient}
                    />
                )}
            </div>
        </Authenticated>
    );
}
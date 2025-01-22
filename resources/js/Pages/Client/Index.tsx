import React, { useState } from 'react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";


// Progress Bar Component
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

// Payment Status Badge Component
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
const TShirtSizeGrid = ({ sizes }) => {
    // Filter out sizes with quantity 0 or undefined
    const nonEmptySizes = Object.entries(sizes)
        .filter(([_, quantity]) => quantity > 0)
        .sort((a, b) => {
            // Define size order for sorting
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
// Details Modal Component
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
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Client Details</h3>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Modal Content */}
                <div className="space-y-6">
                    {/* Payment Details Section */}
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

                    {/* T-Shirt Section */}
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

                    {/* Special Requirements Section */}
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
    );};

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

export default function ClientIndex({ clients, filters, countries }) {
    const [search, setSearch] = useState(filters.search || '');
    const [selectedClient, setSelectedClient] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            '/client-management',
            { search: search },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handlePageChange = (url) => {
        router.get(url, {
            search: search
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const openDetailsModal = (client) => {
        setSelectedClient(client);
        setIsModalOpen(true);
    };

    return (
        <Authenticated>
            <Head title="Client Management" />
            
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Client Management</h1>
                    
                    <form onSubmit={handleSearch} className="flex w-full max-w-sm gap-2">
                        <Input
                            type="text"
                            placeholder="Search clients..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full"
                        />
                    </form>
                </div>

                {/* Responsive Table */}
                <div className="rounded-md border bg-white dark:bg-[#24303f]">
                    <Table>
                        <TableHeader>
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
                                        {/* <div className="text-blue-600">
                                            {client.user_id}
                                        </div> */}
                                        <div className="font-bold">
                                            {client.name}
                                        </div>
                                        <div className="mt-2 flex gap-1">
                                            <Users className="w-4 h-4" />
                                            {client.numb_of_pax} pax
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
                                                {formatDate(client.trip_date)}
                                            </div>
                                            {client.trip_media !== '-' && (
                                                <a 
                                                    href={client.trip_media}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    View Trip Media
                                                </a>
                                            )}
                                        </div>
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
import React, { useState, useRef, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import Authenticated from '@/Layouts/Main';
import { 
    Calendar, 
    Phone, 
    Mail, 
    Users, 
    Package, 
    MoreVertical,
    Clock, FileText, DollarSign, Handshake,BookUser
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
export default function InvoiceManager({booking,summary}){
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount);
    };

    return (
        <Authenticated>
            <Head title="Invoice Manager" />
            
            <div className="p-6 space-y-6 bg-white rounded-xl dark:bg-[#24303f]">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice Manager</h1>
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
                            <TableHead>Booking Details</TableHead>
                            <TableHead>Package Info</TableHead>
                            <TableHead>Financial Summary</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {booking.data.map((data) => (
                            <TableRow key={data.id}>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="text-blue-600 font-bold">
                                            Booking ID: {data.id}
                                        </div>
                                        <div className="font-semibold">{data.name}</div>
                                        <div className="flex items-center gap-1 text-gray-600">
                                            <Users className="w-4 h-4" />
                                            <span>{data.numb_of_pax} pax</span>
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
                                        <div className="font-medium">
                                            {formatCurrency(data.total_per_pax)} per pax
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="space-y-1">
                                        <div className="flex justify-between">
                                            <span>Total:</span>
                                            <span>{formatCurrency(data.total)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Add On:</span>
                                            <span>{formatCurrency(data.total_add_on)}</span>
                                        </div>
                                        <div className="font-bold flex justify-between">
                                            <span>Grand Total:</span>
                                            <span>{formatCurrency(data.grand_total)}</span>
                                        </div>
                                        <div className="text-red-600 flex justify-between font-bold">
                                            <span>Balance:</span>
                                            <span>{formatCurrency(data.balance)}</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableHead>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
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
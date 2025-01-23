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

export default function InvoiceManager({booking}){
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'IDR'
        }).format(amount);
    };

    return (
        <Authenticated>
            <Head title="Invoice Manager" />
            
            <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Invoice Manager</h1>
                </div>

                {/* Responsive Table */}
                <div className="rounded-md border bg-white dark:bg-[#24303f]">
                <Table>
                    <TableHeader>
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
                                    <div className="space-y-2">
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
                                    <div className="space-y-2">
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
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span>Total:</span>
                                            <span>{formatCurrency(data.total)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Add On:</span>
                                            <span>{formatCurrency(data.total_add_on)}</span>
                                        </div>
                                        <div className="text-blue-600 font-bold flex justify-between">
                                            <span>Grand Total:</span>
                                            <span>{formatCurrency(data.grand_total)}</span>
                                        </div>
                                        <div className="text-orange-600 flex justify-between font-bold">
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
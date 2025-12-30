import React from "react";
import { Head, router } from "@inertiajs/react";
import Authenticated from "@/Layouts/Main";
import { FileText, CheckCircle } from "lucide-react";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";

export default function PendingBooking({ data }) {
    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const handleApprove = async (bookingId) => {
        if (!confirm("Approve this booking?")) return;

        try {
            const response = await fetch(
                "http://legacy.javavolcano-touroperator.com/third-party/xendit/webhook/invoice/success",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        external_id: bookingId,
                        payment_method: 1,
                    }),
                },
            );

            if (!response.ok) {
                throw new Error("Failed to approve booking");
            }

            alert("Booking approved successfully");

            // Optional: reload page / refresh data
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Error approving booking");
        }
    };

    return (
        <Authenticated>
            <Head title="Pending Booking" />

            <div className="p-6 bg-white rounded-xl dark:bg-[#24303f] space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                        Pending Booking (Pay Later)
                    </h1>
                    <span className="text-sm text-gray-500">
                        {data.length} booking(s)
                    </span>
                </div>

                {/* Table */}
                <div className="rounded-md border overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-100 dark:bg-[#1a222c]">
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Package</TableHead>
                                <TableHead>Travel Date</TableHead>
                                <TableHead className="text-center">
                                    Pax
                                </TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead className="w-[160px] text-right">
                                    Action
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {data.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center text-gray-500 py-6"
                                    >
                                        No pending bookings
                                    </TableCell>
                                </TableRow>
                            )}

                            {data.map((booking) => (
                                <TableRow key={booking.id}>
                                    {/* Customer */}
                                    <TableCell>
                                        <div className="font-semibold text-gray-900">
                                            {booking.customer.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {booking.customer.email}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {booking.customer.phone}
                                        </div>
                                    </TableCell>

                                    {/* Package */}
                                    <TableCell>
                                        {booking.package_url ? (
                                            <a
                                                href={booking.package_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline text-sm font-medium"
                                            >
                                                {booking.package_name}
                                            </a>
                                        ) : (
                                            <span className="text-sm">
                                                {booking.package_name}
                                            </span>
                                        )}
                                    </TableCell>

                                    {/* Travel Date */}
                                    <TableCell className="text-sm">
                                        {formatDate(booking.travel_date_start)}{" "}
                                        – {formatDate(booking.travel_date_end)}
                                    </TableCell>

                                    {/* Pax */}
                                    <TableCell className="text-center">
                                        {booking.total_pax}
                                    </TableCell>

                                    {/* Payment Proof */}
                                    <TableCell>
                                        {booking.payment_proof ? (
                                            <a
                                                href={booking.payment_proof}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                            >
                                                <FileText className="w-4 h-4" />
                                                View proof
                                            </a>
                                        ) : (
                                            <span className="text-xs text-gray-400">
                                                Not uploaded
                                            </span>
                                        )}
                                    </TableCell>

                                    {/* Action */}
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            className="gap-2"
                                            onClick={() =>
                                                handleApprove(booking.id)
                                            }
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Approve
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </Authenticated>
    );
}

import React, { useState } from "react";
import { router } from "@inertiajs/react";
import Authenticated from "@/Layouts/Main";
import { ArrowLeft } from "lucide-react";

interface Transfer {
    id: number;
    transfer_date: string;
    transfer_time: string;
    amount: number;
    fee: number | null;
    to_account: string;
    to_bank: string | null;
    reference_no: string;
    remark: string;
    booking_code_matched: string;
    booking: { id: number; booking_code: string; invoice_code_origin: string | null } | null;
}

interface Paginated {
    data: Transfer[];
    current_page: number;
    last_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}

const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(amount);

export default function BcaTransfers({
    transfers,
    totalAmount,
    filters = {},
}: {
    transfers: Paginated;
    totalAmount: number;
    filters: { date_from?: string; date_to?: string };
}) {
    const [localFilters, setLocalFilters] = useState({
        date_from: filters.date_from ?? "",
        date_to: filters.date_to ?? "",
    });

    const applyFilters = () => {
        router.get(
            "/finance/bca-transfers",
            {
                date_from: localFilters.date_from || undefined,
                date_to: localFilters.date_to || undefined,
            },
            { preserveState: true }
        );
    };

    const resetFilters = () => {
        setLocalFilters({ date_from: "", date_to: "" });
        router.get("/finance/bca-transfers", {}, { preserveState: true });
    };

    return (
        <Authenticated>
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => router.visit("/finance/expense-manager")}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-xl font-bold text-gray-900">BCA Crew Transfer Log</h1>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-end gap-3 mb-5">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">From</label>
                        <input
                            type="date"
                            value={localFilters.date_from}
                            onChange={(e) =>
                                setLocalFilters((f) => ({ ...f, date_from: e.target.value }))
                            }
                            className="border rounded px-3 py-1.5 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">To</label>
                        <input
                            type="date"
                            value={localFilters.date_to}
                            onChange={(e) =>
                                setLocalFilters((f) => ({ ...f, date_to: e.target.value }))
                            }
                            className="border rounded px-3 py-1.5 text-sm"
                        />
                    </div>
                    <button
                        onClick={applyFilters}
                        className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                        Filter
                    </button>
                    {(filters.date_from || filters.date_to) && (
                        <button
                            onClick={resetFilters}
                            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* Summary */}
                <div className="flex gap-4 mb-4">
                    <div className="bg-blue-50 border border-blue-200 rounded px-4 py-2 text-sm">
                        <span className="text-blue-600 font-medium">{transfers.total}</span>{" "}
                        <span className="text-blue-500">transfers</span>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded px-4 py-2 text-sm">
                        <span className="text-green-600 font-semibold font-mono">
                            {formatRupiah(totalAmount)}
                        </span>{" "}
                        <span className="text-green-500">total</span>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b text-gray-500 text-xs uppercase tracking-wide">
                                <th className="text-left py-3 px-4 font-medium">Date</th>
                                <th className="text-left py-3 px-4 font-medium">Booking</th>
                                <th className="text-left py-3 px-4 font-medium">Customer</th>
                                <th className="text-right py-3 px-4 font-medium">Amount</th>
                                <th className="text-left py-3 px-4 font-medium">Destination Bank</th>
                                <th className="text-left py-3 px-4 font-medium">Reference No</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transfers.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="text-center py-10 text-gray-400"
                                    >
                                        No transfers found.
                                    </td>
                                </tr>
                            )}
                            {transfers.data.map((t) => {
                                const customerName = t.remark.includes(" ")
                                    ? t.remark.substring(t.remark.indexOf(" ") + 1)
                                    : "—";
                                return (
                                    <tr
                                        key={t.id}
                                        className="border-b hover:bg-gray-50 last:border-0"
                                    >
                                        <td className="py-2.5 px-4 whitespace-nowrap text-gray-600">
                                            {t.transfer_date}
                                            <div className="text-xs text-gray-400">
                                                {t.transfer_time}
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-4">
                                            {t.booking ? (
                                                <a
                                                    href={`/finance/expense-manager/${t.booking.id}/edit`}
                                                    className="text-blue-600 hover:underline font-mono font-medium"
                                                >
                                                    {t.booking_code_matched}
                                                </a>
                                            ) : (
                                                <span className="font-mono text-gray-500">
                                                    {t.booking_code_matched}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-2.5 px-4 text-gray-700">
                                            {customerName}
                                        </td>
                                        <td className="py-2.5 px-4 text-right font-mono font-medium">
                                            {formatRupiah(t.amount)}
                                        </td>
                                        <td className="py-2.5 px-4 text-xs text-gray-500">
                                            {t.to_bank && (
                                                <div className="text-gray-700">{t.to_bank}</div>
                                            )}
                                            <div className="font-mono">{t.to_account}</div>
                                        </td>
                                        <td className="py-2.5 px-4 text-xs font-mono text-gray-400">
                                            {t.reference_no}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {transfers.last_page > 1 && (
                    <div className="flex flex-wrap gap-1 mt-4">
                        {transfers.links.map((link, i) => (
                            <button
                                key={i}
                                disabled={!link.url}
                                onClick={() =>
                                    link.url &&
                                    router.visit(link.url, { preserveState: true })
                                }
                                className={[
                                    "px-3 py-1 text-sm rounded border",
                                    link.active
                                        ? "bg-blue-600 text-white border-blue-600"
                                        : "border-gray-300 hover:bg-gray-50 text-gray-700",
                                    !link.url
                                        ? "opacity-40 cursor-not-allowed"
                                        : "cursor-pointer",
                                ].join(" ")}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Authenticated>
    );
}

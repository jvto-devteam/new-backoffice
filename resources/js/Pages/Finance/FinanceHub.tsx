import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Main from '@/Layouts/Main';
import { AlertTriangle, CheckCircle, DollarSign, TrendingDown } from 'lucide-react';
// TODO: Task 7 - import DebtPaymentModal from './components/DebtPaymentModal';

interface BookingRow {
    id: number;
    channel: string;
    booking_code: string;
    customer: string;
    package: string;
    travel_date_start: string;
    travel_date_end: string | null;
    total_pax: number;
    total_expense: number;
    total_debt: number;
    total_paid: number;
    days_overdue: number;
}

interface Summary {
    total_expense: number;
    total_debt: number;
    total_paid: number;
    outstanding: number;
}

interface Props {
    bookings: BookingRow[];
    summary: Summary;
    filters: { month: string; year: string; view: string; status: string };
    months: { value: string; label: string }[];
    years: number[];
}

const rp = (v: number) =>
    'Rp ' + new Intl.NumberFormat('id-ID').format(v);

const CHANNEL_COLORS: Record<string, string> = {
    TWT: 'bg-blue-100 text-blue-700',
    KLOOK: 'bg-orange-100 text-orange-700',
    JVTO: 'bg-indigo-100 text-indigo-700',
};

function AgingBadge({ days }: { days: number }) {
    if (!days || days <= 0) return null;
    const cls =
        days > 30
            ? 'bg-red-100 text-red-700'
            : days > 14
            ? 'bg-orange-100 text-orange-700'
            : 'bg-yellow-100 text-yellow-700';
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
            <AlertTriangle size={11} />
            {days}d overdue
        </span>
    );
}

export default function FinanceHub({ bookings, summary, filters, months, years }: Props) {
    const [f, setF] = useState(filters);
    const [payTarget, setPayTarget] = useState<BookingRow | null>(null);

    const applyFilter = (key: string, value: string) => {
        const next = { ...f, [key]: value };
        setF(next);
        router.get('/finance/hub', next, { preserveState: true, replace: true });
    };

    return (
        <Main>
            <Head title="Finance Hub" />
            <div className="p-6 space-y-5">

                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 text-white px-6 py-4 rounded-xl shadow">
                    <h1 className="text-2xl font-bold">Finance Hub</h1>
                    <p className="text-indigo-200 text-sm mt-0.5">
                        Unified expense &amp; vendor debt overview — satu tempat kelola semua hutang
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow px-6 py-4 flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Bulan</label>
                        <select
                            value={f.month}
                            onChange={e => applyFilter('month', e.target.value)}
                            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                        >
                            {months.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Tahun</label>
                        <select
                            value={f.year}
                            onChange={e => applyFilter('year', e.target.value)}
                            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                        >
                            {years.map(y => (
                                <option key={y} value={String(y)}>{y}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Status Hutang</label>
                        <select
                            value={f.status}
                            onChange={e => applyFilter('status', e.target.value)}
                            className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                        >
                            <option value="all">Semua</option>
                            <option value="has_debt">Ada Hutang</option>
                            <option value="fully_paid">Lunas</option>
                        </select>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        {
                            label: 'Total Expense',
                            value: summary.total_expense,
                            Icon: DollarSign,
                            border: 'border-blue-500',
                            text: 'text-blue-700',
                        },
                        {
                            label: 'Total Hutang',
                            value: summary.total_debt,
                            Icon: TrendingDown,
                            border: 'border-red-500',
                            text: 'text-red-700',
                        },
                        {
                            label: 'Total Terbayar',
                            value: summary.total_paid,
                            Icon: CheckCircle,
                            border: 'border-green-500',
                            text: 'text-green-700',
                        },
                        {
                            label: 'Sisa Hutang',
                            value: summary.outstanding,
                            Icon: AlertTriangle,
                            border: 'border-amber-500',
                            text: 'text-amber-700',
                        },
                    ].map(card => (
                        <div
                            key={card.label}
                            className={`bg-white rounded-xl shadow p-5 border-l-4 ${card.border}`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <card.Icon size={16} className={card.text} />
                                <p className="text-xs text-gray-500">{card.label}</p>
                            </div>
                            <p className={`text-xl font-bold ${card.text}`}>{rp(card.value)}</p>
                        </div>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="px-6 py-3 border-b flex items-center justify-between">
                        <h2 className="font-semibold text-gray-700 text-sm">
                            Booking ({bookings.length} trip)
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100 text-sm">
                            <thead className="bg-indigo-700 text-white text-xs uppercase">
                                <tr>
                                    {[
                                        'Booking',
                                        'Customer',
                                        'Tanggal Trip',
                                        'Total Expense',
                                        'Hutang',
                                        'Terbayar',
                                        'Aging',
                                        'Aksi',
                                    ].map(h => (
                                        <th key={h} className="px-4 py-3 text-left whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {bookings.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="text-center py-10 text-gray-400">
                                            Tidak ada data untuk periode ini
                                        </td>
                                    </tr>
                                )}
                                {bookings.map(row => (
                                    <tr
                                        key={row.id}
                                        className="hover:bg-indigo-50 transition-colors"
                                    >
                                        <td className="px-4 py-3">
                                            <p className="font-medium">{row.booking_code}</p>
                                            <span
                                                className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                                    CHANNEL_COLORS[row.channel] ?? 'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                                                {row.channel}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">{row.customer}</td>
                                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                                            {row.travel_date_start}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {rp(row.total_expense)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-semibold text-red-600">
                                            {rp(row.total_debt)}
                                        </td>
                                        <td className="px-4 py-3 text-right text-green-600">
                                            {rp(row.total_paid)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <AgingBadge days={row.days_overdue} />
                                        </td>
                                        <td className="px-4 py-3">
                                            {row.total_debt > 0 && (
                                                <button
                                                    onClick={() => setPayTarget(row)}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                                                >
                                                    Bayar
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* TODO: Task 7 - Replace with <DebtPaymentModal> component once created */}
            {payTarget && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="font-semibold text-lg mb-2">Catat Pembayaran</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Modal pembayaran untuk booking <strong>{payTarget.booking_code}</strong>
                            akan tersedia setelah Task 7 selesai.
                        </p>
                        <button
                            onClick={() => setPayTarget(null)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </Main>
    );
}

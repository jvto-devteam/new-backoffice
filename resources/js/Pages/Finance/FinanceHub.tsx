import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Main from '@/Layouts/Main';
import {
    AlertTriangle, CheckCircle, DollarSign,
    TrendingDown, TrendingUp, Users, Wallet
} from 'lucide-react';
import DebtPaymentModal from './components/DebtPaymentModal';

// ── Types ──────────────────────────────────────────────────────────

interface BookingRow {
    id: number;
    channel: string;
    booking_code: string;
    customer: string;
    package: string;
    travel_date_start: string;
    travel_date_end: string | null;
    total_pax: number;
    grand_total: number;
    terkumpul: number;
    piutang: number;
    total_expense: number;
    profit: number;
    total_debt: number;
    total_paid: number;
    days_overdue: number;
}

interface Kpi {
    grand_total: number;
    terkumpul: number;
    piutang: number;
    total_expense: number;
    profit: number;
    margin_pct: number;
    hutang_vendor: number;
}

interface KebutuhanDana {
    hutang_vendor: number;
    crew_pending: number;
    total: number;
}

interface CrewSummary {
    total_crew_expense: number;
    bookings_pending: number;
    bookings_transferred: number;
}

interface PredictionBooking {
    id: number;
    booking_code: string;
    customer: string;
    package: string;
    travel_date_start: string;
    grand_total: number;
    expense: number;
    has_expense: boolean;
    channel: string;
}

interface Prediction {
    bookings: PredictionBooking[];
    expected_revenue: number;
    expected_expense: number;
    expected_profit: number;
    dana_siapkan: number;
    expense_complete: boolean;
}

interface Props {
    bookings: BookingRow[];
    kpi: Kpi;
    kebutuhan_dana: KebutuhanDana;
    crew_summary: CrewSummary;
    prediction: Prediction;
    filters: { month: string; year: string; tab: string; status: string };
    months: { value: string; label: string }[];
    years: number[];
}

// ── Helpers ────────────────────────────────────────────────────────

const rp = (v: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(v);

const CHANNEL_COLORS: Record<string, string> = {
    TWT: 'bg-blue-100 text-blue-700',
    KLOOK: 'bg-orange-100 text-orange-700',
    JVTO: 'bg-indigo-100 text-indigo-700',
};

function AgingBadge({ days }: { days: number }) {
    if (!days || days <= 0) return null;
    const cls = days > 30
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

// ── Page ───────────────────────────────────────────────────────────

export default function FinanceHub({
    bookings, kpi, kebutuhan_dana, crew_summary, prediction, filters, months, years
}: Props) {
    const [f, setF] = useState(filters);
    const [payTarget, setPayTarget] = useState<BookingRow | null>(null);

    const applyFilter = (key: string, value: string) => {
        const next = { ...f, [key]: value };
        setF(next);
        router.get('/finance/hub', next, { preserveState: true, replace: true });
    };

    const isCurrentTab = f.tab !== 'prediction';

    const marginColor = kpi.margin_pct >= 30
        ? { border: 'border-green-500', text: 'text-green-700' }
        : kpi.margin_pct >= 15
        ? { border: 'border-yellow-500', text: 'text-yellow-700' }
        : { border: 'border-red-500', text: 'text-red-700' };

    return (
        <Main>
            <Head title="Finance Hub" />
            <div className="p-6 space-y-5">

                {/* ── Header ── */}
                <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 text-white px-6 py-4 rounded-xl shadow">
                    <h1 className="text-2xl font-bold">Finance Hub</h1>
                    <p className="text-indigo-200 text-sm mt-0.5">
                        One-stop financial dashboard — profitabilitas, cash flow, dan kebutuhan dana
                    </p>
                </div>

                {/* ── Filters + Tabs ── */}
                <div className="bg-white rounded-xl shadow px-6 py-4">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Bulan</label>
                            <select value={f.month} onChange={e => applyFilter('month', e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none">
                                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Tahun</label>
                            <select value={f.year} onChange={e => applyFilter('year', e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none">
                                {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
                            </select>
                        </div>
                        {isCurrentTab && (
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Status Hutang</label>
                                <select value={f.status} onChange={e => applyFilter('status', e.target.value)}
                                    className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none">
                                    <option value="all">Semua</option>
                                    <option value="has_debt">Ada Hutang</option>
                                    <option value="fully_paid">Lunas</option>
                                </select>
                            </div>
                        )}
                        <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => applyFilter('tab', 'current')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                    isCurrentTab ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Bulan Ini
                            </button>
                            <button
                                onClick={() => applyFilter('tab', 'prediction')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                    !isCurrentTab ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Prediksi Bulan Depan
                            </button>
                        </div>
                    </div>
                </div>

                {/* ════ TAB 1: BULAN INI ════ */}
                {isCurrentTab && (
                    <>
                        {/* Row 1: Revenue side */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                {
                                    label: 'Grand Total',
                                    sub: `${bookings.length} booking`,
                                    value: kpi.grand_total,
                                    Icon: DollarSign,
                                    border: 'border-blue-500',
                                    text: 'text-blue-700',
                                },
                                {
                                    label: 'Terkumpul',
                                    sub: kpi.grand_total > 0
                                        ? `${Math.round(kpi.terkumpul / kpi.grand_total * 100)}% terbayar`
                                        : '0%',
                                    value: kpi.terkumpul,
                                    Icon: CheckCircle,
                                    border: 'border-green-500',
                                    text: 'text-green-700',
                                },
                                {
                                    label: 'Piutang Customer',
                                    sub: 'belum masuk',
                                    value: kpi.piutang,
                                    Icon: TrendingDown,
                                    border: 'border-orange-500',
                                    text: 'text-orange-700',
                                },
                            ].map(card => (
                                <div key={card.label} className={`bg-white rounded-xl shadow p-5 border-l-4 ${card.border}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <card.Icon size={15} className={card.text} />
                                        <p className="text-xs text-gray-500">{card.label}</p>
                                    </div>
                                    <p className={`text-xl font-bold ${card.text}`}>{rp(card.value)}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
                                </div>
                            ))}
                        </div>

                        {/* Row 2: Expense/P&L side */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white rounded-xl shadow p-5 border-l-4 border-red-500">
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingDown size={15} className="text-red-700" />
                                    <p className="text-xs text-gray-500">Total Expense</p>
                                </div>
                                <p className="text-xl font-bold text-red-700">{rp(kpi.total_expense)}</p>
                            </div>
                            <div className={`bg-white rounded-xl shadow p-5 border-l-4 ${marginColor.border}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <TrendingUp size={15} className={marginColor.text} />
                                    <p className="text-xs text-gray-500">Profit Kotor</p>
                                </div>
                                <p className={`text-xl font-bold ${marginColor.text}`}>{rp(kpi.profit)}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{kpi.margin_pct}% margin</p>
                            </div>
                            <div className="bg-white rounded-xl shadow p-5 border-l-4 border-amber-500">
                                <div className="flex items-center gap-2 mb-1">
                                    <AlertTriangle size={15} className="text-amber-700" />
                                    <p className="text-xs text-gray-500">Hutang Vendor</p>
                                </div>
                                <p className="text-xl font-bold text-amber-700">{rp(kpi.hutang_vendor)}</p>
                                <p className="text-xs text-gray-400 mt-0.5">outstanding</p>
                            </div>
                        </div>

                        {/* Kebutuhan Dana */}
                        <div className="bg-white rounded-xl shadow px-6 py-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Wallet size={16} className="text-indigo-600" />
                                <h2 className="font-semibold text-sm text-gray-700">Kebutuhan Dana Mendesak</h2>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-600">Hutang Vendor (outstanding)</span>
                                        <a
                                            href={`/finance/rekap-hutang?month=${f.month}&year=${f.year}`}
                                            className="text-xs text-indigo-600 hover:underline"
                                        >
                                            lihat →
                                        </a>
                                    </div>
                                    <span className="font-semibold text-red-600">{rp(kebutuhan_dana.hutang_vendor)}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-600">Crew Transfer Pending</span>
                                    <span className="font-semibold text-orange-600">{rp(kebutuhan_dana.crew_pending)}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 bg-indigo-50 rounded-lg px-3 mt-1">
                                    <span className="text-sm font-medium text-gray-700">Total perlu disiapkan</span>
                                    <span className="text-lg font-bold text-indigo-700">{rp(kebutuhan_dana.total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Crew Summary Bar */}
                        <div className="bg-white rounded-xl shadow px-5 py-3 flex flex-wrap items-center gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <Users size={15} className="text-indigo-600" />
                                <span className="font-medium text-gray-700">Crew Expense Bulan Ini</span>
                            </div>
                            <div className="flex items-center gap-6">
                                <div>
                                    <p className="text-xs text-gray-400">Total</p>
                                    <p className="font-bold text-indigo-700">{rp(crew_summary.total_crew_expense)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Belum Transfer</p>
                                    <p className="font-bold text-red-600">{crew_summary.bookings_pending} booking</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Sudah Transfer</p>
                                    <p className="font-bold text-green-600">{crew_summary.bookings_transferred} booking</p>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Booking Table */}
                        <div className="bg-white rounded-xl shadow overflow-hidden">
                            <div className="px-6 py-3 border-b">
                                <h2 className="font-semibold text-gray-700 text-sm">
                                    Booking ({bookings.length} trip)
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-100 text-sm">
                                    <thead className="bg-indigo-700 text-white text-xs uppercase">
                                        <tr>
                                            {[
                                                'Booking', 'Customer', 'Tgl',
                                                'Grand Total', 'Terkumpul', 'Piutang',
                                                'Expense', 'Profit', 'Hutang', 'Aging', 'Aksi'
                                            ].map(h => (
                                                <th key={h} className="px-3 py-3 text-left whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {bookings.length === 0 && (
                                            <tr>
                                                <td colSpan={11} className="text-center py-10 text-gray-400">
                                                    Tidak ada data untuk periode ini
                                                </td>
                                            </tr>
                                        )}
                                        {bookings.map(row => (
                                            <tr key={row.id} className="hover:bg-indigo-50 transition-colors">
                                                <td className="px-3 py-2.5">
                                                    <p className="font-medium text-xs">{row.booking_code}</p>
                                                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${CHANNEL_COLORS[row.channel] ?? 'bg-gray-100 text-gray-600'}`}>
                                                        {row.channel}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2.5 text-xs">{row.customer}</td>
                                                <td className="px-3 py-2.5 text-xs text-gray-500 whitespace-nowrap">{row.travel_date_start}</td>
                                                <td className="px-3 py-2.5 text-right text-xs font-medium text-blue-700">{rp(row.grand_total)}</td>
                                                <td className="px-3 py-2.5 text-right text-xs font-medium text-green-700">{rp(row.terkumpul)}</td>
                                                <td className="px-3 py-2.5 text-right text-xs font-medium text-orange-600">{rp(row.piutang)}</td>
                                                <td className="px-3 py-2.5 text-right text-xs">{rp(row.total_expense)}</td>
                                                <td className={`px-3 py-2.5 text-right text-xs font-semibold ${row.profit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                                                    {rp(row.profit)}
                                                </td>
                                                <td className="px-3 py-2.5 text-right text-xs text-red-600 font-semibold">{rp(row.total_debt)}</td>
                                                <td className="px-3 py-2.5">
                                                    <AgingBadge days={row.days_overdue} />
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    <div className="flex items-center gap-1.5">
                                                        {row.total_debt > 0 && (
                                                            <button
                                                                onClick={() => setPayTarget(row)}
                                                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                                                            >
                                                                Bayar
                                                            </button>
                                                        )}
                                                        <a
                                                            href={`/finance/cockpit/${row.id}`}
                                                            className="border border-indigo-300 text-indigo-600 hover:bg-indigo-50 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                                                        >
                                                            Detail →
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}

                {/* ════ TAB 2: PREDIKSI BULAN DEPAN ════ */}
                {!isCurrentTab && (
                    <>
                        {!prediction.expense_complete && prediction.bookings.length > 0 && (
                            <div className="bg-yellow-50 border border-yellow-300 rounded-xl px-5 py-3 text-sm text-yellow-800 flex items-center gap-2">
                                <AlertTriangle size={15} />
                                Beberapa booking belum diisi expense — angka prediksi mungkin belum akurat.
                            </div>
                        )}

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                {
                                    label: 'Expected Revenue',
                                    value: prediction.expected_revenue,
                                    sub: `${prediction.bookings.length} booking confirmed`,
                                    Icon: DollarSign,
                                    border: 'border-blue-500',
                                    text: 'text-blue-700',
                                },
                                {
                                    label: 'Expected Expense',
                                    value: prediction.expected_expense,
                                    sub: prediction.expense_complete ? 'data lengkap' : '⚠ belum lengkap',
                                    Icon: TrendingDown,
                                    border: 'border-red-500',
                                    text: 'text-red-700',
                                },
                                {
                                    label: 'Expected Profit',
                                    value: prediction.expected_profit,
                                    sub: prediction.expected_revenue > 0
                                        ? `${Math.round(prediction.expected_profit / prediction.expected_revenue * 100)}% margin`
                                        : '',
                                    Icon: TrendingUp,
                                    border: prediction.expected_profit >= 0 ? 'border-green-500' : 'border-red-500',
                                    text: prediction.expected_profit >= 0 ? 'text-green-700' : 'text-red-700',
                                },
                                {
                                    label: 'Dana Siapkan (Crew)',
                                    value: prediction.dana_siapkan,
                                    sub: 'total_expense_crew bulan depan',
                                    Icon: Wallet,
                                    border: 'border-indigo-500',
                                    text: 'text-indigo-700',
                                },
                            ].map(card => (
                                <div key={card.label} className={`bg-white rounded-xl shadow p-5 border-l-4 ${card.border}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <card.Icon size={15} className={card.text} />
                                        <p className="text-xs text-gray-500">{card.label}</p>
                                    </div>
                                    <p className={`text-xl font-bold ${card.text}`}>{rp(card.value)}</p>
                                    {card.sub && <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>}
                                </div>
                            ))}
                        </div>

                        <div className="bg-white rounded-xl shadow overflow-hidden">
                            <div className="px-6 py-3 border-b">
                                <h2 className="font-semibold text-gray-700 text-sm">
                                    Booking Bulan Depan ({prediction.bookings.length} trip confirmed)
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-100 text-sm">
                                    <thead className="bg-indigo-700 text-white text-xs uppercase">
                                        <tr>
                                            {['Booking', 'Customer', 'Tanggal Trip', 'Grand Total', 'Expense', 'Status Expense', 'Aksi'].map(h => (
                                                <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {prediction.bookings.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="text-center py-10 text-gray-400">
                                                    Belum ada booking untuk bulan depan
                                                </td>
                                            </tr>
                                        )}
                                        {prediction.bookings.map(row => (
                                            <tr key={row.id} className="hover:bg-indigo-50 transition-colors">
                                                <td className="px-4 py-2.5">
                                                    <p className="font-medium text-xs">{row.booking_code}</p>
                                                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${CHANNEL_COLORS[row.channel] ?? 'bg-gray-100 text-gray-600'}`}>
                                                        {row.channel}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-2.5 text-xs">{row.customer}</td>
                                                <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">{row.travel_date_start}</td>
                                                <td className="px-4 py-2.5 text-right text-xs font-medium text-blue-700">{rp(row.grand_total)}</td>
                                                <td className="px-4 py-2.5 text-right text-xs">{row.expense > 0 ? rp(row.expense) : '—'}</td>
                                                <td className="px-4 py-2.5">
                                                    {row.has_expense ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                                            <CheckCircle size={11} /> Sudah Diisi
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
                                                            <AlertTriangle size={11} /> Belum Diisi
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <a
                                                        href={`/finance/cockpit/${row.id}`}
                                                        className="border border-indigo-300 text-indigo-600 hover:bg-indigo-50 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                                                    >
                                                        Detail →
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {payTarget && (
                <DebtPaymentModal
                    booking={payTarget}
                    onClose={() => setPayTarget(null)}
                    onSuccess={() => {
                        setPayTarget(null);
                        router.reload();
                    }}
                />
            )}
        </Main>
    );
}

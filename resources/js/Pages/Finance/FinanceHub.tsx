import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Main from '@/Layouts/Main';
import { DollarSign, TrendingDown, TrendingUp, Users, X } from 'lucide-react';

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
    total_expense: number;
    crew_expense: number;
    profit: number;
}

interface Kpi {
    grand_total: number;
    total_expense: number;
    profit: number;
}

interface CrewExpense {
    total: number;
    transferred: number;
    pending: number;
}

interface ChannelBalance {
    jvto: number;
    twt: number;
}

interface JvtoDetailRow {
    id: number;
    booking_code: string;
    customer: string;
    travel_date_start: string;
    grand_total: number;
    terkumpul: number;
    balance: number;
}

interface TwtDetailRow {
    booking_code: string;
    customer: string;
    travel_date_start: string;
    total_invoice: number;
    paid: number;
    balance: number;
}

interface TableFilters {
    date: string;
    crewStatus: 'all' | 'transferred' | 'upcoming';
    channel: 'all' | 'JVTO' | 'TWT' | 'KLOOK';
    customer: string;
    orderId: string;
}

type ModalType = 'crew-all' | 'crew-transferred' | 'crew-upcoming' | 'jvto' | 'twt' | null;

interface Props {
    bookings: BookingRow[];
    kpi: Kpi;
    crew_expense: CrewExpense;
    channel_balance: ChannelBalance;
    jvto_detail: JvtoDetailRow[];
    twt_detail: TwtDetailRow[];
    filters: { month: string; year: string };
    months: { value: string; label: string }[];
    years: number[];
}

// ── Helpers ────────────────────────────────────────────────────────

const rp = (v: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(v);

const today = new Date().toISOString().split('T')[0];

const CHANNEL_COLORS: Record<string, string> = {
    TWT: 'bg-yellow-100 text-yellow-700',
    KLOOK: 'bg-orange-100 text-orange-700',
    JVTO: 'bg-indigo-100 text-indigo-700',
};

const TF_DEFAULT: TableFilters = { date: '', crewStatus: 'all', channel: 'all', customer: '', orderId: '' };

// ── Detail Modal ───────────────────────────────────────────────────

function DetailModal({ type, bookings, jvtoDetail, twtDetail, onClose }: {
    type: ModalType;
    bookings: BookingRow[];
    jvtoDetail: JvtoDetailRow[];
    twtDetail: TwtDetailRow[];
    onClose: () => void;
}) {
    if (!type) return null;

    const titles: Record<NonNullable<ModalType>, string> = {
        'crew-all':         'Detail Total Crew Expense',
        'crew-transferred': 'Crew Expense — Sudah Ditransfer',
        'crew-upcoming':    'Crew Expense — Belum Ditransfer',
        'jvto':             'Balance JVTO Belum Dibayar',
        'twt':              'Balance TWT Belum Dibayar',
    };

    // Crew rows (filter by date)
    const crewRows = type === 'crew-all'
        ? bookings
        : type === 'crew-transferred'
            ? bookings.filter(r => r.travel_date_start < today)
            : bookings.filter(r => r.travel_date_start >= today);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
                    <h2 className="font-bold text-gray-800">{titles[type]}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-auto flex-1">

                    {/* ── Crew tables ── */}
                    {(type === 'crew-all' || type === 'crew-transferred' || type === 'crew-upcoming') && (
                        <table className="min-w-full divide-y divide-gray-100 text-sm">
                            <thead className="bg-indigo-700 text-white text-xs uppercase sticky top-0">
                                <tr>
                                    {['Booking', 'Customer', 'Tanggal Trip', 'Crew Expense'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {crewRows.length === 0 && (
                                    <tr><td colSpan={4} className="text-center py-10 text-gray-400">Tidak ada data</td></tr>
                                )}
                                {crewRows.map(row => (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2.5">
                                            <p className="font-medium text-xs">{row.booking_code}</p>
                                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${CHANNEL_COLORS[row.channel] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {row.channel}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-xs">{row.customer}</td>
                                        <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">{row.travel_date_start}</td>
                                        <td className="px-4 py-2.5 text-right text-xs font-semibold text-indigo-700">
                                            {row.crew_expense > 0 ? rp(row.crew_expense) : <span className="text-gray-300">—</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            {crewRows.length > 0 && (
                                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                                    <tr>
                                        <td colSpan={3} className="px-4 py-2.5 text-xs font-semibold text-gray-600">Total ({crewRows.length} booking)</td>
                                        <td className="px-4 py-2.5 text-right text-xs font-bold text-indigo-700">
                                            {rp(crewRows.reduce((s, r) => s + r.crew_expense, 0))}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    )}

                    {/* ── JVTO table ── */}
                    {type === 'jvto' && (
                        <table className="min-w-full divide-y divide-gray-100 text-sm">
                            <thead className="bg-indigo-700 text-white text-xs uppercase sticky top-0">
                                <tr>
                                    {['Booking', 'Customer', 'Tanggal Trip', 'Total Invoice', 'Terbayar', 'Balance'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {jvtoDetail.length === 0 && (
                                    <tr><td colSpan={6} className="text-center py-10 text-gray-400">Tidak ada data</td></tr>
                                )}
                                {jvtoDetail.map(row => (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2.5">
                                            <a href={`/finance/cockpit/${row.id}`} className="font-medium text-xs text-indigo-600 hover:underline">
                                                {row.booking_code}
                                            </a>
                                            <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded font-medium bg-indigo-100 text-indigo-700">JVTO</span>
                                        </td>
                                        <td className="px-4 py-2.5 text-xs">{row.customer}</td>
                                        <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">{row.travel_date_start}</td>
                                        <td className="px-4 py-2.5 text-right text-xs text-gray-700">{rp(row.grand_total)}</td>
                                        <td className="px-4 py-2.5 text-right text-xs text-green-700">{rp(row.terkumpul)}</td>
                                        <td className="px-4 py-2.5 text-right text-xs font-semibold text-red-600">{rp(row.balance)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            {jvtoDetail.length > 0 && (
                                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                                    <tr>
                                        <td colSpan={3} className="px-4 py-2.5 text-xs font-semibold text-gray-600">Total ({jvtoDetail.length} booking)</td>
                                        <td className="px-4 py-2.5 text-right text-xs font-bold text-gray-700">{rp(jvtoDetail.reduce((s, r) => s + r.grand_total, 0))}</td>
                                        <td className="px-4 py-2.5 text-right text-xs font-bold text-green-700">{rp(jvtoDetail.reduce((s, r) => s + r.terkumpul, 0))}</td>
                                        <td className="px-4 py-2.5 text-right text-xs font-bold text-red-600">{rp(jvtoDetail.reduce((s, r) => s + r.balance, 0))}</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    )}

                    {/* ── TWT table ── */}
                    {type === 'twt' && (
                        <table className="min-w-full divide-y divide-gray-100 text-sm">
                            <thead className="bg-yellow-600 text-white text-xs uppercase sticky top-0">
                                <tr>
                                    {['Booking', 'Customer', 'Tanggal Trip', 'Total Invoice', 'Terbayar', 'Balance'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {twtDetail.length === 0 && (
                                    <tr><td colSpan={6} className="text-center py-10 text-gray-400">Tidak ada data</td></tr>
                                )}
                                {twtDetail.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-4 py-2.5">
                                            <p className="font-medium text-xs">{row.booking_code}</p>
                                            <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-yellow-100 text-yellow-700">TWT</span>
                                        </td>
                                        <td className="px-4 py-2.5 text-xs">{row.customer}</td>
                                        <td className="px-4 py-2.5 text-xs text-gray-500 whitespace-nowrap">{row.travel_date_start}</td>
                                        <td className="px-4 py-2.5 text-right text-xs text-gray-700">{rp(row.total_invoice)}</td>
                                        <td className="px-4 py-2.5 text-right text-xs text-green-700">{rp(row.paid)}</td>
                                        <td className="px-4 py-2.5 text-right text-xs font-semibold text-red-600">{rp(row.balance)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            {twtDetail.length > 0 && (
                                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                                    <tr>
                                        <td colSpan={3} className="px-4 py-2.5 text-xs font-semibold text-gray-600">Total ({twtDetail.length} booking)</td>
                                        <td className="px-4 py-2.5 text-right text-xs font-bold text-gray-700">{rp(twtDetail.reduce((s, r) => s + r.total_invoice, 0))}</td>
                                        <td className="px-4 py-2.5 text-right text-xs font-bold text-green-700">{rp(twtDetail.reduce((s, r) => s + r.paid, 0))}</td>
                                        <td className="px-4 py-2.5 text-right text-xs font-bold text-red-600">{rp(twtDetail.reduce((s, r) => s + r.balance, 0))}</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Page ───────────────────────────────────────────────────────────

export default function FinanceHub({ bookings, kpi, crew_expense, channel_balance, jvto_detail, twt_detail, filters, months, years }: Props) {
    const [f, setF] = useState(filters);
    const [tf, setTf] = useState<TableFilters>(TF_DEFAULT);
    const [modal, setModal] = useState<ModalType>(null);

    const applyFilter = (key: string, value: string) => {
        const next = { ...f, [key]: value };
        setF(next);
        router.get('/finance/hub', next, { preserveState: true, replace: true });
    };

    const profitColor = kpi.profit >= 0
        ? { border: 'border-green-500', text: 'text-green-700' }
        : { border: 'border-red-500', text: 'text-red-700' };

    const filteredBookings = bookings.filter(row => {
        if (tf.date && row.travel_date_start !== tf.date) return false;
        if (tf.crewStatus === 'transferred' && row.travel_date_start >= today) return false;
        if (tf.crewStatus === 'upcoming' && row.travel_date_start < today) return false;
        if (tf.channel !== 'all' && row.channel !== tf.channel) return false;
        if (tf.customer && !row.customer.toLowerCase().includes(tf.customer.toLowerCase())) return false;
        if (tf.orderId && !row.booking_code.toLowerCase().includes(tf.orderId.toLowerCase())) return false;
        return true;
    });

    const hasTableFilter = tf.date || tf.crewStatus !== 'all' || tf.channel !== 'all' || tf.customer || tf.orderId;

    return (
        <Main>
            <Head title="Finance Hub" />
            <div className="p-6 space-y-5">

                {/* ── Header ── */}
                <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 text-white px-6 py-4 rounded-xl shadow">
                    <h1 className="text-2xl font-bold">Finance Hub</h1>
                    <p className="text-indigo-200 text-sm mt-0.5">
                        One-stop financial dashboard — profitabilitas dan crew expense
                    </p>
                </div>

                {/* ── Filters ── */}
                <div className="bg-white rounded-xl shadow px-6 py-4">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Bulan</label>
                            <select
                                value={f.month}
                                onChange={e => applyFilter('month', e.target.value)}
                                className="w-36 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                            >
                                {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Tahun</label>
                            <select
                                value={f.year}
                                onChange={e => applyFilter('year', e.target.value)}
                                className="w-28 border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                            >
                                {years.map(y => <option key={y} value={String(y)}>{y}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* ── Row 1: Revenue / P&L ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl shadow p-5 border-l-4 border-blue-500">
                        <div className="flex items-center gap-2 mb-1">
                            <DollarSign size={15} className="text-blue-700" />
                            <p className="text-xs text-gray-500">Total Pendapatan</p>
                        </div>
                        <p className="text-xl font-bold text-blue-700">{rp(kpi.grand_total)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{bookings.length} booking</p>
                    </div>
                    <div className="bg-white rounded-xl shadow p-5 border-l-4 border-red-500">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingDown size={15} className="text-red-700" />
                            <p className="text-xs text-gray-500">Total Expense</p>
                        </div>
                        <p className="text-xl font-bold text-red-700">{rp(kpi.total_expense)}</p>
                    </div>
                    <div className={`bg-white rounded-xl shadow p-5 border-l-4 ${profitColor.border}`}>
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp size={15} className={profitColor.text} />
                            <p className="text-xs text-gray-500">Total Profit</p>
                        </div>
                        <p className={`text-xl font-bold ${profitColor.text}`}>{rp(kpi.profit)}</p>
                    </div>
                </div>

                {/* ── Row 2: Crew Expense (clickable) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { type: 'crew-all' as ModalType,         label: 'Total Crew Expense',             value: crew_expense.total,       border: 'border-indigo-500', text: 'text-indigo-700', hover: 'hover:bg-indigo-50', sub: '' },
                        { type: 'crew-transferred' as ModalType, label: 'Crew Expense Sudah Ditransfer',  value: crew_expense.transferred, border: 'border-green-500',  text: 'text-green-700',  hover: 'hover:bg-green-50',  sub: 'trip sebelum hari ini' },
                        { type: 'crew-upcoming' as ModalType,    label: 'Crew Expense Belum Ditransfer', value: crew_expense.pending,     border: 'border-orange-500', text: 'text-orange-700', hover: 'hover:bg-orange-50', sub: 'trip hari ini & ke depan' },
                    ].map(card => (
                        <div
                            key={card.type!}
                            onClick={() => setModal(card.type)}
                            className={`bg-white rounded-xl shadow p-5 border-l-4 ${card.border} cursor-pointer ${card.hover} hover:shadow-md transition-all group`}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <Users size={15} className={card.text} />
                                    <p className="text-xs text-gray-500">{card.label}</p>
                                </div>
                                <span className={`text-xs ${card.text} opacity-0 group-hover:opacity-60 transition-opacity`}>lihat →</span>
                            </div>
                            <p className={`text-xl font-bold ${card.text}`}>{rp(card.value)}</p>
                            {card.sub && <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>}
                        </div>
                    ))}
                </div>

                {/* ── Row 3: Channel Balance (clickable) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div
                        onClick={() => setModal('jvto')}
                        className="bg-white rounded-xl shadow p-5 border-l-4 border-indigo-400 cursor-pointer hover:bg-indigo-50 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <DollarSign size={15} className="text-indigo-600" />
                                <p className="text-xs text-gray-500">Balance JVTO Belum Dibayar</p>
                            </div>
                            <span className="text-xs text-indigo-400 opacity-0 group-hover:opacity-60 transition-opacity">lihat →</span>
                        </div>
                        <p className="text-xl font-bold text-indigo-600">{rp(channel_balance.jvto)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">piutang customer JVTO belum lunas</p>
                    </div>
                    <div
                        onClick={() => setModal('twt')}
                        className="bg-white rounded-xl shadow p-5 border-l-4 border-yellow-500 cursor-pointer hover:bg-yellow-50 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <DollarSign size={15} className="text-yellow-700" />
                                <p className="text-xs text-gray-500">Balance TWT Belum Dibayar</p>
                            </div>
                            <span className="text-xs text-yellow-500 opacity-0 group-hover:opacity-60 transition-opacity">lihat →</span>
                        </div>
                        <p className="text-xl font-bold text-yellow-700">{rp(channel_balance.twt)}</p>
                        <p className="text-xs text-gray-400 mt-0.5">tagihan invoice TWT yang belum dibayar</p>
                    </div>
                </div>

                {/* ── Booking Table ── */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="px-6 py-3 border-b">
                        <h2 className="font-semibold text-gray-700 text-sm">
                            Booking ({filteredBookings.length} trip{hasTableFilter ? ` dari ${bookings.length}` : ''})
                        </h2>
                    </div>

                    {/* Table filters */}
                    <div className="px-6 py-3 border-b bg-gray-50 flex flex-wrap gap-3 items-end">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Tanggal</label>
                            <input
                                type="date"
                                value={tf.date}
                                onChange={e => setTf(p => ({ ...p, date: e.target.value }))}
                                className="border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Crew Transfer</label>
                            <select
                                value={tf.crewStatus}
                                onChange={e => setTf(p => ({ ...p, crewStatus: e.target.value as TableFilters['crewStatus'] }))}
                                className="w-36 border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                            >
                                <option value="all">Semua</option>
                                <option value="transferred">Transferred</option>
                                <option value="upcoming">Upcoming</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Channel</label>
                            <select
                                value={tf.channel}
                                onChange={e => setTf(p => ({ ...p, channel: e.target.value as TableFilters['channel'] }))}
                                className="w-28 border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                            >
                                <option value="all">Semua</option>
                                <option value="JVTO">JVTO</option>
                                <option value="TWT">TWT</option>
                                <option value="KLOOK">Klook</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Customer</label>
                            <input
                                type="text"
                                value={tf.customer}
                                onChange={e => setTf(p => ({ ...p, customer: e.target.value }))}
                                placeholder="Cari nama..."
                                className="w-36 border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Order ID</label>
                            <input
                                type="text"
                                value={tf.orderId}
                                onChange={e => setTf(p => ({ ...p, orderId: e.target.value }))}
                                placeholder="Cari ID..."
                                className="w-36 border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                            />
                        </div>
                        {hasTableFilter && (
                            <button
                                onClick={() => setTf(TF_DEFAULT)}
                                className="text-xs text-indigo-600 hover:underline self-end pb-1.5"
                            >
                                Reset filter
                            </button>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100 text-sm">
                            <thead className="bg-indigo-700 text-white text-xs uppercase">
                                <tr>
                                    {['Booking', 'Customer', 'Tgl', 'Grand Total', 'Expense', 'Crew Expense', 'Profit', 'Aksi'].map(h => (
                                        <th key={h} className="px-3 py-3 text-left whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredBookings.length === 0 && (
                                    <tr>
                                        <td colSpan={8} className="text-center py-10 text-gray-400">
                                            {bookings.length === 0 ? 'Tidak ada data untuk periode ini' : 'Tidak ada booking yang sesuai filter'}
                                        </td>
                                    </tr>
                                )}
                                {filteredBookings.map(row => (
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
                                        <td className="px-3 py-2.5 text-right text-xs text-red-600">{rp(row.total_expense)}</td>
                                        <td className="px-3 py-2.5 text-right text-xs text-indigo-700">{rp(row.crew_expense)}</td>
                                        <td className={`px-3 py-2.5 text-right text-xs font-semibold ${row.profit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                                            {rp(row.profit)}
                                        </td>
                                        <td className="px-3 py-2.5">
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
            </div>

            {/* ── Detail Modal ── */}
            {modal && (
                <DetailModal
                    type={modal}
                    bookings={bookings}
                    jvtoDetail={jvto_detail}
                    twtDetail={twt_detail}
                    onClose={() => setModal(null)}
                />
            )}
        </Main>
    );
}

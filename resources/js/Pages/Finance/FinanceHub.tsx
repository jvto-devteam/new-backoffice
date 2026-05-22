import { useEffect, useRef, useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Main from '@/Layouts/Main';
import axios from 'axios';
import { Calendar, ChevronDown, DollarSign, FileSpreadsheet, FileText, TrendingDown, TrendingUp, Users, X } from 'lucide-react';

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
    crew_transfer_status: 'pending' | 'transferred';
}

interface Kpi { grand_total: number; total_expense: number; profit: number; }
interface CrewExpense { total: number; transferred: number; pending: number; }
interface ChannelBalance { jvto: number; twt: number; }

interface JvtoDetailRow {
    id: number; booking_code: string; customer: string;
    travel_date_start: string; grand_total: number; terkumpul: number; balance: number;
}
interface TwtDetailRow {
    booking_code: string; customer: string; travel_date_start: string;
    total_invoice: number; paid: number; balance: number;
}

type ModalType = 'crew-all' | 'crew-transferred' | 'crew-upcoming' | 'jvto' | 'twt' | null;

interface Props {
    bookings: BookingRow[];
    kpi: Kpi;
    crew_expense: CrewExpense;
    channel_balance: ChannelBalance;
    jvto_detail: JvtoDetailRow[];
    twt_detail: TwtDetailRow[];
    filters: { date_from: string; date_to: string };
}

// ── Helpers ────────────────────────────────────────────────────────

// Format tanggal pakai local time, bukan UTC (toISOString() balik ke UTC — salah di UTC+7)
const fmtLocal = (dt: Date) => {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const rp = (v: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(v);
const todayStr = fmtLocal(new Date());

function fmtDate(d: string) {
    if (!d) return '';
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
}

const CHANNEL_COLORS: Record<string, string> = {
    TWT: 'bg-yellow-100 text-yellow-700',
    KLOOK: 'bg-orange-100 text-orange-700',
    JVTO: 'bg-indigo-100 text-indigo-700',
};

// ── Date Range Picker ──────────────────────────────────────────────

type Preset = 'today' | 'yesterday' | 'last7' | 'thismonth' | 'prevmonth' | 'custom';

function getPreset(p: Preset): { from: string; to: string } {
    const d = new Date();
    const addDays = (dt: Date, n: number) => { const r = new Date(dt); r.setDate(r.getDate() + n); return r; };

    switch (p) {
        case 'today':     return { from: fmtLocal(d), to: fmtLocal(d) };
        case 'yesterday': { const y = addDays(d, -1); return { from: fmtLocal(y), to: fmtLocal(y) }; }
        case 'last7':     return { from: fmtLocal(addDays(d, -6)), to: fmtLocal(d) };
        case 'thismonth': return { from: fmtLocal(new Date(d.getFullYear(), d.getMonth(), 1)), to: fmtLocal(new Date(d.getFullYear(), d.getMonth() + 1, 0)) };
        case 'prevmonth': {
            const f = new Date(d.getFullYear(), d.getMonth() - 1, 1);
            const l = new Date(d.getFullYear(), d.getMonth(), 0);
            return { from: fmtLocal(f), to: fmtLocal(l) };
        }
        default: return { from: fmtLocal(new Date(d.getFullYear(), d.getMonth(), 1)), to: fmtLocal(new Date(d.getFullYear(), d.getMonth() + 1, 0)) };
    }
}

const MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
const dm = (dt: Date) => `${dt.getDate()} ${MONTHS[dt.getMonth()]}`;

function presetLabel(p: Preset): string {
    const d = new Date();
    switch (p) {
        case 'today':     return `Today (${dm(d)})`;
        case 'yesterday': return `Yesterday (${dm(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1))})`;
        case 'last7':     return `Last 7 days (${dm(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 6))} – ${dm(d)})`;
        case 'thismonth': {
            const first = new Date(d.getFullYear(), d.getMonth(), 1);
            const last  = new Date(d.getFullYear(), d.getMonth() + 1, 0);
            return `This month (${dm(first)} – ${dm(last)})`;
        }
        case 'prevmonth': {
            const first = new Date(d.getFullYear(), d.getMonth() - 1, 1);
            const last  = new Date(d.getFullYear(), d.getMonth(), 0);
            return `Previous month (${dm(first)} – ${dm(last)})`;
        }
        case 'custom': return 'Custom Range';
    }
}

function DateRangePicker({ from, to, onChange }: {
    from: string; to: string;
    onChange: (from: string, to: string) => void;
}) {
    const [open, setOpen]       = useState(false);
    const [mode, setMode]       = useState<Preset | null>(null);
    const [tmpFrom, setTmpFrom] = useState(from);
    const [tmpTo, setTmpTo]     = useState(to);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selectPreset = (p: Preset) => {
        setMode(p);
        if (p !== 'custom') {
            const { from: f, to: t } = getPreset(p);
            setOpen(false);
            onChange(f, t);
        }
    };

    const applyCustom = () => {
        if (tmpFrom && tmpTo) { setOpen(false); onChange(tmpFrom, tmpTo); }
    };

    const PRESETS: Preset[] = ['today', 'yesterday', 'last7', 'thismonth', 'prevmonth'];

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white hover:bg-gray-50 transition-colors min-w-[220px]"
            >
                <Calendar size={14} className="text-gray-400 shrink-0" />
                <span className="flex-1 text-left text-gray-700">
                    {fmtDate(from)} – {fmtDate(to)}
                </span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div className="absolute top-full mt-1 left-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg w-72 py-2">
                    {/* Preset options — always visible */}
                    {PRESETS.map(p => (
                        <button
                            key={p}
                            onClick={() => selectPreset(p)}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                                mode === p ? 'text-indigo-700 bg-indigo-50 font-medium' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                            {presetLabel(p)}
                        </button>
                    ))}
                    <div className="border-t border-gray-100 my-1" />
                    <button
                        onClick={() => selectPreset('custom')}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                            mode === 'custom' ? 'text-indigo-700 bg-indigo-50' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        Custom Range
                    </button>

                    {/* Custom inputs — only shown when custom is selected */}
                    {mode === 'custom' && (
                        <div className="px-4 pb-3 pt-1 space-y-2 border-t border-gray-100 mt-1">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">From</label>
                                    <input type="date" value={tmpFrom}
                                        onChange={e => setTmpFrom(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">To</label>
                                    <input type="date" value={tmpTo}
                                        onChange={e => setTmpTo(e.target.value)}
                                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-xs focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={applyCustom}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium py-2 rounded-lg transition-colors"
                            >
                                Apply changes
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Stat Card ──────────────────────────────────────────────────────

function StatCard({ label, value, sub, accentColor, Icon, onClick }: {
    label: string; value: number; sub?: string;
    accentColor: string; Icon: React.ElementType;
    onClick?: () => void;
}) {
    return (
        <div
            onClick={onClick}
            className={`bg-white border border-gray-200 rounded-xl p-5 border-l-4 ${accentColor}
                ${onClick ? 'cursor-pointer hover:shadow-md hover:border-gray-300 transition-all group' : ''}`}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Icon size={14} className="text-gray-400" />
                    <p className="text-xs text-gray-500 font-medium">{label}</p>
                </div>
                {onClick && (
                    <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">lihat →</span>
                )}
            </div>
            <p className="text-xl font-bold text-gray-800">{rp(value)}</p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
    );
}

// ── Detail Modal ───────────────────────────────────────────────────

function DetailModal({ type, bookings, jvtoDetail, twtDetail, onClose }: {
    type: ModalType; bookings: BookingRow[];
    jvtoDetail: JvtoDetailRow[]; twtDetail: TwtDetailRow[];
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

    const crewRows = type === 'crew-all' ? bookings
        : type === 'crew-transferred' ? bookings.filter(r => r.travel_date_start < todayStr)
        : bookings.filter(r => r.travel_date_start >= todayStr);

    const thCls = 'px-4 py-3 text-left whitespace-nowrap text-xs font-semibold text-gray-500 uppercase tracking-wide';
    const tdCls = 'px-4 py-3 text-xs';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
                    <h2 className="font-semibold text-gray-800">{titles[type]}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-100">
                        <X size={18} />
                    </button>
                </div>
                <div className="overflow-auto flex-1">
                    {/* Crew tables */}
                    {(type === 'crew-all' || type === 'crew-transferred' || type === 'crew-upcoming') && (
                        <table className="min-w-full text-sm">
                            <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                                <tr>
                                    {['Booking', 'Customer', 'Tanggal Trip', 'Crew Expense'].map(h => (
                                        <th key={h} className={thCls}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {crewRows.length === 0 && (
                                    <tr><td colSpan={4} className="text-center py-10 text-gray-400 text-sm">Tidak ada data</td></tr>
                                )}
                                {crewRows.map(row => (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        <td className={tdCls}>
                                            <p className="font-medium text-gray-800">{row.booking_code}</p>
                                            <span className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${CHANNEL_COLORS[row.channel] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {row.channel}
                                            </span>
                                        </td>
                                        <td className={`${tdCls} text-gray-700`}>{row.customer}</td>
                                        <td className={`${tdCls} text-gray-500`}>{row.travel_date_start}</td>
                                        <td className={`${tdCls} text-right font-semibold text-gray-800`}>
                                            {row.crew_expense > 0 ? rp(row.crew_expense) : <span className="text-gray-300 font-normal">—</span>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            {crewRows.length > 0 && (
                                <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                                    <tr>
                                        <td colSpan={3} className="px-4 py-3 text-xs font-semibold text-gray-600">
                                            Total ({crewRows.length} booking)
                                        </td>
                                        <td className="px-4 py-3 text-right text-sm font-bold text-gray-800">
                                            {rp(crewRows.reduce((s, r) => s + r.crew_expense, 0))}
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    )}

                    {/* JVTO table */}
                    {type === 'jvto' && (
                        <table className="min-w-full text-sm">
                            <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                                <tr>
                                    {['Booking', 'Customer', 'Tanggal Trip', 'Total Invoice', 'Terbayar', 'Balance'].map(h => (
                                        <th key={h} className={thCls}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {jvtoDetail.length === 0 && (
                                    <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">Tidak ada data</td></tr>
                                )}
                                {jvtoDetail.map(row => (
                                    <tr key={row.id} className="hover:bg-gray-50">
                                        <td className={tdCls}>
                                            <a href={`/finance/cockpit/${row.id}`} className="font-medium text-indigo-600 hover:underline">
                                                {row.booking_code}
                                            </a>
                                        </td>
                                        <td className={`${tdCls} text-gray-700`}>{row.customer}</td>
                                        <td className={`${tdCls} text-gray-500`}>{row.travel_date_start}</td>
                                        <td className={`${tdCls} text-right text-gray-700`}>{rp(row.grand_total)}</td>
                                        <td className={`${tdCls} text-right text-green-700`}>{rp(row.terkumpul)}</td>
                                        <td className={`${tdCls} text-right font-semibold text-red-600`}>{rp(row.balance)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            {jvtoDetail.length > 0 && (
                                <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                                    <tr>
                                        <td colSpan={3} className="px-4 py-3 text-xs font-semibold text-gray-600">Total ({jvtoDetail.length} booking)</td>
                                        <td className="px-4 py-3 text-right text-sm font-bold text-gray-700">{rp(jvtoDetail.reduce((s, r) => s + r.grand_total, 0))}</td>
                                        <td className="px-4 py-3 text-right text-sm font-bold text-green-700">{rp(jvtoDetail.reduce((s, r) => s + r.terkumpul, 0))}</td>
                                        <td className="px-4 py-3 text-right text-sm font-bold text-red-600">{rp(jvtoDetail.reduce((s, r) => s + r.balance, 0))}</td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    )}

                    {/* TWT table */}
                    {type === 'twt' && (
                        <table className="min-w-full text-sm">
                            <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
                                <tr>
                                    {['Booking', 'Customer', 'Tanggal Trip', 'Total Invoice', 'Terbayar', 'Balance'].map(h => (
                                        <th key={h} className={thCls}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {twtDetail.length === 0 && (
                                    <tr><td colSpan={6} className="text-center py-10 text-gray-400 text-sm">Tidak ada data</td></tr>
                                )}
                                {twtDetail.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className={tdCls}>
                                            <p className="font-medium text-gray-800">{row.booking_code}</p>
                                            <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">TWT</span>
                                        </td>
                                        <td className={`${tdCls} text-gray-700`}>{row.customer}</td>
                                        <td className={`${tdCls} text-gray-500`}>{row.travel_date_start}</td>
                                        <td className={`${tdCls} text-right text-gray-700`}>{rp(row.total_invoice)}</td>
                                        <td className={`${tdCls} text-right text-green-700`}>{rp(row.paid)}</td>
                                        <td className={`${tdCls} text-right font-semibold text-red-600`}>{rp(row.balance)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            {twtDetail.length > 0 && (
                                <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                                    <tr>
                                        <td colSpan={3} className="px-4 py-3 text-xs font-semibold text-gray-600">Total ({twtDetail.length} booking)</td>
                                        <td className="px-4 py-3 text-right text-sm font-bold text-gray-700">{rp(twtDetail.reduce((s, r) => s + r.total_invoice, 0))}</td>
                                        <td className="px-4 py-3 text-right text-sm font-bold text-green-700">{rp(twtDetail.reduce((s, r) => s + r.paid, 0))}</td>
                                        <td className="px-4 py-3 text-right text-sm font-bold text-red-600">{rp(twtDetail.reduce((s, r) => s + r.balance, 0))}</td>
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

export default function FinanceHub({
    bookings, kpi, crew_expense, channel_balance,
    jvto_detail, twt_detail, filters,
}: Props) {
    const [dateFrom, setDateFrom] = useState(filters.date_from);
    const [dateTo,   setDateTo]   = useState(filters.date_to);
    const [modal, setModal]       = useState<ModalType>(null);
    const [crewStatuses, setCrewStatuses] = useState<Record<number, 'pending' | 'transferred'>>(() => {
        const m: Record<number, 'pending' | 'transferred'> = {};
        bookings.forEach(b => { m[b.id] = b.crew_transfer_status; });
        return m;
    });
    const [toggling, setToggling] = useState<number | null>(null);

    const toggleCrew = async (bookingId: number) => {
        setToggling(bookingId);
        try {
            const res = await axios.post(`/finance/hub/${bookingId}/toggle-crew-transfer`);
            setCrewStatuses(p => ({ ...p, [bookingId]: res.data.status }));
        } finally {
            setToggling(null);
        }
    };

    const applyDateRange = (from: string, to: string) => {
        setDateFrom(from);
        setDateTo(to);
        router.get('/finance/hub', { date_from: from, date_to: to }, { preserveState: true, replace: true });
    };

    const profitColor = kpi.profit >= 0 ? 'border-l-green-500' : 'border-l-red-500';
    const profitText  = kpi.profit >= 0 ? 'text-green-700' : 'text-red-600';

    const exportParams = `date_from=${dateFrom}&date_to=${dateTo}`;

    return (
        <Main>
            <Head title="Finance Hub" />
            <div className="p-6 space-y-6">

                {/* ── Header ── */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Finance Hub</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Profitabilitas, crew expense, dan balance per channel</p>
                </div>

                {/* ── Date Range Filter ── */}
                <div className="bg-white border border-gray-200 rounded-xl px-5 py-4">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm font-medium text-gray-600">Periode</span>
                        <DateRangePicker from={dateFrom} to={dateTo} onChange={applyDateRange} />
                        <span className="text-xs text-gray-400">
                            {bookings.length} booking ditemukan
                        </span>
                    </div>
                </div>

                {/* ── Row 1: Revenue / P&L ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard label="Total Pendapatan" value={kpi.grand_total}
                        sub={`${bookings.length} booking`}
                        accentColor="border-l-blue-500" Icon={DollarSign} />
                    <StatCard label="Total Expense" value={kpi.total_expense}
                        accentColor="border-l-red-500" Icon={TrendingDown} />
                    <div className={`bg-white border border-gray-200 rounded-xl p-5 border-l-4 ${profitColor}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp size={14} className="text-gray-400" />
                            <p className="text-xs text-gray-500 font-medium">Total Profit</p>
                        </div>
                        <p className={`text-xl font-bold ${profitText}`}>{rp(kpi.profit)}</p>
                    </div>
                </div>

                {/* ── Row 2: Crew Expense (clickable) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard label="Total Crew Expense" value={crew_expense.total}
                        accentColor="border-l-indigo-500" Icon={Users}
                        onClick={() => setModal('crew-all')} />
                    <StatCard label="Crew Expense Sudah Ditransfer" value={crew_expense.transferred}
                        sub="trip sebelum hari ini"
                        accentColor="border-l-green-500" Icon={Users}
                        onClick={() => setModal('crew-transferred')} />
                    <StatCard label="Crew Expense Belum Ditransfer" value={crew_expense.pending}
                        sub="trip hari ini & ke depan"
                        accentColor="border-l-orange-500" Icon={Users}
                        onClick={() => setModal('crew-upcoming')} />
                </div>

                {/* ── Row 3: Channel Balance (clickable) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <StatCard label="Balance JVTO Belum Dibayar" value={channel_balance.jvto}
                        sub="piutang customer JVTO belum lunas"
                        accentColor="border-l-indigo-400" Icon={DollarSign}
                        onClick={() => setModal('jvto')} />
                    <StatCard label="Balance TWT Belum Dibayar" value={channel_balance.twt}
                        sub="tagihan invoice TWT yang belum dibayar"
                        accentColor="border-l-yellow-500" Icon={DollarSign}
                        onClick={() => setModal('twt')} />
                </div>

                {/* ── Booking Table ── */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">

                    {/* Table header */}
                    <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-800">
                            Daftar Booking
                            <span className="ml-2 text-xs font-normal text-gray-400">{bookings.length} trip</span>
                        </h2>
                        <div className="flex items-center gap-2">
                            <a href={`/finance/hub/export-pdf?${exportParams}`} target="_blank"
                                className="inline-flex items-center gap-1.5 text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-100 transition-colors"
                            >
                                <FileText size={13} /> Export PDF
                            </a>
                            <a href={`/finance/hub/export-excel?${exportParams}`}
                                className="inline-flex items-center gap-1.5 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
                            >
                                <FileSpreadsheet size={13} /> Export Excel
                            </a>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    {['Booking', 'Customer', 'Tanggal', 'Grand Total', 'Expense', 'Crew Expense', 'Status Crew', 'Profit', 'Aksi'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {bookings.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="text-center py-12 text-gray-400">
                                            Tidak ada data untuk periode ini
                                        </td>
                                    </tr>
                                )}
                                {bookings.map(row => {
                                    const crewStatus = crewStatuses[row.id] ?? 'pending';
                                    const isToggling = toggling === row.id;
                                    const hasCrewExpense = row.crew_expense > 0;
                                    return (
                                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-xs text-gray-800">{row.booking_code}</p>
                                            <span className={`inline-block mt-0.5 text-xs px-1.5 py-0.5 rounded font-medium ${CHANNEL_COLORS[row.channel] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {row.channel}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-700">{row.customer}</td>
                                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{row.travel_date_start}</td>
                                        <td className="px-4 py-3 text-right text-xs font-medium text-gray-800">{rp(row.grand_total)}</td>
                                        <td className="px-4 py-3 text-right text-xs text-red-600">{rp(row.total_expense)}</td>
                                        <td className="px-4 py-3 text-right text-xs text-indigo-700">
                                            {hasCrewExpense ? rp(row.crew_expense) : <span className="text-gray-300">—</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            {hasCrewExpense ? (
                                                <button
                                                    onClick={() => !isToggling && toggleCrew(row.id)}
                                                    disabled={isToggling}
                                                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border transition-colors disabled:opacity-50 ${
                                                        crewStatus === 'transferred'
                                                            ? 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
                                                            : 'bg-orange-50 text-orange-700 border-orange-300 hover:bg-orange-100'
                                                    }`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${crewStatus === 'transferred' ? 'bg-green-500' : 'bg-orange-400'}`} />
                                                    {isToggling ? '...' : crewStatus === 'transferred' ? 'Transferred' : 'Pending'}
                                                </button>
                                            ) : (
                                                <span className="text-gray-300 text-xs">—</span>
                                            )}
                                        </td>
                                        <td className={`px-4 py-3 text-right text-xs font-semibold ${row.profit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                                            {rp(row.profit)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <a href={`/finance/cockpit/${row.id}`}
                                                className="inline-flex items-center border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                                            >
                                                Detail →
                                            </a>
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {modal && (
                <DetailModal
                    type={modal} bookings={bookings}
                    jvtoDetail={jvto_detail} twtDetail={twt_detail}
                    onClose={() => setModal(null)}
                />
            )}
        </Main>
    );
}

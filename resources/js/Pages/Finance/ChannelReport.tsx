import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import Main from '@/Layouts/Main';
import axios from 'axios';
import {
    BarChart3, FileText, FileSpreadsheet, ChevronDown, ChevronUp,
    Settings2, Tag, DollarSign, AlertCircle, Check, Loader2,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Booking {
    no: number;
    booking_number: string;
    customer: string;
    total_pax: number;
    trip_date: string;
    invoice: number;
    expense: number;
    profit: number;
}

interface KlookBooking {
    id: number;
    invoice_code_origin: string | null;
    customer: string;
    total_pax: number;
    trip_date: string;
    invoice: number;
    expense: number;
    profit: number;
    channel_tag: string | null;
    resolved_channel: string;
}

interface ChannelData {
    bookings: Booking[];
    total_invoice: number;
    total_expense: number;
    total_profit: number;
}

interface Channels {
    jvto: ChannelData;
    twt: ChannelData;
    klook: ChannelData;
    gyg: ChannelData;
    viator: ChannelData;
}

interface GoogleBill {
    google_cloud: number;
    google_ads: number;
}

interface Props {
    filters: { month: string; year: string };
    channels: Channels;
    google_bill: GoogleBill | null;
    klook_bookings: KlookBooking[];
    months: { value: string; label: string }[];
    years: number[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CHANNEL_KEYS = ['jvto', 'twt', 'klook', 'gyg', 'viator'] as const;
type ChannelKey = (typeof CHANNEL_KEYS)[number];

const CHANNEL_LABELS: Record<string, string> = {
    jvto: 'JVTO', twt: 'TWT', klook: 'KLOOK', gyg: 'GetYourGuide', viator: 'Viator',
};

const CHANNEL_COLORS: Record<string, { dot: string; badge: string }> = {
    jvto:   { dot: 'bg-sky-500',     badge: 'bg-sky-100 text-sky-700' },
    twt:    { dot: 'bg-amber-500',   badge: 'bg-amber-100 text-amber-700' },
    klook:  { dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
    gyg:    { dot: 'bg-violet-500',  badge: 'bg-violet-100 text-violet-700' },
    viator: { dot: 'bg-rose-500',    badge: 'bg-rose-100 text-rose-700' },
};

const TAG_OPTIONS = [
    { value: 'klook',  label: 'KLOOK',        cls: 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200' },
    { value: 'gyg',    label: 'GetYourGuide', cls: 'bg-violet-100 text-violet-800 border-violet-300 hover:bg-violet-200' },
    { value: 'viator', label: 'Viator',       cls: 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString('id-ID');

/** Format a raw number string with thousand separators for display */
const fmtInput = (raw: string) => {
    const num = parseInt(raw.replace(/\D/g, ''), 10);
    return isNaN(num) ? '' : num.toLocaleString('id-ID');
};

/** Strip formatting and return integer */
const parseInput = (val: string) => parseInt(val.replace(/\D/g, ''), 10) || 0;

function exportUrl(type: 'pdf' | 'excel', channel: string, month: string, year: string) {
    return `/finance/channel-revenue-report/export-${type}/${channel}?month=${month}&year=${year}`;
}

/** Text input that shows thousand-separated display but stores raw digits */
function CurrencyInput({ value, onChange, placeholder }: {
    value: number; onChange: (v: number) => void; placeholder?: string;
}) {
    const [focused, setFocused] = useState(false);
    const [raw, setRaw] = useState(String(value || ''));

    const handleFocus = () => {
        setFocused(true);
        setRaw(value ? String(value) : '');
    };
    const handleBlur = () => {
        setFocused(false);
        const parsed = parseInput(raw);
        onChange(parsed);
        setRaw(parsed ? String(parsed) : '');
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const digits = e.target.value.replace(/\D/g, '');
        setRaw(digits);
        onChange(parseInt(digits, 10) || 0);
    };

    return (
        <input
            type="text"
            inputMode="numeric"
            value={focused ? raw : (value ? fmt(value) : '')}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder ?? '0'}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-56 focus:outline-none focus:ring-2 focus:ring-slate-500 text-right tabular-nums"
        />
    );
}

// ─── Booking Table ────────────────────────────────────────────────────────────

function BookingTable({ channel, data, month, year }: {
    channel: string; data: ChannelData; month: string; year: string;
}) {
    if (data.bookings.length === 0) {
        return (
            <div className="flex flex-col items-center py-12 text-gray-400">
                <AlertCircle size={36} className="mb-2 opacity-40" />
                <p className="text-sm">No bookings for this period</p>
            </div>
        );
    }

    return (
        <div>
            <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                            <th className="px-4 py-3 text-center w-10">No</th>
                            <th className="px-4 py-3 text-left">Booking No.</th>
                            <th className="px-4 py-3 text-left">Customer</th>
                            <th className="px-4 py-3 text-center">Pax</th>
                            <th className="px-4 py-3 text-left">Trip Date</th>
                            <th className="px-4 py-3 text-right">Invoice (Rp)</th>
                            <th className="px-4 py-3 text-right">Expense (Rp)</th>
                            <th className="px-4 py-3 text-right font-semibold">Profit (Rp)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {data.bookings.map((b, i) => (
                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-center text-gray-400 text-xs">{b.no}</td>
                                <td className="px-4 py-3 font-mono text-xs text-gray-600">{b.booking_number}</td>
                                <td className="px-4 py-3 font-medium text-gray-800">{b.customer}</td>
                                <td className="px-4 py-3 text-center text-gray-600">{b.total_pax}</td>
                                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{b.trip_date}</td>
                                <td className="px-4 py-3 text-right text-gray-700">{fmt(b.invoice)}</td>
                                <td className="px-4 py-3 text-right text-red-600">{fmt(b.expense)}</td>
                                <td className="px-4 py-3 text-right font-semibold text-green-700">{fmt(b.profit)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-800 text-white text-sm font-semibold">
                            <td colSpan={5} className="px-4 py-3 text-right">TOTAL</td>
                            <td className="px-4 py-3 text-right">{fmt(data.total_invoice)}</td>
                            <td className="px-4 py-3 text-right text-red-300">{fmt(data.total_expense)}</td>
                            <td className="px-4 py-3 text-right text-green-300">{fmt(data.total_profit)}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <div className="flex gap-2 mt-3 justify-end">
                <a
                    href={exportUrl('pdf', channel, month, year)}
                    className="inline-flex items-center gap-1.5 text-xs bg-red-50 text-red-700 px-3 py-1.5 rounded border border-red-200 hover:bg-red-100 transition-colors"
                >
                    <FileText size={13} /> Export PDF
                </a>
                <a
                    href={exportUrl('excel', channel, month, year)}
                    className="inline-flex items-center gap-1.5 text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded border border-green-200 hover:bg-green-100 transition-colors"
                >
                    <FileSpreadsheet size={13} /> Export Excel
                </a>
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ChannelReport({
    filters, channels, google_bill, klook_bookings, months, years,
}: Props) {
    const [filterData, setFilterData] = useState(filters);
    const [activeTab, setActiveTab]   = useState<string>('net-profit');
    const [setupOpen, setSetupOpen]   = useState(!google_bill);
    const [tagState, setTagState]     = useState<Record<number, string>>(() => {
        const s: Record<number, string> = {};
        klook_bookings.forEach(b => { s[b.id] = b.resolved_channel; });
        return s;
    });
    const [savingTag, setSavingTag] = useState<number | null>(null);

    // Google bills local state so Net Profit updates immediately after save
    const [billCloud,   setBillCloud]   = useState(google_bill?.google_cloud ?? 0);
    const [billAds,     setBillAds]     = useState(google_bill?.google_ads   ?? 0);
    const [billSaving,  setBillSaving]  = useState(false);
    const [billSaved,   setBillSaved]   = useState(!!google_bill);

    const applyFilter = () =>
        router.get('/finance/channel-revenue-report', filterData, { preserveState: true, replace: true });

    const saveGoogleBill = async (e: React.FormEvent) => {
        e.preventDefault();
        setBillSaving(true);
        try {
            await axios.post('/finance/channel-revenue-report/google-bill', {
                month:        filterData.month,
                year:         filterData.year,
                google_cloud: billCloud,
                google_ads:   billAds,
            });
            setBillSaved(true);
        } finally {
            setBillSaving(false);
        }
    };

    const updateTag = async (bookingId: number, newTag: string) => {
        setSavingTag(bookingId);
        setTagState(prev => ({ ...prev, [bookingId]: newTag }));
        await axios.post('/finance/channel-revenue-report/channel-tag', {
            booking_id:  bookingId,
            channel_tag: newTag === 'klook' ? null : newTag,
        });
        setSavingTag(null);
    };

    // ── Computed — use local bill state so values update instantly after save ──
    const googleCloud        = billCloud;
    const googleAds          = billAds;
    const totalExpenseGoogle = googleCloud + googleAds;
    const totalRevenue       = CHANNEL_KEYS.reduce((s, k) => s + channels[k].total_profit, 0);
    const netProfit          = totalRevenue - totalExpenseGoogle;
    const share5pct          = Math.round(netProfit * 0.05);

    const activeChannels = CHANNEL_KEYS.filter(k => channels[k].bookings.length > 0);
    const periodLabel    = `${months.find(m => m.value === filterData.month)?.label ?? filterData.month} ${filterData.year}`;

    const TABS = [
        { key: 'net-profit', label: 'Net Profit Summary' },
        ...activeChannels.map(k => ({ key: k, label: CHANNEL_LABELS[k] })),
    ];

    return (
        <Main>
            <Head title="Channel Revenue Report" />
            <div className="space-y-5">

                {/* ── Header ── */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-700 text-white px-6 py-5 rounded-xl shadow-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <BarChart3 size={24} />
                                Channel Revenue Report
                            </h1>
                            <p className="mt-1 text-slate-300 text-sm">
                                Profit per order channel — {periodLabel}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <a
                                href={exportUrl('pdf', 'net-profit', filterData.month, filterData.year)}
                                className="inline-flex items-center gap-1.5 bg-red-500 hover:bg-red-400 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                            >
                                <FileText size={14} /> Net Profit PDF
                            </a>
                            <a
                                href={exportUrl('excel', 'net-profit', filterData.month, filterData.year)}
                                className="inline-flex items-center gap-1.5 bg-green-500 hover:bg-green-400 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                            >
                                <FileSpreadsheet size={14} /> Net Profit Excel
                            </a>
                        </div>
                    </div>
                </div>

                {/* ── Period Filter ── */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                    <div className="flex flex-wrap items-end gap-3">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-medium">Month</label>
                            <select
                                value={filterData.month}
                                onChange={e => setFilterData(p => ({ ...p, month: e.target.value }))}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-44 focus:outline-none focus:ring-2 focus:ring-slate-500"
                            >
                                {months.map(m => (
                                    <option key={m.value} value={m.value}>{m.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1 font-medium">Year</label>
                            <select
                                value={filterData.year}
                                onChange={e => setFilterData(p => ({ ...p, year: e.target.value }))}
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:ring-2 focus:ring-slate-500"
                            >
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <button
                            onClick={applyFilter}
                            className="bg-slate-700 hover:bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Apply
                        </button>
                    </div>
                </div>

                {/* ── Setup Panel ── */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <button
                        onClick={() => setSetupOpen(o => !o)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-2 font-semibold text-gray-700">
                            <Settings2 size={17} className="text-slate-500" />
                            Setup & Classification
                            {!billSaved && (
                                <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                    Google bills belum disimpan
                                </span>
                            )}
                        </div>
                        {setupOpen
                            ? <ChevronUp size={17} className="text-gray-400" />
                            : <ChevronDown size={17} className="text-gray-400" />}
                    </button>

                    {setupOpen && (
                        <div className="px-5 pb-6 space-y-8 border-t border-gray-100 pt-5">

                            {/* Google Bills */}
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <DollarSign size={15} className="text-slate-400" />
                                    Google Bills — {periodLabel}
                                </h3>
                                <form onSubmit={saveGoogleBill} className="flex flex-wrap gap-4 items-end">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Google Cloud Bill (Rp)</label>
                                        <CurrencyInput
                                            value={billCloud}
                                            onChange={v => { setBillCloud(v); setBillSaved(false); }}
                                            placeholder="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Google Ads (Rp)</label>
                                        <CurrencyInput
                                            value={billAds}
                                            onChange={v => { setBillAds(v); setBillSaved(false); }}
                                            placeholder="0"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={billSaving}
                                        className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                                    >
                                        {billSaving
                                            ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
                                            : 'Save Bills'
                                        }
                                    </button>
                                    {billSaved && !billSaving && (
                                        <span className="text-xs text-green-600 flex items-center gap-1 self-center">
                                            <Check size={14} />
                                            Tersimpan — Cloud: Rp {fmt(billCloud)} · Ads: Rp {fmt(billAds)}
                                        </span>
                                    )}
                                </form>
                            </div>

                            {/* Booking Classification */}
                            {klook_bookings.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                        <Tag size={15} className="text-slate-400" />
                                        KLOOK Booking Classification — {periodLabel}
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-3">
                                        Bookings with invoice code starting with{' '}
                                        <code className="bg-gray-100 px-1 rounded text-violet-700">GYG</code>{' '}
                                        are auto-classified as <strong>GetYourGuide</strong>.
                                        Click a button to manually override the channel for any booking.
                                    </p>
                                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                                        <table className="min-w-full text-xs">
                                            <thead>
                                                <tr className="bg-gray-50 text-gray-500 uppercase tracking-wide text-xs">
                                                    <th className="px-3 py-2 text-left">Invoice / Booking Code</th>
                                                    <th className="px-3 py-2 text-left">Customer</th>
                                                    <th className="px-3 py-2 text-center">Pax</th>
                                                    <th className="px-3 py-2 text-left">Trip Date</th>
                                                    <th className="px-3 py-2 text-right">Profit (Rp)</th>
                                                    <th className="px-3 py-2 text-center min-w-[260px]">Channel Assignment</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {klook_bookings.map(b => (
                                                    <tr key={b.id} className="hover:bg-gray-50">
                                                        <td className="px-3 py-2.5 font-mono text-gray-600">
                                                            {b.invoice_code_origin ?? '—'}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-gray-800">{b.customer}</td>
                                                        <td className="px-3 py-2.5 text-center text-gray-600">{b.total_pax}</td>
                                                        <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{b.trip_date}</td>
                                                        <td className="px-3 py-2.5 text-right font-semibold text-green-700">{fmt(b.profit)}</td>
                                                        <td className="px-3 py-2.5 text-center">
                                                            <div className="flex gap-1 justify-center flex-wrap">
                                                                {TAG_OPTIONS.map(opt => {
                                                                    const isActive = tagState[b.id] === opt.value;
                                                                    const isSaving = savingTag === b.id;
                                                                    return (
                                                                        <button
                                                                            key={opt.value}
                                                                            onClick={() => !isSaving && updateTag(b.id, opt.value)}
                                                                            disabled={isSaving}
                                                                            className={`px-2 py-1 rounded-full border font-medium transition-all text-xs ${opt.cls} ${
                                                                                isActive
                                                                                    ? 'ring-2 ring-offset-1 ring-current font-bold'
                                                                                    : 'opacity-50'
                                                                            }`}
                                                                        >
                                                                            {isActive && (isSaving ? '…' : '✓ ')}{opt.label}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Report Tabs ── */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* Tab Bar */}
                    <div className="flex overflow-x-auto border-b border-gray-200 bg-gray-50">
                        {TABS.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                                    activeTab === tab.key
                                        ? 'border-slate-700 text-slate-800 bg-white'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white'
                                }`}
                            >
                                {tab.key !== 'net-profit' && (
                                    <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${CHANNEL_COLORS[tab.key]?.dot}`} />
                                )}
                                {tab.label}
                                {tab.key !== 'net-profit' && channels[tab.key as ChannelKey].bookings.length > 0 && (
                                    <span className="ml-1.5 text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full">
                                        {channels[tab.key as ChannelKey].bookings.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="p-5">

                        {/* ── Net Profit Tab ── */}
                        {activeTab === 'net-profit' && (
                            <div className="space-y-6">

                                {/* Revenue by Channel */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Revenue by Channel</h3>
                                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                                        <table className="min-w-full text-sm">
                                            <thead>
                                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                                                    <th className="px-4 py-3 text-left">Channel</th>
                                                    <th className="px-4 py-3 text-right">Invoice (Rp)</th>
                                                    <th className="px-4 py-3 text-right">Expense (Rp)</th>
                                                    <th className="px-4 py-3 text-right font-semibold">Profit (Rp)</th>
                                                    <th className="px-4 py-3 text-center">Bookings</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {CHANNEL_KEYS.map(k => {
                                                    const c = channels[k];
                                                    if (c.bookings.length === 0) return null;
                                                    const col = CHANNEL_COLORS[k];
                                                    return (
                                                        <tr
                                                            key={k}
                                                            className="hover:bg-gray-50 cursor-pointer"
                                                            onClick={() => setActiveTab(k)}
                                                        >
                                                            <td className="px-4 py-3">
                                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${col.badge}`}>
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />
                                                                    {CHANNEL_LABELS[k]}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 text-right text-gray-700">{fmt(c.total_invoice)}</td>
                                                            <td className="px-4 py-3 text-right text-red-600">{fmt(c.total_expense)}</td>
                                                            <td className="px-4 py-3 text-right font-semibold text-green-700">{fmt(c.total_profit)}</td>
                                                            <td className="px-4 py-3 text-center text-gray-500">{c.bookings.length}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                            <tfoot>
                                                <tr className="bg-amber-50 font-semibold text-amber-900 border-t-2 border-amber-200">
                                                    <td className="px-4 py-3">Total Revenue (Profit)</td>
                                                    <td className="px-4 py-3 text-right text-gray-400">—</td>
                                                    <td className="px-4 py-3 text-right text-gray-400">—</td>
                                                    <td className="px-4 py-3 text-right text-lg">{fmt(totalRevenue)}</td>
                                                    <td />
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>

                                {/* Operational Expenses */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Operational Expenses</h3>
                                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                                        <table className="min-w-full text-sm">
                                            <thead>
                                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                                                    <th className="px-4 py-3 text-left">Description</th>
                                                    <th className="px-4 py-3 text-right">Amount (Rp)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                <tr className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-gray-700">Google Cloud Bill</td>
                                                    <td className="px-4 py-3 text-right text-red-600">
                                                        {billCloud > 0
                                                            ? fmt(billCloud)
                                                            : <span className="text-gray-400 italic">Not set</span>}
                                                    </td>
                                                </tr>
                                                <tr className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-gray-700">Google Ads</td>
                                                    <td className="px-4 py-3 text-right text-red-600">
                                                        {billAds > 0
                                                            ? fmt(billAds)
                                                            : <span className="text-gray-400 italic">Not set</span>}
                                                    </td>
                                                </tr>
                                            </tbody>
                                            <tfoot>
                                                <tr className="bg-red-50 font-semibold text-red-800 border-t-2 border-red-200">
                                                    <td className="px-4 py-3">Total Expense</td>
                                                    <td className="px-4 py-3 text-right">{fmt(totalExpenseGoogle)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                    {!billSaved && (
                                        <p className="mt-2 text-xs text-amber-600 flex items-center gap-1">
                                            <AlertCircle size={12} />
                                            Google bills belum disimpan. Buka panel Setup di atas, input jumlah, lalu klik Save Bills.
                                        </p>
                                    )}
                                </div>

                                {/* Net Profit Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-xl p-5 shadow-md">
                                        <p className="text-green-100 text-xs font-semibold uppercase tracking-widest mb-1">Net Profit</p>
                                        <p className="text-3xl font-bold">Rp {fmt(netProfit)}</p>
                                        <p className="text-green-200 text-xs mt-2">
                                            {fmt(totalRevenue)} − {fmt(totalExpenseGoogle)}
                                        </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-slate-700 to-slate-800 text-white rounded-xl p-5 shadow-md">
                                        <p className="text-slate-300 text-xs font-semibold uppercase tracking-widest mb-1">5% Share</p>
                                        <p className="text-3xl font-bold">Rp {fmt(share5pct)}</p>
                                        <p className="text-slate-400 text-xs mt-2">5% × {fmt(netProfit)}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Channel Detail Tabs ── */}
                        {activeChannels.map(ch =>
                            activeTab === ch ? (
                                <div key={ch}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className={`w-3 h-3 rounded-full ${CHANNEL_COLORS[ch].dot}`} />
                                        <h3 className="font-semibold text-gray-800">
                                            {CHANNEL_LABELS[ch]} Booking Summary — {periodLabel}
                                        </h3>
                                    </div>
                                    <BookingTable
                                        channel={ch}
                                        data={channels[ch]}
                                        month={filterData.month}
                                        year={filterData.year}
                                    />
                                </div>
                            ) : null
                        )}
                    </div>
                </div>

            </div>
        </Main>
    );
}

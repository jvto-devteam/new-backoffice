import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Main from '@/Layouts/Main';
import { ArrowLeft, Calendar, TrendingDown, Eye, FileText, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface HotelDebt {
    id: number; booking_id: number; customer: string; channel: string; pax: number;
    travel_date: string; check_in: string;
    rooms: { room: string; quantity: number; price: number; subtotal: number }[];
    room_total: number;
    meals: { meals: string; quantity: number; price: number; subtotal: number }[];
    meals_total: number; total: number; type: 'hotel';
}
interface BromoDebt {
    id: number; booking_id: number; customer: string; channel: string; pax: number;
    travel_date: string; activity_date: string;
    bromo_ticket: number; jeep_unit: number; bromo_jeep: number; total: number; type: 'bromo';
}
interface ActivityDebt {
    id: number; booking_id: number; customer: string; channel: string; pax: number;
    travel_date: string; activity_date: string; activity: string; qty: number; total: number; type: 'activity';
}
interface CarDebt {
    id: number; booking_id: number; customer: string; channel: string; pax: number;
    travel_date: string; car: string; qty: number; driver: string; total: number; type: 'car';
}
interface OthersDebt {
    id: number; booking_id: number; customer: string; channel: string; pax: number;
    travel_date: string; item: string; qty: number; price: number; total: number; type: 'others';
}
type Debt = HotelDebt | BromoDebt | ActivityDebt | CarDebt | OthersDebt;

interface Props {
    vendor: { id: number; name: string; category: string };
    debts: Debt[];
    total_hutang: number;
    formatted_total: string;
    filters: { month: string; year: string };
    months: { value: string; label: string }[];
    years: number[];
}

const MONTH_LABELS: Record<string, string> = {
    '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April',
    '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Agustus',
    '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember',
};

const formatRp = (amount: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(amount);

export default function RekapHutangDetail({ vendor, debts, formatted_total, filters, months, years }: Props) {
    const [filterData, setFilterData] = useState({ month: filters.month, year: filters.year });

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
        setFilterData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const applyFilters = () =>
        router.get(`/finance/rekap-hutang/${vendor.id}`, filterData, { preserveState: true, replace: true });

    const periodLabel = `${MONTH_LABELS[filterData.month] ?? filterData.month} ${filterData.year}`;
    const debtType = debts.length > 0 ? debts[0].type : null;

    const exportUrl = (fmt: string) =>
        `/finance/rekap-hutang/${vendor.id}/export-${fmt}?month=${filterData.month}&year=${filterData.year}`;

    return (
        <Main>
            <Head title={`Rekap Hutang – ${vendor.name}`} />
            <div className="p-6">

                <div className="mb-4">
                    <Link
                        href={`/finance/rekap-hutang?month=${filters.month}&year=${filters.year}`}
                        className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
                    >
                        <ArrowLeft size={16} />
                        Kembali ke Rekap Hutang
                    </Link>
                </div>

                {/* Header */}
                <div className="bg-indigo-700 text-white px-6 py-4 rounded-t-lg shadow-md">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <TrendingDown size={24} />
                                {vendor.name}
                            </h1>
                            <p className="mt-1 text-indigo-200 text-sm">
                                {vendor.category} · Detail hutang periode {periodLabel}
                            </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="text-right">
                                <p className="text-indigo-300 text-xs font-medium uppercase tracking-wide">Total Hutang</p>
                                <p className="text-2xl font-bold">{formatted_total}</p>
                            </div>
                            <div className="flex gap-2">
                                <a
                                    href={exportUrl('pdf')}
                                    target="_blank"
                                    className="inline-flex items-center gap-1.5 bg-white text-indigo-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-indigo-50 transition-colors"
                                >
                                    <FileText size={14} />
                                    PDF
                                </a>
                                <a
                                    href={exportUrl('excel')}
                                    className="inline-flex items-center gap-1.5 bg-emerald-500 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-emerald-600 transition-colors"
                                >
                                    <FileSpreadsheet size={14} />
                                    Excel
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter */}
                <div className="bg-white rounded-b-lg shadow-md px-6 py-4 mb-6">
                    <div className="flex flex-wrap items-end gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
                            <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
                                <Calendar size={16} className="text-gray-400 mr-2 shrink-0" />
                                <select
                                    name="month"
                                    value={filterData.month}
                                    onChange={handleFilterChange}
                                    className="bg-transparent text-sm text-gray-900 focus:outline-none"
                                >
                                    {months.map(m => (
                                        <option key={m.value} value={m.value}>{m.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                            <select
                                name="year"
                                value={filterData.year}
                                onChange={handleFilterChange}
                                className="w-28 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                {years.map(y => (
                                    <option key={y} value={String(y)}>{y}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={applyFilters}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 transition-colors"
                        >
                            Tampilkan
                        </button>
                    </div>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-5 border-l-4 border-indigo-500">
                        <p className="text-sm text-gray-500 font-medium">Total Hutang</p>
                        <p className="text-2xl font-bold text-indigo-700 mt-1">{formatted_total}</p>
                        <p className="text-xs text-gray-400 mt-1">{periodLabel}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-5 border-l-4 border-orange-500">
                        <p className="text-sm text-gray-500 font-medium">Jumlah Booking</p>
                        <p className="text-2xl font-bold text-orange-600 mt-1">{debts.length}</p>
                        <p className="text-xs text-gray-400 mt-1">Transaksi belum terbayar</p>
                    </div>
                    <div className="bg-white rounded-lg shadow p-5 border-l-4 border-amber-500">
                        <p className="text-sm text-gray-500 font-medium">Total Pax</p>
                        <p className="text-2xl font-bold text-amber-600 mt-1">
                            {debts.reduce((s, d) => s + (d.pax || 0), 0)}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Dari seluruh booking</p>
                    </div>
                </div>

                {/* Detail Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800">Detail Hutang – {vendor.name}</h2>
                        <p className="text-sm text-gray-500 mt-1">Periode {periodLabel}</p>
                    </div>

                    {debts.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center text-gray-400">
                                <AlertCircle size={40} className="mb-3" />
                                <p className="text-gray-600 font-medium">Tidak ada hutang</p>
                                <p className="text-sm mt-1">Tidak ditemukan hutang aktif untuk periode {periodLabel}</p>
                            </div>
                        </div>
                    ) : debtType === 'hotel' ? (
                        <HotelTable debts={debts as HotelDebt[]} formatted_total={formatted_total} />
                    ) : debtType === 'bromo' ? (
                        <BromoTable debts={debts as BromoDebt[]} formatted_total={formatted_total} />
                    ) : debtType === 'activity' ? (
                        <ActivityTable debts={debts as ActivityDebt[]} formatted_total={formatted_total} />
                    ) : debtType === 'car' ? (
                        <CarTable debts={debts as CarDebt[]} formatted_total={formatted_total} />
                    ) : (
                        <OthersTable debts={debts as OthersDebt[]} formatted_total={formatted_total} />
                    )}
                </div>

            </div>
        </Main>
    );
}

// ── Sub-table components ──────────────────────────────────────────────────────

const TH = ({ children, right = false }: { children: React.ReactNode; right?: boolean }) => (
    <th className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 ${right ? 'text-right' : 'text-left'}`}>
        {children}
    </th>
);

const ActionLink = ({ bookingId }: { bookingId: number }) => (
    <a
        href={`/finance/expense-manager/${bookingId}/edit`}
        target="_blank"
        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-colors"
    >
        <Eye size={12} /> Lihat
    </a>
);

const TotalRow = ({ colSpan, total }: { colSpan: number; total: string }) => (
    <tr className="bg-indigo-700">
        <td colSpan={colSpan} className="px-4 py-3 text-right text-sm font-bold text-white">Total Hutang</td>
        <td className="px-4 py-3 text-right text-sm font-bold text-white">{total}</td>
        <td></td>
    </tr>
);

const GuestCell = ({ customer, travel_date, pax, channel }: { customer: string; travel_date: string; pax: number; channel: string }) => (
    <td className="px-4 py-3">
        <p className="font-semibold text-gray-900 text-sm">{customer}</p>
        <p className="text-xs text-gray-500">{travel_date} · {pax} pax · {channel}</p>
    </td>
);

function HotelTable({ debts, formatted_total }: { debts: HotelDebt[]; formatted_total: string }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead><tr>
                    <TH>No</TH><TH>Tamu / Booking</TH><TH>Check-in</TH><TH>Kamar</TH>
                    <TH right>Total Kamar</TH><TH right>Total Makan</TH><TH right>Total</TH><TH>Aksi</TH>
                </tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {debts.map((d, idx) => (
                        <tr key={d.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-500 text-sm">{idx + 1}</td>
                            <GuestCell customer={d.customer} travel_date={d.travel_date} pax={d.pax} channel={d.channel} />
                            <td className="px-4 py-3 text-gray-700 text-sm">{d.check_in}</td>
                            <td className="px-4 py-3 text-sm">
                                {d.rooms.map((r, i) => <p key={i} className="text-xs text-gray-600">{r.room} ×{r.quantity}</p>)}
                            </td>
                            <td className="px-4 py-3 text-right text-gray-700 text-sm">{formatRp(d.room_total)}</td>
                            <td className="px-4 py-3 text-right text-gray-700 text-sm">{formatRp(d.meals_total)}</td>
                            <td className="px-4 py-3 text-right font-bold text-gray-900 text-sm">{formatRp(d.total)}</td>
                            <td className="px-4 py-3 text-center"><ActionLink bookingId={d.booking_id} /></td>
                        </tr>
                    ))}
                    <TotalRow colSpan={6} total={formatted_total} />
                </tbody>
            </table>
        </div>
    );
}

function BromoTable({ debts, formatted_total }: { debts: BromoDebt[]; formatted_total: string }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead><tr>
                    <TH>No</TH><TH>Tamu / Booking</TH><TH>Tgl Aktivitas</TH>
                    <TH right>Tiket Bromo</TH>
                    <TH right>Jeep ({debts.reduce((s, d) => s + d.jeep_unit, 0)} unit)</TH>
                    <TH right>Total</TH><TH>Aksi</TH>
                </tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {debts.map((d, idx) => (
                        <tr key={d.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-500 text-sm">{idx + 1}</td>
                            <GuestCell customer={d.customer} travel_date={d.travel_date} pax={d.pax} channel={d.channel} />
                            <td className="px-4 py-3 text-gray-700 text-sm">{d.activity_date}</td>
                            <td className="px-4 py-3 text-right text-gray-700 text-sm">{formatRp(d.bromo_ticket)}</td>
                            <td className="px-4 py-3 text-right text-gray-700 text-sm">{formatRp(d.bromo_jeep)}</td>
                            <td className="px-4 py-3 text-right font-bold text-gray-900 text-sm">{formatRp(d.total)}</td>
                            <td className="px-4 py-3 text-center"><ActionLink bookingId={d.booking_id} /></td>
                        </tr>
                    ))}
                    <TotalRow colSpan={5} total={formatted_total} />
                </tbody>
            </table>
        </div>
    );
}

function ActivityTable({ debts, formatted_total }: { debts: ActivityDebt[]; formatted_total: string }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead><tr>
                    <TH>No</TH><TH>Tamu / Booking</TH><TH>Tgl Aktivitas</TH><TH>Aktivitas</TH>
                    <TH right>Qty</TH><TH right>Total</TH><TH>Aksi</TH>
                </tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {debts.map((d, idx) => (
                        <tr key={d.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-500 text-sm">{idx + 1}</td>
                            <GuestCell customer={d.customer} travel_date={d.travel_date} pax={d.pax} channel={d.channel} />
                            <td className="px-4 py-3 text-gray-700 text-sm">{d.activity_date}</td>
                            <td className="px-4 py-3 text-gray-700 text-sm">{d.activity}</td>
                            <td className="px-4 py-3 text-right text-gray-700 text-sm">{d.qty}</td>
                            <td className="px-4 py-3 text-right font-bold text-gray-900 text-sm">{formatRp(d.total)}</td>
                            <td className="px-4 py-3 text-center"><ActionLink bookingId={d.booking_id} /></td>
                        </tr>
                    ))}
                    <TotalRow colSpan={5} total={formatted_total} />
                </tbody>
            </table>
        </div>
    );
}

function CarTable({ debts, formatted_total }: { debts: CarDebt[]; formatted_total: string }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead><tr>
                    <TH>No</TH><TH>Tamu / Booking</TH><TH>Kendaraan</TH><TH>Driver</TH>
                    <TH right>Qty</TH><TH right>Total</TH><TH>Aksi</TH>
                </tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {debts.map((d, idx) => (
                        <tr key={d.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-500 text-sm">{idx + 1}</td>
                            <GuestCell customer={d.customer} travel_date={d.travel_date} pax={d.pax} channel={d.channel} />
                            <td className="px-4 py-3 text-gray-700 text-sm">{d.car}</td>
                            <td className="px-4 py-3 text-gray-700 text-sm">{d.driver}</td>
                            <td className="px-4 py-3 text-right text-gray-700 text-sm">{d.qty}</td>
                            <td className="px-4 py-3 text-right font-bold text-gray-900 text-sm">{formatRp(d.total)}</td>
                            <td className="px-4 py-3 text-center"><ActionLink bookingId={d.booking_id} /></td>
                        </tr>
                    ))}
                    <TotalRow colSpan={5} total={formatted_total} />
                </tbody>
            </table>
        </div>
    );
}

function OthersTable({ debts, formatted_total }: { debts: OthersDebt[]; formatted_total: string }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead><tr>
                    <TH>No</TH><TH>Tamu / Booking</TH><TH>Item</TH>
                    <TH right>Qty</TH><TH right>Harga</TH><TH right>Total</TH><TH>Aksi</TH>
                </tr></thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {debts.map((d, idx) => (
                        <tr key={d.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-gray-500 text-sm">{idx + 1}</td>
                            <GuestCell customer={d.customer} travel_date={d.travel_date} pax={d.pax} channel={d.channel} />
                            <td className="px-4 py-3 text-gray-700 text-sm">{d.item}</td>
                            <td className="px-4 py-3 text-right text-gray-700 text-sm">{d.qty}</td>
                            <td className="px-4 py-3 text-right text-gray-700 text-sm">{formatRp(d.price)}</td>
                            <td className="px-4 py-3 text-right font-bold text-gray-900 text-sm">{formatRp(d.total)}</td>
                            <td className="px-4 py-3 text-center"><ActionLink bookingId={d.booking_id} /></td>
                        </tr>
                    ))}
                    <TotalRow colSpan={5} total={formatted_total} />
                </tbody>
            </table>
        </div>
    );
}

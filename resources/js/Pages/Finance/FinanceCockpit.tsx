import { useState } from 'react';
import { Head } from '@inertiajs/react';
import Main from '@/Layouts/Main';
import {
    AlertTriangle, CheckCircle, DollarSign,
    TrendingDown, TrendingUp, Users
} from 'lucide-react';
import CrewTransferModal from './components/CrewTransferModal';

interface BookingInfo {
    id: number;
    booking_code: string;
    customer: string;
    package: string;
    travel_date_start: string;
    travel_date_end: string | null;
    total_pax: number;
    channel: string;
    crew_transfer_status: 'pending' | 'transferred';
    crew_transfer_date: string | null;
    crew_transfer_proof: string | null;
}

interface Summary {
    revenue: number;
    total_expense: number;
    margin: number;
    margin_pct: number;
    outstanding_debt: number;
}

interface ExpenseRow {
    type: 'hotel' | 'activity' | 'car' | 'crew' | 'others' | 'additional';
    description: string;
    amount: number;
    is_debt: boolean;
    is_paid: boolean;
}

interface CustomerPayment {
    date: string;
    method: string;
    amount: number;
}

interface VendorPayment {
    payment_number: string;
    vendor_name: string;
    amount: number;
    payment_date: string;
    method: string;
    proof_url: string | null;
}

interface Props {
    booking: BookingInfo;
    summary: Summary;
    expense_rows: ExpenseRow[];
    customer_payments: CustomerPayment[];
    customer_payment_total: number;
    vendor_payments: VendorPayment[];
    total_crew_expense: number;
}

const rp = (v: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(v);

const CHANNEL_COLORS: Record<string, string> = {
    TWT: 'bg-blue-100 text-blue-700',
    KLOOK: 'bg-orange-100 text-orange-700',
    JVTO: 'bg-indigo-100 text-indigo-700',
};

const TYPE_ICONS: Record<string, string> = {
    hotel: '🏨', activity: '📍', car: '🚗',
    crew: '👤', others: '📦', additional: '➕',
};

function StatusBadge({ isDebt, isPaid }: { isDebt: boolean; isPaid: boolean }) {
    if (!isDebt) {
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                INTERNAL
            </span>
        );
    }
    if (isPaid) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                <CheckCircle size={11} /> LUNAS
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
            <AlertTriangle size={11} /> HUTANG
        </span>
    );
}

export default function FinanceCockpit({
    booking,
    summary,
    expense_rows,
    customer_payments,
    customer_payment_total,
    vendor_payments,
    total_crew_expense,
}: Props) {
    const [showCrewModal, setShowCrewModal] = useState(false);

    const hubUrl = `/finance/hub?month=${booking.travel_date_start?.slice(5, 7) ?? ''}&year=${booking.travel_date_start?.slice(0, 4) ?? ''}`;

    return (
        <Main>
            <Head title={`Finance Cockpit — ${booking.booking_code}`} />
            <div className="p-6 space-y-5">

                {/* Nav bar */}
                <div className="flex items-center justify-between bg-white rounded-xl shadow px-5 py-3">
                    <a href={hubUrl} className="text-sm text-indigo-600 hover:underline">
                        ← Finance Hub
                    </a>
                    <div className="flex items-center gap-2">
                        <a
                            href={`/finance/expense-manager/${booking.id}/edit`}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
                        >
                            Edit Expense
                        </a>
                        <a
                            href={`/bookings/details/${booking.id}`}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
                        >
                            Lihat Booking
                        </a>
                    </div>
                </div>

                {/* Booking header */}
                <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 text-white px-6 py-4 rounded-xl shadow">
                    <div className="flex items-center gap-2 mb-1">
                        <h1 className="text-xl font-bold">{booking.booking_code}</h1>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${CHANNEL_COLORS[booking.channel] ?? 'bg-gray-100 text-gray-600'}`}>
                            {booking.channel}
                        </span>
                    </div>
                    <p className="text-indigo-100 text-sm">{booking.customer} · {booking.package}</p>
                    <p className="text-indigo-200 text-xs mt-1">
                        {booking.travel_date_start}
                        {booking.travel_date_end ? ` – ${booking.travel_date_end}` : ''}
                        {' · '}{booking.total_pax} pax
                    </p>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Revenue', value: rp(summary.revenue), Icon: DollarSign, border: 'border-blue-500', text: 'text-blue-700' },
                        { label: 'Total Expense', value: rp(summary.total_expense), Icon: TrendingDown, border: 'border-orange-500', text: 'text-orange-700' },
                        {
                            label: 'Margin',
                            value: `${rp(summary.margin)} (${summary.margin_pct}%)`,
                            Icon: TrendingUp,
                            border: summary.margin >= 0 ? 'border-green-500' : 'border-red-500',
                            text: summary.margin >= 0 ? 'text-green-700' : 'text-red-700',
                        },
                        { label: 'Hutang Outstanding', value: rp(summary.outstanding_debt), Icon: AlertTriangle, border: 'border-red-500', text: 'text-red-700' },
                    ].map(card => (
                        <div key={card.label} className={`bg-white rounded-xl shadow p-5 border-l-4 ${card.border}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <card.Icon size={15} className={card.text} />
                                <p className="text-xs text-gray-500">{card.label}</p>
                            </div>
                            <p className={`text-lg font-bold ${card.text}`}>{card.value}</p>
                        </div>
                    ))}
                </div>

                {/* Expense items table */}
                <div className="bg-white rounded-xl shadow overflow-hidden">
                    <div className="px-5 py-3 border-b">
                        <h2 className="font-semibold text-sm text-gray-700">
                            Expense Items ({expense_rows.length})
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100 text-sm">
                            <thead className="bg-indigo-700 text-white text-xs uppercase">
                                <tr>
                                    {['Tipe', 'Deskripsi', 'Jumlah', 'Status'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {expense_rows.length === 0 && (
                                    <tr><td colSpan={4} className="text-center py-8 text-gray-400">Tidak ada expense</td></tr>
                                )}
                                {expense_rows.map((row, i) => (
                                    <tr key={i} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="mr-1">{TYPE_ICONS[row.type]}</span>
                                            <span className="text-gray-500 text-xs capitalize">{row.type}</span>
                                        </td>
                                        <td className="px-4 py-3">{row.description}</td>
                                        <td className="px-4 py-3 text-right font-medium">{rp(row.amount)}</td>
                                        <td className="px-4 py-3">
                                            <StatusBadge isDebt={row.is_debt} isPaid={row.is_paid} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Crew transfer section */}
                <div className="bg-white rounded-xl shadow px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Users size={16} className="text-indigo-600" />
                            <h2 className="font-semibold text-sm text-gray-700">Crew Transfer</h2>
                        </div>
                        {booking.crew_transfer_status === 'pending' && (
                            <button
                                onClick={() => setShowCrewModal(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            >
                                Tandai Transfer
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-6">
                        <div>
                            <p className="text-xs text-gray-500 mb-0.5">Total Crew Expense</p>
                            <p className="text-lg font-bold text-gray-800">{rp(total_crew_expense)}</p>
                        </div>
                        <div className="border-l pl-6">
                            <p className="text-xs text-gray-500 mb-0.5">Status</p>
                            {booking.crew_transfer_status === 'transferred' ? (
                                <div>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                                        <CheckCircle size={11} /> Sudah Transfer
                                    </span>
                                    {booking.crew_transfer_date && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {booking.crew_transfer_date}
                                            {booking.crew_transfer_proof && (
                                                <> ·{' '}
                                                    <a
                                                        href={booking.crew_transfer_proof}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-indigo-600 hover:underline"
                                                    >
                                                        lihat bukti
                                                    </a>
                                                </>
                                            )}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                                    <AlertTriangle size={11} /> Belum Transfer
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* History tables */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* Customer payments */}
                    <div className="bg-white rounded-xl shadow overflow-hidden">
                        <div className="px-5 py-3 border-b flex items-center justify-between">
                            <h2 className="font-semibold text-sm text-gray-700">Pembayaran Customer</h2>
                            <span className="text-xs text-gray-500">Total: {rp(customer_payment_total)}</span>
                        </div>
                        {customer_payments.length === 0 ? (
                            <p className="text-center py-6 text-gray-400 text-sm">Belum ada pembayaran</p>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-100 text-sm">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                    <tr>
                                        {['Tanggal', 'Metode', 'Jumlah'].map(h => (
                                            <th key={h} className="px-4 py-2 text-left">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {customer_payments.map((p, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 text-gray-500">{p.date}</td>
                                            <td className="px-4 py-2">{p.method}</td>
                                            <td className="px-4 py-2 text-right font-medium text-green-700">{rp(p.amount)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Vendor payments */}
                    <div className="bg-white rounded-xl shadow overflow-hidden">
                        <div className="px-5 py-3 border-b">
                            <h2 className="font-semibold text-sm text-gray-700">Pembayaran Vendor</h2>
                        </div>
                        {vendor_payments.length === 0 ? (
                            <p className="text-center py-6 text-gray-400 text-sm">Belum ada pembayaran vendor</p>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-100 text-sm">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                    <tr>
                                        {['No. Bayar', 'Vendor', 'Tgl', 'Jumlah', ''].map((h, i) => (
                                            <th key={i} className="px-4 py-2 text-left">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {vendor_payments.map((p, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-4 py-2 text-xs font-mono">{p.payment_number}</td>
                                            <td className="px-4 py-2">{p.vendor_name}</td>
                                            <td className="px-4 py-2 text-gray-500 text-xs">{p.payment_date}</td>
                                            <td className="px-4 py-2 text-right font-medium">{rp(p.amount)}</td>
                                            <td className="px-4 py-2">
                                                {p.proof_url && (
                                                    <a href={p.proof_url} target="_blank" rel="noreferrer"
                                                       className="text-xs text-indigo-600 hover:underline">
                                                        bukti
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {showCrewModal && (
                <CrewTransferModal
                    bookingId={booking.id}
                    totalCrewExpense={total_crew_expense}
                    onClose={() => setShowCrewModal(false)}
                />
            )}
        </Main>
    );
}

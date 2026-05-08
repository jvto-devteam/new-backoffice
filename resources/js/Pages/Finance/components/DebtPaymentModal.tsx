import { useEffect, useState } from 'react';
import axios from 'axios';

interface DebtItem {
    id: number;
    type: string;
    item_type: string;
    vendor_id: number | null;
    vendor_name: string;
    description: string;
    amount: number;
    booking_id: number;
}

interface PaymentMethod {
    id: number;
    name: string;
}

interface Props {
    booking: {
        id: number;
        booking_code: string;
        customer: string;
    };
    onClose: () => void;
    onSuccess: () => void;
}

const rp = (v: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(v);

export default function DebtPaymentModal({ booking, onClose, onSuccess }: Props) {
    const [items, setItems]         = useState<DebtItem[]>([]);
    const [paymentMethods, setPM]   = useState<PaymentMethod[]>([]);
    const [selected, setSelected]   = useState<Set<number>>(new Set());
    const [paymentDate, setDate]    = useState(new Date().toISOString().slice(0, 10));
    const [methodId, setMethodId]   = useState('');
    const [note, setNote]           = useState('');
    const [proofFile, setProof]     = useState<File | null>(null);
    const [loading, setLoading]     = useState(false);
    const [fetching, setFetching]   = useState(true);
    const [error, setError]         = useState('');

    useEffect(() => {
        setFetching(true);
        axios
            .get(`/finance/hub/${booking.id}/debt-items`)
            .then(r => {
                const enriched: DebtItem[] = r.data.items.map((i: DebtItem) => ({
                    ...i,
                    booking_id: booking.id,
                }));
                setItems(enriched);
                setPM(r.data.payment_methods);
                setSelected(new Set(enriched.map(i => i.id)));
            })
            .catch(() => setError('Gagal memuat item hutang.'))
            .finally(() => setFetching(false));
    }, [booking.id]);

    const selectedItems = items.filter(i => selected.has(i.id));
    const total         = selectedItems.reduce((s, i) => s + i.amount, 0);
    const vendorId      = selectedItems[0]?.vendor_id;

    const toggleItem = (id: number) => {
        setSelected(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const handleSubmit = async () => {
        setError('');
        if (!paymentDate || !methodId || selected.size === 0) {
            setError('Lengkapi semua field wajib dan pilih minimal 1 item.');
            return;
        }
        if (!vendorId) {
            setError('Vendor tidak ditemukan pada item terpilih.');
            return;
        }

        const fd = new FormData();
        fd.append('vendor_id',         String(vendorId));
        fd.append('payment_date',      paymentDate);
        fd.append('payment_method_id', methodId);
        fd.append('note',              note);
        fd.append('items',             JSON.stringify(selectedItems));
        if (proofFile) fd.append('payment_proof', proofFile);

        setLoading(true);
        try {
            await axios.post('/finance/hub/record-payment', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onSuccess();
        } catch (e: unknown) {
            const msg =
                e instanceof Error
                    ? e.message
                    : (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setError(msg ?? 'Gagal menyimpan pembayaran.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold">Catat Pembayaran Hutang</h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {booking.booking_code} — {booking.customer}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-4 overflow-y-auto flex-1 space-y-4">
                    {fetching && (
                        <p className="text-center text-gray-400 py-8">Memuat item hutang...</p>
                    )}

                    {!fetching && items.length === 0 && (
                        <p className="text-center text-gray-400 py-8">
                            Tidak ada hutang tersisa untuk booking ini.
                        </p>
                    )}

                    {!fetching && items.length > 0 && (
                        <>
                            {/* Item checklist */}
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                    Pilih item yang akan dibayar:
                                </p>
                                <div className="border rounded-lg divide-y">
                                    {items.map(item => (
                                        <label
                                            key={item.id}
                                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selected.has(item.id)}
                                                onChange={() => toggleItem(item.id)}
                                                className="w-4 h-4 accent-indigo-600"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {item.description}
                                                </p>
                                                <p className="text-xs text-gray-400">
                                                    {item.vendor_name} · {item.type}
                                                </p>
                                            </div>
                                            <p className="text-sm font-semibold text-red-600 whitespace-nowrap">
                                                {rp(item.amount)}
                                            </p>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Payment fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">
                                        Tanggal Bayar <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={paymentDate}
                                        onChange={e => setDate(e.target.value)}
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">
                                        Metode Pembayaran <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={methodId}
                                        onChange={e => setMethodId(e.target.value)}
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                                    >
                                        <option value="">-- Pilih --</option>
                                        {paymentMethods.map(pm => (
                                            <option key={pm.id} value={String(pm.id)}>
                                                {pm.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-1">
                                    Bukti Bayar (opsional)
                                </label>
                                <input
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={e => setProof(e.target.files?.[0] ?? null)}
                                    className="w-full text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Catatan</label>
                                <textarea
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    rows={2}
                                    className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                                />
                            </div>

                            {/* Total */}
                            <div className="flex items-center justify-between bg-indigo-50 rounded-lg px-4 py-3">
                                <p className="text-sm font-medium text-gray-700">
                                    Total Pembayaran ({selected.size} item)
                                </p>
                                <p className="text-lg font-bold text-indigo-700">{rp(total)}</p>
                            </div>
                        </>
                    )}

                    {error && (
                        <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || fetching || selected.size === 0}
                        className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Menyimpan...' : 'Simpan Pembayaran'}
                    </button>
                </div>
            </div>
        </div>
    );
}

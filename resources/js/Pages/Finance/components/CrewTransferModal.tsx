import { useState, FormEvent } from 'react';
import { router } from '@inertiajs/react';

interface Props {
    bookingId: number;
    totalCrewExpense: number;
    onClose: () => void;
}

const rp = (v: number) => 'Rp ' + new Intl.NumberFormat('id-ID').format(v);

export default function CrewTransferModal({ bookingId, totalCrewExpense, onClose }: Props) {
    const [transferDate, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [proofFile, setFile]    = useState<File | null>(null);
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!transferDate || !proofFile) {
            setError('Tanggal dan bukti transfer wajib diisi.');
            return;
        }

        const fd = new FormData();
        fd.append('transfer_date', transferDate);
        fd.append('proof_file', proofFile);

        setLoading(true);
        router.post(
            `/finance/cockpit/${bookingId}/crew-transfer`,
            fd,
            {
                forceFormData: true,
                onSuccess: () => { onClose(); },
                onError: (errors) => {
                    setError(Object.values(errors).join(' '));
                    setLoading(false);
                },
                onFinish: () => setLoading(false),
            }
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="px-6 py-4 border-b flex items-center justify-between">
                    <h2 className="text-base font-semibold">Tandai Crew Transfer</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">
                            Tanggal Transfer <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            value={transferDate}
                            onChange={e => setDate(e.target.value)}
                            className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 mb-1">
                            Bukti Transfer <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={e => setFile(e.target.files?.[0] ?? null)}
                            className="w-full text-sm"
                        />
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, atau PDF · max 5MB</p>
                    </div>

                    <div className="bg-indigo-50 rounded-lg px-4 py-3 flex items-center justify-between">
                        <span className="text-sm text-gray-600">Total Crew Expense</span>
                        <span className="font-bold text-indigo-700">{rp(totalCrewExpense)}</span>
                    </div>

                    {error && (
                        <p className="text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
                    )}

                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

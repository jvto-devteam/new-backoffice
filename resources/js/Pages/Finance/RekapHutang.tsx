import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import Main from '@/Layouts/Main';
import { Calendar, Eye, TrendingDown, Building2, AlertCircle, FileText, FileSpreadsheet } from 'lucide-react';

interface Vendor {
    id: number;
    name: string;
    category: string;
    category_id: number;
    total: number;
    item_count: number;
    formatted_total: string;
}

interface Month { value: string; label: string; }
interface Filters { month: string; year: string; }

interface Props {
    vendors: Vendor[];
    total_hutang: number;
    formatted_total: string;
    filters: Filters;
    months: Month[];
    years: number[];
}

const MONTH_LABELS: Record<string, string> = {
    '01': 'Januari', '02': 'Februari', '03': 'Maret', '04': 'April',
    '05': 'Mei', '06': 'Juni', '07': 'Juli', '08': 'Agustus',
    '09': 'September', '10': 'Oktober', '11': 'November', '12': 'Desember',
};

export default function RekapHutang({ vendors, formatted_total, filters, months, years }: Props) {
    const [filterData, setFilterData] = useState<Filters>({
        month: filters.month,
        year: filters.year,
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
        setFilterData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const applyFilters = () =>
        router.get('/finance/rekap-hutang', filterData, { preserveState: true, replace: true });

    const resetFilters = () => {
        const now = new Date();
        const reset: Filters = {
            month: String(now.getMonth() + 1).padStart(2, '0'),
            year: String(now.getFullYear()),
        };
        setFilterData(reset);
        router.get('/finance/rekap-hutang', reset, { preserveState: true, replace: true });
    };

    const periodLabel = `${MONTH_LABELS[filterData.month] ?? filterData.month} ${filterData.year}`;
    const exportBase = `/finance/rekap-hutang/export`;

    return (
        <Main>
            <Head title="Rekap Hutang" />
            <div className="p-6">

                {/* Header */}
                <div className="bg-indigo-700 text-white px-6 py-4 rounded-t-lg shadow-md">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <TrendingDown size={24} />
                                Rekap Hutang
                            </h1>
                            <p className="mt-1 text-indigo-200 text-sm">
                                Rekapitulasi hutang per vendor – {periodLabel}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <a
                                href={`/finance/rekap-hutang/export-pdf?month=${filterData.month}&year=${filterData.year}`}
                                target="_blank"
                                className="inline-flex items-center gap-1.5 bg-white text-indigo-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-indigo-50 transition-colors"
                            >
                                <FileText size={15} />
                                Export PDF
                            </a>
                            <a
                                href={`/finance/rekap-hutang/export-excel?month=${filterData.month}&year=${filterData.year}`}
                                className="inline-flex items-center gap-1.5 bg-emerald-500 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-emerald-600 transition-colors"
                            >
                                <FileSpreadsheet size={15} />
                                Export Excel
                            </a>
                        </div>
                    </div>
                </div>

                {/* Filter */}
                <div className="bg-white rounded-b-lg shadow-md px-6 py-5 mb-6">
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

                        <div className="flex gap-2">
                            <button
                                onClick={applyFilters}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 transition-colors"
                            >
                                Tampilkan
                            </button>
                            <button
                                onClick={resetFilters}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300 transition-colors"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-5 border-l-4 border-indigo-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Hutang</p>
                                <p className="text-2xl font-bold text-indigo-700 mt-1">{formatted_total}</p>
                                <p className="text-xs text-gray-400 mt-1">{periodLabel}</p>
                            </div>
                            <div className="bg-indigo-100 p-3 rounded-full">
                                <TrendingDown size={24} className="text-indigo-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-5 border-l-4 border-orange-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Jumlah Vendor</p>
                                <p className="text-2xl font-bold text-orange-600 mt-1">{vendors.length}</p>
                                <p className="text-xs text-gray-400 mt-1">Vendor dengan hutang aktif</p>
                            </div>
                            <div className="bg-orange-100 p-3 rounded-full">
                                <Building2 size={24} className="text-orange-500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-5 border-l-4 border-amber-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Total Item</p>
                                <p className="text-2xl font-bold text-amber-600 mt-1">
                                    {vendors.reduce((s, v) => s + v.item_count, 0)}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">Booking belum terbayar</p>
                            </div>
                            <div className="bg-amber-100 p-3 rounded-full">
                                <AlertCircle size={24} className="text-amber-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Rekap Hutang {periodLabel}
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-indigo-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-10">No</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Vendor</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Kategori</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Item</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">Total Hutang</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {vendors.length > 0 ? (
                                    <>
                                        {vendors.map((vendor, idx) => (
                                            <tr key={vendor.id} className="hover:bg-indigo-50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-semibold text-gray-900">{vendor.name}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
                                                        {vendor.category}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    {vendor.item_count} item
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-sm font-bold text-gray-800">{vendor.formatted_total}</span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Link
                                                        href={`/finance/rekap-hutang/${vendor.id}?month=${filterData.month}&year=${filterData.year}`}
                                                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-lg text-sm transition-colors"
                                                    >
                                                        <Eye size={14} />
                                                        Detail
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="bg-indigo-700">
                                            <td colSpan={4} className="px-6 py-4 text-sm font-bold text-white text-right">
                                                Total Hutang
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-sm font-bold text-white">{formatted_total}</span>
                                            </td>
                                            <td></td>
                                        </tr>
                                    </>
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <TrendingDown size={40} className="mb-3" />
                                                <p className="text-gray-600 font-medium">Tidak ada hutang</p>
                                                <p className="text-sm mt-1">Tidak ditemukan hutang aktif untuk periode {periodLabel}</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </Main>
    );
}

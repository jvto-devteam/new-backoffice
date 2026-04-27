import React, { useState, useEffect, useCallback } from 'react';
import Main from '@/Layouts/Main';
import { Link } from '@inertiajs/react';
import axios from 'axios';
import Chart from 'react-apexcharts';
import {
    Users, TrendingUp, Globe, Package, Download, Search,
    X, Eye, BarChart2, RefreshCw,
    Calendar, CreditCard, MessageSquare, Star, ChevronLeft, ChevronRight,
    FileText, FileSpreadsheet
} from 'lucide-react';

interface PackageItem { id: number; name: string; package_code: string; }
interface Country { id: number; long_name: string; }
interface Props {
    packages: PackageItem[];
    countries: Country[];
    years: number[];
}

type TabType = 'insights' | 'customers' | 'report';
type ChannelType = '' | '1' | '2';

const CHANNEL_LABELS: Record<ChannelType, string> = { '': 'All', '1': 'JVTO', '2': 'Klook' };

function formatIDR(val: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
}

function formatMonth(ym: string) {
    const [y, m] = ym.split('-');
    return new Date(+y, +m - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export default function CRMIndex({ packages, countries, years }: Props) {
    const [activeTab, setActiveTab] = useState<TabType>('insights');
    const [channel, setChannel] = useState<ChannelType>('');
    const [filterYear, setFilterYear] = useState<string>(years[0]?.toString() ?? '');
    const [filterMonth, setFilterMonth] = useState<string>('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [useDateRange, setUseDateRange] = useState(false);

    // Insights state
    const [insights, setInsights] = useState<any>(null);
    const [loadingInsights, setLoadingInsights] = useState(false);

    // Customers state
    const [customers, setCustomers] = useState<any>(null);
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [search, setSearch] = useState('');
    const [filterCountry, setFilterCountry] = useState('');
    const [filterPackage, setFilterPackage] = useState('');
    const [perPage, setPerPage] = useState(20);
    const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loadingProfile, setLoadingProfile] = useState(false);

    // Report tab state
    const [reportChannel, setReportChannel] = useState<ChannelType>('');
    const [reportCountry, setReportCountry] = useState('');
    const [reportPackage, setReportPackage] = useState('');
    const [reportCount, setReportCount] = useState<number | null>(null);

    const buildFilterParams = useCallback(() => {
        const p: any = { channel };
        if (useDateRange) {
            if (dateFrom) p.date_from = dateFrom;
            if (dateTo) p.date_to = dateTo;
        } else {
            if (filterYear) p.year = filterYear;
            if (filterMonth) p.month = filterMonth;
        }
        return p;
    }, [channel, useDateRange, dateFrom, dateTo, filterYear, filterMonth]);

    const loadInsights = useCallback(async () => {
        setLoadingInsights(true);
        try {
            const { data } = await axios.get('/crm/insights', { params: buildFilterParams() });
            setInsights(data);
        } finally {
            setLoadingInsights(false);
        }
    }, [buildFilterParams]);

    const loadCustomers = useCallback(async (pg = 1, pp = perPage) => {
        setLoadingCustomers(true);
        try {
            const { data } = await axios.get('/crm/customers', {
                params: { ...buildFilterParams(), search, country: filterCountry, package: filterPackage, page: pg, per_page: pp },
            });
            setCustomers(data);
        } finally {
            setLoadingCustomers(false);
        }
    }, [buildFilterParams, search, filterCountry, filterPackage, perPage]);

    const loadProfile = async (id: number) => {
        setLoadingProfile(true);
        try {
            const { data } = await axios.get(`/crm/customers/${id}/profile`);
            setProfile(data);
        } finally {
            setLoadingProfile(false);
        }
    };

    const countReport = useCallback(async () => {
        try {
            const p: any = { channel: reportChannel, country: reportCountry, package: reportPackage };
            if (useDateRange) { if (dateFrom) p.date_from = dateFrom; if (dateTo) p.date_to = dateTo; }
            else { if (filterYear) p.year = filterYear; if (filterMonth) p.month = filterMonth; }
            const { data } = await axios.get('/crm/customers', { params: { ...p, page: 1 } });
            setReportCount(data.total);
        } catch { setReportCount(null); }
    }, [reportChannel, reportCountry, reportPackage, useDateRange, dateFrom, dateTo, filterYear, filterMonth]);

    useEffect(() => { if (activeTab === 'insights') loadInsights(); }, [activeTab, loadInsights]);
    useEffect(() => { if (activeTab === 'customers') loadCustomers(1); }, [activeTab]);
    useEffect(() => { if (activeTab === 'report') countReport(); }, [activeTab, reportChannel, reportCountry, reportPackage, countReport]);

    const applyFilters = () => {
        if (activeTab === 'insights') loadInsights();
        if (activeTab === 'customers') loadCustomers(1);
    };

    const buildParams = (extra: Record<string, string> = {}) => {
        const p = new URLSearchParams();
        const fp = buildFilterParams();
        Object.entries({ ...fp, ...extra }).forEach(([k, v]) => { if (v) p.append(k, String(v)); });
        return p.toString();
    };

    const buildExportUrl = (endpoint: string, extra: Record<string, string> = {}) =>
        `/crm/export/${endpoint}?${buildParams(extra)}`;

    const buildReportUrl = (format: string) => {
        const p = new URLSearchParams();
        if (reportChannel) p.append('channel', reportChannel);
        if (reportCountry) p.append('country', reportCountry);
        if (reportPackage) p.append('package', reportPackage);
        if (useDateRange) { if (dateFrom) p.append('date_from', dateFrom); if (dateTo) p.append('date_to', dateTo); }
        else { if (filterYear) p.append('year', filterYear); if (filterMonth) p.append('month', filterMonth); }
        p.append('format', format);
        return `/crm/export/customer-report?${p.toString()}`;
    };

    // Chart configs
    const lineOptions = (categories: string[], color: string): any => ({
        chart: { type: 'line', height: 260, toolbar: { show: false }, background: 'transparent' },
        stroke: { curve: 'smooth', width: 2 },
        colors: [color],
        xaxis: { categories, labels: { style: { fontSize: '11px' } } },
        tooltip: { y: { formatter: (v: number) => `${v}` } },
        grid: { borderColor: '#e5e7eb' },
        dataLabels: { enabled: false },
    });

    const packageBarOptions: any = {
        chart: { type: 'bar', height: 260, toolbar: { show: false } },
        colors: ['#6366f1'],
        xaxis: { categories: insights?.package_popularity?.map((d: any) => d.package) ?? [] },
        dataLabels: { enabled: true },
        plotOptions: { bar: { borderRadius: 4 } },
        tooltip: { y: { formatter: (v: number) => `${v} bookings` } },
    };

    const countryPieOptions: any = {
        chart: { type: 'donut', height: 280 },
        labels: insights?.country_distribution?.slice(0, 12).map((d: any) => d.country) ?? [],
        legend: { position: 'bottom', fontSize: '12px' },
        dataLabels: { enabled: true, formatter: (_: any, opts: any) => `${opts.w.globals.series[opts.seriesIndex]}` },
        tooltip: { y: { formatter: (v: number) => `${v} bookings` } },
    };

    const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
        { key: 'insights', label: 'Insights Dashboard', icon: <BarChart2 size={16} /> },
        { key: 'customers', label: 'Customer List', icon: <Users size={16} /> },
        { key: 'report', label: 'Customer Report', icon: <FileText size={16} /> },
    ];

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    const ExportButtons = ({ endpoint, extra = {} }: { endpoint: string; extra?: Record<string,string> }) => (
        <div className="flex items-center gap-1">
            <a href={`${buildExportUrl(endpoint, extra)}&format=excel`} className="flex items-center gap-1 rounded border border-green-300 bg-green-50 px-2 py-1 text-xs text-green-700 hover:bg-green-100 transition">
                <FileSpreadsheet size={12} /> Excel
            </a>
            <a href={`${buildExportUrl(endpoint, extra)}&format=pdf`} className="flex items-center gap-1 rounded border border-red-300 bg-red-50 px-2 py-1 text-xs text-red-700 hover:bg-red-100 transition">
                <FileText size={12} /> PDF
            </a>
        </div>
    );

    return (
        <Main>
            <div className="mx-auto max-w-screen-2xl">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-black dark:text-white">CRM</h1>
                        <p className="text-sm text-gray-500 mt-1">Customer Insights & Marketing Data</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {(['', '1', '2'] as ChannelType[]).map(ch => (
                            <button key={ch} onClick={() => setChannel(ch)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${channel === ch ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                {CHANNEL_LABELS[ch]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 dark:border-strokedark dark:bg-boxdark shadow-sm">
                    <div className="flex flex-wrap items-center gap-3">
                        <button onClick={() => setUseDateRange(!useDateRange)}
                            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${useDateRange ? 'border-primary bg-primary/10 text-primary' : 'border-gray-300 text-gray-600 hover:border-primary'}`}>
                            <Calendar size={14} /> {useDateRange ? 'Date Range' : 'Year / Month'}
                        </button>
                        {!useDateRange ? (
                            <>
                                <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary focus:outline-none">
                                    <option value="">All Years</option>
                                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                                <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary focus:outline-none">
                                    <option value="">All Months</option>
                                    {months.map((m, i) => <option key={i+1} value={String(i+1).padStart(2,'0')}>{m}</option>)}
                                </select>
                            </>
                        ) : (
                            <>
                                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary focus:outline-none" />
                                <span className="text-gray-400">to</span>
                                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary focus:outline-none" />
                            </>
                        )}
                        <button onClick={applyFilters} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-opacity-90">
                            <RefreshCw size={14} /> Apply
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="mb-5 flex gap-1 border-b border-gray-200 dark:border-strokedark">
                    {tabs.map(t => (
                        <button key={t.key} onClick={() => setActiveTab(t.key)}
                            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2 -mb-px ${activeTab === t.key ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            {t.icon} {t.label}
                        </button>
                    ))}
                </div>

                {/* TAB: INSIGHTS */}
                {activeTab === 'insights' && (
                    <div>
                        {loadingInsights ? (
                            <div className="flex h-64 items-center justify-center text-gray-400">
                                <RefreshCw size={24} className="animate-spin mr-2" /> Loading insights...
                            </div>
                        ) : insights ? (
                            <>
                                {/* Summary Cards */}
                                <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                                    {[
                                        { label: 'Total Bookings', value: insights.summary.total_bookings, icon: <Package size={20} />, color: 'text-primary' },
                                        { label: 'Total Pax', value: insights.summary.total_pax, icon: <Users size={20} />, color: 'text-success' },
                                        { label: 'Countries', value: insights.summary.unique_countries, icon: <Globe size={20} />, color: 'text-warning' },
                                        { label: 'JVTO / Klook', value: `${insights.summary.jvto_count} / ${insights.summary.klook_count}`, icon: <TrendingUp size={20} />, color: 'text-danger' },
                                    ].map((c, i) => (
                                        <div key={i} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-strokedark dark:bg-boxdark shadow-sm">
                                            <div className={`mb-1 ${c.color}`}>{c.icon}</div>
                                            <div className="text-2xl font-bold text-black dark:text-white">{c.value}</div>
                                            <div className="text-xs text-gray-500">{c.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Charts Row 1 */}
                                <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
                                    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-strokedark dark:bg-boxdark shadow-sm">
                                        <h3 className="mb-3 text-sm font-semibold text-black dark:text-white flex items-center gap-2">
                                            <TrendingUp size={15} className="text-primary" /> Booking Trend (by Order Date)
                                        </h3>
                                        {insights.booking_trend?.length > 0 ? (
                                            <Chart options={lineOptions(insights.booking_trend.map((d: any) => formatMonth(d.month)), '#3b82f6')}
                                                series={[{ name: 'Bookings', data: insights.booking_trend.map((d: any) => d.count) }]}
                                                type="line" height={260} />
                                        ) : <p className="text-center text-gray-400 py-10 text-sm">No data</p>}
                                    </div>
                                    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-strokedark dark:bg-boxdark shadow-sm">
                                        <h3 className="mb-3 text-sm font-semibold text-black dark:text-white flex items-center gap-2">
                                            <Calendar size={15} className="text-success" /> Travel Trend (by Trip Start Date)
                                        </h3>
                                        {insights.travel_trend?.length > 0 ? (
                                            <Chart options={lineOptions(insights.travel_trend.map((d: any) => formatMonth(d.month)), '#10b981')}
                                                series={[{ name: 'Trips', data: insights.travel_trend.map((d: any) => d.count) }]}
                                                type="line" height={260} />
                                        ) : <p className="text-center text-gray-400 py-10 text-sm">No data</p>}
                                    </div>
                                </div>

                                {/* Charts Row 2 */}
                                <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
                                    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-strokedark dark:bg-boxdark shadow-sm">
                                        <h3 className="mb-3 text-sm font-semibold text-black dark:text-white flex items-center gap-2">
                                            <Package size={15} className="text-primary" /> Package Popularity
                                        </h3>
                                        {insights.package_popularity?.length > 0 ? (
                                            <Chart options={packageBarOptions}
                                                series={[{ name: 'Bookings', data: insights.package_popularity.map((d: any) => d.count) }]}
                                                type="bar" height={260} />
                                        ) : <p className="text-center text-gray-400 py-10 text-sm">No data</p>}
                                    </div>
                                    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-strokedark dark:bg-boxdark shadow-sm">
                                        <h3 className="mb-3 text-sm font-semibold text-black dark:text-white flex items-center gap-2">
                                            <Globe size={15} className="text-warning" /> Customer by Country
                                        </h3>
                                        {insights.country_distribution?.length > 0 ? (
                                            <Chart options={countryPieOptions}
                                                series={insights.country_distribution.slice(0, 12).map((d: any) => d.count)}
                                                type="donut" height={280} />
                                        ) : <p className="text-center text-gray-400 py-10 text-sm">No data</p>}
                                    </div>
                                </div>

                                {/* Tables */}
                                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                                    {/* Top Countries */}
                                    <div className="rounded-xl border border-gray-200 bg-white dark:border-strokedark dark:bg-boxdark shadow-sm overflow-hidden">
                                        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-strokedark">
                                            <h3 className="text-sm font-semibold text-black dark:text-white">Top Countries</h3>
                                            <ExportButtons endpoint="countries" />
                                        </div>
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 dark:bg-meta-4">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">#</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Country</th>
                                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Bookings</th>
                                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Pax</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {insights.country_distribution?.slice(0, 15).map((d: any, i: number) => (
                                                    <tr key={i} className="border-t border-gray-100 dark:border-strokedark hover:bg-gray-50 dark:hover:bg-meta-4">
                                                        <td className="px-4 py-2 text-gray-400 text-xs">{i + 1}</td>
                                                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{d.country}</td>
                                                        <td className="px-4 py-2 text-right font-medium">{d.count}</td>
                                                        <td className="px-4 py-2 text-right text-gray-500">{d.pax}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Package Performance */}
                                    <div className="rounded-xl border border-gray-200 bg-white dark:border-strokedark dark:bg-boxdark shadow-sm overflow-hidden">
                                        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-strokedark">
                                            <h3 className="text-sm font-semibold text-black dark:text-white">Package Performance</h3>
                                            <ExportButtons endpoint="packages" />
                                        </div>
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 dark:bg-meta-4">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">#</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Package</th>
                                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Bookings</th>
                                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Pax</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {insights.package_popularity?.map((d: any, i: number) => (
                                                    <tr key={i} className="border-t border-gray-100 dark:border-strokedark hover:bg-gray-50 dark:hover:bg-meta-4">
                                                        <td className="px-4 py-2 text-gray-400 text-xs">{i + 1}</td>
                                                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">{d.package}</td>
                                                        <td className="px-4 py-2 text-right font-medium">{d.count}</td>
                                                        <td className="px-4 py-2 text-right text-gray-500">{d.pax}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="flex h-64 items-center justify-center text-gray-400">Apply filters to load insights</div>
                        )}
                    </div>
                )}

                {/* TAB: CUSTOMERS */}
                {activeTab === 'customers' && (
                    <div>
                        <div className="mb-4 flex flex-wrap gap-3">
                            <div className="relative flex-1 min-w-48">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input type="text" placeholder="Search name, email, phone..."
                                    value={search} onChange={e => setSearch(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && loadCustomers(1)}
                                    className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-1.5 text-sm focus:border-primary focus:outline-none" />
                            </div>
                            <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary focus:outline-none">
                                <option value="">All Countries</option>
                                {countries.map(c => <option key={c.id} value={c.id}>{c.long_name}</option>)}
                            </select>
                            <select value={filterPackage} onChange={e => setFilterPackage(e.target.value)} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-primary focus:outline-none">
                                <option value="">All Packages</option>
                                {packages.map(p => <option key={p.id} value={p.id}>{p.package_code} – {p.name}</option>)}
                            </select>
                            <button onClick={() => loadCustomers(1)} className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-opacity-90">
                                <Search size={14} /> Search
                            </button>
                        </div>

                        {loadingCustomers ? (
                            <div className="flex h-48 items-center justify-center text-gray-400">
                                <RefreshCw size={20} className="animate-spin mr-2" /> Loading...
                            </div>
                        ) : customers ? (
                            <div className="rounded-xl border border-gray-200 bg-white dark:border-strokedark dark:bg-boxdark shadow-sm overflow-hidden">
                                <div className="px-5 py-3 border-b border-gray-100 dark:border-strokedark flex items-center justify-between">
                                    <span className="text-sm text-gray-500">{customers.total} customers found</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400 mr-1">Export all:</span>
                                        <a href={`${buildExportUrl('customers')}&search=${search}&country=${filterCountry}&package=${filterPackage}&format=excel`}
                                            className="flex items-center gap-1 rounded border border-green-300 bg-green-50 px-2.5 py-1 text-xs text-green-700 hover:bg-green-100 transition">
                                            <FileSpreadsheet size={12} /> Excel
                                        </a>
                                        <a href={`${buildExportUrl('customers')}&search=${search}&country=${filterCountry}&package=${filterPackage}&format=pdf`}
                                            className="flex items-center gap-1 rounded border border-red-300 bg-red-50 px-2.5 py-1 text-xs text-red-700 hover:bg-red-100 transition">
                                            <FileText size={12} /> PDF
                                        </a>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 dark:bg-meta-4">
                                            <tr>
                                                {['Name', 'Country', 'Channel', 'Package', 'Booking Date', 'Travel Date', 'Pax', 'Total', 'Status', ''].map(h => (
                                                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {customers.data?.map((c: any) => (
                                                <tr key={c.id} className="border-t border-gray-100 dark:border-strokedark hover:bg-gray-50 dark:hover:bg-meta-4 transition">
                                                    <td className="px-4 py-3">
                                                        <div className="font-medium text-black dark:text-white">{c.name}</div>
                                                        <div className="text-xs text-gray-400">{c.email}</div>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{c.country}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.channel === 'KLOOK' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {c.channel}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 max-w-36 truncate">{c.package}</td>
                                                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{c.booking_date}</td>
                                                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{c.travel_date}</td>
                                                    <td className="px-4 py-3 text-center">{c.total_pax}</td>
                                                    <td className="px-4 py-3 text-right whitespace-nowrap font-medium">{formatIDR(c.grand_total)}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${c.payment_status === 'Paid' ? 'bg-success/20 text-success' : c.payment_status === 'DP Paid' ? 'bg-warning/20 text-warning' : 'bg-danger/20 text-danger'}`}>
                                                            {c.payment_status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <button onClick={() => { setSelectedCustomer(c); loadProfile(c.id); }}
                                                            className="flex items-center gap-1 rounded-lg border border-gray-300 px-2 py-1 text-xs hover:border-primary hover:text-primary transition">
                                                            <Eye size={12} /> Profile
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-gray-100 dark:border-strokedark">
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span>Show</span>
                                        <select
                                            value={perPage}
                                            onChange={e => { const pp = Number(e.target.value); setPerPage(pp); loadCustomers(1, pp); }}
                                            className="rounded border border-gray-300 px-2 py-1 text-xs focus:border-primary focus:outline-none"
                                        >
                                            {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
                                        </select>
                                        <span>per page &nbsp;·&nbsp; {customers.total} total</span>
                                    </div>
                                    {customers.last_page > 1 && (
                                        <div className="flex items-center gap-1">
                                            <button disabled={customers.current_page === 1} onClick={() => loadCustomers(customers.current_page - 1)}
                                                className="rounded border border-gray-300 p-1 disabled:opacity-40 hover:border-primary">
                                                <ChevronLeft size={13} />
                                            </button>
                                            {Array.from({ length: customers.last_page }, (_, i) => i + 1)
                                                .filter(p => p === 1 || p === customers.last_page || Math.abs(p - customers.current_page) <= 2)
                                                .reduce<(number | '…')[]>((acc, p, i, arr) => {
                                                    if (i > 0 && (p as number) - (arr[i - 1] as number) > 1) acc.push('…');
                                                    acc.push(p);
                                                    return acc;
                                                }, [])
                                                .map((p, i) => p === '…'
                                                    ? <span key={`e${i}`} className="px-1 text-xs text-gray-400">…</span>
                                                    : <button key={p} onClick={() => loadCustomers(p as number)}
                                                        className={`min-w-7 rounded border px-2 py-1 text-xs font-medium transition ${customers.current_page === p ? 'border-primary bg-primary text-white' : 'border-gray-300 hover:border-primary'}`}>
                                                        {p}
                                                    </button>
                                                )
                                            }
                                            <button disabled={customers.current_page === customers.last_page} onClick={() => loadCustomers(customers.current_page + 1)}
                                                className="rounded border border-gray-300 p-1 disabled:opacity-40 hover:border-primary">
                                                <ChevronRight size={13} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}

                {/* TAB: CUSTOMER REPORT */}
                {activeTab === 'report' && (
                    <div className="max-w-2xl">
                        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-strokedark dark:bg-boxdark shadow-sm">
                            <h3 className="mb-1 text-base font-semibold text-black dark:text-white">Customer Report Export</h3>
                            <p className="mb-5 text-sm text-gray-500">Filter the customer data and export as Excel or PDF for analysis.</p>

                            <div className="mb-5 space-y-4">
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-600">Channel</label>
                                    <div className="flex gap-2">
                                        {(['', '1', '2'] as ChannelType[]).map(ch => (
                                            <button key={ch} onClick={() => setReportChannel(ch)}
                                                className={`px-4 py-1.5 rounded-lg border text-sm font-medium transition ${reportChannel === ch ? 'border-primary bg-primary/10 text-primary' : 'border-gray-300 text-gray-600 hover:border-primary'}`}>
                                                {CHANNEL_LABELS[ch]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-600">Country</label>
                                    <select value={reportCountry} onChange={e => setReportCountry(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none">
                                        <option value="">All Countries</option>
                                        {countries.map(c => <option key={c.id} value={c.id}>{c.long_name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-600">Package</label>
                                    <select value={reportPackage} onChange={e => setReportPackage(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none">
                                        <option value="">All Packages</option>
                                        {packages.map(p => <option key={p.id} value={p.id}>{p.package_code} – {p.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="mb-5 rounded-lg bg-gray-50 p-4 dark:bg-meta-4">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    <span className="font-semibold text-black dark:text-white">Columns:</span>{' '}
                                    Email, Phone, First Name, Last Name, Country, Booking Date, Travel Date, Package, Channel, Pax
                                </p>
                                {reportCount !== null && (
                                    <p className="mt-2 text-sm">
                                        <span className="font-semibold text-primary">{reportCount}</span> customers will be exported
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <a href={buildReportUrl('excel')}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-green-400 bg-green-50 py-3 text-sm font-semibold text-green-700 hover:bg-green-100 transition">
                                    <FileSpreadsheet size={16} /> Export Excel
                                </a>
                                <a href={buildReportUrl('pdf')}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-400 bg-red-50 py-3 text-sm font-semibold text-red-700 hover:bg-red-100 transition">
                                    <FileText size={16} /> Export PDF
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 360° Profile Drawer */}
            {selectedCustomer && (
                <div className="fixed inset-0 z-50 flex">
                    <div className="flex-1 bg-black/40" onClick={() => { setSelectedCustomer(null); setProfile(null); }} />
                    <div className="w-full max-w-lg bg-white dark:bg-boxdark overflow-y-auto shadow-2xl">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 dark:border-strokedark bg-white dark:bg-boxdark px-6 py-4">
                            <h2 className="text-base font-semibold text-black dark:text-white">Customer Profile</h2>
                            <button onClick={() => { setSelectedCustomer(null); setProfile(null); }} className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-meta-4">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6">
                            {loadingProfile ? (
                                <div className="flex h-48 items-center justify-center text-gray-400">
                                    <RefreshCw size={20} className="animate-spin mr-2" /> Loading profile...
                                </div>
                            ) : profile ? (
                                <div className="space-y-6">
                                    {/* Identity */}
                                    <div className="rounded-lg border border-gray-200 dark:border-strokedark p-4">
                                        <div className="mb-3 flex items-center gap-3">
                                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold">
                                                {(profile.name ?? 'U')[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-base font-bold text-black dark:text-white">{profile.name}</h3>
                                                <div className="mt-1 flex gap-2">
                                                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${profile.channel === 'KLOOK' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{profile.channel}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2 text-sm">
                                            {[
                                                { label: 'Email', value: profile.email },
                                                { label: 'Phone', value: profile.phone },
                                                { label: 'Country', value: profile.country },
                                            ].map(({ label, value }) => (
                                                <div key={label} className="flex items-center gap-2 border-t border-gray-100 dark:border-strokedark pt-2">
                                                    <span className="w-16 shrink-0 text-xs text-gray-500">{label}</span>
                                                    <span className="font-medium text-black dark:text-white break-all">{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-gray-200 dark:border-strokedark p-4">
                                        <h4 className="mb-3 text-sm font-semibold text-black dark:text-white flex items-center gap-2">
                                            <Package size={14} className="text-primary" /> Trip Details
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div><span className="text-gray-500">Package</span><p className="font-medium text-black dark:text-white mt-0.5">{profile.package}</p></div>
                                            <div><span className="text-gray-500">Code</span><p className="font-medium mt-0.5">{profile.package_code}</p></div>
                                            <div><span className="text-gray-500">Booking Date</span><p className="font-medium mt-0.5">{profile.booking_date}</p></div>
                                            <div><span className="text-gray-500">Travel Date</span><p className="font-medium mt-0.5">{profile.travel_date}</p></div>
                                            <div><span className="text-gray-500">Total Pax</span><p className="font-medium mt-0.5">{profile.total_pax} pax</p></div>
                                            <div><span className="text-gray-500">Status</span>
                                                <span className={`mt-0.5 block w-fit rounded-full px-2 py-0.5 text-xs font-medium ${profile.payment_status === 'Paid' ? 'bg-success/20 text-success' : profile.payment_status === 'DP Paid' ? 'bg-warning/20 text-warning' : 'bg-danger/20 text-danger'}`}>
                                                    {profile.payment_status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-lg border border-gray-200 dark:border-strokedark p-4">
                                        <h4 className="mb-3 text-sm font-semibold text-black dark:text-white flex items-center gap-2">
                                            <CreditCard size={14} className="text-success" /> Payment
                                        </h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between"><span className="text-gray-500">Grand Total</span><span className="font-bold">{formatIDR(profile.grand_total)}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Paid</span><span className="text-success font-medium">{formatIDR(profile.payment)}</span></div>
                                            {profile.channel !== 'KLOOK' && (
                                                <div className="flex justify-between"><span className="text-gray-500">Balance</span><span className={`font-medium ${profile.balance > 0 ? 'text-danger' : 'text-success'}`}>{formatIDR(profile.balance)}</span></div>
                                            )}
                                        </div>
                                        <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200">
                                            <div className="h-1.5 rounded-full bg-success" style={{ width: `${Math.min(100, profile.grand_total > 0 ? (profile.payment / profile.grand_total) * 100 : 0)}%` }} />
                                        </div>
                                        {profile.payments?.length > 0 && (
                                            <div className="mt-3 space-y-1">
                                                {profile.payments.map((p: any, i: number) => (
                                                    <div key={i} className="flex justify-between text-xs text-gray-500">
                                                        <span>{p.method}</span><span>{p.paid_date}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {profile.add_ons?.length > 0 && (
                                        <div className="rounded-lg border border-gray-200 dark:border-strokedark p-4">
                                            <h4 className="mb-3 text-sm font-semibold text-black dark:text-white flex items-center gap-2">
                                                <Star size={14} className="text-warning" /> Add-ons
                                            </h4>
                                            {profile.add_ons.map((a: any, i: number) => (
                                                <div key={i} className="flex justify-between text-sm border-t border-gray-100 dark:border-strokedark pt-2 mt-2 first:border-0 first:mt-0 first:pt-0">
                                                    <span>{a.name} ×{a.qty}</span>
                                                    <span className="font-medium">{formatIDR(a.price * a.qty)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {profile.special_requirements && profile.special_requirements !== '-' && (
                                        <div className="rounded-lg border border-gray-200 dark:border-strokedark p-4">
                                            <h4 className="mb-2 text-sm font-semibold text-black dark:text-white">Special Requirements</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{profile.special_requirements}</p>
                                        </div>
                                    )}

                                    {profile.wa_summaries?.length > 0 && (
                                        <div className="rounded-lg border border-gray-200 dark:border-strokedark p-4">
                                            <h4 className="mb-3 text-sm font-semibold text-black dark:text-white flex items-center gap-2">
                                                <MessageSquare size={14} className="text-primary" /> WhatsApp Communication
                                            </h4>
                                            <div className="space-y-3">
                                                {profile.wa_summaries.map((s: any, i: number) => (
                                                    <div key={i} className="rounded-lg bg-gray-50 dark:bg-meta-4 p-3 text-sm">
                                                        <div className="mb-1 flex items-center justify-between">
                                                            <span className="font-medium text-black dark:text-white">{s.date}</span>
                                                            <div className="flex items-center gap-2">
                                                                {s.category && <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs">{s.category}</span>}
                                                                <span className="text-xs text-gray-400">{s.chat_count} msgs</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-600 dark:text-gray-400 text-xs">{s.summary}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </Main>
    );
}

import React, {useState} from 'react';
import Main from '@/Layouts/Main';
import {router} from '@inertiajs/react';
import {Search} from 'lucide-react';

const GlassCard = ({children, className = '', glow = false}) => (
    <div className={`
        relative backdrop-blur-xl bg-white/40 dark:bg-gray-800/40
        border border-white/20 dark:border-gray-700/20
        rounded-2xl shadow-lg
        ${glow ? 'before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-blue-500/10 before:to-purple-500/10 before:animate-pulse before:-z-10' : ''}
        transition-all duration-500 ease-out
        hover:shadow-xl hover:shadow-blue-500/10
        ${className}
    `}>
        {children}
    </div>
);

const CardContent = ({className, children, ...props}) => (
    <div className={`${className}`} {...props}>
        {children}
    </div>
);

const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID').format(angka);
};

const TransportationRow = ({transport}) => {
    return (
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 border-b dark:border-gray-700">
            <td className="px-4 py-3">{transport.car_code}</td>
            <td className="px-4 py-3">{transport.name}</td>
            <td className="px-4 py-3 text-center">IDR {formatRupiah(transport.price)}</td>
        </tr>
    );
};

const TransportationFilters = ({filter}) => {
    const [filters, setFilters] = useState({
        search: filter.search || '',
    });

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        router.get('', filters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search transport..."
                    className="w-full border dark:border-gray-700 rounded-lg pl-10 pr-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                />
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-2.5"/>
            </div>
        </form>
    );
};

const Index = ({data}) => {
    const [filters, setFilters] = useState({
        search: data.search,
    });

    return (
        <Main>
            <div className="min-h-screen">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                        Manage Transportations
                    </h1>
                    <TransportationFilters filter={filters}/>
                </div>

                <GlassCard>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                        ID
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Vehicle Name
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Price
                                    </th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {data.transportations.map((transport) => (
                                    <TransportationRow
                                        key={transport.id}
                                        transport={transport}
                                    />
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </GlassCard>
            </div>
        </Main>
    );
};

export default Index;

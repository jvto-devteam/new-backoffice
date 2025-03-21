import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, ShoppingBag, Globe, PieChart as PieChartIcon } from 'lucide-react';
import { Head, router } from '@inertiajs/react';
import Authenticated from '@/Layouts/Main';

const ProfitPerChannel = ({data,month}) => {
  const [selectedChannel, setSelectedChannel] = useState(null);

  // Format angka dengan pemisah ribuan
  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(number);
  };

  // Menghitung total untuk semua channel
  const totalRevenue = data.reduce((sum, item) => sum + item.totalRevenue, 0);
  const totalOperational = data.reduce((sum, item) => sum + item.totalOperational, 0);
  const totalProfit = data.reduce((sum, item) => sum + item.totalProfit, 0);
  const avgProfitPercentage = (totalProfit / totalRevenue * 100).toFixed(2);

  // Data untuk pie chart
  const pieData = data.map(item => ({
    name: item.name,
    value: item.totalProfit,
    color: item.color
  }));

  // Fungsi untuk filtering data berdasarkan channel yang dipilih
  const filteredData = selectedChannel ? data.filter(item => item.name === selectedChannel) : data;

  // Warna untuk statistik
  const statColors = {
    revenue: "from-blue-500 to-blue-600",
    operational: "from-red-500 to-red-600",
    profit: "from-emerald-500 to-emerald-600",
    percentage: "from-purple-500 to-purple-600"
  };

  // Custom tooltip untuk diagram
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="flex items-center mt-1">
              <span className="w-3 h-3 inline-block mr-2" style={{ backgroundColor: entry.color }}></span>
              <span className="font-medium">{entry.name}:</span> 
              <span className="ml-1">{entry.name.includes('Percentage') ? `${entry.value}%` : formatRupiah(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Handler untuk memilih/membatalkan pilihan channel
  const handleChannelClick = (channel) => {
    if (selectedChannel === channel) {
      setSelectedChannel(null); // Toggle off
    } else {
      setSelectedChannel(channel); // Select new channel
    }
  };

  return (
    <Authenticated>
    <Head title="Profitability Report" />
    <div className="p-6 bg-white rounded-xl shadow-sm">
    <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Laporan Profit per Channel</h1>
        
        {/* Filter date and year */}
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="flex items-center space-x-2">
            <label htmlFor="filterMonth" className="text-sm text-gray-600">Bulan:</label>
            <select 
                id="filterMonth" 
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                router.get('', { month: e.target.value}, {
                    preserveState: true,
                    replace: true
                });
                }}
                defaultValue={month}
            >
                <option value="">Semua</option>
                <option value="01">Januari</option>
                <option value="02">Februari</option>
                <option value="03">Maret</option>
                <option value="04">April</option>
                <option value="05">Mei</option>
                <option value="06">Juni</option>
                <option value="07">Juli</option>
                <option value="08">Agustus</option>
                <option value="09">September</option>
                <option value="10">Oktober</option>
                <option value="11">November</option>
                <option value="12">Desember</option>
            </select>
            </div>
{/*             
            <div className="flex items-center space-x-2">
            <label htmlFor="filterYear" className="text-sm text-gray-600">Tahun:</label>
            <select 
                id="filterYear" 
                className="border border-gray-300 rounded-md px-3 py-1.5 pr-5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => {
                router.get('', { year: e.target.value, month: new URLSearchParams(window.location.search).get('month') || '' }, {
                    preserveState: true,
                    replace: true
                });
                }}
                defaultValue={new URLSearchParams(window.location.search).get('year') || ''}
            >
                <option value="">Semua</option>
                <option value="2025">2025</option>
            </select>
            </div> */}
            
            <button 
            onClick={() => {
                router.get('', {}, {
                preserveState: true,
                replace: true
                });
            }}
            className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md transition-colors"
            >
            Reset Filter
            </button>
        </div>
    </div>      
      {/* Channel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {data.map((channel) => (
          <div 
            key={channel.name}
            onClick={() => handleChannelClick(channel.name)}
            className={`p-5 rounded-xl shadow-sm border transition-all cursor-pointer ${
              selectedChannel === channel.name 
                ? `border-${channel.color} bg-${channel.bgColor}` 
                : 'border-gray-100 bg-white hover:bg-gray-50'
            }`}
            style={{ 
              borderColor: selectedChannel === channel.name ? channel.color : '',
              backgroundColor: selectedChannel === channel.name ? channel.bgColor : ''
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">{channel.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{channel.description}</p>
              </div>
              <div 
                className="w-15 h-15 rounded-full flex items-center justify-center"
                style={{ backgroundColor: channel.color + '20' }}
              >
                <img src={channel.icon} className='max-h-[80%] max-w-[80%] rounded-full' alt="" srcset="" />
                {/* <channel.icon size={20} style={{ color: channel.color }} /> */}
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-500">Profit</span>
                <span className="text-xs font-medium" style={{ color: channel.color }}>{channel.profitPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full" 
                  style={{ 
                    width: `${channel.profitPercentage}%`,
                    backgroundColor: channel.color
                  }}
                ></div>
              </div>
              <p className="mt-3 text-lg font-bold" style={{ color: channel.color }}>
                {formatRupiah(channel.totalProfit)}
              </p>
            </div>
          </div>
        ))}
        
        {/* Total Card */}
        <div 
          onClick={() => setSelectedChannel(null)}
          className={`p-5 rounded-xl shadow-sm border transition-all cursor-pointer ${
            !selectedChannel 
              ? 'border-purple-500 bg-purple-50' 
              : 'border-gray-100 bg-white hover:bg-gray-50'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-800">TOTAL</h3>
              <p className="text-xs text-gray-500 mt-1">Semua Channel</p>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100">
              <PieChartIcon size={20} className="text-purple-500" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-500">Profit</span>
              <span className="text-xs font-medium text-purple-500">{avgProfitPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-purple-500" 
                style={{ width: `${avgProfitPercentage}%` }}
              ></div>
            </div>
            <p className="mt-3 text-lg font-bold text-purple-500">
              {formatRupiah(totalProfit)}
            </p>
          </div>
        </div>
      </div>
      
      {/* Ringkasan Total dengan gradient dan shadows */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className={`bg-gradient-to-br ${statColors.revenue} p-6 rounded-xl shadow-md text-white`}>
          <h3 className="text-xs font-semibold uppercase tracking-wide opacity-80">Total Pendapatan</h3>
          <p className="text-2xl font-bold mt-2">{formatRupiah(selectedChannel ? filteredData[0].totalRevenue : totalRevenue)}</p>
        </div>
        <div className={`bg-gradient-to-br ${statColors.operational} p-6 rounded-xl shadow-md text-white`}>
          <h3 className="text-xs font-semibold uppercase tracking-wide opacity-80">Total Biaya Operasional</h3>
          <p className="text-2xl font-bold mt-2">{formatRupiah(selectedChannel ? filteredData[0].totalOperational : totalOperational)}</p>
        </div>
        <div className={`bg-gradient-to-br ${statColors.profit} p-6 rounded-xl shadow-md text-white`}>
          <h3 className="text-xs font-semibold uppercase tracking-wide opacity-80">Total Profit Bersih</h3>
          <p className="text-2xl font-bold mt-2">{formatRupiah(selectedChannel ? filteredData[0].totalProfit : totalProfit)}</p>
        </div>
        <div className={`bg-gradient-to-br ${statColors.percentage} p-6 rounded-xl shadow-md text-white`}>
          <h3 className="text-xs font-semibold uppercase tracking-wide opacity-80">Persentase Keuntungan</h3>
          <p className="text-2xl font-bold mt-2">{selectedChannel ? filteredData[0].profitPercentage : avgProfitPercentage}%</p>
        </div>
      </div>

      {/* Visualization Sections in Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Left column: Bar Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Perbandingan Nilai</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredData}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                barSize={36}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{paddingTop: "10px"}} />
                <Bar dataKey="totalRevenue" name="Pendapatan" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalOperational" name="Biaya Operasional" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="totalProfit" name="Profit Bersih" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right column: Pie Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Distribusi Profit</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatRupiah(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>


      {/* Tabel detail dengan styling yang lebih modern */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Detail Profit per Channel</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Pendapatan</th>
                <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Biaya Operasional</th>
                <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Profit Bersih</th>
                <th className="py-3 px-6 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Persentase Keuntungan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <tr 
                  key={index} 
                  className="hover:bg-gray-50 transition-colors duration-150 ease-in-out cursor-pointer"
                  onClick={() => handleChannelClick(item.name)}
                >
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: item.color }}></div>
                      <span className="font-medium text-gray-800">{item.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-right text-sm text-gray-800">{formatRupiah(item.totalRevenue)}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-right text-sm text-gray-800">{formatRupiah(item.totalOperational)}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-right text-sm text-gray-800">{formatRupiah(item.totalProfit)}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-right text-sm font-medium" style={{ color: item.color }}>{item.profitPercentage}%</td>
                </tr>
              ))}
              {!selectedChannel && (
                <tr className="bg-gray-50 font-bold">
                  <td className="py-4 px-6 whitespace-nowrap">TOTAL</td>
                  <td className="py-4 px-6 whitespace-nowrap text-right">{formatRupiah(totalRevenue)}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-right">{formatRupiah(totalOperational)}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-right">{formatRupiah(totalProfit)}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-right">{avgProfitPercentage}%</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
    </Authenticated>
  );
};

export default ProfitPerChannel;
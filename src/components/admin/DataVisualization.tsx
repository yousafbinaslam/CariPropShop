import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building, 
  DollarSign,
  Calendar,
  Eye,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';

interface ChartData {
  label: string;
  value: number;
  change?: number;
  color?: string;
}

interface MetricCard {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

const DataVisualization: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock data - replace with real API calls
  const metrics: MetricCard[] = [
    {
      title: 'Total Properti',
      value: '247',
      change: 12.5,
      icon: <Building className="w-6 h-6" />,
      color: 'blue'
    },
    {
      title: 'Klien Aktif',
      value: '1,834',
      change: 8.2,
      icon: <Users className="w-6 h-6" />,
      color: 'green'
    },
    {
      title: 'Pendapatan Bulanan',
      value: 'IDR 2.4M',
      change: 15.3,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'purple'
    },
    {
      title: 'Janji Temu',
      value: '156',
      change: -2.1,
      icon: <Calendar className="w-6 h-6" />,
      color: 'orange'
    }
  ];

  const propertyData: ChartData[] = [
    { label: 'Rumah', value: 120, color: '#3B82F6' },
    { label: 'Apartment', value: 85, color: '#10B981' },
    { label: 'Komersial', value: 32, color: '#F59E0B' },
    { label: 'Tanah', value: 10, color: '#EF4444' }
  ];

  const revenueData: ChartData[] = [
    { label: 'Jan', value: 1200000000 },
    { label: 'Feb', value: 1800000000 },
    { label: 'Mar', value: 1500000000 },
    { label: 'Apr', value: 2200000000 },
    { label: 'May', value: 2800000000 },
    { label: 'Jun', value: 2400000000 }
  ];

  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdated(new Date());
    setLoading(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Dashboard Analytics</h2>
          <p className="text-sm text-neutral-600">
            Terakhir diperbarui: {lastUpdated.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">7 Hari Terakhir</option>
            <option value="30d">30 Hari Terakhir</option>
            <option value="90d">90 Hari Terakhir</option>
            <option value="1y">1 Tahun Terakhir</option>
          </select>
          <button
            onClick={refreshData}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">{metric.title}</p>
                <p className="text-2xl font-bold text-neutral-900">{metric.value}</p>
                <div className="flex items-center space-x-1 mt-2">
                  {metric.change >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${
                    metric.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change >= 0 ? '+' : ''}{metric.change}%
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg bg-${metric.color}-100`}>
                <div className={`text-${metric.color}-600`}>
                  {metric.icon}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Distribution Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">Distribusi Properti</h3>
            <button className="text-neutral-400 hover:text-neutral-600">
              <Eye className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            {propertyData.map((item, index) => {
              const total = propertyData.reduce((sum, d) => sum + d.value, 0);
              const percentage = (item.value / total) * 100;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700">{item.label}</span>
                    <span className="text-sm text-neutral-600">{item.value} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: item.color 
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">Tren Pendapatan</h3>
            <button className="text-neutral-400 hover:text-neutral-600">
              <BarChart3 className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            {revenueData.map((item, index) => {
              const maxValue = Math.max(...revenueData.map(d => d.value));
              const percentage = (item.value / maxValue) * 100;
              
              return (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-8 text-sm font-medium text-neutral-600">
                    {item.label}
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-neutral-200 rounded-full h-3">
                      <div 
                        className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="w-24 text-sm text-neutral-600 text-right">
                    {formatCurrency(item.value)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-6">Aktivitas Terbaru</h3>
        
        <div className="space-y-4">
          {[
            { time: '10:30', action: 'Properti baru ditambahkan', user: 'Sarah Chen', type: 'success' },
            { time: '09:15', action: 'Klien baru terdaftar', user: 'Ahmad Pratama', type: 'info' },
            { time: '08:45', action: 'Pembayaran diterima', user: 'System', type: 'success' },
            { time: '08:20', action: 'Janji temu dijadwalkan', user: 'Lisa Wijaya', type: 'warning' },
            { time: '07:55', action: 'Laporan bulanan dibuat', user: 'System', type: 'info' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 hover:bg-neutral-50 rounded-lg transition-colors duration-200">
              <div className="text-sm text-neutral-500 w-12">
                {activity.time}
              </div>
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'success' ? 'bg-green-500' :
                activity.type === 'warning' ? 'bg-amber-500' :
                activity.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
              }`}></div>
              <div className="flex-1">
                <p className="text-sm text-neutral-900">{activity.action}</p>
                <p className="text-xs text-neutral-500">oleh {activity.user}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataVisualization;
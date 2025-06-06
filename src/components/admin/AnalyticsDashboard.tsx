import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye, 
  Calendar,
  MapPin,
  Phone,
  MessageSquare,
  Download,
  Filter
} from 'lucide-react';

const AnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');

  const stats = {
    totalVisitors: 12847,
    visitorGrowth: 15.3,
    totalLeads: 342,
    leadGrowth: 8.7,
    conversionRate: 2.66,
    conversionGrowth: 12.1,
    avgSessionDuration: '4m 32s',
    sessionGrowth: -2.4
  };

  const topProperties = [
    { id: 1, title: 'Modern Villa Kemang', views: 1247, inquiries: 23, location: 'Jakarta Selatan' },
    { id: 2, title: 'Luxury Apartment Senayan', views: 987, inquiries: 18, location: 'Jakarta Pusat' },
    { id: 3, title: 'Contemporary House Bandung', views: 756, inquiries: 15, location: 'Bandung' },
    { id: 4, title: 'Premium Land Plot Bali', views: 634, inquiries: 12, location: 'Bali' },
    { id: 5, title: 'Industrial Warehouse Cikampek', views: 523, inquiries: 8, location: 'Jawa Barat' }
  ];

  const leadSources = [
    { source: 'Organic Search', leads: 156, percentage: 45.6 },
    { source: 'WhatsApp Direct', leads: 89, percentage: 26.0 },
    { source: 'Social Media', leads: 67, percentage: 19.6 },
    { source: 'Referrals', leads: 30, percentage: 8.8 }
  ];

  const recentActivities = [
    { type: 'view', message: 'Property viewed: Modern Villa Kemang', time: '2 minutes ago', location: 'Jakarta' },
    { type: 'inquiry', message: 'New inquiry from Sarah Chen', time: '15 minutes ago', location: 'Jakarta' },
    { type: 'appointment', message: 'Appointment scheduled for tomorrow', time: '1 hour ago', location: 'Bandung' },
    { type: 'call', message: 'Phone call completed with Ahmad Pratama', time: '2 hours ago', location: 'Surabaya' },
    { type: 'whatsapp', message: 'WhatsApp conversation started', time: '3 hours ago', location: 'Bali' }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view': return <Eye className="w-4 h-4 text-blue-600" />;
      case 'inquiry': return <MessageSquare className="w-4 h-4 text-green-600" />;
      case 'appointment': return <Calendar className="w-4 h-4 text-purple-600" />;
      case 'call': return <Phone className="w-4 h-4 text-orange-600" />;
      case 'whatsapp': return <MessageSquare className="w-4 h-4 text-green-600" />;
      default: return <Eye className="w-4 h-4 text-gray-600" />;
    }
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? '↗' : '↘';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Analytics Dashboard</h2>
          <p className="text-sm text-neutral-600">Track performance and user engagement</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Total Visitors</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.totalVisitors.toLocaleString()}</p>
              <div className={`flex items-center space-x-1 text-sm ${getGrowthColor(stats.visitorGrowth)}`}>
                <span>{getGrowthIcon(stats.visitorGrowth)}</span>
                <span>{Math.abs(stats.visitorGrowth)}%</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Total Leads</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.totalLeads}</p>
              <div className={`flex items-center space-x-1 text-sm ${getGrowthColor(stats.leadGrowth)}`}>
                <span>{getGrowthIcon(stats.leadGrowth)}</span>
                <span>{Math.abs(stats.leadGrowth)}%</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Conversion Rate</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.conversionRate}%</p>
              <div className={`flex items-center space-x-1 text-sm ${getGrowthColor(stats.conversionGrowth)}`}>
                <span>{getGrowthIcon(stats.conversionGrowth)}</span>
                <span>{Math.abs(stats.conversionGrowth)}%</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 mb-1">Avg. Session</p>
              <p className="text-2xl font-bold text-neutral-900">{stats.avgSessionDuration}</p>
              <div className={`flex items-center space-x-1 text-sm ${getGrowthColor(stats.sessionGrowth)}`}>
                <span>{getGrowthIcon(stats.sessionGrowth)}</span>
                <span>{Math.abs(stats.sessionGrowth)}%</span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Properties */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Top Performing Properties</h3>
          <div className="space-y-4">
            {topProperties.map((property, index) => (
              <div key={property.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-neutral-900">{property.title}</h4>
                    <div className="flex items-center space-x-1 text-sm text-neutral-500">
                      <MapPin className="w-3 h-3" />
                      <span>{property.location}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-neutral-900">{property.views} views</div>
                  <div className="text-xs text-neutral-500">{property.inquiries} inquiries</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lead Sources */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Lead Sources</h3>
          <div className="space-y-4">
            {leadSources.map((source, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-900">{source.source}</span>
                  <span className="text-sm text-neutral-600">{source.leads} leads ({source.percentage}%)</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${source.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">Real-time Activities</h3>
          <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button>
        </div>
        <div className="space-y-3">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 hover:bg-neutral-50 rounded-lg transition-colors duration-200">
              <div className="flex-shrink-0">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <p className="text-sm text-neutral-900">{activity.message}</p>
                <div className="flex items-center space-x-2 text-xs text-neutral-500">
                  <span>{activity.time}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3" />
                    <span>{activity.location}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Traffic Chart Placeholder */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Traffic Overview</h3>
        <div className="h-64 bg-neutral-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-neutral-400 mx-auto mb-2" />
            <p className="text-neutral-600">Traffic chart visualization would be implemented here</p>
            <p className="text-sm text-neutral-500">Integration with analytics service required</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
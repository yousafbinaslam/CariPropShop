import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  Building, 
  Calendar, 
  CreditCard, 
  MessageSquare,
  Settings,
  Plus,
  Eye,
  TrendingUp,
  MapPin,
  Phone,
  FileText,
  Shield,
  Database,
  HelpCircle,
  Bot,
  Navigation,
  CheckCircle2,
  AlertTriangle,
  Globe
} from 'lucide-react';
import PropertyUpload from './PropertyUpload';
import ClientManagement from './ClientManagement';
import AppointmentScheduler from './AppointmentScheduler';
import PaymentDashboard from './PaymentDashboard';
import AnalyticsDashboard from './AnalyticsDashboard';
import LegalCompliance from './LegalCompliance';
import DocumentManagement from './DocumentManagement';
import QualityAssurance from './QualityAssurance';
import HelpDocumentation from './HelpDocumentation';
import DatabaseManagement from './DatabaseManagement';
import AIAssistant from './AIAssistant';
import SystemMonitor from './SystemMonitor';
import SupabaseStatus from '../SupabaseStatus';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  const menuItems = [
    { 
      id: 'overview', 
      label: 'Dashboard Overview', 
      icon: <BarChart3 className="w-5 h-5" />,
      category: 'main'
    },
    { 
      id: 'properties', 
      label: 'Property Management', 
      icon: <Building className="w-5 h-5" />,
      category: 'operations'
    },
    { 
      id: 'clients', 
      label: 'CRM - Client Management', 
      icon: <Users className="w-5 h-5" />,
      category: 'operations'
    },
    { 
      id: 'appointments', 
      label: 'Appointment System', 
      icon: <Calendar className="w-5 h-5" />,
      category: 'operations'
    },
    { 
      id: 'payments', 
      label: 'Payment Processing', 
      icon: <CreditCard className="w-5 h-5" />,
      category: 'finance'
    },
    { 
      id: 'analytics', 
      label: 'Business Analytics', 
      icon: <TrendingUp className="w-5 h-5" />,
      category: 'analytics'
    },
    { 
      id: 'legal', 
      label: 'Legal Compliance', 
      icon: <Shield className="w-5 h-5" />,
      category: 'compliance'
    },
    { 
      id: 'documents', 
      label: 'Document Management', 
      icon: <FileText className="w-5 h-5" />,
      category: 'compliance'
    },
    { 
      id: 'quality', 
      label: 'Quality Assurance', 
      icon: <CheckCircle2 className="w-5 h-5" />,
      category: 'system'
    },
    { 
      id: 'database', 
      label: 'Database Management', 
      icon: <Database className="w-5 h-5" />,
      category: 'system'
    },
    { 
      id: 'help', 
      label: 'Help & Documentation', 
      icon: <HelpCircle className="w-5 h-5" />,
      category: 'support'
    },
    { 
      id: 'communication', 
      label: 'Communication Hub', 
      icon: <MessageSquare className="w-5 h-5" />,
      category: 'support'
    },
    { 
      id: 'settings', 
      label: 'System Settings', 
      icon: <Settings className="w-5 h-5" />,
      category: 'system'
    },
    { 
      id: 'monitor', 
      label: 'System Monitor', 
      icon: <Activity className="w-5 h-5" />,
      category: 'system'
    },
  ];

  const categories = {
    main: 'Main Dashboard',
    operations: 'Operations',
    finance: 'Finance',
    analytics: 'Analytics',
    compliance: 'Legal & Compliance',
    system: 'System Management',
    support: 'Support & Help'
  };

  const stats = [
    { label: 'Total Properties', value: '247', change: '+12%', color: 'blue', status: 'healthy' },
    { label: 'Active Clients', value: '1,834', change: '+8%', color: 'green', status: 'healthy' },
    { label: 'Pending Appointments', value: '23', change: '+5%', color: 'orange', status: 'attention' },
    { label: 'Monthly Revenue', value: 'IDR 2.4B', change: '+15%', color: 'purple', status: 'healthy' },
    { label: 'Legal Compliance', value: '98%', change: '+2%', color: 'green', status: 'healthy' },
    { label: 'System Health', value: '99.9%', change: '0%', color: 'blue', status: 'healthy' },
  ];

  const recentActivities = [
    { 
      type: 'property', 
      message: 'New property listed in Kemang with legal verification', 
      time: '2 hours ago',
      status: 'success'
    },
    { 
      type: 'appointment', 
      message: 'Appointment scheduled with John Doe - Notaris required', 
      time: '4 hours ago',
      status: 'pending'
    },
    { 
      type: 'payment', 
      message: 'Payment received for Villa Bali project - IDR 500M', 
      time: '6 hours ago',
      status: 'success'
    },
    { 
      type: 'legal', 
      message: 'Legal document template updated for commercial properties', 
      time: '8 hours ago',
      status: 'info'
    },
    { 
      type: 'system', 
      message: 'Database backup completed successfully', 
      time: '12 hours ago',
      status: 'success'
    },
  ];

  const systemAlerts = [
    { 
      type: 'warning', 
      message: '3 properties require legal document updates', 
      action: 'Review Documents',
      priority: 'medium'
    },
    { 
      type: 'info', 
      message: 'Monthly compliance report ready for review', 
      action: 'View Report',
      priority: 'low'
    },
    { 
      type: 'success', 
      message: 'All payment gateways operational', 
      action: 'View Status',
      priority: 'low'
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'properties':
        return <PropertyUpload />;
      case 'clients':
        return <ClientManagement />;
      case 'appointments':
        return <AppointmentScheduler />;
      case 'payments':
        return <PaymentDashboard />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'legal':
        return <LegalCompliance />;
      case 'documents':
        return <DocumentManagement />;
      case 'quality':
        return <QualityAssurance />;
      case 'database':
        return <DatabaseManagement />;
      case 'help':
        return <HelpDocumentation />;
      case 'monitor':
        return <SystemMonitor />;
      default:
        return (
          <div className="space-y-8">
            {/* Breadcrumb */}
            <nav className="flex items-center space-x-2 text-sm text-neutral-600">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-neutral-900 font-medium">Overview</span>
            </nav>

            {/* System Alerts */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 text-amber-500 mr-2" />
                System Alerts & Notifications
              </h3>
              <div className="space-y-3">
                {systemAlerts.map((alert, index) => (
                  <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
                    alert.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                    alert.type === 'info' ? 'bg-blue-50 border-blue-200' :
                    'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        alert.type === 'warning' ? 'bg-amber-500' :
                        alert.type === 'info' ? 'bg-blue-500' :
                        'bg-green-500'
                      }`}></div>
                      <span className="text-sm text-neutral-700">{alert.message}</span>
                    </div>
                    <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                      {alert.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600 mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-${stat.color}-600 text-sm font-medium`}>
                          {stat.change}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${
                          stat.status === 'healthy' ? 'bg-green-500' :
                          stat.status === 'attention' ? 'bg-amber-500' :
                          'bg-red-500'
                        }`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button 
                  onClick={() => setActiveTab('properties')}
                  className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200"
                >
                  <Plus className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-700">Add Property</span>
                </button>
                <button 
                  onClick={() => setActiveTab('legal')}
                  className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200"
                >
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-700">Legal Check</span>
                </button>
                <button 
                  onClick={() => setActiveTab('clients')}
                  className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200"
                >
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-purple-700">Manage Clients</span>
                </button>
                <button 
                  onClick={() => setActiveTab('quality')}
                  className="flex items-center space-x-3 p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors duration-200"
                >
                  <CheckCircle2 className="w-5 h-5 text-amber-600" />
                  <span className="font-medium text-amber-700">Quality Check</span>
                </button>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recent System Activities</h3>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-neutral-50 rounded-lg">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === 'success' ? 'bg-green-500' :
                      activity.status === 'pending' ? 'bg-amber-500' :
                      activity.status === 'info' ? 'bg-blue-500' : 'bg-neutral-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="text-sm text-neutral-900">{activity.message}</p>
                      <p className="text-xs text-neutral-500">{activity.time}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activity.status === 'success' ? 'bg-green-100 text-green-700' :
                      activity.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      activity.status === 'info' ? 'bg-blue-100 text-blue-700' : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Integration Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">WhatsApp Integration</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <Phone className="w-5 h-5 text-green-600" />
                      <span className="font-medium text-green-700">Business WhatsApp</span>
                    </div>
                    <p className="text-sm text-green-600">+62 822 3354 1409</p>
                    <p className="text-xs text-green-500 mt-1">Active - 24/7 Support</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <MessageSquare className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-700">Personal WhatsApp</span>
                    </div>
                    <p className="text-sm text-blue-600">+62 822 3354 1409</p>
                    <p className="text-xs text-blue-500 mt-1">Active - Direct Contact</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Legal Compliance Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">Notaris Integration</span>
                    <span className="text-green-600 font-medium">Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">Document Templates</span>
                    <span className="text-green-600 font-medium">Updated</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">Digital Signatures</span>
                    <span className="text-green-600 font-medium">Enabled</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">Compliance Check</span>
                    <span className="text-amber-600 font-medium">Pending</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Cari PropShop ERP/CRM</h1>
            <p className="text-sm text-neutral-600">Comprehensive Real Estate Management System</p>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowAIAssistant(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Bot className="w-4 h-4" />
              <span>AI Assistant Jenny</span>
            </button>
            <SupabaseStatus />
            <button className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200">
              <Eye className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Enhanced Sidebar */}
        <aside className="w-80 bg-white border-r border-neutral-200 min-h-screen overflow-y-auto">
          <nav className="p-4">
            {Object.entries(groupedMenuItems).map(([category, items]) => (
              <div key={category} className="mb-6">
                <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-3">
                  {categories[category as keyof typeof categories]}
                </h3>
                <ul className="space-y-1">
                  {items.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 text-left ${
                          activeTab === item.id
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                        }`}
                      >
                        {item.icon}
                        <span className="font-medium text-sm">{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>

      {/* AI Assistant Modal */}
      {showAIAssistant && (
        <AIAssistant onClose={() => setShowAIAssistant(false)} />
      )}
    </div>
  );
};

export default AdminDashboard;
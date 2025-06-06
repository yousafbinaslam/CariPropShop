import React, { useState } from 'react';
import { 
  Database, 
  HardDrive, 
  RefreshCw, 
  Download, 
  Upload, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Trash2,
  Copy,
  Settings,
  BarChart3,
  Activity,
  Server,
  Archive,
  Search,
  Filter
} from 'lucide-react';

interface DatabaseTable {
  name: string;
  records: number;
  size: string;
  lastUpdated: string;
  status: 'healthy' | 'warning' | 'error';
  growth: number;
}

interface BackupRecord {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  size: string;
  created: string;
  status: 'completed' | 'running' | 'failed';
  retention: string;
}

interface DataValidationRule {
  id: string;
  table: string;
  field: string;
  rule: string;
  status: 'active' | 'inactive';
  violations: number;
  lastCheck: string;
}

const DatabaseManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isBackupRunning, setIsBackupRunning] = useState(false);

  const databaseTables: DatabaseTable[] = [
    {
      name: 'properties',
      records: 247,
      size: '45.2 MB',
      lastUpdated: '2025-01-20 10:30',
      status: 'healthy',
      growth: 12
    },
    {
      name: 'clients',
      records: 1834,
      size: '23.8 MB',
      lastUpdated: '2025-01-20 10:25',
      status: 'healthy',
      growth: 8
    },
    {
      name: 'appointments',
      records: 456,
      size: '8.4 MB',
      lastUpdated: '2025-01-20 10:20',
      status: 'warning',
      growth: 25
    },
    {
      name: 'payments',
      records: 892,
      size: '15.6 MB',
      lastUpdated: '2025-01-20 10:15',
      status: 'healthy',
      growth: 15
    },
    {
      name: 'documents',
      records: 1245,
      size: '234.7 MB',
      lastUpdated: '2025-01-20 10:10',
      status: 'healthy',
      growth: 18
    },
    {
      name: 'legal_documents',
      records: 156,
      size: '67.3 MB',
      lastUpdated: '2025-01-20 10:05',
      status: 'healthy',
      growth: 5
    }
  ];

  const backupRecords: BackupRecord[] = [
    {
      id: '1',
      name: 'daily_backup_2025_01_20',
      type: 'full',
      size: '1.2 GB',
      created: '2025-01-20 02:00',
      status: 'completed',
      retention: '30 days'
    },
    {
      id: '2',
      name: 'incremental_backup_2025_01_20_12',
      type: 'incremental',
      size: '45.6 MB',
      created: '2025-01-20 12:00',
      status: 'completed',
      retention: '7 days'
    },
    {
      id: '3',
      name: 'weekly_backup_2025_01_19',
      type: 'full',
      size: '1.18 GB',
      created: '2025-01-19 02:00',
      status: 'completed',
      retention: '90 days'
    },
    {
      id: '4',
      name: 'incremental_backup_2025_01_20_06',
      type: 'incremental',
      size: '23.4 MB',
      created: '2025-01-20 06:00',
      status: 'completed',
      retention: '7 days'
    }
  ];

  const validationRules: DataValidationRule[] = [
    {
      id: '1',
      table: 'properties',
      field: 'price',
      rule: 'price > 0 AND price < 100000000000',
      status: 'active',
      violations: 0,
      lastCheck: '2025-01-20 10:30'
    },
    {
      id: '2',
      table: 'clients',
      field: 'email',
      rule: 'email LIKE "%@%.%"',
      status: 'active',
      violations: 2,
      lastCheck: '2025-01-20 10:25'
    },
    {
      id: '3',
      table: 'appointments',
      field: 'date',
      rule: 'date >= CURRENT_DATE',
      status: 'active',
      violations: 5,
      lastCheck: '2025-01-20 10:20'
    },
    {
      id: '4',
      table: 'properties',
      field: 'area',
      rule: 'area > 0 AND area < 10000',
      status: 'active',
      violations: 1,
      lastCheck: '2025-01-20 10:15'
    }
  ];

  const databaseStats = {
    totalSize: '2.4 GB',
    totalRecords: 4830,
    dailyGrowth: '12.3 MB',
    uptime: '99.98%',
    connections: 23,
    queries: 15420,
    avgResponseTime: '45ms'
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': case 'completed': case 'active': return 'text-green-600 bg-green-100';
      case 'warning': case 'running': return 'text-yellow-600 bg-yellow-100';
      case 'error': case 'failed': case 'inactive': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': case 'completed': case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'warning': case 'running': return <AlertTriangle className="w-4 h-4" />;
      case 'error': case 'failed': case 'inactive': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const runBackup = (type: 'full' | 'incremental') => {
    setIsBackupRunning(true);
    // Simulate backup process
    setTimeout(() => {
      setIsBackupRunning(false);
    }, 3000);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Database Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
          <div className="flex items-center space-x-3">
            <HardDrive className="w-8 h-8 text-blue-600" />
            <div>
              <div className="text-2xl font-bold text-neutral-900">{databaseStats.totalSize}</div>
              <div className="text-sm text-neutral-600">Total Size</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
          <div className="flex items-center space-x-3">
            <Database className="w-8 h-8 text-green-600" />
            <div>
              <div className="text-2xl font-bold text-neutral-900">{databaseStats.totalRecords.toLocaleString()}</div>
              <div className="text-sm text-neutral-600">Total Records</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
          <div className="flex items-center space-x-3">
            <Activity className="w-8 h-8 text-purple-600" />
            <div>
              <div className="text-2xl font-bold text-neutral-900">{databaseStats.uptime}</div>
              <div className="text-sm text-neutral-600">Uptime</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-orange-600" />
            <div>
              <div className="text-2xl font-bold text-neutral-900">{databaseStats.avgResponseTime}</div>
              <div className="text-sm text-neutral-600">Avg Response</div>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">System Health Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h4 className="font-medium text-neutral-900 mb-1">Database Status</h4>
            <p className="text-sm text-green-600">All systems operational</p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-10 h-10 text-blue-600" />
            </div>
            <h4 className="font-medium text-neutral-900 mb-1">Data Integrity</h4>
            <p className="text-sm text-blue-600">98.5% validation passed</p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Archive className="w-10 h-10 text-purple-600" />
            </div>
            <h4 className="font-medium text-neutral-900 mb-1">Backup Status</h4>
            <p className="text-sm text-purple-600">Last backup: 2 hours ago</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button 
            onClick={() => runBackup('full')}
            disabled={isBackupRunning}
            className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 disabled:opacity-50"
          >
            <Download className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-700">Full Backup</span>
          </button>
          
          <button 
            onClick={() => runBackup('incremental')}
            disabled={isBackupRunning}
            className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200 disabled:opacity-50"
          >
            <RefreshCw className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-700">Incremental Backup</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('validation')}
            className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200"
          >
            <Shield className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-purple-700">Validate Data</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('tables')}
            className="flex items-center space-x-3 p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors duration-200"
          >
            <Database className="w-5 h-5 text-amber-600" />
            <span className="font-medium text-amber-700">Manage Tables</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderTables = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Database Tables</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Stats</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Table Name</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Records</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Size</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Growth</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Last Updated</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {databaseTables.map((table, index) => (
                <tr key={index} className="hover:bg-neutral-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <span className="font-medium text-neutral-900">{table.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-neutral-700">{table.records.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-neutral-700">{table.size}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${table.growth > 20 ? 'text-red-600' : table.growth > 10 ? 'text-yellow-600' : 'text-green-600'}`}>
                      +{table.growth}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(table.status)}`}>
                      {getStatusIcon(table.status)}
                      <span className="capitalize">{table.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-neutral-600">{table.lastUpdated}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-neutral-600 hover:text-blue-600 transition-colors duration-200">
                        <BarChart3 className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-neutral-600 hover:text-green-600 transition-colors duration-200">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-neutral-600 hover:text-purple-600 transition-colors duration-200">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderBackups = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Backup Management</h3>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => runBackup('incremental')}
            disabled={isBackupRunning}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isBackupRunning ? 'animate-spin' : ''}`} />
            <span>Incremental</span>
          </button>
          <button 
            onClick={() => runBackup('full')}
            disabled={isBackupRunning}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>Full Backup</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Backup Name</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Type</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Size</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Created</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Retention</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {backupRecords.map((backup) => (
                <tr key={backup.id} className="hover:bg-neutral-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <span className="font-medium text-neutral-900">{backup.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      backup.type === 'full' ? 'bg-blue-100 text-blue-700' :
                      backup.type === 'incremental' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {backup.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-neutral-700">{backup.size}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-neutral-600">{backup.created}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(backup.status)}`}>
                      {getStatusIcon(backup.status)}
                      <span className="capitalize">{backup.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-neutral-600">{backup.retention}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-neutral-600 hover:text-blue-600 transition-colors duration-200">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-neutral-600 hover:text-green-600 transition-colors duration-200">
                        <Upload className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-neutral-600 hover:text-red-600 transition-colors duration-200">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderValidation = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Data Validation Rules</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200">
          <Shield className="w-4 h-4" />
          <span>Run Validation</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Table</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Field</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Rule</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Violations</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Last Check</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {validationRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-neutral-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <span className="font-medium text-neutral-900">{rule.table}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-neutral-700">{rule.field}</span>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-neutral-100 px-2 py-1 rounded">{rule.rule}</code>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(rule.status)}`}>
                      {getStatusIcon(rule.status)}
                      <span className="capitalize">{rule.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${rule.violations > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {rule.violations}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-neutral-600">{rule.lastCheck}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-neutral-600 hover:text-blue-600 transition-colors duration-200">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-neutral-600 hover:text-green-600 transition-colors duration-200">
                        <Settings className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-neutral-600 hover:text-red-600 transition-colors duration-200">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <Database className="w-4 h-4" /> },
    { id: 'tables', label: 'Tables', icon: <HardDrive className="w-4 h-4" /> },
    { id: 'backups', label: 'Backups', icon: <Archive className="w-4 h-4" /> },
    { id: 'validation', label: 'Validation', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Database Management</h2>
        <p className="text-sm text-neutral-600">Monitor and manage database operations</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-neutral-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors duration-200 ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            {tab.icon}
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'tables' && renderTables()}
      {activeTab === 'backups' && renderBackups()}
      {activeTab === 'validation' && renderValidation()}
    </div>
  );
};

export default DatabaseManagement;
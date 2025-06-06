import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  User, 
  Calendar, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed' | 'warning';
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

const AuditTrail: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('7d');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockLogs: AuditLog[] = [
      {
        id: '1',
        timestamp: '2025-01-20 10:30:15',
        userId: 'user-1',
        userName: 'Admin Utama',
        action: 'CREATE',
        resource: 'Property',
        resourceId: 'prop-123',
        details: 'Menambahkan properti baru: Modern Villa Kemang',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status: 'success',
        changes: [
          { field: 'title', oldValue: null, newValue: 'Modern Villa Kemang' },
          { field: 'price', oldValue: null, newValue: 8500000000 },
          { field: 'status', oldValue: null, newValue: 'active' }
        ]
      },
      {
        id: '2',
        timestamp: '2025-01-20 10:15:32',
        userId: 'user-2',
        userName: 'Sarah Chen',
        action: 'UPDATE',
        resource: 'Client',
        resourceId: 'client-456',
        details: 'Memperbarui informasi klien',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        status: 'success',
        changes: [
          { field: 'phone', oldValue: '+62 812 1111 1111', newValue: '+62 812 2222 2222' },
          { field: 'status', oldValue: 'inactive', newValue: 'active' }
        ]
      },
      {
        id: '3',
        timestamp: '2025-01-20 09:45:18',
        userId: 'user-3',
        userName: 'Ahmad Pratama',
        action: 'DELETE',
        resource: 'User',
        resourceId: 'user-789',
        details: 'Menghapus pengguna yang tidak aktif',
        ipAddress: '192.168.1.102',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status: 'warning'
      },
      {
        id: '4',
        timestamp: '2025-01-20 09:30:45',
        userId: 'user-1',
        userName: 'Admin Utama',
        action: 'LOGIN',
        resource: 'System',
        details: 'Login berhasil ke dashboard admin',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        status: 'success'
      },
      {
        id: '5',
        timestamp: '2025-01-20 09:25:12',
        userId: 'user-4',
        userName: 'Unknown User',
        action: 'LOGIN',
        resource: 'System',
        details: 'Percobaan login gagal - kredensial salah',
        ipAddress: '203.0.113.1',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
        status: 'failed'
      }
    ];

    setTimeout(() => {
      setLogs(mockLogs);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;
    return matchesSearch && matchesAction && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'warning':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'bg-green-100 text-green-700';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-700';
      case 'DELETE':
        return 'bg-red-100 text-red-700';
      case 'LOGIN':
        return 'bg-purple-100 text-purple-700';
      case 'LOGOUT':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Resource', 'Details', 'Status', 'IP Address'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.userName,
        log.action,
        log.resource,
        `"${log.details}"`,
        log.status,
        log.ipAddress
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">Audit Trail</h2>
          <p className="text-sm text-neutral-600">Log aktivitas dan perubahan sistem</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportLogs}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Cari log aktivitas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Aksi</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="warning">Warning</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="1d">Hari Ini</option>
              <option value="7d">7 Hari Terakhir</option>
              <option value="30d">30 Hari Terakhir</option>
              <option value="90d">90 Hari Terakhir</option>
            </select>
          </div>
          <div className="text-sm text-neutral-600">
            Menampilkan {filteredLogs.length} dari {logs.length} log
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Waktu</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Pengguna</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Aksi</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Resource</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Detail</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-neutral-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm text-neutral-900">{log.timestamp}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-neutral-400" />
                      <span className="text-sm text-neutral-900">{log.userName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getActionColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-neutral-900">{log.resource}</span>
                    {log.resourceId && (
                      <div className="text-xs text-neutral-500">ID: {log.resourceId}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-neutral-700 line-clamp-2">{log.details}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(log.status)}`}>
                      {getStatusIcon(log.status)}
                      <span className="capitalize">{log.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedLog(log)}
                      className="p-1 text-neutral-600 hover:text-blue-600 transition-colors duration-200"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-neutral-900">Detail Log Aktivitas</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-2 hover:bg-neutral-100 rounded-lg transition-colors duration-200"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Waktu</label>
                  <p className="text-sm text-neutral-900">{selectedLog.timestamp}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Pengguna</label>
                  <p className="text-sm text-neutral-900">{selectedLog.userName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Aksi</label>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getActionColor(selectedLog.action)}`}>
                    {selectedLog.action}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                  <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedLog.status)}`}>
                    {getStatusIcon(selectedLog.status)}
                    <span className="capitalize">{selectedLog.status}</span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Detail</label>
                <p className="text-sm text-neutral-900 bg-neutral-50 p-3 rounded-lg">{selectedLog.details}</p>
              </div>

              {/* Technical Info */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">IP Address</label>
                  <p className="text-sm text-neutral-900 font-mono">{selectedLog.ipAddress}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">User Agent</label>
                  <p className="text-sm text-neutral-900 font-mono break-all">{selectedLog.userAgent}</p>
                </div>
              </div>

              {/* Changes */}
              {selectedLog.changes && selectedLog.changes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-3">Perubahan Data</label>
                  <div className="space-y-3">
                    {selectedLog.changes.map((change, index) => (
                      <div key={index} className="bg-neutral-50 p-3 rounded-lg">
                        <div className="font-medium text-sm text-neutral-900 mb-2">{change.field}</div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-neutral-600">Nilai Lama:</span>
                            <div className="font-mono bg-red-50 p-2 rounded mt-1">
                              {change.oldValue || 'null'}
                            </div>
                          </div>
                          <div>
                            <span className="text-neutral-600">Nilai Baru:</span>
                            <div className="font-mono bg-green-50 p-2 rounded mt-1">
                              {change.newValue}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditTrail;
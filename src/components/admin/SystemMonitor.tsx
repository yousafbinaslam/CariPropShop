import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Globe, 
  HardDrive, 
  Link, 
  Monitor, 
  RefreshCw, 
  Shield, 
  Zap,
  TrendingUp,
  TrendingDown,
  Eye,
  FileText,
  Settings,
  Bell,
  Download,
  Upload,
  Wifi,
  WifiOff,
  Server,
  BarChart3
} from 'lucide-react';

interface SystemHealth {
  score: number;
  issues: string[];
  lastCheck: string;
}

interface PerformanceMetric {
  timestamp: string;
  buildTime: number;
  bundleSize: number;
  chunkCount: number;
  assetCount: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  warnings: string[];
}

interface ChangeLog {
  timestamp: string;
  type: 'file' | 'component' | 'route' | 'config';
  action: 'created' | 'modified' | 'deleted';
  path: string;
  errors?: string[];
  warnings?: string[];
}

interface RealTimeEvent {
  id: string;
  type: 'dom' | 'network' | 'error' | 'performance' | 'build' | 'file';
  timestamp: string;
  data: any;
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: string;
}

interface Alert {
  id: string;
  rule: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  message: string;
}
const SystemMonitor: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    score: 95,
    issues: [],
    lastCheck: new Date().toISOString()
  });
  const [recentChanges, setRecentChanges] = useState<ChangeLog[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(true);
  const [realTimeEvents, setRealTimeEvents] = useState<RealTimeEvent[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);

  // Simulate real-time data updates
  useEffect(() => {
    // Connect to WebSocket for real-time monitoring
    const connectWebSocket = () => {
      setConnectionStatus('connecting');
      const ws = new WebSocket('ws://localhost:3002');
      
      ws.onopen = () => {
        console.log('Connected to real-time monitor');
        setConnectionStatus('connected');
        setWsConnection(ws);
      };
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'real-time-event':
              setRealTimeEvents(prev => [message.event, ...prev.slice(0, 99)]);
              break;
              
            case 'alert':
              setAlerts(prev => [message.alert, ...prev.slice(0, 19)]);
              break;
              
            case 'initial-events':
              setRealTimeEvents(message.events);
              break;
              
            case 'daily-report':
              console.log('Daily report received:', message.report);
              break;
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onclose = () => {
        console.log('Disconnected from real-time monitor');
        setConnectionStatus('disconnected');
        setWsConnection(null);
        
        // Attempt to reconnect after 5 seconds
        setTimeout(connectWebSocket, 5000);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
      };
    };
    
    connectWebSocket();
    
    // Cleanup on unmount
    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      // Update system health
      setSystemHealth(prev => ({
        ...prev,
        score: Math.max(85, Math.min(100, prev.score + (Math.random() - 0.5) * 2)),
        lastCheck: new Date().toISOString()
      }));

      // Add random changes
      if (Math.random() > 0.7) {
        const newChange: ChangeLog = {
          timestamp: new Date().toISOString(),
          type: ['file', 'component', 'route'][Math.floor(Math.random() * 3)] as any,
          action: ['created', 'modified'][Math.floor(Math.random() * 2)] as any,
          path: `src/components/Example${Math.floor(Math.random() * 100)}.tsx`,
          warnings: Math.random() > 0.8 ? ['Minor optimization opportunity'] : undefined
        };
        
        setRecentChanges(prev => [newChange, ...prev.slice(0, 19)]);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const systemStats = [
    {
      label: 'System Health',
      value: `${systemHealth.score}%`,
      icon: <Shield className="w-6 h-6" />,
      color: systemHealth.score >= 90 ? 'green' : systemHealth.score >= 70 ? 'yellow' : 'red',
      trend: 'up'
    },
    {
      label: 'Active Monitoring',
      value: isMonitoring ? 'Online' : 'Offline',
      icon: <Activity className="w-6 h-6" />,
      color: isMonitoring ? 'green' : 'red',
      trend: 'stable'
    },
    {
      label: 'Files Tracked',
      value: '247',
      icon: <FileText className="w-6 h-6" />,
      color: 'blue',
      trend: 'up'
    },
    {
      label: 'Last Build',
      value: '2.3s',
      icon: <Zap className="w-6 h-6" />,
      color: 'purple',
      trend: 'down'
    },
    {
      label: 'Bundle Size',
      value: '1.2MB',
      icon: <HardDrive className="w-6 h-6" />,
      color: 'orange',
      trend: 'stable'
    },
    {
      label: 'Memory Usage',
      value: '45MB',
      icon: <Monitor className="w-6 h-6" />,
      color: 'cyan',
      trend: 'up'
    }
  ];

  const monitoringFeatures = [
    {
      name: 'File Change Tracking',
      description: 'Real-time monitoring of all file modifications',
      status: 'active',
      icon: <Eye className="w-5 h-5" />
    },
    {
      name: 'Error Prevention',
      description: 'Automated code analysis and error detection',
      status: 'active',
      icon: <Shield className="w-5 h-5" />
    },
    {
      name: 'Performance Monitoring',
      description: 'Build time and bundle size optimization',
      status: 'active',
      icon: <TrendingUp className="w-5 h-5" />
    },
    {
      name: 'Link Validation',
      description: 'Automatic validation of internal and external links',
      status: 'active',
      icon: <Link className="w-5 h-5" />
    },
    {
      name: 'Health Scoring',
      description: 'Continuous assessment of system health',
      status: 'active',
      icon: <CheckCircle className="w-5 h-5" />
    },
    {
      name: 'Automated Backup',
      description: 'Regular backup of critical system state',
      status: 'active',
      icon: <Database className="w-5 h-5" />
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <Wifi className="w-4 h-4 text-green-600" />;
      case 'connecting': return <RefreshCw className="w-4 h-4 text-yellow-600 animate-spin" />;
      case 'disconnected': return <WifiOff className="w-4 h-4 text-red-600" />;
    }
  };
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-neutral-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getConnectionIcon()}
            <span className="font-medium text-neutral-900">Real-time Connection</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              connectionStatus === 'connected' ? 'bg-green-100 text-green-700' :
              connectionStatus === 'connecting' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {connectionStatus}
            </span>
          </div>
          <div className="text-sm text-neutral-600">
            {realTimeEvents.length} events tracked
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
            <Bell className="w-5 h-5 text-red-500 mr-2" />
            Active Alerts ({alerts.length})
          </h3>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
                alert.severity === 'critical' ? 'bg-red-50 border-red-200' :
                alert.severity === 'high' ? 'bg-orange-50 border-orange-200' :
                alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    alert.severity === 'critical' ? 'bg-red-500' :
                    alert.severity === 'high' ? 'bg-orange-500' :
                    alert.severity === 'medium' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}></div>
                  <div>
                    <span className="font-medium text-neutral-900">{alert.rule}</span>
                    <p className="text-sm text-neutral-600">{alert.message}</p>
                  </div>
                </div>
                <div className="text-xs text-neutral-500">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {systemStats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-neutral-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
                <div className={`text-${stat.color}-600`}>
                  {stat.icon}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-1">
                {getTrendIcon(stat.trend)}
                <span className="text-xs text-neutral-500">Trend</span>
              </div>
              <span className="text-xs text-neutral-500">Live</span>
            </div>
          </div>
        ))}
      </div>

      {/* Monitoring Features */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Active Monitoring Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {monitoringFeatures.map((feature, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 bg-neutral-50 rounded-lg">
              <div className="text-blue-600 mt-1">
                {feature.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-neutral-900">{feature.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(feature.status)}`}>
                    {feature.status}
                  </span>
                </div>
                <p className="text-sm text-neutral-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Health Details */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">System Health Details</h3>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-neutral-700">Overall Health Score</span>
            <div className="flex items-center space-x-2">
              <div className="w-32 bg-neutral-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    systemHealth.score >= 90 ? 'bg-green-500' :
                    systemHealth.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${systemHealth.score}%` }}
                ></div>
              </div>
              <span className="font-medium text-neutral-900">{systemHealth.score}%</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-neutral-700">Last Health Check</span>
            <span className="text-neutral-600">{new Date(systemHealth.lastCheck).toLocaleString()}</span>
          </div>
          
          {systemHealth.issues.length > 0 && (
            <div>
              <span className="text-neutral-700 block mb-2">Current Issues:</span>
              <ul className="space-y-1">
                {systemHealth.issues.map((issue, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-neutral-600">{issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderRealTime = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Real-time Events</h3>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {getConnectionIcon()}
            <span className="text-sm text-neutral-600">{connectionStatus}</span>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
            <Download className="w-4 h-4" />
            <span>Export Events</span>
          </button>
        </div>
      </div>

      {/* Event Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['info', 'warning', 'error', 'critical'].map(severity => {
          const count = realTimeEvents.filter(e => e.severity === severity).length;
          return (
            <div key={severity} className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 mb-1 capitalize">{severity}</p>
                  <p className="text-2xl font-bold text-neutral-900">{count}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  severity === 'critical' ? 'bg-red-500' :
                  severity === 'error' ? 'bg-orange-500' :
                  severity === 'warning' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`}></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real-time Event Stream */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="p-4 border-b border-neutral-200">
          <h4 className="font-medium text-neutral-900">Live Event Stream</h4>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {realTimeEvents.length === 0 ? (
            <div className="p-8 text-center">
              <Server className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600">No real-time events detected</p>
              <p className="text-sm text-neutral-500 mt-1">Events will appear here as they occur</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {realTimeEvents.map((event, index) => (
                <div key={event.id} className="p-4 hover:bg-neutral-50 transition-colors duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(event.severity)}`}>
                          {event.severity}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          event.type === 'error' ? 'bg-red-100 text-red-700' :
                          event.type === 'network' ? 'bg-blue-100 text-blue-700' :
                          event.type === 'performance' ? 'bg-green-100 text-green-700' :
                          event.type === 'build' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {event.type}
                        </span>
                        <span className="text-xs text-neutral-500">{event.source}</span>
                      </div>
                      <div className="text-sm text-neutral-900 mb-1">
                        {event.data.message || event.data.action || 'Event occurred'}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                      {event.data.details && (
                        <div className="mt-2 p-2 bg-neutral-50 rounded text-xs">
                          <pre className="whitespace-pre-wrap">{JSON.stringify(event.data.details, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
  const renderChanges = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Recent File Changes</h3>
        <div className="flex items-center space-x-2">
          <span className={`w-2 h-2 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-red-500'}`}></span>
          <span className="text-sm text-neutral-600">
            {isMonitoring ? 'Live Monitoring' : 'Monitoring Paused'}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          {recentChanges.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
              <p className="text-neutral-600">No recent changes detected</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {recentChanges.map((change, index) => (
                <div key={index} className="p-4 hover:bg-neutral-50 transition-colors duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          change.action === 'created' ? 'bg-green-100 text-green-700' :
                          change.action === 'modified' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {change.action}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          change.type === 'component' ? 'bg-purple-100 text-purple-700' :
                          change.type === 'route' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {change.type}
                        </span>
                      </div>
                      <p className="font-medium text-neutral-900 mb-1">{change.path}</p>
                      <p className="text-xs text-neutral-500">
                        {new Date(change.timestamp).toLocaleString()}
                      </p>
                      {change.warnings && change.warnings.length > 0 && (
                        <div className="mt-2">
                          {change.warnings.map((warning, wIndex) => (
                            <div key={wIndex} className="flex items-center space-x-1 text-xs text-yellow-600">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{warning}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'System Overview', icon: <Monitor className="w-4 h-4" /> },
    { id: 'realtime', label: 'Real-time Events', icon: <Activity className="w-4 h-4" /> },
    { id: 'changes', label: 'File Changes', icon: <FileText className="w-4 h-4" /> },
    { id: 'performance', label: 'Performance', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900">System Monitor</h2>
          <p className="text-sm text-neutral-600">Real-time website tracking and error prevention</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
              isMonitoring 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isMonitoring ? (
              <>
                <Activity className="w-4 h-4" />
                <span>Pause Monitoring</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Resume Monitoring</span>
              </>
            )}
          </button>
        </div>
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
      {activeTab === 'realtime' && renderRealTime()}
      {activeTab === 'changes' && renderChanges()}
      {activeTab === 'performance' && (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-neutral-200 text-center">
          <TrendingUp className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Performance Metrics</h3>
          <p className="text-neutral-600">Detailed performance analytics and optimization recommendations</p>
        </div>
      )}
      {activeTab === 'settings' && (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-neutral-200 text-center">
          <Settings className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Monitor Settings</h3>
          <p className="text-neutral-600">Configure monitoring preferences and alert thresholds</p>
        </div>
      )}
    </div>
  );
};

export default SystemMonitor;
import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Eye, 
  Link, 
  Smartphone, 
  Monitor, 
  Globe, 
  Database,
  Shield,
  Zap,
  RefreshCw,
  Search,
  Filter,
  Download,
  Play,
  Pause,
  Settings
} from 'lucide-react';

interface QualityCheck {
  id: string;
  name: string;
  category: 'functionality' | 'accessibility' | 'performance' | 'security' | 'compatibility';
  status: 'passed' | 'warning' | 'failed' | 'running' | 'pending';
  score: number;
  lastRun: string;
  description: string;
  issues?: string[];
  recommendations?: string[];
}

interface TestResult {
  id: string;
  testName: string;
  url: string;
  status: 'passed' | 'failed' | 'warning';
  responseTime: number;
  lastChecked: string;
  errorDetails?: string;
}

const QualityAssurance: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isRunningTests, setIsRunningTests] = useState(false);

  const qualityChecks: QualityCheck[] = [
    {
      id: '1',
      name: 'Link Functionality Test',
      category: 'functionality',
      status: 'passed',
      score: 98,
      lastRun: '2025-01-20 10:30',
      description: 'Automated testing of all internal and external links',
      issues: [],
      recommendations: ['Consider adding rel="noopener" to external links']
    },
    {
      id: '2',
      name: 'Mobile Responsiveness',
      category: 'accessibility',
      status: 'warning',
      score: 85,
      lastRun: '2025-01-20 10:25',
      description: 'Cross-device compatibility and responsive design validation',
      issues: ['Minor layout issues on tablets (768px-1024px)', 'Touch targets too small on some buttons'],
      recommendations: ['Increase button sizes for better touch interaction', 'Optimize tablet layout']
    },
    {
      id: '3',
      name: 'Page Load Performance',
      category: 'performance',
      status: 'passed',
      score: 92,
      lastRun: '2025-01-20 10:20',
      description: 'Website loading speed and performance metrics',
      issues: [],
      recommendations: ['Consider implementing lazy loading for images', 'Optimize CSS delivery']
    },
    {
      id: '4',
      name: 'Security Scan',
      category: 'security',
      status: 'passed',
      score: 96,
      lastRun: '2025-01-20 09:45',
      description: 'Security vulnerability assessment and SSL verification',
      issues: [],
      recommendations: ['Enable HSTS headers', 'Implement CSP headers']
    },
    {
      id: '5',
      name: 'Cross-Browser Compatibility',
      category: 'compatibility',
      status: 'warning',
      score: 88,
      lastRun: '2025-01-20 09:30',
      description: 'Testing across different browsers and versions',
      issues: ['Minor CSS inconsistencies in Safari', 'IE11 compatibility issues'],
      recommendations: ['Add vendor prefixes for better Safari support', 'Consider dropping IE11 support']
    },
    {
      id: '6',
      name: 'Database Integrity',
      category: 'functionality',
      status: 'passed',
      score: 99,
      lastRun: '2025-01-20 08:00',
      description: 'Data consistency and integrity validation',
      issues: [],
      recommendations: ['Schedule regular backup verification']
    }
  ];

  const linkTests: TestResult[] = [
    {
      id: '1',
      testName: 'Homepage Navigation',
      url: '/',
      status: 'passed',
      responseTime: 245,
      lastChecked: '2025-01-20 10:30'
    },
    {
      id: '2',
      testName: 'Property Listings',
      url: '/properties',
      status: 'passed',
      responseTime: 312,
      lastChecked: '2025-01-20 10:30'
    },
    {
      id: '3',
      testName: 'Admin Dashboard',
      url: '/admin',
      status: 'passed',
      responseTime: 189,
      lastChecked: '2025-01-20 10:30'
    },
    {
      id: '4',
      testName: 'Contact Form',
      url: '/contact',
      status: 'warning',
      responseTime: 456,
      lastChecked: '2025-01-20 10:30',
      errorDetails: 'Slow response time detected'
    },
    {
      id: '5',
      testName: 'WhatsApp Integration',
      url: 'https://wa.me/6282233541409',
      status: 'passed',
      responseTime: 123,
      lastChecked: '2025-01-20 10:30'
    }
  ];

  const performanceMetrics = {
    overallScore: 91,
    loadTime: 2.3,
    firstContentfulPaint: 1.2,
    largestContentfulPaint: 2.1,
    cumulativeLayoutShift: 0.05,
    firstInputDelay: 45
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle2 className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'running': return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'functionality': return <Zap className="w-5 h-5" />;
      case 'accessibility': return <Eye className="w-5 h-5" />;
      case 'performance': return <Monitor className="w-5 h-5" />;
      case 'security': return <Shield className="w-5 h-5" />;
      case 'compatibility': return <Globe className="w-5 h-5" />;
      default: return <CheckCircle2 className="w-5 h-5" />;
    }
  };

  const runAllTests = () => {
    setIsRunningTests(true);
    // Simulate test execution
    setTimeout(() => {
      setIsRunningTests(false);
    }, 5000);
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">Overall Quality Score</h3>
          <button
            onClick={runAllTests}
            disabled={isRunningTests}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
          >
            {isRunningTests ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Tests...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Run All Tests</span>
              </>
            )}
          </button>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-700">Quality Score</span>
              <span className="text-3xl font-bold text-green-600">91%</span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-4">
              <div className="bg-green-600 h-4 rounded-full" style={{ width: '91%' }}></div>
            </div>
            <div className="flex justify-between text-xs text-neutral-500 mt-1">
              <span>Poor</span>
              <span>Good</span>
              <span>Excellent</span>
            </div>
          </div>
          <div className="text-center">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-2" />
            <span className="text-sm text-green-700 font-medium">Excellent Quality</span>
          </div>
        </div>
      </div>

      {/* Category Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {['functionality', 'accessibility', 'performance', 'security', 'compatibility'].map((category) => {
          const categoryChecks = qualityChecks.filter(check => check.category === category);
          const avgScore = categoryChecks.reduce((sum, check) => sum + check.score, 0) / categoryChecks.length;
          const hasIssues = categoryChecks.some(check => check.status === 'warning' || check.status === 'failed');
          
          return (
            <div key={category} className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-2 rounded-lg ${hasIssues ? 'bg-yellow-100' : 'bg-green-100'}`}>
                  {getCategoryIcon(category)}
                </div>
                <div>
                  <h4 className="font-medium text-neutral-900 capitalize">{category}</h4>
                  <p className="text-sm text-neutral-600">{categoryChecks.length} checks</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex-1 mr-3">
                  <div className={`w-full bg-neutral-200 rounded-full h-2`}>
                    <div 
                      className={`h-2 rounded-full ${avgScore >= 90 ? 'bg-green-500' : avgScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                      style={{ width: `${avgScore}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-medium text-neutral-900">{Math.round(avgScore)}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Issues */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recent Issues & Recommendations</h3>
        <div className="space-y-4">
          {qualityChecks
            .filter(check => check.issues && check.issues.length > 0)
            .slice(0, 3)
            .map((check) => (
              <div key={check.id} className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-yellow-900 mb-1">{check.name}</h4>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      {check.issues?.map((issue, index) => (
                        <li key={index}>• {issue}</li>
                      ))}
                    </ul>
                    {check.recommendations && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-yellow-900">Recommendations:</p>
                        <ul className="text-sm text-yellow-800 space-y-1">
                          {check.recommendations.map((rec, index) => (
                            <li key={index}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderLinkTests = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Link Functionality Tests</h3>
        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
          <RefreshCw className="w-4 h-4" />
          <span>Test All Links</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Test Name</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">URL</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Response Time</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Last Checked</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-neutral-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {linkTests.map((test) => (
                <tr key={test.id} className="hover:bg-neutral-50 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <span className="font-medium text-neutral-900">{test.testName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-neutral-600 font-mono">{test.url}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                      {getStatusIcon(test.status)}
                      <span className="capitalize">{test.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm ${test.responseTime > 400 ? 'text-red-600' : test.responseTime > 200 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {test.responseTime}ms
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-neutral-600">{test.lastChecked}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-neutral-600 hover:text-blue-600 transition-colors duration-200">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-neutral-600 hover:text-green-600 transition-colors duration-200">
                        <RefreshCw className="w-4 h-4" />
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

  const renderPerformance = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-neutral-900">Performance Metrics</h3>
      
      {/* Core Web Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-neutral-900">First Contentful Paint</h4>
            <Monitor className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">{performanceMetrics.firstContentfulPaint}s</div>
          <div className="text-sm text-neutral-600">Good (< 1.8s)</div>
          <div className="w-full bg-neutral-200 rounded-full h-2 mt-3">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-neutral-900">Largest Contentful Paint</h4>
            <Eye className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">{performanceMetrics.largestContentfulPaint}s</div>
          <div className="text-sm text-neutral-600">Good (< 2.5s)</div>
          <div className="w-full bg-neutral-200 rounded-full h-2 mt-3">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '84%' }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-neutral-900">Cumulative Layout Shift</h4>
            <Zap className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">{performanceMetrics.cumulativeLayoutShift}</div>
          <div className="text-sm text-neutral-600">Good (< 0.1)</div>
          <div className="w-full bg-neutral-200 rounded-full h-2 mt-3">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
        <h4 className="font-medium text-neutral-900 mb-4">Performance Trends</h4>
        <div className="h-64 bg-neutral-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Monitor className="w-12 h-12 text-neutral-400 mx-auto mb-2" />
            <p className="text-neutral-600">Performance chart visualization</p>
            <p className="text-sm text-neutral-500">Real-time performance monitoring</p>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'links', label: 'Link Tests', icon: <Link className="w-4 h-4" /> },
    { id: 'performance', label: 'Performance', icon: <Zap className="w-4 h-4" /> },
    { id: 'accessibility', label: 'Accessibility', icon: <Eye className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-neutral-900">Quality Assurance Dashboard</h2>
        <p className="text-sm text-neutral-600">Comprehensive testing and quality monitoring</p>
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
      {activeTab === 'links' && renderLinkTests()}
      {activeTab === 'performance' && renderPerformance()}
      {activeTab === 'accessibility' && (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-neutral-200 text-center">
          <Eye className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Accessibility Testing</h3>
          <p className="text-neutral-600">WCAG compliance and accessibility audit tools</p>
        </div>
      )}
      {activeTab === 'security' && (
        <div className="bg-white p-12 rounded-xl shadow-sm border border-neutral-200 text-center">
          <Shield className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Security Assessment</h3>
          <p className="text-neutral-600">Vulnerability scanning and security monitoring</p>
        </div>
      )}
    </div>
  );
};

export default QualityAssurance;
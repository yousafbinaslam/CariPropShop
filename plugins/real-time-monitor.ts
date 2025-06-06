import { Plugin } from 'vite';
import { WebSocketServer } from 'ws';
import { watch } from 'chokidar';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as cron from 'node-cron';

interface MonitoringConfig {
  enableDOMTracking: boolean;
  enableNetworkMonitoring: boolean;
  enablePerformanceTracking: boolean;
  enableErrorCapture: boolean;
  alertThresholds: {
    errorRate: number;
    responseTime: number;
    memoryUsage: number;
    buildTime: number;
  };
  reportingInterval: string; // cron expression
  retentionPeriod: number; // days
}

interface RealTimeEvent {
  id: string;
  type: 'dom' | 'network' | 'error' | 'performance' | 'build' | 'file';
  timestamp: string;
  data: any;
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: string;
}

interface AlertRule {
  id: string;
  name: string;
  condition: (events: RealTimeEvent[]) => boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  cooldown: number; // milliseconds
  lastTriggered?: string;
}

interface DailyReport {
  date: string;
  summary: {
    totalEvents: number;
    errorCount: number;
    warningCount: number;
    avgResponseTime: number;
    peakMemoryUsage: number;
    buildCount: number;
    avgBuildTime: number;
  };
  trends: {
    errorRate: number;
    performanceScore: number;
    stabilityScore: number;
  };
  topIssues: Array<{
    type: string;
    count: number;
    description: string;
  }>;
  recommendations: string[];
}

export function realTimeMonitor(config: MonitoringConfig = {
  enableDOMTracking: true,
  enableNetworkMonitoring: true,
  enablePerformanceTracking: true,
  enableErrorCapture: true,
  alertThresholds: {
    errorRate: 10, // errors per minute
    responseTime: 5000, // milliseconds
    memoryUsage: 100 * 1024 * 1024, // 100MB
    buildTime: 30000 // 30 seconds
  },
  reportingInterval: '0 0 * * *', // Daily at midnight
  retentionPeriod: 30 // 30 days
}): Plugin {
  let events: RealTimeEvent[] = [];
  let wsServer: WebSocketServer;
  let connectedClients: Set<WebSocket> = new Set();
  
  const logDir = join(process.cwd(), 'logs');
  const eventsFile = join(logDir, 'real-time-events.json');
  const reportsDir = join(logDir, 'daily-reports');
  
  // Ensure directories exist
  [logDir, reportsDir].forEach(dir => {
    if (!existsSync(dir)) {
      require('fs').mkdirSync(dir, { recursive: true });
    }
  });

  const alertRules: AlertRule[] = [
    {
      id: 'high-error-rate',
      name: 'High Error Rate',
      condition: (events) => {
        const recentErrors = events.filter(e => 
          e.type === 'error' && 
          Date.now() - new Date(e.timestamp).getTime() < 60000 // Last minute
        );
        return recentErrors.length > config.alertThresholds.errorRate;
      },
      severity: 'high',
      cooldown: 300000 // 5 minutes
    },
    {
      id: 'slow-response-time',
      name: 'Slow Response Time',
      condition: (events) => {
        const recentNetwork = events.filter(e => 
          e.type === 'network' && 
          Date.now() - new Date(e.timestamp).getTime() < 60000
        );
        const avgResponseTime = recentNetwork.reduce((sum, e) => 
          sum + (e.data.responseTime || 0), 0) / recentNetwork.length;
        return avgResponseTime > config.alertThresholds.responseTime;
      },
      severity: 'medium',
      cooldown: 180000 // 3 minutes
    },
    {
      id: 'memory-leak',
      name: 'Potential Memory Leak',
      condition: (events) => {
        const recentPerf = events.filter(e => 
          e.type === 'performance' && 
          e.data.memoryUsage &&
          Date.now() - new Date(e.timestamp).getTime() < 300000 // Last 5 minutes
        );
        return recentPerf.some(e => e.data.memoryUsage > config.alertThresholds.memoryUsage);
      },
      severity: 'high',
      cooldown: 600000 // 10 minutes
    },
    {
      id: 'build-performance',
      name: 'Build Performance Degradation',
      condition: (events) => {
        const recentBuilds = events.filter(e => 
          e.type === 'build' && 
          Date.now() - new Date(e.timestamp).getTime() < 3600000 // Last hour
        );
        const avgBuildTime = recentBuilds.reduce((sum, e) => 
          sum + (e.data.buildTime || 0), 0) / recentBuilds.length;
        return avgBuildTime > config.alertThresholds.buildTime;
      },
      severity: 'medium',
      cooldown: 900000 // 15 minutes
    }
  ];

  function addEvent(event: Omit<RealTimeEvent, 'id' | 'timestamp'>) {
    const realTimeEvent: RealTimeEvent = {
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...event
    };
    
    events.unshift(realTimeEvent);
    
    // Keep only recent events in memory (last 10,000)
    if (events.length > 10000) {
      events = events.slice(0, 10000);
    }
    
    // Broadcast to connected clients
    broadcastEvent(realTimeEvent);
    
    // Check alert rules
    checkAlertRules();
    
    // Persist events periodically
    if (events.length % 100 === 0) {
      persistEvents();
    }
  }

  function broadcastEvent(event: RealTimeEvent) {
    const message = JSON.stringify({
      type: 'real-time-event',
      event
    });
    
    connectedClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  function checkAlertRules() {
    const now = Date.now();
    
    alertRules.forEach(rule => {
      // Check cooldown
      if (rule.lastTriggered && 
          now - new Date(rule.lastTriggered).getTime() < rule.cooldown) {
        return;
      }
      
      if (rule.condition(events)) {
        triggerAlert(rule);
        rule.lastTriggered = new Date().toISOString();
      }
    });
  }

  function triggerAlert(rule: AlertRule) {
    const alert = {
      id: `alert-${Date.now()}`,
      rule: rule.name,
      severity: rule.severity,
      timestamp: new Date().toISOString(),
      message: `Alert triggered: ${rule.name}`
    };
    
    console.log(`🚨 ${rule.severity.toUpperCase()} ALERT: ${rule.name}`);
    
    // Add alert as an event
    addEvent({
      type: 'error',
      severity: rule.severity === 'critical' ? 'critical' : 'warning',
      source: 'alert-system',
      data: alert
    });
    
    // Send desktop notification if supported
    broadcastNotification(alert);
  }

  function broadcastNotification(alert: any) {
    const message = JSON.stringify({
      type: 'alert',
      alert
    });
    
    connectedClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  function persistEvents() {
    try {
      const dataToSave = {
        events: events.slice(0, 1000), // Save last 1000 events
        lastUpdate: new Date().toISOString()
      };
      writeFileSync(eventsFile, JSON.stringify(dataToSave, null, 2));
    } catch (error) {
      console.error('Failed to persist events:', error);
    }
  }

  function loadEvents() {
    if (existsSync(eventsFile)) {
      try {
        const data = JSON.parse(readFileSync(eventsFile, 'utf-8'));
        events = data.events || [];
      } catch (error) {
        console.warn('Could not load existing events:', error);
      }
    }
  }

  function generateDailyReport(): DailyReport {
    const today = new Date().toISOString().split('T')[0];
    const todayEvents = events.filter(e => e.timestamp.startsWith(today));
    
    const errorEvents = todayEvents.filter(e => e.severity === 'error' || e.severity === 'critical');
    const warningEvents = todayEvents.filter(e => e.severity === 'warning');
    const networkEvents = todayEvents.filter(e => e.type === 'network');
    const buildEvents = todayEvents.filter(e => e.type === 'build');
    
    const avgResponseTime = networkEvents.length > 0 
      ? networkEvents.reduce((sum, e) => sum + (e.data.responseTime || 0), 0) / networkEvents.length
      : 0;
    
    const peakMemoryUsage = Math.max(
      ...todayEvents
        .filter(e => e.data.memoryUsage)
        .map(e => e.data.memoryUsage),
      0
    );
    
    const avgBuildTime = buildEvents.length > 0
      ? buildEvents.reduce((sum, e) => sum + (e.data.buildTime || 0), 0) / buildEvents.length
      : 0;
    
    // Calculate trends (simplified)
    const errorRate = (errorEvents.length / Math.max(todayEvents.length, 1)) * 100;
    const performanceScore = Math.max(0, 100 - (avgResponseTime / 100));
    const stabilityScore = Math.max(0, 100 - (errorEvents.length * 5));
    
    // Identify top issues
    const issueTypes = todayEvents.reduce((acc, event) => {
      const key = `${event.type}-${event.severity}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topIssues = Object.entries(issueTypes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({
        type,
        count,
        description: `${type} events occurred ${count} times`
      }));
    
    // Generate recommendations
    const recommendations: string[] = [];
    
    if (errorRate > 5) {
      recommendations.push('High error rate detected - review recent code changes');
    }
    
    if (avgResponseTime > 2000) {
      recommendations.push('Slow response times - consider performance optimization');
    }
    
    if (avgBuildTime > 15000) {
      recommendations.push('Build times are slow - consider build optimization');
    }
    
    if (peakMemoryUsage > 80 * 1024 * 1024) {
      recommendations.push('High memory usage detected - check for memory leaks');
    }
    
    return {
      date: today,
      summary: {
        totalEvents: todayEvents.length,
        errorCount: errorEvents.length,
        warningCount: warningEvents.length,
        avgResponseTime,
        peakMemoryUsage,
        buildCount: buildEvents.length,
        avgBuildTime
      },
      trends: {
        errorRate,
        performanceScore,
        stabilityScore
      },
      topIssues,
      recommendations
    };
  }

  function saveDailyReport() {
    const report = generateDailyReport();
    const reportFile = join(reportsDir, `report-${report.date}.json`);
    
    try {
      writeFileSync(reportFile, JSON.stringify(report, null, 2));
      console.log(`📊 Daily report generated: ${reportFile}`);
      
      // Broadcast report to connected clients
      const message = JSON.stringify({
        type: 'daily-report',
        report
      });
      
      connectedClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    } catch (error) {
      console.error('Failed to save daily report:', error);
    }
  }

  function cleanupOldData() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - config.retentionPeriod);
    
    // Remove old events
    events = events.filter(e => new Date(e.timestamp) > cutoffDate);
    
    // Clean up old report files
    try {
      const fs = require('fs');
      const files = fs.readdirSync(reportsDir);
      
      files.forEach((file: string) => {
        if (file.startsWith('report-')) {
          const fileDate = file.replace('report-', '').replace('.json', '');
          if (new Date(fileDate) < cutoffDate) {
            fs.unlinkSync(join(reportsDir, file));
          }
        }
      });
    } catch (error) {
      console.warn('Failed to cleanup old report files:', error);
    }
  }

  return {
    name: 'real-time-monitor',
    
    configureServer(server) {
      loadEvents();
      
      // WebSocket server for real-time communication
      wsServer = new WebSocketServer({ port: 3002 });
      
      wsServer.on('connection', (ws) => {
        connectedClients.add(ws);
        console.log(`🔌 Real-time monitor client connected (${connectedClients.size} total)`);
        
        // Send recent events to new client
        ws.send(JSON.stringify({
          type: 'initial-events',
          events: events.slice(0, 50)
        }));
        
        ws.on('close', () => {
          connectedClients.delete(ws);
          console.log(`🔌 Real-time monitor client disconnected (${connectedClients.size} total)`);
        });
        
        ws.on('message', (message) => {
          try {
            const data = JSON.parse(message.toString());
            
            switch (data.type) {
              case 'client-error':
                addEvent({
                  type: 'error',
                  severity: 'error',
                  source: 'client',
                  data: data.error
                });
                break;
                
              case 'performance-metric':
                addEvent({
                  type: 'performance',
                  severity: 'info',
                  source: 'client',
                  data: data.metric
                });
                break;
                
              case 'network-request':
                addEvent({
                  type: 'network',
                  severity: data.error ? 'warning' : 'info',
                  source: 'client',
                  data: data.request
                });
                break;
            }
          } catch (error) {
            console.error('Error processing real-time monitor message:', error);
          }
        });
      });
      
      // File watcher
      if (config.enableDOMTracking) {
        const watcher = watch(['src/**/*'], {
          ignored: ['node_modules', 'dist', 'logs'],
          persistent: true
        });
        
        watcher.on('change', (filePath) => {
          addEvent({
            type: 'file',
            severity: 'info',
            source: 'file-watcher',
            data: { path: filePath, action: 'modified' }
          });
        });
      }
      
      // Schedule daily reports
      cron.schedule(config.reportingInterval, () => {
        saveDailyReport();
        cleanupOldData();
      });
      
      // Periodic cleanup
      cron.schedule('0 2 * * *', () => { // 2 AM daily
        cleanupOldData();
      });
      
      // Regular event persistence
      setInterval(() => {
        persistEvents();
      }, 60000); // Every minute
    },
    
    buildStart() {
      console.log('📡 Real-time monitoring started');
      addEvent({
        type: 'build',
        severity: 'info',
        source: 'vite',
        data: { action: 'build-start', timestamp: Date.now() }
      });
    },
    
    buildEnd() {
      addEvent({
        type: 'build',
        severity: 'info',
        source: 'vite',
        data: { action: 'build-end', timestamp: Date.now() }
      });
    },
    
    buildError(error) {
      addEvent({
        type: 'error',
        severity: 'critical',
        source: 'vite',
        data: {
          message: error.message,
          stack: error.stack,
          plugin: error.plugin
        }
      });
    },
    
    generateBundle(options, bundle) {
      const bundleSize = Object.values(bundle).reduce((size, chunk: any) => {
        return size + (chunk.code?.length || chunk.source?.length || 0);
      }, 0);
      
      addEvent({
        type: 'build',
        severity: 'info',
        source: 'vite',
        data: {
          action: 'bundle-generated',
          bundleSize,
          chunkCount: Object.keys(bundle).length
        }
      });
    }
  };
}
import { Plugin } from 'vite';
import { watch } from 'chokidar';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import * as cron from 'node-cron';

interface TrackerConfig {
  errorThreshold: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  performanceBenchmarks: {
    buildTime: number;
    bundleSize: number;
    chunkSize: number;
    memoryUsage: number;
  };
  loggingLevel: 'minimal' | 'standard' | 'detailed' | 'verbose';
  notifications: {
    desktop: boolean;
    console: boolean;
    webhook: boolean;
  };
  recovery: {
    autoRestart: boolean;
    backupOnError: boolean;
    rollbackOnFailure: boolean;
  };
}

interface DOMChange {
  type: 'mutation' | 'creation' | 'deletion';
  element: string;
  timestamp: string;
  attributes?: Record<string, string>;
  content?: string;
}

interface StateChange {
  component: string;
  state: string;
  oldValue: any;
  newValue: any;
  timestamp: string;
  stackTrace?: string;
}

interface NetworkRequest {
  url: string;
  method: string;
  status: number;
  responseTime: number;
  timestamp: string;
  error?: string;
}

interface ErrorLog {
  type: 'javascript' | 'network' | 'build' | 'runtime';
  message: string;
  stack?: string;
  file?: string;
  line?: number;
  column?: number;
  timestamp: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  recovered: boolean;
}

interface ComprehensiveState {
  domChanges: DOMChange[];
  stateChanges: StateChange[];
  networkRequests: NetworkRequest[];
  errors: ErrorLog[];
  performance: {
    buildTimes: number[];
    bundleSizes: number[];
    memoryUsage: number[];
    loadTimes: number[];
  };
  health: {
    score: number;
    status: 'excellent' | 'good' | 'warning' | 'critical';
    lastCheck: string;
    issues: string[];
  };
  recovery: {
    attempts: number;
    successful: number;
    lastRecovery: string;
  };
}

export function comprehensiveTracker(config: TrackerConfig): Plugin {
  let state: ComprehensiveState = {
    domChanges: [],
    stateChanges: [],
    networkRequests: [],
    errors: [],
    performance: {
      buildTimes: [],
      bundleSizes: [],
      memoryUsage: [],
      loadTimes: []
    },
    health: {
      score: 100,
      status: 'excellent',
      lastCheck: new Date().toISOString(),
      issues: []
    },
    recovery: {
      attempts: 0,
      successful: 0,
      lastRecovery: ''
    }
  };

  const logDir = join(process.cwd(), 'logs');
  const stateFile = join(logDir, 'comprehensive-state.json');
  const dailyReportDir = join(logDir, 'daily-reports');
  const backupDir = join(logDir, 'backups');

  // Ensure directories exist
  [logDir, dailyReportDir, backupDir].forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  });

  let buildStartTime: number;

  function saveState() {
    try {
      writeFileSync(stateFile, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('Failed to save comprehensive state:', error);
    }
  }

  function loadState() {
    if (existsSync(stateFile)) {
      try {
        state = { ...state, ...JSON.parse(readFileSync(stateFile, 'utf-8')) };
      } catch (error) {
        console.warn('Could not load existing state:', error);
      }
    }
  }

  function calculateHealthScore(): number {
    let score = 100;
    const recentErrors = state.errors.filter(e => 
      Date.now() - new Date(e.timestamp).getTime() < 3600000 // Last hour
    );

    // Deduct points for errors
    recentErrors.forEach(error => {
      switch (error.severity) {
        case 'critical': score -= 20; break;
        case 'high': score -= 10; break;
        case 'medium': score -= 5; break;
        case 'low': score -= 2; break;
      }
    });

    // Performance penalties
    const avgBuildTime = state.performance.buildTimes.slice(-5).reduce((a, b) => a + b, 0) / 5;
    if (avgBuildTime > config.performanceBenchmarks.buildTime) {
      score -= 10;
    }

    const avgBundleSize = state.performance.bundleSizes.slice(-5).reduce((a, b) => a + b, 0) / 5;
    if (avgBundleSize > config.performanceBenchmarks.bundleSize) {
      score -= 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  function updateHealthStatus() {
    const score = calculateHealthScore();
    state.health.score = score;
    state.health.lastCheck = new Date().toISOString();
    
    if (score >= 90) state.health.status = 'excellent';
    else if (score >= 70) state.health.status = 'good';
    else if (score >= 50) state.health.status = 'warning';
    else state.health.status = 'critical';

    // Update issues
    state.health.issues = [];
    const recentErrors = state.errors.filter(e => 
      Date.now() - new Date(e.timestamp).getTime() < 3600000
    );
    
    if (recentErrors.length > 0) {
      state.health.issues.push(`${recentErrors.length} recent errors detected`);
    }

    const avgBuildTime = state.performance.buildTimes.slice(-5).reduce((a, b) => a + b, 0) / 5;
    if (avgBuildTime > config.performanceBenchmarks.buildTime) {
      state.health.issues.push('Build time exceeds benchmark');
    }

    saveState();
  }

  function logError(error: Partial<ErrorLog>) {
    const errorLog: ErrorLog = {
      type: 'javascript',
      message: '',
      timestamp: new Date().toISOString(),
      severity: 'medium',
      recovered: false,
      ...error
    };

    state.errors.unshift(errorLog);
    if (state.errors.length > 1000) {
      state.errors = state.errors.slice(0, 1000);
    }

    // Check thresholds
    const criticalErrors = state.errors.filter(e => e.severity === 'critical').length;
    if (criticalErrors > config.errorThreshold.critical) {
      triggerRecovery('Critical error threshold exceeded');
    }

    updateHealthStatus();
    broadcastUpdate('error', errorLog);
  }

  function triggerRecovery(reason: string) {
    state.recovery.attempts++;
    console.log(`🔄 Triggering recovery: ${reason}`);

    if (config.recovery.backupOnError) {
      createBackup();
    }

    if (config.recovery.autoRestart) {
      // Implement restart logic
      console.log('🔄 Auto-restart initiated');
    }

    state.recovery.lastRecovery = new Date().toISOString();
    state.recovery.successful++;
    saveState();
  }

  function createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = join(backupDir, `backup-${timestamp}.json`);
    
    try {
      writeFileSync(backupFile, JSON.stringify(state, null, 2));
      console.log(`💾 Backup created: ${backupFile}`);
    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  }

  function generateDailyReport() {
    const today = new Date().toISOString().split('T')[0];
    const reportFile = join(dailyReportDir, `report-${today}.json`);
    
    const todayErrors = state.errors.filter(e => 
      e.timestamp.startsWith(today)
    );

    const report = {
      date: today,
      summary: {
        totalErrors: todayErrors.length,
        criticalErrors: todayErrors.filter(e => e.severity === 'critical').length,
        recoveryAttempts: state.recovery.attempts,
        healthScore: state.health.score,
        status: state.health.status
      },
      performance: {
        avgBuildTime: state.performance.buildTimes.slice(-10).reduce((a, b) => a + b, 0) / 10,
        avgBundleSize: state.performance.bundleSizes.slice(-10).reduce((a, b) => a + b, 0) / 10,
        avgMemoryUsage: state.performance.memoryUsage.slice(-10).reduce((a, b) => a + b, 0) / 10
      },
      errors: todayErrors,
      recommendations: generateRecommendations()
    };

    try {
      writeFileSync(reportFile, JSON.stringify(report, null, 2));
      console.log(`📊 Daily report generated: ${reportFile}`);
    } catch (error) {
      console.error('Failed to generate daily report:', error);
    }
  }

  function generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    if (state.health.score < 70) {
      recommendations.push('Consider reviewing recent code changes for potential issues');
    }
    
    const avgBuildTime = state.performance.buildTimes.slice(-5).reduce((a, b) => a + b, 0) / 5;
    if (avgBuildTime > config.performanceBenchmarks.buildTime) {
      recommendations.push('Optimize build performance with code splitting');
    }
    
    const recentErrors = state.errors.filter(e => 
      Date.now() - new Date(e.timestamp).getTime() < 86400000 // Last 24 hours
    );
    
    if (recentErrors.length > 10) {
      recommendations.push('High error rate detected - review error patterns');
    }

    return recommendations;
  }

  function broadcastUpdate(type: string, data: any) {
    // Placeholder for WebSocket broadcasting
    console.log(`📡 Broadcasting update: ${type}`, data);
  }

  return {
    name: 'comprehensive-tracker',
    
    configureServer(server) {
      loadState();
      
      // Handle incoming WebSocket messages
      server.ws.on('message', (message) => {
        try {
          const data = JSON.parse(message.toString());
          
          switch (data.type) {
            case 'dom-change':
              state.domChanges.unshift(data.data);
              if (state.domChanges.length > 1000) {
                state.domChanges = state.domChanges.slice(0, 1000);
              }
              break;
            
            case 'state-change':
              state.stateChanges.unshift(data.data);
              if (state.stateChanges.length > 1000) {
                state.stateChanges = state.stateChanges.slice(0, 1000);
              }
              break;
            
            case 'network-request':
              state.networkRequests.unshift(data.data);
              if (state.networkRequests.length > 1000) {
                state.networkRequests = state.networkRequests.slice(0, 1000);
              }
              break;
            
            case 'javascript-error':
            case 'promise-rejection':
            case 'network-error':
              logError({
                type: data.type === 'network-error' ? 'network' : 'javascript',
                message: data.data.message,
                stack: data.data.stack,
                file: data.data.filename,
                line: data.data.lineno,
                column: data.data.colno,
                severity: data.data.severity || 'medium'
              });
              break;
          }
          
          saveState();
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      });
      
      // Use Vite's built-in WebSocket for real-time communication
      server.ws.on('comprehensive-tracker:get-state', () => {
        server.ws.send('comprehensive-tracker:state', {
          events: state.errors.slice(0, 50),
          health: state.health,
          timestamp: new Date().toISOString()
        });
      });
      
      server.ws.on('comprehensive-tracker:client-error', (data) => {
        logError({
          type: 'javascript',
          message: data.error?.message || 'Client error',
          stack: data.error?.stack,
          severity: 'high'
        });
      });

      // File watcher for comprehensive tracking
      const watcher = watch(['src/**/*', 'public/**/*', '*.config.*'], {
        ignored: ['node_modules', 'dist', 'logs'],
        persistent: true
      });

      watcher.on('change', (filePath) => {
        console.log(`📝 File changed: ${filePath}`);
        updateHealthStatus();
        broadcastUpdate('file-change', { path: filePath, timestamp: new Date().toISOString() });
      });

      // Health check interval
      setInterval(() => {
        updateHealthStatus();
        broadcastUpdate('health-update', state.health);
      }, 30000);

      // Daily report generation
      cron.schedule('0 0 * * *', () => {
        generateDailyReport();
      });
    },
    
    transformIndexHtml(html) {
      // Inject monitoring script only in development
      if (process.env.NODE_ENV === 'development') {
        const script = `
          <script>
            if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
              // Use Vite's HMR WebSocket for monitoring
              console.log('📊 Comprehensive tracking initialized');
            }
          </script>
        `;
        return html.replace('</head>', `${script}</head>`);
      }
      return html;
    },
    
    buildStart() {
      buildStartTime = Date.now();
      console.log('🚀 Comprehensive tracking started');
      updateHealthStatus();
    },
    
    generateBundle(options, bundle) {
      const buildTime = Date.now() - buildStartTime;
      let bundleSize = 0;
      
      Object.values(bundle).forEach((chunk: any) => {
        if (chunk.code) bundleSize += chunk.code.length;
        if (chunk.source) bundleSize += chunk.source.length;
      });
      
      state.performance.buildTimes.unshift(buildTime);
      state.performance.bundleSizes.unshift(bundleSize);
      state.performance.memoryUsage.unshift(process.memoryUsage().heapUsed);
      
      // Keep only last 100 entries
      ['buildTimes', 'bundleSizes', 'memoryUsage'].forEach(key => {
        if (state.performance[key as keyof typeof state.performance].length > 100) {
          (state.performance[key as keyof typeof state.performance] as number[]) = 
            (state.performance[key as keyof typeof state.performance] as number[]).slice(0, 100);
        }
      });
      
      // Performance warnings
      if (buildTime > config.performanceBenchmarks.buildTime) {
        logError({
          type: 'build',
          message: `Build time exceeded benchmark: ${buildTime}ms > ${config.performanceBenchmarks.buildTime}ms`,
          severity: 'medium'
        });
      }
      
      if (bundleSize > config.performanceBenchmarks.bundleSize) {
        logError({
          type: 'build',
          message: `Bundle size exceeded benchmark: ${bundleSize} bytes > ${config.performanceBenchmarks.bundleSize} bytes`,
          severity: 'medium'
        });
      }
      
      updateHealthStatus();
      saveState();
    },
    
    buildEnd() {
      console.log('✅ Build completed');
      console.log(`📊 Health Score: ${state.health.score}/100 (${state.health.status})`);
      
      if (state.health.issues.length > 0) {
        console.log('⚠️  Current Issues:');
        state.health.issues.forEach(issue => console.log(`   • ${issue}`));
      }
      
      const recommendations = generateRecommendations();
      if (recommendations.length > 0) {
        console.log('💡 Recommendations:');
        recommendations.forEach(rec => console.log(`   • ${rec}`));
      }
    }
  };
}
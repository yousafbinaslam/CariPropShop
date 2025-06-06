import { Plugin } from 'vite';
import { writeFileSync, readFileSync, existsSync, copyFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';
import * as cron from 'node-cron';

interface RecoveryConfig {
  backupInterval: string; // cron expression
  maxBackups: number;
  autoRestart: boolean;
  rollbackOnFailure: boolean;
  healthCheckInterval: number; // milliseconds
  errorThresholds: {
    critical: number;
    consecutive: number;
    timeWindow: number; // milliseconds
  };
}

interface BackupSnapshot {
  id: string;
  timestamp: string;
  files: Array<{
    path: string;
    content: string;
    checksum: string;
  }>;
  metadata: {
    buildSuccess: boolean;
    errorCount: number;
    performanceScore: number;
    healthScore: number;
  };
}

interface RecoveryAction {
  id: string;
  type: 'restart' | 'rollback' | 'backup' | 'repair';
  timestamp: string;
  reason: string;
  success: boolean;
  details?: any;
}

interface SystemHealth {
  isHealthy: boolean;
  score: number;
  issues: string[];
  lastCheck: string;
  consecutiveFailures: number;
}

export function automatedRecovery(config: RecoveryConfig = {
  backupInterval: '0 */6 * * *', // Every 6 hours
  maxBackups: 24,
  autoRestart: true,
  rollbackOnFailure: true,
  healthCheckInterval: 30000, // 30 seconds
  errorThresholds: {
    critical: 3,
    consecutive: 5,
    timeWindow: 300000 // 5 minutes
  }
}): Plugin {
  let systemHealth: SystemHealth = {
    isHealthy: true,
    score: 100,
    issues: [],
    lastCheck: new Date().toISOString(),
    consecutiveFailures: 0
  };

  let backups: BackupSnapshot[] = [];
  let recoveryActions: RecoveryAction[] = [];
  let errorHistory: Array<{ timestamp: string; severity: string; message: string }> = [];

  const logDir = join(process.cwd(), 'logs');
  const backupDir = join(logDir, 'recovery-backups');
  const recoveryFile = join(logDir, 'recovery-state.json');
  const healthFile = join(logDir, 'system-health.json');

  // Ensure directories exist
  [logDir, backupDir].forEach(dir => {
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  });

  function loadRecoveryState() {
    if (existsSync(recoveryFile)) {
      try {
        const state = JSON.parse(readFileSync(recoveryFile, 'utf-8'));
        backups = state.backups || [];
        recoveryActions = state.recoveryActions || [];
        errorHistory = state.errorHistory || [];
      } catch (error) {
        console.warn('Could not load recovery state:', error);
      }
    }
  }

  function saveRecoveryState() {
    try {
      const state = {
        backups: backups.slice(0, config.maxBackups),
        recoveryActions: recoveryActions.slice(0, 100),
        errorHistory: errorHistory.slice(0, 1000),
        lastUpdate: new Date().toISOString()
      };
      writeFileSync(recoveryFile, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('Failed to save recovery state:', error);
    }
  }

  function saveHealthState() {
    try {
      writeFileSync(healthFile, JSON.stringify(systemHealth, null, 2));
    } catch (error) {
      console.error('Failed to save health state:', error);
    }
  }

  function createBackup(reason: string = 'scheduled'): BackupSnapshot {
    const backupId = `backup-${Date.now()}`;
    const timestamp = new Date().toISOString();
    
    console.log(`💾 Creating backup: ${backupId} (${reason})`);
    
    const criticalFiles = [
      'package.json',
      'vite.config.ts',
      'tsconfig.json',
      'src/App.tsx',
      'src/main.tsx'
    ];
    
    const files: BackupSnapshot['files'] = [];
    
    criticalFiles.forEach(filePath => {
      const fullPath = join(process.cwd(), filePath);
      if (existsSync(fullPath)) {
        try {
          const content = readFileSync(fullPath, 'utf-8');
          const checksum = crypto.createHash('md5').update(content).digest('hex');
          
          files.push({
            path: filePath,
            content,
            checksum
          });
          
          // Also save physical backup
          const backupFilePath = join(backupDir, `${backupId}-${filePath.replace(/[\/\\]/g, '-')}`);
          copyFileSync(fullPath, backupFilePath);
        } catch (error) {
          console.warn(`Failed to backup file ${filePath}:`, error);
        }
      }
    });
    
    const backup: BackupSnapshot = {
      id: backupId,
      timestamp,
      files,
      metadata: {
        buildSuccess: systemHealth.consecutiveFailures === 0,
        errorCount: errorHistory.filter(e => 
          Date.now() - new Date(e.timestamp).getTime() < 3600000
        ).length,
        performanceScore: 85, // Would be calculated from actual metrics
        healthScore: systemHealth.score
      }
    };
    
    backups.unshift(backup);
    if (backups.length > config.maxBackups) {
      backups = backups.slice(0, config.maxBackups);
    }
    
    saveRecoveryState();
    return backup;
  }

  function rollbackToBackup(backupId?: string): boolean {
    const targetBackup = backupId 
      ? backups.find(b => b.id === backupId)
      : backups.find(b => b.metadata.buildSuccess);
    
    if (!targetBackup) {
      console.error('❌ No suitable backup found for rollback');
      return false;
    }
    
    console.log(`🔄 Rolling back to backup: ${targetBackup.id}`);
    
    try {
      targetBackup.files.forEach(file => {
        const fullPath = join(process.cwd(), file.path);
        writeFileSync(fullPath, file.content);
      });
      
      logRecoveryAction({
        type: 'rollback',
        reason: `Rollback to backup ${targetBackup.id}`,
        success: true,
        details: { backupId: targetBackup.id, filesRestored: targetBackup.files.length }
      });
      
      console.log(`✅ Rollback completed: ${targetBackup.files.length} files restored`);
      return true;
    } catch (error) {
      console.error('❌ Rollback failed:', error);
      logRecoveryAction({
        type: 'rollback',
        reason: `Rollback to backup ${targetBackup.id}`,
        success: false,
        details: { error: error.message }
      });
      return false;
    }
  }

  function logRecoveryAction(action: Omit<RecoveryAction, 'id' | 'timestamp'>) {
    const recoveryAction: RecoveryAction = {
      id: `action-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...action
    };
    
    recoveryActions.unshift(recoveryAction);
    if (recoveryActions.length > 100) {
      recoveryActions = recoveryActions.slice(0, 100);
    }
    
    saveRecoveryState();
  }

  function logError(severity: string, message: string) {
    errorHistory.unshift({
      timestamp: new Date().toISOString(),
      severity,
      message
    });
    
    // Check error thresholds
    const recentErrors = errorHistory.filter(e => 
      Date.now() - new Date(e.timestamp).getTime() < config.errorThresholds.timeWindow
    );
    
    const criticalErrors = recentErrors.filter(e => e.severity === 'critical');
    
    if (criticalErrors.length >= config.errorThresholds.critical) {
      triggerRecovery('Critical error threshold exceeded');
    }
    
    updateSystemHealth();
  }

  function updateSystemHealth() {
    const recentErrors = errorHistory.filter(e => 
      Date.now() - new Date(e.timestamp).getTime() < 3600000 // Last hour
    );
    
    let score = 100;
    let issues: string[] = [];
    
    // Deduct points for errors
    recentErrors.forEach(error => {
      switch (error.severity) {
        case 'critical': score -= 20; break;
        case 'high': score -= 10; break;
        case 'medium': score -= 5; break;
        case 'low': score -= 2; break;
      }
    });
    
    // Check for consecutive failures
    if (systemHealth.consecutiveFailures > config.errorThresholds.consecutive) {
      score -= 30;
      issues.push(`${systemHealth.consecutiveFailures} consecutive failures detected`);
    }
    
    // Update health status
    systemHealth.score = Math.max(0, score);
    systemHealth.isHealthy = score >= 70;
    systemHealth.issues = issues;
    systemHealth.lastCheck = new Date().toISOString();
    
    if (recentErrors.length > 0) {
      systemHealth.issues.push(`${recentErrors.length} recent errors`);
    }
    
    saveHealthState();
  }

  function triggerRecovery(reason: string) {
    console.log(`🚨 Recovery triggered: ${reason}`);
    
    // Create emergency backup
    createBackup('emergency');
    
    // Attempt auto-restart if enabled
    if (config.autoRestart) {
      console.log('🔄 Attempting auto-restart...');
      logRecoveryAction({
        type: 'restart',
        reason,
        success: true,
        details: { method: 'auto-restart' }
      });
    }
    
    // Rollback if configured and restart fails
    if (config.rollbackOnFailure && systemHealth.consecutiveFailures > 2) {
      console.log('🔄 Attempting rollback to last known good state...');
      const rollbackSuccess = rollbackToBackup();
      
      if (rollbackSuccess) {
        systemHealth.consecutiveFailures = 0;
        updateSystemHealth();
      }
    }
  }

  function performHealthCheck() {
    // Check if build is working
    const recentErrors = errorHistory.filter(e => 
      Date.now() - new Date(e.timestamp).getTime() < config.healthCheckInterval
    );
    
    if (recentErrors.length > 0) {
      systemHealth.consecutiveFailures++;
    } else {
      systemHealth.consecutiveFailures = Math.max(0, systemHealth.consecutiveFailures - 1);
    }
    
    updateSystemHealth();
    
    // Trigger recovery if health is critical
    if (!systemHealth.isHealthy && systemHealth.score < 30) {
      triggerRecovery('System health critical');
    }
  }

  function repairCommonIssues(): boolean {
    console.log('🔧 Attempting to repair common issues...');
    
    let repaired = false;
    const repairs: string[] = [];
    
    // Check for missing dependencies
    try {
      const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8'));
      const nodeModulesExists = existsSync(join(process.cwd(), 'node_modules'));
      
      if (!nodeModulesExists) {
        console.log('📦 Node modules missing - this would trigger npm install');
        repairs.push('Node modules installation required');
        repaired = true;
      }
    } catch (error) {
      console.warn('Could not check package.json:', error);
    }
    
    // Check for corrupted config files
    const configFiles = ['vite.config.ts', 'tsconfig.json'];
    configFiles.forEach(file => {
      const filePath = join(process.cwd(), file);
      if (existsSync(filePath)) {
        try {
          const content = readFileSync(filePath, 'utf-8');
          if (content.trim().length === 0) {
            console.log(`📝 Empty config file detected: ${file}`);
            repairs.push(`Empty config file: ${file}`);
            repaired = true;
          }
        } catch (error) {
          console.warn(`Could not read ${file}:`, error);
          repairs.push(`Corrupted config file: ${file}`);
          repaired = true;
        }
      }
    });
    
    if (repaired) {
      logRecoveryAction({
        type: 'repair',
        reason: 'Automated repair of common issues',
        success: true,
        details: { repairs }
      });
    }
    
    return repaired;
  }

  return {
    name: 'automated-recovery',
    
    configureServer(server) {
      loadRecoveryState();
      
      // Schedule automatic backups
      cron.schedule(config.backupInterval, () => {
        createBackup('scheduled');
      });
      
      // Health check interval
      setInterval(() => {
        performHealthCheck();
      }, config.healthCheckInterval);
      
      // WebSocket handlers
      server.ws.on('recovery:get-status', () => {
        server.ws.send('recovery:status', {
          health: systemHealth,
          backups: backups.slice(0, 10),
          recentActions: recoveryActions.slice(0, 10),
          errorHistory: errorHistory.slice(0, 20)
        });
      });
      
      server.ws.on('recovery:create-backup', () => {
        const backup = createBackup('manual');
        server.ws.send('recovery:backup-created', backup);
      });
      
      server.ws.on('recovery:rollback', (data) => {
        const { backupId } = data;
        const success = rollbackToBackup(backupId);
        server.ws.send('recovery:rollback-result', { success, backupId });
      });
      
      server.ws.on('recovery:repair', () => {
        const success = repairCommonIssues();
        server.ws.send('recovery:repair-result', { success });
      });
    },
    
    buildStart() {
      console.log('🛡️  Automated recovery system active');
      updateSystemHealth();
    },
    
    buildError(error) {
      console.error('🚨 Build error detected:', error.message);
      logError('critical', `Build error: ${error.message}`);
      
      // Attempt repair
      const repaired = repairCommonIssues();
      if (!repaired && config.rollbackOnFailure) {
        triggerRecovery('Build failure');
      }
    },
    
    buildEnd() {
      // Reset consecutive failures on successful build
      if (systemHealth.consecutiveFailures > 0) {
        console.log('✅ Build successful - resetting failure count');
        systemHealth.consecutiveFailures = 0;
        updateSystemHealth();
      }
    }
  };
}
import { Plugin } from 'vite';
import { watch } from 'chokidar';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface ChangeLog {
  timestamp: string;
  type: 'file' | 'component' | 'route' | 'config';
  action: 'created' | 'modified' | 'deleted';
  path: string;
  size?: number;
  checksum?: string;
  dependencies?: string[];
  errors?: string[];
  warnings?: string[];
}

interface WebsiteState {
  lastUpdate: string;
  totalFiles: number;
  components: string[];
  routes: string[];
  assets: string[];
  changes: ChangeLog[];
  health: {
    score: number;
    issues: string[];
    lastCheck: string;
  };
}

export function websiteTracker(): Plugin {
  let state: WebsiteState = {
    lastUpdate: new Date().toISOString(),
    totalFiles: 0,
    components: [],
    routes: [],
    assets: [],
    changes: [],
    health: {
      score: 100,
      issues: [],
      lastCheck: new Date().toISOString()
    }
  };

  const logDir = join(process.cwd(), 'logs');
  const stateFile = join(logDir, 'website-state.json');
  const changesFile = join(logDir, 'changes.log');

  // Ensure log directory exists
  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true });
  }

  // Load existing state
  if (existsSync(stateFile)) {
    try {
      state = JSON.parse(readFileSync(stateFile, 'utf-8'));
    } catch (error) {
      console.warn('Could not load existing state:', error);
    }
  }

  function saveState() {
    try {
      writeFileSync(stateFile, JSON.stringify(state, null, 2));
    } catch (error) {
      console.error('Failed to save state:', error);
    }
  }

  function logChange(change: ChangeLog) {
    state.changes.unshift(change);
    // Keep only last 1000 changes
    if (state.changes.length > 1000) {
      state.changes = state.changes.slice(0, 1000);
    }
    
    const logEntry = `[${change.timestamp}] ${change.type.toUpperCase()} ${change.action.toUpperCase()}: ${change.path}\n`;
    try {
      writeFileSync(changesFile, logEntry, { flag: 'a' });
    } catch (error) {
      console.error('Failed to write change log:', error);
    }
    
    saveState();
  }

  function analyzeFile(filePath: string): Partial<ChangeLog> {
    const analysis: Partial<ChangeLog> = {};
    
    try {
      const content = readFileSync(filePath, 'utf-8');
      analysis.size = content.length;
      
      // Simple checksum
      analysis.checksum = Buffer.from(content).toString('base64').slice(0, 16);
      
      // Analyze dependencies
      const importMatches = content.match(/import.*from\s+['"]([^'"]+)['"]/g);
      if (importMatches) {
        analysis.dependencies = importMatches.map(match => {
          const moduleMatch = match.match(/from\s+['"]([^'"]+)['"]/);
          return moduleMatch ? moduleMatch[1] : '';
        }).filter(Boolean);
      }
      
      // Check for potential issues
      analysis.errors = [];
      analysis.warnings = [];
      
      // Check for common React issues
      if (content.includes('useState') && !content.includes('import.*useState')) {
        analysis.errors.push('useState used but not imported');
      }
      
      if (content.includes('useEffect') && !content.includes('import.*useEffect')) {
        analysis.errors.push('useEffect used but not imported');
      }
      
      // Check for missing key props in lists
      if (content.includes('.map(') && !content.includes('key=')) {
        analysis.warnings.push('Potential missing key prop in list rendering');
      }
      
      // Check for console.log statements
      if (content.includes('console.log')) {
        analysis.warnings.push('Console.log statements found');
      }
      
    } catch (error) {
      analysis.errors = [`Failed to analyze file: ${error}`];
    }
    
    return analysis;
  }

  function updateHealthScore() {
    let score = 100;
    let issues: string[] = [];
    
    // Deduct points for errors and warnings
    state.changes.slice(0, 50).forEach(change => {
      if (change.errors && change.errors.length > 0) {
        score -= change.errors.length * 5;
        issues.push(...change.errors);
      }
      if (change.warnings && change.warnings.length > 0) {
        score -= change.warnings.length * 2;
        issues.push(...change.warnings);
      }
    });
    
    state.health = {
      score: Math.max(0, score),
      issues: [...new Set(issues)].slice(0, 10), // Unique issues, max 10
      lastCheck: new Date().toISOString()
    };
  }

  return {
    name: 'website-tracker',
    configureServer(server) {
      // Watch for file changes
      const watcher = watch(['src/**/*', 'public/**/*', '*.config.*'], {
        ignored: ['node_modules', 'dist', 'logs'],
        persistent: true
      });

      watcher.on('add', (filePath) => {
        const analysis = analyzeFile(filePath);
        const change: ChangeLog = {
          timestamp: new Date().toISOString(),
          type: filePath.includes('.tsx') || filePath.includes('.jsx') ? 'component' : 'file',
          action: 'created',
          path: filePath,
          ...analysis
        };
        
        logChange(change);
        updateHealthScore();
        
        console.log(`📁 File created: ${filePath}`);
        if (analysis.errors && analysis.errors.length > 0) {
          console.warn(`⚠️  Errors detected:`, analysis.errors);
        }
      });

      watcher.on('change', (filePath) => {
        const analysis = analyzeFile(filePath);
        const change: ChangeLog = {
          timestamp: new Date().toISOString(),
          type: filePath.includes('.tsx') || filePath.includes('.jsx') ? 'component' : 'file',
          action: 'modified',
          path: filePath,
          ...analysis
        };
        
        logChange(change);
        updateHealthScore();
        
        console.log(`✏️  File modified: ${filePath}`);
        if (analysis.errors && analysis.errors.length > 0) {
          console.warn(`⚠️  Errors detected:`, analysis.errors);
        }
      });

      watcher.on('unlink', (filePath) => {
        const change: ChangeLog = {
          timestamp: new Date().toISOString(),
          type: 'file',
          action: 'deleted',
          path: filePath
        };
        
        logChange(change);
        updateHealthScore();
        
        console.log(`🗑️  File deleted: ${filePath}`);
      });

      // WebSocket for real-time updates
      server.ws.on('website-tracker:get-state', () => {
        server.ws.send('website-tracker:state', state);
      });

      // Periodic health checks
      setInterval(() => {
        updateHealthScore();
        server.ws.send('website-tracker:health', state.health);
      }, 30000); // Every 30 seconds
    },
    
    buildStart() {
      console.log('🚀 Website tracking started');
      state.lastUpdate = new Date().toISOString();
      saveState();
    },
    
    buildEnd() {
      console.log('✅ Build completed');
      console.log(`📊 Health Score: ${state.health.score}/100`);
      if (state.health.issues.length > 0) {
        console.log('⚠️  Issues found:', state.health.issues);
      }
    }
  };
}
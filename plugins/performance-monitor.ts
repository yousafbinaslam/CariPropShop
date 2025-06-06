import { Plugin } from 'vite';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface PerformanceMetric {
  timestamp: string;
  buildTime: number;
  bundleSize: number;
  chunkCount: number;
  assetCount: number;
  memoryUsage: NodeJS.MemoryUsage;
  warnings: string[];
}

export function performanceMonitor(): Plugin {
  let buildStartTime: number;
  let metrics: PerformanceMetric[] = [];
  
  const logDir = join(process.cwd(), 'logs');
  const metricsFile = join(logDir, 'performance-metrics.json');

  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true });
  }

  function saveMetrics() {
    try {
      writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));
    } catch (error) {
      console.error('Failed to save performance metrics:', error);
    }
  }

  function analyzeBundle(bundle: any): { size: number; chunkCount: number; assetCount: number; warnings: string[] } {
    let totalSize = 0;
    let chunkCount = 0;
    let assetCount = 0;
    const warnings: string[] = [];

    if (bundle) {
      Object.values(bundle).forEach((chunk: any) => {
        if (chunk.type === 'chunk') {
          chunkCount++;
          totalSize += chunk.code?.length || 0;
          
          // Check for large chunks
          if (chunk.code && chunk.code.length > 500000) { // 500KB
            warnings.push(`Large chunk detected: ${chunk.fileName} (${Math.round(chunk.code.length / 1024)}KB)`);
          }
          
          // Check for unused imports
          if (chunk.imports && chunk.imports.length > 20) {
            warnings.push(`Many imports in chunk: ${chunk.fileName} (${chunk.imports.length} imports)`);
          }
        } else if (chunk.type === 'asset') {
          assetCount++;
          totalSize += chunk.source?.length || 0;
        }
      });
    }

    return { size: totalSize, chunkCount, assetCount, warnings };
  }

  return {
    name: 'performance-monitor',
    
    buildStart() {
      buildStartTime = Date.now();
      console.log('⏱️  Performance monitoring started');
    },
    
    generateBundle(options, bundle) {
      const buildTime = Date.now() - buildStartTime;
      const bundleAnalysis = analyzeBundle(bundle);
      const memoryUsage = process.memoryUsage();
      
      const metric: PerformanceMetric = {
        timestamp: new Date().toISOString(),
        buildTime,
        bundleSize: bundleAnalysis.size,
        chunkCount: bundleAnalysis.chunkCount,
        assetCount: bundleAnalysis.assetCount,
        memoryUsage,
        warnings: bundleAnalysis.warnings
      };
      
      metrics.unshift(metric);
      // Keep only last 100 metrics
      if (metrics.length > 100) {
        metrics = metrics.slice(0, 100);
      }
      
      saveMetrics();
      
      // Log performance summary
      console.log('\n📊 Performance Summary:');
      console.log(`   ⏱️  Build Time: ${buildTime}ms`);
      console.log(`   📦 Bundle Size: ${Math.round(bundleAnalysis.size / 1024)}KB`);
      console.log(`   🧩 Chunks: ${bundleAnalysis.chunkCount}`);
      console.log(`   🖼️  Assets: ${bundleAnalysis.assetCount}`);
      console.log(`   🧠 Memory: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`);
      
      if (bundleAnalysis.warnings.length > 0) {
        console.log('\n⚠️  Performance Warnings:');
        bundleAnalysis.warnings.forEach(warning => {
          console.log(`   • ${warning}`);
        });
      }
      
      // Performance recommendations
      if (buildTime > 10000) {
        console.log('💡 Consider optimizing build time with code splitting');
      }
      
      if (bundleAnalysis.size > 1000000) { // 1MB
        console.log('💡 Consider reducing bundle size with tree shaking');
      }
      
      if (bundleAnalysis.chunkCount > 20) {
        console.log('💡 Consider consolidating chunks to reduce HTTP requests');
      }
    },
    
    configureServer(server) {
      server.ws.on('performance-monitor:get-metrics', () => {
        server.ws.send('performance-monitor:metrics', metrics.slice(0, 10));
      });
      
      // Real-time memory monitoring
      setInterval(() => {
        const memoryUsage = process.memoryUsage();
        server.ws.send('performance-monitor:memory', {
          timestamp: new Date().toISOString(),
          memory: memoryUsage
        });
      }, 5000); // Every 5 seconds
    }
  };
}
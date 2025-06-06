import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { comprehensiveTracker } from './plugins/comprehensive-tracker';
import { advancedErrorPrevention } from './plugins/advanced-error-prevention';
import { performanceOptimizer } from './plugins/performance-optimizer';
import { automatedRecovery } from './plugins/automated-recovery';
import { realTimeMonitor } from './plugins/real-time-monitor';
import checker from 'vite-plugin-checker';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    checker({
      typescript: true
    }),
    comprehensiveTracker({
      errorThreshold: {
        critical: 0,
        high: 2,
        medium: 5,
        low: 10
      },
      performanceBenchmarks: {
        buildTime: 15000, // 15 seconds
        bundleSize: 2000000, // 2MB
        chunkSize: 500000, // 500KB
        memoryUsage: 100000000 // 100MB
      },
      loggingLevel: 'detailed',
      notifications: {
        desktop: true,
        console: true,
        webhook: false
      },
      recovery: {
        autoRestart: true,
        backupOnError: true,
        rollbackOnFailure: false
      }
    }),
    advancedErrorPrevention(),
    performanceOptimizer(),
    automatedRecovery(),
    realTimeMonitor()
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    port: 3000,
    host: true,
    hmr: {
      overlay: true,
      port: 3001
    }
  },
  build: {
    sourcemap: true,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          icons: ['lucide-react'],
          admin: [
            './src/components/admin/AdminDashboard',
            './src/components/admin/PropertyUpload',
            './src/components/admin/ClientManagement'
          ]
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  define: {
    __MONITORING_ENABLED__: true,
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
});
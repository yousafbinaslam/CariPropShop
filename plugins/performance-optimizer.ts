import { Plugin } from 'vite';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { gzipSync } from 'zlib';

interface OptimizationConfig {
  bundleAnalysis: boolean;
  codesplitting: boolean;
  lazyLoading: boolean;
  assetOptimization: boolean;
  compressionAnalysis: boolean;
}

interface BundleAnalysis {
  chunks: Array<{
    name: string;
    size: number;
    gzipSize: number;
    modules: string[];
    dependencies: string[];
    isEntry: boolean;
    isDynamic: boolean;
  }>;
  assets: Array<{
    name: string;
    size: number;
    type: string;
  }>;
  totalSize: number;
  totalGzipSize: number;
  recommendations: string[];
}

interface PerformanceMetrics {
  buildTime: number;
  bundleSize: number;
  chunkCount: number;
  assetCount: number;
  compressionRatio: number;
  treeshakingEfficiency: number;
  codeUtilization: number;
}

export function performanceOptimizer(config: OptimizationConfig = {
  bundleAnalysis: true,
  codesplitting: true,
  lazyLoading: true,
  assetOptimization: true,
  compressionAnalysis: true
}): Plugin {
  let buildStartTime: number;
  let bundleAnalysis: BundleAnalysis;
  let performanceMetrics: PerformanceMetrics;

  const logDir = join(process.cwd(), 'logs');
  const analysisFile = join(logDir, 'bundle-analysis.json');
  const metricsFile = join(logDir, 'performance-metrics.json');

  function analyzeBundleComposition(bundle: any): BundleAnalysis {
    const chunks: BundleAnalysis['chunks'] = [];
    const assets: BundleAnalysis['assets'] = [];
    let totalSize = 0;
    let totalGzipSize = 0;

    Object.entries(bundle).forEach(([fileName, chunk]: [string, any]) => {
      if (chunk.type === 'chunk') {
        const chunkSize = chunk.code?.length || 0;
        const gzipSize = chunk.code ? gzipSync(chunk.code).length : 0;
        
        totalSize += chunkSize;
        totalGzipSize += gzipSize;

        chunks.push({
          name: fileName,
          size: chunkSize,
          gzipSize,
          modules: chunk.modules ? Object.keys(chunk.modules) : [],
          dependencies: chunk.imports || [],
          isEntry: chunk.isEntry || false,
          isDynamic: chunk.isDynamicEntry || false
        });
      } else if (chunk.type === 'asset') {
        const assetSize = chunk.source?.length || 0;
        totalSize += assetSize;

        assets.push({
          name: fileName,
          size: assetSize,
          type: fileName.split('.').pop() || 'unknown'
        });
      }
    });

    const recommendations = generateOptimizationRecommendations(chunks, assets);

    return {
      chunks,
      assets,
      totalSize,
      totalGzipSize,
      recommendations
    };
  }

  function generateOptimizationRecommendations(
    chunks: BundleAnalysis['chunks'],
    assets: BundleAnalysis['assets']
  ): string[] {
    const recommendations: string[] = [];

    // Large chunk analysis
    const largeChunks = chunks.filter(chunk => chunk.size > 500000); // 500KB
    if (largeChunks.length > 0) {
      recommendations.push(
        `Consider splitting large chunks: ${largeChunks.map(c => c.name).join(', ')}`
      );
    }

    // Vendor chunk analysis
    const vendorChunks = chunks.filter(chunk => 
      chunk.modules.some(module => module.includes('node_modules'))
    );
    if (vendorChunks.length === 0) {
      recommendations.push('Consider creating a vendor chunk for third-party libraries');
    }

    // Duplicate dependency analysis
    const allModules = chunks.flatMap(chunk => chunk.modules);
    const duplicateModules = allModules.filter((module, index) => 
      allModules.indexOf(module) !== index
    );
    if (duplicateModules.length > 0) {
      recommendations.push(
        `Potential duplicate modules detected: ${[...new Set(duplicateModules)].slice(0, 3).join(', ')}`
      );
    }

    // Asset optimization
    const largeAssets = assets.filter(asset => asset.size > 1000000); // 1MB
    if (largeAssets.length > 0) {
      recommendations.push(
        `Consider optimizing large assets: ${largeAssets.map(a => a.name).join(', ')}`
      );
    }

    // Compression efficiency
    const totalOriginalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
    const totalGzipSize = chunks.reduce((sum, chunk) => sum + chunk.gzipSize, 0);
    const compressionRatio = totalGzipSize / totalOriginalSize;
    
    if (compressionRatio > 0.7) {
      recommendations.push('Poor compression ratio - consider minification improvements');
    }

    // Dynamic import opportunities
    const staticChunks = chunks.filter(chunk => !chunk.isDynamic && !chunk.isEntry);
    if (staticChunks.length > 5) {
      recommendations.push('Consider using dynamic imports for route-based code splitting');
    }

    return recommendations;
  }

  function generateCodeSplittingConfig(chunks: BundleAnalysis['chunks']): any {
    const config: any = {
      manualChunks: {}
    };

    // Identify vendor libraries
    const vendorModules = new Set<string>();
    chunks.forEach(chunk => {
      chunk.modules.forEach(module => {
        if (module.includes('node_modules')) {
          const packageName = module.split('node_modules/')[1]?.split('/')[0];
          if (packageName) {
            vendorModules.add(packageName);
          }
        }
      });
    });

    // Group common vendor libraries
    const commonVendors = ['react', 'react-dom', 'react-router-dom'];
    const uiLibraries = ['lucide-react', '@headlessui', '@radix-ui'];
    const utilityLibraries = ['lodash', 'date-fns', 'axios'];

    commonVendors.forEach(vendor => {
      if (vendorModules.has(vendor)) {
        config.manualChunks[vendor] = [vendor];
      }
    });

    if (uiLibraries.some(lib => vendorModules.has(lib))) {
      config.manualChunks['ui-libs'] = uiLibraries.filter(lib => vendorModules.has(lib));
    }

    if (utilityLibraries.some(lib => vendorModules.has(lib))) {
      config.manualChunks['utils'] = utilityLibraries.filter(lib => vendorModules.has(lib));
    }

    return config;
  }

  function calculatePerformanceMetrics(
    buildTime: number,
    analysis: BundleAnalysis
  ): PerformanceMetrics {
    const compressionRatio = analysis.totalGzipSize / analysis.totalSize;
    
    // Estimate tree-shaking efficiency (simplified)
    const totalModules = analysis.chunks.reduce((sum, chunk) => sum + chunk.modules.length, 0);
    const treeshakingEfficiency = Math.max(0, 1 - (totalModules / 1000)); // Rough estimate
    
    // Code utilization estimate
    const dynamicChunks = analysis.chunks.filter(chunk => chunk.isDynamic).length;
    const codeUtilization = Math.min(1, dynamicChunks / Math.max(1, analysis.chunks.length));

    return {
      buildTime,
      bundleSize: analysis.totalSize,
      chunkCount: analysis.chunks.length,
      assetCount: analysis.assets.length,
      compressionRatio,
      treeshakingEfficiency,
      codeUtilization
    };
  }

  function generateLazyLoadingRecommendations(chunks: BundleAnalysis['chunks']): string[] {
    const recommendations: string[] = [];
    
    // Identify potential lazy loading opportunities
    const largeStaticChunks = chunks.filter(chunk => 
      !chunk.isDynamic && !chunk.isEntry && chunk.size > 100000
    );

    if (largeStaticChunks.length > 0) {
      recommendations.push('Consider lazy loading for these components:');
      largeStaticChunks.forEach(chunk => {
        recommendations.push(`  • ${chunk.name} (${Math.round(chunk.size / 1024)}KB)`);
      });
    }

    return recommendations;
  }

  function optimizeAssets(assets: BundleAnalysis['assets']): string[] {
    const optimizations: string[] = [];
    
    // Image optimization recommendations
    const images = assets.filter(asset => 
      ['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(asset.type)
    );
    
    const largeImages = images.filter(img => img.size > 500000); // 500KB
    if (largeImages.length > 0) {
      optimizations.push('Consider optimizing large images:');
      largeImages.forEach(img => {
        optimizations.push(`  • ${img.name} (${Math.round(img.size / 1024)}KB)`);
      });
    }

    // Font optimization
    const fonts = assets.filter(asset => 
      ['woff', 'woff2', 'ttf', 'otf'].includes(asset.type)
    );
    
    if (fonts.length > 3) {
      optimizations.push('Consider reducing the number of font files or using font subsetting');
    }

    return optimizations;
  }

  return {
    name: 'performance-optimizer',
    
    buildStart() {
      buildStartTime = Date.now();
      console.log('⚡ Performance optimization started');
    },
    
    generateBundle(options, bundle) {
      const buildTime = Date.now() - buildStartTime;
      
      if (config.bundleAnalysis) {
        bundleAnalysis = analyzeBundleComposition(bundle);
        performanceMetrics = calculatePerformanceMetrics(buildTime, bundleAnalysis);
        
        // Save analysis results
        try {
          writeFileSync(analysisFile, JSON.stringify(bundleAnalysis, null, 2));
          writeFileSync(metricsFile, JSON.stringify(performanceMetrics, null, 2));
        } catch (error) {
          console.error('Failed to save performance analysis:', error);
        }
      }
    },
    
    writeBundle() {
      if (!bundleAnalysis || !performanceMetrics) return;
      
      console.log('\n📊 Performance Analysis Results:');
      console.log(`   ⏱️  Build Time: ${performanceMetrics.buildTime}ms`);
      console.log(`   📦 Total Bundle Size: ${Math.round(performanceMetrics.bundleSize / 1024)}KB`);
      console.log(`   🗜️  Gzipped Size: ${Math.round(bundleAnalysis.totalGzipSize / 1024)}KB`);
      console.log(`   📊 Compression Ratio: ${Math.round(performanceMetrics.compressionRatio * 100)}%`);
      console.log(`   🧩 Chunks: ${performanceMetrics.chunkCount}`);
      console.log(`   🖼️  Assets: ${performanceMetrics.assetCount}`);
      
      // Performance scoring
      let score = 100;
      if (performanceMetrics.buildTime > 15000) score -= 20;
      if (performanceMetrics.bundleSize > 2000000) score -= 25;
      if (performanceMetrics.compressionRatio > 0.7) score -= 15;
      if (performanceMetrics.chunkCount > 20) score -= 10;
      
      console.log(`   🎯 Performance Score: ${Math.max(0, score)}/100`);
      
      // Recommendations
      if (bundleAnalysis.recommendations.length > 0) {
        console.log('\n💡 Optimization Recommendations:');
        bundleAnalysis.recommendations.forEach(rec => {
          console.log(`   • ${rec}`);
        });
      }
      
      // Code splitting suggestions
      if (config.codesplitting) {
        const splittingConfig = generateCodeSplittingConfig(bundleAnalysis.chunks);
        if (Object.keys(splittingConfig.manualChunks).length > 0) {
          console.log('\n🔀 Suggested Code Splitting Configuration:');
          console.log(JSON.stringify(splittingConfig, null, 2));
        }
      }
      
      // Lazy loading recommendations
      if (config.lazyLoading) {
        const lazyRecommendations = generateLazyLoadingRecommendations(bundleAnalysis.chunks);
        if (lazyRecommendations.length > 0) {
          console.log('\n🔄 Lazy Loading Opportunities:');
          lazyRecommendations.forEach(rec => console.log(`   ${rec}`));
        }
      }
      
      // Asset optimization
      if (config.assetOptimization) {
        const assetOptimizations = optimizeAssets(bundleAnalysis.assets);
        if (assetOptimizations.length > 0) {
          console.log('\n🖼️  Asset Optimization Suggestions:');
          assetOptimizations.forEach(opt => console.log(`   ${opt}`));
        }
      }
      
      // Performance warnings
      if (score < 70) {
        console.log('\n⚠️  Performance Warning: Consider implementing the above recommendations');
      }
      
      if (performanceMetrics.bundleSize > 5000000) { // 5MB
        console.log('\n🚨 Critical: Bundle size is very large - immediate optimization required');
      }
    },
    
    configureServer(server) {
      server.ws.on('performance:get-analysis', () => {
        if (existsSync(analysisFile) && existsSync(metricsFile)) {
          try {
            const analysis = JSON.parse(readFileSync(analysisFile, 'utf-8'));
            const metrics = JSON.parse(readFileSync(metricsFile, 'utf-8'));
            
            server.ws.send('performance:analysis', {
              analysis,
              metrics,
              timestamp: new Date().toISOString()
            });
          } catch (error) {
            console.error('Failed to load performance data:', error);
          }
        }
      });
      
      server.ws.on('performance:optimize', (data) => {
        const { type } = data;
        
        switch (type) {
          case 'code-splitting':
            if (bundleAnalysis) {
              const config = generateCodeSplittingConfig(bundleAnalysis.chunks);
              server.ws.send('performance:optimization-config', {
                type: 'code-splitting',
                config
              });
            }
            break;
            
          case 'lazy-loading':
            if (bundleAnalysis) {
              const recommendations = generateLazyLoadingRecommendations(bundleAnalysis.chunks);
              server.ws.send('performance:optimization-config', {
                type: 'lazy-loading',
                recommendations
              });
            }
            break;
        }
      });
    }
  };
}
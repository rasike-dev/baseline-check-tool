/**
 * Bundle Analysis Module
 * Comprehensive bundle analysis and optimization recommendations
 */

import { BundleAnalyzer } from './bundle-analyzer.js';
import { BundleRecommendations } from './bundle-recommendations.js';
import { BundleDashboard } from './bundle-dashboard.js';

/**
 * Main Bundle Analysis class
 */
export class BundleAnalysis {
  constructor(options = {}) {
    this.options = {
      analyzer: {
        enableSizeAnalysis: true,
        enableDependencyAnalysis: true,
        enableCodeSplitting: true,
        enableTreeShaking: true,
        enableCompression: true,
        enableCaching: true,
        enablePerformance: true,
        enableSecurity: true,
        enableModernization: true,
        enableOptimization: true,
        maxBundleSize: 250 * 1024, // 250KB
        maxChunkSize: 100 * 1024,  // 100KB
        maxDependencies: 50,
        ...options.analyzer
      },
      recommendations: {
        includeCodeExamples: true,
        includeImpactLevels: true,
        includeEffortEstimates: true,
        ...options.recommendations
      },
      dashboard: {
        theme: 'dark',
        includeCharts: true,
        includeCodeExamples: true,
        includeImpactLevels: true,
        ...options.dashboard
      }
    };

    this.analyzer = new BundleAnalyzer(this.options.analyzer);
    this.recommendations = new BundleRecommendations(this.options.recommendations);
    this.dashboard = new BundleDashboard(this.options.dashboard);
  }

  /**
   * Analyze bundle for optimization issues
   */
  async analyzeBundle(bundlePath, projectRoot = '') {
    return await this.analyzer.analyzeBundle(bundlePath, projectRoot);
  }

  /**
   * Generate recommendations from analysis
   */
  generateRecommendations(analysis) {
    return this.recommendations.generateRecommendations(analysis);
  }

  /**
   * Generate dashboard HTML
   */
  generateDashboard(analysis, recommendations) {
    return this.dashboard.generateDashboard(analysis, recommendations);
  }

  /**
   * Get bundle statistics
   */
  getStats() {
    return {
      totalFeatures: 10,
      categories: [
        'Size Analysis',
        'Dependency Analysis',
        'Code Splitting',
        'Tree Shaking',
        'Compression',
        'Caching',
        'Performance',
        'Security',
        'Modernization',
        'Optimization'
      ],
      bundleLevels: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'],
      severityLevels: ['high', 'medium', 'low']
    };
  }
}

// Export individual classes for advanced usage
export { BundleAnalyzer, BundleRecommendations, BundleDashboard };

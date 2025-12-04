/**
 * Baseline-Specific Features Module
 * Main entry point for baseline-specific analysis features
 */

import { BrowserDetector } from './browser-detector.js';
import { PolyfillRecommender } from './polyfill-recommender.js';
import { ProgressiveEnhancementAnalyzer } from './progressive-enhancement.js';
import { BaselineComplianceScorer } from './baseline-compliance.js';
import { MigrationAssistant } from './migration-assistant.js';
import { MigrationDashboard } from './migration-dashboard.js';

export class BaselineAnalysis {
  constructor(options = {}) {
    this.options = {
      targetBrowsers: ['chrome', 'firefox', 'safari', 'edge'],
      baselineThreshold: 0.95,
      includeMobile: true,
      includeBeta: false,
      ...options
    };

    this.browserDetector = new BrowserDetector(this.options);
    this.polyfillRecommender = new PolyfillRecommender();
    this.progressiveEnhancementAnalyzer = new ProgressiveEnhancementAnalyzer();
    this.baselineComplianceScorer = new BaselineComplianceScorer(this.options);
    this.migrationAssistant = new MigrationAssistant(this.options);
    this.migrationDashboard = new MigrationDashboard(this.options);
  }

  /**
   * Run comprehensive baseline analysis
   */
  async analyze(files, bcdData) {
    const results = {
      browserSupport: null,
      polyfillRecommendations: null,
      progressiveEnhancement: null,
      compliance: null,
      summary: {
        totalFiles: files.length,
        analysisTime: 0,
        overallScore: 0,
        recommendations: []
      }
    };

    const startTime = Date.now();

    try {
      // 1. Browser-specific feature detection
      console.log('🔍 Analyzing browser-specific feature support...');
      const features = await this.extractFeatures(files);
      results.browserSupport = await this.browserDetector.analyzeBrowserSupport(features, bcdData);

      // 2. Polyfill recommendations
      console.log('🔧 Generating polyfill recommendations...');
      results.polyfillRecommendations = this.polyfillRecommender.generateRecommendations(
        results.browserSupport.features
      );

      // 3. Progressive enhancement analysis
      console.log('📈 Analyzing progressive enhancement patterns...');
      results.progressiveEnhancement = await this.progressiveEnhancementAnalyzer.analyzeProgressiveEnhancement(files);

      // 4. Baseline compliance scoring
      console.log('📊 Calculating baseline compliance score...');
      results.compliance = this.baselineComplianceScorer.generateComplianceReport({
        browserSupport: results.browserSupport,
        progressiveEnhancement: results.progressiveEnhancement
      });

      // Calculate summary
      results.summary.analysisTime = Date.now() - startTime;
      results.summary.overallScore = results.compliance.scores.overall;
      results.summary.recommendations = this.generateSummaryRecommendations(results);

      return results;

    } catch (error) {
      console.error('Baseline analysis failed:', error);
      throw error;
    }
  }

  /**
   * Extract features from files
   */
  async extractFeatures(files) {
    const features = [];
    const featureMap = new Map();

    for (const file of files) {
      const fileFeatures = await this.extractFileFeatures(file);
      
      for (const feature of fileFeatures) {
        const key = feature.name;
        if (featureMap.has(key)) {
          const existing = featureMap.get(key);
          existing.files.push(file);
          existing.usage += feature.usage || 1;
        } else {
          featureMap.set(key, {
            ...feature,
            files: [file],
            usage: feature.usage || 1
          });
        }
      }
    }

    return Array.from(featureMap.values());
  }

  /**
   * Extract features from a single file
   */
  async extractFileFeatures(filePath) {
    const features = [];
    const extension = filePath.split('.').pop().toLowerCase();

    try {
      const fs = await import('fs/promises');
      const content = await fs.readFile(filePath, 'utf8');

      if (extension === 'html') {
        features.push(...this.extractHTMLFeatures(content));
      } else if (extension === 'css') {
        features.push(...this.extractCSSFeatures(content));
      } else if (['js', 'ts', 'jsx', 'tsx'].includes(extension)) {
        features.push(...this.extractJavaScriptFeatures(content));
      }
    } catch (error) {
      console.warn(`Failed to read file ${filePath}:`, error.message);
    }

    return features;
  }

  /**
   * Extract HTML features
   */
  extractHTMLFeatures(content) {
    const features = [];

    // HTML5 features
    const html5Features = [
      'video', 'audio', 'canvas', 'svg', 'webgl', 'webgl2',
      'localStorage', 'sessionStorage', 'indexedDB', 'webSQL',
      'geolocation', 'camera', 'microphone', 'notifications',
      'push', 'serviceWorker', 'webManifest', 'webComponents'
    ];

    for (const feature of html5Features) {
      if (content.includes(feature) || content.includes(feature.toUpperCase())) {
        features.push({
          name: feature,
          category: 'html5',
          type: 'api'
        });
      }
    }

    // CSS features
    const cssFeatures = [
      'grid', 'flexbox', 'custom-properties', 'variables',
      'animations', 'transitions', 'transforms', 'filters',
      'backdrop-filter', 'clip-path', 'mask', 'shapes'
    ];

    for (const feature of cssFeatures) {
      if (content.includes(feature) || content.includes(`--${feature}`)) {
        features.push({
          name: feature,
          category: 'css',
          type: 'property'
        });
      }
    }

    return features;
  }

  /**
   * Extract CSS features
   */
  extractCSSFeatures(content) {
    const features = [];

    // CSS Grid
    if (content.includes('display: grid') || content.includes('display:grid')) {
      features.push({
        name: 'css-grid',
        category: 'css',
        type: 'layout'
      });
    }

    // Flexbox
    if (content.includes('display: flex') || content.includes('display:flex')) {
      features.push({
        name: 'flexbox',
        category: 'css',
        type: 'layout'
      });
    }

    // Custom Properties
    if (content.includes('--') && content.includes('var(')) {
      features.push({
        name: 'custom-properties',
        category: 'css',
        type: 'variable'
      });
    }

    // Animations
    if (content.includes('@keyframes') || content.includes('animation:')) {
      features.push({
        name: 'animations',
        category: 'css',
        type: 'animation'
      });
    }

    // Transforms
    if (content.includes('transform:') || content.includes('transform:')) {
      features.push({
        name: 'transforms',
        category: 'css',
        type: 'effect'
      });
    }

    return features;
  }

  /**
   * Extract JavaScript features
   */
  extractJavaScriptFeatures(content) {
    const features = [];

    // ES6+ features
    const es6Features = [
      'const', 'let', 'arrow', 'class', 'extends', 'import', 'export',
      'promise', 'async', 'await', 'destructuring', 'spread', 'rest',
      'template', 'symbol', 'map', 'set', 'weakmap', 'weakset'
    ];

    for (const feature of es6Features) {
      if (content.includes(feature)) {
        features.push({
          name: feature,
          category: 'javascript',
          type: 'syntax'
        });
      }
    }

    // Web APIs
    const webAPIs = [
      'fetch', 'request', 'response', 'headers', 'formData',
      'intersectionObserver', 'resizeObserver', 'mutationObserver',
      'performance', 'navigator', 'history', 'location',
      'localStorage', 'sessionStorage', 'indexedDB', 'webSQL'
    ];

    for (const api of webAPIs) {
      if (content.includes(api) || content.includes(`window.${api}`)) {
        features.push({
          name: api,
          category: 'webapi',
          type: 'api'
        });
      }
    }

    // DOM APIs
    const domAPIs = [
      'querySelector', 'querySelectorAll', 'addEventListener',
      'removeEventListener', 'preventDefault', 'stopPropagation',
      'closest', 'matches', 'contains', 'append', 'prepend'
    ];

    for (const api of domAPIs) {
      if (content.includes(api)) {
        features.push({
          name: api,
          category: 'dom',
          type: 'api'
        });
      }
    }

    return features;
  }

  /**
   * Generate summary recommendations
   */
  generateSummaryRecommendations(results) {
    const recommendations = [];

    // Browser support recommendations
    if (results.browserSupport) {
      const { summary } = results.browserSupport;
      if (summary.riskyFeatures > 0) {
        recommendations.push({
          type: 'browser_support',
          priority: 'high',
          title: 'Browser Support Issues',
          message: `${summary.riskyFeatures} risky features detected`,
          suggestion: 'Add polyfills or fallbacks for better browser support'
        });
      }
    }

    // Polyfill recommendations
    if (results.polyfillRecommendations) {
      const { summary } = results.polyfillRecommendations;
      if (summary.totalPolyfills > 0) {
        recommendations.push({
          type: 'polyfills',
          priority: 'medium',
          title: 'Polyfill Recommendations',
          message: `${summary.totalPolyfills} polyfills recommended`,
          suggestion: 'Consider adding recommended polyfills for better compatibility'
        });
      }
    }

    // Progressive enhancement recommendations
    if (results.progressiveEnhancement) {
      const { summary } = results.progressiveEnhancement;
      if (summary.fallbackIssues > 0) {
        recommendations.push({
          type: 'progressive_enhancement',
          priority: 'high',
          title: 'Progressive Enhancement Issues',
          message: `${summary.fallbackIssues} fallback issues detected`,
          suggestion: 'Implement progressive enhancement patterns'
        });
      }
    }

    // Compliance recommendations
    if (results.compliance) {
      const { scores } = results.compliance;
      if (scores.overall < 80) {
        recommendations.push({
          type: 'compliance',
          priority: 'critical',
          title: 'Baseline Compliance Issues',
          message: `Compliance score: ${scores.overall}/100`,
          suggestion: 'Address compliance issues for better baseline support'
        });
      }
    }

    return recommendations;
  }

  /**
   * Generate migration plan for risky features
   */
  async generateMigrationPlan(analysisResults) {
    const riskyFeatures = [];
    
    // Extract risky features from browser support analysis
    if (analysisResults.browserSupport && analysisResults.browserSupport.features) {
      const risky = analysisResults.browserSupport.features.filter(f => f.risky);
      riskyFeatures.push(...risky);
    }

    // Generate migration plan
    const migrationPlan = this.migrationAssistant.generateMigrationPlan(riskyFeatures, analysisResults);
    
    return migrationPlan;
  }

  /**
   * Generate migration dashboard
   */
  generateMigrationDashboard(migrationPlan, theme = 'dark') {
    return this.migrationDashboard.generateDashboard(migrationPlan, theme);
  }

  /**
   * Generate baseline dashboard
   */
  generateDashboard(results, theme = 'dark') {
    // Process scan report format if needed
    let processedData = results;
    
    // Check if this is a scan report (has results array) vs processed analysis
    if (results.results && Array.isArray(results.results)) {
      // This is a scan report - process it
      const scanResults = results.results || [];
      const metadata = results.metadata || {};
      
      // Calculate stats from scan results
      const baselineLike = scanResults.filter(r => r.status === 'baseline_like').length;
      const risky = scanResults.filter(r => r.status === 'risky').length;
      const unknown = scanResults.filter(r => r.status === 'unknown').length;
      const total = scanResults.length;
      
      // Calculate compliance score
      const complianceScore = total > 0 ? Math.round((baselineLike / total) * 100) : 0;
      
      // Generate polyfill recommendations from risky features
      const riskyFeatures = scanResults.filter(r => r.status === 'risky');
      const polyfillCount = riskyFeatures.length;
      const estimatedSize = polyfillCount * 15; // Rough estimate: 15KB per polyfill
      
      // Process into expected format
      processedData = {
        browserSupport: {
          summary: {
            baselineFeatures: baselineLike,
            riskyFeatures: risky,
            unsupportedFeatures: unknown,
            totalFeatures: total
          },
          features: scanResults
        },
        polyfillRecommendations: {
          summary: {
            totalPolyfills: polyfillCount,
            estimatedSize: estimatedSize,
            maintenanceLevel: polyfillCount > 0 ? 'Medium' : 'Low'
          },
          recommendations: riskyFeatures.map(f => ({
            feature: f.feature,
            polyfill: this.polyfillRecommender.findPolyfill(f.feature),
            priority: 'high'
          }))
        },
        progressiveEnhancement: {
          summary: {
            progressiveFiles: metadata.processedFiles || 0,
            fallbackIssues: risky,
            overallScore: complianceScore
          }
        },
        compliance: {
          scores: {
            overall: complianceScore,
            browserSupport: complianceScore,
            featureStability: complianceScore,
            performance: complianceScore,
            accessibility: complianceScore
          }
        },
        summary: {
          totalFiles: metadata.scannedFiles || 0,
          recommendations: this.generateRecommendationsFromScan(scanResults)
        }
      };
    }
    
    const data = processedData;
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Baseline Analysis Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'};
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
            line-height: 1.6;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 40px 0;
            background: ${theme === 'dark' ? '#2d2d2d' : '#f8f9fa'};
            border-radius: 12px;
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .header p {
            font-size: 1.2rem;
            color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .score-card {
            background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'};
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: 1px solid ${theme === 'dark' ? '#404040' : '#e1e5e9'};
        }

        .score-display {
            text-align: center;
            margin-bottom: 20px;
        }

        .score-number {
            font-size: 4rem;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .score-label {
            font-size: 1.2rem;
            color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .score-excellent { color: #10b981; }
        .score-good { color: #3b82f6; }
        .score-fair { color: #f59e0b; }
        .score-poor { color: #ef4444; }

        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .card {
            background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'};
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border: 1px solid ${theme === 'dark' ? '#404040' : '#e1e5e9'};
        }

        .card h3 {
            margin-bottom: 15px;
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
        }

        .stat {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px 0;
            border-bottom: 1px solid ${theme === 'dark' ? '#404040' : '#e1e5e9'};
        }

        .stat:last-child {
            border-bottom: none;
        }

        .stat-label {
            color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .stat-value {
            font-weight: bold;
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
        }

        .recommendations {
            margin-top: 30px;
        }

        .recommendation {
            background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'};
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            border-left: 4px solid #3b82f6;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .recommendation h4 {
            margin-bottom: 10px;
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
        }

        .recommendation p {
            color: ${theme === 'dark' ? '#cccccc' : '#666666'};
            margin-bottom: 10px;
        }

        .recommendation .priority {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: bold;
            text-transform: uppercase;
        }

        .priority-critical { background: #fee2e2; color: #dc2626; }
        .priority-high { background: #fef3c7; color: #d97706; }
        .priority-medium { background: #dbeafe; color: #2563eb; }
        .priority-low { background: #d1fae5; color: #059669; }

        .chart-container {
            background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'};
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 30px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .chart {
            width: 100%;
            height: 300px;
            background: ${theme === 'dark' ? '#1a1a1a' : '#f8f9fa'};
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${theme === 'dark' ? '#cccccc' : '#666666'};
            font-size: 1.1rem;
        }

        .dashboard-nav {
            position: sticky;
            top: 0;
            z-index: 1000;
            background: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'};
            border-bottom: 2px solid ${theme === 'dark' ? '#404040' : '#e1e5e9'};
            padding: 15px 0;
            margin-bottom: 20px;
        }

        .nav-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }

        .nav-logo {
            font-size: 1.5rem;
            font-weight: bold;
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
            text-decoration: none;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .nav-links {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        .nav-link {
            padding: 8px 16px;
            border-radius: 6px;
            text-decoration: none;
            color: ${theme === 'dark' ? '#cccccc' : '#666666'};
            background: ${theme === 'dark' ? '#2d2d2d' : '#f8f9fa'};
            transition: all 0.3s ease;
            font-size: 0.9rem;
        }

        .nav-link:hover {
            background: ${theme === 'dark' ? '#404040' : '#e1e5e9'};
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
        }

        .nav-link.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #ffffff;
        }

        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .grid {
                grid-template-columns: 1fr;
            }

            .nav-container {
                flex-direction: column;
                align-items: flex-start;
            }

            .nav-links {
                width: 100%;
                justify-content: flex-start;
            }
        }
    </style>
</head>
<body>
    <nav class="dashboard-nav">
        <div class="nav-container">
            <a href="../index.html" class="nav-logo">📊 Baseline Check</a>
            <div class="nav-links">
                <a href="../index.html" class="nav-link">🏠 Hub</a>
                <a href="../baseline/baseline-dashboard.html" class="nav-link active">🌐 Baseline</a>
                <a href="../performance/performance-dashboard.html" class="nav-link">⚡ Performance</a>
                <a href="../security/security-dashboard.html" class="nav-link">🔒 Security</a>
                <a href="../accessibility/accessibility-dashboard.html" class="nav-link">♿ Accessibility</a>
                <a href="../seo/seo-dashboard.html" class="nav-link">🔍 SEO</a>
                <a href="../bundle/bundle-dashboard.html" class="nav-link">📦 Bundle</a>
            </div>
        </div>
    </nav>
    <div class="container">
        <div class="header">
            <h1>🎯 Baseline Analysis Dashboard</h1>
            <p>Comprehensive baseline compliance and browser support analysis</p>
        </div>

        <div class="score-card">
            <div class="score-display">
                <div class="score-number ${this.getScoreClass(data.compliance?.scores?.overall || 0)}">
                    ${data.compliance?.scores?.overall || 0}
                </div>
                <div class="score-label">Baseline Compliance Score</div>
            </div>
        </div>

        <div class="grid">
            <div class="card">
                <h3>🌐 Browser Support</h3>
                <div class="stat">
                    <span class="stat-label">Baseline Features</span>
                    <span class="stat-value">${data.browserSupport?.summary?.baselineFeatures || 0}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Risky Features</span>
                    <span class="stat-value">${data.browserSupport?.summary?.riskyFeatures || 0}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Unknown Features</span>
                    <span class="stat-value">${data.browserSupport?.summary?.unsupportedFeatures || 0}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Total Features</span>
                    <span class="stat-value">${data.browserSupport?.summary?.totalFeatures || 0}</span>
                </div>
            </div>

            <div class="card">
                <h3>🔧 Polyfill Recommendations</h3>
                <div class="stat">
                    <span class="stat-label">Total Polyfills</span>
                    <span class="stat-value">${data.polyfillRecommendations?.summary?.totalPolyfills || 0}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Estimated Size</span>
                    <span class="stat-value">${Math.round((data.polyfillRecommendations?.summary?.estimatedSize || 0) / 1024)} KB</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Maintenance Level</span>
                    <span class="stat-value">${data.polyfillRecommendations?.summary?.maintenanceLevel || 'N/A'}</span>
                </div>
            </div>

            <div class="card">
                <h3>📈 Analysis Summary</h3>
                <div class="stat">
                    <span class="stat-label">Files Scanned</span>
                    <span class="stat-value">${data.summary?.totalFiles || data.progressiveEnhancement?.summary?.progressiveFiles || 0}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Features Detected</span>
                    <span class="stat-value">${data.browserSupport?.summary?.totalFeatures || 0}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Compliance Score</span>
                    <span class="stat-value">${data.compliance?.scores?.overall || 0}/100</span>
                </div>
            </div>
        </div>

        <div class="chart-container">
            <h3>📊 Feature Status Breakdown</h3>
            <div class="chart">
                <div style="display: flex; flex-direction: column; gap: 15px; padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>✅ Baseline-like Features</span>
                        <strong style="color: #10b981;">${data.browserSupport?.summary?.baselineFeatures || 0}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>⚠️ Risky Features</span>
                        <strong style="color: #f59e0b;">${data.browserSupport?.summary?.riskyFeatures || 0}</strong>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span>❓ Unknown Features</span>
                        <strong style="color: #6b7280;">${data.browserSupport?.summary?.unsupportedFeatures || 0}</strong>
                    </div>
                </div>
            </div>
        </div>

        <div class="recommendations">
            <h3>💡 Recommendations</h3>
            ${this.generateRecommendationsHTML(data.summary?.recommendations || [])}
        </div>
        
        ${this.generateFeaturesListHTML(data.browserSupport?.features || [])}
    </div>
</body>
</html>`;

    return html;
  }

  /**
   * Generate recommendations HTML
   */
  generateRecommendationsHTML(recommendations) {
    if (recommendations.length === 0) {
      return '<p>No recommendations available.</p>';
    }

    return recommendations.map(rec => `
        <div class="recommendation">
            <h4>${rec.title}</h4>
            <p>${rec.message}</p>
            <p><strong>Suggestion:</strong> ${rec.suggestion}</p>
            <span class="priority priority-${rec.priority}">${rec.priority}</span>
        </div>
    `).join('');
  }

  /**
   * Get score class for styling
   */
  getScoreClass(score) {
    if (score >= 90) return 'score-excellent';
    if (score >= 80) return 'score-good';
    if (score >= 60) return 'score-fair';
    return 'score-poor';
  }

  /**
   * Generate recommendations from scan results
   */
  generateRecommendationsFromScan(scanResults) {
    const recommendations = [];
    const risky = scanResults.filter(r => r.status === 'risky');
    const unknown = scanResults.filter(r => r.status === 'unknown');
    
    if (risky.length > 0) {
      recommendations.push({
        type: 'browser_support',
        priority: 'high',
        title: 'Risky Features Detected',
        message: `${risky.length} features may have limited browser support`,
        suggestion: 'Consider adding polyfills or fallbacks for better compatibility'
      });
    }
    
    if (unknown.length > 0) {
      recommendations.push({
        type: 'unknown_features',
        priority: 'medium',
        title: 'Unknown Features',
        message: `${unknown.length} features could not be verified against browser data`,
        suggestion: 'Review these features manually for browser compatibility'
      });
    }
    
    return recommendations;
  }

  /**
   * Generate features list HTML
   */
  generateFeaturesListHTML(features) {
    if (!features || features.length === 0) {
      return '';
    }
    
    // Group by status
    const baselineLike = features.filter(f => f.status === 'baseline_like' || f.status === 'baseline-like');
    const risky = features.filter(f => f.status === 'risky');
    const unknown = features.filter(f => f.status === 'unknown');
    
    return `
        <div class="chart-container" style="margin-top: 30px;">
            <h3>📋 Detected Features</h3>
            ${risky.length > 0 ? `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #f59e0b; margin-bottom: 10px;">⚠️ Risky Features (${risky.length})</h4>
                <div style="display: grid; gap: 10px;">
                    ${risky.slice(0, 10).map(f => `
                        <div style="padding: 10px; background: #2d2d2d; border-radius: 6px; border-left: 3px solid #f59e0b;">
                            <strong>${f.feature}</strong>
                            <div style="font-size: 0.9rem; color: #cccccc; margin-top: 5px;">
                                Files: ${Array.isArray(f.files) ? f.files.join(', ') : f.files}
                                ${f.mdn ? `<br><a href="${f.mdn}" target="_blank" style="color: #667eea;">MDN Docs</a>` : ''}
                            </div>
                        </div>
                    `).join('')}
                    ${risky.length > 10 ? `<p style="color: #cccccc; font-size: 0.9rem;">... and ${risky.length - 10} more</p>` : ''}
                </div>
            </div>
            ` : ''}
            
            ${baselineLike.length > 0 ? `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #10b981; margin-bottom: 10px;">✅ Baseline-like Features (${baselineLike.length})</h4>
                <div style="display: grid; gap: 10px; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
                    ${baselineLike.slice(0, 15).map(f => `
                        <div style="padding: 8px; background: #2d2d2d; border-radius: 6px; border-left: 3px solid #10b981; font-size: 0.9rem;">
                            <strong>${f.feature}</strong>
                            ${f.mdn ? `<br><a href="${f.mdn}" target="_blank" style="color: #667eea; font-size: 0.8rem;">Docs</a>` : ''}
                        </div>
                    `).join('')}
                    ${baselineLike.length > 15 ? `<p style="color: #cccccc; font-size: 0.9rem;">... and ${baselineLike.length - 15} more</p>` : ''}
                </div>
            </div>
            ` : ''}
            
            ${unknown.length > 0 ? `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #6b7280; margin-bottom: 10px;">❓ Unknown Features (${unknown.length})</h4>
                <div style="display: grid; gap: 10px; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
                    ${unknown.slice(0, 10).map(f => `
                        <div style="padding: 8px; background: #2d2d2d; border-radius: 6px; border-left: 3px solid #6b7280; font-size: 0.9rem;">
                            ${f.feature}
                        </div>
                    `).join('')}
                    ${unknown.length > 10 ? `<p style="color: #cccccc; font-size: 0.9rem;">... and ${unknown.length - 10} more</p>` : ''}
                </div>
            </div>
            ` : ''}
        </div>
    `;
  }
}

export { BrowserDetector, PolyfillRecommender, ProgressiveEnhancementAnalyzer, BaselineComplianceScorer, MigrationAssistant, MigrationDashboard };

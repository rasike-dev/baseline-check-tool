/**
 * Browser-Specific Feature Detector
 * Detects features and their support across specific browsers
 */

export class BrowserDetector {
  constructor(options = {}) {
    this.options = {
      targetBrowsers: ['chrome', 'firefox', 'safari', 'edge'],
      baselineThreshold: 0.95, // 95% support considered baseline
      includeMobile: true,
      includeBeta: false,
      ...options
    };
    
    this.browserSupport = new Map();
    this.featureMatrix = new Map();
    this.baselineFeatures = new Set();
    this.riskyFeatures = new Set();
  }

  /**
   * Analyze features for browser-specific support
   */
  async analyzeBrowserSupport(features, bcdData) {
    const results = {
      features: [],
      summary: {
        totalFeatures: features.length,
        baselineFeatures: 0,
        riskyFeatures: 0,
        unsupportedFeatures: 0,
        browserSupport: {}
      },
      recommendations: [],
      supportMatrix: {}
    };

    // Initialize browser support tracking
    for (const browser of this.options.targetBrowsers) {
      results.summary.browserSupport[browser] = {
        supported: 0,
        partial: 0,
        unsupported: 0,
        coverage: 0
      };
    }

    // Analyze each feature
    for (const feature of features) {
      const featureAnalysis = await this.analyzeFeature(feature, bcdData);
      results.features.push(featureAnalysis);
      
      // Update summary counts
      if (featureAnalysis.baseline) {
        results.summary.baselineFeatures++;
        this.baselineFeatures.add(feature.name);
      } else if (featureAnalysis.risky) {
        results.summary.riskyFeatures++;
        this.riskyFeatures.add(feature.name);
      } else if (featureAnalysis.unsupported) {
        results.summary.unsupportedFeatures++;
      }

      // Update browser support counts
      for (const [browser, support] of Object.entries(featureAnalysis.browserSupport)) {
        if (support === 'supported') {
          results.summary.browserSupport[browser].supported++;
        } else if (support === 'partial') {
          results.summary.browserSupport[browser].partial++;
        } else {
          results.summary.browserSupport[browser].unsupported++;
        }
      }
    }

    // Calculate browser coverage
    for (const browser of this.options.targetBrowsers) {
      const browserData = results.summary.browserSupport[browser];
      const total = browserData.supported + browserData.partial + browserData.unsupported;
      browserData.coverage = total > 0 ? (browserData.supported / total) * 100 : 0;
    }

    // Generate support matrix
    results.supportMatrix = this.generateSupportMatrix(results.features);

    // Generate recommendations
    results.recommendations = this.generateRecommendations(results.features, results.summary);

    return results;
  }

  /**
   * Analyze individual feature for browser support
   */
  async analyzeFeature(feature, bcdData) {
    const analysis = {
      name: feature.name,
      category: feature.category || 'unknown',
      baseline: false,
      risky: false,
      unsupported: false,
      browserSupport: {},
      supportScore: 0,
      recommendations: [],
      polyfills: [],
      alternatives: [],
      usage: feature.usage || 0,
      files: feature.files || []
    };

    // Get BCD data for this feature
    const bcdFeature = this.getBCDFeature(feature.name, bcdData);
    
    if (!bcdFeature) {
      analysis.unsupported = true;
      analysis.recommendations.push({
        type: 'unknown_feature',
        priority: 'high',
        message: 'Feature not found in Browser Compatibility Data',
        suggestion: 'Verify feature name or check for typos'
      });
      return analysis;
    }

    // Analyze browser support
    let totalSupport = 0;
    let supportedBrowsers = 0;

    for (const browser of this.options.targetBrowsers) {
      const support = this.getBrowserSupport(bcdFeature, browser);
      analysis.browserSupport[browser] = support;
      
      if (support === 'supported') {
        totalSupport += 1;
        supportedBrowsers++;
      } else if (support === 'partial') {
        totalSupport += 0.5;
      }
    }

    // Calculate support score
    analysis.supportScore = (totalSupport / this.options.targetBrowsers.length) * 100;

    // Determine feature status
    if (analysis.supportScore >= this.options.baselineThreshold * 100) {
      analysis.baseline = true;
    } else if (analysis.supportScore >= 50) {
      analysis.risky = true;
    } else {
      analysis.unsupported = true;
    }

    // Generate feature-specific recommendations
    analysis.recommendations = this.generateFeatureRecommendations(analysis, bcdFeature);
    analysis.polyfills = this.findPolyfills(feature.name, bcdFeature);
    analysis.alternatives = this.findAlternatives(feature.name, bcdFeature);

    return analysis;
  }

  /**
   * Get BCD feature data
   */
  getBCDFeature(featureName, bcdData) {
    // Try different feature name formats
    const possibleNames = [
      featureName,
      featureName.toLowerCase(),
      featureName.replace(/\s+/g, '-'),
      featureName.replace(/\s+/g, '_'),
      `api.${featureName}`,
      `css.${featureName}`,
      `html.${featureName}`,
      `javascript.${featureName}`
    ];

    for (const name of possibleNames) {
      if (bcdData[name]) {
        return bcdData[name];
      }
    }

    // Try partial matching
    for (const [key, value] of Object.entries(bcdData)) {
      if (key.toLowerCase().includes(featureName.toLowerCase()) ||
          featureName.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    return null;
  }

  /**
   * Get browser support level
   */
  getBrowserSupport(bcdFeature, browser) {
    if (!bcdFeature || !bcdFeature[browser]) {
      return 'unsupported';
    }

    const browserData = bcdFeature[browser];
    
    // Check for version support
    if (browserData.version_added === true) {
      return 'supported';
    }
    
    if (browserData.version_added === false) {
      return 'unsupported';
    }

    // Check version number
    if (typeof browserData.version_added === 'string') {
      const version = this.parseVersion(browserData.version_added);
      const baselineVersion = this.getBaselineVersion(browser);
      
      if (version && baselineVersion) {
        return this.compareVersions(version, baselineVersion) <= 0 ? 'supported' : 'risky';
      }
    }

    // Check for flags or alternative names
    if (browserData.flags || browserData.alternative_name) {
      return 'partial';
    }

    return 'unsupported';
  }

  /**
   * Generate support matrix
   */
  generateSupportMatrix(features) {
    const matrix = {
      browsers: this.options.targetBrowsers,
      features: features.map(f => f.name),
      support: {}
    };

    // Initialize support matrix
    for (const browser of this.options.targetBrowsers) {
      matrix.support[browser] = {};
      for (const feature of features) {
        matrix.support[browser][feature.name] = feature.browserSupport[browser] || 'unsupported';
      }
    }

    return matrix;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(features, summary) {
    const recommendations = [];

    // Baseline features recommendations
    if (summary.baselineFeatures > 0) {
      recommendations.push({
        type: 'baseline_features',
        priority: 'info',
        title: 'Baseline Features Detected',
        message: `Found ${summary.baselineFeatures} baseline features that are well-supported`,
        suggestion: 'These features are safe to use in production',
        features: features.filter(f => f.baseline).map(f => f.name)
      });
    }

    // Risky features recommendations
    if (summary.riskyFeatures > 0) {
      recommendations.push({
        type: 'risky_features',
        priority: 'high',
        title: 'Risky Features Detected',
        message: `Found ${summary.riskyFeatures} risky features with limited browser support`,
        suggestion: 'Consider adding polyfills or fallbacks for these features',
        features: features.filter(f => f.risky).map(f => f.name)
      });
    }

    // Unsupported features recommendations
    if (summary.unsupportedFeatures > 0) {
      recommendations.push({
        type: 'unsupported_features',
        priority: 'critical',
        title: 'Unsupported Features Detected',
        message: `Found ${summary.unsupportedFeatures} features with no browser support`,
        suggestion: 'Remove or replace these features with supported alternatives',
        features: features.filter(f => f.unsupported).map(f => f.name)
      });
    }

    // Browser-specific recommendations
    for (const [browser, data] of Object.entries(summary.browserSupport)) {
      if (data.coverage < 80) {
        recommendations.push({
          type: 'browser_coverage',
          priority: 'medium',
          title: `Low Coverage in ${browser}`,
          message: `Only ${data.coverage.toFixed(1)}% of features are supported in ${browser}`,
          suggestion: 'Consider adding polyfills or fallbacks for better browser support',
          browser: browser,
          coverage: data.coverage
        });
      }
    }

    return recommendations;
  }

  /**
   * Generate feature-specific recommendations
   */
  generateFeatureRecommendations(analysis, bcdFeature) {
    const recommendations = [];

    if (analysis.risky) {
      recommendations.push({
        type: 'add_polyfill',
        priority: 'high',
        message: `Consider adding a polyfill for ${analysis.name}`,
        suggestion: 'Use a polyfill to ensure compatibility across all browsers'
      });
    }

    if (analysis.unsupported) {
      recommendations.push({
        type: 'replace_feature',
        priority: 'critical',
        message: `Replace ${analysis.name} with a supported alternative`,
        suggestion: 'This feature is not supported in any target browsers'
      });
    }

    // Check for specific browser issues
    for (const [browser, support] of Object.entries(analysis.browserSupport)) {
      if (support === 'partial') {
        recommendations.push({
          type: 'browser_specific',
          priority: 'medium',
          message: `${analysis.name} has partial support in ${browser}`,
          suggestion: 'Check for browser-specific implementation details',
          browser: browser
        });
      }
    }

    return recommendations;
  }

  /**
   * Find polyfills for a feature
   */
  findPolyfills(featureName, bcdFeature) {
    const polyfills = [];

    // Common polyfill mappings
    const polyfillMap = {
      'fetch': ['whatwg-fetch', 'unfetch'],
      'promise': ['es6-promise', 'promise-polyfill'],
      'array.from': ['array.from'],
      'object.assign': ['object.assign'],
      'string.includes': ['string.prototype.includes'],
      'css.grid': ['css-grid-polyfill'],
      'css.flexbox': ['flexibility'],
      'css.custom-properties': ['css-vars-ponyfill'],
      'intersection-observer': ['intersection-observer'],
      'resize-observer': ['resize-observer-polyfill']
    };

    // Find matching polyfills
    for (const [pattern, polyfillList] of Object.entries(polyfillMap)) {
      if (featureName.toLowerCase().includes(pattern.toLowerCase()) ||
          pattern.toLowerCase().includes(featureName.toLowerCase())) {
        polyfills.push(...polyfillList);
      }
    }

    return [...new Set(polyfills)]; // Remove duplicates
  }

  /**
   * Find alternatives for a feature
   */
  findAlternatives(featureName, bcdFeature) {
    const alternatives = [];

    // Common alternative mappings
    const alternativeMap = {
      'fetch': ['XMLHttpRequest', 'axios', 'jQuery.ajax'],
      'promise': ['callback', 'async/await'],
      'css.grid': ['flexbox', 'float', 'table'],
      'css.flexbox': ['float', 'inline-block', 'table'],
      'css.custom-properties': ['CSS variables with fallbacks', 'Sass variables'],
      'intersection-observer': ['scroll events', 'getBoundingClientRect'],
      'resize-observer': ['window resize events', 'getBoundingClientRect']
    };

    // Find matching alternatives
    for (const [pattern, altList] of Object.entries(alternativeMap)) {
      if (featureName.toLowerCase().includes(pattern.toLowerCase()) ||
          pattern.toLowerCase().includes(featureName.toLowerCase())) {
        alternatives.push(...altList);
      }
    }

    return [...new Set(alternatives)]; // Remove duplicates
  }

  /**
   * Helper methods
   */
  parseVersion(version) {
    if (typeof version === 'number') return version;
    if (typeof version === 'string') {
      const match = version.match(/(\d+)/);
      return match ? parseInt(match[1]) : null;
    }
    return null;
  }

  getBaselineVersion(browser) {
    const baselineVersions = {
      chrome: 90,
      firefox: 88,
      safari: 14,
      edge: 90
    };
    return baselineVersions[browser] || null;
  }

  compareVersions(version1, version2) {
    return version1 - version2;
  }

  /**
   * Get baseline compliance score
   */
  getBaselineComplianceScore(features) {
    const baselineCount = features.filter(f => f.baseline).length;
    const totalCount = features.length;
    return totalCount > 0 ? (baselineCount / totalCount) * 100 : 0;
  }

  /**
   * Get browser-specific compliance scores
   */
  getBrowserComplianceScores(features) {
    const scores = {};
    
    for (const browser of this.options.targetBrowsers) {
      const supportedCount = features.filter(f => 
        f.browserSupport[browser] === 'supported'
      ).length;
      const totalCount = features.length;
      scores[browser] = totalCount > 0 ? (supportedCount / totalCount) * 100 : 0;
    }
    
    return scores;
  }
}

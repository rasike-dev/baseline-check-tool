/**
 * Enhanced Feature Detection Engine
 * Intelligently combines and manages feature detection patterns
 */

import { getAllEnhancedFeatures, getFeaturesByCategory, getFeaturesByFramework, getFeatureStats } from './enhanced-features.js';

export class FeatureDetector {
  constructor(options = {}) {
    this.options = {
      enableModernAPIs: true,
      enableModernCSS: true,
      enableModernHTML: true,
      enableModernJS: true,
      enableFrameworks: true,
      enablePWA: true,
      enableAccessibility: true,
      frameworks: [], // Specific frameworks to detect
      categories: [], // Specific categories to detect
      customFeatures: {},
      ...options
    };
    
    this.features = this.buildFeatureSet();
  }

  /**
   * Build the complete feature set based on options
   */
  buildFeatureSet() {
    const features = {};
    
    // Add enhanced features based on options
    if (this.options.enableModernAPIs) {
      Object.assign(features, getFeaturesByCategory('modernAPIs'));
    }
    
    if (this.options.enableModernCSS) {
      Object.assign(features, getFeaturesByCategory('modernCSS'));
    }
    
    if (this.options.enableModernHTML) {
      Object.assign(features, getFeaturesByCategory('modernHTML'));
    }
    
    if (this.options.enableModernJS) {
      Object.assign(features, getFeaturesByCategory('modernJS'));
    }
    
    if (this.options.enablePWA) {
      Object.assign(features, getFeaturesByCategory('pwa'));
    }
    
    if (this.options.enableAccessibility) {
      Object.assign(features, getFeaturesByCategory('accessibility'));
    }
    
    // Add framework-specific features
    if (this.options.enableFrameworks && this.options.frameworks.length > 0) {
      this.options.frameworks.forEach(framework => {
        Object.assign(features, getFeaturesByFramework(framework));
      });
    }
    
    // Add custom features
    Object.assign(features, this.options.customFeatures);
    
    return features;
  }

  /**
   * Detect features in content
   */
  detectFeatures(content, filePath = '') {
    const detectedFeatures = [];
    const fileType = this.getFileType(filePath);
    
    Object.entries(this.features).forEach(([name, config]) => {
      try {
        const matches = this.findMatches(content, config, fileType);
        if (matches.length > 0) {
          detectedFeatures.push({
            name,
            category: config.category,
            framework: config.framework,
            description: config.description,
            matches: matches,
            count: matches.length,
            file: filePath,
            fileType
          });
        }
      } catch (error) {
        console.warn(`Error detecting feature ${name}:`, error.message);
      }
    });
    
    return detectedFeatures;
  }

  /**
   * Find matches for a specific feature
   */
  findMatches(content, config, fileType) {
    const matches = [];
    const regex = config.re;
    
    if (!regex) return matches;
    
    // Reset regex lastIndex
    regex.lastIndex = 0;
    
    let match;
    while ((match = regex.exec(content)) !== null) {
      matches.push({
        match: match[0],
        index: match.index,
        line: this.getLineNumber(content, match.index),
        context: this.getContext(content, match.index, 50)
      });
      
      // Prevent infinite loops
      if (match.index === regex.lastIndex) {
        regex.lastIndex++;
      }
    }
    
    return matches;
  }

  /**
   * Get file type from extension
   */
  getFileType(filePath) {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const typeMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'css': 'css',
      'html': 'html',
      'htm': 'html',
      'vue': 'vue',
      'svelte': 'svelte'
    };
    return typeMap[ext] || 'unknown';
  }

  /**
   * Get line number from index
   */
  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  /**
   * Get context around match
   */
  getContext(content, index, length = 50) {
    const start = Math.max(0, index - length);
    const end = Math.min(content.length, index + length);
    return content.substring(start, end);
  }

  /**
   * Get feature statistics
   */
  getStats() {
    return getFeatureStats();
  }

  /**
   * Get features by category
   */
  getFeaturesByCategory(category) {
    return getFeaturesByCategory(category);
  }

  /**
   * Get features by framework
   */
  getFeaturesByFramework(framework) {
    return getFeaturesByFramework(framework);
  }

  /**
   * Add custom feature
   */
  addCustomFeature(name, config) {
    this.features[name] = {
      category: 'custom',
      ...config
    };
  }

  /**
   * Remove feature
   */
  removeFeature(name) {
    delete this.features[name];
  }

  /**
   * Update feature configuration
   */
  updateFeature(name, updates) {
    if (this.features[name]) {
      this.features[name] = { ...this.features[name], ...updates };
    }
  }

  /**
   * Get all available features
   */
  getAllFeatures() {
    return { ...this.features };
  }

  /**
   * Get feature count
   */
  getFeatureCount() {
    return Object.keys(this.features).length;
  }

  /**
   * Validate feature configuration
   */
  validateFeatures() {
    const errors = [];
    
    Object.entries(this.features).forEach(([name, config]) => {
      if (!config.re) {
        errors.push(`Feature ${name} is missing regex pattern`);
      }
      if (!config.category) {
        errors.push(`Feature ${name} is missing category`);
      }
      if (config.re && !(config.re instanceof RegExp)) {
        errors.push(`Feature ${name} has invalid regex pattern`);
      }
    });
    
    return errors;
  }
}

/**
 * Create a feature detector with common presets
 */
export function createFeatureDetector(preset = 'default') {
  const presets = {
    default: {
      enableModernAPIs: true,
      enableModernCSS: true,
      enableModernHTML: true,
      enableModernJS: true,
      enableFrameworks: true,
      enablePWA: true,
      enableAccessibility: true
    },
    
    minimal: {
      enableModernAPIs: false,
      enableModernCSS: false,
      enableModernHTML: true,
      enableModernJS: true,
      enableFrameworks: false,
      enablePWA: false,
      enableAccessibility: false
    },
    
    modern: {
      enableModernAPIs: true,
      enableModernCSS: true,
      enableModernHTML: true,
      enableModernJS: true,
      enableFrameworks: true,
      enablePWA: true,
      enableAccessibility: true
    },
    
    react: {
      enableModernAPIs: true,
      enableModernCSS: true,
      enableModernHTML: true,
      enableModernJS: true,
      enableFrameworks: true,
      enablePWA: true,
      enableAccessibility: true,
      frameworks: ['react']
    },
    
    vue: {
      enableModernAPIs: true,
      enableModernCSS: true,
      enableModernHTML: true,
      enableModernJS: true,
      enableFrameworks: true,
      enablePWA: true,
      enableAccessibility: true,
      frameworks: ['vue']
    },
    
    angular: {
      enableModernAPIs: true,
      enableModernCSS: true,
      enableModernHTML: true,
      enableModernJS: true,
      enableFrameworks: true,
      enablePWA: true,
      enableAccessibility: true,
      frameworks: ['angular']
    },
    
    pwa: {
      enableModernAPIs: true,
      enableModernCSS: false,
      enableModernHTML: true,
      enableModernJS: true,
      enableFrameworks: false,
      enablePWA: true,
      enableAccessibility: true
    }
  };
  
  return new FeatureDetector(presets[preset] || presets.default);
}

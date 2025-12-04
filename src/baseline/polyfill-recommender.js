/**
 * Polyfill Recommender
 * Provides intelligent polyfill recommendations based on feature analysis
 */

export class PolyfillRecommender {
  constructor(options = {}) {
    this.options = {
      includeSize: true,
      includeMaintenance: true,
      includePerformance: true,
      preferModern: true,
      ...options
    };

    this.polyfillDatabase = this.initializePolyfillDatabase();
  }

  /**
   * Generate polyfill recommendations for features
   */
  generateRecommendations(features) {
    const recommendations = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      summary: {
        totalPolyfills: 0,
        estimatedSize: 0,
        maintenanceLevel: 'low',
        performanceImpact: 'minimal'
      }
    };

    for (const feature of features) {
      if (feature.risky || feature.unsupported) {
        const polyfillRecs = this.recommendPolyfills(feature);
        recommendations[feature.risky ? 'high' : 'critical'].push(...polyfillRecs);
      }
    }

    // Calculate summary
    recommendations.summary = this.calculateSummary(recommendations);

    return recommendations;
  }

  /**
   * Recommend polyfills for a specific feature
   */
  recommendPolyfills(feature) {
    const recommendations = [];
    const polyfills = this.findPolyfills(feature.name);

    for (const polyfill of polyfills) {
      const recommendation = {
        feature: feature.name,
        polyfill: polyfill.name,
        priority: this.calculatePriority(feature, polyfill),
        size: polyfill.size,
        maintenance: polyfill.maintenance,
        performance: polyfill.performance,
        installation: polyfill.installation,
        usage: polyfill.usage,
        alternatives: polyfill.alternatives,
        browserSupport: polyfill.browserSupport,
        lastUpdated: polyfill.lastUpdated,
        stars: polyfill.stars,
        weeklyDownloads: polyfill.weeklyDownloads
      };

      recommendations.push(recommendation);
    }

    return recommendations;
  }

  /**
   * Find polyfills for a feature
   */
  findPolyfills(featureName) {
    const polyfills = [];
    const normalizedName = featureName.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Search polyfill database
    for (const [key, polyfill] of Object.entries(this.polyfillDatabase)) {
      if (this.matchesFeature(normalizedName, key, polyfill.features)) {
        polyfills.push(polyfill);
      }
    }

    // Sort by relevance and quality
    return polyfills.sort((a, b) => {
      const scoreA = this.calculatePolyfillScore(a);
      const scoreB = this.calculatePolyfillScore(b);
      return scoreB - scoreA;
    });
  }

  /**
   * Check if polyfill matches feature
   */
  matchesFeature(featureName, key, features) {
    // Direct name match
    if (key.includes(featureName) || featureName.includes(key)) {
      return true;
    }

    // Feature list match
    if (features && features.some(f => 
      f.toLowerCase().includes(featureName) || 
      featureName.includes(f.toLowerCase())
    )) {
      return true;
    }

    return false;
  }

  /**
   * Calculate polyfill priority
   */
  calculatePriority(feature, polyfill) {
    let priority = 'medium';

    // Critical if feature is unsupported
    if (feature.unsupported) {
      priority = 'critical';
    }
    // High if feature is risky
    else if (feature.risky) {
      priority = 'high';
    }

    // Adjust based on polyfill quality
    if (polyfill.stars > 1000 && polyfill.weeklyDownloads > 100000) {
      priority = priority === 'critical' ? 'critical' : 'high';
    } else if (polyfill.stars < 100 || polyfill.weeklyDownloads < 1000) {
      priority = priority === 'critical' ? 'high' : 'medium';
    }

    return priority;
  }

  /**
   * Calculate polyfill quality score
   */
  calculatePolyfillScore(polyfill) {
    let score = 0;

    // GitHub stars (0-50 points)
    score += Math.min(polyfill.stars / 100, 50);

    // Weekly downloads (0-30 points)
    score += Math.min(polyfill.weeklyDownloads / 10000, 30);

    // Maintenance level (0-20 points)
    const maintenanceScore = {
      'high': 20,
      'medium': 10,
      'low': 5,
      'none': 0
    };
    score += maintenanceScore[polyfill.maintenance] || 0;

    // Size penalty (0-20 points, smaller is better)
    if (polyfill.size < 1000) {
      score += 20;
    } else if (polyfill.size < 5000) {
      score += 15;
    } else if (polyfill.size < 10000) {
      score += 10;
    } else {
      score += 5;
    }

    return score;
  }

  /**
   * Calculate summary statistics
   */
  calculateSummary(recommendations) {
    const allRecs = [
      ...recommendations.critical,
      ...recommendations.high,
      ...recommendations.medium,
      ...recommendations.low
    ];

    const totalSize = allRecs.reduce((sum, rec) => sum + (rec.size || 0), 0);
    const maintenanceLevels = allRecs.map(rec => rec.maintenance);
    const performanceLevels = allRecs.map(rec => rec.performance);

    return {
      totalPolyfills: allRecs.length,
      estimatedSize: totalSize,
      maintenanceLevel: this.calculateOverallMaintenance(maintenanceLevels),
      performanceImpact: this.calculateOverallPerformance(performanceLevels)
    };
  }

  /**
   * Calculate overall maintenance level
   */
  calculateOverallMaintenance(levels) {
    const counts = {
      'high': 0,
      'medium': 0,
      'low': 0,
      'none': 0
    };

    levels.forEach(level => {
      counts[level] = (counts[level] || 0) + 1;
    });

    if (counts.high > counts.medium && counts.high > counts.low) return 'high';
    if (counts.medium > counts.low) return 'medium';
    return 'low';
  }

  /**
   * Calculate overall performance impact
   */
  calculateOverallPerformance(levels) {
    const counts = {
      'minimal': 0,
      'low': 0,
      'medium': 0,
      'high': 0
    };

    levels.forEach(level => {
      counts[level] = (counts[level] || 0) + 1;
    });

    if (counts.high > counts.medium && counts.high > counts.low) return 'high';
    if (counts.medium > counts.low) return 'medium';
    if (counts.low > counts.minimal) return 'low';
    return 'minimal';
  }

  /**
   * Initialize polyfill database
   */
  initializePolyfillDatabase() {
    return {
      'fetch': {
        name: 'whatwg-fetch',
        features: ['fetch', 'Request', 'Response', 'Headers'],
        size: 12000,
        maintenance: 'high',
        performance: 'minimal',
        installation: 'npm install whatwg-fetch',
        usage: 'import "whatwg-fetch"',
        alternatives: ['unfetch', 'axios', 'XMLHttpRequest'],
        browserSupport: {
          chrome: '40+',
          firefox: '39+',
          safari: '10.1+',
          edge: '12+'
        },
        lastUpdated: '2023-01-15',
        stars: 8500,
        weeklyDownloads: 1500000
      },
      'promise': {
        name: 'es6-promise',
        features: ['Promise', 'Promise.all', 'Promise.race'],
        size: 8000,
        maintenance: 'high',
        performance: 'minimal',
        installation: 'npm install es6-promise',
        usage: 'import "es6-promise/auto"',
        alternatives: ['promise-polyfill', 'core-js'],
        browserSupport: {
          chrome: '32+',
          firefox: '29+',
          safari: '8+',
          edge: '12+'
        },
        lastUpdated: '2023-02-01',
        stars: 4200,
        weeklyDownloads: 800000
      },
      'arrayfrom': {
        name: 'array.from',
        features: ['Array.from', 'Array.of'],
        size: 2000,
        maintenance: 'medium',
        performance: 'minimal',
        installation: 'npm install array.from',
        usage: 'import "array.from"',
        alternatives: ['core-js', 'babel-polyfill'],
        browserSupport: {
          chrome: '45+',
          firefox: '32+',
          safari: '9+',
          edge: '12+'
        },
        lastUpdated: '2022-12-10',
        stars: 150,
        weeklyDownloads: 50000
      },
      'objectassign': {
        name: 'object.assign',
        features: ['Object.assign', 'Object.keys', 'Object.values'],
        size: 3000,
        maintenance: 'medium',
        performance: 'minimal',
        installation: 'npm install object.assign',
        usage: 'import "object.assign"',
        alternatives: ['core-js', 'lodash.assign'],
        browserSupport: {
          chrome: '45+',
          firefox: '34+',
          safari: '9+',
          edge: '12+'
        },
        lastUpdated: '2022-11-20',
        stars: 200,
        weeklyDownloads: 75000
      },
      'stringincludes': {
        name: 'string.prototype.includes',
        features: ['String.prototype.includes', 'String.prototype.startsWith', 'String.prototype.endsWith'],
        size: 1500,
        maintenance: 'medium',
        performance: 'minimal',
        installation: 'npm install string.prototype.includes',
        usage: 'import "string.prototype.includes"',
        alternatives: ['core-js', 'babel-polyfill'],
        browserSupport: {
          chrome: '41+',
          firefox: '40+',
          safari: '9+',
          edge: '12+'
        },
        lastUpdated: '2022-10-15',
        stars: 100,
        weeklyDownloads: 30000
      },
      'cssgrid': {
        name: 'css-grid-polyfill',
        features: ['CSS Grid', 'grid-template', 'grid-area'],
        size: 45000,
        maintenance: 'low',
        performance: 'medium',
        installation: 'npm install css-grid-polyfill',
        usage: 'import "css-grid-polyfill"',
        alternatives: ['flexbox', 'float', 'table'],
        browserSupport: {
          chrome: '57+',
          firefox: '52+',
          safari: '10.1+',
          edge: '16+'
        },
        lastUpdated: '2021-06-01',
        stars: 800,
        weeklyDownloads: 25000
      },
      'flexbox': {
        name: 'flexibility',
        features: ['CSS Flexbox', 'flex', 'flex-direction'],
        size: 8000,
        maintenance: 'low',
        performance: 'low',
        installation: 'npm install flexibility',
        usage: 'import "flexibility"',
        alternatives: ['float', 'inline-block', 'table'],
        browserSupport: {
          chrome: '21+',
          firefox: '28+',
          safari: '9+',
          edge: '12+'
        },
        lastUpdated: '2020-03-15',
        stars: 300,
        weeklyDownloads: 15000
      },
      'customproperties': {
        name: 'css-vars-ponyfill',
        features: ['CSS Custom Properties', 'CSS Variables', 'var()'],
        size: 12000,
        maintenance: 'high',
        performance: 'minimal',
        installation: 'npm install css-vars-ponyfill',
        usage: 'import cssVars from "css-vars-ponyfill"',
        alternatives: ['Sass variables', 'CSS preprocessors'],
        browserSupport: {
          chrome: '49+',
          firefox: '31+',
          safari: '9.1+',
          edge: '15+'
        },
        lastUpdated: '2023-03-01',
        stars: 1200,
        weeklyDownloads: 40000
      },
      'intersectionobserver': {
        name: 'intersection-observer',
        features: ['IntersectionObserver', 'IntersectionObserverEntry'],
        size: 15000,
        maintenance: 'high',
        performance: 'minimal',
        installation: 'npm install intersection-observer',
        usage: 'import "intersection-observer"',
        alternatives: ['scroll events', 'getBoundingClientRect'],
        browserSupport: {
          chrome: '51+',
          firefox: '55+',
          safari: '12.1+',
          edge: '15+'
        },
        lastUpdated: '2023-01-20',
        stars: 2500,
        weeklyDownloads: 200000
      },
      'resizeobserver': {
        name: 'resize-observer-polyfill',
        features: ['ResizeObserver', 'ResizeObserverEntry'],
        size: 8000,
        maintenance: 'medium',
        performance: 'minimal',
        installation: 'npm install resize-observer-polyfill',
        usage: 'import ResizeObserver from "resize-observer-polyfill"',
        alternatives: ['window resize events', 'getBoundingClientRect'],
        browserSupport: {
          chrome: '64+',
          firefox: '69+',
          safari: '13.1+',
          edge: '79+'
        },
        lastUpdated: '2022-11-30',
        stars: 800,
        weeklyDownloads: 80000
      },
      'webcomponents': {
        name: '@webcomponents/webcomponentsjs',
        features: ['Custom Elements', 'Shadow DOM', 'HTML Templates'],
        size: 60000,
        maintenance: 'high',
        performance: 'medium',
        installation: 'npm install @webcomponents/webcomponentsjs',
        usage: 'import "@webcomponents/webcomponentsjs"',
        alternatives: ['React', 'Vue', 'Angular'],
        browserSupport: {
          chrome: '54+',
          firefox: '63+',
          safari: '10.1+',
          edge: '79+'
        },
        lastUpdated: '2023-02-15',
        stars: 3500,
        weeklyDownloads: 100000
      }
    };
  }

  /**
   * Generate installation commands
   */
  generateInstallationCommands(recommendations) {
    const commands = {
      npm: [],
      yarn: [],
      pnpm: [],
      cdn: []
    };

    const allRecs = [
      ...recommendations.critical,
      ...recommendations.high,
      ...recommendations.medium,
      ...recommendations.low
    ];

    for (const rec of allRecs) {
      if (rec.installation) {
        commands.npm.push(rec.installation);
        commands.yarn.push(rec.installation.replace('npm install', 'yarn add'));
        commands.pnpm.push(rec.installation.replace('npm install', 'pnpm add'));
      }
    }

    return commands;
  }

  /**
   * Generate usage examples
   */
  generateUsageExamples(recommendations) {
    const examples = [];

    const allRecs = [
      ...recommendations.critical,
      ...recommendations.high,
      ...recommendations.medium,
      ...recommendations.low
    ];

    for (const rec of allRecs) {
      if (rec.usage) {
        examples.push({
          feature: rec.feature,
          polyfill: rec.polyfill,
          usage: rec.usage,
          example: this.generateCodeExample(rec)
        });
      }
    }

    return examples;
  }

  /**
   * Generate code example
   */
  generateCodeExample(rec) {
    const examples = {
      'whatwg-fetch': `
// Using fetch polyfill
import 'whatwg-fetch';

fetch('/api/data')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));`,

      'es6-promise': `
// Using Promise polyfill
import 'es6-promise/auto';

const promise = new Promise((resolve, reject) => {
  // Your async code here
  resolve('Success!');
});`,

      'css-vars-ponyfill': `
// Using CSS Custom Properties polyfill
import cssVars from 'css-vars-ponyfill';

cssVars({
  // Options
  onlyLegacy: true,
  preserveStatic: true
});`,

      'intersection-observer': `
// Using IntersectionObserver polyfill
import 'intersection-observer';

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Element is visible
      entry.target.classList.add('visible');
    }
  });
});

observer.observe(document.querySelector('.element'));`
    };

    return examples[rec.polyfill] || `// Usage example for ${rec.polyfill}\n${rec.usage}`;
  }
}

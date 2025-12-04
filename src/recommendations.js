export class RecommendationEngine {
  constructor() {
    this.recommendations = {
      // Feature-specific recommendations
      'css.has_pseudo': {
        title: 'CSS :has() pseudo-class',
        status: 'risky',
        message: 'Consider using feature detection or provide fallbacks',
        alternatives: [
          'Use JavaScript to add classes based on child elements',
          'Use CSS-in-JS libraries that handle :has() polyfills',
          'Wait for broader browser support (currently ~85%)'
        ],
        polyfills: [
          'https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-has-pseudo'
        ]
      },
      'css.container_queries': {
        title: 'CSS Container Queries',
        status: 'risky',
        message: 'Container queries have limited support',
        alternatives: [
          'Use media queries as fallback',
          'Use JavaScript to detect container size',
          'Consider CSS-in-JS solutions'
        ],
        polyfills: [
          'https://github.com/oddbird/popover-polyfill'
        ]
      },
      'Top-level await': {
        title: 'Top-level await',
        status: 'unknown',
        message: 'Top-level await requires ES2022 modules',
        alternatives: [
          'Wrap in async IIFE: (async () => { await ... })()',
          'Use dynamic imports in functions',
          'Use module bundlers that support it'
        ]
      },
      'Dynamic import': {
        title: 'Dynamic import()',
        status: 'risky',
        message: 'Dynamic imports have good support but require module bundling',
        alternatives: [
          'Use static imports for better tree-shaking',
          'Use require() for CommonJS environments',
          'Use module bundlers like Webpack or Vite'
        ]
      }
    };

    this.patterns = {
      // Pattern-based recommendations
      'modern-js': {
        pattern: /(?:optional chaining|nullish coalescing|top-level await|dynamic import)/i,
        message: 'Consider transpiling modern JavaScript for broader compatibility',
        tools: ['Babel', 'TypeScript', 'SWC', 'esbuild']
      },
      'css-modern': {
        pattern: /(?::has|@container|clamp|min\(|max\()/i,
        message: 'Modern CSS features may need fallbacks or polyfills',
        tools: ['PostCSS', 'Autoprefixer', 'CSS-in-JS']
      },
      'web-apis': {
        pattern: /(?:fetch|WebSocket|IntersectionObserver|ResizeObserver)/i,
        message: 'Web APIs are generally well-supported but check specific versions',
        tools: ['Polyfill.io', 'Core-js', 'Feature detection']
      }
    };
  }

  analyzeReport(report) {
    const suggestions = [];
    const stats = this.calculateStats(report);
    
    // Overall recommendations
    suggestions.push(...this.getOverallRecommendations(stats));
    
    // Feature-specific recommendations
    for (const result of report.results || []) {
      const feature = result.feature;
      if (this.recommendations[feature]) {
        suggestions.push({
          type: 'feature',
          feature,
          ...this.recommendations[feature],
          files: result.files?.length || 0
        });
      }
    }

    // Pattern-based recommendations
    suggestions.push(...this.getPatternRecommendations(report));

    return suggestions;
  }

  calculateStats(report) {
    const results = report.results || [];
    const total = results.length;
    const baseline = results.filter(r => r.status === 'baseline_like').length;
    const risky = results.filter(r => r.status === 'risky').length;
    const unknown = results.filter(r => r.status === 'unknown').length;

    return {
      total,
      baseline,
      risky,
      unknown,
      baselinePercentage: total > 0 ? (baseline / total) * 100 : 0,
      riskyPercentage: total > 0 ? (risky / total) * 100 : 0,
      unknownPercentage: total > 0 ? (unknown / total) * 100 : 0
    };
  }

  getOverallRecommendations(stats) {
    const suggestions = [];

    if (stats.riskyPercentage > 30) {
      suggestions.push({
        type: 'overall',
        priority: 'high',
        title: 'High Risk Features Detected',
        message: `${stats.riskyPercentage.toFixed(1)}% of features are risky`,
        action: 'Consider adding polyfills or fallbacks for better compatibility'
      });
    }

    if (stats.unknownPercentage > 20) {
      suggestions.push({
        type: 'overall',
        priority: 'medium',
        title: 'Unknown Features Detected',
        message: `${stats.unknownPercentage.toFixed(1)}% of features have unknown compatibility`,
        action: 'Research these features and add compatibility data if needed'
      });
    }

    if (stats.baselinePercentage > 80) {
      suggestions.push({
        type: 'overall',
        priority: 'low',
        title: 'Excellent Compatibility',
        message: `${stats.baselinePercentage.toFixed(1)}% of features are baseline-compatible`,
        action: 'Great job! Your codebase has excellent browser compatibility'
      });
    }

    return suggestions;
  }

  getPatternRecommendations(report) {
    const suggestions = [];
    const allFiles = new Set();
    
    // Collect all file content
    for (const result of report.results || []) {
      for (const file of result.files || []) {
        allFiles.add(file);
      }
    }

    // Check patterns in files
    for (const [patternName, pattern] of Object.entries(this.patterns)) {
      let matches = 0;
      for (const file of allFiles) {
        try {
          const content = require('fs').readFileSync(file, 'utf8');
          if (pattern.pattern.test(content)) {
            matches++;
          }
        } catch (error) {
          // Skip files that can't be read
        }
      }

      if (matches > 0) {
        suggestions.push({
          type: 'pattern',
          pattern: patternName,
          matches,
          ...pattern
        });
      }
    }

    return suggestions;
  }

  generateReport(suggestions) {
    if (suggestions.length === 0) {
      return {
        summary: 'No specific recommendations at this time.',
        suggestions: []
      };
    }

    const highPriority = suggestions.filter(s => s.priority === 'high');
    const mediumPriority = suggestions.filter(s => s.priority === 'medium');
    const lowPriority = suggestions.filter(s => s.priority === 'low');

    let summary = '';
    if (highPriority.length > 0) {
      summary += `🚨 ${highPriority.length} high priority issue${highPriority.length > 1 ? 's' : ''} found. `;
    }
    if (mediumPriority.length > 0) {
      summary += `⚠️ ${mediumPriority.length} medium priority suggestion${mediumPriority.length > 1 ? 's' : ''}. `;
    }
    if (lowPriority.length > 0) {
      summary += `ℹ️ ${lowPriority.length} additional suggestion${lowPriority.length > 1 ? 's' : ''}.`;
    }

    return {
      summary: summary.trim(),
      suggestions: suggestions.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      })
    };
  }
}

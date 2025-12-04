/**
 * Migration Assistant for Risky-to-Baseline Transitions
 * Helps developers migrate from risky features to baseline alternatives
 */

export class MigrationAssistant {
  constructor(options = {}) {
    this.options = {
      targetBrowsers: ['chrome', 'firefox', 'safari', 'edge'],
      baselineThreshold: 0.95,
      includePolyfills: true,
      includeFallbacks: true,
      includeModernAlternatives: true,
      ...options
    };

    this.migrationDatabase = this.initializeMigrationDatabase();
    this.baselineFeatures = this.initializeBaselineFeatures();
  }

  /**
   * Generate migration plan for risky features
   */
  generateMigrationPlan(riskyFeatures, analysisResults) {
    const migrationPlan = {
      summary: {
        totalFeatures: riskyFeatures?.length || 0,
        migrationComplexity: 'low',
        estimatedTime: 0,
        riskReduction: 0,
        baselineImprovement: 0
      },
      features: [],
      recommendations: [],
      timeline: {
        phases: []
      },
      resources: []
    };

    // Generate migration for each risky feature
    if (riskyFeatures && riskyFeatures.length > 0) {
      for (const feature of riskyFeatures) {
        const migration = this.generateFeatureMigration(feature, analysisResults);
        migrationPlan.features.push(migration);
      }
    }

    // Calculate summary metrics
    migrationPlan.summary = this.calculateMigrationSummary(migrationPlan.features);

    // Generate timeline
    migrationPlan.timeline.phases = this.generateMigrationTimeline(migrationPlan.features);

    // Generate recommendations
    migrationPlan.recommendations = this.generateMigrationRecommendations(migrationPlan);

    // Generate resources
    migrationPlan.resources = this.generateMigrationResources(migrationPlan.features);

    return migrationPlan;
  }

  /**
   * Generate migration for a specific risky feature
   */
  generateFeatureMigration(feature, analysisResults) {
    const migration = {
      feature: feature.name,
      category: feature.category,
      currentSupport: feature.supportScore,
      targetSupport: 95, // Baseline threshold
      complexity: 'low',
      effort: 'low',
      priority: 'medium',
      alternatives: [],
      steps: [],
      codeExamples: {
        before: '',
        after: '',
        polyfill: '',
        fallback: ''
      },
      testing: {
        browsers: [],
        tools: [],
        checklist: []
      },
      risks: [],
      benefits: []
    };

    // Find migration strategy
    const strategy = this.findMigrationStrategy(feature.name, feature.category);
    if (strategy) {
      migration.complexity = strategy.complexity;
      migration.effort = strategy.effort;
      migration.priority = strategy.priority;
      migration.alternatives = strategy.alternatives;
      migration.steps = strategy.steps;
      migration.codeExamples = strategy.codeExamples;
      migration.testing = strategy.testing;
      migration.risks = strategy.risks;
      migration.benefits = strategy.benefits;
    }

    return migration;
  }

  /**
   * Find migration strategy for a feature
   */
  findMigrationStrategy(featureName, category) {
    const normalizedName = featureName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Search migration database
    for (const [key, strategy] of Object.entries(this.migrationDatabase)) {
      if (key.includes(normalizedName) || normalizedName.includes(key)) {
        return strategy;
      }
    }

    // Category-based strategies
    return this.getCategoryStrategy(category);
  }

  /**
   * Get category-based migration strategy
   */
  getCategoryStrategy(category) {
    const strategies = {
      'css': {
        complexity: 'low',
        effort: 'low',
        priority: 'medium',
        alternatives: ['Use CSS fallbacks', 'Implement progressive enhancement'],
        steps: [
          'Add fallback values for modern CSS properties',
          'Use @supports for feature detection',
          'Implement graceful degradation'
        ],
        codeExamples: {
          before: 'display: grid;',
          after: 'display: flex;\ndisplay: grid;',
          polyfill: '/* Use css-grid-polyfill */',
          fallback: '/* Flexbox fallback for older browsers */'
        },
        testing: {
          browsers: ['Chrome 57+', 'Firefox 52+', 'Safari 10.1+', 'Edge 16+'],
          tools: ['Browser DevTools', 'Can I Use', 'BrowserStack'],
          checklist: ['Test in target browsers', 'Verify fallbacks work', 'Check performance impact']
        },
        risks: ['Potential layout shifts', 'Performance impact'],
        benefits: ['Better browser support', 'Improved accessibility', 'Future-proof code']
      },
      'javascript': {
        complexity: 'medium',
        effort: 'medium',
        priority: 'high',
        alternatives: ['Use polyfills', 'Implement feature detection', 'Use transpilation'],
        steps: [
          'Add feature detection',
          'Implement polyfill if needed',
          'Add fallback implementation',
          'Update build process if necessary'
        ],
        codeExamples: {
          before: 'const data = await fetch(url);',
          after: 'if (window.fetch) {\n  const data = await fetch(url);\n} else {\n  // XMLHttpRequest fallback\n}',
          polyfill: 'import "whatwg-fetch";',
          fallback: '// XMLHttpRequest implementation'
        },
        testing: {
          browsers: ['All target browsers'],
          tools: ['Jest', 'Karma', 'Browser DevTools'],
          checklist: ['Test with and without polyfill', 'Verify error handling', 'Check bundle size impact']
        },
        risks: ['Bundle size increase', 'Runtime errors', 'Performance impact'],
        benefits: ['Universal browser support', 'Better error handling', 'Improved user experience']
      },
      'webapi': {
        complexity: 'high',
        effort: 'high',
        priority: 'high',
        alternatives: ['Use polyfills', 'Implement feature detection', 'Use alternative APIs'],
        steps: [
          'Research browser support',
          'Choose appropriate polyfill',
          'Implement feature detection',
          'Add fallback implementation',
          'Test thoroughly'
        ],
        codeExamples: {
          before: 'navigator.geolocation.getCurrentPosition(success);',
          after: 'if (navigator.geolocation) {\n  navigator.geolocation.getCurrentPosition(success);\n} else {\n  // Fallback to IP-based location\n}',
          polyfill: '// Use geolocation polyfill',
          fallback: '// IP-based location service'
        },
        testing: {
          browsers: ['All target browsers'],
          tools: ['Browser DevTools', 'Real device testing'],
          checklist: ['Test in different browsers', 'Verify fallback works', 'Check user permissions']
        },
        risks: ['Complex fallback logic', 'User permission issues', 'Performance impact'],
        benefits: ['Universal support', 'Better user experience', 'Graceful degradation']
      }
    };

    return strategies[category] || strategies['javascript'];
  }

  /**
   * Calculate migration summary
   */
  calculateMigrationSummary(migrations) {
    const totalFeatures = migrations.length;
    let totalEffort = 0;
    let totalComplexity = 0;
    let highPriorityCount = 0;

    for (const migration of migrations) {
      // Calculate effort score
      const effortScores = { 'low': 1, 'medium': 2, 'high': 3 };
      totalEffort += effortScores[migration.effort] || 1;

      // Calculate complexity score
      const complexityScores = { 'low': 1, 'medium': 2, 'high': 3 };
      totalComplexity += complexityScores[migration.complexity] || 1;

      if (migration.priority === 'high') {
        highPriorityCount++;
      }
    }

    const avgEffort = totalEffort / totalFeatures;
    const avgComplexity = totalComplexity / totalFeatures;
    const estimatedTime = this.estimateMigrationTime(avgEffort, totalFeatures);
    const riskReduction = this.calculateRiskReduction(migrations);
    const baselineImprovement = this.calculateBaselineImprovement(migrations);

    return {
      totalFeatures,
      migrationComplexity: this.getComplexityLevel(avgComplexity),
      estimatedTime,
      riskReduction,
      baselineImprovement,
      highPriorityCount
    };
  }

  /**
   * Estimate migration time
   */
  estimateMigrationTime(avgEffort, featureCount) {
    const baseTimePerFeature = {
      1: 0.5, // low effort
      2: 2,   // medium effort
      3: 4    // high effort
    };

    const timePerFeature = baseTimePerFeature[Math.round(avgEffort)] || 2;
    return Math.round(timePerFeature * featureCount * 10) / 10; // hours
  }

  /**
   * Calculate risk reduction
   */
  calculateRiskReduction(migrations) {
    let totalReduction = 0;
    for (const migration of migrations) {
      const currentRisk = 100 - (migration.currentSupport || 0);
      const targetRisk = 100 - migration.targetSupport;
      totalReduction += Math.max(0, currentRisk - targetRisk);
    }
    return Math.round(totalReduction / migrations.length);
  }

  /**
   * Calculate baseline improvement
   */
  calculateBaselineImprovement(migrations) {
    let totalImprovement = 0;
    for (const migration of migrations) {
      const improvement = migration.targetSupport - (migration.currentSupport || 0);
      totalImprovement += Math.max(0, improvement);
    }
    return Math.round(totalImprovement / migrations.length);
  }

  /**
   * Get complexity level
   */
  getComplexityLevel(avgComplexity) {
    if (avgComplexity <= 1.5) return 'low';
    if (avgComplexity <= 2.5) return 'medium';
    return 'high';
  }

  /**
   * Generate migration timeline
   */
  generateMigrationTimeline(migrations) {
    const timeline = [];
    let currentWeek = 1;

    // Group migrations by priority
    const highPriority = migrations.filter(m => m.priority === 'high');
    const mediumPriority = migrations.filter(m => m.priority === 'medium');
    const lowPriority = migrations.filter(m => m.priority === 'low');

    // High priority migrations (Week 1-2)
    if (highPriority.length > 0) {
      timeline.push({
        week: currentWeek,
        phase: 'Critical Migrations',
        features: highPriority.map(m => m.feature),
        effort: 'high',
        description: 'Migrate high-priority risky features to baseline alternatives'
      });
      currentWeek += 2;
    }

    // Medium priority migrations (Week 3-4)
    if (mediumPriority.length > 0) {
      timeline.push({
        week: currentWeek,
        phase: 'Standard Migrations',
        features: mediumPriority.map(m => m.feature),
        effort: 'medium',
        description: 'Migrate medium-priority features and add fallbacks'
      });
      currentWeek += 2;
    }

    // Low priority migrations (Week 5-6)
    if (lowPriority.length > 0) {
      timeline.push({
        week: currentWeek,
        phase: 'Enhancement Migrations',
        features: lowPriority.map(m => m.feature),
        effort: 'low',
        description: 'Migrate low-priority features and optimize'
      });
    }

    return timeline;
  }

  /**
   * Generate migration recommendations
   */
  generateMigrationRecommendations(migrationPlan) {
    const recommendations = [];

    // Priority recommendations
    if (migrationPlan.summary.highPriorityCount > 0) {
      recommendations.push({
        type: 'priority',
        title: 'Focus on High-Priority Migrations',
        message: `${migrationPlan.summary.highPriorityCount} high-priority features need immediate attention`,
        suggestion: 'Start with high-priority migrations to maximize risk reduction',
        actions: [
          'Review high-priority feature migrations first',
          'Allocate dedicated time for critical migrations',
          'Test thoroughly before deploying'
        ]
      });
    }

    // Complexity recommendations
    if (migrationPlan.summary.migrationComplexity === 'high') {
      recommendations.push({
        type: 'complexity',
        title: 'Complex Migration Detected',
        message: 'Some features require complex migration strategies',
        suggestion: 'Consider breaking down complex migrations into smaller steps',
        actions: [
          'Create detailed migration plan for complex features',
          'Consider using feature flags for gradual rollout',
          'Plan for additional testing time'
        ]
      });
    }

    // Time recommendations
    if (migrationPlan.summary.estimatedTime > 20) {
      recommendations.push({
        type: 'time',
        title: 'Significant Migration Effort Required',
        message: `Estimated ${migrationPlan.summary.estimatedTime} hours of migration work`,
        suggestion: 'Plan migration work across multiple sprints',
        actions: [
          'Break migration into phases',
          'Assign dedicated team members',
          'Create migration milestones'
        ]
      });
    }

    // Testing recommendations
    recommendations.push({
      type: 'testing',
      title: 'Comprehensive Testing Required',
      message: 'Migration changes need thorough testing',
      suggestion: 'Implement comprehensive testing strategy',
      actions: [
        'Test in all target browsers',
        'Use automated testing where possible',
        'Implement visual regression testing',
        'Test with and without polyfills'
      ]
    });

    return recommendations;
  }

  /**
   * Generate migration resources
   */
  generateMigrationResources(migrations) {
    const resources = {
      documentation: [],
      tools: [],
      polyfills: [],
      testing: []
    };

    // Collect unique resources from migrations
    for (const migration of migrations) {
      // Add polyfills
      if (migration.codeExamples.polyfill) {
        resources.polyfills.push({
          name: migration.feature,
          polyfill: migration.codeExamples.polyfill,
          documentation: `https://github.com/polyfill/${migration.feature}`
        });
      }

      // Add testing tools
      if (migration.testing.tools) {
        resources.testing.push(...migration.testing.tools);
      }
    }

    // Add general resources
    resources.documentation = [
      'MDN Web Docs - Browser Compatibility',
      'Can I Use - Feature Support Tables',
      'Baseline Web Features Guide',
      'Progressive Enhancement Best Practices'
    ];

    resources.tools = [
      'Browser DevTools',
      'BrowserStack for cross-browser testing',
      'Lighthouse for performance testing',
      'WebPageTest for performance analysis'
    ];

    // Remove duplicates
    resources.testing = [...new Set(resources.testing)];

    return resources;
  }

  /**
   * Generate migration code examples
   */
  generateCodeExamples(feature, migration) {
    return {
      before: this.generateBeforeCode(feature),
      after: this.generateAfterCode(feature, migration),
      polyfill: this.generatePolyfillCode(feature, migration),
      fallback: this.generateFallbackCode(feature, migration)
    };
  }

  /**
   * Generate before code example
   */
  generateBeforeCode(feature) {
    const examples = {
      'css-grid': '.container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n}',
      'flexbox': '.container {\n  display: flex;\n  justify-content: space-between;\n}',
      'custom-properties': ':root {\n  --primary-color: #3b82f6;\n}\n\n.button {\n  background: var(--primary-color);\n}',
      'fetch': 'const response = await fetch("/api/data");\nconst data = await response.json();',
      'promise': 'const promise = new Promise((resolve, reject) => {\n  // async operation\n});',
      'intersection-observer': 'const observer = new IntersectionObserver(callback);\nobserver.observe(element);'
    };

    return examples[feature.toLowerCase()] || `// ${feature} usage`;
  }

  /**
   * Generate after code example
   */
  generateAfterCode(feature, migration) {
    const examples = {
      'css-grid': '.container {\n  display: flex; /* Fallback */\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n}\n\n@supports (display: grid) {\n  .container {\n    display: grid;\n  }\n}',
      'custom-properties': ':root {\n  --primary-color: #3b82f6;\n}\n\n.button {\n  background: #3b82f6; /* Fallback */\n  background: var(--primary-color);\n}',
      'fetch': 'if (window.fetch) {\n  const response = await fetch("/api/data");\n  const data = await response.json();\n} else {\n  // XMLHttpRequest fallback\n  const xhr = new XMLHttpRequest();\n  xhr.open("GET", "/api/data");\n  xhr.onload = () => {\n    const data = JSON.parse(xhr.responseText);\n  };\n  xhr.send();\n}'
    };

    return examples[feature.toLowerCase()] || `// ${feature} with fallback`;
  }

  /**
   * Generate polyfill code example
   */
  generatePolyfillCode(feature, migration) {
    const polyfills = {
      'fetch': 'import "whatwg-fetch";\n// or\n<script src="https://cdn.jsdelivr.net/npm/whatwg-fetch@3.6.2/dist/fetch.umd.js"></script>',
      'promise': 'import "es6-promise/auto";\n// or\n<script src="https://cdn.jsdelivr.net/npm/es6-promise@4.2.8/dist/es6-promise.auto.min.js"></script>',
      'css-grid': 'import "css-grid-polyfill";\n// or\n<script src="https://cdn.jsdelivr.net/npm/css-grid-polyfill@1.0.2/dist/css-grid-polyfill.min.js"></script>'
    };

    return polyfills[feature.toLowerCase()] || `// Polyfill for ${feature}`;
  }

  /**
   * Generate fallback code example
   */
  generateFallbackCode(feature, migration) {
    const fallbacks = {
      'css-grid': '/* Flexbox fallback for CSS Grid */\n.container {\n  display: flex;\n  flex-wrap: wrap;\n}\n\n.container > * {\n  flex: 1 1 300px;\n}',
      'fetch': '/* XMLHttpRequest fallback for Fetch */\nfunction fetchData(url) {\n  return new Promise((resolve, reject) => {\n    const xhr = new XMLHttpRequest();\n    xhr.open("GET", url);\n    xhr.onload = () => resolve(JSON.parse(xhr.responseText));\n    xhr.onerror = reject;\n    xhr.send();\n  });\n}',
      'intersection-observer': '/* Scroll event fallback for IntersectionObserver */\nfunction observeElement(element, callback) {\n  const checkIntersection = () => {\n    const rect = element.getBoundingClientRect();\n    if (rect.top < window.innerHeight && rect.bottom > 0) {\n      callback();\n      window.removeEventListener("scroll", checkIntersection);\n    }\n  };\n  window.addEventListener("scroll", checkIntersection);\n  checkIntersection();\n}'
    };

    return fallbacks[feature.toLowerCase()] || `// Fallback implementation for ${feature}`;
  }

  /**
   * Initialize migration database
   */
  initializeMigrationDatabase() {
    return {
      'cssgrid': {
        complexity: 'low',
        effort: 'low',
        priority: 'medium',
        alternatives: ['Flexbox fallback', 'CSS Grid polyfill'],
        steps: [
          'Add Flexbox fallback before Grid declaration',
          'Use @supports for feature detection',
          'Test in older browsers'
        ],
        codeExamples: {
          before: '.container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n}',
          after: '.container {\n  display: flex;\n  flex-wrap: wrap;\n}\n\n@supports (display: grid) {\n  .container {\n    display: grid;\n    grid-template-columns: repeat(3, 1fr);\n  }\n}',
          polyfill: 'import "css-grid-polyfill";',
          fallback: '/* Flexbox fallback already implemented above */'
        },
        testing: {
          browsers: ['Chrome 57+', 'Firefox 52+', 'Safari 10.1+', 'Edge 16+'],
          tools: ['Browser DevTools', 'Can I Use'],
          checklist: ['Test layout in older browsers', 'Verify fallback works', 'Check responsive behavior']
        },
        risks: ['Layout shifts', 'Different visual appearance'],
        benefits: ['Better browser support', 'Graceful degradation', 'Future-proof']
      },
      'fetch': {
        complexity: 'medium',
        effort: 'medium',
        priority: 'high',
        alternatives: ['XMLHttpRequest fallback', 'Fetch polyfill'],
        steps: [
          'Add feature detection for fetch',
          'Implement XMLHttpRequest fallback',
          'Add error handling',
          'Test in older browsers'
        ],
        codeExamples: {
          before: 'const response = await fetch("/api/data");\nconst data = await response.json();',
          after: 'async function fetchData(url) {\n  if (window.fetch) {\n    const response = await fetch(url);\n    return response.json();\n  } else {\n    return new Promise((resolve, reject) => {\n      const xhr = new XMLHttpRequest();\n      xhr.open("GET", url);\n      xhr.onload = () => resolve(JSON.parse(xhr.responseText));\n      xhr.onerror = reject;\n      xhr.send();\n    });\n  }\n}',
          polyfill: 'import "whatwg-fetch";',
          fallback: '// XMLHttpRequest implementation already in after example'
        },
        testing: {
          browsers: ['All target browsers'],
          tools: ['Jest', 'Browser DevTools'],
          checklist: ['Test with and without fetch', 'Verify error handling', 'Check performance']
        },
        risks: ['Bundle size increase', 'Different API behavior'],
        benefits: ['Universal browser support', 'Consistent API', 'Better error handling']
      },
      'promise': {
        complexity: 'low',
        effort: 'low',
        priority: 'high',
        alternatives: ['Promise polyfill', 'Callback patterns'],
        steps: [
          'Add Promise polyfill',
          'Update build process',
          'Test in older browsers'
        ],
        codeExamples: {
          before: 'const promise = new Promise((resolve, reject) => {\n  // async operation\n});',
          after: '// Same code with polyfill loaded\nconst promise = new Promise((resolve, reject) => {\n  // async operation\n});',
          polyfill: 'import "es6-promise/auto";',
          fallback: '// Use callback pattern if polyfill not available'
        },
        testing: {
          browsers: ['All target browsers'],
          tools: ['Jest', 'Browser DevTools'],
          checklist: ['Test Promise functionality', 'Verify polyfill loads', 'Check bundle size']
        },
        risks: ['Bundle size increase', 'Polyfill conflicts'],
        benefits: ['Universal Promise support', 'Modern async/await syntax', 'Better error handling']
      }
    };
  }

  /**
   * Initialize baseline features
   */
  initializeBaselineFeatures() {
    return {
      'css': [
        'flexbox', 'css-grid', 'custom-properties', 'transforms',
        'transitions', 'animations', 'media-queries', 'calc'
      ],
      'javascript': [
        'promise', 'async-await', 'arrow-functions', 'template-literals',
        'destructuring', 'spread-operator', 'const-let', 'modules'
      ],
      'webapi': [
        'fetch', 'localStorage', 'sessionStorage', 'addEventListener',
        'querySelector', 'classList', 'dataset', 'requestAnimationFrame'
      ],
      'html': [
        'semantic-elements', 'form-validation', 'input-types',
        'video', 'audio', 'canvas', 'svg'
      ]
    };
  }

  /**
   * Generate migration report
   */
  generateMigrationReport(migrationPlan) {
    return {
      title: 'Baseline Migration Plan',
      summary: migrationPlan.summary,
      migrations: migrationPlan.migrations,
      timeline: migrationPlan.timeline,
      recommendations: migrationPlan.recommendations,
      resources: migrationPlan.resources,
      generatedAt: new Date().toISOString(),
      version: '1.0.0'
    };
  }
}

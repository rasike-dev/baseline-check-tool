/**
 * Bundle Recommendations Engine
 * Generates actionable bundle optimization recommendations based on analysis results
 */

export class BundleRecommendations {
  constructor(options = {}) {
    this.options = {
      includeCodeExamples: true,
      includeImpactLevels: true,
      includeEffortEstimates: true,
      ...options
    };
  }

  /**
   * Generate recommendations from bundle analysis
   */
  generateRecommendations(analysis) {
    const recommendations = {
      critical: this.generateCriticalRecommendations(analysis),
      high: this.generateHighPriorityRecommendations(analysis),
      medium: this.generateMediumPriorityRecommendations(analysis),
      low: this.generateLowPriorityRecommendations(analysis),
      summary: this.generateSummary(analysis)
    };

    return recommendations;
  }

  /**
   * Generate critical priority recommendations
   */
  generateCriticalRecommendations(analysis) {
    const recommendations = [];
    const criticalIssues = analysis.issues.filter(issue => issue.severity === 'high');

    if (criticalIssues.length === 0) {
      return [];
    }

    // Bundle too large
    const bundleTooLarge = criticalIssues.filter(issue => issue.type === 'bundle_too_large');
    if (bundleTooLarge.length > 0) {
      recommendations.push({
        title: 'Reduce Bundle Size',
        description: 'Bundle size exceeds recommended limits and significantly impacts performance',
        priority: 'critical',
        impact: 'high',
        effort: 'high',
        issues: bundleTooLarge.length,
        actions: [
          'Implement code splitting to create smaller chunks',
          'Remove unused dependencies and dead code',
          'Use tree shaking to eliminate unused exports',
          'Optimize and compress assets',
          'Consider lazy loading for non-critical features'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '// Large monolithic bundle\nimport { everything } from "./huge-library";',
          after: '// Code splitting with dynamic imports\nconst { specificFunction } = await import("./specific-module");'
        } : null,
        resources: [
          'https://webpack.js.org/guides/code-splitting/',
          'https://web.dev/reduce-javascript-payloads-with-code-splitting/'
        ]
      });
    }

    // Unminified bundle
    const unminifiedBundle = criticalIssues.filter(issue => issue.type === 'unminified_bundle');
    if (unminifiedBundle.length > 0) {
      recommendations.push({
        title: 'Minify Bundle for Production',
        description: 'Unminified bundles significantly increase file size and loading time',
        priority: 'critical',
        impact: 'high',
        effort: 'low',
        issues: unminifiedBundle.length,
        actions: [
          'Enable minification in build process',
          'Use tools like Terser for JavaScript minification',
          'Configure CSS minification',
          'Remove comments and whitespace',
          'Use production build configuration'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '// Unminified code\nfunction calculateTotal(items) {\n  let total = 0;\n  for (let i = 0; i < items.length; i++) {\n    total += items[i].price;\n  }\n  return total;\n}',
          after: '// Minified code\nfunction calculateTotal(items){let total=0;for(let i=0;i<items.length;i++){total+=items[i].price}return total}'
        } : null,
        resources: [
          'https://webpack.js.org/plugins/terser-webpack-plugin/',
          'https://web.dev/minify-and-compress-network-payloads/'
        ]
      });
    }

    // Bundle analysis error
    const analysisError = criticalIssues.filter(issue => issue.type === 'bundle_analysis_error');
    if (analysisError.length > 0) {
      recommendations.push({
        title: 'Fix Bundle Analysis Issues',
        description: 'Bundle analysis failed, preventing optimization recommendations',
        priority: 'critical',
        impact: 'high',
        effort: 'medium',
        issues: analysisError.length,
        actions: [
          'Check bundle file format and encoding',
          'Ensure bundle file is readable and accessible',
          'Verify build process is working correctly',
          'Check for file corruption or incomplete builds',
          'Review build configuration and dependencies'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '// Build error\nError: Cannot read bundle file',
          after: '// Fixed build process\n// Ensure proper file generation and permissions'
        } : null,
        resources: [
          'https://webpack.js.org/configuration/',
          'https://rollupjs.org/guide/en/'
        ]
      });
    }

    return recommendations;
  }

  /**
   * Generate high priority recommendations
   */
  generateHighPriorityRecommendations(analysis) {
    const recommendations = [];
    const highIssues = analysis.issues.filter(issue => issue.severity === 'high');

    // Needs code splitting
    const needsCodeSplitting = highIssues.filter(issue => issue.type === 'needs_code_splitting');
    if (needsCodeSplitting.length > 0) {
      recommendations.push({
        title: 'Implement Code Splitting',
        description: 'Large bundles should be split into smaller, loadable chunks for better performance',
        priority: 'high',
        impact: 'high',
        effort: 'high',
        issues: needsCodeSplitting.length,
        actions: [
          'Split bundles by route or feature',
          'Use dynamic imports for lazy loading',
          'Implement vendor chunk separation',
          'Create separate chunks for large dependencies',
          'Use webpack splitChunks configuration'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '// All code in one bundle\nimport { ComponentA } from "./ComponentA";\nimport { ComponentB } from "./ComponentB";',
          after: '// Code splitting with dynamic imports\nconst ComponentA = lazy(() => import("./ComponentA"));\nconst ComponentB = lazy(() => import("./ComponentB"));'
        } : null,
        resources: [
          'https://webpack.js.org/guides/code-splitting/',
          'https://reactjs.org/docs/code-splitting.html'
        ]
      });
    }

    // Uncompressed bundle
    const uncompressedBundle = highIssues.filter(issue => issue.type === 'uncompressed_bundle');
    if (uncompressedBundle.length > 0) {
      recommendations.push({
        title: 'Enable Bundle Compression',
        description: 'Compression can significantly reduce bundle size and improve loading performance',
        priority: 'high',
        impact: 'high',
        effort: 'low',
        issues: uncompressedBundle.length,
        actions: [
          'Enable gzip compression on server',
          'Configure Brotli compression for better ratios',
          'Use build tools to pre-compress assets',
          'Set proper Content-Encoding headers',
          'Test compression effectiveness'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '// No compression\nContent-Type: application/javascript',
          after: '// With compression\nContent-Type: application/javascript\nContent-Encoding: gzip'
        } : null,
        resources: [
          'https://web.dev/compression/',
          'https://developers.google.com/speed/pagespeed/insights/'
        ]
      });
    }

    return recommendations;
  }

  /**
   * Generate medium priority recommendations
   */
  generateMediumPriorityRecommendations(analysis) {
    const recommendations = [];
    const mediumIssues = analysis.issues.filter(issue => issue.severity === 'medium');

    // Too many dependencies
    const tooManyDeps = mediumIssues.filter(issue => issue.type === 'too_many_dependencies');
    if (tooManyDeps.length > 0) {
      recommendations.push({
        title: 'Reduce Dependencies',
        description: 'Too many dependencies increase bundle size and complexity',
        priority: 'medium',
        impact: 'medium',
        effort: 'high',
        issues: tooManyDeps.length,
        actions: [
          'Audit and remove unused dependencies',
          'Use tree shaking to eliminate unused code',
          'Consider lighter alternatives to heavy libraries',
          'Bundle similar functionality together',
          'Use peer dependencies where appropriate'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '// Many dependencies\nimport { func1 } from "lib1";\nimport { func2 } from "lib2";\nimport { func3 } from "lib3";',
          after: '// Consolidated dependencies\nimport { func1, func2, func3 } from "utility-lib";'
        } : null,
        resources: [
          'https://webpack.js.org/guides/tree-shaking/',
          'https://bundlephobia.com/'
        ]
      });
    }

    // Large dependencies
    const largeDeps = mediumIssues.filter(issue => issue.type === 'large_dependency');
    if (largeDeps.length > 0) {
      recommendations.push({
        title: 'Optimize Large Dependencies',
        description: 'Large dependencies significantly impact bundle size',
        priority: 'medium',
        impact: 'medium',
        effort: 'high',
        issues: largeDeps.length,
        actions: [
          'Find lighter alternatives to large libraries',
          'Use tree shaking to import only needed functions',
          'Load large dependencies dynamically',
          'Consider CDN for large libraries',
          'Split large dependencies into separate chunks'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '// Import entire library\nimport _ from "lodash";',
          after: '// Import only needed functions\nimport { debounce, throttle } from "lodash";'
        } : null,
        resources: [
          'https://bundlephobia.com/',
          'https://webpack.js.org/guides/tree-shaking/'
        ]
      });
    }

    // Duplicate dependencies
    const duplicateDeps = mediumIssues.filter(issue => issue.type === 'duplicate_dependencies');
    if (duplicateDeps.length > 0) {
      recommendations.push({
        title: 'Remove Duplicate Dependencies',
        description: 'Duplicate dependencies waste space and can cause conflicts',
        priority: 'medium',
        impact: 'medium',
        effort: 'medium',
        issues: duplicateDeps.length,
        actions: [
          'Use package manager to deduplicate dependencies',
          'Check for conflicting versions',
          'Consolidate similar packages',
          'Use yarn resolutions or npm overrides',
          'Audit dependency tree for duplicates'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '// Duplicate dependencies\n"dependencies": {\n  "lodash": "^4.17.20",\n  "lodash-es": "^4.17.20"\n}',
          after: '// Single dependency\n"dependencies": {\n  "lodash": "^4.17.20"\n}'
        } : null,
        resources: [
          'https://classic.yarnpkg.com/en/docs/cli/dedupe/',
          'https://docs.npmjs.com/cli/v7/commands/npm-audit'
        ]
      });
    }

    // No dynamic imports
    const noDynamicImports = mediumIssues.filter(issue => issue.type === 'no_dynamic_imports');
    if (noDynamicImports.length > 0) {
      recommendations.push({
        title: 'Add Dynamic Imports',
        description: 'Dynamic imports can improve initial loading performance',
        priority: 'medium',
        impact: 'medium',
        effort: 'medium',
        issues: noDynamicImports.length,
        actions: [
          'Identify non-critical code for lazy loading',
          'Use dynamic imports for route-based splitting',
          'Load heavy libraries on demand',
          'Implement progressive loading',
          'Use React.lazy() or similar patterns'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '// Static import\nimport { HeavyComponent } from "./HeavyComponent";',
          after: '// Dynamic import\nconst HeavyComponent = lazy(() => import("./HeavyComponent"));'
        } : null,
        resources: [
          'https://webpack.js.org/guides/code-splitting/',
          'https://reactjs.org/docs/code-splitting.html'
        ]
      });
    }

    // Source maps in production
    const sourceMapsInProd = mediumIssues.filter(issue => issue.type === 'source_maps_in_production');
    if (sourceMapsInProd.length > 0) {
      recommendations.push({
        title: 'Remove Source Maps from Production',
        description: 'Source maps in production increase bundle size unnecessarily',
        priority: 'medium',
        impact: 'medium',
        effort: 'low',
        issues: sourceMapsInProd.length,
        actions: [
          'Configure build to exclude source maps in production',
          'Use separate source map files',
          'Set up proper build environments',
          'Configure webpack devtool for production',
          'Test production builds without source maps'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '// Production with source maps\n//# sourceMappingURL=bundle.js.map',
          after: '// Production without source maps\n// Source maps excluded in production build'
        } : null,
        resources: [
          'https://webpack.js.org/configuration/devtool/',
          'https://web.dev/source-maps/'
        ]
      });
    }

    return recommendations;
  }

  /**
   * Generate low priority recommendations
   */
  generateLowPriorityRecommendations(analysis) {
    const recommendations = [];
    const lowIssues = analysis.issues.filter(issue => issue.severity === 'low');

    // Unused exports
    const unusedExports = lowIssues.filter(issue => issue.type === 'unused_exports');
    if (unusedExports.length > 0) {
      recommendations.push({
        title: 'Remove Unused Exports',
        description: 'Unused exports can be tree-shaken to reduce bundle size',
        priority: 'low',
        impact: 'low',
        effort: 'medium',
        issues: unusedExports.length,
        actions: [
          'Identify and remove unused exports',
          'Use tree shaking tools to detect unused code',
          'Configure build tools for better tree shaking',
          'Use ES modules for better tree shaking',
          'Audit export usage across the codebase'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '// Unused exports\nexport const unusedFunction = () => {};\nexport const usedFunction = () => {};',
          after: '// Only used exports\nexport const usedFunction = () => {};'
        } : null,
        resources: [
          'https://webpack.js.org/guides/tree-shaking/',
          'https://rollupjs.org/guide/en/#tree-shaking'
        ]
      });
    }

    // Side effects detected
    const sideEffects = lowIssues.filter(issue => issue.type === 'side_effects_detected');
    if (sideEffects.length > 0) {
      recommendations.push({
        title: 'Minimize Side Effects',
        description: 'Side effects can prevent effective tree shaking',
        priority: 'low',
        impact: 'low',
        effort: 'medium',
        issues: sideEffects.length,
        actions: [
          'Move side effects to separate modules',
          'Use pure functions where possible',
          'Mark modules as side-effect free',
          'Configure webpack sideEffects option',
          'Isolate side effects from pure code'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '// Side effects in module\nconsole.log("Module loaded");\nexport const pureFunction = () => {};',
          after: '// Pure module\nexport const pureFunction = () => {};\n// Side effects in separate module'
        } : null,
        resources: [
          'https://webpack.js.org/guides/tree-shaking/#mark-the-file-as-side-effect-free',
          'https://rollupjs.org/guide/en/#tree-shaking'
        ]
      });
    }

    // No cache busting
    const noCacheBusting = lowIssues.filter(issue => issue.type === 'no_cache_busting');
    if (noCacheBusting.length > 0) {
      recommendations.push({
        title: 'Add Cache Busting',
        description: 'Cache busting ensures users get updated bundles',
        priority: 'low',
        impact: 'low',
        effort: 'low',
        issues: noCacheBusting.length,
        actions: [
          'Include hash in bundle filename',
          'Use version numbers in filenames',
          'Configure build tools for automatic hashing',
          'Set up proper cache headers',
          'Test cache busting effectiveness'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '// No cache busting\nbundle.js',
          after: '// With cache busting\nbundle.a1b2c3d4.js'
        } : null,
        resources: [
          'https://webpack.js.org/guides/caching/',
          'https://web.dev/http-cache/'
        ]
      });
    }

    // Caching headers needed
    const cachingHeaders = lowIssues.filter(issue => issue.type === 'caching_headers_needed');
    if (cachingHeaders.length > 0) {
      recommendations.push({
        title: 'Configure Caching Headers',
        description: 'Proper caching headers improve performance and reduce server load',
        priority: 'low',
        impact: 'low',
        effort: 'low',
        issues: cachingHeaders.length,
        actions: [
          'Set Cache-Control headers for static assets',
          'Use long-term caching for hashed files',
          'Configure ETags for cache validation',
          'Set up proper cache policies',
          'Test caching behavior'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '// No caching headers\nContent-Type: application/javascript',
          after: '// With caching headers\nContent-Type: application/javascript\nCache-Control: public, max-age=31536000'
        } : null,
        resources: [
          'https://web.dev/http-cache/',
          'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control'
        ]
      });
    }

    return recommendations;
  }

  /**
   * Generate summary
   */
  generateSummary(analysis) {
    const totalIssues = analysis.issues.length;
    const criticalIssues = analysis.issues.filter(i => i.severity === 'high').length;
    const mediumIssues = analysis.issues.filter(i => i.severity === 'medium').length;
    const lowIssues = analysis.issues.filter(i => i.severity === 'low').length;

    let priority = 'low';
    if (criticalIssues > 0) {
      priority = 'critical';
    } else if (mediumIssues > 5) {
      priority = 'high';
    } else if (mediumIssues > 0 || lowIssues > 10) {
      priority = 'medium';
    }

    return {
      totalIssues,
      criticalIssues,
      mediumIssues,
      lowIssues,
      priority,
      bundleScore: analysis.bundleScore,
      bundleLevel: analysis.bundleLevel,
      estimatedEffort: this.calculateEffort(analysis),
      nextSteps: this.getNextSteps(analysis)
    };
  }

  /**
   * Calculate estimated effort
   */
  calculateEffort(analysis) {
    const criticalIssues = analysis.issues.filter(i => i.severity === 'high').length;
    const mediumIssues = analysis.issues.filter(i => i.severity === 'medium').length;
    const lowIssues = analysis.issues.filter(i => i.severity === 'low').length;

    const effort = (criticalIssues * 2) + (mediumIssues * 1.5) + (lowIssues * 0.5);
    
    if (effort <= 5) return 'Low (1-2 days)';
    if (effort <= 15) return 'Medium (3-5 days)';
    if (effort <= 30) return 'High (1-2 weeks)';
    return 'Very High (2+ weeks)';
  }

  /**
   * Get next steps
   */
  getNextSteps(analysis) {
    const steps = [];
    
    if (analysis.issues.filter(i => i.severity === 'high').length > 0) {
      steps.push('Fix critical bundle issues first');
    }
    
    if (analysis.issues.filter(i => i.type === 'bundle_too_large').length > 0) {
      steps.push('Implement code splitting to reduce bundle size');
    }
    
    if (analysis.issues.filter(i => i.type === 'unminified_bundle').length > 0) {
      steps.push('Enable minification in build process');
    }
    
    if (analysis.issues.filter(i => i.type === 'uncompressed_bundle').length > 0) {
      steps.push('Enable compression on server');
    }
    
    steps.push('Set up bundle analysis in CI/CD pipeline');
    steps.push('Monitor bundle size over time');
    steps.push('Regular bundle optimization reviews');
    
    return steps;
  }
}

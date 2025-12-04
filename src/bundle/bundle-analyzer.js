/**
 * Bundle Analyzer
 * Comprehensive bundle analysis focusing on JavaScript/CSS optimization, dependency analysis, and performance
 */

import fs from 'node:fs';
import path from 'node:path';

export class BundleAnalyzer {
  constructor(options = {}) {
    this.options = {
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
      ...options
    };
    
    this.issues = [];
    this.bundleScore = 100;
    this.bundleLevel = 'Good';
  }

  /**
   * Analyze bundle for optimization issues
   */
  async analyzeBundle(bundlePath, projectRoot = '') {
    const issues = [];
    
    try {
      // Check if bundle exists
      if (!fs.existsSync(bundlePath)) {
        issues.push({
          type: 'bundle_not_found',
          severity: 'high',
          category: 'bundle_analysis',
          title: 'Bundle file not found',
          description: 'Specified bundle file does not exist',
          file: bundlePath,
          line: 1,
          code: 'Bundle file',
          suggestion: 'Ensure bundle file exists and path is correct',
          fix: 'Check file path and build process',
          impact: 'High',
          effort: 'Low'
        });
        return this.generateAnalysis(issues);
      }

      const stats = await fs.promises.stat(bundlePath);
      const content = await fs.promises.readFile(bundlePath, 'utf8');
      const fileSize = stats.size;
      const fileName = path.basename(bundlePath);
      const fileExt = path.extname(bundlePath).toLowerCase();

      // Size Analysis
      if (this.options.enableSizeAnalysis) {
        issues.push(...this.analyzeBundleSize(bundlePath, fileSize, fileName));
      }

      // Dependency Analysis
      if (this.options.enableDependencyAnalysis) {
        issues.push(...this.analyzeDependencies(bundlePath, content, projectRoot));
      }

      // Code Splitting Analysis
      if (this.options.enableCodeSplitting) {
        issues.push(...this.analyzeCodeSplitting(bundlePath, content, fileSize));
      }

      // Tree Shaking Analysis
      if (this.options.enableTreeShaking) {
        issues.push(...this.analyzeTreeShaking(bundlePath, content));
      }

      // Compression Analysis
      if (this.options.enableCompression) {
        issues.push(...this.analyzeCompression(bundlePath, content, fileSize));
      }

      // Caching Analysis
      if (this.options.enableCaching) {
        issues.push(...this.analyzeCaching(bundlePath, content, fileName));
      }

      // Performance Analysis
      if (this.options.enablePerformance) {
        issues.push(...this.analyzePerformance(bundlePath, content, fileSize));
      }

      // Security Analysis
      if (this.options.enableSecurity) {
        issues.push(...this.analyzeSecurity(bundlePath, content));
      }

      // Modernization Analysis
      if (this.options.enableModernization) {
        issues.push(...this.analyzeModernization(bundlePath, content));
      }

      // Optimization Analysis
      if (this.options.enableOptimization) {
        issues.push(...this.analyzeOptimization(bundlePath, content, fileSize));
      }

    } catch (error) {
      issues.push({
        type: 'bundle_analysis_error',
        severity: 'high',
        category: 'bundle_analysis',
        title: 'Bundle analysis failed',
        description: `Error analyzing bundle: ${error.message}`,
        file: bundlePath,
        line: 1,
        code: 'Bundle analysis',
        suggestion: 'Check bundle file format and accessibility',
        fix: 'Ensure bundle file is readable and properly formatted',
        impact: 'High',
        effort: 'Medium'
      });
    }

    this.issues = issues;
    this.calculateBundleScore();
    
    return this.generateAnalysis(issues);
  }

  /**
   * Analyze bundle size
   */
  analyzeBundleSize(bundlePath, fileSize, fileName) {
    const issues = [];
    const maxSize = this.options.maxBundleSize;
    const sizeKB = Math.round(fileSize / 1024);

    // Check if bundle is too large
    if (fileSize > maxSize) {
      issues.push({
        type: 'bundle_too_large',
        severity: 'high',
        category: 'size_analysis',
        title: 'Bundle size too large',
        description: `Bundle size (${sizeKB}KB) exceeds recommended limit (${Math.round(maxSize / 1024)}KB)`,
        file: bundlePath,
        line: 1,
        code: `Size: ${sizeKB}KB`,
        suggestion: 'Reduce bundle size through code splitting and optimization',
        fix: 'Implement code splitting, remove unused code, optimize dependencies',
        impact: 'High',
        effort: 'High'
      });
    } else if (fileSize > maxSize * 0.8) {
      issues.push({
        type: 'bundle_large',
        severity: 'medium',
        category: 'size_analysis',
        title: 'Bundle size approaching limit',
        description: `Bundle size (${sizeKB}KB) is close to recommended limit`,
        file: bundlePath,
        line: 1,
        code: `Size: ${sizeKB}KB`,
        suggestion: 'Consider optimizing bundle size',
        fix: 'Review dependencies and implement optimizations',
        impact: 'Medium',
        effort: 'Medium'
      });
    }

    // Check for minification
    if (this.isUnminified(bundlePath, fileName)) {
      issues.push({
        type: 'unminified_bundle',
        severity: 'high',
        category: 'size_analysis',
        title: 'Bundle not minified',
        description: 'Bundle appears to be unminified, significantly increasing file size',
        file: bundlePath,
        line: 1,
        code: 'Unminified bundle',
        suggestion: 'Minify bundle for production',
        fix: 'Use build tools to minify JavaScript/CSS',
        impact: 'High',
        effort: 'Low'
      });
    }

    // Check for source maps in production
    if (this.hasSourceMaps(bundlePath, fileName)) {
      issues.push({
        type: 'source_maps_in_production',
        severity: 'medium',
        category: 'size_analysis',
        title: 'Source maps in production bundle',
        description: 'Source maps detected in production bundle, increasing file size',
        file: bundlePath,
        line: 1,
        code: 'Source maps detected',
        suggestion: 'Remove source maps from production builds',
        fix: 'Configure build to exclude source maps in production',
        impact: 'Medium',
        effort: 'Low'
      });
    }

    return issues;
  }

  /**
   * Analyze dependencies
   */
  analyzeDependencies(bundlePath, content, projectRoot) {
    const issues = [];
    
    // Count dependencies (rough estimation)
    const dependencyCount = this.countDependencies(content);
    
    if (dependencyCount > this.options.maxDependencies) {
      issues.push({
        type: 'too_many_dependencies',
        severity: 'medium',
        category: 'dependency_analysis',
        title: 'Too many dependencies',
        description: `Bundle contains ${dependencyCount} dependencies, exceeding recommended limit of ${this.options.maxDependencies}`,
        file: bundlePath,
        line: 1,
        code: `Dependencies: ${dependencyCount}`,
        suggestion: 'Reduce dependencies and use tree shaking',
        fix: 'Remove unused dependencies, use tree shaking, consider alternatives',
        impact: 'Medium',
        effort: 'High'
      });
    }

    // Check for duplicate dependencies
    const duplicateDeps = this.detectDuplicateDependencies(content);
    if (duplicateDeps.length > 0) {
      issues.push({
        type: 'duplicate_dependencies',
        severity: 'medium',
        category: 'dependency_analysis',
        title: 'Duplicate dependencies detected',
        description: `Found ${duplicateDeps.length} duplicate dependencies: ${duplicateDeps.map(d => d.name).join(', ')}`,
        file: bundlePath,
        line: 1,
        code: `Duplicates: ${duplicateDeps.map(d => `${d.name}(${d.count})`).join(', ')}`,
        suggestion: 'Remove duplicate dependencies to reduce bundle size',
        fix: 'Use webpack resolve.alias or npm dedupe to remove duplicates',
        impact: 'Medium',
        effort: 'Low'
      });
    }

    // Check for large dependencies
    const largeDependencies = this.findLargeDependencies(content);
    largeDependencies.forEach(dep => {
      issues.push({
        type: 'large_dependency',
        severity: 'medium',
        category: 'dependency_analysis',
        title: 'Large dependency detected',
        description: `Dependency '${dep.name}' appears to be large and may impact bundle size`,
        file: bundlePath,
        line: 1,
        code: `Dependency: ${dep.name}`,
        suggestion: 'Consider alternatives or code splitting for large dependencies',
        fix: 'Replace with lighter alternatives or load dynamically',
        impact: 'Medium',
        effort: 'High'
      });
    });

    // Check for duplicate dependencies (already declared above)
    if (duplicateDeps.length > 0) {
      issues.push({
        type: 'duplicate_dependencies',
        severity: 'medium',
        category: 'dependency_analysis',
        title: 'Duplicate dependencies detected',
        description: `Found ${duplicates.length} potential duplicate dependencies`,
        file: bundlePath,
        line: 1,
        code: `Duplicates: ${duplicates.join(', ')}`,
        suggestion: 'Remove duplicate dependencies to reduce bundle size',
        fix: 'Use package manager to deduplicate dependencies',
        impact: 'Medium',
        effort: 'Medium'
      });
    }

    return issues;
  }

  /**
   * Analyze code splitting
   */
  analyzeCodeSplitting(bundlePath, content, fileSize) {
    const issues = [];
    
    // Check if bundle is suitable for code splitting
    if (fileSize > this.options.maxChunkSize) {
      issues.push({
        type: 'needs_code_splitting',
        severity: 'high',
        category: 'code_splitting',
        title: 'Bundle needs code splitting',
        description: 'Large bundle should be split into smaller chunks for better performance',
        file: bundlePath,
        line: 1,
        code: `Size: ${Math.round(fileSize / 1024)}KB`,
        suggestion: 'Implement code splitting to create smaller, loadable chunks',
        fix: 'Use dynamic imports, route-based splitting, or component-based splitting',
        impact: 'High',
        effort: 'High'
      });
    }

    // Check for dynamic imports
    const dynamicImports = this.findDynamicImports(content);
    if (dynamicImports.length === 0 && fileSize > this.options.maxChunkSize * 0.5) {
      issues.push({
        type: 'no_dynamic_imports',
        severity: 'medium',
        category: 'code_splitting',
        title: 'No dynamic imports found',
        description: 'Bundle could benefit from dynamic imports for better loading performance',
        file: bundlePath,
        line: 1,
        code: 'No dynamic imports',
        suggestion: 'Consider using dynamic imports for non-critical code',
        fix: 'Use import() syntax for lazy loading modules',
        impact: 'Medium',
        effort: 'Medium'
      });
    }

    return issues;
  }

  /**
   * Analyze tree shaking
   */
  analyzeTreeShaking(bundlePath, content) {
    const issues = [];
    
    // Check for unused exports (rough detection)
    const unusedExports = this.findUnusedExports(content);
    if (unusedExports.length > 0) {
      issues.push({
        type: 'unused_exports',
        severity: 'low',
        category: 'tree_shaking',
        title: 'Potential unused exports',
        description: `Found ${unusedExports.length} potentially unused exports that could be tree-shaken`,
        file: bundlePath,
        line: 1,
        code: `Unused: ${unusedExports.slice(0, 5).join(', ')}`,
        suggestion: 'Remove unused exports to reduce bundle size',
        fix: 'Use tree shaking tools or manually remove unused exports',
        impact: 'Low',
        effort: 'Medium'
      });
    }

    // Check for side effects
    const sideEffects = this.findSideEffects(content);
    if (sideEffects.length > 0) {
      issues.push({
        type: 'side_effects_detected',
        severity: 'low',
        category: 'tree_shaking',
        title: 'Side effects detected',
        description: 'Bundle contains side effects that may prevent tree shaking',
        file: bundlePath,
        line: 1,
        code: 'Side effects present',
        suggestion: 'Minimize side effects for better tree shaking',
        fix: 'Move side effects to separate modules or use pure functions',
        impact: 'Low',
        effort: 'Medium'
      });
    }

    return issues;
  }

  /**
   * Analyze compression
   */
  analyzeCompression(bundlePath, content, fileSize) {
    const issues = [];
    
    // Check if bundle is compressed
    if (!this.isCompressed(bundlePath)) {
      issues.push({
        type: 'uncompressed_bundle',
        severity: 'high',
        category: 'compression',
        title: 'Bundle not compressed',
        description: 'Bundle should be compressed (gzip/brotli) for better performance',
        file: bundlePath,
        line: 1,
        code: 'Uncompressed bundle',
        suggestion: 'Enable compression for production bundles',
        fix: 'Configure server to compress bundles or use build tools',
        impact: 'High',
        effort: 'Low'
      });
    }

    // Check compression ratio
    const compressionRatio = this.calculateCompressionRatio(content);
    if (compressionRatio < 0.3) {
      issues.push({
        type: 'poor_compression_ratio',
        severity: 'medium',
        category: 'compression',
        title: 'Poor compression ratio',
        description: `Bundle has poor compression ratio (${Math.round(compressionRatio * 100)}%)`,
        file: bundlePath,
        line: 1,
        code: `Ratio: ${Math.round(compressionRatio * 100)}%`,
        suggestion: 'Optimize bundle for better compression',
        fix: 'Use shorter variable names, remove whitespace, optimize code structure',
        impact: 'Medium',
        effort: 'Medium'
      });
    }

    return issues;
  }

  /**
   * Analyze caching
   */
  analyzeCaching(bundlePath, content, fileName) {
    const issues = [];
    
    // Check for cache busting
    if (!this.hasCacheBusting(fileName)) {
      issues.push({
        type: 'no_cache_busting',
        severity: 'medium',
        category: 'caching',
        title: 'No cache busting strategy',
        description: 'Bundle filename does not include cache busting (hash/version)',
        file: bundlePath,
        line: 1,
        code: `Filename: ${fileName}`,
        suggestion: 'Add cache busting to bundle filename',
        fix: 'Include hash or version in bundle filename',
        impact: 'Medium',
        effort: 'Low'
      });
    }

    // Check for long-term caching headers
    issues.push({
      type: 'caching_headers_needed',
      severity: 'low',
      category: 'caching',
      title: 'Caching headers needed',
      description: 'Ensure proper caching headers are set for bundle files',
      file: bundlePath,
      line: 1,
      code: 'Caching configuration',
      suggestion: 'Configure appropriate caching headers',
      fix: 'Set Cache-Control headers for static assets',
      impact: 'Low',
      effort: 'Low'
    });

    return issues;
  }

  /**
   * Analyze performance
   */
  analyzePerformance(bundlePath, content, fileSize) {
    const issues = [];
    
    // Check for performance anti-patterns
    const antiPatterns = this.findPerformanceAntiPatterns(content);
    antiPatterns.forEach(pattern => {
      issues.push({
        type: 'performance_anti_pattern',
        severity: pattern.severity,
        category: 'performance',
        title: pattern.title,
        description: pattern.description,
        file: bundlePath,
        line: 1,
        code: pattern.code,
        suggestion: pattern.suggestion,
        fix: pattern.fix,
        impact: pattern.impact,
        effort: pattern.effort
      });
    });

    // Check for synchronous operations
    const syncOps = this.findSynchronousOperations(content);
    if (syncOps.length > 0) {
      issues.push({
        type: 'synchronous_operations',
        severity: 'medium',
        category: 'performance',
        title: 'Synchronous operations detected',
        description: `Found ${syncOps.length} synchronous operations that may block the main thread`,
        file: bundlePath,
        line: 1,
        code: `Sync ops: ${syncOps.slice(0, 3).join(', ')}`,
        suggestion: 'Use asynchronous alternatives where possible',
        fix: 'Replace sync operations with async alternatives',
        impact: 'Medium',
        effort: 'Medium'
      });
    }

    return issues;
  }

  /**
   * Analyze security
   */
  analyzeSecurity(bundlePath, content) {
    const issues = [];
    
    // Check for security vulnerabilities
    const vulnerabilities = this.findSecurityVulnerabilities(content);
    vulnerabilities.forEach(vuln => {
      issues.push({
        type: 'security_vulnerability',
        severity: vuln.severity,
        category: 'security',
        title: vuln.title,
        description: vuln.description,
        file: bundlePath,
        line: 1,
        code: vuln.code,
        suggestion: vuln.suggestion,
        fix: vuln.fix,
        impact: vuln.impact,
        effort: vuln.effort
      });
    });

    // Check for exposed secrets
    const secrets = this.findExposedSecrets(content);
    if (secrets.length > 0) {
      issues.push({
        type: 'exposed_secrets',
        severity: 'high',
        category: 'security',
        title: 'Exposed secrets detected',
        description: `Found ${secrets.length} potentially exposed secrets in bundle`,
        file: bundlePath,
        line: 1,
        code: 'Secrets detected',
        suggestion: 'Remove secrets from client-side code',
        fix: 'Move secrets to server-side or use environment variables',
        impact: 'High',
        effort: 'High'
      });
    }

    return issues;
  }

  /**
   * Analyze modernization
   */
  analyzeModernization(bundlePath, content) {
    const issues = [];
    
    // Check for outdated patterns
    const outdatedPatterns = this.findOutdatedPatterns(content);
    outdatedPatterns.forEach(pattern => {
      issues.push({
        type: 'outdated_pattern',
        severity: pattern.severity,
        category: 'modernization',
        title: pattern.title,
        description: pattern.description,
        file: bundlePath,
        line: 1,
        code: pattern.code,
        suggestion: pattern.suggestion,
        fix: pattern.fix,
        impact: pattern.impact,
        effort: pattern.effort
      });
    });

    // Check for modern alternatives
    const modernAlternatives = this.findModernAlternatives(content);
    if (modernAlternatives.length > 0) {
      issues.push({
        type: 'modern_alternatives_available',
        severity: 'low',
        category: 'modernization',
        title: 'Modern alternatives available',
        description: `Found ${modernAlternatives.length} opportunities to use modern alternatives`,
        file: bundlePath,
        line: 1,
        code: `Alternatives: ${modernAlternatives.slice(0, 3).join(', ')}`,
        suggestion: 'Consider using modern alternatives for better performance',
        fix: 'Replace with modern APIs and patterns',
        impact: 'Low',
        effort: 'Medium'
      });
    }

    return issues;
  }

  /**
   * Analyze optimization opportunities
   */
  analyzeOptimization(bundlePath, content, fileSize) {
    const issues = [];
    
    // Check for optimization opportunities
    const optimizations = this.findOptimizationOpportunities(content, fileSize);
    optimizations.forEach(opt => {
      issues.push({
        type: 'optimization_opportunity',
        severity: opt.severity,
        category: 'optimization',
        title: opt.title,
        description: opt.description,
        file: bundlePath,
        line: 1,
        code: opt.code,
        suggestion: opt.suggestion,
        fix: opt.fix,
        impact: opt.impact,
        effort: opt.effort
      });
    });

    return issues;
  }

  /**
   * Helper methods
   */
  isUnminified(bundlePath, fileName) {
    // Check if file appears to be minified
    const content = fs.readFileSync(bundlePath, 'utf8');
    const lines = content.split('\n');
    const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
    return avgLineLength < 100 && content.includes('  ') && content.includes('\n');
  }

  hasSourceMaps(bundlePath, fileName) {
    const content = fs.readFileSync(bundlePath, 'utf8');
    return content.includes('sourceMappingURL') || content.includes('//# sourceMappingURL');
  }

  countDependencies(content) {
    // Rough estimation of dependencies
    const requireMatches = content.match(/require\(['"][^'"]+['"]\)/g) || [];
    const importMatches = content.match(/import\s+.*\s+from\s+['"][^'"]+['"]/g) || [];
    return requireMatches.length + importMatches.length;
  }

  /**
   * Detect duplicate dependencies
   */
  detectDuplicateDependencies(content) {
    const deps = new Map();
    const requirePattern = /require\(['"]([^'"]+)['"]\)/g;
    const importPattern = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;
    
    let match;
    while ((match = requirePattern.exec(content)) !== null) {
      const dep = match[1];
      if (!dep.startsWith('.') && !dep.startsWith('/')) {
        deps.set(dep, (deps.get(dep) || 0) + 1);
      }
    }
    
    while ((match = importPattern.exec(content)) !== null) {
      const dep = match[1];
      if (!dep.startsWith('.') && !dep.startsWith('/')) {
        deps.set(dep, (deps.get(dep) || 0) + 1);
      }
    }
    
    return Array.from(deps.entries())
      .filter(([name, count]) => count > 1)
      .map(([name, count]) => ({ name, count }));
  }

  findLargeDependencies(content) {
    // Look for common large dependencies
    const largeDeps = [
      'lodash', 'moment', 'jquery', 'react-dom', 'vue', 'angular',
      'bootstrap', 'material-ui', 'antd', 'semantic-ui'
    ];
    
    return largeDeps
      .filter(dep => content.includes(dep))
      .map(dep => ({ name: dep, size: 'large' }));
  }

  findDuplicateDependencies(content) {
    // Look for potential duplicates
    const deps = content.match(/['"]([^'"]*node_modules[^'"]*)['"]/g) || [];
    const depNames = deps.map(dep => dep.replace(/['"]/g, '').split('/').pop());
    const duplicates = depNames.filter((name, index) => depNames.indexOf(name) !== index);
    return [...new Set(duplicates)];
  }

  findDynamicImports(content) {
    return content.match(/import\s*\([^)]+\)/g) || [];
  }

  findUnusedExports(content) {
    // Look for export statements that might be unused
    const exports = content.match(/export\s+(?:const|let|var|function|class)\s+(\w+)/g) || [];
    return exports.map(exp => exp.match(/(\w+)/)[1]);
  }

  findSideEffects(content) {
    // Look for side effects
    const sideEffects = [
      'console.log', 'console.warn', 'console.error',
      'document.write', 'eval(', 'Function('
    ];
    
    return sideEffects.filter(effect => content.includes(effect));
  }

  isCompressed(bundlePath) {
    // Check if file has compression indicators
    const fileName = path.basename(bundlePath);
    return fileName.includes('.gz') || fileName.includes('.br') || fileName.includes('.min');
  }

  calculateCompressionRatio(content) {
    // Rough compression ratio estimation
    const originalSize = content.length;
    const compressedSize = content.replace(/\s+/g, ' ').length;
    return compressedSize / originalSize;
  }

  hasCacheBusting(fileName) {
    // Check if filename includes hash or version
    return /[a-f0-9]{8,}/.test(fileName) || /\d+\.\d+\.\d+/.test(fileName);
  }

  findPerformanceAntiPatterns(content) {
    const patterns = [];
    
    // Check for blocking operations
    if (content.includes('document.write')) {
      patterns.push({
        severity: 'high',
        title: 'Document.write usage',
        description: 'document.write blocks rendering and should be avoided',
        code: 'document.write',
        suggestion: 'Use DOM manipulation instead',
        fix: 'Replace with document.createElement and appendChild',
        impact: 'High',
        effort: 'Medium'
      });
    }
    
    // Check for synchronous XHR
    if (content.includes('XMLHttpRequest') && content.includes('false')) {
      patterns.push({
        severity: 'medium',
        title: 'Synchronous XHR',
        description: 'Synchronous XMLHttpRequest blocks the main thread',
        code: 'XMLHttpRequest',
        suggestion: 'Use asynchronous XHR or fetch API',
        fix: 'Replace with async XHR or fetch()',
        impact: 'Medium',
        effort: 'Low'
      });
    }
    
    return patterns;
  }

  findSynchronousOperations(content) {
    const syncOps = [
      'fs.readFileSync', 'fs.writeFileSync', 'fs.existsSync',
      'JSON.parse', 'JSON.stringify', 'eval('
    ];
    
    return syncOps.filter(op => content.includes(op));
  }

  findSecurityVulnerabilities(content) {
    const vulnerabilities = [];
    
    // Check for eval usage
    if (content.includes('eval(')) {
      vulnerabilities.push({
        severity: 'high',
        title: 'Eval usage detected',
        description: 'eval() can execute arbitrary code and is a security risk',
        code: 'eval(',
        suggestion: 'Avoid using eval()',
        fix: 'Use safer alternatives like JSON.parse or Function constructor',
        impact: 'High',
        effort: 'Medium'
      });
    }
    
    // Check for innerHTML with user input
    if (content.includes('innerHTML') && content.includes('+')) {
      vulnerabilities.push({
        severity: 'medium',
        title: 'Potential XSS vulnerability',
        description: 'innerHTML with string concatenation may lead to XSS',
        code: 'innerHTML',
        suggestion: 'Use textContent or sanitize input',
        fix: 'Use textContent or sanitize HTML input',
        impact: 'Medium',
        effort: 'Medium'
      });
    }
    
    return vulnerabilities;
  }

  findExposedSecrets(content) {
    const secretPatterns = [
      /api[_-]?key['"]?\s*[:=]\s*['"][^'"]{10,}['"]/gi,
      /secret['"]?\s*[:=]\s*['"][^'"]{10,}['"]/gi,
      /password['"]?\s*[:=]\s*['"][^'"]{6,}['"]/gi,
      /token['"]?\s*[:=]\s*['"][^'"]{10,}['"]/gi
    ];
    
    const secrets = [];
    secretPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        secrets.push(...matches);
      }
    });
    
    return secrets;
  }

  findOutdatedPatterns(content) {
    const patterns = [];
    
    // Check for var usage
    if (content.includes('var ')) {
      patterns.push({
        severity: 'low',
        title: 'Var usage detected',
        description: 'var is outdated, use let or const instead',
        code: 'var ',
        suggestion: 'Replace var with let or const',
        fix: 'Use let for reassignable variables, const for constants',
        impact: 'Low',
        effort: 'Low'
      });
    }
    
    // Check for function declarations in blocks
    if (content.match(/if\s*\([^)]+\)\s*{\s*function/)) {
      patterns.push({
        severity: 'low',
        title: 'Function declaration in block',
        description: 'Function declarations in blocks have inconsistent behavior',
        code: 'function in block',
        suggestion: 'Use function expressions or move outside block',
        fix: 'Use const func = () => {} or move function outside',
        impact: 'Low',
        effort: 'Low'
      });
    }
    
    return patterns;
  }

  findModernAlternatives(content) {
    const alternatives = [];
    
    // Check for jQuery usage
    if (content.includes('$(') || content.includes('jQuery')) {
      alternatives.push('jQuery -> Vanilla JS or modern frameworks');
    }
    
    // Check for callback patterns
    if (content.includes('callback(') && !content.includes('Promise')) {
      alternatives.push('Callbacks -> Promises or async/await');
    }
    
    return alternatives;
  }

  findOptimizationOpportunities(content, fileSize) {
    const opportunities = [];
    
    // Check for repeated code
    const lines = content.split('\n');
    const lineCounts = {};
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.length > 20) {
        lineCounts[trimmed] = (lineCounts[trimmed] || 0) + 1;
      }
    });
    
    const repeatedLines = Object.entries(lineCounts).filter(([, count]) => count > 3);
    if (repeatedLines.length > 0) {
      opportunities.push({
        severity: 'medium',
        title: 'Repeated code detected',
        description: `Found ${repeatedLines.length} lines of repeated code`,
        code: 'Repeated code',
        suggestion: 'Extract repeated code into functions',
        fix: 'Create reusable functions for repeated code',
        impact: 'Medium',
        effort: 'Medium'
      });
    }
    
    return opportunities;
  }

  /**
   * Calculate bundle score
   */
  calculateBundleScore() {
    let score = 100;
    
    this.issues.forEach(issue => {
      switch (issue.severity) {
        case 'high':
          score -= 20;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });
    
    this.bundleScore = Math.max(0, score);
    
    // Determine bundle level
    if (this.bundleScore >= 90) {
      this.bundleLevel = 'Excellent';
    } else if (this.bundleScore >= 75) {
      this.bundleLevel = 'Good';
    } else if (this.bundleScore >= 60) {
      this.bundleLevel = 'Fair';
    } else if (this.bundleScore >= 40) {
      this.bundleLevel = 'Poor';
    } else {
      this.bundleLevel = 'Critical';
    }
  }

  /**
   * Generate analysis results
   */
  generateAnalysis(issues) {
    const summary = {
      totalIssues: issues.length,
      bySeverity: {
        high: issues.filter(i => i.severity === 'high').length,
        medium: issues.filter(i => i.severity === 'medium').length,
        low: issues.filter(i => i.severity === 'low').length
      },
      byCategory: {},
      bundleScore: this.bundleScore,
      bundleLevel: this.bundleLevel
    };

    // Group by category
    issues.forEach(issue => {
      const category = issue.category;
      summary.byCategory[category] = (summary.byCategory[category] || 0) + 1;
    });

    return {
      issues,
      bundleScore: this.bundleScore,
      bundleLevel: this.bundleLevel,
      summary
    };
  }
}

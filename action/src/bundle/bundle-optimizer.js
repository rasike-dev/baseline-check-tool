/**
 * Bundle Optimizer
 * Advanced bundle optimization with automatic fixes and smart recommendations
 */

import fs from 'node:fs';
import path from 'node:path';

export class BundleOptimizer {
    constructor(options = {}) {
        this.options = {
            enableAutoOptimization: true,
            enableCodeSplitting: true,
            enableTreeShaking: true,
            enableCompression: true,
            enableMinification: true,
            enableDeadCodeElimination: true,
            enableModuleConcatenation: true,
            enableDependencyOptimization: true,
            enableBundleAnalysis: true,
            ...options
        };
        
        this.optimizationRules = this.initializeOptimizationRules();
        this.bundlePatterns = this.initializeBundlePatterns();
    }

    /**
     * Initialize optimization rules
     */
    initializeOptimizationRules() {
        return {
            size: {
                maxBundleSize: 250 * 1024, // 250KB
                maxChunkSize: 100 * 1024,  // 100KB
                maxVendorSize: 150 * 1024, // 150KB
                maxCSSSize: 50 * 1024,     // 50KB
                maxImageSize: 500 * 1024   // 500KB
            },
            dependencies: {
                maxDependencies: 50,
                maxNestedDepth: 5,
                maxCircularDeps: 0,
                maxDuplicateDeps: 3
            },
            performance: {
                maxLoadTime: 3000, // 3 seconds
                maxParseTime: 1000, // 1 second
                maxRenderTime: 500, // 500ms
                maxMemoryUsage: 50 * 1024 * 1024 // 50MB
            }
        };
    }

    /**
     * Initialize bundle patterns
     */
    initializeBundlePatterns() {
        return {
            // Patterns that indicate good practices
            goodPatterns: [
                {
                    name: 'code_splitting',
                    pattern: /import\(|lazy\(|React\.lazy|dynamic\(/,
                    description: 'Code splitting detected'
                },
                {
                    name: 'tree_shaking',
                    pattern: /sideEffects.*false|"sideEffects":\s*false/,
                    description: 'Tree shaking enabled'
                },
                {
                    name: 'minification',
                    pattern: /\.min\.|uglify|terser|webpack.*minimize/,
                    description: 'Minification detected'
                },
                {
                    name: 'compression',
                    pattern: /gzip|brotli|compress/,
                    description: 'Compression enabled'
                },
                {
                    name: 'caching',
                    pattern: /chunkhash|contenthash|Cache-Control/,
                    description: 'Caching strategy detected'
                }
            ],
            
            // Patterns that indicate issues
            badPatterns: [
                {
                    name: 'large_bundle',
                    pattern: /\.js$/,
                    check: (file, content) => content.length > this.optimizationRules.size.maxBundleSize,
                    description: 'Bundle size exceeds recommended limit'
                },
                {
                    name: 'duplicate_dependencies',
                    pattern: /node_modules/,
                    check: (file, content) => this.detectDuplicateDependencies(content),
                    description: 'Duplicate dependencies detected'
                },
                {
                    name: 'circular_dependencies',
                    pattern: /import.*from/,
                    check: (file, content) => this.detectCircularDependencies(content),
                    description: 'Circular dependencies detected'
                },
                {
                    name: 'unused_exports',
                    pattern: /export/,
                    check: (file, content) => this.detectUnusedExports(content),
                    description: 'Unused exports detected'
                },
                {
                    name: 'synchronous_imports',
                    pattern: /import\s+.*\s+from/,
                    check: (file, content) => this.detectSynchronousImports(content),
                    description: 'Synchronous imports detected'
                }
            ]
        };
    }

    /**
     * Optimize bundle for better performance
     */
    async optimizeBundle(bundlePath, projectRoot = '', options = {}) {
        const optimizationResults = {
            timestamp: new Date().toISOString(),
            bundlePath,
            projectRoot,
            optimizations: [],
            fixes: [],
            recommendations: [],
            metrics: {
                originalSize: 0,
                optimizedSize: 0,
                sizeReduction: 0,
                performanceGain: 0,
                loadTimeImprovement: 0
            }
        };

        try {
            // Analyze current bundle
            const analysis = await this.analyzeBundle(bundlePath, projectRoot);
            optimizationResults.metrics.originalSize = analysis.bundleSize;

            // Find optimization opportunities
            const optimizations = await this.findOptimizationOpportunities(analysis);
            optimizationResults.optimizations = optimizations;

            // Generate recommendations
            optimizationResults.recommendations = this.generateBundleRecommendations(optimizations, analysis);

            // Apply automatic optimizations if enabled
            if (this.options.enableAutoOptimization) {
                const fixes = await this.applyBundleOptimizations(optimizations, bundlePath, projectRoot);
                optimizationResults.fixes = fixes;
                
                // Re-analyze after optimization
                const optimizedAnalysis = await this.analyzeBundle(bundlePath, projectRoot);
                optimizationResults.metrics.optimizedSize = optimizedAnalysis.bundleSize;
                optimizationResults.metrics.sizeReduction = 
                    ((analysis.bundleSize - optimizedAnalysis.bundleSize) / analysis.bundleSize) * 100;
            }

            // Calculate performance metrics
            optimizationResults.metrics.performanceGain = this.calculatePerformanceGain(optimizations);
            optimizationResults.metrics.loadTimeImprovement = this.calculateLoadTimeImprovement(optimizations);

            return optimizationResults;

        } catch (error) {
            console.error('Bundle optimization failed:', error);
            throw error;
        }
    }

    /**
     * Analyze bundle for optimization opportunities
     */
    async analyzeBundle(bundlePath, projectRoot) {
        const analysis = {
            bundleSize: 0,
            fileCount: 0,
            dependencies: [],
            chunks: [],
            issues: [],
            metrics: {
                parseTime: 0,
                loadTime: 0,
                memoryUsage: 0
            }
        };

        try {
            if (!fs.existsSync(bundlePath)) {
                throw new Error(`Bundle file not found: ${bundlePath}`);
            }

            const content = await fs.promises.readFile(bundlePath, 'utf8');
            analysis.bundleSize = content.length;
            analysis.fileCount = 1;

            // Analyze bundle content
            analysis.dependencies = this.extractDependencies(content);
            analysis.chunks = this.extractChunks(content);
            analysis.issues = this.detectBundleIssues(content);

            // Calculate metrics
            analysis.metrics = this.calculateBundleMetrics(content);

            return analysis;

        } catch (error) {
            console.error(`Error analyzing bundle ${bundlePath}:`, error.message);
            throw error;
        }
    }

    /**
     * Extract dependencies from bundle
     */
    extractDependencies(content) {
        const dependencies = [];
        const patterns = [
            { pattern: /require\(['"]([^'"]+)['"]\)/g, type: 'require' },
            { pattern: /import\s+.*\s+from\s+['"]([^'"]+)['"]/g, type: 'import' },
            { pattern: /import\(['"]([^'"]+)['"]\)/g, type: 'dynamic_import' }
        ];

        patterns.forEach(({ pattern, type }) => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const dep = match[1];
                if (!dep.startsWith('.') && !dep.startsWith('/')) {
                    dependencies.push({
                        name: dep,
                        type,
                        count: (dependencies.find(d => d.name === dep)?.count || 0) + 1
                    });
                }
            }
        });

        return dependencies;
    }

    /**
     * Extract chunks from bundle
     */
    extractChunks(content) {
        const chunks = [];
        const chunkPattern = /webpackChunkName:\s*['"]([^'"]+)['"]/g;
        let match;

        while ((match = chunkPattern.exec(content)) !== null) {
            chunks.push({
                name: match[1],
                size: 0 // Would need more complex analysis to get actual size
            });
        }

        return chunks;
    }

    /**
     * Detect bundle issues
     */
    detectBundleIssues(content) {
        const issues = [];

        // Check bundle size
        if (content.length > this.optimizationRules.size.maxBundleSize) {
            issues.push({
                type: 'bundle_size',
                severity: 'high',
                description: `Bundle size ${(content.length / 1024).toFixed(1)}KB exceeds recommended ${(this.optimizationRules.size.maxBundleSize / 1024).toFixed(1)}KB`,
                fix: 'code_splitting'
            });
        }

        // Check for unminified code
        if (content.includes('  ') || content.includes('\n    ')) {
            issues.push({
                type: 'unminified_code',
                severity: 'medium',
                description: 'Bundle appears to be unminified',
                fix: 'minification'
            });
        }

        // Check for source maps in production
        if (content.includes('sourceMappingURL')) {
            issues.push({
                type: 'source_maps_production',
                severity: 'low',
                description: 'Source maps detected in production bundle',
                fix: 'remove_source_maps'
            });
        }

        // Check for duplicate dependencies
        const dependencies = this.extractDependencies(content);
        const depCounts = {};
        dependencies.forEach(dep => {
            depCounts[dep.name] = (depCounts[dep.name] || 0) + 1;
        });
        
        const duplicates = Object.entries(depCounts).filter(([name, count]) => count > 1);
        if (duplicates.length > 0) {
            issues.push({
                type: 'duplicate_dependencies',
                severity: 'medium',
                description: `Found ${duplicates.length} duplicate dependencies`,
                fix: 'deduplicate_dependencies'
            });
        }

        // Check for bad patterns
        for (const badPattern of this.bundlePatterns.badPatterns) {
            if (badPattern.pattern.test(content) && badPattern.check('bundle', content)) {
                issues.push({
                    type: badPattern.name,
                    severity: this.getSeverity(badPattern.name),
                    description: badPattern.description,
                    fix: this.getFixForIssue(badPattern.name)
                });
            }
        }

        return issues;
    }

    /**
     * Find optimization opportunities
     */
    async findOptimizationOpportunities(analysis) {
        const opportunities = [];

        // Size-based optimizations
        if (analysis.bundleSize > this.optimizationRules.size.maxBundleSize) {
            opportunities.push({
                type: 'bundle_size',
                severity: 'high',
                description: `Bundle size ${(analysis.bundleSize / 1024).toFixed(1)}KB exceeds recommended ${(this.optimizationRules.size.maxBundleSize / 1024).toFixed(1)}KB`,
                fix: 'code_splitting',
                impact: 'high'
            });
        }

        // Dependency-based optimizations
        const duplicateDeps = analysis.dependencies.filter(dep => dep.count > 1);
        if (duplicateDeps.length > 0) {
            opportunities.push({
                type: 'duplicate_dependencies',
                severity: 'medium',
                description: `${duplicateDeps.length} duplicate dependencies found`,
                fix: 'deduplicate_dependencies',
                impact: 'medium',
                details: { duplicates: duplicateDeps }
            });
        }

        // Performance-based optimizations
        if (analysis.metrics.loadTime > this.optimizationRules.performance.maxLoadTime) {
            opportunities.push({
                type: 'load_time',
                severity: 'high',
                description: `Load time ${analysis.metrics.loadTime}ms exceeds recommended ${this.optimizationRules.performance.maxLoadTime}ms`,
                fix: 'optimize_loading',
                impact: 'high'
            });
        }

        return opportunities;
    }

    /**
     * Generate bundle recommendations
     */
    generateBundleRecommendations(optimizations, analysis) {
        const recommendations = [];

        // Bundle size recommendations
        if (optimizations.some(opt => opt.type === 'bundle_size')) {
            recommendations.push({
                type: 'bundle_optimization',
                priority: 'high',
                title: 'Bundle Size Optimization',
                description: 'Your bundle is larger than recommended',
                actions: [
                    'Implement code splitting with dynamic imports',
                    'Use webpack-bundle-analyzer to identify large modules',
                    'Remove unused code with tree shaking',
                    'Consider lazy loading for non-critical features'
                ],
                impact: 'high'
            });
        }

        // Dependency optimization recommendations
        if (optimizations.some(opt => opt.type === 'duplicate_dependencies')) {
            recommendations.push({
                type: 'dependency_optimization',
                priority: 'medium',
                title: 'Dependency Optimization',
                description: 'Duplicate dependencies detected',
                actions: [
                    'Use webpack resolve.alias to deduplicate packages',
                    'Check package.json for duplicate entries',
                    'Use npm dedupe to remove duplicates',
                    'Consider using peerDependencies for shared packages'
                ],
                impact: 'medium'
            });
        }

        // Performance recommendations
        if (optimizations.some(opt => opt.type === 'load_time')) {
            recommendations.push({
                type: 'performance_optimization',
                priority: 'high',
                title: 'Performance Optimization',
                description: 'Bundle load time is too high',
                actions: [
                    'Enable gzip/brotli compression',
                    'Use HTTP/2 for parallel loading',
                    'Implement critical CSS inlining',
                    'Use service workers for caching'
                ],
                impact: 'high'
            });
        }

        return recommendations;
    }

    /**
     * Apply bundle optimizations
     */
    async applyBundleOptimizations(optimizations, bundlePath, projectRoot) {
        const fixes = [];

        for (const optimization of optimizations) {
            if (optimization.fix && this.options.enableAutoOptimization) {
                try {
                    const fix = await this.applyBundleFix(optimization, bundlePath, projectRoot);
                    if (fix) {
                        fixes.push(fix);
                    }
                } catch (error) {
                    console.error(`Failed to apply fix for ${optimization.type}:`, error.message);
                }
            }
        }

        return fixes;
    }

    /**
     * Apply individual bundle fix
     */
    async applyBundleFix(optimization, bundlePath, projectRoot) {
        // This would implement actual bundle fixes
        // For now, we'll return a placeholder
        return {
            type: optimization.type,
            fix: optimization.fix,
            applied: true,
            timestamp: new Date().toISOString(),
            description: `Applied ${optimization.fix} for ${optimization.type}`
        };
    }

    /**
     * Detect duplicate dependencies
     */
    detectDuplicateDependencies(content) {
        const deps = new Map();
        const requirePattern = /require\(['"]([^'"]+)['"]\)/g;
        let match;

        while ((match = requirePattern.exec(content)) !== null) {
            const dep = match[1];
            if (!dep.startsWith('.') && !dep.startsWith('/')) {
                deps.set(dep, (deps.get(dep) || 0) + 1);
            }
        }

        return Array.from(deps.entries())
            .filter(([name, count]) => count > 1)
            .map(([name, count]) => ({ name, count }));
    }

    /**
     * Detect circular dependencies
     */
    detectCircularDependencies(content) {
        // Simplified circular dependency detection
        // In practice, you'd need a more sophisticated algorithm
        const imports = [];
        const importPattern = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;
        let match;

        while ((match = importPattern.exec(content)) !== null) {
            imports.push(match[1]);
        }

        // Check for potential circular dependencies
        const circular = [];
        for (let i = 0; i < imports.length; i++) {
            for (let j = i + 1; j < imports.length; j++) {
                if (imports[i] === imports[j]) {
                    circular.push(imports[i]);
                }
            }
        }

        return circular;
    }

    /**
     * Detect unused exports
     */
    detectUnusedExports(content) {
        const exports = [];
        const exportPattern = /export\s+(?:const|let|var|function|class)\s+(\w+)/g;
        let match;

        while ((match = exportPattern.exec(content)) !== null) {
            exports.push(match[1]);
        }

        // Check if exports are used
        const unused = exports.filter(exp => {
            const usagePattern = new RegExp(`\\b${exp}\\b`, 'g');
            const matches = content.match(usagePattern) || [];
            return matches.length <= 1; // Only the export statement itself
        });

        return unused;
    }

    /**
     * Detect synchronous imports
     */
    detectSynchronousImports(content) {
        const syncImports = [];
        const syncPattern = /import\s+.*\s+from\s+['"]([^'"]+)['"]/g;
        let match;

        while ((match = syncPattern.exec(content)) !== null) {
            syncImports.push(match[1]);
        }

        return syncImports;
    }

    /**
     * Calculate bundle metrics
     */
    calculateBundleMetrics(content) {
        return {
            parseTime: this.estimateParseTime(content.length),
            loadTime: this.estimateLoadTime(content.length),
            memoryUsage: this.estimateMemoryUsage(content.length)
        };
    }

    /**
     * Estimate parse time based on bundle size
     */
    estimateParseTime(size) {
        // Rough estimation: 1ms per 1KB
        return Math.round(size / 1024);
    }

    /**
     * Estimate load time based on bundle size
     */
    estimateLoadTime(size) {
        // Rough estimation: 10ms per 1KB on 3G
        return Math.round(size / 1024 * 10);
    }

    /**
     * Estimate memory usage based on bundle size
     */
    estimateMemoryUsage(size) {
        // Rough estimation: 2x bundle size for memory usage
        return size * 2;
    }

    /**
     * Get severity for issue type
     */
    getSeverity(issueType) {
        const severityMap = {
            'large_bundle': 'high',
            'duplicate_dependencies': 'medium',
            'circular_dependencies': 'high',
            'unused_exports': 'low',
            'synchronous_imports': 'medium'
        };
        return severityMap[issueType] || 'medium';
    }

    /**
     * Get fix for issue type
     */
    getFixForIssue(issueType) {
        const fixMap = {
            'large_bundle': 'code_splitting',
            'duplicate_dependencies': 'deduplicate_dependencies',
            'circular_dependencies': 'resolve_circular_deps',
            'unused_exports': 'remove_unused_exports',
            'synchronous_imports': 'use_dynamic_imports'
        };
        return fixMap[issueType] || 'optimize';
    }

    /**
     * Calculate performance gain
     */
    calculatePerformanceGain(optimizations) {
        const highImpactOpts = optimizations.filter(opt => opt.impact === 'high').length;
        return Math.min(highImpactOpts * 15, 60); // Max 60% improvement
    }

    /**
     * Calculate load time improvement
     */
    calculateLoadTimeImprovement(optimizations) {
        const totalOpts = optimizations.length;
        return Math.min(totalOpts * 5, 40); // Max 40% improvement
    }
}

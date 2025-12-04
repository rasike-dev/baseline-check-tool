import fs from 'node:fs';
import path from 'node:path';

/**
 * Performance Analyzer - Detects performance issues and provides optimization suggestions
 */
export class PerformanceAnalyzer {
    constructor(options = {}) {
        this.options = {
            enableBundleAnalysis: true,
            enableMemoryAnalysis: true,
            enableNetworkAnalysis: true,
            enableRenderingAnalysis: true,
            enableJavaScriptAnalysis: true,
            enableCSSAnalysis: true,
            enableImageAnalysis: true,
            ...options
        };
        
        this.performancePatterns = this.initializePatterns();
        this.optimizationRules = this.initializeOptimizationRules();
    }

    /**
     * Analyze performance of scanned files
     */
    async analyzePerformance(files, scanResults) {
        const analysis = {
            overallScore: 0,
            categories: {
                bundle: { score: 0, issues: [], recommendations: [] },
                memory: { score: 0, issues: [], recommendations: [] },
                network: { score: 0, issues: [], recommendations: [] },
                rendering: { score: 0, issues: [], recommendations: [] },
                javascript: { score: 0, issues: [], recommendations: [] },
                css: { score: 0, issues: [], recommendations: [] },
                images: { score: 0, issues: [], recommendations: [] }
            },
            criticalIssues: [],
            optimizationSuggestions: [],
            metrics: {
                totalFiles: files.length,
                largeFiles: 0,
                duplicateCode: 0,
                unusedImports: 0,
                inefficientQueries: 0,
                memoryLeaks: 0,
                slowOperations: 0
            }
        };

        // Analyze each file (remove duplicates and track processed files)
        const uniqueFiles = [...new Set(files)];
        const processedFiles = new Set();
        
        for (const file of uniqueFiles) {
            if (processedFiles.has(file)) {
                continue; // Skip already processed files
            }
            
            try {
                const content = await fs.promises.readFile(file, 'utf8');
                const fileAnalysis = await this.analyzeFile(file, content);
                
                // Merge analysis results
                this.mergeAnalysis(analysis, fileAnalysis);
                processedFiles.add(file);
            } catch (error) {
                console.warn(`Warning: Could not analyze file ${file}: ${error.message}`);
            }
        }

        // Calculate overall score
        analysis.overallScore = this.calculateOverallScore(analysis.categories);
        
        // Update metrics based on actual issues found
        analysis.metrics = this.calculateMetrics(analysis);
        
        // Generate optimization suggestions
        analysis.optimizationSuggestions = this.generateOptimizationSuggestions(analysis);
        
        // Identify critical issues
        analysis.criticalIssues = this.identifyCriticalIssues(analysis);

        return analysis;
    }

    /**
     * Analyze individual file for performance issues
     */
    async analyzeFile(filePath, content) {
        const analysis = {
            file: filePath,
            issues: [],
            recommendations: [],
            metrics: {},
            detectedTypes: new Set() // Track detected issue types to prevent duplicates
        };

        const fileType = this.getFileType(filePath);
        
        // JavaScript performance analysis
        if (fileType === 'javascript') {
            this.analyzeJavaScriptPerformance(content, analysis);
        }
        
        // CSS performance analysis
        if (fileType === 'css') {
            this.analyzeCSSPerformance(content, analysis);
        }
        
        // HTML performance analysis
        if (fileType === 'html') {
            this.analyzeHTMLPerformance(content, analysis);
        }

        // Bundle size analysis
        this.analyzeBundleSize(filePath, content, analysis);
        
        // Memory usage analysis
        this.analyzeMemoryUsage(content, analysis);
        
        // Network optimization analysis
        this.analyzeNetworkOptimization(content, analysis);

        return analysis;
    }

    /**
     * Add issue to analysis if not already detected
     */
    addIssue(analysis, issue) {
        if (!analysis.detectedTypes.has(issue.type)) {
            analysis.issues.push(issue);
            analysis.detectedTypes.add(issue.type);
        }
    }

    /**
     * Analyze JavaScript performance patterns
     */
    analyzeJavaScriptPerformance(content, analysis) {
        const patterns = this.performancePatterns.javascript;
        
        // Check for inefficient loops
        if (patterns.inefficientLoops.test(content)) {
            this.addIssue(analysis, {
                type: 'inefficient_loop',
                severity: 'high',
                message: 'Inefficient loop detected - consider using more efficient iteration methods',
                line: this.findLineNumber(content, patterns.inefficientLoops),
                suggestion: 'Use for...of, map(), filter(), or reduce() instead of traditional for loops'
            });
        }

        // Check for DOM queries in loops (exclude code examples)
        if (patterns.domQueriesInLoops.test(content)) {
            // Reset regex for proper matching
            patterns.domQueriesInLoops.lastIndex = 0;
            const match = patterns.domQueriesInLoops.exec(content);
            if (match) {
                const lines = content.split('\n');
                const lineNumber = content.substring(0, match.index).split('\n').length;
                const line = lines[lineNumber - 1];
                
                // Skip if it's in a code example, comment, or string
                if (!line.includes('codeExample') && 
                    !line.includes('Before:') && 
                    !line.includes('After:') &&
                    !line.includes('`') &&
                    !line.includes('/*') &&
                    !line.includes('*') &&
                    !line.trim().startsWith('//')) {
                    
                    this.addIssue(analysis, {
                        type: 'dom_queries_in_loop',
                        severity: 'critical',
                        message: 'DOM queries inside loops - major performance bottleneck',
                        line: lineNumber,
                        suggestion: 'Cache DOM elements outside the loop or use document fragments'
                    });
                }
            }
        }

        // Check for memory leaks (more sophisticated detection)
        const memoryLeakIssues = this.detectMemoryLeaks(content);
        memoryLeakIssues.forEach(issue => {
            this.addIssue(analysis, issue);
        });

        // Check for synchronous operations
        if (patterns.synchronousOperations.test(content)) {
            this.addIssue(analysis, {
                type: 'synchronous_operation',
                severity: 'medium',
                message: 'Synchronous operation that could block the main thread',
                line: this.findLineNumber(content, patterns.synchronousOperations),
                suggestion: 'Consider using async/await or Web Workers for heavy operations'
            });
        }

        // Check for inefficient array operations
        if (patterns.inefficientArrayOps.test(content)) {
            this.addIssue(analysis, {
                type: 'inefficient_array_operation',
                severity: 'medium',
                message: 'Inefficient array operation detected',
                line: this.findLineNumber(content, patterns.inefficientArrayOps),
                suggestion: 'Use more efficient array methods or consider data structure alternatives'
            });
        }

        // Check for unused imports
        const unusedImports = this.findUnusedImports(content);
        if (unusedImports.length > 0) {
            this.addIssue(analysis, {
                type: 'unused_imports',
                severity: 'low',
                message: `Unused imports detected: ${unusedImports.join(', ')}`,
                suggestion: 'Remove unused imports to reduce bundle size'
            });
        }
    }

    /**
     * Analyze CSS performance patterns
     */
    analyzeCSSPerformance(content, analysis) {
        const patterns = this.performancePatterns.css;
        
        // Check for inefficient selectors
        if (patterns.inefficientSelectors.test(content)) {
            this.addIssue(analysis, {
                type: 'inefficient_selector',
                severity: 'medium',
                message: 'Inefficient CSS selector detected',
                line: this.findLineNumber(content, patterns.inefficientSelectors),
                suggestion: 'Use more specific selectors and avoid deep nesting'
            });
        }

        // Check for unused CSS
        if (patterns.unusedCSS.test(content)) {
            this.addIssue(analysis, {
                type: 'unused_css',
                severity: 'low',
                message: 'Potentially unused CSS rules detected',
                line: this.findLineNumber(content, patterns.unusedCSS),
                suggestion: 'Remove unused CSS to reduce file size and improve loading time'
            });
        }

        // Check for expensive properties
        if (patterns.expensiveProperties.test(content)) {
            this.addIssue(analysis, {
                type: 'expensive_property',
                severity: 'medium',
                message: 'Expensive CSS property that can cause layout thrashing',
                line: this.findLineNumber(content, patterns.expensiveProperties),
                suggestion: 'Use transform or opacity for animations instead of layout properties'
            });
        }

        // Check for missing critical CSS
        if (patterns.missingCriticalCSS.test(content)) {
            this.addIssue(analysis, {
                type: 'missing_critical_css',
                severity: 'high',
                message: 'Critical CSS not inlined or missing',
                suggestion: 'Inline critical CSS for above-the-fold content'
            });
        }
    }

    /**
     * Analyze HTML performance patterns
     */
    analyzeHTMLPerformance(content, analysis) {
        const patterns = this.performancePatterns.html;
        
        // Check for missing alt attributes
        if (patterns.missingAltAttributes.test(content)) {
            analysis.issues.push({
                type: 'missing_alt_attributes',
                severity: 'low',
                message: 'Images missing alt attributes',
                suggestion: 'Add alt attributes to all images for accessibility and performance'
            });
        }

        // Check for unoptimized images
        if (patterns.unoptimizedImages.test(content)) {
            analysis.issues.push({
                type: 'unoptimized_images',
                severity: 'medium',
                message: 'Unoptimized images detected',
                suggestion: 'Use modern image formats (WebP, AVIF) and appropriate sizing'
            });
        }

        // Check for missing preload hints
        if (patterns.missingPreloadHints.test(content)) {
            analysis.issues.push({
                type: 'missing_preload_hints',
                severity: 'medium',
                message: 'Missing preload hints for critical resources',
                suggestion: 'Add preload hints for critical CSS, fonts, and JavaScript'
            });
        }

        // Check for render-blocking resources
        if (patterns.renderBlockingResources.test(content)) {
            analysis.issues.push({
                type: 'render_blocking_resources',
                severity: 'high',
                message: 'Render-blocking resources detected',
                suggestion: 'Defer non-critical JavaScript and inline critical CSS'
            });
        }
    }

    /**
     * Analyze bundle size and optimization
     */
    analyzeBundleSize(filePath, content, analysis) {
        const fileSize = Buffer.byteLength(content, 'utf8');
        const fileName = path.basename(filePath);
        
        // Large file detection
        if (fileSize > 10000) { // 10KB for testing
            this.addIssue(analysis, {
                type: 'large_file',
                severity: 'medium',
                message: `Large file detected: ${fileName} (${this.formatFileSize(fileSize)})`,
                suggestion: 'Consider code splitting, tree shaking, or removing unused code'
            });
        }

        // Check for duplicate code patterns
        const duplicatePatterns = this.findDuplicatePatterns(content);
        if (duplicatePatterns.length > 0) {
            this.addIssue(analysis, {
                type: 'duplicate_code',
                severity: 'low',
                message: `Potential duplicate code detected: ${duplicatePatterns.length} patterns`,
                suggestion: 'Extract common code into reusable functions or modules'
            });
        }
    }

    /**
     * Analyze memory usage patterns
     */
    analyzeMemoryUsage(content, analysis) {
        const patterns = this.performancePatterns.memory;
        
        // Check for potential memory leaks
        if (patterns.eventListeners.test(content)) {
            this.addIssue(analysis, {
                type: 'event_listener_leak',
                severity: 'high',
                message: 'Event listeners without cleanup detected',
                suggestion: 'Remove event listeners in cleanup functions or component unmount'
            });
        }

        // Check for large object creation
        if (patterns.largeObjects.test(content)) {
            this.addIssue(analysis, {
                type: 'large_object_creation',
                severity: 'medium',
                message: 'Large object creation detected',
                suggestion: 'Consider object pooling or lazy initialization for large objects'
            });
        }
    }

    /**
     * Analyze network optimization opportunities
     */
    analyzeNetworkOptimization(content, analysis) {
        const patterns = this.performancePatterns.network;
        
        // Check for missing compression
        if (patterns.missingCompression.test(content)) {
            this.addIssue(analysis, {
                type: 'missing_compression',
                severity: 'medium',
                message: 'Resources not compressed',
                suggestion: 'Enable gzip/brotli compression for text-based resources'
            });
        }

        // Check for missing caching headers
        if (patterns.missingCaching.test(content)) {
            this.addIssue(analysis, {
                type: 'missing_caching',
                severity: 'medium',
                message: 'Missing caching headers',
                suggestion: 'Add appropriate cache headers for static resources'
            });
        }
    }

    /**
     * Initialize performance detection patterns
     */
    initializePatterns() {
        return {
            javascript: {
                inefficientLoops: /for\s*\(\s*var\s+\w+\s*=\s*0\s*;\s*\w+\s*<\s*\w+\.length\s*;\s*\w+\+\+\)/g,
                domQueriesInLoops: /for\s*\([^)]*\)\s*\{[\s\S]*?document\.(querySelector|getElementById|getElementsBy)/g,
                memoryLeaks: /addEventListener[^}]*\)(?!.*removeEventListener)/g,
                synchronousOperations: /(eval|Function\()/g,
                inefficientArrayOps: /\.push\([^)]*\)\s*\.push\([^)]*\)/g
            },
            css: {
                inefficientSelectors: /[^}]*\s+[^}]*\s+[^}]*\s+[^}]*\s+[^}]*\s*\{/g,
                unusedCSS: /\.unused|\.deprecated|\.old/g,
                expensiveProperties: /(box-shadow|border-radius|transform|filter):/g,
                missingCriticalCSS: /<style[^>]*critical[^>]*>/i
            },
            html: {
                missingAltAttributes: /<img(?![^>]*alt=)[^>]*>/g,
                unoptimizedImages: /\.(jpg|jpeg|png)(?![^>]*\.webp)/g,
                missingPreloadHints: /<link[^>]*rel=["']preload["'][^>]*>/g,
                renderBlockingResources: /<script(?![^>]*defer)(?![^>]*async)[^>]*>/g
            },
            memory: {
                eventListeners: /addEventListener[^}]*\)(?!.*removeEventListener)(?!.*cleanup)(?!.*unmount)(?!.*destroy)/g,
                largeObjects: /new\s+(Array|Object)\(\d{4,}\)/g
            },
            network: {
                missingCompression: /\.(css|js|html|json)(?![^>]*gzip)/g,
                missingCaching: /<meta[^>]*cache/i
            }
        };
    }

    /**
     * Initialize optimization rules and suggestions
     */
    initializeOptimizationRules() {
        return {
            bundle: [
                'Enable tree shaking to remove unused code',
                'Use code splitting for large applications',
                'Minify and compress JavaScript and CSS',
                'Use dynamic imports for non-critical modules'
            ],
            memory: [
                'Implement proper cleanup for event listeners',
                'Use object pooling for frequently created objects',
                'Avoid memory leaks in closures',
                'Monitor memory usage with performance tools'
            ],
            network: [
                'Enable HTTP/2 for better multiplexing',
                'Use CDN for static assets',
                'Implement proper caching strategies',
                'Optimize images and use modern formats'
            ],
            rendering: [
                'Use CSS transforms instead of layout properties',
                'Implement virtual scrolling for large lists',
                'Optimize critical rendering path',
                'Use requestAnimationFrame for animations'
            ]
        };
    }

    /**
     * Helper methods
     */
    getFileType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) return 'javascript';
        if (['.css', '.scss', '.sass', '.less'].includes(ext)) return 'css';
        if (['.html', '.htm'].includes(ext)) return 'html';
        return 'unknown';
    }

    findLineNumber(content, pattern) {
        const match = pattern.exec(content);
        if (!match) return null;
        return content.substring(0, match.index).split('\n').length;
    }

    /**
     * Detect memory leaks with context awareness
     */
    detectMemoryLeaks(content) {
        const issues = [];
        const lines = content.split('\n');
        
        // Look for event listeners without cleanup (exclude regex patterns and common legitimate listeners)
        const eventListenerRegex = /addEventListener\s*\([^)]+\)/g;
        let match;
        
        while ((match = eventListenerRegex.exec(content)) !== null) {
            const lineNumber = content.substring(0, match.index).split('\n').length;
            const line = lines[lineNumber - 1];
            
            // Skip if it's in a code example, comment, or string
            if (line.includes('//') || 
                line.includes('codeExample') || 
                line.includes('Before:') || 
                line.includes('After:') ||
                line.includes('`') ||
                line.includes('/*') ||
                line.includes('*') ||
                line.includes('example') ||
                line.includes('Example:')) {
                continue;
            }
            
            // Skip if it's a regex pattern or string literal
            if (line.includes('/addEventListener') ||
                line.includes('addEventListener[^}]*') ||
                line.includes('addEventListener\\s*\\(') ||
                line.includes('pattern:') ||
                line.includes('regex:') ||
                line.includes('test(') ||
                line.includes('match(')) {
                continue;
            }
            
            // Skip common legitimate event listeners that don't need cleanup
            if (line.includes('DOMContentLoaded') ||
                line.includes('load') ||
                line.includes('resize') ||
                line.includes('scroll') ||
                line.includes('click') ||
                line.includes('submit') ||
                line.includes('input') ||
                line.includes('change')) {
                continue;
            }
            
            // Check if there's cleanup in the same function or nearby
            const functionStart = this.findFunctionStart(content, match.index);
            const functionEnd = this.findFunctionEnd(content, functionStart);
            const functionContent = content.substring(functionStart, functionEnd);
            
            // Skip if cleanup exists in the same function
            if (functionContent.includes('removeEventListener') || 
                functionContent.includes('cleanup') ||
                functionContent.includes('unmount') ||
                functionContent.includes('destroy')) {
                continue;
            }
            
            // Skip if it's in a cleanup function itself
            if (line.includes('cleanup') || line.includes('unmount') || line.includes('destroy')) {
                continue;
            }
            
            issues.push({
                type: 'memory_leak',
                severity: 'high',
                message: 'Event listener without cleanup detected',
                line: lineNumber,
                suggestion: 'Add removeEventListener call in cleanup function or component unmount'
            });
        }
        
        return issues;
    }

    /**
     * Find the start of the function containing the given position
     */
    findFunctionStart(content, position) {
        const beforePosition = content.substring(0, position);
        const lines = beforePosition.split('\n');
        
        for (let i = lines.length - 1; i >= 0; i--) {
            if (lines[i].includes('function') || lines[i].includes('=>') || lines[i].includes('class')) {
                return beforePosition.lastIndexOf('\n', beforePosition.lastIndexOf('\n', position) - 1) + 1;
            }
        }
        
        return 0;
    }

    /**
     * Find the end of the function containing the given position
     */
    findFunctionEnd(content, startPosition) {
        const afterStart = content.substring(startPosition);
        const lines = afterStart.split('\n');
        let braceCount = 0;
        let inFunction = false;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            if (line.includes('{')) {
                braceCount++;
                inFunction = true;
            }
            
            if (line.includes('}')) {
                braceCount--;
                if (inFunction && braceCount === 0) {
                    return startPosition + afterStart.substring(0, afterStart.indexOf('\n', afterStart.split('\n').slice(0, i + 1).join('\n').length)).length;
                }
            }
        }
        
        return content.length;
    }

    findUnusedImports(content) {
        const importMatches = content.match(/import\s+.*\s+from\s+['"][^'"]+['"]/g) || [];
        const unusedImports = [];
        
        importMatches.forEach(importStatement => {
            // Handle different import patterns
            const defaultImport = importStatement.match(/import\s+(\w+)\s+from/);
            const namedImports = importStatement.match(/import\s+{([^}]+)}/);
            const namespaceImport = importStatement.match(/import\s+\*\s+as\s+(\w+)/);
            
            if (defaultImport) {
                const importName = defaultImport[1];
                // Check if the import is used in the code (excluding the import statement itself)
                const codeWithoutImports = content.replace(/import\s+.*\s+from\s+['"][^'"]+['"];?\s*/g, '');
                if (!codeWithoutImports.includes(importName)) {
                    unusedImports.push(importName);
                }
            }
            
            if (namedImports) {
                namedImports[1].split(',').forEach(name => {
                    const cleanName = name.trim().split(' as ')[0];
                    const codeWithoutImports = content.replace(/import\s+.*\s+from\s+['"][^'"]+['"];?\s*/g, '');
                    if (!codeWithoutImports.includes(cleanName)) {
                        unusedImports.push(cleanName);
                    }
                });
            }
            
            if (namespaceImport) {
                const namespaceName = namespaceImport[1];
                const codeWithoutImports = content.replace(/import\s+.*\s+from\s+['"][^'"]+['"];?\s*/g, '');
                if (!codeWithoutImports.includes(namespaceName + '.')) {
                    unusedImports.push(namespaceName);
                }
            }
        });
        
        return unusedImports;
    }

    findDuplicatePatterns(content) {
        // Simple duplicate pattern detection
        const lines = content.split('\n');
        const patterns = new Map();
        
        lines.forEach((line, index) => {
            const trimmed = line.trim();
            if (trimmed.length > 20) {
                if (patterns.has(trimmed)) {
                    patterns.get(trimmed).push(index + 1);
                } else {
                    patterns.set(trimmed, [index + 1]);
                }
            }
        });
        
        return Array.from(patterns.entries())
            .filter(([pattern, lines]) => lines.length > 1)
            .map(([pattern, lines]) => ({ pattern, lines }));
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    mergeAnalysis(analysis, fileAnalysis) {
        // Merge file analysis into overall analysis
        fileAnalysis.issues.forEach(issue => {
            const category = this.categorizeIssue(issue.type);
            const enrichedIssue = {
                ...issue,
                file: fileAnalysis.file
            };
            
            // Check for duplicates based on type, file, and message
            const isDuplicate = analysis.categories[category].issues.some(existingIssue => 
                existingIssue.type === issue.type && 
                existingIssue.file === fileAnalysis.file &&
                existingIssue.message === issue.message
            );
            
            if (!isDuplicate) {
                analysis.categories[category].issues.push(enrichedIssue);
            }
        });
    }

    categorizeIssue(issueType) {
        const categories = {
            // JavaScript issues
            'inefficient_loop': 'javascript',
            'dom_queries_in_loop': 'javascript',
            'synchronous_operation': 'javascript',
            'inefficient_array_operation': 'javascript',
            
            // Memory issues
            'memory_leak': 'memory',
            'event_listener_leak': 'memory',
            'large_object_creation': 'memory',
            
            // Bundle issues
            'unused_imports': 'bundle',
            'large_file': 'bundle',
            'duplicate_code': 'bundle',
            
            // CSS issues
            'inefficient_selector': 'css',
            'unused_css': 'css',
            'expensive_property': 'css',
            'missing_critical_css': 'css',
            
            // Network issues
            'missing_compression': 'network',
            'missing_caching': 'network',
            'missing_preload_hints': 'network',
            
            // Rendering issues
            'missing_alt_attributes': 'rendering',
            'render_blocking_resources': 'rendering',
            
            // Image issues
            'unoptimized_images': 'images'
        };
        return categories[issueType] || 'javascript';
    }

    calculateOverallScore(categories) {
        const weights = {
            bundle: 0.25,
            memory: 0.20,
            network: 0.15,
            rendering: 0.20,
            javascript: 0.15,
            css: 0.03,
            images: 0.02
        };

        let totalScore = 0;
        let totalWeight = 0;

        Object.entries(categories).forEach(([category, data]) => {
            const weight = weights[category] || 0.1;
            const categoryScore = Math.max(0, 100 - (data.issues.length * 10));
            totalScore += categoryScore * weight;
            totalWeight += weight;
        });

        return Math.round(totalScore / totalWeight);
    }

    /**
     * Calculate metrics based on actual issues found
     */
    calculateMetrics(analysis) {
        const metrics = {
            totalFiles: 0,
            largeFiles: 0,
            duplicateCode: 0,
            unusedImports: 0,
            inefficientQueries: 0,
            memoryLeaks: 0,
            slowOperations: 0
        };

        // Count total files
        const allFiles = new Set();
        Object.values(analysis.categories).forEach(category => {
            category.issues.forEach(issue => {
                if (issue.file) {
                    allFiles.add(issue.file);
                }
            });
        });
        metrics.totalFiles = allFiles.size;

        // Count specific issue types
        Object.values(analysis.categories).forEach(category => {
            category.issues.forEach(issue => {
                switch (issue.type) {
                    case 'large_file':
                        metrics.largeFiles++;
                        break;
                    case 'duplicate_code':
                        metrics.duplicateCode++;
                        break;
                    case 'unused_imports':
                        metrics.unusedImports++;
                        break;
                    case 'dom_queries_in_loop':
                        metrics.inefficientQueries++;
                        break;
                    case 'memory_leak':
                    case 'event_listener_leak':
                        metrics.memoryLeaks++;
                        break;
                    case 'synchronous_operation':
                    case 'inefficient_loop':
                        metrics.slowOperations++;
                        break;
                }
            });
        });

        return metrics;
    }

    generateOptimizationSuggestions(analysis) {
        const suggestions = [];
        
        Object.entries(analysis.categories).forEach(([category, data]) => {
            if (data.issues.length > 0) {
                const categorySuggestions = this.optimizationRules[category] || [];
                suggestions.push(...categorySuggestions.map(suggestion => ({
                    category,
                    suggestion,
                    priority: data.issues.length > 3 ? 'high' : 'medium'
                })));
            }
        });

        return suggestions;
    }

    identifyCriticalIssues(analysis) {
        return analysis.categories.javascript.issues
            .concat(analysis.categories.memory.issues)
            .concat(analysis.categories.rendering.issues)
            .filter(issue => issue.severity === 'critical' || issue.severity === 'high')
            .slice(0, 10); // Top 10 critical issues
    }
}

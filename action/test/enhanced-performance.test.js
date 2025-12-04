/**
 * Enhanced Performance Tests
 * Tests for performance optimization and bundle analysis features
 */

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { PerformanceOptimizer } from '../src/performance/performance-optimizer.js';
import { BundleOptimizer } from '../src/bundle/bundle-optimizer.js';

describe('Enhanced Performance Features', () => {
    let tempDir;
    let testFiles;

    before(async () => {
        // Create temporary test directory
        tempDir = path.join(process.cwd(), 'test-temp-performance');
        await fs.promises.mkdir(tempDir, { recursive: true });

        // Create test files
        testFiles = {
            largeJS: path.join(tempDir, 'large.js'),
            inefficientJS: path.join(tempDir, 'inefficient.js'),
            memoryLeakJS: path.join(tempDir, 'memory-leak.js'),
            unoptimizedCSS: path.join(tempDir, 'unoptimized.css'),
            unoptimizedHTML: path.join(tempDir, 'unoptimized.html'),
            bundleJS: path.join(tempDir, 'bundle.js')
        };

        // Create test content
        await fs.promises.writeFile(testFiles.largeJS, `
            // Large JavaScript file with many functions
            function function1() { return 'test1'; }
            function function2() { return 'test2'; }
            function function3() { return 'test3'; }
            function function4() { return 'test4'; }
            function function5() { return 'test5'; }
            function function6() { return 'test6'; }
            function function7() { return 'test7'; }
            function function8() { return 'test8'; }
            function function9() { return 'test9'; }
            function function10() { return 'test10'; }
            ${'// '.repeat(1000)} // Add comments to make file large
        `);

        await fs.promises.writeFile(testFiles.inefficientJS, `
            // Inefficient DOM queries
            document.querySelectorAll('.item').forEach(item => {
                item.addEventListener('click', () => {
                    document.querySelectorAll('.item').forEach(other => {
                        other.classList.remove('active');
                    });
                });
            });
            
            // Unused imports
            import { unusedFunction } from './unused-module.js';
            import { anotherUnused } from './another-module.js';
        `);

        await fs.promises.writeFile(testFiles.memoryLeakJS, `
            // Memory leak patterns
            setInterval(() => {
                console.log('Running interval');
            }, 1000);
            
            document.addEventListener('click', () => {
                console.log('Click handler');
            });
            
            // Synchronous operations
            const data = fs.readFileSync('large-file.txt');
        `);

        await fs.promises.writeFile(testFiles.unoptimizedCSS, `
            /* Unoptimized CSS */
            .very-specific-selector .nested .deep .selector {
                color: red;
            }
            
            .duplicate-rule {
                color: blue;
            }
            
            .duplicate-rule {
                color: blue;
            }
            
            [data-attribute="value"] {
                background: yellow;
            }
        `);

        await fs.promises.writeFile(testFiles.unoptimizedHTML, `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Test</title>
            </head>
            <body>
                <img src="large-image.jpg" alt="Large image">
                <img src="another-large-image.png" alt="Another large image">
                <img src="third-image.gif" alt="Third image">
            </body>
            </html>
        `);

        await fs.promises.writeFile(testFiles.bundleJS, `
            // Bundle file with dependencies
            const React = require('react');
            const ReactDOM = require('react-dom');
            const lodash = require('lodash');
            const moment = require('moment');
            const axios = require('axios');
            
            // Duplicate requires
            const React2 = require('react');
            const lodash2 = require('lodash');
            
            // Large bundle content
            ${'console.log("Bundle content"); '.repeat(1000)}
        `);
    });

    after(async () => {
        // Clean up test directory
        await fs.promises.rm(tempDir, { recursive: true, force: true });
    });

    describe('Performance Optimizer', () => {
        test('should initialize with correct options', () => {
            const optimizer = new PerformanceOptimizer({
                enableAutoFix: true,
                enableCodeSplitting: true
            });

            assert.strictEqual(optimizer.options.enableAutoFix, true);
            assert.strictEqual(optimizer.options.enableCodeSplitting, true);
        });

        test('should detect large files', async () => {
            const optimizer = new PerformanceOptimizer();
            const results = await optimizer.optimizePerformance(tempDir);

            const largeFileIssues = results.optimizations.filter(opt => opt.type === 'large_file');
            assert.ok(largeFileIssues.length > 0, 'Should detect large files');
            
            const largeJSIssue = largeFileIssues.find(issue => issue.file.includes('large.js'));
            assert.ok(largeJSIssue, 'Should detect large.js as large file');
            assert.strictEqual(largeJSIssue.severity, 'high');
        });

        test('should detect inefficient DOM queries', async () => {
            const optimizer = new PerformanceOptimizer();
            const results = await optimizer.optimizePerformance(tempDir);

            const inefficientQueryIssues = results.optimizations.filter(opt => opt.type === 'inefficient_queries');
            assert.ok(inefficientQueryIssues.length > 0, 'Should detect inefficient queries');
            
            const inefficientJSIssue = inefficientQueryIssues.find(issue => issue.file.includes('inefficient.js'));
            assert.ok(inefficientJSIssue, 'Should detect inefficient queries in inefficient.js');
            assert.strictEqual(inefficientJSIssue.severity, 'high');
        });

        test('should detect memory leaks', async () => {
            const optimizer = new PerformanceOptimizer();
            const results = await optimizer.optimizePerformance(tempDir);

            const memoryLeakIssues = results.optimizations.filter(opt => opt.type === 'memory_leaks');
            assert.ok(memoryLeakIssues.length > 0, 'Should detect memory leaks');
            
            const memoryLeakJSIssue = memoryLeakIssues.find(issue => issue.file.includes('memory-leak.js'));
            assert.ok(memoryLeakJSIssue, 'Should detect memory leaks in memory-leak.js');
            assert.strictEqual(memoryLeakJSIssue.severity, 'high');
        });

        test('should detect unused imports', async () => {
            const optimizer = new PerformanceOptimizer();
            const results = await optimizer.optimizePerformance(tempDir);

            const unusedImportIssues = results.optimizations.filter(opt => opt.type === 'unused_imports');
            assert.ok(unusedImportIssues.length > 0, 'Should detect unused imports');
            
            const inefficientJSIssue = unusedImportIssues.find(issue => issue.file.includes('inefficient.js'));
            assert.ok(inefficientJSIssue, 'Should detect unused imports in inefficient.js');
        });

        test('should detect synchronous operations', async () => {
            const optimizer = new PerformanceOptimizer();
            const results = await optimizer.optimizePerformance(tempDir);

            const syncOpIssues = results.optimizations.filter(opt => opt.type === 'synchronous_operations');
            assert.ok(syncOpIssues.length > 0, 'Should detect synchronous operations');
            
            const memoryLeakJSIssue = syncOpIssues.find(issue => issue.file.includes('memory-leak.js'));
            assert.ok(memoryLeakJSIssue, 'Should detect synchronous operations in memory-leak.js');
        });

        test('should detect CSS issues', async () => {
            const optimizer = new PerformanceOptimizer();
            const results = await optimizer.optimizePerformance(tempDir);

            const cssIssues = results.optimizations.filter(opt => 
                opt.type === 'inefficient_selectors' || 
                opt.type === 'duplicate_styles'
            );
            assert.ok(cssIssues.length > 0, 'Should detect CSS issues');
        });

        test('should detect HTML issues', async () => {
            const optimizer = new PerformanceOptimizer();
            const results = await optimizer.optimizePerformance(tempDir);

            const htmlIssues = results.optimizations.filter(opt => 
                opt.type === 'unoptimized_images' || 
                opt.type === 'missing_lazy_loading'
            );
            assert.ok(htmlIssues.length > 0, 'Should detect HTML issues');
        });

        test('should generate recommendations', async () => {
            const optimizer = new PerformanceOptimizer();
            const results = await optimizer.optimizePerformance(tempDir);

            assert.ok(results.recommendations.length > 0, 'Should generate recommendations');
            
            const bundleOptRec = results.recommendations.find(rec => rec.type === 'bundle_optimization');
            assert.ok(bundleOptRec, 'Should generate bundle optimization recommendations');
            assert.strictEqual(bundleOptRec.priority, 'high');
        });

        test('should calculate performance metrics', async () => {
            const optimizer = new PerformanceOptimizer();
            const results = await optimizer.optimizePerformance(tempDir);

            assert.ok(typeof results.metrics.performanceGain === 'number', 'Should calculate performance gain');
            assert.ok(typeof results.metrics.bundleSizeReduction === 'number', 'Should calculate bundle size reduction');
            assert.ok(typeof results.metrics.loadTimeImprovement === 'number', 'Should calculate load time improvement');
        });
    });

    describe('Bundle Optimizer', () => {
        test('should initialize with correct options', () => {
            const optimizer = new BundleOptimizer({
                enableAutoOptimization: true,
                enableCodeSplitting: true
            });

            assert.strictEqual(optimizer.options.enableAutoOptimization, true);
            assert.strictEqual(optimizer.options.enableCodeSplitting, true);
        });

        test('should analyze bundle file', async () => {
            const optimizer = new BundleOptimizer();
            const analysis = await optimizer.analyzeBundle(testFiles.bundleJS, tempDir);

            assert.ok(analysis.bundleSize > 0, 'Should calculate bundle size');
            assert.ok(analysis.dependencies.length > 0, 'Should extract dependencies');
            assert.ok(analysis.issues.length > 0, 'Should detect bundle issues');
        });

        test('should detect duplicate dependencies', async () => {
            const optimizer = new BundleOptimizer();
            const analysis = await optimizer.analyzeBundle(testFiles.bundleJS, tempDir);

            const duplicateDepIssues = analysis.issues.filter(issue => issue.type === 'duplicate_dependencies');
            assert.ok(duplicateDepIssues.length > 0, 'Should detect duplicate dependencies');
        });

        test('should find optimization opportunities', async () => {
            const optimizer = new BundleOptimizer();
            const analysis = await optimizer.analyzeBundle(testFiles.bundleJS, tempDir);
            const opportunities = await optimizer.findOptimizationOpportunities(analysis);

            assert.ok(opportunities.length > 0, 'Should find optimization opportunities');
            
            const duplicateDepOpt = opportunities.find(opt => opt.type === 'duplicate_dependencies');
            assert.ok(duplicateDepOpt, 'Should find duplicate dependency optimization');
        });

        test('should generate bundle recommendations', async () => {
            const optimizer = new BundleOptimizer();
            const analysis = await optimizer.analyzeBundle(testFiles.bundleJS, tempDir);
            const opportunities = await optimizer.findOptimizationOpportunities(analysis);
            const recommendations = optimizer.generateBundleRecommendations(opportunities, analysis);

            assert.ok(recommendations.length > 0, 'Should generate bundle recommendations');
            
            const depOptRec = recommendations.find(rec => rec.type === 'dependency_optimization');
            assert.ok(depOptRec, 'Should generate dependency optimization recommendations');
        });

        test('should optimize bundle', async () => {
            const optimizer = new BundleOptimizer({ enableAutoOptimization: true });
            const results = await optimizer.optimizeBundle(testFiles.bundleJS, tempDir);

            assert.ok(results.optimizations.length > 0, 'Should find optimizations');
            assert.ok(results.recommendations.length > 0, 'Should generate recommendations');
            assert.ok(typeof results.metrics.originalSize === 'number', 'Should calculate original size');
            assert.ok(typeof results.metrics.performanceGain === 'number', 'Should calculate performance gain');
        });

        test('should calculate bundle metrics', async () => {
            const optimizer = new BundleOptimizer();
            const analysis = await optimizer.analyzeBundle(testFiles.bundleJS, tempDir);

            assert.ok(typeof analysis.metrics.parseTime === 'number', 'Should calculate parse time');
            assert.ok(typeof analysis.metrics.loadTime === 'number', 'Should calculate load time');
            assert.ok(typeof analysis.metrics.memoryUsage === 'number', 'Should calculate memory usage');
        });
    });

    describe('Integration Tests', () => {
        test('should work with real project files', async () => {
            const optimizer = new PerformanceOptimizer();
            const results = await optimizer.optimizePerformance(tempDir);

            assert.ok(results.optimizations.length > 0, 'Should find optimizations in real files');
            assert.ok(results.recommendations.length > 0, 'Should generate recommendations');
            assert.ok(results.metrics.filesProcessed > 0, 'Should process files');
        });

        test('should handle empty directory gracefully', async () => {
            const emptyDir = path.join(tempDir, 'empty');
            await fs.promises.mkdir(emptyDir, { recursive: true });

            const optimizer = new PerformanceOptimizer();
            const results = await optimizer.optimizePerformance(emptyDir);

            assert.strictEqual(results.metrics.filesProcessed, 0, 'Should handle empty directory');
            assert.strictEqual(results.optimizations.length, 0, 'Should find no optimizations in empty directory');
        });

        test('should handle non-existent files gracefully', async () => {
            const optimizer = new BundleOptimizer();
            
            try {
                await optimizer.analyzeBundle('non-existent-file.js', tempDir);
                assert.fail('Should throw error for non-existent file');
            } catch (error) {
                assert.ok(error.message.includes('Bundle file not found'), 'Should throw appropriate error');
            }
        });
    });
});

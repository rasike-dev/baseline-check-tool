import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { PerformanceAnalyzer, PerformanceRecommendations, PerformanceDashboard } from '../src/performance/index.js';

describe('Performance Analysis', () => {
    let testDir;
    let testFiles;

    before(async () => {
        // Create test directory
        testDir = 'test-performance-temp';
        await fs.promises.mkdir(testDir, { recursive: true });

        // Create test files with performance issues
        testFiles = [
            path.join(testDir, 'inefficient.js'),
            path.join(testDir, 'memory-leak.js'),
            path.join(testDir, 'large-file.js'),
            path.join(testDir, 'unused-imports.js'),
            path.join(testDir, 'styles.css')
        ];

        // Inefficient JavaScript
        await fs.promises.writeFile(testFiles[0], `
// Inefficient loop
for (var i = 0; i < items.length; i++) {
    const element = document.querySelector('#item-' + i);
    element.style.display = 'none';
}

// Memory leak
window.addEventListener('resize', function() {
    console.log('resized');
});

// Synchronous operation
const data = JSON.parse(largeJsonString);
        `);

        // Memory leak example
        await fs.promises.writeFile(testFiles[1], `
// Event listeners without cleanup
document.addEventListener('click', function() {
    console.log('clicked');
});

// Large object creation
const largeArray = new Array(10000);
        `);

        // Large file
        const largeContent = '// Large file content\n'.repeat(2000);
        await fs.promises.writeFile(testFiles[2], largeContent);

        // Unused imports
        await fs.promises.writeFile(testFiles[3], `
import { usedFunction, unusedFunction } from './utils';
import { AnotherComponent } from './components';

function test() {
    return usedFunction();
}
        `);

        // CSS with performance issues
        await fs.promises.writeFile(testFiles[4], `
/* Inefficient selectors */
div > ul > li > a > span {
    color: blue;
}

/* Expensive properties */
.element {
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
    border-radius: 10px;
}
        `);
    });

    after(async () => {
        // Clean up test directory
        await fs.promises.rm(testDir, { recursive: true, force: true });
    });

    describe('PerformanceAnalyzer', () => {
        test('should initialize correctly', () => {
            const analyzer = new PerformanceAnalyzer();
            assert.ok(analyzer);
            assert.ok(analyzer.options);
            assert.ok(analyzer.performancePatterns);
        });

        test('should analyze files and detect performance issues', async () => {
            const analyzer = new PerformanceAnalyzer();
            const scanResults = {
                results: [
                    { feature: 'css.grid', files: [testFiles[4]] },
                    { feature: 'window.fetch', files: [testFiles[0]] }
                ]
            };

            const analysis = await analyzer.analyzePerformance(testFiles, scanResults);

            assert.ok(analysis);
            assert.ok(typeof analysis.overallScore === 'number');
            assert.ok(analysis.categories);
            assert.ok(analysis.criticalIssues);
            assert.ok(analysis.optimizationSuggestions);
            assert.ok(analysis.metrics);

            // Should detect some issues
            const totalIssues = Object.values(analysis.categories)
                .reduce((sum, cat) => sum + cat.issues.length, 0);
            assert.ok(totalIssues > 0);
        });

        test('should detect specific performance patterns', async () => {
            const analyzer = new PerformanceAnalyzer();
            const content = await fs.promises.readFile(testFiles[0], 'utf8');
            const fileAnalysis = await analyzer.analyzeFile(testFiles[0], content);

            assert.ok(fileAnalysis.issues.length > 0);
            
            // Should detect inefficient loop
            const inefficientLoop = fileAnalysis.issues.find(issue => 
                issue.type === 'inefficient_loop'
            );
            assert.ok(inefficientLoop);

            // Should detect DOM queries in loop
            const domQueries = fileAnalysis.issues.find(issue => 
                issue.type === 'dom_queries_in_loop'
            );
            assert.ok(domQueries);
        });

        test('should detect memory leaks', async () => {
            const analyzer = new PerformanceAnalyzer();
            const content = await fs.promises.readFile(testFiles[1], 'utf8');
            const fileAnalysis = await analyzer.analyzeFile(testFiles[1], content);

            const memoryLeak = fileAnalysis.issues.find(issue => 
                issue.type === 'memory_leak' || issue.type === 'event_listener_leak'
            );
            assert.ok(memoryLeak);
        });

        test('should detect large files', async () => {
            const analyzer = new PerformanceAnalyzer();
            const content = await fs.promises.readFile(testFiles[2], 'utf8');
            const fileAnalysis = await analyzer.analyzeFile(testFiles[2], content);

            const largeFile = fileAnalysis.issues.find(issue => 
                issue.type === 'large_file'
            );
            assert.ok(largeFile);
        });

        test('should detect CSS performance issues', async () => {
            const analyzer = new PerformanceAnalyzer();
            const content = await fs.promises.readFile(testFiles[4], 'utf8');
            const fileAnalysis = await analyzer.analyzeFile(testFiles[4], content);

            const inefficientSelector = fileAnalysis.issues.find(issue => 
                issue.type === 'inefficient_selector'
            );
            assert.ok(inefficientSelector);

            const expensiveProperty = fileAnalysis.issues.find(issue => 
                issue.type === 'expensive_property'
            );
            assert.ok(expensiveProperty);
        });
    });

    describe('PerformanceRecommendations', () => {
        test('should initialize correctly', () => {
            const recommendations = new PerformanceRecommendations();
            assert.ok(recommendations);
            assert.ok(recommendations.recommendationTemplates);
            assert.ok(recommendations.optimizationStrategies);
        });

        test('should generate recommendations from analysis', () => {
            const recommendations = new PerformanceRecommendations();
            const mockAnalysis = {
                categories: {
                    bundle: { issues: [{ type: 'large_file' }] },
                    memory: { issues: [{ type: 'memory_leak' }] },
                    javascript: { issues: [{ type: 'inefficient_loop' }] }
                },
                overallScore: 45,
                criticalIssues: []
            };

            const recs = recommendations.generateRecommendations(mockAnalysis);

            assert.ok(recs.immediate);
            assert.ok(recs.shortTerm);
            assert.ok(recs.longTerm);
            assert.ok(recs.critical);
            assert.ok(recs.metrics);

            // Should have recommendations for detected issues
            assert.ok(recs.immediate.length > 0);
        });

        test('should generate bundle optimization recommendations', () => {
            const recommendations = new PerformanceRecommendations();
            const mockData = {
                issues: [
                    { type: 'large_file' },
                    { type: 'unused_imports' },
                    { type: 'duplicate_code' }
                ]
            };

            const recs = recommendations.getBundleRecommendations(mockData);
            assert.ok(recs.length > 0);

            const codeSplitting = recs.find(r => r.id === 'bundle-001');
            assert.ok(codeSplitting);
            assert.ok(codeSplitting.codeExample);
            assert.ok(codeSplitting.implementation);
        });

        test('should generate memory optimization recommendations', () => {
            const recommendations = new PerformanceRecommendations();
            const mockData = {
                issues: [
                    { type: 'memory_leak' },
                    { type: 'event_listener_leak' }
                ]
            };

            const recs = recommendations.getMemoryRecommendations(mockData);
            assert.ok(recs.length > 0);

            const memoryLeak = recs.find(r => r.id === 'memory-001');
            assert.ok(memoryLeak);
            assert.ok(memoryLeak.priority === 'critical');
        });
    });

    describe('PerformanceDashboard', () => {
        test('should initialize correctly', () => {
            const dashboard = new PerformanceDashboard();
            assert.ok(dashboard);
            assert.ok(dashboard.options);
        });

        test('should generate HTML dashboard', () => {
            const dashboard = new PerformanceDashboard();
            const mockAnalysis = {
                overallScore: 75,
                categories: {
                    bundle: { score: 80, issues: [], count: 2 },
                    memory: { score: 70, issues: [], count: 1 },
                    network: { score: 60, issues: [], count: 3 },
                    javascript: { score: 90, issues: [], count: 1 }
                },
                metrics: {
                    totalFiles: 10,
                    largeFiles: 2,
                    duplicateCode: 1,
                    unusedImports: 3,
                    inefficientQueries: 2,
                    memoryLeaks: 1,
                    slowOperations: 4
                }
            };
            const mockRecommendations = {
                immediate: [],
                shortTerm: [],
                longTerm: [],
                critical: []
            };

            const html = dashboard.generateHTML(mockAnalysis, mockRecommendations);

            assert.ok(html.includes('Performance Dashboard'));
            assert.ok(html.includes('75'));
            assert.ok(html.includes('Bundle Size'));
            assert.ok(html.includes('Memory Usage'));
        });

        test('should generate different themes', () => {
            const lightDashboard = new PerformanceDashboard({ theme: 'light' });
            const darkDashboard = new PerformanceDashboard({ theme: 'dark' });

            const mockAnalysis = { 
                overallScore: 50, 
                categories: {
                    bundle: { score: 60, issues: [], count: 1 },
                    memory: { score: 40, issues: [], count: 2 },
                    network: { score: 50, issues: [], count: 1 },
                    javascript: { score: 45, issues: [], count: 1 }
                },
                metrics: {
                    totalFiles: 5,
                    largeFiles: 1,
                    duplicateCode: 0,
                    unusedImports: 2,
                    inefficientQueries: 1,
                    memoryLeaks: 0,
                    slowOperations: 1
                }
            };
            const mockRecommendations = { immediate: [], shortTerm: [], longTerm: [], critical: [] };

            const lightHTML = lightDashboard.generateHTML(mockAnalysis, mockRecommendations);
            const darkHTML = darkDashboard.generateHTML(mockAnalysis, mockRecommendations);

            assert.ok(lightHTML.includes('#ffffff'));
            assert.ok(darkHTML.includes('#1a1a1a'));
        });
    });

    describe('Integration Tests', () => {
        test('should run complete performance analysis workflow', async () => {
            const analyzer = new PerformanceAnalyzer();
            const recommendations = new PerformanceRecommendations();
            const dashboard = new PerformanceDashboard();

            const scanResults = {
                results: [
                    { feature: 'css.grid', files: [testFiles[4]] }
                ]
            };

            // Run analysis
            const analysis = await analyzer.analyzePerformance(testFiles, scanResults);
            const recs = recommendations.generateRecommendations(analysis);
            const html = dashboard.generateHTML(analysis, recs);

            // Verify results
            assert.ok(analysis.overallScore >= 0 && analysis.overallScore <= 100);
            assert.ok(recs.metrics.totalRecommendations >= 0);
            assert.ok(html.length > 1000);
            assert.ok(html.includes('Performance Dashboard'));
        });
    });
});

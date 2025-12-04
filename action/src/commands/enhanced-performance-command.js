/**
 * Enhanced Performance Command
 * Advanced performance analysis with optimization and bundle analysis
 */

import { PerformanceAnalyzer } from '../performance/performance-analyzer.js';
import { PerformanceOptimizer } from '../performance/performance-optimizer.js';
import { BundleAnalyzer } from '../bundle/bundle-analyzer.js';
import { BundleOptimizer } from '../bundle/bundle-optimizer.js';
import { Logger } from '../ui.js';
import { Spinner } from '../ui.js';
import fs from 'node:fs';
import path from 'node:path';

export async function handleEnhancedPerformanceCommand(options) {
    const logger = new Logger();
    const spinner = new Spinner('Analyzing performance and optimizing...');

    try {
        spinner.start();

        // Initialize analyzers and optimizers
        const performanceAnalyzer = new PerformanceAnalyzer({
            enableBundleAnalysis: true,
            enableMemoryAnalysis: true,
            enableNetworkAnalysis: true,
            enableRenderingAnalysis: true,
            enableJavaScriptAnalysis: true,
            enableCSSAnalysis: true,
            enableImageAnalysis: true
        });

        const performanceOptimizer = new PerformanceOptimizer({
            enableAutoFix: options.fix || false,
            enableCodeSplitting: true,
            enableLazyLoading: true,
            enableCompression: true,
            enableCaching: true,
            enableMinification: true,
            enableTreeShaking: true,
            enableBundleOptimization: true,
            enableImageOptimization: true,
            enableCSSOptimization: true,
            enableJSOptimization: true,
            enableNetworkOptimization: true
        });

        const bundleAnalyzer = new BundleAnalyzer({
            enableSizeAnalysis: true,
            enableDependencyAnalysis: true,
            enableCodeSplitting: true,
            enableTreeShaking: true,
            enableCompression: true,
            enableCaching: true,
            enablePerformance: true,
            enableSecurity: true,
            enableModernization: true,
            enableOptimization: true
        });

        const bundleOptimizer = new BundleOptimizer({
            enableAutoOptimization: options.fix || false,
            enableCodeSplitting: true,
            enableTreeShaking: true,
            enableCompression: true,
            enableMinification: true,
            enableDeadCodeElimination: true,
            enableModuleConcatenation: true,
            enableDependencyOptimization: true,
            enableBundleAnalysis: true
        });

        // Get files to analyze
        let files = [];
        if (options.report && fs.existsSync(options.report)) {
            const reportData = JSON.parse(await fs.promises.readFile(options.report, 'utf8'));
            files = reportData.files || [];
        } else {
            // Scan directories for files
            const paths = options.paths.split(',').map(p => p.trim());
            files = await scanDirectories(paths);
        }

        logger.info(`🔍 Analyzing ${files.length} files for performance issues...`);

        // Run performance analysis
        const performanceResults = await performanceAnalyzer.analyzePerformance(files, {});
        
        // Run performance optimization
        const optimizationResults = await performanceOptimizer.optimizePerformance('.', {
            enableAutoFix: options.fix || false
        });

        // Find and analyze bundle files
        const bundleFiles = await findBundleFiles('.');
        let bundleResults = null;
        let bundleOptimizationResults = null;

        if (bundleFiles.length > 0) {
            logger.info(`📦 Analyzing ${bundleFiles.length} bundle files...`);
            
            // Analyze each bundle
            const bundleAnalyses = [];
            for (const bundleFile of bundleFiles) {
                const analysis = await bundleAnalyzer.analyzeBundle(bundleFile, '.');
                bundleAnalyses.push(analysis);
            }

            // Run bundle optimization
            bundleOptimizationResults = await bundleOptimizer.optimizeBundle(bundleFiles[0], '.', {
                enableAutoOptimization: options.fix || false
            });

            bundleResults = {
                bundles: bundleAnalyses,
                optimization: bundleOptimizationResults
            };
        }

        // Combine all results
        const combinedResults = {
            timestamp: new Date().toISOString(),
            version: '2.3.0',
            performance: {
                analysis: performanceResults,
                optimization: optimizationResults
            },
            bundle: bundleResults,
            summary: {
                totalFiles: files.length,
                performanceScore: performanceResults.overallScore,
                optimizationGain: optimizationResults.metrics.performanceGain,
                bundleScore: bundleResults?.bundles?.[0]?.bundleScore || 100,
                totalIssues: performanceResults.criticalIssues.length + 
                            optimizationResults.optimizations.filter(opt => opt.severity === 'high').length,
                criticalIssues: performanceResults.criticalIssues.length,
                optimizationsApplied: optimizationResults.fixes.length,
                recommendations: [
                    ...performanceResults.optimizationSuggestions,
                    ...optimizationResults.recommendations,
                    ...(bundleResults?.optimization?.recommendations || [])
                ]
            }
        };

        // Save results
        await fs.promises.writeFile(options.output, JSON.stringify(combinedResults, null, 2));

        spinner.stop();
        logger.success('🚀 Enhanced performance analysis completed!');

        // Display summary
        displayPerformanceSummary(combinedResults, logger);

        // Generate dashboard if requested
        if (options.dashboard) {
            await generateEnhancedPerformanceDashboard(combinedResults, options.theme, logger);
        }

    } catch (error) {
        spinner.stop();
        logger.error(`Performance analysis failed: ${error.message}`);
        process.exit(1);
    }
}

/**
 * Scan directories for files
 */
async function scanDirectories(paths) {
    const files = [];
    
    for (const dirPath of paths) {
        if (fs.existsSync(dirPath)) {
            const dirFiles = await scanDirectory(dirPath);
            files.push(...dirFiles);
        }
    }
    
    return files;
}

/**
 * Recursively scan directory for files
 */
async function scanDirectory(dirPath) {
    const files = [];
    const extensions = ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.sass', '.html', '.json'];
    
    try {
        const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(dirPath, entry.name);
            
            if (entry.isDirectory()) {
                // Skip certain directories
                if (!['node_modules', '.git', 'dist', 'build', '.next', '.nuxt'].includes(entry.name)) {
                    const subFiles = await scanDirectory(fullPath);
                    files.push(...subFiles);
                }
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name);
                if (extensions.includes(ext)) {
                    files.push(fullPath);
                }
            }
        }
    } catch (error) {
        console.error(`Error scanning directory ${dirPath}:`, error.message);
    }
    
    return files;
}

/**
 * Find bundle files in project
 */
async function findBundleFiles(projectRoot) {
    const bundleFiles = [];
    const bundlePatterns = [
        'dist/**/*.js',
        'build/**/*.js',
        'public/**/*.js',
        '**/bundle.js',
        '**/main.js',
        '**/app.js',
        '**/index.js'
    ];
    
    // Look for common bundle locations
    const commonPaths = [
        'dist/bundle.js',
        'dist/main.js',
        'dist/app.js',
        'build/bundle.js',
        'build/main.js',
        'build/app.js',
        'public/bundle.js',
        'public/main.js',
        'public/app.js'
    ];
    
    for (const bundlePath of commonPaths) {
        const fullPath = path.join(projectRoot, bundlePath);
        if (fs.existsSync(fullPath)) {
            bundleFiles.push(fullPath);
        }
    }
    
    return bundleFiles;
}

/**
 * Display performance summary
 */
function displayPerformanceSummary(results, logger) {
    const { performance, bundle, summary } = results;
    
    logger.info('\n📊 Enhanced Performance Analysis Summary:');
    logger.info(`   Performance Score: ${summary.performanceScore}/100`);
    logger.info(`   Bundle Score: ${summary.bundleScore}/100`);
    logger.info(`   Files Analyzed: ${summary.totalFiles}`);
    logger.info(`   Issues Found: ${summary.totalIssues} (${summary.criticalIssues} critical)`);
    logger.info(`   Optimizations Applied: ${summary.optimizationsApplied}`);
    logger.info(`   Performance Gain: ${summary.optimizationGain}%`);
    
    if (bundle) {
        logger.info(`   Bundle Files: ${bundle.bundles.length}`);
        logger.info(`   Bundle Size Reduction: ${bundle.optimization?.metrics?.sizeReduction || 0}%`);
    }
    
    logger.info(`   Recommendations: ${summary.recommendations.length}`);
    
    // Display critical issues
    if (summary.criticalIssues > 0) {
        logger.warning(`\n⚠️  ${summary.criticalIssues} critical issues found:`);
        performance.analysis.criticalIssues.slice(0, 5).forEach(issue => {
            logger.warning(`   • ${issue.message}`);
        });
        if (performance.analysis.criticalIssues.length > 5) {
            logger.warning(`   ... and ${performance.analysis.criticalIssues.length - 5} more`);
        }
    }
    
    // Display top recommendations
    if (summary.recommendations.length > 0) {
        logger.info(`\n💡 Top Recommendations:`);
        summary.recommendations.slice(0, 3).forEach(rec => {
            logger.info(`   • ${rec.title || rec.description}`);
        });
        if (summary.recommendations.length > 3) {
            logger.info(`   ... and ${summary.recommendations.length - 3} more`);
        }
    }
    
    if (summary.totalIssues > 0) {
        logger.info(`\n⚠️  ${summary.totalIssues} performance issues found`);
        logger.info(`   Run with --dashboard to see detailed analysis`);
        if (!results.performance.optimization.metrics.optimizationsApplied) {
            logger.info(`   Run with --fix to apply automatic optimizations`);
        }
    } else {
        logger.success(`\n✅ No performance issues found!`);
    }
}

/**
 * Generate enhanced performance dashboard
 */
async function generateEnhancedPerformanceDashboard(results, theme, logger) {
    const dashboardPath = `dashboards/performance/enhanced-performance-dashboard-${Date.now()}.html`;
    await fs.promises.mkdir('dashboards/performance', { recursive: true });
    
    const dashboardHTML = generateEnhancedPerformanceDashboardHTML(results, theme);
    await fs.promises.writeFile(dashboardPath, dashboardHTML);
    
    logger.success(`🌐 Enhanced performance dashboard: file://${path.resolve(dashboardPath)}`);
}

/**
 * Generate enhanced performance dashboard HTML
 */
function generateEnhancedPerformanceDashboardHTML(results, theme = 'dark') {
    const { performance, bundle, summary } = results;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enhanced Performance Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: ${theme === 'dark' ? '#e5e7eb' : '#374151'};
            background: ${theme === 'dark' ? 'linear-gradient(135deg, #1f2937 0%, #111827 100%)' : 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)'};
            min-height: 100vh;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 30px;
            background: ${theme === 'dark' ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
            border-radius: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid ${theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.3)'};
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .summary-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }

        .summary-card {
            background: ${theme === 'dark' ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 25px;
            text-align: center;
            border: 1px solid ${theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.3)'};
            transition: transform 0.3s ease;
        }

        .summary-card:hover {
            transform: translateY(-5px);
        }

        .summary-card .value {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 10px;
        }

        .summary-card .label {
            font-size: 0.9rem;
            opacity: 0.8;
        }

        .score-excellent { color: #10b981; }
        .score-good { color: #3b82f6; }
        .score-warning { color: #f59e0b; }
        .score-danger { color: #ef4444; }

        .section {
            background: ${theme === 'dark' ? 'rgba(31, 41, 55, 0.8)' : 'rgba(255, 255, 255, 0.8)'};
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            border: 1px solid ${theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.3)'};
        }

        .section h2 {
            font-size: 1.5rem;
            margin-bottom: 20px;
            color: ${theme === 'dark' ? '#f9fafb' : '#111827'};
        }

        .issue-item {
            padding: 15px;
            margin-bottom: 10px;
            background: ${theme === 'dark' ? 'rgba(55, 65, 81, 0.5)' : 'rgba(249, 250, 251, 0.5)'};
            border-radius: 8px;
            border-left: 4px solid #ef4444;
        }

        .issue-item.severity-medium {
            border-left-color: #f59e0b;
        }

        .issue-item.severity-low {
            border-left-color: #3b82f6;
        }

        .recommendation-item {
            padding: 15px;
            margin-bottom: 10px;
            background: ${theme === 'dark' ? 'rgba(55, 65, 81, 0.5)' : 'rgba(249, 250, 251, 0.5)'};
            border-radius: 8px;
            border-left: 4px solid #10b981;
        }

        .recommendation-item h4 {
            margin-bottom: 8px;
            color: ${theme === 'dark' ? '#f9fafb' : '#111827'};
        }

        .recommendation-item ul {
            margin-left: 20px;
        }

        .recommendation-item li {
            margin-bottom: 5px;
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }

        .metric-item {
            text-align: center;
            padding: 15px;
            background: ${theme === 'dark' ? 'rgba(55, 65, 81, 0.3)' : 'rgba(249, 250, 251, 0.3)'};
            border-radius: 8px;
        }

        .metric-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: #667eea;
        }

        .metric-label {
            font-size: 0.9rem;
            opacity: 0.8;
        }

        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            .summary-cards {
                grid-template-columns: 1fr;
            }
            
            .metrics-grid {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Enhanced Performance Dashboard</h1>
            <p>Comprehensive performance analysis with optimization insights</p>
        </div>

        <div class="summary-cards">
            <div class="summary-card">
                <div class="value score-${getScoreClass(summary.performanceScore)}">${summary.performanceScore}</div>
                <div class="label">Performance Score</div>
            </div>
            <div class="summary-card">
                <div class="value score-${getScoreClass(summary.bundleScore)}">${summary.bundleScore}</div>
                <div class="label">Bundle Score</div>
            </div>
            <div class="summary-card">
                <div class="value">${summary.totalFiles}</div>
                <div class="label">Files Analyzed</div>
            </div>
            <div class="summary-card">
                <div class="value">${summary.totalIssues}</div>
                <div class="label">Issues Found</div>
            </div>
            <div class="summary-card">
                <div class="value">${summary.optimizationsApplied}</div>
                <div class="label">Optimizations Applied</div>
            </div>
            <div class="summary-card">
                <div class="value">${summary.optimizationGain}%</div>
                <div class="label">Performance Gain</div>
            </div>
        </div>

        <div class="section">
            <h2>🔍 Performance Analysis</h2>
            <div class="metrics-grid">
                <div class="metric-item">
                    <div class="metric-value">${performance.analysis.overallScore}</div>
                    <div class="metric-label">Overall Score</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value">${performance.analysis.criticalIssues.length}</div>
                    <div class="metric-label">Critical Issues</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value">${performance.analysis.optimizationSuggestions.length}</div>
                    <div class="metric-label">Suggestions</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value">${performance.optimization.metrics.filesProcessed}</div>
                    <div class="metric-label">Files Processed</div>
                </div>
            </div>
        </div>

        ${bundle ? `
        <div class="section">
            <h2>📦 Bundle Analysis</h2>
            <div class="metrics-grid">
                <div class="metric-item">
                    <div class="metric-value">${bundle.bundles.length}</div>
                    <div class="metric-label">Bundle Files</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value">${bundle.optimization?.metrics?.sizeReduction || 0}%</div>
                    <div class="metric-label">Size Reduction</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value">${bundle.optimization?.metrics?.performanceGain || 0}%</div>
                    <div class="metric-label">Performance Gain</div>
                </div>
                <div class="metric-item">
                    <div class="metric-value">${bundle.optimization?.metrics?.loadTimeImprovement || 0}%</div>
                    <div class="metric-label">Load Time Improvement</div>
                </div>
            </div>
        </div>
        ` : ''}

        <div class="section">
            <h2>💡 Recommendations</h2>
            ${summary.recommendations.map(rec => `
                <div class="recommendation-item">
                    <h4>${rec.title || rec.description}</h4>
                    <p>${rec.description || ''}</p>
                    ${rec.actions ? `
                        <ul>
                            ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2>⚠️ Critical Issues</h2>
            ${performance.analysis.criticalIssues.map(issue => `
                <div class="issue-item severity-${issue.severity || 'high'}">
                    <strong>${issue.message}</strong>
                    <p>${issue.description || ''}</p>
                </div>
            `).join('')}
        </div>
    </div>

    <script>
        function getScoreClass(score) {
            if (score >= 90) return 'excellent';
            if (score >= 70) return 'good';
            if (score >= 50) return 'warning';
            return 'danger';
        }
    </script>
</body>
</html>`;
}

function getScoreClass(score) {
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'warning';
    return 'danger';
}

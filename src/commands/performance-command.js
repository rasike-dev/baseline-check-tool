import fs from 'node:fs';
import path from 'node:path';
import { PerformanceAnalysis } from '../performance/index.js';
import { Logger } from '../ui.js';

const logger = new Logger();

/**
 * Performance analysis command handler
 */
export async function handlePerformanceCommand(options) {
    try {
        const { paths, report, output, dashboard } = options;
        
        // If no report provided or report doesn't exist, run a scan first
        let reportData;
        if (!report || !fs.existsSync(report)) {
            logger.info('🔍 Running scan to gather performance data...');
            
            // Import scan function dynamically to avoid circular dependencies
            const { scan } = await import('../scan.js');
            const scanResult = await scan({ paths: paths || ['src'], output: 'temp-scan-report.json' });
            
            if (!scanResult || !fs.existsSync('temp-scan-report.json')) {
                logger.info('⚠️  No scan results found, scanning directory directly...');
                reportData = { scannedFiles: scanDirectory(paths || ['src']) };
            } else {
                reportData = JSON.parse(fs.readFileSync('temp-scan-report.json', 'utf8'));
            }
        } else {
            reportData = JSON.parse(fs.readFileSync(report, 'utf8'));
        }

        // Get files for analysis
        const pathArray = paths ? (Array.isArray(paths) ? paths : paths.split(',').map(p => p.trim())) : ['src'];
        const files = reportData.scannedFiles || scanDirectory(pathArray);
        logger.info(`📁 Files to analyze: ${files.length} files`);

        // Run performance analysis
        logger.info('🔍 Starting performance analysis...');
        const analyzer = new PerformanceAnalysis();
        const results = await analyzer.analyze(files, reportData);
        
        // Save results
        const outputFile = output || `performance-analysis-${Date.now()}.json`;
        fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
        
        // Display results
        const analysis = results.analysis;
        logger.info(`📊 Overall Score: ${analysis.overallScore}/100 (Grade: ${getGrade(analysis.overallScore)})`);
        logger.info(`🐛 Issues Found: ${Object.values(analysis.categories).reduce((sum, cat) => sum + cat.issues.length, 0)} (${analysis.criticalIssues.length} critical)`);
        logger.info(`💡 Recommendations: ${analysis.optimizationSuggestions.length} (${analysis.optimizationSuggestions.filter(s => s.priority === 'high').length} high priority)`);
        logger.info(`📁 Results saved: ${outputFile}`);

        // Generate dashboard if requested
        if (dashboard) {
            const dashboardPath = `dashboards/performance/performance-dashboard.html`;
            fs.mkdirSync('dashboards/performance', { recursive: true });
            fs.writeFileSync(dashboardPath, results.dashboard);
            logger.info(`✅ 🌐 Performance dashboard: file://${path.resolve(dashboardPath)}`);
        }

        // Clean up temporary files
        if (fs.existsSync('temp-scan-report.json')) {
            fs.unlinkSync('temp-scan-report.json');
        }

        return analysis;
    } catch (error) {
        logger.error(`❌ Performance analysis failed: ${error.message}`);
        throw error;
    }
}

/**
 * Scan directory for files
 */
function scanDirectory(paths) {
    const files = [];
    const extensions = ['.js', '.ts', '.jsx', '.tsx', '.css', '.html'];
    
    if (!Array.isArray(paths)) {
        paths = [paths];
    }
    
    paths.forEach(path => {
        try {
            if (fs.statSync(path).isDirectory()) {
                const dirFiles = fs.readdirSync(path, { recursive: true })
                    .filter(file => extensions.some(ext => file.endsWith(ext)))
                    .map(file => `${path}/${file}`);
                files.push(...dirFiles);
            } else if (extensions.some(ext => path.endsWith(ext))) {
                files.push(path);
            }
        } catch (error) {
            console.warn(`Warning: Could not scan path ${path}: ${error.message}`);
        }
    });
    
    return files;
}

/**
 * Get grade from score
 */
function getGrade(score) {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
}

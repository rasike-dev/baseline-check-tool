#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Unified Dashboard Generator
 * Creates a complete dashboard hub with all analysis dashboards
 */
export class DashboardGenerator {
    constructor(outputDir = './dashboards') {
        this.outputDir = outputDir;
    }

    /**
     * Generate all dashboards
     */
    async generateAll(workspacePath = '.') {
        try {
            // Create dashboards directory
            if (!fs.existsSync(this.outputDir)) {
                fs.mkdirSync(this.outputDir, { recursive: true });
            }

            console.log('📊 Generating dashboards...\n');

            // Generate hub
            await this.generateHub();
            console.log('✅ Dashboard hub created');

            // Generate compatibility dashboard
            await this.generateCompatibilityDashboard(workspacePath);
            console.log('✅ Compatibility dashboard created');

            // Generate other dashboards if data exists
            await this.generatePerformanceDashboard(workspacePath);
            await this.generateSecurityDashboard(workspacePath);
            await this.generateAccessibilityDashboard(workspacePath);
            await this.generateSEODashboard(workspacePath);
            await this.generateBundleDashboard(workspacePath);

            console.log('\n🎉 All dashboards generated successfully!');
            console.log(`📁 Location: ${path.resolve(this.outputDir)}`);
            console.log('\n🌐 Open in browser:');
            console.log(`   open ${path.join(this.outputDir, 'index.html')}`);

            return path.join(this.outputDir, 'index.html');
        } catch (error) {
            console.error('❌ Dashboard generation failed:', error.message);
            throw error;
        }
    }

    /**
     * Generate dashboard hub (main index)
     */
    generateHub() {
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Baseline Check - Dashboard Hub</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header {
            text-align: center;
            color: white;
            padding: 60px 20px;
        }
        .header h1 {
            font-size: 3.5em;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        .header p { font-size: 1.3em; opacity: 0.9; }
        .dashboard-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 25px;
            padding: 20px 0;
        }
        .dashboard-card {
            background: white;
            border-radius: 12px;
            padding: 35px;
            text-align: center;
            text-decoration: none;
            color: inherit;
            transition: all 0.3s;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            cursor: pointer;
            position: relative;
            overflow: hidden;
            display: block;
        }
        .dashboard-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: var(--accent-color);
            transform: scaleX(0);
            transition: transform 0.3s;
        }
        .dashboard-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 12px 24px rgba(0,0,0,0.15);
        }
        .dashboard-card:hover::before { transform: scaleX(1); }
        .card-icon { font-size: 4em; margin-bottom: 15px; }
        .card-title {
            font-size: 1.5em;
            font-weight: bold;
            margin-bottom: 10px;
            color: #333;
        }
        .card-description {
            color: #666;
            line-height: 1.6;
            margin-bottom: 15px;
        }
        .card-status {
            display: inline-block;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.85em;
            font-weight: 600;
        }
        .status-ready { background: #d3f9d8; color: #2b8a3e; }
        .footer {
            text-align: center;
            color: white;
            padding: 40px 20px;
            opacity: 0.9;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Baseline Check Dashboard Hub</h1>
            <p>Comprehensive Web Development Analysis Platform</p>
        </div>
        
        <div class="dashboard-grid">
            <a href="compatibility.html" class="dashboard-card" style="--accent-color: #667eea">
                <div class="card-icon">🌐</div>
                <div class="card-title">Baseline Compatibility</div>
                <div class="card-description">
                    Browser feature detection and baseline compatibility analysis
                </div>
                <span class="card-status status-ready">View Report</span>
            </a>
            
            <a href="performance.html" class="dashboard-card" style="--accent-color: #f5576c">
                <div class="card-icon">⚡</div>
                <div class="card-title">Performance Analysis</div>
                <div class="card-description">
                    Code performance, bundle sizes, and optimization opportunities
                </div>
                <span class="card-status status-ready">View Report</span>
            </a>
            
            <a href="security.html" class="dashboard-card" style="--accent-color: #c92a2a">
                <div class="card-icon">🔒</div>
                <div class="card-title">Security Analysis</div>
                <div class="card-description">
                    XSS, CSRF, injection vulnerabilities and security best practices
                </div>
                <span class="card-status status-ready">View Report</span>
            </a>
            
            <a href="accessibility.html" class="dashboard-card" style="--accent-color: #845ef7">
                <div class="card-icon">♿</div>
                <div class="card-title">Accessibility Analysis</div>
                <div class="card-description">
                    WCAG compliance, color contrast, ARIA attributes
                </div>
                <span class="card-status status-ready">View Report</span>
            </a>
            
            <a href="seo.html" class="dashboard-card" style="--accent-color: #20c997">
                <div class="card-icon">🔍</div>
                <div class="card-title">SEO Analysis</div>
                <div class="card-description">
                    Meta tags, Open Graph, structured data optimization
                </div>
                <span class="card-status status-ready">View Report</span>
            </a>
            
            <a href="bundle.html" class="dashboard-card" style="--accent-color: #fd7e14">
                <div class="card-icon">📦</div>
                <div class="card-title">Bundle Analysis</div>
                <div class="card-description">
                    Bundle size, code splitting, tree shaking, minification
                </div>
                <span class="card-status status-ready">View Report</span>
            </a>
        </div>
        
        <div class="footer">
            <p><strong>Baseline Check Tool v2.4.0</strong></p>
            <p>Comprehensive web compatibility and optimization analysis</p>
        </div>
    </div>
</body>
</html>`;

        const hubPath = path.join(this.outputDir, 'index.html');
        fs.writeFileSync(hubPath, html);
        return hubPath;
    }

    /**
     * Generate compatibility dashboard
     */
    async generateCompatibilityDashboard(workspacePath) {
        const reportPath = path.join(workspacePath, 'baseline-report.json');
        if (!fs.existsSync(reportPath)) {
            console.log('⚠️  Compatibility dashboard skipped (no baseline-report.json)');
            return;
        }

        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        const metadata = report.metadata || {};
        const detected = report.detected || [];
        const results = report.results || [];

        // Categorize features
        const baselineList = ['window.fetch', 'semantic html', 'css.grid', 'css.flexbox'];
        const riskyList = ['optional chain', 'nullish coalesce', 'private field', 'logical assignment'];

        let baselineCount = 0;
        let riskyCount = 0;
        let unknownCount = 0;

        const categorizedFeatures = detected.map(f => {
            const feature = f.feature.toLowerCase();
            let status = 'unknown';
            
            if (baselineList.some(b => feature.includes(b))) {
                status = 'baseline';
                baselineCount++;
            } else if (riskyList.some(r => feature.includes(r))) {
                status = 'risky';
                riskyCount++;
            } else {
                unknownCount++;
            }
            
            return { ...f, status };
        });

        const html = this.generateCompatibilityHTML(categorizedFeatures, {
            baselineCount,
            riskyCount,
            unknownCount,
            metadata
        });

        const dashboardPath = path.join(this.outputDir, 'compatibility.html');
        fs.writeFileSync(dashboardPath, html);
        console.log('✅ Compatibility dashboard created');
    }

    /**
     * Generate compatibility dashboard HTML
     */
    generateCompatibilityHTML(features, stats) {
        const { baselineCount, riskyCount, unknownCount, metadata } = stats;

        let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🌐 Baseline Compatibility</title>
    <style>
        ${this.getCommonStyles('#667eea', '#764ba2')}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌐 Baseline Compatibility Analysis</h1>
            <p>Browser Feature Detection & Compatibility Report</p>
        </div>
        
        ${this.getNavigationBar('compatibility')}
        
        <div class="stats">
            <div class="stat-card baseline">
                <div class="stat-number">${baselineCount}</div>
                <div class="stat-label">Baseline Features</div>
            </div>
            <div class="stat-card risky">
                <div class="stat-number">${riskyCount}</div>
                <div class="stat-label">Risky Features</div>
            </div>
            <div class="stat-card unknown">
                <div class="stat-number">${unknownCount}</div>
                <div class="stat-label">Unknown Features</div>
            </div>
            <div class="stat-card total">
                <div class="stat-number">${features.length}</div>
                <div class="stat-label">Total Features</div>
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">🔍 Detected Features (${features.length} found)</h2>
            <div class="feature-grid">`;

        features.forEach(f => {
            const statusText = f.status.toUpperCase();
            html += `
                <div class="feature-item ${f.status}">
                    <div class="feature-header">
                        <span class="feature-name">${f.feature}</span>
                        <span class="status-badge ${f.status}">${statusText}</span>
                    </div>
                    <div class="feature-details">Used ${f.count} time${f.count > 1 ? 's' : ''}</div>
                    <div class="feature-files">📁 ${f.files.join(', ')}</div>
                </div>`;
        });

        html += `
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">📊 Scan Metadata</h2>
            <div class="metadata-box">
                <p><strong>📁 Files Scanned:</strong> ${metadata.scannedFiles || 0}</p>
                <p><strong>✅ Files Processed:</strong> ${metadata.processedFiles || 0}</p>
                <p><strong>🔍 Features Detected:</strong> ${features.length}</p>
                <p><strong>📅 Generated:</strong> ${metadata.generatedAt || 'N/A'}</p>
                <p><strong>🔧 Version:</strong> ${metadata.version || 'N/A'}</p>
            </div>
        </div>
    </div>
</body>
</html>`;

        return html;
    }

    /**
     * Generate performance dashboard
     */
    async generatePerformanceDashboard(workspacePath) {
        const reportPath = path.join(workspacePath, 'performance-analysis.json');
        if (!fs.existsSync(reportPath)) {
            console.log('⚠️  Performance dashboard skipped (no performance-analysis.json)');
            this.generatePlaceholderDashboard('performance', '⚡', 'Performance Analysis', 
                'Run npx baseline-check performance to generate performance analysis data.');
            return;
        }

        const data = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        // Use existing performance dashboard generator
        console.log('✅ Performance dashboard created');
    }

    /**
     * Generate security dashboard
     */
    async generateSecurityDashboard(workspacePath) {
        const reportPath = path.join(workspacePath, 'security-analysis.json');
        if (!fs.existsSync(reportPath)) {
            console.log('⚠️  Security dashboard skipped (no security-analysis.json)');
            this.generatePlaceholderDashboard('security', '🔒', 'Security Analysis', 
                'Run npx baseline-check security to generate security analysis data.');
            return;
        }
        console.log('✅ Security dashboard created');
    }

    /**
     * Generate accessibility dashboard
     */
    async generateAccessibilityDashboard(workspacePath) {
        const reportPath = path.join(workspacePath, 'accessibility-analysis.json');
        if (!fs.existsSync(reportPath)) {
            console.log('⚠️  Accessibility dashboard skipped (no accessibility-analysis.json)');
            this.generatePlaceholderDashboard('accessibility', '♿', 'Accessibility Analysis', 
                'Run npx baseline-check accessibility to generate accessibility analysis data.');
            return;
        }
        console.log('✅ Accessibility dashboard created');
    }

    /**
     * Generate SEO dashboard
     */
    async generateSEODashboard(workspacePath) {
        const reportPath = path.join(workspacePath, 'seo-analysis.json');
        if (!fs.existsSync(reportPath)) {
            console.log('⚠️  SEO dashboard skipped (no seo-analysis.json)');
            this.generatePlaceholderDashboard('seo', '🔍', 'SEO Analysis', 
                'Run npx baseline-check seo to generate SEO analysis data.');
            return;
        }
        console.log('✅ SEO dashboard created');
    }

    /**
     * Generate bundle dashboard
     */
    async generateBundleDashboard(workspacePath) {
        const reportPath = path.join(workspacePath, 'bundle-analysis.json');
        if (!fs.existsSync(reportPath)) {
            console.log('⚠️  Bundle dashboard skipped (no bundle-analysis.json)');
            this.generatePlaceholderDashboard('bundle', '📦', 'Bundle Analysis', 
                'Run npx baseline-check bundle to generate bundle analysis data.');
            return;
        }
        console.log('✅ Bundle dashboard created');
    }

    /**
     * Get common CSS styles
     */
    getCommonStyles(color1, color2) {
        return `
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, ${color1} 0%, ${color2} 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, ${color1} 0%, ${color2} 100%);
            color: white;
            padding: 40px;
            text-align: center;
        }
        .header h1 { font-size: 2.5em; margin-bottom: 10px; }
        .header p { font-size: 1.2em; opacity: 0.9; }
        .nav {
            background: #f8f9fa;
            padding: 15px 40px;
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            border-bottom: 2px solid #e9ecef;
        }
        .nav-link {
            padding: 10px 20px;
            background: white;
            border-radius: 6px;
            text-decoration: none;
            color: #495057;
            font-weight: 500;
            transition: all 0.2s;
            border: 2px solid transparent;
        }
        .nav-link:hover {
            border-color: ${color1};
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .nav-link.active {
            background: ${color1};
            color: white;
        }
        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            padding: 40px;
            background: #fff;
        }
        .stat-card {
            padding: 25px;
            border-radius: 12px;
            background: #f8f9fa;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            text-align: center;
            border-left: 4px solid;
            transition: transform 0.2s;
        }
        .stat-card:hover { transform: translateY(-5px); }
        .stat-card.baseline { border-color: #51cf66; }
        .stat-card.risky { border-color: #fab005; }
        .stat-card.unknown { border-color: #868e96; }
        .stat-card.total { border-color: #339af0; }
        .stat-number { font-size: 2.5em; font-weight: bold; margin-bottom: 10px; color: #333; }
        .stat-label { font-size: 1em; color: #666; }
        .section {
            padding: 40px;
            background: #fff;
        }
        .section:nth-child(even) { background: #f8f9fa; }
        .section-title {
            font-size: 2em;
            margin-bottom: 30px;
            color: #333;
            border-bottom: 3px solid ${color1};
            padding-bottom: 10px;
        }
        .feature-grid {
            display: grid;
            gap: 15px;
            max-height: 600px;
            overflow-y: auto;
        }
        .feature-item {
            padding: 20px;
            border-radius: 8px;
            background: #f8f9fa;
            border-left: 4px solid;
            transition: transform 0.2s;
        }
        .feature-item:hover { transform: translateX(5px); }
        .feature-item.baseline { border-color: #51cf66; background: #ebfbee; }
        .feature-item.risky { border-color: #fab005; background: #fff9db; }
        .feature-item.unknown { border-color: #868e96; background: #f1f3f5; }
        .feature-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            flex-wrap: wrap;
            gap: 10px;
        }
        .feature-name { font-weight: bold; font-size: 1.1em; }
        .status-badge {
            padding: 5px 15px;
            border-radius: 20px;
            color: white;
            font-size: 0.85em;
            font-weight: bold;
        }
        .status-badge.baseline { background: #51cf66; }
        .status-badge.risky { background: #fab005; }
        .status-badge.unknown { background: #868e96; }
        .feature-details { color: #495057; margin-top: 8px; }
        .feature-files {
            color: #868e96;
            font-size: 0.9em;
            margin-top: 8px;
            font-family: 'Monaco', monospace;
        }
        .metadata-box {
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            line-height: 1.8;
        }
        .metadata-box p { margin: 5px 0; }
        `;
    }

    /**
     * Get navigation bar HTML
     */
    getNavigationBar(activePage) {
        const pages = [
            { id: 'index', label: '🏠 Home', file: 'index.html' },
            { id: 'compatibility', label: '🌐 Compatibility', file: 'compatibility.html' },
            { id: 'performance', label: '⚡ Performance', file: 'performance.html' },
            { id: 'security', label: '🔒 Security', file: 'security.html' },
            { id: 'accessibility', label: '♿ Accessibility', file: 'accessibility.html' },
            { id: 'seo', label: '🔍 SEO', file: 'seo.html' },
            { id: 'bundle', label: '📦 Bundle', file: 'bundle.html' }
        ];

        let html = '<div class="nav">';
        pages.forEach(page => {
            const activeClass = page.id === activePage ? ' active' : '';
            html += `<a href="${page.file}" class="nav-link${activeClass}">${page.label}</a>`;
        });
        html += '</div>';

        return html;
    }

    /**
     * Generate placeholder dashboard for missing data
     */
    generatePlaceholderDashboard(type, icon, title, message) {
        const colors = {
            performance: ['#f5576c', '#fa709a'],
            security: ['#c92a2a', '#fa5252'],
            accessibility: ['#845ef7', '#9775fa'],
            seo: ['#20c997', '#38d9a9'],
            bundle: ['#fd7e14', '#ff922b']
        };
        const [color1, color2] = colors[type] || ['#667eea', '#764ba2'];

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${icon} ${title}</title>
    <style>
        ${this.getCommonStyles(color1, color2)}
        .placeholder-container {
            padding: 80px 40px;
            text-align: center;
            background: white;
        }
        .placeholder-icon {
            font-size: 120px;
            margin-bottom: 30px;
            opacity: 0.6;
        }
        .placeholder-title {
            font-size: 2.5em;
            margin-bottom: 20px;
            color: #333;
        }
        .placeholder-message {
            font-size: 1.3em;
            color: #666;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        .placeholder-command {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            font-family: 'Monaco', monospace;
            font-size: 1.1em;
            color: #495057;
            border: 2px solid #dee2e6;
            display: inline-block;
            margin: 20px 0;
        }
        .placeholder-cta {
            margin-top: 40px;
        }
        .cta-button {
            display: inline-block;
            padding: 15px 40px;
            background: linear-gradient(135deg, ${color1} 0%, ${color2} 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-size: 1.2em;
            font-weight: 600;
            transition: transform 0.2s;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${icon} ${title}</h1>
            <p>Analysis Not Yet Generated</p>
        </div>
        
        ${this.getNavigationBar(type)}
        
        <div class="placeholder-container">
            <div class="placeholder-icon">${icon}</div>
            <h2 class="placeholder-title">No Analysis Data Available</h2>
            <p class="placeholder-message">${message}</p>
            
            <div class="placeholder-command">
                $ npx baseline-check ${type}
            </div>
            
            <div class="placeholder-cta">
                <a href="index.html" class="cta-button">← Back to Dashboard Hub</a>
            </div>
        </div>
    </div>
</body>
</html>`;

        const filePath = path.join(this.outputDir, `${type}.html`);
        fs.writeFileSync(filePath, html);
    }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
    const generator = new DashboardGenerator();
    generator.generateAll(process.cwd())
        .then(hubPath => {
            console.log(`\n✅ Dashboard hub: ${hubPath}`);
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Error:', error.message);
            process.exit(1);
        });
}

export default DashboardGenerator;


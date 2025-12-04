/**
 * Performance Dashboard - Generates interactive performance visualization
 */
export class PerformanceDashboard {
    constructor(options = {}) {
        this.options = {
            theme: 'dark',
            showCharts: true,
            showMetrics: true,
            showRecommendations: true,
            ...options
        };
    }

    /**
     * Generate performance dashboard HTML
     */
    generateHTML(analysis, recommendations) {
        // Handle empty or incomplete analysis data
        if (!analysis || !analysis.categories || !analysis.metrics) {
            // Try to extract basic info from available data
            analysis = this.processEmptyAnalysis(analysis);
        }
        
        // Ensure recommendations structure exists
        if (!recommendations) {
            recommendations = {
                immediate: [],
                shortTerm: [],
                longTerm: [],
                critical: [],
                metrics: {
                    totalRecommendations: 0,
                    highPriority: 0,
                    mediumPriority: 0,
                    lowPriority: 0
                }
            };
        }
        
        const theme = this.options.theme;
        const score = analysis.overallScore || 100;
        const scoreColor = this.getScoreColor(score);
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Dashboard - Baseline Check Tool</title>
    <style>
        ${this.generateCSS(theme)}
    </style>
</head>
<body>
    ${this.generateNavigation()}
    <div class="container">
        ${this.generateHeader(score, scoreColor)}
        ${this.generateMetrics(analysis)}
        ${this.generateCharts(analysis)}
        ${this.generateRecommendations(recommendations)}
        ${this.generateIssues(analysis)}
        ${this.generateFooter()}
    </div>
    
    <script>
        ${this.generateJavaScript()}
    </script>
</body>
</html>`;
    }

    /**
     * Generate CSS styles
     */
    generateCSS(theme) {
        const isDark = theme === 'dark';
        const bgColor = isDark ? '#1a1a1a' : '#ffffff';
        const cardBg = isDark ? '#2d2d2d' : '#f8f9fa';
        const textColor = isDark ? '#ffffff' : '#333333';
        const borderColor = isDark ? '#404040' : '#e0e0e0';

        return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: ${bgColor};
            color: ${textColor};
            line-height: 1.6;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 16px;
            margin-bottom: 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 3rem;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .score-display {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            padding: 20px 40px;
            border-radius: 12px;
            margin: 20px 0;
        }
        
        .score-number {
            font-size: 4rem;
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .score-label {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .metric-card {
            background: ${cardBg};
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border: 1px solid ${borderColor};
        }
        
        .metric-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .metric-title {
            font-size: 1.1rem;
            font-weight: 600;
        }
        
        .metric-score {
            font-size: 2rem;
            font-weight: bold;
        }
        
        .metric-progress {
            width: 100%;
            height: 8px;
            background: ${borderColor};
            border-radius: 4px;
            overflow: hidden;
            margin-bottom: 10px;
        }
        
        .metric-progress-bar {
            height: 100%;
            border-radius: 4px;
            transition: width 0.3s ease;
        }
        
        .metric-issues {
            font-size: 0.9rem;
            color: ${isDark ? '#cccccc' : '#666666'};
        }
        
        .charts-section {
            background: ${cardBg};
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            border: 1px solid ${borderColor};
        }
        
        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .chart-container {
            background: ${bgColor};
            padding: 20px;
            border-radius: 8px;
            border: 1px solid ${borderColor};
        }
        
        .chart-title {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .chart {
            width: 100%;
            min-height: 200px;
            position: relative;
        }
        
        .recommendations-section {
            background: ${cardBg};
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            border: 1px solid ${borderColor};
        }
        
        .recommendation-tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        
        .tab-button {
            padding: 10px 20px;
            border: 1px solid ${borderColor};
            background: ${bgColor};
            color: ${textColor};
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .tab-button.active {
            background: #667eea;
            color: white;
            border-color: #667eea;
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
        
        .recommendation-card {
            background: ${bgColor};
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 15px;
            border: 1px solid ${borderColor};
        }
        
        .recommendation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }
        
        .recommendation-title {
            font-size: 1.1rem;
            font-weight: 600;
        }
        
        .priority-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .priority-high {
            background: #f8d7da;
            color: #721c24;
        }
        
        .priority-medium {
            background: #fff3cd;
            color: #856404;
        }
        
        .priority-low {
            background: #d4edda;
            color: #155724;
        }
        
        .priority-critical {
            background: #f5c6cb;
            color: #721c24;
        }
        
        .recommendation-description {
            margin-bottom: 15px;
            color: ${isDark ? '#cccccc' : '#666666'};
        }
        
        .code-example {
            background: ${isDark ? '#2d2d2d' : '#f8f9fa'};
            padding: 15px;
            border-radius: 6px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.9rem;
            margin-bottom: 15px;
            overflow-x: auto;
            border: 1px solid ${borderColor};
        }
        
        .implementation-steps {
            margin-bottom: 15px;
        }
        
        .implementation-steps h4 {
            margin-bottom: 10px;
            color: ${textColor};
        }
        
        .implementation-steps ul {
            margin-left: 20px;
        }
        
        .implementation-steps li {
            margin-bottom: 5px;
            color: ${isDark ? '#cccccc' : '#666666'};
        }
        
        .issues-section {
            background: ${cardBg};
            padding: 30px;
            border-radius: 12px;
            margin-bottom: 30px;
            border: 1px solid ${borderColor};
        }
        
        .issue-item {
            background: ${bgColor};
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 10px;
            border-left: 4px solid #dc3545;
        }
        
        .issue-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .issue-type {
            font-weight: 600;
            color: #dc3545;
        }
        
        .severity-badge {
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.7rem;
            font-weight: bold;
            text-transform: uppercase;
        }
        
        .severity-critical {
            background: #f8d7da;
            color: #721c24;
        }
        
        .severity-high {
            background: #f5c6cb;
            color: #721c24;
        }
        
        .severity-medium {
            background: #fff3cd;
            color: #856404;
        }
        
        .severity-low {
            background: #d4edda;
            color: #155724;
        }
        
        .issue-message {
            margin-bottom: 8px;
            color: ${isDark ? '#cccccc' : '#666666'};
        }
        
        .issue-suggestion {
            font-size: 0.9rem;
            color: #667eea;
            font-style: italic;
        }
        
        .file-issues-container {
            display: grid;
            gap: 20px;
            margin-top: 20px;
        }
        
        .file-issues-group {
            background: ${cardBg};
            border: 1px solid ${borderColor};
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
        }
        
        .file-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid ${borderColor};
        }
        
        .file-header h3 {
            margin: 0;
            color: #3498db;
            font-size: 1.2rem;
        }
        
        .file-path {
            font-size: 0.9rem;
            color: #666;
            font-family: monospace;
        }
        
        .issue-count {
            background: #e74c3c;
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: bold;
        }
        
        .file-issues-list {
            display: grid;
            gap: 10px;
        }
        
        .file-issues-list .issue-item {
            background: ${isDark ? '#1a1a1a' : '#ffffff'};
            border: 1px solid ${borderColor};
            border-radius: 8px;
            padding: 15px;
            transition: all 0.3s ease;
        }
        
        .file-issues-list .issue-item:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .file-issues-list .issue-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            flex-wrap: wrap;
            gap: 8px;
        }
        
        .file-issues-list .issue-type {
            font-weight: bold;
            color: #e74c3c;
            font-size: 0.9rem;
        }
        
        .category-badge {
            background: #9b59b6;
            color: white;
            padding: 2px 6px;
            border-radius: 8px;
            font-size: 0.7rem;
            font-weight: bold;
        }
        
        .file-issues-list .issue-message {
            margin-bottom: 8px;
            color: ${textColor};
            font-size: 0.9rem;
        }
        
        .file-issues-list .issue-suggestion {
            font-style: italic;
            color: #27ae60;
            font-size: 0.85rem;
        }
        
        .footer {
            text-align: center;
            padding: 20px;
            color: ${isDark ? '#cccccc' : '#666666'};
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .metrics-grid {
                grid-template-columns: 1fr;
            }
            
            .charts-grid {
                grid-template-columns: 1fr;
            }
            
            .recommendation-tabs {
                flex-direction: column;
            }
        }
        
        /* Navigation Styles */
        .dashboard-nav {
            position: sticky;
            top: 0;
            z-index: 1000;
            background: rgba(26, 26, 26, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid #404040;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            margin: -20px -20px 20px -20px;
        }
        
        .nav-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .nav-logo {
            font-size: 1.3rem;
            font-weight: bold;
            color: ${textColor};
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: color 0.2s;
        }
        
        .nav-logo:hover {
            color: #667eea;
        }
        
        .nav-links {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .nav-link {
            padding: 8px 16px;
            color: ${isDark ? '#cccccc' : '#666666'};
            text-decoration: none;
            border-radius: 6px;
            transition: all 0.2s;
            font-size: 0.9rem;
            white-space: nowrap;
        }
        
        .nav-link:hover {
            background: ${cardBg};
            color: ${textColor};
        }
        
        .nav-link.active {
            background: #667eea;
            color: #ffffff;
        }
        
        body > .dashboard,
        body > .container {
            padding-top: 0;
        }
        
        @media (max-width: 768px) {
            .nav-container {
                flex-direction: column;
                gap: 15px;
            }
            
            .nav-links {
                width: 100%;
                justify-content: center;
            }
            
            .nav-link {
                font-size: 0.85rem;
                padding: 6px 12px;
            }
        }
        `;
    }

    /**
     * Generate navigation bar
     */
    generateNavigation() {
        return `
    <nav class="dashboard-nav">
        <div class="nav-container">
            <a href="../index.html" class="nav-logo">📊 Baseline Check</a>
            <div class="nav-links">
                <a href="../index.html" class="nav-link">🏠 Hub</a>
                <a href="../baseline/baseline-dashboard.html" class="nav-link">🌐 Baseline</a>
                <a href="../performance/performance-dashboard.html" class="nav-link active">⚡ Performance</a>
                <a href="../security/security-dashboard.html" class="nav-link">🔒 Security</a>
                <a href="../accessibility/accessibility-dashboard.html" class="nav-link">♿ Accessibility</a>
                <a href="../seo/seo-dashboard.html" class="nav-link">🔍 SEO</a>
                <a href="../bundle/bundle-dashboard.html" class="nav-link">📦 Bundle</a>
            </div>
        </div>
    </nav>`;
    }

    /**
     * Generate header section
     */
    generateHeader(score, scoreColor) {
        return `
        <div class="header">
            <h1>🚀 Performance Dashboard</h1>
            <p>Comprehensive performance analysis and optimization recommendations</p>
            <div class="score-display">
                <div class="score-number" style="color: ${scoreColor}">${score}</div>
                <div class="score-label">Overall Performance Score</div>
            </div>
        </div>`;
    }

    /**
     * Generate metrics section
     */
    generateMetrics(analysis) {
        const categories = analysis.categories;
        const metrics = analysis.metrics;
        
        // Calculate total issues across all categories
        const totalIssues = Object.values(categories).reduce((sum, category) => sum + category.issues.length, 0);
        
        return `
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-header">
                    <div class="metric-title">Total Files</div>
                    <div class="metric-score" style="color: #3498db">${metrics.totalFiles}</div>
                </div>
                <div class="metric-description">Files analyzed</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-header">
                    <div class="metric-title">Total Issues</div>
                    <div class="metric-score" style="color: #e74c3c">${totalIssues}</div>
                </div>
                <div class="metric-description">Performance issues found</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-header">
                    <div class="metric-title">Bundle Issues</div>
                    <div class="metric-score" style="color: ${categories.bundle.issues.length > 0 ? '#e74c3c' : '#27ae60'}">${categories.bundle.issues.length}</div>
                </div>
                <div class="metric-description">Bundle optimization issues</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-header">
                    <div class="metric-title">Memory Issues</div>
                    <div class="metric-score" style="color: ${categories.memory.issues.length > 0 ? '#e74c3c' : '#27ae60'}">${categories.memory.issues.length}</div>
                </div>
                <div class="metric-description">Memory leak issues</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-header">
                    <div class="metric-title">Network Issues</div>
                    <div class="metric-score" style="color: ${categories.network.issues.length > 0 ? '#e74c3c' : '#27ae60'}">${categories.network.issues.length}</div>
                </div>
                <div class="metric-description">Network optimization issues</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-header">
                    <div class="metric-title">JavaScript Issues</div>
                    <div class="metric-score" style="color: ${categories.javascript.issues.length > 0 ? '#e74c3c' : '#27ae60'}">${categories.javascript.issues.length}</div>
                </div>
                <div class="metric-description">JavaScript performance issues</div>
            </div>
        </div>`;
    }

    /**
     * Generate charts section
     */
    generateCharts(analysis) {
        if (!this.options.showCharts) return '';

        return `
        <div class="charts-section">
            <h2>📊 Performance Analytics</h2>
            <p style="text-align: center; color: #666; margin-bottom: 20px; font-size: 0.9rem;">
                💡 <strong>Note:</strong> Files can appear in multiple categories as they may have different types of issues (e.g., bundle + memory + network issues)
            </p>
            <div class="charts-grid">
                <div class="chart-container">
                    <div class="chart-title">Issues by Category</div>
                    <div class="chart" id="categoryChart">
                        ${this.generateCategoryChart(analysis)}
                    </div>
                </div>
                <div class="chart-container">
                    <div class="chart-title">Severity Distribution</div>
                    <div class="chart" id="severityChart">
                        ${this.generateSeverityChart(analysis)}
                    </div>
                </div>
            </div>
        </div>`;
    }

    /**
     * Generate recommendations section
     */
    generateRecommendations(recommendations) {
        if (!this.options.showRecommendations) return '';

        return `
        <div class="recommendations-section">
            <h2>💡 Optimization Recommendations</h2>
            <div class="recommendation-tabs">
                <button class="tab-button active" onclick="showTab('immediate')">Immediate (${recommendations.immediate.length})</button>
                <button class="tab-button" onclick="showTab('shortTerm')">Short Term (${recommendations.shortTerm.length})</button>
                <button class="tab-button" onclick="showTab('longTerm')">Long Term (${recommendations.longTerm.length})</button>
                <button class="tab-button" onclick="showTab('critical')">Critical (${recommendations.critical.length})</button>
            </div>
            
            <div id="immediate" class="tab-content active">
                ${this.generateRecommendationList(recommendations.immediate)}
            </div>
            <div id="shortTerm" class="tab-content">
                ${this.generateRecommendationList(recommendations.shortTerm)}
            </div>
            <div id="longTerm" class="tab-content">
                ${this.generateRecommendationList(recommendations.longTerm)}
            </div>
            <div id="critical" class="tab-content">
                ${this.generateRecommendationList(recommendations.critical)}
            </div>
        </div>`;
    }

    /**
     * Generate issues section
     */
    generateIssues(analysis) {
        // Group issues by file to avoid overlapping display
        const issuesByFile = {};
        Object.entries(analysis.categories).forEach(([category, data]) => {
            data.issues.forEach(issue => {
                const file = issue.file || 'Unknown';
                if (!issuesByFile[file]) {
                    issuesByFile[file] = [];
                }
                issuesByFile[file].push({ ...issue, category });
            });
        });

        // Sort files by number of issues (most problematic first)
        const sortedFiles = Object.entries(issuesByFile)
            .sort(([,a], [,b]) => b.length - a.length)
            .slice(0, 15); // Show top 15 most problematic files

        const totalIssues = Object.values(issuesByFile).reduce((sum, issues) => sum + issues.length, 0);

        return `
        <div class="issues-section">
            <h2>🐛 Performance Issues by File</h2>
            <p>Found ${totalIssues} performance issues across ${Object.keys(issuesByFile).length} files</p>
            <p style="text-align: center; color: #666; margin-bottom: 20px; font-size: 0.9rem;">
                📊 <strong>Category Breakdown:</strong> ${Object.entries(analysis.categories).map(([cat, data]) => `${cat}: ${data.issues.length}`).join(' | ')}
            </p>
            <div class="file-issues-container">
                ${sortedFiles.map(([file, issues]) => `
                    <div class="file-issues-group">
                        <div class="file-header">
                            <h3>📁 ${file.split('/').pop()}</h3>
                            <span class="file-path">${file}</span>
                            <span class="issue-count">${issues.length} issues</span>
                        </div>
                        <div class="file-issues-list">
                            ${issues.map(issue => `
                                <div class="issue-item">
                                    <div class="issue-header">
                                        <div class="issue-type">${issue.type.replace(/_/g, ' ').toUpperCase()}</div>
                                        <div class="severity-badge severity-${issue.severity}">${issue.severity}</div>
                                        <div class="category-badge">${issue.category}</div>
                                    </div>
                                    <div class="issue-message">${issue.message}</div>
                                    <div class="issue-suggestion">💡 ${issue.suggestion}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            ${Object.keys(issuesByFile).length > 15 ? `<p style="text-align: center; margin-top: 20px; color: #666;">... and ${Object.keys(issuesByFile).length - 15} more files with issues</p>` : ''}
        </div>`;
    }

    /**
     * Generate footer
     */
    generateFooter() {
        return `
        <div class="footer">
            <p>Baseline Check Tool v2.3.0 - Performance Dashboard</p>
            <p>Generated on ${new Date().toLocaleString()}</p>
        </div>`;
    }

    /**
     * Generate recommendation list
     */
    generateRecommendationList(recommendations) {
        if (recommendations.length === 0) {
            return '<p style="text-align: center; color: #666; padding: 20px;">No recommendations in this category</p>';
        }

        return recommendations.map(rec => `
            <div class="recommendation-card">
                <div class="recommendation-header">
                    <div class="recommendation-title">${rec.title}</div>
                    <div class="priority-badge priority-${rec.priority}">${rec.priority}</div>
                </div>
                <div class="recommendation-description">${rec.description}</div>
                ${rec.codeExample ? `
                    <div class="code-example">
                        <pre><code>${rec.codeExample}</code></pre>
                    </div>
                ` : ''}
                ${rec.implementation && rec.implementation.length > 0 ? `
                    <div class="implementation-steps">
                        <h4>Implementation Steps:</h4>
                        <ul>
                            ${rec.implementation.map(step => `<li>${step}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    /**
     * Generate category chart
     */
    generateCategoryChart(analysis) {
        const categories = Object.entries(analysis.categories).filter(([, data]) => data.issues.length > 0);
        const maxIssues = Math.max(...categories.map(([, data]) => data.issues.length));
        
        // Add categories with 0 issues at the end
        const zeroCategories = Object.entries(analysis.categories).filter(([, data]) => data.issues.length === 0);
        const allCategories = [...categories, ...zeroCategories];
        
        return `
            <div style="padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background: #f8f9fa;">
                ${allCategories.map(([category, data]) => {
                    const width = data.issues.length > 0 ? Math.max((data.issues.length / maxIssues) * 100, 3) : 3;
                    const barHeight = '32px';
                    const opacity = data.issues.length > 0 ? '1' : '0.5';
                    
                    return `
                        <div style="margin-bottom: 20px; opacity: ${opacity};">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <div style="font-size: 0.9rem; font-weight: 600; color: #333; min-width: 140px; text-transform: capitalize;">
                                    ${this.formatCategoryName(category)}
                                </div>
                                <div style="font-size: 0.85rem; color: #fff; font-weight: bold; background: linear-gradient(135deg, #667eea, #764ba2); padding: 4px 12px; border-radius: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                    ${data.issues.length}
                                </div>
                            </div>
                            <div style="width: 100%; height: ${barHeight}; background: #e9ecef; border-radius: 16px; overflow: hidden; position: relative; box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);">
                                <div style="width: ${width}%; height: 100%; background: linear-gradient(to right, #667eea, #764ba2); border-radius: 16px; transition: all 0.3s ease; box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3); position: relative;" 
                                     onmouseover="this.style.transform='scaleY(1.05)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.4)'" 
                                     onmouseout="this.style.transform='scaleY(1)'; this.style.boxShadow='0 2px 8px rgba(102, 126, 234, 0.3)'">
                                    ${data.issues.length > 0 ? `<div style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); color: white; font-size: 0.75rem; font-weight: bold; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">${data.issues.length}</div>` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    /**
     * Generate severity chart
     */
    generateSeverityChart(analysis) {
        const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };
        
        Object.values(analysis.categories).forEach(category => {
            category.issues.forEach(issue => {
                severityCounts[issue.severity] = (severityCounts[issue.severity] || 0) + 1;
            });
        });

        const total = Object.values(severityCounts).reduce((sum, count) => sum + count, 0);
        
        return Object.entries(severityCounts).map(([severity, count]) => {
            const percentage = total > 0 ? (count / total) * 100 : 0;
            const color = this.getSeverityColor(severity);
            
            return `
                <div style="display: flex; justify-content: space-between; align-items: center; margin: 10px 0;">
                    <div style="display: flex; align-items: center;">
                        <div style="width: 12px; height: 12px; background: ${color}; border-radius: 50%; margin-right: 10px;"></div>
                        <span style="text-transform: capitalize;">${severity}</span>
                    </div>
                    <div style="font-weight: bold;">${count}</div>
                </div>
            `;
        }).join('');
    }

    /**
     * Generate JavaScript functionality
     */
    generateJavaScript() {
        return `
        function showTab(tabName) {
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Remove active class from all buttons
            document.querySelectorAll('.tab-button').forEach(button => {
                button.classList.remove('active');
            });
            
            // Show selected tab content
            document.getElementById(tabName).classList.add('active');
            
            // Add active class to clicked button
            event.target.classList.add('active');
        }
        
        // Animate progress bars on load
        document.addEventListener('DOMContentLoaded', function() {
            const progressBars = document.querySelectorAll('.metric-progress-bar');
            progressBars.forEach(bar => {
                const width = bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.width = width;
                }, 500);
            });
        });
        `;
    }

    /**
     * Helper methods
     */
    getScoreColor(score) {
        if (score >= 80) return '#28a745';
        if (score >= 60) return '#ffc107';
        if (score >= 40) return '#fd7e14';
        return '#dc3545';
    }

    getSeverityColor(severity) {
        const colors = {
            critical: '#dc3545',
            high: '#fd7e14',
            medium: '#ffc107',
            low: '#28a745'
        };
        return colors[severity] || '#6c757d';
    }

    formatCategoryName(category) {
        const names = {
            bundle: 'Bundle Size',
            memory: 'Memory Usage',
            network: 'Network',
            rendering: 'Rendering',
            javascript: 'JavaScript',
            css: 'CSS',
            images: 'Images'
        };
        return names[category] || category;
    }

    /**
     * Process empty or incomplete analysis data
     */
    processEmptyAnalysis(analysis) {
        // If analysis is null or undefined, create default structure
        if (!analysis) {
            analysis = {};
        }
        
        // Ensure categories structure exists
        if (!analysis.categories) {
            analysis.categories = {
                bundle: { score: 0, issues: [], recommendations: [] },
                memory: { score: 0, issues: [], recommendations: [] },
                network: { score: 0, issues: [], recommendations: [] },
                rendering: { score: 0, issues: [], recommendations: [] },
                javascript: { score: 0, issues: [], recommendations: [] },
                css: { score: 0, issues: [], recommendations: [] },
                images: { score: 0, issues: [], recommendations: [] }
            };
        }
        
        // Ensure metrics structure exists
        if (!analysis.metrics) {
            analysis.metrics = {
                totalFiles: 0,
                largeFiles: 0,
                duplicateCode: 0,
                unusedImports: 0,
                inefficientQueries: 0,
                memoryLeaks: 0,
                slowOperations: 0
            };
        }
        
        // Ensure overallScore exists
        if (analysis.overallScore === undefined || analysis.overallScore === null) {
            // Calculate score from categories if available
            const categoryScores = Object.values(analysis.categories)
                .map(cat => cat.score || 0)
                .filter(score => score > 0);
            
            if (categoryScores.length > 0) {
                analysis.overallScore = Math.round(
                    categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length
                );
            } else {
                analysis.overallScore = 100; // Default to perfect score if no data
            }
        }
        
        // Ensure criticalIssues exists
        if (!analysis.criticalIssues) {
            analysis.criticalIssues = [];
        }
        
        return analysis;
    }
}

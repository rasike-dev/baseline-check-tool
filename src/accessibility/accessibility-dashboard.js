/**
 * Accessibility Dashboard Generator
 * Creates interactive HTML dashboard for accessibility analysis results
 */

export class AccessibilityDashboard {
  constructor(options = {}) {
    this.options = {
      theme: 'dark',
      includeCharts: true,
      includeCodeExamples: true,
      includeWCAGReferences: true,
      ...options
    };
  }

  /**
   * Generate accessibility dashboard HTML
   */
  generateDashboard(analysis, recommendations) {
    // Calculate accessibility score if missing or 0
    let accessibilityScore = analysis?.accessibilityScore || 0;
    if (accessibilityScore === 0 && analysis?.summary?.totalIssues > 0) {
      // Calculate score based on issues (100 - (issues * penalty))
      const penalty = Math.min(analysis.summary.totalIssues * 0.5, 100);
      accessibilityScore = Math.max(0, Math.round(100 - penalty));
    }
    
    const wcagLevel = analysis?.wcagLevel || 'A';
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accessibility Analysis Dashboard</title>
    <style>
        ${this.generateCSS()}
    </style>
</head>
<body class="${this.options.theme}">
    ${this.generateNavigation()}
    <div class="dashboard">
        <header class="dashboard-header">
            <h1>♿ Accessibility Analysis Dashboard</h1>
            <div class="header-info">
                <span class="score-badge score-${this.getScoreClass(accessibilityScore)}">
                    ${accessibilityScore}/100
                </span>
                <span class="wcag-badge wcag-${wcagLevel.toLowerCase()}">
                    WCAG ${wcagLevel}
                </span>
            </div>
        </header>

        <div class="dashboard-content">
            ${this.generateMetrics(analysis)}
            ${this.generateCharts(analysis)}
            ${this.generateIssues(analysis)}
            ${this.generateRecommendations(recommendations)}
        </div>
    </div>

    <script>
        ${this.generateJavaScript()}
    </script>
</body>
</html>`;

    return html;
  }

  /**
   * Generate CSS styles
   */
  generateCSS() {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: var(--text-color);
            background: var(--bg-color);
        }

        .dashboard {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
            margin-top: 20px;
            padding: 20px;
            background: var(--card-bg);
            border-radius: 12px;
            box-shadow: var(--shadow);
            flex-wrap: wrap;
            gap: 15px;
        }

        .dashboard-header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--primary-color);
            margin: 0;
            flex: 1;
            min-width: 300px;
        }

        .header-info {
            display: flex;
            gap: 15px;
            align-items: center;
            flex-wrap: wrap;
        }

        .score-badge {
            padding: 10px 20px;
            border-radius: 25px;
            font-size: 1.2rem;
            font-weight: 700;
            text-align: center;
            min-width: 80px;
        }

        .score-excellent { background: #10b981; color: white; }
        .score-good { background: #3b82f6; color: white; }
        .score-fair { background: #f59e0b; color: white; }
        .score-poor { background: #ef4444; color: white; }

        .wcag-badge {
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .wcag-aaa { background: #10b981; color: white; }
        .wcag-aa { background: #3b82f6; color: white; }
        .wcag-a { background: #f59e0b; color: white; }

        .dashboard-content {
            display: grid;
            gap: 30px;
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 24px;
        }

        .metric-card {
            background: var(--card-bg);
            padding: 28px 24px;
            border-radius: 16px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            border: 1px solid var(--border-color);
            text-align: left;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            position: relative;
            overflow: hidden;
        }

        .metric-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 4px;
            height: 100%;
            background: var(--primary-color);
            opacity: 0;
            transition: opacity 0.3s ease;
        }

        .metric-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
            border-color: var(--primary-color);
        }

        .metric-card:hover::before {
            opacity: 1;
        }

        .metric-card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
        }

        .metric-icon {
            font-size: 1.5rem;
            opacity: 0.7;
        }

        .metric-value {
            font-size: 2.75rem;
            font-weight: 700;
            color: var(--text-color);
            margin: 0;
            line-height: 1;
            letter-spacing: -0.02em;
        }

        .metric-label {
            font-size: 0.875rem;
            color: var(--text-muted);
            font-weight: 500;
            text-transform: none;
            letter-spacing: 0.01em;
            line-height: 1.5;
            margin-top: 12px;
        }

        .metric-card.score-card .metric-value {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .metric-card.issues-card .metric-value {
            color: var(--text-color);
        }

        .metric-card.critical-card .metric-value {
            color: #ef4444;
        }

        .metric-card.medium-card .metric-value {
            color: #f59e0b;
        }

        .metric-card.low-card .metric-value {
            color: #3b82f6;
        }

        .metric-card.wcag-card .metric-value {
            color: var(--primary-color);
        }

        .charts-section {
            background: var(--card-bg);
            padding: 30px;
            border-radius: 16px;
            box-shadow: var(--shadow);
        }

        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 24px;
            margin-top: 20px;
        }

        .chart-container {
            background: var(--card-bg);
            padding: 24px;
            border-radius: 12px;
            border: 1px solid var(--border-color);
            transition: all 0.3s ease;
        }

        .chart-container:hover {
            border-color: var(--primary-color);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .chart-title {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 20px;
            color: var(--text-color);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        /* Progress Bar Style Charts */
        .chart-item {
            margin-bottom: 20px;
        }

        .chart-item:last-child {
            margin-bottom: 0;
        }

        .chart-item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }

        .chart-item-label {
            font-size: 0.9rem;
            font-weight: 500;
            color: var(--text-color);
            display: flex;
            align-items: center;
            gap: 8px;
            text-transform: capitalize;
        }

        .chart-item-label .icon {
            font-size: 1rem;
        }

        .chart-item-value {
            font-size: 1.1rem;
            font-weight: 700;
            color: var(--text-color);
        }

        .chart-progress-bar {
            width: 100%;
            height: 12px;
            background: var(--bg-color);
            border-radius: 6px;
            overflow: hidden;
            position: relative;
        }

        .chart-progress-fill {
            height: 100%;
            border-radius: 6px;
            transition: width 0.6s ease;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 8px;
        }

        .chart-progress-fill::after {
            content: '';
            position: absolute;
            right: 0;
            top: 0;
            bottom: 0;
            width: 2px;
            background: rgba(255, 255, 255, 0.3);
        }

        .chart-progress-text {
            font-size: 0.75rem;
            font-weight: 600;
            color: white;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }

        .chart-empty-state {
            text-align: center;
            padding: 40px 20px;
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        /* Severity specific colors */
        .severity-high .chart-progress-fill { background: linear-gradient(90deg, #ef4444, #dc2626); }
        .severity-medium .chart-progress-fill { background: linear-gradient(90deg, #f59e0b, #d97706); }
        .severity-low .chart-progress-fill { background: linear-gradient(90deg, #3b82f6, #2563eb); }

        /* Category colors */
        .category-item:nth-child(1) .chart-progress-fill { background: linear-gradient(90deg, #3b82f6, #2563eb); }
        .category-item:nth-child(2) .chart-progress-fill { background: linear-gradient(90deg, #10b981, #059669); }
        .category-item:nth-child(3) .chart-progress-fill { background: linear-gradient(90deg, #f59e0b, #d97706); }
        .category-item:nth-child(4) .chart-progress-fill { background: linear-gradient(90deg, #ef4444, #dc2626); }
        .category-item:nth-child(5) .chart-progress-fill { background: linear-gradient(90deg, #8b5cf6, #7c3aed); }
        .category-item:nth-child(6) .chart-progress-fill { background: linear-gradient(90deg, #06b6d4, #0891b2); }

        /* WCAG colors */
        .wcag-a .chart-progress-fill { background: linear-gradient(90deg, #f59e0b, #d97706); }
        .wcag-aa .chart-progress-fill { background: linear-gradient(90deg, #3b82f6, #2563eb); }
        .wcag-aaa .chart-progress-fill { background: linear-gradient(90deg, #10b981, #059669); }

        .issues-section {
            background: var(--card-bg);
            padding: 30px;
            border-radius: 12px;
            box-shadow: var(--shadow);
        }

        .section-title {
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 20px;
            color: var(--text-color);
        }

        .issues-list {
            display: grid;
            gap: 15px;
        }

        .issue-item {
            background: var(--bg-color);
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid var(--border-color);
            transition: all 0.2s ease;
        }

        .issue-item:hover {
            transform: translateX(5px);
            box-shadow: var(--shadow);
        }

        .issue-item.severity-high { border-left-color: #ef4444; }
        .issue-item.severity-medium { border-left-color: #f59e0b; }
        .issue-item.severity-low { border-left-color: #3b82f6; }

        .issue-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }

        .issue-title {
            font-size: 1.1rem;
            font-weight: 600;
            color: var(--text-color);
        }

        .issue-severity {
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .severity-high { background: #fef2f2; color: #dc2626; }
        .severity-medium { background: #fffbeb; color: #d97706; }
        .severity-low { background: #eff6ff; color: #2563eb; }

        .issue-description {
            color: var(--text-muted);
            margin-bottom: 10px;
        }

        .issue-suggestion {
            background: var(--suggestion-bg);
            padding: 10px;
            border-radius: 6px;
            font-size: 0.9rem;
            color: var(--text-color);
            margin-bottom: 10px;
        }

        .issue-code {
            background: var(--code-bg);
            padding: 10px;
            border-radius: 6px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.85rem;
            color: var(--code-color);
            margin-bottom: 10px;
            overflow-x: auto;
        }

        .issue-fix {
            background: var(--fix-bg);
            padding: 10px;
            border-radius: 6px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.85rem;
            color: var(--fix-color);
            overflow-x: auto;
        }

        .recommendations-section {
            background: var(--card-bg);
            padding: 30px;
            border-radius: 12px;
            box-shadow: var(--shadow);
        }

        .recommendations-grid {
            display: grid;
            gap: 20px;
        }

        .recommendation-card {
            background: var(--bg-color);
            padding: 25px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
            transition: all 0.2s ease;
        }

        .recommendation-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow);
        }

        .recommendation-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .recommendation-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: var(--text-color);
        }

        .recommendation-priority {
            padding: 6px 12px;
            border-radius: 15px;
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .priority-critical { background: #fef2f2; color: #dc2626; }
        .priority-high { background: #fffbeb; color: #d97706; }
        .priority-medium { background: #eff6ff; color: #2563eb; }
        .priority-low { background: #f0fdf4; color: #16a34a; }

        .recommendation-description {
            color: var(--text-muted);
            margin-bottom: 15px;
        }

        .recommendation-actions {
            margin-bottom: 15px;
        }

        .actions-title {
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--text-color);
            margin-bottom: 8px;
        }

        .actions-list {
            list-style: none;
            padding-left: 0;
        }

        .actions-list li {
            padding: 4px 0;
            color: var(--text-muted);
            font-size: 0.9rem;
        }

        .actions-list li:before {
            content: "✓";
            color: var(--primary-color);
            font-weight: bold;
            margin-right: 8px;
        }

        .code-example {
            background: var(--code-bg);
            padding: 15px;
            border-radius: 6px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.85rem;
            margin-bottom: 10px;
        }

        .code-before {
            color: #ef4444;
            margin-bottom: 10px;
        }

        .code-after {
            color: #10b981;
        }

        .code-label {
            font-size: 0.8rem;
            font-weight: 600;
            text-transform: uppercase;
            margin-bottom: 5px;
            color: var(--text-muted);
        }

        /* Navigation Styles */
        .dashboard-nav {
            position: sticky;
            top: 0;
            z-index: 1000;
            background: rgba(15, 23, 42, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid #334155;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            margin-bottom: 20px;
        }
        
        .light .dashboard-nav {
            background: rgba(255, 255, 255, 0.95);
            border-bottom: 1px solid #e2e8f0;
        }
        
        .nav-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .nav-logo {
            font-size: 1.3rem;
            font-weight: bold;
            color: #f1f5f9;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: color 0.2s;
        }
        
        .light .nav-logo {
            color: #1e293b;
        }
        
        .nav-logo:hover {
            color: #3b82f6;
        }
        
        .nav-links {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .nav-link {
            padding: 8px 16px;
            color: #94a3b8;
            text-decoration: none;
            border-radius: 6px;
            transition: all 0.2s;
            font-size: 0.9rem;
            white-space: nowrap;
        }
        
        .light .nav-link {
            color: #64748b;
        }
        
        .nav-link:hover {
            background: #1e293b;
            color: #f1f5f9;
        }
        
        .light .nav-link:hover {
            background: #f1f5f9;
            color: #1e293b;
        }
        
        .nav-link.active {
            background: #3b82f6;
            color: #ffffff;
        }
        
        .dashboard {
            padding-top: 0;
        }

        /* Dark theme */
        .dark {
            --bg-color: #0f172a;
            --card-bg: #1e293b;
            --text-color: #f1f5f9;
            --text-muted: #94a3b8;
            --primary-color: #3b82f6;
            --primary-light: #60a5fa;
            --border-color: #334155;
            --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
            --suggestion-bg: #1e293b;
            --code-bg: #0f172a;
            --code-color: #f1f5f9;
            --fix-bg: #064e3b;
            --fix-color: #10b981;
        }

        /* Light theme */
        .light {
            --bg-color: #ffffff;
            --card-bg: #f8fafc;
            --text-color: #1e293b;
            --text-muted: #64748b;
            --primary-color: #3b82f6;
            --primary-light: #60a5fa;
            --border-color: #e2e8f0;
            --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            --suggestion-bg: #f1f5f9;
            --code-bg: #f8fafc;
            --code-color: #1e293b;
            --fix-bg: #ecfdf5;
            --fix-color: #059669;
        }

        @media (max-width: 768px) {
            .dashboard {
                padding: 10px;
            }
            
            .dashboard-header {
                flex-direction: column;
                gap: 15px;
                text-align: center;
                margin-top: 10px;
            }
            
            .dashboard-header h1 {
                font-size: 1.8rem;
                min-width: auto;
            }
            
            .header-info {
                justify-content: center;
                width: 100%;
            }
            
            .metrics-grid {
                grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                gap: 16px;
            }
            
            .metric-card {
                padding: 20px 16px;
            }
            
            .metric-value {
                font-size: 2.25rem;
            }
            
            .metric-label {
                font-size: 0.8rem;
            }
            
            .charts-grid {
                grid-template-columns: 1fr;
            }
            
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
   * Generate metrics section
   */
  generateMetrics(analysis) {
    // Handle empty or incomplete analysis data
    if (!analysis) {
      analysis = {
        accessibilityScore: 0,
        wcagLevel: 'A',
        summary: {
          totalIssues: 0,
          bySeverity: { high: 0, medium: 0, low: 0 }
        }
      };
    }
    
    const summary = analysis.summary || {};
    const bySeverity = summary.bySeverity || { high: 0, medium: 0, low: 0 };
    
    // Calculate accessibility score if missing or 0
    let accessibilityScore = analysis.accessibilityScore || 0;
    if (accessibilityScore === 0 && summary.totalIssues > 0) {
      // Calculate score based on issues (100 - (issues * penalty))
      const penalty = Math.min(summary.totalIssues * 0.5, 100);
      accessibilityScore = Math.max(0, Math.round(100 - penalty));
    }
    
    return `
        <div class="metrics-grid">
            <div class="metric-card score-card">
                <div class="metric-card-header">
                    <div class="metric-icon">📊</div>
                </div>
                <div class="metric-value">${accessibilityScore}</div>
                <div class="metric-label">Accessibility Score</div>
            </div>
            <div class="metric-card issues-card">
                <div class="metric-card-header">
                    <div class="metric-icon">🔍</div>
                </div>
                <div class="metric-value">${summary.totalIssues || 0}</div>
                <div class="metric-label">Total Issues</div>
            </div>
            <div class="metric-card critical-card">
                <div class="metric-card-header">
                    <div class="metric-icon">🔴</div>
                </div>
                <div class="metric-value">${bySeverity.high || 0}</div>
                <div class="metric-label">Critical Issues</div>
            </div>
            <div class="metric-card medium-card">
                <div class="metric-card-header">
                    <div class="metric-icon">🟡</div>
                </div>
                <div class="metric-value">${bySeverity.medium || 0}</div>
                <div class="metric-label">Medium Issues</div>
            </div>
            <div class="metric-card low-card">
                <div class="metric-card-header">
                    <div class="metric-icon">🔵</div>
                </div>
                <div class="metric-value">${bySeverity.low || 0}</div>
                <div class="metric-label">Low Issues</div>
            </div>
            <div class="metric-card wcag-card">
                <div class="metric-card-header">
                    <div class="metric-icon">♿</div>
                </div>
                <div class="metric-value">${analysis.wcagLevel || 'A'}</div>
                <div class="metric-label">WCAG Level</div>
            </div>
        </div>
    `;
  }

  /**
   * Generate charts section
   */
  generateCharts(analysis) {
    if (!this.options.includeCharts) return '';

    // Handle empty or incomplete analysis data
    if (!analysis || !analysis.summary) {
      return `
        <div class="charts-section">
            <h2 class="section-title">📊 Accessibility Analysis</h2>
            <div class="charts-grid">
                <div class="chart-container">
                    <div class="chart-title">Issues by Severity</div>
                    <div class="chart" id="severity-chart">
                        <div style="text-align: center; color: var(--text-muted); padding: 40px;">No data available</div>
                    </div>
                </div>
                <div class="chart-container">
                    <div class="chart-title">Issues by Category</div>
                    <div class="chart" id="category-chart">
                        <div style="text-align: center; color: var(--text-muted); padding: 40px;">No data available</div>
                    </div>
                </div>
                <div class="chart-container">
                    <div class="chart-title">WCAG Compliance</div>
                    <div class="chart" id="wcag-chart">
                        <div style="text-align: center; color: var(--text-muted); padding: 40px;">No data available</div>
                    </div>
                </div>
            </div>
        </div>
      `;
    }

    const summary = analysis.summary;
    const bySeverity = summary.bySeverity || { high: 0, medium: 0, low: 0 };
    const byCategory = summary.byCategory || {};
    const byWCAGLevel = summary.byWCAGLevel || {};
    
    return `
        <div class="charts-section">
            <h2 class="section-title">📊 Accessibility Analysis</h2>
            <div class="charts-grid">
                <div class="chart-container">
                    <div class="chart-title">Issues by Severity</div>
                    <div class="chart" id="severity-chart">
                        ${this.generateSeverityChart(bySeverity)}
                    </div>
                </div>
                <div class="chart-container">
                    <div class="chart-title">Issues by Category</div>
                    <div class="chart" id="category-chart">
                        ${this.generateCategoryChart(byCategory)}
                    </div>
                </div>
                <div class="chart-container">
                    <div class="chart-title">WCAG Compliance</div>
                    <div class="chart" id="wcag-chart">
                        ${this.generateWCAGChart(byWCAGLevel)}
                    </div>
                </div>
            </div>
        </div>
    `;
  }

  /**
   * Generate severity chart
   */
  generateSeverityChart(bySeverity) {
    if (!bySeverity || (bySeverity.high === 0 && bySeverity.medium === 0 && bySeverity.low === 0)) {
      return '<div class="chart-empty-state">No severity data available</div>';
    }
    
    const total = (bySeverity.high || 0) + (bySeverity.medium || 0) + (bySeverity.low || 0);
    if (total === 0) {
      return '<div class="chart-empty-state">No issues found</div>';
    }
    
    const items = [
      { label: 'High', value: bySeverity.high || 0, icon: '🔴', class: 'severity-high' },
      { label: 'Medium', value: bySeverity.medium || 0, icon: '🟡', class: 'severity-medium' },
      { label: 'Low', value: bySeverity.low || 0, icon: '🔵', class: 'severity-low' }
    ];

    return items.map(item => {
      const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
      return `
        <div class="chart-item ${item.class}">
          <div class="chart-item-header">
            <div class="chart-item-label">
              <span class="icon">${item.icon}</span>
              <span>${item.label}</span>
            </div>
            <div class="chart-item-value">${item.value}</div>
          </div>
          <div class="chart-progress-bar">
            <div class="chart-progress-fill" style="width: ${percentage}%;">
              ${percentage > 10 ? `<span class="chart-progress-text">${percentage}%</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Generate category chart
   */
  generateCategoryChart(byCategory) {
    const categories = Object.entries(byCategory);
    if (categories.length === 0) {
      return '<div class="chart-empty-state">No category data available</div>';
    }
    
    const total = categories.reduce((sum, [, count]) => sum + count, 0);
    if (total === 0) {
      return '<div class="chart-empty-state">No issues found</div>';
    }
    
    // Sort by count (descending) for better visualization
    const sortedCategories = categories.sort((a, b) => b[1] - a[1]);
    
    // Format category name for display
    const formatCategoryName = (name) => {
      return name
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    return sortedCategories.map(([category, count], index) => {
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return `
        <div class="chart-item category-item">
          <div class="chart-item-header">
            <div class="chart-item-label">
              <span>${formatCategoryName(category)}</span>
            </div>
            <div class="chart-item-value">${count}</div>
          </div>
          <div class="chart-progress-bar">
            <div class="chart-progress-fill" style="width: ${percentage}%;">
              ${percentage > 8 ? `<span class="chart-progress-text">${percentage}%</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Generate WCAG chart
   */
  generateWCAGChart(byWCAGLevel) {
    if (!byWCAGLevel || (byWCAGLevel.A === 0 && byWCAGLevel.AA === 0 && byWCAGLevel.AAA === 0)) {
      return '<div class="chart-empty-state">No WCAG compliance data available</div>';
    }
    
    const total = (byWCAGLevel.A || 0) + (byWCAGLevel.AA || 0) + (byWCAGLevel.AAA || 0);
    if (total === 0) {
      return '<div class="chart-empty-state">No compliance data found</div>';
    }
    
    const levels = [
      { label: 'A', value: byWCAGLevel.A || 0, icon: '🟡', class: 'wcag-a' },
      { label: 'AA', value: byWCAGLevel.AA || 0, icon: '🔵', class: 'wcag-aa' },
      { label: 'AAA', value: byWCAGLevel.AAA || 0, icon: '🟢', class: 'wcag-aaa' }
    ];

    return levels.map(level => {
      const percentage = total > 0 ? Math.round((level.value / total) * 100) : 0;
      return `
        <div class="chart-item ${level.class}">
          <div class="chart-item-header">
            <div class="chart-item-label">
              <span class="icon">${level.icon}</span>
              <span>WCAG ${level.label}</span>
            </div>
            <div class="chart-item-value">${level.value}</div>
          </div>
          <div class="chart-progress-bar">
            <div class="chart-progress-fill" style="width: ${percentage}%;">
              ${percentage > 10 ? `<span class="chart-progress-text">${percentage}%</span>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Generate issues section
   */
  generateIssues(analysis) {
    if (analysis.issues.length === 0) {
      return `
        <div class="issues-section">
          <h2 class="section-title">✅ No Accessibility Issues Found</h2>
          <p style="text-align: center; color: var(--text-muted); font-size: 1.1rem;">
            Great job! Your code appears to be accessible.
          </p>
        </div>
      `;
    }

    const issuesBySeverity = {
      high: analysis.issues.filter(i => i.severity === 'high'),
      medium: analysis.issues.filter(i => i.severity === 'medium'),
      low: analysis.issues.filter(i => i.severity === 'low')
    };

    return `
        <div class="issues-section">
            <h2 class="section-title">🔍 Accessibility Issues (${analysis.issues.length} found)</h2>
            <div class="issues-list">
                ${this.generateIssuesList(issuesBySeverity.high, 'Critical Issues')}
                ${this.generateIssuesList(issuesBySeverity.medium, 'Medium Issues')}
                ${this.generateIssuesList(issuesBySeverity.low, 'Low Issues')}
            </div>
        </div>
    `;
  }

  /**
   * Generate issues list for a severity level
   */
  generateIssuesList(issues, title) {
    if (issues.length === 0) return '';

    return `
        <div style="margin-bottom: 30px;">
            <h3 style="font-size: 1.2rem; font-weight: 600; margin-bottom: 15px; color: var(--text-color);">
                ${title} (${issues.length})
            </h3>
            ${issues.map(issue => this.generateIssueItem(issue)).join('')}
        </div>
    `;
  }

  /**
   * Generate individual issue item
   */
  generateIssueItem(issue) {
    return `
        <div class="issue-item severity-${issue.severity}">
            <div class="issue-header">
                <div class="issue-title">${issue.title}</div>
                <div class="issue-severity severity-${issue.severity}">${issue.severity}</div>
            </div>
            <div class="issue-description">${issue.description}</div>
            <div class="issue-suggestion">
                <strong>Suggestion:</strong> ${issue.suggestion}
            </div>
            <div class="issue-code">
                <strong>Code:</strong> ${issue.code}
            </div>
            <div class="issue-fix">
                <strong>Fix:</strong> ${issue.fix}
            </div>
            <div style="margin-top: 10px; font-size: 0.8rem; color: var(--text-muted);">
                <strong>WCAG:</strong> ${issue.wcag} (Level ${issue.level}) | 
                <strong>File:</strong> ${issue.file} | 
                <strong>Line:</strong> ${issue.line}
            </div>
        </div>
    `;
  }

  /**
   * Generate recommendations section
   */
  generateRecommendations(recommendations) {
    if (!recommendations || Object.keys(recommendations).length === 0) return '';

    return `
        <div class="recommendations-section">
            <h2 class="section-title">💡 Recommendations</h2>
            <div class="recommendations-grid">
                ${this.generateRecommendationsList(recommendations.critical, 'Critical Priority')}
                ${this.generateRecommendationsList(recommendations.high, 'High Priority')}
                ${this.generateRecommendationsList(recommendations.medium, 'Medium Priority')}
                ${this.generateRecommendationsList(recommendations.low, 'Low Priority')}
            </div>
        </div>
    `;
  }

  /**
   * Generate recommendations list for a priority level
   */
  generateRecommendationsList(recs, title) {
    if (!recs || recs.length === 0) return '';

    return `
        <div style="margin-bottom: 30px;">
            <h3 style="font-size: 1.2rem; font-weight: 600; margin-bottom: 15px; color: var(--text-color);">
                ${title} (${recs.length})
            </h3>
            ${recs.map(rec => this.generateRecommendationCard(rec)).join('')}
        </div>
    `;
  }

  /**
   * Generate individual recommendation card
   */
  generateRecommendationCard(rec) {
    return `
        <div class="recommendation-card">
            <div class="recommendation-header">
                <div class="recommendation-title">${rec.title}</div>
                <div class="recommendation-priority priority-${rec.priority}">${rec.priority}</div>
            </div>
            <div class="recommendation-description">${rec.description}</div>
            <div class="recommendation-actions">
                <div class="actions-title">Actions to take:</div>
                <ul class="actions-list">
                    ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                </ul>
            </div>
            ${rec.codeExample ? `
                <div class="code-example">
                    <div class="code-label">Before:</div>
                    <div class="code-before">${rec.codeExample.before}</div>
                    <div class="code-label">After:</div>
                    <div class="code-after">${rec.codeExample.after}</div>
                </div>
            ` : ''}
            <div style="margin-top: 15px; font-size: 0.8rem; color: var(--text-muted);">
                <strong>WCAG:</strong> ${rec.wcag} (Level ${rec.level}) | 
                <strong>Issues:</strong> ${rec.issues} | 
                <strong>Effort:</strong> ${rec.effort}
            </div>
        </div>
    `;
  }

  /**
   * Generate JavaScript
   */
  generateJavaScript() {
    return `
        // Dashboard functionality
        document.addEventListener('DOMContentLoaded', function() {
            // Add hover effects to charts
            const bars = document.querySelectorAll('.bar');
            bars.forEach(bar => {
                bar.addEventListener('mouseenter', function() {
                    this.style.opacity = '0.8';
                    this.style.transform = 'scaleY(1.05)';
                });
                
                bar.addEventListener('mouseleave', function() {
                    this.style.opacity = '1';
                    this.style.transform = 'scaleY(1)';
                });
            });

            // Add click handlers for issue items
            const issueItems = document.querySelectorAll('.issue-item');
            issueItems.forEach(item => {
                item.addEventListener('click', function() {
                    this.style.transform = 'translateX(10px)';
                    setTimeout(() => {
                        this.style.transform = 'translateX(5px)';
                    }, 200);
                });
            });

            // Add click handlers for recommendation cards
            const recCards = document.querySelectorAll('.recommendation-card');
            recCards.forEach(card => {
                card.addEventListener('click', function() {
                    this.style.transform = 'translateY(-4px)';
                    setTimeout(() => {
                        this.style.transform = 'translateY(-2px)';
                    }, 200);
                });
            });
        });
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
                <a href="../performance/performance-dashboard.html" class="nav-link">⚡ Performance</a>
                <a href="../security/security-dashboard.html" class="nav-link">🔒 Security</a>
                <a href="../accessibility/accessibility-dashboard.html" class="nav-link active">♿ Accessibility</a>
                <a href="../seo/seo-dashboard.html" class="nav-link">🔍 SEO</a>
                <a href="../bundle/bundle-dashboard.html" class="nav-link">📦 Bundle</a>
            </div>
        </div>
    </nav>`;
  }

  /**
   * Get score class for styling
   */
  getScoreClass(score) {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    return 'poor';
  }
}

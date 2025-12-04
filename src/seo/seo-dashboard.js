/**
 * SEO Dashboard Generator
 * Creates interactive HTML dashboard for SEO analysis results
 */

export class SEODashboard {
  constructor(options = {}) {
    this.options = {
      theme: 'dark',
      includeCharts: true,
      includeCodeExamples: true,
      includeImpactLevels: true,
      ...options
    };
  }

  /**
   * Generate SEO dashboard HTML
   */
  generateDashboard(analysis, recommendations) {
    // Process and validate analysis data
    const processedAnalysis = this.processAnalysisData(analysis);
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SEO Analysis Dashboard</title>
    <style>
        ${this.generateCSS()}
    </style>
</head>
<body class="${this.options.theme}">
    ${this.generateNavigation('seo')}
    <div class="dashboard">
        <header class="dashboard-header">
            <h1>🔍 SEO Analysis Dashboard</h1>
            <div class="header-info">
                <span class="score-badge score-${this.getScoreClass(processedAnalysis.seoScore)}">
                    ${processedAnalysis.seoScore}/100
                </span>
                <span class="seo-badge seo-${processedAnalysis.seoLevel.toLowerCase()}">
                    ${processedAnalysis.seoLevel}
                </span>
            </div>
        </header>

        <div class="dashboard-content">
            ${this.generateMetrics(processedAnalysis)}
            ${this.generateCharts(processedAnalysis)}
            ${this.generateIssues(processedAnalysis)}
            ${this.generateRecommendations(recommendations)}
        </div>
    </div>

    <script>
        // Embed analysis data for JavaScript
        const analysisData = ${JSON.stringify(processedAnalysis)};
        ${this.generateJavaScript()}
    </script>
</body>
</html>`;

    return html;
  }

  /**
   * Process and validate analysis data
   */
  processAnalysisData(analysis) {
    if (!analysis) {
      return {
        issues: [],
        seoScore: 100,
        seoLevel: 'Excellent',
        summary: {
          totalIssues: 0,
          bySeverity: { high: 0, medium: 0, low: 0 },
          byCategory: {}
        }
      };
    }

    // Ensure issues array exists
    const issues = analysis.issues || [];
    
    // Calculate score if missing, or recalculate if it's 0 and we have issues
    let seoScore = analysis.seoScore;
    if (seoScore === undefined || seoScore === null || (seoScore === 0 && issues.length > 0)) {
      seoScore = this.calculateScore(issues);
    }
    
    // Determine level if missing
    let seoLevel = analysis.seoLevel;
    if (!seoLevel) {
      seoLevel = this.determineLevel(seoScore, issues);
    }

    // Ensure summary exists
    let summary = analysis.summary;
    if (!summary) {
      summary = this.generateSummary(issues);
    } else {
      // Validate and fix summary structure
      if (!summary.totalIssues && summary.totalIssues !== 0) {
        summary.totalIssues = issues.length;
      }
      if (!summary.bySeverity) {
        summary.bySeverity = {
          high: issues.filter(i => i.severity === 'high').length,
          medium: issues.filter(i => i.severity === 'medium').length,
          low: issues.filter(i => i.severity === 'low').length
        };
      }
      if (!summary.byCategory) {
        summary.byCategory = {};
        issues.forEach(issue => {
          const category = issue.category || 'other';
          summary.byCategory[category] = (summary.byCategory[category] || 0) + 1;
        });
      }
    }

    return {
      issues,
      seoScore,
      seoLevel,
      summary
    };
  }

  /**
   * Calculate SEO score from issues
   */
  calculateScore(issues) {
    let score = 100;
    
    issues.forEach(issue => {
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
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Determine SEO level from score and issues
   */
  determineLevel(score, issues) {
    const highIssues = issues.filter(i => i.severity === 'high').length;
    const mediumIssues = issues.filter(i => i.severity === 'medium').length;
    
    if (score >= 90 && highIssues === 0 && mediumIssues <= 2) {
      return 'Excellent';
    } else if (score >= 75 && highIssues <= 1 && mediumIssues <= 5) {
      return 'Good';
    } else if (score >= 60 && highIssues <= 3 && mediumIssues <= 10) {
      return 'Fair';
    } else if (score >= 40 && highIssues <= 5 && mediumIssues <= 15) {
      return 'Poor';
    } else {
      return 'Critical';
    }
  }

  /**
   * Generate summary from issues
   */
  generateSummary(issues) {
    const bySeverity = {
      high: issues.filter(i => i.severity === 'high').length,
      medium: issues.filter(i => i.severity === 'medium').length,
      low: issues.filter(i => i.severity === 'low').length
    };

    const byCategory = {};
    issues.forEach(issue => {
      const category = issue.category || 'other';
      byCategory[category] = (byCategory[category] || 0) + 1;
    });

    return {
      totalIssues: issues.length,
      bySeverity,
      byCategory
    };
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
            padding: 20px;
            background: var(--card-bg);
            border-radius: 12px;
            box-shadow: var(--shadow);
        }

        .dashboard-header h1 {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--primary-color);
        }

        .header-info {
            display: flex;
            gap: 15px;
            align-items: center;
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
        .score-critical { background: #dc2626; color: white; }

        .seo-badge {
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .seo-excellent { background: #10b981; color: white; }
        .seo-good { background: #3b82f6; color: white; }
        .seo-fair { background: #f59e0b; color: white; }
        .seo-poor { background: #ef4444; color: white; }
        .seo-critical { background: #dc2626; color: white; }

        .dashboard-content {
            display: grid;
            gap: 30px;
        }

        .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }

        .metric-card {
            background: var(--card-bg);
            padding: 25px;
            border-radius: 12px;
            box-shadow: var(--shadow);
            text-align: center;
            transition: transform 0.2s ease;
        }

        .metric-card:hover {
            transform: translateY(-2px);
        }

        .metric-value {
            font-size: 2.5rem;
            font-weight: 700;
            color: var(--primary-color);
            margin-bottom: 8px;
        }

        .metric-label {
            font-size: 0.9rem;
            color: var(--text-muted);
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .charts-section {
            background: var(--card-bg);
            padding: 30px;
            border-radius: 12px;
            box-shadow: var(--shadow);
        }

        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-top: 20px;
        }

        .chart-container {
            background: var(--bg-color);
            padding: 20px;
            border-radius: 8px;
            border: 1px solid var(--border-color);
        }

        .chart-title {
            font-size: 1.1rem;
            font-weight: 600;
            margin-bottom: 15px;
            color: var(--text-color);
        }

        .chart {
            min-height: auto;
            display: flex;
            flex-direction: column;
            gap: 15px;
            padding: 10px 0;
        }

        .chart-item {
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
            position: relative;
            transition: width 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding-right: 6px;
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
        .category-item:nth-child(7) .chart-progress-fill { background: linear-gradient(90deg, #f472b6, #ec4899); }
        .category-item:nth-child(8) .chart-progress-fill { background: linear-gradient(90deg, #a78bfa, #8b5cf6); }

        /* Score range colors */
        .score-range-critical .chart-progress-fill { background: linear-gradient(90deg, #dc2626, #991b1b); }
        .score-range-poor .chart-progress-fill { background: linear-gradient(90deg, #ef4444, #dc2626); }
        .score-range-fair .chart-progress-fill { background: linear-gradient(90deg, #f59e0b, #d97706); }
        .score-range-good .chart-progress-fill { background: linear-gradient(90deg, #3b82f6, #2563eb); }
        .score-range-excellent .chart-progress-fill { background: linear-gradient(90deg, #10b981, #059669); }

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

        /* Navigation bar styles */
        .dashboard-nav {
            position: sticky;
            top: 0;
            z-index: 1000;
            background: var(--card-bg);
            border-bottom: 1px solid var(--border-color);
            box-shadow: var(--shadow);
            margin-bottom: 20px;
        }

        .nav-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 15px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
        }

        .nav-logo {
            font-size: 1.3rem;
            font-weight: 700;
            color: var(--primary-color);
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .nav-logo:hover {
            opacity: 0.8;
        }

        .nav-links {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }

        .nav-link {
            padding: 8px 16px;
            border-radius: 6px;
            text-decoration: none;
            color: var(--text-color);
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 0.2s ease;
            border: 1px solid transparent;
        }

        .nav-link:hover {
            background: var(--bg-color);
            border-color: var(--border-color);
        }

        .nav-link.active {
            background: var(--primary-color);
            color: white;
            border-color: var(--primary-color);
        }

        .dashboard {
            margin-top: 0;
        }

        @media (max-width: 768px) {
            .dashboard {
                padding: 10px;
            }
            
            .dashboard-header {
                flex-direction: column;
                gap: 15px;
                text-align: center;
                margin-top: 20px;
            }
            
            .dashboard-header h1 {
                font-size: 2rem;
            }
            
            .metrics-grid {
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            }
            
            .charts-grid {
                grid-template-columns: 1fr;
            }

            .nav-container {
                flex-direction: column;
                align-items: flex-start;
            }

            .nav-links {
                width: 100%;
                justify-content: flex-start;
            }
        }
    `;
  }

  /**
   * Generate navigation bar
   */
  generateNavigation(activeDashboard) {
    const navLinks = [
      { id: 'hub', label: '🏠 Hub', href: '../index.html' },
      { id: 'baseline', label: '🌐 Baseline', href: '../baseline/baseline-dashboard.html' },
      { id: 'performance', label: '⚡ Performance', href: '../performance/performance-dashboard.html' },
      { id: 'security', label: '🔒 Security', href: '../security/security-dashboard.html' },
      { id: 'accessibility', label: '♿ Accessibility', href: '../accessibility/accessibility-dashboard.html' },
      { id: 'seo', label: '🔍 SEO', href: '../seo/seo-dashboard.html' },
      { id: 'bundle', label: '📦 Bundle', href: '../bundle/bundle-dashboard.html' }
    ];

    return `
    <nav class="dashboard-nav">
        <div class="nav-container">
            <a href="../index.html" class="nav-logo">📊 Baseline Check</a>
            <div class="nav-links">
                ${navLinks.map(link => `
                    <a href="${link.href}" class="nav-link ${activeDashboard === link.id ? 'active' : ''}">${link.label}</a>
                `).join('')}
            </div>
        </div>
    </nav>`;
  }

  /**
   * Generate metrics section
   */
  generateMetrics(analysis) {
    // Handle missing or incomplete data
    if (!analysis || !analysis.summary) {
      analysis = {
        seoScore: 100,
        seoLevel: 'Excellent',
        summary: {
          totalIssues: 0,
          bySeverity: { high: 0, medium: 0, low: 0 },
          byCategory: {}
        }
      };
    }
    
    const summary = analysis.summary;
    const bySeverity = summary.bySeverity || { high: 0, medium: 0, low: 0 };
    // Use nullish coalescing to handle 0 as a valid score (don't use || which treats 0 as falsy)
    const seoScore = (analysis.seoScore !== undefined && analysis.seoScore !== null) ? analysis.seoScore : 100;
    const seoLevel = analysis.seoLevel || 'Excellent';
    
    return `
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value" style="color: ${this.getScoreColor(seoScore)}">${seoScore}</div>
                <div class="metric-label">SEO Score</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${summary.totalIssues || 0}</div>
                <div class="metric-label">Total Issues</div>
            </div>
            <div class="metric-card">
                <div class="metric-value" style="color: #ef4444">${bySeverity.high || 0}</div>
                <div class="metric-label">Critical Issues</div>
            </div>
            <div class="metric-card">
                <div class="metric-value" style="color: #f59e0b">${bySeverity.medium || 0}</div>
                <div class="metric-label">Medium Issues</div>
            </div>
            <div class="metric-card">
                <div class="metric-value" style="color: #3b82f6">${bySeverity.low || 0}</div>
                <div class="metric-label">Low Issues</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${seoLevel}</div>
                <div class="metric-label">SEO Level</div>
            </div>
        </div>
    `;
  }

  /**
   * Get color for score
   */
  getScoreColor(score) {
    if (score >= 90) return '#10b981';
    if (score >= 75) return '#3b82f6';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#ef4444';
    return '#dc2626';
  }

  /**
   * Generate charts section
   */
  generateCharts(analysis) {
    if (!this.options.includeCharts) return '';

    // Handle missing or incomplete data
    if (!analysis || !analysis.summary) {
      analysis = {
        seoScore: 100,
        summary: {
          bySeverity: { high: 0, medium: 0, low: 0 },
          byCategory: {}
        }
      };
    }

    const summary = analysis.summary;
    const bySeverity = summary.bySeverity || { high: 0, medium: 0, low: 0 };
    const byCategory = summary.byCategory || {};
    // Use nullish coalescing to handle 0 as a valid score (don't use || which treats 0 as falsy)
    const seoScore = (analysis.seoScore !== undefined && analysis.seoScore !== null) ? analysis.seoScore : 100;
    
    return `
        <div class="charts-section">
            <h2 class="section-title">📊 SEO Analysis</h2>
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
                    <div class="chart-title">SEO Score Distribution</div>
                    <div class="chart" id="score-chart">
                        ${this.generateScoreChart(seoScore)}
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
    if (!bySeverity) {
      bySeverity = { high: 0, medium: 0, low: 0 };
    }
    
    const high = bySeverity.high || 0;
    const medium = bySeverity.medium || 0;
    const low = bySeverity.low || 0;
    const total = high + medium + low;
    
    if (total === 0) {
      return '<div class="chart-empty-state">No severity data available</div>';
    }

    const items = [
      { label: 'High', value: high, icon: '🔴', class: 'severity-high', percentage: total > 0 ? Math.round((high / total) * 100) : 0 },
      { label: 'Medium', value: medium, icon: '🟡', class: 'severity-medium', percentage: total > 0 ? Math.round((medium / total) * 100) : 0 },
      { label: 'Low', value: low, icon: '🔵', class: 'severity-low', percentage: total > 0 ? Math.round((low / total) * 100) : 0 }
    ];

    return items.map(item => `
      <div class="chart-item ${item.class}">
        <div class="chart-item-header">
          <div class="chart-item-label">
            <span class="icon">${item.icon}</span>
            <span>${item.label}</span>
          </div>
          <div class="chart-item-value">${item.value}</div>
        </div>
        <div class="chart-progress-bar">
          <div class="chart-progress-fill" style="width: ${item.percentage}%;">
            ${item.percentage > 10 ? `<span class="chart-progress-text">${item.percentage}%</span>` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Generate category chart
   */
  generateCategoryChart(byCategory) {
    if (!byCategory || Object.keys(byCategory).length === 0) {
      return '<div class="chart-empty-state">No category data available</div>';
    }
    
    const categories = Object.entries(byCategory);
    const total = categories.reduce((sum, [, count]) => sum + count, 0);
    
    if (total === 0) {
      return '<div class="chart-empty-state">No category data available</div>';
    }

    // Sort by count (highest first) and format category names
    const formatCategory = (cat) => {
      return cat
        .replace(/_/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    };

    const sortedCategories = categories
      .sort(([, a], [, b]) => b - a)
      .map(([category, count], index) => ({
        category,
        count,
        label: formatCategory(category),
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        class: `category-item`
      }));

    return sortedCategories.map((item, index) => `
      <div class="chart-item ${item.class}">
        <div class="chart-item-header">
          <div class="chart-item-label">
            <span>${item.label}</span>
          </div>
          <div class="chart-item-value">${item.count}</div>
        </div>
        <div class="chart-progress-bar">
          <div class="chart-progress-fill" style="width: ${item.percentage}%;">
            ${item.percentage > 8 ? `<span class="chart-progress-text">${item.percentage}%</span>` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Generate score chart
   */
  generateScoreChart(score) {
    const normalizedScore = Math.max(0, Math.min(100, score || 0));
    
    const scoreRanges = [
      { label: '0-40', min: 0, max: 40, class: 'score-range-critical', icon: '🔴' },
      { label: '41-60', min: 41, max: 60, class: 'score-range-poor', icon: '🟠' },
      { label: '61-75', min: 61, max: 75, class: 'score-range-fair', icon: '🟡' },
      { label: '76-90', min: 76, max: 90, class: 'score-range-good', icon: '🔵' },
      { label: '91-100', min: 91, max: 100, class: 'score-range-excellent', icon: '🟢' }
    ];

    return scoreRanges.map(range => {
      const isActive = normalizedScore >= range.min && normalizedScore <= range.max;
      const percentage = isActive ? 100 : 0;
      
      return `
        <div class="chart-item ${range.class}">
          <div class="chart-item-header">
            <div class="chart-item-label">
              <span class="icon">${range.icon}</span>
              <span>${range.label}</span>
            </div>
            <div class="chart-item-value">${isActive ? normalizedScore : '-'}</div>
          </div>
          <div class="chart-progress-bar">
            <div class="chart-progress-fill" style="width: ${percentage}%;">
              ${isActive ? `<span class="chart-progress-text">${normalizedScore}</span>` : ''}
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
    const issues = analysis.issues || [];
    
    if (issues.length === 0) {
      return `
        <div class="issues-section">
          <h2 class="section-title">✅ No SEO Issues Found</h2>
          <p style="text-align: center; color: var(--text-muted); font-size: 1.1rem;">
            Great job! Your pages appear to be SEO optimized.
          </p>
        </div>
      `;
    }

    const issuesBySeverity = {
      high: issues.filter(i => i.severity === 'high'),
      medium: issues.filter(i => i.severity === 'medium'),
      low: issues.filter(i => i.severity === 'low')
    };

    return `
        <div class="issues-section">
            <h2 class="section-title">🔍 SEO Issues (${issues.length} found)</h2>
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
                <strong>Impact:</strong> ${issue.impact} | 
                <strong>Effort:</strong> ${issue.effort} | 
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
            <h2 class="section-title">💡 SEO Recommendations</h2>
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
                <strong>Impact:</strong> ${rec.impact} | 
                <strong>Effort:</strong> ${rec.effort} | 
                <strong>Issues:</strong> ${rec.issues}
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
            // Ensure charts are visible
            const charts = document.querySelectorAll('.chart');
            charts.forEach(chart => {
                if (chart.children.length === 0) {
                    chart.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 40px;">No data available</div>';
                }
            });

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

            // Log analysis data for debugging
            if (typeof analysisData !== 'undefined') {
                console.log('SEO Analysis Data:', analysisData);
            }
        });
    `;
  }

  /**
   * Get score class for styling
   */
  getScoreClass(score) {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    if (score >= 40) return 'poor';
    return 'critical';
  }
}

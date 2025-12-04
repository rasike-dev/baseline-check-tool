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
    <div class="dashboard">
        <header class="dashboard-header">
            <h1>♿ Accessibility Analysis Dashboard</h1>
            <div class="header-info">
                <span class="score-badge score-${this.getScoreClass(analysis.accessibilityScore)}">
                    ${analysis.accessibilityScore}/100
                </span>
                <span class="wcag-badge wcag-${analysis.wcagLevel.toLowerCase()}">
                    WCAG ${analysis.wcagLevel}
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
            min-height: 200px;
            display: flex;
            align-items: end;
            gap: 8px;
            padding: 10px 0;
        }

        .bar {
            flex: 1;
            background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
            border-radius: 4px 4px 0 0;
            position: relative;
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .bar:hover {
            opacity: 0.8;
            transform: scaleY(1.05);
        }

        .bar-label {
            position: absolute;
            bottom: -25px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 0.8rem;
            color: var(--text-muted);
            white-space: nowrap;
        }

        .bar-value {
            position: absolute;
            top: -25px;
            left: 50%;
            transform: translateX(-50%);
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--text-color);
        }

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

        @media (max-width: 768px) {
            .dashboard {
                padding: 10px;
            }
            
            .dashboard-header {
                flex-direction: column;
                gap: 15px;
                text-align: center;
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
        }
    `;
  }

  /**
   * Generate metrics section
   */
  generateMetrics(analysis) {
    const summary = analysis.summary;
    
    return `
        <div class="metrics-grid">
            <div class="metric-card">
                <div class="metric-value">${analysis.accessibilityScore}</div>
                <div class="metric-label">Accessibility Score</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${summary.totalIssues}</div>
                <div class="metric-label">Total Issues</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${summary.bySeverity.high}</div>
                <div class="metric-label">Critical Issues</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${summary.bySeverity.medium}</div>
                <div class="metric-label">Medium Issues</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${summary.bySeverity.low}</div>
                <div class="metric-label">Low Issues</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${analysis.wcagLevel}</div>
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

    const summary = analysis.summary;
    
    return `
        <div class="charts-section">
            <h2 class="section-title">📊 Accessibility Analysis</h2>
            <div class="charts-grid">
                <div class="chart-container">
                    <div class="chart-title">Issues by Severity</div>
                    <div class="chart" id="severity-chart">
                        ${this.generateSeverityChart(summary.bySeverity)}
                    </div>
                </div>
                <div class="chart-container">
                    <div class="chart-title">Issues by Category</div>
                    <div class="chart" id="category-chart">
                        ${this.generateCategoryChart(summary.byCategory)}
                    </div>
                </div>
                <div class="chart-container">
                    <div class="chart-title">WCAG Compliance</div>
                    <div class="chart" id="wcag-chart">
                        ${this.generateWCAGChart(summary.byWCAGLevel)}
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
    const max = Math.max(bySeverity.high, bySeverity.medium, bySeverity.low);
    const bars = [
      { label: 'High', value: bySeverity.high, color: '#ef4444' },
      { label: 'Medium', value: bySeverity.medium, color: '#f59e0b' },
      { label: 'Low', value: bySeverity.low, color: '#3b82f6' }
    ];

    return bars.map(bar => `
      <div class="bar" style="height: ${max > 0 ? (bar.value / max) * 100 : 0}%; background: ${bar.color};">
        <div class="bar-value">${bar.value}</div>
        <div class="bar-label">${bar.label}</div>
      </div>
    `).join('');
  }

  /**
   * Generate category chart
   */
  generateCategoryChart(byCategory) {
    const categories = Object.entries(byCategory);
    if (categories.length === 0) return '<div style="text-align: center; color: var(--text-muted);">No category data</div>';
    
    const max = Math.max(...categories.map(([, count]) => count));
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

    return categories.map(([category, count], index) => `
      <div class="bar" style="height: ${max > 0 ? (count / max) * 100 : 0}%; background: ${colors[index % colors.length]};">
        <div class="bar-value">${count}</div>
        <div class="bar-label">${category}</div>
      </div>
    `).join('');
  }

  /**
   * Generate WCAG chart
   */
  generateWCAGChart(byWCAGLevel) {
    const levels = [
      { label: 'A', value: byWCAGLevel.A, color: '#f59e0b' },
      { label: 'AA', value: byWCAGLevel.AA, color: '#3b82f6' },
      { label: 'AAA', value: byWCAGLevel.AAA, color: '#10b981' }
    ];

    const max = Math.max(...levels.map(level => level.value));

    return levels.map(level => `
      <div class="bar" style="height: ${max > 0 ? (level.value / max) * 100 : 0}%; background: ${level.color};">
        <div class="bar-value">${level.value}</div>
        <div class="bar-label">${level.label}</div>
      </div>
    `).join('');
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
   * Get score class for styling
   */
  getScoreClass(score) {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'fair';
    return 'poor';
  }
}

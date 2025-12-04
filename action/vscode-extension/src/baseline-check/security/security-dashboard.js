/**
 * Security Dashboard Generator
 * Creates interactive HTML dashboard for security analysis results
 */

export class SecurityDashboard {
  constructor(options = {}) {
    this.options = {
      theme: 'dark',
      title: 'Security Analysis Dashboard',
      ...options
    };
  }

  /**
   * Generate complete dashboard HTML
   */
  generateHTML(analysis, recommendations) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.options.title}</title>
    <style>${this.generateCSS()}</style>
</head>
<body class="${this.options.theme}">
    <div class="dashboard-container">
        ${this.generateHeader(analysis)}
        ${this.generateMetrics(analysis)}
        ${this.generateCharts(analysis)}
        ${this.generateVulnerabilities(analysis)}
        ${this.generateRecommendations(recommendations)}
        ${this.generateFooter()}
    </div>
    <script>${this.generateJavaScript()}</script>
</body>
</html>`;
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
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6;
        color: var(--text-color);
        background: var(--bg-color);
    }

    .dashboard-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
    }

    .header {
        text-align: center;
        margin-bottom: 30px;
        padding: 20px;
        background: var(--card-bg);
        border-radius: 12px;
        box-shadow: var(--shadow);
    }

    .header h1 {
        font-size: 2.5rem;
        margin-bottom: 10px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }

    .security-score {
        font-size: 3rem;
        font-weight: bold;
        margin: 20px 0;
    }

    .score-excellent { color: #10b981; }
    .score-good { color: #3b82f6; }
    .score-fair { color: #f59e0b; }
    .score-poor { color: #ef4444; }
    .score-critical { color: #dc2626; }

    .risk-badge {
        display: inline-block;
        padding: 8px 16px;
        border-radius: 20px;
        font-weight: bold;
        text-transform: uppercase;
        font-size: 0.9rem;
    }

    .risk-low { background: #d1fae5; color: #065f46; }
    .risk-medium { background: #fef3c7; color: #92400e; }
    .risk-high { background: #fed7d7; color: #991b1b; }
    .risk-critical { background: #fecaca; color: #7f1d1d; }

    .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
    }

    .metric-card {
        background: var(--card-bg);
        padding: 20px;
        border-radius: 12px;
        box-shadow: var(--shadow);
        text-align: center;
        transition: transform 0.2s ease;
    }

    .metric-card:hover {
        transform: translateY(-2px);
    }

    .metric-value {
        font-size: 2rem;
        font-weight: bold;
        margin-bottom: 5px;
    }

    .metric-label {
        color: var(--text-muted);
        font-size: 0.9rem;
    }

    .charts-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 30px;
    }

    .chart-container {
        background: var(--card-bg);
        padding: 20px;
        border-radius: 12px;
        box-shadow: var(--shadow);
    }

    .chart {
        min-height: 200px;
        margin-top: 15px;
    }

    .vulnerabilities-section {
        background: var(--card-bg);
        padding: 20px;
        border-radius: 12px;
        box-shadow: var(--shadow);
        margin-bottom: 30px;
    }

    .vulnerability-item {
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 15px;
        transition: all 0.2s ease;
    }

    .vulnerability-item:hover {
        border-color: var(--accent-color);
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .vuln-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }

    .vuln-title {
        font-weight: bold;
        font-size: 1.1rem;
    }

    .severity-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
        font-weight: bold;
        text-transform: uppercase;
    }

    .severity-critical { background: #fecaca; color: #7f1d1d; }
    .severity-high { background: #fed7d7; color: #991b1b; }
    .severity-medium { background: #fef3c7; color: #92400e; }
    .severity-low { background: #d1fae5; color: #065f46; }

    .vuln-details {
        margin-top: 10px;
        font-size: 0.9rem;
        color: var(--text-muted);
    }

    .vuln-code {
        background: var(--code-bg);
        padding: 10px;
        border-radius: 4px;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 0.8rem;
        margin: 10px 0;
        overflow-x: auto;
    }

    .recommendations-section {
        background: var(--card-bg);
        padding: 20px;
        border-radius: 12px;
        box-shadow: var(--shadow);
    }

    .recommendation-item {
        border-left: 4px solid var(--accent-color);
        padding: 15px;
        margin-bottom: 15px;
        background: var(--bg-color);
        border-radius: 0 8px 8px 0;
    }

    .rec-title {
        font-weight: bold;
        margin-bottom: 10px;
        font-size: 1.1rem;
    }

    .rec-actions {
        margin-top: 10px;
    }

    .rec-actions li {
        margin-bottom: 5px;
    }

    .code-example {
        background: var(--code-bg);
        padding: 15px;
        border-radius: 8px;
        margin: 10px 0;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 0.9rem;
    }

    .code-bad {
        border-left: 4px solid #ef4444;
        background: #fef2f2;
    }

    .code-good {
        border-left: 4px solid #10b981;
        background: #f0fdf4;
    }

    .footer {
        text-align: center;
        margin-top: 40px;
        padding: 20px;
        color: var(--text-muted);
        font-size: 0.9rem;
    }

    /* Dark theme */
    .dark {
        --bg-color: #1a1a1a;
        --card-bg: #2d2d2d;
        --text-color: #e5e5e5;
        --text-muted: #a0a0a0;
        --border-color: #404040;
        --accent-color: #667eea;
        --shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        --code-bg: #1e1e1e;
    }

    /* Light theme */
    .light {
        --bg-color: #ffffff;
        --card-bg: #f8f9fa;
        --text-color: #333333;
        --text-muted: #666666;
        --border-color: #e0e0e0;
        --accent-color: #667eea;
        --shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        --code-bg: #f5f5f5;
    }

    @media (max-width: 768px) {
        .charts-section {
            grid-template-columns: 1fr;
        }
        
        .metrics-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        }
        
        .dashboard-container {
            padding: 10px;
        }
    }
    `;
  }

  /**
   * Generate header
   */
  generateHeader(analysis) {
    const scoreClass = this.getScoreClass(analysis.securityScore);
    const riskClass = `risk-${analysis.riskLevel}`;
    
    return `
    <div class="header">
        <h1>🔒 Security Analysis Dashboard</h1>
        <div class="security-score ${scoreClass}">${analysis.securityScore}/100</div>
        <div class="risk-badge ${riskClass}">Risk Level: ${analysis.riskLevel.toUpperCase()}</div>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>`;
  }

  /**
   * Generate metrics cards
   */
  generateMetrics(analysis) {
    const summary = analysis.summary;
    
    return `
    <div class="metrics-grid">
        <div class="metric-card">
            <div class="metric-value">${summary.totalVulnerabilities}</div>
            <div class="metric-label">Total Vulnerabilities</div>
        </div>
        <div class="metric-card">
            <div class="metric-value" style="color: #dc2626;">${summary.bySeverity.critical}</div>
            <div class="metric-label">Critical</div>
        </div>
        <div class="metric-card">
            <div class="metric-value" style="color: #ef4444;">${summary.bySeverity.high}</div>
            <div class="metric-label">High</div>
        </div>
        <div class="metric-card">
            <div class="metric-value" style="color: #f59e0b;">${summary.bySeverity.medium}</div>
            <div class="metric-label">Medium</div>
        </div>
        <div class="metric-card">
            <div class="metric-value" style="color: #10b981;">${summary.bySeverity.low}</div>
            <div class="metric-label">Low</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${Object.keys(summary.byCategory).length}</div>
            <div class="metric-label">Categories</div>
        </div>
    </div>`;
  }

  /**
   * Generate charts
   */
  generateCharts(analysis) {
    return `
    <div class="charts-section">
        <div class="chart-container">
            <h3>Vulnerabilities by Severity</h3>
            <div class="chart" id="severityChart"></div>
        </div>
        <div class="chart-container">
            <h3>Vulnerabilities by Category</h3>
            <div class="chart" id="categoryChart"></div>
        </div>
    </div>`;
  }

  /**
   * Generate vulnerabilities list
   */
  generateVulnerabilities(analysis) {
    if (analysis.vulnerabilities.length === 0) {
      return `
      <div class="vulnerabilities-section">
          <h2>🎉 No Vulnerabilities Found!</h2>
          <p>Great job! No security vulnerabilities were detected in your codebase.</p>
      </div>`;
    }

    const vulnerabilitiesHTML = analysis.vulnerabilities.map(vuln => `
      <div class="vulnerability-item">
          <div class="vuln-header">
              <div class="vuln-title">${vuln.title}</div>
              <div class="severity-badge severity-${vuln.severity}">${vuln.severity}</div>
          </div>
          <div class="vuln-details">
              <p><strong>Description:</strong> ${vuln.description}</p>
              <p><strong>File:</strong> ${vuln.file} (Line ${vuln.line})</p>
              <p><strong>Suggestion:</strong> ${vuln.suggestion}</p>
              ${vuln.code ? `<div class="vuln-code">${vuln.code}</div>` : ''}
              <p><strong>CWE:</strong> ${vuln.cwe} | <strong>OWASP:</strong> ${vuln.owasp}</p>
          </div>
      </div>
    `).join('');

    return `
    <div class="vulnerabilities-section">
        <h2>🚨 Security Vulnerabilities</h2>
        ${vulnerabilitiesHTML}
    </div>`;
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(recommendations) {
    const recs = recommendations.recommendations;
    const allRecs = [...recs.critical, ...recs.high, ...recs.medium, ...recs.low, ...recs.general];
    
    if (allRecs.length === 0) {
      return `
      <div class="recommendations-section">
          <h2>✅ No Recommendations</h2>
          <p>No security recommendations at this time.</p>
      </div>`;
    }

    const recommendationsHTML = allRecs.map(rec => `
      <div class="recommendation-item">
          <div class="rec-title">${rec.title}</div>
          <p>${rec.description}</p>
          <div class="rec-actions">
              <strong>Actions:</strong>
              <ul>
                  ${rec.actions.map(action => `<li>${action}</li>`).join('')}
              </ul>
          </div>
          ${rec.codeExamples ? rec.codeExamples.map(example => `
              <div class="code-example code-${example === rec.codeExamples[0] ? 'bad' : 'good'}">
                  <strong>${example === rec.codeExamples[0] ? '❌ Bad:' : '✅ Good:'}</strong><br>
                  <code>${example.bad || example.good}</code><br>
                  <em>${example.explanation}</em>
              </div>
          `).join('') : ''}
          ${rec.resources ? `
              <div class="rec-actions">
                  <strong>Resources:</strong>
                  <ul>
                      ${rec.resources.map(resource => `<li>${resource}</li>`).join('')}
                  </ul>
              </div>
          ` : ''}
      </div>
    `).join('');

    return `
    <div class="recommendations-section">
        <h2>💡 Security Recommendations</h2>
        ${recommendationsHTML}
    </div>`;
  }

  /**
   * Generate footer
   */
  generateFooter() {
    return `
    <div class="footer">
        <p>Generated by Baseline-Check Security Analysis</p>
        <p>For more information, visit the <a href="https://github.com/rasike-a/baseline-check" target="_blank">GitHub repository</a></p>
    </div>`;
  }

  /**
   * Generate JavaScript
   */
  generateJavaScript() {
    return `
    // Chart generation will be added here
    function generateCharts(analysis) {
        // Severity chart
        const severityData = {
            critical: analysis.summary.bySeverity.critical,
            high: analysis.summary.bySeverity.high,
            medium: analysis.summary.bySeverity.medium,
            low: analysis.summary.bySeverity.low
        };
        
        // Category chart
        const categoryData = analysis.summary.byCategory;
        
        // Simple bar chart implementation
        createBarChart('severityChart', severityData, {
            critical: '#dc2626',
            high: '#ef4444',
            medium: '#f59e0b',
            low: '#10b981'
        });
        
        createBarChart('categoryChart', categoryData, {
            default: '#667eea'
        });
    }
    
    function createBarChart(containerId, data, colors) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const maxValue = Math.max(...Object.values(data));
        const entries = Object.entries(data);
        
        entries.forEach(([key, value]) => {
            const bar = document.createElement('div');
            bar.style.cssText = \`
                display: flex;
                align-items: center;
                margin-bottom: 10px;
                padding: 5px 0;
            \`;
            
            const label = document.createElement('div');
            label.textContent = key;
            label.style.cssText = \`
                width: 100px;
                font-size: 0.9rem;
                margin-right: 10px;
            \`;
            
            const barContainer = document.createElement('div');
            barContainer.style.cssText = \`
                flex: 1;
                height: 20px;
                background: #e5e7eb;
                border-radius: 10px;
                overflow: hidden;
            \`;
            
            const barFill = document.createElement('div');
            barFill.style.cssText = \`
                height: 100%;
                width: \${(value / maxValue) * 100}%;
                background: \${colors[key] || colors.default};
                transition: width 0.3s ease;
            \`;
            
            const valueLabel = document.createElement('div');
            valueLabel.textContent = value;
            valueLabel.style.cssText = \`
                margin-left: 10px;
                font-weight: bold;
                min-width: 20px;
            \`;
            
            barContainer.appendChild(barFill);
            bar.appendChild(label);
            bar.appendChild(barContainer);
            bar.appendChild(valueLabel);
            container.appendChild(bar);
        });
    }
    
    // Initialize charts when page loads
    document.addEventListener('DOMContentLoaded', function() {
        // This would be populated with actual analysis data
        console.log('Security dashboard loaded');
    });
    `;
  }

  /**
   * Get score class
   */
  getScoreClass(score) {
    if (score >= 90) return 'score-excellent';
    if (score >= 80) return 'score-good';
    if (score >= 70) return 'score-fair';
    if (score >= 50) return 'score-poor';
    return 'score-critical';
  }
}

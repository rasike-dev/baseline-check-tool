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
    // Process analysis data - handle different formats
    let processedAnalysis = analysis;
    
    // Check if this is a file-based structure (has fileResults) vs single analysis
    if (analysis && analysis.fileResults && !analysis.summary) {
      // This is a file-based structure - aggregate it
      const allVulnerabilities = [];
      Object.values(analysis.fileResults).forEach(fileResult => {
        if (fileResult.vulnerabilities) {
          allVulnerabilities.push(...fileResult.vulnerabilities);
        }
      });
      
      // Generate summary from all vulnerabilities
      const bySeverity = {
        critical: allVulnerabilities.filter(v => v.severity === 'critical').length,
        high: allVulnerabilities.filter(v => v.severity === 'high').length,
        medium: allVulnerabilities.filter(v => v.severity === 'medium').length,
        low: allVulnerabilities.filter(v => v.severity === 'low').length
      };
      
      const byCategory = {};
      allVulnerabilities.forEach(vuln => {
        const category = vuln.category || 'other';
        byCategory[category] = (byCategory[category] || 0) + 1;
      });
      
      processedAnalysis = {
        vulnerabilities: allVulnerabilities,
        securityScore: analysis.securityScore || 100,
        riskLevel: analysis.riskLevel || 'low',
        summary: {
          totalVulnerabilities: allVulnerabilities.length,
          bySeverity: bySeverity,
          byCategory: byCategory
        }
      };
    } else if (analysis && !analysis.summary && analysis.vulnerabilities) {
      // Has vulnerabilities but no summary - generate it
      const bySeverity = {
        critical: analysis.vulnerabilities.filter(v => v.severity === 'critical').length,
        high: analysis.vulnerabilities.filter(v => v.severity === 'high').length,
        medium: analysis.vulnerabilities.filter(v => v.severity === 'medium').length,
        low: analysis.vulnerabilities.filter(v => v.severity === 'low').length
      };
      
      const byCategory = {};
      analysis.vulnerabilities.forEach(vuln => {
        const category = vuln.category || 'other';
        byCategory[category] = (byCategory[category] || 0) + 1;
      });
      
      processedAnalysis = {
        ...analysis,
        summary: {
          totalVulnerabilities: analysis.vulnerabilities.length,
          bySeverity: bySeverity,
          byCategory: byCategory
        }
      };
    }
    
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
    ${this.generateNavigation()}
    <div class="dashboard-container">
        ${this.generateHeader(processedAnalysis)}
        ${this.generateMetrics(processedAnalysis)}
        ${this.generateCharts(processedAnalysis)}
        ${this.generateVulnerabilities(processedAnalysis)}
        ${this.generateRecommendations(recommendations)}
        ${this.generateFooter()}
    </div>
    <script>
        // Embed analysis data for JavaScript
        const analysisData = ${JSON.stringify(processedAnalysis)};
        ${this.generateJavaScript()}
    </script>
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
        margin-bottom: 30px;
    }

    .recommendations-section h2 {
        color: var(--text-color);
        margin-bottom: 20px;
    }

    .recommendation-item {
        border-left: 4px solid var(--accent-color);
        padding: 15px;
        margin-bottom: 15px;
        background: var(--card-bg);
        border-radius: 0 8px 8px 0;
        color: var(--text-color);
    }

    .rec-title {
        font-weight: bold;
        margin-bottom: 10px;
        font-size: 1.1rem;
        color: var(--text-color);
    }

    .recommendation-item p {
        color: var(--text-color);
        margin-bottom: 10px;
    }

    .rec-actions {
        margin-top: 10px;
        color: var(--text-color);
    }

    .rec-actions strong {
        color: var(--text-color);
    }

    .rec-actions ul {
        margin-top: 8px;
        padding-left: 20px;
    }

    .rec-actions li {
        margin-bottom: 5px;
        color: var(--text-muted);
    }

    .code-example {
        background: var(--code-bg);
        padding: 15px;
        border-radius: 8px;
        margin: 10px 0;
        font-family: 'Monaco', 'Menlo', monospace;
        font-size: 0.9rem;
        color: var(--text-color);
        overflow-x: auto;
    }

    .code-example strong {
        color: var(--text-color);
        display: block;
        margin-bottom: 8px;
    }

    .code-example code {
        color: var(--text-color);
        background: transparent;
        padding: 0;
        font-size: 0.9rem;
        display: block;
        margin: 8px 0;
    }

    .code-example em {
        color: var(--text-muted);
        font-style: italic;
        display: block;
        margin-top: 8px;
    }

    .code-bad {
        border-left: 4px solid #ef4444;
    }

    .dark .code-bad {
        background: rgba(239, 68, 68, 0.1);
        border-left-color: #ef4444;
    }

    .light .code-bad {
        background: #fef2f2;
        border-left-color: #ef4444;
    }

    .code-good {
        border-left: 4px solid #10b981;
    }

    .dark .code-good {
        background: rgba(16, 185, 129, 0.1);
        border-left-color: #10b981;
    }

    .light .code-good {
        background: #f0fdf4;
        border-left-color: #10b981;
    }

    .footer {
        text-align: center;
        margin-top: 40px;
        padding: 20px;
        color: var(--text-muted);
        font-size: 0.9rem;
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
        margin-bottom: 20px;
    }
    
    .light .dashboard-nav {
        background: rgba(255, 255, 255, 0.95);
        border-bottom: 1px solid #e0e0e0;
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
        color: #ffffff;
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: color 0.2s;
    }
    
    .light .nav-logo {
        color: #333333;
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
        color: #cccccc;
        text-decoration: none;
        border-radius: 6px;
        transition: all 0.2s;
        font-size: 0.9rem;
        white-space: nowrap;
    }
    
    .light .nav-link {
        color: #666666;
    }
    
    .nav-link:hover {
        background: #2d2d2d;
        color: #ffffff;
    }
    
    .light .nav-link:hover {
        background: #f0f0f0;
        color: #333333;
    }
    
    .nav-link.active {
        background: #667eea;
        color: #ffffff;
    }
    
    .dashboard-container {
        padding-top: 0;
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

    /* Navigation Styles */
    .dashboard-nav {
        position: sticky;
        top: 0;
        z-index: 1000;
        background: rgba(26, 26, 26, 0.95);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid #404040;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        margin-bottom: 20px;
    }
    
    .light .dashboard-nav {
        background: rgba(255, 255, 255, 0.95);
        border-bottom: 1px solid #e0e0e0;
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
        color: #ffffff;
        text-decoration: none;
        display: flex;
        align-items: center;
        gap: 8px;
        transition: color 0.2s;
    }
    
    .light .nav-logo {
        color: #333333;
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
        color: #cccccc;
        text-decoration: none;
        border-radius: 6px;
        transition: all 0.2s;
        font-size: 0.9rem;
        white-space: nowrap;
    }
    
    .light .nav-link {
        color: #666666;
    }
    
    .nav-link:hover {
        background: #2d2d2d;
        color: #ffffff;
    }
    
    .light .nav-link:hover {
        background: #f0f0f0;
        color: #333333;
    }
    
    .nav-link.active {
        background: #667eea;
        color: #ffffff;
    }
    
    .dashboard-container {
        padding-top: 0;
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
   * Generate header
   */
  generateHeader(analysis) {
    // Handle empty or incomplete analysis data
    if (!analysis) {
      analysis = {
        securityScore: 100,
        riskLevel: 'low'
      };
    }
    
    const securityScore = analysis.securityScore || 100;
    const riskLevel = analysis.riskLevel || 'low';
    const scoreClass = this.getScoreClass(securityScore);
    const riskClass = `risk-${riskLevel}`;
    
    return `
    <div class="header">
        <h1>🔒 Security Analysis Dashboard</h1>
        <div class="security-score ${scoreClass}">${securityScore}/100</div>
        <div class="risk-badge ${riskClass}">Risk Level: ${riskLevel.toUpperCase()}</div>
        <p>Generated on ${new Date().toLocaleString()}</p>
    </div>`;
  }

  /**
   * Generate metrics cards
   */
  generateMetrics(analysis) {
    // Handle empty or incomplete analysis data
    if (!analysis || !analysis.summary) {
      analysis = {
        summary: {
          totalVulnerabilities: 0,
          bySeverity: { critical: 0, high: 0, medium: 0, low: 0 },
          byCategory: {}
        }
      };
    }
    
    const summary = analysis.summary;
    const bySeverity = summary.bySeverity || { critical: 0, high: 0, medium: 0, low: 0 };
    const byCategory = summary.byCategory || {};
    
    return `
    <div class="metrics-grid">
        <div class="metric-card">
            <div class="metric-value">${summary.totalVulnerabilities || 0}</div>
            <div class="metric-label">Total Vulnerabilities</div>
        </div>
        <div class="metric-card">
            <div class="metric-value" style="color: #dc2626;">${bySeverity.critical || 0}</div>
            <div class="metric-label">Critical</div>
        </div>
        <div class="metric-card">
            <div class="metric-value" style="color: #ef4444;">${bySeverity.high || 0}</div>
            <div class="metric-label">High</div>
        </div>
        <div class="metric-card">
            <div class="metric-value" style="color: #f59e0b;">${bySeverity.medium || 0}</div>
            <div class="metric-label">Medium</div>
        </div>
        <div class="metric-card">
            <div class="metric-value" style="color: #10b981;">${bySeverity.low || 0}</div>
            <div class="metric-label">Low</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${Object.keys(byCategory).length || 0}</div>
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
                <a href="../security/security-dashboard.html" class="nav-link active">🔒 Security</a>
                <a href="../accessibility/accessibility-dashboard.html" class="nav-link">♿ Accessibility</a>
                <a href="../seo/seo-dashboard.html" class="nav-link">🔍 SEO</a>
                <a href="../bundle/bundle-dashboard.html" class="nav-link">📦 Bundle</a>
            </div>
        </div>
    </nav>`;
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
        if (!analysis || !analysis.summary) {
            console.warn('Security dashboard: Invalid analysis data');
            return;
        }
        
        const summary = analysis.summary;
        
        // Severity chart
        const severityData = {
            critical: summary.bySeverity?.critical || 0,
            high: summary.bySeverity?.high || 0,
            medium: summary.bySeverity?.medium || 0,
            low: summary.bySeverity?.low || 0
        };
        
        // Category chart
        const categoryData = summary.byCategory || {};
        
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
        if (!container) {
            console.warn('Security dashboard: Chart container not found:', containerId);
            return;
        }
        
        // Clear existing content
        container.innerHTML = '';
        
        // Handle empty data
        if (!data || Object.keys(data).length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No data available</p>';
            return;
        }
        
        const values = Object.values(data).filter(v => typeof v === 'number');
        if (values.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No data available</p>';
            return;
        }
        
        const maxValue = Math.max(...values, 1); // Use 1 as minimum to avoid division by zero
        const entries = Object.entries(data).filter(([key, value]) => typeof value === 'number' && value >= 0);
        
        if (entries.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No data available</p>';
            return;
        }
        
        entries.forEach(([key, value]) => {
            const bar = document.createElement('div');
            bar.style.cssText = \`
                display: flex;
                align-items: center;
                margin-bottom: 10px;
                padding: 5px 0;
            \`;
            
            const label = document.createElement('div');
            label.textContent = key.charAt(0).toUpperCase() + key.slice(1);
            label.style.cssText = \`
                width: 100px;
                font-size: 0.9rem;
                margin-right: 10px;
                color: var(--text-color, #333);
            \`;
            
            const barContainer = document.createElement('div');
            barContainer.style.cssText = \`
                flex: 1;
                height: 20px;
                background: var(--border-color, #e5e7eb);
                border-radius: 10px;
                overflow: hidden;
            \`;
            
            const barFill = document.createElement('div');
            const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
            barFill.style.cssText = \`
                height: 100%;
                width: \${percentage}%;
                background: \${colors[key] || colors.default || '#667eea'};
                transition: width 0.3s ease;
            \`;
            
            const valueLabel = document.createElement('div');
            valueLabel.textContent = value;
            valueLabel.style.cssText = \`
                margin-left: 10px;
                font-weight: bold;
                min-width: 20px;
                color: var(--text-color, #333);
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
        if (typeof analysisData !== 'undefined' && analysisData && analysisData.summary) {
            generateCharts(analysisData);
        } else {
            console.warn('Security dashboard: No analysis data available');
            // Show empty state in charts
            const severityChart = document.getElementById('severityChart');
            const categoryChart = document.getElementById('categoryChart');
            if (severityChart) severityChart.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No data available</p>';
            if (categoryChart) categoryChart.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No data available</p>';
        }
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

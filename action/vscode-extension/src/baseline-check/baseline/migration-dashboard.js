/**
 * Migration Dashboard Generator
 * Creates interactive dashboards for migration plans
 */

export class MigrationDashboard {
  constructor(options = {}) {
    this.options = {
      theme: 'dark',
      responsive: true,
      interactive: true,
      ...options
    };
  }

  /**
   * Generate migration dashboard HTML
   */
  generateDashboard(migrationPlan, theme = 'dark') {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Baseline Migration Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'};
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
            line-height: 1.6;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 40px;
            padding: 40px 0;
            background: ${theme === 'dark' ? '#2d2d2d' : '#f8f9fa'};
            border-radius: 12px;
        }

        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .header p {
            font-size: 1.2rem;
            color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .summary-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }

        .summary-card {
            background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'};
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: 1px solid ${theme === 'dark' ? '#404040' : '#e1e5e9'};
            transition: transform 0.3s ease;
        }

        .summary-card:hover {
            transform: translateY(-4px);
        }

        .summary-card h3 {
            font-size: 2rem;
            margin-bottom: 10px;
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
        }

        .summary-card p {
            color: ${theme === 'dark' ? '#cccccc' : '#666666'};
            font-size: 1.1rem;
        }

        .complexity-low { color: #10b981; }
        .complexity-medium { color: #f59e0b; }
        .complexity-high { color: #ef4444; }

        .migrations-section {
            background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'};
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: 1px solid ${theme === 'dark' ? '#404040' : '#e1e5e9'};
        }

        .migrations-section h2 {
            margin-bottom: 30px;
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
        }

        .migration-item {
            background: ${theme === 'dark' ? '#1a1a1a' : '#f8f9fa'};
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            border-left: 4px solid #3b82f6;
        }

        .migration-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .migration-title {
            font-size: 1.2rem;
            font-weight: bold;
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
        }

        .migration-meta {
            display: flex;
            gap: 15px;
        }

        .meta-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: bold;
            text-transform: uppercase;
        }

        .priority-high { background: #fee2e2; color: #dc2626; }
        .priority-medium { background: #fef3c7; color: #d97706; }
        .priority-low { background: #d1fae5; color: #059669; }

        .complexity-low { background: #d1fae5; color: #059669; }
        .complexity-medium { background: #fef3c7; color: #d97706; }
        .complexity-high { background: #fee2e2; color: #dc2626; }

        .migration-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-top: 15px;
        }

        .code-examples {
            background: ${theme === 'dark' ? '#1a1a1a' : '#f8f9fa'};
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }

        .code-examples h4 {
            margin-bottom: 15px;
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
        }

        .code-block {
            background: ${theme === 'dark' ? '#0d1117' : '#f6f8fa'};
            border: 1px solid ${theme === 'dark' ? '#30363d' : '#d0d7de'};
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 10px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.9rem;
            overflow-x: auto;
        }

        .code-block.before {
            border-left: 4px solid #ef4444;
        }

        .code-block.after {
            border-left: 4px solid #10b981;
        }

        .timeline {
            background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'};
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: 1px solid ${theme === 'dark' ? '#404040' : '#e1e5e9'};
        }

        .timeline h2 {
            margin-bottom: 30px;
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
        }

        .timeline-item {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
            padding: 20px;
            background: ${theme === 'dark' ? '#1a1a1a' : '#f8f9fa'};
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }

        .timeline-week {
            background: #3b82f6;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin-right: 20px;
            min-width: 80px;
            text-align: center;
        }

        .timeline-content h4 {
            margin-bottom: 5px;
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
        }

        .timeline-content p {
            color: ${theme === 'dark' ? '#cccccc' : '#666666'};
            margin-bottom: 10px;
        }

        .timeline-features {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .feature-tag {
            background: ${theme === 'dark' ? '#404040' : '#e1e5e9'};
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
        }

        .recommendations {
            background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'};
            border-radius: 12px;
            padding: 30px;
            margin-bottom: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: 1px solid ${theme === 'dark' ? '#404040' : '#e1e5e9'};
        }

        .recommendations h2 {
            margin-bottom: 30px;
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
        }

        .recommendation-item {
            background: ${theme === 'dark' ? '#1a1a1a' : '#f8f9fa'};
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 15px;
            border-left: 4px solid #f59e0b;
        }

        .recommendation-item h4 {
            margin-bottom: 10px;
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
        }

        .recommendation-item p {
            color: ${theme === 'dark' ? '#cccccc' : '#666666'};
            margin-bottom: 10px;
        }

        .recommendation-actions {
            list-style: none;
            padding-left: 0;
        }

        .recommendation-actions li {
            padding: 5px 0;
            color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .recommendation-actions li:before {
            content: "✓ ";
            color: #10b981;
            font-weight: bold;
        }

        .resources {
            background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'};
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border: 1px solid ${theme === 'dark' ? '#404040' : '#e1e5e9'};
        }

        .resources h2 {
            margin-bottom: 30px;
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
        }

        .resource-category {
            margin-bottom: 25px;
        }

        .resource-category h3 {
            margin-bottom: 15px;
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
        }

        .resource-list {
            list-style: none;
            padding-left: 0;
        }

        .resource-list li {
            padding: 8px 0;
            color: ${theme === 'dark' ? '#cccccc' : '#666666'};
        }

        .resource-list li:before {
            content: "🔗 ";
        }

        .resource-list a {
            color: #3b82f6;
            text-decoration: none;
        }

        .resource-list a:hover {
            text-decoration: underline;
        }

        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .migration-details {
                grid-template-columns: 1fr;
            }
            
            .timeline-item {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .timeline-week {
                margin-right: 0;
                margin-bottom: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Baseline Migration Dashboard</h1>
            <p>Comprehensive migration plan for risky-to-baseline transitions</p>
        </div>

        <div class="summary-cards">
            <div class="summary-card">
                <h3>${migrationPlan.summary?.totalFeatures || 0}</h3>
                <p>Features to Migrate</p>
            </div>
            <div class="summary-card">
                <h3 class="complexity-${migrationPlan.summary?.migrationComplexity || 'low'}">${(migrationPlan.summary?.migrationComplexity || 'low').toUpperCase()}</h3>
                <p>Migration Complexity</p>
            </div>
            <div class="summary-card">
                <h3>${migrationPlan.summary?.estimatedTime || 0}h</h3>
                <p>Estimated Time</p>
            </div>
            <div class="summary-card">
                <h3>${migrationPlan.summary?.riskReduction || 0}%</h3>
                <p>Risk Reduction</p>
            </div>
            <div class="summary-card">
                <h3>${migrationPlan.summary?.baselineImprovement || 0}%</h3>
                <p>Baseline Improvement</p>
            </div>
        </div>

        <div class="migrations-section">
            <h2>📋 Migration Details</h2>
            ${this.generateMigrationsHTML(migrationPlan.features || [])}
        </div>

        <div class="timeline">
            <h2>📅 Migration Timeline</h2>
            ${this.generateTimelineHTML(migrationPlan.timeline || { phases: [] })}
        </div>

        <div class="recommendations">
            <h2>💡 Recommendations</h2>
            ${this.generateRecommendationsHTML(migrationPlan.recommendations)}
        </div>

        <div class="resources">
            <h2>📚 Resources</h2>
            ${this.generateResourcesHTML(migrationPlan.resources)}
        </div>
    </div>

    <script>
        // Add interactive functionality
        document.addEventListener('DOMContentLoaded', function() {
            // Add click handlers for migration items
            const migrationItems = document.querySelectorAll('.migration-item');
            migrationItems.forEach(item => {
                item.addEventListener('click', function() {
                    const details = this.querySelector('.migration-details');
                    if (details) {
                        details.style.display = details.style.display === 'none' ? 'grid' : 'none';
                    }
                });
            });

            // Add hover effects
            const cards = document.querySelectorAll('.summary-card, .migration-item, .timeline-item');
            cards.forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-2px)';
                });
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(0)';
                });
            });
        });
    </script>
</body>
</html>`;

    return html;
  }

  /**
   * Generate migrations HTML
   */
  generateMigrationsHTML(migrations) {
    if (!migrations || migrations.length === 0) {
      return '<p>No migrations available.</p>';
    }

    return migrations.map(migration => `
      <div class="migration-item">
        <div class="migration-header">
          <div class="migration-title">${migration.feature}</div>
          <div class="migration-meta">
            <span class="meta-badge priority-${migration.priority}">${migration.priority}</span>
            <span class="meta-badge complexity-${migration.complexity}">${migration.complexity}</span>
            <span class="meta-badge">${migration.effort}</span>
          </div>
        </div>
        
        <div class="migration-details">
          <div>
            <h4>Current Support: ${migration.currentSupport}%</h4>
            <h4>Target Support: ${migration.targetSupport}%</h4>
            <h4>Category: ${migration.category}</h4>
          </div>
          
          <div>
            <h4>Alternatives:</h4>
            <ul>
              ${(migration.alternatives || []).map(alt => `<li>${alt}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div class="code-examples">
          <h4>Code Examples</h4>
          <div class="code-block before">
            <strong>Before:</strong><br>
            <pre>${migration.codeExamples?.before || '// No before code available'}</pre>
          </div>
          <div class="code-block after">
            <strong>After:</strong><br>
            <pre>${migration.codeExamples?.after || '// No after code available'}</pre>
          </div>
          ${migration.codeExamples?.polyfill ? `
            <div class="code-block">
              <strong>Polyfill:</strong><br>
              <pre>${migration.codeExamples.polyfill}</pre>
            </div>
          ` : ''}
        </div>

        <div class="migration-details">
          <div>
            <h4>Benefits:</h4>
            <ul>
              ${(migration.benefits || []).map(benefit => `<li>${benefit}</li>`).join('')}
            </ul>
          </div>
          
          <div>
            <h4>Risks:</h4>
            <ul>
              ${(migration.risks || []).map(risk => `<li>${risk}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Generate timeline HTML
   */
  generateTimelineHTML(timeline) {
    const phases = timeline?.phases || timeline || [];
    if (!phases || phases.length === 0) {
      return '<p>No timeline available.</p>';
    }

    return phases.map(phase => `
      <div class="timeline-item">
        <div class="timeline-week">Week ${phase.week}</div>
        <div class="timeline-content">
          <h4>${phase.phase}</h4>
          <p>${phase.description}</p>
          <div class="timeline-features">
            ${phase.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
          </div>
        </div>
      </div>
    `).join('');
  }

  /**
   * Generate recommendations HTML
   */
  generateRecommendationsHTML(recommendations) {
    if (!recommendations || recommendations.length === 0) {
      return '<p>No recommendations available.</p>';
    }

    return recommendations.map(rec => `
      <div class="recommendation-item">
        <h4>${rec.title}</h4>
        <p>${rec.message}</p>
        <p><strong>Suggestion:</strong> ${rec.suggestion}</p>
        <ul class="recommendation-actions">
          ${(rec.actions || []).map(action => `<li>${action}</li>`).join('')}
        </ul>
      </div>
    `).join('');
  }

  /**
   * Generate resources HTML
   */
  generateResourcesHTML(resources) {
    if (!resources) {
      return '<p>No resources available.</p>';
    }

    return `
      <div class="resource-category">
        <h3>📖 Documentation</h3>
        <ul class="resource-list">
          ${resources.documentation.map(doc => `<li><a href="#" target="_blank">${doc}</a></li>`).join('')}
        </ul>
      </div>
      
      <div class="resource-category">
        <h3>🛠️ Tools</h3>
        <ul class="resource-list">
          ${resources.tools.map(tool => `<li><a href="#" target="_blank">${tool}</a></li>`).join('')}
        </ul>
      </div>
      
      <div class="resource-category">
        <h3>🔧 Polyfills</h3>
        <ul class="resource-list">
          ${resources.polyfills.map(polyfill => `<li><a href="${polyfill.documentation}" target="_blank">${polyfill.name}</a></li>`).join('')}
        </ul>
      </div>
      
      <div class="resource-category">
        <h3>🧪 Testing</h3>
        <ul class="resource-list">
          ${resources.testing.map(test => `<li><a href="#" target="_blank">${test}</a></li>`).join('')}
        </ul>
      </div>
    `;
  }
}

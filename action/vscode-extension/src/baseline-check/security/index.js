/**
 * Security Analysis Module
 * Comprehensive security vulnerability detection and analysis
 */

import { SecurityAnalyzer } from './security-analyzer.js';
import { SecurityRecommendations } from './security-recommendations.js';
import { SecurityDashboard } from './security-dashboard.js';

export class SecurityAnalysis {
  constructor(options = {}) {
    this.analyzer = new SecurityAnalyzer(options.analyzer || {});
    this.recommendations = new SecurityRecommendations(options.recommendations || {});
    this.dashboard = new SecurityDashboard(options.dashboard || {});
  }

  /**
   * Perform complete security analysis
   */
  async analyze(files) {
    const results = {
      analysis: null,
      recommendations: null,
      dashboard: null,
      summary: null
    };

    try {
      // Analyze each file
      const allVulnerabilities = [];
      const fileResults = {};

      for (const file of files) {
        const fileContent = await this.readFile(file);
        const analysis = this.analyzer.analyzeSecurity(fileContent, file);
        
        allVulnerabilities.push(...analysis.vulnerabilities);
        fileResults[file] = analysis;
      }

      // Combine results
      const combinedAnalysis = {
        vulnerabilities: allVulnerabilities,
        securityScore: this.calculateOverallScore(fileResults),
        riskLevel: this.calculateOverallRiskLevel(fileResults),
        summary: this.generateOverallSummary(allVulnerabilities),
        fileResults
      };

      // Generate recommendations
      const recommendations = this.recommendations.generateRecommendations(combinedAnalysis);

      // Generate dashboard
      const dashboard = this.dashboard.generateHTML(combinedAnalysis, recommendations);

      results.analysis = combinedAnalysis;
      results.recommendations = recommendations;
      results.dashboard = dashboard;
      results.summary = this.generateSummary(combinedAnalysis, recommendations);

      return results;

    } catch (error) {
      throw new Error(`Security analysis failed: ${error.message}`);
    }
  }

  /**
   * Analyze single file
   */
  analyzeFile(content, filePath) {
    return this.analyzer.analyzeSecurity(content, filePath);
  }

  /**
   * Generate recommendations for analysis
   */
  generateRecommendations(analysis) {
    return this.recommendations.generateRecommendations(analysis);
  }

  /**
   * Generate dashboard HTML
   */
  generateDashboard(analysis, recommendations) {
    return this.dashboard.generateHTML(analysis, recommendations);
  }

  /**
   * Read file content
   */
  async readFile(filePath) {
    const fs = await import('node:fs');
    return fs.readFileSync(filePath, 'utf8');
  }

  /**
   * Calculate overall security score
   */
  calculateOverallScore(fileResults) {
    const scores = Object.values(fileResults).map(result => result.securityScore);
    if (scores.length === 0) return 100;
    
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    return Math.round(averageScore);
  }

  /**
   * Calculate overall risk level
   */
  calculateOverallRiskLevel(fileResults) {
    const riskLevels = Object.values(fileResults).map(result => result.riskLevel);
    
    if (riskLevels.includes('critical')) return 'critical';
    if (riskLevels.includes('high')) return 'high';
    if (riskLevels.includes('medium')) return 'medium';
    return 'low';
  }

  /**
   * Generate overall summary
   */
  generateOverallSummary(vulnerabilities) {
    const summary = {
      totalVulnerabilities: vulnerabilities.length,
      bySeverity: {
        critical: vulnerabilities.filter(v => v.severity === 'critical').length,
        high: vulnerabilities.filter(v => v.severity === 'high').length,
        medium: vulnerabilities.filter(v => v.severity === 'medium').length,
        low: vulnerabilities.filter(v => v.severity === 'low').length
      },
      byCategory: {},
      byFile: {}
    };

    // Group by category
    vulnerabilities.forEach(vuln => {
      const category = vuln.category;
      summary.byCategory[category] = (summary.byCategory[category] || 0) + 1;
    });

    // Group by file
    vulnerabilities.forEach(vuln => {
      const file = vuln.file;
      summary.byFile[file] = (summary.byFile[file] || 0) + 1;
    });

    return summary;
  }

  /**
   * Generate final summary
   */
  generateSummary(analysis, recommendations) {
    return {
      totalVulnerabilities: analysis.vulnerabilities.length,
      securityScore: analysis.securityScore,
      riskLevel: analysis.riskLevel,
      totalRecommendations: Object.values(recommendations.recommendations).reduce((sum, recs) => sum + recs.length, 0),
      priority: recommendations.priority,
      estimatedEffort: recommendations.summary.estimatedEffort
    };
  }
}

// Export individual components
export { SecurityAnalyzer } from './security-analyzer.js';
export { SecurityRecommendations } from './security-recommendations.js';
export { SecurityDashboard } from './security-dashboard.js';

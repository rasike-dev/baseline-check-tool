/**
 * Accessibility Analysis Module
 * Comprehensive web accessibility analysis and recommendations
 */

import { AccessibilityAnalyzer } from './accessibility-analyzer.js';
import { AccessibilityRecommendations } from './accessibility-recommendations.js';
import { AccessibilityDashboard } from './accessibility-dashboard.js';

/**
 * Main Accessibility Analysis class
 */
export class AccessibilityAnalysis {
  constructor(options = {}) {
    this.options = {
      analyzer: {
        enableWCAGAnalysis: true,
        enableColorContrast: true,
        enableKeyboardNavigation: true,
        enableScreenReader: true,
        enableSemanticHTML: true,
        enableARIA: true,
        enableFocusManagement: true,
        enableAltText: true,
        enableFormLabels: true,
        enableHeadingStructure: true,
        enableLanguageDetection: true,
        enableMotionPreferences: true,
        ...options.analyzer
      },
      recommendations: {
        includeCodeExamples: true,
        includeWCAGReferences: true,
        includePriorityLevels: true,
        ...options.recommendations
      },
      dashboard: {
        theme: 'dark',
        includeCharts: true,
        includeCodeExamples: true,
        includeWCAGReferences: true,
        ...options.dashboard
      }
    };

    this.analyzer = new AccessibilityAnalyzer(this.options.analyzer);
    this.recommendations = new AccessibilityRecommendations(this.options.recommendations);
    this.dashboard = new AccessibilityDashboard(this.options.dashboard);
  }

  /**
   * Analyze files for accessibility issues
   */
  async analyze(files) {
    const analysis = {
      issues: [],
      accessibilityScore: 100,
      wcagLevel: 'A',
      summary: {
        totalIssues: 0,
        bySeverity: { high: 0, medium: 0, low: 0 },
        byCategory: {},
        byWCAGLevel: { A: 0, AA: 0, AAA: 0 },
        accessibilityScore: 100,
        wcagLevel: 'A'
      }
    };

    // Analyze each file
    for (const file of files) {
      try {
        const fileAnalysis = await this.analyzeFile(file);
        analysis.issues.push(...fileAnalysis.issues);
      } catch (error) {
        console.warn(`Failed to analyze file ${file}: ${error.message}`);
      }
    }

    // Calculate overall analysis
    analysis.accessibilityScore = this.calculateOverallScore(analysis.issues);
    analysis.wcagLevel = this.determineWCAGLevel(analysis.issues);
    analysis.summary = this.generateSummary(analysis.issues, analysis.accessibilityScore, analysis.wcagLevel);

    return analysis;
  }

  /**
   * Analyze a single file
   */
  async analyzeFile(filePath) {
    const fs = await import('node:fs');
    const content = await fs.promises.readFile(filePath, 'utf8');
    return this.analyzer.analyzeAccessibility(content, filePath);
  }

  /**
   * Generate recommendations from analysis
   */
  generateRecommendations(analysis) {
    return this.recommendations.generateRecommendations(analysis);
  }

  /**
   * Generate dashboard HTML
   */
  generateDashboard(analysis, recommendations) {
    return this.dashboard.generateDashboard(analysis, recommendations);
  }

  /**
   * Calculate overall accessibility score
   */
  calculateOverallScore(issues) {
    let score = 100;
    
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 8;
          break;
        case 'low':
          score -= 3;
          break;
      }
    });
    
    return Math.max(0, score);
  }

  /**
   * Determine WCAG compliance level
   */
  determineWCAGLevel(issues) {
    const highIssues = issues.filter(i => i.severity === 'high').length;
    const mediumIssues = issues.filter(i => i.severity === 'medium').length;
    
    if (highIssues === 0 && mediumIssues <= 2) {
      return 'AAA';
    } else if (highIssues <= 1 && mediumIssues <= 5) {
      return 'AA';
    } else {
      return 'A';
    }
  }

  /**
   * Generate summary statistics
   */
  generateSummary(issues, accessibilityScore, wcagLevel) {
    const summary = {
      totalIssues: issues.length,
      bySeverity: {
        high: issues.filter(i => i.severity === 'high').length,
        medium: issues.filter(i => i.severity === 'medium').length,
        low: issues.filter(i => i.severity === 'low').length
      },
      byCategory: {},
      byWCAGLevel: {
        A: issues.filter(i => i.level === 'A').length,
        AA: issues.filter(i => i.level === 'AA').length,
        AAA: issues.filter(i => i.level === 'AAA').length
      },
      accessibilityScore,
      wcagLevel
    };

    // Group by category
    issues.forEach(issue => {
      const category = issue.category;
      summary.byCategory[category] = (summary.byCategory[category] || 0) + 1;
    });

    return summary;
  }

  /**
   * Get accessibility statistics
   */
  getStats() {
    return {
      totalFeatures: 12,
      categories: [
        'WCAG Compliance',
        'Color Contrast',
        'Keyboard Navigation',
        'Screen Reader Support',
        'Semantic HTML',
        'ARIA Usage',
        'Focus Management',
        'Alt Text',
        'Form Labels',
        'Heading Structure',
        'Language Detection',
        'Motion Preferences'
      ],
      wcagLevels: ['A', 'AA', 'AAA'],
      severityLevels: ['high', 'medium', 'low']
    };
  }
}

// Export individual classes for advanced usage
export { AccessibilityAnalyzer, AccessibilityRecommendations, AccessibilityDashboard };

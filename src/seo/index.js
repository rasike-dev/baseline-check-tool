/**
 * SEO Analysis Module
 * Comprehensive SEO analysis and recommendations
 */

import { SEOAnalyzer } from './seo-analyzer.js';
import { SEORecommendations } from './seo-recommendations.js';
import { SEODashboard } from './seo-dashboard.js';

/**
 * Main SEO Analysis class
 */
export class SEOAnalysis {
  constructor(options = {}) {
    this.options = {
      analyzer: {
        enableTechnicalSEO: true,
        enableContentSEO: true,
        enablePerformanceSEO: true,
        enableMobileSEO: true,
        enableSchemaMarkup: true,
        enableMetaTags: true,
        enableHeadingStructure: true,
        enableImageSEO: true,
        enableInternalLinking: true,
        enableURLStructure: true,
        enablePageSpeed: true,
        enableCoreWebVitals: true,
        ...options.analyzer
      },
      recommendations: {
        includeCodeExamples: true,
        includeImpactLevels: true,
        includeEffortEstimates: true,
        ...options.recommendations
      },
      dashboard: {
        theme: 'dark',
        includeCharts: true,
        includeCodeExamples: true,
        includeImpactLevels: true,
        ...options.dashboard
      }
    };

    this.analyzer = new SEOAnalyzer(this.options.analyzer);
    this.recommendations = new SEORecommendations(this.options.recommendations);
    this.dashboard = new SEODashboard(this.options.dashboard);
  }

  /**
   * Analyze files for SEO issues
   */
  async analyze(files) {
    const analysis = {
      issues: [],
      seoScore: 100,
      seoLevel: 'Good',
      summary: {
        totalIssues: 0,
        bySeverity: { high: 0, medium: 0, low: 0 },
        byCategory: {},
        seoScore: 100,
        seoLevel: 'Good'
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
    analysis.seoScore = this.calculateOverallScore(analysis.issues);
    analysis.seoLevel = this.determineSEOLevel(analysis.issues);
    analysis.summary = this.generateSummary(analysis.issues, analysis.seoScore, analysis.seoLevel);

    return analysis;
  }

  /**
   * Analyze a single file
   */
  async analyzeFile(filePath) {
    const fs = await import('node:fs');
    const content = await fs.promises.readFile(filePath, 'utf8');
    return this.analyzer.analyzeSEO(content, filePath);
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
   * Calculate overall SEO score
   */
  calculateOverallScore(issues) {
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
    
    return Math.max(0, score);
  }

  /**
   * Determine SEO level
   */
  determineSEOLevel(issues) {
    const highIssues = issues.filter(i => i.severity === 'high').length;
    const mediumIssues = issues.filter(i => i.severity === 'medium').length;
    
    if (highIssues === 0 && mediumIssues <= 2) {
      return 'Excellent';
    } else if (highIssues <= 1 && mediumIssues <= 5) {
      return 'Good';
    } else if (highIssues <= 3 && mediumIssues <= 10) {
      return 'Fair';
    } else if (highIssues <= 5 && mediumIssues <= 15) {
      return 'Poor';
    } else {
      return 'Critical';
    }
  }

  /**
   * Generate summary statistics
   */
  generateSummary(issues, seoScore, seoLevel) {
    const summary = {
      totalIssues: issues.length,
      bySeverity: {
        high: issues.filter(i => i.severity === 'high').length,
        medium: issues.filter(i => i.severity === 'medium').length,
        low: issues.filter(i => i.severity === 'low').length
      },
      byCategory: {},
      seoScore,
      seoLevel
    };

    // Group by category
    issues.forEach(issue => {
      const category = issue.category;
      summary.byCategory[category] = (summary.byCategory[category] || 0) + 1;
    });

    return summary;
  }

  /**
   * Get SEO statistics
   */
  getStats() {
    return {
      totalFeatures: 11,
      categories: [
        'Technical SEO',
        'Content SEO',
        'Performance SEO',
        'Mobile SEO',
        'Schema Markup',
        'Meta Tags',
        'Heading Structure',
        'Image SEO',
        'Internal Linking',
        'URL Structure',
        'Page Speed'
      ],
      seoLevels: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'],
      severityLevels: ['high', 'medium', 'low']
    };
  }
}

// Export individual classes for advanced usage
export { SEOAnalyzer, SEORecommendations, SEODashboard };

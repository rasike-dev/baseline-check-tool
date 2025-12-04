/**
 * Performance Analysis Module
 * 
 * This module provides comprehensive performance analysis capabilities including:
 * - Performance pattern detection
 * - Optimization recommendations
 * - Interactive performance dashboard
 * - Performance metrics and scoring
 */

import { PerformanceAnalyzer } from './performance-analyzer.js';
import { PerformanceRecommendations } from './performance-recommendations.js';
import { PerformanceDashboard } from './performance-dashboard.js';

// Re-export for external use
export { PerformanceAnalyzer, PerformanceRecommendations, PerformanceDashboard };

/**
 * Main Performance Analysis Class
 * Combines all performance analysis capabilities
 */
export class PerformanceAnalysis {
    constructor(options = {}) {
        this.analyzer = new PerformanceAnalyzer(options);
        this.recommendations = new PerformanceRecommendations();
        this.dashboard = new PerformanceDashboard(options);
    }

    /**
     * Run complete performance analysis
     */
    async analyze(files, scanResults) {
        console.log('🔍 Starting performance analysis...');
        
        // Run performance analysis
        const analysis = await this.analyzer.analyzePerformance(files, scanResults);
        
        // Generate recommendations
        const recommendations = this.recommendations.generateRecommendations(analysis);
        
        // Generate dashboard
        const dashboardHTML = this.dashboard.generateHTML(analysis, recommendations);
        
        return {
            analysis,
            recommendations,
            dashboard: dashboardHTML,
            summary: this.generateSummary(analysis, recommendations)
        };
    }

    /**
     * Generate performance summary
     */
    generateSummary(analysis, recommendations) {
        const criticalIssues = analysis.criticalIssues.length;
        const totalIssues = Object.values(analysis.categories)
            .reduce((sum, category) => sum + category.issues.length, 0);
        
        const highPriorityRecs = recommendations.metrics.highPriority;
        const totalRecs = recommendations.metrics.totalRecommendations;

        return {
            overallScore: analysis.overallScore,
            criticalIssues,
            totalIssues,
            highPriorityRecommendations: highPriorityRecs,
            totalRecommendations: totalRecs,
            performanceGrade: this.getPerformanceGrade(analysis.overallScore),
            topCategories: this.getTopCategories(analysis.categories),
            immediateActions: recommendations.immediate.length
        };
    }

    /**
     * Get performance grade based on score
     */
    getPerformanceGrade(score) {
        if (score >= 90) return 'A+';
        if (score >= 80) return 'A';
        if (score >= 70) return 'B';
        if (score >= 60) return 'C';
        if (score >= 50) return 'D';
        return 'F';
    }

    /**
     * Get top performing categories
     */
    getTopCategories(categories) {
        return Object.entries(categories)
            .map(([name, data]) => ({
                name,
                score: Math.max(0, 100 - (data.issues.length * 10)),
                issues: data.issues.length
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
    }
}

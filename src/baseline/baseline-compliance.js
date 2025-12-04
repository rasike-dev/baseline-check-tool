/**
 * Baseline Compliance Scorer
 * Calculates baseline compliance scores and provides benchmarking
 */

export class BaselineComplianceScorer {
  constructor(options = {}) {
    this.options = {
      baselineThreshold: 0.95, // 95% support considered baseline
      includeMobile: true,
      includeBeta: false,
      weightFactors: {
        browserSupport: 0.4,
        featureStability: 0.3,
        performance: 0.2,
        accessibility: 0.1
      },
      ...options
    };

    this.baselineStandards = this.initializeBaselineStandards();
    this.industryBenchmarks = this.initializeIndustryBenchmarks();
  }

  /**
   * Calculate baseline compliance score
   */
  calculateComplianceScore(analysisResults) {
    const scores = {
      overall: 0,
      browserSupport: 0,
      featureStability: 0,
      performance: 0,
      accessibility: 0,
      breakdown: {
        baseline: 0,
        risky: 0,
        unsupported: 0
      },
      recommendations: []
    };

    // Calculate browser support score
    scores.browserSupport = this.calculateBrowserSupportScore(analysisResults);
    
    // Calculate feature stability score
    scores.featureStability = this.calculateFeatureStabilityScore(analysisResults);
    
    // Calculate performance score
    scores.performance = this.calculatePerformanceScore(analysisResults);
    
    // Calculate accessibility score
    scores.accessibility = this.calculateAccessibilityScore(analysisResults);

    // Calculate overall score
    scores.overall = this.calculateOverallScore(scores);

    // Calculate breakdown
    scores.breakdown = this.calculateBreakdown(analysisResults);

    // Generate recommendations
    scores.recommendations = this.generateComplianceRecommendations(scores, analysisResults);

    return scores;
  }

  /**
   * Calculate browser support score
   */
  calculateBrowserSupportScore(analysisResults) {
    if (!analysisResults.browserSupport) return 0;

    const { features, summary } = analysisResults.browserSupport;
    if (!features || features.length === 0) return 0;

    let totalScore = 0;
    let featureCount = 0;

    for (const feature of features) {
      if (feature.baseline) {
        totalScore += 100;
      } else if (feature.risky) {
        totalScore += 60;
      } else if (feature.unsupported) {
        totalScore += 0;
      } else {
        totalScore += feature.supportScore || 0;
      }
      featureCount++;
    }

    return featureCount > 0 ? totalScore / featureCount : 0;
  }

  /**
   * Calculate feature stability score
   */
  calculateFeatureStabilityScore(analysisResults) {
    if (!analysisResults.features) return 0;

    const features = analysisResults.features;
    if (features.length === 0) return 0;

    let stableFeatures = 0;
    let totalFeatures = features.length;

    for (const feature of features) {
      // Consider features stable if they're baseline or have high support
      if (feature.baseline || (feature.supportScore && feature.supportScore >= 90)) {
        stableFeatures++;
      }
    }

    return (stableFeatures / totalFeatures) * 100;
  }

  /**
   * Calculate performance score
   */
  calculatePerformanceScore(analysisResults) {
    if (!analysisResults.performance) return 0;

    const { summary } = analysisResults.performance;
    if (!summary) return 0;

    // Base score
    let score = 100;

    // Deduct for performance issues
    if (summary.bySeverity.high > 0) {
      score -= summary.bySeverity.high * 20;
    }
    if (summary.bySeverity.medium > 0) {
      score -= summary.bySeverity.medium * 10;
    }
    if (summary.bySeverity.low > 0) {
      score -= summary.bySeverity.low * 5;
    }

    return Math.max(0, score);
  }

  /**
   * Calculate accessibility score
   */
  calculateAccessibilityScore(analysisResults) {
    if (!analysisResults.accessibility) return 0;

    const { summary } = analysisResults.accessibility;
    if (!summary) return 0;

    return summary.accessibilityScore || 0;
  }

  /**
   * Calculate overall score
   */
  calculateOverallScore(scores) {
    const weights = this.options.weightFactors;
    
    return Math.round(
      scores.browserSupport * weights.browserSupport +
      scores.featureStability * weights.featureStability +
      scores.performance * weights.performance +
      scores.accessibility * weights.accessibility
    );
  }

  /**
   * Calculate breakdown
   */
  calculateBreakdown(analysisResults) {
    const breakdown = {
      baseline: 0,
      risky: 0,
      unsupported: 0
    };

    if (analysisResults.browserSupport && analysisResults.browserSupport.features) {
      const features = analysisResults.browserSupport.features;
      
      for (const feature of features) {
        if (feature.baseline) {
          breakdown.baseline++;
        } else if (feature.risky) {
          breakdown.risky++;
        } else if (feature.unsupported) {
          breakdown.unsupported++;
        }
      }
    }

    return breakdown;
  }

  /**
   * Generate compliance recommendations
   */
  generateComplianceRecommendations(scores, analysisResults) {
    const recommendations = [];

    // Overall score recommendations
    if (scores.overall < 60) {
      recommendations.push({
        type: 'critical_compliance',
        priority: 'critical',
        title: 'Critical Baseline Compliance Issues',
        message: `Overall compliance score is ${scores.overall}/100`,
        suggestion: 'Immediate action required to improve baseline compliance',
        actions: [
          'Replace unsupported features with baseline alternatives',
          'Add polyfills for risky features',
          'Implement progressive enhancement patterns'
        ]
      });
    } else if (scores.overall < 80) {
      recommendations.push({
        type: 'moderate_compliance',
        priority: 'high',
        title: 'Moderate Baseline Compliance Issues',
        message: `Overall compliance score is ${scores.overall}/100`,
        suggestion: 'Significant improvements needed for better baseline compliance',
        actions: [
          'Address risky features with polyfills',
          'Improve progressive enhancement',
          'Optimize performance'
        ]
      });
    } else if (scores.overall < 95) {
      recommendations.push({
        type: 'good_compliance',
        priority: 'medium',
        title: 'Good Baseline Compliance',
        message: `Overall compliance score is ${scores.overall}/100`,
        suggestion: 'Minor improvements can enhance baseline compliance',
        actions: [
          'Fine-tune remaining risky features',
          'Optimize performance further',
          'Enhance accessibility'
        ]
      });
    } else {
      recommendations.push({
        type: 'excellent_compliance',
        priority: 'low',
        title: 'Excellent Baseline Compliance',
        message: `Overall compliance score is ${scores.overall}/100`,
        suggestion: 'Maintain current baseline compliance standards',
        actions: [
          'Monitor for new baseline features',
          'Keep dependencies updated',
          'Continue best practices'
        ]
      });
    }

    // Browser support recommendations
    if (scores.browserSupport < 80) {
      recommendations.push({
        type: 'browser_support',
        priority: 'high',
        title: 'Improve Browser Support',
        message: `Browser support score is ${scores.browserSupport.toFixed(1)}/100`,
        suggestion: 'Focus on improving cross-browser compatibility',
        actions: [
          'Add polyfills for unsupported features',
          'Implement feature detection',
          'Use progressive enhancement'
        ]
      });
    }

    // Feature stability recommendations
    if (scores.featureStability < 80) {
      recommendations.push({
        type: 'feature_stability',
        priority: 'medium',
        title: 'Improve Feature Stability',
        message: `Feature stability score is ${scores.featureStability.toFixed(1)}/100`,
        suggestion: 'Focus on using more stable, well-supported features',
        actions: [
          'Replace experimental features with stable alternatives',
          'Add feature detection for risky features',
          'Monitor feature support changes'
        ]
      });
    }

    // Performance recommendations
    if (scores.performance < 80) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        title: 'Improve Performance',
        message: `Performance score is ${scores.performance.toFixed(1)}/100`,
        suggestion: 'Address performance issues for better baseline compliance',
        actions: [
          'Optimize bundle size',
          'Implement code splitting',
          'Add performance monitoring'
        ]
      });
    }

    // Accessibility recommendations
    if (scores.accessibility < 80) {
      recommendations.push({
        type: 'accessibility',
        priority: 'high',
        title: 'Improve Accessibility',
        message: `Accessibility score is ${scores.accessibility.toFixed(1)}/100`,
        suggestion: 'Enhance accessibility for better baseline compliance',
        actions: [
          'Fix accessibility issues',
          'Add ARIA attributes',
          'Improve keyboard navigation'
        ]
      });
    }

    return recommendations;
  }

  /**
   * Compare with industry benchmarks
   */
  compareWithBenchmarks(scores) {
    const comparison = {
      overall: this.compareScore(scores.overall, this.industryBenchmarks.overall),
      browserSupport: this.compareScore(scores.browserSupport, this.industryBenchmarks.browserSupport),
      featureStability: this.compareScore(scores.featureStability, this.industryBenchmarks.featureStability),
      performance: this.compareScore(scores.performance, this.industryBenchmarks.performance),
      accessibility: this.compareScore(scores.accessibility, this.industryBenchmarks.accessibility)
    };

    return comparison;
  }

  /**
   * Compare individual score with benchmark
   */
  compareScore(score, benchmark) {
    const difference = score - benchmark;
    const percentage = ((score - benchmark) / benchmark) * 100;

    let status = 'average';
    if (percentage > 20) status = 'excellent';
    else if (percentage > 10) status = 'good';
    else if (percentage > -10) status = 'average';
    else if (percentage > -20) status = 'below_average';
    else status = 'poor';

    return {
      score,
      benchmark,
      difference,
      percentage: Math.round(percentage * 10) / 10,
      status
    };
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(analysisResults) {
    const scores = this.calculateComplianceScore(analysisResults);
    const comparison = this.compareWithBenchmarks(scores);

    return {
      scores,
      comparison,
      summary: {
        overall: scores.overall,
        status: this.getComplianceStatus(scores.overall),
        level: this.getComplianceLevel(scores.overall),
        nextSteps: this.getNextSteps(scores, comparison)
      },
      recommendations: scores.recommendations,
      breakdown: scores.breakdown,
      benchmarks: this.industryBenchmarks
    };
  }

  /**
   * Get compliance status
   */
  getComplianceStatus(score) {
    if (score >= 95) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 60) return 'fair';
    if (score >= 40) return 'poor';
    return 'critical';
  }

  /**
   * Get compliance level
   */
  getComplianceLevel(score) {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Get next steps
   */
  getNextSteps(scores, comparison) {
    const nextSteps = [];

    if (scores.overall < 60) {
      nextSteps.push('Focus on critical compliance issues first');
      nextSteps.push('Replace unsupported features immediately');
      nextSteps.push('Add essential polyfills');
    } else if (scores.overall < 80) {
      nextSteps.push('Address risky features with polyfills');
      nextSteps.push('Improve progressive enhancement');
      nextSteps.push('Optimize performance');
    } else if (scores.overall < 95) {
      nextSteps.push('Fine-tune remaining issues');
      nextSteps.push('Monitor for new baseline features');
      nextSteps.push('Maintain current standards');
    } else {
      nextSteps.push('Maintain excellent compliance');
      nextSteps.push('Monitor for new opportunities');
      nextSteps.push('Share best practices');
    }

    return nextSteps;
  }

  /**
   * Initialize baseline standards
   */
  initializeBaselineStandards() {
    return {
      browserSupport: {
        chrome: 90,
        firefox: 88,
        safari: 14,
        edge: 90
      },
      featureSupport: 0.95,
      performance: {
        bundleSize: 250, // KB
        loadTime: 3, // seconds
        firstContentfulPaint: 1.5 // seconds
      },
      accessibility: {
        wcagLevel: 'AA',
        score: 90
      }
    };
  }

  /**
   * Initialize industry benchmarks
   */
  initializeIndustryBenchmarks() {
    return {
      overall: 75,
      browserSupport: 80,
      featureStability: 70,
      performance: 75,
      accessibility: 80
    };
  }

  /**
   * Get compliance grade
   */
  getComplianceGrade(score) {
    const grades = {
      95: 'A+',
      90: 'A',
      85: 'A-',
      80: 'B+',
      75: 'B',
      70: 'B-',
      65: 'C+',
      60: 'C',
      55: 'C-',
      50: 'D+',
      45: 'D',
      40: 'D-',
      0: 'F'
    };

    for (const [threshold, grade] of Object.entries(grades).sort((a, b) => b[0] - a[0])) {
      if (score >= parseInt(threshold)) {
        return grade;
      }
    }

    return 'F';
  }

  /**
   * Calculate improvement potential
   */
  calculateImprovementPotential(scores) {
    const maxPossible = 100;
    const current = scores.overall;
    const potential = maxPossible - current;

    return {
      current,
      potential,
      percentage: Math.round((potential / maxPossible) * 100),
      achievable: potential > 0
    };
  }
}

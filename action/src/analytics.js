import fs from 'node:fs';
import path from 'node:path';

export class AnalyticsEngine {
  constructor(dataDir = '.baseline-analytics') {
    this.dataDir = dataDir;
    this.ensureDataDir();
  }

  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  recordScan(report, metadata = {}) {
    const timestamp = new Date().toISOString();
    const scanId = this.generateScanId();
    
    const analyticsData = {
      scanId,
      timestamp,
      metadata: {
        ...metadata,
        version: report.metadata?.version || '2.0.0',
        scannedFiles: report.metadata?.scannedFiles || 0,
        processedFiles: report.metadata?.processedFiles || 0,
        errorCount: report.metadata?.errorCount || 0
      },
      features: this.analyzeFeatures(report.results || report.detected || []),
      trends: this.calculateTrends(report.results || report.detected || [])
    };

    // Save individual scan
    const scanFile = path.join(this.dataDir, `scan-${scanId}.json`);
    fs.writeFileSync(scanFile, JSON.stringify(analyticsData, null, 2));

    // Update aggregated data
    this.updateAggregatedData(analyticsData);

    return scanId;
  }

  generateScanId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    return `${timestamp}-${random}`;
  }

  analyzeFeatures(results) {
    const analysis = {
      total: results.length,
      byStatus: {},
      byCategory: {},
      byBrowser: {},
      riskScore: 0,
      adoptionScore: 0
    };

    let totalRisk = 0;
    let totalAdoption = 0;

    for (const result of results) {
      // Count by status
      analysis.byStatus[result.status] = (analysis.byStatus[result.status] || 0) + 1;

      // Count by category (infer from feature name)
      const category = this.inferCategory(result.feature);
      analysis.byCategory[category] = (analysis.byCategory[category] || 0) + 1;

      // Analyze browser support
      if (result.browsers) {
        for (const [browser, versions] of Object.entries(result.browsers)) {
          analysis.byBrowser[browser] = (analysis.byBrowser[browser] || 0) + 1;
        }
      }

      // Calculate risk and adoption scores
      const risk = this.calculateFeatureRisk(result);
      const adoption = this.calculateFeatureAdoption(result);
      
      totalRisk += risk;
      totalAdoption += adoption;
    }

    analysis.riskScore = results.length > 0 ? totalRisk / results.length : 0;
    analysis.adoptionScore = results.length > 0 ? totalAdoption / results.length : 0;

    return analysis;
  }

  inferCategory(feature) {
    if (feature.startsWith('css.')) return 'CSS';
    if (feature.startsWith('window.') || feature.includes('API')) return 'Web API';
    if (feature.includes('element')) return 'HTML';
    if (feature.includes('chaining') || feature.includes('coalescing') || feature.includes('await')) return 'JavaScript';
    return 'Other';
  }

  calculateFeatureRisk(result) {
    switch (result.status) {
      case 'baseline_like': return 0;
      case 'risky': return 0.7;
      case 'unknown': return 0.5;
      default: return 0.3;
    }
  }

  calculateFeatureAdoption(result) {
    if (!result.browsers) return 0;
    
    const supportedBrowsers = Object.keys(result.browsers).length;
    const totalBrowsers = 4; // chrome, firefox, safari, edge
    
    return supportedBrowsers / totalBrowsers;
  }

  calculateTrends(results) {
    const trends = {
      modernFeatures: 0,
      legacyFeatures: 0,
      experimentalFeatures: 0
    };

    for (const result of results) {
      const feature = result.feature;
      
      if (this.isModernFeature(feature)) {
        trends.modernFeatures++;
      } else if (this.isLegacyFeature(feature)) {
        trends.legacyFeatures++;
      } else if (this.isExperimentalFeature(feature)) {
        trends.experimentalFeatures++;
      }
    }

    return trends;
  }

  isModernFeature(feature) {
    const modernPatterns = [
      'Optional chaining', 'Nullish coalescing', 'Top-level await',
      'Dynamic import', 'BigInt', 'css.has_pseudo', 'css.container_queries'
    ];
    return modernPatterns.some(pattern => feature.includes(pattern));
  }

  isLegacyFeature(feature) {
    const legacyPatterns = [
      'css.flexbox', 'css.grid', 'window.fetch', 'WebSocket'
    ];
    return legacyPatterns.some(pattern => feature.includes(pattern));
  }

  isExperimentalFeature(feature) {
    const experimentalPatterns = [
      'css.has_pseudo', 'css.container_queries', 'Top-level await'
    ];
    return experimentalPatterns.some(pattern => feature.includes(pattern));
  }

  updateAggregatedData(analyticsData) {
    const aggregatedFile = path.join(this.dataDir, 'aggregated.json');
    
    let aggregated = {};
    if (fs.existsSync(aggregatedFile)) {
      try {
        aggregated = JSON.parse(fs.readFileSync(aggregatedFile, 'utf8'));
      } catch (error) {
        // Start fresh if corrupted
        aggregated = {};
      }
    }

    // Update daily stats
    const date = analyticsData.timestamp.split('T')[0];
    if (!aggregated.daily) aggregated.daily = {};
    if (!aggregated.daily[date]) {
      aggregated.daily[date] = {
        scans: 0,
        totalFeatures: 0,
        baselineFeatures: 0,
        riskyFeatures: 0,
        unknownFeatures: 0,
        avgRiskScore: 0,
        avgAdoptionScore: 0
      };
    }

    const daily = aggregated.daily[date];
    daily.scans++;
    daily.totalFeatures += analyticsData.features.total;
    daily.baselineFeatures += analyticsData.features.byStatus.baseline_like || 0;
    daily.riskyFeatures += analyticsData.features.byStatus.risky || 0;
    daily.unknownFeatures += analyticsData.features.byStatus.unknown || 0;
    daily.avgRiskScore = (daily.avgRiskScore * (daily.scans - 1) + analyticsData.features.riskScore) / daily.scans;
    daily.avgAdoptionScore = (daily.avgAdoptionScore * (daily.scans - 1) + analyticsData.features.adoptionScore) / daily.scans;

    // Update overall stats
    if (!aggregated.overall) {
      aggregated.overall = {
        totalScans: 0,
        totalFeatures: 0,
        mostUsedFeatures: {},
        riskTrend: [],
        adoptionTrend: []
      };
    }

    aggregated.overall.totalScans++;
    aggregated.overall.totalFeatures += analyticsData.features.total;

    // Track most used features
    // This would need to be implemented based on actual feature usage

    // Add to trends
    aggregated.overall.riskTrend.push({
      date,
      score: analyticsData.features.riskScore
    });

    aggregated.overall.adoptionTrend.push({
      date,
      score: analyticsData.features.adoptionScore
    });

    // Keep only last 30 days of trends
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    aggregated.overall.riskTrend = aggregated.overall.riskTrend.filter(
      item => new Date(item.date) > thirtyDaysAgo
    );
    
    aggregated.overall.adoptionTrend = aggregated.overall.adoptionTrend.filter(
      item => new Date(item.date) > thirtyDaysAgo
    );

    fs.writeFileSync(aggregatedFile, JSON.stringify(aggregated, null, 2));
  }

  getTrends(days = 30) {
    const aggregatedFile = path.join(this.dataDir, 'aggregated.json');
    
    if (!fs.existsSync(aggregatedFile)) {
      return null;
    }

    try {
      const aggregated = JSON.parse(fs.readFileSync(aggregatedFile, 'utf8'));
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const dailyData = Object.entries(aggregated.daily || {})
        .filter(([date]) => {
          const dateObj = new Date(date);
          return dateObj >= startDate && dateObj <= endDate;
        })
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      return {
        period: `${days} days`,
        dailyData,
        overall: aggregated.overall || {},
        summary: this.generateTrendSummary(dailyData)
      };
    } catch (error) {
      return null;
    }
  }

  generateTrendSummary(dailyData) {
    if (dailyData.length === 0) {
      return 'No data available';
    }

    const latest = dailyData[dailyData.length - 1];
    const first = dailyData[0];

    const riskChange = latest.avgRiskScore - first.avgRiskScore;
    const adoptionChange = latest.avgAdoptionScore - first.avgAdoptionScore;

    return {
      totalScans: dailyData.reduce((sum, day) => sum + day.scans, 0),
      avgFeaturesPerScan: dailyData.reduce((sum, day) => sum + day.totalFeatures, 0) / dailyData.length,
      riskTrend: riskChange > 0 ? 'increasing' : riskChange < 0 ? 'decreasing' : 'stable',
      adoptionTrend: adoptionChange > 0 ? 'improving' : adoptionChange < 0 ? 'declining' : 'stable',
      riskChange: riskChange.toFixed(3),
      adoptionChange: adoptionChange.toFixed(3)
    };
  }

  generateReport() {
    const trends = this.getTrends(30);
    if (!trends) {
      return 'No analytics data available. Run some scans first.';
    }

    const { summary, dailyData } = trends;
    
    return `# Baseline Check Analytics Report

## Summary (Last 30 Days)
- **Total Scans:** ${summary.totalScans}
- **Average Features per Scan:** ${summary.avgFeaturesPerScan.toFixed(1)}
- **Risk Trend:** ${summary.riskTrend} (${summary.riskChange > 0 ? '+' : ''}${summary.riskChange})
- **Adoption Trend:** ${summary.adoptionTrend} (${summary.adoptionChange > 0 ? '+' : ''}${summary.adoptionChange})

## Daily Breakdown
${dailyData.map(day => 
  `- **${day.date}:** ${day.scans} scans, ${day.totalFeatures} features, Risk: ${day.avgRiskScore.toFixed(2)}, Adoption: ${day.avgAdoptionScore.toFixed(2)}`
).join('\n')}

## Recommendations
${this.generateRecommendations(summary)}
`;
  }

  generateRecommendations(summary) {
    const recommendations = [];

    if (summary.riskTrend === 'increasing') {
      recommendations.push('⚠️ Risk score is increasing - consider reviewing risky features');
    }

    if (summary.adoptionTrend === 'declining') {
      recommendations.push('📉 Adoption score is declining - check browser compatibility');
    }

    if (summary.avgFeaturesPerScan > 50) {
      recommendations.push('🔍 High feature count - consider using more specific patterns');
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ Your baseline check metrics look healthy!');
    }

    return recommendations.join('\n');
  }
}

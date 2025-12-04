/**
 * AI-Powered Learning System
 * Learns from user patterns and improves recommendations over time
 */

import fs from 'node:fs';

export class AILearning {
  constructor(options = {}) {
    this.options = {
      enableLearning: options.enableLearning !== false,
      learningDataPath: options.learningDataPath || './learning-data.json',
      maxLearningData: options.maxLearningData || 10000,
      confidenceThreshold: options.confidenceThreshold || 0.7,
      ...options
    };
    
    this.learningData = this.loadLearningData();
    this.patterns = new Map();
    this.userPreferences = new Map();
    this.performanceMetrics = new Map();
  }

  /**
   * Load existing learning data
   */
  loadLearningData() {
    try {
      if (fs.existsSync(this.options.learningDataPath)) {
        const data = JSON.parse(fs.readFileSync(this.options.learningDataPath, 'utf8'));
        return {
          patterns: new Map(data.patterns || []),
          userPreferences: new Map(data.userPreferences || []),
          performanceMetrics: new Map(data.performanceMetrics || []),
          version: data.version || '1.0.0',
          lastUpdated: data.lastUpdated || new Date().toISOString()
        };
      }
    } catch (error) {
      console.warn('Failed to load learning data:', error.message);
    }

    return {
      patterns: new Map(),
      userPreferences: new Map(),
      performanceMetrics: new Map(),
      version: '1.0.0',
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Save learning data
   */
  async saveLearningData() {
    try {
      const data = {
        patterns: Array.from(this.learningData.patterns.entries()),
        userPreferences: Array.from(this.learningData.userPreferences.entries()),
        performanceMetrics: Array.from(this.learningData.performanceMetrics.entries()),
        version: this.learningData.version,
        lastUpdated: new Date().toISOString()
      };

      await fs.promises.writeFile(
        this.options.learningDataPath,
        JSON.stringify(data, null, 2),
        'utf8'
      );
    } catch (error) {
      console.error('Failed to save learning data:', error.message);
    }
  }

  /**
   * Learn from user interaction
   */
  async learnFromInteraction(interaction) {
    if (!this.options.enableLearning) return;

    const {
      userId,
      action,
      recommendation,
      context,
      outcome,
      timestamp = new Date().toISOString()
    } = interaction;

    // Record the interaction
    await this.recordInteraction(interaction);

    // Update patterns based on action
    switch (action) {
      case 'accepted':
        await this.learnFromAcceptance(recommendation, context);
        break;
      case 'rejected':
        await this.learnFromRejection(recommendation, context);
        break;
      case 'modified':
        await this.learnFromModification(recommendation, context, outcome);
        break;
      case 'applied':
        await this.learnFromApplication(recommendation, context, outcome);
        break;
    }

    // Update user preferences
    await this.updateUserPreferences(userId, action, recommendation, context);

    // Save learning data
    await this.saveLearningData();
  }

  /**
   * Record interaction for analysis
   */
  async recordInteraction(interaction) {
    const key = `${interaction.userId}-${interaction.recommendation.id}-${interaction.timestamp}`;
    
    if (!this.learningData.interactions) {
      this.learningData.interactions = [];
    }

    this.learningData.interactions.push({
      ...interaction,
      id: key
    });

    // Keep only recent interactions
    if (this.learningData.interactions.length > this.options.maxLearningData) {
      this.learningData.interactions = this.learningData.interactions.slice(-this.options.maxLearningData);
    }
  }

  /**
   * Learn from accepted recommendations
   */
  async learnFromAcceptance(recommendation, context) {
    const patternKey = this.getPatternKey(recommendation, context);
    
    if (!this.learningData.patterns.has(patternKey)) {
      this.learningData.patterns.set(patternKey, {
        pattern: recommendation.pattern,
        type: recommendation.type,
        severity: recommendation.severity,
        acceptanceCount: 0,
        rejectionCount: 0,
        modificationCount: 0,
        contexts: [],
        confidence: 0.5
      });
    }

    const pattern = this.learningData.patterns.get(patternKey);
    pattern.acceptanceCount++;
    pattern.contexts.push(context);
    pattern.confidence = this.calculateConfidence(pattern);
  }

  /**
   * Learn from rejected recommendations
   */
  async learnFromRejection(recommendation, context) {
    const patternKey = this.getPatternKey(recommendation, context);
    
    if (!this.learningData.patterns.has(patternKey)) {
      this.learningData.patterns.set(patternKey, {
        pattern: recommendation.pattern,
        type: recommendation.type,
        severity: recommendation.severity,
        acceptanceCount: 0,
        rejectionCount: 0,
        modificationCount: 0,
        contexts: [],
        confidence: 0.5
      });
    }

    const pattern = this.learningData.patterns.get(patternKey);
    pattern.rejectionCount++;
    pattern.confidence = this.calculateConfidence(pattern);
  }

  /**
   * Learn from modified recommendations
   */
  async learnFromModification(recommendation, context, outcome) {
    const patternKey = this.getPatternKey(recommendation, context);
    
    if (this.learningData.patterns.has(patternKey)) {
      const pattern = this.learningData.patterns.get(patternKey);
      pattern.modificationCount++;
      
      // Learn from the modification
      if (outcome.modifiedPattern) {
        const modifiedPatternKey = this.getPatternKey({
          ...recommendation,
          pattern: outcome.modifiedPattern
        }, context);
        
        if (!this.learningData.patterns.has(modifiedPatternKey)) {
          this.learningData.patterns.set(modifiedPatternKey, {
            pattern: outcome.modifiedPattern,
            type: recommendation.type,
            severity: recommendation.severity,
            acceptanceCount: 1,
            rejectionCount: 0,
            modificationCount: 0,
            contexts: [context],
            confidence: 0.7
          });
        }
      }
    }
  }

  /**
   * Learn from applied fixes
   */
  async learnFromApplication(recommendation, context, outcome) {
    // Track performance metrics
    const metricsKey = `${recommendation.type}-${recommendation.severity}`;
    
    if (!this.learningData.performanceMetrics.has(metricsKey)) {
      this.learningData.performanceMetrics.set(metricsKey, {
        appliedCount: 0,
        successCount: 0,
        failureCount: 0,
        averageTime: 0,
        userSatisfaction: 0
      });
    }

    const metrics = this.learningData.performanceMetrics.get(metricsKey);
    metrics.appliedCount++;
    
    if (outcome.success) {
      metrics.successCount++;
    } else {
      metrics.failureCount++;
    }

    if (outcome.time) {
      metrics.averageTime = (metrics.averageTime + outcome.time) / 2;
    }

    if (outcome.satisfaction !== undefined) {
      metrics.userSatisfaction = (metrics.userSatisfaction + outcome.satisfaction) / 2;
    }
  }

  /**
   * Update user preferences
   */
  async updateUserPreferences(userId, action, recommendation, context) {
    if (!this.learningData.userPreferences.has(userId)) {
      this.learningData.userPreferences.set(userId, {
        preferredTypes: {},
        preferredSeverities: {},
        contextPreferences: {},
        learningRate: 0.1
      });
    }

    const preferences = this.learningData.userPreferences.get(userId);
    
    // Update type preferences
    if (!preferences.preferredTypes[recommendation.type]) {
      preferences.preferredTypes[recommendation.type] = { accepted: 0, rejected: 0 };
    }
    
    if (action === 'accepted') {
      preferences.preferredTypes[recommendation.type].accepted++;
    } else if (action === 'rejected') {
      preferences.preferredTypes[recommendation.type].rejected++;
    }

    // Update severity preferences
    if (!preferences.preferredSeverities[recommendation.severity]) {
      preferences.preferredSeverities[recommendation.severity] = { accepted: 0, rejected: 0 };
    }
    
    if (action === 'accepted') {
      preferences.preferredSeverities[recommendation.severity].accepted++;
    } else if (action === 'rejected') {
      preferences.preferredSeverities[recommendation.severity].rejected++;
    }
  }

  /**
   * Get personalized recommendations
   */
  async getPersonalizedRecommendations(userId, baseRecommendations, context) {
    if (!this.learningData.userPreferences.has(userId)) {
      return baseRecommendations;
    }

    const preferences = this.learningData.userPreferences.get(userId);
    const personalized = [];

    for (const rec of baseRecommendations) {
      const personalizedRec = { ...rec };
      
      // Adjust confidence based on user preferences
      const typePref = preferences.preferredTypes[rec.type];
      const severityPref = preferences.preferredSeverities[rec.severity];
      
      if (typePref) {
        const typeScore = typePref.accepted / (typePref.accepted + typePref.rejected + 1);
        personalizedRec.confidence *= typeScore;
      }
      
      if (severityPref) {
        const severityScore = severityPref.accepted / (severityPref.accepted + severityPref.rejected + 1);
        personalizedRec.confidence *= severityScore;
      }

      // Add learning-based insights
      personalizedRec.learningInsights = this.generateLearningInsights(rec, preferences);
      
      personalized.push(personalizedRec);
    }

    // Sort by personalized confidence
    return personalized.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Generate learning insights
   */
  generateLearningInsights(recommendation, preferences) {
    const insights = [];

    // Type-based insights
    const typePref = preferences.preferredTypes[recommendation.type];
    if (typePref && typePref.accepted > typePref.rejected) {
      insights.push({
        type: 'preference',
        message: `You've accepted similar ${recommendation.type} recommendations before`,
        confidence: typePref.accepted / (typePref.accepted + typePref.rejected)
      });
    }

    // Severity-based insights
    const severityPref = preferences.preferredSeverities[recommendation.severity];
    if (severityPref && severityPref.accepted > severityPref.rejected) {
      insights.push({
        type: 'preference',
        message: `You typically address ${recommendation.severity} priority issues`,
        confidence: severityPref.accepted / (severityPref.accepted + severityPref.rejected)
      });
    }

    return insights;
  }

  /**
   * Get pattern key for learning
   */
  getPatternKey(recommendation, context) {
    const pattern = recommendation.pattern || recommendation.message;
    const type = recommendation.type || 'unknown';
    const contextKey = this.getContextKey(context);
    return `${type}-${this.simpleHash(pattern)}-${contextKey}`;
  }

  /**
   * Get context key for learning
   */
  getContextKey(context) {
    const relevantContext = {
      framework: context.framework || 'unknown',
      fileType: context.fileType || 'unknown',
      browserTarget: context.browserTarget || 'unknown'
    };
    return this.simpleHash(JSON.stringify(relevantContext));
  }

  /**
   * Calculate confidence score
   */
  calculateConfidence(pattern) {
    const total = pattern.acceptanceCount + pattern.rejectionCount;
    if (total === 0) return 0.5;
    
    const acceptanceRate = pattern.acceptanceCount / total;
    const modificationRate = pattern.modificationCount / total;
    
    // Higher confidence for high acceptance and low modification
    return Math.min(0.95, acceptanceRate * (1 - modificationRate * 0.5));
  }

  /**
   * Get learning statistics
   */
  getLearningStats() {
    const stats = {
      totalPatterns: this.learningData.patterns.size,
      totalUsers: this.learningData.userPreferences.size,
      totalInteractions: this.learningData.interactions?.length || 0,
      averageConfidence: 0,
      topPatterns: [],
      userEngagement: {}
    };

    // Calculate average confidence
    if (stats.totalPatterns > 0) {
      const confidences = Array.from(this.learningData.patterns.values())
        .map(p => p.confidence);
      stats.averageConfidence = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    }

    // Get top patterns by confidence
    stats.topPatterns = Array.from(this.learningData.patterns.entries())
      .sort((a, b) => b[1].confidence - a[1].confidence)
      .slice(0, 10)
      .map(([key, pattern]) => ({
        key,
        type: pattern.type,
        confidence: pattern.confidence,
        acceptanceCount: pattern.acceptanceCount
      }));

    // Calculate user engagement
    for (const [userId, prefs] of this.learningData.userPreferences.entries()) {
      const totalActions = Object.values(prefs.preferredTypes)
        .reduce((sum, type) => sum + type.accepted + type.rejected, 0);
      
      stats.userEngagement[userId] = {
        totalActions,
        learningRate: prefs.learningRate,
        activeTypes: Object.keys(prefs.preferredTypes).length
      };
    }

    return stats;
  }

  /**
   * Export learning data
   */
  async exportLearningData(format = 'json') {
    const data = {
      patterns: Array.from(this.learningData.patterns.entries()),
      userPreferences: Array.from(this.learningData.userPreferences.entries()),
      performanceMetrics: Array.from(this.learningData.performanceMetrics.entries()),
      interactions: this.learningData.interactions || [],
      stats: this.getLearningStats(),
      exportedAt: new Date().toISOString()
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else if (format === 'csv') {
      return this.convertToCSV(data);
    }

    return data;
  }

  /**
   * Convert learning data to CSV
   */
  convertToCSV(data) {
    const csv = [];
    
    // Patterns CSV
    csv.push('Patterns');
    csv.push('Type,Severity,Confidence,AcceptanceCount,RejectionCount');
    for (const [key, pattern] of data.patterns) {
      csv.push(`${pattern.type},${pattern.severity},${pattern.confidence},${pattern.acceptanceCount},${pattern.rejectionCount}`);
    }
    
    csv.push('\nUser Preferences');
    csv.push('UserId,Type,Accepted,Rejected');
    for (const [userId, prefs] of data.userPreferences) {
      for (const [type, counts] of Object.entries(prefs.preferredTypes)) {
        csv.push(`${userId},${type},${counts.accepted},${counts.rejected}`);
      }
    }
    
    return csv.join('\n');
  }

  /**
   * Simple hash function
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}

export default AILearning;

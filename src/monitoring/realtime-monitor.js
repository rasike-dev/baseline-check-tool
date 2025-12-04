/**
 * Real-time Monitoring System
 * Provides live monitoring, alerts, and notifications for web compatibility
 */

import fs from 'node:fs';
import path from 'node:path';
import { EventEmitter } from 'node:events';
import { AIAnalyzer } from '../ai/ai-analyzer.js';

export class RealtimeMonitor extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = {
      watchPaths: options.watchPaths || ['.'],
      pollInterval: options.pollInterval || 1000, // 1 second
      debounceDelay: options.debounceDelay || 500,
      enableAlerts: options.enableAlerts !== false,
      enableNotifications: options.enableNotifications !== false,
      alertThresholds: {
        riskScore: options.alertThresholds?.riskScore || 70,
        compatibilityScore: options.alertThresholds?.compatibilityScore || 60,
        errorRate: options.alertThresholds?.errorRate || 0.1
      },
      ...options
    };
    
    this.watchers = new Map();
    this.fileHashes = new Map();
    this.analysisCache = new Map();
    this.alertHistory = [];
    this.isRunning = false;
    this.aiAnalyzer = new AIAnalyzer({ enableLocalAnalysis: true });
    
    this.setupEventHandlers();
  }

  /**
   * Start real-time monitoring
   */
  async start() {
    if (this.isRunning) {
      console.log('⚠️  Monitoring is already running');
      return;
    }

    console.log('🚀 Starting real-time monitoring...');
    this.isRunning = true;
    this.emit('started');

    try {
      // Start watching all specified paths
      for (const watchPath of this.options.watchPaths) {
        await this.watchPath(watchPath);
      }

      // Start polling for changes
      this.startPolling();
      
      console.log(`✅ Monitoring ${this.options.watchPaths.length} path(s)`);
      this.emit('ready');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Stop real-time monitoring
   */
  stop() {
    if (!this.isRunning) {
      return;
    }

    console.log('🛑 Stopping real-time monitoring...');
    this.isRunning = false;

    // Close all watchers
    for (const [path, watcher] of this.watchers) {
      watcher.close();
    }
    this.watchers.clear();

    // Clear polling
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }

    this.emit('stopped');
    console.log('✅ Monitoring stopped');
  }

  /**
   * Watch a specific path for changes
   */
  async watchPath(watchPath) {
    if (!fs.existsSync(watchPath)) {
      console.warn(`⚠️  Path does not exist: ${watchPath}`);
      return;
    }

    const resolvedPath = path.resolve(watchPath);
    
    if (this.watchers.has(resolvedPath)) {
      console.log(`⚠️  Already watching: ${resolvedPath}`);
      return;
    }

    try {
      const watcher = fs.watch(resolvedPath, { recursive: true }, (eventType, filename) => {
        if (filename) {
          this.handleFileChange(resolvedPath, filename, eventType);
        }
      });

      this.watchers.set(resolvedPath, watcher);
      console.log(`👀 Watching: ${resolvedPath}`);
      
      // Initial analysis
      await this.analyzePath(resolvedPath);
    } catch (error) {
      console.error(`❌ Failed to watch ${resolvedPath}:`, error.message);
      this.emit('error', error);
    }
  }

  /**
   * Handle file change events
   */
  async handleFileChange(basePath, filename, eventType) {
    const filePath = path.join(basePath, filename);
    
    // Debounce rapid changes
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(async () => {
      try {
        if (eventType === 'rename' && !fs.existsSync(filePath)) {
          // File deleted
          this.handleFileDeleted(filePath);
          return;
        }

        if (this.isRelevantFile(filePath)) {
          await this.analyzeFile(filePath);
        }
      } catch (error) {
        this.emit('error', error);
      }
    }, this.options.debounceDelay);
  }

  /**
   * Analyze a specific file
   */
  async analyzeFile(filePath) {
    try {
      const code = fs.readFileSync(filePath, 'utf8');
      const hash = this.getFileHash(code);
      
      // Skip if file hasn't changed
      if (this.fileHashes.get(filePath) === hash) {
        return;
      }

      this.fileHashes.set(filePath, hash);
      
      console.log(`🔍 Analyzing: ${filePath}`);
      
      const analysis = await this.aiAnalyzer.analyzeCode(code, filePath, {
        framework: this.detectFramework(filePath),
        browsers: ['chrome', 'firefox', 'safari', 'edge']
      });

      // Cache analysis
      this.analysisCache.set(filePath, {
        ...analysis,
        timestamp: Date.now()
      });

      // Check for alerts
      await this.checkAlerts(filePath, analysis);

      this.emit('fileAnalyzed', { filePath, analysis });
    } catch (error) {
      console.error(`❌ Failed to analyze ${filePath}:`, error.message);
      this.emit('error', error);
    }
  }

  /**
   * Analyze all files in a path
   */
  async analyzePath(basePath) {
    const files = await this.getRelevantFiles(basePath);
    
    for (const file of files) {
      await this.analyzeFile(file);
    }
  }

  /**
   * Get all relevant files in a path
   */
  async getRelevantFiles(basePath) {
    const files = [];
    
    if (fs.statSync(basePath).isFile()) {
      if (this.isRelevantFile(basePath)) {
        files.push(basePath);
      }
      return files;
    }

    const entries = fs.readdirSync(basePath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(basePath, entry.name);
      
      if (entry.isDirectory() && !this.shouldIgnoreDirectory(entry.name)) {
        files.push(...await this.getRelevantFiles(fullPath));
      } else if (entry.isFile() && this.isRelevantFile(fullPath)) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  /**
   * Check if file is relevant for monitoring
   */
  isRelevantFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const relevantExtensions = ['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.html', '.vue'];
    return relevantExtensions.includes(ext);
  }

  /**
   * Check if directory should be ignored
   */
  shouldIgnoreDirectory(dirName) {
    const ignoreDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];
    return ignoreDirs.includes(dirName) || dirName.startsWith('.');
  }

  /**
   * Check for alerts based on analysis
   */
  async checkAlerts(filePath, analysis) {
    const alerts = [];

    // Risk score alert
    if (analysis.riskScore > this.options.alertThresholds.riskScore) {
      alerts.push({
        type: 'risk',
        severity: 'high',
        message: `High risk score detected: ${analysis.riskScore}%`,
        filePath,
        value: analysis.riskScore,
        threshold: this.options.alertThresholds.riskScore
      });
    }

    // Compatibility score alert
    if (analysis.compatibilityScore < this.options.alertThresholds.compatibilityScore) {
      alerts.push({
        type: 'compatibility',
        severity: 'high',
        message: `Low compatibility score: ${analysis.compatibilityScore}%`,
        filePath,
        value: analysis.compatibilityScore,
        threshold: this.options.alertThresholds.compatibilityScore
      });
    }

    // Critical recommendations alert
    const criticalRecs = analysis.recommendations?.filter(r => r.severity === 'critical') || [];
    if (criticalRecs.length > 0) {
      alerts.push({
        type: 'critical',
        severity: 'critical',
        message: `${criticalRecs.length} critical issues found`,
        filePath,
        recommendations: criticalRecs
      });
    }

    // Emit alerts
    for (const alert of alerts) {
      this.emit('alert', alert);
      this.alertHistory.push({
        ...alert,
        timestamp: Date.now()
      });
    }

    // Send notifications if enabled
    if (this.options.enableNotifications && alerts.length > 0) {
      await this.sendNotifications(alerts);
    }
  }

  /**
   * Send notifications for alerts
   */
  async sendNotifications(alerts) {
    for (const alert of alerts) {
      try {
        // Console notification
        console.log(`🚨 ALERT: ${alert.message} in ${alert.filePath}`);
        
        // Could integrate with:
        // - Slack webhooks
        // - Email notifications
        // - Desktop notifications
        // - WebSocket to dashboard
        
        this.emit('notification', alert);
      } catch (error) {
        console.error('❌ Failed to send notification:', error.message);
      }
    }
  }

  /**
   * Start polling for changes (fallback for systems without fs.watch)
   */
  startPolling() {
    this.pollInterval = setInterval(async () => {
      if (!this.isRunning) return;

      try {
        for (const watchPath of this.options.watchPaths) {
          await this.pollPath(watchPath);
        }
      } catch (error) {
        this.emit('error', error);
      }
    }, this.options.pollInterval);
  }

  /**
   * Poll a path for changes
   */
  async pollPath(basePath) {
    const files = await this.getRelevantFiles(basePath);
    
    for (const file of files) {
      try {
        const stats = fs.statSync(file);
        const mtime = stats.mtime.getTime();
        const cached = this.fileHashes.get(file);
        
        if (!cached || cached !== mtime) {
          this.fileHashes.set(file, mtime);
          await this.analyzeFile(file);
        }
      } catch (error) {
        // File might have been deleted
        if (fs.existsSync(file)) {
          console.error(`❌ Failed to poll ${file}:`, error.message);
        }
      }
    }
  }

  /**
   * Handle file deletion
   */
  handleFileDeleted(filePath) {
    this.fileHashes.delete(filePath);
    this.analysisCache.delete(filePath);
    this.emit('fileDeleted', { filePath });
  }

  /**
   * Get monitoring statistics
   */
  getStats() {
    return {
      isRunning: this.isRunning,
      watchedPaths: this.options.watchPaths.length,
      totalFiles: this.fileHashes.size,
      cachedAnalyses: this.analysisCache.size,
      totalAlerts: this.alertHistory.length,
      recentAlerts: this.alertHistory.slice(-10),
      uptime: this.isRunning ? Date.now() - this.startTime : 0
    };
  }

  /**
   * Get current analysis summary
   */
  getAnalysisSummary() {
    const analyses = Array.from(this.analysisCache.values());
    
    if (analyses.length === 0) {
      return { message: 'No analyses available' };
    }

    const avgRiskScore = analyses.reduce((sum, a) => sum + (a.riskScore || 0), 0) / analyses.length;
    const avgCompatibilityScore = analyses.reduce((sum, a) => sum + (a.compatibilityScore || 0), 0) / analyses.length;
    const totalRecommendations = analyses.reduce((sum, a) => sum + (a.recommendations?.length || 0), 0);

    return {
      totalFiles: analyses.length,
      averageRiskScore: Math.round(avgRiskScore),
      averageCompatibilityScore: Math.round(avgCompatibilityScore),
      totalRecommendations,
      criticalIssues: analyses.filter(a => a.riskScore > 70).length,
      lastUpdated: Math.max(...analyses.map(a => a.timestamp))
    };
  }

  /**
   * Setup event handlers
   */
  setupEventHandlers() {
    this.on('alert', (alert) => {
      console.log(`🚨 ${alert.severity.toUpperCase()}: ${alert.message}`);
    });

    this.on('error', (error) => {
      console.error('❌ Monitor error:', error.message);
    });

    this.on('fileAnalyzed', ({ filePath, analysis }) => {
      console.log(`✅ Analyzed: ${path.basename(filePath)} (Risk: ${analysis.riskScore}%, Compat: ${analysis.compatibilityScore}%)`);
    });
  }

  /**
   * Get file hash for change detection
   */
  getFileHash(content) {
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }

  /**
   * Detect framework from file path
   */
  detectFramework(filePath) {
    if (filePath.includes('node_modules/react')) return 'react';
    if (filePath.includes('node_modules/vue')) return 'vue';
    if (filePath.includes('node_modules/angular')) return 'angular';
    if (filePath.includes('.vue')) return 'vue';
    if (filePath.includes('.jsx') || filePath.includes('.tsx')) return 'react';
    return 'vanilla';
  }
}

export default RealtimeMonitor;

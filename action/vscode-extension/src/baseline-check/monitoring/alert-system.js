/**
 * Alert System
 * Manages alerts, notifications, and escalation for real-time monitoring
 */

import fs from 'node:fs';

export class AlertSystem {
  constructor(options = {}) {
    this.options = {
      alertHistoryPath: options.alertHistoryPath || './alert-history.json',
      maxHistorySize: options.maxHistorySize || 1000,
      escalationRules: {
        critical: { maxCount: 5, timeWindow: 300000 }, // 5 minutes
        high: { maxCount: 10, timeWindow: 600000 },    // 10 minutes
        medium: { maxCount: 20, timeWindow: 1800000 }, // 30 minutes
        low: { maxCount: 50, timeWindow: 3600000 }     // 1 hour
      },
      notificationChannels: options.notificationChannels || ['console'],
      ...options
    };
    
    this.alertHistory = this.loadAlertHistory();
    this.activeAlerts = new Map();
    this.escalationTimers = new Map();
    this.notificationHandlers = this.setupNotificationHandlers();
  }

  /**
   * Process a new alert
   */
  async processAlert(alert) {
    const alertId = this.generateAlertId(alert);
    const enrichedAlert = {
      ...alert,
      id: alertId,
      timestamp: Date.now(),
      status: 'active',
      count: 1
    };

    // Check if this is a duplicate alert
    const existingAlert = this.activeAlerts.get(alertId);
    if (existingAlert) {
      existingAlert.count++;
      existingAlert.lastSeen = Date.now();
      return existingAlert;
    } else {
      this.activeAlerts.set(alertId, enrichedAlert);
    }

    // Add to history
    this.alertHistory.unshift(enrichedAlert);
    if (this.alertHistory.length > this.options.maxHistorySize) {
      this.alertHistory = this.alertHistory.slice(0, this.options.maxHistorySize);
    }

    // Save history
    await this.saveAlertHistory();

    // Check escalation rules
    await this.checkEscalation(enrichedAlert);

    // Send notifications
    await this.sendNotifications(enrichedAlert);

    return enrichedAlert;
  }

  /**
   * Check escalation rules
   */
  async checkEscalation(alert) {
    const rule = this.options.escalationRules[alert.severity];
    if (!rule) return;

    const timeWindow = rule.timeWindow;
    const maxCount = rule.maxCount;
    const now = Date.now();
    
    // Count similar alerts in time window
    const recentAlerts = this.alertHistory.filter(a => 
      a.type === alert.type &&
      a.filePath === alert.filePath &&
      (now - a.timestamp) <= timeWindow
    );

    if (recentAlerts.length >= maxCount) {
      await this.escalateAlert(alert, recentAlerts.length);
    }
  }

  /**
   * Escalate an alert
   */
  async escalateAlert(alert, count) {
    const escalation = {
      ...alert,
      escalated: true,
      escalationCount: count,
      escalationTime: Date.now(),
      originalSeverity: alert.severity
    };

    // Upgrade severity
    if (alert.severity === 'low') escalation.severity = 'medium';
    else if (alert.severity === 'medium') escalation.severity = 'high';
    else if (alert.severity === 'high') escalation.severity = 'critical';

    console.log(`🚨 ESCALATED: ${alert.message} (${count} occurrences)`);
    
    // Send escalation notification
    await this.sendNotifications(escalation, 'escalation');
    
    this.emit('escalation', escalation);
  }

  /**
   * Send notifications
   */
  async sendNotifications(alert, type = 'alert') {
    for (const channel of this.options.notificationChannels) {
      const handler = this.notificationHandlers[channel];
      if (handler) {
        try {
          await handler(alert, type);
        } catch (error) {
          console.error(`❌ Failed to send notification via ${channel}:`, error.message);
        }
      }
    }
  }

  /**
   * Setup notification handlers
   */
  setupNotificationHandlers() {
    return {
      console: (alert, type) => this.consoleNotification(alert, type),
      file: (alert, type) => this.fileNotification(alert, type),
      webhook: (alert, type) => this.webhookNotification(alert, type),
      email: (alert, type) => this.emailNotification(alert, type),
      slack: (alert, type) => this.slackNotification(alert, type)
    };
  }

  /**
   * Console notification
   */
  consoleNotification(alert, type) {
    const timestamp = new Date(alert.timestamp).toLocaleTimeString();
    const severity = alert.severity.toUpperCase();
    const icon = this.getSeverityIcon(alert.severity);
    
    if (type === 'escalation') {
      console.log(`\n${icon} 🚨 ESCALATED ALERT [${timestamp}]`);
    } else {
      console.log(`\n${icon} ALERT [${timestamp}]`);
    }
    
    console.log(`   Type: ${alert.type}`);
    console.log(`   Severity: ${severity}`);
    console.log(`   File: ${alert.filePath}`);
    console.log(`   Message: ${alert.message}`);
    
    if (alert.count > 1) {
      console.log(`   Count: ${alert.count} occurrences`);
    }
    
    if (alert.recommendations) {
      console.log(`   Recommendations: ${alert.recommendations.length} available`);
    }
    
    console.log('');
  }

  /**
   * File notification
   */
  async fileNotification(alert, type) {
    const logEntry = {
      timestamp: new Date(alert.timestamp).toISOString(),
      type: type,
      alert: alert
    };
    
    const logFile = `./alerts-${new Date().toISOString().split('T')[0]}.log`;
    const logLine = JSON.stringify(logEntry) + '\n';
    
    await fs.promises.appendFile(logFile, logLine);
  }

  /**
   * Webhook notification
   */
  async webhookNotification(alert, type) {
    if (!this.options.webhookUrl) return;
    
    const payload = {
      text: `${this.getSeverityIcon(alert.severity)} Baseline Check Alert`,
      attachments: [{
        color: this.getSeverityColor(alert.severity),
        fields: [
          { title: 'Type', value: alert.type, short: true },
          { title: 'Severity', value: alert.severity, short: true },
          { title: 'File', value: alert.filePath, short: false },
          { title: 'Message', value: alert.message, short: false }
        ],
        timestamp: alert.timestamp
      }]
    };
    
    // In a real implementation, you'd use fetch or axios
    console.log(`📡 Webhook notification: ${JSON.stringify(payload)}`);
  }

  /**
   * Email notification
   */
  async emailNotification(alert, type) {
    if (!this.options.emailConfig) return;
    
    const subject = `Baseline Check Alert: ${alert.severity.toUpperCase()} - ${alert.type}`;
    const body = `
Baseline Check Tool Alert

Type: ${alert.type}
Severity: ${alert.severity}
File: ${alert.filePath}
Message: ${alert.message}
Time: ${new Date(alert.timestamp).toLocaleString()}

${alert.recommendations ? `Recommendations: ${alert.recommendations.length} available` : ''}

---
Generated by Baseline Check Tool
    `.trim();
    
    // In a real implementation, you'd use nodemailer or similar
    console.log(`📧 Email notification: ${subject}`);
  }

  /**
   * Slack notification
   */
  async slackNotification(alert, type) {
    if (!this.options.slackWebhook) return;
    
    const message = {
      text: `${this.getSeverityIcon(alert.severity)} *Baseline Check Alert*`,
      attachments: [{
        color: this.getSeverityColor(alert.severity),
        title: `${alert.severity.toUpperCase()}: ${alert.type}`,
        text: alert.message,
        fields: [
          { title: 'File', value: alert.filePath, short: true },
          { title: 'Time', value: new Date(alert.timestamp).toLocaleString(), short: true }
        ]
      }]
    };
    
    // In a real implementation, you'd use fetch to send to Slack webhook
    console.log(`💬 Slack notification: ${JSON.stringify(message)}`);
  }

  /**
   * Get alert statistics
   */
  getStats() {
    const now = Date.now();
    const last24h = now - (24 * 60 * 60 * 1000);
    const last1h = now - (60 * 60 * 1000);
    
    const recentAlerts = this.alertHistory.filter(a => a.timestamp >= last24h);
    const hourlyAlerts = this.alertHistory.filter(a => a.timestamp >= last1h);
    
    const bySeverity = recentAlerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {});
    
    const byType = recentAlerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1;
      return acc;
    }, {});
    
    return {
      total: this.alertHistory.length,
      active: this.activeAlerts.size,
      last24h: recentAlerts.length,
      last1h: hourlyAlerts.length,
      bySeverity,
      byType,
      escalated: recentAlerts.filter(a => a.escalated).length
    };
  }

  /**
   * Get active alerts
   */
  getActiveAlerts() {
    return Array.from(this.activeAlerts.values());
  }

  /**
   * Clear resolved alert
   */
  clearAlert(alertId) {
    const alert = this.activeAlerts.get(alertId);
    if (alert) {
      alert.status = 'resolved';
      alert.resolvedAt = Date.now();
      this.activeAlerts.delete(alertId);
      return true;
    }
    return false;
  }

  /**
   * Clear all alerts
   */
  clearAllAlerts() {
    this.activeAlerts.clear();
    console.log('🧹 All alerts cleared');
  }

  /**
   * Generate unique alert ID
   */
  generateAlertId(alert) {
    const key = `${alert.type}-${alert.filePath}-${alert.message}`;
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get severity icon
   */
  getSeverityIcon(severity) {
    const icons = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢'
    };
    return icons[severity] || '⚪';
  }

  /**
   * Get severity color
   */
  getSeverityColor(severity) {
    const colors = {
      critical: 'danger',
      high: 'warning',
      medium: 'good',
      low: '#36a64f'
    };
    return colors[severity] || '#36a64f';
  }

  /**
   * Load alert history
   */
  loadAlertHistory() {
    try {
      if (fs.existsSync(this.options.alertHistoryPath)) {
        const data = fs.readFileSync(this.options.alertHistoryPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.warn('Failed to load alert history:', error.message);
    }
    return [];
  }

  /**
   * Save alert history
   */
  async saveAlertHistory() {
    try {
      await fs.promises.writeFile(
        this.options.alertHistoryPath,
        JSON.stringify(this.alertHistory, null, 2)
      );
    } catch (error) {
      console.error('Failed to save alert history:', error.message);
    }
  }
}

export default AlertSystem;

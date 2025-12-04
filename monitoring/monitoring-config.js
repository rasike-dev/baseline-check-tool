// Monitoring configuration for Baseline Check Tool
export default {
  // Analytics settings
  analytics: {
    enabled: true,
    endpoint: process.env.ANALYTICS_ENDPOINT || 'https://analytics.baseline-check.dev/api',
    apiKey: process.env.ANALYTICS_API_KEY,
    batchSize: 100,
    flushInterval: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000
  },
  
  // Metrics collection
  metrics: {
    // Performance metrics
    performance: {
      scanDuration: true,
      fileProcessingTime: true,
      memoryUsage: true,
      cacheHitRate: true
    },
    
    // Usage metrics
    usage: {
      commandUsage: true,
      featureDetection: true,
      errorRates: true,
      userAgents: true
    },
    
    // Compatibility metrics
    compatibility: {
      baselineFeatures: true,
      riskyFeatures: true,
      unknownFeatures: true,
      browserSupport: true
    }
  },
  
  // Alerts configuration
  alerts: {
    enabled: true,
    channels: ['email', 'slack', 'webhook'],
    
    thresholds: {
      errorRate: 0.05, // 5%
      riskyFeatureRatio: 0.3, // 30%
      unknownFeatureRatio: 0.2, // 20%
      performanceDegradation: 0.2 // 20%
    },
    
    // Email alerts
    email: {
      enabled: process.env.EMAIL_ALERTS === 'true',
      recipients: process.env.ALERT_EMAILS?.split(',') || [],
      smtp: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      }
    },
    
    // Slack alerts
    slack: {
      enabled: process.env.SLACK_ALERTS === 'true',
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      channel: process.env.SLACK_CHANNEL || '#baseline-check'
    },
    
    // Webhook alerts
    webhook: {
      enabled: process.env.WEBHOOK_ALERTS === 'true',
      url: process.env.WEBHOOK_URL,
      secret: process.env.WEBHOOK_SECRET
    }
  },
  
  // Dashboard settings
  dashboard: {
    refreshInterval: 30000, // 30 seconds
    maxDataPoints: 1000,
    chartTypes: ['line', 'bar', 'pie'],
    exportFormats: ['json', 'csv', 'pdf']
  },
  
  // Data retention
  retention: {
    analytics: '90d', // 90 days
    metrics: '30d', // 30 days
    logs: '7d', // 7 days
    alerts: '30d' // 30 days
  },
  
  // Privacy settings
  privacy: {
    anonymizeIPs: true,
    collectUserAgents: false,
    collectFilePaths: false,
    dataEncryption: true
  }
};

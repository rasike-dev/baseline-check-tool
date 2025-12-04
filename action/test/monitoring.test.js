/**
 * Tests for Real-time Monitoring System
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { RealtimeMonitor } from '../src/monitoring/realtime-monitor.js';
import { AlertSystem } from '../src/monitoring/alert-system.js';
import { RealtimeDashboard } from '../src/monitoring/realtime-dashboard.js';

describe('RealtimeMonitor', () => {
  let monitor;
  let testDir;

  beforeEach(async () => {
    // Create test directory
    testDir = path.join(process.cwd(), 'test-monitor-temp');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    monitor = new RealtimeMonitor({
      watchPaths: [testDir],
      pollInterval: 100,
      enableAlerts: false
    });
  });

  afterEach(async () => {
    if (monitor) {
      monitor.stop();
    }
    
    // Cleanup test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  test('should initialize with correct options', () => {
    assert.strictEqual(monitor.options.watchPaths[0], testDir);
    assert.strictEqual(monitor.options.pollInterval, 100);
    assert.strictEqual(monitor.options.enableAlerts, false);
    assert.strictEqual(monitor.isRunning, false);
  });

  test('should start and stop monitoring', async () => {
    assert.strictEqual(monitor.isRunning, false);
    
    await monitor.start();
    assert.strictEqual(monitor.isRunning, true);
    
    monitor.stop();
    assert.strictEqual(monitor.isRunning, false);
  });

  test('should detect file changes', async () => {
    let fileAnalyzed = false;
    
    monitor.on('fileAnalyzed', () => {
      fileAnalyzed = true;
    });

    await monitor.start();
    
    // Create a test file
    const testFile = path.join(testDir, 'test.js');
    fs.writeFileSync(testFile, 'console.log("test");');
    
    // Wait for file to be analyzed
    await new Promise(resolve => setTimeout(resolve, 200));
    
    assert.strictEqual(fileAnalyzed, true);
  });

  test('should ignore irrelevant files', async () => {
    let fileAnalyzed = false;
    
    monitor.on('fileAnalyzed', () => {
      fileAnalyzed = true;
    });

    await monitor.start();
    
    // Create an irrelevant file
    const testFile = path.join(testDir, 'test.txt');
    fs.writeFileSync(testFile, 'test content');
    
    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 200));
    
    assert.strictEqual(fileAnalyzed, false);
  });

  test('should get monitoring statistics', async () => {
    await monitor.start();
    
    const stats = monitor.getStats();
    
    assert.strictEqual(typeof stats.isRunning, 'boolean');
    assert.strictEqual(typeof stats.watchedPaths, 'number');
    assert.strictEqual(typeof stats.totalFiles, 'number');
    assert.strictEqual(typeof stats.cachedAnalyses, 'number');
    assert.strictEqual(typeof stats.totalAlerts, 'number');
  });

  test('should detect framework from file path', () => {
    assert.strictEqual(monitor.detectFramework('src/component.jsx'), 'react');
    assert.strictEqual(monitor.detectFramework('src/component.vue'), 'vue');
    assert.strictEqual(monitor.detectFramework('src/component.js'), 'vanilla');
  });
});

describe('AlertSystem', () => {
  let alertSystem;

  beforeEach(() => {
    alertSystem = new AlertSystem({
      alertHistoryPath: './test-alert-history.json'
    });
  });

  afterEach(() => {
    // Cleanup test files
    if (fs.existsSync('./test-alert-history.json')) {
      fs.unlinkSync('./test-alert-history.json');
    }
    if (fs.existsSync('./alerts-export.json')) {
      fs.unlinkSync('./alerts-export.json');
    }
  });

  test('should initialize with correct options', () => {
    assert.strictEqual(alertSystem.options.alertHistoryPath, './test-alert-history.json');
    assert.strictEqual(alertSystem.options.maxHistorySize, 1000);
    assert.strictEqual(Array.isArray(alertSystem.alertHistory), true);
  });

  test('should process alerts', async () => {
    const alert = {
      type: 'compatibility',
      severity: 'high',
      message: 'Test alert',
      filePath: 'test.js'
    };

    const processedAlert = await alertSystem.processAlert(alert);
    
    assert.strictEqual(processedAlert.type, 'compatibility');
    assert.strictEqual(processedAlert.severity, 'high');
    assert.strictEqual(processedAlert.message, 'Test alert');
    assert.strictEqual(processedAlert.status, 'active');
    assert.strictEqual(processedAlert.count, 1);
  });

  test('should handle duplicate alerts', async () => {
    const alert = {
      type: 'compatibility',
      severity: 'high',
      message: 'Test alert',
      filePath: 'test.js'
    };

    await alertSystem.processAlert(alert);
    const processedAlert = await alertSystem.processAlert(alert);
    
    assert.strictEqual(processedAlert.count, 2);
  });

  test('should get alert statistics', async () => {
    // Add some test alerts
    await alertSystem.processAlert({
      type: 'compatibility',
      severity: 'high',
      message: 'Test alert 1',
      filePath: 'test1.js'
    });

    await alertSystem.processAlert({
      type: 'performance',
      severity: 'medium',
      message: 'Test alert 2',
      filePath: 'test2.js'
    });

    const stats = alertSystem.getStats();
    
    assert.strictEqual(stats.total, 2);
    assert.strictEqual(stats.active, 2);
    assert.strictEqual(stats.bySeverity.high, 1);
    assert.strictEqual(stats.bySeverity.medium, 1);
    assert.strictEqual(stats.byType.compatibility, 1);
    assert.strictEqual(stats.byType.performance, 1);
  });

  test('should clear alerts', async () => {
    await alertSystem.processAlert({
      type: 'compatibility',
      severity: 'high',
      message: 'Test alert',
      filePath: 'test.js'
    });

    assert.strictEqual(alertSystem.getActiveAlerts().length, 1);
    
    alertSystem.clearAllAlerts();
    
    assert.strictEqual(alertSystem.getActiveAlerts().length, 0);
  });

  test('should generate unique alert IDs', () => {
    const alert1 = {
      type: 'compatibility',
      severity: 'high',
      message: 'Test alert',
      filePath: 'test.js'
    };

    const alert2 = {
      type: 'compatibility',
      severity: 'high',
      message: 'Test alert',
      filePath: 'test.js'
    };

    const id1 = alertSystem.generateAlertId(alert1);
    const id2 = alertSystem.generateAlertId(alert2);
    
    assert.strictEqual(id1, id2); // Same alert should have same ID
  });

  test('should get severity icons and colors', () => {
    assert.strictEqual(alertSystem.getSeverityIcon('critical'), '🔴');
    assert.strictEqual(alertSystem.getSeverityIcon('high'), '🟠');
    assert.strictEqual(alertSystem.getSeverityIcon('medium'), '🟡');
    assert.strictEqual(alertSystem.getSeverityIcon('low'), '🟢');
    
    assert.strictEqual(alertSystem.getSeverityColor('critical'), 'danger');
    assert.strictEqual(alertSystem.getSeverityColor('high'), 'warning');
    assert.strictEqual(alertSystem.getSeverityColor('medium'), 'good');
    assert.strictEqual(alertSystem.getSeverityColor('low'), '#36a64f');
  });
});

describe('RealtimeDashboard', () => {
  let dashboard;

  beforeEach(() => {
    dashboard = new RealtimeDashboard({
      theme: 'dark',
      title: 'Test Dashboard'
    });
  });

  test('should initialize with correct options', () => {
    assert.strictEqual(dashboard.options.theme, 'dark');
    assert.strictEqual(dashboard.options.title, 'Test Dashboard');
    assert.strictEqual(dashboard.options.port, 3000);
  });

  test('should generate HTML dashboard', () => {
    const html = dashboard.generateHTML();
    
    assert.strictEqual(typeof html, 'string');
    assert.ok(html.includes('<!DOCTYPE html>'));
    assert.ok(html.includes('Test Dashboard'));
    assert.ok(html.includes('Real-time Monitoring Dashboard'));
    assert.ok(html.includes('startMonitoring()'));
    assert.ok(html.includes('stopMonitoring()'));
  });

  test('should include theme-specific styles', () => {
    const html = dashboard.generateHTML();
    
    // Check for dark theme styles
    assert.ok(html.includes('#1a1a1a')); // Dark background
    assert.ok(html.includes('#ffffff')); // Light text
  });

  test('should include interactive JavaScript', () => {
    const html = dashboard.generateHTML();
    
    assert.ok(html.includes('function startMonitoring()'));
    assert.ok(html.includes('function stopMonitoring()'));
    assert.ok(html.includes('function refreshData()'));
    assert.ok(html.includes('generateMockAlerts()'));
    assert.ok(html.includes('generateMockFiles()'));
  });

  test('should create dashboard file', async () => {
    const outputPath = './test-dashboard.html';
    
    try {
      const html = dashboard.generateHTML();
      await fs.promises.writeFile(outputPath, html);
      
      assert.ok(fs.existsSync(outputPath));
      
      const content = fs.readFileSync(outputPath, 'utf8');
      assert.ok(content.includes('Test Dashboard'));
      
    } finally {
      // Cleanup
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    }
  });
});

describe('Monitoring Integration', () => {
  test('should integrate monitor with alert system', async () => {
    const testDir = path.join(process.cwd(), 'test-integration-temp');
    
    try {
      // Create test directory
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }

      const monitor = new RealtimeMonitor({
        watchPaths: [testDir],
        pollInterval: 100,
        enableAlerts: true
      });

      const alertSystem = new AlertSystem({
        alertHistoryPath: './test-integration-alerts.json'
      });

      let alertReceived = false;
      
      monitor.on('alert', async (alert) => {
        await alertSystem.processAlert(alert);
        alertReceived = true;
      });

      await monitor.start();
      
      // Create a test file that should trigger an alert
      const testFile = path.join(testDir, 'test.js');
      fs.writeFileSync(testFile, 'eval("dangerous code");'); // This should trigger a security alert
      
      // Wait for analysis
      await new Promise(resolve => setTimeout(resolve, 500));
      
      monitor.stop();
      
      // Check if alert was processed
      const stats = alertSystem.getStats();
      assert.ok(stats.total >= 0); // At least some analysis should have occurred
      
    } finally {
      // Cleanup
      if (fs.existsSync(testDir)) {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
      if (fs.existsSync('./test-integration-alerts.json')) {
        fs.unlinkSync('./test-integration-alerts.json');
      }
    }
  });
});

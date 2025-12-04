#!/usr/bin/env node

/**
 * Health Check Script for Baseline Check Tool
 * Monitors tool health and sends alerts if issues are detected
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class HealthChecker {
  constructor() {
    this.checks = [];
    this.results = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    };
  }

  addCheck(name, checkFn, critical = true) {
    this.checks.push({ name, checkFn, critical });
  }

  async runChecks() {
    console.log('🔍 Running health checks...\n');

    for (const check of this.checks) {
      try {
        const result = await check.checkFn();
        const checkResult = {
          name: check.name,
          status: result.status,
          message: result.message,
          critical: check.critical,
          duration: result.duration || 0
        };

        this.results.checks.push(checkResult);
        this.results.summary.total++;

        if (result.status === 'passed') {
          this.results.summary.passed++;
          console.log(`✅ ${check.name}: ${result.message}`);
        } else if (result.status === 'warning') {
          this.results.summary.warnings++;
          console.log(`⚠️  ${check.name}: ${result.message}`);
        } else {
          this.results.summary.failed++;
          console.log(`❌ ${check.name}: ${result.message}`);
          
          if (check.critical) {
            this.results.status = 'unhealthy';
          }
        }
      } catch (error) {
        this.results.summary.failed++;
        this.results.checks.push({
          name: check.name,
          status: 'failed',
          message: `Check failed: ${error.message}`,
          critical: check.critical,
          duration: 0
        });
        console.log(`❌ ${check.name}: Check failed - ${error.message}`);
        
        if (check.critical) {
          this.results.status = 'unhealthy';
        }
      }
    }

    return this.results;
  }

  generateReport() {
    const report = {
      ...this.results,
      summary: {
        ...this.results.summary,
        healthScore: this.calculateHealthScore()
      }
    };

    return report;
  }

  calculateHealthScore() {
    const { total, passed, warnings, failed } = this.results.summary;
    if (total === 0) return 100;
    
    const score = ((passed + warnings * 0.5) / total) * 100;
    return Math.round(score);
  }
}

// Initialize health checker
const healthChecker = new HealthChecker();

// Add health checks
healthChecker.addCheck('Package Installation', async () => {
  const start = Date.now();
  
  try {
    // Check if package is installed
    const packagePath = path.join(__dirname, '..', 'action', 'package.json');
    if (!fs.existsSync(packagePath)) {
      return { status: 'failed', message: 'Package not found' };
    }

    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    if (!packageJson.name || !packageJson.version) {
      return { status: 'failed', message: 'Invalid package.json' };
    }

    return {
      status: 'passed',
      message: `Package ${packageJson.name}@${packageJson.version} is installed`,
      duration: Date.now() - start
    };
  } catch (error) {
    return { status: 'failed', message: `Package check failed: ${error.message}` };
  }
});

healthChecker.addCheck('Source Files', async () => {
  const start = Date.now();
  const srcPath = path.join(__dirname, '..', 'action', 'src');
  
  if (!fs.existsSync(srcPath)) {
    return { status: 'failed', message: 'Source directory not found' };
  }

  const files = fs.readdirSync(srcPath);
  const requiredFiles = ['cli.js', 'scan.js', 'check.js', 'index.js'];
  const missingFiles = requiredFiles.filter(file => !files.includes(file));

  if (missingFiles.length > 0) {
    return { status: 'failed', message: `Missing required files: ${missingFiles.join(', ')}` };
  }

  return {
    status: 'passed',
    message: `All ${files.length} source files present`,
    duration: Date.now() - start
  };
});

healthChecker.addCheck('Dependencies', async () => {
  const start = Date.now();
  const packagePath = path.join(__dirname, '..', 'action', 'package.json');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const dependencies = Object.keys(packageJson.dependencies || {});
    
    if (dependencies.length === 0) {
      return { status: 'warning', message: 'No dependencies found' };
    }

    return {
      status: 'passed',
      message: `${dependencies.length} dependencies configured`,
      duration: Date.now() - start
    };
  } catch (error) {
    return { status: 'failed', message: `Dependency check failed: ${error.message}` };
  }
});

healthChecker.addCheck('CLI Executable', async () => {
  const start = Date.now();
  const cliPath = path.join(__dirname, '..', 'action', 'src', 'cli.js');
  
  if (!fs.existsSync(cliPath)) {
    return { status: 'failed', message: 'CLI file not found' };
  }

  // Check if file is executable (basic check)
  const stats = fs.statSync(cliPath);
  if (!stats.isFile()) {
    return { status: 'failed', message: 'CLI is not a file' };
  }

  return {
    status: 'passed',
    message: 'CLI executable is present',
    duration: Date.now() - start
  };
});

healthChecker.addCheck('Test Suite', async () => {
  const start = Date.now();
  const testPath = path.join(__dirname, '..', 'action', 'test');
  
  if (!fs.existsSync(testPath)) {
    return { status: 'warning', message: 'Test directory not found' };
  }

  const testFiles = fs.readdirSync(testPath).filter(file => file.endsWith('.test.js'));
  
  if (testFiles.length === 0) {
    return { status: 'warning', message: 'No test files found' };
  }

  return {
    status: 'passed',
    message: `${testFiles.length} test files found`,
    duration: Date.now() - start
  };
});

healthChecker.addCheck('Documentation', async () => {
  const start = Date.now();
  const docsPath = path.join(__dirname, '..', 'README.md');
  
  if (!fs.existsSync(docsPath)) {
    return { status: 'warning', message: 'README.md not found' };
  }

  const readme = fs.readFileSync(docsPath, 'utf8');
  const hasInstallation = readme.includes('install') || readme.includes('Installation');
  const hasUsage = readme.includes('usage') || readme.includes('Usage');

  if (!hasInstallation || !hasUsage) {
    return { status: 'warning', message: 'Documentation may be incomplete' };
  }

  return {
    status: 'passed',
    message: 'Documentation is present and complete',
    duration: Date.now() - start
  };
});

// Run health checks
async function main() {
  try {
    const results = await healthChecker.runChecks();
    const report = healthChecker.generateReport();

    console.log('\n📊 Health Check Summary:');
    console.log(`Total Checks: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Warnings: ${report.summary.warnings}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Health Score: ${report.summary.healthScore}%`);
    console.log(`Overall Status: ${report.status.toUpperCase()}`);

    // Save report
    const reportPath = path.join(__dirname, 'health-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved to: ${reportPath}`);

    // Exit with appropriate code
    process.exit(report.status === 'healthy' ? 0 : 1);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default HealthChecker;

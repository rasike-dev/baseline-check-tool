#!/usr/bin/env node

import fs from 'node:fs';
import { program } from 'commander';
import { scan } from './scan.js';
import { check } from './check.js';
import { generateSummary } from './reporters/summary.js';
import { CacheManager } from './cache.js';
import { ProgressBar, Spinner, Logger, Table } from './ui.js';
import { RecommendationEngine } from './recommendations.js';
import { FrameworkIntegrations } from './integrations.js';
import { AnalyticsEngine } from './analytics.js';
import { InteractiveMode } from './interactive.js';
import { ErrorHandler } from './error-handler.js';
import { ExamplesGenerator } from './examples.js';
import { AIAnalyzer, AIRecommendations, AICodeFixer, AILearning } from './ai/index.js';
import { RealtimeMonitor } from './monitoring/realtime-monitor.js';
import { AlertSystem } from './monitoring/alert-system.js';
import { RealtimeDashboard } from './monitoring/realtime-dashboard.js';
import { handlePerformanceCommand } from './commands/performance-command.js';
import { handleEnhancedPerformanceCommand } from './commands/enhanced-performance-command.js';
import { createFeatureDetector, getFeatureStats } from './features/index.js';
import { SecurityAnalysis } from './security/index.js';
import { AccessibilityAnalysis } from './accessibility/index.js';
import { SEOAnalysis } from './seo/index.js';
import { BundleAnalysis } from './bundle/index.js';
import { BaselineAnalysis } from './baseline/index.js';
import { PerformanceAnalysis } from './performance/index.js';
import path from 'node:path';

program
  .name('baseline-check')
  .description('Check web features for baseline browser compatibility')
  .version('2.0.0');

program
  .command('scan')
  .description('Scan codebase for modern web features')
  .option('-p, --paths <paths>', 'Comma-separated paths to scan', '.')
  .option('-o, --out <file>', 'Output file for scan results', 'baseline-report.json')
  .option('-c, --config <file>', 'Configuration file path')
  .action(async (options) => {
    try {
      await scan(options);
    } catch (error) {
      console.error(`Scan failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('check')
  .description('Check feature compatibility against browser data')
  .requiredOption('-r, --report <file>', 'Input report file from scan')
  .option('-o, --out <file>', 'Output file for compatibility results')
  .action(async (options) => {
    try {
      await check(options);
    } catch (error) {
      console.error(`Check failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('report')
  .description('Generate a summary report')
  .option('-r, --report <file>', 'Input report file', 'baseline-report.json')
  .option('-f, --format <format>', 'Output format (markdown, json, html)', 'markdown')
  .option('-o, --out <file>', 'Output file')
  .action(async (options) => {
    try {
      await generateSummary(options);
    } catch (error) {
      console.error(`Report generation failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('run')
  .description('Run complete scan and check pipeline')
  .option('-p, --paths <paths>', 'Comma-separated paths to scan', '.')
  .option('-o, --out <file>', 'Output file for final results', 'baseline-report.json')
  .option('-c, --config <file>', 'Configuration file path')
  .option('--no-check', 'Skip compatibility checking')
  .option('--no-report', 'Skip report generation')
  .action(async (options) => {
    try {
      console.log('🚀 Starting baseline check pipeline...');
      
      // Step 1: Scan
      console.log('📁 Scanning for features...');
      const scanResult = await scan({
        paths: options.paths,
        out: options.out,
        config: options.config
      });
      
      // Verify scan completed successfully
      if (!scanResult || !scanResult.metadata) {
        throw new Error('Scan failed to complete');
      }
      
      if (options.check !== false) {
        // Step 2: Check compatibility
        console.log('🔍 Checking browser compatibility...');
        
        // Verify the scan output file exists
        if (!fs.existsSync(options.out)) {
          throw new Error(`Report file "${options.out}" does not exist`);
        }
        
        await check({
          report: options.out,
          out: options.out
        });
      }
      
      if (options.report !== false) {
        // Step 3: Generate summary
        console.log('📊 Generating summary report...');
        await generateSummary({
          report: options.out,
          format: 'markdown'
        });
      }
      
      console.log('✅ Baseline check completed successfully!');
    } catch (error) {
      console.error(`Pipeline failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Initialize baseline-check configuration')
  .option('-f, --force', 'Overwrite existing config file')
  .option('--framework <framework>', 'Initialize for specific framework (react, vue, angular, svelte, next, nuxt)')
  .action(async (options) => {
    const configPath = 'baseline-check.config.js';
    const logger = new Logger();
    
    if (fs.existsSync(configPath) && !options.force) {
      logger.warning(`Configuration file already exists: ${configPath}`);
      logger.info('Use --force to overwrite');
      return;
    }
    
    let config;
    
    if (options.framework) {
      const integrations = new FrameworkIntegrations();
      const detectedFramework = integrations.detectFramework('.');
      
      if (detectedFramework && detectedFramework !== options.framework) {
        logger.warning(`Detected ${detectedFramework} but requested ${options.framework}`);
      }
      
      try {
        config = integrations.generateConfig(options.framework);
        logger.info(`Generated configuration for ${options.framework}`);
      } catch (error) {
        logger.error(`Unknown framework: ${options.framework}`);
        process.exit(1);
      }
    } else {
      // Default configuration
      config = `export default {
  // File patterns to scan
  patterns: [
    '**/*.{js,ts,tsx,jsx,css,html}',
    '**/*.vue',
    '**/*.svelte'
  ],
  
  // Directories to ignore
  ignore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.git/**',
    '**/coverage/**',
    '**/.next/**',
    '**/out/**'
  ],
  
  // Custom feature detection rules
  features: {
    // Add custom regex patterns here
    // 'custom-feature': { 
    //   re: /custom-pattern/g, 
    //   category: 'api' 
    // }
  },
  
  // Browser support thresholds
  baseline: {
    minBrowsers: 3, // Minimum number of browsers for baseline status
    browsers: ['chrome', 'firefox', 'safari', 'edge']
  },
  
  // Performance settings
  performance: {
    maxFileSize: 1024 * 1024, // 1MB max file size
    concurrentFiles: 10, // Process files concurrently
    cacheResults: true // Cache scan results
  }
};`;
    }
    
    try {
      fs.writeFileSync(configPath, config);
      logger.success(`Created configuration file: ${configPath}`);
      logger.info('Edit the file to customize your baseline check settings');
    } catch (error) {
      logger.error(`Failed to create config file: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('analyze')
  .description('Analyze scan results and provide recommendations')
  .option('-r, --report <file>', 'Input report file', 'baseline-report.json')
  .option('-o, --out <file>', 'Output file for analysis')
  .action(async (options) => {
    const logger = new Logger();
    const spinner = new Spinner();
    
    try {
      spinner.start('Analyzing report...');
      
      if (!fs.existsSync(options.report)) {
        throw new Error(`Report file "${options.report}" does not exist`);
      }
      
      const report = JSON.parse(fs.readFileSync(options.report, 'utf8'));
      const recommendationEngine = new RecommendationEngine();
      
      const suggestions = recommendationEngine.analyzeReport(report);
      const analysis = recommendationEngine.generateReport(suggestions);
      
      spinner.stop('Analysis complete');
      
      if (options.out) {
        fs.writeFileSync(options.out, JSON.stringify(analysis, null, 2));
        logger.success(`Analysis written to: ${options.out}`);
      } else {
        console.log('\n# Analysis Report\n');
        console.log(analysis.summary);
        console.log('\n## Recommendations\n');
        
        for (const suggestion of analysis.suggestions) {
          console.log(`### ${suggestion.title}`);
          console.log(suggestion.message);
          if (suggestion.alternatives) {
            console.log('\n**Alternatives:**');
            suggestion.alternatives.forEach(alt => console.log(`- ${alt}`));
          }
          if (suggestion.polyfills) {
            console.log('\n**Polyfills:**');
            suggestion.polyfills.forEach(poly => console.log(`- ${poly}`));
          }
          console.log('');
        }
      }
    } catch (error) {
      spinner.stop('Analysis failed');
      logger.error(`Analysis failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('analytics')
  .description('View analytics and trends')
  .option('-d, --days <days>', 'Number of days to analyze', '30')
  .option('-o, --out <file>', 'Output file for analytics report')
  .action(async (options) => {
    const logger = new Logger();
    const analytics = new AnalyticsEngine();
    
    try {
      const trends = analytics.getTrends(parseInt(options.days));
      
      if (!trends) {
        logger.warning('No analytics data available. Run some scans first.');
        return;
      }
      
      const report = analytics.generateReport();
      
      if (options.out) {
        fs.writeFileSync(options.out, report);
        logger.success(`Analytics report written to: ${options.out}`);
      } else {
        console.log(report);
      }
    } catch (error) {
      logger.error(`Analytics failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('setup')
  .description('Setup integration for specific framework or tool')
  .option('-f, --framework <framework>', 'Framework to setup (react, vue, angular, svelte, next, nuxt)')
  .option('--github-action', 'Generate GitHub Action workflow')
  .option('--vscode', 'Generate VSCode settings')
  .action(async (options) => {
    const logger = new Logger();
    const integrations = new FrameworkIntegrations();
    
    try {
      if (options.framework) {
        const config = integrations.generateConfig(options.framework);
        fs.writeFileSync('baseline-check.config.js', config);
        logger.success(`Setup complete for ${options.framework}`);
      }
      
      if (options.githubAction) {
        const framework = options.framework || integrations.detectFramework('.') || 'react';
        const workflow = integrations.createGitHubAction(framework);
        fs.writeFileSync('.github/workflows/baseline-check.yml', workflow);
        logger.success('GitHub Action workflow created');
      }
      
      if (options.vscode) {
        const settings = integrations.createVSCodeSettings();
        const vscodeDir = '.vscode';
        if (!fs.existsSync(vscodeDir)) {
          fs.mkdirSync(vscodeDir);
        }
        fs.writeFileSync('.vscode/settings.json', JSON.stringify(settings, null, 2));
        logger.success('VSCode settings created');
      }
      
      if (!options.framework && !options.githubAction && !options.vscode) {
        logger.info('Available options:');
        logger.info('  --framework <name>  Setup for specific framework');
        logger.info('  --github-action     Generate GitHub Action workflow');
        logger.info('  --vscode           Generate VSCode settings');
      }
    } catch (error) {
      logger.error(`Setup failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('cache')
  .description('Manage cache')
  .option('--clear', 'Clear all cached data')
  .option('--stats', 'Show cache statistics')
  .action(async (options) => {
    const logger = new Logger();
    const cache = new CacheManager();
    
    try {
      if (options.clear) {
        cache.invalidateCache();
        logger.success('Cache cleared');
      }
      
      if (options.stats) {
        const stats = cache.getCacheStats();
        console.log('\n# Cache Statistics\n');
        console.log(`Files: ${stats.files}`);
        console.log(`Size: ${stats.sizeFormatted}`);
      }
      
      if (!options.clear && !options.stats) {
        logger.info('Available options:');
        logger.info('  --clear   Clear all cached data');
        logger.info('  --stats   Show cache statistics');
      }
    } catch (error) {
      logger.error(`Cache operation failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('interactive')
  .alias('i')
  .description('Start interactive mode with watch functionality')
  .option('-p, --path <path>', 'Initial path to scan', '.')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    const interactive = new InteractiveMode(options);
    await interactive.start();
  });

program
  .command('fix')
  .description('Get quick fixes for compatibility issues')
  .option('-f, --feature <feature>', 'Feature to get fix for')
  .option('-o, --output <file>', 'Output file for fix code')
  .action(async (options) => {
    const logger = new Logger();
    const errorHandler = new ErrorHandler();
    
    if (!options.feature) {
      logger.error('Please specify a feature with --feature');
      logger.info('Example: npx baseline-check-tool fix --feature="css.grid"');
      process.exit(1);
    }
    
    try {
      const error = errorHandler.getErrorMessage(options.feature, 'risky');
      const fixCode = errorHandler.generateFixCommand(options.feature);
      
      if (options.output) {
        fs.writeFileSync(options.output, fixCode);
        logger.success(`Fix code written to: ${options.output}`);
      } else {
        console.log(errorHandler.formatError(error));
        console.log('\n📝 Fix code:');
        console.log(fixCode);
      }
    } catch (error) {
      logger.error(`Fix generation failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('examples')
  .description('Show examples and best practices for different frameworks')
  .option('-f, --framework <framework>', 'Framework to show examples for (react/vue/angular/vanilla)', 'vanilla')
  .option('-o, --output <file>', 'Output file for examples')
  .option('--all', 'Show examples for all frameworks')
  .action(async (options) => {
    const logger = new Logger();
    const examplesGenerator = new ExamplesGenerator();
    
    try {
      let content;
      
      if (options.all) {
        content = examplesGenerator.generateAllExamples();
      } else {
        const availableFrameworks = examplesGenerator.getAvailableFrameworks();
        if (!availableFrameworks.includes(options.framework)) {
          logger.error(`Unknown framework: ${options.framework}`);
          logger.info(`Available frameworks: ${availableFrameworks.join(', ')}`);
          process.exit(1);
        }
        content = examplesGenerator.generateExamples(options.framework);
      }
      
      if (options.output) {
        fs.writeFileSync(options.output, content);
        logger.success(`Examples written to: ${options.output}`);
      } else {
        console.log(content);
      }
    } catch (error) {
      logger.error(`Examples generation failed: ${error.message}`);
      process.exit(1);
    }
  });

// AI-Powered Commands
program
  .command('ai-analyze')
  .description('AI-powered code analysis with smart recommendations')
  .option('-p, --paths <paths>', 'Comma-separated paths to analyze', '.')
  .option('-o, --out <file>', 'Output file for AI analysis results', 'ai-analysis.json')
  .option('-c, --config <file>', 'Configuration file path')
  .option('--api-key <key>', 'OpenAI API key for cloud analysis')
  .option('--local-only', 'Use only local analysis (no cloud API)')
  .option('--format <format>', 'Output format (json/markdown/html)', 'json')
  .action(async (options) => {
    const logger = new Logger();
    const spinner = new Spinner('Analyzing code with AI...');
    
    try {
      spinner.start();
      
      const aiAnalyzer = new AIAnalyzer({
        apiKey: options.apiKey || process.env.OPENAI_API_KEY,
        enableCloudAnalysis: !options.localOnly,
        enableLocalAnalysis: true
      });
      
      const paths = options.paths.split(',').map(p => p.trim());
      const results = [];
      
      for (const path of paths) {
        if (fs.existsSync(path)) {
          const files = await getFiles(path);
          
          for (const file of files) {
            const code = fs.readFileSync(file, 'utf8');
            const analysis = await aiAnalyzer.analyzeCode(code, file, {
              framework: 'unknown',
              browsers: ['chrome', 'firefox', 'safari', 'edge']
            });
            results.push(analysis);
          }
        }
      }
      
      const output = {
        timestamp: new Date().toISOString(),
        totalFiles: results.length,
        analyses: results,
        summary: {
          totalRecommendations: results.reduce((sum, r) => sum + (r.recommendations?.length || 0), 0),
          averageRiskScore: results.reduce((sum, r) => sum + (r.riskScore || 0), 0) / results.length,
          averageCompatibilityScore: results.reduce((sum, r) => sum + (r.compatibilityScore || 0), 0) / results.length
        }
      };
      
      if (options.format === 'json') {
        fs.writeFileSync(options.out, JSON.stringify(output, null, 2));
      } else if (options.format === 'markdown') {
        const markdown = generateAIMarkdownReport(output);
        fs.writeFileSync(options.out, markdown);
      } else if (options.format === 'html') {
        const html = generateAIHTMLReport(output);
        fs.writeFileSync(options.out, html);
      }
      
      spinner.stop();
      logger.success(`AI analysis completed: ${options.out}`);
      logger.info(`Analyzed ${results.length} files with ${output.summary.totalRecommendations} recommendations`);
      
    } catch (error) {
      spinner.stop();
      logger.error(`AI analysis failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('ai-fix')
  .description('AI-powered automatic code fixing')
  .option('-f, --file <file>', 'File to fix')
  .option('-r, --report <file>', 'Analysis report file')
  .option('--dry-run', 'Show what would be fixed without making changes')
  .option('--backup', 'Create backup before fixing')
  .action(async (options) => {
    const logger = new Logger();
    
    try {
      const aiCodeFixer = new AICodeFixer({
        enableAutoFix: !options.dryRun,
        enableBackup: options.backup
      });
      
      if (options.file) {
        // Fix single file
        const code = fs.readFileSync(options.file, 'utf8');
        const analysis = await analyzeFileForFixes(code, options.file);
        
        if (options.dryRun) {
          logger.info('Dry run - would apply the following fixes:');
          analysis.recommendations.forEach(rec => {
            console.log(`- ${rec.message}`);
            console.log(`  Fix: ${rec.suggestion}`);
          });
        } else {
          const result = await aiCodeFixer.applyFixes(options.file, analysis.recommendations);
          
          if (result.success) {
            logger.success(`Applied ${result.fixesApplied.length} fixes to ${options.file}`);
            if (result.backupPath) {
              logger.info(`Backup created: ${result.backupPath}`);
            }
          } else {
            logger.error(`Fix application failed: ${result.errors.join(', ')}`);
          }
        }
      } else if (options.report) {
        // Fix based on analysis report
        const report = JSON.parse(fs.readFileSync(options.report, 'utf8'));
        const filesToFix = new Set();
        
        report.analyses.forEach(analysis => {
          if (analysis.recommendations?.length > 0) {
            filesToFix.add(analysis.filePath);
          }
        });
        
        for (const filePath of filesToFix) {
          if (fs.existsSync(filePath)) {
            const analysis = report.analyses.find(a => a.filePath === filePath);
            
            if (options.dryRun) {
              logger.info(`Would fix ${filePath}:`);
              analysis.recommendations.forEach(rec => {
                console.log(`- ${rec.message}`);
              });
            } else {
              const result = await aiCodeFixer.applyFixes(filePath, analysis.recommendations);
              
              if (result.success) {
                logger.success(`Fixed ${filePath}: ${result.fixesApplied.length} fixes applied`);
              } else {
                logger.error(`Failed to fix ${filePath}: ${result.errors.join(', ')}`);
              }
            }
          }
        }
      } else {
        logger.error('Please specify either --file or --report');
        process.exit(1);
      }
      
    } catch (error) {
      logger.error(`AI fix failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('ai-learn')
  .description('AI learning and personalization features')
  .option('--stats', 'Show learning statistics')
  .option('--export <format>', 'Export learning data (json/csv)')
  .option('--reset', 'Reset learning data')
  .action(async (options) => {
    const logger = new Logger();
    
    try {
      const aiLearning = new AILearning();
      
      if (options.stats) {
        const stats = aiLearning.getLearningStats();
        console.log('\n📊 AI Learning Statistics:');
        console.log(`Total Patterns: ${stats.totalPatterns}`);
        console.log(`Total Users: ${stats.totalUsers}`);
        console.log(`Total Interactions: ${stats.totalInteractions}`);
        console.log(`Average Confidence: ${(stats.averageConfidence * 100).toFixed(1)}%`);
        
        if (stats.topPatterns.length > 0) {
          console.log('\n🔝 Top Patterns:');
          stats.topPatterns.forEach((pattern, index) => {
            console.log(`${index + 1}. ${pattern.type} (${(pattern.confidence * 100).toFixed(1)}% confidence)`);
          });
        }
      } else if (options.export) {
        const data = await aiLearning.exportLearningData(options.export);
        const filename = `learning-data.${options.export}`;
        fs.writeFileSync(filename, data);
        logger.success(`Learning data exported to: ${filename}`);
      } else if (options.reset) {
        // Reset learning data
        fs.unlinkSync(aiLearning.options.learningDataPath);
        logger.success('Learning data reset');
      } else {
        logger.info('AI Learning commands:');
        logger.info('  --stats     Show learning statistics');
        logger.info('  --export    Export learning data');
        logger.info('  --reset     Reset learning data');
      }
      
    } catch (error) {
      logger.error(`AI learning failed: ${error.message}`);
      process.exit(1);
    }
  });

// Helper functions
async function getFiles(path) {
  const files = [];
  
  if (fs.statSync(path).isDirectory()) {
    const entries = fs.readdirSync(path, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = `${path}/${entry.name}`;
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
        files.push(...await getFiles(fullPath));
      } else if (entry.isFile() && /\.(js|jsx|ts|tsx|css|html)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  } else {
    files.push(path);
  }
  
  return files;
}

async function analyzeFileForFixes(code, filePath) {
  const aiAnalyzer = new AIAnalyzer({ enableLocalAnalysis: true });
  return await aiAnalyzer.analyzeCode(code, filePath);
}

function generateAIMarkdownReport(output) {
  let markdown = `# AI Analysis Report\n\n`;
  markdown += `**Generated:** ${output.timestamp}\n`;
  markdown += `**Files Analyzed:** ${output.totalFiles}\n`;
  markdown += `**Total Recommendations:** ${output.summary.totalRecommendations}\n\n`;
  
  markdown += `## Summary\n\n`;
  markdown += `- **Average Risk Score:** ${output.summary.averageRiskScore.toFixed(1)}%\n`;
  markdown += `- **Average Compatibility Score:** ${output.summary.averageCompatibilityScore.toFixed(1)}%\n\n`;
  
  markdown += `## File Analysis\n\n`;
  
  output.analyses.forEach((analysis, index) => {
    markdown += `### ${index + 1}. ${analysis.filePath}\n\n`;
    markdown += `- **Risk Score:** ${analysis.riskScore}%\n`;
    markdown += `- **Compatibility Score:** ${analysis.compatibilityScore}%\n`;
    markdown += `- **Recommendations:** ${analysis.recommendations?.length || 0}\n\n`;
    
    if (analysis.recommendations?.length > 0) {
      markdown += `#### Recommendations:\n\n`;
      analysis.recommendations.forEach(rec => {
        markdown += `- **${rec.severity.toUpperCase()}:** ${rec.message}\n`;
        if (rec.suggestion) {
          markdown += `  - Fix: ${rec.suggestion}\n`;
        }
        markdown += `\n`;
      });
    }
    
    markdown += `---\n\n`;
  });
  
  return markdown;
}

function generateAIHTMLReport(output) {
  return `<!DOCTYPE html>
<html>
<head>
    <title>AI Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .stat-card { background: #e3f2fd; padding: 15px; border-radius: 8px; text-align: center; }
        .file-analysis { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .recommendation { margin: 10px 0; padding: 10px; background: #fff3e0; border-left: 4px solid #ff9800; }
        .critical { border-left-color: #f44336; }
        .high { border-left-color: #ff9800; }
        .medium { border-left-color: #ffc107; }
        .low { border-left-color: #4caf50; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🤖 AI Analysis Report</h1>
        <p><strong>Generated:</strong> ${output.timestamp}</p>
        <p><strong>Files Analyzed:</strong> ${output.totalFiles}</p>
        <p><strong>Total Recommendations:</strong> ${output.summary.totalRecommendations}</p>
    </div>
    
    <div class="summary">
        <div class="stat-card">
            <h3>Average Risk Score</h3>
            <p>${output.summary.averageRiskScore.toFixed(1)}%</p>
        </div>
        <div class="stat-card">
            <h3>Average Compatibility Score</h3>
            <p>${output.summary.averageCompatibilityScore.toFixed(1)}%</p>
        </div>
    </div>
    
    <h2>File Analysis</h2>
    ${output.analyses.map((analysis, index) => `
        <div class="file-analysis">
            <h3>${index + 1}. ${analysis.filePath}</h3>
            <p><strong>Risk Score:</strong> ${analysis.riskScore}% | 
               <strong>Compatibility Score:</strong> ${analysis.compatibilityScore}% | 
               <strong>Recommendations:</strong> ${analysis.recommendations?.length || 0}</p>
            
            ${analysis.recommendations?.map(rec => `
                <div class="recommendation ${rec.severity}">
                    <strong>${rec.severity.toUpperCase()}:</strong> ${rec.message}
                    ${rec.suggestion ? `<br><em>Fix: ${rec.suggestion}</em>` : ''}
                </div>
            `).join('') || '<p>No recommendations for this file.</p>'}
        </div>
    `).join('')}
</body>
</html>`;
}

// Real-time Monitoring Commands
program
  .command('monitor')
  .description('Start real-time monitoring with alerts and dashboard')
  .option('-p, --paths <paths>', 'Comma-separated paths to monitor', '.')
  .option('--dashboard', 'Open real-time dashboard in browser')
  .option('--alerts', 'Enable alert notifications')
  .option('--poll-interval <ms>', 'Polling interval in milliseconds', '1000')
  .option('--theme <theme>', 'Dashboard theme (light/dark)', 'dark')
  .action(async (options) => {
    const logger = new Logger();
    const spinner = new Spinner('Starting real-time monitoring...');
    
    try {
      spinner.start();
      
      // Initialize monitoring system
      const monitor = new RealtimeMonitor({
        watchPaths: options.paths.split(',').map(p => p.trim()),
        pollInterval: parseInt(options.pollInterval),
        enableAlerts: options.alerts
      });
      
      const alertSystem = new AlertSystem({
        notificationChannels: options.alerts ? ['console', 'file'] : ['console']
      });
      
      const dashboard = new RealtimeDashboard({
        theme: options.theme
      });
      
      // Setup event handlers
      monitor.on('alert', async (alert) => {
        await alertSystem.processAlert(alert);
      });
      
      monitor.on('error', (error) => {
        logger.error(`Monitor error: ${error.message}`);
      });
      
      // Start monitoring
      await monitor.start();
      
      // Generate dashboard
      if (options.dashboard) {
        const dashboardPath = await dashboard.start(monitor, alertSystem);
        logger.success(`🌐 Dashboard: file://${path.resolve(dashboardPath)}`);
      }
      
      spinner.stop();
      logger.success('🚀 Real-time monitoring started');
      logger.info(`👀 Watching: ${options.paths}`);
      logger.info('Press Ctrl+C to stop monitoring');
      
      // Keep the process running
      process.on('SIGINT', async () => {
        console.log('\n🛑 Stopping monitoring...');
        monitor.stop();
        logger.success('✅ Monitoring stopped');
        process.exit(0);
      });
      
      // Keep alive
      setInterval(() => {}, 1000);
      
    } catch (error) {
      spinner.stop();
      logger.error(`Monitoring failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('dashboard')
  .description('Generate real-time monitoring dashboard')
  .option('-p, --paths <paths>', 'Comma-separated paths to monitor', '.')
  .option('-t, --theme <theme>', 'Dashboard theme (light/dark)', 'dark')
  .option('-o, --output <file>', 'Output HTML file', 'realtime-dashboard.html')
  .action(async (options) => {
    const logger = new Logger();
    
    try {
      const dashboard = new RealtimeDashboard({
        theme: options.theme
      });
      
      const html = dashboard.generateHTML();
      const outputPath = options.output.startsWith('dashboards/') ? options.output : `dashboards/charts/${options.output}`;
      await fs.promises.writeFile(outputPath, html);
      
      logger.success(`🌐 Dashboard generated: ${options.output}`);
      logger.info(`📊 Open in browser: file://${path.resolve(options.output)}`);
      
    } catch (error) {
      logger.error(`Dashboard generation failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('alerts')
  .description('Manage alerts and notifications')
  .option('--stats', 'Show alert statistics')
  .option('--clear', 'Clear all active alerts')
  .option('--export <format>', 'Export alert data (json/csv)', 'json')
  .action(async (options) => {
    const logger = new Logger();
    
    try {
      const alertSystem = new AlertSystem();
      
      if (options.stats) {
        const stats = alertSystem.getStats();
        console.log('\n📊 Alert Statistics:');
        console.log(`Total Alerts: ${stats.total}`);
        console.log(`Active Alerts: ${stats.active}`);
        console.log(`Last 24h: ${stats.last24h}`);
        console.log(`Last 1h: ${stats.last1h}`);
        console.log(`Escalated: ${stats.escalated}`);
        
        if (Object.keys(stats.bySeverity).length > 0) {
          console.log('\nBy Severity:');
          Object.entries(stats.bySeverity).forEach(([severity, count]) => {
            console.log(`  ${severity}: ${count}`);
          });
        }
        
        if (Object.keys(stats.byType).length > 0) {
          console.log('\nBy Type:');
          Object.entries(stats.byType).forEach(([type, count]) => {
            console.log(`  ${type}: ${count}`);
          });
        }
      } else if (options.clear) {
        alertSystem.clearAllAlerts();
        logger.success('🧹 All alerts cleared');
      } else if (options.export) {
        const data = {
          stats: alertSystem.getStats(),
          activeAlerts: alertSystem.getActiveAlerts(),
          history: alertSystem.alertHistory
        };
        
        const filename = `alerts-export.${options.export}`;
        const content = options.export === 'json' 
          ? JSON.stringify(data, null, 2)
          : convertToCSV(data);
        
        await fs.promises.writeFile(filename, content);
        logger.success(`📊 Alert data exported: ${filename}`);
      } else {
        logger.info('Alert management commands:');
        logger.info('  --stats     Show alert statistics');
        logger.info('  --clear     Clear all active alerts');
        logger.info('  --export    Export alert data');
      }
      
    } catch (error) {
      logger.error(`Alert management failed: ${error.message}`);
      process.exit(1);
    }
  });

// Helper function for CSV export
function convertToCSV(data) {
  const csv = [];
  
  // Stats CSV
  csv.push('Alert Statistics');
  csv.push('Metric,Value');
  csv.push(`Total Alerts,${data.stats.total}`);
  csv.push(`Active Alerts,${data.stats.active}`);
  csv.push(`Last 24h,${data.stats.last24h}`);
  csv.push(`Last 1h,${data.stats.last1h}`);
  csv.push(`Escalated,${data.stats.escalated}`);
  
  csv.push('\nActive Alerts');
  csv.push('Type,Severity,File,Message,Timestamp');
  data.activeAlerts.forEach(alert => {
    csv.push(`${alert.type},${alert.severity},"${alert.filePath}","${alert.message}",${new Date(alert.timestamp).toISOString()}`);
  });
  
  return csv.join('\n');
}

// Helper function to scan directory for files
async function scanDirectory(dirPath) {
  const files = [];
  const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
      const subFiles = await scanDirectory(fullPath);
      files.push(...subFiles);
    } else if (entry.isFile() && /\.(js|jsx|ts|tsx|css|scss|sass|less|html|htm)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Performance Analysis Commands
program
  .command('performance')
  .description('Analyze performance and generate optimization recommendations')
  .option('-p, --paths <paths>', 'Comma-separated paths to analyze', '.')
  .option('-r, --report <file>', 'Use existing scan report', 'baseline-report.json')
  .option('-o, --output <file>', 'Output file for performance analysis', 'performance-analysis.json')
  .option('-d, --dashboard', 'Generate performance dashboard')
  .option('-t, --theme <theme>', 'Dashboard theme (light/dark)', 'dark')
  .action(async (options) => {
    try {
      await handlePerformanceCommand(options);
    } catch (error) {
      process.exit(1);
    }
  });

program
  .command('performance-enhanced')
  .description('Enhanced performance analysis with optimization and bundle analysis')
  .option('-p, --paths <paths>', 'Comma-separated paths to analyze', '.')
  .option('-r, --report <file>', 'Use existing scan report', 'baseline-report.json')
  .option('-o, --output <file>', 'Output file for enhanced performance analysis', 'enhanced-performance-analysis.json')
  .option('-d, --dashboard', 'Generate enhanced performance dashboard')
  .option('-t, --theme <theme>', 'Dashboard theme (light/dark)', 'dark')
  .option('--fix', 'Apply automatic optimizations')
  .action(async (options) => {
    try {
      await handleEnhancedPerformanceCommand(options);
    } catch (error) {
      console.error('Enhanced performance analysis failed:', error.message);
      process.exit(1);
    }
  });

// Keep the old implementation as backup for now
program
  .command('performance-old')
  .description('Old performance analysis (backup)')
  .option('-p, --paths <paths>', 'Comma-separated paths to analyze', '.')
  .option('-r, --report <file>', 'Use existing scan report', 'baseline-report.json')
  .option('-o, --output <file>', 'Output file for performance analysis', 'performance-analysis.json')
  .option('-d, --dashboard', 'Generate performance dashboard')
  .option('-t, --theme <theme>', 'Dashboard theme (light/dark)', 'dark')
  .action(async (options) => {
    const logger = new Logger();
    const spinner = new Spinner('Analyzing performance...');

    try {
      spinner.start();

      // Initialize performance analysis
      const performanceAnalysis = new PerformanceAnalysis();

      // Get files to analyze
      let files = [];
      let scanResults = null;

      if (options.report && fs.existsSync(options.report)) {
        // Use existing scan report
        const reportData = JSON.parse(await fs.promises.readFile(options.report, 'utf8'));
        scanResults = reportData;
        
        // Check if scannedFiles is an array or just a count
        if (Array.isArray(reportData.scannedFiles)) {
          files = reportData.scannedFiles;
        } else {
          // If scannedFiles is just a count, we need to scan the paths directly
          const pathArray = options.paths.split(',').map(p => p.trim());
          files = [];
          for (const scanPath of pathArray) {
            const stats = await fs.promises.stat(scanPath);
            if (stats.isDirectory()) {
              const dirFiles = await scanDirectory(scanPath);
              files.push(...dirFiles);
            } else {
              files.push(scanPath);
            }
          }
        }
        logger.info(`📊 Using existing scan report: ${options.report}`);
        logger.info(`📁 Files to analyze: ${files.length} files`);
      } else {
        // Run scan first
        logger.info('🔍 Running scan to gather performance data...');
        const scanOptions = {
          paths: options.paths,
          out: 'temp-scan-report.json'
        };
        await scan(scanOptions);
        
        if (fs.existsSync('temp-scan-report.json')) {
          const reportData = JSON.parse(await fs.promises.readFile('temp-scan-report.json', 'utf8'));
          scanResults = reportData;
          files = reportData.scannedFiles || [];
          
          // Clean up temp file
          await fs.promises.unlink('temp-scan-report.json');
        } else {
          // Fallback: scan the paths directly
          const pathArray = options.paths.split(',').map(p => p.trim());
          files = [];
          for (const scanPath of pathArray) {
            const stats = await fs.promises.stat(scanPath);
            if (stats.isDirectory()) {
              const dirFiles = await scanDirectory(scanPath);
              files.push(...dirFiles);
            } else {
              files.push(scanPath);
            }
          }
          scanResults = { results: [] };
        }
        logger.info(`📁 Files to analyze: ${files.length} files`);
      }

      // Run performance analysis
      const results = await performanceAnalysis.analyze(files, scanResults);

      // Save results
      await fs.promises.writeFile(options.output, JSON.stringify(results, null, 2));

      spinner.stop();

      // Display summary
      logger.success('🚀 Performance analysis completed!');
      logger.info(`📊 Overall Score: ${results.summary.overallScore}/100 (Grade: ${results.summary.performanceGrade})`);
      logger.info(`🐛 Issues Found: ${results.summary.totalIssues} (${results.summary.criticalIssues} critical)`);
      logger.info(`💡 Recommendations: ${results.summary.totalRecommendations} (${results.summary.highPriorityRecommendations} high priority)`);
      logger.info(`📁 Results saved: ${options.output}`);

      // Generate dashboard if requested
      if (options.dashboard) {
        const dashboardPath = `dashboards/performance/performance-dashboard.html`;
        await fs.promises.mkdir('dashboards/performance', { recursive: true });
        await fs.promises.writeFile(dashboardPath, results.dashboard);
        logger.success(`🌐 Performance dashboard: file://${path.resolve(dashboardPath)}`);
      }

    } catch (error) {
      spinner.stop();
      logger.error(`Performance analysis failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('performance-dashboard')
  .description('Generate performance dashboard from existing analysis')
  .option('-i, --input <file>', 'Input performance analysis file', 'performance-analysis.json')
  .option('-o, --output <file>', 'Output HTML file', 'performance-dashboard.html')
  .option('-t, --theme <theme>', 'Dashboard theme (light/dark)', 'dark')
  .action(async (options) => {
    const logger = new Logger();

    try {
      if (!fs.existsSync(options.input)) {
        logger.error(`Performance analysis file not found: ${options.input}`);
        logger.info('Run "baseline-check performance" first to generate analysis data');
        process.exit(1);
      }

      const analysisData = JSON.parse(await fs.promises.readFile(options.input, 'utf8'));
      const performanceAnalysis = new PerformanceAnalysis({ theme: options.theme });
      
      const dashboardHTML = performanceAnalysis.dashboard.generateHTML(
        analysisData.analysis,
        analysisData.recommendations
      );

      const outputPath = options.output.startsWith('dashboards/') ? options.output : `dashboards/performance/${options.output}`;
      await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.promises.writeFile(outputPath, dashboardHTML);

      logger.success(`🌐 Performance dashboard generated: ${outputPath}`);
      logger.info(`📊 Open in browser: file://${path.resolve(outputPath)}`);

    } catch (error) {
      logger.error(`Dashboard generation failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('features')
  .description('Show enhanced feature detection capabilities')
  .option('-p, --preset <preset>', 'Feature preset (default, minimal, modern, react, vue, angular, pwa)', 'default')
  .option('-c, --category <category>', 'Show features by category', '')
  .option('-f, --framework <framework>', 'Show features by framework', '')
  .option('-s, --stats', 'Show feature statistics')
  .action(async (options) => {
    const logger = new Logger();

    try {
      const detector = createFeatureDetector(options.preset);
      const features = detector.getAllFeatures();
      const stats = detector.getStats();

      if (options.stats) {
        logger.info('📊 Feature Detection Statistics');
        logger.info(`Total Features: ${stats.total}`);
        logger.info('\nBy Category:');
        Object.entries(stats.byCategory).forEach(([category, count]) => {
          logger.info(`  ${category}: ${count} features`);
        });
        
        if (Object.keys(stats.byFramework).length > 0) {
          logger.info('\nBy Framework:');
          Object.entries(stats.byFramework).forEach(([framework, count]) => {
            logger.info(`  ${framework}: ${count} features`);
          });
        }
        return;
      }

      if (options.category) {
        const categoryFeatures = detector.getFeaturesByCategory(options.category);
        if (Object.keys(categoryFeatures).length === 0) {
          logger.warn(`No features found for category: ${options.category}`);
          return;
        }
        
        logger.info(`🔍 Features in category: ${options.category}`);
        Object.entries(categoryFeatures).forEach(([name, config]) => {
          logger.info(`  • ${name}: ${config.description || 'No description'}`);
        });
        return;
      }

      if (options.framework) {
        const frameworkFeatures = detector.getFeaturesByFramework(options.framework);
        if (Object.keys(frameworkFeatures).length === 0) {
          logger.warn(`No features found for framework: ${options.framework}`);
          return;
        }
        
        logger.info(`🔍 Features for framework: ${options.framework}`);
        Object.entries(frameworkFeatures).forEach(([name, config]) => {
          logger.info(`  • ${name}: ${config.description || 'No description'}`);
        });
        return;
      }

      // Show all features grouped by category
      logger.info(`🔍 Enhanced Feature Detection (${options.preset} preset)`);
      logger.info(`Total Features: ${stats.total}\n`);

      const categories = {};
      Object.entries(features).forEach(([name, config]) => {
        const category = config.category || 'other';
        if (!categories[category]) categories[category] = [];
        categories[category].push({ name, ...config });
      });

      Object.entries(categories).forEach(([category, categoryFeatures]) => {
        logger.info(`${category.toUpperCase()} (${categoryFeatures.length} features):`);
        categoryFeatures.forEach(feature => {
          const framework = feature.framework ? ` [${feature.framework}]` : '';
          logger.info(`  • ${feature.name}${framework}: ${feature.description || 'No description'}`);
        });
        logger.info('');
      });

    } catch (error) {
      logger.error(`Failed to show features: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('security')
  .description('Analyze codebase for security vulnerabilities')
  .option('-p, --paths <paths>', 'Comma-separated paths to analyze', 'src')
  .option('-o, --output <file>', 'Output file for security analysis', 'security-analysis.json')
  .option('-d, --dashboard <file>', 'Generate security dashboard', 'security-dashboard.html')
  .option('-t, --theme <theme>', 'Dashboard theme (light/dark)', 'dark')
  .option('--no-xss', 'Disable XSS detection')
  .option('--no-csrf', 'Disable CSRF detection')
  .option('--no-csp', 'Disable CSP analysis')
  .option('--no-https', 'Disable HTTPS analysis')
  .action(async (options) => {
    const logger = new Logger();

    try {
      // Parse paths
      const paths = options.paths.split(',').map(p => p.trim());
      
      // Find files to analyze
      const files = [];
      for (const path of paths) {
        const stat = fs.statSync(path);
        if (stat.isDirectory()) {
          const glob = await import('globby');
          const dirFiles = await glob.globby([`${path}/**/*.{js,ts,jsx,tsx,html,css,vue,svelte}`], {
            ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
          });
          files.push(...dirFiles);
        } else {
          files.push(path);
        }
      }

      if (files.length === 0) {
        logger.warning('No files found to analyze');
        return;
      }

      logger.info(`🔒 Analyzing ${files.length} files for security vulnerabilities...`);

      // Configure security analysis
      const securityOptions = {
        analyzer: {
          enableXSSDetection: options.xss !== false,
          enableCSRFDetection: options.csrf !== false,
          enableCSPAnalysis: options.csp !== false,
          enableHTTPSAnalysis: options.https !== false
        },
        dashboard: {
          theme: options.theme
        }
      };

      const securityAnalysis = new SecurityAnalysis(securityOptions);
      const results = await securityAnalysis.analyze(files);

      // Save analysis results
      await fs.promises.writeFile(options.output, JSON.stringify(results.analysis, null, 2));
      logger.success(`🔒 Security analysis saved: ${options.output}`);

      // Generate dashboard if requested
      if (options.dashboard) {
        const dashboardPath = options.dashboard.startsWith('dashboards/') ? options.dashboard : `dashboards/security/${options.dashboard}`;
        await fs.promises.mkdir(path.dirname(dashboardPath), { recursive: true });
        await fs.promises.writeFile(dashboardPath, results.dashboard);
        logger.success(`🌐 Security dashboard generated: ${dashboardPath}`);
        logger.info(`📊 Open in browser: file://${path.resolve(dashboardPath)}`);
      }

      // Display summary
      const summary = results.summary;
      logger.info(`\n📊 Security Analysis Summary:`);
      logger.info(`   Security Score: ${summary.securityScore}/100`);
      logger.info(`   Risk Level: ${summary.riskLevel.toUpperCase()}`);
      logger.info(`   Vulnerabilities: ${summary.totalVulnerabilities}`);
      logger.info(`   Recommendations: ${summary.totalRecommendations}`);
      logger.info(`   Estimated Effort: ${summary.estimatedEffort}`);

      if (summary.totalVulnerabilities > 0) {
        logger.info(`\n⚠️  ${summary.totalVulnerabilities} security vulnerabilities found`);
        logger.info(`   Run with --dashboard to see detailed analysis`);
      } else {
        logger.success(`\n✅ No security vulnerabilities found!`);
      }

    } catch (error) {
      logger.error(`Security analysis failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('security-dashboard')
  .description('Generate security dashboard from existing analysis')
  .option('-i, --input <file>', 'Input security analysis file', 'security-analysis.json')
  .option('-o, --output <file>', 'Output HTML file', 'security-dashboard.html')
  .option('-t, --theme <theme>', 'Dashboard theme (light/dark)', 'dark')
  .action(async (options) => {
    const logger = new Logger();

    try {
      if (!fs.existsSync(options.input)) {
        logger.error(`Security analysis file not found: ${options.input}`);
        logger.info('Run "baseline-check security" first to generate analysis data');
        process.exit(1);
      }

      const analysisData = JSON.parse(await fs.promises.readFile(options.input, 'utf8'));
      const securityAnalysis = new SecurityAnalysis({ dashboard: { theme: options.theme } });
      
      const recommendations = securityAnalysis.generateRecommendations(analysisData);
      const dashboardHTML = securityAnalysis.generateDashboard(analysisData, recommendations);
      
      const outputPath = options.output.startsWith('dashboards/') ? options.output : `dashboards/security/${options.output}`;
      await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.promises.writeFile(outputPath, dashboardHTML);

      logger.success(`🌐 Security dashboard generated: ${outputPath}`);
      logger.info(`📊 Open in browser: file://${path.resolve(outputPath)}`);

    } catch (error) {
      logger.error(`Dashboard generation failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('accessibility')
  .description('Analyze codebase for accessibility issues')
  .option('-p, --paths <paths>', 'Comma-separated paths to analyze', 'src')
  .option('-o, --output <file>', 'Output file for accessibility analysis', 'accessibility-analysis.json')
  .option('-d, --dashboard <file>', 'Generate accessibility dashboard', 'accessibility-dashboard.html')
  .option('-t, --theme <theme>', 'Dashboard theme (light/dark)', 'dark')
  .option('--no-wcag', 'Disable WCAG compliance analysis')
  .option('--no-color', 'Disable color contrast analysis')
  .option('--no-keyboard', 'Disable keyboard navigation analysis')
  .option('--no-screen-reader', 'Disable screen reader analysis')
  .option('--no-semantic', 'Disable semantic HTML analysis')
  .option('--no-aria', 'Disable ARIA analysis')
  .option('--no-focus', 'Disable focus management analysis')
  .option('--no-alt', 'Disable alt text analysis')
  .option('--no-labels', 'Disable form labels analysis')
  .option('--no-headings', 'Disable heading structure analysis')
  .option('--no-language', 'Disable language detection analysis')
  .option('--no-motion', 'Disable motion preferences analysis')
  .action(async (options) => {
    const logger = new Logger();

    try {
      // Parse paths
      const paths = options.paths.split(',').map(p => p.trim());
      
      // Find files to analyze
      const files = [];
      for (const path of paths) {
        const stat = fs.statSync(path);
        if (stat.isDirectory()) {
          const glob = await import('globby');
          const dirFiles = await glob.globby([`${path}/**/*.{js,ts,jsx,tsx,html,css,vue,svelte}`], {
            ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
          });
          files.push(...dirFiles);
        } else {
          files.push(path);
        }
      }

      if (files.length === 0) {
        logger.warning('No files found to analyze');
        return;
      }

      logger.info(`♿ Analyzing ${files.length} files for accessibility issues...`);

      // Configure accessibility analysis
      const accessibilityOptions = {
        analyzer: {
          enableWCAGAnalysis: options.wcag !== false,
          enableColorContrast: options.color !== false,
          enableKeyboardNavigation: options.keyboard !== false,
          enableScreenReader: options.screenReader !== false,
          enableSemanticHTML: options.semantic !== false,
          enableARIA: options.aria !== false,
          enableFocusManagement: options.focus !== false,
          enableAltText: options.alt !== false,
          enableFormLabels: options.labels !== false,
          enableHeadingStructure: options.headings !== false,
          enableLanguageDetection: options.language !== false,
          enableMotionPreferences: options.motion !== false
        },
        dashboard: {
          theme: options.theme
        }
      };

      const accessibilityAnalysis = new AccessibilityAnalysis(accessibilityOptions);
      const results = await accessibilityAnalysis.analyze(files);

      // Save analysis results
      await fs.promises.writeFile(options.output, JSON.stringify(results, null, 2));
      logger.success(`♿ Accessibility analysis saved: ${options.output}`);

      // Generate dashboard if requested
      if (options.dashboard) {
        const dashboardPath = options.dashboard.startsWith('dashboards/') ? options.dashboard : `dashboards/accessibility/${options.dashboard}`;
        await fs.promises.mkdir(path.dirname(dashboardPath), { recursive: true });
        
        const recommendations = accessibilityAnalysis.generateRecommendations(results);
        const dashboardHTML = accessibilityAnalysis.generateDashboard(results, recommendations);
        await fs.promises.writeFile(dashboardPath, dashboardHTML);
        
        logger.success(`🌐 Accessibility dashboard generated: ${dashboardPath}`);
        logger.info(`📊 Open in browser: file://${path.resolve(dashboardPath)}`);
      }

      // Display summary
      const summary = results.summary;
      logger.info(`\n📊 Accessibility Analysis Summary:`);
      logger.info(`   Accessibility Score: ${summary.accessibilityScore}/100`);
      logger.info(`   WCAG Level: ${summary.wcagLevel}`);
      logger.info(`   Total Issues: ${summary.totalIssues}`);
      logger.info(`   Critical Issues: ${summary.bySeverity.high}`);
      logger.info(`   Medium Issues: ${summary.bySeverity.medium}`);
      logger.info(`   Low Issues: ${summary.bySeverity.low}`);

      if (summary.totalIssues > 0) {
        logger.info(`\n⚠️  ${summary.totalIssues} accessibility issues found`);
        logger.info(`   Run with --dashboard to see detailed analysis`);
      } else {
        logger.success(`\n✅ No accessibility issues found!`);
      }

    } catch (error) {
      logger.error(`Accessibility analysis failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('accessibility-dashboard')
  .description('Generate accessibility dashboard from existing analysis')
  .option('-i, --input <file>', 'Input accessibility analysis file', 'accessibility-analysis.json')
  .option('-o, --output <file>', 'Output HTML file', 'accessibility-dashboard.html')
  .option('-t, --theme <theme>', 'Dashboard theme (light/dark)', 'dark')
  .action(async (options) => {
    const logger = new Logger();

    try {
      if (!fs.existsSync(options.input)) {
        logger.error(`Accessibility analysis file not found: ${options.input}`);
        logger.info('Run "baseline-check accessibility" first to generate analysis data');
        process.exit(1);
      }

      const analysisData = JSON.parse(await fs.promises.readFile(options.input, 'utf8'));
      const accessibilityAnalysis = new AccessibilityAnalysis({ dashboard: { theme: options.theme } });
      
      const recommendations = accessibilityAnalysis.generateRecommendations(analysisData);
      const dashboardHTML = accessibilityAnalysis.generateDashboard(analysisData, recommendations);
      
      const outputPath = options.output.startsWith('dashboards/') ? options.output : `dashboards/accessibility/${options.output}`;
      await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.promises.writeFile(outputPath, dashboardHTML);

      logger.success(`🌐 Accessibility dashboard generated: ${outputPath}`);
      logger.info(`📊 Open in browser: file://${path.resolve(outputPath)}`);

    } catch (error) {
      logger.error(`Dashboard generation failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('seo')
  .description('Analyze codebase for SEO optimization issues')
  .option('-p, --paths <paths>', 'Comma-separated paths to analyze', 'src')
  .option('-o, --output <file>', 'Output file for SEO analysis', 'seo-analysis.json')
  .option('-d, --dashboard <file>', 'Generate SEO dashboard', 'seo-dashboard.html')
  .option('-t, --theme <theme>', 'Dashboard theme (light/dark)', 'dark')
  .option('--no-technical', 'Disable technical SEO analysis')
  .option('--no-content', 'Disable content SEO analysis')
  .option('--no-performance', 'Disable performance SEO analysis')
  .option('--no-mobile', 'Disable mobile SEO analysis')
  .option('--no-schema', 'Disable schema markup analysis')
  .option('--no-meta', 'Disable meta tags analysis')
  .option('--no-headings', 'Disable heading structure analysis')
  .option('--no-images', 'Disable image SEO analysis')
  .option('--no-links', 'Disable internal linking analysis')
  .option('--no-urls', 'Disable URL structure analysis')
  .action(async (options) => {
    const logger = new Logger();

    try {
      // Parse paths
      const paths = options.paths.split(',').map(p => p.trim());
      
      // Find files to analyze
      const files = [];
      for (const path of paths) {
        const stat = fs.statSync(path);
        if (stat.isDirectory()) {
          const glob = await import('globby');
          const dirFiles = await glob.globby([`${path}/**/*.{js,ts,jsx,tsx,html,css,vue,svelte}`], {
            ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
          });
          files.push(...dirFiles);
        } else {
          files.push(path);
        }
      }

      if (files.length === 0) {
        logger.warning('No files found to analyze');
        return;
      }

      logger.info(`🔍 Analyzing ${files.length} files for SEO optimization issues...`);

      // Configure SEO analysis
      const seoOptions = {
        analyzer: {
          enableTechnicalSEO: options.technical !== false,
          enableContentSEO: options.content !== false,
          enablePerformanceSEO: options.performance !== false,
          enableMobileSEO: options.mobile !== false,
          enableSchemaMarkup: options.schema !== false,
          enableMetaTags: options.meta !== false,
          enableHeadingStructure: options.headings !== false,
          enableImageSEO: options.images !== false,
          enableInternalLinking: options.links !== false,
          enableURLStructure: options.urls !== false
        },
        dashboard: {
          theme: options.theme
        }
      };

      const seoAnalysis = new SEOAnalysis(seoOptions);
      const results = await seoAnalysis.analyze(files);

      // Save analysis results
      await fs.promises.writeFile(options.output, JSON.stringify(results, null, 2));
      logger.success(`🔍 SEO analysis saved: ${options.output}`);

      // Generate dashboard if requested
      if (options.dashboard) {
        const dashboardPath = options.dashboard.startsWith('dashboards/') ? options.dashboard : `dashboards/seo/${options.dashboard}`;
        await fs.promises.mkdir(path.dirname(dashboardPath), { recursive: true });
        
        const recommendations = seoAnalysis.generateRecommendations(results);
        const dashboardHTML = seoAnalysis.generateDashboard(results, recommendations);
        await fs.promises.writeFile(dashboardPath, dashboardHTML);
        
        logger.success(`🌐 SEO dashboard generated: ${dashboardPath}`);
        logger.info(`📊 Open in browser: file://${path.resolve(dashboardPath)}`);
      }

      // Display summary
      const summary = results.summary;
      logger.info(`\n📊 SEO Analysis Summary:`);
      logger.info(`   SEO Score: ${summary.seoScore}/100`);
      logger.info(`   SEO Level: ${summary.seoLevel}`);
      logger.info(`   Total Issues: ${summary.totalIssues}`);
      logger.info(`   Critical Issues: ${summary.bySeverity.high}`);
      logger.info(`   Medium Issues: ${summary.bySeverity.medium}`);
      logger.info(`   Low Issues: ${summary.bySeverity.low}`);

      if (summary.totalIssues > 0) {
        logger.info(`\n⚠️  ${summary.totalIssues} SEO issues found`);
        logger.info(`   Run with --dashboard to see detailed analysis`);
      } else {
        logger.success(`\n✅ No SEO issues found!`);
      }

    } catch (error) {
      logger.error(`SEO analysis failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('seo-dashboard')
  .description('Generate SEO dashboard from existing analysis')
  .option('-i, --input <file>', 'Input SEO analysis file', 'seo-analysis.json')
  .option('-o, --output <file>', 'Output HTML file', 'seo-dashboard.html')
  .option('-t, --theme <theme>', 'Dashboard theme (light/dark)', 'dark')
  .action(async (options) => {
    const logger = new Logger();

    try {
      if (!fs.existsSync(options.input)) {
        logger.error(`SEO analysis file not found: ${options.input}`);
        logger.info('Run "baseline-check seo" first to generate analysis data');
        process.exit(1);
      }

      const analysisData = JSON.parse(await fs.promises.readFile(options.input, 'utf8'));
      const seoAnalysis = new SEOAnalysis({ dashboard: { theme: options.theme } });
      
      const recommendations = seoAnalysis.generateRecommendations(analysisData);
      const dashboardHTML = seoAnalysis.generateDashboard(analysisData, recommendations);
      
      const outputPath = options.output.startsWith('dashboards/') ? options.output : `dashboards/seo/${options.output}`;
      await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.promises.writeFile(outputPath, dashboardHTML);

      logger.success(`🌐 SEO dashboard generated: ${outputPath}`);
      logger.info(`📊 Open in browser: file://${path.resolve(outputPath)}`);

    } catch (error) {
      logger.error(`Dashboard generation failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('bundle')
  .description('Analyze bundle for optimization issues')
  .option('-p, --path <path>', 'Path to bundle file to analyze', 'dist/bundle.js')
  .option('-r, --root <root>', 'Project root directory', '.')
  .option('-o, --output <file>', 'Output file for bundle analysis', 'bundle-analysis.json')
  .option('-d, --dashboard <file>', 'Generate bundle dashboard', 'bundle-dashboard.html')
  .option('-t, --theme <theme>', 'Dashboard theme (light/dark)', 'dark')
  .option('--no-size', 'Disable size analysis')
  .option('--no-deps', 'Disable dependency analysis')
  .option('--no-splitting', 'Disable code splitting analysis')
  .option('--no-tree-shaking', 'Disable tree shaking analysis')
  .option('--no-compression', 'Disable compression analysis')
  .option('--no-caching', 'Disable caching analysis')
  .option('--no-performance', 'Disable performance analysis')
  .option('--no-security', 'Disable security analysis')
  .option('--no-modernization', 'Disable modernization analysis')
  .option('--no-optimization', 'Disable optimization analysis')
  .option('--max-size <size>', 'Maximum bundle size in KB', '250')
  .option('--max-chunk <size>', 'Maximum chunk size in KB', '100')
  .option('--max-deps <count>', 'Maximum number of dependencies', '50')
  .action(async (options) => {
    const logger = new Logger();

    try {
      if (!fs.existsSync(options.path)) {
        logger.error(`Bundle file not found: ${options.path}`);
        logger.info('Please provide a valid path to your bundle file');
        process.exit(1);
      }

      logger.info(`📦 Analyzing bundle: ${options.path}`);

      // Configure bundle analysis
      const bundleOptions = {
        analyzer: {
          enableSizeAnalysis: options.size !== false,
          enableDependencyAnalysis: options.deps !== false,
          enableCodeSplitting: options.splitting !== false,
          enableTreeShaking: options.treeShaking !== false,
          enableCompression: options.compression !== false,
          enableCaching: options.caching !== false,
          enablePerformance: options.performance !== false,
          enableSecurity: options.security !== false,
          enableModernization: options.modernization !== false,
          enableOptimization: options.optimization !== false,
          maxBundleSize: parseInt(options.maxSize) * 1024,
          maxChunkSize: parseInt(options.maxChunk) * 1024,
          maxDependencies: parseInt(options.maxDeps)
        },
        dashboard: {
          theme: options.theme
        }
      };

      const bundleAnalysis = new BundleAnalysis(bundleOptions);
      const results = await bundleAnalysis.analyzeBundle(options.path, options.root);

      // Save analysis results
      await fs.promises.writeFile(options.output, JSON.stringify(results, null, 2));
      logger.success(`📦 Bundle analysis saved: ${options.output}`);

      // Generate dashboard if requested
      if (options.dashboard) {
        const dashboardPath = options.dashboard.startsWith('dashboards/') ? options.dashboard : `dashboards/bundle/${options.dashboard}`;
        await fs.promises.mkdir(path.dirname(dashboardPath), { recursive: true });
        
        const recommendations = bundleAnalysis.generateRecommendations(results);
        const dashboardHTML = bundleAnalysis.generateDashboard(results, recommendations);
        await fs.promises.writeFile(dashboardPath, dashboardHTML);
        
        logger.success(`🌐 Bundle dashboard generated: ${dashboardPath}`);
        logger.info(`📊 Open in browser: file://${path.resolve(dashboardPath)}`);
      }

      // Display summary
      const summary = results.summary;
      logger.info(`\n📊 Bundle Analysis Summary:`);
      logger.info(`   Bundle Score: ${summary.bundleScore}/100`);
      logger.info(`   Bundle Level: ${summary.bundleLevel}`);
      logger.info(`   Total Issues: ${summary.totalIssues}`);
      logger.info(`   Critical Issues: ${summary.bySeverity.high}`);
      logger.info(`   Medium Issues: ${summary.bySeverity.medium}`);
      logger.info(`   Low Issues: ${summary.bySeverity.low}`);

      if (summary.totalIssues > 0) {
        logger.info(`\n⚠️  ${summary.totalIssues} bundle issues found`);
        logger.info(`   Run with --dashboard to see detailed analysis`);
      } else {
        logger.success(`\n✅ No bundle issues found!`);
      }

    } catch (error) {
      logger.error(`Bundle analysis failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('bundle-dashboard')
  .description('Generate bundle dashboard from existing analysis')
  .option('-i, --input <file>', 'Input bundle analysis file', 'bundle-analysis.json')
  .option('-o, --output <file>', 'Output HTML file', 'bundle-dashboard.html')
  .option('-t, --theme <theme>', 'Dashboard theme (light/dark)', 'dark')
  .action(async (options) => {
    const logger = new Logger();

    try {
      if (!fs.existsSync(options.input)) {
        logger.error(`Bundle analysis file not found: ${options.input}`);
        logger.info('Run "baseline-check bundle" first to generate analysis data');
        process.exit(1);
      }

      const analysisData = JSON.parse(await fs.promises.readFile(options.input, 'utf8'));
      const bundleAnalysis = new BundleAnalysis({ dashboard: { theme: options.theme } });
      
      const recommendations = bundleAnalysis.generateRecommendations(analysisData);
      const dashboardHTML = bundleAnalysis.generateDashboard(analysisData, recommendations);
      
      const outputPath = options.output.startsWith('dashboards/') ? options.output : `dashboards/bundle/${options.output}`;
      await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.promises.writeFile(outputPath, dashboardHTML);

      logger.success(`🌐 Bundle dashboard generated: ${outputPath}`);
      logger.info(`📊 Open in browser: file://${path.resolve(outputPath)}`);

    } catch (error) {
      logger.error(`Dashboard generation failed: ${error.message}`);
      process.exit(1);
    }
  });

// Baseline-specific commands
program
  .command('baseline')
  .description('Run comprehensive baseline analysis with browser-specific detection')
  .option('-p, --paths <paths>', 'Comma-separated paths to analyze', 'src')
  .option('-o, --output <file>', 'Output file for baseline analysis', 'baseline-analysis.json')
  .option('-d, --dashboard <file>', 'Generate baseline dashboard', 'baseline-dashboard.html')
  .option('-t, --theme <theme>', 'Dashboard theme (light/dark)', 'dark')
  .option('-b, --browsers <browsers>', 'Target browsers (chrome,firefox,safari,edge)', 'chrome,firefox,safari,edge')
  .option('--threshold <threshold>', 'Baseline threshold (0-1)', '0.95')
  .option('--no-mobile', 'Exclude mobile browsers')
  .option('--include-beta', 'Include beta browser versions')
  .action(async (options) => {
    const logger = new Logger();

    try {
      // Parse paths
      const paths = options.paths.split(',').map(p => p.trim());
      
      // Find files to analyze
      const files = [];
      for (const path of paths) {
        const stat = fs.statSync(path);
        if (stat.isDirectory()) {
          const glob = await import('globby');
          const dirFiles = await glob.globby([`${path}/**/*.{js,ts,jsx,tsx,html,css,vue,svelte}`], {
            ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
          });
          files.push(...dirFiles);
        } else {
          files.push(path);
        }
      }

      if (files.length === 0) {
        logger.warning('No files found to analyze');
        return;
      }

      logger.info(`🎯 Analyzing ${files.length} files for baseline compliance...`);

      // Configure baseline analysis
      const baselineOptions = {
        targetBrowsers: options.browsers.split(',').map(b => b.trim()),
        baselineThreshold: parseFloat(options.threshold),
        includeMobile: options.mobile !== false,
        includeBeta: options.includeBeta
      };

      const baselineAnalysis = new BaselineAnalysis(baselineOptions);
      
      // Load BCD data
      const bcdData = await loadBCDData();
      
      // Run analysis
      const results = await baselineAnalysis.analyze(files, bcdData);

      // Save analysis results
      await fs.promises.writeFile(options.output, JSON.stringify(results, null, 2));
      logger.success(`🎯 Baseline analysis saved: ${options.output}`);

      // Generate dashboard if requested
      if (options.dashboard) {
        const dashboardPath = options.dashboard.startsWith('dashboards/') ? options.dashboard : `dashboards/baseline/${options.dashboard}`;
        await fs.promises.mkdir(path.dirname(dashboardPath), { recursive: true });
        
        const dashboardHTML = baselineAnalysis.generateDashboard(results, options.theme);
        await fs.promises.writeFile(dashboardPath, dashboardHTML);
        
        logger.success(`🌐 Baseline dashboard generated: ${dashboardPath}`);
        logger.info(`📊 Open in browser: file://${path.resolve(dashboardPath)}`);
      }

      // Display summary
      const summary = results.summary;
      const compliance = results.compliance;
      logger.info(`\n📊 Baseline Analysis Summary:`);
      logger.info(`   Overall Score: ${compliance?.scores?.overall || 0}/100`);
      logger.info(`   Browser Support: ${compliance?.scores?.browserSupport?.toFixed(1) || 0}/100`);
      logger.info(`   Feature Stability: ${compliance?.scores?.featureStability?.toFixed(1) || 0}/100`);
      logger.info(`   Performance: ${compliance?.scores?.performance?.toFixed(1) || 0}/100`);
      logger.info(`   Accessibility: ${compliance?.scores?.accessibility?.toFixed(1) || 0}/100`);
      logger.info(`   Analysis Time: ${summary.analysisTime}ms`);

      if (compliance?.scores?.overall < 80) {
        logger.warning(`\n⚠️  Baseline compliance score is below 80`);
        logger.info(`   Run with --dashboard to see detailed analysis and recommendations`);
      } else {
        logger.success(`\n✅ Excellent baseline compliance!`);
      }

    } catch (error) {
      logger.error(`Baseline analysis failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('baseline-dashboard')
  .description('Generate baseline dashboard from existing analysis')
  .option('-i, --input <file>', 'Input baseline analysis file', 'baseline-analysis.json')
  .option('-o, --output <file>', 'Output HTML file', 'baseline-dashboard.html')
  .option('-t, --theme <theme>', 'Dashboard theme (light/dark)', 'dark')
  .action(async (options) => {
    const logger = new Logger();

    try {
      if (!fs.existsSync(options.input)) {
        logger.error(`Baseline analysis file not found: ${options.input}`);
        logger.info('Run "baseline-check baseline" first to generate analysis data');
        process.exit(1);
      }

      const analysisData = JSON.parse(await fs.promises.readFile(options.input, 'utf8'));
      const baselineAnalysis = new BaselineAnalysis();
      
      const dashboardHTML = baselineAnalysis.generateDashboard(analysisData, options.theme);
      
      const outputPath = options.output.startsWith('dashboards/') ? options.output : `dashboards/baseline/${options.output}`;
      await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.promises.writeFile(outputPath, dashboardHTML);

      logger.success(`🌐 Baseline dashboard generated: ${outputPath}`);
      logger.info(`📊 Open in browser: file://${path.resolve(outputPath)}`);

    } catch (error) {
      logger.error(`Dashboard generation failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('browser-support')
  .description('Analyze browser-specific feature support')
  .option('-p, --paths <paths>', 'Comma-separated paths to analyze', 'src')
  .option('-o, --output <file>', 'Output file for browser support analysis', 'browser-support.json')
  .option('-d, --dashboard <file>', 'Generate browser support dashboard', 'browser-support-dashboard.html')
  .option('-t, --theme <theme>', 'Dashboard theme (light/dark)', 'dark')
  .option('-b, --browsers <browsers>', 'Target browsers (chrome,firefox,safari,edge)', 'chrome,firefox,safari,edge')
  .option('--threshold <threshold>', 'Baseline threshold (0-1)', '0.95')
  .action(async (options) => {
    const logger = new Logger();

    try {
      // Parse paths
      const paths = options.paths.split(',').map(p => p.trim());
      
      // Find files to analyze
      const files = [];
      for (const path of paths) {
        const stat = fs.statSync(path);
        if (stat.isDirectory()) {
          const glob = await import('globby');
          const dirFiles = await glob.globby([`${path}/**/*.{js,ts,jsx,tsx,html,css,vue,svelte}`], {
            ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
          });
          files.push(...dirFiles);
        } else {
          files.push(path);
        }
      }

      if (files.length === 0) {
        logger.warning('No files found to analyze');
        return;
      }

      logger.info(`🌐 Analyzing browser support for ${files.length} files...`);

      // Configure browser detector
      const browserOptions = {
        targetBrowsers: options.browsers.split(',').map(b => b.trim()),
        baselineThreshold: parseFloat(options.threshold)
      };

      const browserDetector = new (await import('./baseline/browser-detector.js')).BrowserDetector(browserOptions);
      
      // Load BCD data
      const bcdData = await loadBCDData();
      
      // Extract features
      const baselineAnalysis = new BaselineAnalysis();
      const features = await baselineAnalysis.extractFeatures(files);
      
      // Run browser support analysis
      const results = await browserDetector.analyzeBrowserSupport(features, bcdData);

      // Save analysis results
      await fs.promises.writeFile(options.output, JSON.stringify(results, null, 2));
      logger.success(`🌐 Browser support analysis saved: ${options.output}`);

      // Generate dashboard if requested
      if (options.dashboard) {
        const dashboardPath = options.dashboard.startsWith('dashboards/') ? options.dashboard : `dashboards/baseline/${options.dashboard}`;
        await fs.promises.mkdir(path.dirname(dashboardPath), { recursive: true });
        
        // Generate simple browser support dashboard
        const dashboardHTML = generateBrowserSupportDashboard(results, options.theme);
        await fs.promises.writeFile(dashboardPath, dashboardHTML);
        
        logger.success(`🌐 Browser support dashboard generated: ${dashboardPath}`);
        logger.info(`📊 Open in browser: file://${path.resolve(dashboardPath)}`);
      }

      // Display summary
      const summary = results.summary;
      logger.info(`\n📊 Browser Support Summary:`);
      logger.info(`   Total Features: ${summary.totalFeatures}`);
      logger.info(`   Baseline Features: ${summary.baselineFeatures}`);
      logger.info(`   Risky Features: ${summary.riskyFeatures}`);
      logger.info(`   Unsupported Features: ${summary.unsupportedFeatures}`);

      for (const [browser, data] of Object.entries(summary.browserSupport)) {
        logger.info(`   ${browser}: ${data.coverage.toFixed(1)}% coverage`);
      }

    } catch (error) {
      logger.error(`Browser support analysis failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('polyfills')
  .description('Generate polyfill recommendations')
  .option('-i, --input <file>', 'Input browser support analysis file', 'browser-support.json')
  .option('-o, --output <file>', 'Output file for polyfill recommendations', 'polyfill-recommendations.json')
  .option('-d, --dashboard <file>', 'Generate polyfill dashboard', 'polyfill-dashboard.html')
  .option('-t, --theme <theme>', 'Dashboard theme (light/dark)', 'dark')
  .action(async (options) => {
    const logger = new Logger();

    try {
      if (!fs.existsSync(options.input)) {
        logger.error(`Browser support analysis file not found: ${options.input}`);
        logger.info('Run "baseline-check browser-support" first to generate analysis data');
        process.exit(1);
      }

      const analysisData = JSON.parse(await fs.promises.readFile(options.input, 'utf8'));
      const polyfillRecommender = new (await import('./baseline/polyfill-recommender.js')).PolyfillRecommender();
      
      const recommendations = polyfillRecommender.generateRecommendations(analysisData.features);

      // Save recommendations
      await fs.promises.writeFile(options.output, JSON.stringify(recommendations, null, 2));
      logger.success(`🔧 Polyfill recommendations saved: ${options.output}`);

      // Generate dashboard if requested
      if (options.dashboard) {
        const dashboardPath = options.dashboard.startsWith('dashboards/') ? options.dashboard : `dashboards/baseline/${options.dashboard}`;
        await fs.promises.mkdir(path.dirname(dashboardPath), { recursive: true });
        
        // Generate simple polyfill dashboard
        const dashboardHTML = generatePolyfillDashboard(recommendations, options.theme);
        await fs.promises.writeFile(dashboardPath, dashboardHTML);
        
        logger.success(`🌐 Polyfill dashboard generated: ${dashboardPath}`);
        logger.info(`📊 Open in browser: file://${path.resolve(dashboardPath)}`);
      }

      // Display summary
      const summary = recommendations.summary;
      logger.info(`\n📊 Polyfill Recommendations Summary:`);
      logger.info(`   Total Polyfills: ${summary.totalPolyfills}`);
      logger.info(`   Estimated Size: ${Math.round(summary.estimatedSize / 1024)} KB`);
      logger.info(`   Maintenance Level: ${summary.maintenanceLevel}`);
      logger.info(`   Performance Impact: ${summary.performanceImpact}`);

      if (summary.totalPolyfills > 0) {
        logger.info(`\n💡 ${summary.totalPolyfills} polyfill recommendations generated`);
        logger.info(`   Run with --dashboard to see detailed recommendations`);
      } else {
        logger.success(`\n✅ No polyfills needed!`);
      }

    } catch (error) {
      logger.error(`Polyfill analysis failed: ${error.message}`);
      process.exit(1);
    }
  });

program
  .command('migrate')
  .description('Generate migration plan for risky features')
  .option('-i, --input <file>', 'Input baseline analysis file', 'baseline-analysis.json')
  .option('-o, --output <file>', 'Output file for migration plan', 'migration-plan.json')
  .option('-d, --dashboard <file>', 'Generate migration dashboard', 'migration-dashboard.html')
  .option('-t, --theme <theme>', 'Dashboard theme (light/dark)', 'dark')
  .action(async (options) => {
    const logger = new Logger();

    try {
      if (!fs.existsSync(options.input)) {
        logger.error(`Baseline analysis file not found: ${options.input}`);
        logger.info('Run "baseline-check baseline" first to generate analysis data');
        process.exit(1);
      }

      const analysisData = JSON.parse(await fs.promises.readFile(options.input, 'utf8'));
      const baselineAnalysis = new BaselineAnalysis();
      
      // Generate migration plan
      const migrationPlan = await baselineAnalysis.generateMigrationPlan(analysisData);

      // Save migration plan
      await fs.promises.writeFile(options.output, JSON.stringify(migrationPlan, null, 2));
      logger.success(`🚀 Migration plan saved: ${options.output}`);

      // Generate dashboard if requested
      if (options.dashboard) {
        const dashboardPath = options.dashboard.startsWith('dashboards/') ? options.dashboard : `dashboards/baseline/${options.dashboard}`;
        await fs.promises.mkdir(path.dirname(dashboardPath), { recursive: true });
        
        const dashboardHTML = baselineAnalysis.generateMigrationDashboard(migrationPlan, options.theme);
        await fs.promises.writeFile(dashboardPath, dashboardHTML);
        
        logger.success(`🌐 Migration dashboard generated: ${dashboardPath}`);
        logger.info(`📊 Open in browser: file://${path.resolve(dashboardPath)}`);
      }

      // Display summary
      const summary = migrationPlan.summary;
      logger.info(`\n📊 Migration Plan Summary:`);
      logger.info(`   Features to Migrate: ${summary.totalFeatures}`);
      logger.info(`   Migration Complexity: ${summary.migrationComplexity.toUpperCase()}`);
      logger.info(`   Estimated Time: ${summary.estimatedTime} hours`);
      logger.info(`   Risk Reduction: ${summary.riskReduction}%`);
      logger.info(`   Baseline Improvement: ${summary.baselineImprovement}%`);

      if (summary.totalFeatures > 0) {
        logger.info(`\n🚀 Migration plan generated for ${summary.totalFeatures} features`);
        logger.info(`   Run with --dashboard to see detailed migration plan`);
      } else {
        logger.success(`\n✅ No risky features found - no migration needed!`);
      }

    } catch (error) {
      logger.error(`Migration plan generation failed: ${error.message}`);
      process.exit(1);
    }
  });

// Helper function to load BCD data
async function loadBCDData() {
  try {
    const bcdPath = path.join(process.cwd(), 'node_modules/@mdn/browser-compat-data/data.json');
    const bcdData = JSON.parse(await fs.promises.readFile(bcdPath, 'utf8'));
    return bcdData;
  } catch (error) {
    console.warn('Could not load BCD data, using empty data');
    return {};
  }
}

// Helper function to generate browser support dashboard
function generateBrowserSupportDashboard(results, theme) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Browser Support Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'};
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
            margin: 0;
            padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 40px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'}; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat { display: flex; justify-content: space-between; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌐 Browser Support Dashboard</h1>
        </div>
        <div class="grid">
            <div class="card">
                <h3>Summary</h3>
                <div class="stat"><span>Total Features:</span><span>${results.summary.totalFeatures}</span></div>
                <div class="stat"><span>Baseline Features:</span><span>${results.summary.baselineFeatures}</span></div>
                <div class="stat"><span>Risky Features:</span><span>${results.summary.riskyFeatures}</span></div>
                <div class="stat"><span>Unsupported Features:</span><span>${results.summary.unsupportedFeatures}</span></div>
            </div>
            <div class="card">
                <h3>Browser Coverage</h3>
                ${Object.entries(results.summary.browserSupport).map(([browser, data]) => 
                  `<div class="stat"><span>${browser}:</span><span>${data.coverage.toFixed(1)}%</span></div>`
                ).join('')}
            </div>
        </div>
    </div>
</body>
</html>`;
}

// Helper function to generate polyfill dashboard
function generatePolyfillDashboard(recommendations, theme) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Polyfill Recommendations Dashboard</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: ${theme === 'dark' ? '#1a1a1a' : '#ffffff'};
            color: ${theme === 'dark' ? '#ffffff' : '#333333'};
            margin: 0;
            padding: 20px;
        }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 40px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: ${theme === 'dark' ? '#2d2d2d' : '#ffffff'}; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat { display: flex; justify-content: space-between; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔧 Polyfill Recommendations Dashboard</h1>
        </div>
        <div class="grid">
            <div class="card">
                <h3>Summary</h3>
                <div class="stat"><span>Total Polyfills:</span><span>${recommendations.summary.totalPolyfills}</span></div>
                <div class="stat"><span>Estimated Size:</span><span>${Math.round(recommendations.summary.estimatedSize / 1024)} KB</span></div>
                <div class="stat"><span>Maintenance Level:</span><span>${recommendations.summary.maintenanceLevel}</span></div>
                <div class="stat"><span>Performance Impact:</span><span>${recommendations.summary.performanceImpact}</span></div>
            </div>
        </div>
    </div>
</body>
</html>`;
}

// Generate unified dashboard hub
program
  .command('dashboard-hub')
  .description('Generate unified dashboard hub with all analysis dashboards')
  .option('-o, --output <dir>', 'Output directory for dashboards', 'dashboards')
  .action(async (options) => {
    const logger = new Logger();
    
    try {
      const { DashboardGenerator } = await import('./dashboard-generator.js');
      const generator = new DashboardGenerator(options.output);
      
      logger.info('📊 Generating unified dashboard hub...');
      const hubPath = await generator.generateAll(process.cwd());
      
      logger.success(`Dashboard hub generated: ${hubPath}`);
      logger.info(`\n🌐 Open in browser: open ${hubPath}`);
    } catch (error) {
      logger.error(`Dashboard generation failed: ${error.message}`);
      process.exit(1);
    }
  });

program.parse();

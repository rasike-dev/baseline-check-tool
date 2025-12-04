import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { scan } from './scan.js';
import { check } from './check.js';
import { generateSummary } from './reporters/summary.js';
import { RecommendationEngine } from './recommendations.js';
import { AnalyticsEngine } from './analytics.js';
import { Logger, Table, Spinner } from './ui.js';

export class InteractiveMode {
  constructor(options = {}) {
    this.options = options;
    this.logger = new Logger({ verbose: options.verbose });
    this.recommendationEngine = new RecommendationEngine();
    this.analytics = new AnalyticsEngine();
    this.watchMode = false;
    this.watchers = new Map();
  }

  async start() {
    this.logger.success('🚀 Starting Baseline Check Interactive Mode');
    this.logger.info('Press Ctrl+C to exit, "help" for commands');
    
    console.log('\n📋 Available Commands:');
    console.log('  scan <path>     - Scan directory for features');
    console.log('  watch <path>    - Watch directory for changes');
    console.log('  analyze         - Analyze current results');
    console.log('  report          - Generate report');
    console.log('  examples        - Show examples and best practices');
    console.log('  wizard          - Configuration wizard');
    console.log('  help            - Show this help');
    console.log('  exit            - Exit interactive mode\n');

    // Start with initial scan if path provided
    if (this.options.path) {
      await this.scan(this.options.path);
    }

    // Start interactive prompt
    this.startPrompt();
  }

  startPrompt() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: 'baseline-check> '
    });

    rl.prompt();

    rl.on('line', async (input) => {
      const [command, ...args] = input.trim().split(' ');
      
      try {
        switch (command.toLowerCase()) {
          case 'scan':
            if (args.length === 0) {
              console.log('Usage: scan <path>');
            } else {
              await this.scan(args[0]);
            }
            break;
            
          case 'watch':
            if (args.length === 0) {
              console.log('Usage: watch <path>');
            } else {
              await this.watch(args[0]);
            }
            break;
            
          case 'analyze':
            await this.analyze();
            break;
            
          case 'report':
            await this.report();
            break;
            
          case 'examples':
            await this.showExamples();
            break;
            
          case 'wizard':
            await this.configWizard();
            break;
            
          case 'help':
            this.showHelp();
            break;
            
          case 'exit':
          case 'quit':
            console.log('👋 Goodbye!');
            rl.close();
            process.exit(0);
            break;
            
          case '':
            // Empty line, just show prompt
            break;
            
          default:
            console.log(`❌ Unknown command: ${command}`);
            console.log('Type "help" for available commands');
        }
      } catch (error) {
        this.logger.error(`Command failed: ${error.message}`);
      }
      
      rl.prompt();
    });

    rl.on('close', () => {
      console.log('\n👋 Goodbye!');
      process.exit(0);
    });
  }

  async scan(path) {
    const spinner = new Spinner();
    spinner.start(`Scanning ${path}...`);
    
    try {
      const result = await scan({
        paths: path,
        out: 'interactive-report.json',
        verbose: this.options.verbose
      });
      
      spinner.stop('Scan complete');
      
      // Show quick summary
      const stats = this.getQuickStats(result);
      this.showQuickStats(stats);
      
      // Store result for analysis
      this.lastResult = result;
      
    } catch (error) {
      spinner.stop('Scan failed');
      this.logger.error(`Scan failed: ${error.message}`);
    }
  }

  async watch(path) {
    if (this.watchers.has(path)) {
      console.log(`👀 Already watching ${path}`);
      return;
    }

    try {
      const chokidar = await import('chokidar');
      const watcher = chokidar.watch(path, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true,
        ignoreInitial: true
      });

      watcher.on('change', async (filePath) => {
        console.log(`\n📝 File changed: ${filePath}`);
        await this.scan(path);
      });

      watcher.on('add', async (filePath) => {
        console.log(`\n➕ File added: ${filePath}`);
        await this.scan(path);
      });

      this.watchers.set(path, watcher);
      console.log(`👀 Watching ${path} for changes...`);
      
    } catch (error) {
      this.logger.error(`Watch mode failed: ${error.message}`);
      console.log('💡 Install chokidar: npm install chokidar');
    }
  }

  async analyze() {
    if (!this.lastResult) {
      console.log('❌ No scan results available. Run "scan <path>" first.');
      return;
    }

    const spinner = new Spinner();
    spinner.start('Analyzing results...');

    try {
      const suggestions = this.recommendationEngine.analyzeReport(this.lastResult);
      const analysis = this.recommendationEngine.generateReport(suggestions);
      
      spinner.stop('Analysis complete');
      
      console.log('\n📊 Analysis Results:');
      console.log(analysis.summary);
      
      if (analysis.suggestions.length > 0) {
        console.log('\n💡 Recommendations:');
        analysis.suggestions.forEach((suggestion, index) => {
          console.log(`\n${index + 1}. ${suggestion.title}`);
          console.log(`   ${suggestion.message}`);
          if (suggestion.alternatives) {
            console.log('   Alternatives:');
            suggestion.alternatives.forEach(alt => console.log(`   - ${alt}`));
          }
        });
      }
      
    } catch (error) {
      spinner.stop('Analysis failed');
      this.logger.error(`Analysis failed: ${error.message}`);
    }
  }

  async report() {
    if (!this.lastResult) {
      console.log('❌ No scan results available. Run "scan <path>" first.');
      return;
    }

    const spinner = new Spinner();
    spinner.start('Generating report...');

    try {
      const report = await generateSummary({
        report: 'interactive-report.json',
        format: 'markdown'
      });
      
      spinner.stop('Report generated');
      
      console.log('\n📄 Report:');
      console.log(report);
      
    } catch (error) {
      spinner.stop('Report failed');
      this.logger.error(`Report generation failed: ${error.message}`);
    }
  }

  async showExamples() {
    console.log('\n📚 Examples and Best Practices:\n');
    
    console.log('🔧 Framework Examples:');
    console.log('  React:     npx baseline-check-tool setup --framework react');
    console.log('  Vue:       npx baseline-check-tool setup --framework vue');
    console.log('  Angular:   npx baseline-check-tool setup --framework angular');
    
    console.log('\n📊 Common Commands:');
    console.log('  Quick scan:     npx baseline-check-tool run --paths "src"');
    console.log('  Full analysis:  npx baseline-check-tool run --paths "src" --analyze');
    console.log('  HTML report:    npx baseline-check-tool report --format html');
    
    console.log('\n⚡ Quick Fixes:');
    console.log('  CSS Grid fallback:');
    console.log('    .container { display: grid; }');
    console.log('    @supports not (display: grid) { .container { display: flex; } }');
    
    console.log('\n  JavaScript polyfill:');
    console.log('    if (!Array.prototype.includes) { /* polyfill code */ }');
    
    console.log('\n🎯 Best Practices:');
    console.log('  • Use @supports for CSS feature detection');
    console.log('  • Implement progressive enhancement');
    console.log('  • Test in target browsers regularly');
    console.log('  • Use feature detection over user agent sniffing');
  }

  async configWizard() {
    console.log('\n🧙‍♂️ Configuration Wizard\n');
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

    try {
      console.log('Let\'s set up your baseline check configuration!\n');
      
      // Project type
      const projectType = await question('What type of project? (react/vue/angular/vanilla): ');
      
      // File patterns
      const patterns = await question('File patterns (comma-separated, default: **/*.{js,ts,jsx,tsx,css,html}): ');
      
      // Ignore patterns
      const ignore = await question('Ignore patterns (comma-separated, default: **/node_modules/**,**/dist/**): ');
      
      // Browser support
      const browsers = await question('Target browsers (comma-separated, default: chrome,firefox,safari,edge): ');
      
      // Generate config
      const config = this.generateConfig({
        projectType,
        patterns: patterns || '**/*.{js,ts,jsx,tsx,css,html}',
        ignore: ignore || '**/node_modules/**,**/dist/**',
        browsers: browsers || 'chrome,firefox,safari,edge'
      });
      
      // Write config file
      fs.writeFileSync('baseline-check.config.js', config);
      
      console.log('\n✅ Configuration saved to baseline-check.config.js');
      console.log('You can now run: npx baseline-check-tool run');
      
    } catch (error) {
      console.log('\n❌ Wizard failed:', error.message);
    } finally {
      rl.close();
    }
  }

  generateConfig(options) {
    const patterns = options.patterns.split(',').map(p => `'${p.trim()}'`).join(',\n    ');
    const ignore = options.ignore.split(',').map(p => `'${p.trim()}'`).join(',\n    ');
    const browsers = options.browsers.split(',').map(b => `'${b.trim()}'`).join(', ');

    return `export default {
  // Auto-generated config for ${options.projectType}
  patterns: [
    ${patterns}
  ],
  
  ignore: [
    ${ignore}
  ],
  
  baseline: {
    minBrowsers: 3,
    browsers: [${browsers}]
  },
  
  performance: {
    maxFileSize: 1024 * 1024, // 1MB
    concurrentFiles: 10,
    cacheResults: true
  }
};`;
  }

  getQuickStats(result) {
    const total = result.detected?.length || 0;
    const baseline = result.detected?.filter(d => d.status === 'baseline_like').length || 0;
    const risky = result.detected?.filter(d => d.status === 'risky').length || 0;
    const unknown = result.detected?.filter(d => d.status === 'unknown').length || 0;

    return {
      total,
      baseline,
      risky,
      unknown,
      files: result.metadata?.scannedFiles || 0
    };
  }

  showQuickStats(stats) {
    console.log('\n📊 Quick Stats:');
    console.log(`  Files scanned: ${stats.files}`);
    console.log(`  Features found: ${stats.total}`);
    console.log(`  ✅ Baseline: ${stats.baseline}`);
    console.log(`  ⚠️  Risky: ${stats.risky}`);
    console.log(`  ❓ Unknown: ${stats.unknown}`);
    
    if (stats.risky > 0) {
      console.log('\n💡 Run "analyze" for detailed recommendations');
    }
  }

  showHelp() {
    console.log('\n📋 Available Commands:');
    console.log('  scan <path>     - Scan directory for features');
    console.log('  watch <path>    - Watch directory for changes');
    console.log('  analyze         - Analyze current results');
    console.log('  report          - Generate report');
    console.log('  examples        - Show examples and best practices');
    console.log('  wizard          - Configuration wizard');
    console.log('  help            - Show this help');
    console.log('  exit            - Exit interactive mode');
  }
}

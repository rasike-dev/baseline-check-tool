import fs from 'node:fs';
import path from 'node:path';

export class FrameworkIntegrations {
  constructor() {
    this.frameworks = {
      'react': {
        name: 'React',
        configFile: 'baseline-check.config.js',
        patterns: ['**/*.{js,jsx,ts,tsx}', '**/*.css'],
        ignore: ['**/node_modules/**', '**/build/**', '**/dist/**'],
        setup: this.setupReact
      },
      'vue': {
        name: 'Vue.js',
        configFile: 'baseline-check.config.js',
        patterns: ['**/*.{js,ts,vue}', '**/*.css', '**/*.scss'],
        ignore: ['**/node_modules/**', '**/dist/**'],
        setup: this.setupVue
      },
      'angular': {
        name: 'Angular',
        configFile: 'baseline-check.config.js',
        patterns: ['**/*.{js,ts,html}', '**/*.css', '**/*.scss'],
        ignore: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
        setup: this.setupAngular
      },
      'svelte': {
        name: 'Svelte',
        configFile: 'baseline-check.config.js',
        patterns: ['**/*.{js,ts,svelte}', '**/*.css'],
        ignore: ['**/node_modules/**', '**/build/**'],
        setup: this.setupSvelte
      },
      'next': {
        name: 'Next.js',
        configFile: 'baseline-check.config.js',
        patterns: ['**/*.{js,jsx,ts,tsx}', '**/*.css', '**/*.scss'],
        ignore: ['**/node_modules/**', '**/.next/**', '**/out/**'],
        setup: this.setupNext
      },
      'nuxt': {
        name: 'Nuxt.js',
        configFile: 'baseline-check.config.js',
        patterns: ['**/*.{js,ts,vue}', '**/*.css', '**/*.scss'],
        ignore: ['**/node_modules/**', '**/.nuxt/**', '**/dist/**'],
        setup: this.setupNuxt
      }
    };
  }

  detectFramework(projectPath = '.') {
    const packageJsonPath = path.join(projectPath, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      return null;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

      // Check for framework-specific dependencies
      if (dependencies.react) return 'react';
      if (dependencies.vue) return 'vue';
      if (dependencies['@angular/core']) return 'angular';
      if (dependencies.svelte) return 'svelte';
      if (dependencies.next) return 'next';
      if (dependencies.nuxt) return 'nuxt';

      return null;
    } catch (error) {
      return null;
    }
  }

  setupReact(projectPath) {
    return {
      patterns: ['**/*.{js,jsx,ts,tsx}', '**/*.css', '**/*.scss'],
      ignore: [
        '**/node_modules/**',
        '**/build/**',
        '**/dist/**',
        '**/coverage/**',
        '**/.next/**'
      ],
      features: {
        // React-specific features
        'React.Fragment': { re: /<React\.Fragment|<Fragment/g, category: 'react' },
        'React.Suspense': { re: /<Suspense/g, category: 'react' },
        'React.lazy': { re: /React\.lazy|lazy\(/g, category: 'react' },
        'React.memo': { re: /React\.memo|memo\(/g, category: 'react' },
        'React.useEffect': { re: /useEffect\(/g, category: 'react' },
        'React.useState': { re: /useState\(/g, category: 'react' },
        'React.useCallback': { re: /useCallback\(/g, category: 'react' },
        'React.useMemo': { re: /useMemo\(/g, category: 'react' }
      }
    };
  }

  setupVue(projectPath) {
    return {
      patterns: ['**/*.{js,ts,vue}', '**/*.css', '**/*.scss'],
      ignore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.nuxt/**'
      ],
      features: {
        // Vue-specific features
        'Vue.Composition API': { re: /import.*from.*vue.*\{.*\}/g, category: 'vue' },
        'Vue.defineComponent': { re: /defineComponent\(/g, category: 'vue' },
        'Vue.ref': { re: /\bref\(/g, category: 'vue' },
        'Vue.reactive': { re: /\breactive\(/g, category: 'vue' },
        'Vue.computed': { re: /\bcomputed\(/g, category: 'vue' },
        'Vue.watch': { re: /\bwatch\(/g, category: 'vue' }
      }
    };
  }

  setupAngular(projectPath) {
    return {
      patterns: ['**/*.{js,ts,html}', '**/*.css', '**/*.scss'],
      ignore: [
        '**/node_modules/**',
        '**/dist/**',
        '**/e2e/**',
        '**/coverage/**'
      ],
      features: {
        // Angular-specific features
        'Angular.Decorators': { re: /@(Component|Injectable|Directive|Pipe)/g, category: 'angular' },
        'Angular.OnPush': { re: /OnPush/g, category: 'angular' },
        'Angular.AsyncPipe': { re: /async\s*\|\s*async/g, category: 'angular' }
      }
    };
  }

  setupSvelte(projectPath) {
    return {
      patterns: ['**/*.{js,ts,svelte}', '**/*.css'],
      ignore: [
        '**/node_modules/**',
        '**/build/**',
        '**/dist/**'
      ],
      features: {
        // Svelte-specific features
        'Svelte.stores': { re: /writable\(|readable\(|derived\(/g, category: 'svelte' },
        'Svelte.actions': { re: /use:/g, category: 'svelte' },
        'Svelte.transitions': { re: /transition:|in:|out:/g, category: 'svelte' }
      }
    };
  }

  setupNext(projectPath) {
    return {
      patterns: ['**/*.{js,jsx,ts,tsx}', '**/*.css', '**/*.scss'],
      ignore: [
        '**/node_modules/**',
        '**/.next/**',
        '**/out/**',
        '**/build/**'
      ],
      features: {
        // Next.js-specific features
        'Next.js.Image': { re: /import.*Image.*from.*next\/image/g, category: 'next' },
        'Next.js.Link': { re: /import.*Link.*from.*next\/link/g, category: 'next' },
        'Next.js.Router': { re: /useRouter\(|usePathname\(|useSearchParams\(/g, category: 'next' },
        'Next.js.SSR': { re: /getServerSideProps|getStaticProps|getStaticPaths/g, category: 'next' }
      }
    };
  }

  setupNuxt(projectPath) {
    return {
      patterns: ['**/*.{js,ts,vue}', '**/*.css', '**/*.scss'],
      ignore: [
        '**/node_modules/**',
        '**/.nuxt/**',
        '**/dist/**'
      ],
      features: {
        // Nuxt.js-specific features
        'Nuxt.composables': { re: /useState\(|useFetch\(|useAsyncData\(/g, category: 'nuxt' },
        'Nuxt.plugins': { re: /export default defineNuxtPlugin/g, category: 'nuxt' },
        'Nuxt.middleware': { re: /export default defineNuxtRouteMiddleware/g, category: 'nuxt' }
      }
    };
  }

  generateConfig(framework, projectPath = '.') {
    const frameworkConfig = this.frameworks[framework];
    if (!frameworkConfig) {
      throw new Error(`Unknown framework: ${framework}`);
    }

    const config = frameworkConfig.setup(projectPath);
    
    // Convert regex objects to strings for JSON serialization
    const featuresWithStringRegex = {};
    for (const [name, feature] of Object.entries(config.features)) {
      featuresWithStringRegex[name] = {
        ...feature,
        re: feature.re.toString()
      };
    }
    
    const configContent = `export default {
  // Auto-generated config for ${frameworkConfig.name}
  patterns: ${JSON.stringify(config.patterns, null, 4)},
  ignore: ${JSON.stringify(config.ignore, null, 4)},
  features: ${JSON.stringify(featuresWithStringRegex, null, 4)},
  
  // Browser support thresholds
  baseline: {
    minBrowsers: 3,
    browsers: ['chrome', 'firefox', 'safari', 'edge']
  },
  
  // Performance settings
  performance: {
    maxFileSize: 1024 * 1024, // 1MB
    concurrentFiles: 10,
    cacheResults: true
  }
};`;

    return configContent;
  }

  createGitHubAction(framework) {
    const frameworkConfig = this.frameworks[framework];
    if (!frameworkConfig) {
      throw new Error(`Unknown framework: ${framework}`);
    }

    return `name: Baseline Check - ${frameworkConfig.name}
on:
  pull_request:
  push:
    branches: [main]

jobs:
  baseline-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run baseline check
        run: |
          npx baseline-check run --paths "src" --out "baseline-report.json"
      
      - name: Comment PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('baseline-report.json', 'utf8'));
            const { generateSummary } = require('./action/src/reporters/summary.js');
            
            const summary = await generateSummary({
              report: 'baseline-report.json',
              format: 'markdown'
            });
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: summary
            });
      
      - name: Upload report
        uses: actions/upload-artifact@v4
        with:
          name: baseline-report
          path: baseline-report.json`;
  }

  createVSCodeSettings() {
    return {
      "baseline-check.enable": true,
      "baseline-check.autoScan": true,
      "baseline-check.showInlineWarnings": true,
      "baseline-check.ignorePatterns": [
        "**/node_modules/**",
        "**/dist/**",
        "**/build/**"
      ],
      "baseline-check.features": {
        "enableModernJS": true,
        "enableCSS": true,
        "enableWebAPIs": true
      }
    };
  }
}

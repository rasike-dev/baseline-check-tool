# 🔌 Baseline Check Tool API Reference

## 📚 Programmatic API

The Baseline Check Tool provides a comprehensive programmatic API for integration into build tools, CI/CD pipelines, and custom applications.

### Installation

```bash
npm install baseline-check-tool
```

### Basic Usage

```javascript
import { scan, check, generateSummary } from 'baseline-check-tool';

// Scan for features
const scanResult = await scan({
  paths: ['src', 'lib'],
  out: 'scan-results.json'
});

// Check compatibility
const checkResult = await check({
  report: 'scan-results.json',
  out: 'compatibility-report.json'
});

// Generate summary
const summary = await generateSummary({
  report: 'compatibility-report.json',
  format: 'html',
  out: 'report.html'
});
```

## 🔍 Scan API

### `scan(options)`

Scans codebase for modern web features.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `paths` | `string[]` | Yes | Array of paths to scan |
| `out` | `string` | Yes | Output file path |
| `config` | `string` | No | Configuration file path |
| `ignore` | `string[]` | No | Ignore patterns |
| `verbose` | `boolean` | No | Enable verbose logging |

#### Returns

```typescript
interface ScanResult {
  metadata: {
    scannedFiles: number;
    processedFiles: number;
    errorCount: number;
    skippedFiles: number;
    config: Config;
  };
  detected: FeatureDetection[];
  timestamp: string;
}

interface FeatureDetection {
  feature: string;
  files: string[];
  count: number;
  category: string;
  line?: number;
  column?: number;
}
```

#### Example

```javascript
import { scan } from 'baseline-check-tool';

const result = await scan({
  paths: ['src', 'lib'],
  out: 'scan-results.json',
  ignore: ['**/node_modules/**', '**/dist/**'],
  verbose: true
});

console.log(`Found ${result.detected.length} features`);
console.log(`Scanned ${result.metadata.scannedFiles} files`);
```

## 🔍 Check API

### `check(options)`

Checks feature compatibility against browser data.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `report` | `string` | Yes | Input report file path |
| `out` | `string` | No | Output file path |
| `browsers` | `string[]` | No | Target browsers |
| `threshold` | `number` | No | Minimum support threshold |

#### Returns

```typescript
interface CheckResult {
  metadata: {
    processedFeatures: number;
    unknownFeatures: number;
    baselineLike: number;
    risky: number;
    unknown: number;
  };
  results: CompatibilityResult[];
  timestamp: string;
}

interface CompatibilityResult {
  feature: string;
  status: 'baseline_like' | 'risky' | 'unknown';
  files: string[];
  count: number;
  mdn?: string;
  browsers: BrowserSupport;
}

interface BrowserSupport {
  chrome?: BrowserVersion[];
  firefox?: BrowserVersion[];
  safari?: BrowserVersion[];
  edge?: BrowserVersion[];
}

interface BrowserVersion {
  version: string;
  notes?: string;
}
```

#### Example

```javascript
import { check } from 'baseline-check-tool';

const result = await check({
  report: 'scan-results.json',
  out: 'compatibility-report.json',
  browsers: ['chrome', 'firefox', 'safari'],
  threshold: 0.8
});

console.log(`Baseline-like: ${result.metadata.baselineLike}`);
console.log(`Risky: ${result.metadata.risky}`);
console.log(`Unknown: ${result.metadata.unknown}`);
```

## 📊 Report API

### `generateSummary(options)`

Generates summary reports in various formats.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `report` | `string` | Yes | Input report file path |
| `format` | `'markdown' \| 'json' \| 'html'` | No | Output format (default: 'markdown') |
| `out` | `string` | No | Output file path |

#### Returns

```typescript
interface SummaryResult {
  content: string;
  format: string;
  filePath?: string;
  metadata: {
    generatedAt: string;
    totalFeatures: number;
    baselineLike: number;
    risky: number;
    unknown: number;
  };
}
```

#### Example

```javascript
import { generateSummary } from 'baseline-check-tool';

// Generate HTML report
const htmlReport = await generateSummary({
  report: 'compatibility-report.json',
  format: 'html',
  out: 'report.html'
});

// Generate JSON summary
const jsonSummary = await generateSummary({
  report: 'compatibility-report.json',
  format: 'json'
});

console.log(jsonSummary.content);
```

## ⚙️ Configuration API

### `loadConfig(filePath?)`

Loads configuration from file or returns default config.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `filePath` | `string` | No | Configuration file path |

#### Returns

```typescript
interface Config {
  patterns: string[];
  ignore: string[];
  features: Record<string, FeatureConfig>;
  baseline: {
    minBrowsers: number;
    browsers: string[];
  };
  performance: {
    maxFileSize: number;
    concurrentFiles: number;
    cacheResults: boolean;
  };
}

interface FeatureConfig {
  re: string | RegExp;
  category: string;
  description?: string;
}
```

#### Example

```javascript
import { loadConfig } from 'baseline-check-tool';

const config = await loadConfig('baseline-check.config.js');
console.log('Patterns:', config.patterns);
console.log('Features:', Object.keys(config.features));
```

### `validateConfig(config)`

Validates configuration object.

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `config` | `Config` | Yes | Configuration object to validate |

#### Returns

```typescript
interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

#### Example

```javascript
import { loadConfig, validateConfig } from 'baseline-check-tool';

const config = await loadConfig();
const validation = validateConfig(config);

if (!validation.valid) {
  console.error('Configuration errors:', validation.errors);
}
```

## 🧠 Analytics API

### `AnalyticsEngine`

Provides analytics and trend tracking capabilities.

#### Methods

##### `recordScan(report)`

Records scan data for analytics.

```javascript
import { AnalyticsEngine } from 'baseline-check-tool';

const analytics = new AnalyticsEngine();
await analytics.recordScan(scanResult);
```

##### `getTrends(options)`

Retrieves trend data.

```javascript
const trends = await analytics.getTrends({
  days: 30,
  features: ['css.grid', 'css.flexbox']
});
```

##### `generateReport(options)`

Generates analytics report.

```javascript
const report = await analytics.generateReport({
  format: 'html',
  out: 'analytics.html'
});
```

## 🔧 Cache API

### `CacheManager`

Manages caching for improved performance.

#### Methods

##### `getCacheKey(paths, config)`

Generates cache key for given paths and config.

```javascript
import { CacheManager } from 'baseline-check-tool';

const cache = new CacheManager();
const key = cache.getCacheKey(['src'], config);
```

##### `getCachedResult(key)`

Retrieves cached result.

```javascript
const cached = await cache.getCachedResult(key);
if (cached) {
  console.log('Using cached result');
  return cached;
}
```

##### `setCachedResult(key, result)`

Stores result in cache.

```javascript
await cache.setCachedResult(key, scanResult);
```

##### `invalidateCache(pattern?)`

Invalidates cache entries.

```javascript
// Invalidate all
await cache.invalidateCache();

// Invalidate specific pattern
await cache.invalidateCache('src/**');
```

## 🎯 Recommendations API

### `RecommendationEngine`

Provides smart recommendations for compatibility issues.

#### Methods

##### `analyzeReport(report)`

Analyzes report and generates recommendations.

```javascript
import { RecommendationEngine } from 'baseline-check-tool';

const engine = new RecommendationEngine();
const recommendations = await engine.analyzeReport(compatibilityReport);

console.log('Recommendations:', recommendations);
```

##### `generateReport(recommendations)`

Generates formatted recommendation report.

```javascript
const report = await engine.generateReport(recommendations);
console.log(report);
```

## 🔗 Integration API

### `FrameworkIntegrations`

Provides framework-specific integrations.

#### Methods

##### `detectFramework(projectPath)`

Detects framework in project.

```javascript
import { FrameworkIntegrations } from 'baseline-check-tool';

const integrations = new FrameworkIntegrations();
const framework = await integrations.detectFramework('./');
console.log('Detected framework:', framework);
```

##### `generateConfig(framework, projectPath)`

Generates framework-specific configuration.

```javascript
const config = integrations.generateConfig('react', './');
console.log(config);
```

##### `createGitHubAction(framework)`

Creates GitHub Action workflow.

```javascript
const workflow = integrations.createGitHubAction('react');
console.log(workflow);
```

## 🎨 UI Components API

### `ProgressBar`

Displays progress bars for long-running operations.

```javascript
import { ProgressBar } from 'baseline-check-tool';

const progress = new ProgressBar('Scanning files', 100);
progress.update(50); // 50% complete
progress.complete();
```

### `Spinner`

Displays loading spinners.

```javascript
import { Spinner } from 'baseline-check-tool';

const spinner = new Spinner('Processing...');
spinner.start();
// ... do work ...
spinner.stop();
```

### `Logger`

Provides colored logging output.

```javascript
import { Logger } from 'baseline-check-tool';

const logger = new Logger();
logger.info('Scan completed');
logger.warn('Some features are risky');
logger.error('Scan failed');
```

### `Table`

Displays tabular data.

```javascript
import { Table } from 'baseline-check-tool';

const table = new Table(['Feature', 'Status', 'Files']);
table.addRow(['CSS Grid', 'baseline_like', 'styles.css']);
table.addRow(['CSS :has()', 'risky', 'components.css']);
table.render();
```

## 🚀 Advanced Usage

### Custom Feature Detection

```javascript
import { scan, loadConfig } from 'baseline-check-tool';

// Load custom config
const config = await loadConfig('custom-config.js');

// Add custom features
config.features['MyCustomAPI'] = {
  re: /myCustomAPI\\(/g,
  category: 'javascript',
  description: 'Custom API usage'
};

// Scan with custom config
const result = await scan({
  paths: ['src'],
  out: 'results.json',
  config: 'custom-config.js'
});
```

### Batch Processing

```javascript
import { scan, check } from 'baseline-check-tool';

const projects = ['project1', 'project2', 'project3'];
const results = [];

for (const project of projects) {
  const scanResult = await scan({
    paths: [`${project}/src`],
    out: `${project}-scan.json`
  });
  
  const checkResult = await check({
    report: `${project}-scan.json`,
    out: `${project}-compatibility.json`
  });
  
  results.push({ project, checkResult });
}
```

### Error Handling

```javascript
import { scan, ErrorHandler } from 'baseline-check-tool';

try {
  const result = await scan({
    paths: ['src'],
    out: 'results.json'
  });
} catch (error) {
  const errorHandler = new ErrorHandler();
  const message = errorHandler.getErrorMessage(error);
  const fix = errorHandler.generateFixCommand(error);
  
  console.error(message);
  console.log('Try:', fix);
}
```

## 📝 TypeScript Support

The package includes full TypeScript definitions:

```typescript
import type { 
  ScanResult, 
  CheckResult, 
  Config, 
  FeatureDetection 
} from 'baseline-check-tool';
```

## 🔗 Related Packages

- `@mdn/browser-compat-data` - Browser compatibility data
- `commander` - CLI framework
- `globby` - File pattern matching

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

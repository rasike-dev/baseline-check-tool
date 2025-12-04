# Usage Examples

## Quick Start

```bash
# Install globally
npm install -g baseline-check-tool

# Analyze current directory
baseline-check analyze

# Analyze specific files
baseline-check analyze src/**/*.js src/**/*.css

# Generate HTML report
baseline-check analyze --format html --output report.html
```

## Configuration

Create a `baseline-check.config.js` file:

```javascript
module.exports = {
  patterns: ['**/*.js', '**/*.ts', '**/*.html', '**/*.css'],
  ignore: ['node_modules/**', 'dist/**'],
  performance: { enabled: true },
  security: { enabled: true },
  accessibility: { enabled: true },
  seo: { enabled: true }
};
```

## Commands

```bash
# Performance analysis
baseline-check performance --fix

# Security analysis
baseline-check security --severity high,critical

# Accessibility analysis
baseline-check accessibility --wcag-level AA

# SEO analysis
baseline-check seo --include-content

# Bundle analysis
baseline-check bundle --optimize

# Real-time monitoring
baseline-check monitor --watch src/
```

## Programmatic Usage

```javascript
import { BaselineChecker } from 'baseline-check-tool';

const checker = new BaselineChecker({
  patterns: ['**/*.js', '**/*.css'],
  performance: { enabled: true }
});

const results = await checker.analyze('./src');
console.log(results);
```

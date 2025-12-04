# 📚 Baseline Check Tool Documentation

## 🎯 Overview

The Baseline Check Tool is a comprehensive web compatibility analysis tool that helps developers ensure their code works across baseline browsers. It detects modern web features and provides detailed compatibility reports with actionable recommendations.

## 📦 Installation

### NPM (Recommended)
```bash
# Global installation
npm install -g baseline-check-tool

# Or use with npx (no installation required)
npx baseline-check-tool@latest
```

### Docker
```bash
# Pull the latest image
docker pull baseline-check-tool:latest

# Run the tool
docker run --rm -v $(pwd):/workspace baseline-check-tool:latest scan --paths /workspace/src
```

### From Source
```bash
git clone https://github.com/rasike-a/baseline-check.git
cd baseline-check/action
npm install
npm link
```

## 🚀 Quick Start

### 1. Initialize Configuration
```bash
npx baseline-check-tool init
```

### 2. Scan Your Codebase
```bash
npx baseline-check-tool scan --paths 'src' --out 'compatibility.json'
```

### 3. Check Compatibility
```bash
npx baseline-check-tool check --report 'compatibility.json'
```

### 4. Generate Report
```bash
npx baseline-check-tool report --report 'compatibility.json' --format html --out 'report.html'
```

### 5. Complete Pipeline
```bash
npx baseline-check-tool run --paths 'src' --out 'compatibility.json'
```

## 🔧 Commands Reference

### Core Commands

#### `scan` - Detect Modern Web Features
```bash
npx baseline-check-tool scan [options]

Options:
  -p, --paths <paths>     Paths to scan (comma-separated)
  -o, --out <file>        Output file for scan results
  -c, --config <file>     Configuration file path
  -i, --ignore <patterns> Ignore patterns (comma-separated)
  -v, --verbose          Verbose output
  -h, --help             Display help
```

#### `check` - Verify Browser Compatibility
```bash
npx baseline-check-tool check [options]

Options:
  -r, --report <file>     Report file to check
  -o, --out <file>        Output file for results
  -b, --browsers <list>   Target browsers (comma-separated)
  -t, --threshold <num>   Minimum browser support threshold
  -h, --help             Display help
```

#### `report` - Generate Summary Reports
```bash
npx baseline-check-tool report [options]

Options:
  -r, --report <file>     Report file to summarize
  -f, --format <format>   Output format (markdown, json, html)
  -o, --out <file>        Output file
  -h, --help             Display help
```

#### `run` - Complete Pipeline
```bash
npx baseline-check-tool run [options]

Options:
  -p, --paths <paths>     Paths to scan
  -o, --out <file>        Output file
  -c, --config <file>     Configuration file
  -h, --help             Display help
```

### Advanced Commands

#### `analyze` - Smart Recommendations
```bash
npx baseline-check-tool analyze --report 'compatibility.json'
```

#### `examples` - Framework Examples
```bash
npx baseline-check-tool examples --framework react
npx baseline-check-tool examples --framework vue
npx baseline-check-tool examples --framework angular
```

#### `setup` - Framework Integration
```bash
npx baseline-check-tool setup --framework react --github-action
npx baseline-check-tool setup --framework vue --vscode
```

#### `cache` - Cache Management
```bash
npx baseline-check-tool cache --stats
npx baseline-check-tool cache --clear
```

#### `interactive` - Interactive Mode
```bash
npx baseline-check-tool interactive --paths 'src'
```

#### `fix` - Quick Fixes
```bash
npx baseline-check-tool fix --feature 'css.container_queries'
```

#### `analytics` - Trend Analysis
```bash
npx baseline-check-tool analytics --report 'compatibility.json'
```

## ⚙️ Configuration

### Configuration File (`baseline-check.config.js`)

```javascript
export default {
  // File patterns to scan
  patterns: [
    "**/*.{js,jsx,ts,tsx}",
    "**/*.css",
    "**/*.html"
  ],
  
  // Files to ignore
  ignore: [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**"
  ],
  
  // Custom feature detection
  features: {
    "MyCustomFeature": {
      "re": "/myCustomFeature\\(/g",
      "category": "javascript"
    }
  },
  
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
};
```

### Environment Variables

```bash
# Set default paths
export BASELINE_CHECK_PATHS="src,lib"

# Set default output format
export BASELINE_CHECK_FORMAT="html"

# Enable verbose logging
export BASELINE_CHECK_VERBOSE="true"
```

## 🎨 Output Formats

### Markdown Report
```bash
npx baseline-check-tool report --format markdown --out 'report.md'
```

### JSON Report
```bash
npx baseline-check-tool report --format json --out 'report.json'
```

### HTML Report
```bash
npx baseline-check-tool report --format html --out 'report.html'
```

## 🔍 Feature Detection

The tool detects a wide range of modern web features:

### JavaScript Features
- ES6+ syntax (arrow functions, destructuring, etc.)
- Modern APIs (fetch, WebSocket, IntersectionObserver)
- Async/await and Promises
- Modules and imports

### CSS Features
- CSS Grid and Flexbox
- Custom Properties (CSS Variables)
- Container Queries
- CSS :has() pseudo-class
- Modern selectors and functions

### HTML Features
- Semantic elements (dialog, details, summary)
- Modern form controls
- Accessibility features

## 🚀 CI/CD Integration

### GitHub Actions
```yaml
name: Baseline Check
on: [push, pull_request]
jobs:
  baseline-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install -g baseline-check-tool
      - run: baseline-check-tool run --paths 'src' --out 'compatibility.json'
      - uses: actions/upload-artifact@v3
        with:
          name: compatibility-report
          path: compatibility.json
```

### GitLab CI
```yaml
baseline-check:
  stage: test
  image: node:18
  script:
    - npm install -g baseline-check-tool
    - baseline-check-tool run --paths 'src' --out 'compatibility.json'
  artifacts:
    reports:
      junit: compatibility.json
```

## 🐳 Docker Usage

### Basic Usage
```bash
# Scan current directory
docker run --rm -v $(pwd):/workspace baseline-check-tool:latest scan --paths /workspace/src

# Generate HTML report
docker run --rm -v $(pwd):/workspace baseline-check-tool:latest run --paths /workspace/src --out /workspace/compatibility.json
```

### Docker Compose
```yaml
version: '3.8'
services:
  baseline-check:
    image: baseline-check-tool:latest
    volumes:
      - .:/workspace
    working_dir: /workspace
    command: run --paths src --out compatibility.json
```

## 📊 Analytics and Monitoring

### Usage Analytics
```bash
# View analytics
npx baseline-check-tool analytics --report 'compatibility.json'

# Track trends over time
npx baseline-check-tool analytics --trends --report 'compatibility.json'
```

### Integration with Monitoring Tools
- **Datadog**: Custom metrics for compatibility scores
- **New Relic**: Performance monitoring integration
- **Sentry**: Error tracking for compatibility issues

## 🔧 Troubleshooting

### Common Issues

#### "Command not found"
```bash
# Make sure the package is installed globally
npm install -g baseline-check-tool

# Or use npx
npx baseline-check-tool@latest --help
```

#### "Permission denied"
```bash
# Use npx instead of global installation
npx baseline-check-tool@latest scan --paths 'src'
```

#### "No files found"
```bash
# Check your paths
npx baseline-check-tool scan --paths 'src,lib,app' --verbose
```

#### "BCD data not found"
```bash
# Clear cache and try again
npx baseline-check-tool cache --clear
npx baseline-check-tool scan --paths 'src'
```

### Debug Mode
```bash
# Enable verbose logging
npx baseline-check-tool scan --paths 'src' --verbose

# Check cache status
npx baseline-check-tool cache --stats
```

## 🤝 Contributing

### Development Setup
```bash
git clone https://github.com/rasike-a/baseline-check.git
cd baseline-check/action
npm install
npm test
```

### Running Tests
```bash
npm test
npm run test:ci
```

### Building
```bash
npm run build
npm pack
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [GitHub Wiki](https://github.com/rasike-a/baseline-check/wiki)
- **Issues**: [GitHub Issues](https://github.com/rasike-a/baseline-check/issues)
- **Discussions**: [GitHub Discussions](https://github.com/rasike-a/baseline-check/discussions)
- **Email**: team@baseline-check.dev

## 🔗 Links

- **NPM Package**: https://www.npmjs.com/package/baseline-check-tool
- **GitHub Repository**: https://github.com/rasike-a/baseline-check
- **Docker Hub**: https://hub.docker.com/r/baseline-check-tool
- **Website**: https://baseline-check.dev

# Baseline Check Tool

[![Version](https://img.shields.io/badge/version-2.3.2-blue.svg)](https://www.npmjs.com/package/baseline-check-tool)
[![Downloads](https://img.shields.io/npm/dt/baseline-check-tool.svg)](https://www.npmjs.com/package/baseline-check-tool)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![VS Code](https://img.shields.io/badge/VS%20Code-Extension-blue?logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=rasike-a.baseline-check-tool)

**Comprehensive web compatibility analysis and optimization tool for modern web development.**

> 📦 **Repository:** [GitHub](https://github.com/rasike-dev/baseline-check-tool) | 🎉 **Now available as a VS Code Extension!** Install from the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=rasike-a.baseline-check-tool) for integrated analysis directly in your editor.

## 🚀 Quick Start

```bash
# Install globally
npm install -g baseline-check-tool

# Or install locally
npm install baseline-check-tool

# Run analysis
baseline-check analyze
```

## ✨ Features

### 🔍 **AI-Powered Analysis**
- Smart code pattern detection
- Intelligent recommendations
- Automatic issue fixing
- Learning from user interactions

### ⚡ **Real-time Monitoring**
- File watching with automatic analysis
- Live alerts and notifications
- Real-time dashboard updates
- Performance tracking

### 🛡️ **Security & Accessibility**
- Vulnerability detection with CWE/OWASP mapping
- WCAG compliance checking
- Security scoring and recommendations
- Accessibility best practices

### 📊 **Performance Optimization**
- Bundle size analysis and optimization
- Performance metrics and recommendations
- Code splitting suggestions
- Memory leak detection

### 🌐 **Web Standards Compliance**
- Browser compatibility checking using MDN BCD
- Feature detection across multiple file types
- Polyfill recommendations
- Progressive enhancement analysis

### 📈 **SEO & Analytics**
- Technical SEO analysis
- Content optimization suggestions
- Performance SEO metrics
- Mobile optimization checks

## 📋 Installation

### Global Installation
```bash
npm install -g baseline-check-tool
```

### Local Installation
```bash
npm install baseline-check-tool
```

### Using npx (No Installation)
```bash
npx baseline-check-tool analyze
```

## 🎯 Usage

### Basic Analysis
```bash
# Analyze current directory
baseline-check analyze

# Analyze specific files
baseline-check analyze src/**/*.js src/**/*.css

# Analyze with specific options
baseline-check analyze --output report.json --format html
```

### Performance Analysis
```bash
# Run performance analysis
baseline-check performance

# Performance analysis with auto-fix
baseline-check performance --fix

# Performance analysis with specific options
baseline-check performance --threshold 1000 --include-bundle
```

### Security Analysis
```bash
# Run security analysis
baseline-check security

# Security analysis with specific severity
baseline-check security --severity high,critical
```

### Accessibility Analysis
```bash
# Run accessibility analysis
baseline-check accessibility

# Accessibility analysis with WCAG level
baseline-check accessibility --wcag-level AA
```

### SEO Analysis
```bash
# Run SEO analysis
baseline-check seo

# SEO analysis with specific checks
baseline-check seo --include-content --include-technical
```

### Bundle Analysis
```bash
# Run bundle analysis
baseline-check bundle

# Bundle analysis with optimization
baseline-check bundle --optimize --split-chunks
```

### Real-time Monitoring
```bash
# Start real-time monitoring
baseline-check monitor

# Monitor with specific options
baseline-check monitor --watch src/ --debounce 1000
```

## ⚙️ Configuration

Create a `baseline-check.config.js` file in your project root:

```javascript
module.exports = {
  // Analysis options
  patterns: ['**/*.js', '**/*.ts', '**/*.html', '**/*.css'],
  ignore: ['node_modules/**', 'dist/**', 'build/**'],
  
  // Feature detection
  features: {
    enabled: true,
    presets: ['default', 'modern', 'react'],
    custom: ['my-custom-feature']
  },
  
  // Performance analysis
  performance: {
    enabled: true,
    threshold: 1000,
    includeBundle: true,
    autoFix: false
  },
  
  // Security analysis
  security: {
    enabled: true,
    severity: ['high', 'critical'],
    includeSecrets: false
  },
  
  // Accessibility analysis
  accessibility: {
    enabled: true,
    wcagLevel: 'AA',
    includeColorContrast: true
  },
  
  // SEO analysis
  seo: {
    enabled: true,
    includeContent: true,
    includeTechnical: true
  },
  
  // Bundle analysis
  bundle: {
    enabled: true,
    optimize: false,
    splitChunks: false
  },
  
  // Monitoring
  monitoring: {
    enabled: false,
    debounceMs: 1000,
    watchPaths: ['src/']
  },
  
  // Output options
  output: {
    format: 'json',
    file: 'baseline-report.json',
    dashboard: true
  }
};
```

## 🎨 Interactive Dashboards

### ✨ New in v2.3.2: Unified Dashboard Hub!

The tool now generates a beautiful dashboard hub with navigation to all analysis types:

#### **Dashboard Hub Features:**
- 🏠 **Central Hub** - Single entry point with 6 analysis cards
- 🎨 **Beautiful UI** - Modern design with hover effects and gradients
- 🔗 **Seamless Navigation** - Navigation bar on all dashboards
- 📊 **Real Data** - Displays actual analysis results
- 🎯 **Color-Coded** - Critical (red), High (orange), Medium (yellow), Low (green)
- 📱 **Responsive** - Works on all screen sizes

#### **Available Dashboards:**

1. **🌐 Baseline Compatibility** - Browser feature detection and support matrix
2. **⚡ Performance Analysis** - Performance metrics, bundle sizes, optimization tips
3. **🔒 Security Analysis** - Vulnerability detection with CWE/OWASP mapping
4. **♿ Accessibility Analysis** - WCAG compliance and accessibility issues
5. **🔍 SEO Analysis** - Meta tags, Open Graph, structured data optimization
6. **📦 Bundle Analysis** - Code splitting, tree shaking, minification analysis

### Generating Dashboards

```bash
# Generate unified dashboard hub (NEW!)
baseline-check dashboard-hub

# This creates:
# - dashboards/index.html (hub with 6 cards)
# - dashboards/compatibility.html
# - dashboards/performance.html
# - dashboards/security.html
# - dashboards/accessibility.html
# - dashboards/seo.html
# - dashboards/bundle.html

# Open in browser
open dashboards/index.html
```

### Individual Dashboard Commands
```bash
# Generate specific dashboards
baseline-check performance-dashboard
baseline-check security-dashboard
baseline-check accessibility-dashboard
baseline-check seo-dashboard
baseline-check bundle-dashboard
```

### Dashboard Features
- **Statistics Cards** - Quick overview of findings by severity
- **Issue Lists** - Detailed issues with file locations and suggestions
- **Navigation Bar** - Easy switching between dashboards
- **Hover Effects** - Interactive and engaging UI
- **Data Visualization** - Charts and graphs for better insights

## 🔧 CLI Commands

| Command | Description |
|---------|-------------|
| `analyze` | Run comprehensive analysis |
| `scan` | Scan files for features |
| `check` | Check browser compatibility |
| `run` | Run complete pipeline (scan + check) |
| **Dashboards** | |
| `dashboard-hub` | **NEW!** Generate unified dashboard hub with all dashboards |
| `performance-dashboard` | Generate performance dashboard |
| `security-dashboard` | Generate security dashboard |
| `accessibility-dashboard` | Generate accessibility dashboard |
| `seo-dashboard` | Generate SEO dashboard |
| `bundle-dashboard` | Generate bundle dashboard |
| `baseline-dashboard` | Generate baseline compatibility dashboard |
| `dashboard` | Generate real-time monitoring dashboard |
| **Analysis** | |
| `performance` | Performance analysis and optimization |
| `security` | Security vulnerability analysis |
| `accessibility` | Accessibility compliance analysis |
| `seo` | SEO optimization analysis |
| `bundle` | Bundle analysis and optimization |
| **Monitoring** | |
| `monitor` | Start real-time monitoring |
| `interactive` | Interactive mode with watch |
| **Utilities** | |
| `features` | List available features |
| `migration` | Generate migration guide |
| `polyfills` | Get polyfill recommendations |

## 📊 Supported File Types

- **JavaScript** (.js, .jsx, .mjs, .cjs)
- **TypeScript** (.ts, .tsx)
- **HTML** (.html, .htm)
- **CSS** (.css, .scss, .sass, .less)
- **JSON** (.json)

## 🎯 Use Cases

### **Web Development**
- Ensure cross-browser compatibility
- Optimize performance and bundle size
- Maintain accessibility standards
- Improve SEO rankings

### **Code Review**
- Automated compatibility checking
- Security vulnerability detection
- Performance bottleneck identification
- Code quality assessment

### **CI/CD Integration**
- Pre-commit hooks
- Automated testing
- Performance monitoring
- Security scanning

### **Migration Projects**
- Legacy code modernization
- Feature compatibility assessment
- Migration planning and execution
- Risk assessment

## 🔌 VS Code Extension

### 🎉 **Now Available on VS Code Marketplace!**

Get the full power of Baseline Check Tool directly in your editor with zero setup required!

[![Install VS Code Extension](https://img.shields.io/badge/Install-VS%20Code%20Extension-blue?logo=visual-studio-code&style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=rasike-a.baseline-check-tool)

### **Extension Features:**
- ✅ **Zero Setup** - Self-contained, works immediately after install
- ✅ **12 Commands** - Full analysis suite in Command Palette
- ✅ **7 Dashboards** - Beautiful interactive dashboards with navigation
- ✅ **Real-time Monitoring** - File watching with auto-analysis
- ✅ **Notification Buttons** - Quick access to dashboards
- ✅ **Clickable Links** - Dashboard links in Output panel
- ✅ **Code Snippets** - Baseline-compatible code snippets
- ✅ **Status Bar** - Quick scan access
- ✅ **Sidebar Panel** - Live results display

### **Quick Install:**
```bash
# From command line
code --install-extension rasike-a.baseline-check-tool

# Or search "Baseline Check Tool" in VS Code Extensions
```

### **Usage in VS Code:**
1. Open any web project
2. `Cmd+Shift+P` → "Baseline Check: Scan"
3. Click "View Dashboard" button
4. Explore interactive dashboards!

### **Extension Commands:**
- `Baseline Check: Scan for Baseline Compatibility`
- `Baseline Check: Run Full Analysis`
- `Baseline Check: Performance Analysis`
- `Baseline Check: Security Analysis`
- `Baseline Check: Accessibility Analysis`
- `Baseline Check: SEO Analysis`
- `Baseline Check: Bundle Analysis`
- `Baseline Check: Open Dashboard`
- `Baseline Check: Start Real-time Monitoring`
- `Baseline Check: Fix Issues Automatically`
- And more!

---

## 🔗 Other Integrations

### **GitHub Actions**
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
      - run: baseline-check analyze
```

### **Docker**
```dockerfile
FROM node:18-alpine
RUN npm install -g baseline-check-tool
WORKDIR /app
COPY . .
RUN baseline-check analyze
```

## 📈 Performance

- **Fast Analysis** - Optimized for speed with smart caching
- **Low Memory Usage** - Efficient memory management
- **Concurrent Processing** - Parallel file analysis
- **Smart Caching** - Incremental analysis with cache invalidation

## 🛠️ Development

### **Contributing**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### **Testing**
```bash
# Run all tests
npm test

# Run specific test suite
npm test -- --grep "Performance"

# Run tests with coverage
npm run test:coverage
```

### **Building**
```bash
# Build the project
npm run build

# Watch mode for development
npm run watch
```

## 📄 API Reference

### **Programmatic Usage**
```javascript
import { BaselineChecker } from 'baseline-check-tool';

const checker = new BaselineChecker({
  patterns: ['**/*.js', '**/*.css'],
  performance: { enabled: true },
  security: { enabled: true }
});

// Run analysis
const results = await checker.analyze('./src');

// Get specific analysis
const performance = await checker.performance('./src');
const security = await checker.security('./src');
```

## 🆘 Support

- **Documentation**: [GitHub Wiki](https://github.com/rasike-a/baseline-check/wiki)
- **Issues**: [GitHub Issues](https://github.com/rasike-a/baseline-check/issues)
- **Discussions**: [GitHub Discussions](https://github.com/rasike-a/baseline-check/discussions)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🏆 Recognition

This tool was created for the **Devpost Baseline Tooling Hackathon** and represents the cutting edge of web development tooling.

---

**Made with ❤️ for the web development community**
# 🚀 Quick Start Guide

Get up and running with baseline-check in under 5 minutes!

## 📦 **Installation**

### **Option 1: One-time usage (Recommended)**
```bash
npx baseline-check init
npx baseline-check run
```

### **Option 2: Global installation**
```bash
npm install -g baseline-check
baseline-check init
baseline-check run
```

### **Option 3: Project dependency**
```bash
npm install --save-dev baseline-check
npx baseline-check init
npx baseline-check run
```

## ⚡ **Quick Commands**

```bash
# Initialize configuration
baseline-check init

# Run complete scan and check
baseline-check run

# Scan only (no compatibility check)
baseline-check scan --paths "src"

# Check compatibility only
baseline-check check --report "baseline-report.json"

# Generate summary report
baseline-check report --format html

# Get smart recommendations
baseline-check analyze --report "baseline-report.json"

# View analytics
baseline-check analytics

# Setup for specific framework
baseline-check setup --framework react --github-action
```

## 🎯 **Framework Setup**

### **React/Next.js**
```bash
baseline-check setup --framework react --github-action --vscode
```

### **Vue/Nuxt.js**
```bash
baseline-check setup --framework vue --github-action --vscode
```

### **Angular**
```bash
baseline-check setup --framework angular --github-action --vscode
```

## 📊 **What You Get**

### **1. Compatibility Report**
- ✅ **Baseline-like**: Features with good browser support
- ⚠️ **Risky**: Features that may cause compatibility issues
- ❓ **Unknown**: Features with unknown compatibility

### **2. Smart Recommendations**
- Alternative approaches for risky features
- Polyfill suggestions
- Framework-specific advice

### **3. Analytics Dashboard**
- Feature usage trends over time
- Risk and adoption scores
- Performance metrics

### **4. GitHub Integration**
- Automatic PR comments
- CI/CD pipeline integration
- Artifact storage

## 🔧 **Configuration**

Create `baseline-check.config.js`:
```javascript
export default {
  patterns: ['**/*.{js,ts,jsx,tsx,css,html}'],
  ignore: ['**/node_modules/**', '**/dist/**'],
  baseline: {
    minBrowsers: 3,
    browsers: ['chrome', 'firefox', 'safari', 'edge']
  },
  performance: {
    cacheResults: true,
    concurrentFiles: 10
  }
};
```

## 🚀 **GitHub Actions**

Add to `.github/workflows/baseline-check.yml`:
```yaml
name: Baseline Check
on: [pull_request, push]
jobs:
  baseline:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install -g baseline-check
      - run: baseline-check run --paths "src"
```

## 📈 **Advanced Features**

### **Caching**
```bash
# View cache stats
baseline-check cache --stats

# Clear cache
baseline-check cache --clear
```

### **Analytics**
```bash
# View 30-day trends
baseline-check analytics --days 30

# Export analytics report
baseline-check analytics --out "analytics-report.md"
```

### **Custom Features**
```javascript
// baseline-check.config.js
export default {
  features: {
    'my-custom-feature': {
      re: /myCustomPattern/g,
      category: 'api'
    }
  }
};
```

## 🆘 **Troubleshooting**

### **Common Issues**

**"Command not found"**
```bash
# Make sure it's installed globally
npm install -g baseline-check

# Or use npx
npx baseline-check --help
```

**"No features found"**
```bash
# Check your patterns
baseline-check scan --paths "src" --verbose

# Update configuration
baseline-check init --force
```

**"Permission denied"**
```bash
# Use npx instead of global install
npx baseline-check run
```

### **Getting Help**

- 📖 **Documentation**: [Full Guide](README.md)
- 🐛 **Issues**: [GitHub Issues](https://github.com/baseline-check/baseline-check/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/baseline-check/baseline-check/discussions)

## 🎉 **Next Steps**

1. **Run your first scan**: `npx baseline-check run`
2. **Set up framework integration**: `npx baseline-check setup --framework react`
3. **Add to CI/CD**: Follow GitHub Actions guide
4. **Customize configuration**: Edit `baseline-check.config.js`
5. **Monitor trends**: Use `baseline-check analytics`

**Happy coding!** 🚀

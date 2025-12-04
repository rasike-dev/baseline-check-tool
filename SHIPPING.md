# 🚀 Shipping Guide: Baseline Check Tool

This guide covers all the ways to distribute and ship the baseline check tool to users.

## 📦 **Distribution Methods**

### **1. NPM Package (Primary)**

#### **Publishing to NPM**
```bash
# 1. Login to NPM
npm login

# 2. Test the package locally
npm pack
npm install -g baseline-check-2.0.0.tgz

# 3. Publish to NPM
npm publish

# 4. Verify installation
npx baseline-check --version
```

#### **Users can install via:**
```bash
# Global installation
npm install -g baseline-check

# Local project installation
npm install --save-dev baseline-check

# One-time usage
npx baseline-check init
```

### **2. GitHub Releases**

#### **Create Release Assets**
```bash
# 1. Build distribution files
npm run build  # (if you add a build step)

# 2. Create release archive
tar -czf baseline-check-v2.0.0.tar.gz action/
zip -r baseline-check-v2.0.0.zip action/

# 3. Upload to GitHub Releases
gh release create v2.0.0 \
  baseline-check-v2.0.0.tar.gz \
  baseline-check-v2.0.0.zip \
  --title "Baseline Check v2.0.0" \
  --notes "Major release with analytics, caching, and framework integrations"
```

### **3. Docker Container**

#### **Create Dockerfile**
```dockerfile
FROM node:20-alpine

WORKDIR /app
COPY action/package*.json ./
RUN npm ci --only=production

COPY action/src ./src
COPY action/dashboard ./dashboard

RUN npm install -g .

EXPOSE 3000

CMD ["baseline-check", "--help"]
```

#### **Build and Push**
```bash
# Build image
docker build -t baseline-check:2.0.0 .

# Push to registry
docker tag baseline-check:2.0.0 your-registry/baseline-check:2.0.0
docker push your-registry/baseline-check:2.0.0

# Users can run with:
docker run --rm -v $(pwd):/workspace baseline-check:2.0.0 scan --paths /workspace
```

### **4. GitHub Actions Marketplace**

#### **Create Action Metadata**
```yaml
# action.yml
name: 'Baseline Check'
description: 'Check web features for baseline browser compatibility'
author: 'Baseline Check Team'
branding:
  icon: 'check-circle'
  color: 'blue'
inputs:
  paths:
    description: 'Paths to scan'
    required: false
    default: '.'
  config:
    description: 'Config file path'
    required: false
runs:
  using: 'node20'
  main: 'action/src/cli.js'
```

#### **Publish to Marketplace**
1. Create a release with `action.yml`
2. Submit to GitHub Actions Marketplace
3. Users can use in workflows:

```yaml
- uses: baseline-check/action@v2
  with:
    paths: 'src'
    config: 'baseline-check.config.js'
```

### **5. Homebrew (macOS)**

#### **Create Formula**
```ruby
# baseline-check.rb
class BaselineCheck < Formula
  desc "Check web features for baseline browser compatibility"
  homepage "https://github.com/baseline-check/baseline-check"
  url "https://github.com/baseline-check/baseline-check/archive/v2.0.0.tar.gz"
  sha256 "your-sha256-hash"
  license "MIT"

  depends_on "node"

  def install
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    system "#{bin}/baseline-check", "--version"
  end
end
```

### **6. Chocolatey (Windows)**

#### **Create Package**
```xml
<!-- baseline-check.nuspec -->
<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://schemas.microsoft.com/packaging/2015/06/nuspec.xsd">
  <metadata>
    <id>baseline-check</id>
    <version>2.0.0</version>
    <title>Baseline Check</title>
    <authors>Baseline Check Team</authors>
    <description>Check web features for baseline browser compatibility</description>
    <licenseUrl>https://github.com/baseline-check/baseline-check/blob/main/LICENSE</licenseUrl>
    <projectUrl>https://github.com/baseline-check/baseline-check</projectUrl>
  </metadata>
  <files>
    <file src="action/**" target="tools" />
  </files>
</package>
```

## 🔧 **Pre-Release Checklist**

### **Code Quality**
- [ ] All tests pass (`npm test`)
- [ ] No linting errors
- [ ] Code coverage > 80%
- [ ] Documentation updated

### **Package Quality**
- [ ] Version bumped in package.json
- [ ] CHANGELOG.md updated
- [ ] README.md current
- [ ] LICENSE file included
- [ ] All dependencies up to date

### **Testing**
- [ ] Test on multiple Node.js versions (18, 20, 21)
- [ ] Test on different operating systems
- [ ] Test installation methods
- [ ] Test CLI commands
- [ ] Test framework integrations

### **Documentation**
- [ ] Installation instructions
- [ ] Usage examples
- [ ] API documentation
- [ ] Troubleshooting guide
- [ ] Migration guide (if major version)

## 📊 **Release Strategy**

### **Versioning (Semantic Versioning)**
- **Major (X.0.0)**: Breaking changes
- **Minor (X.Y.0)**: New features, backward compatible
- **Patch (X.Y.Z)**: Bug fixes, backward compatible

### **Release Channels**
1. **Alpha**: `2.0.0-alpha.1` - Early testing
2. **Beta**: `2.0.0-beta.1` - Feature complete, testing
3. **RC**: `2.0.0-rc.1` - Release candidate
4. **Stable**: `2.0.0` - Production ready

### **Release Schedule**
- **Major**: Every 6 months
- **Minor**: Every 2 months
- **Patch**: As needed (bug fixes)

## 🚀 **Deployment Pipeline**

### **GitHub Actions Workflow**
```yaml
name: Release
on:
  push:
    tags: ['v*']

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Publish to NPM
        run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      
      - name: Create GitHub Release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
          body: |
            ## What's New
            - Smart recommendations engine
            - Analytics and trend tracking
            - Framework integrations
            - Enhanced CLI with progress bars
          draft: false
          prerelease: false
```

## 📈 **Post-Release**

### **Monitoring**
- [ ] Monitor NPM download stats
- [ ] Track GitHub stars and forks
- [ ] Monitor issue reports
- [ ] Check user feedback

### **Support**
- [ ] Respond to issues within 24 hours
- [ ] Update documentation based on feedback
- [ ] Plan next release features
- [ ] Community engagement

## 🎯 **Success Metrics**

- **Downloads**: Target 10K+ weekly downloads
- **Stars**: Target 1K+ GitHub stars
- **Issues**: < 5 open issues at any time
- **Performance**: < 10s scan time for typical projects
- **Adoption**: Used in 100+ public repositories

---

**Ready to ship?** Start with NPM publishing and gradually expand to other distribution methods based on user demand!

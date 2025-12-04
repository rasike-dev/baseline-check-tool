# VS Code Extension Migration Guide

This guide helps you move the Baseline Check Tool VS Code extension to a separate repository.

## 📋 Pre-Migration Checklist

- [ ] Create new GitHub repository for the VS Code extension
- [ ] Ensure `baseline-check-tool` npm package is published and accessible
- [ ] Backup current extension code
- [ ] Review current dependencies

## 🗂️ Files to Move to New Repository

### Essential Files (Required)
```
vscode-extension/
├── package.json              # Extension manifest
├── package-lock.json         # Dependency lock file
├── tsconfig.json             # TypeScript configuration
├── webpack.config.js         # Webpack bundling config
├── .vscodeignore             # Files to exclude from package
├── icon.png                  # Extension icon
├── LICENSE                   # License file
├── README.md                 # Extension documentation
├── MARKETPLACE_README.md     # Marketplace-specific README
├── CHANGELOG.md              # Version history
├── src/
│   ├── extension.ts          # Main extension code
│   ├── webviewProvider.ts   # Webview provider
│   └── test/                 # Test files
├── snippets/                 # Code snippets
└── scripts/
    └── build.js              # Build script (needs update)
```

### Files to Remove (Not Needed in New Repo)
```
vscode-extension/
├── src/baseline-check/       # ❌ Remove - use npm package instead
├── demo-project/             # ❌ Remove - too large for repo
├── baseline-check-tool-*.vsix # ❌ Remove - build artifacts
├── out/                      # ❌ Remove - build output
├── dist/                     # ❌ Remove - build output
└── node_modules/             # ❌ Remove - will be installed fresh
```

## 🔧 Required Changes

### 1. Update `package.json`

Update repository URLs:
```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/baseline-check-vscode.git"
  },
  "homepage": "https://github.com/YOUR_USERNAME/baseline-check-vscode#readme",
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/baseline-check-vscode/issues"
  }
}
```

### 2. Update Build Script

The `scripts/build.js` currently copies baseline-check source code. Since we're using the npm package, this can be simplified or removed.

**Option A: Remove build script entirely** (if not needed)
```json
{
  "scripts": {
    "build": "npm run compile && npm run bundle"
  }
}
```

**Option B: Keep for future use** (if you need custom builds)
Update to only handle extension-specific build tasks.

### 3. Remove Bundled Code

Delete the `src/baseline-check/` directory entirely. The extension should only use the npm package:
- `baseline-check-tool` from `node_modules`
- Or project's local installation
- Or global installation

### 4. Update `.vscodeignore`

Ensure it excludes:
- `src/baseline-check/` (if not already removed)
- `demo-project/`
- Build artifacts
- Development files

### 5. Create `.gitignore`

Create a new `.gitignore` for the extension repository:
```
# Dependencies
node_modules/

# Build outputs
out/
dist/
*.vsix

# TypeScript
*.tsbuildinfo

# Logs
*.log
npm-debug.log*

# OS
.DS_Store
Thumbs.db

# IDE
.vscode-test/
.idea/

# Test results
coverage/
.nyc_output/

# Environment
.env
.env.local

# Demo project (if kept)
demo-project/
```

### 6. Update README.md

Update repository references:
- Change GitHub URLs to new repository
- Update installation instructions if needed
- Update contribution guidelines

### 7. Update Extension Code

The extension already uses the npm package correctly. Verify:
- `extension.ts` looks for `baseline-check-tool` in `node_modules`
- No imports from `src/baseline-check/`
- All paths reference the npm package

## 📦 Migration Steps

### Step 1: Prepare New Repository

```bash
# Create new directory
mkdir baseline-check-vscode
cd baseline-check-vscode
git init

# Create initial structure
mkdir -p src/test/suite
mkdir snippets
mkdir scripts
```

### Step 2: Copy Essential Files

```bash
# From the current repository
cp action/vscode-extension/package.json .
cp action/vscode-extension/tsconfig.json .
cp action/vscode-extension/webpack.config.js .
cp action/vscode-extension/.vscodeignore .
cp action/vscode-extension/icon.png .
cp action/vscode-extension/LICENSE .
cp action/vscode-extension/README.md .
cp action/vscode-extension/MARKETPLACE_README.md .
cp action/vscode-extension/CHANGELOG.md .

# Copy source files
cp -r action/vscode-extension/src/* src/
# Remove bundled baseline-check code
rm -rf src/baseline-check/

# Copy snippets
cp -r action/vscode-extension/snippets/* snippets/

# Copy scripts (if needed)
cp action/vscode-extension/scripts/* scripts/
```

### Step 3: Clean Up Files

```bash
# Remove bundled code references
# (Already done if you removed src/baseline-check/)

# Update build script
# Edit scripts/build.js to remove file copying logic
```

### Step 4: Update Configuration Files

1. Update `package.json` with new repository URLs
2. Create `.gitignore` (see template above)
3. Update `.vscodeignore` if needed
4. Update `README.md` with new repository links

### Step 5: Install Dependencies

```bash
npm install
```

### Step 6: Test Build

```bash
# Compile TypeScript
npm run compile

# Bundle with Webpack
npm run bundle

# Package extension
npm run package
```

### Step 7: Verify Extension Works

1. Open VS Code
2. Install the `.vsix` file locally
3. Test all commands
4. Verify dashboard generation works
5. Check that baseline-check-tool is found correctly

### Step 8: Commit and Push

```bash
git add .
git commit -m "Initial commit: VS Code extension for Baseline Check Tool"
git remote add origin https://github.com/YOUR_USERNAME/baseline-check-vscode.git
git push -u origin main
```

## 🔗 Maintaining Connection to NPM Package

The extension depends on `baseline-check-tool` npm package. To update:

1. **Update dependency version** in `package.json`:
   ```json
   {
     "dependencies": {
       "baseline-check-tool": "^2.3.2"
     }
   }
   ```

2. **Run npm install**:
   ```bash
   npm install
   ```

3. **Test the extension** with the new version

4. **Update extension version** in `package.json`:
   ```json
   {
     "version": "2.5.0"
   }
   ```

5. **Update CHANGELOG.md** with changes

## 📝 Post-Migration Checklist

- [ ] Extension builds successfully
- [ ] All commands work correctly
- [ ] Dashboard generation works
- [ ] Extension finds baseline-check-tool npm package
- [ ] Tests pass
- [ ] README updated with new repository links
- [ ] Package.json has correct repository URLs
- [ ] .gitignore configured properly
- [ ] Extension can be packaged as .vsix
- [ ] Extension can be published to marketplace

## 🚀 Publishing to Marketplace

After migration, publishing remains the same:

```bash
# Install vsce if not already installed
npm install -g @vscode/vsce

# Package extension
npm run package

# Publish (requires Personal Access Token)
vsce publish
```

## 📚 Additional Resources

- [VS Code Extension Publishing Guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [VS Code Extension API](https://code.visualstudio.com/api)
- [baseline-check-tool npm package](https://www.npmjs.com/package/baseline-check-tool)

## ⚠️ Important Notes

1. **Keep npm package updated**: The extension depends on `baseline-check-tool`. Keep it updated for latest features.

2. **Version synchronization**: Consider syncing major versions between the extension and npm package for clarity.

3. **Breaking changes**: If the npm package has breaking changes, update the extension code accordingly.

4. **Testing**: Always test the extension after updating the npm package dependency.

5. **Documentation**: Keep README and CHANGELOG updated with each release.


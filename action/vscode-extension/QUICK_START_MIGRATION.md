# Quick Start: Migration to New Repository

## 🚀 Fast Migration (5 minutes)

### Step 1: Create New Repository
```bash
# On GitHub, create a new repository named: baseline-check-vscode
# (or any name you prefer)
```

### Step 2: Run Migration Script
```bash
cd action/vscode-extension
./migrate-to-new-repo.sh ../baseline-check-vscode
```

### Step 3: Update Repository URLs
```bash
cd ../baseline-check-vscode

# Edit package.json and update:
# - repository.url
# - homepage
# - bugs.url
# 
# Replace: https://github.com/rasike-a/baseline-check.git
# With:    https://github.com/YOUR_USERNAME/baseline-check-vscode.git
```

### Step 4: Update Build Script
```bash
# Edit package.json, change build script from:
# "build": "node scripts/build.js && npm run compile && npm run bundle"
# To:
# "build": "npm run compile && npm run bundle"
```

### Step 5: Install Dependencies
```bash
npm install
```

### Step 6: Test Build
```bash
npm run build
npm run package
```

### Step 7: Commit and Push
```bash
git add .
git commit -m "Initial commit: VS Code extension for Baseline Check Tool"
git remote add origin https://github.com/YOUR_USERNAME/baseline-check-vscode.git
git push -u origin main
```

## ✅ Verification Checklist

- [ ] Extension builds without errors
- [ ] `.vsix` file is created
- [ ] Extension installs in VS Code
- [ ] All commands work
- [ ] Dashboard generation works
- [ ] Extension finds `baseline-check-tool` npm package

## 📝 What Changed?

1. **Removed bundled code**: `src/baseline-check/` directory removed
2. **Simplified build**: No more file copying from parent repo
3. **Standalone repo**: Extension is now independent
4. **Uses npm package**: Extension depends on `baseline-check-tool` from npm

## 🔗 Maintaining Connection

The extension will automatically use the `baseline-check-tool` npm package. To update:

1. Update version in `package.json`:
   ```json
   "baseline-check-tool": "^2.3.2"
   ```

2. Run `npm install`

3. Test and publish new extension version

## 📚 Need More Details?

See `MIGRATION_GUIDE.md` for comprehensive instructions.


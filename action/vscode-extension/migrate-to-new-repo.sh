#!/bin/bash

# Migration script to prepare VS Code extension for new repository
# Usage: ./migrate-to-new-repo.sh [NEW_REPO_PATH]

set -e

NEW_REPO_PATH="${1:-../baseline-check-vscode}"

echo "🚀 Starting VS Code Extension Migration"
echo "📁 Target directory: $NEW_REPO_PATH"
echo ""

# Create new directory if it doesn't exist
if [ ! -d "$NEW_REPO_PATH" ]; then
    echo "📦 Creating new repository directory..."
    mkdir -p "$NEW_REPO_PATH"
    cd "$NEW_REPO_PATH"
    git init
    echo "✅ Repository initialized"
    cd - > /dev/null
fi

echo "📋 Copying essential files..."

# Copy essential files
cp package.json "$NEW_REPO_PATH/"
cp package-lock.json "$NEW_REPO_PATH/" 2>/dev/null || echo "⚠️  package-lock.json not found (will be generated)"
cp tsconfig.json "$NEW_REPO_PATH/"
cp webpack.config.js "$NEW_REPO_PATH/"
cp .vscodeignore "$NEW_REPO_PATH/"
cp icon.png "$NEW_REPO_PATH/"
cp LICENSE "$NEW_REPO_PATH/"
cp README.md "$NEW_REPO_PATH/"
cp MARKETPLACE_README.md "$NEW_REPO_PATH/"
cp CHANGELOG.md "$NEW_REPO_PATH/"

# Copy source files (excluding bundled baseline-check)
echo "📂 Copying source files..."
mkdir -p "$NEW_REPO_PATH/src"
cp -r src/extension.ts "$NEW_REPO_PATH/src/" 2>/dev/null || true
cp -r src/webviewProvider.ts "$NEW_REPO_PATH/src/" 2>/dev/null || true
if [ -d "src/test" ]; then
    cp -r src/test "$NEW_REPO_PATH/src/"
fi

# Remove bundled baseline-check code if it exists
if [ -d "$NEW_REPO_PATH/src/baseline-check" ]; then
    echo "🗑️  Removing bundled baseline-check code..."
    rm -rf "$NEW_REPO_PATH/src/baseline-check"
fi

# Copy snippets
echo "📝 Copying snippets..."
mkdir -p "$NEW_REPO_PATH/snippets"
cp -r snippets/* "$NEW_REPO_PATH/snippets/" 2>/dev/null || true

# Copy scripts (will be updated)
echo "🔧 Copying scripts..."
mkdir -p "$NEW_REPO_PATH/scripts"
if [ -f "scripts/build.js" ]; then
    cp scripts/build.js "$NEW_REPO_PATH/scripts/"
fi

# Create .gitignore
echo "📄 Creating .gitignore..."
cat > "$NEW_REPO_PATH/.gitignore" << 'EOF'
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
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db
._*

# IDE
.vscode-test/
.idea/
*.swp
*.swo
*~

# Test results
coverage/
.nyc_output/

# Environment
.env
.env.local
.env.*.local

# Demo project
demo-project/

# Temporary files
*.tmp
*.temp
EOF

# Copy migration guide
cp MIGRATION_GUIDE.md "$NEW_REPO_PATH/" 2>/dev/null || true

echo ""
echo "✅ Files copied successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Update package.json with new repository URLs"
echo "2. Update scripts/build.js to remove file copying (or remove it)"
echo "3. Update README.md with new repository links"
echo "4. Run 'npm install' in the new directory"
echo "5. Test the build: 'npm run build'"
echo "6. Commit and push to new repository"
echo ""
echo "📚 See MIGRATION_GUIDE.md for detailed instructions"


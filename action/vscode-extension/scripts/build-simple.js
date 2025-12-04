// Simplified build script for standalone repository
// This version doesn't copy baseline-check source code
// since we use the npm package instead

const path = require('path');

console.log('🔨 Building VS Code Extension...');
console.log('📦 Using baseline-check-tool from npm package');
console.log('✅ Build script completed (no file copying needed)');

// This script can be extended for other build tasks if needed
// For now, the main build is handled by:
// - npm run compile (TypeScript compilation)
// - npm run bundle (Webpack bundling)


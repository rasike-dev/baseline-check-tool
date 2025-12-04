const fs = require('fs');
const path = require('path');

// Copy the main baseline-check tool to the extension
const sourceDir = path.join(__dirname, '..', '..', 'src');
const targetDir = path.join(__dirname, '..', 'src', 'baseline-check');

// Create target directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// Copy essential files
const filesToCopy = [
    'cli.js',
    'scan.js',
    'check.js',
    'dashboard-generator.js',
    'features',
    'performance',
    'security',
    'accessibility',
    'seo',
    'bundle',
    'baseline',
    'ai',
    'monitoring'
];

filesToCopy.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    
    if (fs.existsSync(sourcePath)) {
        if (fs.statSync(sourcePath).isDirectory()) {
            copyDir(sourcePath, targetPath);
        } else {
            copyFile(sourcePath, targetPath);
        }
    }
});

function copyFile(source, target) {
    fs.copyFileSync(source, target);
    console.log(`Copied: ${path.relative(__dirname, source)} -> ${path.relative(__dirname, target)}`);
}

function copyDir(source, target) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }
    
    const files = fs.readdirSync(source);
    files.forEach(file => {
        const sourcePath = path.join(source, file);
        const targetPath = path.join(target, file);
        
        if (fs.statSync(sourcePath).isDirectory()) {
            copyDir(sourcePath, targetPath);
        } else {
            copyFile(sourcePath, targetPath);
        }
    });
}

console.log('Build completed: Baseline Check Tool files copied to extension');

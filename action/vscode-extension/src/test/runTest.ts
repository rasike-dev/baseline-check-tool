import * as path from 'path';
import Mocha from 'mocha';

// Create the mocha test
const mocha = new Mocha({
    ui: 'tdd',
    color: true
});

const testsRoot = path.resolve(__dirname);

// Find test files
const findTestFiles = (dir: string): string[] => {
    const files: string[] = [];
    const items = require('fs').readdirSync(dir);
    
    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = require('fs').statSync(fullPath);
        
        if (stat.isDirectory()) {
            files.push(...findTestFiles(fullPath));
        } else if (item.endsWith('.test.js')) {
            files.push(fullPath);
        }
    }
    
    return files;
};

const files = findTestFiles(testsRoot);

// Add files to the test suite
files.forEach(f => mocha.addFile(f));

// Run the mocha test
mocha.run((failures: number) => {
    if (failures > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
});

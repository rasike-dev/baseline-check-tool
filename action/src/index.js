// Main exports for baseline-check
export { scan } from './scan.js';
export { check } from './check.js';
export { generateSummary } from './reporters/summary.js';
export { loadConfig, validateConfig, createDefaultConfigFile } from './config.js';

// Re-export for backward compatibility
export { scan as scanFiles } from './scan.js';
export { check as checkCompatibility } from './check.js';
export { generateSummary as generateReport } from './reporters/summary.js';

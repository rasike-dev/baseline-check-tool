import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_CONFIG = {
  patterns: [
    '**/*.{js,ts,tsx,jsx,css,html}',
    '**/*.vue',
    '**/*.svelte'
  ],
  ignore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.git/**',
    '**/coverage/**',
    '**/.next/**',
    '**/out/**'
  ],
  features: {},
  baseline: {
    minBrowsers: 3,
    browsers: ['chrome', 'firefox', 'safari', 'edge']
  },
  performance: {
    maxFileSize: 1024 * 1024, // 1MB
    concurrentFiles: 10,
    cacheResults: true
  }
};

export async function loadConfig(configPath) {
  if (!configPath) {
    // Look for config files in common locations
    const configFiles = [
      'baseline-check.config.js',
      'baseline-check.config.mjs',
      '.baseline-check.js',
      '.baseline-check.mjs'
    ];
    
    for (const file of configFiles) {
      if (fs.existsSync(file)) {
        configPath = file;
        break;
      }
    }
  }

  if (!configPath || !fs.existsSync(configPath)) {
    return DEFAULT_CONFIG;
  }

  try {
    const config = await import(path.resolve(configPath));
    const userConfig = config.default || config;
    
    // Merge with defaults
    return mergeConfig(DEFAULT_CONFIG, userConfig);
  } catch (error) {
    console.warn(`Warning: Could not load config from ${configPath}: ${error.message}`);
    return DEFAULT_CONFIG;
  }
}

function mergeConfig(defaultConfig, userConfig) {
  const merged = { ...defaultConfig };
  
  // Merge patterns
  if (userConfig.patterns) {
    merged.patterns = Array.isArray(userConfig.patterns) 
      ? userConfig.patterns 
      : defaultConfig.patterns;
  }
  
  // Merge ignore patterns
  if (userConfig.ignore) {
    merged.ignore = Array.isArray(userConfig.ignore)
      ? [...defaultConfig.ignore, ...userConfig.ignore]
      : defaultConfig.ignore;
  }
  
  // Merge features and convert regex strings back to RegExp objects
  if (userConfig.features) {
    const convertedFeatures = {};
    for (const [name, feature] of Object.entries(userConfig.features)) {
      // Skip features with invalid regex patterns
      if (feature.re && typeof feature.re === 'object' && Object.keys(feature.re).length === 0) {
        console.warn(`Warning: Skipping feature "${name}" - invalid regex pattern`);
        continue;
      }
      
      convertedFeatures[name] = {
        ...feature,
        re: typeof feature.re === 'string' 
          ? new RegExp(feature.re.replace(/^\/|\/[gimuy]*$/g, ''), 'g') 
          : feature.re
      };
    }
    merged.features = { ...defaultConfig.features, ...convertedFeatures };
  }
  
  // Merge baseline settings
  if (userConfig.baseline) {
    merged.baseline = { ...defaultConfig.baseline, ...userConfig.baseline };
  }
  
  // Merge performance settings
  if (userConfig.performance) {
    merged.performance = { ...defaultConfig.performance, ...userConfig.performance };
  }
  
  return merged;
}

export function validateConfig(config) {
  const errors = [];
  
  if (!Array.isArray(config.patterns)) {
    errors.push('patterns must be an array');
  }
  
  if (!Array.isArray(config.ignore)) {
    errors.push('ignore must be an array');
  }
  
  if (typeof config.baseline.minBrowsers !== 'number' || config.baseline.minBrowsers < 1) {
    errors.push('baseline.minBrowsers must be a positive number');
  }
  
  if (!Array.isArray(config.baseline.browsers)) {
    errors.push('baseline.browsers must be an array');
  }
  
  if (config.performance.maxFileSize <= 0) {
    errors.push('performance.maxFileSize must be positive');
  }
  
  if (config.performance.concurrentFiles <= 0) {
    errors.push('performance.concurrentFiles must be positive');
  }
  
  return errors;
}

export function createDefaultConfigFile(filePath = 'baseline-check.config.js') {
  const configContent = `export default {
  // File patterns to scan
  patterns: [
    '**/*.{js,ts,tsx,jsx,css,html}',
    '**/*.vue',
    '**/*.svelte'
  ],
  
  // Directories to ignore
  ignore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.git/**',
    '**/coverage/**',
    '**/.next/**',
    '**/out/**'
  ],
  
  // Custom feature detection rules
  features: {
    // Add custom regex patterns here
    // 'custom-feature': { 
    //   re: /customPattern/g, 
    //   category: 'api' 
    // }
  },
  
  // Browser support thresholds
  baseline: {
    minBrowsers: 3, // Minimum number of browsers for baseline status
    browsers: ['chrome', 'firefox', 'safari', 'edge']
  },
  
  // Performance settings
  performance: {
    maxFileSize: 1024 * 1024, // 1MB max file size
    concurrentFiles: 10, // Process files concurrently
    cacheResults: true // Cache scan results
  }
};`;

  try {
    fs.writeFileSync(filePath, configContent);
    return true;
  } catch (error) {
    console.error(`Failed to create config file: ${error.message}`);
    return false;
  }
}

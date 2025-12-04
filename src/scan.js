// Baseline feature scanner with comprehensive error handling and performance optimizations
import { globby } from "globby";
import fs from "node:fs";
import path from "node:path";
import { loadConfig, validateConfig } from "./config.js";
import { CacheManager } from "./cache.js";
import { AnalyticsEngine } from "./analytics.js";
import { ProgressBar, Logger } from "./ui.js";
import { createFeatureDetector } from "./features/index.js";

// Performance optimization: Process files in batches
async function processFilesInBatches(files, features, config, add, featureDetector) {
  const batchSize = config.performance?.concurrentFiles || 10;
  const maxFileSize = config.performance?.maxFileSize || 1024 * 1024; // 1MB
  let processedFiles = 0;
  let errorCount = 0;
  let skippedFiles = 0;

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (file) => {
      try {
        // Check file size before reading
        const stats = fs.statSync(file);
        if (stats.size > maxFileSize) {
          console.warn(`Warning: Skipping large file ${file} (${Math.round(stats.size / 1024)}KB)`);
          skippedFiles++;
          return;
        }

        const txt = fs.readFileSync(file, "utf8");
        
        // Use enhanced feature detection
        const detectedFeatures = featureDetector.detectFeatures(txt, file);
        
        // Add detected features to results
        detectedFeatures.forEach(feature => {
          add(feature.name, file);
        });
        
        processedFiles++;
      } catch (error) {
        console.warn(`Warning: Could not read file ${file}: ${error.message}`);
        errorCount++;
      }
    });

    await Promise.all(batchPromises);
    
    // Progress indicator for large codebases
    if (files.length > 100) {
      const progress = Math.round(((i + batchSize) / files.length) * 100);
      process.stdout.write(`\rProcessing files... ${Math.min(progress, 100)}%`);
    }
  }

  if (files.length > 100) {
    console.log(); // New line after progress indicator
  }

  return { processedFiles, errorCount, skippedFiles };
}

// Main scan function
export async function scan(options = {}) {
  const roots = (options.paths || ".").split(",");
  const out = options.out || "baseline-report.json";
  const config = await loadConfig(options.config);
  const logger = new Logger({ verbose: options.verbose, quiet: options.quiet });
  const cache = new CacheManager();
  const analytics = new AnalyticsEngine();
  
  // Validate configuration
  const configErrors = validateConfig(config);
  if (configErrors.length > 0) {
    logger.warning("Configuration warnings:");
    configErrors.forEach(error => logger.warning(`  - ${error}`));
  }

  const startTime = Date.now();
  
  // Check cache first
  if (config.performance?.cacheResults) {
    const cacheKey = cache.getCacheKey(roots, config);
    const cachedResult = cache.getCachedResult(cacheKey);
    
    if (cachedResult) {
      logger.info("Using cached results");
      return cachedResult;
    }
  }

  // Validate paths exist
  for (const root of roots) {
    if (!fs.existsSync(root)) {
      throw new Error(`Path "${root}" does not exist`);
    }
  }

  // Use config patterns or defaults
  const patterns = config?.patterns || ['**/*.{js,ts,tsx,jsx,css,html}'];
  const ignore = config?.ignore || ["**/node_modules/**", "**/dist/**", "**/build/**", "**/.git/**"];

  // Enhanced file scanning with error handling
  let files = [];
  try {
    files = await globby(roots.flatMap(r => patterns.map(p => `${r}/${p}`)), { ignore });
  } catch (error) {
    throw new Error(`Error scanning files: ${error.message}`);
  }

  if (files.length === 0) {
    console.warn("Warning: No files found matching the specified patterns");
  }

  const candidates = new Map();
  const add = (feature, where) => {
    if (!feature) return;
    const arr = candidates.get(feature) || [];
    arr.push(where);
    candidates.set(feature, arr);
  };

  // Create enhanced feature detector
  const featureDetector = createFeatureDetector(config?.featurePreset || 'default');
  
  // Add original baseline features for backward compatibility
  const originalFeatures = {
    // Web APIs
    "window.fetch": { re: /\bfetch\(/g, category: "api" },
    "navigator.clipboard.writeText": { re: /navigator\.clipboard\.writeText\b/g, category: "api" },
    "navigator.clipboard.readText": { re: /navigator\.clipboard\.readText\b/g, category: "api" },
    "WebSocket": { re: /\bnew\s+WebSocket\(/g, category: "api" },
    "dialog.element": { re: /<dialog\b/gi, category: "html" },
    "details.element": { re: /<details\b/gi, category: "html" },
    "summary.element": { re: /<summary\b/gi, category: "html" },
    "IntersectionObserver": { re: /\bnew\s+IntersectionObserver\(/g, category: "api" },
    "ResizeObserver": { re: /\bnew\s+ResizeObserver\(/g, category: "api" },
    "MutationObserver": { re: /\bnew\s+MutationObserver\(/g, category: "api" },
    "requestAnimationFrame": { re: /\brequestAnimationFrame\(/g, category: "api" },
    "requestIdleCallback": { re: /\brequestIdleCallback\(/g, category: "api" },
    "URL.createObjectURL": { re: /URL\.createObjectURL\(/g, category: "api" },
    "URL.revokeObjectURL": { re: /URL\.revokeObjectURL\(/g, category: "api" },
    "AbortController": { re: /\bnew\s+AbortController\(/g, category: "api" },
    "AbortSignal": { re: /\bAbortSignal\b/g, category: "api" },
    "Promise.allSettled": { re: /Promise\.allSettled\(/g, category: "api" },
    "Promise.any": { re: /Promise\.any\(/g, category: "api" },
    "BigInt": { re: /\bBigInt\(/g, category: "api" },
    "Optional chaining": { re: /\?\./g, category: "syntax" },
    "Nullish coalescing": { re: /\?\?/g, category: "syntax" },
    "Dynamic import": { re: /import\s*\(/g, category: "syntax" },
    "Top-level await": { re: /^\s*await\s+/gm, category: "syntax" },
    
    // CSS Features
    "css.has_pseudo": { re: /:has\(/g, category: "css" },
    "css.container_queries": { re: /@container\b/g, category: "css" },
    "css.grid": { re: /display\s*:\s*grid/g, category: "css" },
    "css.flexbox": { re: /display\s*:\s*flex/g, category: "css" },
    "css.custom_properties": { re: /var\(--/g, category: "css" },
    "css.clamp": { re: /clamp\(/g, category: "css" },
    "css.min_max": { re: /min\(|max\(/g, category: "css" },
    "css.logical_properties": { re: /margin-(inline|block)|padding-(inline|block)|border-(inline|block)/g, category: "css" },
    "css.backdrop_filter": { re: /backdrop-filter\s*:/g, category: "css" },
    "css.scroll_behavior": { re: /scroll-behavior\s*:/g, category: "css" }
  };
  
  // Add original features to detector
  Object.entries(originalFeatures).forEach(([name, config]) => {
    featureDetector.addCustomFeature(name, config);
  });
  
  // Add custom features from config
  if (config?.features) {
    Object.entries(config.features).forEach(([name, featureConfig]) => {
      featureDetector.addCustomFeature(name, featureConfig);
    });
  }
  
  // Get all features for processing
  const features = featureDetector.getAllFeatures();
  const featureList = Object.entries(features).map(([name, config]) => ({ name, ...config }));

  // Enhanced file processing with performance optimizations
  const { processedFiles, errorCount, skippedFiles } = await processFilesInBatches(
    files, 
    featureList, 
    config, 
    add,
    featureDetector
  );

  console.log(`Processed ${processedFiles} files${errorCount > 0 ? ` (${errorCount} errors)` : ""}${skippedFiles > 0 ? ` (${skippedFiles} skipped)` : ""}`);

  // Generate comprehensive report
  const report = {
    metadata: {
      scannedFiles: files.length,
      processedFiles,
      errorCount,
      skippedFiles: skippedFiles || 0,
      generatedAt: new Date().toISOString(),
      version: "2.0.0",
      config: {
        patterns: config.patterns,
        ignore: config.ignore,
        performance: config.performance
      }
    },
    detected: Array.from(candidates.entries()).map(([feature, files]) => ({ 
      feature, 
      files,
      count: files.length
    }))
  };

  // Ensure output directory exists
  const outDir = path.dirname(out);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  try {
    fs.writeFileSync(out, JSON.stringify(report, null, 2));
    logger.success(`Generated baseline report: ${out}`);
    logger.info(`Found ${report.detected.length} unique features across ${report.metadata.processedFiles} files`);
    
    // Cache the result
    if (config.performance?.cacheResults) {
      const cacheKey = cache.getCacheKey(roots, config);
      cache.setCachedResult(cacheKey, report);
    }
    
    // Record analytics (temporarily disabled)
    // try {
    //   if (config.performance?.cacheResults !== false) {
    //     analytics.recordScan(report, {
    //       paths: roots,
    //       config: options.config,
    //       duration: Date.now() - startTime
    //     });
    //   }
    // } catch (error) {
    //   // Analytics is optional, don't fail the scan
    //   console.warn('Analytics recording failed:', error.message);
    // }
    
    return report;
  } catch (error) {
    throw new Error(`Error writing report to ${out}: ${error.message}`);
  }
}

// CLI interface for backward compatibility
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = new Map();
  const argv = process.argv.slice(2);
  
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].replace(/^--/, "");
      const value = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : true;
      args.set(key, value);
      if (typeof value === "string") i++;
    }
  }
  
  const options = {
    paths: args.get("paths") || ".",
    out: args.get("out") || "baseline-report.json",
    config: args.get("config")
  };
  
  try {
    await scan(options);
  } catch (error) {
    console.error(`Scan failed: ${error.message}`);
    process.exit(1);
  }
}

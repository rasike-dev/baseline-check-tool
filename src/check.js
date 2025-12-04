import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Load browser compatibility data
let bcd;
try {
  // Try multiple possible locations for BCD data
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  const possiblePaths = [
    // When installed as package
    path.resolve(__dirname, "../node_modules/@mdn/browser-compat-data/data.json"),
    // When installed globally
    path.resolve(process.cwd(), "node_modules/@mdn/browser-compat-data/data.json"),
    // When using npx
    path.resolve(process.cwd(), "../node_modules/@mdn/browser-compat-data/data.json"),
    // When using npx from different directory
    path.resolve(process.cwd(), "../../node_modules/@mdn/browser-compat-data/data.json"),
    // When installed globally
    path.resolve("/usr/local/lib/node_modules/@mdn/browser-compat-data/data.json"),
    // When installed in user directory
    path.resolve(process.env.HOME + "/.npm-global/lib/node_modules/@mdn/browser-compat-data/data.json")
  ];
  
  let bcdPath = null;
  for (const testPath of possiblePaths) {
    try {
      if (fs.existsSync(testPath)) {
        bcdPath = testPath;
        break;
      }
    } catch (e) {
      // Continue to next path
    }
  }
  
  if (bcdPath) {
    bcd = JSON.parse(fs.readFileSync(bcdPath, "utf8"));
  } else {
    throw new Error("BCD data not found in any expected location");
  }
} catch (error) {
  console.warn("Warning: Could not load browser compatibility data:", error.message);
  bcd = {};
}

// Main check function
export async function check(options = {}) {
  const inFile = options.report;
  const outFile = options.out || inFile;

  // Validate input file
  if (!inFile) {
    throw new Error("Report file is required");
  }

  if (!fs.existsSync(inFile)) {
    throw new Error(`Report file "${inFile}" does not exist`);
  }

  let report;
  try {
    report = JSON.parse(fs.readFileSync(inFile, "utf8"));
  } catch (error) {
    throw new Error(`Error reading report file: ${error.message}`);
  }

  function supportOf(featurePath) {
    // Enhanced feature mapping with more comprehensive coverage
    const featureMap = {
      // Web APIs
      "window.fetch": bcd.api?.fetch,
      "navigator.clipboard.writeText": bcd.api?.Clipboard?.writeText,
      "navigator.clipboard.readText": bcd.api?.Clipboard?.readText,
      "WebSocket": bcd.api?.WebSocket,
      "IntersectionObserver": bcd.api?.IntersectionObserver,
      "ResizeObserver": bcd.api?.ResizeObserver,
      "MutationObserver": bcd.api?.MutationObserver,
      "requestAnimationFrame": bcd.api?.Window?.requestAnimationFrame,
      "requestIdleCallback": bcd.api?.Window?.requestIdleCallback,
      "URL.createObjectURL": bcd.api?.URL?.createObjectURL,
      "URL.revokeObjectURL": bcd.api?.URL?.revokeObjectURL,
      "AbortController": bcd.api?.AbortController,
      "AbortSignal": bcd.api?.AbortSignal,
      "Promise.allSettled": bcd.javascript?.builtins?.Promise?.allSettled,
      "Promise.any": bcd.javascript?.builtins?.Promise?.any,
      "BigInt": bcd.javascript?.builtins?.BigInt,
      
      // HTML Elements
      "dialog.element": bcd.html?.elements?.dialog,
      "details.element": bcd.html?.elements?.details,
      "summary.element": bcd.html?.elements?.summary,
      
      // CSS Features
      "css.has_pseudo": bcd.css?.selectors?.has,
      "css.container_queries": bcd.css?.at_rules?.container,
      "css.grid": bcd.css?.properties?.display?.grid,
      "css.flexbox": bcd.css?.properties?.display?.flex,
      "css.custom_properties": bcd.css?.properties?.custom_property,
      "css.clamp": bcd.css?.types?.clamp,
      "css.min_max": bcd.css?.types?.min_max,
      "css.logical_properties": bcd.css?.properties?.margin_inline_start,
      "css.backdrop_filter": bcd.css?.properties?.backdrop_filter,
      "css.scroll_behavior": bcd.css?.properties?.scroll_behavior,
      
      // JavaScript Syntax
      "Optional chaining": bcd.javascript?.operators?.optional_chaining,
      "Nullish coalescing": bcd.javascript?.operators?.nullish_coalescing,
      "Dynamic import": bcd.javascript?.statements?.import?.dynamic_import,
      "Top-level await": bcd.javascript?.statements?.await?.top_level_await
    };

    const node = featureMap[featurePath];
    if (!node) return null;
    
    // Handle different BCD data structures
    if (node.__compat) return node.__compat;
    if (typeof node === 'object' && node.support) return node;
    
    return node;
  }

  function isBaselineLike(compat) {
    if (!compat?.support) return false;
    const s = compat.support;
    
    const checkBrowser = (browser) => {
      const v = s[browser];
      if (!v) return false;
      const arr = Array.isArray(v) ? v : [v];
      return arr.some(e => e.version_added && !e.version_removed);
    };
    
    // Check major browsers for baseline support
    const chrome = checkBrowser("chrome");
    const firefox = checkBrowser("firefox");
    const safari = checkBrowser("safari");
    const edge = checkBrowser("edge");
    
    // Consider it baseline if supported in at least 3 major browsers
    const supportedBrowsers = [chrome, firefox, safari, edge].filter(Boolean).length;
    return supportedBrowsers >= 3;
  }

  function getSupportInfo(compat) {
    if (!compat?.support) return { status: "unknown", browsers: {} };
    
    const browsers = {};
    const support = compat.support;
    
    for (const [browser, data] of Object.entries(support)) {
      if (Array.isArray(data)) {
        browsers[browser] = data.map(d => ({
          version: d.version_added,
          removed: d.version_removed
        }));
      } else if (data.version_added) {
        browsers[browser] = [{
          version: data.version_added,
          removed: data.version_removed
        }];
      }
    }
    
    const status = isBaselineLike(compat) ? "baseline_like" : "risky";
    return { status, browsers };
  }

  // Process detected features
  console.log("🔍 Checking browser compatibility...");
  let processedFeatures = 0;
  let unknownFeatures = 0;

  const results = report.detected.map(({ feature, files, count }) => {
    const compat = supportOf(feature);
    let result = { 
      feature, 
      files, 
      count,
      status: "unknown",
      mdn: null,
      browsers: {}
    };
    
    if (compat) {
      const supportInfo = getSupportInfo(compat);
      result.status = supportInfo.status;
      result.browsers = supportInfo.browsers;
      result.mdn = compat.mdn_url;
    } else {
      unknownFeatures++;
    }
    
    processedFeatures++;
    return result;
  });

  // Update report structure
  report.results = results;
  report.metadata = {
    ...report.metadata,
    processedFeatures,
    unknownFeatures,
    compatibilityCheckedAt: new Date().toISOString()
  };

  // Ensure output directory exists
  const outDir = path.dirname(outFile);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  try {
    fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
    console.log(`✅ Updated report with compatibility data: ${outFile}`);
    console.log(`📊 Processed ${processedFeatures} features (${unknownFeatures} unknown)`);
    return report;
  } catch (error) {
    throw new Error(`Error writing compatibility report: ${error.message}`);
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
    report: args.get("report"),
    out: args.get("out")
  };
  
  if (!options.report) {
    console.error("Error: --report argument is required");
    console.error("Usage: node check.js --report <input-file> [--out <output-file>]");
    process.exit(1);
  }
  
  try {
    await check(options);
  } catch (error) {
    console.error(`Check failed: ${error.message}`);
    process.exit(1);
  }
}

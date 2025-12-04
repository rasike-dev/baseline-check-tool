/**
 * Bundle Analysis Tests
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { BundleAnalysis } from '../src/bundle/index.js';

describe('Bundle Analysis', () => {
  let bundleAnalysis;
  let testDir;

  beforeEach(() => {
    bundleAnalysis = new BundleAnalysis();
    testDir = 'test-bundle-temp';
    
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('BundleAnalyzer', () => {
    test('should detect bundle not found', async () => {
      const results = await bundleAnalysis.analyzeBundle('non-existent-bundle.js');
      
      assert.ok(results.issues.length > 0);
      const notFoundIssue = results.issues.find(issue => issue.type === 'bundle_not_found');
      assert.ok(notFoundIssue);
      assert.strictEqual(notFoundIssue.severity, 'high');
    });

    test('should detect unminified bundle', async () => {
      const bundleContent = `
        function calculateTotal(items) {
          let total = 0;
          for (let i = 0; i < items.length; i++) {
            total += items[i].price;
          }
          return total;
        }
        
        console.log('Bundle loaded');
      `;
      
      const bundleFile = path.join(testDir, 'bundle.js');
      fs.writeFileSync(bundleFile, bundleContent);
      
      const results = await bundleAnalysis.analyzeBundle(bundleFile);
      
      const unminifiedIssue = results.issues.find(issue => issue.type === 'unminified_bundle');
      assert.ok(unminifiedIssue);
      assert.strictEqual(unminifiedIssue.severity, 'high');
    });

    test('should detect bundle too large', async () => {
      // Create a large bundle (over 250KB)
      const largeContent = 'x'.repeat(300 * 1024);
      const bundleFile = path.join(testDir, 'large-bundle.js');
      fs.writeFileSync(bundleFile, largeContent);
      
      const results = await bundleAnalysis.analyzeBundle(bundleFile);
      
      const tooLargeIssue = results.issues.find(issue => issue.type === 'bundle_too_large');
      assert.ok(tooLargeIssue);
      assert.strictEqual(tooLargeIssue.severity, 'high');
    });

    test('should detect source maps in production', async () => {
      const bundleContent = `
        function test() { return 'test'; }
        //# sourceMappingURL=bundle.js.map
      `;
      
      const bundleFile = path.join(testDir, 'bundle.js');
      fs.writeFileSync(bundleFile, bundleContent);
      
      const results = await bundleAnalysis.analyzeBundle(bundleFile);
      
      const sourceMapsIssue = results.issues.find(issue => issue.type === 'source_maps_in_production');
      assert.ok(sourceMapsIssue);
      assert.strictEqual(sourceMapsIssue.severity, 'medium');
    });

    test('should detect too many dependencies', async () => {
      const bundleContent = Array.from({ length: 60 }, (_, i) => 
        `import { func${i} } from 'lib${i}';`
      ).join('\n');
      
      const bundleFile = path.join(testDir, 'bundle.js');
      fs.writeFileSync(bundleFile, bundleContent);
      
      const results = await bundleAnalysis.analyzeBundle(bundleFile);
      
      const tooManyDepsIssue = results.issues.find(issue => issue.type === 'too_many_dependencies');
      assert.ok(tooManyDepsIssue);
      assert.strictEqual(tooManyDepsIssue.severity, 'medium');
    });

    test('should detect large dependencies', async () => {
      const bundleContent = `
        import { debounce } from 'lodash';
        import { Component } from 'react';
        import { createApp } from 'vue';
      `;
      
      const bundleFile = path.join(testDir, 'bundle.js');
      fs.writeFileSync(bundleFile, bundleContent);
      
      const results = await bundleAnalysis.analyzeBundle(bundleFile);
      
      const largeDepIssue = results.issues.find(issue => issue.type === 'large_dependency');
      assert.ok(largeDepIssue);
      assert.strictEqual(largeDepIssue.severity, 'medium');
    });

    test('should detect needs code splitting', async () => {
      // Create a bundle that's large enough to need splitting
      const largeContent = 'x'.repeat(150 * 1024);
      const bundleFile = path.join(testDir, 'bundle.js');
      fs.writeFileSync(bundleFile, largeContent);
      
      const results = await bundleAnalysis.analyzeBundle(bundleFile);
      
      const needsSplittingIssue = results.issues.find(issue => issue.type === 'needs_code_splitting');
      assert.ok(needsSplittingIssue);
      assert.strictEqual(needsSplittingIssue.severity, 'high');
    });

    test('should detect no dynamic imports', async () => {
      // Create a bundle that's large enough to trigger the no dynamic imports check
      const bundleContent = 'x'.repeat(60 * 1024) + `
        import { ComponentA } from './ComponentA';
        import { ComponentB } from './ComponentB';
        function test() { return 'test'; }
      `;
      
      const bundleFile = path.join(testDir, 'bundle.js');
      fs.writeFileSync(bundleFile, bundleContent);
      
      const results = await bundleAnalysis.analyzeBundle(bundleFile);
      
      const noDynamicImportsIssue = results.issues.find(issue => issue.type === 'no_dynamic_imports');
      assert.ok(noDynamicImportsIssue);
      assert.strictEqual(noDynamicImportsIssue.severity, 'medium');
    });

    test('should detect unused exports', async () => {
      const bundleContent = `
        export const usedFunction = () => {};
        export const unusedFunction = () => {};
        export const anotherUnusedFunction = () => {};
      `;
      
      const bundleFile = path.join(testDir, 'bundle.js');
      fs.writeFileSync(bundleFile, bundleContent);
      
      const results = await bundleAnalysis.analyzeBundle(bundleFile);
      
      const unusedExportsIssue = results.issues.find(issue => issue.type === 'unused_exports');
      assert.ok(unusedExportsIssue);
      assert.strictEqual(unusedExportsIssue.severity, 'low');
    });

    test('should detect side effects', async () => {
      const bundleContent = `
        console.log('Side effect');
        export const test = () => {};
        document.write('Another side effect');
      `;
      
      const bundleFile = path.join(testDir, 'bundle.js');
      fs.writeFileSync(bundleFile, bundleContent);
      
      const results = await bundleAnalysis.analyzeBundle(bundleFile);
      
      const sideEffectsIssue = results.issues.find(issue => issue.type === 'side_effects_detected');
      assert.ok(sideEffectsIssue);
      assert.strictEqual(sideEffectsIssue.severity, 'low');
    });

    test('should detect no cache busting', async () => {
      const bundleFile = path.join(testDir, 'bundle.js');
      fs.writeFileSync(bundleFile, 'function test() {}');
      
      const results = await bundleAnalysis.analyzeBundle(bundleFile);
      
      const noCacheBustingIssue = results.issues.find(issue => issue.type === 'no_cache_busting');
      assert.ok(noCacheBustingIssue);
      assert.strictEqual(noCacheBustingIssue.severity, 'medium');
    });

    test('should detect performance anti-patterns', async () => {
      const bundleContent = `
        document.write('This is bad');
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '/api', false);
      `;
      
      const bundleFile = path.join(testDir, 'bundle.js');
      fs.writeFileSync(bundleFile, bundleContent);
      
      const results = await bundleAnalysis.analyzeBundle(bundleFile);
      
      const antiPatternIssue = results.issues.find(issue => issue.type === 'performance_anti_pattern');
      assert.ok(antiPatternIssue);
    });

    test('should detect security vulnerabilities', async () => {
      const bundleContent = `
        eval('console.log("bad")');
        element.innerHTML = userInput;
      `;
      
      const bundleFile = path.join(testDir, 'bundle.js');
      fs.writeFileSync(bundleFile, bundleContent);
      
      const results = await bundleAnalysis.analyzeBundle(bundleFile);
      
      const securityIssue = results.issues.find(issue => issue.type === 'security_vulnerability');
      assert.ok(securityIssue);
    });

    test('should detect outdated patterns', async () => {
      const bundleContent = `
        var oldVariable = 'test';
        if (true) {
          function oldFunction() {}
        }
      `;
      
      const bundleFile = path.join(testDir, 'bundle.js');
      fs.writeFileSync(bundleFile, bundleContent);
      
      const results = await bundleAnalysis.analyzeBundle(bundleFile);
      
      const outdatedIssue = results.issues.find(issue => issue.type === 'outdated_pattern');
      assert.ok(outdatedIssue);
      assert.strictEqual(outdatedIssue.severity, 'low');
    });

    test('should calculate bundle score correctly', async () => {
      const bundleFile = path.join(testDir, 'bundle.js');
      fs.writeFileSync(bundleFile, 'function test() {}');
      
      const results = await bundleAnalysis.analyzeBundle(bundleFile);
      
      assert.ok(results.bundleScore >= 0);
      assert.ok(['Excellent', 'Good', 'Fair', 'Poor', 'Critical'].includes(results.bundleLevel));
    });
  });

  describe('BundleRecommendations', () => {
    test('should generate recommendations from analysis', async () => {
      const bundleFile = path.join(testDir, 'bundle.js');
      fs.writeFileSync(bundleFile, 'function test() {}');
      
      const results = await bundleAnalysis.analyzeBundle(bundleFile);
      const recommendations = bundleAnalysis.generateRecommendations(results);
      
      assert.ok(recommendations.critical.length >= 0);
      assert.ok(recommendations.high.length >= 0);
      assert.ok(recommendations.medium.length >= 0);
      assert.ok(recommendations.low.length >= 0);
      assert.ok(recommendations.summary);
    });

    test('should generate critical recommendations for high severity issues', async () => {
      const largeContent = 'x'.repeat(300 * 1024);
      const bundleFile = path.join(testDir, 'bundle.js');
      fs.writeFileSync(bundleFile, largeContent);
      
      const results = await bundleAnalysis.analyzeBundle(bundleFile);
      const recommendations = bundleAnalysis.generateRecommendations(results);
      
      const criticalRecs = recommendations.critical;
      assert.ok(criticalRecs.length > 0);
      
      const sizeRec = criticalRecs.find(rec => rec.title.includes('Reduce Bundle Size'));
      assert.ok(sizeRec);
      assert.strictEqual(sizeRec.priority, 'critical');
    });
  });

  describe('BundleDashboard', () => {
    test('should generate HTML dashboard', async () => {
      const bundleFile = path.join(testDir, 'bundle.js');
      fs.writeFileSync(bundleFile, 'function test() {}');
      
      const results = await bundleAnalysis.analyzeBundle(bundleFile);
      const recommendations = bundleAnalysis.generateRecommendations(results);
      const dashboard = bundleAnalysis.generateDashboard(results, recommendations);
      
      assert.ok(dashboard.includes('<!DOCTYPE html>'));
      assert.ok(dashboard.includes('Bundle Analysis Dashboard'));
      assert.ok(dashboard.includes('Bundle Score'));
      assert.ok(dashboard.includes('Issues'));
    });

    test('should generate different themes', async () => {
      const bundleFile = path.join(testDir, 'bundle.js');
      fs.writeFileSync(bundleFile, 'function test() {}');
      
      const results = await bundleAnalysis.analyzeBundle(bundleFile);
      const recommendations = bundleAnalysis.generateRecommendations(results);
      
      const darkDashboard = bundleAnalysis.generateDashboard(results, recommendations);
      const lightAnalysis = new BundleAnalysis({ dashboard: { theme: 'light' } });
      const lightDashboard = lightAnalysis.generateDashboard(results, recommendations);
      
      assert.ok(darkDashboard.includes('class="dark"'));
      assert.ok(lightDashboard.includes('class="light"'));
    });
  });

  describe('Integration', () => {
    test('should handle files with no bundle issues', async () => {
      const bundleContent = `
        // Minified code
        function a(){return"test"}export{a};
      `;
      
      const bundleFile = path.join(testDir, 'bundle.js');
      fs.writeFileSync(bundleFile, bundleContent);
      
      const results = await bundleAnalysis.analyzeBundle(bundleFile);
      
      assert.ok(results.bundleScore >= 0);
      assert.ok(results.issues.length >= 0);
    });

    test('should handle analysis errors gracefully', async () => {
      const results = await bundleAnalysis.analyzeBundle('non-existent-file.js');
      
      assert.ok(results.issues.length > 0);
      assert.ok(results.bundleScore >= 0);
    });
  });
});

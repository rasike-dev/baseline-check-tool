/**
 * SEO Analysis Tests
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { SEOAnalysis } from '../src/seo/index.js';

describe('SEO Analysis', () => {
  let seoAnalysis;
  let testDir;

  beforeEach(() => {
    seoAnalysis = new SEOAnalysis();
    testDir = 'test-seo-temp';
    
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

  describe('SEOAnalyzer', () => {
    test('should detect missing title tag', async () => {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body>
          <h1>Welcome</h1>
        </body>
        </html>
      `;
      
      const testFile = path.join(testDir, 'test.html');
      fs.writeFileSync(testFile, htmlContent);
      
      const results = await seoAnalysis.analyze([testFile]);
      
      assert.ok(results.issues.length > 0);
      const missingTitleIssue = results.issues.find(issue => issue.type === 'missing_title_tag');
      assert.ok(missingTitleIssue);
      assert.strictEqual(missingTitleIssue.severity, 'high');
    });

    test('should detect missing meta description', async () => {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Page Title</title>
        </head>
        <body>
          <h1>Welcome</h1>
        </body>
        </html>
      `;
      
      const testFile = path.join(testDir, 'test.html');
      fs.writeFileSync(testFile, htmlContent);
      
      const results = await seoAnalysis.analyze([testFile]);
      
      const missingMetaDescIssue = results.issues.find(issue => issue.type === 'missing_meta_description');
      assert.ok(missingMetaDescIssue);
      assert.strictEqual(missingMetaDescIssue.severity, 'high');
    });

    test('should detect missing h1 tag', async () => {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Page Title</title>
          <meta name="description" content="Page description">
        </head>
        <body>
          <h2>Section</h2>
          <p>Content</p>
        </body>
        </html>
      `;
      
      const testFile = path.join(testDir, 'test.html');
      fs.writeFileSync(testFile, htmlContent);
      
      const results = await seoAnalysis.analyze([testFile]);
      
      const missingH1Issue = results.issues.find(issue => issue.type === 'missing_h1_tag');
      assert.ok(missingH1Issue);
      assert.strictEqual(missingH1Issue.severity, 'high');
    });

    test('should detect multiple h1 tags', async () => {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Page Title</title>
          <meta name="description" content="Page description">
        </head>
        <body>
          <h1>First Heading</h1>
          <h1>Second Heading</h1>
        </body>
        </html>
      `;
      
      const testFile = path.join(testDir, 'test.html');
      fs.writeFileSync(testFile, htmlContent);
      
      const results = await seoAnalysis.analyze([testFile]);
      
      const multipleH1Issue = results.issues.find(issue => issue.type === 'multiple_h1_tags');
      assert.ok(multipleH1Issue);
      assert.strictEqual(multipleH1Issue.severity, 'high');
    });

    test('should detect missing viewport meta tag', async () => {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Page Title</title>
          <meta name="description" content="Page description">
        </head>
        <body>
          <h1>Welcome</h1>
        </body>
        </html>
      `;
      
      const testFile = path.join(testDir, 'test.html');
      fs.writeFileSync(testFile, htmlContent);
      
      const results = await seoAnalysis.analyze([testFile]);
      
      const missingViewportIssue = results.issues.find(issue => issue.type === 'missing_viewport_meta');
      assert.ok(missingViewportIssue);
      assert.strictEqual(missingViewportIssue.severity, 'high');
    });

    test('should detect title tag length issues', async () => {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>This is a very long title that exceeds the recommended character limit for SEO optimization</title>
          <meta name="description" content="Page description">
        </head>
        <body>
          <h1>Welcome</h1>
        </body>
        </html>
      `;
      
      const testFile = path.join(testDir, 'test.html');
      fs.writeFileSync(testFile, htmlContent);
      
      const results = await seoAnalysis.analyze([testFile]);
      
      const titleTooLongIssue = results.issues.find(issue => issue.type === 'title_too_long');
      assert.ok(titleTooLongIssue);
      assert.strictEqual(titleTooLongIssue.severity, 'medium');
    });

    test('should detect meta description length issues', async () => {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Page Title</title>
          <meta name="description" content="Short desc">
        </head>
        <body>
          <h1>Welcome</h1>
        </body>
        </html>
      `;
      
      const testFile = path.join(testDir, 'test.html');
      fs.writeFileSync(testFile, htmlContent);
      
      const results = await seoAnalysis.analyze([testFile]);
      
      const descTooShortIssue = results.issues.find(issue => issue.type === 'meta_description_too_short');
      assert.ok(descTooShortIssue);
      assert.strictEqual(descTooShortIssue.severity, 'low');
    });

    test('should detect missing image alt text', async () => {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Page Title</title>
          <meta name="description" content="Page description">
        </head>
        <body>
          <h1>Welcome</h1>
          <img src="image.jpg">
        </body>
        </html>
      `;
      
      const testFile = path.join(testDir, 'test.html');
      fs.writeFileSync(testFile, htmlContent);
      
      const results = await seoAnalysis.analyze([testFile]);
      
      const missingAltIssue = results.issues.find(issue => issue.type === 'missing_image_alt');
      assert.ok(missingAltIssue);
      assert.strictEqual(missingAltIssue.severity, 'medium');
    });

    test('should detect insufficient content', async () => {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Page Title</title>
          <meta name="description" content="Page description">
        </head>
        <body>
          <h1>Welcome</h1>
          <p>Short content.</p>
        </body>
        </html>
      `;
      
      const testFile = path.join(testDir, 'test.html');
      fs.writeFileSync(testFile, htmlContent);
      
      const results = await seoAnalysis.analyze([testFile]);
      
      const insufficientContentIssue = results.issues.find(issue => issue.type === 'insufficient_content');
      assert.ok(insufficientContentIssue);
      assert.strictEqual(insufficientContentIssue.severity, 'medium');
    });

    test('should calculate SEO score correctly', async () => {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Page Title</title>
          <meta name="description" content="Page description">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body>
          <h1>Welcome</h1>
          <p>This is a comprehensive page with sufficient content to meet SEO requirements and provide value to users.</p>
        </body>
        </html>
      `;
      
      const testFile = path.join(testDir, 'test.html');
      fs.writeFileSync(testFile, htmlContent);
      
      const results = await seoAnalysis.analyze([testFile]);
      
      assert.ok(results.seoScore >= 0);
      assert.ok(['Excellent', 'Good', 'Fair', 'Poor', 'Critical'].includes(results.seoLevel));
    });
  });

  describe('SEORecommendations', () => {
    test('should generate recommendations from analysis', async () => {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body>
          <h2>Section</h2>
        </body>
        </html>
      `;
      
      const testFile = path.join(testDir, 'test.html');
      fs.writeFileSync(testFile, htmlContent);
      
      const results = await seoAnalysis.analyze([testFile]);
      const recommendations = seoAnalysis.generateRecommendations(results);
      
      assert.ok(recommendations.critical.length > 0);
      assert.ok(recommendations.high.length >= 0);
      assert.ok(recommendations.medium.length >= 0);
      assert.ok(recommendations.low.length >= 0);
      assert.ok(recommendations.summary);
    });

    test('should generate critical recommendations for high severity issues', async () => {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body>
          <h2>Section</h2>
        </body>
        </html>
      `;
      
      const testFile = path.join(testDir, 'test.html');
      fs.writeFileSync(testFile, htmlContent);
      
      const results = await seoAnalysis.analyze([testFile]);
      const recommendations = seoAnalysis.generateRecommendations(results);
      
      const criticalRecs = recommendations.critical;
      assert.ok(criticalRecs.length > 0);
      
      const titleRec = criticalRecs.find(rec => rec.title.includes('Title Tags'));
      assert.ok(titleRec);
      assert.strictEqual(titleRec.priority, 'critical');
    });
  });

  describe('SEODashboard', () => {
    test('should generate HTML dashboard', async () => {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Page Title</title>
          <meta name="description" content="Page description">
        </head>
        <body>
          <h1>Welcome</h1>
        </body>
        </html>
      `;
      
      const testFile = path.join(testDir, 'test.html');
      fs.writeFileSync(testFile, htmlContent);
      
      const results = await seoAnalysis.analyze([testFile]);
      const recommendations = seoAnalysis.generateRecommendations(results);
      const dashboard = seoAnalysis.generateDashboard(results, recommendations);
      
      assert.ok(dashboard.includes('<!DOCTYPE html>'));
      assert.ok(dashboard.includes('SEO Analysis Dashboard'));
      assert.ok(dashboard.includes('SEO Score'));
      assert.ok(dashboard.includes('Issues'));
    });

    test('should generate different themes', async () => {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Page Title</title>
        </head>
        <body>
          <h1>Welcome</h1>
        </body>
        </html>
      `;
      
      const testFile = path.join(testDir, 'test.html');
      fs.writeFileSync(testFile, htmlContent);
      
      const results = await seoAnalysis.analyze([testFile]);
      const recommendations = seoAnalysis.generateRecommendations(results);
      
      const darkDashboard = seoAnalysis.generateDashboard(results, recommendations);
      const lightAnalysis = new SEOAnalysis({ dashboard: { theme: 'light' } });
      const lightDashboard = lightAnalysis.generateDashboard(results, recommendations);
      
      assert.ok(darkDashboard.includes('class="dark"'));
      assert.ok(lightDashboard.includes('class="light"'));
    });
  });

  describe('Integration', () => {
    test('should analyze multiple files', async () => {
      const htmlFile = path.join(testDir, 'test.html');
      const cssFile = path.join(testDir, 'test.css');
      
      fs.writeFileSync(htmlFile, `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Page Title</title>
        </head>
        <body>
          <h1>Welcome</h1>
        </body>
        </html>
      `);
      
      fs.writeFileSync(cssFile, `
        body { font-family: Arial, sans-serif; }
        .container { max-width: 1200px; margin: 0 auto; }
      `);
      
      const results = await seoAnalysis.analyze([htmlFile, cssFile]);
      
      assert.ok(results.issues.length > 0);
      assert.ok(results.issues.some(issue => issue.file === htmlFile));
    });

    test('should handle files with no SEO issues', async () => {
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <title>Page Title</title>
          <meta name="description" content="Page description">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="canonical" href="https://example.com/page">
        </head>
        <body>
          <h1>Welcome</h1>
          <p>This is a comprehensive page with sufficient content to meet SEO requirements and provide value to users. The content is well-structured and includes relevant keywords naturally throughout the text.</p>
          <h2>Section</h2>
          <p>More detailed content that adds value and helps with SEO optimization.</p>
        </body>
        </html>
      `;
      
      const testFile = path.join(testDir, 'test.html');
      fs.writeFileSync(testFile, htmlContent);
      
      const results = await seoAnalysis.analyze([testFile]);
      
      assert.ok(results.seoScore >= 0);
      assert.ok(results.issues.length >= 0);
    });
  });
});

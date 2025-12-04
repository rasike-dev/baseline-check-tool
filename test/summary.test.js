import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { generateSummary } from '../src/reporters/summary.js';

describe('Summary Reporter', () => {
  const testReportFile = './test-summary-report.json';
  const outputFile = './test-summary-output.md';

  beforeEach(async () => {
    // Create a test report file with results
    const testReport = {
      metadata: {
        scannedFiles: 10,
        processedFiles: 9,
        errorCount: 1,
        generatedAt: new Date().toISOString(),
        version: "2.0.0"
      },
      results: [
        {
          feature: "window.fetch",
          status: "baseline_like",
          files: ["api.js", "utils.js"],
          count: 2,
          mdn: "https://developer.mozilla.org/en-US/docs/Web/API/fetch",
          browsers: {
            chrome: [{ version: "42" }],
            firefox: [{ version: "39" }],
            safari: [{ version: "10.1" }]
          }
        },
        {
          feature: "css.has_pseudo",
          status: "risky",
          files: ["styles.css"],
          count: 1,
          mdn: "https://developer.mozilla.org/en-US/docs/Web/CSS/:has",
          browsers: {
            chrome: [{ version: "105" }],
            firefox: [{ version: "121" }]
          }
        },
        {
          feature: "unknown-feature",
          status: "unknown",
          files: ["test.js"],
          count: 1,
          mdn: null,
          browsers: {}
        }
      ]
    };

    fs.writeFileSync(testReportFile, JSON.stringify(testReport, null, 2));
  });

  afterEach(async () => {
    // Clean up test files
    if (fs.existsSync(testReportFile)) {
      fs.unlinkSync(testReportFile);
    }
    if (fs.existsSync(outputFile)) {
      fs.unlinkSync(outputFile);
    }
  });

  test('should generate markdown summary by default', async () => {
    const result = await generateSummary({
      report: testReportFile
    });

    assert.ok(typeof result === 'string');
    assert.ok(result.includes('# Baseline Compatibility Report'));
    assert.ok(result.includes('## Summary'));
    assert.ok(result.includes('**Scanned files:** 10'));
    assert.ok(result.includes('**Processed files:** 9'));
    assert.ok(result.includes('✅ **Baseline-like:** 1'));
    assert.ok(result.includes('⚠️ **Risky:** 1'));
    assert.ok(result.includes('❓ **Unknown:** 1'));
    assert.ok(result.includes('| Feature | Status | Files | MDN |'));
    assert.ok(result.includes('window.fetch'));
    assert.ok(result.includes('css.has_pseudo'));
    assert.ok(result.includes('unknown-feature'));
  });

  test('should generate JSON format', async () => {
    const result = await generateSummary({
      report: testReportFile,
      format: 'json'
    });

    const parsed = JSON.parse(result);
    assert.ok(parsed.summary);
    assert.ok(parsed.results);
    assert.strictEqual(parsed.summary.scannedFiles, 10);
    assert.strictEqual(parsed.summary.processedFiles, 9);
    assert.strictEqual(parsed.summary.baselineLike, 1);
    assert.strictEqual(parsed.summary.risky, 1);
    assert.strictEqual(parsed.summary.unknown, 1);
    assert.strictEqual(parsed.results.length, 3);
  });

  test('should generate HTML format', async () => {
    const result = await generateSummary({
      report: testReportFile,
      format: 'html'
    });

    assert.ok(typeof result === 'string');
    assert.ok(result.includes('<!DOCTYPE html>'));
    assert.ok(result.includes('<title>Baseline Compatibility Report</title>'));
    assert.ok(result.includes('window.fetch'));
    assert.ok(result.includes('css.has_pseudo'));
    assert.ok(result.includes('unknown-feature'));
  });

  test('should write to output file when specified', async () => {
    await generateSummary({
      report: testReportFile,
      format: 'markdown',
      out: outputFile
    });

    assert.ok(fs.existsSync(outputFile));
    const content = fs.readFileSync(outputFile, 'utf8');
    assert.ok(content.includes('# Baseline Compatibility Report'));
  });

  test('should handle missing report file', async () => {
    try {
      await generateSummary({
        report: './non-existent-report.json'
      });
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.ok(error.message.includes('does not exist'));
    }
  });

  test('should handle invalid JSON in report file', async () => {
    fs.writeFileSync(testReportFile, 'invalid json content');

    try {
      await generateSummary({
        report: testReportFile
      });
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.ok(error.message.includes('Error reading report file'));
    }
  });

  test('should handle empty results array', async () => {
    const emptyReport = {
      metadata: {
        scannedFiles: 0,
        processedFiles: 0,
        errorCount: 0,
        generatedAt: new Date().toISOString(),
        version: "2.0.0"
      },
      results: []
    };

    fs.writeFileSync(testReportFile, JSON.stringify(emptyReport, null, 2));

    const result = await generateSummary({
      report: testReportFile,
      format: 'markdown'
    });

    assert.ok(result.includes('✅ **Baseline-like:** 0'));
    assert.ok(result.includes('⚠️ **Risky:** 0'));
    assert.ok(result.includes('❓ **Unknown:** 0'));
  });

  test('should handle missing metadata gracefully', async () => {
    const minimalReport = {
      results: [
        {
          feature: "test-feature",
          status: "baseline_like",
          files: ["test.js"],
          count: 1,
          mdn: null,
          browsers: {}
        }
      ]
    };

    fs.writeFileSync(testReportFile, JSON.stringify(minimalReport, null, 2));

    const result = await generateSummary({
      report: testReportFile,
      format: 'markdown'
    });

    assert.ok(result.includes('**Scanned files:** 0'));
    assert.ok(result.includes('**Processed files:** 0'));
  });
});

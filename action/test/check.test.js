import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { check } from '../src/check.js';

describe('Check Module', () => {
  const testReportFile = './test-report.json';
  const outputFile = './test-check-output.json';

  beforeEach(async () => {
    // Create a test report file
    const testReport = {
      metadata: {
        scannedFiles: 2,
        processedFiles: 2,
        errorCount: 0,
        generatedAt: new Date().toISOString(),
        version: "2.0.0"
      },
      detected: [
        {
          feature: "window.fetch",
          files: ["test1.js", "test2.js"],
          count: 2
        },
        {
          feature: "WebSocket",
          files: ["test1.js"],
          count: 1
        },
        {
          feature: "css.has_pseudo",
          files: ["styles.css"],
          count: 1
        },
        {
          feature: "unknown-feature",
          files: ["test.js"],
          count: 1
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

  test('should process report and add compatibility data', async () => {
    const result = await check({
      report: testReportFile,
      out: outputFile
    });

    assert.ok(result);
    assert.ok(result.results);
    assert.ok(result.metadata);
    assert.strictEqual(result.results.length, 4);

    // Check that results have compatibility data
    const fetchResult = result.results.find(r => r.feature === 'window.fetch');
    assert.ok(fetchResult);
    assert.ok(fetchResult.status);
    assert.ok(fetchResult.browsers);
    assert.ok(fetchResult.mdn);

    const websocketResult = result.results.find(r => r.feature === 'WebSocket');
    assert.ok(websocketResult);
    assert.ok(websocketResult.status);
    assert.ok(websocketResult.browsers);

    const cssResult = result.results.find(r => r.feature === 'css.has_pseudo');
    assert.ok(cssResult);
    assert.ok(cssResult.status);

    // Unknown feature should have unknown status
    const unknownResult = result.results.find(r => r.feature === 'unknown-feature');
    assert.ok(unknownResult);
    assert.strictEqual(unknownResult.status, 'unknown');
  });

  test('should handle missing report file', async () => {
    try {
      await check({
        report: './non-existent-report.json',
        out: outputFile
      });
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.ok(error.message.includes('does not exist'));
    }
  });

  test('should handle invalid JSON in report file', async () => {
    // Create a file with invalid JSON
    fs.writeFileSync(testReportFile, 'invalid json content');

    try {
      await check({
        report: testReportFile,
        out: outputFile
      });
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.ok(error.message.includes('Error reading report file'));
    }
  });

  test('should handle missing report argument', async () => {
    try {
      await check({
        out: outputFile
      });
      assert.fail('Should have thrown an error');
    } catch (error) {
      assert.ok(error.message.includes('Report file is required'));
    }
  });

  test('should update metadata with compatibility check info', async () => {
    const result = await check({
      report: testReportFile,
      out: outputFile
    });

    assert.ok(result.metadata.compatibilityCheckedAt);
    assert.ok(result.metadata.processedFeatures);
    assert.ok(result.metadata.unknownFeatures !== undefined);
  });

  test('should preserve original report structure', async () => {
    const result = await check({
      report: testReportFile,
      out: outputFile
    });

    // Original metadata should be preserved
    assert.strictEqual(result.metadata.scannedFiles, 2);
    assert.strictEqual(result.metadata.processedFiles, 2);
    assert.strictEqual(result.metadata.errorCount, 0);
    assert.strictEqual(result.metadata.version, "2.0.0");

    // Results should have additional compatibility data
    result.results.forEach(result => {
      assert.ok(result.feature);
      assert.ok(result.files);
      assert.ok(result.count);
      assert.ok(result.status);
      assert.ok(result.browsers);
    });
  });
});

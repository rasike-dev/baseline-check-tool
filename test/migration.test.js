import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { MigrationAssistant } from '../src/baseline/migration-assistant.js';
import { MigrationDashboard } from '../src/baseline/migration-dashboard.js';

describe('Migration Assistant', () => {
  let migrationAssistant;
  let migrationDashboard;
  let testDir;

  before(() => {
    migrationAssistant = new MigrationAssistant();
    migrationDashboard = new MigrationDashboard();
    testDir = 'test-migration-temp';
    fs.mkdirSync(testDir, { recursive: true });
  });

  after(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  test('should generate migration plan for risky features', () => {
    const riskyFeatures = [
      {
        name: 'CSS Grid',
        type: 'css',
        risky: true,
        browserSupport: {
          chrome: { version_added: 57 },
          firefox: { version_added: 52 },
          safari: { version_added: 10.1 },
          edge: { version_added: 16 }
        },
        usage: {
          files: ['test.css'],
          lines: [10, 15, 20],
          context: 'display: grid;'
        }
      },
      {
        name: 'Fetch API',
        type: 'javascript',
        risky: true,
        browserSupport: {
          chrome: { version_added: 42 },
          firefox: { version_added: 39 },
          safari: { version_added: 10.1 },
          edge: { version_added: 14 }
        },
        usage: {
          files: ['test.js'],
          lines: [5, 12],
          context: 'fetch(url)'
        }
      }
    ];

    const analysisResults = {
      browserSupport: {
        features: riskyFeatures
      },
      compliance: {
        scores: {
          overall: 75,
          browserSupport: 80
        }
      }
    };

    const migrationPlan = migrationAssistant.generateMigrationPlan(riskyFeatures, analysisResults);

    assert.ok(migrationPlan);
    assert.ok(migrationPlan.summary);
    assert.ok(migrationPlan.features);
    assert.ok(migrationPlan.recommendations);
    assert.ok(migrationPlan.timeline);

    // Check summary
    assert.strictEqual(migrationPlan.summary.totalFeatures, 2);
    assert.ok(migrationPlan.summary.migrationComplexity);
    assert.ok(migrationPlan.summary.estimatedTime > 0);
    assert.ok(migrationPlan.summary.riskReduction > 0);
    assert.ok(migrationPlan.summary.baselineImprovement > 0);

    // Check features
    assert.strictEqual(migrationPlan.features.length, 2);
    assert.ok(migrationPlan.features[0].feature);
    assert.ok(migrationPlan.features[0].alternatives);
    assert.ok(migrationPlan.features[0].effort);
  });

  test('should generate migration recommendations', () => {
    const riskyFeatures = [
      {
        name: 'CSS Grid',
        type: 'css',
        risky: true,
        usage: {
          files: ['test.css'],
          lines: [10],
          context: 'display: grid;'
        }
      }
    ];

    const analysisResults = {
      browserSupport: {
        features: riskyFeatures
      }
    };

    const migrationPlan = migrationAssistant.generateMigrationPlan(riskyFeatures, analysisResults);

    assert.ok(migrationPlan.recommendations);
    assert.ok(migrationPlan.recommendations.length > 0);

    const recommendation = migrationPlan.recommendations[0];
    assert.ok(recommendation.type);
    assert.ok(recommendation.title);
    assert.ok(recommendation.message);
    assert.ok(recommendation.suggestion);
  });

  test('should generate migration timeline', () => {
    const riskyFeatures = [
      {
        name: 'CSS Grid',
        type: 'css',
        risky: true,
        usage: {
          files: ['test.css'],
          lines: [10],
          context: 'display: grid;'
        }
      },
      {
        name: 'Fetch API',
        type: 'javascript',
        risky: true,
        usage: {
          files: ['test.js'],
          lines: [5],
          context: 'fetch(url)'
        }
      }
    ];

    const analysisResults = {
      browserSupport: {
        features: riskyFeatures
      }
    };

    const migrationPlan = migrationAssistant.generateMigrationPlan(riskyFeatures, analysisResults);

    assert.ok(migrationPlan.timeline);
    assert.ok(migrationPlan.timeline.phases);
    assert.ok(migrationPlan.timeline.phases.length > 0);

    const phase = migrationPlan.timeline.phases[0];
    assert.ok(phase.phase);
    assert.ok(phase.week);
    assert.ok(phase.features);
    assert.ok(phase.description);
  });

  test('should handle empty risky features', () => {
    const riskyFeatures = [];
    const analysisResults = {
      browserSupport: {
        features: []
      }
    };

    const migrationPlan = migrationAssistant.generateMigrationPlan(riskyFeatures, analysisResults);

    assert.ok(migrationPlan);
    assert.strictEqual(migrationPlan.summary.totalFeatures, 0);
    assert.strictEqual(migrationPlan.features.length, 0);
    assert.ok(migrationPlan.recommendations.length >= 0);
  });

  test('should generate migration dashboard', () => {
    const migrationPlan = {
      summary: {
        totalFeatures: 2,
        migrationComplexity: 'medium',
        estimatedTime: 8,
        riskReduction: 75,
        baselineImprovement: 20
      },
      features: [
        {
          name: 'CSS Grid',
          type: 'css',
          migration: {
            from: 'CSS Grid',
            to: 'Flexbox + CSS Grid (progressive enhancement)',
            effort: 'medium',
            impact: 'high'
          },
          alternatives: [
            {
              name: 'Flexbox',
              compatibility: 95,
              performance: 'excellent',
              maintenance: 'low'
            }
          ],
          effort: 'medium'
        }
      ],
      recommendations: [
        {
          priority: 'high',
          description: 'Implement progressive enhancement for CSS Grid',
          steps: ['Add flexbox fallback', 'Test across browsers', 'Monitor usage'],
          codeExamples: [
            {
              before: '.container { display: grid; }',
              after: '.container { display: flex; }\n.container.grid { display: grid; }'
            }
          ]
        }
      ],
      timeline: {
        phases: [
          {
            name: 'Phase 1: Critical Features',
            duration: '2 weeks',
            features: ['CSS Grid'],
            tasks: ['Implement fallbacks', 'Test compatibility']
          }
        ]
      }
    };

    const dashboardHTML = migrationDashboard.generateDashboard(migrationPlan, 'dark');

    assert.ok(dashboardHTML);
    assert.ok(dashboardHTML.includes('Migration Dashboard'));
    assert.ok(dashboardHTML.includes('CSS Grid'));
  });

  test('should support light theme', () => {
    const migrationPlan = {
      summary: {
        totalFeatures: 1,
        migrationComplexity: 'low',
        estimatedTime: 4,
        riskReduction: 50,
        baselineImprovement: 10
      },
      features: [],
      recommendations: [],
      timeline: { phases: [] }
    };

    const dashboardHTML = migrationDashboard.generateDashboard(migrationPlan, 'light');

    assert.ok(dashboardHTML);
    assert.ok(dashboardHTML.includes('Migration Dashboard'));
    assert.ok(dashboardHTML.includes('background: #ffffff'));
  });

  test('should handle missing migration plan data', () => {
    const migrationPlan = {};

    const dashboardHTML = migrationDashboard.generateDashboard(migrationPlan, 'dark');

    assert.ok(dashboardHTML);
    assert.ok(dashboardHTML.includes('Migration Dashboard'));
  });
});

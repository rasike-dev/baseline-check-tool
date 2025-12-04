/**
 * AI-Powered Code Fix Generator
 * Automatically generates and applies code fixes for compatibility issues
 */

import fs from 'node:fs';
import path from 'node:path';

export class AICodeFixer {
  constructor(options = {}) {
    this.options = {
      enableAutoFix: options.enableAutoFix !== false,
      enableBackup: options.enableBackup !== false,
      enableValidation: options.enableValidation !== false,
      maxFileSize: options.maxFileSize || 1024 * 1024, // 1MB
      ...options
    };
    
    this.fixTemplates = this.initializeFixTemplates();
    this.appliedFixes = new Map();
  }

  /**
   * Initialize fix templates for common issues
   */
  initializeFixTemplates() {
    return {
      // CSS fixes
      css: {
        'grid-fallback': {
          pattern: /display:\s*grid/g,
          fix: (match, context) => {
            const indent = match.match(/^(\s*)/)[1];
            return `${indent}display: flex;\n${indent}flex-wrap: wrap;\n\n${indent}@supports (display: grid) {\n${indent}  display: grid;\n${indent}  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n${indent}}`;
          },
          validation: (code) => {
            return code.includes('@supports') && code.includes('display: grid');
          }
        },
        'custom-properties-fallback': {
          pattern: /var\(--([^,)]+)\)/g,
          fix: (match, varName) => {
            const fallbackValue = this.getFallbackValue(varName);
            return `var(--${varName}, ${fallbackValue})`;
          },
          validation: (code) => {
            return !code.match(/var\(--[^,)]+\)(?!\s*,)/);
          }
        },
        'flexbox-ie11': {
          pattern: /display:\s*flex/g,
          fix: (match) => {
            return `display: -ms-flexbox;\n  display: flex;`;
          },
          validation: (code) => {
            return code.includes('-ms-flexbox');
          }
        }
      },

      // JavaScript fixes
      javascript: {
        'async-await-fallback': {
          pattern: /async\s+function\s+(\w+)\s*\([^)]*\)\s*{([^}]+)}/g,
          fix: (match, funcName, body) => {
            return `function ${funcName}() {\n  return new Promise((resolve, reject) => {\n    try {\n      ${body.replace(/await\s+([^;]+);/g, '$1.then(result => {')}\n      resolve();\n    } catch (error) {\n      reject(error);\n    }\n  });\n}`;
          },
          validation: (code) => {
            return !code.includes('async') && !code.includes('await');
          }
        },
        'arrow-functions-ie11': {
          pattern: /(\w+)\s*=>\s*{([^}]+)}/g,
          fix: (match, params, body) => {
            return `function(${params}) {\n  ${body}\n}`;
          },
          validation: (code) => {
            return !code.includes('=>');
          }
        },
        'template-literals-ie11': {
          pattern: /`([^`]*)\$\{([^}]+)\}([^`]*)`/g,
          fix: (match, before, variable, after) => {
            return `"${before}" + ${variable} + "${after}"`;
          },
          validation: (code) => {
            return !code.match(/`[^`]*\$\{/);
          }
        },
        'fetch-api-fallback': {
          pattern: /fetch\s*\(\s*([^)]+)\s*\)/g,
          fix: (match, url) => {
            return `makeRequest(${url})`;
          },
          addHelper: () => {
            return `function makeRequest(url) {\n  return new Promise(function(resolve, reject) {\n    var xhr = new XMLHttpRequest();\n    xhr.open('GET', url);\n    xhr.onload = function() {\n      if (xhr.status === 200) {\n        resolve(JSON.parse(xhr.responseText));\n      } else {\n        reject(new Error('Request failed'));\n      }\n    };\n    xhr.send();\n  });\n}\n\n`;
          },
          validation: (code) => {
            return code.includes('makeRequest') || !code.includes('fetch');
          }
        }
      },

      // HTML fixes
      html: {
        'semantic-elements': {
          pattern: /<div[^>]*class="[^"]*header[^"]*"[^>]*>/g,
          fix: (match) => {
            return match.replace('<div', '<header').replace('</div>', '</header>');
          },
          validation: (code) => {
            return code.includes('<header') && !code.match(/<div[^>]*class="[^"]*header/);
          }
        },
        'form-labels': {
          pattern: /<input([^>]*id="([^"]+)"[^>]*)>/g,
          fix: (match, inputAttrs, id) => {
            const labelText = this.generateLabelText(id);
            return `<label for="${id}">${labelText}</label>\n<input${inputAttrs}>`;
          },
          validation: (code) => {
            return code.includes('<label for=');
          }
        }
      }
    };
  }

  /**
   * Apply fixes to a file
   */
  async applyFixes(filePath, recommendations, options = {}) {
    const results = {
      filePath,
      success: false,
      fixesApplied: [],
      errors: [],
      backupPath: null,
      originalSize: 0,
      newSize: 0
    };

    try {
      // Read file
      const originalCode = fs.readFileSync(filePath, 'utf8');
      results.originalSize = originalCode.length;

      // Check file size
      if (originalCode.length > this.options.maxFileSize) {
        throw new Error(`File too large: ${originalCode.length} bytes`);
      }

      // Create backup
      if (this.options.enableBackup) {
        results.backupPath = await this.createBackup(filePath);
      }

      // Apply fixes
      let modifiedCode = originalCode;
      const fileType = this.getFileType(filePath);
      const templates = this.fixTemplates[fileType] || {};

      for (const recommendation of recommendations) {
        if (recommendation.type && templates[recommendation.pattern]) {
          const fixResult = await this.applyFix(modifiedCode, recommendation, templates[recommendation.pattern]);
          if (fixResult.success) {
            modifiedCode = fixResult.code;
            results.fixesApplied.push({
              pattern: recommendation.pattern,
              message: recommendation.message,
              lines: fixResult.lines
            });
          } else {
            results.errors.push(fixResult.error);
          }
        }
      }

      // Validate fixes
      if (this.options.enableValidation) {
        const validation = this.validateFixes(modifiedCode, fileType);
        if (!validation.valid) {
          results.errors.push(...validation.errors);
        }
      }

      // Write modified code
      if (results.fixesApplied.length > 0) {
        fs.writeFileSync(filePath, modifiedCode, 'utf8');
        results.newSize = modifiedCode.length;
        results.success = true;
      }

      return results;
    } catch (error) {
      results.errors.push(error.message);
      return results;
    }
  }

  /**
   * Apply a single fix
   */
  async applyFix(code, recommendation, template) {
    try {
      const pattern = new RegExp(template.pattern.source, template.pattern.flags);
      const matches = code.match(pattern);
      
      if (!matches) {
        return { success: false, error: 'Pattern not found in code' };
      }

      let modifiedCode = code;
      let lines = [];

      // Apply fix
      modifiedCode = modifiedCode.replace(pattern, (match, ...args) => {
        const lineNumber = this.getLineNumber(code, match);
        lines.push(lineNumber);
        
        if (template.fix) {
          return template.fix(match, ...args);
        }
        return match;
      });

      // Add helper functions if needed
      if (template.addHelper) {
        const helperCode = template.addHelper();
        modifiedCode = helperCode + modifiedCode;
      }

      return {
        success: true,
        code: modifiedCode,
        lines: [...new Set(lines)]
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate smart fixes based on context
   */
  generateSmartFixes(recommendations, context = {}) {
    const smartFixes = [];

    for (const rec of recommendations) {
      const fix = this.generateFixForRecommendation(rec, context);
      if (fix) {
        smartFixes.push(fix);
      }
    }

    return smartFixes;
  }

  /**
   * Generate fix for a specific recommendation
   */
  generateFixForRecommendation(recommendation, context) {
    const fix = {
      id: this.generateFixId(recommendation),
      type: recommendation.type,
      severity: recommendation.severity,
      description: recommendation.message,
      originalCode: recommendation.originalCode || '',
      fixedCode: recommendation.suggestion || '',
      explanation: this.generateFixExplanation(recommendation),
      confidence: recommendation.confidence || 0.8,
      automated: this.canAutoFix(recommendation),
      steps: this.generateFixSteps(recommendation),
      testing: this.generateTestingSteps(recommendation)
    };

    return fix;
  }

  /**
   * Check if a recommendation can be automatically fixed
   */
  canAutoFix(recommendation) {
    const autoFixableTypes = ['compatibility', 'performance', 'accessibility'];
    const autoFixableSeverities = ['high', 'medium'];
    
    return autoFixableTypes.includes(recommendation.type) && 
           autoFixableSeverities.includes(recommendation.severity);
  }

  /**
   * Generate fix explanation
   */
  generateFixExplanation(recommendation) {
    const explanations = {
      compatibility: 'This fix ensures your code works across all target browsers by providing fallbacks or using compatible APIs.',
      performance: 'This optimization improves performance by using more efficient methods or reducing unnecessary operations.',
      accessibility: 'This fix improves accessibility by following WCAG guidelines and making your app usable by everyone.',
      security: 'This fix addresses a security vulnerability that could be exploited by malicious users.',
      modern: 'This update uses modern web standards for better performance and maintainability.'
    };

    return explanations[recommendation.type] || 'This fix improves your code quality and maintainability.';
  }

  /**
   * Generate step-by-step fix instructions
   */
  generateFixSteps(recommendation) {
    const steps = [
      'Identify the problematic code in your file',
      'Review the suggested fix and understand the changes',
      'Replace the old code with the new implementation',
      'Test the fix to ensure it works correctly',
      'Verify the fix works across all target browsers'
    ];

    return steps;
  }

  /**
   * Generate testing steps
   */
  generateTestingSteps(recommendation) {
    return {
      unit: 'Write unit tests to verify the fix works correctly',
      integration: 'Test the fix in the context of your application',
      browser: 'Test across all target browsers to ensure compatibility',
      regression: 'Run existing tests to ensure no regressions were introduced'
    };
  }

  /**
   * Create backup of original file
   */
  async createBackup(filePath) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = `${filePath}.backup.${timestamp}`;
    
    fs.copyFileSync(filePath, backupPath);
    return backupPath;
  }

  /**
   * Validate applied fixes
   */
  validateFixes(code, fileType) {
    const validation = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Check for syntax errors
    if (fileType === 'javascript') {
      try {
        // Basic syntax check
        new Function(code);
      } catch (error) {
        validation.valid = false;
        validation.errors.push(`Syntax error: ${error.message}`);
      }
    }

    // Check for common issues
    if (code.includes('undefined') && code.includes('var ')) {
      validation.warnings.push('Consider using let/const instead of var');
    }

    return validation;
  }

  /**
   * Get fallback value for CSS custom property
   */
  getFallbackValue(varName) {
    const fallbacks = {
      'primary-color': '#007bff',
      'secondary-color': '#6c757d',
      'success-color': '#28a745',
      'danger-color': '#dc3545',
      'warning-color': '#ffc107',
      'info-color': '#17a2b8',
      'font-size': '16px',
      'font-family': 'Arial, sans-serif',
      'border-radius': '4px',
      'box-shadow': '0 2px 4px rgba(0,0,0,0.1)'
    };

    return fallbacks[varName] || 'inherit';
  }

  /**
   * Generate label text for form inputs
   */
  generateLabelText(id) {
    const labelMap = {
      'email': 'Email Address',
      'password': 'Password',
      'username': 'Username',
      'name': 'Full Name',
      'phone': 'Phone Number',
      'address': 'Address',
      'city': 'City',
      'state': 'State',
      'zip': 'ZIP Code',
      'country': 'Country'
    };

    return labelMap[id] || id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ');
  }

  /**
   * Get file type from path
   */
  getFileType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const typeMap = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'javascript',
      '.tsx': 'javascript',
      '.css': 'css',
      '.scss': 'css',
      '.html': 'html',
      '.vue': 'html'
    };
    return typeMap[ext] || 'text';
  }

  /**
   * Get line number for a match
   */
  getLineNumber(code, match) {
    const lines = code.substring(0, code.indexOf(match)).split('\n');
    return lines.length;
  }

  /**
   * Generate unique fix ID
   */
  generateFixId(recommendation) {
    const timestamp = Date.now();
    const type = recommendation.type || 'unknown';
    const hash = this.simpleHash(recommendation.message || '');
    return `fix-${type}-${hash}-${timestamp}`;
  }

  /**
   * Simple hash function
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

export default AICodeFixer;

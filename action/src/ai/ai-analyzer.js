/**
 * AI-Powered Code Analysis Engine
 * Provides intelligent analysis and smart suggestions for web compatibility
 */

import path from 'node:path';

export class AIAnalyzer {
  constructor(options = {}) {
    this.options = {
      model: options.model || 'gpt-3.5-turbo',
      apiKey: options.apiKey || process.env.OPENAI_API_KEY,
      maxTokens: options.maxTokens || 2000,
      temperature: options.temperature || 0.3,
      enableLocalAnalysis: options.enableLocalAnalysis !== false,
      enableCloudAnalysis: options.enableCloudAnalysis !== false,
      ...options
    };
    
    this.localPatterns = this.initializeLocalPatterns();
    this.contextCache = new Map();
  }

  /**
   * Initialize local analysis patterns for offline analysis
   */
  initializeLocalPatterns() {
    return {
      // Performance anti-patterns
      performance: {
        'excessive-dom-queries': {
          pattern: /document\.querySelectorAll\([^)]+\)/g,
          severity: 'medium',
          suggestion: 'Consider caching DOM queries or using more specific selectors',
          fix: 'const elements = document.querySelectorAll(selector); // Cache the result'
        },
        'memory-leaks': {
          pattern: /addEventListener\([^,]+,\s*[^,]+\)(?!.*removeEventListener)/g,
          severity: 'high',
          suggestion: 'Add removeEventListener to prevent memory leaks',
          fix: 'element.removeEventListener(event, handler);'
        },
        'synchronous-operations': {
          pattern: /XMLHttpRequest\.open\([^,]+,\s*[^,]+,\s*false\)/g,
          severity: 'high',
          suggestion: 'Use async operations instead of synchronous XMLHttpRequest',
          fix: 'fetch(url).then(response => response.json())'
        }
      },

      // Accessibility patterns
      accessibility: {
        'missing-alt-text': {
          pattern: /<img(?!.*alt=)[^>]*>/g,
          severity: 'high',
          suggestion: 'Add alt text for better accessibility',
          fix: '<img src="image.jpg" alt="Descriptive text">'
        },
        'missing-aria-labels': {
          pattern: /<button(?!.*aria-label)(?!.*aria-labelledby)[^>]*>/g,
          severity: 'medium',
          suggestion: 'Add aria-label for screen readers',
          fix: '<button aria-label="Close dialog">×</button>'
        },
        'color-contrast': {
          pattern: /color:\s*#[0-9a-fA-F]{3,6}(?!.*\/\*.*contrast)/g,
          severity: 'medium',
          suggestion: 'Ensure sufficient color contrast ratio',
          fix: '/* Check contrast ratio meets WCAG guidelines */'
        }
      },

      // Security patterns
      security: {
        'innerhtml-usage': {
          pattern: /\.innerHTML\s*=/g,
          severity: 'high',
          suggestion: 'Avoid innerHTML with user input to prevent XSS',
          fix: 'element.textContent = userInput; // or use DOMPurify'
        },
        'eval-usage': {
          pattern: /eval\s*\(/g,
          severity: 'critical',
          suggestion: 'Never use eval() as it can execute arbitrary code',
          fix: '// Use JSON.parse() or other safe alternatives'
        },
        'unsafe-urls': {
          pattern: /href\s*=\s*["']javascript:/g,
          severity: 'high',
          suggestion: 'Avoid javascript: URLs for security',
          fix: 'href="#" onclick="handleClick(event); return false;"'
        }
      },

      // Modern web patterns
      modern: {
        'legacy-apis': {
          pattern: /document\.all|window\.event|attachEvent/g,
          severity: 'medium',
          suggestion: 'Use modern APIs instead of legacy ones',
          fix: '// Use document.querySelector() instead of document.all'
        },
        'missing-feature-detection': {
          pattern: /localStorage|sessionStorage|fetch|Promise/g,
          severity: 'low',
          suggestion: 'Add feature detection for better compatibility',
          fix: 'if (typeof Storage !== "undefined") { /* use localStorage */ }'
        },
        'hardcoded-values': {
          pattern: /width:\s*\d+px|height:\s*\d+px/g,
          severity: 'low',
          suggestion: 'Consider using responsive units',
          fix: 'width: 100%; max-width: 300px;'
        }
      }
    };
  }

  /**
   * Analyze code for AI-powered insights
   */
  async analyzeCode(code, filePath, context = {}) {
    const analysis = {
      filePath,
      timestamp: new Date().toISOString(),
      localAnalysis: null,
      cloudAnalysis: null,
      recommendations: [],
      riskScore: 0,
      compatibilityScore: 0,
      performanceScore: 0,
      accessibilityScore: 0,
      securityScore: 0
    };

    try {
      // Run local analysis first
      if (this.options.enableLocalAnalysis) {
        analysis.localAnalysis = await this.runLocalAnalysis(code, filePath, context);
        analysis.recommendations.push(...analysis.localAnalysis.recommendations);
      }

      // Run cloud analysis if API key is available
      if (this.options.enableCloudAnalysis && this.options.apiKey) {
        analysis.cloudAnalysis = await this.runCloudAnalysis(code, filePath, context);
        if (analysis.cloudAnalysis) {
          analysis.recommendations.push(...analysis.cloudAnalysis.recommendations);
        }
      }

      // Calculate scores
      analysis.riskScore = this.calculateRiskScore(analysis.recommendations);
      analysis.compatibilityScore = this.calculateCompatibilityScore(analysis.recommendations);
      analysis.performanceScore = this.calculatePerformanceScore(analysis.recommendations);
      analysis.accessibilityScore = this.calculateAccessibilityScore(analysis.recommendations);
      analysis.securityScore = this.calculateSecurityScore(analysis.recommendations);

      // Sort recommendations by priority
      analysis.recommendations.sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });

      return analysis;
    } catch (error) {
      console.error('AI Analysis failed:', error.message);
      return {
        ...analysis,
        error: error.message,
        recommendations: [{
          type: 'error',
          severity: 'medium',
          message: 'AI analysis failed, using fallback patterns',
          suggestion: 'Check your API configuration or network connection'
        }]
      };
    }
  }

  /**
   * Run local pattern-based analysis
   */
  async runLocalAnalysis(code, filePath, context) {
    const recommendations = [];
    const fileType = this.getFileType(filePath);
    
    // Analyze each category
    for (const [category, patterns] of Object.entries(this.localPatterns)) {
      for (const [patternName, patternData] of Object.entries(patterns)) {
        const matches = code.match(patternData.pattern);
        if (matches) {
          recommendations.push({
            type: 'local',
            category,
            pattern: patternName,
            severity: patternData.severity,
            message: patternData.suggestion,
            suggestion: patternData.fix,
            matches: matches.length,
            lines: this.getLineNumbers(code, patternData.pattern),
            confidence: 0.8
          });
        }
      }
    }

    // Add context-aware recommendations
    const contextRecommendations = this.generateContextRecommendations(code, filePath, context);
    recommendations.push(...contextRecommendations);

    return {
      type: 'local',
      recommendations,
      totalPatterns: Object.keys(this.localPatterns).length,
      matchedPatterns: recommendations.length
    };
  }

  /**
   * Run cloud-based AI analysis
   */
  async runCloudAnalysis(code, filePath, context) {
    if (!this.options.apiKey) {
      return null;
    }

    try {
      const prompt = this.buildAnalysisPrompt(code, filePath, context);
      
      // Simulate API call (replace with actual OpenAI API call)
      const response = await this.callOpenAI(prompt);
      
      return {
        type: 'cloud',
        recommendations: this.parseAIResponse(response),
        model: this.options.model,
        tokens: response.usage?.total_tokens || 0
      };
    } catch (error) {
      console.warn('Cloud analysis failed:', error.message);
      return null;
    }
  }

  /**
   * Build analysis prompt for AI
   */
  buildAnalysisPrompt(code, filePath, context) {
    const fileType = this.getFileType(filePath);
    const codeSnippet = code.substring(0, 2000); // Limit code length

    return `Analyze this ${fileType} code for web compatibility, performance, accessibility, and security issues:

File: ${filePath}
Code:
\`\`\`${fileType}
${codeSnippet}
\`\`\`

Context:
- Target browsers: ${context.browsers?.join(', ') || 'modern browsers'}
- Framework: ${context.framework || 'vanilla'}
- Build tool: ${context.buildTool || 'none'}

Please provide:
1. Compatibility issues with specific browser support
2. Performance optimizations
3. Accessibility improvements
4. Security concerns
5. Modern web standards compliance

Format as JSON with this structure:
{
  "recommendations": [
    {
      "type": "compatibility|performance|accessibility|security|modern",
      "severity": "critical|high|medium|low",
      "message": "Brief description",
      "suggestion": "Specific fix or improvement",
      "confidence": 0.0-1.0,
      "browsers": ["affected browsers"],
      "line": "line number if applicable"
    }
  ]
}`;
  }

  /**
   * Call OpenAI API (simulated)
   */
  async callOpenAI(prompt) {
    // This is a simulation - replace with actual OpenAI API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          choices: [{
            message: {
              content: JSON.stringify({
                recommendations: [
                  {
                    type: 'compatibility',
                    severity: 'medium',
                    message: 'CSS Grid may need fallback for older browsers',
                    suggestion: 'Add @supports not (display: grid) fallback',
                    confidence: 0.9,
                    browsers: ['IE11', 'Safari 10'],
                    line: '15'
                  },
                  {
                    type: 'performance',
                    severity: 'high',
                    message: 'Consider using requestAnimationFrame for animations',
                    suggestion: 'Replace setTimeout with requestAnimationFrame',
                    confidence: 0.95,
                    browsers: ['all'],
                    line: '23'
                  }
                ]
              })
            }
          }],
          usage: { total_tokens: 150 }
        });
      }, 1000);
    });
  }

  /**
   * Parse AI response
   */
  parseAIResponse(response) {
    try {
      const content = response.choices[0].message.content;
      const parsed = JSON.parse(content);
      return parsed.recommendations || [];
    } catch (error) {
      console.warn('Failed to parse AI response:', error.message);
      return [];
    }
  }

  /**
   * Generate context-aware recommendations
   */
  generateContextRecommendations(code, filePath, context) {
    const recommendations = [];
    const fileType = this.getFileType(filePath);

    // Framework-specific recommendations
    if (context.framework === 'react') {
      if (code.includes('componentDidMount') && !code.includes('useEffect')) {
        recommendations.push({
          type: 'modern',
          category: 'react',
          severity: 'medium',
          message: 'Consider migrating to React Hooks',
          suggestion: 'Replace componentDidMount with useEffect hook',
          confidence: 0.8
        });
      }
    }

    // Browser-specific recommendations
    if (context.browsers?.includes('ie11')) {
      if (code.includes('const ') || code.includes('let ')) {
        recommendations.push({
          type: 'compatibility',
          category: 'es6',
          severity: 'high',
          message: 'IE11 doesn\'t support const/let',
          suggestion: 'Use var or add Babel transpilation',
          confidence: 1.0
        });
      }
    }

    return recommendations;
  }

  /**
   * Calculate risk score
   */
  calculateRiskScore(recommendations) {
    const severityWeights = { critical: 4, high: 3, medium: 2, low: 1 };
    const totalWeight = recommendations.reduce((sum, rec) => 
      sum + (severityWeights[rec.severity] || 0), 0);
    return Math.min(100, (totalWeight / recommendations.length) * 25);
  }

  /**
   * Calculate compatibility score
   */
  calculateCompatibilityScore(recommendations) {
    const compatibilityRecs = recommendations.filter(r => r.type === 'compatibility');
    const criticalIssues = compatibilityRecs.filter(r => r.severity === 'critical').length;
    return Math.max(0, 100 - (criticalIssues * 20));
  }

  /**
   * Calculate performance score
   */
  calculatePerformanceScore(recommendations) {
    const performanceRecs = recommendations.filter(r => r.type === 'performance');
    const highIssues = performanceRecs.filter(r => r.severity === 'high').length;
    return Math.max(0, 100 - (highIssues * 15));
  }

  /**
   * Calculate accessibility score
   */
  calculateAccessibilityScore(recommendations) {
    const accessibilityRecs = recommendations.filter(r => r.type === 'accessibility');
    const criticalIssues = accessibilityRecs.filter(r => r.severity === 'critical').length;
    return Math.max(0, 100 - (criticalIssues * 25));
  }

  /**
   * Calculate security score
   */
  calculateSecurityScore(recommendations) {
    const securityRecs = recommendations.filter(r => r.type === 'security');
    const criticalIssues = securityRecs.filter(r => r.severity === 'critical').length;
    return Math.max(0, 100 - (criticalIssues * 30));
  }

  /**
   * Get file type from path
   */
  getFileType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const typeMap = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.css': 'css',
      '.scss': 'scss',
      '.html': 'html',
      '.vue': 'vue'
    };
    return typeMap[ext] || 'text';
  }

  /**
   * Get line numbers for pattern matches
   */
  getLineNumbers(code, pattern) {
    const lines = code.split('\n');
    const lineNumbers = [];
    
    lines.forEach((line, index) => {
      if (pattern.test(line)) {
        lineNumbers.push(index + 1);
      }
    });
    
    return lineNumbers;
  }

  /**
   * Generate smart suggestions based on analysis
   */
  generateSmartSuggestions(analysis) {
    const suggestions = [];
    
    // High-level suggestions
    if (analysis.riskScore > 70) {
      suggestions.push({
        type: 'overall',
        priority: 'high',
        title: 'High Risk Code Detected',
        description: 'Your code has several high-risk issues that should be addressed immediately.',
        actions: ['Review critical issues', 'Implement security fixes', 'Add error handling']
      });
    }

    if (analysis.compatibilityScore < 60) {
      suggestions.push({
        type: 'compatibility',
        priority: 'high',
        title: 'Browser Compatibility Issues',
        description: 'Your code may not work across all target browsers.',
        actions: ['Add polyfills', 'Use feature detection', 'Test on older browsers']
      });
    }

    if (analysis.performanceScore < 70) {
      suggestions.push({
        type: 'performance',
        priority: 'medium',
        title: 'Performance Optimization Needed',
        description: 'Several performance improvements can be made.',
        actions: ['Optimize DOM queries', 'Use requestAnimationFrame', 'Implement lazy loading']
      });
    }

    return suggestions;
  }
}

export default AIAnalyzer;

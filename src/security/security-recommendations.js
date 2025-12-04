/**
 * Security Recommendations Engine
 * Generates actionable security recommendations based on analysis results
 */

export class SecurityRecommendations {
  constructor(options = {}) {
    this.options = {
      includeCodeExamples: true,
      includeOWASPReferences: true,
      includeCWEReferences: true,
      ...options
    };
  }

  /**
   * Generate security recommendations
   */
  generateRecommendations(analysis) {
    const recommendations = {
      critical: [],
      high: [],
      medium: [],
      low: [],
      general: []
    };

    // Generate recommendations by severity
    recommendations.critical = this.generateCriticalRecommendations(analysis);
    recommendations.high = this.generateHighRecommendations(analysis);
    recommendations.medium = this.generateMediumRecommendations(analysis);
    recommendations.low = this.generateLowRecommendations(analysis);
    recommendations.general = this.generateGeneralRecommendations(analysis);

    return {
      recommendations,
      summary: this.generateSummary(analysis, recommendations),
      priority: this.calculatePriority(analysis)
    };
  }

  /**
   * Generate critical recommendations
   */
  generateCriticalRecommendations(analysis) {
    const critical = [];
    const criticalVulns = analysis.vulnerabilities.filter(v => v.severity === 'critical');

    if (criticalVulns.length > 0) {
      critical.push({
        title: '🚨 Critical Security Issues Detected',
        description: 'Immediate action required to fix critical vulnerabilities',
        priority: 'immediate',
        impact: 'high',
        effort: 'medium',
        vulnerabilities: criticalVulns.length,
        actions: [
          'Review all critical vulnerabilities immediately',
          'Implement fixes before deploying to production',
          'Consider temporary workarounds if immediate fix is not possible',
          'Notify security team and stakeholders'
        ],
        codeExamples: this.getCodeExamples('critical'),
        resources: this.getSecurityResources('critical')
      });
    }

    // XSS via eval
    const evalVulns = criticalVulns.filter(v => v.type === 'xss_eval');
    if (evalVulns.length > 0) {
      critical.push({
        title: '🚨 Remove eval() Usage',
        description: 'eval() with user input is extremely dangerous and must be removed',
        priority: 'immediate',
        impact: 'critical',
        effort: 'low',
        vulnerabilities: evalVulns.length,
        actions: [
          'Replace all eval() calls with safer alternatives',
          'Use JSON.parse() for JSON data',
          'Use Function constructor with validated input if dynamic code is needed',
          'Implement input validation and sanitization'
        ],
        codeExamples: [
          {
            bad: 'eval(userInput);',
            good: 'JSON.parse(userInput);',
            explanation: 'Use JSON.parse() for JSON data instead of eval()'
          },
          {
            bad: 'eval("var x = " + userInput);',
            good: 'const x = userInput; // Direct assignment if safe',
            explanation: 'Avoid dynamic code generation with user input'
          }
        ],
        resources: [
          'OWASP: A03:2021 – Injection',
          'CWE-95: Improper Neutralization of Directives in Dynamically Evaluated Code',
          'MDN: eval() - Never use eval!'
        ]
      });
    }

    return critical;
  }

  /**
   * Generate high priority recommendations
   */
  generateHighRecommendations(analysis) {
    const high = [];
    const highVulns = analysis.vulnerabilities.filter(v => v.severity === 'high');

    // XSS vulnerabilities
    const xssVulns = highVulns.filter(v => v.category === 'xss');
    if (xssVulns.length > 0) {
      high.push({
        title: '🔒 Fix XSS Vulnerabilities',
        description: 'Cross-Site Scripting vulnerabilities detected that need immediate attention',
        priority: 'high',
        impact: 'high',
        effort: 'medium',
        vulnerabilities: xssVulns.length,
        actions: [
          'Replace innerHTML with textContent where possible',
          'Implement proper input sanitization',
          'Use Content Security Policy (CSP)',
          'Validate and escape all user input'
        ],
        codeExamples: [
          {
            bad: 'element.innerHTML = userInput;',
            good: 'element.textContent = userInput;',
            explanation: 'Use textContent to prevent XSS'
          },
          {
            bad: 'document.write(userInput);',
            good: 'element.appendChild(document.createTextNode(userInput));',
            explanation: 'Use DOM methods instead of document.write'
          }
        ],
        resources: [
          'OWASP: A03:2021 – Injection',
          'CWE-79: Improper Neutralization of Input During Web Page Generation',
          'MDN: Cross-site scripting (XSS)'
        ]
      });
    }

    // Hardcoded secrets
    const secretVulns = highVulns.filter(v => v.category === 'secrets');
    if (secretVulns.length > 0) {
      high.push({
        title: '🔑 Remove Hardcoded Secrets',
        description: 'Hardcoded secrets in source code are a major security risk',
        priority: 'high',
        impact: 'high',
        effort: 'medium',
        vulnerabilities: secretVulns.length,
        actions: [
          'Move all secrets to environment variables',
          'Use secure configuration management',
          'Implement secret rotation',
          'Audit all hardcoded credentials'
        ],
        codeExamples: [
          {
            bad: 'const apiKey = "sk-1234567890abcdef";',
            good: 'const apiKey = process.env.API_KEY;',
            explanation: 'Use environment variables for secrets'
          },
          {
            bad: 'const password = "admin123";',
            good: 'const password = process.env.ADMIN_PASSWORD;',
            explanation: 'Never hardcode passwords'
          }
        ],
        resources: [
          'OWASP: A07:2021 – Identification and Authentication Failures',
          'CWE-798: Use of Hard-coded Credentials',
          '12-Factor App: Config'
        ]
      });
    }

    // CORS wildcard
    const corsVulns = highVulns.filter(v => v.type === 'cors_wildcard');
    if (corsVulns.length > 0) {
      high.push({
        title: '🌐 Fix CORS Configuration',
        description: 'Wildcard CORS origins allow any domain to access your resources',
        priority: 'high',
        impact: 'high',
        effort: 'low',
        vulnerabilities: corsVulns.length,
        actions: [
          'Replace wildcard origins with specific domains',
          'Implement proper CORS policy',
          'Use credentials: false if not needed',
          'Consider using CORS middleware'
        ],
        codeExamples: [
          {
            bad: 'Access-Control-Allow-Origin: *',
            good: 'Access-Control-Allow-Origin: https://trusted-domain.com',
            explanation: 'Specify exact origins instead of wildcard'
          }
        ],
        resources: [
          'OWASP: A05:2021 – Security Misconfiguration',
          'CWE-942: Overly Permissive Cross-domain Whitelist',
          'MDN: CORS'
        ]
      });
    }

    return high;
  }

  /**
   * Generate medium priority recommendations
   */
  generateMediumRecommendations(analysis) {
    const medium = [];
    const mediumVulns = analysis.vulnerabilities.filter(v => v.severity === 'medium');

    // CSRF vulnerabilities
    const csrfVulns = mediumVulns.filter(v => v.category === 'csrf');
    if (csrfVulns.length > 0) {
      medium.push({
        title: '🛡️ Implement CSRF Protection',
        description: 'Add CSRF protection to prevent cross-site request forgery attacks',
        priority: 'medium',
        impact: 'medium',
        effort: 'medium',
        vulnerabilities: csrfVulns.length,
        actions: [
          'Add CSRF tokens to all forms',
          'Include CSRF headers in AJAX requests',
          'Implement SameSite cookie attribute',
          'Use CSRF middleware'
        ],
        codeExamples: [
          {
            bad: '<form method="POST"><input type="submit"></form>',
            good: '<form method="POST"><input type="hidden" name="_token" value="{{csrf_token}}"><input type="submit"></form>',
            explanation: 'Include CSRF token in forms'
          },
          {
            bad: 'fetch("/api/data", {method: "POST"})',
            good: 'fetch("/api/data", {method: "POST", headers: {"X-CSRF-Token": token}})',
            explanation: 'Include CSRF token in fetch requests'
          }
        ],
        resources: [
          'OWASP: A01:2021 – Broken Access Control',
          'CWE-352: Cross-Site Request Forgery (CSRF)',
          'MDN: SameSite cookies'
        ]
      });
    }

    // Missing CSP
    const cspVulns = mediumVulns.filter(v => v.category === 'csp');
    if (cspVulns.length > 0) {
      medium.push({
        title: '🔒 Implement Content Security Policy',
        description: 'Add CSP headers to prevent XSS and other injection attacks',
        priority: 'medium',
        impact: 'medium',
        effort: 'medium',
        vulnerabilities: cspVulns.length,
        actions: [
          'Add CSP meta tag or HTTP header',
          'Start with restrictive policy and relax as needed',
          'Use nonces or hashes for inline scripts',
          'Test CSP with reporting mode first'
        ],
        codeExamples: [
          {
            bad: '<head><title>My App</title></head>',
            good: '<head><meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\' \'unsafe-inline\'"></head>',
            explanation: 'Add CSP meta tag to HTML head'
          }
        ],
        resources: [
          'OWASP: A05:2021 – Security Misconfiguration',
          'CWE-693: Protection Mechanism Failure',
          'MDN: Content Security Policy'
        ]
      });
    }

    return medium;
  }

  /**
   * Generate low priority recommendations
   */
  generateLowRecommendations(analysis) {
    const low = [];
    const lowVulns = analysis.vulnerabilities.filter(v => v.severity === 'low');

    // Missing security headers
    const headerVulns = lowVulns.filter(v => v.category === 'headers');
    if (headerVulns.length > 0) {
      low.push({
        title: '📋 Add Security Headers',
        description: 'Implement additional security headers for better protection',
        priority: 'low',
        impact: 'low',
        effort: 'low',
        vulnerabilities: headerVulns.length,
        actions: [
          'Add X-Frame-Options header',
          'Add X-Content-Type-Options header',
          'Add X-XSS-Protection header',
          'Add Strict-Transport-Security header'
        ],
        codeExamples: [
          {
            bad: 'app.use(express.static("public"));',
            good: `app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});`,
            explanation: 'Add security headers middleware'
          }
        ],
        resources: [
          'OWASP: A05:2021 – Security Misconfiguration',
          'CWE-693: Protection Mechanism Failure',
          'MDN: HTTP Headers'
        ]
      });
    }

    return low;
  }

  /**
   * Generate general recommendations
   */
  generateGeneralRecommendations(analysis) {
    const general = [];

    // Always include general security best practices
    general.push({
      title: '🔐 General Security Best Practices',
      description: 'Implement these security measures to improve overall security posture',
      priority: 'ongoing',
      impact: 'medium',
      effort: 'low',
      actions: [
        'Keep dependencies updated regularly',
        'Implement automated security scanning',
        'Use HTTPS everywhere',
        'Implement proper logging and monitoring',
        'Regular security audits and penetration testing',
        'Train developers on secure coding practices'
      ],
      resources: [
        'OWASP Top 10',
        'OWASP Secure Coding Practices',
        'NIST Cybersecurity Framework',
        'SANS Top 25 Software Errors'
      ]
    });

    // Security score based recommendations
    if (analysis.securityScore < 50) {
      general.push({
        title: '⚠️ Critical Security Score',
        description: `Your security score is ${analysis.securityScore}/100. Immediate action required.`,
        priority: 'immediate',
        impact: 'critical',
        effort: 'high',
        actions: [
          'Conduct comprehensive security audit',
          'Implement all critical and high priority fixes',
          'Consider hiring security consultant',
          'Implement security training for development team'
        ]
      });
    } else if (analysis.securityScore < 70) {
      general.push({
        title: '⚠️ Low Security Score',
        description: `Your security score is ${analysis.securityScore}/100. Security improvements needed.`,
        priority: 'high',
        impact: 'high',
        effort: 'medium',
        actions: [
          'Address all high and medium priority issues',
          'Implement security monitoring',
          'Regular security reviews'
        ]
      });
    }

    return general;
  }

  /**
   * Generate summary
   */
  generateSummary(analysis, recommendations) {
    const totalRecommendations = Object.values(recommendations).reduce((sum, recs) => sum + recs.length, 0);
    
    return {
      totalVulnerabilities: analysis.vulnerabilities.length,
      totalRecommendations,
      securityScore: analysis.securityScore,
      riskLevel: analysis.riskLevel,
      priorityActions: this.getPriorityActions(recommendations),
      estimatedEffort: this.estimateEffort(recommendations)
    };
  }

  /**
   * Calculate priority
   */
  calculatePriority(analysis) {
    const criticalCount = analysis.vulnerabilities.filter(v => v.severity === 'critical').length;
    const highCount = analysis.vulnerabilities.filter(v => v.severity === 'high').length;
    
    if (criticalCount > 0) return 'critical';
    if (highCount > 3) return 'high';
    if (analysis.securityScore < 70) return 'medium';
    return 'low';
  }

  /**
   * Get priority actions
   */
  getPriorityActions(recommendations) {
    const actions = [];
    
    if (recommendations.critical.length > 0) {
      actions.push('🚨 Fix critical vulnerabilities immediately');
    }
    if (recommendations.high.length > 0) {
      actions.push('🔒 Address high priority security issues');
    }
    if (recommendations.medium.length > 0) {
      actions.push('🛡️ Implement medium priority security measures');
    }
    
    return actions;
  }

  /**
   * Estimate effort
   */
  estimateEffort(recommendations) {
    let totalEffort = 0;
    
    Object.values(recommendations).forEach(recs => {
      recs.forEach(rec => {
        switch (rec.effort) {
          case 'low': totalEffort += 1; break;
          case 'medium': totalEffort += 3; break;
          case 'high': totalEffort += 5; break;
        }
      });
    });
    
    if (totalEffort <= 5) return 'Low (1-2 days)';
    if (totalEffort <= 15) return 'Medium (1-2 weeks)';
    if (totalEffort <= 30) return 'High (2-4 weeks)';
    return 'Very High (1+ months)';
  }

  /**
   * Get code examples
   */
  getCodeExamples(severity) {
    const examples = {
      critical: [
        {
          bad: 'eval(userInput);',
          good: 'JSON.parse(userInput);',
          explanation: 'Never use eval() with user input'
        }
      ],
      high: [
        {
          bad: 'element.innerHTML = userInput;',
          good: 'element.textContent = userInput;',
          explanation: 'Use textContent to prevent XSS'
        }
      ]
    };
    
    return examples[severity] || [];
  }

  /**
   * Get security resources
   */
  getSecurityResources(severity) {
    const resources = {
      critical: [
        'OWASP: A03:2021 – Injection',
        'CWE-95: Improper Neutralization of Directives',
        'MDN: eval() - Never use eval!'
      ],
      high: [
        'OWASP: A03:2021 – Injection',
        'CWE-79: Improper Neutralization of Input',
        'MDN: Cross-site scripting (XSS)'
      ]
    };
    
    return resources[severity] || [];
  }
}

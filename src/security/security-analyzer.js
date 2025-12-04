/**
 * Security Vulnerability Analyzer
 * Detects web security vulnerabilities and browser compatibility issues
 */

export class SecurityAnalyzer {
  constructor(options = {}) {
    this.options = {
      enableXSSDetection: true,
      enableCSRFDetection: true,
      enableInsecurePatterns: true,
      enableCSPAnalysis: true,
      enableHTTPSAnalysis: true,
      enableCORSAnalysis: true,
      enableContentSecurity: true,
      enableAuthentication: true,
      ...options
    };
    
    this.vulnerabilities = [];
    this.securityScore = 100;
    this.riskLevel = 'low';
  }

  /**
   * Analyze content for security vulnerabilities
   */
  analyzeSecurity(content, filePath = '') {
    const fileType = this.getFileType(filePath);
    const vulnerabilities = [];

    // XSS Detection
    if (this.options.enableXSSDetection) {
      vulnerabilities.push(...this.detectXSSVulnerabilities(content, filePath));
    }

    // CSRF Detection
    if (this.options.enableCSRFDetection) {
      vulnerabilities.push(...this.detectCSRFVulnerabilities(content, filePath));
    }

    // Insecure Patterns
    if (this.options.enableInsecurePatterns) {
      vulnerabilities.push(...this.detectInsecurePatterns(content, filePath));
    }

    // CSP Analysis
    if (this.options.enableCSPAnalysis) {
      vulnerabilities.push(...this.analyzeCSP(content, filePath));
    }

    // HTTPS Analysis
    if (this.options.enableHTTPSAnalysis) {
      vulnerabilities.push(...this.analyzeHTTPS(content, filePath));
    }

    // CORS Analysis
    if (this.options.enableCORSAnalysis) {
      vulnerabilities.push(...this.analyzeCORS(content, filePath));
    }

    // Content Security
    if (this.options.enableContentSecurity) {
      vulnerabilities.push(...this.analyzeContentSecurity(content, filePath));
    }

    // Authentication Analysis
    if (this.options.enableAuthentication) {
      vulnerabilities.push(...this.analyzeAuthentication(content, filePath));
    }

    this.vulnerabilities = vulnerabilities;
    this.calculateSecurityScore();
    
    return {
      vulnerabilities,
      securityScore: this.securityScore,
      riskLevel: this.riskLevel,
      summary: this.generateSummary()
    };
  }

  /**
   * Detect XSS vulnerabilities
   */
  detectXSSVulnerabilities(content, filePath) {
    const vulnerabilities = [];
    const lines = content.split('\n');

    // Dangerous innerHTML usage
    const innerHTMLPattern = /\.innerHTML\s*=\s*[^;]+/g;
    let match;
    while ((match = innerHTMLPattern.exec(content)) !== null) {
      const lineNumber = this.getLineNumber(content, match.index);
      const line = lines[lineNumber - 1];
      
      // Skip if it's in a comment or string literal
      if (this.isInCommentOrString(line, match.index)) continue;
      
      vulnerabilities.push({
        type: 'xss_innerHTML',
        severity: 'high',
        category: 'xss',
        title: 'Potential XSS via innerHTML',
        description: 'Using innerHTML with user input can lead to XSS attacks',
        file: filePath,
        line: lineNumber,
        code: line.trim(),
        suggestion: 'Use textContent or sanitize input before using innerHTML',
        fix: 'Replace innerHTML with textContent or use a sanitization library',
        cwe: 'CWE-79',
        owasp: 'A03:2021 – Injection'
      });
    }

    // Dangerous document.write usage
    const documentWritePattern = /document\.write\s*\(/g;
    while ((match = documentWritePattern.exec(content)) !== null) {
      const lineNumber = this.getLineNumber(content, match.index);
      const line = lines[lineNumber - 1];
      
      if (this.isInCommentOrString(line, match.index)) continue;
      
      vulnerabilities.push({
        type: 'xss_document_write',
        severity: 'high',
        category: 'xss',
        title: 'Potential XSS via document.write',
        description: 'Using document.write with user input can lead to XSS attacks',
        file: filePath,
        line: lineNumber,
        code: line.trim(),
        suggestion: 'Avoid document.write, use DOM manipulation methods instead',
        fix: 'Replace document.write with createElement and appendChild',
        cwe: 'CWE-79',
        owasp: 'A03:2021 – Injection'
      });
    }

    // Unsafe eval usage
    const evalPattern = /\beval\s*\(/g;
    while ((match = evalPattern.exec(content)) !== null) {
      const lineNumber = this.getLineNumber(content, match.index);
      const line = lines[lineNumber - 1];
      
      if (this.isInCommentOrString(line, match.index)) continue;
      
      vulnerabilities.push({
        type: 'xss_eval',
        severity: 'critical',
        category: 'xss',
        title: 'Critical XSS via eval()',
        description: 'Using eval() with user input is extremely dangerous',
        file: filePath,
        line: lineNumber,
        code: line.trim(),
        suggestion: 'Never use eval() with user input',
        fix: 'Use JSON.parse() or other safe alternatives',
        cwe: 'CWE-95',
        owasp: 'A03:2021 – Injection'
      });
    }

    // Unsafe Function constructor
    const functionPattern = /new\s+Function\s*\(/g;
    while ((match = functionPattern.exec(content)) !== null) {
      const lineNumber = this.getLineNumber(content, match.index);
      const line = lines[lineNumber - 1];
      
      if (this.isInCommentOrString(line, match.index)) continue;
      
      vulnerabilities.push({
        type: 'xss_function_constructor',
        severity: 'critical',
        category: 'xss',
        title: 'Critical XSS via Function constructor',
        description: 'Using Function constructor with user input is extremely dangerous',
        file: filePath,
        line: lineNumber,
        code: line.trim(),
        suggestion: 'Avoid Function constructor with user input',
        fix: 'Use safer alternatives or validate input thoroughly',
        cwe: 'CWE-95',
        owasp: 'A03:2021 – Injection'
      });
    }

    return vulnerabilities;
  }

  /**
   * Detect CSRF vulnerabilities
   */
  detectCSRFVulnerabilities(content, filePath) {
    const vulnerabilities = [];
    const lines = content.split('\n');

    // Missing CSRF tokens in forms
    const formPattern = /<form[^>]*>/gi;
    let match;
    while ((match = formPattern.exec(content)) !== null) {
      const lineNumber = this.getLineNumber(content, match.index);
      const line = lines[lineNumber - 1];
      
      if (this.isInCommentOrString(line, match.index)) continue;
      
      // Check if form has CSRF token
      const formContent = this.getFormContent(content, match.index);
      if (formContent && !formContent.includes('csrf') && !formContent.includes('_token')) {
        vulnerabilities.push({
          type: 'csrf_missing_token',
          severity: 'medium',
          category: 'csrf',
          title: 'Missing CSRF protection in form',
          description: 'Form submission without CSRF token is vulnerable to CSRF attacks',
          file: filePath,
          line: lineNumber,
          code: line.trim(),
          suggestion: 'Add CSRF token to form',
          fix: 'Include CSRF token in form: <input type="hidden" name="_token" value="...">',
          cwe: 'CWE-352',
          owasp: 'A01:2021 – Broken Access Control'
        });
      }
    }

    // Unsafe fetch requests without CSRF headers
    const fetchPattern = /fetch\s*\([^)]*\)/g;
    while ((match = fetchPattern.exec(content)) !== null) {
      const lineNumber = this.getLineNumber(content, match.index);
      const line = lines[lineNumber - 1];
      
      if (this.isInCommentOrString(line, match.index)) continue;
      
      // Check if fetch includes CSRF headers
      if (!line.includes('X-CSRF-Token') && !line.includes('X-Requested-With')) {
        vulnerabilities.push({
          type: 'csrf_unsafe_fetch',
          severity: 'medium',
          category: 'csrf',
          title: 'Unsafe fetch request without CSRF protection',
          description: 'Fetch request without CSRF headers is vulnerable to CSRF attacks',
          file: filePath,
          line: lineNumber,
          code: line.trim(),
          suggestion: 'Add CSRF headers to fetch requests',
          fix: 'Include headers: { "X-CSRF-Token": token, "X-Requested-With": "XMLHttpRequest" }',
          cwe: 'CWE-352',
          owasp: 'A01:2021 – Broken Access Control'
        });
      }
    }

    return vulnerabilities;
  }

  /**
   * Detect insecure patterns
   */
  detectInsecurePatterns(content, filePath) {
    const vulnerabilities = [];
    const lines = content.split('\n');

    // Hardcoded secrets
    const secretPatterns = [
      { pattern: /password\s*=\s*["'][^"']+["']/gi, type: 'hardcoded_password' },
      { pattern: /api[_-]?key\s*=\s*["'][^"']+["']/gi, type: 'hardcoded_api_key' },
      { pattern: /secret\s*=\s*["'][^"']+["']/gi, type: 'hardcoded_secret' },
      { pattern: /token\s*=\s*["'][^"']+["']/gi, type: 'hardcoded_token' }
    ];

    secretPatterns.forEach(({ pattern, type }) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const lineNumber = this.getLineNumber(content, match.index);
        const line = lines[lineNumber - 1];
        
        if (this.isInCommentOrString(line, match.index)) continue;
        
        vulnerabilities.push({
          type,
          severity: 'high',
          category: 'secrets',
          title: 'Hardcoded secret detected',
          description: 'Hardcoded secrets in source code are a security risk',
          file: filePath,
          line: lineNumber,
          code: line.trim(),
          suggestion: 'Use environment variables or secure configuration',
          fix: 'Move secrets to environment variables or secure config files',
          cwe: 'CWE-798',
          owasp: 'A07:2021 – Identification and Authentication Failures'
        });
      }
    });

    // Unsafe URL construction
    const urlPattern = /new\s+URL\s*\([^)]*\+/g;
    let match;
    while ((match = urlPattern.exec(content)) !== null) {
      const lineNumber = this.getLineNumber(content, match.index);
      const line = lines[lineNumber - 1];
      
      if (this.isInCommentOrString(line, match.index)) continue;
      
      vulnerabilities.push({
        type: 'unsafe_url_construction',
        severity: 'medium',
        category: 'injection',
        title: 'Unsafe URL construction',
        description: 'URL construction with string concatenation can lead to injection',
        file: filePath,
        line: lineNumber,
        code: line.trim(),
        suggestion: 'Use URL constructor with proper parameters',
        fix: 'Use URL constructor: new URL(pathname, base)',
        cwe: 'CWE-20',
        owasp: 'A03:2021 – Injection'
      });
    }

    // Unsafe JSON parsing
    const jsonParsePattern = /JSON\.parse\s*\([^)]*\)/g;
    while ((match = jsonParsePattern.exec(content)) !== null) {
      const lineNumber = this.getLineNumber(content, match.index);
      const line = lines[lineNumber - 1];
      
      if (this.isInCommentOrString(line, match.index)) continue;
      
      // Check if it's wrapped in try-catch
      const functionContent = this.getFunctionContent(content, match.index);
      if (!functionContent || !functionContent.includes('try') || !functionContent.includes('catch')) {
        vulnerabilities.push({
          type: 'unsafe_json_parse',
          severity: 'low',
          category: 'injection',
          title: 'Unsafe JSON parsing',
          description: 'JSON.parse without error handling can cause application crashes',
          file: filePath,
          line: lineNumber,
          code: line.trim(),
          suggestion: 'Wrap JSON.parse in try-catch block',
          fix: 'try { JSON.parse(data) } catch (e) { handleError(e) }',
          cwe: 'CWE-20',
          owasp: 'A03:2021 – Injection'
        });
      }
    }

    return vulnerabilities;
  }

  /**
   * Analyze Content Security Policy
   */
  analyzeCSP(content, filePath) {
    const vulnerabilities = [];
    const lines = content.split('\n');

    // Missing CSP headers
    const metaCSPPattern = /<meta[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>/gi;
    const hasMetaCSP = metaCSPPattern.test(content);
    
    if (!hasMetaCSP && filePath.endsWith('.html')) {
      vulnerabilities.push({
        type: 'missing_csp',
        severity: 'medium',
        category: 'csp',
        title: 'Missing Content Security Policy',
        description: 'No CSP header found, leaving site vulnerable to XSS',
        file: filePath,
        line: 1,
        code: '<head>',
        suggestion: 'Add CSP meta tag or HTTP header',
        fix: '<meta http-equiv="Content-Security-Policy" content="default-src \'self\'">',
        cwe: 'CWE-693',
        owasp: 'A05:2021 – Security Misconfiguration'
      });
    }

    // Weak CSP policies
    const cspPattern = /Content-Security-Policy[^>]*content=["']([^"']+)["']/gi;
    let match;
    while ((match = cspPattern.exec(content)) !== null) {
      const policy = match[1];
      const lineNumber = this.getLineNumber(content, match.index);
      
      // Check for unsafe-inline
      if (policy.includes('unsafe-inline')) {
        vulnerabilities.push({
          type: 'weak_csp_unsafe_inline',
          severity: 'high',
          category: 'csp',
          title: 'Weak CSP: unsafe-inline allowed',
          description: 'unsafe-inline in CSP reduces XSS protection',
          file: filePath,
          line: lineNumber,
          code: match[0],
          suggestion: 'Remove unsafe-inline and use nonces or hashes',
          fix: 'Use nonces: script-src \'nonce-{random}\' or hashes: script-src \'sha256-{hash}\'',
          cwe: 'CWE-693',
          owasp: 'A05:2021 – Security Misconfiguration'
        });
      }

      // Check for unsafe-eval
      if (policy.includes('unsafe-eval')) {
        vulnerabilities.push({
          type: 'weak_csp_unsafe_eval',
          severity: 'high',
          category: 'csp',
          title: 'Weak CSP: unsafe-eval allowed',
          description: 'unsafe-eval in CSP allows code injection',
          file: filePath,
          line: lineNumber,
          code: match[0],
          suggestion: 'Remove unsafe-eval and use safer alternatives',
          fix: 'Avoid eval() and use JSON.parse() or other safe methods',
          cwe: 'CWE-95',
          owasp: 'A05:2021 – Security Misconfiguration'
        });
      }
    }

    return vulnerabilities;
  }

  /**
   * Analyze HTTPS usage
   */
  analyzeHTTPS(content, filePath) {
    const vulnerabilities = [];
    const lines = content.split('\n');

    // HTTP URLs in production code
    const httpPattern = /https?:\/\/[^"'\s]+/g;
    let match;
    while ((match = httpPattern.exec(content)) !== null) {
      const url = match[0];
      const lineNumber = this.getLineNumber(content, match.index);
      const line = lines[lineNumber - 1];
      
      if (this.isInCommentOrString(line, match.index)) continue;
      
      if (url.startsWith('http://') && !url.includes('localhost') && !url.includes('127.0.0.1')) {
        vulnerabilities.push({
          type: 'insecure_http',
          severity: 'medium',
          category: 'https',
          title: 'Insecure HTTP URL detected',
          description: 'HTTP URLs in production code are insecure',
          file: filePath,
          line: lineNumber,
          code: line.trim(),
          suggestion: 'Use HTTPS URLs instead of HTTP',
          fix: 'Replace http:// with https://',
          cwe: 'CWE-319',
          owasp: 'A07:2021 – Identification and Authentication Failures'
        });
      }
    }

    return vulnerabilities;
  }

  /**
   * Analyze CORS configuration
   */
  analyzeCORS(content, filePath) {
    const vulnerabilities = [];
    const lines = content.split('\n');

    // Wildcard CORS origins
    const corsPattern = /Access-Control-Allow-Origin[^>]*\*/gi;
    let match;
    while ((match = corsPattern.exec(content)) !== null) {
      const lineNumber = this.getLineNumber(content, match.index);
      const line = lines[lineNumber - 1];
      
      if (this.isInCommentOrString(line, match.index)) continue;
      
      vulnerabilities.push({
        type: 'cors_wildcard',
        severity: 'high',
        category: 'cors',
        title: 'Wildcard CORS origin',
        description: 'Wildcard CORS origin allows any domain to access resources',
        file: filePath,
        line: lineNumber,
        code: line.trim(),
        suggestion: 'Specify exact origins instead of wildcard',
        fix: 'Access-Control-Allow-Origin: https://trusted-domain.com',
        cwe: 'CWE-942',
        owasp: 'A05:2021 – Security Misconfiguration'
      });
    }

    return vulnerabilities;
  }

  /**
   * Analyze content security
   */
  analyzeContentSecurity(content, filePath) {
    const vulnerabilities = [];
    const lines = content.split('\n');

    // Missing security headers
    const securityHeaders = [
      'X-Frame-Options',
      'X-Content-Type-Options',
      'X-XSS-Protection',
      'Strict-Transport-Security',
      'Referrer-Policy'
    ];

    securityHeaders.forEach(header => {
      const headerPattern = new RegExp(header, 'gi');
      if (!headerPattern.test(content)) {
        vulnerabilities.push({
          type: 'missing_security_header',
          severity: 'low',
          category: 'headers',
          title: `Missing security header: ${header}`,
          description: `Security header ${header} is missing`,
          file: filePath,
          line: 1,
          code: '<head>',
          suggestion: `Add ${header} header`,
          fix: `Add header: ${header}: appropriate-value`,
          cwe: 'CWE-693',
          owasp: 'A05:2021 – Security Misconfiguration'
        });
      }
    });

    return vulnerabilities;
  }

  /**
   * Analyze authentication patterns
   */
  analyzeAuthentication(content, filePath) {
    const vulnerabilities = [];
    const lines = content.split('\n');

    // Weak password patterns
    const weakPasswordPattern = /password.*length.*[0-5]/gi;
    let match;
    while ((match = weakPasswordPattern.exec(content)) !== null) {
      const lineNumber = this.getLineNumber(content, match.index);
      const line = lines[lineNumber - 1];
      
      if (this.isInCommentOrString(line, match.index)) continue;
      
      vulnerabilities.push({
        type: 'weak_password_policy',
        severity: 'medium',
        category: 'authentication',
        title: 'Weak password policy',
        description: 'Password length requirement is too low',
        file: filePath,
        line: lineNumber,
        code: line.trim(),
        suggestion: 'Enforce minimum 8 character passwords',
        fix: 'Set minimum password length to 8+ characters',
        cwe: 'CWE-521',
        owasp: 'A07:2021 – Identification and Authentication Failures'
      });
    }

    return vulnerabilities;
  }

  /**
   * Calculate security score
   */
  calculateSecurityScore() {
    let score = 100;
    
    this.vulnerabilities.forEach(vuln => {
      switch (vuln.severity) {
        case 'critical':
          score -= 20;
          break;
        case 'high':
          score -= 10;
          break;
        case 'medium':
          score -= 5;
          break;
        case 'low':
          score -= 2;
          break;
      }
    });
    
    this.securityScore = Math.max(0, score);
    
    if (this.securityScore >= 90) this.riskLevel = 'low';
    else if (this.securityScore >= 70) this.riskLevel = 'medium';
    else if (this.securityScore >= 50) this.riskLevel = 'high';
    else this.riskLevel = 'critical';
  }

  /**
   * Generate summary
   */
  generateSummary() {
    const summary = {
      totalVulnerabilities: this.vulnerabilities.length,
      bySeverity: {
        critical: this.vulnerabilities.filter(v => v.severity === 'critical').length,
        high: this.vulnerabilities.filter(v => v.severity === 'high').length,
        medium: this.vulnerabilities.filter(v => v.severity === 'medium').length,
        low: this.vulnerabilities.filter(v => v.severity === 'low').length
      },
      byCategory: {},
      securityScore: this.securityScore,
      riskLevel: this.riskLevel
    };

    // Group by category
    this.vulnerabilities.forEach(vuln => {
      const category = vuln.category;
      summary.byCategory[category] = (summary.byCategory[category] || 0) + 1;
    });

    return summary;
  }

  /**
   * Helper methods
   */
  getFileType(filePath) {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const typeMap = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'css': 'css',
      'html': 'html',
      'htm': 'html',
      'vue': 'vue',
      'svelte': 'svelte'
    };
    return typeMap[ext] || 'unknown';
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  isInCommentOrString(line, index) {
    // Simple check for comments and strings
    return line.includes('//') || line.includes('/*') || line.includes('*') || 
           line.includes('`') || line.includes('codeExample') || line.includes('example');
  }

  getFormContent(content, formIndex) {
    // Get content between form tags
    const formEnd = content.indexOf('</form>', formIndex);
    if (formEnd === -1) return null;
    return content.substring(formIndex, formEnd);
  }

  getFunctionContent(content, funcIndex) {
    // Get content of the function containing the match
    const lines = content.split('\n');
    const lineNumber = this.getLineNumber(content, funcIndex);
    const startLine = Math.max(0, lineNumber - 10);
    const endLine = Math.min(lines.length, lineNumber + 10);
    return lines.slice(startLine, endLine).join('\n');
  }
}

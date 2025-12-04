/**
 * Progressive Enhancement Analyzer
 * Analyzes code for progressive enhancement patterns and fallback implementations
 */

export class ProgressiveEnhancementAnalyzer {
  constructor(options = {}) {
    this.options = {
      checkFallbacks: true,
      checkGracefulDegradation: true,
      checkFeatureDetection: true,
      checkResponsiveDesign: true,
      checkAccessibility: true,
      ...options
    };

    this.fallbackPatterns = this.initializeFallbackPatterns();
    this.degradationPatterns = this.initializeDegradationPatterns();
  }

  /**
   * Analyze code for progressive enhancement patterns
   */
  async analyzeProgressiveEnhancement(files) {
    const results = {
      files: [],
      summary: {
        totalFiles: files.length,
        progressiveFiles: 0,
        fallbackIssues: 0,
        degradationIssues: 0,
        featureDetectionIssues: 0,
        responsiveIssues: 0,
        accessibilityIssues: 0,
        overallScore: 0
      },
      recommendations: [],
      patterns: {
        good: [],
        issues: [],
        missing: []
      }
    };

    for (const file of files) {
      const fileAnalysis = await this.analyzeFile(file);
      results.files.push(fileAnalysis);

      // Update summary counts
      if (fileAnalysis.progressive) {
        results.summary.progressiveFiles++;
      }
      results.summary.fallbackIssues += fileAnalysis.issues.fallback.length;
      results.summary.degradationIssues += fileAnalysis.issues.degradation.length;
      results.summary.featureDetectionIssues += fileAnalysis.issues.featureDetection.length;
      results.summary.responsiveIssues += fileAnalysis.issues.responsive.length;
      results.summary.accessibilityIssues += fileAnalysis.issues.accessibility.length;
    }

    // Calculate overall score
    results.summary.overallScore = this.calculateOverallScore(results);

    // Generate recommendations
    results.recommendations = this.generateRecommendations(results);

    // Identify patterns
    results.patterns = this.identifyPatterns(results);

    return results;
  }

  /**
   * Analyze individual file for progressive enhancement
   */
  async analyzeFile(filePath) {
    const content = await this.readFile(filePath);
    const extension = this.getFileExtension(filePath);
    
    const analysis = {
      file: filePath,
      extension: extension,
      progressive: false,
      score: 0,
      issues: {
        fallback: [],
        degradation: [],
        featureDetection: [],
        responsive: [],
        accessibility: []
      },
      patterns: {
        good: [],
        issues: [],
        missing: []
      },
      recommendations: []
    };

    if (extension === 'html') {
      await this.analyzeHTML(content, analysis);
    } else if (extension === 'css') {
      await this.analyzeCSS(content, analysis);
    } else if (['js', 'ts', 'jsx', 'tsx'].includes(extension)) {
      await this.analyzeJavaScript(content, analysis);
    }

    // Calculate file score
    analysis.score = this.calculateFileScore(analysis);
    analysis.progressive = analysis.score >= 70;

    return analysis;
  }

  /**
   * Analyze HTML for progressive enhancement
   */
  async analyzeHTML(content, analysis) {
    // Check for semantic HTML
    this.checkSemanticHTML(content, analysis);
    
    // Check for fallback content
    this.checkFallbackContent(content, analysis);
    
    // Check for responsive design
    this.checkResponsiveDesign(content, analysis);
    
    // Check for accessibility
    this.checkAccessibility(content, analysis);
    
    // Check for graceful degradation
    this.checkGracefulDegradation(content, analysis);
  }

  /**
   * Analyze CSS for progressive enhancement
   */
  async analyzeCSS(content, analysis) {
    // Check for CSS fallbacks
    this.checkCSSFallbacks(content, analysis);
    
    // Check for responsive design
    this.checkCSSResponsive(content, analysis);
    
    // Check for feature queries
    this.checkFeatureQueries(content, analysis);
    
    // Check for progressive enhancement patterns
    this.checkCSSProgressivePatterns(content, analysis);
  }

  /**
   * Analyze JavaScript for progressive enhancement
   */
  async analyzeJavaScript(content, analysis) {
    // Check for feature detection
    this.checkFeatureDetection(content, analysis);
    
    // Check for graceful degradation
    this.checkJSGracefulDegradation(content, analysis);
    
    // Check for progressive enhancement patterns
    this.checkJSProgressivePatterns(content, analysis);
    
    // Check for error handling
    this.checkErrorHandling(content, analysis);
  }

  /**
   * Check semantic HTML
   */
  checkSemanticHTML(content, analysis) {
    const semanticTags = [
      'header', 'nav', 'main', 'section', 'article', 'aside', 'footer',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'form', 'label'
    ];

    const foundSemantic = semanticTags.filter(tag => 
      new RegExp(`<${tag}[\\s>]`, 'i').test(content)
    );

    if (foundSemantic.length > 0) {
      analysis.patterns.good.push({
        type: 'semantic_html',
        message: `Found ${foundSemantic.length} semantic HTML elements`,
        elements: foundSemantic
      });
    } else {
      analysis.issues.accessibility.push({
        type: 'missing_semantic_html',
        severity: 'high',
        message: 'No semantic HTML elements found',
        suggestion: 'Use semantic HTML elements for better structure and accessibility'
      });
    }
  }

  /**
   * Check fallback content
   */
  checkFallbackContent(content, analysis) {
    // Check for image alt text
    const imgTags = content.match(/<img[^>]*>/gi) || [];
    const imgWithoutAlt = imgTags.filter(img => !img.includes('alt='));
    
    if (imgWithoutAlt.length > 0) {
      analysis.issues.fallback.push({
        type: 'missing_alt_text',
        severity: 'high',
        message: `${imgWithoutAlt.length} images without alt text`,
        suggestion: 'Add alt text to all images for accessibility and fallback content'
      });
    }

    // Check for video fallback
    const videoTags = content.match(/<video[^>]*>/gi) || [];
    const videoWithoutFallback = videoTags.filter(video => 
      !video.includes('poster=') && !content.includes('</video>')
    );
    
    if (videoWithoutFallback.length > 0) {
      analysis.issues.fallback.push({
        type: 'missing_video_fallback',
        severity: 'medium',
        message: `${videoWithoutFallback.length} videos without fallback content`,
        suggestion: 'Add poster images and fallback content for videos'
      });
    }

    // Check for canvas fallback
    const canvasTags = content.match(/<canvas[^>]*>/gi) || [];
    const canvasWithoutFallback = canvasTags.filter(canvas => 
      !content.includes('</canvas>') || 
      !content.match(/<canvas[^>]*>.*<\/canvas>/s)
    );
    
    if (canvasWithoutFallback.length > 0) {
      analysis.issues.fallback.push({
        type: 'missing_canvas_fallback',
        severity: 'medium',
        message: `${canvasWithoutFallback.length} canvas elements without fallback content`,
        suggestion: 'Add fallback content inside canvas elements'
      });
    }
  }

  /**
   * Check responsive design
   */
  checkResponsiveDesign(content, analysis) {
    // Check for viewport meta tag
    if (!content.includes('viewport')) {
      analysis.issues.responsive.push({
        type: 'missing_viewport',
        severity: 'high',
        message: 'Missing viewport meta tag',
        suggestion: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">'
      });
    } else {
      analysis.patterns.good.push({
        type: 'viewport_meta',
        message: 'Viewport meta tag found'
      });
    }

    // Check for responsive images
    const imgTags = content.match(/<img[^>]*>/gi) || [];
    const responsiveImages = imgTags.filter(img => 
      img.includes('srcset=') || img.includes('sizes=')
    );
    
    if (responsiveImages.length > 0) {
      analysis.patterns.good.push({
        type: 'responsive_images',
        message: `${responsiveImages.length} responsive images found`
      });
    } else if (imgTags.length > 0) {
      analysis.issues.responsive.push({
        type: 'non_responsive_images',
        severity: 'medium',
        message: `${imgTags.length} images without responsive attributes`,
        suggestion: 'Use srcset and sizes attributes for responsive images'
      });
    }
  }

  /**
   * Check accessibility
   */
  checkAccessibility(content, analysis) {
    // Check for lang attribute
    if (!content.includes('lang=')) {
      analysis.issues.accessibility.push({
        type: 'missing_lang',
        severity: 'high',
        message: 'Missing lang attribute on html element',
        suggestion: 'Add lang attribute to html element for screen readers'
      });
    } else {
      analysis.patterns.good.push({
        type: 'lang_attribute',
        message: 'Language attribute found'
      });
    }

    // Check for skip links
    if (!content.includes('skip') && !content.includes('skip-link')) {
      analysis.issues.accessibility.push({
        type: 'missing_skip_links',
        severity: 'medium',
        message: 'No skip links found',
        suggestion: 'Add skip links for keyboard navigation'
      });
    } else {
      analysis.patterns.good.push({
        type: 'skip_links',
        message: 'Skip links found'
      });
    }
  }

  /**
   * Check graceful degradation
   */
  checkGracefulDegradation(content, analysis) {
    // Check for noscript tags
    if (!content.includes('<noscript>')) {
      analysis.issues.degradation.push({
        type: 'missing_noscript',
        severity: 'medium',
        message: 'No noscript fallback found',
        suggestion: 'Add noscript fallback for users with JavaScript disabled'
      });
    } else {
      analysis.patterns.good.push({
        type: 'noscript_fallback',
        message: 'Noscript fallback found'
      });
    }

    // Check for CSS fallbacks
    const cssFallbacks = content.match(/@supports[^{]*\{[^}]*\}/gi) || [];
    if (cssFallbacks.length > 0) {
      analysis.patterns.good.push({
        type: 'css_feature_queries',
        message: `${cssFallbacks.length} CSS feature queries found`
      });
    }
  }

  /**
   * Check CSS fallbacks
   */
  checkCSSFallbacks(content, analysis) {
    // Check for CSS custom properties fallbacks
    const customProps = content.match(/var\(--[^)]+\)/gi) || [];
    const customPropsWithFallback = content.match(/var\(--[^)]+,\s*[^)]+\)/gi) || [];
    
    if (customProps.length > 0 && customPropsWithFallback.length === 0) {
      analysis.issues.fallback.push({
        type: 'missing_css_fallbacks',
        severity: 'medium',
        message: 'CSS custom properties without fallbacks',
        suggestion: 'Add fallback values for CSS custom properties'
      });
    } else if (customPropsWithFallback.length > 0) {
      analysis.patterns.good.push({
        type: 'css_fallbacks',
        message: `${customPropsWithFallback.length} CSS custom properties with fallbacks`
      });
    }

    // Check for CSS Grid fallbacks
    const gridProperties = content.match(/display:\s*grid/gi) || [];
    const flexboxFallbacks = content.match(/display:\s*flex/gi) || [];
    
    if (gridProperties.length > 0 && flexboxFallbacks.length === 0) {
      analysis.issues.fallback.push({
        type: 'missing_grid_fallback',
        severity: 'medium',
        message: 'CSS Grid without Flexbox fallback',
        suggestion: 'Add Flexbox fallback for CSS Grid layouts'
      });
    } else if (gridProperties.length > 0 && flexboxFallbacks.length > 0) {
      analysis.patterns.good.push({
        type: 'grid_fallback',
        message: 'CSS Grid with Flexbox fallback found'
      });
    }
  }

  /**
   * Check CSS responsive design
   */
  checkCSSResponsive(content, analysis) {
    // Check for media queries
    const mediaQueries = content.match(/@media[^{]*\{[^}]*\}/gi) || [];
    
    if (mediaQueries.length > 0) {
      analysis.patterns.good.push({
        type: 'media_queries',
        message: `${mediaQueries.length} media queries found`
      });
    } else {
      analysis.issues.responsive.push({
        type: 'missing_media_queries',
        severity: 'high',
        message: 'No media queries found',
        suggestion: 'Add media queries for responsive design'
      });
    }

    // Check for flexible units
    const flexibleUnits = content.match(/[0-9]+(?:rem|em|%|vw|vh)/gi) || [];
    const fixedUnits = content.match(/[0-9]+px/gi) || [];
    
    if (flexibleUnits.length > 0) {
      analysis.patterns.good.push({
        type: 'flexible_units',
        message: `${flexibleUnits.length} flexible units found`
      });
    }
    
    if (fixedUnits.length > flexibleUnits.length) {
      analysis.issues.responsive.push({
        type: 'too_many_fixed_units',
        severity: 'medium',
        message: 'More fixed units than flexible units',
        suggestion: 'Use more flexible units (rem, em, %, vw, vh) for responsive design'
      });
    }
  }

  /**
   * Check feature queries
   */
  checkFeatureQueries(content, analysis) {
    const featureQueries = content.match(/@supports[^{]*\{[^}]*\}/gi) || [];
    
    if (featureQueries.length > 0) {
      analysis.patterns.good.push({
        type: 'feature_queries',
        message: `${featureQueries.length} CSS feature queries found`
      });
    } else {
      analysis.issues.featureDetection.push({
        type: 'missing_feature_queries',
        severity: 'low',
        message: 'No CSS feature queries found',
        suggestion: 'Use @supports for progressive enhancement'
      });
    }
  }

  /**
   * Check CSS progressive patterns
   */
  checkCSSProgressivePatterns(content, analysis) {
    // Check for mobile-first approach
    const mobileFirst = content.match(/@media\s*\(min-width:[^)]+\)/gi) || [];
    const desktopFirst = content.match(/@media\s*\(max-width:[^)]+\)/gi) || [];
    
    if (mobileFirst.length > desktopFirst.length) {
      analysis.patterns.good.push({
        type: 'mobile_first',
        message: 'Mobile-first approach detected'
      });
    } else if (desktopFirst.length > 0) {
      analysis.patterns.issues.push({
        type: 'desktop_first',
        message: 'Desktop-first approach detected',
        suggestion: 'Consider mobile-first approach for better performance'
      });
    }
  }

  /**
   * Check feature detection
   */
  checkFeatureDetection(content, analysis) {
    // Check for feature detection patterns
    const featureDetectionPatterns = [
      /if\s*\(\s*typeof\s+\w+\s*!==\s*['"]undefined['"]\s*\)/gi,
      /if\s*\(\s*'[^']+'\s+in\s+window\s*\)/gi,
      /if\s*\(\s*window\.\w+\s*\)/gi,
      /if\s*\(\s*navigator\.\w+\s*\)/gi,
      /if\s*\(\s*document\.\w+\s*\)/gi
    ];

    const foundPatterns = featureDetectionPatterns.filter(pattern => 
      pattern.test(content)
    );

    if (foundPatterns.length > 0) {
      analysis.patterns.good.push({
        type: 'feature_detection',
        message: `${foundPatterns.length} feature detection patterns found`
      });
    } else {
      analysis.issues.featureDetection.push({
        type: 'missing_feature_detection',
        severity: 'medium',
        message: 'No feature detection patterns found',
        suggestion: 'Add feature detection before using modern APIs'
      });
    }
  }

  /**
   * Check JavaScript graceful degradation
   */
  checkJSGracefulDegradation(content, analysis) {
    // Check for try-catch blocks
    const tryCatchBlocks = content.match(/try\s*\{[^}]*\}\s*catch/gi) || [];
    
    if (tryCatchBlocks.length > 0) {
      analysis.patterns.good.push({
        type: 'error_handling',
        message: `${tryCatchBlocks.length} try-catch blocks found`
      });
    } else {
      analysis.issues.degradation.push({
        type: 'missing_error_handling',
        severity: 'medium',
        message: 'No error handling found',
        suggestion: 'Add try-catch blocks for graceful error handling'
      });
    }

    // Check for null checks
    const nullChecks = content.match(/if\s*\(\s*[^)]+\s*!==\s*null\s*\)/gi) || [];
    
    if (nullChecks.length > 0) {
      analysis.patterns.good.push({
        type: 'null_checks',
        message: `${nullChecks.length} null checks found`
      });
    }
  }

  /**
   * Check JavaScript progressive patterns
   */
  checkJSProgressivePatterns(content, analysis) {
    // Check for module loading
    const modulePatterns = [
      /import\s+.*\s+from\s+['"][^'"]+['"]/gi,
      /require\(['"][^'"]+['"]\)/gi,
      /System\.import\(['"][^'"]+['"]\)/gi
    ];

    const foundModules = modulePatterns.filter(pattern => 
      pattern.test(content)
    );

    if (foundModules.length > 0) {
      analysis.patterns.good.push({
        type: 'module_loading',
        message: 'Module loading patterns found'
      });
    }

    // Check for async/await
    const asyncAwait = content.match(/async\s+function|await\s+/gi) || [];
    
    if (asyncAwait.length > 0) {
      analysis.patterns.good.push({
        type: 'async_await',
        message: `${asyncAwait.length} async/await patterns found`
      });
    }
  }

  /**
   * Check error handling
   */
  checkErrorHandling(content, analysis) {
    // Check for error handling patterns
    const errorPatterns = [
      /\.catch\(/gi,
      /\.then\([^)]*,\s*[^)]*\)/gi,
      /try\s*\{/gi,
      /catch\s*\(/gi,
      /finally\s*\{/gi
    ];

    const foundErrorHandling = errorPatterns.filter(pattern => 
      pattern.test(content)
    );

    if (foundErrorHandling.length > 0) {
      analysis.patterns.good.push({
        type: 'error_handling',
        message: `${foundErrorHandling.length} error handling patterns found`
      });
    } else {
      analysis.issues.degradation.push({
        type: 'missing_error_handling',
        severity: 'medium',
        message: 'Limited error handling found',
        suggestion: 'Add comprehensive error handling for better user experience'
      });
    }
  }

  /**
   * Calculate file score
   */
  calculateFileScore(analysis) {
    let score = 100;
    
    // Deduct points for issues
    const issueWeights = {
      fallback: { high: 15, medium: 10, low: 5 },
      degradation: { high: 15, medium: 10, low: 5 },
      featureDetection: { high: 10, medium: 5, low: 2 },
      responsive: { high: 15, medium: 10, low: 5 },
      accessibility: { high: 20, medium: 10, low: 5 }
    };

    for (const [category, issues] of Object.entries(analysis.issues)) {
      for (const issue of issues) {
        const weight = issueWeights[category]?.[issue.severity] || 5;
        score -= weight;
      }
    }

    // Add points for good patterns
    score += analysis.patterns.good.length * 2;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate overall score
   */
  calculateOverallScore(results) {
    if (results.files.length === 0) return 0;
    
    const totalScore = results.files.reduce((sum, file) => sum + file.score, 0);
    return Math.round(totalScore / results.files.length);
  }

  /**
   * Generate recommendations
   */
  generateRecommendations(results) {
    const recommendations = [];

    // Fallback recommendations
    if (results.summary.fallbackIssues > 0) {
      recommendations.push({
        type: 'fallbacks',
        priority: 'high',
        title: 'Add Fallback Content',
        message: `Found ${results.summary.fallbackIssues} fallback issues`,
        suggestion: 'Add fallback content for images, videos, and interactive elements',
        examples: [
          'Add alt text to all images',
          'Add poster images for videos',
          'Add fallback content for canvas elements'
        ]
      });
    }

    // Responsive design recommendations
    if (results.summary.responsiveIssues > 0) {
      recommendations.push({
        type: 'responsive',
        priority: 'high',
        title: 'Improve Responsive Design',
        message: `Found ${results.summary.responsiveIssues} responsive design issues`,
        suggestion: 'Implement responsive design patterns',
        examples: [
          'Add viewport meta tag',
          'Use flexible units (rem, em, %, vw, vh)',
          'Implement mobile-first approach'
        ]
      });
    }

    // Accessibility recommendations
    if (results.summary.accessibilityIssues > 0) {
      recommendations.push({
        type: 'accessibility',
        priority: 'high',
        title: 'Improve Accessibility',
        message: `Found ${results.summary.accessibilityIssues} accessibility issues`,
        suggestion: 'Implement accessibility best practices',
        examples: [
          'Add lang attribute to html element',
          'Use semantic HTML elements',
          'Add skip links for keyboard navigation'
        ]
      });
    }

    // Feature detection recommendations
    if (results.summary.featureDetectionIssues > 0) {
      recommendations.push({
        type: 'feature_detection',
        priority: 'medium',
        title: 'Add Feature Detection',
        message: `Found ${results.summary.featureDetectionIssues} missing feature detection`,
        suggestion: 'Add feature detection before using modern APIs',
        examples: [
          'Check for API support before using',
          'Use CSS @supports for progressive enhancement',
          'Implement graceful degradation patterns'
        ]
      });
    }

    return recommendations;
  }

  /**
   * Identify patterns
   */
  identifyPatterns(results) {
    const patterns = {
      good: [],
      issues: [],
      missing: []
    };

    // Collect all patterns from files
    for (const file of results.files) {
      patterns.good.push(...file.patterns.good);
      patterns.issues.push(...file.patterns.issues);
      patterns.missing.push(...file.patterns.missing);
    }

    // Count pattern occurrences
    const patternCounts = {};
    [...patterns.good, ...patterns.issues, ...patterns.missing].forEach(pattern => {
      const key = pattern.type;
      patternCounts[key] = (patternCounts[key] || 0) + 1;
    });

    // Sort by frequency
    patterns.good.sort((a, b) => (patternCounts[b.type] || 0) - (patternCounts[a.type] || 0));
    patterns.issues.sort((a, b) => (patternCounts[b.type] || 0) - (patternCounts[a.type] || 0));
    patterns.missing.sort((a, b) => (patternCounts[b.type] || 0) - (patternCounts[a.type] || 0));

    return patterns;
  }

  /**
   * Helper methods
   */
  async readFile(filePath) {
    try {
      const fs = await import('fs/promises');
      return await fs.readFile(filePath, 'utf8');
    } catch (error) {
      return '';
    }
  }

  getFileExtension(filePath) {
    return filePath.split('.').pop().toLowerCase();
  }

  initializeFallbackPatterns() {
    return {
      images: ['alt', 'title', 'srcset', 'sizes'],
      videos: ['poster', 'controls', 'preload'],
      canvas: ['fallback content', 'noscript'],
      audio: ['controls', 'preload'],
      forms: ['label', 'placeholder', 'required']
    };
  }

  initializeDegradationPatterns() {
    return {
      javascript: ['noscript', 'try-catch', 'feature detection'],
      css: ['@supports', 'fallbacks', 'progressive enhancement'],
      html: ['semantic elements', 'progressive enhancement']
    };
  }
}

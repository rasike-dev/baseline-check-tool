/**
 * Accessibility Recommendations Engine
 * Generates actionable recommendations based on accessibility analysis
 */

export class AccessibilityRecommendations {
  constructor(options = {}) {
    this.options = {
      includeCodeExamples: true,
      includeWCAGReferences: true,
      includePriorityLevels: true,
      ...options
    };
  }

  /**
   * Generate recommendations from accessibility analysis
   */
  generateRecommendations(analysis) {
    const recommendations = {
      critical: this.generateCriticalRecommendations(analysis),
      high: this.generateHighPriorityRecommendations(analysis),
      medium: this.generateMediumPriorityRecommendations(analysis),
      low: this.generateLowPriorityRecommendations(analysis),
      summary: this.generateSummary(analysis)
    };

    return recommendations;
  }

  /**
   * Generate critical priority recommendations
   */
  generateCriticalRecommendations(analysis) {
    const recommendations = [];
    const criticalIssues = analysis.issues.filter(issue => issue.severity === 'high');

    if (criticalIssues.length === 0) {
      return [];
    }

    // Missing alt text
    const missingAltText = criticalIssues.filter(issue => issue.type === 'missing_alt_text');
    if (missingAltText.length > 0) {
      recommendations.push({
        title: 'Fix Missing Alt Text',
        description: 'Images without alt text are inaccessible to screen readers',
        priority: 'critical',
        impact: 'high',
        effort: 'low',
        issues: missingAltText.length,
        wcag: 'WCAG 1.1.1',
        level: 'A',
        actions: [
          'Add descriptive alt text to all images',
          'Use alt="" for decorative images',
          'Ensure alt text describes the image content',
          'Avoid generic text like "image" or "photo"'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '<img src="chart.png">',
          after: '<img src="chart.png" alt="Sales chart showing 25% increase in Q3">'
        } : null,
        resources: [
          'https://webaim.org/articles/images/',
          'https://www.w3.org/WAI/tutorials/images/'
        ]
      });
    }

    // Missing form labels
    const missingFormLabels = criticalIssues.filter(issue => issue.type === 'missing_form_label');
    if (missingFormLabels.length > 0) {
      recommendations.push({
        title: 'Add Form Labels',
        description: 'Form inputs without labels are inaccessible to screen readers',
        priority: 'critical',
        impact: 'high',
        effort: 'low',
        issues: missingFormLabels.length,
        wcag: 'WCAG 1.3.1',
        level: 'A',
        actions: [
          'Add <label> elements for all form inputs',
          'Use aria-label for inputs without visible labels',
          'Ensure labels are properly associated with inputs',
          'Test with screen reader to verify accessibility'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '<input type="text" name="email">',
          after: '<label for="email">Email Address</label>\n<input type="text" id="email" name="email">'
        } : null,
        resources: [
          'https://webaim.org/techniques/forms/',
          'https://www.w3.org/WAI/tutorials/forms/'
        ]
      });
    }

    // Missing language attribute
    const missingLang = criticalIssues.filter(issue => issue.type === 'missing_lang_attribute');
    if (missingLang.length > 0) {
      recommendations.push({
        title: 'Add Language Attribute',
        description: 'HTML documents must specify the primary language',
        priority: 'critical',
        impact: 'high',
        effort: 'low',
        issues: missingLang.length,
        wcag: 'WCAG 3.1.1',
        level: 'A',
        actions: [
          'Add lang attribute to html element',
          'Use appropriate language code (e.g., "en", "es", "fr")',
          'Add lang attribute for text in different languages',
          'Ensure language codes are valid ISO 639-1 codes'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '<html>',
          after: '<html lang="en">'
        } : null,
        resources: [
          'https://www.w3.org/International/questions/qa-html-language-declarations',
          'https://www.w3.org/WAI/WCAG21/Understanding/language-of-page.html'
        ]
      });
    }

    // Missing table headers
    const missingTableHeaders = criticalIssues.filter(issue => issue.type === 'missing_table_headers');
    if (missingTableHeaders.length > 0) {
      recommendations.push({
        title: 'Add Table Headers',
        description: 'Tables without headers are inaccessible to screen readers',
        priority: 'critical',
        impact: 'high',
        effort: 'medium',
        issues: missingTableHeaders.length,
        wcag: 'WCAG 1.3.1',
        level: 'A',
        actions: [
          'Add <th> elements for table headers',
          'Use scope="col" for column headers',
          'Use scope="row" for row headers',
          'Ensure headers are properly associated with data cells'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '<table>\n  <tr>\n    <td>Name</td>\n    <td>Age</td>\n  </tr>\n</table>',
          after: '<table>\n  <tr>\n    <th scope="col">Name</th>\n    <th scope="col">Age</th>\n  </tr>\n</table>'
        } : null,
        resources: [
          'https://webaim.org/techniques/tables/',
          'https://www.w3.org/WAI/tutorials/tables/'
        ]
      });
    }

    // Empty headings
    const emptyHeadings = criticalIssues.filter(issue => issue.type === 'empty_heading');
    if (emptyHeadings.length > 0) {
      recommendations.push({
        title: 'Fix Empty Headings',
        description: 'Empty headings provide no information to screen readers',
        priority: 'critical',
        impact: 'high',
        effort: 'low',
        issues: emptyHeadings.length,
        wcag: 'WCAG 1.3.1',
        level: 'A',
        actions: [
          'Add descriptive text to all heading elements',
          'Remove empty heading elements if not needed',
          'Ensure headings provide meaningful structure',
          'Test heading structure with screen reader'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '<h2></h2>',
          after: '<h2>Product Features</h2>'
        } : null,
        resources: [
          'https://webaim.org/techniques/semanticstructure/',
          'https://www.w3.org/WAI/tutorials/page-structure/headings/'
        ]
      });
    }

    return recommendations;
  }

  /**
   * Generate high priority recommendations
   */
  generateHighPriorityRecommendations(analysis) {
    const recommendations = [];
    const highIssues = analysis.issues.filter(issue => issue.severity === 'high');

    // Color-only information
    const colorOnlyInfo = highIssues.filter(issue => issue.type === 'color_only_information');
    if (colorOnlyInfo.length > 0) {
      recommendations.push({
        title: 'Fix Color-Only Information',
        description: 'Information conveyed only through color is inaccessible to colorblind users',
        priority: 'high',
        impact: 'high',
        effort: 'medium',
        issues: colorOnlyInfo.length,
        wcag: 'WCAG 1.4.1',
        level: 'A',
        actions: [
          'Add additional visual indicators beyond color',
          'Use icons, text, or patterns alongside color',
          'Ensure information is accessible without color',
          'Test with colorblind simulation tools'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '.error { color: red; }',
          after: '.error { color: red; font-weight: bold; text-decoration: underline; }'
        } : null,
        resources: [
          'https://webaim.org/articles/visual/color',
          'https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html'
        ]
      });
    }

    // Missing main landmark
    const missingMain = highIssues.filter(issue => issue.type === 'missing_main_landmark');
    if (missingMain.length > 0) {
      recommendations.push({
        title: 'Add Main Landmark',
        description: 'Pages should have a main landmark for screen reader navigation',
        priority: 'high',
        impact: 'high',
        effort: 'low',
        issues: missingMain.length,
        wcag: 'WCAG 1.3.1',
        level: 'A',
        actions: [
          'Add <main> element to wrap primary content',
          'Ensure only one main element per page',
          'Place main content after navigation and before footer',
          'Test with screen reader landmark navigation'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '<body>\n  <nav>...</nav>\n  <div class="content">...</div>\n</body>',
          after: '<body>\n  <nav>...</nav>\n  <main>\n    <div class="content">...</div>\n  </main>\n</body>'
        } : null,
        resources: [
          'https://webaim.org/techniques/semanticstructure/',
          'https://www.w3.org/WAI/tutorials/page-structure/regions/'
        ]
      });
    }

    // Missing h1 heading
    const missingH1 = highIssues.filter(issue => issue.type === 'missing_h1');
    if (missingH1.length > 0) {
      recommendations.push({
        title: 'Add Main Heading',
        description: 'Pages should have a single h1 heading as the main page title',
        priority: 'high',
        impact: 'high',
        effort: 'low',
        issues: missingH1.length,
        wcag: 'WCAG 1.3.1',
        level: 'A',
        actions: [
          'Add h1 element as the main page heading',
          'Ensure h1 describes the page content',
          'Use only one h1 per page',
          'Place h1 near the beginning of main content'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '<main>\n  <h2>Welcome</h2>\n  <p>Content...</p>\n</main>',
          after: '<main>\n  <h1>Welcome to Our Website</h1>\n  <h2>Features</h2>\n  <p>Content...</p>\n</main>'
        } : null,
        resources: [
          'https://webaim.org/techniques/semanticstructure/',
          'https://www.w3.org/WAI/tutorials/page-structure/headings/'
        ]
      });
    }

    return recommendations;
  }

  /**
   * Generate medium priority recommendations
   */
  generateMediumPriorityRecommendations(analysis) {
    const recommendations = [];
    const mediumIssues = analysis.issues.filter(issue => issue.severity === 'medium');

    // Missing viewport meta tag
    const missingViewport = mediumIssues.filter(issue => issue.type === 'missing_viewport');
    if (missingViewport.length > 0) {
      recommendations.push({
        title: 'Add Viewport Meta Tag',
        description: 'Viewport meta tag is essential for responsive design and accessibility',
        priority: 'medium',
        impact: 'medium',
        effort: 'low',
        issues: missingViewport.length,
        wcag: 'WCAG 1.4.10',
        level: 'AA',
        actions: [
          'Add viewport meta tag to head section',
          'Use appropriate viewport settings',
          'Test on various device sizes',
          'Ensure content is readable without horizontal scrolling'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '<head>\n  <title>Page Title</title>\n</head>',
          after: '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Page Title</title>\n</head>'
        } : null,
        resources: [
          'https://webaim.org/articles/responsive/',
          'https://www.w3.org/WAI/WCAG21/Understanding/reflow.html'
        ]
      });
    }

    // Missing skip links
    const missingSkipLinks = mediumIssues.filter(issue => issue.type === 'missing_skip_links');
    if (missingSkipLinks.length > 0) {
      recommendations.push({
        title: 'Add Skip Links',
        description: 'Skip links help keyboard users navigate past repetitive content',
        priority: 'medium',
        impact: 'medium',
        effort: 'low',
        issues: missingSkipLinks.length,
        wcag: 'WCAG 2.4.1',
        level: 'A',
        actions: [
          'Add skip link to main content',
          'Add skip link to navigation if present',
          'Ensure skip links are visible on focus',
          'Test skip links with keyboard navigation'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '<body>\n  <nav>...</nav>\n  <main>...</main>\n</body>',
          after: '<body>\n  <a href="#main" class="skip-link">Skip to main content</a>\n  <nav>...</nav>\n  <main id="main">...</main>\n</body>'
        } : null,
        resources: [
          'https://webaim.org/techniques/skipnav/',
          'https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks.html'
        ]
      });
    }

    // Heading hierarchy issues
    const headingHierarchy = mediumIssues.filter(issue => issue.type === 'heading_hierarchy_skip');
    if (headingHierarchy.length > 0) {
      recommendations.push({
        title: 'Fix Heading Hierarchy',
        description: 'Proper heading hierarchy helps screen reader users understand content structure',
        priority: 'medium',
        impact: 'medium',
        effort: 'medium',
        issues: headingHierarchy.length,
        wcag: 'WCAG 1.3.1',
        level: 'A',
        actions: [
          'Maintain sequential heading levels (h1, h2, h3, etc.)',
          'Avoid skipping heading levels',
          'Use headings to create logical content structure',
          'Test heading structure with screen reader'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '<h1>Title</h1>\n<h3>Subtitle</h3>',
          after: '<h1>Title</h1>\n<h2>Subtitle</h2>'
        } : null,
        resources: [
          'https://webaim.org/techniques/semanticstructure/',
          'https://www.w3.org/WAI/tutorials/page-structure/headings/'
        ]
      });
    }

    // Excessive div usage
    const excessiveDivs = mediumIssues.filter(issue => issue.type === 'excessive_div_usage');
    if (excessiveDivs.length > 0) {
      recommendations.push({
        title: 'Use Semantic HTML Elements',
        description: 'Semantic HTML elements provide better accessibility and structure',
        priority: 'medium',
        impact: 'medium',
        effort: 'high',
        issues: excessiveDivs.length,
        wcag: 'WCAG 1.3.1',
        level: 'A',
        actions: [
          'Replace divs with semantic elements where appropriate',
          'Use main, section, article, aside, nav, header, footer',
          'Ensure semantic elements are used correctly',
          'Test with screen reader to verify improvements'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '<div class="header">...</div>\n<div class="content">...</div>\n<div class="footer">...</div>',
          after: '<header>...</header>\n<main>...</main>\n<footer>...</footer>'
        } : null,
        resources: [
          'https://webaim.org/techniques/semanticstructure/',
          'https://www.w3.org/WAI/tutorials/page-structure/'
        ]
      });
    }

    return recommendations;
  }

  /**
   * Generate low priority recommendations
   */
  generateLowPriorityRecommendations(analysis) {
    const recommendations = [];
    const lowIssues = analysis.issues.filter(issue => issue.severity === 'low');

    // Alt text too long
    const longAltText = lowIssues.filter(issue => issue.type === 'alt_text_too_long');
    if (longAltText.length > 0) {
      recommendations.push({
        title: 'Shorten Alt Text',
        description: 'Alt text should be concise while remaining descriptive',
        priority: 'low',
        impact: 'low',
        effort: 'low',
        issues: longAltText.length,
        wcag: 'WCAG 1.1.1',
        level: 'A',
        actions: [
          'Keep alt text under 125 characters',
          'Focus on essential information',
          'Avoid redundant information',
          'Test with screen reader for clarity'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: 'alt="This is a very long description of an image that contains way too much information and should be shortened"',
          after: 'alt="Chart showing Q3 sales increase of 25%"'
        } : null,
        resources: [
          'https://webaim.org/articles/images/',
          'https://www.w3.org/WAI/tutorials/images/'
        ]
      });
    }

    // Generic alt text
    const genericAltText = lowIssues.filter(issue => issue.type === 'generic_alt_text');
    if (genericAltText.length > 0) {
      recommendations.push({
        title: 'Improve Alt Text Quality',
        description: 'Generic alt text like "image" or "photo" is not helpful',
        priority: 'low',
        impact: 'low',
        effort: 'low',
        issues: genericAltText.length,
        wcag: 'WCAG 1.1.1',
        level: 'A',
        actions: [
          'Replace generic text with specific descriptions',
          'Describe what the image shows, not what it is',
          'Include relevant context and details',
          'Test with screen reader for usefulness'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: 'alt="image"',
          after: 'alt="Bar chart showing monthly sales data"'
        } : null,
        resources: [
          'https://webaim.org/articles/images/',
          'https://www.w3.org/WAI/tutorials/images/'
        ]
      });
    }

    return recommendations;
  }

  /**
   * Generate summary
   */
  generateSummary(analysis) {
    const totalIssues = analysis.issues.length;
    const criticalIssues = analysis.issues.filter(i => i.severity === 'high').length;
    const mediumIssues = analysis.issues.filter(i => i.severity === 'medium').length;
    const lowIssues = analysis.issues.filter(i => i.severity === 'low').length;

    let priority = 'low';
    if (criticalIssues > 0) {
      priority = 'critical';
    } else if (mediumIssues > 5) {
      priority = 'high';
    } else if (mediumIssues > 0 || lowIssues > 10) {
      priority = 'medium';
    }

    return {
      totalIssues,
      criticalIssues,
      mediumIssues,
      lowIssues,
      priority,
      accessibilityScore: analysis.accessibilityScore,
      wcagLevel: analysis.wcagLevel,
      estimatedEffort: this.calculateEffort(analysis),
      nextSteps: this.getNextSteps(analysis)
    };
  }

  /**
   * Calculate estimated effort
   */
  calculateEffort(analysis) {
    const criticalIssues = analysis.issues.filter(i => i.severity === 'high').length;
    const mediumIssues = analysis.issues.filter(i => i.severity === 'medium').length;
    const lowIssues = analysis.issues.filter(i => i.severity === 'low').length;

    const effort = (criticalIssues * 2) + (mediumIssues * 1) + (lowIssues * 0.5);
    
    if (effort <= 5) return 'Low (1-2 days)';
    if (effort <= 15) return 'Medium (3-5 days)';
    if (effort <= 30) return 'High (1-2 weeks)';
    return 'Very High (2+ weeks)';
  }

  /**
   * Get next steps
   */
  getNextSteps(analysis) {
    const steps = [];
    
    if (analysis.issues.filter(i => i.severity === 'high').length > 0) {
      steps.push('Fix critical accessibility issues first');
    }
    
    if (analysis.issues.filter(i => i.type === 'missing_alt_text').length > 0) {
      steps.push('Add alt text to all images');
    }
    
    if (analysis.issues.filter(i => i.type === 'missing_form_label').length > 0) {
      steps.push('Add labels to all form inputs');
    }
    
    if (analysis.issues.filter(i => i.type === 'missing_lang_attribute').length > 0) {
      steps.push('Add lang attribute to html element');
    }
    
    steps.push('Test with screen reader');
    steps.push('Test keyboard navigation');
    steps.push('Validate with accessibility tools');
    
    return steps;
  }
}

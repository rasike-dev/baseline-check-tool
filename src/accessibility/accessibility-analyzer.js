/**
 * Accessibility Analyzer
 * Comprehensive web accessibility analysis focusing on WCAG compliance and browser compatibility
 */

export class AccessibilityAnalyzer {
  constructor(options = {}) {
    this.options = {
      enableWCAGAnalysis: true,
      enableColorContrast: true,
      enableKeyboardNavigation: true,
      enableScreenReader: true,
      enableSemanticHTML: true,
      enableARIA: true,
      enableFocusManagement: true,
      enableAltText: true,
      enableFormLabels: true,
      enableHeadingStructure: true,
      enableLanguageDetection: true,
      enableMotionPreferences: true,
      ...options
    };
    
    this.issues = [];
    this.accessibilityScore = 100;
    this.wcagLevel = 'A';
  }

  /**
   * Analyze content for accessibility issues
   */
  analyzeAccessibility(content, filePath = '') {
    const fileType = this.getFileType(filePath);
    const issues = [];

    // WCAG Analysis
    if (this.options.enableWCAGAnalysis) {
      issues.push(...this.analyzeWCAGCompliance(content, filePath));
    }

    // Color Contrast Analysis
    if (this.options.enableColorContrast) {
      issues.push(...this.analyzeColorContrast(content, filePath));
    }

    // Keyboard Navigation Analysis
    if (this.options.enableKeyboardNavigation) {
      issues.push(...this.analyzeKeyboardNavigation(content, filePath));
    }

    // Screen Reader Analysis
    if (this.options.enableScreenReader) {
      issues.push(...this.analyzeScreenReaderSupport(content, filePath));
    }

    // Semantic HTML Analysis
    if (this.options.enableSemanticHTML) {
      issues.push(...this.analyzeSemanticHTML(content, filePath));
    }

    // ARIA Analysis
    if (this.options.enableARIA) {
      issues.push(...this.analyzeARIAUsage(content, filePath));
    }

    // Focus Management Analysis
    if (this.options.enableFocusManagement) {
      issues.push(...this.analyzeFocusManagement(content, filePath));
    }

    // Alt Text Analysis
    if (this.options.enableAltText) {
      issues.push(...this.analyzeAltText(content, filePath));
    }

    // Form Labels Analysis
    if (this.options.enableFormLabels) {
      issues.push(...this.analyzeFormLabels(content, filePath));
    }

    // Heading Structure Analysis
    if (this.options.enableHeadingStructure) {
      issues.push(...this.analyzeHeadingStructure(content, filePath));
    }

    // Language Detection Analysis
    if (this.options.enableLanguageDetection) {
      issues.push(...this.analyzeLanguageDetection(content, filePath));
    }

    // Motion Preferences Analysis
    if (this.options.enableMotionPreferences) {
      issues.push(...this.analyzeMotionPreferences(content, filePath));
    }

    this.issues = issues;
    this.calculateAccessibilityScore();
    
    return {
      issues,
      accessibilityScore: this.accessibilityScore,
      wcagLevel: this.wcagLevel,
      summary: this.generateSummary()
    };
  }

  /**
   * Analyze WCAG compliance
   */
  analyzeWCAGCompliance(content, filePath) {
    const issues = [];
    const lines = content.split('\n');

    // Check for missing lang attribute
    if (content.includes('<html') && !content.includes('lang=')) {
      issues.push({
        type: 'missing_lang_attribute',
        severity: 'high',
        category: 'wcag',
        title: 'Missing language attribute',
        description: 'HTML document missing lang attribute',
        file: filePath,
        line: this.findLineNumber(content, '<html'),
        code: '<html>',
        suggestion: 'Add lang attribute to html element',
        fix: '<html lang="en">',
        wcag: 'WCAG 3.1.1',
        level: 'A'
      });
    }

    // Check for missing viewport meta tag
    if (content.includes('<head>') && !content.includes('viewport')) {
      issues.push({
        type: 'missing_viewport',
        severity: 'medium',
        category: 'wcag',
        title: 'Missing viewport meta tag',
        description: 'Missing viewport meta tag for responsive design',
        file: filePath,
        line: this.findLineNumber(content, '<head>'),
        code: '<head>',
        suggestion: 'Add viewport meta tag',
        fix: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
        wcag: 'WCAG 1.4.10',
        level: 'AA'
      });
    }

    // Check for missing skip links
    if (content.includes('<body>') && !content.includes('skip') && !content.includes('skip-link')) {
      issues.push({
        type: 'missing_skip_links',
        severity: 'medium',
        category: 'wcag',
        title: 'Missing skip links',
        description: 'No skip links found for keyboard navigation',
        file: filePath,
        line: this.findLineNumber(content, '<body>'),
        code: '<body>',
        suggestion: 'Add skip links for main content',
        fix: '<a href="#main" class="skip-link">Skip to main content</a>',
        wcag: 'WCAG 2.4.1',
        level: 'A'
      });
    }

    return issues;
  }

  /**
   * Analyze color contrast
   */
  analyzeColorContrast(content, filePath) {
    const issues = [];
    const lines = content.split('\n');

    // Check for color-only information
    const colorPatterns = [
      /color:\s*(#[0-9a-fA-F]{3,6}|red|green|blue|yellow|orange|purple|pink|brown|black|white|gray|grey)/g,
      /background-color:\s*(#[0-9a-fA-F]{3,6}|red|green|blue|yellow|orange|purple|pink|brown|black|white|gray|grey)/g,
      /border-color:\s*(#[0-9a-fA-F]{3,6}|red|green|blue|yellow|orange|purple|pink|brown|black|white|gray|grey)/g
    ];

    colorPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const lineNumber = this.getLineNumber(content, match.index);
        const line = lines[lineNumber - 1];
        
        if (this.isInCommentOrString(line, match.index)) continue;
        
        // Check if color is used without additional context
        if (line.includes('color:') && !line.includes('text-decoration') && !line.includes('font-weight')) {
          issues.push({
            type: 'color_only_information',
            severity: 'high',
            category: 'color_contrast',
            title: 'Color-only information',
            description: 'Information conveyed only through color',
            file: filePath,
            line: lineNumber,
            code: line.trim(),
            suggestion: 'Add additional visual indicators beyond color',
            fix: 'Use color + text-decoration, font-weight, or icons',
            wcag: 'WCAG 1.4.1',
            level: 'A'
          });
        }
      }
    });

    // Check for low contrast color combinations
    const lowContrastPatterns = [
      /color:\s*#(fff|ffffff|000|000000)/g,
      /background-color:\s*#(fff|ffffff|000|000000)/g
    ];

    lowContrastPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const lineNumber = this.getLineNumber(content, match.index);
        const line = lines[lineNumber - 1];
        
        if (this.isInCommentOrString(line, match.index)) continue;
        
        issues.push({
          type: 'potential_low_contrast',
          severity: 'medium',
          category: 'color_contrast',
          title: 'Potential low contrast',
          description: 'Color combination may not meet contrast requirements',
          file: filePath,
          line: lineNumber,
          code: line.trim(),
          suggestion: 'Verify color contrast ratio meets WCAG standards',
          fix: 'Use tools to check 4.5:1 contrast ratio for normal text',
          wcag: 'WCAG 1.4.3',
          level: 'AA'
        });
      }
    });

    return issues;
  }

  /**
   * Analyze keyboard navigation
   */
  analyzeKeyboardNavigation(content, filePath) {
    const issues = [];
    const lines = content.split('\n');

    // Check for missing tabindex on interactive elements
    const interactiveElements = [
      /<button[^>]*(?!tabindex)[^>]*>/g,
      /<a[^>]*(?!tabindex)[^>]*>/g,
      /<input[^>]*(?!tabindex)[^>]*>/g,
      /<select[^>]*(?!tabindex)[^>]*>/g,
      /<textarea[^>]*(?!tabindex)[^>]*>/g
    ];

    interactiveElements.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const lineNumber = this.getLineNumber(content, match.index);
        const line = lines[lineNumber - 1];
        
        if (this.isInCommentOrString(line, match.index)) continue;
        
        // Skip if element is disabled or hidden
        if (line.includes('disabled') || line.includes('hidden') || line.includes('style="display:none"')) {
          continue;
        }
        
        issues.push({
          type: 'missing_tabindex',
          severity: 'medium',
          category: 'keyboard_navigation',
          title: 'Missing tabindex on interactive element',
          description: 'Interactive element may not be keyboard accessible',
          file: filePath,
          line: lineNumber,
          code: line.trim(),
          suggestion: 'Ensure element is keyboard accessible',
          fix: 'Add tabindex="0" or ensure element is naturally focusable',
          wcag: 'WCAG 2.1.1',
          level: 'A'
        });
      }
    });

    // Check for tabindex="-1" without proper focus management
    const negativeTabindexPattern = /tabindex="-1"/g;
    let match;
    while ((match = negativeTabindexPattern.exec(content)) !== null) {
      const lineNumber = this.getLineNumber(content, match.index);
      const line = lines[lineNumber - 1];
      
      if (this.isInCommentOrString(line, match.index)) continue;
      
      // Check if there's focus management nearby
      const context = this.getContext(content, match.index, 200);
      if (!context.includes('focus()') && !context.includes('focusable') && !context.includes('keyboard')) {
        issues.push({
          type: 'negative_tabindex_without_focus_management',
          severity: 'medium',
          category: 'keyboard_navigation',
          title: 'Negative tabindex without focus management',
          description: 'Element with tabindex="-1" may not be properly managed',
          file: filePath,
          line: lineNumber,
          code: line.trim(),
          suggestion: 'Ensure focus is properly managed for this element',
          fix: 'Add focus management or remove negative tabindex',
          wcag: 'WCAG 2.1.1',
          level: 'A'
        });
      }
    }

    return issues;
  }

  /**
   * Analyze screen reader support
   */
  analyzeScreenReaderSupport(content, filePath) {
    const issues = [];
    const lines = content.split('\n');

    // Check for missing alt text on images
    const imgPattern = /<img[^>]*(?!alt=)[^>]*>/g;
    let match;
    while ((match = imgPattern.exec(content)) !== null) {
      const lineNumber = this.getLineNumber(content, match.index);
      const line = lines[lineNumber - 1];
      
      if (this.isInCommentOrString(line, match.index)) continue;
      
      // Skip decorative images that might have empty alt
      if (line.includes('alt=""') || line.includes('role="presentation"')) {
        continue;
      }
      
      issues.push({
        type: 'missing_alt_text',
        severity: 'high',
        category: 'screen_reader',
        title: 'Missing alt text on image',
        description: 'Image missing alt attribute for screen readers',
        file: filePath,
        line: lineNumber,
        code: line.trim(),
        suggestion: 'Add descriptive alt text for images',
        fix: 'Add alt="description of image" or alt="" for decorative images',
        wcag: 'WCAG 1.1.1',
        level: 'A'
      });
    }

    // Check for missing labels on form inputs
    const inputPattern = /<input[^>]*(?!aria-label)[^>]*(?!aria-labelledby)[^>]*>/g;
    while ((match = inputPattern.exec(content)) !== null) {
      const lineNumber = this.getLineNumber(content, match.index);
      const line = lines[lineNumber - 1];
      
      if (this.isInCommentOrString(line, match.index)) continue;
      
      // Skip hidden inputs
      if (line.includes('type="hidden"')) continue;
      
      issues.push({
        type: 'missing_form_label',
        severity: 'high',
        category: 'screen_reader',
        title: 'Missing label for form input',
        description: 'Form input missing label or aria-label',
        file: filePath,
        line: lineNumber,
        code: line.trim(),
        suggestion: 'Add label or aria-label for form inputs',
        fix: 'Add <label> or aria-label="description"',
        wcag: 'WCAG 1.3.1',
        level: 'A'
      });
    }

    // Check for missing table headers
    const tablePattern = /<table[^>]*>/g;
    while ((match = tablePattern.exec(content)) !== null) {
      const tableContent = this.getTableContent(content, match.index);
      if (tableContent && !tableContent.includes('<th') && !tableContent.includes('scope=')) {
        const lineNumber = this.getLineNumber(content, match.index);
        issues.push({
          type: 'missing_table_headers',
          severity: 'high',
          category: 'screen_reader',
          title: 'Missing table headers',
          description: 'Table missing proper header structure',
          file: filePath,
          line: lineNumber,
          code: '<table>',
          suggestion: 'Add table headers with proper scope',
          fix: 'Add <th> elements with scope="col" or scope="row"',
          wcag: 'WCAG 1.3.1',
          level: 'A'
        });
      }
    }

    return issues;
  }

  /**
   * Analyze semantic HTML usage
   */
  analyzeSemanticHTML(content, filePath) {
    const issues = [];
    const lines = content.split('\n');

    // Check for div overuse instead of semantic elements
    const divPattern = /<div[^>]*>/g;
    let divCount = 0;
    let match;
    while ((match = divPattern.exec(content)) !== null) {
      divCount++;
    }

    const semanticElements = [
      'main', 'section', 'article', 'aside', 'nav', 'header', 'footer',
      'figure', 'figcaption', 'time', 'mark', 'progress', 'meter'
    ];
    
    let semanticCount = 0;
    semanticElements.forEach(element => {
      const pattern = new RegExp(`<${element}\\b`, 'g');
      const matches = content.match(pattern);
      if (matches) semanticCount += matches.length;
    });

    if (divCount > 10 && semanticCount < 3) {
      issues.push({
        type: 'excessive_div_usage',
        severity: 'medium',
        category: 'semantic_html',
        title: 'Excessive div usage',
        description: 'Using too many divs instead of semantic elements',
        file: filePath,
        line: 1,
        code: 'Multiple <div> elements',
        suggestion: 'Replace divs with semantic HTML elements',
        fix: 'Use main, section, article, aside, nav, header, footer',
        wcag: 'WCAG 1.3.1',
        level: 'A'
      });
    }

    // Check for missing main landmark
    if (content.includes('<body>') && !content.includes('<main')) {
      issues.push({
        type: 'missing_main_landmark',
        severity: 'high',
        category: 'semantic_html',
        title: 'Missing main landmark',
        description: 'Page missing main landmark for screen readers',
        file: filePath,
        line: this.findLineNumber(content, '<body>'),
        code: '<body>',
        suggestion: 'Add main landmark for primary content',
        fix: '<main>...</main>',
        wcag: 'WCAG 1.3.1',
        level: 'A'
      });
    }

    // Check for heading hierarchy
    const headingPattern = /<h([1-6])[^>]*>/g;
    const headings = [];
    while ((match = headingPattern.exec(content)) !== null) {
      headings.push({
        level: parseInt(match[1]),
        line: this.getLineNumber(content, match.index)
      });
    }

    if (headings.length > 0) {
      // Check for missing h1
      if (!headings.some(h => h.level === 1)) {
        issues.push({
          type: 'missing_h1',
          severity: 'high',
          category: 'semantic_html',
          title: 'Missing h1 heading',
          description: 'Page missing main heading (h1)',
          file: filePath,
          line: headings[0].line,
          code: 'Heading structure',
          suggestion: 'Add h1 as the main page heading',
          fix: '<h1>Main Page Title</h1>',
          wcag: 'WCAG 1.3.1',
          level: 'A'
        });
      }

      // Check for heading hierarchy
      for (let i = 1; i < headings.length; i++) {
        const current = headings[i];
        const previous = headings[i - 1];
        
        if (current.level > previous.level + 1) {
          issues.push({
            type: 'heading_hierarchy_skip',
            severity: 'medium',
            category: 'semantic_html',
            title: 'Heading hierarchy skip',
            description: `Skipped heading level from h${previous.level} to h${current.level}`,
            file: filePath,
            line: current.line,
            code: `<h${current.level}>`,
            suggestion: 'Maintain proper heading hierarchy',
            fix: 'Use sequential heading levels (h1, h2, h3, etc.)',
            wcag: 'WCAG 1.3.1',
            level: 'A'
          });
        }
      }
    }

    return issues;
  }

  /**
   * Analyze ARIA usage
   */
  analyzeARIAUsage(content, filePath) {
    const issues = [];
    const lines = content.split('\n');

    // Check for ARIA attributes without proper support
    const ariaPattern = /aria-([a-z-]+)="([^"]*)"/g;
    let match;
    while ((match = ariaPattern.exec(content)) !== null) {
      const attribute = match[1];
      const value = match[2];
      const lineNumber = this.getLineNumber(content, match.index);
      const line = lines[lineNumber - 1];
      
      if (this.isInCommentOrString(line, match.index)) continue;
      
      // Check for common ARIA mistakes
      if (attribute === 'label' && value.trim() === '') {
        issues.push({
          type: 'empty_aria_label',
          severity: 'high',
          category: 'aria',
          title: 'Empty ARIA label',
          description: 'ARIA label is empty',
          file: filePath,
          line: lineNumber,
          code: line.trim(),
          suggestion: 'Provide meaningful ARIA label or remove it',
          fix: 'aria-label="meaningful description" or remove aria-label',
          wcag: 'WCAG 4.1.2',
          level: 'A'
        });
      }

      if (attribute === 'labelledby' && value.trim() === '') {
        issues.push({
          type: 'empty_aria_labelledby',
          severity: 'high',
          category: 'aria',
          title: 'Empty ARIA labelledby',
          description: 'ARIA labelledby is empty',
          file: filePath,
          line: lineNumber,
          code: line.trim(),
          suggestion: 'Provide valid ID reference or remove it',
          fix: 'aria-labelledby="element-id" or remove aria-labelledby',
          wcag: 'WCAG 4.1.2',
          level: 'A'
        });
      }

      if (attribute === 'expanded' && !['true', 'false'].includes(value)) {
        issues.push({
          type: 'invalid_aria_expanded',
          severity: 'medium',
          category: 'aria',
          title: 'Invalid ARIA expanded value',
          description: 'ARIA expanded must be true or false',
          file: filePath,
          line: lineNumber,
          code: line.trim(),
          suggestion: 'Use true or false for aria-expanded',
          fix: 'aria-expanded="true" or aria-expanded="false"',
          wcag: 'WCAG 4.1.2',
          level: 'A'
        });
      }
    }

    // Check for missing ARIA roles where needed
    const customElements = /<[a-z]+-[a-z-]+[^>]*>/g;
    while ((match = customElements.exec(content)) !== null) {
      const lineNumber = this.getLineNumber(content, match.index);
      const line = lines[lineNumber - 1];
      
      if (this.isInCommentOrString(line, match.index)) continue;
      
      if (!line.includes('role=') && !line.includes('aria-')) {
        issues.push({
          type: 'missing_aria_role',
          severity: 'medium',
          category: 'aria',
          title: 'Missing ARIA role on custom element',
          description: 'Custom element missing ARIA role',
          file: filePath,
          line: lineNumber,
          code: line.trim(),
          suggestion: 'Add appropriate ARIA role for custom elements',
          fix: 'role="button", role="link", or other appropriate role',
          wcag: 'WCAG 4.1.2',
          level: 'A'
        });
      }
    }

    return issues;
  }

  /**
   * Analyze focus management
   */
  analyzeFocusManagement(content, filePath) {
    const issues = [];
    const lines = content.split('\n');

    // Check for focus traps without proper management
    const focusTrapPattern = /focus.*trap|trap.*focus/gi;
    if (focusTrapPattern.test(content)) {
      const context = this.getContext(content, content.search(focusTrapPattern), 500);
      if (!context.includes('Escape') && !context.includes('escape')) {
        issues.push({
          type: 'focus_trap_without_escape',
          severity: 'high',
          category: 'focus_management',
          title: 'Focus trap without escape mechanism',
          description: 'Focus trap should allow escape with Escape key',
          file: filePath,
          line: this.getLineNumber(content, content.search(focusTrapPattern)),
          code: 'Focus trap implementation',
          suggestion: 'Add Escape key handler to close focus trap',
          fix: 'Add keydown listener for Escape key',
          wcag: 'WCAG 2.1.1',
          level: 'A'
        });
      }
    }

    // Check for modal dialogs without focus management
    const modalPattern = /modal|dialog/gi;
    if (modalPattern.test(content)) {
      const context = this.getContext(content, content.search(modalPattern), 500);
      if (!context.includes('focus') && !context.includes('tabindex')) {
        issues.push({
          type: 'modal_without_focus_management',
          severity: 'high',
          category: 'focus_management',
          title: 'Modal without focus management',
          description: 'Modal dialog should manage focus properly',
          file: filePath,
          line: this.getLineNumber(content, content.search(modalPattern)),
          code: 'Modal implementation',
          suggestion: 'Implement proper focus management for modal',
          fix: 'Focus first focusable element, trap focus, return focus on close',
          wcag: 'WCAG 2.1.1',
          level: 'A'
        });
      }
    }

    return issues;
  }

  /**
   * Analyze alt text quality
   */
  analyzeAltText(content, filePath) {
    const issues = [];
    const lines = content.split('\n');

    const altPattern = /alt="([^"]*)"/g;
    let match;
    while ((match = altPattern.exec(content)) !== null) {
      const altText = match[1];
      const lineNumber = this.getLineNumber(content, match.index);
      const line = lines[lineNumber - 1];
      
      if (this.isInCommentOrString(line, match.index)) continue;
      
      // Check for generic alt text
      const genericTexts = ['image', 'photo', 'picture', 'img', 'photo.jpg', 'image.png'];
      if (genericTexts.includes(altText.toLowerCase())) {
        issues.push({
          type: 'generic_alt_text',
          severity: 'medium',
          category: 'alt_text',
          title: 'Generic alt text',
          description: 'Alt text is too generic and not descriptive',
          file: filePath,
          line: lineNumber,
          code: line.trim(),
          suggestion: 'Provide more descriptive alt text',
          fix: 'alt="Specific description of what the image shows"',
          wcag: 'WCAG 1.1.1',
          level: 'A'
        });
      }

      // Check for alt text that's too long
      if (altText.length > 125) {
        issues.push({
          type: 'alt_text_too_long',
          severity: 'low',
          category: 'alt_text',
          title: 'Alt text too long',
          description: 'Alt text is longer than recommended',
          file: filePath,
          line: lineNumber,
          code: line.trim(),
          suggestion: 'Keep alt text concise and descriptive',
          fix: 'Shorten alt text to essential information',
          wcag: 'WCAG 1.1.1',
          level: 'A'
        });
      }
    }

    return issues;
  }

  /**
   * Analyze form labels
   */
  analyzeFormLabels(content, filePath) {
    const issues = [];
    const lines = content.split('\n');

    // Check for form inputs without proper labeling
    const inputPattern = /<input[^>]*>/g;
    let match;
    while ((match = inputPattern.exec(content)) !== null) {
      const lineNumber = this.getLineNumber(content, match.index);
      const line = lines[lineNumber - 1];
      
      if (this.isInCommentOrString(line, match.index)) continue;
      
      // Skip hidden inputs
      if (line.includes('type="hidden"')) continue;
      
      // Check if input has proper labeling
      const hasLabel = line.includes('aria-label=') || 
                      line.includes('aria-labelledby=') ||
                      this.hasAssociatedLabel(content, match.index);
      
      if (!hasLabel) {
        issues.push({
          type: 'missing_form_label',
          severity: 'high',
          category: 'form_labels',
          title: 'Missing form label',
          description: 'Form input missing proper label',
          file: filePath,
          line: lineNumber,
          code: line.trim(),
          suggestion: 'Add label or aria-label for form input',
          fix: '<label for="input-id">Label text</label> or aria-label="Label text"',
          wcag: 'WCAG 1.3.1',
          level: 'A'
        });
      }
    }

    return issues;
  }

  /**
   * Analyze heading structure
   */
  analyzeHeadingStructure(content, filePath) {
    const issues = [];
    const lines = content.split('\n');

    const headingPattern = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/g;
    const headings = [];
    let match;
    
    while ((match = headingPattern.exec(content)) !== null) {
      headings.push({
        level: parseInt(match[1]),
        text: match[2].trim(),
        line: this.getLineNumber(content, match.index)
      });
    }

    if (headings.length === 0) {
      issues.push({
        type: 'no_headings',
        severity: 'medium',
        category: 'heading_structure',
        title: 'No headings found',
        description: 'Page has no heading structure',
        file: filePath,
        line: 1,
        code: 'No headings',
        suggestion: 'Add heading structure to organize content',
        fix: 'Add h1, h2, h3, etc. to structure content',
        wcag: 'WCAG 1.3.1',
        level: 'A'
      });
      return issues;
    }

    // Check for multiple h1s
    const h1Count = headings.filter(h => h.level === 1).length;
    if (h1Count > 1) {
      issues.push({
        type: 'multiple_h1',
        severity: 'medium',
        category: 'heading_structure',
        title: 'Multiple h1 headings',
        description: 'Page has multiple h1 headings',
        file: filePath,
        line: headings.find(h => h.level === 1).line,
        code: 'Multiple h1 elements',
        suggestion: 'Use only one h1 per page',
        fix: 'Use h2, h3, etc. for other main headings',
        wcag: 'WCAG 1.3.1',
        level: 'A'
      });
    }

    // Check for empty headings
    const emptyHeadings = headings.filter(h => !h.text || h.text.length === 0);
    emptyHeadings.forEach(heading => {
      issues.push({
        type: 'empty_heading',
        severity: 'high',
        category: 'heading_structure',
        title: 'Empty heading',
        description: 'Heading element is empty',
        file: filePath,
        line: heading.line,
        code: `<h${heading.level}></h${heading.level}>`,
        suggestion: 'Add text content to heading',
        fix: 'Add descriptive text to heading element',
        wcag: 'WCAG 1.3.1',
        level: 'A'
      });
    });

    return issues;
  }

  /**
   * Analyze language detection
   */
  analyzeLanguageDetection(content, filePath) {
    const issues = [];
    const lines = content.split('\n');

    // Check for missing lang attribute
    if (content.includes('<html') && !content.includes('lang=')) {
      issues.push({
        type: 'missing_lang_attribute',
        severity: 'high',
        category: 'language_detection',
        title: 'Missing language attribute',
        description: 'HTML document missing lang attribute',
        file: filePath,
        line: this.findLineNumber(content, '<html'),
        code: '<html>',
        suggestion: 'Add lang attribute to html element',
        fix: '<html lang="en">',
        wcag: 'WCAG 3.1.1',
        level: 'A'
      });
    }

    // Check for language changes without lang attribute
    const langChangePattern = /lang="([^"]+)"/g;
    const languages = [];
    let match;
    while ((match = langChangePattern.exec(content)) !== null) {
      languages.push(match[1]);
    }

    if (languages.length > 1) {
      // Check if language changes are properly marked
      const textContent = content.replace(/<[^>]*>/g, '');
      const foreignTextPattern = /[^\x00-\x7F]/g;
      if (foreignTextPattern.test(textContent) && languages.length < 2) {
        issues.push({
          type: 'foreign_text_without_lang',
          severity: 'medium',
          category: 'language_detection',
          title: 'Foreign text without language attribute',
          description: 'Text in different language without lang attribute',
          file: filePath,
          line: 1,
          code: 'Foreign text content',
          suggestion: 'Add lang attribute for foreign text',
          fix: '<span lang="es">Spanish text</span>',
          wcag: 'WCAG 3.1.2',
          level: 'AA'
        });
      }
    }

    return issues;
  }

  /**
   * Analyze motion preferences
   */
  analyzeMotionPreferences(content, filePath) {
    const issues = [];
    const lines = content.split('\n');

    // Check for animations without reduced motion support
    const animationPatterns = [
      /animation:/g,
      /transition:/g,
      /transform:/g,
      /@keyframes/g
    ];

    animationPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        const context = this.getContext(content, content.search(pattern), 500);
        if (!context.includes('prefers-reduced-motion') && !context.includes('@media (prefers-reduced-motion')) {
          issues.push({
            type: 'animation_without_reduced_motion',
            severity: 'medium',
            category: 'motion_preferences',
            title: 'Animation without reduced motion support',
            description: 'Animations should respect user motion preferences',
            file: filePath,
            line: this.getLineNumber(content, content.search(pattern)),
            code: 'Animation without reduced motion support',
            suggestion: 'Add reduced motion media query',
            fix: '@media (prefers-reduced-motion: reduce) { animation: none; }',
            wcag: 'WCAG 2.3.3',
            level: 'A'
          });
        }
      }
    });

    return issues;
  }

  /**
   * Calculate accessibility score
   */
  calculateAccessibilityScore() {
    let score = 100;
    
    this.issues.forEach(issue => {
      switch (issue.severity) {
        case 'high':
          score -= 15;
          break;
        case 'medium':
          score -= 8;
          break;
        case 'low':
          score -= 3;
          break;
      }
    });
    
    this.accessibilityScore = Math.max(0, score);
    
    // Determine WCAG level
    const highIssues = this.issues.filter(i => i.severity === 'high').length;
    const mediumIssues = this.issues.filter(i => i.severity === 'medium').length;
    
    if (highIssues === 0 && mediumIssues <= 2) {
      this.wcagLevel = 'AAA';
    } else if (highIssues <= 1 && mediumIssues <= 5) {
      this.wcagLevel = 'AA';
    } else {
      this.wcagLevel = 'A';
    }
  }

  /**
   * Generate summary
   */
  generateSummary() {
    const summary = {
      totalIssues: this.issues.length,
      bySeverity: {
        high: this.issues.filter(i => i.severity === 'high').length,
        medium: this.issues.filter(i => i.severity === 'medium').length,
        low: this.issues.filter(i => i.severity === 'low').length
      },
      byCategory: {},
      byWCAGLevel: {
        A: this.issues.filter(i => i.level === 'A').length,
        AA: this.issues.filter(i => i.level === 'AA').length,
        AAA: this.issues.filter(i => i.level === 'AAA').length
      },
      accessibilityScore: this.accessibilityScore,
      wcagLevel: this.wcagLevel
    };

    // Group by category
    this.issues.forEach(issue => {
      const category = issue.category;
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

  findLineNumber(content, searchString) {
    const index = content.indexOf(searchString);
    return index === -1 ? 1 : this.getLineNumber(content, index);
  }

  isInCommentOrString(line, index) {
    return line.includes('//') || line.includes('/*') || line.includes('*') || 
           line.includes('`') || line.includes('codeExample') || line.includes('example');
  }

  getContext(content, index, length) {
    const start = Math.max(0, index - length);
    const end = Math.min(content.length, index + length);
    return content.substring(start, end);
  }

  getTableContent(content, tableIndex) {
    const tableEnd = content.indexOf('</table>', tableIndex);
    if (tableEnd === -1) return null;
    return content.substring(tableIndex, tableEnd);
  }

  hasAssociatedLabel(content, inputIndex) {
    // Look for label elements that reference this input
    const inputIdMatch = content.substring(inputIndex).match(/id="([^"]*)"/);
    if (!inputIdMatch) return false;
    
    const inputId = inputIdMatch[1];
    const labelPattern = new RegExp(`<label[^>]*for="${inputId}"[^>]*>`, 'g');
    return labelPattern.test(content);
  }
}

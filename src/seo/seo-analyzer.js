/**
 * SEO Analyzer
 * Comprehensive SEO analysis focusing on technical SEO, content optimization, and performance factors
 */

export class SEOAnalyzer {
  constructor(options = {}) {
    this.options = {
      enableTechnicalSEO: true,
      enableContentSEO: true,
      enablePerformanceSEO: true,
      enableMobileSEO: true,
      enableSchemaMarkup: true,
      enableMetaTags: true,
      enableHeadingStructure: true,
      enableImageSEO: true,
      enableInternalLinking: true,
      enableURLStructure: true,
      enablePageSpeed: true,
      enableCoreWebVitals: true,
      ...options
    };
    
    this.issues = [];
    this.seoScore = 100;
    this.seoLevel = 'Good';
  }

  /**
   * Analyze content for SEO issues
   */
  analyzeSEO(content, filePath = '') {
    const fileType = this.getFileType(filePath);
    const issues = [];

    // Technical SEO Analysis
    if (this.options.enableTechnicalSEO) {
      issues.push(...this.analyzeTechnicalSEO(content, filePath));
    }

    // Content SEO Analysis
    if (this.options.enableContentSEO) {
      issues.push(...this.analyzeContentSEO(content, filePath));
    }

    // Performance SEO Analysis
    if (this.options.enablePerformanceSEO) {
      issues.push(...this.analyzePerformanceSEO(content, filePath));
    }

    // Mobile SEO Analysis
    if (this.options.enableMobileSEO) {
      issues.push(...this.analyzeMobileSEO(content, filePath));
    }

    // Schema Markup Analysis
    if (this.options.enableSchemaMarkup) {
      issues.push(...this.analyzeSchemaMarkup(content, filePath));
    }

    // Meta Tags Analysis
    if (this.options.enableMetaTags) {
      issues.push(...this.analyzeMetaTags(content, filePath));
    }

    // Heading Structure Analysis
    if (this.options.enableHeadingStructure) {
      issues.push(...this.analyzeHeadingStructure(content, filePath));
    }

    // Image SEO Analysis
    if (this.options.enableImageSEO) {
      issues.push(...this.analyzeImageSEO(content, filePath));
    }

    // Internal Linking Analysis
    if (this.options.enableInternalLinking) {
      issues.push(...this.analyzeInternalLinking(content, filePath));
    }

    // URL Structure Analysis
    if (this.options.enableURLStructure) {
      issues.push(...this.analyzeURLStructure(content, filePath));
    }

    this.issues = issues;
    this.calculateSEOScore();
    
    return {
      issues,
      seoScore: this.seoScore,
      seoLevel: this.seoLevel,
      summary: this.generateSummary()
    };
  }

  /**
   * Analyze Technical SEO
   */
  analyzeTechnicalSEO(content, filePath) {
    const issues = [];
    const lines = content.split('\n');

    // Check for missing title tag
    if (content.includes('<head>') && !content.includes('<title>')) {
      issues.push({
        type: 'missing_title_tag',
        severity: 'high',
        category: 'technical_seo',
        title: 'Missing title tag',
        description: 'Page missing title tag for SEO',
        file: filePath,
        line: this.findLineNumber(content, '<head>'),
        code: '<head>',
        suggestion: 'Add descriptive title tag',
        fix: '<title>Page Title - Site Name</title>',
        impact: 'High',
        effort: 'Low'
      });
    }

    // Check for missing meta description
    if (content.includes('<head>') && !content.includes('meta name="description"')) {
      issues.push({
        type: 'missing_meta_description',
        severity: 'high',
        category: 'technical_seo',
        title: 'Missing meta description',
        description: 'Page missing meta description for SEO',
        file: filePath,
        line: this.findLineNumber(content, '<head>'),
        code: '<head>',
        suggestion: 'Add meta description tag',
        fix: '<meta name="description" content="Page description">',
        impact: 'High',
        effort: 'Low'
      });
    }

    // Check for missing canonical URL
    if (content.includes('<head>') && !content.includes('rel="canonical"')) {
      issues.push({
        type: 'missing_canonical_url',
        severity: 'medium',
        category: 'technical_seo',
        title: 'Missing canonical URL',
        description: 'Page missing canonical URL to prevent duplicate content',
        file: filePath,
        line: this.findLineNumber(content, '<head>'),
        code: '<head>',
        suggestion: 'Add canonical URL tag',
        fix: '<link rel="canonical" href="https://example.com/page">',
        impact: 'Medium',
        effort: 'Low'
      });
    }

    // Check for missing robots meta tag
    if (content.includes('<head>') && !content.includes('name="robots"')) {
      issues.push({
        type: 'missing_robots_meta',
        severity: 'low',
        category: 'technical_seo',
        title: 'Missing robots meta tag',
        description: 'Page missing robots meta tag for search engine instructions',
        file: filePath,
        line: this.findLineNumber(content, '<head>'),
        code: '<head>',
        suggestion: 'Add robots meta tag if needed',
        fix: '<meta name="robots" content="index, follow">',
        impact: 'Low',
        effort: 'Low'
      });
    }

    // Check for missing Open Graph tags
    if (content.includes('<head>') && !content.includes('property="og:')) {
      issues.push({
        type: 'missing_open_graph',
        severity: 'medium',
        category: 'technical_seo',
        title: 'Missing Open Graph tags',
        description: 'Page missing Open Graph tags for social media sharing',
        file: filePath,
        line: this.findLineNumber(content, '<head>'),
        code: '<head>',
        suggestion: 'Add Open Graph meta tags',
        fix: '<meta property="og:title" content="Page Title">\n<meta property="og:description" content="Page description">\n<meta property="og:type" content="website">',
        impact: 'Medium',
        effort: 'Medium'
      });
    }

    // Check for missing Twitter Card tags
    if (content.includes('<head>') && !content.includes('name="twitter:')) {
      issues.push({
        type: 'missing_twitter_cards',
        severity: 'low',
        category: 'technical_seo',
        title: 'Missing Twitter Card tags',
        description: 'Page missing Twitter Card tags for social media sharing',
        file: filePath,
        line: this.findLineNumber(content, '<head>'),
        code: '<head>',
        suggestion: 'Add Twitter Card meta tags',
        fix: '<meta name="twitter:card" content="summary">\n<meta name="twitter:title" content="Page Title">\n<meta name="twitter:description" content="Page description">',
        impact: 'Low',
        effort: 'Medium'
      });
    }

    // Check for missing sitemap reference
    if (content.includes('<head>') && !content.includes('sitemap')) {
      issues.push({
        type: 'missing_sitemap_reference',
        severity: 'low',
        category: 'technical_seo',
        title: 'Missing sitemap reference',
        description: 'Page missing sitemap reference in robots.txt or meta tags',
        file: filePath,
        line: this.findLineNumber(content, '<head>'),
        code: '<head>',
        suggestion: 'Add sitemap reference',
        fix: 'Add sitemap.xml to robots.txt or reference in meta tags',
        impact: 'Low',
        effort: 'Low'
      });
    }

    return issues;
  }

  /**
   * Analyze Content SEO
   */
  analyzeContentSEO(content, filePath) {
    const issues = [];
    const lines = content.split('\n');

    // Check for missing h1 tag
    if (content.includes('<body>') && !content.includes('<h1')) {
      issues.push({
        type: 'missing_h1_tag',
        severity: 'high',
        category: 'content_seo',
        title: 'Missing h1 tag',
        description: 'Page missing h1 tag for content structure',
        file: filePath,
        line: this.findLineNumber(content, '<body>'),
        code: '<body>',
        suggestion: 'Add h1 tag with main keyword',
        fix: '<h1>Main Page Heading</h1>',
        impact: 'High',
        effort: 'Low'
      });
    }

    // Check for multiple h1 tags
    const h1Matches = content.match(/<h1[^>]*>/g);
    if (h1Matches && h1Matches.length > 1) {
      issues.push({
        type: 'multiple_h1_tags',
        severity: 'high',
        category: 'content_seo',
        title: 'Multiple h1 tags',
        description: 'Page has multiple h1 tags which can confuse search engines',
        file: filePath,
        line: this.findLineNumber(content, '<h1'),
        code: 'Multiple <h1> tags',
        suggestion: 'Use only one h1 tag per page',
        fix: 'Replace additional h1 tags with h2, h3, etc.',
        impact: 'High',
        effort: 'Medium'
      });
    }

    // Check for heading hierarchy
    const headingPattern = /<h([1-6])[^>]*>/g;
    const headings = [];
    let match;
    while ((match = headingPattern.exec(content)) !== null) {
      headings.push({
        level: parseInt(match[1]),
        line: this.getLineNumber(content, match.index)
      });
    }

    if (headings.length > 0) {
      // Check for heading hierarchy skips
      for (let i = 1; i < headings.length; i++) {
        const current = headings[i];
        const previous = headings[i - 1];
        
        if (current.level > previous.level + 1) {
          issues.push({
            type: 'heading_hierarchy_skip',
            severity: 'medium',
            category: 'content_seo',
            title: 'Heading hierarchy skip',
            description: `Skipped heading level from h${previous.level} to h${current.level}`,
            file: filePath,
            line: current.line,
            code: `<h${current.level}>`,
            suggestion: 'Maintain proper heading hierarchy',
            fix: 'Use sequential heading levels (h1, h2, h3, etc.)',
            impact: 'Medium',
            effort: 'Medium'
          });
        }
      }
    }

    // Check for content length
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    if (textContent.length < 300) {
      issues.push({
        type: 'insufficient_content',
        severity: 'medium',
        category: 'content_seo',
        title: 'Insufficient content',
        description: 'Page has very little text content (less than 300 characters)',
        file: filePath,
        line: 1,
        code: 'Short content',
        suggestion: 'Add more valuable content to the page',
        fix: 'Write at least 300-500 words of quality content',
        impact: 'Medium',
        effort: 'High'
      });
    }

    // Check for keyword density
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = textContent.toLowerCase().split(/\s+/).filter(word => 
      word.length > 2 && !commonWords.includes(word)
    );
    
    if (words.length > 0) {
      const wordCount = {};
      words.forEach(word => {
        wordCount[word] = (wordCount[word] || 0) + 1;
      });
      
      const totalWords = words.length;
      const highFrequencyWords = Object.entries(wordCount)
        .filter(([word, count]) => count / totalWords > 0.05)
        .map(([word, count]) => ({ word, count, percentage: (count / totalWords * 100).toFixed(1) }));
      
      if (highFrequencyWords.length > 0) {
        issues.push({
          type: 'keyword_stuffing',
          severity: 'medium',
          category: 'content_seo',
          title: 'Potential keyword stuffing',
          description: 'Some words appear too frequently in the content',
          file: filePath,
          line: 1,
          code: 'High frequency words',
          suggestion: 'Reduce keyword density to avoid over-optimization',
          fix: 'Aim for 1-3% keyword density, use synonyms and related terms',
          impact: 'Medium',
          effort: 'Medium',
          details: highFrequencyWords.slice(0, 5)
        });
      }
    }

    return issues;
  }

  /**
   * Analyze Performance SEO
   */
  analyzePerformanceSEO(content, filePath) {
    const issues = [];
    const lines = content.split('\n');

    // Check for missing viewport meta tag
    if (content.includes('<head>') && !content.includes('viewport')) {
      issues.push({
        type: 'missing_viewport_meta',
        severity: 'high',
        category: 'performance_seo',
        title: 'Missing viewport meta tag',
        description: 'Page missing viewport meta tag for mobile optimization',
        file: filePath,
        line: this.findLineNumber(content, '<head>'),
        code: '<head>',
        suggestion: 'Add viewport meta tag',
        fix: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
        impact: 'High',
        effort: 'Low'
      });
    }

    // Check for large images without optimization
    const imgPattern = /<img[^>]*src="([^"]*)"[^>]*>/g;
    let imgMatch;
    while ((imgMatch = imgPattern.exec(content)) !== null) {
      const src = imgMatch[1];
      if (src.includes('.')) {
        const ext = src.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
          // Check if image has loading="lazy" attribute
          const imgTag = imgMatch[0];
          if (!imgTag.includes('loading="lazy"')) {
            issues.push({
              type: 'missing_lazy_loading',
              severity: 'medium',
              category: 'performance_seo',
              title: 'Missing lazy loading',
              description: 'Image missing lazy loading attribute',
              file: filePath,
              line: this.getLineNumber(content, imgMatch.index),
              code: imgTag,
              suggestion: 'Add lazy loading to images',
              fix: 'Add loading="lazy" to img tag',
              impact: 'Medium',
              effort: 'Low'
            });
          }
        }
      }
    }

    // Check for missing alt attributes on images
    const imgAltPattern = /<img[^>]*(?!alt=)[^>]*>/g;
    let altMatch;
    while ((altMatch = imgAltPattern.exec(content)) !== null) {
      const imgTag = altMatch[0];
      if (!imgTag.includes('alt=')) {
        issues.push({
          type: 'missing_image_alt',
          severity: 'medium',
          category: 'performance_seo',
          title: 'Missing image alt attribute',
          description: 'Image missing alt attribute for accessibility and SEO',
          file: filePath,
          line: this.getLineNumber(content, altMatch.index),
          code: imgTag,
          suggestion: 'Add descriptive alt attribute to images',
          fix: 'Add alt="description" to img tag',
          impact: 'Medium',
          effort: 'Low'
        });
      }
    }

    // Check for inline styles (performance impact)
    const inlineStylePattern = /style="[^"]*"/g;
    let inlineStyleCount = 0;
    let styleMatch;
    while ((styleMatch = inlineStylePattern.exec(content)) !== null) {
      inlineStyleCount++;
    }
    
    if (inlineStyleCount > 5) {
      issues.push({
        type: 'excessive_inline_styles',
        severity: 'low',
        category: 'performance_seo',
        title: 'Excessive inline styles',
        description: 'Page has many inline styles which can impact performance',
        file: filePath,
        line: 1,
        code: 'Multiple inline styles',
        suggestion: 'Move inline styles to external CSS files',
        fix: 'Create external CSS file and link to it',
        impact: 'Low',
        effort: 'Medium'
      });
    }

    // Check for missing preload hints
    if (content.includes('<head>') && !content.includes('rel="preload"')) {
      issues.push({
        type: 'missing_preload_hints',
        severity: 'low',
        category: 'performance_seo',
        title: 'Missing preload hints',
        description: 'Page missing preload hints for critical resources',
        file: filePath,
        line: this.findLineNumber(content, '<head>'),
        code: '<head>',
        suggestion: 'Add preload hints for critical resources',
        fix: '<link rel="preload" href="critical.css" as="style">',
        impact: 'Low',
        effort: 'Medium'
      });
    }

    return issues;
  }

  /**
   * Analyze Mobile SEO
   */
  analyzeMobileSEO(content, filePath) {
    const issues = [];
    const lines = content.split('\n');

    // Check for missing viewport meta tag (already checked in performance)
    if (content.includes('<head>') && !content.includes('viewport')) {
      issues.push({
        type: 'missing_viewport_meta',
        severity: 'high',
        category: 'mobile_seo',
        title: 'Missing viewport meta tag',
        description: 'Page missing viewport meta tag for mobile optimization',
        file: filePath,
        line: this.findLineNumber(content, '<head>'),
        code: '<head>',
        suggestion: 'Add viewport meta tag for mobile',
        fix: '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
        impact: 'High',
        effort: 'Low'
      });
    }

    // Check for touch-friendly elements
    const buttonPattern = /<button[^>]*>/g;
    const linkPattern = /<a[^>]*>/g;
    let touchElements = 0;
    
    let buttonMatch;
    while ((buttonMatch = buttonPattern.exec(content)) !== null) {
      touchElements++;
    }
    
    let linkMatch;
    while ((linkMatch = linkPattern.exec(content)) !== null) {
      touchElements++;
    }
    
    if (touchElements > 0) {
      // Check if elements have adequate touch targets
      const smallTouchPattern = /<(button|a)[^>]*(?:style="[^"]*"|class="[^"]*")[^>]*>/g;
      let smallTouchCount = 0;
      let touchMatch;
      while ((touchMatch = smallTouchPattern.exec(content)) !== null) {
        const element = touchMatch[0];
        if (element.includes('font-size:') && element.includes('12px')) {
          smallTouchCount++;
        }
      }
      
      if (smallTouchCount > 0) {
        issues.push({
          type: 'small_touch_targets',
          severity: 'medium',
          category: 'mobile_seo',
          title: 'Small touch targets',
          description: 'Some interactive elements may be too small for mobile',
          file: filePath,
          line: 1,
          code: 'Small touch elements',
          suggestion: 'Ensure touch targets are at least 44px',
          fix: 'Increase font-size or padding for touch elements',
          impact: 'Medium',
          effort: 'Medium'
        });
      }
    }

    return issues;
  }

  /**
   * Analyze Schema Markup
   */
  analyzeSchemaMarkup(content, filePath) {
    const issues = [];
    const lines = content.split('\n');

    // Check for missing structured data
    if (content.includes('<head>') && !content.includes('application/ld+json')) {
      issues.push({
        type: 'missing_structured_data',
        severity: 'medium',
        category: 'schema_markup',
        title: 'Missing structured data',
        description: 'Page missing structured data (JSON-LD) for rich snippets',
        file: filePath,
        line: this.findLineNumber(content, '<head>'),
        code: '<head>',
        suggestion: 'Add structured data markup',
        fix: '<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage"}</script>',
        impact: 'Medium',
        effort: 'High'
      });
    }

    // Check for missing breadcrumb schema
    if (content.includes('breadcrumb') && !content.includes('application/ld+json')) {
      issues.push({
        type: 'missing_breadcrumb_schema',
        severity: 'low',
        category: 'schema_markup',
        title: 'Missing breadcrumb schema',
        description: 'Breadcrumb navigation missing structured data',
        file: filePath,
        line: this.findLineNumber(content, 'breadcrumb'),
        code: 'Breadcrumb navigation',
        suggestion: 'Add breadcrumb structured data',
        fix: 'Add JSON-LD breadcrumb schema',
        impact: 'Low',
        effort: 'Medium'
      });
    }

    return issues;
  }

  /**
   * Analyze Meta Tags
   */
  analyzeMetaTags(content, filePath) {
    const issues = [];
    const lines = content.split('\n');

    // Check for title tag length
    const titleMatch = content.match(/<title>([^<]*)<\/title>/i);
    if (titleMatch) {
      const title = titleMatch[1];
      if (title.length > 60) {
        issues.push({
          type: 'title_too_long',
          severity: 'medium',
          category: 'meta_tags',
          title: 'Title tag too long',
          description: 'Title tag is longer than recommended 60 characters',
          file: filePath,
          line: this.findLineNumber(content, '<title>'),
          code: `<title>${title}</title>`,
          suggestion: 'Shorten title tag to 50-60 characters',
          fix: 'Keep title under 60 characters for better display',
          impact: 'Medium',
          effort: 'Low'
        });
      } else if (title.length < 30) {
        issues.push({
          type: 'title_too_short',
          severity: 'low',
          category: 'meta_tags',
          title: 'Title tag too short',
          description: 'Title tag is shorter than recommended 30 characters',
          file: filePath,
          line: this.findLineNumber(content, '<title>'),
          code: `<title>${title}</title>`,
          suggestion: 'Expand title tag to 30-60 characters',
          fix: 'Add more descriptive words to title',
          impact: 'Low',
          effort: 'Low'
        });
      }
    }

    // Check for meta description length
    const descMatch = content.match(/<meta name="description" content="([^"]*)"[^>]*>/i);
    if (descMatch) {
      const description = descMatch[1];
      if (description.length > 160) {
        issues.push({
          type: 'meta_description_too_long',
          severity: 'medium',
          category: 'meta_tags',
          title: 'Meta description too long',
          description: 'Meta description is longer than recommended 160 characters',
          file: filePath,
          line: this.findLineNumber(content, 'meta name="description"'),
          code: `<meta name="description" content="${description}">`,
          suggestion: 'Shorten meta description to 150-160 characters',
          fix: 'Keep description under 160 characters',
          impact: 'Medium',
          effort: 'Low'
        });
      } else if (description.length < 120) {
        issues.push({
          type: 'meta_description_too_short',
          severity: 'low',
          category: 'meta_tags',
          title: 'Meta description too short',
          description: 'Meta description is shorter than recommended 120 characters',
          file: filePath,
          line: this.findLineNumber(content, 'meta name="description"'),
          code: `<meta name="description" content="${description}">`,
          suggestion: 'Expand meta description to 120-160 characters',
          fix: 'Add more descriptive content to meta description',
          impact: 'Low',
          effort: 'Low'
        });
      }
    }

    return issues;
  }

  /**
   * Analyze Heading Structure
   */
  analyzeHeadingStructure(content, filePath) {
    const issues = [];
    const lines = content.split('\n');

    // Check for heading hierarchy (similar to content SEO but focused on structure)
    const headingPattern = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/g;
    const headings = [];
    let headingMatch;
    
    while ((headingMatch = headingPattern.exec(content)) !== null) {
      headings.push({
        level: parseInt(headingMatch[1]),
        text: headingMatch[2].trim(),
        line: this.getLineNumber(content, headingMatch.index)
      });
    }

    if (headings.length === 0) {
      issues.push({
        type: 'no_headings',
        severity: 'high',
        category: 'heading_structure',
        title: 'No headings found',
        description: 'Page has no heading structure for content organization',
        file: filePath,
        line: 1,
        code: 'No headings',
        suggestion: 'Add heading structure to organize content',
        fix: 'Add h1, h2, h3, etc. to structure content',
        impact: 'High',
        effort: 'Medium'
      });
      return issues;
    }

    // Check for missing h1
    if (!headings.some(h => h.level === 1)) {
      issues.push({
        type: 'missing_h1',
        severity: 'high',
        category: 'heading_structure',
        title: 'Missing h1 heading',
        description: 'Page missing main h1 heading',
        file: filePath,
        line: headings[0].line,
        code: 'Heading structure',
        suggestion: 'Add h1 as the main page heading',
        fix: '<h1>Main Page Title</h1>',
        impact: 'High',
        effort: 'Low'
      });
    }

    // Check for empty headings
    const emptyHeadings = headings.filter(h => !h.text || h.text.length === 0);
    emptyHeadings.forEach(heading => {
      issues.push({
        type: 'empty_heading',
        severity: 'medium',
        category: 'heading_structure',
        title: 'Empty heading',
        description: 'Heading element is empty',
        file: filePath,
        line: heading.line,
        code: `<h${heading.level}></h${heading.level}>`,
        suggestion: 'Add text content to heading',
        fix: 'Add descriptive text to heading element',
        impact: 'Medium',
        effort: 'Low'
      });
    });

    return issues;
  }

  /**
   * Analyze Image SEO
   */
  analyzeImageSEO(content, filePath) {
    const issues = [];
    const lines = content.split('\n');

    // Check for images without alt text
    const imgPattern = /<img[^>]*>/g;
    let imgMatch;
    while ((imgMatch = imgPattern.exec(content)) !== null) {
      const imgTag = imgMatch[0];
      if (!imgTag.includes('alt=')) {
        issues.push({
          type: 'missing_image_alt',
          severity: 'high',
          category: 'image_seo',
          title: 'Missing image alt text',
          description: 'Image missing alt attribute for SEO and accessibility',
          file: filePath,
          line: this.getLineNumber(content, imgMatch.index),
          code: imgTag,
          suggestion: 'Add descriptive alt text to images',
          fix: 'Add alt="description" to img tag',
          impact: 'High',
          effort: 'Low'
        });
      }
    }

    // Check for images without proper file names
    const imgSrcPattern = /<img[^>]*src="([^"]*)"[^>]*>/g;
    let srcMatch;
    while ((srcMatch = imgSrcPattern.exec(content)) !== null) {
      const src = srcMatch[1];
      if (src.includes('image') || src.includes('img') || src.includes('photo')) {
        issues.push({
          type: 'generic_image_filename',
          severity: 'low',
          category: 'image_seo',
          title: 'Generic image filename',
          description: 'Image has generic filename that doesn\'t describe content',
          file: filePath,
          line: this.getLineNumber(content, srcMatch.index),
          code: `src="${src}"`,
          suggestion: 'Use descriptive filenames for images',
          fix: 'Rename image files to be descriptive (e.g., "red-apple.jpg")',
          impact: 'Low',
          effort: 'Low'
        });
      }
    }

    return issues;
  }

  /**
   * Analyze Internal Linking
   */
  analyzeInternalLinking(content, filePath) {
    const issues = [];
    const lines = content.split('\n');

    // Check for internal links
    const linkPattern = /<a[^>]*href="([^"]*)"[^>]*>/g;
    const links = [];
    let linkMatch;
    
    while ((linkMatch = linkPattern.exec(content)) !== null) {
      const href = linkMatch[1];
      if (href.startsWith('/') || href.includes('example.com')) {
        links.push(href);
      }
    }

    if (links.length === 0) {
      issues.push({
        type: 'no_internal_links',
        severity: 'medium',
        category: 'internal_linking',
        title: 'No internal links',
        description: 'Page has no internal links to other pages',
        file: filePath,
        line: 1,
        code: 'No internal links',
        suggestion: 'Add internal links to related pages',
        fix: 'Link to other relevant pages on your site',
        impact: 'Medium',
        effort: 'Medium'
      });
    }

    // Check for links without descriptive text
    const linkTextPattern = /<a[^>]*href="[^"]*"[^>]*>([^<]*)<\/a>/g;
    let textMatch;
    while ((textMatch = linkTextPattern.exec(content)) !== null) {
      const linkText = textMatch[1].trim();
      if (linkText === 'click here' || linkText === 'read more' || linkText === 'here') {
        issues.push({
          type: 'generic_link_text',
          severity: 'low',
          category: 'internal_linking',
          title: 'Generic link text',
          description: 'Link has generic text that doesn\'t describe destination',
          file: filePath,
          line: this.getLineNumber(content, textMatch.index),
          code: `<a href="...">${linkText}</a>`,
          suggestion: 'Use descriptive link text',
          fix: 'Replace generic text with descriptive link text',
          impact: 'Low',
          effort: 'Low'
        });
      }
    }

    return issues;
  }

  /**
   * Analyze URL Structure
   */
  analyzeURLStructure(content, filePath) {
    const issues = [];
    const lines = content.split('\n');

    // Check for absolute URLs in internal links
    const absoluteUrlPattern = /<a[^>]*href="https?:\/\/[^"]*"[^>]*>/g;
    let urlMatch;
    while ((urlMatch = absoluteUrlPattern.exec(content)) !== null) {
      const href = urlMatch[0].match(/href="([^"]*)"/)[1];
      if (href.includes('example.com') || href.includes('yoursite.com')) {
        issues.push({
          type: 'absolute_urls_internal',
          severity: 'low',
          category: 'url_structure',
          title: 'Absolute URLs for internal links',
          description: 'Using absolute URLs for internal links can impact performance',
          file: filePath,
          line: this.getLineNumber(content, urlMatch.index),
          code: urlMatch[0],
          suggestion: 'Use relative URLs for internal links',
          fix: 'Change absolute URLs to relative URLs',
          impact: 'Low',
          effort: 'Low'
        });
      }
    }

    return issues;
  }

  /**
   * Calculate SEO score
   */
  calculateSEOScore() {
    let score = 100;
    
    this.issues.forEach(issue => {
      switch (issue.severity) {
        case 'high':
          score -= 20;
          break;
        case 'medium':
          score -= 10;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });
    
    this.seoScore = Math.max(0, score);
    
    // Determine SEO level
    if (this.seoScore >= 90) {
      this.seoLevel = 'Excellent';
    } else if (this.seoScore >= 75) {
      this.seoLevel = 'Good';
    } else if (this.seoScore >= 60) {
      this.seoLevel = 'Fair';
    } else if (this.seoScore >= 40) {
      this.seoLevel = 'Poor';
    } else {
      this.seoLevel = 'Critical';
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
      seoScore: this.seoScore,
      seoLevel: this.seoLevel
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
}

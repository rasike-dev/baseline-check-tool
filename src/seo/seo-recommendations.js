/**
 * SEO Recommendations Engine
 * Generates actionable SEO recommendations based on analysis results
 */

export class SEORecommendations {
  constructor(options = {}) {
    this.options = {
      includeCodeExamples: true,
      includeImpactLevels: true,
      includeEffortEstimates: true,
      ...options
    };
  }

  /**
   * Generate recommendations from SEO analysis
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

    // Missing title tag
    const missingTitle = criticalIssues.filter(issue => issue.type === 'missing_title_tag');
    if (missingTitle.length > 0) {
      recommendations.push({
        title: 'Add Title Tags',
        description: 'Title tags are essential for SEO and appear in search results',
        priority: 'critical',
        impact: 'high',
        effort: 'low',
        issues: missingTitle.length,
        actions: [
          'Add unique title tags to all pages',
          'Include primary keywords in title tags',
          'Keep titles between 50-60 characters',
          'Make titles descriptive and compelling'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '<head>\n  <meta charset="UTF-8">\n</head>',
          after: '<head>\n  <meta charset="UTF-8">\n  <title>Page Title - Site Name</title>\n</head>'
        } : null,
        resources: [
          'https://developers.google.com/search/docs/appearance/title-link',
          'https://moz.com/learn/seo/title-tag'
        ]
      });
    }

    // Missing meta description
    const missingMetaDesc = criticalIssues.filter(issue => issue.type === 'missing_meta_description');
    if (missingMetaDesc.length > 0) {
      recommendations.push({
        title: 'Add Meta Descriptions',
        description: 'Meta descriptions appear in search results and influence click-through rates',
        priority: 'critical',
        impact: 'high',
        effort: 'low',
        issues: missingMetaDesc.length,
        actions: [
          'Add unique meta descriptions to all pages',
          'Include primary keywords naturally',
          'Keep descriptions between 120-160 characters',
          'Write compelling descriptions that encourage clicks'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '<head>\n  <title>Page Title</title>\n</head>',
          after: '<head>\n  <title>Page Title</title>\n  <meta name="description" content="Page description with keywords">\n</head>'
        } : null,
        resources: [
          'https://developers.google.com/search/docs/appearance/snippet',
          'https://moz.com/learn/seo/meta-description'
        ]
      });
    }

    // Missing h1 tag
    const missingH1 = criticalIssues.filter(issue => issue.type === 'missing_h1_tag');
    if (missingH1.length > 0) {
      recommendations.push({
        title: 'Add H1 Headings',
        description: 'H1 headings are crucial for content structure and SEO',
        priority: 'critical',
        impact: 'high',
        effort: 'low',
        issues: missingH1.length,
        actions: [
          'Add one H1 heading per page',
          'Include primary keywords in H1',
          'Make H1 descriptive and compelling',
          'Use H1 for the main page topic'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '<body>\n  <div class="content">\n    <p>Page content...</p>\n  </div>\n</body>',
          after: '<body>\n  <h1>Main Page Heading</h1>\n  <div class="content">\n    <p>Page content...</p>\n  </div>\n</body>'
        } : null,
        resources: [
          'https://developers.google.com/search/docs/crawling-indexing/valid-hreflang',
          'https://moz.com/learn/seo/heading-tags'
        ]
      });
    }

    // Multiple h1 tags
    const multipleH1 = criticalIssues.filter(issue => issue.type === 'multiple_h1_tags');
    if (multipleH1.length > 0) {
      recommendations.push({
        title: 'Fix Multiple H1 Tags',
        description: 'Multiple H1 tags can confuse search engines and hurt SEO',
        priority: 'critical',
        impact: 'high',
        effort: 'medium',
        issues: multipleH1.length,
        actions: [
          'Use only one H1 tag per page',
          'Convert additional H1s to H2, H3, etc.',
          'Maintain proper heading hierarchy',
          'Ensure H1 represents the main page topic'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '<h1>First Heading</h1>\n<h1>Second Heading</h1>',
          after: '<h1>Main Page Heading</h1>\n<h2>Section Heading</h2>'
        } : null,
        resources: [
          'https://developers.google.com/search/docs/crawling-indexing/valid-hreflang',
          'https://moz.com/learn/seo/heading-tags'
        ]
      });
    }

    // Missing viewport meta tag
    const missingViewport = criticalIssues.filter(issue => issue.type === 'missing_viewport_meta');
    if (missingViewport.length > 0) {
      recommendations.push({
        title: 'Add Viewport Meta Tag',
        description: 'Viewport meta tag is essential for mobile SEO and user experience',
        priority: 'critical',
        impact: 'high',
        effort: 'low',
        issues: missingViewport.length,
        actions: [
          'Add viewport meta tag to all pages',
          'Use responsive design principles',
          'Test on various device sizes',
          'Ensure content is readable without horizontal scrolling'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '<head>\n  <title>Page Title</title>\n</head>',
          after: '<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Page Title</title>\n</head>'
        } : null,
        resources: [
          'https://developers.google.com/search/mobile-sites/mobile-seo',
          'https://web.dev/viewport/'
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

    // Missing canonical URL
    const missingCanonical = highIssues.filter(issue => issue.type === 'missing_canonical_url');
    if (missingCanonical.length > 0) {
      recommendations.push({
        title: 'Add Canonical URLs',
        description: 'Canonical URLs prevent duplicate content issues and consolidate link equity',
        priority: 'high',
        impact: 'high',
        effort: 'low',
        issues: missingCanonical.length,
        actions: [
          'Add canonical URL to all pages',
          'Point canonical to the preferred version',
          'Use absolute URLs for canonical tags',
          'Ensure canonical URLs are accessible'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '<head>\n  <title>Page Title</title>\n</head>',
          after: '<head>\n  <title>Page Title</title>\n  <link rel="canonical" href="https://example.com/page">\n</head>'
        } : null,
        resources: [
          'https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls',
          'https://moz.com/learn/seo/canonicalization'
        ]
      });
    }

    // Missing Open Graph tags
    const missingOG = highIssues.filter(issue => issue.type === 'missing_open_graph');
    if (missingOG.length > 0) {
      recommendations.push({
        title: 'Add Open Graph Tags',
        description: 'Open Graph tags improve social media sharing and can impact SEO',
        priority: 'high',
        impact: 'medium',
        effort: 'medium',
        issues: missingOG.length,
        actions: [
          'Add Open Graph meta tags to all pages',
          'Include og:title, og:description, og:type',
          'Add og:image for visual appeal',
          'Test with social media debuggers'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '<head>\n  <title>Page Title</title>\n</head>',
          after: '<head>\n  <title>Page Title</title>\n  <meta property="og:title" content="Page Title">\n  <meta property="og:description" content="Page description">\n  <meta property="og:type" content="website">\n</head>'
        } : null,
        resources: [
          'https://developers.facebook.com/docs/sharing/webmasters',
          'https://moz.com/blog/open-graph-meta-tags'
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

    // Title tag length issues
    const titleLength = mediumIssues.filter(issue => 
      issue.type === 'title_too_long' || issue.type === 'title_too_short'
    );
    if (titleLength.length > 0) {
      recommendations.push({
        title: 'Optimize Title Tag Length',
        description: 'Title tags should be 50-60 characters for optimal display in search results',
        priority: 'medium',
        impact: 'medium',
        effort: 'low',
        issues: titleLength.length,
        actions: [
          'Keep title tags between 50-60 characters',
          'Include primary keywords near the beginning',
          'Make titles compelling and click-worthy',
          'Test title display in search results'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '<title>This is a very long title that exceeds the recommended character limit</title>',
          after: '<title>Short, Keyword-Rich Title</title>'
        } : null,
        resources: [
          'https://developers.google.com/search/docs/appearance/title-link',
          'https://moz.com/learn/seo/title-tag'
        ]
      });
    }

    // Meta description length issues
    const descLength = mediumIssues.filter(issue => 
      issue.type === 'meta_description_too_long' || issue.type === 'meta_description_too_short'
    );
    if (descLength.length > 0) {
      recommendations.push({
        title: 'Optimize Meta Description Length',
        description: 'Meta descriptions should be 120-160 characters for optimal display',
        priority: 'medium',
        impact: 'medium',
        effort: 'low',
        issues: descLength.length,
        actions: [
          'Keep meta descriptions between 120-160 characters',
          'Include primary keywords naturally',
          'Write compelling descriptions that encourage clicks',
          'Make each description unique'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '<meta name="description" content="Short desc">',
          after: '<meta name="description" content="This is a well-crafted meta description that includes keywords and encourages clicks while staying within the character limit.">'
        } : null,
        resources: [
          'https://developers.google.com/search/docs/appearance/snippet',
          'https://moz.com/learn/seo/meta-description'
        ]
      });
    }

    // Heading hierarchy issues
    const headingHierarchy = mediumIssues.filter(issue => issue.type === 'heading_hierarchy_skip');
    if (headingHierarchy.length > 0) {
      recommendations.push({
        title: 'Fix Heading Hierarchy',
        description: 'Proper heading hierarchy helps search engines understand content structure',
        priority: 'medium',
        impact: 'medium',
        effort: 'medium',
        issues: headingHierarchy.length,
        actions: [
          'Use sequential heading levels (h1, h2, h3, etc.)',
          'Don\'t skip heading levels',
          'Use headings to organize content logically',
          'Include keywords in heading text'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '<h1>Main Title</h1>\n<h3>Subsection</h3>',
          after: '<h1>Main Title</h1>\n<h2>Section</h2>\n<h3>Subsection</h3>'
        } : null,
        resources: [
          'https://developers.google.com/search/docs/crawling-indexing/valid-hreflang',
          'https://moz.com/learn/seo/heading-tags'
        ]
      });
    }

    // Insufficient content
    const insufficientContent = mediumIssues.filter(issue => issue.type === 'insufficient_content');
    if (insufficientContent.length > 0) {
      recommendations.push({
        title: 'Add More Content',
        description: 'Pages with more content tend to rank better in search results',
        priority: 'medium',
        impact: 'medium',
        effort: 'high',
        issues: insufficientContent.length,
        actions: [
          'Add at least 300-500 words of quality content',
          'Include relevant keywords naturally',
          'Provide valuable information to users',
          'Use headings to organize content'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '<body>\n  <h1>Title</h1>\n  <p>Short content.</p>\n</body>',
          after: '<body>\n  <h1>Title</h1>\n  <p>Detailed, valuable content that provides comprehensive information about the topic and includes relevant keywords naturally throughout the text.</p>\n  <h2>Subsection</h2>\n  <p>More detailed content...</p>\n</body>'
        } : null,
        resources: [
          'https://developers.google.com/search/docs/essentials',
          'https://moz.com/learn/seo/content'
        ]
      });
    }

    // Missing image alt text
    const missingImageAlt = mediumIssues.filter(issue => issue.type === 'missing_image_alt');
    if (missingImageAlt.length > 0) {
      recommendations.push({
        title: 'Add Image Alt Text',
        description: 'Alt text helps search engines understand images and improves accessibility',
        priority: 'medium',
        impact: 'medium',
        effort: 'low',
        issues: missingImageAlt.length,
        actions: [
          'Add descriptive alt text to all images',
          'Include relevant keywords in alt text',
          'Keep alt text concise but descriptive',
          'Use alt="" for decorative images'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '<img src="image.jpg">',
          after: '<img src="image.jpg" alt="Descriptive alt text with keywords">'
        } : null,
        resources: [
          'https://developers.google.com/search/docs/crawling-indexing/images',
          'https://moz.com/learn/seo/alt-text'
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

    // Missing robots meta tag
    const missingRobots = lowIssues.filter(issue => issue.type === 'missing_robots_meta');
    if (missingRobots.length > 0) {
      recommendations.push({
        title: 'Add Robots Meta Tag',
        description: 'Robots meta tag provides instructions to search engines',
        priority: 'low',
        impact: 'low',
        effort: 'low',
        issues: missingRobots.length,
        actions: [
          'Add robots meta tag if needed',
          'Use "index, follow" for most pages',
          'Use "noindex" for pages you don\'t want indexed',
          'Consider using robots.txt for site-wide instructions'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '<head>\n  <title>Page Title</title>\n</head>',
          after: '<head>\n  <title>Page Title</title>\n  <meta name="robots" content="index, follow">\n</head>'
        } : null,
        resources: [
          'https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag',
          'https://moz.com/learn/seo/robots-meta-directives'
        ]
      });
    }

    // Missing Twitter Cards
    const missingTwitter = lowIssues.filter(issue => issue.type === 'missing_twitter_cards');
    if (missingTwitter.length > 0) {
      recommendations.push({
        title: 'Add Twitter Card Tags',
        description: 'Twitter Cards improve social media sharing appearance',
        priority: 'low',
        impact: 'low',
        effort: 'medium',
        issues: missingTwitter.length,
        actions: [
          'Add Twitter Card meta tags',
          'Include twitter:card, twitter:title, twitter:description',
          'Add twitter:image for visual appeal',
          'Test with Twitter Card Validator'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: '<head>\n  <title>Page Title</title>\n</head>',
          after: '<head>\n  <title>Page Title</title>\n  <meta name="twitter:card" content="summary">\n  <meta name="twitter:title" content="Page Title">\n  <meta name="twitter:description" content="Page description">\n</head>'
        } : null,
        resources: [
          'https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview',
          'https://cards-dev.twitter.com/validator'
        ]
      });
    }

    // Generic image filenames
    const genericFilenames = lowIssues.filter(issue => issue.type === 'generic_image_filename');
    if (genericFilenames.length > 0) {
      recommendations.push({
        title: 'Use Descriptive Image Filenames',
        description: 'Descriptive filenames help search engines understand image content',
        priority: 'low',
        impact: 'low',
        effort: 'low',
        issues: genericFilenames.length,
        actions: [
          'Rename image files to be descriptive',
          'Use hyphens instead of spaces in filenames',
          'Include relevant keywords in filenames',
          'Keep filenames concise but descriptive'
        ],
        codeExample: this.options.includeCodeExamples ? {
          before: 'src="image.jpg"',
          after: 'src="red-apple-fruit.jpg"'
        } : null,
        resources: [
          'https://developers.google.com/search/docs/crawling-indexing/images',
          'https://moz.com/learn/seo/alt-text'
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
      seoScore: analysis.seoScore,
      seoLevel: analysis.seoLevel,
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

    const effort = (criticalIssues * 1) + (mediumIssues * 2) + (lowIssues * 0.5);
    
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
      steps.push('Fix critical SEO issues first');
    }
    
    if (analysis.issues.filter(i => i.type === 'missing_title_tag').length > 0) {
      steps.push('Add title tags to all pages');
    }
    
    if (analysis.issues.filter(i => i.type === 'missing_meta_description').length > 0) {
      steps.push('Add meta descriptions to all pages');
    }
    
    if (analysis.issues.filter(i => i.type === 'missing_h1_tag').length > 0) {
      steps.push('Add H1 headings to all pages');
    }
    
    steps.push('Test pages in Google Search Console');
    steps.push('Monitor search performance');
    steps.push('Regular SEO audits and updates');
    
    return steps;
  }
}

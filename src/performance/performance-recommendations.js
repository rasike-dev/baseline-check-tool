/**
 * Performance Recommendations - Provides actionable optimization suggestions
 */
export class PerformanceRecommendations {
    constructor() {
        this.recommendationTemplates = this.initializeTemplates();
        this.optimizationStrategies = this.initializeStrategies();
    }

    /**
     * Generate performance recommendations based on analysis
     */
    generateRecommendations(analysis) {
        const recommendations = {
            immediate: [],
            shortTerm: [],
            longTerm: [],
            critical: [],
            metrics: {
                totalRecommendations: 0,
                highPriority: 0,
                mediumPriority: 0,
                lowPriority: 0
            }
        };

        // Generate recommendations for each category
        Object.entries(analysis.categories).forEach(([category, data]) => {
            if (data.issues.length > 0) {
                const categoryRecs = this.generateCategoryRecommendations(category, data, analysis);
                recommendations.immediate.push(...categoryRecs.immediate);
                recommendations.shortTerm.push(...categoryRecs.shortTerm);
                recommendations.longTerm.push(...categoryRecs.longTerm);
            }
        });

        // Generate critical recommendations
        recommendations.critical = this.generateCriticalRecommendations(analysis);

        // Calculate metrics
        recommendations.metrics = this.calculateRecommendationMetrics(recommendations);

        return recommendations;
    }

    /**
     * Generate recommendations for specific category
     */
    generateCategoryRecommendations(category, data, analysis) {
        const recommendations = {
            immediate: [],
            shortTerm: [],
            longTerm: []
        };

        switch (category) {
            case 'bundle':
                recommendations.immediate.push(...this.getBundleRecommendations(data));
                break;
            case 'memory':
                recommendations.immediate.push(...this.getMemoryRecommendations(data));
                break;
            case 'network':
                recommendations.shortTerm.push(...this.getNetworkRecommendations(data));
                break;
            case 'rendering':
                recommendations.immediate.push(...this.getRenderingRecommendations(data));
                break;
            case 'javascript':
                recommendations.immediate.push(...this.getJavaScriptRecommendations(data));
                break;
            case 'css':
                recommendations.shortTerm.push(...this.getCSSRecommendations(data));
                break;
            case 'images':
                recommendations.shortTerm.push(...this.getImageRecommendations(data));
                break;
        }

        return recommendations;
    }

    /**
     * Bundle optimization recommendations
     */
    getBundleRecommendations(data) {
        const recommendations = [];

        if (data.issues.some(issue => issue.type === 'large_file')) {
            recommendations.push({
                id: 'bundle-001',
                title: 'Implement Code Splitting',
                description: 'Large files detected. Split code into smaller, loadable chunks.',
                priority: 'high',
                effort: 'medium',
                impact: 'high',
                category: 'bundle',
                codeExample: `// Before: Large single file
import { Component1, Component2, Component3 } from './components';

// After: Code splitting
const Component1 = lazy(() => import('./Component1'));
const Component2 = lazy(() => import('./Component2'));
const Component3 = lazy(() => import('./Component3'));`,
                implementation: [
                    'Use dynamic imports for route-based splitting',
                    'Implement lazy loading for non-critical components',
                    'Consider vendor chunk splitting',
                    'Use webpack-bundle-analyzer to identify opportunities'
                ],
                tools: ['webpack', 'rollup', 'vite', 'parcel']
            });
        }

        if (data.issues.some(issue => issue.type === 'unused_imports')) {
            recommendations.push({
                id: 'bundle-002',
                title: 'Remove Unused Imports',
                description: 'Unused imports increase bundle size unnecessarily.',
                priority: 'medium',
                effort: 'low',
                impact: 'medium',
                category: 'bundle',
                codeExample: `// Before: Unused imports
import { usedFunction, unusedFunction } from './utils';
import { AnotherComponent } from './components';

// After: Clean imports
import { usedFunction } from './utils';`,
                implementation: [
                    'Use ESLint rules to detect unused imports',
                    'Configure build tools to tree-shake unused code',
                    'Regularly audit import statements',
                    'Use IDE extensions for automatic cleanup'
                ],
                tools: ['eslint', 'webpack', 'rollup', 'typescript']
            });
        }

        if (data.issues.some(issue => issue.type === 'duplicate_code')) {
            recommendations.push({
                id: 'bundle-003',
                title: 'Eliminate Code Duplication',
                description: 'Duplicate code patterns detected. Extract common functionality.',
                priority: 'medium',
                effort: 'medium',
                impact: 'medium',
                category: 'bundle',
                codeExample: `// Before: Duplicate code
function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePhone(phone) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(phone); // Same pattern!
}

// After: Extracted utility
function validatePattern(value, pattern) {
    return pattern.test(value);
}`,
                implementation: [
                    'Identify common patterns across files',
                    'Extract shared utilities into separate modules',
                    'Use higher-order functions for common logic',
                    'Implement proper abstraction layers'
                ],
                tools: ['jscpd', 'sonarjs', 'codeclimate']
            });
        }

        return recommendations;
    }

    /**
     * Memory optimization recommendations
     */
    getMemoryRecommendations(data) {
        const recommendations = [];

        if (data.issues.some(issue => issue.type === 'memory_leak')) {
            recommendations.push({
                id: 'memory-001',
                title: 'Fix Memory Leaks',
                description: 'Potential memory leaks detected. Implement proper cleanup.',
                priority: 'critical',
                effort: 'high',
                impact: 'high',
                category: 'memory',
                codeExample: `// Before: Memory leak
useEffect(() => {
    const handleResize = () => setWindowSize(window.innerWidth);
    window.addEventListener('resize', handleResize);
    // Missing cleanup!
}, []);

// After: Proper cleanup
useEffect(() => {
    const handleResize = () => setWindowSize(window.innerWidth);
    window.addEventListener('resize', handleResize);
    
    return () => {
        window.removeEventListener('resize', handleResize);
    };
}, []);`,
                implementation: [
                    'Remove event listeners in cleanup functions',
                    'Clear timers and intervals',
                    'Unsubscribe from observables',
                    'Use WeakMap/WeakSet for object references'
                ],
                tools: ['chrome-devtools', 'memory-profiler', 'lighthouse']
            });
        }

        if (data.issues.some(issue => issue.type === 'event_listener_leak')) {
            recommendations.push({
                id: 'memory-002',
                title: 'Clean Up Event Listeners',
                description: 'Event listeners without cleanup can cause memory leaks.',
                priority: 'high',
                effort: 'medium',
                impact: 'high',
                category: 'memory',
                codeExample: `// Before: No cleanup
class Component {
    constructor() {
        this.handleClick = this.handleClick.bind(this);
        document.addEventListener('click', this.handleClick);
    }
}

// After: With cleanup
class Component {
    constructor() {
        this.handleClick = this.handleClick.bind(this);
        document.addEventListener('click', this.handleClick);
    }
    
    destroy() {
        document.removeEventListener('click', this.handleClick);
    }
}`,
                implementation: [
                    'Always pair addEventListener with removeEventListener',
                    'Use AbortController for modern event handling',
                    'Implement component lifecycle methods',
                    'Use frameworks with automatic cleanup'
                ],
                tools: ['chrome-devtools', 'react', 'vue', 'angular']
            });
        }

        return recommendations;
    }

    /**
     * Network optimization recommendations
     */
    getNetworkRecommendations(data) {
        const recommendations = [];

        if (data.issues.some(issue => issue.type === 'missing_compression')) {
            recommendations.push({
                id: 'network-001',
                title: 'Enable Compression',
                description: 'Enable gzip/brotli compression to reduce transfer sizes.',
                priority: 'high',
                effort: 'low',
                impact: 'high',
                category: 'network',
                codeExample: `// Server configuration (Node.js/Express)
const compression = require('compression');
app.use(compression({
    level: 6,
    threshold: 1024,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    }
}));`,
                implementation: [
                    'Enable gzip compression on server',
                    'Use brotli for better compression',
                    'Configure appropriate compression levels',
                    'Set up CDN with compression'
                ],
                tools: ['nginx', 'apache', 'express', 'cloudflare']
            });
        }

        if (data.issues.some(issue => issue.type === 'missing_caching')) {
            recommendations.push({
                id: 'network-002',
                title: 'Implement Caching Strategy',
                description: 'Add proper cache headers for static resources.',
                priority: 'medium',
                effort: 'low',
                impact: 'high',
                category: 'network',
                codeExample: `// Cache headers for static assets
app.use('/static', express.static('public', {
    maxAge: '1y',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        if (path.endsWith('.js') || path.endsWith('.css')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000');
        }
    }
}));`,
                implementation: [
                    'Set appropriate cache headers',
                    'Use ETags for validation',
                    'Implement cache busting for updates',
                    'Configure CDN caching rules'
                ],
                tools: ['nginx', 'apache', 'cloudflare', 'aws-cloudfront']
            });
        }

        return recommendations;
    }

    /**
     * Rendering optimization recommendations
     */
    getRenderingRecommendations(data) {
        const recommendations = [];

        if (data.issues.some(issue => issue.type === 'dom_queries_in_loop')) {
            recommendations.push({
                id: 'rendering-001',
                title: 'Optimize DOM Queries',
                description: 'DOM queries in loops cause major performance bottlenecks.',
                priority: 'critical',
                effort: 'medium',
                impact: 'high',
                category: 'rendering',
                codeExample: `// Before: DOM queries in loop
for (let i = 0; i < items.length; i++) {
    const element = document.querySelector(\`#item-\${i}\`);
    element.style.display = 'none';
}

// After: Cache DOM elements
const elements = document.querySelectorAll('[id^="item-"]');
elements.forEach(element => {
    element.style.display = 'none';
});`,
                implementation: [
                    'Cache DOM elements outside loops',
                    'Use document fragments for batch operations',
                    'Minimize reflows and repaints',
                    'Use virtual DOM libraries'
                ],
                tools: ['react', 'vue', 'angular', 'lit']
            });
        }

        if (data.issues.some(issue => issue.type === 'expensive_property')) {
            recommendations.push({
                id: 'rendering-002',
                title: 'Use Efficient CSS Properties',
                description: 'Replace expensive CSS properties with performant alternatives.',
                priority: 'medium',
                effort: 'low',
                impact: 'medium',
                category: 'rendering',
                codeExample: `/* Before: Expensive properties */
.element {
    left: 100px;
    top: 100px;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
}

/* After: Efficient properties */
.element {
    transform: translate(100px, 100px);
    filter: drop-shadow(0 0 10px rgba(0,0,0,0.5));
}`,
                implementation: [
                    'Use transform instead of position changes',
                    'Prefer opacity over visibility changes',
                    'Use will-change for animated elements',
                    'Avoid layout-triggering properties'
                ],
                tools: ['chrome-devtools', 'lighthouse', 'css-analyzer']
            });
        }

        return recommendations;
    }

    /**
     * JavaScript optimization recommendations
     */
    getJavaScriptRecommendations(data) {
        const recommendations = [];

        if (data.issues.some(issue => issue.type === 'inefficient_loop')) {
            recommendations.push({
                id: 'javascript-001',
                title: 'Optimize Loop Performance',
                description: 'Replace inefficient loops with modern array methods.',
                priority: 'medium',
                effort: 'low',
                impact: 'medium',
                category: 'javascript',
                codeExample: `// Before: Inefficient loop
const results = [];
for (let i = 0; i < items.length; i++) {
    if (items[i].active) {
        results.push(items[i].name);
    }
}

// After: Efficient array methods
const results = items
    .filter(item => item.active)
    .map(item => item.name);`,
                implementation: [
                    'Use array methods (map, filter, reduce)',
                    'Prefer for...of over traditional for loops',
                    'Use forEach for side effects only',
                    'Consider functional programming patterns'
                ],
                tools: ['eslint', 'prettier', 'typescript']
            });
        }

        if (data.issues.some(issue => issue.type === 'synchronous_operation')) {
            recommendations.push({
                id: 'javascript-002',
                title: 'Use Asynchronous Operations',
                description: 'Replace synchronous operations with async alternatives.',
                priority: 'high',
                effort: 'medium',
                impact: 'high',
                category: 'javascript',
                codeExample: `// Before: Synchronous operation
function processData(data) {
    const result = JSON.parse(data); // Blocks main thread
    return result;
}

// After: Asynchronous operation
async function processData(data) {
    const result = await new Promise(resolve => {
        setTimeout(() => resolve(JSON.parse(data)), 0);
    });
    return result;
}`,
                implementation: [
                    'Use async/await for I/O operations',
                    'Implement Web Workers for heavy computations',
                    'Use requestIdleCallback for non-critical tasks',
                    'Break up long-running operations'
                ],
                tools: ['webpack', 'rollup', 'typescript', 'babel']
            });
        }

        return recommendations;
    }

    /**
     * CSS optimization recommendations
     */
    getCSSRecommendations(data) {
        const recommendations = [];

        if (data.issues.some(issue => issue.type === 'inefficient_selector')) {
            recommendations.push({
                id: 'css-001',
                title: 'Optimize CSS Selectors',
                description: 'Use efficient CSS selectors to improve rendering performance.',
                priority: 'low',
                effort: 'low',
                impact: 'low',
                category: 'css',
                codeExample: `/* Before: Inefficient selectors */
div > ul > li > a > span {
    color: blue;
}

/* After: Efficient selectors */
.nav-link {
    color: blue;
}`,
                implementation: [
                    'Use class-based selectors',
                    'Avoid deep nesting',
                    'Minimize universal selectors',
                    'Use attribute selectors efficiently'
                ],
                tools: ['css-lint', 'stylelint', 'purgecss']
            });
        }

        return recommendations;
    }

    /**
     * Image optimization recommendations
     */
    getImageRecommendations(data) {
        const recommendations = [];

        if (data.issues.some(issue => issue.type === 'unoptimized_images')) {
            recommendations.push({
                id: 'images-001',
                title: 'Optimize Images',
                description: 'Use modern image formats and appropriate sizing.',
                priority: 'medium',
                effort: 'medium',
                impact: 'high',
                category: 'images',
                codeExample: `<!-- Before: Unoptimized images -->
<img src="photo.jpg" alt="Photo" />

<!-- After: Optimized images -->
<picture>
    <source srcset="photo.avif" type="image/avif">
    <source srcset="photo.webp" type="image/webp">
    <img src="photo.jpg" alt="Photo" loading="lazy">
</picture>`,
                implementation: [
                    'Use WebP and AVIF formats',
                    'Implement responsive images',
                    'Add lazy loading',
                    'Optimize image dimensions'
                ],
                tools: ['sharp', 'imagemin', 'squoosh', 'cloudinary']
            });
        }

        return recommendations;
    }

    /**
     * Generate critical recommendations
     */
    generateCriticalRecommendations(analysis) {
        const critical = [];

        if (analysis.overallScore < 50) {
            critical.push({
                id: 'critical-001',
                title: 'Performance Emergency',
                description: 'Overall performance score is critically low. Immediate action required.',
                priority: 'critical',
                effort: 'high',
                impact: 'critical',
                category: 'overall',
                action: 'Conduct comprehensive performance audit and implement high-impact fixes immediately.'
            });
        }

        if (analysis.criticalIssues && analysis.criticalIssues.length > 5) {
            critical.push({
                id: 'critical-002',
                title: 'Multiple Critical Issues',
                description: 'Multiple critical performance issues detected.',
                priority: 'critical',
                effort: 'high',
                impact: 'high',
                category: 'overall',
                action: 'Address critical issues in order of impact and user experience.'
            });
        }

        return critical;
    }

    /**
     * Calculate recommendation metrics
     */
    calculateRecommendationMetrics(recommendations) {
        const allRecs = [
            ...recommendations.immediate,
            ...recommendations.shortTerm,
            ...recommendations.longTerm,
            ...recommendations.critical
        ];

        return {
            totalRecommendations: allRecs.length,
            highPriority: allRecs.filter(r => r.priority === 'high' || r.priority === 'critical').length,
            mediumPriority: allRecs.filter(r => r.priority === 'medium').length,
            lowPriority: allRecs.filter(r => r.priority === 'low').length
        };
    }

    /**
     * Initialize recommendation templates
     */
    initializeTemplates() {
        return {
            immediate: 'Address these issues immediately for quick performance wins',
            shortTerm: 'Implement these optimizations in the next sprint',
            longTerm: 'Plan these improvements for future releases',
            critical: 'Critical issues requiring immediate attention'
        };
    }

    /**
     * Initialize optimization strategies
     */
    initializeStrategies() {
        return {
            bundle: 'Focus on reducing bundle size and improving load times',
            memory: 'Optimize memory usage and prevent leaks',
            network: 'Improve network efficiency and caching',
            rendering: 'Optimize rendering performance and user experience',
            javascript: 'Improve JavaScript execution efficiency',
            css: 'Optimize CSS for better rendering performance',
            images: 'Optimize images for faster loading'
        };
    }
}

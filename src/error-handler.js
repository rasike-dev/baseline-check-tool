export class ErrorHandler {
  constructor() {
    this.errorMessages = {
      'css.grid': {
        title: 'CSS Grid not supported in older browsers',
        suggestion: 'Use Flexbox fallback or add polyfill',
        quickFix: 'Add @supports fallback',
        code: `
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

@supports not (display: grid) {
  .container {
    display: flex;
    flex-wrap: wrap;
  }
  
  .container > * {
    flex: 1 1 300px;
  }
}`
      },
      'css.has_pseudo': {
        title: 'CSS :has() pseudo-class has limited support',
        suggestion: 'Use JavaScript alternative or wait for broader support',
        quickFix: 'Add JavaScript fallback',
        code: `
/* CSS */
.element:has(.child) {
  color: red;
}

/* JavaScript fallback */
if (!CSS.supports('selector(:has(.child))')) {
  document.querySelectorAll('.element').forEach(el => {
    if (el.querySelector('.child')) {
      el.classList.add('has-child');
    }
  });
}

/* Fallback CSS */
.element.has-child {
  color: red;
}`
      },
      'css.container_queries': {
        title: 'CSS Container Queries not widely supported',
        suggestion: 'Use media queries as fallback',
        quickFix: 'Add media query fallback',
        code: `
/* Container query */
@container (min-width: 300px) {
  .item { font-size: 1.2rem; }
}

/* Media query fallback */
@media (min-width: 300px) {
  .item { font-size: 1.2rem; }
}`
      },
      'Top-level await': {
        title: 'Top-level await requires ES2022 modules',
        suggestion: 'Wrap in async IIFE or use dynamic imports',
        quickFix: 'Wrap in async function',
        code: `
// Instead of:
const data = await fetch('/api').then(r => r.json());

// Use:
(async () => {
  const data = await fetch('/api').then(r => r.json());
  // Use data here
})();`
      },
      'Dynamic import': {
        title: 'Dynamic import() requires module bundling',
        suggestion: 'Use static imports or ensure proper bundling',
        quickFix: 'Use static import or require',
        code: `
// Instead of:
const module = await import('./module.js');

// Use static import:
import module from './module.js';

// Or for CommonJS:
const module = require('./module.js');`
      },
      'Optional chaining': {
        title: 'Optional chaining not supported in older browsers',
        suggestion: 'Use traditional null checks or add Babel transpilation',
        quickFix: 'Use traditional null checks',
        code: `
// Instead of:
const value = obj?.property?.value;

// Use:
const value = obj && obj.property && obj.property.value;`
      },
      'Nullish coalescing': {
        title: 'Nullish coalescing not supported in older browsers',
        suggestion: 'Use logical OR with null check or add Babel transpilation',
        quickFix: 'Use logical OR with null check',
        code: `
// Instead of:
const name = user.name ?? 'Anonymous';

// Use:
const name = user.name != null ? user.name : 'Anonymous';`
      }
    };
  }

  getErrorMessage(feature, status) {
    const error = this.errorMessages[feature];
    if (!error) {
      return this.getGenericMessage(feature, status);
    }

    return {
      ...error,
      status,
      feature
    };
  }

  getGenericMessage(feature, status) {
    const messages = {
      'risky': {
        title: `Feature "${feature}" has limited browser support`,
        suggestion: 'Consider adding polyfills or fallbacks',
        quickFix: 'Research compatibility and add appropriate fallbacks'
      },
      'unknown': {
        title: `Feature "${feature}" compatibility unknown`,
        suggestion: 'Research browser support and add compatibility data',
        quickFix: 'Check MDN documentation for browser support'
      }
    };

    return {
      ...messages[status] || messages.risky,
      status,
      feature
    };
  }

  formatError(error) {
    const { title, suggestion, quickFix, code, status, feature } = error;
    
    let output = `\n❌ ${title}\n`;
    output += `💡 Suggestion: ${suggestion}\n`;
    output += `🔧 Quick fix: ${quickFix}\n`;
    
    if (code) {
      output += `\n📝 Code example:\n${code}\n`;
    }
    
    output += `\n🔍 Learn more: https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(feature)}\n`;
    
    return output;
  }

  formatQuickFix(feature, status) {
    const error = this.getErrorMessage(feature, status);
    return {
      command: `npx baseline-check-tool fix --feature="${feature}"`,
      description: error.quickFix,
      code: error.code
    };
  }

  generateFixCommand(feature) {
    const error = this.errorMessages[feature];
    if (!error) {
      return `# Fix for ${feature}\n# Research browser support and add appropriate fallbacks`;
    }

    return `# Fix for ${feature}\n${error.code}`;
  }
}

export class ExamplesGenerator {
  constructor() {
    this.examples = {
      'react': {
        name: 'React',
        description: 'React-specific examples and best practices',
        patterns: ['**/*.{js,jsx,ts,tsx}'],
        examples: [
          {
            title: 'React Hooks with Feature Detection',
            description: 'Use feature detection for modern React features',
            code: `
import { useState, useEffect } from 'react';

// Feature detection for modern features
const useFeatureDetection = () => {
  const [hasIntersectionObserver, setHasIntersectionObserver] = useState(false);
  
  useEffect(() => {
    setHasIntersectionObserver('IntersectionObserver' in window);
  }, []);
  
  return { hasIntersectionObserver };
};

// Use in component
const MyComponent = () => {
  const { hasIntersectionObserver } = useFeatureDetection();
  
  useEffect(() => {
    if (hasIntersectionObserver) {
      // Use modern Intersection Observer
      const observer = new IntersectionObserver(callback);
      observer.observe(element);
    } else {
      // Fallback for older browsers
      // Use scroll event or other fallback
    }
  }, [hasIntersectionObserver]);
  
  return <div>Content</div>;
};`
          },
          {
            title: 'CSS-in-JS with Fallbacks',
            description: 'Use CSS-in-JS libraries that handle fallbacks',
            code: `
import styled from 'styled-components';

const Container = styled.div\`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  
  /* Fallback for older browsers */
  @supports not (display: grid) {
    display: flex;
    flex-wrap: wrap;
    
    > * {
      flex: 1 1 300px;
      margin: 0.5rem;
    }
  }
\`;`
          }
        ]
      },
      'vue': {
        name: 'Vue.js',
        description: 'Vue.js-specific examples and best practices',
        patterns: ['**/*.{js,ts,vue}'],
        examples: [
          {
            title: 'Vue 3 Composition API with Fallbacks',
            description: 'Use Composition API with feature detection',
            code: `
<template>
  <div ref="container" :class="{ 'has-grid': supportsGrid }">
    <slot />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const container = ref(null);
const supportsGrid = ref(false);

onMounted(() => {
  // Feature detection
  supportsGrid.value = CSS.supports('display', 'grid');
  
  if (!supportsGrid.value) {
    // Add fallback class
    container.value?.classList.add('fallback-layout');
  }
});
</script>

<style scoped>
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.fallback-layout {
  display: flex;
  flex-wrap: wrap;
}

.fallback-layout > * {
  flex: 1 1 300px;
}
</style>`
          }
        ]
      },
      'angular': {
        name: 'Angular',
        description: 'Angular-specific examples and best practices',
        patterns: ['**/*.{js,ts,html}'],
        examples: [
          {
            title: 'Angular with Feature Detection Service',
            description: 'Create a service for feature detection',
            code: `
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FeatureDetectionService {
  supportsGrid(): boolean {
    return CSS.supports('display', 'grid');
  }
  
  supportsCustomProperties(): boolean {
    return CSS.supports('color', 'var(--custom)');
  }
  
  supportsIntersectionObserver(): boolean {
    return 'IntersectionObserver' in window;
  }
}

// Use in component
@Component({
  selector: 'app-grid',
  template: \`
    <div [class]="gridClass">
      <ng-content></ng-content>
    </div>
  \`
})
export class GridComponent {
  constructor(private featureDetection: FeatureDetectionService) {}
  
  get gridClass() {
    return this.featureDetection.supportsGrid() 
      ? 'modern-grid' 
      : 'fallback-flex';
  }
}`
          }
        ]
      },
      'vanilla': {
        name: 'Vanilla JavaScript',
        description: 'Vanilla JavaScript examples and best practices',
        patterns: ['**/*.{js,html,css}'],
        examples: [
          {
            title: 'Progressive Enhancement Pattern',
            description: 'Build with progressive enhancement',
            code: `
// Start with basic functionality
function initApp() {
  // Basic functionality that works everywhere
  setupBasicFeatures();
  
  // Add enhancements for modern browsers
  if (supportsModernFeatures()) {
    addModernFeatures();
  }
}

function supportsModernFeatures() {
  return 'IntersectionObserver' in window &&
         CSS.supports('display', 'grid') &&
         'fetch' in window;
}

function setupBasicFeatures() {
  // Basic functionality
  document.addEventListener('DOMContentLoaded', () => {
    // Basic event handling
  });
}

function addModernFeatures() {
  // Modern features
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(handleIntersection);
    document.querySelectorAll('.observe').forEach(el => {
      observer.observe(el);
    });
  }
}`
          },
          {
            title: 'CSS Feature Detection',
            description: 'Use @supports for CSS feature detection',
            code: `
/* Modern CSS with fallbacks */
.container {
  /* Fallback for older browsers */
  display: flex;
  flex-wrap: wrap;
}

/* Modern browsers */
@supports (display: grid) {
  .container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
  }
}

/* CSS Custom Properties fallback */
:root {
  --primary-color: #007bff;
}

.button {
  background-color: #007bff; /* Fallback */
  background-color: var(--primary-color);
}

@supports (color: var(--custom)) {
  .button {
    background-color: var(--primary-color);
  }
}`
          }
        ]
      }
    };
  }

  generateExamples(framework = 'vanilla') {
    const frameworkData = this.examples[framework];
    if (!frameworkData) {
      throw new Error(`Unknown framework: ${framework}`);
    }

    let output = `# ${frameworkData.name} Examples and Best Practices\n\n`;
    output += `${frameworkData.description}\n\n`;
    output += `## File Patterns\n`;
    output += `\`\`\`\n${frameworkData.patterns.join('\n')}\n\`\`\`\n\n`;

    frameworkData.examples.forEach((example, index) => {
      output += `## ${index + 1}. ${example.title}\n\n`;
      output += `${example.description}\n\n`;
      output += `\`\`\`${this.getLanguage(framework)}\n${example.code}\n\`\`\`\n\n`;
    });

    return output;
  }

  getLanguage(framework) {
    const languages = {
      'react': 'jsx',
      'vue': 'vue',
      'angular': 'typescript',
      'vanilla': 'javascript'
    };
    return languages[framework] || 'javascript';
  }

  generateQuickStart(framework) {
    const quickStarts = {
      'react': `
# React Quick Start

1. Install baseline-check-tool:
   \`\`\`bash
   npm install -g baseline-check-tool
   \`\`\`

2. Initialize for React:
   \`\`\`bash
   baseline-check-tool setup --framework react
   \`\`\`

3. Scan your React project:
   \`\`\`bash
   baseline-check-tool run --paths "src"
   \`\`\`

4. Get recommendations:
   \`\`\`bash
   baseline-check-tool analyze
   \`\`\``,
      'vue': `
# Vue.js Quick Start

1. Install baseline-check-tool:
   \`\`\`bash
   npm install -g baseline-check-tool
   \`\`\`

2. Initialize for Vue:
   \`\`\`bash
   baseline-check-tool setup --framework vue
   \`\`\`

3. Scan your Vue project:
   \`\`\`bash
   baseline-check-tool run --paths "src"
   \`\`\`

4. Get recommendations:
   \`\`\`bash
   baseline-check-tool analyze
   \`\`\``,
      'angular': `
# Angular Quick Start

1. Install baseline-check-tool:
   \`\`\`bash
   npm install -g baseline-check-tool
   \`\`\`

2. Initialize for Angular:
   \`\`\`bash
   baseline-check-tool setup --framework angular
   \`\`\`

3. Scan your Angular project:
   \`\`\`bash
   baseline-check-tool run --paths "src"
   \`\`\`

4. Get recommendations:
   \`\`\`bash
   baseline-check-tool analyze
   \`\`\``,
      'vanilla': `
# Vanilla JavaScript Quick Start

1. Install baseline-check-tool:
   \`\`\`bash
   npm install -g baseline-check-tool
   \`\`\`

2. Initialize configuration:
   \`\`\`bash
   baseline-check-tool init
   \`\`\`

3. Scan your project:
   \`\`\`bash
   baseline-check-tool run --paths "."
   \`\`\`

4. Get recommendations:
   \`\`\`bash
   baseline-check-tool analyze
   \`\`\``
    };

    return quickStarts[framework] || quickStarts.vanilla;
  }

  getAvailableFrameworks() {
    return Object.keys(this.examples);
  }

  generateAllExamples() {
    let output = '# All Framework Examples\n\n';
    
    Object.keys(this.examples).forEach(framework => {
      output += `## ${this.examples[framework].name}\n\n`;
      output += this.generateQuickStart(framework);
      output += '\n\n---\n\n';
    });

    return output;
  }
}

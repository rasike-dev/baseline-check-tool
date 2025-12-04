/**
 * Enhanced Feature Detection for Baseline-Check
 * Comprehensive detection of modern web features, frameworks, PWA features, and accessibility
 */

export const ENHANCED_FEATURES = {
  // ===== MODERN WEB APIs =====
  modernAPIs: {
    // File System Access API
    "File System Access API": { 
      re: /showOpenFilePicker|showSaveFilePicker|showDirectoryPicker/g, 
      category: "api",
      description: "File System Access API for reading/writing files"
    },
    
    // Web Streams API
    "Web Streams API": { 
      re: /ReadableStream|WritableStream|TransformStream|new\s+ReadableStream/g, 
      category: "api",
      description: "Web Streams API for streaming data"
    },
    
    // Web Locks API
    "Web Locks API": { 
      re: /navigator\.locks|requestLock|releaseLock/g, 
      category: "api",
      description: "Web Locks API for coordination between tabs"
    },
    
    // Web Share API
    "Web Share API": { 
      re: /navigator\.share|canShare/g, 
      category: "api",
      description: "Web Share API for native sharing"
    },
    
    // Web Serial API
    "Web Serial API": { 
      re: /navigator\.serial|requestPort|openPort/g, 
      category: "api",
      description: "Web Serial API for serial communication"
    },
    
    // Web Bluetooth API
    "Web Bluetooth API": { 
      re: /navigator\.bluetooth|requestDevice|getAvailability/g, 
      category: "api",
      description: "Web Bluetooth API for Bluetooth communication"
    },
    
    // Web USB API
    "Web USB API": { 
      re: /navigator\.usb|requestDevice|getDevices/g, 
      category: "api",
      description: "Web USB API for USB device access"
    },
    
    // WebXR API
    "WebXR API": { 
      re: /navigator\.xr|requestSession|isSessionSupported/g, 
      category: "api",
      description: "WebXR API for VR/AR experiences"
    },
    
    // Web Audio API (advanced)
    "Web Audio API": { 
      re: /AudioContext|OfflineAudioContext|AudioWorklet/g, 
      category: "api",
      description: "Web Audio API for audio processing"
    },
    
    // Web Crypto API
    "Web Crypto API": { 
      re: /crypto\.subtle|generateKey|importKey|exportKey/g, 
      category: "api",
      description: "Web Crypto API for cryptographic operations"
    },
    
    // Web Animations API
    "Web Animations API": { 
      re: /element\.animate|Animation|KeyframeEffect/g, 
      category: "api",
      description: "Web Animations API for complex animations"
    },
    
    // Intersection Observer v2
    "Intersection Observer v2": { 
      re: /IntersectionObserver.*trackVisibility|trackVisibility.*true/g, 
      category: "api",
      description: "Intersection Observer v2 with visibility tracking"
    },
    
    // Resize Observer
    "Resize Observer": { 
      re: /ResizeObserver|ResizeObserverEntry/g, 
      category: "api",
      description: "Resize Observer for element size changes"
    },
    
    // Performance Observer
    "Performance Observer": { 
      re: /PerformanceObserver|observe.*performance/g, 
      category: "api",
      description: "Performance Observer for performance monitoring"
    },
    
    // Payment Request API
    "Payment Request API": { 
      re: /PaymentRequest|PaymentResponse|PaymentMethodChangeEvent/g, 
      category: "api",
      description: "Payment Request API for web payments"
    },
    
    // Web Authentication API
    "Web Authentication API": { 
      re: /navigator\.credentials|create.*publicKey|get.*publicKey/g, 
      category: "api",
      description: "Web Authentication API for strong authentication"
    }
  },

  // ===== CSS FEATURES =====
  modernCSS: {
    // CSS Grid (advanced)
    "CSS Grid (advanced)": { 
      re: /grid-template-areas|grid-area|subgrid/g, 
      category: "css",
      description: "Advanced CSS Grid features"
    },
    
    // CSS Flexbox (advanced)
    "CSS Flexbox (advanced)": { 
      re: /flex-basis|flex-grow|flex-shrink|align-content/g, 
      category: "css",
      description: "Advanced CSS Flexbox features"
    },
    
    // CSS Container Queries
    "CSS Container Queries": { 
      re: /@container|container-type|container-name/g, 
      category: "css",
      description: "CSS Container Queries for responsive design"
    },
    
    // CSS Subgrid
    "CSS Subgrid": { 
      re: /subgrid/g, 
      category: "css",
      description: "CSS Subgrid for nested grid layouts"
    },
    
    // CSS Cascade Layers
    "CSS Cascade Layers": { 
      re: /@layer|layer\(/g, 
      category: "css",
      description: "CSS Cascade Layers for better specificity control"
    },
    
    // CSS Color Functions
    "CSS Color Functions": { 
      re: /color-mix\(|oklch\(|lch\(|lab\(/g, 
      category: "css",
      description: "Modern CSS color functions"
    },
    
    // CSS View Transitions
    "CSS View Transitions": { 
      re: /@view-transition|view-transition-name/g, 
      category: "css",
      description: "CSS View Transitions for smooth page transitions"
    },
    
    // CSS Scroll-driven Animations
    "CSS Scroll-driven Animations": { 
      re: /animation-timeline|scroll\(|view\(/g, 
      category: "css",
      description: "CSS Scroll-driven Animations"
    },
    
    // CSS Nesting
    "CSS Nesting": { 
      re: /&[^:]*{|&::|&\./g, 
      category: "css",
      description: "CSS Nesting for better organization"
    },
    
    // CSS Logical Properties
    "CSS Logical Properties": { 
      re: /margin-(inline|block)|padding-(inline|block)|border-(inline|block)|inset-(inline|block)/g, 
      category: "css",
      description: "CSS Logical Properties for internationalization"
    },
    
    // CSS Custom Properties (advanced)
    "CSS Custom Properties (advanced)": { 
      re: /var\(--[^)]+\)|@property/g, 
      category: "css",
      description: "Advanced CSS Custom Properties with @property"
    },
    
    // CSS Math Functions
    "CSS Math Functions": { 
      re: /calc\(|min\(|max\(|clamp\(|sin\(|cos\(|tan\(|sqrt\(|pow\(/g, 
      category: "css",
      description: "CSS Math Functions for dynamic calculations"
    }
  },

  // ===== HTML FEATURES =====
  modernHTML: {
    // Web Components
    "Web Components": { 
      re: /customElements\.define|<[a-z]+-[a-z-]+/g, 
      category: "html",
      description: "Web Components for custom elements"
    },
    
    // Template Element
    "Template Element": { 
      re: /<template\b/g, 
      category: "html",
      description: "HTML Template element for reusable markup"
    },
    
    // Details/Summary Elements
    "Details/Summary Elements": { 
      re: /<details\b|<summary\b/g, 
      category: "html",
      description: "HTML Details and Summary elements"
    },
    
    // Dialog Element
    "Dialog Element": { 
      re: /<dialog\b/g, 
      category: "html",
      description: "HTML Dialog element for modals"
    },
    
    // Picture Element
    "Picture Element": { 
      re: /<picture\b/g, 
      category: "html",
      description: "HTML Picture element for responsive images"
    },
    
    // Video/Audio Elements (advanced)
    "Video/Audio Elements (advanced)": { 
      re: /<video.*controls|<audio.*controls/g, 
      category: "html",
      description: "HTML Video and Audio elements with controls"
    },
    
    // Form Elements (modern)
    "Form Elements (modern)": { 
      re: /<input.*type="(email|tel|url|search|number|range|date|time|datetime-local|color)"/g, 
      category: "html",
      description: "Modern HTML input types"
    },
    
    // Semantic HTML
    "Semantic HTML": { 
      re: /<(main|section|article|aside|nav|header|footer|figure|figcaption)\b/g, 
      category: "html",
      description: "Semantic HTML elements for better structure"
    }
  },

  // ===== JAVASCRIPT FEATURES =====
  modernJS: {
    // ES2020+ Features
    "Optional Chaining": { 
      re: /\?\./g, 
      category: "syntax",
      description: "Optional chaining operator (?.)"
    },
    
    "Nullish Coalescing": { 
      re: /\?\?/g, 
      category: "syntax",
      description: "Nullish coalescing operator (??)"
    },
    
    "Dynamic Import": { 
      re: /import\s*\(/g, 
      category: "syntax",
      description: "Dynamic import() for code splitting"
    },
    
    "Top-level Await": { 
      re: /^\s*await\s+/gm, 
      category: "syntax",
      description: "Top-level await in modules"
    },
    
    "Private Fields": { 
      re: /#\w+/g, 
      category: "syntax",
      description: "Private class fields (#field)"
    },
    
    "Static Blocks": { 
      re: /static\s*{/g, 
      category: "syntax",
      description: "Static initialization blocks"
    },
    
    "Logical Assignment": { 
      re: /\|\||&&|\?\?/g, 
      category: "syntax",
      description: "Logical assignment operators"
    },
    
    "Numeric Separators": { 
      re: /\d+_\d+/g, 
      category: "syntax",
      description: "Numeric separators for readability"
    },
    
    "String Methods": { 
      re: /\.replaceAll\(|\.matchAll\(/g, 
      category: "syntax",
      description: "Modern string methods"
    },
    
    "Array Methods": { 
      re: /\.flat\(|\.flatMap\(|\.at\(/g, 
      category: "syntax",
      description: "Modern array methods"
    },
    
    "Object Methods": { 
      re: /Object\.fromEntries\(|Object\.hasOwn\(/g, 
      category: "syntax",
      description: "Modern object methods"
    },
    
    "Promise Methods": { 
      re: /Promise\.allSettled\(|Promise\.any\(/g, 
      category: "syntax",
      description: "Modern Promise methods"
    },
    
    "BigInt": { 
      re: /\bBigInt\(|n\b/g, 
      category: "syntax",
      description: "BigInt for large integers"
    },
    
    "WeakRef": { 
      re: /WeakRef|FinalizationRegistry/g, 
      category: "syntax",
      description: "WeakRef and FinalizationRegistry"
    }
  },

  // ===== FRAMEWORK FEATURES =====
  frameworks: {
    // React Features
    "React Hooks": { 
      re: /useState|useEffect|useContext|useReducer|useMemo|useCallback|useRef|useImperativeHandle|useLayoutEffect|useDebugValue/g, 
      category: "framework",
      framework: "react",
      description: "React Hooks for state management"
    },
    
    "React Suspense": { 
      re: /<Suspense|<lazy\(/g, 
      category: "framework",
      framework: "react",
      description: "React Suspense for code splitting"
    },
    
    "React Concurrent Features": { 
      re: /startTransition|useDeferredValue|useId|useSyncExternalStore/g, 
      category: "framework",
      framework: "react",
      description: "React 18 Concurrent Features"
    },
    
    // Vue Features
    "Vue Composition API": { 
      re: /setup\(|ref\(|reactive\(|computed\(|watch\(|watchEffect\(/g, 
      category: "framework",
      framework: "vue",
      description: "Vue 3 Composition API"
    },
    
    "Vue 3 Features": { 
      re: /defineComponent|defineProps|defineEmits|defineExpose/g, 
      category: "framework",
      framework: "vue",
      description: "Vue 3 SFC Composition API"
    },
    
    // Angular Features
    "Angular Signals": { 
      re: /signal\(|computed\(|effect\(/g, 
      category: "framework",
      framework: "angular",
      description: "Angular Signals for reactive programming"
    },
    
    "Angular Standalone Components": { 
      re: /standalone:\s*true|bootstrapApplication/g, 
      category: "framework",
      framework: "angular",
      description: "Angular Standalone Components"
    },
    
    // Svelte Features
    "Svelte Stores": { 
      re: /writable\(|readable\(|derived\(/g, 
      category: "framework",
      framework: "svelte",
      description: "Svelte Stores for state management"
    },
    
    "Svelte Actions": { 
      re: /use:|action=/g, 
      category: "framework",
      framework: "svelte",
      description: "Svelte Actions for DOM manipulation"
    }
  },

  // ===== PWA FEATURES =====
  pwa: {
    "Service Worker": { 
      re: /navigator\.serviceWorker|addEventListener.*message|postMessage/g, 
      category: "pwa",
      description: "Service Worker for offline functionality"
    },
    
    "Web App Manifest": { 
      re: /manifest\.json|theme-color|background-color|display.*standalone/g, 
      category: "pwa",
      description: "Web App Manifest for PWA installation"
    },
    
    "Push Notifications": { 
      re: /PushManager|getSubscription|subscribe/g, 
      category: "pwa",
      description: "Push Notifications for user engagement"
    },
    
    "Background Sync": { 
      re: /backgroundSync|sync\.register/g, 
      category: "pwa",
      description: "Background Sync for offline data sync"
    },
    
    "Cache API": { 
      re: /caches\.open|cache\.add|cache\.put/g, 
      category: "pwa",
      description: "Cache API for offline storage"
    },
    
    "IndexedDB": { 
      re: /indexedDB|IDBDatabase|IDBTransaction/g, 
      category: "pwa",
      description: "IndexedDB for client-side storage"
    }
  },

  // ===== ACCESSIBILITY FEATURES =====
  accessibility: {
    "ARIA Attributes": { 
      re: /aria-[a-z-]+/g, 
      category: "accessibility",
      description: "ARIA attributes for screen reader support"
    },
    
    "Semantic HTML": { 
      re: /<(main|section|article|aside|nav|header|footer|figure|figcaption|time|mark|progress|meter)\b/g, 
      category: "accessibility",
      description: "Semantic HTML elements for better accessibility"
    },
    
    "Focus Management": { 
      re: /tabindex|focus\(|blur\(/g, 
      category: "accessibility",
      description: "Focus management for keyboard navigation"
    },
    
    "Color Contrast": { 
      re: /color:\s*#[0-9a-fA-F]{3,6}|background-color:\s*#[0-9a-fA-F]{3,6}/g, 
      category: "accessibility",
      description: "Color usage that may affect contrast"
    },
    
    "Alt Text": { 
      re: /<img[^>]*(?!alt=)[^>]*>/g, 
      category: "accessibility",
      description: "Images without alt text"
    },
    
    "Form Labels": { 
      re: /<input[^>]*(?!aria-label)[^>]*(?!aria-labelledby)[^>]*>/g, 
      category: "accessibility",
      description: "Form inputs without proper labeling"
    }
  }
};

/**
 * Get all enhanced features as a flat object
 */
export function getAllEnhancedFeatures() {
  const allFeatures = {};
  
  Object.values(ENHANCED_FEATURES).forEach(category => {
    Object.assign(allFeatures, category);
  });
  
  return allFeatures;
}

/**
 * Get features by category
 */
export function getFeaturesByCategory(category) {
  return ENHANCED_FEATURES[category] || {};
}

/**
 * Get features by framework
 */
export function getFeaturesByFramework(framework) {
  const frameworkFeatures = {};
  
  Object.values(ENHANCED_FEATURES).forEach(category => {
    Object.entries(category).forEach(([name, config]) => {
      if (config.framework === framework) {
        frameworkFeatures[name] = config;
      }
    });
  });
  
  return frameworkFeatures;
}

/**
 * Get feature statistics
 */
export function getFeatureStats() {
  const stats = {
    total: 0,
    byCategory: {},
    byFramework: {}
  };
  
  Object.entries(ENHANCED_FEATURES).forEach(([category, features]) => {
    const count = Object.keys(features).length;
    stats.total += count;
    stats.byCategory[category] = count;
    
    Object.values(features).forEach(feature => {
      if (feature.framework) {
        stats.byFramework[feature.framework] = (stats.byFramework[feature.framework] || 0) + 1;
      }
    });
  });
  
  return stats;
}

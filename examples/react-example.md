# React Example - Baseline Check Tool

This example shows how to integrate the Baseline Check Tool with a React project.

## 🚀 Quick Start

### 1. Install the Tool

```bash
npm install -g baseline-check-tool
# or
npx baseline-check-tool@latest
```

### 2. Initialize Configuration

```bash
npx baseline-check-tool init
```

### 3. Run Baseline Check

```bash
npx baseline-check-tool run --paths 'src' --out 'compatibility.json'
```

## 📁 Project Structure

```
react-project/
├── src/
│   ├── components/
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   └── Card.jsx
│   ├── hooks/
│   │   ├── useIntersectionObserver.js
│   │   └── useLocalStorage.js
│   ├── styles/
│   │   ├── globals.css
│   │   └── components.css
│   └── App.jsx
├── baseline-check.config.js
└── package.json
```

## ⚙️ Configuration

### `baseline-check.config.js`

```javascript
export default {
  // React-specific file patterns
  patterns: [
    "**/*.{js,jsx,ts,tsx}",
    "**/*.css",
    "**/*.scss"
  ],
  
  // Ignore build and dependency directories
  ignore: [
    "**/node_modules/**",
    "**/build/**",
    "**/dist/**",
    "**/coverage/**",
    "**/.next/**"
  ],
  
  // React-specific features
  features: {
    "React.Fragment": {
      "re": "/<React\\.Fragment|<Fragment/g",
      "category": "react"
    },
    "React.Suspense": {
      "re": "/<Suspense/g",
      "category": "react"
    },
    "React.lazy": {
      "re": "/React\\.lazy|lazy\\(/g",
      "category": "react"
    },
    "React.memo": {
      "re": "/React\\.memo|memo\\(/g",
      "category": "react"
    },
    "React.useEffect": {
      "re": "/useEffect\\(/g",
      "category": "react"
    },
    "React.useState": {
      "re": "/useState\\(/g",
      "category": "react"
    },
    "React.useCallback": {
      "re": "/useCallback\\(/g",
      "category": "react"
    },
    "React.useMemo": {
      "re": "/useMemo\\(/g",
      "category": "react"
    }
  },
  
  // Browser support thresholds
  baseline: {
    minBrowsers: 3,
    browsers: ['chrome', 'firefox', 'safari', 'edge']
  },
  
  // Performance settings
  performance: {
    maxFileSize: 1024 * 1024, // 1MB
    concurrentFiles: 10,
    cacheResults: true
  }
};
```

## 🎯 Example Components

### `src/components/Button.jsx`

```jsx
import React, { useState, useCallback } from 'react';
import './Button.css';

const Button = ({ children, onClick, variant = 'primary' }) => {
  const [isPressed, setIsPressed] = useState(false);
  
  const handleClick = useCallback((event) => {
    setIsPressed(true);
    onClick?.(event);
    
    // Reset pressed state after animation
    setTimeout(() => setIsPressed(false), 150);
  }, [onClick]);
  
  return (
    <button
      className={`btn btn-${variant} ${isPressed ? 'pressed' : ''}`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

export default React.memo(Button);
```

### `src/components/Modal.jsx`

```jsx
import React, { useEffect, useRef } from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, children }) => {
  const dialogRef = useRef(null);
  
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.showModal();
    } else if (dialogRef.current) {
      dialogRef.current.close();
    }
  }, [isOpen]);
  
  const handleBackdropClick = (event) => {
    if (event.target === dialogRef.current) {
      onClose();
    }
  };
  
  return (
    <dialog
      ref={dialogRef}
      className="modal"
      onClick={handleBackdropClick}
    >
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        {children}
      </div>
    </dialog>
  );
};

export default Modal;
```

### `src/hooks/useIntersectionObserver.js`

```javascript
import { useState, useEffect, useRef } from 'react';

const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers
      setIsIntersecting(true);
      setHasIntersected(true);
      return;
    }
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        ...options
      }
    );
    
    observer.observe(element);
    
    return () => {
      observer.unobserve(element);
    };
  }, [options, hasIntersected]);
  
  return [ref, isIntersecting, hasIntersected];
};

export default useIntersectionObserver;
```

### `src/styles/globals.css`

```css
/* CSS Custom Properties */
:root {
  --primary-color: #007bff;
  --secondary-color: #6c757d;
  --success-color: #28a745;
  --danger-color: #dc3545;
  --warning-color: #ffc107;
  --info-color: #17a2b8;
  
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-size-base: 16px;
  --line-height-base: 1.5;
  
  --border-radius: 0.375rem;
  --box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

/* CSS Grid Layout */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

/* Fallback for older browsers */
@supports not (display: grid) {
  .grid {
    display: flex;
    flex-wrap: wrap;
  }
  
  .grid > * {
    flex: 1 1 300px;
    margin: 0.5rem;
  }
}

/* CSS Container Queries */
@container (min-width: 300px) {
  .card {
    font-size: 1.2rem;
  }
}

/* CSS :has() pseudo-class */
.card:has(.card-header) {
  border-top: 3px solid var(--primary-color);
}

/* Modern CSS Functions */
.hero {
  height: clamp(400px, 50vh, 600px);
  background: linear-gradient(135deg, var(--primary-color), var(--info-color));
}

/* CSS Logical Properties */
.text {
  margin-inline-start: 1rem;
  margin-inline-end: 1rem;
  padding-block-start: 0.5rem;
  padding-block-end: 0.5rem;
}
```

## 🚀 CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/baseline-check.yml`:

```yaml
name: Baseline Check
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  baseline-check:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Baseline Check Tool
        run: npm install -g baseline-check-tool
        
      - name: Run Baseline Check
        run: |
          baseline-check-tool run \
            --paths 'src' \
            --out 'compatibility.json' \
            --config 'baseline-check.config.js'
            
      - name: Upload compatibility report
        uses: actions/upload-artifact@v3
        with:
          name: compatibility-report
          path: compatibility.json
          
      - name: Comment PR with results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const fs = require('fs');
            const report = JSON.parse(fs.readFileSync('compatibility.json', 'utf8'));
            
            const comment = `## 🔍 Baseline Compatibility Report
            
            **Scanned Files:** ${report.metadata.scannedFiles}
            **Processed Files:** ${report.metadata.processedFiles}
            
            ### Summary
            - ✅ **Baseline-like:** ${report.metadata.baselineLike || 0}
            - ⚠️ **Risky:** ${report.metadata.risky || 0}
            - ❓ **Unknown:** ${report.metadata.unknown || 0}
            
            [View full report](https://github.com/${{ github.repository }}/actions/runs/${{ github.run_id }})
            `;
            
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

### Package.json Scripts

Add to your `package.json`:

```json
{
  "scripts": {
    "baseline-check": "baseline-check-tool run --paths 'src' --out 'compatibility.json'",
    "baseline-check:report": "baseline-check-tool report --report 'compatibility.json' --format html --out 'compatibility-report.html'",
    "baseline-check:analyze": "baseline-check-tool analyze --report 'compatibility.json'",
    "baseline-check:examples": "baseline-check-tool examples --framework react"
  }
}
```

## 🎯 Usage Examples

### Basic Scan

```bash
# Scan React project
npm run baseline-check

# Generate HTML report
npm run baseline-check:report

# Get recommendations
npm run baseline-check:analyze
```

### Advanced Usage

```bash
# Scan specific directories
npx baseline-check-tool scan --paths 'src/components,src/hooks' --out 'components-scan.json'

# Check with custom browser support
npx baseline-check-tool check --report 'components-scan.json' --browsers 'chrome,firefox' --threshold 0.9

# Generate different report formats
npx baseline-check-tool report --report 'compatibility.json' --format json --out 'report.json'
npx baseline-check-tool report --report 'compatibility.json' --format markdown --out 'report.md'
```

### Interactive Mode

```bash
# Start interactive mode with watch
npx baseline-check-tool interactive --paths 'src'

# Watch for changes and auto-scan
npx baseline-check-tool interactive --paths 'src' --watch
```

## 🔧 Troubleshooting

### Common Issues

#### React Hooks Not Detected

Make sure your configuration includes React-specific patterns:

```javascript
features: {
  "React.useState": {
    "re": "/useState\\(/g",
    "category": "react"
  }
}
```

#### CSS Features Not Detected

Ensure CSS files are included in patterns:

```javascript
patterns: [
  "**/*.{js,jsx,ts,tsx}",
  "**/*.css",
  "**/*.scss"
]
```

#### Build Directory Issues

Add build directories to ignore patterns:

```javascript
ignore: [
  "**/node_modules/**",
  "**/build/**",
  "**/dist/**",
  "**/.next/**"
]
```

## 📊 Expected Results

After running the baseline check, you should see results like:

```json
{
  "metadata": {
    "scannedFiles": 15,
    "processedFiles": 15,
    "baselineLike": 12,
    "risky": 2,
    "unknown": 1
  },
  "results": [
    {
      "feature": "React.useState",
      "status": "baseline_like",
      "files": ["src/components/Button.jsx"],
      "count": 1
    },
    {
      "feature": "css.grid",
      "status": "baseline_like",
      "files": ["src/styles/globals.css"],
      "count": 1
    },
    {
      "feature": "css.container_queries",
      "status": "risky",
      "files": ["src/styles/globals.css"],
      "count": 1
    }
  ]
}
```

## 🎉 Next Steps

1. **Integrate with CI/CD** - Add the GitHub Action workflow
2. **Set up monitoring** - Track compatibility over time
3. **Customize configuration** - Add project-specific features
4. **Generate reports** - Create HTML reports for stakeholders
5. **Monitor trends** - Use analytics to track improvements

## 🔗 Resources

- [React Documentation](https://reactjs.org/docs)
- [Baseline Check Tool Documentation](../DOCS.md)
- [Browser Compatibility Data](https://github.com/mdn/browser-compat-data)
- [Can I Use](https://caniuse.com/)

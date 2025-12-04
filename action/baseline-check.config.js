export default {
  // Auto-generated config for React
  patterns: [
    "**/*.{js,jsx,ts,tsx}",
    "**/*.css",
    "**/*.scss"
],
  ignore: [
    "**/node_modules/**",
    "**/build/**",
    "**/dist/**",
    "**/coverage/**",
    "**/.next/**"
],
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
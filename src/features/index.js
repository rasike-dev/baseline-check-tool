/**
 * Enhanced Features Module
 * Exports all feature detection capabilities
 */

export { ENHANCED_FEATURES, getAllEnhancedFeatures, getFeaturesByCategory, getFeaturesByFramework, getFeatureStats } from './enhanced-features.js';
export { FeatureDetector, createFeatureDetector } from './feature-detector.js';

// Re-export for convenience
export * from './enhanced-features.js';
export * from './feature-detector.js';

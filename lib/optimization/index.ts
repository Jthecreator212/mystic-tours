// Optimization utilities index
export * from './image-optimization';
export * from './caching';

// Re-export optimization utilities for easy access
export { 
  generateOptimizedImageUrl,
  generateResponsiveImageUrls,
  getLazyLoadingProps,
  preloadImage,
  preloadImages,
  useImageOptimization,
} from './image-optimization';

export {
  cacheUtils,
  useCachedData,
  cacheInvalidation,
  localStorageCache,
  sessionStorageCache,
  cacheMetrics,
  CACHE_KEYS,
  CACHE_TTL,
} from './caching'; 
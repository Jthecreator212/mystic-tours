// Image optimization utilities
import React from 'react';
import { ImageData } from '@/types/utils/common';

export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  position?: 'top' | 'right top' | 'right' | 'right bottom' | 'bottom' | 'left bottom' | 'left' | 'left top' | 'center';
  background?: string;
  blur?: number;
  sharpen?: number;
}

export interface OptimizedImageData extends ImageData {
  optimizedUrl: string;
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
}

// Default optimization options
export const DEFAULT_OPTIMIZATION_OPTIONS: ImageOptimizationOptions = {
  quality: 80,
  format: 'webp',
  width: 1200,
  height: 800,
  fit: 'cover',
  position: 'center',
};

// Generate optimized image URL for Supabase Storage
export function generateOptimizedImageUrl(
  originalUrl: string,
  options: ImageOptimizationOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIMIZATION_OPTIONS, ...options };
  
  // If it's already a Supabase URL, add transformation parameters
  if (originalUrl.includes('supabase.co')) {
    const url = new URL(originalUrl);
    const params = new URLSearchParams();
    
    if (opts.width) params.append('width', opts.width.toString());
    if (opts.height) params.append('height', opts.height.toString());
    if (opts.quality) params.append('quality', opts.quality.toString());
    if (opts.format) params.append('format', opts.format);
    if (opts.fit) params.append('fit', opts.fit);
    if (opts.position) params.append('position', opts.position);
    if (opts.background) params.append('background', opts.background);
    if (opts.blur) params.append('blur', opts.blur.toString());
    if (opts.sharpen) params.append('sharpen', opts.sharpen.toString());
    
    if (params.toString()) {
      url.search = params.toString();
    }
    
    return url.toString();
  }
  
  return originalUrl;
}

// Generate responsive image URLs for different screen sizes
export function generateResponsiveImageUrls(
  originalUrl: string,
  breakpoints: { [key: string]: number } = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  }
): { [key: string]: string } {
  const urls: { [key: string]: string } = {};
  
  Object.entries(breakpoints).forEach(([breakpoint, width]) => {
    urls[breakpoint] = generateOptimizedImageUrl(originalUrl, { width });
  });
  
  return urls;
}

// Lazy loading image component props
export function getLazyLoadingProps(
  imageData: ImageData,
  options: ImageOptimizationOptions = {}
): {
  src: string;
  srcSet: string;
  sizes: string;
  loading: 'lazy';
  decoding: 'async';
} {
  const optimizedUrl = generateOptimizedImageUrl(imageData.url, options);
  const responsiveUrls = generateResponsiveImageUrls(imageData.url);
  
  const srcSet = Object.entries(responsiveUrls)
    .map(([breakpoint, url]) => {
      const width = breakpoint === 'sm' ? 640 : 
                   breakpoint === 'md' ? 768 : 
                   breakpoint === 'lg' ? 1024 : 
                   breakpoint === 'xl' ? 1280 : 1536;
      return `${url} ${width}w`;
    })
    .join(', ');
  
  const sizes = '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw';
  
  return {
    src: optimizedUrl,
    srcSet,
    sizes,
    loading: 'lazy' as const,
    decoding: 'async' as const,
  };
}

// Preload critical images
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${url}`));
    img.src = url;
  });
}

// Preload multiple images
export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(urls.map(preloadImage));
}

// Get image dimensions
export function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
}

// Calculate aspect ratio
export function calculateAspectRatio(width: number, height: number): number {
  return width / height;
}

// Generate placeholder image URL
export function generatePlaceholderUrl(
  width: number,
  height: number,
  text: string = 'Loading...',
  backgroundColor: string = '#f3f4f6',
  textColor: string = '#6b7280'
): string {
  const params = new URLSearchParams({
    width: width.toString(),
    height: height.toString(),
    text: encodeURIComponent(text),
    bg: backgroundColor.replace('#', ''),
    color: textColor.replace('#', ''),
  });
  
  return `https://via.placeholder.com/${width}x${height}/${backgroundColor.replace('#', '')}/${textColor.replace('#', '')}?text=${encodeURIComponent(text)}`;
}

// Image optimization hook
export function useImageOptimization(
  imageData: ImageData,
  options: ImageOptimizationOptions = {}
) {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  
  const optimizedUrl = React.useMemo(
    () => generateOptimizedImageUrl(imageData.url, options),
    [imageData.url, options]
  );
  
  const lazyProps = React.useMemo(
    () => getLazyLoadingProps(imageData, options),
    [imageData, options]
  );
  
  const handleLoad = React.useCallback(() => {
    setIsLoaded(true);
    setError(null);
  }, []);
  
  const handleError = React.useCallback((err: Error) => {
    setError(err);
    setIsLoaded(false);
  }, []);
  
  return {
    optimizedUrl,
    lazyProps,
    isLoaded,
    error,
    handleLoad,
    handleError,
  };
} 
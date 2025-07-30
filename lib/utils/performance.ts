// Performance monitoring and optimization utilities

export interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
}

export interface PerformanceThresholds {
  pageLoadTime: number; // ms
  firstContentfulPaint: number; // ms
  largestContentfulPaint: number; // ms
  firstInputDelay: number; // ms
  cumulativeLayoutShift: number; // score
}

// Default performance thresholds (Core Web Vitals)
export const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  pageLoadTime: 3000,
  firstContentfulPaint: 1800,
  largestContentfulPaint: 2500,
  firstInputDelay: 100,
  cumulativeLayoutShift: 0.1,
};

// Performance monitoring class
export class PerformanceMonitor {
  private metrics: PerformanceMetrics | null = null;
  private observers: PerformanceObserver[] = [];
  private thresholds: PerformanceThresholds;

  constructor(thresholds: PerformanceThresholds = DEFAULT_THRESHOLDS) {
    this.thresholds = thresholds;
    this.initObservers();
  }

  private initObservers() {
    // Observe Largest Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry && this.metrics) {
            this.metrics.largestContentfulPaint = lastEntry.startTime;
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported');
      }

      // Observe First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const firstEntry = entries[0] as PerformanceEventTiming;
          if (firstEntry && this.metrics) {
            this.metrics.firstInputDelay = firstEntry.processingStart - firstEntry.startTime;
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (error) {
        console.warn('FID observer not supported');
      }

              // Observe Layout Shifts
        try {
          const clsObserver = new PerformanceObserver((list) => {
            let clsValue = 0;
            for (const entry of list.getEntries()) {
              const layoutShiftEntry = entry as any;
              if (!layoutShiftEntry.hadRecentInput) {
                clsValue += layoutShiftEntry.value;
              }
            }
            if (this.metrics) {
              this.metrics.cumulativeLayoutShift = clsValue;
            }
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });
          this.observers.push(clsObserver);
        } catch (error) {
          console.warn('CLS observer not supported');
        }
    }
  }

  // Start monitoring page load performance
  startMonitoring(): void {
    this.metrics = {
      pageLoadTime: 0,
      domContentLoaded: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
      timeToInteractive: 0,
    };

    // Monitor page load time
    window.addEventListener('load', () => {
      if (this.metrics) {
        this.metrics.pageLoadTime = performance.now();
      }
    });

    // Monitor DOM content loaded
    document.addEventListener('DOMContentLoaded', () => {
      if (this.metrics) {
        this.metrics.domContentLoaded = performance.now();
      }
    });

    // Monitor First Contentful Paint
    if ('PerformanceObserver' in window) {
      try {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const firstEntry = entries[0];
          if (firstEntry && this.metrics) {
            this.metrics.firstContentfulPaint = firstEntry.startTime;
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.push(fcpObserver);
      } catch (error) {
        console.warn('FCP observer not supported');
      }
    }
  }

  // Get current performance metrics
  getMetrics(): PerformanceMetrics | null {
    return this.metrics;
  }

  // Check if metrics meet thresholds
  checkThresholds(): { passed: boolean; issues: string[] } {
    if (!this.metrics) {
      return { passed: false, issues: ['No metrics available'] };
    }

    const issues: string[] = [];

    if (this.metrics.pageLoadTime > this.thresholds.pageLoadTime) {
      issues.push(`Page load time (${this.metrics.pageLoadTime.toFixed(0)}ms) exceeds threshold (${this.thresholds.pageLoadTime}ms)`);
    }

    if (this.metrics.firstContentfulPaint > this.thresholds.firstContentfulPaint) {
      issues.push(`First Contentful Paint (${this.metrics.firstContentfulPaint.toFixed(0)}ms) exceeds threshold (${this.thresholds.firstContentfulPaint}ms)`);
    }

    if (this.metrics.largestContentfulPaint > this.thresholds.largestContentfulPaint) {
      issues.push(`Largest Contentful Paint (${this.metrics.largestContentfulPaint.toFixed(0)}ms) exceeds threshold (${this.thresholds.largestContentfulPaint}ms)`);
    }

    if (this.metrics.firstInputDelay > this.thresholds.firstInputDelay) {
      issues.push(`First Input Delay (${this.metrics.firstInputDelay.toFixed(0)}ms) exceeds threshold (${this.thresholds.firstInputDelay}ms)`);
    }

    if (this.metrics.cumulativeLayoutShift > this.thresholds.cumulativeLayoutShift) {
      issues.push(`Cumulative Layout Shift (${this.metrics.cumulativeLayoutShift.toFixed(3)}) exceeds threshold (${this.thresholds.cumulativeLayoutShift})`);
    }

    return {
      passed: issues.length === 0,
      issues,
    };
  }

  // Clean up observers
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Performance optimization utilities
export const performanceUtils = {
  // Debounce function calls
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function calls
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Lazy load images
  lazyLoadImage(img: HTMLImageElement, src: string): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = src;
          observer.unobserve(img);
        }
      });
    });
    observer.observe(img);
  },

  // Preload critical resources
  preloadResource(href: string, as: string): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  },

  // Measure function execution time
  measureExecutionTime<T>(fn: () => T, label: string): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    console.log(`${label}: ${(end - start).toFixed(2)}ms`);
    return result;
  },

  // Async measure function execution time
  async measureAsyncExecutionTime<T>(fn: () => Promise<T>, label: string): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    console.log(`${label}: ${(end - start).toFixed(2)}ms`);
    return result;
  },
};

import React from 'react';

// React hook for performance monitoring
export function usePerformanceMonitoring(thresholds?: PerformanceThresholds) {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics | null>(null);
  const [issues, setIssues] = React.useState<string[]>([]);

  React.useEffect(() => {
    const monitor = new PerformanceMonitor(thresholds);
    monitor.startMonitoring();

    const checkMetrics = () => {
      const currentMetrics = monitor.getMetrics();
      if (currentMetrics) {
        setMetrics(currentMetrics);
        const thresholdCheck = monitor.checkThresholds();
        setIssues(thresholdCheck.issues);
      }
    };

    // Check metrics periodically
    const interval = setInterval(checkMetrics, 1000);

    return () => {
      clearInterval(interval);
      monitor.destroy();
    };
  }, [thresholds]);

  return { metrics, issues };
} 
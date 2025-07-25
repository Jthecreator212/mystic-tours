"use client"

import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  timeToInteractive: number;
}

interface PerformanceMonitorProps {
  onMetrics?: (metrics: PerformanceMetrics) => void;
  enabled?: boolean;
}

export function PerformanceMonitor({ onMetrics, enabled = true }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const observerRef = useRef<PerformanceObserver | null>(null);
  const navigationStartRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const collectMetrics = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      const navigationStart = navigation.startTime;

      navigationStartRef.current = navigationStart;

      const pageLoadTime = navigation.loadEventEnd - navigationStart;
      const domContentLoaded = navigation.domContentLoadedEventEnd - navigationStart;

      const firstContentfulPaint = paintEntries.find(
        entry => entry.name === 'first-contentful-paint'
      )?.startTime || 0;

      const metrics: PerformanceMetrics = {
        pageLoadTime,
        domContentLoaded,
        firstContentfulPaint,
        largestContentfulPaint: 0,
        firstInputDelay: 0,
        cumulativeLayoutShift: 0,
        timeToInteractive: 0,
      };

      setMetrics(metrics);
      onMetrics?.(metrics);

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Performance Metrics:', metrics);
      }

      // Send to analytics in production
      if (process.env.NODE_ENV === 'production') {
        sendToAnalytics(metrics);
      }
    };

    // Collect initial metrics when page loads
    if (document.readyState === 'complete') {
      collectMetrics();
    } else {
      window.addEventListener('load', collectMetrics);
    }

    // Set up Performance Observer for LCP
    if ('PerformanceObserver' in window) {
      try {
        observerRef.current = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          if (lastEntry && lastEntry.entryType === 'largest-contentful-paint') {
            const lcp = lastEntry.startTime - navigationStartRef.current;
            setMetrics(prev => prev ? { ...prev, largestContentfulPaint: lcp } : null);
          }
        });

        observerRef.current.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.warn('PerformanceObserver not supported:', error);
      }
    }

    // Set up CLS observer
    if ('PerformanceObserver' in window) {
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          setMetrics(prev => prev ? { ...prev, cumulativeLayoutShift: clsValue } : null);
        });

        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('CLS PerformanceObserver not supported:', error);
      }
    }

    // Measure First Input Delay
    const measureFID = () => {
      if ('PerformanceObserver' in window) {
        try {
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const firstInput = entries[0];
            
                         if (firstInput) {
               const fid = (firstInput as any).processingStart - firstInput.startTime;
               setMetrics(prev => prev ? { ...prev, firstInputDelay: fid } : null);
             }
          });

          fidObserver.observe({ entryTypes: ['first-input'] });
        } catch (error) {
          console.warn('FID PerformanceObserver not supported:', error);
        }
      }
    };

    // Measure Time to Interactive
    const measureTTI = () => {
      if ('PerformanceObserver' in window) {
        try {
          const ttiObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const ttiEntry = entries.find(entry => entry.entryType === 'measure' && entry.name === 'TTI');
            
            if (ttiEntry) {
              const tti = ttiEntry.startTime - navigationStartRef.current;
              setMetrics(prev => prev ? { ...prev, timeToInteractive: tti } : null);
            }
          });

          ttiObserver.observe({ entryTypes: ['measure'] });
        } catch (error) {
          console.warn('TTI PerformanceObserver not supported:', error);
        }
      }
    };

    measureFID();
    measureTTI();

    return () => {
      window.removeEventListener('load', collectMetrics);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, onMetrics]);

  const sendToAnalytics = (metrics: PerformanceMetrics) => {
    // Send to your analytics service (Google Analytics, Mixpanel, etc.)
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', 'performance_metrics', {
        page_load_time: metrics.pageLoadTime,
        dom_content_loaded: metrics.domContentLoaded,
        first_contentful_paint: metrics.firstContentfulPaint,
        largest_contentful_paint: metrics.largestContentfulPaint,
        first_input_delay: metrics.firstInputDelay,
        cumulative_layout_shift: metrics.cumulativeLayoutShift,
        time_to_interactive: metrics.timeToInteractive,
      });
    }

    // Send to custom analytics endpoint
    fetch('/api/analytics/performance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: window.location.href,
        timestamp: new Date().toISOString(),
        metrics,
      }),
    }).catch(error => {
      console.warn('Failed to send performance metrics:', error);
    });
  };

  // This component doesn't render anything
  return null;
}

// Hook for accessing performance metrics
export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  return {
    metrics,
    PerformanceMonitor: () => (
      <PerformanceMonitor onMetrics={setMetrics} />
    ),
  };
} 
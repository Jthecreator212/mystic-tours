// Analytics provider for comprehensive tracking
'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, unknown>;
}

interface AnalyticsContextType {
  trackEvent: (event: AnalyticsEvent) => void;
  trackPageView: (path: string, title?: string) => void;
  trackConversion: (goal: string, value?: number) => void;
  trackError: (error: Error, context?: string) => void;
  trackPerformance: (metric: string, value: number) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: React.ReactNode;
  googleAnalyticsId?: string;
  enableDebug?: boolean;
}

export function AnalyticsProvider({ 
  children, 
  googleAnalyticsId,
  enableDebug = process.env.NODE_ENV === 'development'
}: AnalyticsProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize Google Analytics
  useEffect(() => {
    if (googleAnalyticsId && typeof window !== 'undefined') {
      // Load Google Analytics script
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        // Initialize gtag
        (window as { dataLayer?: unknown[] }).dataLayer = (window as { dataLayer?: unknown[] }).dataLayer || [];
        function gtag(...args: unknown[]) {
          (window as { dataLayer?: unknown[] }).dataLayer!.push(args);
        }
        (window as { gtag?: typeof gtag }).gtag = gtag;

        gtag('js', new Date());
        gtag('config', googleAnalyticsId, {
          page_title: document.title,
          page_location: window.location.href,
        });

        setIsInitialized(true);
        
        if (enableDebug) {
          console.log('Analytics initialized with ID:', googleAnalyticsId);
        }
      };
    } else {
      setIsInitialized(true);
    }
  }, [googleAnalyticsId, enableDebug]);

  // Track page views function
  const trackPageView = useCallback((path: string, title?: string) => {
    if (!isInitialized) return;

    const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
    if (gtag) {
      gtag('config', googleAnalyticsId, {
        page_path: path,
        page_title: title,
      });
    }

    // Send to custom analytics endpoint
    fetch('/api/analytics/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path,
        title,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        referrer: document.referrer,
      }),
    }).catch(error => {
      if (enableDebug) {
        console.error('Failed to send pageview:', error);
      }
    });

    if (enableDebug) {
      console.log('Page View:', { path, title });
    }
  }, [isInitialized, googleAnalyticsId, enableDebug]);

  // Track page views
  useEffect(() => {
    if (!isInitialized) return;

    const handleRouteChange = (url: string) => {
      trackPageView(url, document.title);
    };

    // Track initial page view
    trackPageView(window.location.pathname, document.title);

    // Listen for route changes
    window.addEventListener('popstate', () => {
      handleRouteChange(window.location.pathname);
    });

    return () => {
      window.removeEventListener('popstate', () => {
        handleRouteChange(window.location.pathname);
      });
    };
  }, [isInitialized, trackPageView]);

  const trackEvent = (event: AnalyticsEvent) => {
    if (!isInitialized) return;

    const gtag = (window as { gtag?: (...args: unknown[]) => void }).gtag;
    if (gtag) {
      gtag('event', event.event, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.custom_parameters,
      });
    }

    // Send to custom analytics endpoint
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...event,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        url: window.location.href,
      }),
    }).catch(error => {
      if (enableDebug) {
        console.error('Failed to send analytics event:', error);
      }
    });

    if (enableDebug) {
      console.log('Analytics Event:', event);
    }
  };

  const trackConversion = (goal: string, value?: number) => {
    trackEvent({
      event: 'conversion',
      category: 'engagement',
      action: goal,
      value,
      custom_parameters: {
        goal_id: goal,
      },
    });
  };

  const trackError = (error: Error, context?: string) => {
    trackEvent({
      event: 'exception',
      category: 'error',
      action: error.name,
      label: error.message,
      custom_parameters: {
        error_stack: error.stack,
        context,
        url: window.location.href,
      },
    });
  };

  const trackPerformance = (metric: string, value: number) => {
    trackEvent({
      event: 'timing_complete',
      category: 'performance',
      action: metric,
      value: Math.round(value),
      custom_parameters: {
        metric_name: metric,
      },
    });
  };

  const value: AnalyticsContextType = {
    trackEvent,
    trackPageView,
    trackConversion,
    trackError,
    trackPerformance,
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
}

// Create tracking functions that accept analytics context
export const createTrackingFunctions = (analytics: AnalyticsContextType) => ({
  trackBooking: (tourId: string, tourName: string, value: number) => {
    analytics.trackConversion('booking_completed', value);
    
    analytics.trackEvent({
      event: 'booking',
      category: 'conversion',
      action: 'book_tour',
      label: tourName,
      value,
      custom_parameters: {
        tour_id: tourId,
        tour_name: tourName,
      },
    });
  },

  trackTourView: (tourId: string, tourName: string) => {
    analytics.trackEvent({
      event: 'view_item',
      category: 'engagement',
      action: 'view_tour',
      label: tourName,
      custom_parameters: {
        tour_id: tourId,
        tour_name: tourName,
      },
    });
  },

  trackFormSubmission: (formType: string, success: boolean) => {
    analytics.trackEvent({
      event: 'form_submit',
      category: 'engagement',
      action: formType,
      label: success ? 'success' : 'error',
      custom_parameters: {
        form_type: formType,
        success,
      },
    });
  },

  trackSearch: (query: string, results: number) => {
    analytics.trackEvent({
      event: 'search',
      category: 'engagement',
      action: 'search_tours',
      label: query,
      value: results,
      custom_parameters: {
        search_query: query,
        results_count: results,
      },
    });
  },
});

// Hook to access tracking functions
export function useTracking() {
  const analytics = useAnalytics();
  return createTrackingFunctions(analytics);
} 
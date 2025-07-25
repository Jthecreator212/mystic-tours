// Code splitting utilities for better performance
import React, { ComponentType, lazy, Suspense } from 'react';

// Lazy loading wrapper with error boundary
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const LazyComponent = lazy(importFunc);
  
  return function LazyWrapper(props: React.ComponentProps<T>) {
    const FallbackComponent = fallback || DefaultFallback;
    return (
      <Suspense fallback={<FallbackComponent />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Default fallback component
function DefaultFallback() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a5d1a]"></div>
    </div>
  );
}

// Route-based code splitting
export const LazyRoutes = {
  // Admin routes
  AdminDashboard: createLazyComponent(() => import('@/app/(admin)/mt-operations/page')),
  AdminBookings: createLazyComponent(() => import('@/app/(admin)/mt-operations/bookings/page')),
  AdminTours: createLazyComponent(() => import('@/app/(admin)/mt-operations/tours/page')),
  AdminDrivers: createLazyComponent(() => import('@/app/(admin)/mt-operations/drivers/page')),
  AdminCustomers: createLazyComponent(() => import('@/app/(admin)/mt-operations/customers/page')),
  AdminFinances: createLazyComponent(() => import('@/app/(admin)/mt-operations/finances/page')),
  AdminContent: createLazyComponent(() => import('@/app/(admin)/mt-operations/content/page')),
  AdminImages: createLazyComponent(() => import('@/app/(admin)/mt-operations/images/page')),
  AdminSettings: createLazyComponent(() => import('@/app/(admin)/mt-operations/settings/page')),
  
  // Public routes
  ToursPage: createLazyComponent(() => import('@/app/tours/page')),
  AboutPage: createLazyComponent(() => import('@/app/about/page')),
  ContactPage: createLazyComponent(() => import('@/app/contact/page')),
  GalleryPage: createLazyComponent(() => import('@/app/gallery/page')),
  AirportPickup: createLazyComponent(() => import('@/app/airport-pickup/page')),
  
  // Components with named exports
  TourBookingForm: createLazyComponent(() => import('@/components/forms/tour-booking-form').then(mod => ({ default: mod.TourBookingForm }))),
  AirportPickupForm: createLazyComponent(() => import('@/components/forms/airport-pickup-form').then(mod => ({ default: mod.AirportPickupForm }))),
  ContactForm: createLazyComponent(() => import('@/components/forms/contact-form').then(mod => ({ default: mod.ContactForm }))),
  TourCard: createLazyComponent(() => import('@/components/features/tour-card').then(mod => ({ default: mod.TourCard }))),
  TestimonialCarousel: createLazyComponent(() => import('@/components/features/testimonial-carousel').then(mod => ({ default: mod.TestimonialCarousel }))),
  FeaturedToursCarousel: createLazyComponent(() => import('@/components/features/featured-tours-carousel').then(mod => ({ default: mod.FeaturedToursCarousel }))),
};

// Dynamic imports for heavy components
export const DynamicComponents = {
  // Keep this simple - only include components that definitely exist
  TourGallery: createLazyComponent(() => import('@/components/features/tour-gallery').then(mod => ({ default: mod.TourGallery }))),
  TourItinerary: createLazyComponent(() => import('@/components/features/tour-itinerary').then(mod => ({ default: mod.TourItinerary }))),
};

// Preload components for better UX
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function preloadComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): () => void {
  let preloaded: T | null = null;
  
  return () => {
    if (!preloaded) {
      importFunc().then(module => {
        preloaded = module.default;
      });
    }
  };
}

// Preload critical components
export const preloadCriticalComponents = () => {
  // Preload components that are likely to be needed
  const preloaders = [
    preloadComponent(() => import('@/components/forms/tour-booking-form').then(mod => ({ default: mod.TourBookingForm }))),
    preloadComponent(() => import('@/components/features/tour-card').then(mod => ({ default: mod.TourCard }))),
    preloadComponent(() => import('@/components/layout/navbar').then(mod => ({ default: mod.Navbar }))),
  ];
  
  // Execute preloaders
  preloaders.forEach(preloader => preloader());
};

// Bundle analyzer helper
export function analyzeBundle() {
  if (process.env.NODE_ENV === 'development') {
    // In development, we can analyze bundle size
    console.log('Bundle analysis available in development mode');
    
    // You can integrate with webpack-bundle-analyzer here
    // import('webpack-bundle-analyzer').then(analyzer => {
    //   analyzer.default();
    // });
  }
}

// Performance monitoring for lazy components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withPerformanceMonitoring<T extends ComponentType<any>>(
  Component: T,
  componentName: string
): T {
  const WrappedComponent = (props: React.ComponentProps<T>) => {
    const startTime = performance.now();
    
    React.useEffect(() => {
      const loadTime = performance.now() - startTime;
      console.log(`${componentName} loaded in ${loadTime.toFixed(2)}ms`);
      
      // Send to analytics
      if (typeof (window as { gtag?: (...args: unknown[]) => void }).gtag !== 'undefined') {
        ((window as unknown) as { gtag: (...args: unknown[]) => void }).gtag('event', 'component_load', {
          component_name: componentName,
          load_time: loadTime,
        });
      }
    }, [startTime]);
    
    return React.createElement(Component, props);
  };
  
  WrappedComponent.displayName = `withPerformanceMonitoring(${componentName})`;
  
  return WrappedComponent as T;
}

// Conditional loading based on user interaction
export function useConditionalLoading<T>(
  shouldLoad: boolean,
  importFunc: () => Promise<T>
): T | null {
  const [module, setModule] = React.useState<T | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  
  React.useEffect(() => {
    if (shouldLoad && !module && !isLoading) {
      setIsLoading(true);
      importFunc()
        .then(setModule)
        .catch(error => {
          console.error('Failed to load module:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [shouldLoad, module, isLoading, importFunc]);
  
  return module;
}

// Route-based preloading
export function preloadRoute(route: string) {
  const routeMap: { [key: string]: () => Promise<unknown> } = {
    '/tours': () => import('@/app/tours/page'),
    '/about': () => import('@/app/about/page'),
    '/contact': () => import('@/app/contact/page'),
    '/gallery': () => import('@/app/gallery/page'),
    '/airport-pickup': () => import('@/app/airport-pickup/page'),
    '/admin': () => import('@/app/(admin)/mt-operations/page'),
  };
  
  const importFunc = routeMap[route];
  if (importFunc) {
    importFunc();
  }
}

// Intersection Observer for lazy loading
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  
  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);
    
    observer.observe(element);
    
    return () => {
      observer.unobserve(element);
    };
  }, [ref, options]);
  
  return isIntersecting;
} 
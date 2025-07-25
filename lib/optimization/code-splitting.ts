// Code splitting utilities for better performance
import React, { ComponentType, lazy, Suspense } from 'react';

// Lazy loading wrapper with error boundary
export function createLazyComponent<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ComponentType
) {
  const LazyComponent = lazy(importFunc);
  
  return function LazyWrapper(props: React.ComponentProps<T>) {
    return (
      <Suspense fallback={fallback ? React.createElement(fallback) : <DefaultFallback />}>
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
  TourDetail: createLazyComponent(() => import('@/app/tours/[slug]/page')),
  AboutPage: createLazyComponent(() => import('@/app/about/page')),
  ContactPage: createLazyComponent(() => import('@/app/contact/page')),
  GalleryPage: createLazyComponent(() => import('@/app/gallery/page')),
  AirportPickup: createLazyComponent(() => import('@/app/airport-pickup/page')),
  
  // Components
  TourBookingForm: createLazyComponent(() => import('@/components/forms/tour-booking-form')),
  AirportPickupForm: createLazyComponent(() => import('@/components/forms/airport-pickup-form')),
  ContactForm: createLazyComponent(() => import('@/components/forms/contact-form')),
  TourCard: createLazyComponent(() => import('@/components/features/tour-card')),
  TestimonialCarousel: createLazyComponent(() => import('@/components/features/testimonial-carousel')),
  FeaturedToursCarousel: createLazyComponent(() => import('@/components/features/featured-tours-carousel')),
};

// Dynamic imports for heavy components
export const DynamicComponents = {
  // Charts and data visualization
  Chart: createLazyComponent(() => import('@/components/ui/chart')),
  
  // Complex forms
  AdvancedForm: createLazyComponent(() => import('@/components/forms/advanced-form')),
  
  // Admin components
  AdminTable: createLazyComponent(() => import('@/components/admin/admin-table')),
  AdminChart: createLazyComponent(() => import('@/components/admin/admin-chart')),
  
  // Feature components
  InteractiveMap: createLazyComponent(() => import('@/components/features/interactive-map')),
  VirtualTour: createLazyComponent(() => import('@/components/features/virtual-tour')),
};

// Preload components for better UX
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
    preloadComponent(() => import('@/components/forms/tour-booking-form')),
    preloadComponent(() => import('@/components/features/tour-card')),
    preloadComponent(() => import('@/components/layout/navbar')),
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
      if (typeof (window as any).gtag !== 'undefined') {
        (window as any).gtag('event', 'component_load', {
          component_name: componentName,
          load_time: loadTime,
        });
      }
    }, []);
    
    return <Component {...props} />;
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
  const routeMap: { [key: string]: () => Promise<any> } = {
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
// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
  pagination?: {
    limit: number;
    offset: number;
    total: number;
  };
}

// Database Entity Types
export interface Tour {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  price: number;
  duration: string;
  group_size: string;
  includes: string[];
  departure: string;
  languages: string[];
  image_url: string;
  highlights: string[];
  itinerary: unknown[];
  categories: string[];
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  seo_title?: string;
  seo_description?: string;
  created_at: string;
  updated_at: string;
}

export interface TourInput {
  name: string;
  slug: string;
  short_description: string;
  description: string;
  price: number;
  duration: string;
  max_passengers: number;
  min_passengers: number;
  category?: string;
  difficulty?: 'easy' | 'moderate' | 'challenging' | 'expert';
  featured_image?: string;
  gallery_images?: string[];
  highlights?: string[];
  included?: string[];
  not_included?: string[];
  requirements?: string[];
  status?: 'draft' | 'published' | 'archived';
  seo_title?: string;
  seo_description?: string;
  currency?: string;
  location?: {
    city: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  availability?: {
    available: boolean;
    max_bookings: number;
  };
}

export interface Booking {
  id: number;
  tour_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  passengers: number;
  tour_date: string;
  pickup_location?: string;
  special_requests?: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface Driver {
  id: number;
  name: string;
  email: string;
  phone?: string;
  license_number?: string;
  vehicle_info?: string;
  status: 'active' | 'inactive' | 'suspended';
  availability: boolean;
  created_at: string;
  updated_at: string;
}

export interface Content {
  id: number;
  title: string;
  content: string;
  page: string;
  order_index?: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface AirportPickup {
  id: number;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  flight_number?: string;
  arrival_date: string;
  arrival_time: string;
  pickup_location: string;
  destination: string;
  passengers: number;
  special_requests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

// Query Parameter Types
export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface SearchParams {
  search?: string;
  category?: string;
  status?: string;
}

export interface DateRangeParams {
  date_from?: string;
  date_to?: string;
}

// Database Operation Types
export interface DatabaseQueryOptions {
  select?: string;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
  filters?: Record<string, unknown>;
}

export interface DatabaseResult<T> {
  data: T | null;
  error: unknown;
  count?: number;
}

// Analytics Types
export interface AnalyticsEvent {
  event: string;
  category?: string;
  action?: string;
  label?: string;
  value?: number;
  custom_parameters?: Record<string, unknown>;
  timestamp?: string;
  user_agent?: string;
  url?: string;
}

export interface Pageview {
  path: string;
  title?: string;
  referrer?: string;
  user_agent?: string;
  timestamp?: string;
} 
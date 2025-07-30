// Tour API types
export interface Tour {
  id: string;
  title: string; // Database field name
  slug: string;
  short_description: string;
  description: string;
  image_url: string; // Database field name
  price: number;
  duration: string;
  group_size: string; // Database field name
  includes: string[]; // Database field name
  departure: string; // Database field name
  languages: string[]; // Database field name
  created_at: string;
  updated_at: string;
  seo_title?: string;
  seo_description?: string;
  gallery_ids?: string[];
  highlights?: string[];
  itinerary?: any; // JSONB field
  categories?: string[];
  tags?: string[];
  status?: string;

  // Frontend convenience fields (mapped from database fields)
  name?: string; // Maps to title
  featured_image?: string; // Maps to image_url
  max_passengers?: number; // Extracted from group_size
  min_passengers?: number;
  category?: string; // From categories array
  difficulty?: TourDifficulty;
  included?: string[]; // Maps to includes
  not_included?: string[];
  gallery_images?: string[];
  requirements?: string[];
  location?: TourLocation;
  availability?: TourAvailability;
  currency?: string;
}

export type TourDifficulty = 'easy' | 'moderate' | 'challenging' | 'expert';

export interface TourItinerary {
  day: number;
  title: string;
  description: string;
  duration: string;
  activities: string[];
}

export interface TourImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  order: number;
}

export interface TourLocation {
  city: string;
  region: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  pickup_locations: string[];
}

export interface TourAvailability {
  available_days: string[];
  start_times: string[];
  seasonal_availability?: {
    start_month: number;
    end_month: number;
  };
  blackout_dates?: string[];
}

export interface TourResponse {
  success: boolean;
  data?: Tour;
  error?: string;
  message?: string;
}

export interface TourListResponse {
  success: boolean;
  data?: Tour[];
  error?: string;
  total?: number;
  page?: number;
  limit?: number;
  filters?: TourFilters;
}

export interface TourFilters {
  category?: string;
  difficulty?: TourDifficulty;
  min_price?: number;
  max_price?: number;
  duration?: string;
  location?: string;
}

export interface CreateTourRequest {
  name: string;
  slug: string;
  description: string;
  short_description: string;
  duration: string;
  price: number;
  currency: string;
  max_passengers: number;
  min_passengers: number;
  category: string;
  difficulty: TourDifficulty;
  included: string[];
  not_included: string[];
  itinerary: TourItinerary[];
  highlights: string[];
  requirements: string[];
  location: TourLocation;
  availability: TourAvailability;
  featured_image?: string;
  gallery_images?: string[];
  status?: string;
  seo_title?: string;
  seo_description?: string;
}

export interface UpdateTourRequest extends Partial<CreateTourRequest> {
  id: string;
} 
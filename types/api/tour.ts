// Tour API types
export interface Tour {
  id: string;
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
  images: TourImage[];
  featured_image: string;
  gallery_images: string[];
  highlights: string[];
  requirements: string[];
  location: TourLocation;
  availability: TourAvailability;
  created_at: string;
  updated_at: string;
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
}

export interface UpdateTourRequest extends Partial<CreateTourRequest> {
  id: string;
} 
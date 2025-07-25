// Database schema types
// These types mirror the actual database structure

// Tours table
export interface TourRecord {
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
  difficulty: 'easy' | 'moderate' | 'challenging' | 'expert';
  included: string[];
  not_included: string[];
  itinerary: TourItineraryRecord[];
  images: TourImageRecord[];
  featured_image: string;
  gallery_images: string[];
  highlights: string[];
  requirements: string[];
  location: TourLocationRecord;
  availability: TourAvailabilityRecord;
  created_at: string;
  updated_at: string;
}

export interface TourItineraryRecord {
  day: number;
  title: string;
  description: string;
  duration: string;
  activities: string[];
}

export interface TourImageRecord {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  order: number;
}

export interface TourLocationRecord {
  city: string;
  region: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  pickup_locations: string[];
}

export interface TourAvailabilityRecord {
  available_days: string[];
  start_times: string[];
  seasonal_availability?: {
    start_month: number;
    end_month: number;
  };
  blackout_dates?: string[];
}

// Bookings table
export interface BookingRecord {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  tour_id: string;
  tour_name: string;
  tour_slug: string;
  passengers: number;
  tour_date: string;
  tour_time: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Airport pickup bookings table
export interface AirportPickupBookingRecord {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  service_type: 'pickup' | 'dropoff' | 'both';
  flight_number: string;
  arrival_date: string;
  arrival_time: string;
  dropoff_location: string;
  departure_flight_number?: string;
  departure_date?: string;
  departure_time?: string;
  pickup_location?: string;
  passengers: number;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
}

// Drivers table
export interface DriverRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  license_number: string;
  vehicle_info: VehicleInfoRecord;
  availability: DriverAvailabilityRecord;
  rating: number;
  total_trips: number;
  status: 'available' | 'busy' | 'offline' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface VehicleInfoRecord {
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate: string;
  capacity: number;
}

export interface DriverAvailabilityRecord {
  available_days: string[];
  available_hours: {
    start: string;
    end: string;
  };
  current_location?: {
    lat: number;
    lng: number;
  };
}

// Driver assignments table
export interface DriverAssignmentRecord {
  id: string;
  driver_id: string;
  booking_id: string;
  assignment_date: string;
  pickup_time: string;
  pickup_location: string;
  dropoff_location: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Content table
export interface ContentRecord {
  id: string;
  type: 'page' | 'section' | 'component';
  title: string;
  slug: string;
  content: string;
  metadata?: Record<string, unknown>;
  published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

// Team table
export interface TeamMemberRecord {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url: string;
  email?: string;
  phone?: string;
  social_links?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

// Testimonials table
export interface TestimonialRecord {
  id: string;
  customer_name: string;
  customer_email?: string;
  tour_name: string;
  rating: number;
  review: string;
  image_url?: string;
  verified: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

// Database table names
export const DATABASE_TABLES = {
  tours: 'tours',
  bookings: 'bookings',
  airport_pickup_bookings: 'airport_pickup_bookings',
  drivers: 'drivers',
  driver_assignments: 'driver_assignments',
  content: 'content',
  team: 'team',
  testimonials: 'testimonials',
} as const;

// Database column types
export type DatabaseColumnType = 
  | 'uuid'
  | 'text'
  | 'varchar'
  | 'integer'
  | 'bigint'
  | 'decimal'
  | 'boolean'
  | 'timestamp'
  | 'date'
  | 'time'
  | 'json'
  | 'jsonb'
  | 'array';

// Database constraint types
export type DatabaseConstraintType = 
  | 'primary_key'
  | 'foreign_key'
  | 'unique'
  | 'not_null'
  | 'check'
  | 'default';

// Database index types
export type DatabaseIndexType = 
  | 'btree'
  | 'hash'
  | 'gin'
  | 'gist'
  | 'spgist'
  | 'brin'; 
import { z } from 'zod';

// Base schemas for common fields
export const baseIdSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
});

export const paginationSchema = z.object({
  limit: z.number().min(1).max(1000).default(100),
  offset: z.number().min(0).default(0),
});

export const searchSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
});

// Tour schemas
export const tourSchema = z.object({
  name: z.string().min(1, 'Tour name is required'),
  slug: z.string().min(1, 'Slug is required'),
  short_description: z.string().min(1, 'Short description is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be positive'),
  duration: z.string().min(1, 'Duration is required'),
  max_passengers: z.number().min(1, 'Max passengers must be at least 1'),
  min_passengers: z.number().min(1, 'Min passengers must be at least 1'),
  category: z.string().optional(),
  difficulty: z.enum(['easy', 'moderate', 'challenging', 'expert']).default('easy'),
  featured_image: z.string().optional(),
  gallery_images: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
  included: z.array(z.string()).optional(),
  not_included: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  currency: z.string().default('USD'),
  location: z.object({
    city: z.string(),
    country: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    })
  }).optional(),
  availability: z.object({
    available: z.boolean(),
    max_bookings: z.number()
  }).optional(),
});

export const tourUpdateSchema = tourSchema.partial();

// Booking schemas
export const bookingSchema = z.object({
  tour_id: z.number(),
  customer_name: z.string().min(1, 'Customer name is required'),
  customer_email: z.string().email('Valid email is required'),
  customer_phone: z.string().optional(),
  passengers: z.number().min(1, 'At least 1 passenger required'),
  tour_date: z.string().min(1, 'Tour date is required'),
  pickup_location: z.string().optional(),
  special_requests: z.string().optional(),
  total_price: z.number().min(0, 'Price must be positive'),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).default('pending'),
});

export const bookingUpdateSchema = bookingSchema.partial();

// Driver schemas
export const driverSchema = z.object({
  name: z.string().min(1, 'Driver name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  license_number: z.string().optional(),
  vehicle_info: z.string().optional(),
  status: z.enum(['active', 'inactive', 'suspended']).default('active'),
  availability: z.boolean().default(true),
});

export const driverUpdateSchema = driverSchema.partial();

// Content schemas
export const contentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  page: z.string().min(1, 'Page is required'),
  order_index: z.number().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

export const contentUpdateSchema = contentSchema.partial();

// Airport pickup schemas
export const airportPickupSchema = z.object({
  customer_name: z.string().min(1, 'Customer name is required'),
  customer_email: z.string().email('Valid email is required'),
  customer_phone: z.string().optional(),
  flight_number: z.string().optional(),
  arrival_date: z.string().min(1, 'Arrival date is required'),
  arrival_time: z.string().min(1, 'Arrival time is required'),
  pickup_location: z.string().min(1, 'Pickup location is required'),
  destination: z.string().min(1, 'Destination is required'),
  passengers: z.number().min(1, 'At least 1 passenger required'),
  special_requests: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).default('pending'),
});

export const airportPickupUpdateSchema = airportPickupSchema.partial();

// Analytics schemas
export const analyticsEventSchema = z.object({
  event: z.string().min(1, 'Event type is required'),
  category: z.string().optional(),
  action: z.string().optional(),
  label: z.string().optional(),
  value: z.number().optional(),
  custom_parameters: z.record(z.any()).optional(),
  timestamp: z.string().optional(),
  user_agent: z.string().optional(),
  url: z.string().optional(),
});

export const pageviewSchema = z.object({
  path: z.string().min(1, 'Path is required'),
  title: z.string().optional(),
  referrer: z.string().optional(),
  user_agent: z.string().optional(),
  timestamp: z.string().optional(),
});

// Export all schemas
export const schemas = {
  tour: tourSchema,
  tourUpdate: tourUpdateSchema,
  booking: bookingSchema,
  bookingUpdate: bookingUpdateSchema,
  driver: driverSchema,
  driverUpdate: driverUpdateSchema,
  content: contentSchema,
  contentUpdate: contentUpdateSchema,
  airportPickup: airportPickupSchema,
  airportPickupUpdate: airportPickupUpdateSchema,
  analyticsEvent: analyticsEventSchema,
  pageview: pageviewSchema,
  pagination: paginationSchema,
  search: searchSchema,
  baseId: baseIdSchema,
}; 
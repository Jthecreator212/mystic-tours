-- Performance Optimization Indexes for Mystic Tours
-- This migration adds indexes to improve query performance

-- Bookings table indexes
CREATE INDEX IF NOT EXISTS idx_bookings_status_created 
ON bookings (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bookings_tour_status 
ON bookings (tour_id, status);

CREATE INDEX IF NOT EXISTS idx_bookings_customer_id 
ON bookings (customer_id);

-- Airport pickup bookings indexes
CREATE INDEX IF NOT EXISTS idx_airport_pickup_date_status 
ON airport_pickup_bookings (pickup_date, status);

CREATE INDEX IF NOT EXISTS idx_airport_pickup_customer_id 
ON airport_pickup_bookings (customer_id);

-- Drivers table indexes
CREATE INDEX IF NOT EXISTS idx_drivers_status_available 
ON drivers (status, available) WHERE available = true;

CREATE INDEX IF NOT EXISTS idx_drivers_name 
ON drivers (name);

-- Driver assignments indexes
CREATE INDEX IF NOT EXISTS idx_assignments_date_driver 
ON driver_assignments (assigned_at DESC, driver_id);

CREATE INDEX IF NOT EXISTS idx_assignments_booking_id 
ON driver_assignments (booking_id);

-- Tours table indexes
CREATE INDEX IF NOT EXISTS idx_tours_slug_active 
ON tours (slug, active) WHERE active = true;

CREATE INDEX IF NOT EXISTS idx_tours_category 
ON tours (category);

CREATE INDEX IF NOT EXISTS idx_tours_price 
ON tours (price);

-- Testimonials table indexes
CREATE INDEX IF NOT EXISTS idx_testimonials_approved 
ON testimonials (approved) WHERE approved = true;

CREATE INDEX IF NOT EXISTS idx_testimonials_created_at 
ON testimonials (created_at DESC);

-- Blog posts table indexes (if they exist)
CREATE INDEX IF NOT EXISTS idx_blog_posts_published 
ON blog_posts (published, created_at DESC) WHERE published = true;

-- Add comments for documentation
COMMENT ON INDEX idx_bookings_status_created IS 'Optimizes booking queries by status and date';
COMMENT ON INDEX idx_bookings_tour_status IS 'Optimizes tour-specific booking queries';
COMMENT ON INDEX idx_airport_pickup_date_status IS 'Optimizes airport pickup date range queries';
COMMENT ON INDEX idx_drivers_status_available IS 'Optimizes driver availability queries';
COMMENT ON INDEX idx_assignments_date_driver IS 'Optimizes driver assignment date queries';
COMMENT ON INDEX idx_tours_slug_active IS 'Optimizes tour lookup by slug'; 
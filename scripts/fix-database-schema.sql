-- Fix Database Schema for Mystic Tours
-- Run this in Supabase Studio SQL Editor

-- 1. Check if tours table exists and has correct columns
DO $$
BEGIN
    -- Check if tours table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tours') THEN
        RAISE EXCEPTION 'Tours table does not exist. Please run the create-tables.sql script first.';
    END IF;
    
    -- Check if departure column exists (should be departure, not departure_details)
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'departure') THEN
        RAISE EXCEPTION 'Column "departure" does not exist in tours table. Please check your schema.';
    END IF;
    
    -- Check if tour_itinerary table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tour_itinerary') THEN
        RAISE EXCEPTION 'Tour itinerary table does not exist. Please run the create-tables.sql script first.';
    END IF;
    
    -- Check if tour_itinerary has correct columns (should not have 'day' column)
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'tour_itinerary' AND column_name = 'day') THEN
        RAISE EXCEPTION 'Tour itinerary table has incorrect "day" column. Should have title, description, display_order.';
    END IF;
    
    RAISE NOTICE 'Database schema check completed successfully.';
END $$;

-- 2. Show current tours table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'tours' 
ORDER BY ordinal_position;

-- 3. Show current tour_itinerary table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'tour_itinerary' 
ORDER BY ordinal_position;

-- 4. Show current testimonials table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'testimonials' 
ORDER BY ordinal_position;

-- 5. Check if there are any tours in the database
SELECT COUNT(*) as tour_count FROM tours;

-- 6. Check if there are any testimonials in the database
SELECT COUNT(*) as testimonial_count FROM testimonials; 
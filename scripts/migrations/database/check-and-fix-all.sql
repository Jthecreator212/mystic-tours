-- Comprehensive Database Check and Fix for Mystic Tours
-- Run this in Supabase Studio SQL Editor

-- 1. Check if tours table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tours') THEN
        RAISE NOTICE 'Tours table does not exist. Creating it...';
        
        -- Create tours table
        CREATE TABLE tours (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          title TEXT NOT NULL,
          slug TEXT UNIQUE NOT NULL,
          short_description TEXT NOT NULL,
          description TEXT NOT NULL,
          image_url TEXT NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          duration TEXT NOT NULL,
          group_size TEXT NOT NULL,
          includes TEXT[] NOT NULL,
          departure TEXT NOT NULL,
          languages TEXT[] NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Tours table created successfully.';
    ELSE
        RAISE NOTICE 'Tours table exists.';
    END IF;
END $$;

-- 2. Check tours table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'tours' 
ORDER BY ordinal_position;

-- 3. Check if departure column exists (should be departure, not departure_details)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'departure') THEN
        RAISE NOTICE 'Column "departure" does not exist in tours table.';
        
        -- Check if departure_details exists and rename it
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'tours' AND column_name = 'departure_details') THEN
            ALTER TABLE tours RENAME COLUMN departure_details TO departure;
            RAISE NOTICE 'Renamed departure_details to departure.';
        ELSE
            -- Add departure column if neither exists
            ALTER TABLE tours ADD COLUMN departure TEXT;
            RAISE NOTICE 'Added departure column.';
        END IF;
    ELSE
        RAISE NOTICE 'Column "departure" exists in tours table.';
    END IF;
END $$;

-- 4. Check if tour_highlights table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tour_highlights') THEN
        RAISE NOTICE 'Tour highlights table does not exist. Creating it...';
        
        CREATE TABLE tour_highlights (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
          content TEXT NOT NULL
        );
        
        RAISE NOTICE 'Tour highlights table created successfully.';
    ELSE
        RAISE NOTICE 'Tour highlights table exists.';
    END IF;
END $$;

-- 5. Check if tour_itinerary table exists and has correct structure
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tour_itinerary') THEN
        RAISE NOTICE 'Tour itinerary table does not exist. Creating it...';
        
        CREATE TABLE tour_itinerary (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          display_order INTEGER NOT NULL
        );
        
        RAISE NOTICE 'Tour itinerary table created successfully.';
    ELSE
        RAISE NOTICE 'Tour itinerary table exists.';
        
        -- Check if it has incorrect 'day' column
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'tour_itinerary' AND column_name = 'day') THEN
            RAISE NOTICE 'Tour itinerary table has incorrect "day" column. Removing it...';
            ALTER TABLE tour_itinerary DROP COLUMN day;
        END IF;
        
        -- Ensure it has the correct columns
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'tour_itinerary' AND column_name = 'title') THEN
            ALTER TABLE tour_itinerary ADD COLUMN title TEXT NOT NULL DEFAULT '';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'tour_itinerary' AND column_name = 'description') THEN
            ALTER TABLE tour_itinerary ADD COLUMN description TEXT NOT NULL DEFAULT '';
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'tour_itinerary' AND column_name = 'display_order') THEN
            ALTER TABLE tour_itinerary ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0;
        END IF;
    END IF;
END $$;

-- 6. Check if tour_gallery_images table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tour_gallery_images') THEN
        RAISE NOTICE 'Tour gallery images table does not exist. Creating it...';
        
        CREATE TABLE tour_gallery_images (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          tour_id UUID REFERENCES tours(id) ON DELETE CASCADE,
          image_url TEXT NOT NULL,
          alt_text TEXT NOT NULL
        );
        
        RAISE NOTICE 'Tour gallery images table created successfully.';
    ELSE
        RAISE NOTICE 'Tour gallery images table exists.';
    END IF;
END $$;

-- 7. Show final table structures
SELECT '=== TOURS TABLE STRUCTURE ===' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'tours' 
ORDER BY ordinal_position;

SELECT '=== TOUR_ITINERARY TABLE STRUCTURE ===' as info;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'tour_itinerary' 
ORDER BY ordinal_position;

-- 8. Check data counts
SELECT '=== DATA COUNTS ===' as info;
SELECT COUNT(*) as tours_count FROM tours;
SELECT COUNT(*) as highlights_count FROM tour_highlights;
SELECT COUNT(*) as itinerary_count FROM tour_itinerary;
SELECT COUNT(*) as gallery_count FROM tour_gallery_images;
SELECT COUNT(*) as testimonials_count FROM testimonials;

-- 9. Show final status
SELECT 'Database check and fix completed successfully!' as status; 
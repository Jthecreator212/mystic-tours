-- CRITICAL SECURITY FIX: Implement Proper Row Level Security Policies
-- This migration secures all sensitive tables with proper RLS policies

-- Enable RLS on all sensitive tables
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE airport_pickup_bookings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admin only drivers" ON drivers;
DROP POLICY IF EXISTS "Admin only assignments" ON driver_assignments;
DROP POLICY IF EXISTS "Admin only bookings" ON bookings;
DROP POLICY IF EXISTS "Admin only airport bookings" ON airport_pickup_bookings;
DROP POLICY IF EXISTS "Public can create bookings" ON bookings;
DROP POLICY IF EXISTS "Public can create airport bookings" ON airport_pickup_bookings;
DROP POLICY IF EXISTS "Admin bookings management" ON bookings;
DROP POLICY IF EXISTS "Admin airport bookings management" ON airport_pickup_bookings;
DROP POLICY IF EXISTS "Admin bookings delete" ON bookings;
DROP POLICY IF EXISTS "Admin airport bookings delete" ON airport_pickup_bookings;

-- DRIVERS TABLE: Admin-only access
CREATE POLICY "Admin only drivers" ON drivers
FOR ALL USING (auth.role() = 'service_role');

-- DRIVER_ASSIGNMENTS TABLE: Admin-only access
CREATE POLICY "Admin only assignments" ON driver_assignments
FOR ALL USING (auth.role() = 'service_role');

-- BOOKINGS TABLE: Public can create, admin can manage
CREATE POLICY "Public can create bookings" ON bookings
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin bookings management" ON bookings
FOR ALL USING (auth.role() = 'service_role');

-- AIRPORT_PICKUP_BOOKINGS TABLE: Public can create, admin can manage
CREATE POLICY "Public can create airport bookings" ON airport_pickup_bookings
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin airport bookings management" ON airport_pickup_bookings
FOR ALL USING (auth.role() = 'service_role');

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_email ON bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_airport_pickup_bookings_created_at ON airport_pickup_bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_airport_pickup_bookings_status ON airport_pickup_bookings(status);
CREATE INDEX IF NOT EXISTS idx_airport_pickup_bookings_customer_email ON airport_pickup_bookings(customer_email);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status) WHERE status = 'available';
CREATE INDEX IF NOT EXISTS idx_driver_assignments_assigned_at ON driver_assignments(assigned_at DESC);

-- Add constraints for data integrity (only if they don't exist)
DO $$ 
BEGIN
    -- Booking status constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'check_booking_status') THEN
        ALTER TABLE bookings ADD CONSTRAINT check_booking_status 
        CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));
    END IF;
    
    -- Airport booking status constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'check_airport_booking_status') THEN
        ALTER TABLE airport_pickup_bookings ADD CONSTRAINT check_airport_booking_status 
        CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));
    END IF;
    
    -- Positive amount constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'check_positive_amount') THEN
        ALTER TABLE bookings ADD CONSTRAINT check_positive_amount 
        CHECK (total_amount > 0);
    END IF;
    
    -- Positive price constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'check_positive_price') THEN
        ALTER TABLE airport_pickup_bookings ADD CONSTRAINT check_positive_price 
        CHECK (total_price > 0);
    END IF;
    
    -- Positive guests constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'check_positive_guests') THEN
        ALTER TABLE bookings ADD CONSTRAINT check_positive_guests 
        CHECK (number_of_people > 0);
    END IF;
    
    -- Positive passengers constraint
    IF NOT EXISTS (SELECT 1 FROM information_schema.check_constraints WHERE constraint_name = 'check_positive_passengers') THEN
        ALTER TABLE airport_pickup_bookings ADD CONSTRAINT check_positive_passengers 
        CHECK (passengers > 0);
    END IF;
END $$;

-- Add triggers for audit logging (optional)
CREATE OR REPLACE FUNCTION log_booking_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (table_name, operation, record_id, old_data, new_data, user_id)
        VALUES ('bookings', 'INSERT', NEW.id, NULL, to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (table_name, operation, record_id, old_data, new_data, user_id)
        VALUES ('bookings', 'UPDATE', NEW.id, to_jsonb(OLD), to_jsonb(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (table_name, operation, record_id, old_data, new_data, user_id)
        VALUES ('bookings', 'DELETE', OLD.id, to_jsonb(OLD), NULL, auth.uid());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit log table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    operation TEXT NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    user_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes to audit log
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);

-- Create trigger for bookings audit
DROP TRIGGER IF EXISTS trigger_bookings_audit ON bookings;
CREATE TRIGGER trigger_bookings_audit
    AFTER INSERT OR UPDATE OR DELETE ON bookings
    FOR EACH ROW EXECUTE FUNCTION log_booking_changes();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant specific permissions to authenticated users for public tables
GRANT SELECT ON tours TO anon, authenticated;
GRANT SELECT ON testimonials TO anon, authenticated;
GRANT INSERT ON bookings TO anon, authenticated;
GRANT INSERT ON airport_pickup_bookings TO anon, authenticated;

-- Verify the policies are in place
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('drivers', 'driver_assignments', 'bookings', 'airport_pickup_bookings')
ORDER BY tablename, policyname; 
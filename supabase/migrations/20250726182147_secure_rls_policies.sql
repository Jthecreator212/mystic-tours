-- CRITICAL SECURITY FIX: Implement Proper Row Level Security Policies
-- This migration fixes dangerous public access to sensitive customer data

-- 1. FIX DANGEROUS AIRPORT PICKUP POLICIES
DROP POLICY IF EXISTS \
Allow
public
read/insert\ ON airport_pickup_bookings;

-- Migration: Create booking_special_requests table for special requests per booking
create table if not exists booking_special_requests (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings(id) on delete cascade,
  special_request text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Optional: Add index for faster lookup by booking_id
create index if not exists idx_booking_special_requests_booking_id on booking_special_requests(booking_id); 
-- Add a 'notes' column to airport_pickup_bookings for admin and customer notes
ALTER TABLE airport_pickup_bookings
ADD COLUMN notes text NULL; 
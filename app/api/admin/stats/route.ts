import { supabaseAdmin } from '@/lib/supabase/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get total tour bookings
    const { data: tourBookings, error: tourBookingsError } = await supabaseAdmin
      .from('bookings')
      .select('*');

    if (tourBookingsError) {
      console.error('Error fetching tour bookings:', tourBookingsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch dashboard statistics' },
        { status: 500 }
      );
    }

    // Get total airport pickup bookings
    const { data: airportBookings, error: airportBookingsError } = await supabaseAdmin
      .from('airport_pickup_bookings')
      .select('*');

    if (airportBookingsError) {
      console.error('Error fetching airport pickup bookings:', airportBookingsError);
    }

    // Get total tours
    const { data: tours, error: toursError } = await supabaseAdmin
      .from('tours')
      .select('*');

    if (toursError) {
      console.error('Error fetching tours:', toursError);
    }

    // Get total drivers
    const { data: drivers, error: driversError } = await supabaseAdmin
      .from('drivers')
      .select('*');

    if (driversError) {
      console.error('Error fetching drivers:', driversError);
    }

    // Get total images
    const { data: images, error: imagesError } = await supabaseAdmin
      .from('gallery_images')
      .select('*');

    if (imagesError) {
      console.error('Error fetching images:', imagesError);
    }

    // Calculate combined statistics
    const allBookings = [...(tourBookings || []), ...(airportBookings || [])];
    
    // Calculate revenue from tour bookings (total_amount field)
    const tourRevenue = tourBookings?.reduce((sum, booking) => {
      return sum + (booking.total_amount || 0);
    }, 0) || 0;

    // Calculate revenue from airport pickup bookings (total_price field)
    const airportRevenue = airportBookings?.reduce((sum, booking) => {
      return sum + (booking.total_price || 0);
    }, 0) || 0;

    const stats = {
      totalBookings: allBookings.length,
      totalTourBookings: tourBookings?.length || 0,
      totalPickups: airportBookings?.length || 0,
      totalTours: tours?.length || 0,
      totalDrivers: drivers?.length || 0,
      totalImages: images?.length || 0,
      totalRevenue: tourRevenue + airportRevenue,
      completedBookings: allBookings.filter(b => b.status === 'completed').length,
      pendingBookings: allBookings.filter(b => b.status === 'pending').length,
      cancelledBookings: allBookings.filter(b => b.status === 'cancelled').length,
    };

    return NextResponse.json(stats);

  } catch (err) {
    console.error('Unexpected error fetching stats:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
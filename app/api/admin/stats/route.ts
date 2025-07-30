import { supabaseAdmin } from '@/lib/supabase';
import { createAppError, createErrorResponse, ERROR_CODES } from '@/lib/utils/error-handling';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch all statistics in parallel for better performance
    const [
      bookingsResult,
      airportBookingsResult,
      driversResult,
      assignmentsResult
    ] = await Promise.allSettled([
      supabaseAdmin.from('bookings').select('*'),
      supabaseAdmin.from('airport_pickup_bookings').select('*'),
      supabaseAdmin.from('drivers').select('*'),
      supabaseAdmin.from('driver_assignments').select('*')
    ]);

    // Handle database errors
    const errors = [];
    if (bookingsResult.status === 'rejected') {
      console.error('Error fetching bookings:', bookingsResult.reason);
      errors.push('Failed to fetch tour bookings');
    }
    if (airportBookingsResult.status === 'rejected') {
      console.error('Error fetching airport bookings:', airportBookingsResult.reason);
      errors.push('Failed to fetch airport pickup bookings');
    }
    if (driversResult.status === 'rejected') {
      console.error('Error fetching drivers:', driversResult.reason);
      errors.push('Failed to fetch drivers');
    }
    if (assignmentsResult.status === 'rejected') {
      console.error('Error fetching assignments:', assignmentsResult.reason);
      errors.push('Failed to fetch driver assignments');
    }

    if (errors.length > 0) {
      const error = createAppError(
        ERROR_CODES.DB_QUERY,
        'Failed to fetch dashboard statistics',
        'Unable to retrieve some data'
      );
      return NextResponse.json(
        createErrorResponse('DB_QUERY', 'Failed to fetch dashboard statistics', { errors }),
        { status: 503 }
      );
    }

    // Extract data from successful results
    const bookings = bookingsResult.status === 'fulfilled' ? bookingsResult.value.data || [] : [];
    const airportBookings = airportBookingsResult.status === 'fulfilled' ? airportBookingsResult.value.data || [] : [];
    const drivers = driversResult.status === 'fulfilled' ? driversResult.value.data || [] : [];
    const assignments = assignmentsResult.status === 'fulfilled' ? assignmentsResult.value.data || [] : [];

    // Calculate statistics
    const totalBookings = bookings.length + airportBookings.length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.total_amount || 0), 0) +
                        airportBookings.reduce((sum, booking) => sum + (booking.total_price || 0), 0);
    
    const pendingBookings = bookings.filter(b => b.status === 'pending').length +
                           airportBookings.filter(b => b.status === 'pending').length;
    
    const confirmedBookings = bookings.filter(b => b.status === 'confirmed').length +
                             airportBookings.filter(b => b.status === 'confirmed').length;
    
    const availableDrivers = drivers.filter(d => d.status === 'available').length;
    const busyDrivers = drivers.filter(d => d.status === 'busy').length;
    
    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentBookings = bookings.filter(b => new Date(b.created_at) > sevenDaysAgo).length +
                          airportBookings.filter(b => new Date(b.created_at) > sevenDaysAgo).length;

    const stats = {
      totalBookings,
      totalRevenue: Math.round(totalRevenue * 100) / 100, // Round to 2 decimal places
      pendingBookings,
      confirmedBookings,
      totalDrivers: drivers.length,
      availableDrivers,
      busyDrivers,
      totalAssignments: assignments.length,
      recentBookings,
      bookingsByStatus: {
        pending: pendingBookings,
        confirmed: confirmedBookings,
        cancelled: bookings.filter(b => b.status === 'cancelled').length +
                  airportBookings.filter(b => b.status === 'cancelled').length,
        completed: bookings.filter(b => b.status === 'completed').length +
                  airportBookings.filter(b => b.status === 'completed').length
      },
      driversByStatus: {
        available: availableDrivers,
        busy: busyDrivers,
        offline: drivers.filter(d => d.status === 'offline').length
      }
    };

    return NextResponse.json({
      success: true,
      stats,
      message: 'Dashboard statistics retrieved successfully'
    });

  } catch (error) {
    console.error('Unexpected error fetching stats:', error);
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', 'Unexpected error occurred'),
      { status: 500 }
    );
  }
} 
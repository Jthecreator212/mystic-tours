import { supabaseAdmin } from '@/lib/supabase';
import { createAppError, createErrorResponse, ERROR_CODES } from '@/lib/utils/error-handling';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Assignment validation schema
const assignmentSchema = z.object({
  booking_id: z.string().uuid('Invalid booking ID'),
  driver_id: z.string().uuid('Invalid driver ID'),
});

export async function POST(req: Request) {
  try {
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      const error = createAppError(
        ERROR_CODES.VALIDATION_FAILED,
        'Invalid JSON in request body',
        'Please check your request format'
      );
      return NextResponse.json(
        createErrorResponse('VALIDATION_FAILED', 'Invalid request format'),
        { status: 400 }
      );
    }
    
    // Validate input data
    const validationResult = assignmentSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Assignment validation failed:', validationResult.error.flatten().fieldErrors);
      const error = createAppError(
        ERROR_CODES.VALIDATION_FAILED,
        'Invalid assignment data',
        'Please check all required fields'
      );
      return NextResponse.json(
        createErrorResponse('VALIDATION_FAILED', 'Invalid assignment data', validationResult.error.flatten().fieldErrors),
        { status: 400 }
      );
    }
    
    const { booking_id, driver_id } = validationResult.data;
    
    // Check if driver exists and is available
    const { data: driver, error: driverError } = await supabaseAdmin
      .from('drivers')
      .select('id, name, status')
      .eq('id', driver_id)
      .single();
      
    if (driverError) {
      console.error('Error fetching driver:', driverError);
      const error = createAppError(
        ERROR_CODES.DB_NOT_FOUND,
        'Driver not found',
        'The specified driver does not exist'
      );
      return NextResponse.json(
        createErrorResponse('DB_NOT_FOUND', 'Driver not found'),
        { status: 404 }
      );
    }
    
    if (driver.status !== 'available') {
      const error = createAppError(
        ERROR_CODES.BOOKING_FAILED,
        'Driver is not available',
        'The selected driver is currently busy or offline'
      );
      return NextResponse.json(
        createErrorResponse('BOOKING_FAILED', 'Driver is not available'),
        { status: 409 }
      );
    }
    
    // Check if booking exists (try both tour and airport bookings)
    const { data: tourBooking, error: tourBookingError } = await supabaseAdmin
      .from('bookings')
      .select('id, customer_name, booking_date')
      .eq('id', booking_id)
      .single();
      
    const { data: airportBooking, error: airportBookingError } = await supabaseAdmin
      .from('airport_pickup_bookings')
      .select('id, customer_name, arrival_date')
      .eq('id', booking_id)
      .single();
      
    if (tourBookingError && airportBookingError) {
      console.error('Error fetching booking:', tourBookingError, airportBookingError);
      const error = createAppError(
        ERROR_CODES.DB_NOT_FOUND,
        'Booking not found',
        'The specified booking does not exist'
      );
      return NextResponse.json(
        createErrorResponse('DB_NOT_FOUND', 'Booking not found'),
        { status: 404 }
      );
    }
    
    // Check if assignment already exists
    const { data: existingAssignment, error: assignmentCheckError } = await supabaseAdmin
      .from('driver_assignments')
      .select('id')
      .eq('booking_id', booking_id)
      .single();
      
    if (existingAssignment) {
      const error = createAppError(
        ERROR_CODES.DB_CONSTRAINT,
        'Assignment already exists',
        'This booking already has a driver assigned'
      );
      return NextResponse.json(
        createErrorResponse('DB_CONSTRAINT', 'Assignment already exists'),
        { status: 409 }
      );
    }
    
    // Create assignment
    const { data: assignment, error: assignError } = await supabaseAdmin
      .from('driver_assignments')
      .insert({ 
        booking_id, 
        driver_id, 
        assignment_status: 'assigned',
        assigned_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (assignError) {
      console.error('Error creating assignment:', assignError);
      const error = createAppError(
        ERROR_CODES.DB_QUERY,
        'Failed to create assignment',
        'Database error occurred while creating assignment'
      );
      return NextResponse.json(
        createErrorResponse('DB_QUERY', 'Failed to create assignment'),
        { status: 503 }
      );
    }
    
    // Update booking status (tour or airport)
    let updatedBooking = null;
    let updateError = null;
    
    if (tourBooking) {
      // Update tour booking
      const { data: updatedTourBooking, error: tourUpdateError } = await supabaseAdmin
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', booking_id)
        .select()
        .single();
        
      if (tourUpdateError) {
        console.error('Error updating tour booking:', tourUpdateError);
        updateError = tourUpdateError;
      } else {
        updatedBooking = updatedTourBooking;
      }
    } else if (airportBooking) {
      // Update airport pickup booking
      const { data: updatedAirportBooking, error: airportUpdateError } = await supabaseAdmin
        .from('airport_pickup_bookings')
        .update({ status: 'confirmed' })
        .eq('id', booking_id)
        .select()
        .single();
        
      if (airportUpdateError) {
        console.error('Error updating airport booking:', airportUpdateError);
        updateError = airportUpdateError;
      } else {
        updatedBooking = updatedAirportBooking;
      }
    }
    
    if (updateError) {
      console.error('Error updating booking status:', updateError);
      // Don't fail the assignment if booking update fails
    }
    
    // Update driver status to busy
    const { error: driverUpdateError } = await supabaseAdmin
      .from('drivers')
      .update({ status: 'busy' })
      .eq('id', driver_id);
      
    if (driverUpdateError) {
      console.error('Error updating driver status:', driverUpdateError);
      // Don't fail the assignment if driver update fails
    }
    
    return NextResponse.json({ 
      success: true,
      assignment,
      booking: updatedBooking,
      driver: driver,
      message: 'Driver assigned successfully'
    });
    
  } catch (error) {
    console.error('Unexpected error creating assignment:', error);
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', 'Unexpected error occurred'),
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Fetch all assignments
    const { data: assignments, error } = await supabaseAdmin
      .from('driver_assignments')
      .select('id, driver_id, booking_id, assignment_status, assigned_at');
      
    if (error) {
      console.error('Error fetching assignments:', error);
      const dbError = createAppError(
        ERROR_CODES.DB_QUERY,
        'Failed to fetch assignments',
        'Unable to retrieve assignment data'
      );
      return NextResponse.json(
        createErrorResponse('DB_QUERY', 'Failed to fetch assignments'),
        { status: 503 }
      );
    }
    
    if (!assignments || assignments.length === 0) {
      return NextResponse.json({ 
        success: true,
        assignments: [],
        message: 'No assignments found'
      });
    }
    
    // Fetch all drivers
    const { data: drivers } = await supabaseAdmin
      .from('drivers')
      .select('id, name');
      
    // Fetch all bookings (tours)
    const { data: tourBookings } = await supabaseAdmin
      .from('bookings')
      .select('id, customer_name, booking_date');
      
    // Fetch all airport bookings
    const { data: airportBookings } = await supabaseAdmin
      .from('airport_pickup_bookings')
      .select('id, customer_name, arrival_date');
      
    // Map assignments to calendar events
    const assignmentsWithDetails = assignments.map(a => {
      const driver = drivers?.find(d => d.id === a.driver_id);
      // Try to find booking in tours first
      const tourBooking = tourBookings?.find(b => b.id === a.booking_id);
      const airportBooking = airportBookings?.find(b => b.id === a.booking_id);
      
      let booking_type = 'tour';
      let date = tourBooking?.booking_date;
      let customer_name = tourBooking?.customer_name;
      
      if (!tourBooking && airportBooking) {
        booking_type = 'airport';
        date = airportBooking.arrival_date;
        customer_name = airportBooking.customer_name;
      }
      
      return {
        id: a.id,
        driver_id: a.driver_id,
        driver_name: driver?.name || 'Unknown',
        booking_id: a.booking_id,
        booking_type,
        customer_name: customer_name || 'Unknown',
        date,
        assignment_status: a.assignment_status,
      };
    });
    
    return NextResponse.json({
      success: true,
      assignments: assignmentsWithDetails,
      message: 'Assignments retrieved successfully'
    });
    
  } catch (error) {
    console.error('Unexpected error fetching assignments:', error);
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', 'Unexpected error occurred'),
      { status: 500 }
    );
  }
} 
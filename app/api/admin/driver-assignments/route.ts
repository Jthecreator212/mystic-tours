import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { booking_id, driver_id } = await req.json();
    if (!booking_id || !driver_id) {
      return NextResponse.json({ error: 'Missing booking_id or driver_id' }, { status: 400 });
    }
    // booking_id is always a UUID (for both tour and airport bookings)
    // Create assignment
    const { data: assignment, error: assignError } = await supabaseAdmin
      .from('driver_assignments')
      .insert({ booking_id, driver_id, assignment_status: 'assigned' })
      .select()
      .single();
    if (assignError) {
      return NextResponse.json({ error: assignError.message }, { status: 500 });
    }
    // Update booking status (tour or airport)
    let updatedBooking = null;
    let updateError = null;
    // Try tour bookings first
    ({ data: updatedBooking, error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', booking_id)
      .select()
      .single());
    if (updateError || !updatedBooking) {
      // Try airport pickup bookings (now using uuid)
      ({ data: updatedBooking, error: updateError } = await supabaseAdmin
        .from('airport_pickup_bookings')
        .update({ status: 'confirmed' })
        .eq('uuid', booking_id)
        .select()
        .single());
    }
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }
    return NextResponse.json({ assignment, booking: updatedBooking });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to assign driver.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Fetch all assignments
    const { data: assignments, error } = await supabaseAdmin
      .from('driver_assignments')
      .select('id, driver_id, booking_id, assignment_status, assigned_at');
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!assignments || assignments.length === 0) {
      return NextResponse.json({ assignments: [] });
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
    return NextResponse.json({ assignments: assignmentsWithDetails });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch assignments.' }, { status: 500 });
  }
} 
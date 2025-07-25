import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const driverId = params.id;
  try {
    // Get all assignments for this driver
    const { data: assignments, error } = await supabaseAdmin
      .from('driver_assignments')
      .select('id, booking_id, assignment_status, created_at')
      .eq('driver_id', driverId)
      .order('created_at', { ascending: false });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    // Fetch bookings for each assignment
    const tourIds = assignments.map(a => a.booking_id);
    const { data: tourBookings } = await supabaseAdmin
      .from('bookings')
      .select('id, customer_name, booking_date, status, total_amount')
      .in('id', tourIds);
    const { data: airportBookings } = await supabaseAdmin
      .from('airport_pickup_bookings')
      .select('uuid, customer_name, arrival_date, departure_date, status, total_price')
      .in('uuid', tourIds);
    // Merge and annotate type
    const jobs = [
      ...(tourBookings || []).map(b => ({
        id: b.id,
        type: 'tour',
        customer_name: b.customer_name,
        date: b.booking_date,
        status: b.status,
        amount: b.total_amount,
      })),
      ...(airportBookings || []).map(b => ({
        id: b.uuid,
        type: 'airport',
        customer_name: b.customer_name,
        date: b.arrival_date || b.departure_date,
        status: b.status,
        amount: b.total_price,
      })),
    ];
    // Sort by date descending
    jobs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return NextResponse.json({ jobs });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch jobs.' }, { status: 500 });
  }
} 
import { supabaseAdmin } from '@/lib/supabase/supabase';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const testSchema = z.object({
  customer_name: z.string().min(1, 'Name is required'),
  customer_email: z.string().email('Valid email is required'),
  service_type: z.enum(['airport_pickup', 'airport_dropoff', 'round_trip']),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const parsedData = testSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid test data' },
        { status: 400 }
      );
    }

    // Insert test data
    const { data, error: dbError } = await supabaseAdmin
      .from('airport_pickup_bookings')
      .insert([{
        ...parsedData.data,
        total_price: 50.00,
        status: 'pending',
        passengers: 1,
        flight_number: 'TEST123',
        arrival_date: new Date().toISOString(),
        arrival_time: '12:00',
        dropoff_location: 'Test Hotel'
      }])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to create test booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Unexpected error in test airport pickup:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { data, error: dbError } = await supabaseAdmin
      .from('airport_pickup_bookings')
      .select('*')
      .limit(10)
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('Database error:', dbError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch test data' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Unexpected error fetching test config:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
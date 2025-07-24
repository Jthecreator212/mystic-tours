import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { airportPickupSchema } from '@/lib/schemas/form-schemas';

export async function PATCH(req: Request, context: { params: { id: string } }) {
  const { params } = await context;
  try {
    const uuid = params.id;
    const body = await req.json();
    console.log('PATCH /api/admin/airport-pickup-bookings/[id] body:', body);
    const parsed = airportPickupSchema.safeParse(body);
    console.log('Zod parsed result:', parsed);
    if (!parsed.success) {
      console.log('Zod validation errors:', parsed.error.flatten().fieldErrors);
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }
    const { data, error } = await supabaseAdmin
      .from('airport_pickup_bookings')
      .update({ ...parsed.data })
      .eq('uuid', uuid)
      .select()
      .single();
    console.log('Supabase update result:', { data, error });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    return NextResponse.json({ booking: data });
  } catch (error) {
    console.error('PATCH handler caught error:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: { id: string } }) {
  const { params } = await context;
  try {
    const uuid = params.id;
    const { data, error } = await supabaseAdmin
      .from('airport_pickup_bookings')
      .delete()
      .eq('uuid', uuid)
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, booking: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
} 
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Query all stats in parallel
    const [
      toursRes,
      bookingsRes,
      pickupsRes,
      imagesRes
    ] = await Promise.all([
      supabaseAdmin.from('tours').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('bookings').select('total_amount', { count: 'exact' }),
      supabaseAdmin.from('airport_pickup_bookings').select('total_price', { count: 'exact' }),
      supabaseAdmin.from('gallery_images').select('id', { count: 'exact', head: true })
    ]);

    const totalTours = toursRes.count || 0;
    const totalBookings = bookingsRes.count || 0;
    const totalPickups = pickupsRes.count || 0;
    const totalImages = imagesRes.count || 0;

    // Calculate total revenue from both bookings and pickups
    const bookingsRevenue = (bookingsRes.data || []).reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
    const pickupsRevenue = (pickupsRes.data || []).reduce((sum, p) => sum + Number(p.total_price || 0), 0);
    const totalRevenue = bookingsRevenue + pickupsRevenue;

    return NextResponse.json({
      totalTours,
      totalBookings,
      totalPickups,
      totalImages,
      totalRevenue
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
} 
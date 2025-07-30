import { supabaseAdmin } from '@/lib/supabase/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data, error: dbError } = await supabaseAdmin
      .from('bookings')
      .select('*');

    if (dbError) {
      console.error('Database error:', dbError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch analytics data' },
        { status: 500 }
      );
    }

    // Calculate analytics
    const totalBookings = data?.length || 0;
    const completedBookings = data?.filter(b => b.status === 'completed').length || 0;
    const pendingBookings = data?.filter(b => b.status === 'pending').length || 0;
    const cancelledBookings = data?.filter(b => b.status === 'cancelled').length || 0;

    const analytics = {
      totalBookings,
      completedBookings,
      pendingBookings,
      cancelledBookings,
      completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
    };

    return NextResponse.json({ success: true, data: analytics });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
import { supabaseAdmin } from '@/lib/supabase/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data, error: dbError } = await supabaseAdmin
      .from('destinations')
      .select('*')
      .order('name', { ascending: true });

    if (dbError) {
      console.error('Database error:', dbError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch destinations' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Unexpected error fetching destinations:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
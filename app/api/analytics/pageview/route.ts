import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.path) {
      return NextResponse.json(
        { error: 'Missing required field: path' },
        { status: 400 }
      );
    }

    // Extract pageview data
    const {
      path,
      title,
      timestamp,
      user_agent,
      referrer,
    } = body;

    // Get user IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

    // Prepare pageview record
    const pageviewRecord = {
      path,
      title: title || null,
      timestamp: timestamp || new Date().toISOString(),
      user_agent: user_agent || '',
      referrer: referrer || '',
      ip_address: ip,
      session_id: request.headers.get('x-session-id') || null,
      user_id: request.headers.get('x-user-id') || null,
    };

    // Insert into pageviews table
    const { data, error } = await supabase
      .from('analytics_pageviews')
      .insert([pageviewRecord])
      .select()
      .single();

    if (error) {
      console.error('Analytics pageview insert error:', error);
      return NextResponse.json(
        { error: 'Failed to record pageview' },
        { status: 500 }
      );
    }

    // Log pageview (for debugging)
    if (process.env.NODE_ENV === 'development') {
      console.log('Pageview Recorded:', {
        path,
        title,
        timestamp: pageviewRecord.timestamp,
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: { id: data.id } 
    });

  } catch (error) {
    console.error('Analytics pageview error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    // Build query
    let query = supabase
      .from('analytics_pageviews')
      .select('*')
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (path) {
      query = query.eq('path', path);
    }
    if (dateFrom) {
      query = query.gte('timestamp', dateFrom);
    }
    if (dateTo) {
      query = query.lte('timestamp', dateTo);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Analytics pageviews fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch pageviews' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        limit,
        offset,
        total: count || 0,
      },
    });

  } catch (error) {
    console.error('Analytics pageviews error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
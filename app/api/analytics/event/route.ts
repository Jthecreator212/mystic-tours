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
    if (!body.event || !body.category || !body.action) {
      return NextResponse.json(
        { error: 'Missing required fields: event, category, action' },
        { status: 400 }
      );
    }

    // Extract analytics data
    const {
      event,
      category,
      action,
      label,
      value,
      custom_parameters,
      timestamp,
      user_agent,
      url,
    } = body;

    // Get user IP and location
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
    
    // Get referrer
    const referrer = request.headers.get('referer') || '';

    // Prepare analytics record
    const analyticsRecord = {
      event_type: event,
      category,
      action,
      label: label || null,
      value: value || null,
      custom_parameters: custom_parameters || {},
      timestamp: timestamp || new Date().toISOString(),
      user_agent: user_agent || '',
      url: url || '',
      ip_address: ip,
      referrer: referrer,
      session_id: request.headers.get('x-session-id') || null,
      user_id: request.headers.get('x-user-id') || null,
    };

    // Insert into analytics table
    const { data, error } = await supabase
      .from('analytics_events')
      .insert([analyticsRecord])
      .select()
      .single();

    if (error) {
      console.error('Analytics event insert error:', error);
      return NextResponse.json(
        { error: 'Failed to record analytics event' },
        { status: 500 }
      );
    }

    // Log analytics event (for debugging)
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event Recorded:', {
        event,
        category,
        action,
        label,
        value,
        timestamp: analyticsRecord.timestamp,
      });
    }

    return NextResponse.json({ 
      success: true, 
      data: { id: data.id } 
    });

  } catch (error) {
    console.error('Analytics event error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const event = searchParams.get('event');
    const category = searchParams.get('category');
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('analytics_events')
      .select('*')
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (event) {
      query = query.eq('event_type', event);
    }
    if (category) {
      query = query.eq('category', category);
    }
    if (action) {
      query = query.eq('action', action);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Analytics events fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch analytics events' },
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
    console.error('Analytics events error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
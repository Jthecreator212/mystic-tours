import { validationUtils } from '@/lib/utils/validation';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bsxloajxptdsgqkxbiem.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzeGxvYWp4cHRkc2dxa3hiaWVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImFpZCI6IjEwMDAwMDAwMDAwMCIsImV4cCI6MjA2MjUxMTIzM30.q-T_wVjHm5MtkyvO93pdnuQiXkPIEpYsqeLcFI8sryA';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid request format' },
        { status: 400 }
      );
    }
    
    // Validate required fields using our validation framework
    const validationResult = validationUtils.validateAnalyticsEvent(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Missing required analytics fields' },
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
        { success: false, error: 'Failed to record analytics event' },
        { status: 503 }
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
      data: { id: data.id },
      message: 'Analytics event recorded successfully'
    });

  } catch (error) {
    console.error('Analytics event processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
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

    // Validate pagination parameters
    if (limit < 1 || limit > 1000) {
      return NextResponse.json(
        { success: false, error: 'Invalid limit parameter' },
        { status: 400 }
      );
    }

    if (offset < 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid offset parameter' },
        { status: 400 }
      );
    }

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
        { success: false, error: 'Failed to fetch analytics events' },
        { status: 503 }
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
      message: 'Analytics events retrieved successfully'
    });

  } catch (error) {
    console.error('Analytics events retrieval error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
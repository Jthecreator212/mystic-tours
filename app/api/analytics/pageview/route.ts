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
    const validationResult = validationUtils.validateAnalyticsPageview(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Missing required pageview fields' },
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
        { success: false, error: 'Failed to record pageview' },
        { status: 503 }
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
      data: { id: data.id },
      message: 'Pageview recorded successfully'
    });

  } catch (error) {
    console.error('Analytics pageview processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
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

    // Validate date parameters
    if (dateFrom && isNaN(Date.parse(dateFrom))) {
      return NextResponse.json(
        { success: false, error: 'Invalid date_from parameter' },
        { status: 400 }
      );
    }

    if (dateTo && isNaN(Date.parse(dateTo))) {
      return NextResponse.json(
        { success: false, error: 'Invalid date_to parameter' },
        { status: 400 }
      );
    }

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
        { success: false, error: 'Failed to fetch pageviews' },
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
      message: 'Pageviews retrieved successfully'
    });

  } catch (error) {
    console.error('Analytics pageviews retrieval error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
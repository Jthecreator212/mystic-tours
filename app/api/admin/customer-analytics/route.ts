import { supabaseAdmin } from '@/lib/supabase';
import { createAppError, createErrorResponse, ERROR_CODES } from '@/lib/utils/error-handling';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Analytics query validation schema
const analyticsQuerySchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  customer_email: z.string().email('Invalid email address').optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

export async function GET(req: Request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const queryParams = {
      start_date: searchParams.get('start_date') || undefined,
      end_date: searchParams.get('end_date') || undefined,
      customer_email: searchParams.get('customer_email') || undefined,
      limit: parseInt(searchParams.get('limit') || '50'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };
    
    // Validate query parameters
    const validationResult = analyticsQuerySchema.safeParse(queryParams);
    if (!validationResult.success) {
      console.error('Analytics query validation failed:', validationResult.error.flatten().fieldErrors);
      const error = createAppError(
        ERROR_CODES.VALIDATION_FAILED,
        'Invalid query parameters',
        'Please check your request parameters'
      );
      return NextResponse.json(
        createErrorResponse('VALIDATION_FAILED', 'Invalid query parameters', validationResult.error.flatten().fieldErrors),
        { status: 400 }
      );
    }
    
    const { start_date, end_date, customer_email, limit, offset } = validationResult.data;
    
    // Build query filters
    let query = supabaseAdmin
      .from('analytics_events')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (start_date) {
      query = query.gte('created_at', start_date);
    }
    
    if (end_date) {
      query = query.lte('created_at', end_date);
    }
    
    if (customer_email) {
      query = query.eq('user_email', customer_email);
    }
    
    // Execute query
    const { data: events, error: eventsError } = await query;
    
    if (eventsError) {
      console.error('Error fetching analytics events:', eventsError);
      const dbError = createAppError(
        ERROR_CODES.DB_QUERY,
        'Failed to fetch analytics data',
        'Unable to retrieve analytics data'
      );
      return NextResponse.json(
        createErrorResponse('DB_QUERY', 'Failed to fetch analytics data'),
        { status: 503 }
      );
    }
    
    // Get pageview data
    let pageviewQuery = supabaseAdmin
      .from('analytics_pageviews')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
      
    if (start_date) {
      pageviewQuery = pageviewQuery.gte('created_at', start_date);
    }
    
    if (end_date) {
      pageviewQuery = pageviewQuery.lte('created_at', end_date);
    }
    
    if (customer_email) {
      pageviewQuery = pageviewQuery.eq('user_email', customer_email);
    }
    
    const { data: pageviews, error: pageviewsError } = await pageviewQuery;
    
    if (pageviewsError) {
      console.error('Error fetching analytics pageviews:', pageviewsError);
      // Don't fail completely if pageviews fail, just log the error
    }
    
    // Calculate analytics metrics
    const totalEvents = events?.length || 0;
    const totalPageviews = pageviews?.length || 0;
    
    // Group events by type
    const eventsByType = events?.reduce((acc, event) => {
      const type = event.event_type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    // Group pageviews by page
    const pageviewsByPage = pageviews?.reduce((acc, pageview) => {
      const page = pageview.page_url || 'unknown';
      acc[page] = (acc[page] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    // Get unique users
    const uniqueUsers = new Set([
      ...(events?.map(e => e.user_email).filter(Boolean) || []),
      ...(pageviews?.map(p => p.user_email).filter(Boolean) || [])
    ]).size;
    
    const analytics = {
      totalEvents,
      totalPageviews,
      uniqueUsers,
      eventsByType,
      pageviewsByPage,
      events: events || [],
      pageviews: pageviews || [],
      query: {
        start_date,
        end_date,
        customer_email,
        limit,
        offset,
      }
    };
    
    return NextResponse.json({ 
      success: true,
      analytics,
      message: 'Customer analytics retrieved successfully'
    });
    
  } catch (error) {
    console.error('Unexpected error fetching customer analytics:', error);
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', 'Unexpected error occurred'),
      { status: 500 }
    );
  }
} 
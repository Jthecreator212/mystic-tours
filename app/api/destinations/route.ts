import { supabaseAdmin } from '@/lib/supabase';
import { createAppError, createErrorResponse, ERROR_CODES } from '@/lib/utils/error-handling';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch destinations from database
    const { data, error } = await supabaseAdmin
      .from('destinations')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) {
      console.error('Error fetching destinations:', error);
      const dbError = createAppError(
        ERROR_CODES.DB_QUERY,
        'Failed to fetch destinations',
        'Unable to retrieve destination data'
      );
      return NextResponse.json(
        createErrorResponse('DB_QUERY', 'Failed to fetch destinations'),
        { status: 503 }
      );
    }
    
    // If no destinations in database, return default destinations
    if (!data || data.length === 0) {
      const defaultDestinations = [
        {
          id: 'jamaica',
          name: 'Jamaica',
          description: 'Experience the vibrant culture and stunning beaches of Jamaica',
          image_url: '/images/destinations/jamaica.jpg',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'montego-bay',
          name: 'Montego Bay',
          description: 'Discover the beautiful beaches and luxury resorts of Montego Bay',
          image_url: '/images/destinations/montego-bay.jpg',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'ochi-rios',
          name: 'Ocho Rios',
          description: 'Explore the waterfalls and natural beauty of Ocho Rios',
          image_url: '/images/destinations/ochi-rios.jpg',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'negril',
          name: 'Negril',
          description: 'Relax on the famous seven-mile beach of Negril',
          image_url: '/images/destinations/negril.jpg',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'kingston',
          name: 'Kingston',
          description: 'Experience the capital city and its rich cultural heritage',
          image_url: '/images/destinations/kingston.jpg',
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];
      
      return NextResponse.json({ 
        success: true,
        destinations: defaultDestinations,
        message: 'Default destinations retrieved successfully'
      });
    }
    
    return NextResponse.json({ 
      success: true,
      destinations: data,
      message: 'Destinations retrieved successfully'
    });
    
  } catch (error) {
    console.error('Unexpected error fetching destinations:', error);
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', 'Unexpected error occurred'),
      { status: 500 }
    );
  }
} 
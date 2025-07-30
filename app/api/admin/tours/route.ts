import { supabaseAdmin } from '@/lib/supabase';
import { createAppError, createErrorResponse, ERROR_CODES } from '@/lib/utils/error-handling';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Tour validation schema
const tourSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(200, 'Title is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().positive('Price must be positive'),
  duration: z.string().min(1, 'Duration is required'),
  max_people: z.number().min(1, 'Maximum people must be at least 1').max(50, 'Maximum people cannot exceed 50'),
  location: z.string().min(2, 'Location must be at least 2 characters'),
  image_url: z.string().url('Invalid image URL').optional(),
  is_active: z.boolean().default(true),
});

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('tours')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching tours:', error);
      const dbError = createAppError(
        ERROR_CODES.DB_QUERY,
        'Failed to fetch tours',
        'Unable to retrieve tour data'
      );
      return NextResponse.json(
        createErrorResponse('DB_QUERY', 'Failed to fetch tours'),
        { status: 503 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      tours: data || [],
      message: 'Tours retrieved successfully'
    });
  } catch (error) {
    console.error('Unexpected error fetching tours:', error);
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', 'Unexpected error occurred'),
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      const error = createAppError(
        ERROR_CODES.VALIDATION_FAILED,
        'Invalid JSON in request body',
        'Please check your request format'
      );
      return NextResponse.json(
        createErrorResponse('VALIDATION_FAILED', 'Invalid request format'),
        { status: 400 }
      );
    }
    
    // Validate input data
    const validationResult = tourSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Tour validation failed:', validationResult.error.flatten().fieldErrors);
      const error = createAppError(
        ERROR_CODES.VALIDATION_FAILED,
        'Invalid tour data',
        'Please check all required fields'
      );
      return NextResponse.json(
        createErrorResponse('VALIDATION_FAILED', 'Invalid tour data', validationResult.error.flatten().fieldErrors),
        { status: 400 }
      );
    }
    
    const validatedData = validationResult.data;
    
    // Check if tour with same title already exists
    const { data: existingTour, error: checkError } = await supabaseAdmin
      .from('tours')
      .select('id')
      .eq('title', validatedData.title)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing tour:', checkError);
      const dbError = createAppError(
        ERROR_CODES.DB_QUERY,
        'Failed to check existing tour',
        'Database error occurred'
      );
      return NextResponse.json(
        createErrorResponse('DB_QUERY', 'Failed to check existing tour'),
        { status: 503 }
      );
    }
    
    if (existingTour) {
      const error = createAppError(
        ERROR_CODES.DB_CONSTRAINT,
        'Tour with this title already exists',
        'Please use a different title'
      );
      return NextResponse.json(
        createErrorResponse('DB_CONSTRAINT', 'Tour with this title already exists'),
        { status: 409 }
      );
    }
    
    // Insert tour into database
    const { data: tour, error: insertError } = await supabaseAdmin
      .from('tours')
      .insert([validatedData])
      .select()
      .single();
      
    if (insertError) {
      console.error('Error inserting tour:', insertError);
      const error = createAppError(
        ERROR_CODES.DB_QUERY,
        'Failed to create tour',
        'Database error occurred while saving tour'
      );
      return NextResponse.json(
        createErrorResponse('DB_QUERY', 'Failed to create tour'),
        { status: 503 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      tour: tour,
      message: 'Tour created successfully'
    });
    
  } catch (error) {
    console.error('Unexpected error creating tour:', error);
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', 'Unexpected error occurred'),
      { status: 500 }
    );
  }
} 
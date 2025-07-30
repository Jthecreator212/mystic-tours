import { supabaseAdmin } from '@/lib/supabase';
import { createAppError, createErrorResponse, ERROR_CODES } from '@/lib/utils/error-handling';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Content validation schema
const contentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  type: z.enum(['page', 'section', 'block']),
  page: z.string().min(1, 'Page is required'),
  is_active: z.boolean().default(true),
  order_index: z.number().int().min(0, 'Order index must be non-negative').optional(),
});

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('content_blocks')
      .select('*')
      .order('order_index', { ascending: true })
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching content:', error);
      const dbError = createAppError(
        ERROR_CODES.DB_QUERY,
        'Failed to fetch content',
        'Unable to retrieve content data'
      );
      return NextResponse.json(
        createErrorResponse('DB_QUERY', 'Failed to fetch content'),
        { status: 503 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      content: data || [],
      message: 'Content retrieved successfully'
    });
  } catch (error) {
    console.error('Unexpected error fetching content:', error);
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
    const validationResult = contentSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('Content validation failed:', validationResult.error.flatten().fieldErrors);
      const error = createAppError(
        ERROR_CODES.VALIDATION_FAILED,
        'Invalid content data',
        'Please check all required fields'
      );
      return NextResponse.json(
        createErrorResponse('VALIDATION_FAILED', 'Invalid content data', validationResult.error.flatten().fieldErrors),
        { status: 400 }
      );
    }
    
    const validatedData = validationResult.data;
    
    // Check if content with same title and page already exists
    const { data: existingContent, error: checkError } = await supabaseAdmin
      .from('content_blocks')
      .select('id')
      .eq('title', validatedData.title)
      .eq('page', validatedData.page)
      .single();
      
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking existing content:', checkError);
      const dbError = createAppError(
        ERROR_CODES.DB_QUERY,
        'Failed to check existing content',
        'Database error occurred'
      );
      return NextResponse.json(
        createErrorResponse('DB_QUERY', 'Failed to check existing content'),
        { status: 503 }
      );
    }
    
    if (existingContent) {
      const error = createAppError(
        ERROR_CODES.DB_CONSTRAINT,
        'Content with this title already exists on this page',
        'Please use a different title or page'
      );
      return NextResponse.json(
        createErrorResponse('DB_CONSTRAINT', 'Content with this title already exists on this page'),
        { status: 409 }
      );
    }
    
    // Set order_index if not provided
    if (!validatedData.order_index) {
      const { data: lastContent } = await supabaseAdmin
        .from('content_blocks')
        .select('order_index')
        .eq('page', validatedData.page)
        .order('order_index', { ascending: false })
        .limit(1)
        .single();
        
      validatedData.order_index = (lastContent?.order_index || 0) + 1;
    }
    
    // Insert content into database
    const { data: content, error: insertError } = await supabaseAdmin
      .from('content_blocks')
      .insert([validatedData])
      .select()
      .single();
      
    if (insertError) {
      console.error('Error inserting content:', insertError);
      const error = createAppError(
        ERROR_CODES.DB_QUERY,
        'Failed to create content',
        'Database error occurred while saving content'
      );
      return NextResponse.json(
        createErrorResponse('DB_QUERY', 'Failed to create content'),
        { status: 503 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      content,
      message: 'Content created successfully'
    });
    
  } catch (error) {
    console.error('Unexpected error creating content:', error);
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', 'Unexpected error occurred'),
      { status: 500 }
    );
  }
} 
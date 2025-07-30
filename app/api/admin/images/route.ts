import { supabaseAdmin } from '@/lib/supabase';
import { createAppError, createErrorResponse, ERROR_CODES } from '@/lib/utils/error-handling';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Image validation schema
const imageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  image_url: z.string().url('Invalid image URL'),
  is_active: z.boolean().default(true),
});

// File upload validation
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

function validateFile(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size must be less than 5MB' };
  }
  
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Only JPEG, PNG, and WebP files are allowed' };
  }
  
  return { valid: true };
}

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('gallery_images')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching images:', error);
      const dbError = createAppError(
        ERROR_CODES.DB_QUERY,
        'Failed to fetch images',
        'Unable to retrieve image data'
      );
      return NextResponse.json(
        createErrorResponse('DB_QUERY', 'Failed to fetch images'),
        { status: 503 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      images: data || [],
      message: 'Images retrieved successfully'
    });
  } catch (error) {
    console.error('Unexpected error fetching images:', error);
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', 'Unexpected error occurred'),
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    // Check if this is a multipart form data request (file upload)
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const title = formData.get('title') as string;
      const description = formData.get('description') as string;
      const category = formData.get('category') as string;
      
      if (!file) {
        const error = createAppError(
          ERROR_CODES.VALIDATION_FAILED,
          'No file provided',
          'Please select a file to upload'
        );
        return NextResponse.json(
          createErrorResponse('VALIDATION_FAILED', 'No file provided'),
          { status: 400 }
        );
      }
      
      // Validate file
      const fileValidation = validateFile(file);
      if (!fileValidation.valid) {
        const error = createAppError(
          ERROR_CODES.VALIDATION_FAILED,
          'Invalid file',
          fileValidation.error || 'File validation failed'
        );
        return NextResponse.json(
          createErrorResponse('VALIDATION_FAILED', 'Invalid file', { error: fileValidation.error }),
          { status: 400 }
        );
      }
      
      // Validate other fields
      if (!title || !category) {
        const error = createAppError(
          ERROR_CODES.VALIDATION_FAILED,
          'Missing required fields',
          'Title and category are required'
        );
        return NextResponse.json(
          createErrorResponse('VALIDATION_FAILED', 'Missing required fields'),
          { status: 400 }
        );
      }
      
      // Upload file to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('gallery')
        .upload(fileName, file);
        
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        const error = createAppError(
          ERROR_CODES.FILE_UPLOAD_FAILED,
          'Failed to upload file',
          'Storage error occurred'
        );
        return NextResponse.json(
          createErrorResponse('FILE_UPLOAD_FAILED', 'Failed to upload file'),
          { status: 503 }
        );
      }
      
      // Get public URL
      const { data: urlData } = supabaseAdmin.storage
        .from('gallery')
        .getPublicUrl(fileName);
        
      // Save image metadata to database
      const imageData = {
        title,
        description: description || null,
        category,
        image_url: urlData.publicUrl,
        is_active: true,
      };
      
      const { data: image, error: dbError } = await supabaseAdmin
        .from('gallery_images')
        .insert([imageData])
        .select()
        .single();
        
      if (dbError) {
        console.error('Error saving image metadata:', dbError);
        // Try to delete uploaded file if database save fails
        await supabaseAdmin.storage.from('gallery').remove([fileName]);
        
        const error = createAppError(
          ERROR_CODES.DB_QUERY,
          'Failed to save image metadata',
          'Database error occurred'
        );
        return NextResponse.json(
          createErrorResponse('DB_QUERY', 'Failed to save image metadata'),
          { status: 503 }
        );
      }
      
      return NextResponse.json({ 
        success: true,
        image,
        message: 'Image uploaded successfully'
      });
      
    } else {
      // Handle JSON data (direct image URL)
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
      const validationResult = imageSchema.safeParse(body);
      if (!validationResult.success) {
        console.error('Image validation failed:', validationResult.error.flatten().fieldErrors);
        const error = createAppError(
          ERROR_CODES.VALIDATION_FAILED,
          'Invalid image data',
          'Please check all required fields'
        );
        return NextResponse.json(
          createErrorResponse('VALIDATION_FAILED', 'Invalid image data', validationResult.error.flatten().fieldErrors),
          { status: 400 }
        );
      }
      
      const validatedData = validationResult.data;
      
      // Insert image into database
      const { data: image, error: insertError } = await supabaseAdmin
        .from('gallery_images')
        .insert([validatedData])
        .select()
        .single();
        
      if (insertError) {
        console.error('Error inserting image:', insertError);
        const error = createAppError(
          ERROR_CODES.DB_QUERY,
          'Failed to create image',
          'Database error occurred while saving image'
        );
        return NextResponse.json(
          createErrorResponse('DB_QUERY', 'Failed to create image'),
          { status: 503 }
        );
      }
      
      return NextResponse.json({ 
        success: true,
        image,
        message: 'Image created successfully'
      });
    }
    
  } catch (error) {
    console.error('Unexpected error handling image:', error);
    return NextResponse.json(
      createErrorResponse('INTERNAL_ERROR', 'Unexpected error occurred'),
      { status: 500 }
    );
  }
} 
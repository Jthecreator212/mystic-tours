import { supabaseAdmin } from '@/lib/supabase/supabase';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const tourUpdateSchema = z.object({
  name: z.string().min(1, 'Tour name is required').optional(),
  slug: z.string().min(1, 'Slug is required').optional(),
  short_description: z.string().min(1, 'Short description is required').optional(),
  description: z.string().min(1, 'Description is required').optional(),
  price: z.number().min(0, 'Price must be positive').optional(),
  duration: z.string().min(1, 'Duration is required').optional(),
  max_passengers: z.number().min(1, 'Max passengers must be at least 1').optional(),
  min_passengers: z.number().min(1, 'Min passengers must be at least 1').optional(),
  category: z.string().optional(),
  difficulty: z.enum(['easy', 'moderate', 'challenging', 'expert']).optional(),
  featured_image: z.string().optional(),
  gallery_images: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
  included: z.array(z.string()).optional(),
  not_included: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  currency: z.string().optional(),
  location: z.object({
    city: z.string(),
    country: z.string(),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    })
  }).optional(),
  availability: z.object({
    available: z.boolean(),
    max_bookings: z.number()
  }).optional(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Tour ID is required' },
        { status: 400 }
      );
    }

    const { data, error: dbError } = await supabaseAdmin
      .from('tours')
      .select('*')
      .eq('id', id)
      .single();

    if (dbError) {
      console.error('Database error:', dbError.message);
      return NextResponse.json(
        { success: false, error: 'Tour not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Unexpected error fetching tour:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Tour ID is required' },
        { status: 400 }
      );
    }

    // Validate input
    const parsedData = tourUpdateSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid tour data', details: parsedData.error },
        { status: 400 }
      );
    }

    // Transform data to match database schema
    const tourData: Record<string, unknown> = {};
    
    if (parsedData.data.name) tourData.title = parsedData.data.name;
    if (parsedData.data.slug) tourData.slug = parsedData.data.slug;
    if (parsedData.data.short_description) tourData.short_description = parsedData.data.short_description;
    if (parsedData.data.description) tourData.description = parsedData.data.description;
    if (parsedData.data.price) tourData.price = parsedData.data.price;
    if (parsedData.data.duration) tourData.duration = parsedData.data.duration;
    if (parsedData.data.max_passengers) tourData.group_size = `${parsedData.data.max_passengers} people`;
    if (parsedData.data.included) tourData.includes = parsedData.data.included;
    if (parsedData.data.featured_image) tourData.image_url = parsedData.data.featured_image;
    if (parsedData.data.highlights) tourData.highlights = parsedData.data.highlights;
    if (parsedData.data.category) tourData.categories = [parsedData.data.category];
    if (parsedData.data.status) tourData.status = parsedData.data.status;
    if (parsedData.data.seo_title) tourData.seo_title = parsedData.data.seo_title;
    if (parsedData.data.seo_description) tourData.seo_description = parsedData.data.seo_description;

    const { data, error: dbError } = await supabaseAdmin
      .from('tours')
      .update(tourData)
      .eq('id', id)
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to update tour' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Unexpected error updating tour:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Tour ID is required' },
        { status: 400 }
      );
    }

    // Check if tour exists
    const { data: existingTour, error: fetchError } = await supabaseAdmin
      .from('tours')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError || !existingTour) {
      return NextResponse.json(
        { success: false, error: 'Tour not found' },
        { status: 404 }
      );
    }

    // Delete the tour
    const { error: deleteError } = await supabaseAdmin
      .from('tours')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Database error:', deleteError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to delete tour' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Tour deleted successfully' });
  } catch (err) {
    console.error('Unexpected error deleting tour:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

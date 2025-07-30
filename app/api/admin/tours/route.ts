import { supabaseAdmin } from '@/lib/supabase/supabase';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const tourSchema = z.object({
  name: z.string().min(1, 'Tour name is required'),
  slug: z.string().min(1, 'Slug is required'),
  short_description: z.string().min(1, 'Short description is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be positive'),
  duration: z.string().min(1, 'Duration is required'),
  max_passengers: z.number().min(1, 'Max passengers must be at least 1'),
  min_passengers: z.number().min(1, 'Min passengers must be at least 1'),
  category: z.string().optional(),
  difficulty: z.enum(['easy', 'moderate', 'challenging', 'expert']).default('easy'),
  featured_image: z.string().optional(),
  gallery_images: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
  included: z.array(z.string()).optional(),
  not_included: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  currency: z.string().default('USD'),
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

const tourUpdateSchema = tourSchema.partial();

export async function GET() {
  try {
    const { data, error: dbError } = await supabaseAdmin
      .from('tours')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('Database error:', dbError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch tours' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Unexpected error fetching tours:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const parsedData = tourSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid tour data', details: parsedData.error },
        { status: 400 }
      );
    }

    // Transform data to match database schema
    const tourData = {
      title: parsedData.data.name,
      slug: parsedData.data.slug,
      short_description: parsedData.data.short_description,
      description: parsedData.data.description,
      price: parsedData.data.price,
      duration: parsedData.data.duration,
      group_size: `${parsedData.data.max_passengers} people`,
      includes: parsedData.data.included || [],
      departure: 'Hotel pickup',
      languages: ['English'],
      image_url: parsedData.data.featured_image || '',
      highlights: parsedData.data.highlights || [],
      itinerary: [],
      categories: parsedData.data.category ? [parsedData.data.category] : [],
      tags: [],
      status: parsedData.data.status,
      seo_title: parsedData.data.seo_title,
      seo_description: parsedData.data.seo_description,
    };

    const { data, error: dbError } = await supabaseAdmin
      .from('tours')
      .insert([tourData])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to create tour' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('Unexpected error creating tour:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...tourData } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Tour ID is required' },
        { status: 400 }
      );
    }

    // Validate input
    const parsedData = tourUpdateSchema.safeParse(tourData);
    if (!parsedData.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid tour data', details: parsedData.error },
        { status: 400 }
      );
    }

    // Transform data to match database schema
    const updateData: any = {};
    if (parsedData.data.name) updateData.title = parsedData.data.name;
    if (parsedData.data.slug) updateData.slug = parsedData.data.slug;
    if (parsedData.data.short_description) updateData.short_description = parsedData.data.short_description;
    if (parsedData.data.description) updateData.description = parsedData.data.description;
    if (parsedData.data.price !== undefined) updateData.price = parsedData.data.price;
    if (parsedData.data.duration) updateData.duration = parsedData.data.duration;
    if (parsedData.data.max_passengers) updateData.group_size = `${parsedData.data.max_passengers} people`;
    if (parsedData.data.included) updateData.includes = parsedData.data.included;
    if (parsedData.data.featured_image) updateData.image_url = parsedData.data.featured_image;
    if (parsedData.data.highlights) updateData.highlights = parsedData.data.highlights;
    if (parsedData.data.category) updateData.categories = [parsedData.data.category];
    if (parsedData.data.status) updateData.status = parsedData.data.status;
    if (parsedData.data.seo_title) updateData.seo_title = parsedData.data.seo_title;
    if (parsedData.data.seo_description) updateData.seo_description = parsedData.data.seo_description;

    const { data, error: dbError } = await supabaseAdmin
      .from('tours')
      .update(updateData)
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
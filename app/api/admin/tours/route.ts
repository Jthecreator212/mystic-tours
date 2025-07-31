import { apiHandler } from '@/lib/api/response-handlers';
import { DatabaseOperations } from '@/lib/database/operations';
import { schemas } from '@/lib/schemas/api-schemas';
import { NextRequest } from 'next/server';

// Data transformation utilities
const transformTourForDatabase = (tourData: Record<string, unknown>) => ({
  title: tourData.name,
  slug: tourData.slug,
  short_description: tourData.short_description,
  description: tourData.description,
  price: tourData.price,
  duration: tourData.duration,
  group_size: `${tourData.max_passengers} people`,
  includes: tourData.included || [],
  departure: 'Hotel pickup',
  languages: ['English'],
  image_url: tourData.featured_image || '',
  highlights: tourData.highlights || [],
  itinerary: [],
  categories: tourData.category ? [tourData.category] : [],
  tags: [],
  status: tourData.status,
  seo_title: tourData.seo_title,
  seo_description: tourData.seo_description,
});

const transformTourForResponse = (tourData: Record<string, unknown>) => ({
  id: tourData.id as number,
  name: tourData.title as string,
  slug: tourData.slug as string,
  short_description: tourData.short_description as string,
  description: tourData.description as string,
  price: tourData.price as number,
  duration: tourData.duration as string,
  max_passengers: parseInt((tourData.group_size as string)?.split(' ')[0] || '1'),
  min_passengers: 1,
  category: (tourData.categories as string[])?.[0] || '',
  difficulty: 'easy',
  featured_image: tourData.image_url as string,
  gallery_images: [],
  highlights: tourData.highlights as string[] || [],
  included: tourData.includes as string[] || [],
  not_included: [],
  requirements: [],
  status: tourData.status as string,
  seo_title: tourData.seo_title as string,
  seo_description: tourData.seo_description as string,
  currency: 'USD',
  created_at: tourData.created_at as string,
  updated_at: tourData.updated_at as string,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    // Validate pagination parameters
    const paginationResult = schemas.pagination.safeParse({ limit, offset });
    if (!paginationResult.success) {
      return apiHandler.validationError(paginationResult);
    }

    // Build query options
    const queryOptions = {
      orderBy: { column: 'created_at', ascending: false },
      limit,
      offset,
      filters: {} as Record<string, unknown>,
    };

    if (search) {
      // Note: This would need to be implemented with full-text search in Supabase
      // For now, we'll filter client-side
    }

    if (status) {
      queryOptions.filters.status = status;
    }

    const { data, error, count } = await DatabaseOperations.getAll('tours', queryOptions);

    if (error) {
      return apiHandler.databaseError(error, 'fetch tours');
    }

    // Transform data for consistent API response
    const transformedData = data?.map((item: unknown) => transformTourForResponse(item as Record<string, unknown>)) || [];

    return apiHandler.paginated(transformedData, limit, offset, count || 0);
  } catch (error) {
    console.error('Unexpected error fetching tours:', error);
    return apiHandler.error('Internal server error');
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const parsedData = schemas.tour.safeParse(body);
    if (!parsedData.success) {
      return apiHandler.validationError(parsedData);
    }

    // Transform data to match database schema
    const tourData = transformTourForDatabase(parsedData.data as Record<string, unknown>);

    const { data, error } = await DatabaseOperations.create('tours', tourData);

    if (error) {
      return apiHandler.databaseError(error, 'create tour');
    }

    if (!data) {
      return apiHandler.error('Failed to create tour - no data returned');
    }

    const transformedData = transformTourForResponse(data as Record<string, unknown>);
    return apiHandler.success(transformedData, 201);
  } catch (error) {
    console.error('Unexpected error creating tour:', error);
    return apiHandler.error('Internal server error');
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...tourData } = body;
    
    if (!id) {
      return apiHandler.error('Tour ID is required', 400);
    }

    // Validate input
    const parsedData = schemas.tourUpdate.safeParse(tourData);
    if (!parsedData.success) {
      return apiHandler.validationError(parsedData);
    }

    // Transform data to match database schema
    const updateData: Record<string, unknown> = {};
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

    const { data, error } = await DatabaseOperations.update('tours', id, updateData);

    if (error) {
      return apiHandler.databaseError(error, 'update tour');
    }

    if (!data) {
      return apiHandler.notFound('Tour');
    }

    const transformedData = transformTourForResponse(data);
    return apiHandler.success(transformedData);
  } catch (error) {
    console.error('Unexpected error updating tour:', error);
    return apiHandler.error('Internal server error');
  }
} 
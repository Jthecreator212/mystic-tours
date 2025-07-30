import { supabaseAdmin } from '@/lib/supabase/supabase';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const driverSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Valid email is required'),
  license_number: z.string().min(1, 'License number is required'),
  vehicle_type: z.string().min(1, 'Vehicle type is required'),
  is_active: z.boolean().default(true),
});

const driverUpdateSchema = z.object({
  id: z.number(),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Valid email is required'),
  license_number: z.string().min(1, 'License number is required'),
  vehicle_type: z.string().min(1, 'Vehicle type is required'),
  is_active: z.boolean().default(true),
});

export async function GET() {
  try {
    const { data, error: dbError } = await supabaseAdmin
      .from('drivers')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('Database error:', dbError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch drivers' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch {
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
    const parsedData = driverSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid driver data' },
        { status: 400 }
      );
    }

    const { data, error: dbError } = await supabaseAdmin
      .from('drivers')
      .insert([parsedData.data])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to create driver' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const parsedData = driverUpdateSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid driver data' },
        { status: 400 }
      );
    }

    const { id, ...updateData } = parsedData.data;
    
    const { data, error: dbError } = await supabaseAdmin
      .from('drivers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to update driver' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Driver ID is required' },
        { status: 400 }
      );
    }

    const { error: dbError } = await supabaseAdmin
      .from('drivers')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('Database error:', dbError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to delete driver' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
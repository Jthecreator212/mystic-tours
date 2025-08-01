import { supabaseAdmin } from '@/lib/supabase/supabase';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const driverAssignmentSchema = z.object({
  driver_id: z.number(),
  booking_id: z.number(),
  assignment_status: z.enum(['assigned', 'in_progress', 'completed', 'cancelled']).default('assigned'),
  assigned_at: z.string().optional(),
});

const driverAssignmentUpdateSchema = z.object({
  id: z.number(),
  driver_id: z.number(),
  booking_id: z.number(),
  assignment_status: z.enum(['assigned', 'in_progress', 'completed', 'cancelled']).default('assigned'),
  assigned_at: z.string().optional(),
});

export async function GET() {
  try {
    const { data, error: dbError } = await supabaseAdmin
      .from('driver_assignments')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('Database error:', dbError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch driver assignments' },
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
    
    const parsedData = driverAssignmentSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid assignment data' },
        { status: 400 }
      );
    }

    const { data, error: dbError } = await supabaseAdmin
      .from('driver_assignments')
      .insert([parsedData.data])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to create assignment' },
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
    
    const parsedData = driverAssignmentUpdateSchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid assignment data' },
        { status: 400 }
      );
    }

    const { id, ...updateData } = parsedData.data;
    
    const { data, error: dbError } = await supabaseAdmin
      .from('driver_assignments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to update assignment' },
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
        { success: false, error: 'Assignment ID is required' },
        { status: 400 }
      );
    }

    const { error: dbError } = await supabaseAdmin
      .from('driver_assignments')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('Database error:', dbError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to delete assignment' },
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
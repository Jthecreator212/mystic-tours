import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(req: Request, context: { params: { id: string } }) {
  return handleUpdate(req, context);
}

export async function PATCH(req: Request, context: { params: { id: string } }) {
  return handleUpdate(req, context);
}

async function handleUpdate(req: Request, context: { params: { id: string } }) {
  const { params } = context;
  try {
    const id = params.id;
    const body = await req.json();
    const { name, phone, email, vehicle, status } = body;
    
    if (!name || !phone || !vehicle || !status) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    
    const { data, error } = await supabaseAdmin
      .from('drivers')
      .update({ name, phone, email, vehicle, status })
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Driver update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ driver: data });
  } catch (err) {
    console.error('Driver update exception:', err);
    return NextResponse.json({ error: 'Failed to update driver.' }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: { id: string } }) {
  const { params } = context;
  try {
    const id = params.id;
    const { data, error } = await supabaseAdmin
      .from('drivers')
      .delete()
      .eq('id', id)
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, driver: data });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete driver.' }, { status: 500 });
  }
} 
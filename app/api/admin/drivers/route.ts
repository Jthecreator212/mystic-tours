import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('drivers')
      .select('*')
      .order('name', { ascending: true });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ drivers: data || [] });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch drivers.' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, vehicle, status } = body;
    if (!name || !phone || !vehicle || !status) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    const { data, error } = await supabaseAdmin
      .from('drivers')
      .insert([{ name, phone, email, vehicle, status }])
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ driver: data });
  } catch {
    return NextResponse.json({ error: 'Failed to create driver.' }, { status: 500 });
  }
} 
import { supabaseAdmin } from '@/lib/supabase/supabase';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { data, error: dbError } = await supabaseAdmin
      .from('images')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('Database error:', dbError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch images' },
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
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Upload to Supabase Storage
    const fileName = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from('images')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to upload image' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from('images')
      .getPublicUrl(fileName);

    // Save to database
    const { data, error: dbError } = await supabaseAdmin
      .from('images')
      .insert([{
        name: file.name,
        url: urlData.publicUrl,
        size: file.size,
        type: file.type
      }])
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to save image record' },
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
        { success: false, error: 'Image ID is required' },
        { status: 400 }
      );
    }

    // Get image record first
    const { data: image, error: fetchError } = await supabaseAdmin
      .from('images')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Database error:', fetchError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch image' },
        { status: 500 }
      );
    }

    // Delete from storage
    const fileName = image.url.split('/').pop();
    if (fileName) {
      const { error: storageError } = await supabaseAdmin.storage
        .from('images')
        .remove([fileName]);

      if (storageError) {
        console.error('Storage error:', storageError.message);
      }
    }

    // Delete from database
    const { error: dbError } = await supabaseAdmin
      .from('images')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('Database error:', dbError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to delete image' },
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
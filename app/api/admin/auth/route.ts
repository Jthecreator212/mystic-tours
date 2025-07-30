import { handleError } from '@/lib/utils/error-handling';
import { adminAuthSchema, validationUtils } from '@/lib/utils/validation';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

// Environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bsxloajxptdsgqkxbiem.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzeGxvYWp4cHRkc2dxa3hiaWVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MzUyMzMsImV4cCI6MjA2MjUxMTIzM30.lhZoU7QeDRI4yBVvfOiRs1nBTe7BDkwDxchNWsA1kXk';

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables for admin auth');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input using the new validation utilities
    const validationResult = validationUtils.validateAndSanitize(adminAuthSchema, body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      );
    }
    
    const { email, password } = validationResult.data;
    
    const response = NextResponse.json({ success: false });
    
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Admin auth error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    // Check if user has admin role
    const userRole = data.user?.user_metadata?.role || 
                    data.user?.app_metadata?.role;

    if (userRole !== 'admin') {
      console.log('Non-admin user attempted login:', email);
      await supabase.auth.signOut();
      return NextResponse.json(
        { success: false, error: 'Access denied - admin privileges required' },
        { status: 403 }
      );
    }

    // Get the session to ensure cookies are set
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Session creation failed' },
        { status: 500 }
      );
    }

    // Create new response with success data
    const successResponse = NextResponse.json({ 
      success: true,
      user: {
        email: data.user.email,
        role: 'admin'
      }
    });

    // Copy cookies from the original response
    response.cookies.getAll().forEach(cookie => {
      successResponse.cookies.set(cookie.name, cookie.value, cookie);
    });

    console.log('Admin login successful:', email);
    return successResponse;

  } catch (error) {
    const appError = handleError(error, 'ADMIN_AUTH');
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  
  // Clear session cookies using the correct Supabase cookie name
  response.cookies.delete('sb-bsxloajxptdsgqkxbiem-auth-token');
  
  return response;
} 
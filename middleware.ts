import { createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bsxloajxptdsgqkxbiem.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzeGxvYWp4cHRkc2dxa3hiaWVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MzUyMzMsImV4cCI6MjA2MjUxMTIzM30.lhZoU7QeDRI4yBVvfOiRs1nBTe7BDkwDxchNWsA1kXk';

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables for middleware');
}

const ADMIN_PATH = '/mt-operations';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }
  
  if (pathname.startsWith(ADMIN_PATH)) {
    try {
      // Allow access to auth page
      if (pathname === `${ADMIN_PATH}/auth`) {
        return NextResponse.next();
      }
      
      // Create response for potential redirect
      const response = NextResponse.next();
      
      // Check authentication using Supabase
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
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (!session || error) {
        console.log('Middleware: No session or auth error, redirecting to auth');
        return NextResponse.redirect(new URL(`${ADMIN_PATH}/auth`, request.url));
      }
      
      // Check if user has admin role
      const userRole = session.user?.user_metadata?.role || 
                      session.user?.app_metadata?.role;
      
      if (userRole !== 'admin') {
        console.log('Middleware: User does not have admin role, signing out');
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL(`${ADMIN_PATH}/auth`, request.url));
      }
      
      console.log('Middleware: Admin access granted');
      return response;
      
    } catch (error) {
      console.error('Middleware error:', error);
      // On error, redirect to auth page
      return NextResponse.redirect(new URL(`${ADMIN_PATH}/auth`, request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 
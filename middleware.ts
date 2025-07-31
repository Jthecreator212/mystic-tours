import { createServerClient } from '@supabase/ssr';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Environment variables - NO FALLBACKS for production security
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables for middleware');
}

// Type assertion after validation
const validatedSupabaseUrl = supabaseUrl as string;
const validatedSupabaseAnonKey = supabaseAnonKey as string;

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
      const supabase = createServerClient(validatedSupabaseUrl, validatedSupabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
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
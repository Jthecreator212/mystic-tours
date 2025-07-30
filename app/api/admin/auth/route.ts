import { logger } from '@/lib/utils/logger';
import { authRateLimiter } from '@/lib/utils/rate-limiting';
import { adminAuthSchema, validationUtils } from '@/lib/utils/validation';
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

// Environment variables - NO FALLBACKS for production security
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing required Supabase environment variables for admin auth');
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    // Apply rate limiting
    const rateLimitCheck = authRateLimiter.middleware()(request);
    if (rateLimitCheck) {
      logger.logSecurityEvent('rate_limit_exceeded', {
        endpoint: '/api/admin/auth',
        method: 'POST',
        requestId,
      }, 'medium');
      return rateLimitCheck;
    }

    const body = await request.json();
    
    // Validate input using the new validation utilities
    const validationResult = validationUtils.validateAndSanitize(adminAuthSchema, body);
    
    if (!validationResult.success) {
      logger.warn('Admin auth validation failed', {
        requestId,
        endpoint: '/api/admin/auth',
        validationErrors: validationResult.errors,
      });
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      );
    }
    
    const { email, password } = validationResult.data;
    
    const response = NextResponse.json({ success: false });
    
    const supabase = createServerClient(supabaseUrl!, supabaseAnonKey!, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
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
      logger.logAuthentication('failed_login', email, false, error);
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
      logger.logSecurityEvent('unauthorized_admin_access', {
        email,
        userRole,
        requestId,
        endpoint: '/api/admin/auth',
      }, 'high');
      
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
      logger.error('Session creation failed for admin login', {
        email,
        requestId,
        endpoint: '/api/admin/auth',
      });
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

    const duration = Date.now() - startTime;
    logger.logAuthentication('login', email, true);
    logger.logApiRequest('POST', '/api/admin/auth', duration, 200, data.user?.id, requestId);
    
    console.log('Admin login successful:', email);
    return successResponse;

  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Admin auth unexpected error', {
      requestId,
      endpoint: '/api/admin/auth',
      duration: `${duration}ms`,
    }, error as Error);
    
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(7);
  
  try {
    const response = NextResponse.json({ success: true });
    
    // Clear session cookies using the correct Supabase cookie name
    response.cookies.delete('sb-bsxloajxptdsgqkxbiem-auth-token');
    
    const duration = Date.now() - startTime;
    logger.logAuthentication('logout', 'admin', true);
    logger.logApiRequest('DELETE', '/api/admin/auth', duration, 200, undefined, requestId);
    
    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('Admin logout error', {
      requestId,
      endpoint: '/api/admin/auth',
      duration: `${duration}ms`,
    }, error as Error);
    
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    );
  }
} 
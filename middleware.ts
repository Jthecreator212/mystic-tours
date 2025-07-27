import { verify } from 'jsonwebtoken';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const ADMIN_PATH = '/mt-operations';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // TACTICAL: Protect admin routes
  if (pathname.startsWith(ADMIN_PATH)) {
    if (process.env.ADMIN_ENABLED !== 'true') {
      return NextResponse.redirect(new URL('/404', request.url));
    }
    
    // Allow access to auth page without authentication
    if (pathname === `${ADMIN_PATH}/auth`) {
      return NextResponse.next();
    }
    
    // Check for valid session
    const session = request.cookies.get('mt-admin-session');
    if (!session) {
      return NextResponse.redirect(new URL(`${ADMIN_PATH}/auth`, request.url));
    }
    
    // Verify JWT token
    try {
      verify(session.value, process.env.ADMIN_SESSION_SECRET!);
    } catch {
      return NextResponse.redirect(new URL(`${ADMIN_PATH}/auth`, request.url));
    }
  }
  
  // TACTICAL: Deploy decoy/honeypot
  const blockedPaths = ['/admin', '/dashboard', '/cms', '/management'];
  if (blockedPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/404', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  runtime: 'nodejs', // Force Node.js runtime to support jsonwebtoken
  matcher: [
    '/mt-operations/:path*',
    '/admin/:path*',
    '/dashboard/:path*',
    '/cms/:path*',
    '/management/:path*'
  ],
}; 
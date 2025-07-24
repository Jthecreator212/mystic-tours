import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verify } from 'jsonwebtoken';

const ADMIN_PATH = '/mt-operations';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // TACTICAL: Protect admin routes
  if (pathname.startsWith(ADMIN_PATH)) {
    if (process.env.ADMIN_ENABLED !== 'true') {
      return NextResponse.redirect(new URL('/404', request.url));
    }
    // Authentication temporarily disabled for admin routes
    // if (pathname === `${ADMIN_PATH}/auth`) {
    //   return NextResponse.next();
    // }
    // const session = request.cookies.get('mt-admin-session');
    // if (!session) {
    //   return NextResponse.redirect(new URL(`${ADMIN_PATH}/auth`, request.url));
    // }
    // try {
    //   verify(session.value, process.env.ADMIN_SESSION_SECRET!);
    // } catch {
    //   return NextResponse.redirect(new URL(`${ADMIN_PATH}/auth`, request.url));
    // }
  }
  
  // TACTICAL: Deploy decoy/honeypot
  const blockedPaths = ['/admin', '/dashboard', '/cms', '/management'];
  if (blockedPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/404', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/mt-operations/:path*',
    '/admin/:path*',
    '/dashboard/:path*',
    '/cms/:path*',
    '/management/:path*'
  ],
}; 
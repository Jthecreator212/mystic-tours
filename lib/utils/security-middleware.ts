import { NextRequest, NextResponse } from 'next/server';
import { logger } from './logger';

interface SecurityConfig {
  enableCORS: boolean;
  enableRateLimiting: boolean;
  enableSecurityHeaders: boolean;
  enableRequestValidation: boolean;
  allowedOrigins: string[];
  maxRequestSize: number; // in bytes
}

export class SecurityMiddleware {
  private config: SecurityConfig;

  constructor(config: SecurityConfig) {
    this.config = config;
  }

  // CORS middleware
  private handleCORS(req: NextRequest): NextResponse | null {
    if (!this.config.enableCORS) return null;

    const origin = req.headers.get('origin');
    const method = req.method;

    // Handle preflight requests
    if (method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 200 });
      
      if (origin && this.config.allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      }
      
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
      
      return response;
    }

    // Handle actual requests
    if (origin && this.config.allowedOrigins.includes(origin)) {
      const response = NextResponse.next();
      response.headers.set('Access-Control-Allow-Origin', origin);
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    return null;
  }

  // Security headers middleware
  private addSecurityHeaders(response: NextResponse): NextResponse {
    if (!this.config.enableSecurityHeaders) return response;

    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // Content Security Policy
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://bsxloajxptdsgqkxbiem.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
    
    response.headers.set('Content-Security-Policy', csp);

    return response;
  }

  // Request size validation
  private validateRequestSize(req: NextRequest): NextResponse | null {
    if (!this.config.enableRequestValidation) return null;

    const contentLength = req.headers.get('content-length');
    if (contentLength) {
      const size = parseInt(contentLength, 10);
      if (size > this.config.maxRequestSize) {
        logger.logSecurityEvent('request_size_exceeded', {
          size: `${(size / 1024 / 1024).toFixed(2)}MB`,
          maxSize: `${(this.config.maxRequestSize / 1024 / 1024).toFixed(2)}MB`,
          endpoint: req.nextUrl?.pathname,
        }, 'medium');

        return NextResponse.json(
          { success: false, error: 'Request too large' },
          { status: 413 }
        );
      }
    }

    return null;
  }

  // Input sanitization
  private sanitizeInput(data: unknown): unknown {
    if (typeof data === 'string') {
      // Basic XSS protection
      return data
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }
    
    if (typeof data === 'object' && data !== null) {
      if (Array.isArray(data)) {
        return data.map(item => this.sanitizeInput(item));
      } else {
        const sanitized: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
          sanitized[key] = this.sanitizeInput(value);
        }
        return sanitized;
      }
    }
    
    return data;
  }

  // Request validation
  private validateRequest(req: NextRequest): NextResponse | null {
    if (!this.config.enableRequestValidation) return null;

    // Check for suspicious patterns
    const userAgent = req.headers.get('user-agent') || '';
    const suspiciousPatterns = [
      /sqlmap/i,
      /nikto/i,
      /nmap/i,
      /burp/i,
      /w3af/i,
      /acunetix/i,
      /nessus/i,
      /openvas/i,
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(userAgent)) {
        logger.logSecurityEvent('suspicious_user_agent', {
          userAgent,
          endpoint: req.nextUrl?.pathname,
          ip: req.headers.get('x-forwarded-for') || 'unknown',
        }, 'high');

        return NextResponse.json(
          { success: false, error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    return null;
  }

  // Main middleware function
  middleware() {
    return (req: NextRequest) => {
      const startTime = Date.now();
      const requestId = Math.random().toString(36).substring(7);

      // Log incoming request
      logger.debug('Incoming request', {
        method: req.method,
        url: req.url,
        userAgent: req.headers.get('user-agent'),
        ip: req.headers.get('x-forwarded-for'),
        requestId,
      });

      // Handle CORS
      const corsResponse = this.handleCORS(req);
      if (corsResponse) return corsResponse;

      // Validate request size
      const sizeResponse = this.validateRequestSize(req);
      if (sizeResponse) return sizeResponse;

      // Validate request
      const validationResponse = this.validateRequest(req);
      if (validationResponse) return validationResponse;

      // Continue with the request
      const response = NextResponse.next();
      
      // Add security headers
      const securedResponse = this.addSecurityHeaders(response);
      
      // Log successful request
      const duration = Date.now() - startTime;
      logger.debug('Request processed', {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        requestId,
      });

      return securedResponse;
    };
  }
}

// Pre-configured security middleware
export const apiSecurityMiddleware = new SecurityMiddleware({
  enableCORS: true,
  enableRateLimiting: true,
  enableSecurityHeaders: true,
  enableRequestValidation: true,
  allowedOrigins: [
    'http://localhost:3000',
    'https://mystic-tours.com',
    'https://www.mystic-tours.com',
  ],
  maxRequestSize: 10 * 1024 * 1024, // 10MB
});

export const adminSecurityMiddleware = new SecurityMiddleware({
  enableCORS: true,
  enableRateLimiting: true,
  enableSecurityHeaders: true,
  enableRequestValidation: true,
  allowedOrigins: [
    'http://localhost:3000',
    'https://mystic-tours.com',
    'https://www.mystic-tours.com',
  ],
  maxRequestSize: 50 * 1024 * 1024, // 50MB for admin uploads
}); 
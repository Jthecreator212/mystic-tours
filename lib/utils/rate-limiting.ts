import { NextRequest, NextResponse } from 'next/server';

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
}

interface RateLimitResult {
  success: boolean;
  remaining?: number;
  resetTime?: number;
  message?: string;
}

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  private generateKey(req: NextRequest): string {
    if (this.config.keyGenerator) {
      return this.config.keyGenerator(req);
    }
    
    // Default: IP address + user agent
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    return `${ip}:${userAgent}`;
  }

  private isRateLimited(key: string): boolean {
    const now = Date.now();
    const record = rateLimitStore.get(key);

    if (!record) {
      rateLimitStore.set(key, { count: 1, resetTime: now + this.config.windowMs });
      return false;
    }

    if (now > record.resetTime) {
      // Reset window
      rateLimitStore.set(key, { count: 1, resetTime: now + this.config.windowMs });
      return false;
    }

    if (record.count >= this.config.maxRequests) {
      return true;
    }

    // Increment count
    record.count++;
    rateLimitStore.set(key, record);
    return false;
  }

  middleware() {
    return (req: NextRequest) => {
      const key = this.generateKey(req);
      
      if (this.isRateLimited(key)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Rate limit exceeded',
            retryAfter: Math.ceil(this.config.windowMs / 1000)
          },
          { 
            status: 429,
            headers: {
              'Retry-After': Math.ceil(this.config.windowMs / 1000).toString(),
              'X-RateLimit-Limit': this.config.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': (Date.now() + this.config.windowMs).toString()
            }
          }
        );
      }

      return null; // Continue to next middleware
    };
  }
}

// Pre-configured rate limiters
export const apiRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
});

export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 login attempts per 15 minutes
});

export const uploadRateLimiter = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 uploads per hour
});

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60 * 1000); // Clean up every minute

// Legacy rate limiting functions for backward compatibility
export async function checkRateLimit(config: {
  maxAttempts: number;
  windowMs: number;
  identifier: string;
  action: string;
}): Promise<RateLimitResult> {
  const { maxAttempts, windowMs, identifier, action } = config;
  const key = `${action}:${identifier}`;
  const now = Date.now();
  
  // Clean up expired entries
  const current = rateLimitStore.get(key);
  if (current && now > current.resetTime) {
    rateLimitStore.delete(key);
  }
  
  // Get or create entry
  const entry = rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs };
  
  // Check if limit exceeded
  if (entry.count >= maxAttempts) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
      message: `Too many attempts. Please try again in ${Math.ceil((entry.resetTime - now) / 1000 / 60)} minutes.`
    };
  }
  
  // Increment attempts
  entry.count += 1;
  rateLimitStore.set(key, entry);
  
  return {
    success: true,
    remaining: maxAttempts - entry.count,
    resetTime: entry.resetTime
  };
}

export async function checkTourBookingRateLimit(ip: string, email: string): Promise<RateLimitResult> {
  // Check IP rate limit: 3 attempts per 10 minutes
  const ipCheck = await checkRateLimit({
    maxAttempts: 3,
    windowMs: 10 * 60 * 1000, // 10 minutes
    identifier: ip,
    action: 'tour_booking_ip'
  });
  
  if (!ipCheck.success) {
    return ipCheck;
  }
  
  // Check email rate limit: 2 attempts per 5 minutes
  const emailCheck = await checkRateLimit({
    maxAttempts: 2,
    windowMs: 5 * 60 * 1000, // 5 minutes
    identifier: email.toLowerCase(),
    action: 'tour_booking_email'
  });
  
  if (!emailCheck.success) {
    return emailCheck;
  }
  
  return {
    success: true,
    remaining: Math.min(ipCheck.remaining || 0, emailCheck.remaining || 0)
  };
}

export function getClientIP(headers: Headers): string {
  // Check common proxy/load balancer headers
  const xForwardedFor = headers.get('x-forwarded-for');
  const xRealIp = headers.get('x-real-ip');
  const cfConnectingIp = headers.get('cf-connecting-ip');
  
  if (cfConnectingIp) return cfConnectingIp;
  if (xRealIp) return xRealIp;
  if (xForwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return xForwardedFor.split(',')[0].trim();
  }
  
  return 'unknown';
} 
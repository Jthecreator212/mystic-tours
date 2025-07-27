interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  identifier: string;
  action: string;
}

interface RateLimitResult {
  success: boolean;
  remaining?: number;
  resetTime?: number;
  message?: string;
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { attempts: number; resetTime: number }>();

/**
 * Rate limiting utility for tour bookings
 */
export async function checkRateLimit(config: RateLimitConfig): Promise<RateLimitResult> {
  const { maxAttempts, windowMs, identifier, action } = config;
  const key = `${action}:${identifier}`;
  const now = Date.now();
  
  // Clean up expired entries
  const current = rateLimitStore.get(key);
  if (current && now > current.resetTime) {
    rateLimitStore.delete(key);
  }
  
  // Get or create entry
  const entry = rateLimitStore.get(key) || { attempts: 0, resetTime: now + windowMs };
  
  // Check if limit exceeded
  if (entry.attempts >= maxAttempts) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
      message: `Too many attempts. Please try again in ${Math.ceil((entry.resetTime - now) / 1000 / 60)} minutes.`
    };
  }
  
  // Increment attempts
  entry.attempts += 1;
  rateLimitStore.set(key, entry);
  
  return {
    success: true,
    remaining: maxAttempts - entry.attempts,
    resetTime: entry.resetTime
  };
}

/**
 * Tour booking specific rate limiting
 */
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

/**
 * Airport pickup specific rate limiting
 */
export async function checkAirportPickupRateLimit(ip: string, email: string): Promise<RateLimitResult> {
  // Check IP rate limit: 5 attempts per 15 minutes
  const ipCheck = await checkRateLimit({
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    identifier: ip,
    action: 'airport_pickup_ip'
  });
  
  if (!ipCheck.success) {
    return ipCheck;
  }
  
  // Check email rate limit: 3 attempts per 10 minutes
  const emailCheck = await checkRateLimit({
    maxAttempts: 3,
    windowMs: 10 * 60 * 1000, // 10 minutes
    identifier: email.toLowerCase(),
    action: 'airport_pickup_email'
  });
  
  if (!emailCheck.success) {
    return emailCheck;
  }
  
  return {
    success: true,
    remaining: Math.min(ipCheck.remaining || 0, emailCheck.remaining || 0)
  };
}

/**
 * Contact form specific rate limiting
 */
export async function checkContactFormRateLimit(ip: string, email: string): Promise<RateLimitResult> {
  // Check IP rate limit: 8 attempts per 10 minutes
  const ipCheck = await checkRateLimit({
    maxAttempts: 8,
    windowMs: 10 * 60 * 1000, // 10 minutes
    identifier: ip,
    action: 'contact_form_ip'
  });
  
  if (!ipCheck.success) {
    return ipCheck;
  }
  
  // Check email rate limit: 5 attempts per 10 minutes
  const emailCheck = await checkRateLimit({
    maxAttempts: 5,
    windowMs: 10 * 60 * 1000, // 10 minutes
    identifier: email.toLowerCase(),
    action: 'contact_form_email'
  });
  
  if (!emailCheck.success) {
    return emailCheck;
  }
  
  return {
    success: true,
    remaining: Math.min(ipCheck.remaining || 0, emailCheck.remaining || 0)
  };
}

/**
 * Newsletter signup specific rate limiting
 */
export async function checkNewsletterRateLimit(ip: string, email: string): Promise<RateLimitResult> {
  // Check IP rate limit: 10 attempts per hour (for families/groups)
  const ipCheck = await checkRateLimit({
    maxAttempts: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    identifier: ip,
    action: 'newsletter_ip'
  });
  
  if (!ipCheck.success) {
    return ipCheck;
  }
  
  // Check email rate limit: 1 attempt per hour (one-time action)
  const emailCheck = await checkRateLimit({
    maxAttempts: 1,
    windowMs: 60 * 60 * 1000, // 1 hour
    identifier: email.toLowerCase(),
    action: 'newsletter_email'
  });
  
  if (!emailCheck.success) {
    return {
      success: false,
      remaining: 0,
      resetTime: emailCheck.resetTime,
      message: "This email address has already been used for newsletter signup. Please try again later or contact us if this is an error."
    };
  }
  
  return {
    success: true,
    remaining: Math.min(ipCheck.remaining || 0, emailCheck.remaining || 0)
  };
}

/**
 * Get client IP address from headers
 */
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
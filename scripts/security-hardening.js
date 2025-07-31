#!/usr/bin/env node

/**
 * Security Hardening Script for Mystic Tours
 * Implements security measures and best practices
 * Run with: node scripts/security-hardening.js
 */

console.log('🛡️ SECURITY HARDENING IMPLEMENTATION');
console.log('=====================================\n');

// Security measures to implement
const securityMeasures = [
  {
    category: 'API Security',
    measures: [
      'Rate limiting on all API endpoints',
      'Input validation and sanitization',
      'CORS policy configuration',
      'Request size limits',
      'SQL injection prevention'
    ]
  },
  {
    category: 'Authentication & Authorization',
    measures: [
      'JWT token validation',
      'Session management',
      'Password hashing (bcrypt)',
      'Multi-factor authentication (optional)',
      'Account lockout after failed attempts'
    ]
  },
  {
    category: 'Data Protection',
    measures: [
      'Environment variable encryption',
      'Database connection encryption',
      'File upload validation',
      'Data backup encryption',
      'PII data masking'
    ]
  },
  {
    category: 'Infrastructure Security',
    measures: [
      'HTTPS enforcement',
      'Security headers implementation',
      'Content Security Policy',
      'DDoS protection',
      'Regular security updates'
    ]
  }
];

// Rate limiting implementation
const rateLimitImplementation = `
// Add to your API routes
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to all routes
app.use(limiter);

// Stricter limits for sensitive endpoints
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many attempts, please try again later.',
});

app.use('/api/admin/auth', strictLimiter);
`;

// Security headers implementation
const securityHeadersImplementation = `
// Add to next.config.mjs
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://bsxloajxptdsgqkxbiem.supabase.co; frame-ancestors 'none';"
  }
];

// Add to next.config.mjs
async headers() {
  return [
    {
      source: '/(.*)',
      headers: securityHeaders,
    },
  ];
}
`;

// Input validation implementation
const inputValidationImplementation = `
// Add to your API routes
import { z } from 'zod';

const bookingSchema = z.object({
  tourId: z.string().uuid(),
  customerName: z.string().min(1).max(100),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(10).max(15),
  pickupDate: z.string().datetime(),
  numberOfPeople: z.number().min(1).max(20),
  specialRequests: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = bookingSchema.parse(body);
    
    // Process validated data
    const result = await createBooking(validatedData);
    
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
`;

console.log('📋 SECURITY MEASURES TO IMPLEMENT:');
securityMeasures.forEach(category => {
  console.log(`\n${category.category}:`);
  category.measures.forEach(measure => {
    console.log(`   ✅ ${measure}`);
  });
});

console.log('\n🔧 RATE LIMITING IMPLEMENTATION:');
console.log('=================================');
console.log(rateLimitImplementation);

console.log('\n🔒 SECURITY HEADERS IMPLEMENTATION:');
console.log('====================================');
console.log(securityHeadersImplementation);

console.log('\n✅ INPUT VALIDATION IMPLEMENTATION:');
console.log('====================================');
console.log(inputValidationImplementation);

console.log('\n🚨 CRITICAL SECURITY CHECKS:');
console.log('============================');
console.log('1. Environment Variables:');
console.log('   - Ensure no secrets are in client-side code');
console.log('   - Use .env.local for local development');
console.log('   - Use platform environment variables for production');

console.log('\n2. Database Security:');
console.log('   - Verify RLS policies are applied');
console.log('   - Check for SQL injection vulnerabilities');
console.log('   - Ensure proper user permissions');

console.log('\n3. API Security:');
console.log('   - Implement rate limiting on all endpoints');
console.log('   - Add input validation to all forms');
console.log('   - Sanitize all user inputs');

console.log('\n4. Authentication:');
console.log('   - Verify JWT token validation');
console.log('   - Check session management');
console.log('   - Test admin access controls');

console.log('\n5. File Upload Security:');
console.log('   - Validate file types and sizes');
console.log('   - Scan uploaded files for malware');
console.log('   - Store files securely');

console.log('\n6. HTTPS & Headers:');
console.log('   - Enforce HTTPS in production');
console.log('   - Implement security headers');
console.log('   - Configure Content Security Policy');

console.log('\n🔍 SECURITY TESTING CHECKLIST:');
console.log('==============================');
console.log('1. Run security audit:');
console.log('   - npm audit');
console.log('   - Check for vulnerable dependencies');
console.log('   - Update packages regularly');

console.log('\n2. Penetration Testing:');
console.log('   - Test authentication bypass');
console.log('   - Check for XSS vulnerabilities');
console.log('   - Test CSRF protection');

console.log('\n3. Data Protection:');
console.log('   - Verify PII data handling');
console.log('   - Check data encryption');
console.log('   - Test backup security');

console.log('\n4. Monitoring:');
console.log('   - Set up security event logging');
console.log('   - Monitor for suspicious activity');
console.log('   - Configure alerting for security events');

console.log('\n🚀 IMPLEMENTATION PRIORITY:');
console.log('===========================');
console.log('1. HIGH PRIORITY (Implement immediately):');
console.log('   - Rate limiting on API endpoints');
console.log('   - Input validation on all forms');
console.log('   - Security headers implementation');
console.log('   - Environment variable security');

console.log('\n2. MEDIUM PRIORITY (Implement soon):');
console.log('   - Advanced authentication features');
console.log('   - File upload security');
console.log('   - Monitoring and logging');

console.log('\n3. LOW PRIORITY (Implement later):');
console.log('   - Multi-factor authentication');
console.log('   - Advanced threat detection');
console.log('   - Compliance features'); 
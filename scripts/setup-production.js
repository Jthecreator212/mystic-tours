#!/usr/bin/env node

/**
 * Production Environment Setup Script for Mystic Tours
 * Helps configure production environment variables and security settings
 * Run with: node scripts/setup-production.js
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 PRODUCTION ENVIRONMENT SETUP');
console.log('================================\n');

// Production environment variables template
const productionEnvTemplate = `# Production Environment Variables for Mystic Tours
# Copy this to your production environment (Vercel, Netlify, etc.)

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://bsxloajxptdsgqkxbiem.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzeGxvYWp4cHRkc2dxa3hiaWVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY5MzUyMzMsImV4cCI6MjA2MjUxMTIzM30.lhZoU7QeDRI4yBVvfOiRs1nBTe7BDkwDxchNWsA1kXk
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzeGxvYWp4cHRkc2dxa3hiaWVtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjkzNTIzMywiZXhwIjoyMDYyNTExMjMzfQ.q-T_wVjHm5MtkyvO93pdnuQiXkPIEpYsqeLcFI8sryA

# Telegram Notifications
TELEGRAM_BOT_TOKEN=your_production_telegram_bot_token
TELEGRAM_CHAT_ID=your_production_telegram_chat_id

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_NAME=Mystic Tours

# Security
NEXTAUTH_SECRET=your_production_nextauth_secret
NEXTAUTH_URL=https://your-domain.com

# Monitoring (Optional)
SENTRY_DSN=your_sentry_dsn
GOOGLE_ANALYTICS_ID=your_ga_id

# Performance
REDIS_URL=your_redis_url
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
`;

// Security headers configuration
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://bsxloajxptdsgqkxbiem.supabase.co; frame-ancestors 'none';"
};

// Rate limiting configuration
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
};

console.log('📋 PRODUCTION CHECKLIST:');
console.log('1. Environment Variables:');
console.log('   - Copy the template below to your production environment');
console.log('   - Update all placeholder values with real production values');
console.log('   - Ensure all secrets are properly secured');

console.log('\n2. Security Headers:');
console.log('   - Implement security headers in your hosting platform');
console.log('   - Configure Content Security Policy');
console.log('   - Set up HTTPS redirects');

console.log('\n3. Rate Limiting:');
console.log('   - Implement rate limiting on API endpoints');
console.log('   - Configure DDoS protection');
console.log('   - Set up monitoring for abuse');

console.log('\n4. Monitoring & Logging:');
console.log('   - Set up error tracking (Sentry, LogRocket)');
console.log('   - Configure performance monitoring');
console.log('   - Set up uptime monitoring');

console.log('\n5. Database:');
console.log('   - Ensure RLS policies are applied in production');
console.log('   - Set up database backups');
console.log('   - Monitor database performance');

console.log('\n6. SSL/TLS:');
console.log('   - Ensure HTTPS is enforced');
console.log('   - Configure proper SSL certificates');
console.log('   - Set up HSTS headers');

console.log('\n📄 PRODUCTION ENVIRONMENT TEMPLATE:');
console.log('=====================================');
console.log(productionEnvTemplate);

console.log('\n🔒 SECURITY HEADERS CONFIGURATION:');
console.log('===================================');
Object.entries(securityHeaders).forEach(([header, value]) => {
  console.log(`${header}: ${value}`);
});

console.log('\n⚡ RATE LIMITING CONFIGURATION:');
console.log('================================');
console.log(`Window: ${rateLimitConfig.windowMs / 1000 / 60} minutes`);
console.log(`Max Requests: ${rateLimitConfig.max} per window`);
console.log(`Message: ${rateLimitConfig.message}`);

console.log('\n🚀 DEPLOYMENT PLATFORMS:');
console.log('========================');
console.log('1. Vercel (Recommended for Next.js):');
console.log('   - Automatic deployments from Git');
console.log('   - Built-in analytics and monitoring');
console.log('   - Easy environment variable management');

console.log('\n2. Netlify:');
console.log('   - Good for static sites');
console.log('   - Easy form handling');
console.log('   - Built-in CDN');

console.log('\n3. Railway:');
console.log('   - Good for full-stack apps');
console.log('   - Database hosting included');
console.log('   - Easy scaling');

console.log('\n📊 MONITORING SETUP:');
console.log('====================');
console.log('1. Error Tracking:');
console.log('   - Sentry: Real-time error tracking');
console.log('   - LogRocket: Session replay and error tracking');

console.log('\n2. Performance Monitoring:');
console.log('   - Vercel Analytics: Built-in performance monitoring');
console.log('   - Google Analytics: User behavior tracking');
console.log('   - Core Web Vitals: Monitor loading performance');

console.log('\n3. Uptime Monitoring:');
console.log('   - UptimeRobot: Free uptime monitoring');
console.log('   - Pingdom: Advanced monitoring');
console.log('   - StatusCake: Comprehensive monitoring');

console.log('\n🔧 NEXT STEPS:');
console.log('==============');
console.log('1. Choose your deployment platform');
console.log('2. Set up production environment variables');
console.log('3. Configure security headers');
console.log('4. Set up monitoring and logging');
console.log('5. Test the production deployment');
console.log('6. Set up CI/CD pipeline'); 
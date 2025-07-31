#!/usr/bin/env node

/**
 * Vercel Build Script for Mystic Tours
 * Handles production deployment issues
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Vercel build...');

try {
  // Set environment variables for production
  process.env.NEXT_TELEMETRY_DISABLED = '1';
  process.env.NEXT_TRACE = '0';
  process.env.NODE_ENV = 'production';

  console.log('📦 Building application for production...');
  
  // Run the build with warnings ignored
  execSync('next build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: '1',
      NEXT_TRACE: '0',
      NODE_ENV: 'production',
      // Suppress Edge Runtime warnings
      NEXT_SUPPRESS_EDGE_RUNTIME_WARNINGS: '1'
    }
  });

  console.log('✅ Production build completed successfully!');
  
  // Check if build artifacts exist
  const staticDir = path.join(process.cwd(), '.next', 'static');
  if (fs.existsSync(staticDir)) {
    console.log('📊 Build artifacts generated successfully');
    
    // List build artifacts
    const jsDir = path.join(staticDir, 'chunks');
    if (fs.existsSync(jsDir)) {
      const files = fs.readdirSync(jsDir);
      console.log(`📦 Generated ${files.length} JavaScript chunks`);
    }
  }

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 
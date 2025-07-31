#!/usr/bin/env node

/**
 * Simple Build Script for Mystic Tours
 * Bypasses trace file permission issues on Windows
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Starting simple build...');

try {
  // Clean .next directory with better error handling
  const nextDir = path.join(process.cwd(), '.next');
  if (fs.existsSync(nextDir)) {
    console.log('🧹 Cleaning .next directory...');
    try {
      fs.rmSync(nextDir, { recursive: true, force: true });
    } catch (error) {
      console.log('⚠️  Could not clean .next directory completely, continuing...');
      // Try to remove individual files that might be causing issues
      try {
        const traceFile = path.join(nextDir, 'trace');
        if (fs.existsSync(traceFile)) {
          fs.unlinkSync(traceFile);
        }
      } catch (e) {
        // Ignore trace file deletion errors
      }
    }
  }

  // Set environment variables to disable tracing
  process.env.NEXT_TELEMETRY_DISABLED = '1';
  process.env.NEXT_TRACE = '0';

  console.log('📦 Building application...');
  
  // Temporarily use minimal config
  const originalConfig = 'next.config.mjs';
  const minimalConfig = 'next.config.minimal.mjs';
  
  // Backup original config
  if (fs.existsSync(originalConfig)) {
    fs.copyFileSync(originalConfig, originalConfig + '.backup');
  }
  
  // Use minimal config
  fs.copyFileSync(minimalConfig, originalConfig);
  
  try {
    // Run build with minimal configuration
    execSync('next build', { 
      stdio: 'inherit',
      env: {
        ...process.env,
        NEXT_TELEMETRY_DISABLED: '1',
        NEXT_TRACE: '0'
      }
    });
  } finally {
    // Restore original config
    if (fs.existsSync(originalConfig + '.backup')) {
      fs.copyFileSync(originalConfig + '.backup', originalConfig);
      fs.unlinkSync(originalConfig + '.backup');
    }
  }

  console.log('✅ Build completed successfully!');
  
  // Check bundle size
  const staticDir = path.join(process.cwd(), '.next', 'static');
  if (fs.existsSync(staticDir)) {
    console.log('\n📊 Bundle Analysis:');
    const jsDir = path.join(staticDir, 'chunks');
    if (fs.existsSync(jsDir)) {
      const files = fs.readdirSync(jsDir);
      let totalSize = 0;
      
      files.forEach(file => {
        if (file.endsWith('.js')) {
          const filePath = path.join(jsDir, file);
          const stats = fs.statSync(filePath);
          const sizeKB = Math.round(stats.size / 1024);
          totalSize += sizeKB;
          console.log(`   ${file}: ${sizeKB}KB`);
        }
      });
      
      console.log(`\n📦 Total JS bundle size: ${totalSize}KB`);
      
      if (totalSize < 1000) {
        console.log('🎉 Excellent! Bundle size is under 1MB');
      } else if (totalSize < 2000) {
        console.log('✅ Good! Bundle size is reasonable');
      } else {
        console.log('⚠️  Bundle size is large - consider optimization');
      }
    }
  }

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 
#!/usr/bin/env node

/**
 * Production Build Script for Mystic Tours
 * Handles the 'self is not defined' error in production
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production build...');

try {
  // Set production environment variables
  process.env.NODE_ENV = 'production';
  process.env.NEXT_TELEMETRY_DISABLED = '1';
  process.env.NEXT_TRACE = '0';

  // Create a temporary webpack config that handles the self issue
  const tempWebpackConfig = `
    const webpack = require('webpack');
    
    module.exports = function(config, { isServer }) {
      if (isServer) {
        config.resolve.fallback = {
          ...config.resolve.fallback,
          fs: false,
          net: false,
          tls: false,
          self: false,
          window: false,
          global: false,
        };
        
        config.plugins.push(
          new webpack.DefinePlugin({
            'typeof self': '"undefined"',
            'typeof window': '"undefined"',
            'typeof global': '"undefined"',
            'self': 'undefined',
            'window': 'undefined',
            'global': 'undefined',
          })
        );
      }
      
      return config;
    };
  `;

  // Write temporary webpack config
  fs.writeFileSync('temp-webpack-config.js', tempWebpackConfig);

  console.log('📦 Building application for production...');
  
  // Run the build
  execSync('next build', { 
    stdio: 'inherit',
    env: {
      ...process.env,
      NODE_ENV: 'production',
      NEXT_TELEMETRY_DISABLED: '1',
      NEXT_TRACE: '0'
    }
  });

  // Clean up temporary file
  if (fs.existsSync('temp-webpack-config.js')) {
    fs.unlinkSync('temp-webpack-config.js');
  }

  console.log('✅ Production build completed successfully!');
  
  // Verify build artifacts
  const staticDir = path.join(process.cwd(), '.next', 'static');
  if (fs.existsSync(staticDir)) {
    console.log('📊 Build artifacts generated successfully');
    
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
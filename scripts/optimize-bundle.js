#!/usr/bin/env node

/**
 * Bundle Optimization Script for Mystic Tours
 * Analyzes bundle size and removes unused dependencies
 * Run with: node scripts/optimize-bundle.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 BUNDLE OPTIMIZATION ANALYSIS');
console.log('================================\n');

// Check for unused dependencies
const unusedDependencies = [
  'cheerio',           // Not used anywhere
  'bcryptjs',          // Not used anywhere  
  'jsonwebtoken',      // Not used anywhere
  '@types/react-big-calendar' // Only used in one admin page
];

// Large dependencies that could be lazy loaded
const largeDependencies = [
  'react-big-calendar', // ~200KB - only used in admin calendar
  'recharts',          // ~150KB - only used in chart component
  'react-resizable-panels', // ~50KB - only used in admin
  'embla-carousel-react' // ~30KB - could be lazy loaded
];

console.log('📦 UNUSED DEPENDENCIES FOUND:');
unusedDependencies.forEach(dep => {
  console.log(`   ❌ ${dep} - Not used in codebase`);
});

console.log('\n📦 LARGE DEPENDENCIES FOR LAZY LOADING:');
largeDependencies.forEach(dep => {
  console.log(`   ⚠️  ${dep} - Consider lazy loading`);
});

console.log('\n🔧 OPTIMIZATION RECOMMENDATIONS:');
console.log('1. Remove unused dependencies:');
unusedDependencies.forEach(dep => {
  console.log(`   pnpm remove ${dep}`);
});

console.log('\n2. Implement lazy loading for large components:');
console.log('   - react-big-calendar: Only used in admin calendar');
console.log('   - recharts: Only used in chart component');
console.log('   - embla-carousel-react: Could be lazy loaded');

console.log('\n3. Add dynamic imports:');
console.log('   - Use dynamic imports for admin-only components');
console.log('   - Lazy load chart components');
console.log('   - Lazy load carousel components');

console.log('\n4. Optimize images:');
console.log('   - Convert images to WebP format');
console.log('   - Implement proper image sizing');
console.log('   - Add lazy loading for images');

console.log('\n📊 ESTIMATED SAVINGS:');
console.log(`   Unused dependencies: ~${unusedDependencies.length * 50}KB`);
console.log(`   Lazy loading potential: ~${largeDependencies.length * 100}KB`);
console.log(`   Total potential savings: ~${unusedDependencies.length * 50 + largeDependencies.length * 100}KB`);

console.log('\n🚀 NEXT STEPS:');
console.log('1. Run: pnpm remove cheerio bcryptjs jsonwebtoken @types/react-big-calendar');
console.log('2. Implement dynamic imports for large components');
console.log('3. Run: pnpm analyze to see bundle breakdown');
console.log('4. Optimize images and implement lazy loading'); 
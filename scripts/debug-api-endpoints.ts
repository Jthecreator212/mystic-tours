#!/usr/bin/env ts-node

/**
 * Debug API Endpoints Script for Mystic Tours
 * Tests each API endpoint individually to identify which one is failing
 * Run with: npx ts-node --project tsconfig.scripts.json scripts/debug-api-endpoints.ts
 */

// Load environment variables from .env.local
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const endpoints = [
  '/api/admin/bookings',
  '/api/admin/tours',
  '/api/admin/drivers'
];

async function testEndpoint(endpoint: string) {
  try {
    console.log(`\n🔍 Testing: ${endpoint}`);
    const response = await fetch(`${baseUrl}${endpoint}`);
    
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Headers: ${response.headers.get('content-type') || 'none'}`);
    
    if (response.status === 200) {
      console.log(`   ✅ SUCCESS: Endpoint is working`);
    } else if (response.status === 401) {
      console.log(`   ⚠️  EXPECTED: 401 Unauthorized (admin endpoint without auth)`);
    } else if (response.status === 404) {
      console.log(`   ❌ FAILED: 404 Not Found - Endpoint doesn't exist`);
    } else if (response.status === 500) {
      console.log(`   ❌ FAILED: 500 Internal Server Error`);
    } else {
      console.log(`   ❓ UNKNOWN: Status ${response.status}`);
    }
    
    return response.status === 200 || response.status === 401;
  } catch (error) {
    console.log(`   ❌ ERROR: ${error}`);
    return false;
  }
}

async function main() {
  console.log('🔍 DEBUGGING API ENDPOINTS');
  console.log('============================');
  console.log(`Testing server at: ${baseUrl}\n`);

  let workingEndpoints = 0;
  let totalEndpoints = endpoints.length;

  for (const endpoint of endpoints) {
    const isWorking = await testEndpoint(endpoint);
    if (isWorking) {
      workingEndpoints++;
    }
  }

  console.log('\n📊 SUMMARY');
  console.log('===========');
  console.log(`Working: ${workingEndpoints}/${totalEndpoints}`);
  
  if (workingEndpoints === totalEndpoints) {
    console.log('✅ All endpoints are working correctly!');
  } else {
    console.log(`❌ ${totalEndpoints - workingEndpoints} endpoint(s) are not working`);
  }
}

if (require.main === module) {
  main().catch(console.error);
} 
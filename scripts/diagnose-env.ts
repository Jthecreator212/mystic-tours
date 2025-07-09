#!/usr/bin/env ts-node

// Load environment variables
import * as dotenv from 'dotenv';
import { existsSync } from 'fs';

console.log('🔍 Environment Variables Diagnostic Tool\n');

// Check if .env.local exists
const envLocalExists = existsSync('.env.local');
console.log(`📁 .env.local file exists: ${envLocalExists ? '✅' : '❌'}`);

// Load environment variables
console.log('\n📄 Loading from .env.local:');
const result = dotenv.config({ path: '.env.local' });

if (result.error) {
  console.log(`❌ Error loading .env.local: ${result.error.message}`);
} else {
  console.log('✅ .env.local loaded successfully');
  console.log(`📊 Loaded ${Object.keys(result.parsed || {}).length} variables`);
}

// Check required environment variables
console.log('\n🔑 Checking Supabase environment variables:');
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
  'SUPABASE_SERVICE_ROLE_KEY'
];

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: Not set`);
  } else {
    console.log(`✅ ${varName}: ${value.substring(0, 30)}...`);
    console.log(`   Length: ${value.length} characters`);
  }
});

// Check Telegram variables too
console.log('\n📱 Checking Telegram environment variables:');
const telegramVars = ['TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'];

telegramVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: Not set`);
  } else {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  }
});

// Test API key format
console.log('\n🧪 Testing Service Role Key format:');
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (serviceKey) {
  try {
    // JWT tokens have 3 parts separated by dots
    const parts = serviceKey.split('.');
    console.log(`🔢 JWT parts: ${parts.length} (should be 3)`);
    
    if (parts.length === 3) {
      console.log('✅ Service key format looks correct (3 JWT parts)');
      
      // Decode the header
      try {
        const header = JSON.parse(Buffer.from(parts[0], 'base64').toString());
        console.log(`✅ JWT header: ${JSON.stringify(header)}`);
      } catch (e) {
        console.log(`❌ Could not decode JWT header: ${e}`);
      }
      
      // Decode the payload
      try {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        console.log(`✅ JWT role: ${payload.role}`);
        console.log(`✅ JWT ref: ${payload.ref}`);
        console.log(`✅ JWT expires: ${new Date(payload.exp * 1000).toISOString()}`);
        
        if (payload.role !== 'service_role') {
          console.log('⚠️  WARNING: Role is not "service_role"');
        }
        
        // Check if token is expired
        if (payload.exp * 1000 < Date.now()) {
          console.log('❌ WARNING: JWT token is EXPIRED!');
        } else {
          console.log('✅ JWT token is valid (not expired)');
        }
      } catch (e) {
        console.log(`❌ Could not decode JWT payload: ${e}`);
      }
    } else {
      console.log('❌ Service key format is invalid (not a JWT)');
    }
  } catch (error) {
    console.log(`❌ Error parsing service key: ${error}`);
  }
} else {
  console.log('❌ Service key not found');
}

console.log('\n🌐 Testing basic Supabase connection:');
async function testConnection() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log(`🔗 URL: ${supabaseUrl}`);
    console.log(`🔑 Key: ${supabaseKey ? supabaseKey.substring(0, 30) + '...' : 'MISSING'}`);
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Missing URL or key');
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    console.log('🚀 Attempting database query...');
    
    // Test with a simple health check
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(1);
    
    if (error) {
      console.log(`❌ Connection failed: ${error.message}`);
      console.log(`❌ Error details:`, error);
    } else {
      console.log('✅ Connection successful!');
      console.log(`📋 Found table: ${data?.[0]?.table_name || 'none'}`);
    }
  } catch (error) {
    console.log(`❌ Connection error: ${error}`);
  }
}

testConnection().catch(console.error); 
#!/usr/bin/env ts-node

import * as fs from 'fs';
import * as dotenv from 'dotenv';

console.log('🔧 Environment File Issue Detector & Fixer\n');

// Read the .env.local file content
let envContent = '';
try {
  envContent = fs.readFileSync('.env.local', 'utf8');
  console.log('✅ Successfully read .env.local file');
  console.log(`📏 File size: ${envContent.length} characters`);
} catch (error) {
  console.log('❌ Could not read .env.local file:', error);
  process.exit(1);
}

// Split into lines and analyze
const lines = envContent.split('\n');
console.log(`📄 Total lines: ${lines.length}`);

// Check for duplicate entries
console.log('\n🔍 Checking for duplicate environment variables:');
const envVars = new Map<string, string[]>();

lines.forEach((line, index) => {
  const trimmedLine = line.trim();
  if (trimmedLine && !trimmedLine.startsWith('#')) {
    const [key, ...valueParts] = trimmedLine.split('=');
    if (key && valueParts.length > 0) {
      const cleanKey = key.trim();
      if (!envVars.has(cleanKey)) {
        envVars.set(cleanKey, []);
      }
      envVars.get(cleanKey)!.push(`Line ${index + 1}: ${trimmedLine}`);
    }
  }
});

// Look for duplicates
let foundDuplicates = false;
envVars.forEach((entries, key) => {
  if (entries.length > 1) {
    console.log(`⚠️  DUPLICATE found for ${key}:`);
    entries.forEach(entry => console.log(`   ${entry}`));
    foundDuplicates = true;
  }
});

if (!foundDuplicates) {
  console.log('✅ No duplicate variables found');
}

// Check specific Supabase variables for issues
console.log('\n🔍 Analyzing Supabase environment variables:');

const supabaseVars = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];

supabaseVars.forEach(varName => {
  const entries = envVars.get(varName) || [];
  console.log(`\n📋 ${varName}:`);
  
  if (entries.length === 0) {
    console.log('   ❌ Not found in file');
    return;
  }
  
  entries.forEach((entry, index) => {
    console.log(`   Entry ${index + 1}: ${entry}`);
    
    // Extract the value part
    const [, ...valueParts] = entry.split('=');
    const fullValue = valueParts.join('=');
    
    // Check for common issues
    if (fullValue.startsWith('"') && fullValue.endsWith('"')) {
      console.log('   ⚠️  Value is wrapped in quotes - this might be included in the actual value');
    }
    
    if (fullValue.startsWith(' ') || fullValue.endsWith(' ')) {
      console.log('   ⚠️  Value has leading/trailing whitespace');
    }
    
    if (fullValue.includes('\r')) {
      console.log('   ⚠️  Value contains carriage return characters');
    }
    
    // Check JWT format for keys
    if (varName.includes('KEY')) {
      const cleanValue = fullValue.replace(/"/g, '').trim();
      const parts = cleanValue.split('.');
      console.log(`   🔑 JWT parts: ${parts.length} (should be 3)`);
      
      if (parts.length === 3) {
        try {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          console.log(`   ✅ JWT role: ${payload.role}`);
          console.log(`   ✅ JWT ref: ${payload.ref}`);
          
          if (payload.exp * 1000 < Date.now()) {
            console.log('   ❌ JWT is EXPIRED!');
          } else {
            console.log('   ✅ JWT is valid');
          }
        } catch (e) {
          console.log(`   ❌ Could not decode JWT: ${e}`);
        }
      }
    }
  });
});

// Test loading with dotenv
console.log('\n🧪 Testing dotenv parsing:');
const result = dotenv.config({ path: '.env.local' });

if (result.error) {
  console.log(`❌ dotenv error: ${result.error.message}`);
} else {
  console.log('✅ dotenv parsed successfully');
  
  // Check what values dotenv actually loaded
  supabaseVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`📤 ${varName}: ${value.substring(0, 30)}... (length: ${value.length})`);
      
      // Check for quotes in the loaded value
      if (value.startsWith('"') && value.endsWith('"')) {
        console.log(`   ⚠️  PROBLEM: dotenv loaded value includes quotes!`);
        console.log(`   💡 Fix: Remove quotes from ${varName} in .env.local`);
      }
    } else {
      console.log(`❌ ${varName}: Not loaded by dotenv`);
    }
  });
}

// Final connection test with cleaned values
console.log('\n🌐 Testing connection with cleaned values:');
async function testWithCleanedValues() {
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    // Clean the values
    supabaseUrl = supabaseUrl.replace(/^"(.*)"$/, '$1').trim();
    supabaseKey = supabaseKey.replace(/^"(.*)"$/, '$1').trim();
    
    console.log(`🔗 Cleaned URL: ${supabaseUrl}`);
    console.log(`🔑 Cleaned Key: ${supabaseKey.substring(0, 30)}...`);
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(1);
    
    if (error) {
      console.log(`❌ Still failing: ${error.message}`);
    } else {
      console.log('✅ SUCCESS! Connection works with cleaned values');
    }
  } catch (error) {
    console.log(`❌ Error: ${error}`);
  }
}

testWithCleanedValues().catch(console.error); 
#!/usr/bin/env ts-node

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Import Supabase client
import { supabaseAdmin } from '@/lib/supabase/supabase';

async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...\n');
  
  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    const { data: healthCheck, error: healthError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(10);
    
    if (healthError) {
      console.error('❌ Connection failed:', healthError.message);
      return;
    }
    
    console.log('✅ Database connected successfully!');
    console.log('📋 Available tables:', healthCheck.map(t => t.table_name).join(', '));
    
    // Test 2: Check specific tables
    console.log('\n2. Checking required tables...');
    const requiredTables = ['tours', 'bookings', 'airport_pickup_bookings', 'testimonials'];
    
    for (const table of requiredTables) {
      try {
        const { data, error } = await supabaseAdmin
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          console.log(`✅ ${table}: ${data?.length || 0} records`);
        }
      } catch (err) {
        console.log(`❌ ${table}: Table might not exist`);
      }
    }
    
    // Test 3: Check tours specifically
    console.log('\n3. Checking tours table data...');
    const { data: tours, error: toursError } = await supabaseAdmin
      .from('tours')
      .select('id, title, price')
      .limit(5);
    
    if (toursError) {
      console.error('❌ Tours query failed:', toursError.message);
    } else {
      console.log('✅ Tours found:');
      tours.forEach(tour => {
        console.log(`  - ${tour.title} (ID: ${tour.id}, Price: $${tour.price})`);
      });
    }
    
    console.log('\n🎉 Database connection test completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Execute the test
testDatabaseConnection().catch(console.error); 
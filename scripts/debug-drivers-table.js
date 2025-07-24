require('dotenv').config({ path: '.env.local' });

// Debug script for the drivers table (plain JS)
// Usage: node scripts/debug-drivers-table.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function debugDriversTable() {
  try {
    // Insert a test driver
    const testDriver = {
      name: 'Debug Driver',
      phone: '555-1234',
      email: `debug-driver-${Date.now()}@example.com`,
      status: 'active',
    };
    const { data: insertData, error: insertError } = await supabase
      .from('drivers')
      .insert([testDriver])
      .select();
    if (insertError) {
      console.error('Insert error:', insertError);
    } else {
      console.log('Inserted driver:', insertData);
    }

    // Fetch all drivers
    const { data: drivers, error: fetchError } = await supabase
      .from('drivers')
      .select('*');
    if (fetchError) {
      console.error('Fetch error:', fetchError);
    } else {
      console.log('All drivers:', drivers);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

debugDriversTable(); 
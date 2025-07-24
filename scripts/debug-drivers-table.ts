import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function debugDriversTable() {
  console.log('--- DEBUG: DRIVERS TABLE ---');
  try {
    // Try to insert a test driver
    const { data: insertData, error: insertError } = await supabase
      .from('drivers')
      .insert({
        name: 'Debug Driver',
        phone: '0000000000',
        email: 'debug@example.com',
        vehicle: 'Debug Car',
        status: 'available',
      })
      .select();
    if (insertError) {
      console.error('Insert error:', insertError.message);
    } else {
      console.log('Insert success:', insertData);
    }
  } catch (err) {
    console.error('Insert exception:', err);
  }

  try {
    // Fetch all drivers
    const { data: drivers, error: fetchError } = await supabase
      .from('drivers')
      .select('*');
    if (fetchError) {
      console.error('Fetch error:', fetchError.message);
    } else {
      console.log('Drivers:', drivers);
    }
  } catch (err) {
    console.error('Fetch exception:', err);
  }

  // RLS status cannot be fetched via client, but print a reminder
  console.log('--- REMINDER: Check RLS policies for the drivers table in Supabase Studio if inserts fail. ---');
}

debugDriversTable(); 
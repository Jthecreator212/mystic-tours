const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function verifyRecentBooking() {
  console.log('🔍 VERIFYING RECENT BOOKING...');
  console.log('='.repeat(50));
  
  // Clean environment variables (remove quotes if present)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/"/g, '');
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.replace(/"/g, '');
  
  // Debug environment variables
  console.log('📋 Environment Check:');
  console.log(`   SUPABASE_URL: ${supabaseUrl ? 'Found' : 'Missing'}`);
  console.log(`   SERVICE_KEY: ${serviceKey ? 'Found' : 'Missing'}`);
  console.log(`   Using .env.local file ✅`);
  
  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing environment variables!');
    console.log('   Please check your .env.local file contains:');
    console.log('   - NEXT_PUBLIC_SUPABASE_URL');
    console.log('   - SUPABASE_SERVICE_ROLE_KEY');
    return;
  }
  
  const supabase = createClient(supabaseUrl, serviceKey);
  
  try {
    // First, let's test the connection
    console.log('\n🔌 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('bookings')
      .select('count')
      .limit(1);
      
    if (testError) {
      console.error('❌ Database connection error:', testError.message);
      if (testError.message.includes('Invalid API key')) {
        console.log('💡 This usually means:');
        console.log('   - The SUPABASE_SERVICE_ROLE_KEY is incorrect');
        console.log('   - The key has extra quotes or spaces');
        console.log('   - The .env.local file has formatting issues');
      }
      return;
    }
    
    console.log('✅ Database connection successful!');
    
    // Get the most recent booking
    const { data: recentBookings, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (error) {
      console.error('❌ Database query error:', error.message);
      return;
    }
    
    console.log(`\n📊 Found ${recentBookings.length} recent bookings:`);
    
    recentBookings.forEach((booking, index) => {
      const timeAgo = Math.floor((Date.now() - new Date(booking.created_at).getTime()) / (1000 * 60));
      console.log(`\n${index + 1}. 🎫 BOOKING #${booking.id.substring(0, 8)}...`);
      console.log(`   👤 Customer: ${booking.customer_name}`);
      console.log(`   📧 Email: ${booking.customer_email}`);
      console.log(`   📞 Phone: ${booking.customer_phone}`);
      console.log(`   🗓️ Tour Date: ${booking.booking_date}`);
      console.log(`   👥 Guests: ${booking.number_of_people}`);
      console.log(`   💰 Amount: $${booking.total_amount}`);
      console.log(`   📅 Created: ${new Date(booking.created_at).toLocaleString()}`);
      console.log(`   ⏰ Time ago: ${timeAgo} minutes`);
      console.log(`   🔄 Status: ${booking.status}`);
      
      if (timeAgo <= 10) {
        console.log('   🎉 THIS LOOKS LIKE YOUR RECENT TEST BOOKING!');
      }
    });
    
    // Check if there's a very recent booking (within last 10 minutes)
    const veryRecentBooking = recentBookings.find(booking => {
      const timeAgo = Math.floor((Date.now() - new Date(booking.created_at).getTime()) / (1000 * 60));
      return timeAgo <= 10;
    });
    
    if (veryRecentBooking) {
      console.log('\n🎉 SUCCESS! Recent booking found in database!');
      console.log('✅ Your booking form is working correctly!');
      console.log('✅ Customer data is being saved!');
      console.log('✅ .env.local configuration is working!');
    } else {
      console.log('\n⚠️  No very recent bookings found.');
      console.log('   This could mean:');
      console.log('   - The booking submission had a validation error');
      console.log('   - The booking was made more than 10 minutes ago');
      console.log('   - Try submitting another test booking');
    }
    
    // Additional check: Verify Telegram configuration
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN?.replace(/"/g, '');
    const telegramChatId = process.env.TELEGRAM_CHAT_ID?.replace(/"/g, '');
    
    console.log('\n📱 Telegram Configuration:');
    console.log(`   BOT_TOKEN: ${telegramToken ? 'Found' : 'Missing'}`);
    console.log(`   CHAT_ID: ${telegramChatId ? 'Found' : 'Missing'}`);
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyRecentBooking().catch(console.error); 
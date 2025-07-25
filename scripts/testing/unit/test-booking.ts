import { createTourBooking } from '@/app/actions/booking-actions';

async function testBooking() {
  console.log('🧪 Testing booking system...\n');

  const testBookingData = {
    tourId: '550e8400-e29b-41d4-a716-446655440000', // Example UUID
    tourName: 'Test Tour - Blue Mountains Adventure',
    date: '2024-12-25',
    guests: 2,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    specialRequests: 'Vegetarian meal preference, wheelchair accessible vehicle needed'
  };

  try {
    console.log('📝 Submitting test booking...');
    console.log('Booking data:', JSON.stringify(testBookingData, null, 2));
    console.log('');

    const result = await createTourBooking(testBookingData);

    console.log('✅ Booking result:');
    console.log('Success:', result.success);
    console.log('Message:', result.message);
    
    if (result.bookingId) {
      console.log('Booking ID:', result.bookingId);
    }

    if (result.errors) {
      console.log('Errors:', result.errors);
    }

    console.log('\n📱 Check your server console for WhatsApp message output');
    console.log('💡 If you see the WhatsApp message logged, the system is working correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testBooking(); 
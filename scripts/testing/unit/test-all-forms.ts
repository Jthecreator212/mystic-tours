#!/usr/bin/env ts-node

// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Import all action functions
import { createTourBooking } from '../app/actions/booking-actions';
import { createAirportPickupBooking } from '../app/actions/airport-pickup-actions';
import { submitContactForm } from '../app/actions/contact-actions';
import { subscribeToNewsletter } from '../app/actions/newsletter-actions';
import { supabaseAdmin } from '../lib/supabase';

// Test data generators
function generateTourBookingData() {
  return {
    tourId: '550e8400-e29b-41d4-a716-446655440000',
    tourName: 'Blue Mountains Adventure - Test Booking',
    date: '2024-12-25',
    guests: 2,
    name: 'John Test User',
    email: 'test@example.com',
    phone: '+1-555-123-4567',
    specialRequests: 'Vegetarian meal preference, early morning pickup'
  };
}

function generateAirportPickupData(serviceType: 'pickup' | 'dropoff' | 'both') {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  if (serviceType === 'pickup') {
    return {
      customer_name: 'Jane Test User',
      customer_email: 'jane.test@example.com',
      customer_phone: '+1-555-987-6543',
      passengers: 3,
      service_type: 'pickup' as const,
      flight_number: 'AA123',
      arrival_date: tomorrow,
      arrival_time: '14:30',
      dropoff_location: 'Sandals Resort, Montego Bay',
    };
  } else if (serviceType === 'dropoff') {
    return {
      customer_name: 'Jane Test User',
      customer_email: 'jane.test@example.com',
      customer_phone: '+1-555-987-6543',
      passengers: 3,
      service_type: 'dropoff' as const,
      departure_flight_number: 'BA456',
      departure_date: nextWeek,
      departure_time: '10:15',
      pickup_location: 'Riu Palace, Negril',
    };
  } else { // both
    return {
      customer_name: 'Jane Test User',
      customer_email: 'jane.test@example.com',
      customer_phone: '+1-555-987-6543',
      passengers: 3,
      service_type: 'both' as const,
      flight_number: 'AA123',
      arrival_date: tomorrow,
      arrival_time: '14:30',
      dropoff_location: 'Sandals Resort, Montego Bay',
      departure_flight_number: 'BA456',
      departure_date: nextWeek,
      departure_time: '10:15',
      pickup_location: 'Sandals Resort, Montego Bay',
    };
  }
}

function generateContactFormData(subject: string) {
  return {
    name: 'Bob Test User',
    email: 'bob.test@example.com',
    subject: subject as "Tour Inquiry" | "Booking Question" | "Custom Tour Request" | "General Question",
    message: 'This is a test message from the automated testing system. Please disregard this test inquiry. We are testing the contact form functionality to ensure it works correctly for real customers.'
  };
}

function generateNewsletterData() {
  return {
    email: 'newsletter.test@example.com'
  };
}

// Test result tracking
interface TestResult {
  test: string;
  success: boolean;
  message: string;
  error?: any;
  duration?: number;
}

const testResults: TestResult[] = [];

// Helper function to run a test with timing
async function runTest<T>(testName: string, testFunction: () => Promise<T>): Promise<T | null> {
  console.log(`\n🧪 Running: ${testName}`);
  console.log('━'.repeat(50));
  
  const startTime = Date.now();
  
  try {
    const result = await testFunction();
    const duration = Date.now() - startTime;
    
    console.log(`✅ ${testName} - PASSED (${duration}ms)`);
    testResults.push({
      test: testName,
      success: true,
      message: 'Test passed successfully',
      duration
    });
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error(`❌ ${testName} - FAILED (${duration}ms)`);
    console.error('Error:', error);
    testResults.push({
      test: testName,
      success: false,
      message: `Test failed: ${error}`,
      error,
      duration
    });
    
    return null;
  }
}

// Individual test functions
async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  // Test basic connection
  const { data: connectionTest, error: connectionError } = await supabaseAdmin
    .from('tours')
    .select('count')
    .limit(1)
    .single();
    
  if (connectionError) {
    throw new Error(`Database connection failed: ${connectionError.message}`);
  }
  
  console.log(`✅ Database connected successfully. Found ${connectionTest.count} tours.`);
  
  // Test required tables exist
  const tables = ['tours', 'bookings', 'airport_pickup_bookings'];
  for (const table of tables) {
    const { data, error } = await supabaseAdmin
      .from(table)
      .select('count')
      .limit(1)
      .single();
      
    if (error) {
      throw new Error(`Table ${table} not accessible: ${error.message}`);
    }
    
    console.log(`✅ Table ${table} accessible with ${data.count} records.`);
  }
}

async function testTourBookingSystem() {
  console.log('🎫 Testing tour booking system...');
  
  const testData = generateTourBookingData();
  console.log('Booking data:', JSON.stringify(testData, null, 2));
  
  const result = await createTourBooking(testData);
  
  console.log('Booking result:', result);
  
  if (!result.success) {
    throw new Error(`Tour booking failed: ${result.message}`);
  }
  
  console.log('✅ Tour booking system working correctly');
  return result;
}

async function testAirportPickupSystem() {
  console.log('🚐 Testing airport pickup system...');
  
  const serviceTypes: Array<'pickup' | 'dropoff' | 'both'> = ['pickup', 'dropoff', 'both'];
  
  for (const serviceType of serviceTypes) {
    console.log(`\n📍 Testing ${serviceType} service...`);
    
    const testData = generateAirportPickupData(serviceType);
    console.log('Pickup data:', JSON.stringify(testData, null, 2));
    
    const result = await createAirportPickupBooking(testData);
    
    console.log('Pickup result:', result);
    
    if (!result.success) {
      throw new Error(`Airport pickup (${serviceType}) failed: ${result.message}`);
    }
    
    console.log(`✅ Airport pickup (${serviceType}) working correctly`);
  }
}

async function testContactFormSystem() {
  console.log('📝 Testing contact form system...');
  
  const subjects = ['Tour Inquiry', 'Booking Question', 'Custom Tour Request', 'General Question'];
  
  for (const subject of subjects) {
    console.log(`\n📧 Testing ${subject} contact...`);
    
    const testData = generateContactFormData(subject);
    console.log('Contact data:', JSON.stringify(testData, null, 2));
    
    const result = await submitContactForm(testData);
    
    console.log('Contact result:', result);
    
    if (!result.success) {
      throw new Error(`Contact form (${subject}) failed: ${result.message}`);
    }
    
    console.log(`✅ Contact form (${subject}) working correctly`);
  }
}

async function testNewsletterSystem() {
  console.log('📧 Testing newsletter system...');
  
  const testData = generateNewsletterData();
  console.log('Newsletter data:', JSON.stringify(testData, null, 2));
  
  const result = await subscribeToNewsletter(testData);
  
  console.log('Newsletter result:', result);
  
  if (!result.success) {
    throw new Error(`Newsletter subscription failed: ${result.message}`);
  }
  
  console.log('✅ Newsletter system working correctly');
  return result;
}

async function testTelegramConfiguration() {
  console.log('💬 Testing Telegram configuration...');
  
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  if (!botToken || !chatId) {
    throw new Error('Telegram configuration missing. Please set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env.local');
  }
  
  console.log('✅ Telegram configuration found');
  console.log(`📱 Bot Token: ${botToken.substring(0, 10)}...`);
  console.log(`💬 Chat ID: ${chatId}`);
  
  // Test basic bot connectivity
  const url = `https://api.telegram.org/bot${botToken}/getMe`;
  const response = await fetch(url);
  const result = await response.json() as any;
  
  if (!result.ok) {
    throw new Error(`Telegram bot test failed: ${result.description}`);
  }
  
  console.log(`✅ Telegram bot connected: ${result.result.first_name} (@${result.result.username})`);
}

async function testEnvironmentVariables() {
  console.log('🔧 Testing environment variables...');
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'TELEGRAM_BOT_TOKEN',
    'TELEGRAM_CHAT_ID'
  ];
  
  const missingVars = [];
  
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    } else {
      console.log(`✅ ${varName}: ${process.env[varName]?.substring(0, 10)}...`);
    }
  }
  
  if (missingVars.length > 0) {
    throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
  }
  
  console.log('✅ All environment variables configured');
}

// Print summary
function printTestSummary() {
  console.log('\n' + '='.repeat(70));
  console.log('🎯 TEST SUMMARY');
  console.log('='.repeat(70));
  
  const totalTests = testResults.length;
  const passedTests = testResults.filter(r => r.success).length;
  const failedTests = totalTests - passedTests;
  
  console.log(`📊 Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (failedTests > 0) {
    console.log('\n❌ FAILED TESTS:');
    console.log('━'.repeat(50));
    testResults
      .filter(r => !r.success)
      .forEach(result => {
        console.log(`❌ ${result.test}: ${result.message}`);
      });
  }
  
  console.log('\n⏱️  PERFORMANCE:');
  console.log('━'.repeat(50));
  testResults.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.test}: ${result.duration}ms`);
  });
  
  console.log('\n' + '='.repeat(70));
  
  if (failedTests === 0) {
    console.log('🎉 ALL TESTS PASSED! Your booking and form systems are working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the errors above and fix the issues.');
  }
}

// Main test execution
async function runAllTests() {
  console.log('🚀 MYSTIC TOURS - COMPREHENSIVE FORM & BOOKING SYSTEM TEST');
  console.log('='.repeat(70));
  console.log(`📅 Test started at: ${new Date().toLocaleString()}`);
  
  // Run all tests
  await runTest('Environment Variables Check', testEnvironmentVariables);
  await runTest('Database Connection', testDatabaseConnection);
  await runTest('Telegram Configuration', testTelegramConfiguration);
  await runTest('Tour Booking System', testTourBookingSystem);
  await runTest('Airport Pickup System', testAirportPickupSystem);
  await runTest('Contact Form System', testContactFormSystem);
  await runTest('Newsletter System', testNewsletterSystem);
  
  // Print summary
  printTestSummary();
  
  console.log('\n📝 NOTES:');
  console.log('• All test notifications sent to Telegram are marked as TEST');
  console.log('• Check your Telegram chat for test notifications');
  console.log('• Test bookings use placeholder data and should be disregarded');
  console.log('• If any tests fail, check the error messages above for guidance');
  
  console.log('\n' + '='.repeat(70));
  console.log('🏁 Test execution completed!');
}

// Execute tests
runAllTests().catch(console.error); 
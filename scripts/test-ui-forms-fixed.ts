#!/usr/bin/env ts-node

/**
 * Fixed UI Form Testing Script
 * Tests all booking forms with correct selectors and verifies confirmation messages
 */

import { chromium, Browser, Page, BrowserContext } from 'playwright';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

interface TestResult {
  form: string;
  success: boolean;
  message: string;
  confirmationFound: boolean;
  error?: any;
  duration?: number;
}

class FixedUIFormTester {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private baseUrl = 'http://localhost:3000';
  private results: TestResult[] = [];

  async initialize() {
    console.log('🚀 Initializing browser for UI testing...\n');
    
    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 1500 // Slower for better visibility
    });
    
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    this.page = await this.context.newPage();
    
    console.log('✅ Browser initialized successfully');
  }

  async testTourBookingForm() {
    if (!this.page) throw new Error('Page not initialized');
    
    console.log('\n🎫 Testing Tour Booking Form...');
    const startTime = Date.now();
    
    try {
      // Navigate to tours page
      await this.page.goto(`${this.baseUrl}/tours`);
      await this.page.waitForLoadState('networkidle');
      console.log('  ✅ Navigated to tours page');
      
      // Find the first tour card and click its "Book Now" link
      const bookNowLink = this.page.locator('a').filter({ hasText: 'Book Now' }).first();
      await bookNowLink.waitFor({ timeout: 10000 });
      console.log('  ✅ Found "Book Now" button');
      
      // Click the link
      await bookNowLink.click();
      console.log('  ✅ Clicked "Book Now" button');
      
      // Wait for the booking page to load
      await this.page.waitForLoadState('networkidle');
      console.log('  ✅ Booking page loaded');
      
      // Fill out the booking form
      await this.page.fill('[name="name"]', 'John Test User');
      await this.page.fill('[name="email"]', 'john.test@example.com');
      await this.page.fill('[name="phone"]', '+1-555-123-4567');
      
      // Select date (tomorrow)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      await this.page.fill('[name="date"]', dateString);
      
      // Select number of guests
      await this.page.selectOption('[name="guests"]', '2');
      
      // Add special requests
      await this.page.fill('[name="specialRequests"]', 'This is a test booking - please disregard');
      
      console.log('  ✅ Form filled out');
      
      // Submit the form
      await this.page.click('button[type="submit"]');
      console.log('  ✅ Form submitted');
      
      // Wait for confirmation (give it more time)
      await this.page.waitForTimeout(3000);
      
      // Look for confirmation dialog or message
      const confirmationFound = await this.checkForConfirmation();
      
      const duration = Date.now() - startTime;
      
      this.results.push({
        form: 'Tour Booking',
        success: true,
        message: 'Form submitted successfully',
        confirmationFound,
        duration
      });
      
      // Take screenshot
      await this.page.screenshot({ path: 'tour-booking-test.png' });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        form: 'Tour Booking',
        success: false,
        message: `Error: ${error}`,
        confirmationFound: false,
        error,
        duration
      });
      console.log(`  ❌ Error: ${error}`);
    }
  }

  async testAirportPickupForm() {
    if (!this.page) throw new Error('Page not initialized');
    
    console.log('\n🚐 Testing Airport Pickup Form...');
    const startTime = Date.now();
    
    try {
      // Navigate to airport pickup page
      await this.page.goto(`${this.baseUrl}/airport-pickup`);
      await this.page.waitForLoadState('networkidle');
      console.log('  ✅ Navigated to airport pickup form');
      
      // Fill out customer information
      await this.page.fill('[name="customer_name"]', 'Jane Test User');
      await this.page.fill('[name="customer_email"]', 'jane.test@example.com');
      await this.page.fill('[name="customer_phone"]', '+1-555-987-6543');
      
      // Select service type (pickup)
      await this.page.click('[value="pickup"]');
      console.log('  ✅ Selected pickup service');
      
      // Wait for pickup-specific fields to appear
      await this.page.waitForTimeout(1000);
      
      // Fill pickup specific fields
      await this.page.fill('[name="flight_number"]', 'AA123');
      
      // Handle date picker
      const dateField = this.page.locator('[name="arrival_date"]');
      if (await dateField.isVisible()) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dateString = tomorrow.toISOString().split('T')[0];
        await dateField.fill(dateString);
      }
      
      await this.page.fill('[name="arrival_time"]', '14:30');
      await this.page.fill('[name="dropoff_location"]', 'Sandals Resort, Montego Bay');
      
      // Select number of passengers
      await this.page.selectOption('[name="passengers"]', '3');
      
      console.log('  ✅ Form filled out');
      
      // Submit the form
      await this.page.click('button[type="submit"]');
      console.log('  ✅ Form submitted');
      
      // Wait for confirmation
      await this.page.waitForTimeout(5000); // Give more time for processing
      
      const confirmationFound = await this.checkForConfirmation();
      
      const duration = Date.now() - startTime;
      
      this.results.push({
        form: 'Airport Pickup',
        success: true,
        message: 'Form submitted successfully',
        confirmationFound,
        duration
      });
      
      // Take screenshot
      await this.page.screenshot({ path: 'airport-pickup-test.png' });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        form: 'Airport Pickup',
        success: false,
        message: `Error: ${error}`,
        confirmationFound: false,
        error,
        duration
      });
      console.log(`  ❌ Error: ${error}`);
    }
  }

  async testContactForm() {
    if (!this.page) throw new Error('Page not initialized');
    
    console.log('\n📝 Testing Contact Form...');
    const startTime = Date.now();
    
    try {
      // Navigate to contact page
      await this.page.goto(`${this.baseUrl}/contact`);
      await this.page.waitForLoadState('networkidle');
      console.log('  ✅ Navigated to contact form');
      
      // Fill out the form
      await this.page.fill('[name="name"]', 'Bob Test User');
      await this.page.fill('[name="email"]', 'bob.test@example.com');
      
      // Select subject
      await this.page.selectOption('[name="subject"]', 'Tour Inquiry');
      
      // Fill message
      await this.page.fill('[name="message"]', 'This is a test message from the UI testing system. Please disregard this inquiry.');
      
      console.log('  ✅ Form filled out');
      
      // Submit the form
      await this.page.click('button[type="submit"]');
      console.log('  ✅ Form submitted');
      
      // Wait for confirmation
      await this.page.waitForTimeout(3000);
      
      const confirmationFound = await this.checkForConfirmation();
      
      const duration = Date.now() - startTime;
      
      this.results.push({
        form: 'Contact Form',
        success: true,
        message: 'Form submitted successfully',
        confirmationFound,
        duration
      });
      
      // Take screenshot
      await this.page.screenshot({ path: 'contact-form-test.png' });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        form: 'Contact Form',
        success: false,
        message: `Error: ${error}`,
        confirmationFound: false,
        error,
        duration
      });
      console.log(`  ❌ Error: ${error}`);
    }
  }

  async testNewsletterForm() {
    if (!this.page) throw new Error('Page not initialized');
    
    console.log('\n📧 Testing Newsletter Form...');
    const startTime = Date.now();
    
    try {
      // Navigate to home page
      await this.page.goto(`${this.baseUrl}`);
      await this.page.waitForLoadState('networkidle');
      console.log('  ✅ Navigated to home page');
      
      // Scroll to footer to find newsletter
      await this.page.keyboard.press('End');
      await this.page.waitForTimeout(1000);
      
      // Look for newsletter email input
      const emailInputs = await this.page.locator('input[type="email"]').all();
      
      if (emailInputs.length === 0) {
        throw new Error('No email input found for newsletter');
      }
      
      // Use the last email input (likely newsletter in footer)
      const emailInput = emailInputs[emailInputs.length - 1];
      await emailInput.fill('newsletter.test@example.com');
      console.log('  ✅ Email filled');
      
      // Look for submit button near the email input
      const submitButtons = await this.page.locator('button').filter({ hasText: /subscribe|sign up|join/i }).all();
      
      if (submitButtons.length > 0) {
        await submitButtons[submitButtons.length - 1].click();
        console.log('  ✅ Form submitted');
      } else {
        // Try pressing Enter
        await emailInput.press('Enter');
        console.log('  ✅ Form submitted with Enter');
      }
      
      // Wait for confirmation
      await this.page.waitForTimeout(3000);
      
      const confirmationFound = await this.checkForConfirmation();
      
      const duration = Date.now() - startTime;
      
      this.results.push({
        form: 'Newsletter',
        success: true,
        message: 'Form submitted successfully',
        confirmationFound,
        duration
      });
      
      // Take screenshot
      await this.page.screenshot({ path: 'newsletter-test.png' });
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.results.push({
        form: 'Newsletter',
        success: false,
        message: `Error: ${error}`,
        confirmationFound: false,
        error,
        duration
      });
      console.log(`  ❌ Error: ${error}`);
    }
  }

  async checkForConfirmation(): Promise<boolean> {
    if (!this.page) return false;
    
    const confirmationSelectors = [
      // Text-based confirmations
      'text=Thank you',
      'text=success',
      'text=submitted',
      'text=received',
      'text=contact you',
      'text=get back to you',
      'text=booking has been',
      'text=subscribed',
      'text=welcome',
      
      // Common confirmation elements
      '[role="dialog"]',
      '[data-testid*="confirmation"]',
      '[data-testid*="success"]',
      '.confirmation',
      '.success',
      '.alert-success',
      
      // Toast notifications
      '[data-sonner-toaster]',
      '[data-sonner-toast]',
      '.toast',
      '.notification',
      
      // Modals
      '.modal',
      '[data-state="open"]'
    ];
    
    let confirmationFound = false;
    let confirmationText = '';
    
    for (const selector of confirmationSelectors) {
      try {
        const element = await this.page.waitForSelector(selector, { timeout: 2000 });
        if (element) {
          confirmationText = await element.textContent() || '';
          if (confirmationText.length > 0) {
            confirmationFound = true;
            console.log(`  ✅ Confirmation found: "${confirmationText.substring(0, 50)}..."`);
            break;
          }
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    
    if (!confirmationFound) {
      console.log('  ⚠️  No confirmation message found');
    }
    
    return confirmationFound;
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('\n🧹 Browser closed');
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(70));
    console.log('🎯 FIXED UI FORM TESTING SUMMARY');
    console.log('='.repeat(70));
    
    const totalTests = this.results.length;
    const successfulTests = this.results.filter(r => r.success).length;
    const testsWithConfirmation = this.results.filter(r => r.confirmationFound).length;
    
    console.log(`📊 Total Forms Tested: ${totalTests}`);
    console.log(`✅ Forms Submitted Successfully: ${successfulTests}`);
    console.log(`🎉 Confirmation Messages Found: ${testsWithConfirmation}`);
    console.log(`📈 Success Rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%`);
    console.log(`💬 Confirmation Rate: ${((testsWithConfirmation / totalTests) * 100).toFixed(1)}%`);
    
    console.log('\n📋 DETAILED RESULTS:');
    console.log('━'.repeat(50));
    
    this.results.forEach(result => {
      const status = result.success ? '✅' : '❌';
      const confirmation = result.confirmationFound ? '🎉' : '⚠️';
      console.log(`${status} ${confirmation} ${result.form}:`);
      console.log(`   Status: ${result.message}`);
      console.log(`   Confirmation: ${result.confirmationFound ? 'Found' : 'Not Found'}`);
      console.log(`   Duration: ${result.duration}ms`);
      console.log('');
    });
    
    console.log('📸 Screenshots saved:');
    console.log('   - tour-booking-test.png');
    console.log('   - airport-pickup-test.png');
    console.log('   - contact-form-test.png');
    console.log('   - newsletter-test.png');
    
    console.log('\n🔍 NEXT STEPS:');
    if (testsWithConfirmation < totalTests) {
      console.log('• Review screenshots to see what confirmation messages appeared');
      console.log('• Check if confirmations are using different selectors than expected');
      console.log('• Verify forms are actually submitting successfully in the browser');
    }
    
    if (testsWithConfirmation === totalTests && successfulTests === totalTests) {
      console.log('🎉 PERFECT! All forms work and show confirmation messages!');
    } else {
      console.log('⚠️  Some forms may need confirmation message improvements');
    }
    
    console.log('\n' + '='.repeat(70));
  }
}

async function runFixedUITests() {
  const tester = new FixedUIFormTester();
  
  try {
    console.log('🚀 MYSTIC TOURS - FIXED UI FORM TESTING SUITE');
    console.log('='.repeat(70));
    console.log('Testing all forms with corrected selectors and enhanced confirmation detection');
    console.log('Browser will open and you can watch the tests run live!');
    console.log('');
    
    await tester.initialize();
    
    // Test all forms
    await tester.testTourBookingForm();
    await tester.testAirportPickupForm();
    await tester.testContactForm();
    await tester.testNewsletterForm();
    
    // Print results
    tester.printSummary();
    
  } catch (error) {
    console.error('❌ Fatal error during testing:', error);
  } finally {
    await tester.cleanup();
  }
}

// Run the tests
runFixedUITests().catch(console.error); 
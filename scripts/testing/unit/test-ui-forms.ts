#!/usr/bin/env ts-node

/**
 * Comprehensive UI Form Testing Script
 * Tests all booking forms and verifies confirmation messages appear in the UI
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

class UIFormTester {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private baseUrl = 'http://localhost:3000';
  private results: TestResult[] = [];

  async initialize() {
    console.log('🚀 Initializing browser for UI testing...\n');
    
    this.browser = await chromium.launch({ 
      headless: false, // Set to true for headless mode
      slowMo: 1000 // Slow down actions for visibility
    });
    
    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 720 }
    });
    
    this.page = await this.context.newPage();
    
    // Listen for console errors
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ Browser Error: ${msg.text()}`);
      }
    });

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
      
      // Find and click first "Book Now" button
      const bookButton = this.page.locator('text=Book Now').first();
      await bookButton.waitFor({ timeout: 10000 });
      await bookButton.click();
      
      // Wait for booking form page to load
      await this.page.waitForURL(/\/book\/.*/, { timeout: 10000 });
      console.log('  ✅ Navigated to booking form');
      
      // Fill out the form
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
      
      // Wait for confirmation message/dialog
      const confirmationSelectors = [
        'text=Thank you for your booking',
        'text=booking has been submitted',
        'text=contact you shortly',
        '[data-testid="booking-confirmation"]',
        '.confirmation-message',
        '.alert-success'
      ];
      
      let confirmationFound = false;
      let confirmationText = '';
      
      for (const selector of confirmationSelectors) {
        try {
          const element = await this.page.waitForSelector(selector, { timeout: 5000 });
          if (element) {
            confirmationText = await element.textContent() || '';
            confirmationFound = true;
            console.log(`  ✅ Confirmation found: "${confirmationText.substring(0, 50)}..."`);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!confirmationFound) {
        // Check for any dialog or modal
        const dialogs = await this.page.locator('[role="dialog"]').count();
        if (dialogs > 0) {
          const dialogText = await this.page.locator('[role="dialog"]').first().textContent();
          confirmationText = dialogText || '';
          confirmationFound = true;
          console.log(`  ✅ Confirmation dialog found: "${confirmationText.substring(0, 50)}..."`);
        }
      }
      
      const duration = Date.now() - startTime;
      
      this.results.push({
        form: 'Tour Booking',
        success: true,
        message: 'Form submitted successfully',
        confirmationFound,
        duration
      });
      
      // Take screenshot for verification
      await this.page.screenshot({ path: 'tour-booking-confirmation.png' });
      
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
      
      // Fill out the form
      await this.page.fill('[name="customer_name"]', 'Jane Test User');
      await this.page.fill('[name="customer_email"]', 'jane.test@example.com');
      await this.page.fill('[name="customer_phone"]', '+1-555-987-6543');
      
      // Select service type
      await this.page.click('[value="pickup"]');
      
      // Fill pickup specific fields
      await this.page.fill('[name="flight_number"]', 'AA123');
      
      // Set arrival date (tomorrow)
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      await this.page.fill('[name="arrival_date"]', dateString);
      
      await this.page.fill('[name="arrival_time"]', '14:30');
      await this.page.fill('[name="dropoff_location"]', 'Sandals Resort, Montego Bay');
      
      // Select number of passengers
      await this.page.selectOption('[name="passengers"]', '3');
      
      console.log('  ✅ Form filled out');
      
      // Submit the form
      await this.page.click('button[type="submit"]');
      console.log('  ✅ Form submitted');
      
      // Wait for confirmation
      const confirmationSelectors = [
        'text=Thank you for your booking',
        'text=contact you shortly',
        'text=pickup has been requested',
        '[data-testid="pickup-confirmation"]',
        '.confirmation-message'
      ];
      
      let confirmationFound = false;
      let confirmationText = '';
      
      for (const selector of confirmationSelectors) {
        try {
          const element = await this.page.waitForSelector(selector, { timeout: 5000 });
          if (element) {
            confirmationText = await element.textContent() || '';
            confirmationFound = true;
            console.log(`  ✅ Confirmation found: "${confirmationText.substring(0, 50)}..."`);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      const duration = Date.now() - startTime;
      
      this.results.push({
        form: 'Airport Pickup',
        success: true,
        message: 'Form submitted successfully',
        confirmationFound,
        duration
      });
      
      // Take screenshot
      await this.page.screenshot({ path: 'airport-pickup-confirmation.png' });
      
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
      await this.page.fill('[name="message"]', 'This is a test message from the UI testing system. Please disregard this inquiry. We are testing the contact form functionality.');
      
      console.log('  ✅ Form filled out');
      
      // Submit the form
      await this.page.click('button[type="submit"]');
      console.log('  ✅ Form submitted');
      
      // Wait for confirmation
      const confirmationSelectors = [
        'text=Thank you for your message',
        'text=get back to you',
        'text=message has been sent',
        '[data-testid="contact-confirmation"]',
        '.success-message'
      ];
      
      let confirmationFound = false;
      let confirmationText = '';
      
      for (const selector of confirmationSelectors) {
        try {
          const element = await this.page.waitForSelector(selector, { timeout: 5000 });
          if (element) {
            confirmationText = await element.textContent() || '';
            confirmationFound = true;
            console.log(`  ✅ Confirmation found: "${confirmationText.substring(0, 50)}..."`);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      const duration = Date.now() - startTime;
      
      this.results.push({
        form: 'Contact Form',
        success: true,
        message: 'Form submitted successfully',
        confirmationFound,
        duration
      });
      
      // Take screenshot
      await this.page.screenshot({ path: 'contact-form-confirmation.png' });
      
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
      // Navigate to home page (newsletter is usually in footer)
      await this.page.goto(`${this.baseUrl}`);
      await this.page.waitForLoadState('networkidle');
      console.log('  ✅ Navigated to home page');
      
      // Look for newsletter form (common selectors)
      const newsletterSelectors = [
        '[name="email"]',
        'input[type="email"]',
        '[placeholder*="email"]',
        '[placeholder*="newsletter"]'
      ];
      
      let emailInput = null;
      for (const selector of newsletterSelectors) {
        try {
          emailInput = await this.page.locator(selector).last(); // Get last one (likely in footer)
          if (await emailInput.isVisible()) {
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      if (!emailInput) {
        throw new Error('Newsletter email input not found');
      }
      
      // Fill email
      await emailInput.fill('newsletter.test@example.com');
      console.log('  ✅ Email filled');
      
      // Find and click submit button near the email input
      const submitButton = this.page.locator('button').filter({ hasText: /subscribe|sign up|join/i }).last();
      await submitButton.click();
      console.log('  ✅ Form submitted');
      
      // Wait for confirmation
      const confirmationSelectors = [
        'text=Thank you for subscribing',
        'text=successfully subscribed',
        'text=welcome to',
        'text=joined our newsletter',
        '[data-testid="newsletter-confirmation"]'
      ];
      
      let confirmationFound = false;
      let confirmationText = '';
      
      for (const selector of confirmationSelectors) {
        try {
          const element = await this.page.waitForSelector(selector, { timeout: 5000 });
          if (element) {
            confirmationText = await element.textContent() || '';
            confirmationFound = true;
            console.log(`  ✅ Confirmation found: "${confirmationText.substring(0, 50)}..."`);
            break;
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      const duration = Date.now() - startTime;
      
      this.results.push({
        form: 'Newsletter',
        success: true,
        message: 'Form submitted successfully',
        confirmationFound,
        duration
      });
      
      // Take screenshot
      await this.page.screenshot({ path: 'newsletter-confirmation.png' });
      
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

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      console.log('\n🧹 Browser closed');
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(70));
    console.log('🎯 UI FORM TESTING SUMMARY');
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
    console.log('   - tour-booking-confirmation.png');
    console.log('   - airport-pickup-confirmation.png');
    console.log('   - contact-form-confirmation.png');
    console.log('   - newsletter-confirmation.png');
    
    if (testsWithConfirmation === totalTests && successfulTests === totalTests) {
      console.log('\n🎉 ALL TESTS PASSED! All forms work and show confirmation messages.');
    } else {
      console.log('\n⚠️  Some tests failed or confirmations missing. Check the details above.');
    }
    
    console.log('\n' + '='.repeat(70));
  }
}

async function runUITests() {
  const tester = new UIFormTester();
  
  try {
    console.log('🚀 MYSTIC TOURS - UI FORM TESTING SUITE');
    console.log('='.repeat(70));
    console.log('This will test all forms in the browser and verify confirmation messages appear');
    console.log('Make sure your development server is running on http://localhost:3000');
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
runUITests().catch(console.error); 
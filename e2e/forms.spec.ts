import { test, expect } from '@playwright/test';

test.describe('Forms E2E', () => {
  test('Tour Booking Form submits successfully', async ({ page }) => {
    await page.goto('/tours/roots-culture-experience');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="date"]', '2099-12-31');
    await page.selectOption('select[name="guests"]', '2');
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.fill('input[name="phone"]', '+1 (555) 123-4567');
    await page.fill('textarea[name="specialRequests"]', 'No special requests.');
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    await expect(page.locator('p').filter({ hasText: 'Booking Request Received!' })).toBeVisible({ timeout: 10000 });
  });

  test('Contact Form submits successfully', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'testuser@example.com');
    await page.selectOption('select[name="subject"]', 'Tour Inquiry');
    await page.fill('textarea[name="message"]', 'This is a test message.');
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    await expect(page.locator('text=Thank you for your message!')).toBeVisible({ timeout: 10000 });
  });

  test('Newsletter Form submits successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for newsletter form specifically
    const newsletterSection = page.locator('section').filter({ hasText: 'Join Our Tribe' });
    await newsletterSection.locator('input[type="email"]').fill('newslettertest@example.com');
    await newsletterSection.locator('button[type="submit"]').click();
    
    await page.waitForTimeout(3000);
    await expect(page.locator('text=🌴 Welcome to the tribe!')).toBeVisible({ timeout: 10000 });
  });

  test('Airport Pickup Form submits successfully', async ({ page }) => {
    await page.goto('/airport-pickup');
    await page.waitForLoadState('networkidle');
    
    // Fill customer information using placeholder text to find inputs
    await page.fill('input[placeholder="John Doe"]', 'Test User');
    await page.fill('input[placeholder="john.doe@example.com"]', 'pickup@example.com');
    await page.fill('input[placeholder="So we can contact you if needed"]', '+1 (555) 123-4567');
    
    // Fill number of passengers
    await page.fill('input[type="number"]', '2');
    
    // Select pickup service type by clicking the label
    await page.click('label:has-text("Airport Pickup")');
    
    // Wait for pickup fields to appear
    await page.waitForTimeout(1000);
    
    // Fill pickup-specific fields using placeholders
    await page.fill('input[placeholder="e.g., AA1234"]', 'AA123');
    await page.fill('input[placeholder="e.g., Villa, Airbnb, Private Residence"]', 'Hotel Paradise');
    
    // Click the date picker button and select a date
    await page.click('button:has-text("Pick a date")');
    await page.waitForTimeout(500);
    // Click on a future date (assuming calendar opens to current month)
    await page.locator('button[name="day"]:not([disabled])').first().click();
    
    // Fill arrival time
    await page.fill('input[type="time"]', '14:00');
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(5000); // Airport pickup may take longer to process
    
    // Look for the confirmation dialog that appears after successful submission
    await expect(page.locator('div[role="dialog"]')).toBeVisible({ timeout: 15000 });
  });
}); 
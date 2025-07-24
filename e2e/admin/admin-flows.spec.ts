import { test, expect } from '@playwright/test';

test.describe('Admin/Dispatch Flows', () => {
  test('Add, edit, and delete a driver', async ({ page }) => {
    await page.goto('/mt-operations/drivers');
    await page.waitForLoadState('networkidle');
    // Add driver
    await page.click('button:has-text("+ Add Driver")');
    await expect(page.locator('h2').filter({ hasText: 'Add Driver' })).toBeVisible();
    await page.fill('input[name="name"]', 'Playwright Driver');
    await page.fill('input[name="phone"]', '555-0000');
    await page.fill('input[name="email"]', 'pwdriver@example.com');
    await page.fill('input[name="vehicle"]', 'Test Car');
    await page.selectOption('select[name="status"]', 'available');
    await page.click('button[type="submit"]:has-text("Add Driver")');
    // Wait for the driver card with the unique email to appear
    const driverCard = page.locator('div.text-sm', { hasText: 'pwdriver@example.com' }).first();
    await expect(driverCard).toBeVisible();
    // Edit driver
    await page.click('button[aria-label="Edit driver"]:near(:text("pwdriver@example.com"))');
    await expect(page.locator('h2').filter({ hasText: 'Edit Driver' })).toBeVisible();
    await page.fill('input[name="vehicle"]', 'Updated Car');
    await page.click('button[type="submit"]:has-text("Save Changes")');
    // Wait for the updated vehicle text to appear in the same card
    const updatedCard = page.locator('div.text-sm', { hasText: 'pwdriver@example.com' }).locator('xpath=..').locator('div', { hasText: 'Vehicle: Updated Car' });
    await expect(updatedCard).toBeVisible();
    // Delete driver
    await page.click('button[aria-label="Delete driver"]:near(:text("pwdriver@example.com"))');
    await expect(page.locator('button:has-text("Delete")')).toBeVisible();
    await page.click('button:has-text("Delete")');
    // Wait for the driver card to disappear
    await expect(page.locator('div.text-sm', { hasText: 'pwdriver@example.com' })).toHaveCount(0);
  });

  test('Create, confirm, and assign driver to a tour booking', async ({ page }) => {
    await page.goto('/mt-operations/bookings');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("New Booking")');
    await page.click('button:has-text("Tour Booking")');
    await page.selectOption('select[name="tour_id"]', { index: 1 });
    await page.fill('input[name="customer_name"]', 'Tour Admin Test');
    await page.fill('input[name="customer_email"]', 'touradmin@example.com');
    await page.fill('input[name="customer_phone"]', '555-1111');
    await page.fill('input[name="booking_date"]', '2099-12-31');
    await page.fill('input[name="number_of_people"]', '2');
    await page.click('button[type="submit"]:has-text("Create")');
    // Wait for the booking row with the unique email to appear
    const bookingRow = page.locator('td', { hasText: 'touradmin@example.com' }).first();
    await expect(bookingRow).toBeVisible();
    // Confirm & assign driver
    await page.click('button:has-text("Confirm & Assign Driver"):near(:text("touradmin@example.com"))');
    await page.selectOption('select', { index: 1 });
    await page.click('button:has-text("Assign & Confirm")');
    // Wait for the confirmation message
    await expect(page.locator('div', { hasText: 'Driver assigned and booking confirmed.' })).toBeVisible();
  });

  test('Create, confirm, and assign driver to an airport booking', async ({ page }) => {
    await page.goto('/mt-operations/bookings');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("New Booking")');
    await page.click('button:has-text("Airport Transfer")');
    await page.fill('input[name="customer_name"]', 'Airport Admin Test');
    await page.fill('input[name="customer_email"]', 'airportadmin@example.com');
    await page.fill('input[name="customer_phone"]', '555-2222');
    await page.selectOption('select[name="service_type"]', 'pickup');
    await page.fill('input[name="passengers"]', '2');
    await page.fill('input[name="flight_number"]', 'AA123');
    await page.fill('input[name="arrival_date"]', '2099-12-31');
    await page.fill('input[name="arrival_time"]', '14:00');
    await page.fill('input[name="dropoff_location"]', 'Hotel Test');
    await page.click('button[type="submit"]:has-text("Create")');
    await expect(page.locator('div').filter({ hasText: 'Airport Admin Test' })).toBeVisible();
    // Confirm & assign driver
    await page.click('button:has-text("Confirm & Assign Driver"):near(:text("Airport Admin Test"))');
    await page.selectOption('select', { index: 1 });
    await page.click('button:has-text("Assign & Confirm")');
    await expect(page.locator('div').filter({ hasText: 'Driver assigned and booking confirmed.' })).toBeVisible();
  });

  test('Verify assignment appears in calendar', async ({ page }) => {
    await page.goto('/mt-operations/assignments-calendar');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(12000); // Wait for SWR auto-refresh
    await expect(page.locator('.rbc-event').first()).toBeVisible();
  });

  test('Driver assignments auto-refresh in modal', async ({ page }) => {
    await page.goto('/mt-operations/drivers');
    await page.waitForLoadState('networkidle');
    // Open first driver modal
    await page.click('button[aria-label="Edit driver"]');
    await expect(page.locator('h3').filter({ hasText: 'Assignments' })).toBeVisible();

    // Wait up to 20s for the assignments list to be visible
    const assignmentsList = page.locator('h3:has-text("Assignments") + ul');
    await expect(assignmentsList).toBeVisible({ timeout: 20000 });

    // Wait for at least one assignment or the empty message
    await expect(
      assignmentsList.locator('li, text=No assignments found.')
    ).toHaveCount(1, { timeout: 20000 });
  });
}); 
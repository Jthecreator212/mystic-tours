import { expect, test } from '@playwright/test';

test.describe('Tour Admin Functions', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication by setting cookies directly
    await page.context().addCookies([
      {
        name: 'admin-auth',
        value: 'true',
        domain: 'localhost',
        path: '/',
      }
    ]);
    
    // Navigate directly to tours page
    await page.goto('/mt-operations/tours');
    await page.waitForLoadState('networkidle');
  });

  test('should list all tours', async ({ page }) => {
    // Check if tours are displayed
    await expect(page.locator('h2:has-text("Tour Management")')).toBeVisible();
    
    // Check if tour table is present
    const tourTable = page.locator('table');
    await expect(tourTable).toBeVisible();
    
    // Check if at least one tour is displayed
    const tourRows = page.locator('tbody tr');
    await expect(tourRows.first()).toBeVisible();
    
    console.log('✅ Tour listing is working');
  });

  test('should view tour details', async ({ page }) => {
    // Click on the first tour's view button
    const firstViewButton = page.locator('tbody tr').first().locator('button[title="View Tour"]');
    await firstViewButton.click();
    
    // Check if tour details modal/dialog appears
    await expect(page.locator('h2:has-text("Tour Details")')).toBeVisible();
    
    // Check for tour information
    await expect(page.locator('text=Price')).toBeVisible();
    await expect(page.locator('text=Duration')).toBeVisible();
    
    // Close the view dialog
    const closeButton = page.locator('button:has-text("Close")').or(page.locator('button[aria-label="Close"]'));
    await closeButton.click();
    
    console.log('✅ Tour viewing is working');
  });

  test('should add new tour', async ({ page }) => {
    // Click add new tour button
    await page.click('button:has-text("Add New Tour")');
    
    // Wait for tour form to appear
    await expect(page.locator('h2:has-text("Add New Tour")')).toBeVisible();
    
    // Fill in tour details
    await page.fill('input[name="name"]', 'Test Tour - Playwright');
    await page.fill('input[name="slug"]', 'test-tour-playwright');
    await page.fill('textarea[name="short_description"]', 'A test tour created by Playwright');
    await page.fill('textarea[name="description"]', 'This is a comprehensive test tour created by Playwright to verify all admin functions are working properly.');
    await page.fill('input[name="price"]', '199.99');
    await page.fill('input[name="duration"]', 'Full Day (8 Hours)');
    await page.fill('input[name="max_passengers"]', '10');
    await page.fill('input[name="min_passengers"]', '1');
    
    // Select category
    await page.selectOption('select[name="category"]', 'Adventure');
    
    // Select difficulty
    await page.selectOption('select[name="difficulty"]', 'easy');
    
    // Select status
    await page.selectOption('select[name="status"]', 'draft');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait for success message or redirect
    await expect(page.locator('text=Tour created successfully')).toBeVisible();
    
    console.log('✅ Tour creation is working');
  });

  test('should edit existing tour', async ({ page }) => {
    // Click on the first tour's edit button
    const firstEditButton = page.locator('tbody tr').first().locator('button[title="Edit Tour"]');
    await firstEditButton.click();
    
    // Wait for edit form to appear
    await expect(page.locator('h2:has-text("Edit Tour")')).toBeVisible();
    
    // Update tour name
    const nameInput = page.locator('input[name="name"]');
    const currentName = await nameInput.inputValue();
    const newName = `${currentName} - Updated`;
    await nameInput.fill(newName);
    
    // Update price
    await page.fill('input[name="price"]', '299.99');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(page.locator('text=Tour updated successfully')).toBeVisible();
    
    console.log('✅ Tour editing is working');
  });

  test('should delete tour', async ({ page }) => {
    // Get the number of tours before deletion
    const tourRowsBefore = page.locator('tbody tr');
    const countBefore = await tourRowsBefore.count();
    
    if (countBefore === 0) {
      console.log('⚠️ No tours available for deletion test');
      return;
    }
    
    // Click on the first tour's delete button
    const firstDeleteButton = page.locator('tbody tr').first().locator('button[title="Delete Tour"]');
    await firstDeleteButton.click();
    
    // Handle confirmation dialog
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });
    
    // Wait for the tour to be removed from the list
    await expect(page.locator('tbody tr')).toHaveCount(countBefore - 1);
    
    // Check for success message
    await expect(page.locator('text=Tour deleted successfully')).toBeVisible();
    
    console.log('✅ Tour deletion is working');
  });

  test('should handle delete cancellation', async ({ page }) => {
    // Get the number of tours before attempting deletion
    const tourRowsBefore = page.locator('tbody tr');
    const countBefore = await tourRowsBefore.count();
    
    if (countBefore === 0) {
      console.log('⚠️ No tours available for deletion cancellation test');
      return;
    }
    
    // Click on the first tour's delete button
    const firstDeleteButton = page.locator('tbody tr').first().locator('button[title="Delete Tour"]');
    await firstDeleteButton.click();
    
    // Handle confirmation dialog - cancel this time
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      await dialog.dismiss();
    });
    
    // Verify tour count remains the same
    await expect(page.locator('tbody tr')).toHaveCount(countBefore);
    
    console.log('✅ Tour deletion cancellation is working');
  });

  test('should display proper error messages', async ({ page }) => {
    // Try to access a non-existent tour
    await page.goto('/mt-operations/tours/00000000-0000-0000-0000-000000000000');
    
    // Should show error message
    await expect(page.locator('text=Tour not found')).toBeVisible();
    
    console.log('✅ Error handling is working');
  });

  test('should handle form validation', async ({ page }) => {
    // Click add new tour button
    await page.click('button:has-text("Add New Tour")');
    
    // Try to submit without required fields
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('text=Tour name is required')).toBeVisible();
    
    console.log('✅ Form validation is working');
  });
}); 
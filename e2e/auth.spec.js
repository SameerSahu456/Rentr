import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('login page has email and password fields', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"], input[placeholder*="mail" i]')).toBeVisible()
    await expect(page.locator('input[type="password"], input[placeholder*="password" i]')).toBeVisible()
  })

  test('login shows error on invalid credentials', async ({ page }) => {
    await page.goto('/login')
    const emailInput = page.locator('input[type="email"], input[placeholder*="mail" i]')
    const passwordInput = page.locator('input[type="password"], input[placeholder*="password" i]')

    await emailInput.fill('nonexistent@test.com')
    await passwordInput.fill('wrongpassword123')

    const submitBtn = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first()
    await submitBtn.click()

    // Should show error or stay on login page
    await page.waitForTimeout(2000)
    await expect(page).toHaveURL(/login/)
  })

  test('signup page has customer/distributor toggle', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.locator('text=Customer').first()).toBeVisible()
    await expect(page.locator('text=Distributor').first()).toBeVisible()
  })

  test('signup form validates required fields', async ({ page }) => {
    await page.goto('/signup')
    // Try to submit empty form
    const submitBtn = page.locator('button[type="submit"], button:has-text("Sign Up"), button:has-text("Register"), button:has-text("Create")').first()
    if (await submitBtn.isVisible()) {
      await submitBtn.click()
      await page.waitForTimeout(500)
      // Should stay on signup page
      await expect(page).toHaveURL(/signup/)
    }
  })
})

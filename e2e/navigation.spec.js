import { test, expect } from '@playwright/test'

test.describe('Navigation & Page Loading', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/RENTR|Rentr|Vite/)
    await expect(page.locator('nav')).toBeVisible()
  })

  test('navbar renders with logo and search', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.getByPlaceholder('What are you looking for?')).toBeVisible()
  })

  test('footer is present', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('footer')).toBeVisible()
  })

  test('navigate to search page', async ({ page }) => {
    await page.goto('/search')
    await expect(page.locator('text=Products found')).toBeVisible()
  })

  test('navigate to login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page.locator('input[type="email"], input[placeholder*="mail"]')).toBeVisible()
  })

  test('navigate to signup page', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.locator('text=Customer').first()).toBeVisible()
  })

  test('navigate to about page', async ({ page }) => {
    await page.goto('/about')
    await expect(page).toHaveURL('/about')
  })

  test('navigate to benefits page', async ({ page }) => {
    await page.goto('/benefits')
    await expect(page).toHaveURL('/benefits')
  })

  test('navigate to build your own page', async ({ page }) => {
    await page.goto('/build-your-own')
    await expect(page).toHaveURL('/build-your-own')
  })

  test('policy pages load', async ({ page }) => {
    const policyRoutes = [
      '/privacy-policy',
      '/rental-terms',
      '/shipping-policy',
      '/cancellation-return',
      '/kyc',
      '/corporate-enquiries',
      '/referral-terms',
    ]
    for (const route of policyRoutes) {
      await page.goto(route)
      await expect(page).toHaveURL(route)
    }
  })
})

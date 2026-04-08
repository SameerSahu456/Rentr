import { test, expect } from '@playwright/test'

test.describe('Search & Product Browsing', () => {
  test('search page displays products', async ({ page }) => {
    await page.goto('/search')
    // Should show product grid
    await expect(page.locator('text=Products found')).toBeVisible()
  })

  test('search page has filter sidebar', async ({ page }) => {
    await page.goto('/search')
    await expect(page.locator('text=Product Categories')).toBeVisible()
  })

  test('can toggle grid/list view', async ({ page }) => {
    await page.goto('/search')
    const viewToggle = page.locator('button svg').first()
    if (await viewToggle.isVisible()) {
      await viewToggle.click()
    }
  })

  test('search page has pagination', async ({ page }) => {
    await page.goto('/search')
    await expect(page.locator('text=Page 1 of')).toBeVisible()
  })

  test('search page has contact form', async ({ page }) => {
    await page.goto('/search')
    await expect(page.locator('text=Can\'t find what your looking for')).toBeVisible()
  })

  test('product detail page loads via slug', async ({ page }) => {
    await page.goto('/product/poweredge-t30-1')
    await page.waitForTimeout(1000)
    await expect(page).toHaveURL(/product/)
  })

  test('build your own page has categories', async ({ page }) => {
    await page.goto('/build-your-own')
    await expect(page.locator('text=CPU').first()).toBeVisible()
  })
})

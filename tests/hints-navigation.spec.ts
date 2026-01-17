import { expect, test } from '@nuxt/test-utils/playwright'
import { enableHints, skipTutorial } from './fixtures/puzzle'

test.describe('Hints Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await skipTutorial(page)
    await enableHints(page)
  })

  test('displays all hint carousel indicators on mobile', async ({ page, goto }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle to load
    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Should have 4 carousel indicators (word grid, pairs, popularity, found words)
    const indicators = page.getByRole('tablist').getByRole('tab')
    await expect(indicators).toHaveCount(4)

    // First indicator should be selected by default
    await expect(indicators.first()).toHaveAttribute('aria-selected', 'true')
  })

  test('can navigate hints carousel using dot indicators', async ({ page, goto }) => {
    // Set mobile viewport for carousel mode
    await page.setViewportSize({ width: 375, height: 667 })
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle to load
    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    const indicators = page.getByRole('tablist').getByRole('tab')
    await expect(indicators).toHaveCount(4)

    // Click second indicator (pairs grid)
    await indicators.nth(1).click()
    await expect(indicators.nth(1)).toHaveAttribute('aria-selected', 'true')

    // Click third indicator (popularity grid)
    await indicators.nth(2).click()
    await expect(indicators.nth(2)).toHaveAttribute('aria-selected', 'true')

    // Click fourth indicator (found words)
    await indicators.nth(3).click()
    await expect(indicators.nth(3)).toHaveAttribute('aria-selected', 'true')

    // Go back to first
    await indicators.first().click()
    await expect(indicators.first()).toHaveAttribute('aria-selected', 'true')
  })

  test('can navigate hints carousel using keyboard arrows', async ({ page, goto }) => {
    // Set mobile viewport for carousel mode
    await page.setViewportSize({ width: 375, height: 667 })
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle to load
    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Focus the carousel region
    const carousel = page.getByRole('region', { name: /word hints carousel/i })
    await carousel.focus()

    const indicators = page.getByRole('tablist').getByRole('tab')

    // Press right arrow to go to next slide
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(400) // Wait for scroll animation
    await expect(indicators.nth(1)).toHaveAttribute('aria-selected', 'true')

    // Press right arrow again
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(400)
    await expect(indicators.nth(2)).toHaveAttribute('aria-selected', 'true')

    // Press left arrow to go back
    await page.keyboard.press('ArrowLeft')
    await page.waitForTimeout(400)
    await expect(indicators.nth(1)).toHaveAttribute('aria-selected', 'true')
  })

  test('shows word grid content on first slide', async ({ page, goto }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle to load
    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Word grid should be visible (first slide) - check for carousel region
    const carousel = page.getByRole('region', { name: /word hints carousel/i })
    await expect(carousel).toBeVisible()

    // First tab should be selected
    const firstTab = page.getByRole('tab', { name: /word grid/i })
    await expect(firstTab).toHaveAttribute('aria-selected', 'true')
  })

  test('shows all hint sections on desktop (grid layout)', async ({ page, goto }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 })
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle to load
    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // On desktop, carousel indicators should be hidden
    const tablist = page.getByRole('tablist', { name: /carousel navigation/i })
    await expect(tablist).not.toBeVisible()

    // The hints region should still be visible
    const hintsRegion = page.getByRole('region', { name: /word hints carousel/i })
    await expect(hintsRegion).toBeVisible()
  })
})

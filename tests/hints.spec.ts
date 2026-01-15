import { expect, test } from '@nuxt/test-utils/playwright'

test.describe('Hints Feature', () => {
  test.beforeEach(async ({ page }) => {
    // Skip tutorial for all tests
    await page.addInitScript(() => {
      localStorage.setItem('pangrum-tutorial-seen', 'true')
    })
  })

  test('popularity grid is visible when hints enabled', async ({ page, goto }) => {
    // Pre-enable hints
    await page.addInitScript(() => {
      localStorage.setItem('pangrum-hints-enabled', 'true')
    })

    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle data to load
    const centreButton = page.locator('.centre-letter')
    await expect(centreButton).toBeVisible()

    // Hints should be enabled
    await expect(page.getByRole('button', { name: /hints on/i })).toBeVisible()

    // The popularity grid should be in the carousel (as 3rd slide)
    // On mobile, we need to swipe or navigate to it
    // On desktop, it should be visible in the grid layout
    await expect(page.getByText('Word Popularity')).toBeVisible({ timeout: 10000 })
  })

  test('hints are hidden by default', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle data to load
    const centreButton = page.locator('.centre-letter')
    await expect(centreButton).toBeVisible()

    // Should show the "Make a guess to get started" message (hints disabled by default)
    await expect(page.getByText('Make a guess to get started')).toBeVisible()

    // Hints button should show "off" state
    await expect(page.getByRole('button', { name: /hints off/i })).toBeVisible()
  })

  test('can toggle hints button state', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle data to load
    const centreButton = page.locator('.centre-letter')
    await expect(centreButton).toBeVisible()

    // Find and click the hints toggle button (shows "Hints off" initially)
    const hintsOffButton = page.getByRole('button', { name: /hints off/i })
    await expect(hintsOffButton).toBeVisible()
    await hintsOffButton.click()

    // After clicking, button should show "Hints on"
    await expect(page.getByRole('button', { name: /hints on/i })).toBeVisible()
  })

  test('hints toggle persists state in localStorage', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle data
    const centreButton = page.locator('.centre-letter')
    await expect(centreButton).toBeVisible()

    // Enable hints by clicking the toggle
    const hintsButton = page.getByRole('button', { name: /hints off/i })
    await hintsButton.click()

    // Verify hints button now shows "on" state
    await expect(page.getByRole('button', { name: /hints on/i })).toBeVisible()

    // Verify hints are now enabled in localStorage
    const hintsEnabled = await page.evaluate(() => localStorage.getItem('pangrum-hints-enabled'))
    expect(hintsEnabled).toBe('true')
  })
})

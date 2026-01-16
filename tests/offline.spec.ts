import { expect, test } from '@nuxt/test-utils/playwright'

test.describe('Offline Mode', () => {
  test.beforeEach(async ({ page }) => {
    // Skip tutorial for all tests
    await page.addInitScript(() => {
      localStorage.setItem('pangrum-tutorial-seen', 'true')
    })
  })

  test('shows offline indicator when network is disconnected', async ({ page, goto, context }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle data to load first
    const centreButton = page.locator('.centre-letter')
    await expect(centreButton).toBeVisible()

    // Verify we're online first (no offline indicator)
    await expect(page.getByText('offline')).not.toBeVisible()

    // Go offline
    await context.setOffline(true)

    // Should show offline indicator in the header
    await expect(page.getByText('offline')).toBeVisible()

    // Go back online
    await context.setOffline(false)

    // Offline indicator should disappear
    await expect(page.getByText('offline')).not.toBeVisible()
  })

  test('date picker correctly styles calendar days based on availability', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle data to load
    const centreButton = page.locator('.centre-letter')
    await expect(centreButton).toBeVisible()

    // Open the date picker (use button with "Select puzzle date" label)
    const datePickerButton = page.getByRole('button', { name: /select puzzle date/i }).first()
    await expect(datePickerButton).toBeVisible()
    await datePickerButton.click()

    // The date picker popover should be visible
    const popover = page.locator('.popover')
    await expect(popover).toBeVisible()

    // Day buttons should be present
    const dayButtons = popover.locator('button.day-button')
    await expect(dayButtons.first()).toBeVisible()

    // Verify today's button exists with proper styling
    const todayHighlight = popover.locator('button.day-button.bg-primary-subtle, button.day-button.bg-primary')
    const hasHighlight = await todayHighlight.count()
    expect(hasHighlight).toBeGreaterThanOrEqual(1)
  })

  test('settings menu shows puzzle language options', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle data to load
    const centreButton = page.locator('.centre-letter')
    await expect(centreButton).toBeVisible()

    // Open the settings menu (use first visible button)
    const settingsButton = page.getByRole('button', { name: /settings/i }).first()
    await expect(settingsButton).toBeVisible()
    await settingsButton.click()

    // Click on puzzle language option (labeled as "Word List" in en.json)
    const puzzleLanguageButton = page.getByRole('button', { name: /word list/i })
    await expect(puzzleLanguageButton).toBeVisible()
    await puzzleLanguageButton.click()

    // Language options should be visible
    await expect(page.getByText('English (US)')).toBeVisible()
    await expect(page.getByText('Deutsch')).toBeVisible()
    await expect(page.getByText('Français')).toBeVisible()
  })
})

import { expect, test } from '@nuxt/test-utils/playwright'
import { skipTutorial } from './fixtures/puzzle'

test.describe('Offline Mode', () => {
  test.beforeEach(async ({ page }) => {
    await skipTutorial(page)
  })

  test('shows offline indicator when network is disconnected', async ({ page, goto, context }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle data to load first
    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

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

  test('date picker correctly shows calendar', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle data to load
    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Open the date picker
    const datePickerButton = page.getByRole('button', { name: /select puzzle date/i }).first()
    await expect(datePickerButton).toBeVisible()
    await datePickerButton.click()

    // The date picker should show day buttons for navigation
    // Look for month navigation buttons
    const prevMonthButton = page.getByRole('button', { name: /previous month/i })
    const nextMonthButton = page.getByRole('button', { name: /next month/i })

    await expect(prevMonthButton).toBeVisible()
    await expect(nextMonthButton).toBeVisible()
  })

  test('settings menu shows puzzle language options', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle data to load
    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Open the settings menu
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

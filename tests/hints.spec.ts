import { expect, test } from '@nuxt/test-utils/playwright'
import { enableHints, mockPuzzleApi, skipTutorial } from './fixtures/puzzle'

test.describe('Hints Feature', () => {
  test.beforeEach(async ({ page }) => {
    await skipTutorial(page)
    await mockPuzzleApi(page)
  })

  test('popularity grid is visible when hints enabled', async ({ page, goto }) => {
    await enableHints(page)

    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle to load
    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Hints should be enabled
    await expect(page.getByRole('button', { name: /hints on/i })).toBeVisible()

    // The popularity grid shows a message when no data is available
    await expect(page.getByText('Popularity data will appear')).toBeVisible({ timeout: 10000 })
  })

  test('hints are hidden by default', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle to load
    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Should show the "Make a guess to get started" message (hints disabled by default)
    await expect(page.getByText('Make a guess to get started')).toBeVisible()

    // Hints button should show "off" state
    await expect(page.getByRole('button', { name: /hints off/i })).toBeVisible()
  })

  test('can toggle hints button state', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle to load
    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Find and click the hints toggle button (shows "Hints off" initially)
    const hintsOffButton = page.getByRole('button', { name: /hints off/i })
    await expect(hintsOffButton).toBeVisible()
    await hintsOffButton.click()

    // After clicking, button should show "Hints on"
    await expect(page.getByRole('button', { name: /hints on/i })).toBeVisible()
  })

  test('hints toggle persists state in localStorage', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle to load
    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

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

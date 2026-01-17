import { expect, test } from '@nuxt/test-utils/playwright'
import { skipTutorial } from './fixtures/puzzle'

test.describe('Settings Menu', () => {
  test.beforeEach(async ({ page }) => {
    await skipTutorial(page)
  })

  test('settings menu opens and closes', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle data to load
    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Find settings button
    const settingsButton = page.getByRole('button', { name: /settings/i }).first()
    await expect(settingsButton).toBeVisible()

    // Open settings
    await settingsButton.click()

    // Settings section should be visible (contains Theme option)
    const themeOption = page.getByRole('button', { name: /theme/i })
    await expect(themeOption).toBeVisible()

    // Close by clicking outside (on the body)
    await page.click('body', { position: { x: 10, y: 10 } })
    await expect(themeOption).not.toBeVisible()
  })

  test('can change theme to light mode', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle data to load
    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Open settings
    const settingsButton = page.getByRole('button', { name: /settings/i }).first()
    await settingsButton.click()

    // Click on theme option
    const themeButton = page.getByRole('button', { name: /theme/i })
    await themeButton.click()

    // Select light mode
    const lightButton = page.getByRole('button', { name: /light/i })
    await lightButton.click()

    // Verify theme changed (check html attribute)
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  })

  test('can change theme to dark mode', async ({ page, goto }) => {
    // Start with light mode
    await page.addInitScript(() => {
      localStorage.setItem('nuxt-color-mode', 'light')
    })

    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle data to load
    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Open settings > theme
    const settingsButton = page.getByRole('button', { name: /settings/i }).first()
    await settingsButton.click()

    const themeButton = page.getByRole('button', { name: /theme/i })
    await themeButton.click()

    // Select dark mode
    const darkButton = page.getByRole('button', { name: /dark/i })
    await darkButton.click()

    // Verify theme changed
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  })

  test('can navigate to UI language settings', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle data to load
    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Open settings
    const settingsButton = page.getByRole('button', { name: /settings/i }).first()
    await settingsButton.click()

    // Click on Interface option (UI language)
    const interfaceButton = page.getByRole('button', { name: /interface/i })
    await interfaceButton.click()

    // Should see language options
    await expect(page.getByRole('button', { name: /english/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /deutsch/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /français/i })).toBeVisible()
  })

  test('can change UI language', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle data to load
    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Open settings > interface
    const settingsButton = page.getByRole('button', { name: /settings/i }).first()
    await settingsButton.click()

    const interfaceButton = page.getByRole('button', { name: /interface/i })
    await interfaceButton.click()

    // Select German
    const germanButton = page.getByRole('button', { name: /deutsch/i })
    await germanButton.click()

    // Settings title should now be in German - reopen settings to check
    await settingsButton.click()
    // Look for the settings section header (the second one is the section title)
    await expect(page.getByText('Einstellungen').first()).toBeVisible()
  })

  test('can navigate back from sub-sections', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle data to load
    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Open settings > theme
    const settingsButton = page.getByRole('button', { name: /settings/i }).first()
    await settingsButton.click()

    const themeButton = page.getByRole('button', { name: /theme/i })
    await themeButton.click()

    // Find and click back button (it's a button with a chevron icon)
    // The back button navigates to the previous section
    const backButton = page.getByRole('button').filter({ has: page.locator('[class*="chevron-left"]') })
    await backButton.click()

    // Should be back on main settings menu
    await expect(page.getByRole('button', { name: /theme/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /sync/i })).toBeVisible()
  })

  test('can start tutorial from settings', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle data to load
    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Open settings
    const settingsButton = page.getByRole('button', { name: /settings/i }).first()
    await settingsButton.click()

    // Click "How to play"
    const tutorialButton = page.getByRole('button', { name: /how to play/i })
    await tutorialButton.click()

    // Tutorial dialog should appear
    const tutorialDialog = page.getByRole('dialog')
    await expect(tutorialDialog).toBeVisible()
  })

  test('closes settings when escape is pressed', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle data to load
    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Open settings
    const settingsButton = page.getByRole('button', { name: /settings/i }).first()
    await settingsButton.click()

    // Settings section should be visible
    const themeOption = page.getByRole('button', { name: /theme/i })
    await expect(themeOption).toBeVisible()

    // Press Escape
    await page.keyboard.press('Escape')

    // Settings should close
    await expect(themeOption).not.toBeVisible()
  })

  test('shows credits in settings footer', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle data to load
    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Open settings
    const settingsButton = page.getByRole('button', { name: /settings/i }).first()
    await settingsButton.click()

    // Should show credits
    await expect(page.getByText('daniel roe')).toBeVisible()
  })
})

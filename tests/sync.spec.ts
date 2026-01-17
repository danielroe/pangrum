import { expect, test } from '@nuxt/test-utils/playwright'
import { skipTutorial } from './fixtures/puzzle'

test.describe('Sync Feature', () => {
  test.beforeEach(async ({ page }) => {
    await skipTutorial(page)
  })

  test('sync settings shows in settings menu', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle to load
    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Open settings menu
    const settingsButton = page.getByRole('button', { name: /settings/i }).first()
    await expect(settingsButton).toBeVisible()
    await settingsButton.click()

    // Should see sync option button
    const syncButton = page.getByRole('button', { name: /sync/i })
    await expect(syncButton).toBeVisible()
  })

  test('can open sync settings section', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Open settings menu
    const settingsButton = page.getByRole('button', { name: /settings/i }).first()
    await settingsButton.click()

    // Click sync option
    const syncButton = page.getByRole('button', { name: /sync/i })
    await syncButton.click()

    // Should see sync description
    await expect(page.getByText('Sync your found words across devices')).toBeVisible()

    // Should see "Create new" button (to start sync)
    await expect(page.getByRole('button', { name: /create new/i })).toBeVisible()

    // Should see "Join existing" button
    await expect(page.getByRole('button', { name: /join existing/i })).toBeVisible()
  })

  test('can create new sync code', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Open settings > sync
    const settingsButton = page.getByRole('button', { name: /settings/i }).first()
    await settingsButton.click()

    const syncButton = page.getByRole('button', { name: /sync/i })
    await syncButton.click()

    // Click "Create new" to generate a sync code
    const createButton = page.getByRole('button', { name: /create new/i })
    await createButton.click()

    // Should now show the sync code (6 character alphanumeric)
    const codeElement = page.getByRole('code')
    await expect(codeElement).toBeVisible()

    // Code should be 6 characters
    const code = await codeElement.textContent()
    expect(code?.length).toBe(6)

    // Should show QR code (link with title)
    const qrCode = page.getByTitle('Open sync link')
    await expect(qrCode).toBeVisible()

    // Should show disconnect button
    await expect(page.getByRole('button', { name: /disconnect/i })).toBeVisible()
  })

  test('can show join existing sync input', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Open settings > sync
    const settingsButton = page.getByRole('button', { name: /settings/i }).first()
    await settingsButton.click()

    const syncButton = page.getByRole('button', { name: /sync/i })
    await syncButton.click()

    // Click "Join existing"
    const joinButton = page.getByRole('button', { name: /join existing/i })
    await joinButton.click()

    // Should show input field
    const syncInput = page.getByPlaceholder(/enter sync code/i)
    await expect(syncInput).toBeVisible()

    // Should show cancel button
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible()

    // Should show connect button (disabled until code entered)
    const connectButton = page.getByRole('button', { name: /connect/i })
    await expect(connectButton).toBeVisible()
    await expect(connectButton).toBeDisabled()
  })

  test('connect button enables when code is entered', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Open settings > sync > join existing
    const settingsButton = page.getByRole('button', { name: /settings/i }).first()
    await settingsButton.click()

    const syncButton = page.getByRole('button', { name: /sync/i })
    await syncButton.click()

    const joinButton = page.getByRole('button', { name: /join existing/i })
    await joinButton.click()

    // Enter a code
    const syncInput = page.getByPlaceholder(/enter sync code/i)
    await syncInput.fill('abc123')

    // Connect button should now be enabled
    const connectButton = page.getByRole('button', { name: /connect/i })
    await expect(connectButton).toBeEnabled()
  })

  test('can cancel join existing', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Open settings > sync > join existing
    const settingsButton = page.getByRole('button', { name: /settings/i }).first()
    await settingsButton.click()

    const syncButton = page.getByRole('button', { name: /sync/i })
    await syncButton.click()

    const joinButton = page.getByRole('button', { name: /join existing/i })
    await joinButton.click()

    // Enter some text
    const syncInput = page.getByPlaceholder(/enter sync code/i)
    await syncInput.fill('test')

    // Click cancel
    const cancelButton = page.getByRole('button', { name: /cancel/i })
    await cancelButton.click()

    // Should be back to the create/join buttons view
    await expect(page.getByRole('button', { name: /create new/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /join existing/i })).toBeVisible()
  })

  test('can disconnect sync', async ({ page, goto }) => {
    // Pre-enable sync with a code
    await page.addInitScript(() => {
      localStorage.setItem('pangrum-sync-code', 'abc123')
    })

    await goto('/', { waitUntil: 'hydration' })

    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Open settings > sync
    const settingsButton = page.getByRole('button', { name: /settings/i }).first()
    await settingsButton.click()

    const syncButton = page.getByRole('button', { name: /sync/i })
    await syncButton.click()

    // Should see the code displayed
    const codeElement = page.getByRole('code')
    await expect(codeElement).toContainText('abc123')

    // Click disconnect
    const disconnectButton = page.getByRole('button', { name: /disconnect/i })
    await disconnectButton.click()

    // Settings should close, reopen to verify sync is disabled
    await settingsButton.click()
    await syncButton.click()

    // Should now show create/join buttons again
    await expect(page.getByRole('button', { name: /create new/i })).toBeVisible()
  })

  test('sync persists in localStorage', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Open settings > sync and create new
    const settingsButton = page.getByRole('button', { name: /settings/i }).first()
    await settingsButton.click()

    const syncButton = page.getByRole('button', { name: /sync/i })
    await syncButton.click()

    const createButton = page.getByRole('button', { name: /create new/i })
    await createButton.click()

    // Get the generated code
    const codeElement = page.getByRole('code')
    const code = await codeElement.textContent()

    // Verify it's in localStorage
    const storedCode = await page.evaluate(() => localStorage.getItem('pangrum-sync-code'))
    expect(storedCode).toBe(code)
  })

  test('sync shows offline message when not connected', async ({ page, goto, context }) => {
    // Enable sync first
    await page.addInitScript(() => {
      localStorage.setItem('pangrum-sync-code', 'abc123')
    })

    await goto('/', { waitUntil: 'hydration' })

    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Go offline
    await context.setOffline(true)

    // Open settings > sync
    const settingsButton = page.getByRole('button', { name: /settings/i }).first()
    await settingsButton.click()

    const syncButton = page.getByRole('button', { name: /sync/i })
    await syncButton.click()

    // Should show offline indicator in sync section
    await expect(page.getByText('Offline - sync paused')).toBeVisible()
  })
})

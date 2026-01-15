import { expect, test } from '@nuxt/test-utils/playwright'

test.describe('Game Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Set localStorage to skip tutorial before navigation
    await page.addInitScript(() => {
      localStorage.setItem('pangrum-tutorial-seen', 'true')
    })
  })

  test('loads the puzzle and displays letters', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Check that the app title is present
    await expect(page.getByRole('heading', { name: 'pangrum' })).toBeVisible()

    // Wait for puzzle data to load - centre letter should be visible
    const centreButton = page.locator('.centre-letter')
    await expect(centreButton).toBeVisible()

    // Should have 7 letter buttons total
    const letterButtons = page.locator('.letter-button')
    await expect(letterButtons).toHaveCount(7)

    // Should have exactly one centre letter
    await expect(centreButton).toHaveCount(1)
  })

  test('can type letters using keyboard', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle data - centre letter indicates data is loaded
    const centreButton = page.locator('.centre-letter')
    await expect(centreButton).toBeVisible()

    // Get the centre letter text
    const centreLetter = await centreButton.textContent()

    // Type the centre letter into the input
    const input = page.getByRole('textbox', { name: 'word' })
    await input.fill(centreLetter!.toLowerCase())

    // Check that the input shows the letter
    await expect(input).toHaveValue(centreLetter!.toLowerCase())
  })

  test('can click letters to add them', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle data
    const centreButton = page.locator('.centre-letter')
    await expect(centreButton).toBeVisible()

    // Get the centre letter text first
    const centreLetter = await centreButton.textContent()

    // Click the centre letter button
    await centreButton.click()

    // The input value is updated reactively via the useWord composable
    // Letter buttons add uppercase letters to the word state (from props.letters)
    const input = page.getByRole('textbox', { name: 'word' })
    await expect(input).toHaveValue(centreLetter!)
  })

  test('shows error toast for too short words', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle data
    const centreButton = page.locator('.centre-letter')
    await expect(centreButton).toBeVisible()

    // Get the centre letter and type it 3 times (too short)
    const centreLetter = await centreButton.textContent()
    const input = page.getByRole('textbox', { name: 'word' })
    await input.fill(centreLetter!.toLowerCase().repeat(3))

    // Submit the form
    await input.press('Enter')

    // Should show error toast
    await expect(page.getByText('Not long enough')).toBeVisible()
  })

  test('shows error for word missing centre letter', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle data
    const centreButton = page.locator('.centre-letter')
    await expect(centreButton).toBeVisible()

    // Get an outer letter
    const outerButton = page.locator('.outer-letter').first()
    await expect(outerButton).toBeVisible()
    const outerLetter = await outerButton.textContent()

    // Type 4 of the same outer letter (no centre letter)
    const input = page.getByRole('textbox', { name: 'word' })
    await input.fill(outerLetter!.toLowerCase().repeat(4))
    await input.press('Enter')

    // Should show error toast
    await expect(page.getByText('Does not contain centre letter')).toBeVisible()
  })

  test('displays score and status', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle data
    const centreButton = page.locator('.centre-letter')
    await expect(centreButton).toBeVisible()

    // Score should start at 0
    await expect(page.locator('.score-value')).toContainText('0')

    // Status should be 'beginner' initially
    await expect(page.getByRole('main').getByText('beginner')).toBeVisible()
  })

  test('can shuffle letters', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Wait for puzzle data
    const centreButton = page.locator('.centre-letter')
    await expect(centreButton).toBeVisible()

    // Find and click the shuffle button - look for button with "Shuffle" text
    const shuffleButton = page.getByRole('button', { name: /shuffle/i })
    await expect(shuffleButton.first()).toBeVisible()
    await shuffleButton.first().click()

    // Centre letter should still be present after shuffle
    await expect(centreButton).toBeVisible()

    // Should still have 6 outer letters
    const outerLetters = page.locator('.outer-letter')
    await expect(outerLetters).toHaveCount(6)
  })
})

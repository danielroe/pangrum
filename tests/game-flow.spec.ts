import { expect, test } from '@nuxt/test-utils/playwright'
import { mockPuzzleApi, skipTutorial, TEST_PUZZLE } from './fixtures/puzzle'

test.describe('Game Flow', () => {
  test.beforeEach(async ({ page }) => {
    await skipTutorial(page)
    await mockPuzzleApi(page)
  })

  test('loads the puzzle and displays letters', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    // Check that the app title is present
    await expect(page.getByRole('heading', { name: 'pangrum' })).toBeVisible()

    // Wait for puzzle to load by checking for the input
    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Should have 7 letter buttons (verify by checking each letter has a button)
    for (const letter of TEST_PUZZLE.letters) {
      await expect(page.getByRole('button', { name: `Add letter ${letter}` })).toBeVisible()
    }
  })

  test('can type letters using keyboard', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Type the centre letter into the input
    await input.fill(TEST_PUZZLE.centreLetter.toLowerCase())

    // Check that the input shows the letter
    await expect(input).toHaveValue(TEST_PUZZLE.centreLetter.toLowerCase())
  })

  test('can click letters to add them', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Click the centre letter button
    await page.getByRole('button', { name: `Add letter ${TEST_PUZZLE.centreLetter}` }).click()

    // The input value is updated reactively (buttons add uppercase letters)
    await expect(input).toHaveValue(TEST_PUZZLE.centreLetter)
  })

  test('shows error toast for too short words', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Type the centre letter 3 times (too short)
    await input.fill(TEST_PUZZLE.centreLetter.toLowerCase().repeat(3))
    await input.press('Enter')

    // Should show error toast
    await expect(page.getByRole('status')).toContainText('Not long enough')
  })

  test('shows error for word missing centre letter', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Get an outer letter (any letter that's not the centre)
    const outerLetter = TEST_PUZZLE.letters.find(l => l !== TEST_PUZZLE.centreLetter)!

    // Type 4 of the same outer letter (no centre letter)
    await input.fill(outerLetter.toLowerCase().repeat(4))
    await input.press('Enter')

    // Should show error toast
    await expect(page.getByRole('status')).toContainText('Does not contain centre letter')
  })

  test('displays score and status', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Status should be 'beginner' initially (unique text on the page)
    await expect(page.getByRole('main').getByText('beginner')).toBeVisible()

    // The "to novice" text indicates score tracking is working (next level)
    await expect(page.getByRole('main').getByText(/to novice/i)).toBeVisible()
  })

  test('can shuffle letters', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Find and click the shuffle button
    const shuffleButton = page.getByRole('button', { name: /shuffle/i })
    await expect(shuffleButton.first()).toBeVisible()
    await shuffleButton.first().click()

    // All letter buttons should still be present after shuffle
    for (const letter of TEST_PUZZLE.letters) {
      await expect(page.getByRole('button', { name: `Add letter ${letter}` })).toBeVisible()
    }
  })
})

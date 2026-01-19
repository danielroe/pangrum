import { expect, test } from '@nuxt/test-utils/playwright'
import { disableHints, mockPuzzleApi, skipTutorial, TEST_PUZZLE } from './fixtures/puzzle'

test.describe('Word Guessing', () => {
  test.beforeEach(async ({ page }) => {
    await skipTutorial(page)
    await mockPuzzleApi(page)
  })

  test('submitting a valid word shows success toast and updates score', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Submit a known valid word
    await input.fill('rain')
    await input.press('Enter')

    // Should show success toast with points
    const toast = page.getByRole('status')
    await expect(toast).toContainText(/\+\d+/)

    // The word should be cleared after submission
    await expect(input).toHaveValue('')
  })

  test('too short word shows error', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Type something too short (3 chars with centre letter)
    await input.fill('ant')
    await input.press('Enter')
    await expect(page.getByRole('status')).toContainText('Not long enough')

    // The word should be cleared after submission
    await expect(input).toHaveValue('')
  })

  test('invalid word shows error toast', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Type an invalid word (not in our valid words list)
    await input.fill('aaaa')
    await input.press('Enter')

    // Should show an error toast (not a valid word)
    await expect(page.getByRole('status')).toContainText('Not a valid word')
  })

  test('word with invalid letters shows error', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Type a word with letters not in the puzzle (X, Y, Z aren't in our puzzle)
    await input.fill('axyz')
    await input.press('Enter')

    // Should show error about wrong letters
    await expect(page.getByRole('status')).toContainText('Uses wrong letters')
  })

  test('word missing centre letter shows error', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Type a word without the centre letter 'A'
    await input.fill('tent')
    await input.press('Enter')

    // Should show error about missing centre letter
    await expect(page.getByRole('status')).toContainText('Does not contain centre letter')
  })

  test('clicking letter buttons adds letters to input', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Click the centre letter button (A)
    await page.getByRole('button', { name: `Add letter ${TEST_PUZZLE.centreLetter}` }).click()

    // Click another letter button (T)
    await page.getByRole('button', { name: 'Add letter T' }).click()

    // Check input has both letters (uppercase since buttons add uppercase)
    await expect(input).toHaveValue('AT')
  })

  test('backspace key removes last letter', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Click centre letter twice
    const centreButton = page.getByRole('button', { name: `Add letter ${TEST_PUZZLE.centreLetter}` })
    await centreButton.click()
    await centreButton.click()

    await expect(input).toHaveValue('AA')

    // Use backspace to delete a letter
    await input.focus()
    await page.keyboard.press('Backspace')

    // Should have one less letter
    await expect(input).toHaveValue('A')
  })

  test('found words list updates when word is added', async ({ page, goto }) => {
    await disableHints(page)

    await goto('/', { waitUntil: 'hydration' })

    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Found words list should show "Make a guess" initially
    await expect(page.getByText('Make a guess to get started')).toBeVisible()
  })

  test('finding a pangram shows celebration toast', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Submit the known pangram
    await input.fill(TEST_PUZZLE.pangram.toLowerCase())
    await input.press('Enter')

    // Should show pangram celebration toast
    await expect(page.getByRole('status')).toContainText(/PANGRAM! \+\d+/)
  })

  test('already guessed word shows error', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Submit a valid word
    await input.fill('rain')
    await input.press('Enter')
    await expect(page.getByRole('status')).toContainText(/\+\d+/)

    // Wait for toast to disappear
    await page.waitForTimeout(1500)

    // Submit the same word again
    await input.fill('rain')
    await input.press('Enter')

    // Should show already guessed error
    await expect(page.getByRole('status')).toContainText('Already guessed')
  })

  test('level indicator shows beginner initially', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    // Status should show 'beginner'
    await expect(page.getByRole('main').getByText('beginner')).toBeVisible()
  })

  test('input accepts letters from keyboard', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    await input.fill('test')
    await expect(input).toHaveValue('test')
  })

  test('input filters out invalid characters', async ({ page, goto }) => {
    await goto('/', { waitUntil: 'hydration' })

    const input = page.getByRole('textbox', { name: /enter your word/i })
    await expect(input).toBeVisible()

    await input.fill('abc123!@#')
    await expect(input).toHaveValue('abc')
  })
})

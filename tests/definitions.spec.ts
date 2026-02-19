import { expect, test } from '@nuxt/test-utils/playwright'
import { disableHints, mockPuzzleApi, skipTutorial } from './fixtures/puzzle'

const MOCK_DEFINITION = {
  word: 'rain',
  partOfSpeech: 'noun',
  definition: 'Precipitation in the form of droplets of water.',
  example: 'The rain fell heavily overnight.',
}

async function mockDefinitionApi(page: Parameters<typeof mockPuzzleApi>[0], status = 200) {
  await page.route('**/api/definition/**', async (route) => {
    if (status === 200) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(MOCK_DEFINITION),
      })
    }
    else {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ statusMessage: 'No definition found' }),
      })
    }
  })
}

async function guessWord(page: Parameters<typeof mockPuzzleApi>[0], word: string) {
  const input = page.getByRole('textbox', { name: /enter your word/i })
  await input.fill(word)
  await input.press('Enter')
  // Wait for the word to appear in the found words list
  await expect(page.getByRole('button', { name: new RegExp(word, 'i') }).first()).toBeVisible()
}

test.describe('Word Definitions', () => {
  test.beforeEach(async ({ page }) => {
    await skipTutorial(page)
    await disableHints(page)
    await mockPuzzleApi(page)
  })

  test('clicking a found word opens a definition modal', async ({ page, goto }) => {
    await mockDefinitionApi(page)
    await goto('/', { waitUntil: 'hydration' })

    await guessWord(page, 'rain')

    // Click the word button in the found words list
    await page.getByRole('button', { name: /rain/i }).first().click()

    // Modal should appear with the word as heading
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByRole('dialog').getByRole('heading', { name: 'rain' })).toBeVisible()
  })

  test('definition modal shows part of speech and definition text', async ({ page, goto }) => {
    await mockDefinitionApi(page)
    await goto('/', { waitUntil: 'hydration' })

    await guessWord(page, 'rain')
    await page.getByRole('button', { name: /rain/i }).first().click()

    const dialog = page.getByRole('dialog')
    await expect(dialog.getByText(MOCK_DEFINITION.partOfSpeech)).toBeVisible()
    await expect(dialog.getByText(MOCK_DEFINITION.definition)).toBeVisible()
  })

  test('definition modal closes when close button is clicked', async ({ page, goto }) => {
    await mockDefinitionApi(page)
    await goto('/', { waitUntil: 'hydration' })

    await guessWord(page, 'rain')
    await page.getByRole('button', { name: /rain/i }).first().click()

    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByRole('dialog').getByRole('button', { name: /close/i }).click()

    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('definition modal shows error state when API returns 404', async ({ page, goto }) => {
    await mockDefinitionApi(page, 404)
    await goto('/', { waitUntil: 'hydration' })

    await guessWord(page, 'rain')
    await page.getByRole('button', { name: /rain/i }).first().click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible()
    // Should show the "not found" message instead of a definition
    await expect(dialog.getByText(/No definition available|definition\.notFound/)).toBeVisible()
  })
})

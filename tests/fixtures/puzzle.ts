import { hash } from 'ohash'
import type { Page, Route } from '@playwright/test'

// Test puzzle data with known valid words
export const TEST_PUZZLE = {
  // Centre letter is index 2 = 'A'
  letters: ['T', 'R', 'A', 'I', 'N', 'E', 'S'],
  centreLetter: 'A',
  validWords: ['RAIN', 'TRAIN', 'STAIN', 'SATIN', 'ANTS', 'TANS', 'RANT', 'RANTS', 'TRAINS', 'RETAINS'],
  // Uses all 7 letters: R, E, T, A, I, N, S
  pangram: 'RETAINS',
}

// Generate hashes for valid words
export const TEST_HASHES = TEST_PUZZLE.validWords.map(w => hash(w))

// Mock API response
export const TEST_API_RESPONSE = {
  letters: TEST_PUZZLE.letters,
  hashes: TEST_HASHES,
  words: TEST_PUZZLE.validWords.map(w => w[0] + '_'.repeat(w.length - 1)),
  pairs: { RA: 2, TR: 2, ST: 2, SA: 1, AN: 1, TA: 1 },
  pangrams: 1,
  date: new Date().toISOString().slice(0, 10),
  lang: 'en',
}

// Helper to mock the puzzle API
export async function mockPuzzleApi(page: Page) {
  await page.route('**/api/words/**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(TEST_API_RESPONSE),
    })
  })
}

export async function skipTutorial(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('pangrum-tutorial-seen', 'true')
  })
}

export async function disableHints(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('pangrum-hints-enabled', 'false')
  })
}

export async function enableHints(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('pangrum-hints-enabled', 'true')
  })
}

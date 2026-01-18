export const STORAGE_PREFIX = 'pangrum-'
export const STORAGE_INCORRECT_MARKER = '-incorrect-'

// Matches language codes (2 letters, optionally followed by -xx regional code) + date
// Examples: "en-2024-01-14", "en-gb-2024-01-14", "de-2024-01-14"
export const DATE_KEY_PATTERN = /^[a-z]{2}(-[a-z]{2})?-\d{4}-\d{2}-\d{2}$/

/**
 * Normalizes a sync code for use as a room ID.
 * Converts to lowercase and trims whitespace.
 */
export function normalizeRoomId(code: string): string {
  return code.toLowerCase().trim()
}

/**
 * Checks if a localStorage key is a valid puzzle key for syncing.
 * Must have pangrum- prefix, not be an incorrect marker, and match date format.
 */
export function isValidPuzzleKey(key: string): boolean {
  if (!key.startsWith(STORAGE_PREFIX)) return false
  if (key.includes(STORAGE_INCORRECT_MARKER)) return false

  const puzzleKey = key.slice(STORAGE_PREFIX.length)
  return DATE_KEY_PATTERN.test(puzzleKey)
}

/**
 * Merges remote words into a local word set.
 * Returns the merged array and count of newly added words.
 */
export function mergeWordSets(local: string[], remote: string[]): { merged: string[], added: number } {
  const localSet = new Set(local)
  let added = 0

  for (const word of remote) {
    if (!localSet.has(word)) {
      localSet.add(word)
      added++
    }
  }

  return { merged: [...localSet], added }
}

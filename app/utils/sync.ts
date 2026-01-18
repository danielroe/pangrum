export const STORAGE_PREFIX = 'pangrum-'
export const STORAGE_INCORRECT_MARKER = '-incorrect-'
export const DATE_KEY_PATTERN = /^[a-z]{2}(-[a-z]{2})?-\d{4}-\d{2}-\d{2}$/

export function normalizeRoomId(code: string): string {
  return code.toLowerCase().trim()
}

export function isValidPuzzleKey(key: string): boolean {
  if (!key.startsWith(STORAGE_PREFIX)) return false
  if (key.includes(STORAGE_INCORRECT_MARKER)) return false

  const puzzleKey = key.slice(STORAGE_PREFIX.length)
  return DATE_KEY_PATTERN.test(puzzleKey)
}

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

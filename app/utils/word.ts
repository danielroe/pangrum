/**
 * Format a word hint showing first letter and length.
 * Used when showing unfound words without revealing the full answer.
 *
 * @example
 * formatWordHint('hello') // 'H (5)'
 * formatWordHint('a___') // 'A (4)'
 */
export function formatWordHint(word: string): string {
  const firstLetter = word.charAt(0).toUpperCase()
  return `${firstLetter} (${word.length})`
}

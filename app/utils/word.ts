export function formatWordHint(word: string): string {
  const firstLetter = word.charAt(0).toUpperCase()
  return `${firstLetter} (${word.length})`
}

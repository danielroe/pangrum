export function formatWordHint(word: string): string {
  const firstLetter = word.charAt(0).toUpperCase()
  return `${firstLetter} (${word.length})`
}

export function isPangram(word: string, letters: string[]): boolean {
  if (!letters?.length) return false
  return letters.every(l => word.includes(l))
}

export function calculateWordPercentage(
  counts: Record<string, number>,
  totalPlayers: number,
  wordHash: string,
): number | null {
  if (totalPlayers === 0) return null
  const count = counts[wordHash] || 0
  return Math.round((count / totalPlayers) * 100)
}

export function getWordCount(counts: Record<string, number>, wordHash: string): number {
  return counts[wordHash] || 0
}

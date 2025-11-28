export function useScore(words: MaybeRefOrGetter<Set<string> | undefined>, validWords: MaybeRefOrGetter<string[]>) {
  const maxScore = computed(() => toValue(validWords).reduce((sum, word) => sum + scoreWord(word), 0))
  const score = computed(() => [...toValue(words) || []].reduce((sum, word) => sum + scoreWord(word), 0))
  const percentage = computed(() => Math.min(Math.ceil(100 * score.value / maxScore.value), 100))

  return {
    score,
    maxScore,
    percentage,
  }
}

export function scoreWord(word: string) {
  return word.length === 4 ? 1 : word.length + (new Set([...word]).size === 7 ? 7 : 0)
}

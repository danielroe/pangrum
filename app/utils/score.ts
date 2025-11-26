export function useScore(words: MaybeRefOrGetter<Set<string> | undefined>, validWords: MaybeRefOrGetter<string[]>) {
  const maxScore = computed(() => toValue(validWords).reduce((sum, word) => sum + word.length - 3, 0))
  const score = computed(() => [...toValue(words) || []].reduce((sum, word) => sum + word.length - 3, 0))
  const percentage = computed(() => Math.min(Math.ceil(100 * score.value / maxScore.value), 100))

  return {
    score,
    maxScore,
    percentage
  }
}

export const LEVEL_THRESHOLDS = {
  'beginner': 0,
  'novice': 2.5,
  'moving up': 5,
  'good': 8,
  'solid': 15,
  'nice': 25,
  'great': 40,
  'amazing': 50,
  'genius': 70,
  'perfect': 100,
} as const

export type Level = keyof typeof LEVEL_THRESHOLDS

const THRESHOLDS_REVERSED = Object.entries(LEVEL_THRESHOLDS).reverse() as [Level, number][]

export function getLevel(percentage: number): Level {
  for (const [label, threshold] of THRESHOLDS_REVERSED) {
    if (threshold <= percentage) {
      return label
    }
  }
  return 'beginner'
}

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

// Level keys for i18n lookup
export const LEVEL_KEYS = [
  'beginner',
  'novice',
  'movingUp',
  'good',
  'solid',
  'nice',
  'great',
  'amazing',
  'genius',
  'perfect',
] as const

export type LevelKey = typeof LEVEL_KEYS[number]

// Thresholds indexed by level key
export const LEVEL_THRESHOLDS: Record<LevelKey, number> = {
  beginner: 0,
  novice: 2.5,
  movingUp: 5,
  good: 8,
  solid: 15,
  nice: 25,
  great: 40,
  amazing: 50,
  genius: 70,
  perfect: 100,
}

const THRESHOLDS_REVERSED = LEVEL_KEYS.slice().reverse().map(key => [key, LEVEL_THRESHOLDS[key]] as const)

export function getLevelKey(percentage: number): LevelKey {
  for (const [key, threshold] of THRESHOLDS_REVERSED) {
    if (threshold <= percentage) {
      return key
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

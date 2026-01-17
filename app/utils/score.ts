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

export function calculatePercentage(score: number, maxScore: number): number {
  if (maxScore === 0) return 0
  const hasPerfectScore = score >= maxScore
  if (hasPerfectScore) return 100

  // cap at 99
  return Math.min(Math.round(100 * score / maxScore), 99)
}

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
  const percentage = computed(() => calculatePercentage(score.value, maxScore.value))

  return {
    score,
    maxScore,
    percentage,
  }
}

export function scoreWord(word: string) {
  return word.length === 4 ? 1 : word.length + (new Set([...word]).size === 7 ? 7 : 0)
}

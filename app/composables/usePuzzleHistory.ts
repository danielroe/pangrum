import type { Language } from './useLanguage'
import type { LevelKey } from '../utils/score'

export interface PuzzleDayProgress {
  date: string
  wordsFound: number
  level: LevelKey | null // null if we can't compute (no puzzle data cached)
}

export interface PuzzleStats {
  currentStreak: number
  longestStreak: number
  totalDaysPlayed: number
}

const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24

/**
 * Calculates the current streak of consecutive days played.
 * The streak must include today or yesterday to be valid.
 */
export function calculateCurrentStreak(playedDates: Set<string>, today: string): number {
  if (playedDates.size === 0) return 0

  let currentStreak = 0
  const checkDate = new Date(today)

  while (true) {
    const dateStr = checkDate.toISOString().slice(0, 10)
    if (playedDates.has(dateStr)) {
      currentStreak++
      checkDate.setDate(checkDate.getDate() - 1)
    }
    else if (currentStreak === 0) {
      // If today has no progress, check if yesterday started a streak
      checkDate.setDate(checkDate.getDate() - 1)
      const yesterdayStr = checkDate.toISOString().slice(0, 10)
      if (!playedDates.has(yesterdayStr)) {
        break // No streak
      }
      // Continue counting from yesterday
    }
    else {
      break // Streak broken
    }
  }

  return currentStreak
}

/**
 * Calculates the longest streak of consecutive days played.
 */
export function calculateLongestStreak(playedDates: Set<string>): number {
  if (playedDates.size === 0) return 0

  const sortedDates = [...playedDates].sort()

  let longestStreak = 0
  let tempStreak = 0
  let prevDate: Date | null = null

  for (const dateStr of sortedDates) {
    const currentDate = new Date(dateStr)

    if (prevDate === null) {
      tempStreak = 1
    }
    else {
      const dayDiff = Math.round((currentDate.getTime() - prevDate.getTime()) / MILLISECONDS_PER_DAY)
      if (dayDiff === 1) {
        tempStreak++
      }
      else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
    }

    prevDate = currentDate
  }
  longestStreak = Math.max(longestStreak, tempStreak)

  return longestStreak
}

export function calculateStats(playedDates: Set<string>, today: string): PuzzleStats {
  return {
    currentStreak: calculateCurrentStreak(playedDates, today),
    longestStreak: calculateLongestStreak(playedDates),
    totalDaysPlayed: playedDates.size,
  }
}

/**
 * Reads all puzzle progress from localStorage for a given language.
 * Returns a map of date -> progress data.
 */
export function usePuzzleHistory(language: MaybeRefOrGetter<Language>) {
  const historyMap = ref(new Map<string, PuzzleDayProgress>())

  const STORAGE_PREFIX = 'pangrum-'
  const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

  function loadHistory() {
    if (!import.meta.client) return

    const lang = toValue(language)
    const prefix = `${STORAGE_PREFIX}${lang}-`
    const newMap = new Map<string, PuzzleDayProgress>()

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith(prefix)) continue

      const dateStr = key.slice(prefix.length)
      if (!DATE_REGEX.test(dateStr)) continue

      try {
        const data = localStorage.getItem(key)
        if (!data) continue

        const words = JSON.parse(data) as string[]
        if (!Array.isArray(words) || words.length === 0) continue

        newMap.set(dateStr, {
          date: dateStr,
          wordsFound: words.length,
          level: null, // We don't have puzzle data to compute level
        })
      }
      catch {
        // Ignore parse errors
      }
    }

    historyMap.value = newMap
  }

  // Reload when language changes
  watch(() => toValue(language), loadHistory, { immediate: true })

  // Listen for storage events from other tabs
  if (import.meta.client) {
    useEventListener('storage', (event) => {
      const lang = toValue(language)
      const prefix = `${STORAGE_PREFIX}${lang}-`
      if (event.key?.startsWith(prefix)) {
        loadHistory()
      }
    })
  }

  function hasProgress(date: string): boolean {
    return historyMap.value.has(date)
  }

  function getProgress(date: string): PuzzleDayProgress | undefined {
    return historyMap.value.get(date)
  }

  const stats = computed<PuzzleStats>(() => {
    const today = new Date().toISOString().slice(0, 10)
    const playedDates = new Set(historyMap.value.keys())
    return calculateStats(playedDates, today)
  })

  return {
    historyMap,
    hasProgress,
    getProgress,
    stats,
    reload: loadHistory,
  }
}

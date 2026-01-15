import { describe, expect, it } from 'vitest'
import {
  calculateCurrentStreak,
  calculateLongestStreak,
  calculateStats,
} from '../../app/composables/usePuzzleHistory'

/**
 * Helper to create a date string in YYYY-MM-DD format
 * @param daysAgo - number of days before the reference date (0 = reference date itself)
 * @param referenceDate - the reference date (defaults to 2026-01-15)
 */
function dateFromDaysAgo(daysAgo: number, referenceDate = '2026-01-15'): string {
  const date = new Date(referenceDate)
  date.setDate(date.getDate() - daysAgo)
  return date.toISOString().slice(0, 10)
}

describe('calculateCurrentStreak', () => {
  const TODAY = '2026-01-15'

  it('returns 0 for empty played dates', () => {
    expect(calculateCurrentStreak(new Set(), TODAY)).toBe(0)
  })

  it('returns 1 when only today was played', () => {
    const playedDates = new Set([TODAY])
    expect(calculateCurrentStreak(playedDates, TODAY)).toBe(1)
  })

  it('returns 1 when only yesterday was played', () => {
    const yesterday = dateFromDaysAgo(1, TODAY)
    const playedDates = new Set([yesterday])
    expect(calculateCurrentStreak(playedDates, TODAY)).toBe(1)
  })

  it('returns streak count for consecutive days including today', () => {
    const playedDates = new Set([
      TODAY,
      dateFromDaysAgo(1, TODAY),
      dateFromDaysAgo(2, TODAY),
    ])
    expect(calculateCurrentStreak(playedDates, TODAY)).toBe(3)
  })

  it('returns streak count for consecutive days starting from yesterday', () => {
    const playedDates = new Set([
      dateFromDaysAgo(1, TODAY),
      dateFromDaysAgo(2, TODAY),
      dateFromDaysAgo(3, TODAY),
    ])
    expect(calculateCurrentStreak(playedDates, TODAY)).toBe(3)
  })

  it('returns 0 when last play was 2+ days ago', () => {
    const playedDates = new Set([
      dateFromDaysAgo(2, TODAY), // 2 days ago (gap of 1 day)
      dateFromDaysAgo(3, TODAY),
    ])
    expect(calculateCurrentStreak(playedDates, TODAY)).toBe(0)
  })

  it('stops counting when streak is broken', () => {
    const playedDates = new Set([
      TODAY,
      dateFromDaysAgo(1, TODAY),
      // gap on day 2
      dateFromDaysAgo(3, TODAY),
      dateFromDaysAgo(4, TODAY),
    ])
    expect(calculateCurrentStreak(playedDates, TODAY)).toBe(2)
  })

  it('handles long streaks correctly', () => {
    const playedDates = new Set(
      Array.from({ length: 30 }, (_, i) => dateFromDaysAgo(i, TODAY)),
    )
    expect(calculateCurrentStreak(playedDates, TODAY)).toBe(30)
  })

  it('handles single day in the past (not yesterday) as no streak', () => {
    const playedDates = new Set([dateFromDaysAgo(5, TODAY)])
    expect(calculateCurrentStreak(playedDates, TODAY)).toBe(0)
  })
})

describe('calculateLongestStreak', () => {
  const TODAY = '2026-01-15'

  it('returns 0 for empty played dates', () => {
    expect(calculateLongestStreak(new Set())).toBe(0)
  })

  it('returns 1 for single day played', () => {
    const playedDates = new Set([TODAY])
    expect(calculateLongestStreak(playedDates)).toBe(1)
  })

  it('returns correct count for consecutive days', () => {
    const playedDates = new Set([
      dateFromDaysAgo(0, TODAY),
      dateFromDaysAgo(1, TODAY),
      dateFromDaysAgo(2, TODAY),
    ])
    expect(calculateLongestStreak(playedDates)).toBe(3)
  })

  it('returns longest streak when there are multiple streaks', () => {
    const playedDates = new Set([
      // Recent streak of 2
      dateFromDaysAgo(0, TODAY),
      dateFromDaysAgo(1, TODAY),
      // Gap
      // Older streak of 4
      dateFromDaysAgo(5, TODAY),
      dateFromDaysAgo(6, TODAY),
      dateFromDaysAgo(7, TODAY),
      dateFromDaysAgo(8, TODAY),
    ])
    expect(calculateLongestStreak(playedDates)).toBe(4)
  })

  it('handles non-consecutive dates correctly', () => {
    const playedDates = new Set([
      dateFromDaysAgo(0, TODAY),
      dateFromDaysAgo(2, TODAY), // gap
      dateFromDaysAgo(4, TODAY), // gap
    ])
    expect(calculateLongestStreak(playedDates)).toBe(1)
  })

  it('handles dates in random order', () => {
    const playedDates = new Set([
      dateFromDaysAgo(2, TODAY),
      dateFromDaysAgo(0, TODAY),
      dateFromDaysAgo(1, TODAY),
    ])
    expect(calculateLongestStreak(playedDates)).toBe(3)
  })

  it('correctly identifies longest streak when current streak is shorter', () => {
    const playedDates = new Set([
      // Current streak of 1
      dateFromDaysAgo(0, TODAY),
      // Gap of several days
      // Old streak of 5 in December
      '2025-12-25',
      '2025-12-26',
      '2025-12-27',
      '2025-12-28',
      '2025-12-29',
    ])
    expect(calculateLongestStreak(playedDates)).toBe(5)
  })
})

describe('calculateStats', () => {
  const TODAY = '2026-01-15'

  it('returns zeroes for empty history', () => {
    const stats = calculateStats(new Set(), TODAY)
    expect(stats).toEqual({
      currentStreak: 0,
      longestStreak: 0,
      totalDaysPlayed: 0,
    })
  })

  it('returns correct stats for single day played today', () => {
    const playedDates = new Set([TODAY])
    const stats = calculateStats(playedDates, TODAY)
    expect(stats).toEqual({
      currentStreak: 1,
      longestStreak: 1,
      totalDaysPlayed: 1,
    })
  })

  it('returns correct stats when longest streak is not current', () => {
    const playedDates = new Set([
      // Current: today only
      TODAY,
      // Gap
      // Old streak of 3
      '2025-12-01',
      '2025-12-02',
      '2025-12-03',
    ])
    const stats = calculateStats(playedDates, TODAY)
    expect(stats).toEqual({
      currentStreak: 1,
      longestStreak: 3,
      totalDaysPlayed: 4,
    })
  })

  it('handles case where current streak equals longest streak', () => {
    const playedDates = new Set([
      dateFromDaysAgo(0, TODAY),
      dateFromDaysAgo(1, TODAY),
      dateFromDaysAgo(2, TODAY),
    ])
    const stats = calculateStats(playedDates, TODAY)
    expect(stats).toEqual({
      currentStreak: 3,
      longestStreak: 3,
      totalDaysPlayed: 3,
    })
  })

  it('counts totalDaysPlayed correctly with gaps', () => {
    const playedDates = new Set([
      dateFromDaysAgo(0, TODAY),
      dateFromDaysAgo(5, TODAY),
      dateFromDaysAgo(10, TODAY),
      dateFromDaysAgo(20, TODAY),
    ])
    const stats = calculateStats(playedDates, TODAY)
    expect(stats.totalDaysPlayed).toBe(4)
  })
})

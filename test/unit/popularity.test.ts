import { describe, expect, it } from 'vitest'
import { calculateWordPercentage, getWordCount } from '../../app/utils/popularity'

describe('calculateWordPercentage', () => {
  it('computes percentage correctly', () => {
    const counts = { hash1: 75, hash2: 50, hash3: 10 }
    const totalPlayers = 100

    expect(calculateWordPercentage(counts, totalPlayers, 'hash1')).toBe(75)
    expect(calculateWordPercentage(counts, totalPlayers, 'hash2')).toBe(50)
    expect(calculateWordPercentage(counts, totalPlayers, 'hash3')).toBe(10)
  })

  it('returns 0 for unknown word hashes', () => {
    expect(calculateWordPercentage({ hash1: 75 }, 100, 'hashUnknown')).toBe(0)
  })

  it('returns null when totalPlayers is zero', () => {
    expect(calculateWordPercentage({ hash1: 10 }, 0, 'hash1')).toBeNull()
  })

  it('rounds percentages correctly', () => {
    expect(calculateWordPercentage({ hash1: 33 }, 100, 'hash1')).toBe(33)
    expect(calculateWordPercentage({ hash1: 1 }, 3, 'hash1')).toBe(33)
    expect(calculateWordPercentage({ hash1: 2 }, 3, 'hash1')).toBe(67)
  })
})

describe('getWordCount', () => {
  it('returns count for known word hash', () => {
    const counts = { hash1: 42, hash2: 10 }
    expect(getWordCount(counts, 'hash1')).toBe(42)
    expect(getWordCount(counts, 'hash2')).toBe(10)
  })

  it('returns 0 for unknown word hash', () => {
    expect(getWordCount({ hash1: 42 }, 'unknown')).toBe(0)
  })

  it('returns 0 for empty counts', () => {
    expect(getWordCount({}, 'hash1')).toBe(0)
  })
})

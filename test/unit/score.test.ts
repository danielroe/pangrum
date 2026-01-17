import { describe, expect, it } from 'vitest'
import { calculatePercentage, scoreWord } from '../../app/utils/score'

describe('scoreWord', () => {
  it('scores 4-letter words as 1 point', () => {
    expect(scoreWord('TEST')).toBe(1)
    expect(scoreWord('WORD')).toBe(1)
    expect(scoreWord('HELP')).toBe(1)
  })

  it('scores 5+ letter words as 1 point per letter', () => {
    expect(scoreWord('TESTS')).toBe(5)
    expect(scoreWord('WORDS')).toBe(5)
    expect(scoreWord('LONGER')).toBe(6)
    expect(scoreWord('TESTING')).toBe(7)
  })

  it('adds 7 bonus points for pangrams (words using all 7 letters)', () => {
    // A pangram has exactly 7 unique letters
    expect(scoreWord('ABCDEFG')).toBe(7 + 7) // 7 letters + 7 bonus
    expect(scoreWord('GFEDCBA')).toBe(7 + 7) // same letters, different order
  })

  it('adds bonus for longer pangrams', () => {
    // 8 letters with all 7 unique = 8 + 7 bonus = 15
    expect(scoreWord('ABCDEFGA')).toBe(8 + 7)
    // 9 letters with all 7 unique = 9 + 7 bonus = 16
    expect(scoreWord('ABCDEFGAB')).toBe(9 + 7)
  })

  it('does not add bonus for words with 6 or fewer unique letters', () => {
    // Only 6 unique letters
    expect(scoreWord('ABCDEF')).toBe(6)
    // 7 letters but only 6 unique (repeated A)
    expect(scoreWord('AABCDEF')).toBe(7)
    expect(scoreWord('AAAAAAA')).toBe(7)
  })
})

describe('calculatePercentage', () => {
  it('returns 0 when maxScore is 0', () => {
    expect(calculatePercentage(0, 0)).toBe(0)
    expect(calculatePercentage(10, 0)).toBe(0)
  })

  it('returns 100 only when score equals maxScore', () => {
    expect(calculatePercentage(100, 100)).toBe(100)
    expect(calculatePercentage(200, 200)).toBe(100)
  })

  it('returns 100 when score exceeds maxScore', () => {
    expect(calculatePercentage(101, 100)).toBe(100)
  })

  it('caps at 99 when close to but not at 100%', () => {
    // 99.5% should round to 100 with Math.round, but we cap at 99
    expect(calculatePercentage(199, 200)).toBe(99)
    // 99.9% should also cap at 99
    expect(calculatePercentage(999, 1000)).toBe(99)
  })

  it('rounds normally for other percentages', () => {
    // 50% exactly
    expect(calculatePercentage(50, 100)).toBe(50)
    // 49.5% rounds to 50
    expect(calculatePercentage(99, 200)).toBe(50)
    // 49.4% rounds to 49
    expect(calculatePercentage(494, 1000)).toBe(49)
  })
})

import { describe, expect, it } from 'vitest'
import { scoreWord } from '../../app/utils/score'

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

import { describe, expect, it } from 'vitest'
import { calculateFillWidth, formatShareText, type ShareData } from '../../app/utils/share'

describe('calculateFillWidth', () => {
  it('returns 0 for 0%', () => {
    expect(calculateFillWidth(0)).toBe(0)
  })

  it('returns 100 for 100% (perfect score)', () => {
    expect(calculateFillWidth(100)).toBe(100)
  })

  it('returns 100 for percentages above 100', () => {
    expect(calculateFillWidth(150)).toBe(100)
  })

  it('returns position proportional to progress between thresholds', () => {
    // At 2.5% we hit "novice" threshold (index 1 of 10)
    // Dot position for index 1 = (1/9) * 100 ≈ 11.11%
    const atNovice = calculateFillWidth(2.5)
    expect(atNovice).toBeCloseTo(11.11, 1)

    // At 5% we hit "movingUp" threshold (index 2 of 10)
    // Dot position for index 2 = (2/9) * 100 ≈ 22.22%
    const atMovingUp = calculateFillWidth(5)
    expect(atMovingUp).toBeCloseTo(22.22, 1)
  })

  it('interpolates between threshold dots', () => {
    // Halfway between novice (2.5%) and movingUp (5%) = 3.75%
    // Should be halfway between dot 1 (11.11%) and dot 2 (22.22%)
    const midpoint = calculateFillWidth(3.75)
    expect(midpoint).toBeGreaterThan(11)
    expect(midpoint).toBeLessThan(23)
  })

  it('increases monotonically with percentage', () => {
    const percentages = [0, 5, 10, 25, 50, 70, 90, 100]
    let lastWidth = -1

    for (const pct of percentages) {
      const width = calculateFillWidth(pct)
      expect(width).toBeGreaterThanOrEqual(lastWidth)
      lastWidth = width
    }
  })
})

describe('formatShareText', () => {
  const baseData: ShareData = {
    date: '2024-01-15',
    score: 42,
    maxScore: 100,
    wordsFound: 15,
    totalWords: 50,
    status: 'Good',
    pangrams: 1,
    totalPangrams: 2,
    letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  }

  it('includes the date', () => {
    const text = formatShareText(baseData)
    expect(text).toContain('2024-01-15')
  })

  it('includes score and status', () => {
    const text = formatShareText(baseData)
    expect(text).toContain('Score: 42 (Good)')
  })

  it('includes word count', () => {
    const text = formatShareText(baseData)
    expect(text).toContain('15/50 words')
  })

  it('includes pangram count when there are pangrams', () => {
    const text = formatShareText(baseData)
    expect(text).toContain('1/2 pangrams')
  })

  it('excludes pangram text when totalPangrams is 0', () => {
    const noPangrams: ShareData = { ...baseData, pangrams: 0, totalPangrams: 0 }
    const text = formatShareText(noPangrams)
    expect(text).not.toContain('pangrams')
  })

  it('includes site URL', () => {
    const text = formatShareText(baseData)
    expect(text).toContain('pangrum.com')
  })

  it('formats complete text correctly', () => {
    const text = formatShareText(baseData)
    expect(text).toBe(
      'Pangrum 2024-01-15\n'
      + 'Score: 42 (Good)\n'
      + '15/50 words | 1/2 pangrams\n'
      + '\n'
      + 'pangrum.com',
    )
  })

  it('formats text without pangrams correctly', () => {
    const noPangrams: ShareData = { ...baseData, pangrams: 0, totalPangrams: 0 }
    const text = formatShareText(noPangrams)
    expect(text).toBe(
      'Pangrum 2024-01-15\n'
      + 'Score: 42 (Good)\n'
      + '15/50 words\n'
      + '\n'
      + 'pangrum.com',
    )
  })
})

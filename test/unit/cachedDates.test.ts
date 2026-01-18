import { describe, expect, it } from 'vitest'
import { getClosestDate, parseWordsApiUrl } from '../../app/utils/dates'

describe('parseWordsApiUrl', () => {
  it('parses valid words API URLs', () => {
    const result = parseWordsApiUrl('https://pangrum.com/api/words/en/2026-01-15')
    expect(result).toEqual({ lang: 'en', date: '2026-01-15' })
  })

  it('parses URLs with different languages', () => {
    expect(parseWordsApiUrl('https://pangrum.com/api/words/de/2026-01-15')).toEqual({ lang: 'de', date: '2026-01-15' })
    expect(parseWordsApiUrl('https://pangrum.com/api/words/en-gb/2026-01-15')).toEqual({ lang: 'en-gb', date: '2026-01-15' })
    expect(parseWordsApiUrl('https://pangrum.com/api/words/fr/2026-01-15')).toEqual({ lang: 'fr', date: '2026-01-15' })
  })

  it('returns null for non-words API URLs', () => {
    expect(parseWordsApiUrl('https://pangrum.com/api/popularity/en/2026-01-15')).toBeNull()
    expect(parseWordsApiUrl('https://pangrum.com/')).toBeNull()
    expect(parseWordsApiUrl('https://pangrum.com/api/words/')).toBeNull()
  })

  it('returns null for malformed date formats', () => {
    expect(parseWordsApiUrl('https://pangrum.com/api/words/en/2026-1-15')).toBeNull()
    expect(parseWordsApiUrl('https://pangrum.com/api/words/en/20260115')).toBeNull()
    expect(parseWordsApiUrl('https://pangrum.com/api/words/en/invalid')).toBeNull()
  })
})

describe('getClosestDate', () => {
  it('returns target date when it exists in cache', () => {
    const cached = new Set(['2026-01-14', '2026-01-15', '2026-01-16'])
    expect(getClosestDate(cached, '2026-01-15')).toBe('2026-01-15')
  })

  it('returns target date when cache is empty', () => {
    const cached = new Set<string>()
    expect(getClosestDate(cached, '2026-01-15')).toBe('2026-01-15')
  })

  it('returns closest earlier date when target not cached', () => {
    const cached = new Set(['2026-01-10', '2026-01-12'])
    expect(getClosestDate(cached, '2026-01-15')).toBe('2026-01-12')
  })

  it('returns closest later date when target not cached', () => {
    const cached = new Set(['2026-01-18', '2026-01-20'])
    expect(getClosestDate(cached, '2026-01-15')).toBe('2026-01-18')
  })

  it('handles equidistant dates', () => {
    const cached = new Set(['2026-01-13', '2026-01-17'])
    const result = getClosestDate(cached, '2026-01-15')
    expect(['2026-01-13', '2026-01-17']).toContain(result)
  })
})

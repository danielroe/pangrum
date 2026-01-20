import { describe, expect, it } from 'vitest'
import { getClosestDate, parseWordsApiUrl } from '../../app/utils/dates'
import { getLocalDateString } from '../../shared/utils'

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

describe('getLocalDateString', () => {
  it('formats date as YYYY-MM-DD', () => {
    const date = new Date(2026, 0, 15) // Jan 15, 2026 (month is 0-indexed)
    expect(getLocalDateString(date)).toBe('2026-01-15')
  })

  it('pads single-digit months with leading zero', () => {
    const date = new Date(2026, 4, 5) // May 5, 2026
    expect(getLocalDateString(date)).toBe('2026-05-05')
  })

  it('pads single-digit days with leading zero', () => {
    const date = new Date(2026, 11, 3) // Dec 3, 2026
    expect(getLocalDateString(date)).toBe('2026-12-03')
  })

  it('handles end of year dates', () => {
    const date = new Date(2026, 11, 31) // Dec 31, 2026
    expect(getLocalDateString(date)).toBe('2026-12-31')
  })

  it('uses local date, not UTC date', () => {
    // Create a date at 11 PM in local time
    // toISOString would convert this to UTC which might be the next day
    const date = new Date(2026, 0, 15, 23, 0, 0) // Jan 15, 2026 at 11 PM local
    expect(getLocalDateString(date)).toBe('2026-01-15')
  })

  it('defaults to current date when no argument provided', () => {
    const result = getLocalDateString()
    // Result should match the format YYYY-MM-DD
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

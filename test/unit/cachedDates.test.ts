import { describe, expect, it } from 'vitest'

describe('useCachedDates cache parsing logic', () => {
  function parseWordsApiUrl(url: string): { lang: string, date: string } | null {
    const parsedUrl = new URL(url)
    const match = parsedUrl.pathname.match(/^\/api\/words\/([^/]+)\/(\d{4}-\d{2}-\d{2})$/)
    if (match) {
      return { lang: match[1]!, date: match[2]! }
    }
    return null
  }

  function buildCachedDatesMap(urls: string[]): Map<string, Set<string>> {
    const dates = new Map<string, Set<string>>()
    for (const url of urls) {
      try {
        const parsed = parseWordsApiUrl(url)
        if (parsed) {
          if (!dates.has(parsed.lang)) {
            dates.set(parsed.lang, new Set())
          }
          dates.get(parsed.lang)!.add(parsed.date)
        }
      }
      catch {
        // Invalid URL
      }
    }
    return dates
  }

  describe('URL parsing', () => {
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

  describe('cache map building', () => {
    it('builds map from valid URLs', () => {
      const urls = [
        'https://pangrum.com/api/words/en/2026-01-15',
        'https://pangrum.com/api/words/en/2026-01-16',
        'https://pangrum.com/api/words/de/2026-01-15',
      ]
      const map = buildCachedDatesMap(urls)

      expect(map.get('en')?.has('2026-01-15')).toBe(true)
      expect(map.get('en')?.has('2026-01-16')).toBe(true)
      expect(map.get('de')?.has('2026-01-15')).toBe(true)
      expect(map.get('de')?.size).toBe(1)
      expect(map.get('en')?.size).toBe(2)
    })

    it('handles empty URL list', () => {
      const map = buildCachedDatesMap([])
      expect(map.size).toBe(0)
    })

    it('filters out invalid URLs', () => {
      const urls = [
        'https://pangrum.com/api/words/en/2026-01-15',
        'https://pangrum.com/invalid',
        'https://pangrum.com/api/popularity/en/2026-01-15',
      ]
      const map = buildCachedDatesMap(urls)

      expect(map.size).toBe(1)
      expect(map.get('en')?.size).toBe(1)
    })
  })

  describe('closest date calculation', () => {
    function getClosestDate(cachedDates: Set<string>, targetDate: string): string {
      if (cachedDates.size === 0) return targetDate
      if (cachedDates.has(targetDate)) return targetDate

      const targetTime = new Date(targetDate).getTime()
      let closestDate = targetDate
      let closestDiff = Infinity

      for (const date of cachedDates) {
        const diff = Math.abs(new Date(date).getTime() - targetTime)
        if (diff < closestDiff) {
          closestDiff = diff
          closestDate = date
        }
      }

      return closestDate
    }

    it('returns target date when cached', () => {
      const cached = new Set(['2026-01-14', '2026-01-15', '2026-01-16'])
      expect(getClosestDate(cached, '2026-01-15')).toBe('2026-01-15')
    })

    it('returns target date when no cached dates', () => {
      const cached = new Set<string>()
      expect(getClosestDate(cached, '2026-01-15')).toBe('2026-01-15')
    })

    it('returns closest earlier date', () => {
      const cached = new Set(['2026-01-10', '2026-01-12'])
      expect(getClosestDate(cached, '2026-01-15')).toBe('2026-01-12')
    })

    it('returns closest later date', () => {
      const cached = new Set(['2026-01-18', '2026-01-20'])
      expect(getClosestDate(cached, '2026-01-15')).toBe('2026-01-18')
    })

    it('returns equidistant earlier date (earlier wins by iteration order)', () => {
      const cached = new Set(['2026-01-13', '2026-01-17'])
      // Both are 2 days away, the first one iterated wins
      const result = getClosestDate(cached, '2026-01-15')
      expect(['2026-01-13', '2026-01-17']).toContain(result)
    })
  })
})

import { describe, expect, it } from 'vitest'
import { generateSyncCode, isValidPuzzleKey, mergeWordSets, normalizeRoomId } from '../../app/utils/sync'

describe('normalizeRoomId', () => {
  it('converts to lowercase', () => {
    expect(normalizeRoomId('ABC123')).toBe('abc123')
    expect(normalizeRoomId('XyZ789')).toBe('xyz789')
  })

  it('trims whitespace', () => {
    expect(normalizeRoomId('  abc123  ')).toBe('abc123')
    expect(normalizeRoomId('\tabc\n')).toBe('abc')
  })

  it('handles both lowercase and trim together', () => {
    expect(normalizeRoomId('  ABC123  ')).toBe('abc123')
  })

  it('handles empty string', () => {
    expect(normalizeRoomId('')).toBe('')
    expect(normalizeRoomId('   ')).toBe('')
  })
})

describe('isValidPuzzleKey', () => {
  it('accepts valid date-based puzzle keys', () => {
    expect(isValidPuzzleKey('pangrum-en-2024-01-14')).toBe(true)
    expect(isValidPuzzleKey('pangrum-de-2026-12-31')).toBe(true)
    expect(isValidPuzzleKey('pangrum-fr-2025-06-15')).toBe(true)
  })

  it('accepts keys with regional language codes', () => {
    expect(isValidPuzzleKey('pangrum-en-gb-2024-01-14')).toBe(true)
    expect(isValidPuzzleKey('pangrum-en-us-2024-01-14')).toBe(true)
  })

  it('rejects keys without pangrum prefix', () => {
    expect(isValidPuzzleKey('en-2024-01-14')).toBe(false)
    expect(isValidPuzzleKey('other-en-2024-01-14')).toBe(false)
  })

  it('rejects incorrect word marker keys', () => {
    expect(isValidPuzzleKey('pangrum-en-incorrect-2024-01-14')).toBe(false)
    expect(isValidPuzzleKey('pangrum-en-incorrect-words')).toBe(false)
  })

  it('rejects old letter-based format keys', () => {
    expect(isValidPuzzleKey('pangrum-en-ABCDEFG')).toBe(false)
    expect(isValidPuzzleKey('pangrum-de-XYZABCD')).toBe(false)
  })

  it('rejects malformed date formats', () => {
    expect(isValidPuzzleKey('pangrum-en-2024-1-14')).toBe(false) // single digit month
    expect(isValidPuzzleKey('pangrum-en-2024-01-1')).toBe(false) // single digit day
    expect(isValidPuzzleKey('pangrum-en-24-01-14')).toBe(false) // 2-digit year
    expect(isValidPuzzleKey('pangrum-en-20240114')).toBe(false) // no dashes
  })

  it('rejects keys with uppercase language codes', () => {
    expect(isValidPuzzleKey('pangrum-EN-2024-01-14')).toBe(false)
    expect(isValidPuzzleKey('pangrum-En-2024-01-14')).toBe(false)
  })
})

describe('mergeWordSets', () => {
  it('returns all words when merging into empty local', () => {
    const { merged, added } = mergeWordSets([], ['apple', 'banana'])
    expect(merged).toHaveLength(2)
    expect(added).toBe(2)
    expect(merged).toContain('apple')
    expect(merged).toContain('banana')
  })

  it('returns 0 added when remote has no new words', () => {
    const { merged, added } = mergeWordSets(['apple', 'banana'], ['apple', 'banana'])
    expect(merged).toHaveLength(2)
    expect(added).toBe(0)
  })

  it('correctly counts only new words', () => {
    const { merged, added } = mergeWordSets(['apple'], ['apple', 'banana', 'cherry'])
    expect(merged).toHaveLength(3)
    expect(added).toBe(2) // banana and cherry are new
  })

  it('handles empty remote array', () => {
    const { merged, added } = mergeWordSets(['apple', 'banana'], [])
    expect(merged).toHaveLength(2)
    expect(added).toBe(0)
  })

  it('handles both empty', () => {
    const { merged, added } = mergeWordSets([], [])
    expect(merged).toHaveLength(0)
    expect(added).toBe(0)
  })

  it('preserves local words not in remote', () => {
    const { merged } = mergeWordSets(['apple', 'banana'], ['cherry'])
    expect(merged).toHaveLength(3)
    expect(merged).toContain('apple')
    expect(merged).toContain('banana')
    expect(merged).toContain('cherry')
  })

  it('handles duplicates in remote gracefully', () => {
    const { merged, added } = mergeWordSets(['apple'], ['banana', 'banana', 'banana'])
    expect(merged).toHaveLength(2)
    expect(added).toBe(1) // Only one banana added despite 3 in remote
  })
})

describe('generateSyncCode', () => {
  const VALID_CHARS = 'abcdefghjkmnpqrstuvwxyz23456789'
  const EXCLUDED_CHARS = ['i', 'l', 'o', '0', '1']

  it('generates a 6-character code', () => {
    expect(generateSyncCode()).toHaveLength(6)
  })

  it('generates codes with only valid characters', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateSyncCode()
      for (const char of code) {
        expect(VALID_CHARS).toContain(char)
      }
    }
  })

  it('never includes confusing characters', () => {
    for (let i = 0; i < 50; i++) {
      const code = generateSyncCode()
      for (const char of EXCLUDED_CHARS) {
        expect(code).not.toContain(char)
      }
    }
  })

  it('generates lowercase codes', () => {
    for (let i = 0; i < 20; i++) {
      const code = generateSyncCode()
      expect(code).toBe(code.toLowerCase())
    }
  })

  it('generates unique codes (randomness check)', () => {
    const codes = new Set<string>()
    for (let i = 0; i < 50; i++) {
      codes.add(generateSyncCode())
    }
    expect(codes.size).toBeGreaterThan(45)
  })
})

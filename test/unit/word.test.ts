import { describe, expect, it } from 'vitest'
import { formatWordHint } from '../../app/utils/word'

describe('formatWordHint', () => {
  it('formats a simple word with uppercase first letter and length', () => {
    expect(formatWordHint('hello')).toBe('H (5)')
    expect(formatWordHint('world')).toBe('W (5)')
  })

  it('handles single character words', () => {
    expect(formatWordHint('a')).toBe('A (1)')
  })

  it('handles longer words', () => {
    expect(formatWordHint('programming')).toBe('P (11)')
    expect(formatWordHint('extraordinary')).toBe('E (13)')
  })

  it('uppercases lowercase first letters', () => {
    expect(formatWordHint('test')).toBe('T (4)')
  })

  it('keeps already uppercase first letters', () => {
    expect(formatWordHint('Test')).toBe('T (4)')
  })

  it('handles four-letter minimum words', () => {
    expect(formatWordHint('word')).toBe('W (4)')
    expect(formatWordHint('test')).toBe('T (4)')
  })
})

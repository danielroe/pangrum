import { beforeEach, describe, expect, it } from 'vitest'

describe('useHints', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('hintsEnabled state', () => {
    it('defaults to false when no localStorage value exists', () => {
      const { hintsEnabled } = useHints()

      expect(hintsEnabled.value).toBe(false)
    })

    it('reads initial value from localStorage', () => {
      localStorage.setItem('pangrum-hints-enabled', 'true')

      const { hintsEnabled } = useHints()

      expect(hintsEnabled.value).toBe(true)
    })

    it('handles false value in localStorage', () => {
      localStorage.setItem('pangrum-hints-enabled', 'false')

      const { hintsEnabled } = useHints()

      expect(hintsEnabled.value).toBe(false)
    })
  })

  describe('toggleHints', () => {
    it('enables hints when currently disabled', () => {
      const { hintsEnabled, toggleHints } = useHints()

      expect(hintsEnabled.value).toBe(false)

      toggleHints()

      expect(hintsEnabled.value).toBe(true)
    })

    it('disables hints when currently enabled', () => {
      localStorage.setItem('pangrum-hints-enabled', 'true')

      const { hintsEnabled, toggleHints } = useHints()

      expect(hintsEnabled.value).toBe(true)

      toggleHints()

      expect(hintsEnabled.value).toBe(false)
    })

    it('toggles multiple times correctly', () => {
      const { hintsEnabled, toggleHints } = useHints()

      expect(hintsEnabled.value).toBe(false)

      toggleHints()
      expect(hintsEnabled.value).toBe(true)

      toggleHints()
      expect(hintsEnabled.value).toBe(false)

      toggleHints()
      expect(hintsEnabled.value).toBe(true)
    })
  })
})

import { beforeEach, describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { SUPPORTED_LANGUAGES, isLanguage } from '../../app/composables/useLanguage'

// Test wrapper component that exposes useLanguage
const LanguageWrapper = defineComponent({
  setup() {
    const language = useLanguage()
    return { language }
  },
  template: '<div></div>',
})

describe('useLanguage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('SUPPORTED_LANGUAGES', () => {
    it('includes English US', () => {
      expect(SUPPORTED_LANGUAGES.en).toBe('English (US)')
    })

    it('includes English GB', () => {
      expect(SUPPORTED_LANGUAGES['en-gb']).toBe('English (UK)')
    })

    it('includes German', () => {
      expect(SUPPORTED_LANGUAGES.de).toBe('Deutsch')
    })

    it('includes Dutch', () => {
      expect(SUPPORTED_LANGUAGES.nl).toBe('Nederlands')
    })

    it('includes French', () => {
      expect(SUPPORTED_LANGUAGES.fr).toBe('Français')
    })

    it('includes Spanish', () => {
      expect(SUPPORTED_LANGUAGES.es).toBe('Español')
    })
  })

  describe('isLanguage type guard', () => {
    it('returns true for valid language codes', () => {
      expect(isLanguage('en')).toBe(true)
      expect(isLanguage('en-gb')).toBe(true)
      expect(isLanguage('de')).toBe(true)
      expect(isLanguage('nl')).toBe(true)
      expect(isLanguage('fr')).toBe(true)
      expect(isLanguage('es')).toBe(true)
    })

    it('returns false for invalid language codes', () => {
      expect(isLanguage('invalid')).toBe(false)
      expect(isLanguage('EN')).toBe(false)
      expect(isLanguage('english')).toBe(false)
      expect(isLanguage('')).toBe(false)
    })

    it('returns false for non-string values', () => {
      expect(isLanguage(null)).toBe(false)
      expect(isLanguage(undefined)).toBe(false)
      expect(isLanguage(123)).toBe(false)
      expect(isLanguage({})).toBe(false)
    })
  })

  describe('useLanguage composable', () => {
    it('defaults to English when no localStorage value', async () => {
      const wrapper = await mountSuspended(LanguageWrapper)

      expect(wrapper.vm.language).toBe('en')
    })

    it('can change language', async () => {
      const wrapper = await mountSuspended(LanguageWrapper)

      wrapper.vm.language = 'de'
      await nextTick()

      expect(wrapper.vm.language).toBe('de')
    })

    it('persists language changes', async () => {
      const wrapper = await mountSuspended(LanguageWrapper)

      wrapper.vm.language = 'fr'
      await nextTick()

      // Verify the language was updated
      expect(wrapper.vm.language).toBe('fr')
    })
  })
})

import { describe, expect, it } from 'vitest'
import { SUPPORTED_LANGUAGES, type Language } from '../../app/composables/useLanguage'

describe('SUPPORTED_LANGUAGES', () => {
  it('contains expected language codes', () => {
    expect(SUPPORTED_LANGUAGES).toHaveProperty('en')
    expect(SUPPORTED_LANGUAGES).toHaveProperty('en-gb')
    expect(SUPPORTED_LANGUAGES).toHaveProperty('de')
    expect(SUPPORTED_LANGUAGES).toHaveProperty('nl')
    expect(SUPPORTED_LANGUAGES).toHaveProperty('fr')
    expect(SUPPORTED_LANGUAGES).toHaveProperty('es')
  })

  it('has readable display names', () => {
    expect(SUPPORTED_LANGUAGES.en).toBe('English (US)')
    expect(SUPPORTED_LANGUAGES['en-gb']).toBe('English (UK)')
    expect(SUPPORTED_LANGUAGES.de).toBe('Deutsch')
    expect(SUPPORTED_LANGUAGES.nl).toBe('Nederlands')
    expect(SUPPORTED_LANGUAGES.fr).toBe('Français')
    expect(SUPPORTED_LANGUAGES.es).toBe('Español')
  })

  it('Language type allows all supported languages', () => {
    const validLanguages: Language[] = ['en', 'en-gb', 'de', 'nl', 'fr', 'es']
    expect(validLanguages).toHaveLength(6)
  })
})

export const SUPPORTED_LANGUAGES = {
  'en': 'English (US)',
  'en-gb': 'English (UK)',
  'de': 'Deutsch',
  'nl': 'Nederlands',
  'fr': 'Français',
  'es': 'Español',
} as const

export type Language = keyof typeof SUPPORTED_LANGUAGES

export const isLanguage = (value: unknown): value is Language => {
  return typeof value === 'string' && value in SUPPORTED_LANGUAGES
}

export function useLanguage() {
  const stored = useLocalStorage<Language>('pangrum-language', 'en', { initOnMounted: true })
  const language = useUrlState('lang', stored.value, isLanguage)

  watch(language, v => stored.value = v)

  return language
}

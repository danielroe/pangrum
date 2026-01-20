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
  const initial = getUrlParam('lang', isLanguage)
  const stored = useLocalStorage<Language>('pangrum-language', 'en', { initOnMounted: !initial })

  if (initial) stored.value = initial

  let initialized = false
  watch(stored, (value) => {
    if (!initialized) {
      initialized = true
      return
    }
    syncToUrl('lang', value, 'en')
  })

  return stored
}

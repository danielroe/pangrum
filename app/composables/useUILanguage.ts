// UI language composable - uses @nuxtjs/i18n
// This is separate from puzzle language (useLanguage) which determines word list

const VALID_UI_LOCALES = ['en', 'de', 'es', 'fr', 'nl'] as const
type UILocale = typeof VALID_UI_LOCALES[number]

const isValidUILocale = (v: unknown): v is UILocale =>
  typeof v === 'string' && VALID_UI_LOCALES.includes(v as UILocale)

export function useUILanguage() {
  const { locale, locales, setLocale } = useI18n()
  const stored = useLocalStorage<UILocale>('pangrum-language-ui', 'en')
  const initial = getUrlParam('ui', isValidUILocale) ?? stored.value

  if (initial !== 'en') setLocale(initial)

  const availableLocales = computed(() =>
    locales.value.map(l => typeof l === 'string' ? { code: l, name: l } : l),
  )

  function persistLocale(value: string) {
    if (!isValidUILocale(value)) return
    setLocale(value)
    stored.value = value
    syncToUrl('ui', value, 'en')
  }

  return {
    locale,
    availableLocales,
    setLocale: persistLocale,
  }
}

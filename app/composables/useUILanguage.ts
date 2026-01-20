// UI language composable - uses @nuxtjs/i18n
// This is separate from puzzle language (useLanguage) which determines word list

const VALID_UI_LOCALES = ['en', 'de', 'es', 'fr', 'nl'] as const
type UILocale = typeof VALID_UI_LOCALES[number]

const isValidUILocale = (v: unknown): v is UILocale =>
  typeof v === 'string' && VALID_UI_LOCALES.includes(v as UILocale)

export function useUILanguage() {
  const { locale, locales, setLocale } = useI18n()
  const uiLang = useUrlState('ui', 'en', isValidUILocale)

  watch(uiLang, code => setLocale(code), { immediate: true })

  const availableLocales = computed(() =>
    locales.value.map(l => typeof l === 'string' ? { code: l, name: l } : l),
  )

  return {
    locale,
    availableLocales,
    setLocale: (code: string) => { if (isValidUILocale(code)) uiLang.value = code },
  }
}

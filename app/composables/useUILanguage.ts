// UI language composable - uses @nuxtjs/i18n
// This is separate from puzzle language (useLanguage) which determines word list

export function useUILanguage() {
  const { locale, locales, setLocale } = useI18n()

  const availableLocales = computed(() =>
    locales.value.map(l => typeof l === 'string' ? { code: l, name: l } : l),
  )

  return {
    locale,
    availableLocales,
    setLocale,
  }
}

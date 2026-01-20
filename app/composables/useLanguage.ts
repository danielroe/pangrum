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

export const useLanguage = createSharedComposable(function useLanguage() {
  const route = useRoute()
  const router = useRouter()
  const language = useLocalStorage<Language>('pangrum-language', isLanguage(route.query.lang) ? route.query.lang : 'en', {
    initOnMounted: true,
  })

  watch(language, newLang => router.push({ query: { ...route.query, lang: newLang } }), { immediate: true })

  return language
})

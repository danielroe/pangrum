import type { Language } from './useLanguage'

const WORDS_CACHE_NAME = 'words-api-cache-v1'

export interface CachedDatesState {
  /** Map of language -> Set of cached dates (YYYY-MM-DD) */
  dates: Map<Language, Set<string>>
  /** Whether we've loaded the cache data */
  loaded: boolean
}

export function useCachedDates() {
  const state = useState<CachedDatesState>('cached-dates', () => ({
    dates: new Map(),
    loaded: false,
  }))

  const isOnline = useOnline()

  async function loadCachedDates(): Promise<void> {
    if (!import.meta.client) return

    try {
      const cache = await caches.open(WORDS_CACHE_NAME)
      const keys = await cache.keys()

      const newDates = new Map<Language, Set<string>>()

      for (const request of keys) {
        const url = new URL(request.url)
        const match = url.pathname.match(WORDS_API_URL_PATTERN)
        if (match) {
          const lang = match[1] as Language
          const date = match[2]!

          if (!newDates.has(lang)) {
            newDates.set(lang, new Set())
          }
          newDates.get(lang)!.add(date)
        }
      }

      state.value = {
        dates: newDates,
        loaded: true,
      }
    }
    catch {
      // Cache API not available or failed
      state.value = {
        dates: new Map(),
        loaded: true,
      }
    }
  }

  function isCached(lang: Language, date: string): boolean {
    return state.value.dates.get(lang)?.has(date) ?? false
  }

  function isAvailable(lang: Language, date: string): boolean {
    if (isOnline.value) return true
    return isCached(lang, date)
  }

  function hasAnyCachedData(lang: Language): boolean {
    return (state.value.dates.get(lang)?.size ?? 0) > 0
  }

  function getCachedDates(lang: Language): Set<string> {
    return state.value.dates.get(lang) ?? new Set()
  }

  function getClosestAvailableDate(lang: Language, targetDate: string): string {
    if (isOnline.value) return targetDate
    if (isCached(lang, targetDate)) return targetDate

    return getClosestDate(getCachedDates(lang), targetDate)
  }

  // Load cache on mount and refresh periodically
  onMounted(() => {
    loadCachedDates()
  })

  // Refresh when coming back online (service worker may have prefetched)
  watch(isOnline, (online) => {
    if (online) {
      // Small delay to let service worker prefetch
      setTimeout(loadCachedDates, 1000)
    }
  })

  return {
    /** Whether the cache data has been loaded */
    loaded: computed(() => state.value.loaded),
    /** Check if a specific date is available (online or cached) */
    isAvailable,
    /** Check if a language has any cached data */
    hasAnyCachedData,
    /** Get all cached dates for a language */
    getCachedDates,
    /** Get the closest available date when offline */
    getClosestAvailableDate,
    /** Manually refresh the cache data */
    refresh: loadCachedDates,
  }
}

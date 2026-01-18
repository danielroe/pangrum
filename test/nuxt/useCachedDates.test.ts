import { beforeEach, describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { Language } from '../../app/composables/useLanguage'

// Test wrapper component that exposes useCachedDates with controlled state
const CachedDatesWrapper = defineComponent({
  setup() {
    const {
      loaded,
      isAvailable,
      hasAnyCachedData,
      getCachedDates,
      getClosestAvailableDate,
    } = useCachedDates()

    // Expose a way to manipulate the internal state for testing
    const state = useState<{
      dates: Map<Language, Set<string>>
      loaded: boolean
    }>('cached-dates')

    function setTestState(dates: Map<Language, Set<string>>, isLoaded = true) {
      state.value = { dates, loaded: isLoaded }
    }

    return {
      loaded,
      isAvailable,
      hasAnyCachedData,
      getCachedDates,
      getClosestAvailableDate,
      setTestState,
    }
  },
  template: '<div></div>',
})

describe('useCachedDates', () => {
  beforeEach(() => {
    // Reset the useState
    clearNuxtState('cached-dates')
  })

  describe('loaded state', () => {
    it('starts as not loaded', async () => {
      const wrapper = await mountSuspended(CachedDatesWrapper)

      expect(wrapper.vm.loaded).toBe(false)
    })

    it('becomes loaded after state is set', async () => {
      const wrapper = await mountSuspended(CachedDatesWrapper)

      wrapper.vm.setTestState(new Map(), true)
      await nextTick()

      expect(wrapper.vm.loaded).toBe(true)
    })
  })

  describe('hasAnyCachedData', () => {
    it('returns false when no data for language', async () => {
      const wrapper = await mountSuspended(CachedDatesWrapper)

      wrapper.vm.setTestState(new Map())
      await nextTick()

      expect(wrapper.vm.hasAnyCachedData('en')).toBe(false)
    })

    it('returns true when data exists for language', async () => {
      const wrapper = await mountSuspended(CachedDatesWrapper)

      const dates = new Map<Language, Set<string>>()
      dates.set('en', new Set(['2024-01-14', '2024-01-15']))

      wrapper.vm.setTestState(dates)
      await nextTick()

      expect(wrapper.vm.hasAnyCachedData('en')).toBe(true)
      expect(wrapper.vm.hasAnyCachedData('de')).toBe(false)
    })
  })

  describe('getCachedDates', () => {
    it('returns empty set when no data for language', async () => {
      const wrapper = await mountSuspended(CachedDatesWrapper)

      wrapper.vm.setTestState(new Map())
      await nextTick()

      const result = wrapper.vm.getCachedDates('en')
      expect(result.size).toBe(0)
    })

    it('returns cached dates for language', async () => {
      const wrapper = await mountSuspended(CachedDatesWrapper)

      const dates = new Map<Language, Set<string>>()
      dates.set('en', new Set(['2024-01-14', '2024-01-15']))

      wrapper.vm.setTestState(dates)
      await nextTick()

      const result = wrapper.vm.getCachedDates('en')
      expect(result.size).toBe(2)
      expect(result.has('2024-01-14')).toBe(true)
      expect(result.has('2024-01-15')).toBe(true)
    })
  })

  describe('isAvailable', () => {
    it('returns true when online regardless of cache', async () => {
      const wrapper = await mountSuspended(CachedDatesWrapper)

      // By default useOnline() returns true in test environment
      wrapper.vm.setTestState(new Map())
      await nextTick()

      expect(wrapper.vm.isAvailable('en', '2024-01-14')).toBe(true)
    })
  })

  describe('getClosestAvailableDate', () => {
    it('returns target date when online', async () => {
      const wrapper = await mountSuspended(CachedDatesWrapper)

      wrapper.vm.setTestState(new Map())
      await nextTick()

      // When online, should return the target date
      expect(wrapper.vm.getClosestAvailableDate('en', '2024-01-14')).toBe('2024-01-14')
    })
  })
})

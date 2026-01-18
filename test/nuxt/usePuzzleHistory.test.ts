import { beforeEach, describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { Language } from '../../app/composables/useLanguage'

// Test wrapper component that exposes usePuzzleHistory
const PuzzleHistoryWrapper = defineComponent({
  props: {
    language: {
      type: String as PropType<Language>,
      default: 'en',
    },
  },
  setup(props) {
    const langRef = toRef(props, 'language')
    const { historyMap, hasProgress, getProgress, stats, reload } = usePuzzleHistory(langRef)
    return { historyMap, hasProgress, getProgress, stats, reload }
  },
  template: '<div></div>',
})

describe('usePuzzleHistory', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('loading history from localStorage', () => {
    it('returns empty map when no data exists', async () => {
      const wrapper = await mountSuspended(PuzzleHistoryWrapper)

      wrapper.vm.reload()
      await nextTick()

      expect(wrapper.vm.historyMap.size).toBe(0)
    })

    it('loads puzzle progress from localStorage', async () => {
      localStorage.setItem('pangrum-en-2024-01-14', JSON.stringify(['WORD', 'TEST']))
      localStorage.setItem('pangrum-en-2024-01-15', JSON.stringify(['ANOTHER']))

      const wrapper = await mountSuspended(PuzzleHistoryWrapper)
      wrapper.vm.reload()
      await nextTick()

      expect(wrapper.vm.historyMap.size).toBe(2)
      expect(wrapper.vm.historyMap.has('2024-01-14')).toBe(true)
      expect(wrapper.vm.historyMap.has('2024-01-15')).toBe(true)
    })

    it('extracts word count from stored data', async () => {
      localStorage.setItem('pangrum-en-2024-01-14', JSON.stringify(['WORD', 'TEST', 'EXTRA']))

      const wrapper = await mountSuspended(PuzzleHistoryWrapper)
      wrapper.vm.reload()
      await nextTick()

      const progress = wrapper.vm.historyMap.get('2024-01-14')
      expect(progress?.wordsFound).toBe(3)
    })

    it('only loads data for the specified language', async () => {
      localStorage.setItem('pangrum-en-2024-01-14', JSON.stringify(['ENGLISH']))
      localStorage.setItem('pangrum-de-2024-01-14', JSON.stringify(['GERMAN']))

      const wrapper = await mountSuspended(PuzzleHistoryWrapper, {
        props: { language: 'en' },
      })
      wrapper.vm.reload()
      await nextTick()

      expect(wrapper.vm.historyMap.size).toBe(1)
      expect(wrapper.vm.historyMap.has('2024-01-14')).toBe(true)
    })

    it('ignores non-date-formatted keys', async () => {
      localStorage.setItem('pangrum-en-2024-01-14', JSON.stringify(['WORD']))
      localStorage.setItem('pangrum-en-ABCDEFG', JSON.stringify(['OLD_FORMAT']))
      localStorage.setItem('pangrum-en-incorrect-2024-01-14', JSON.stringify(['WRONG']))

      const wrapper = await mountSuspended(PuzzleHistoryWrapper)
      wrapper.vm.reload()
      await nextTick()

      expect(wrapper.vm.historyMap.size).toBe(1)
    })

    it('ignores malformed JSON', async () => {
      localStorage.setItem('pangrum-en-2024-01-14', JSON.stringify(['WORD']))
      localStorage.setItem('pangrum-en-2024-01-15', 'not valid json')

      const wrapper = await mountSuspended(PuzzleHistoryWrapper)
      wrapper.vm.reload()
      await nextTick()

      expect(wrapper.vm.historyMap.size).toBe(1)
    })

    it('ignores empty word arrays', async () => {
      localStorage.setItem('pangrum-en-2024-01-14', JSON.stringify(['WORD']))
      localStorage.setItem('pangrum-en-2024-01-15', JSON.stringify([]))

      const wrapper = await mountSuspended(PuzzleHistoryWrapper)
      wrapper.vm.reload()
      await nextTick()

      expect(wrapper.vm.historyMap.size).toBe(1)
    })
  })

  describe('hasProgress and getProgress', () => {
    it('hasProgress returns true for dates with progress', async () => {
      localStorage.setItem('pangrum-en-2024-01-14', JSON.stringify(['WORD']))

      const wrapper = await mountSuspended(PuzzleHistoryWrapper)
      wrapper.vm.reload()
      await nextTick()

      expect(wrapper.vm.hasProgress('2024-01-14')).toBe(true)
      expect(wrapper.vm.hasProgress('2024-01-15')).toBe(false)
    })

    it('getProgress returns progress data for existing dates', async () => {
      localStorage.setItem('pangrum-en-2024-01-14', JSON.stringify(['WORD', 'TEST']))

      const wrapper = await mountSuspended(PuzzleHistoryWrapper)
      wrapper.vm.reload()
      await nextTick()

      const progress = wrapper.vm.getProgress('2024-01-14')
      expect(progress).toBeDefined()
      expect(progress?.date).toBe('2024-01-14')
      expect(progress?.wordsFound).toBe(2)
    })

    it('getProgress returns undefined for missing dates', async () => {
      const wrapper = await mountSuspended(PuzzleHistoryWrapper)
      wrapper.vm.reload()
      await nextTick()

      expect(wrapper.vm.getProgress('2024-01-14')).toBeUndefined()
    })
  })

  describe('stats computed', () => {
    it('returns zeroes when no history exists', async () => {
      const wrapper = await mountSuspended(PuzzleHistoryWrapper)
      wrapper.vm.reload()
      await nextTick()

      expect(wrapper.vm.stats.totalDaysPlayed).toBe(0)
      expect(wrapper.vm.stats.currentStreak).toBe(0)
      expect(wrapper.vm.stats.longestStreak).toBe(0)
    })

    it('counts total days played', async () => {
      localStorage.setItem('pangrum-en-2024-01-10', JSON.stringify(['WORD']))
      localStorage.setItem('pangrum-en-2024-01-14', JSON.stringify(['WORD']))
      localStorage.setItem('pangrum-en-2024-01-15', JSON.stringify(['WORD']))

      const wrapper = await mountSuspended(PuzzleHistoryWrapper)
      wrapper.vm.reload()
      await nextTick()

      expect(wrapper.vm.stats.totalDaysPlayed).toBe(3)
    })

    it('calculates longest streak correctly', async () => {
      localStorage.setItem('pangrum-en-2024-01-10', JSON.stringify(['WORD']))
      localStorage.setItem('pangrum-en-2024-01-11', JSON.stringify(['WORD']))
      localStorage.setItem('pangrum-en-2024-01-12', JSON.stringify(['WORD']))

      const wrapper = await mountSuspended(PuzzleHistoryWrapper)
      wrapper.vm.reload()
      await nextTick()

      expect(wrapper.vm.stats.longestStreak).toBe(3)
    })
  })

  describe('reactive language changes', () => {
    it('loads data for specified language', async () => {
      localStorage.setItem('pangrum-en-2024-01-14', JSON.stringify(['ENGLISH']))
      localStorage.setItem('pangrum-de-2024-01-14', JSON.stringify(['GERMAN']))

      const wrapperEn = await mountSuspended(PuzzleHistoryWrapper, {
        props: { language: 'en' },
      })
      wrapperEn.vm.reload()
      await nextTick()

      expect(wrapperEn.vm.historyMap.size).toBe(1)

      const wrapperDe = await mountSuspended(PuzzleHistoryWrapper, {
        props: { language: 'de' },
      })
      wrapperDe.vm.reload()
      await nextTick()

      expect(wrapperDe.vm.historyMap.size).toBe(1)
    })
  })
})

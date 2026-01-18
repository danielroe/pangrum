import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { ShareData } from '../../app/utils/share'

// Test wrapper component that exposes useShare
const ShareWrapper = defineComponent({
  setup() {
    const {
      isShareSupported,
      isClipboardImageSupported,
      generateShareImage,
      shareResults,
    } = useShare()

    return {
      isShareSupported,
      isClipboardImageSupported,
      generateShareImage,
      shareResults,
    }
  },
  template: '<div></div>',
})

const sampleShareData: ShareData = {
  date: '2024-01-15',
  score: 42,
  maxScore: 100,
  wordsFound: 15,
  totalWords: 30,
  status: 'Great',
  pangrams: 1,
  totalPangrams: 2,
  letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
}

describe('useShare', () => {
  describe('isShareSupported', () => {
    it('returns a boolean value', async () => {
      const wrapper = await mountSuspended(ShareWrapper)

      expect(typeof wrapper.vm.isShareSupported).toBe('boolean')
    })
  })

  describe('isClipboardImageSupported', () => {
    it('returns a boolean value', async () => {
      const wrapper = await mountSuspended(ShareWrapper)

      expect(typeof wrapper.vm.isClipboardImageSupported).toBe('boolean')
    })

    it('returns true in Chromium (ClipboardItem is available)', async () => {
      const wrapper = await mountSuspended(ShareWrapper)

      // Chromium browsers support ClipboardItem
      expect(wrapper.vm.isClipboardImageSupported).toBe(true)
    })
  })

  describe('generateShareImage', () => {
    it('generates a PNG blob', async () => {
      const wrapper = await mountSuspended(ShareWrapper)

      const blob = await wrapper.vm.generateShareImage(sampleShareData)

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('image/png')
    })

    it('generates an image with reasonable size', async () => {
      const wrapper = await mountSuspended(ShareWrapper)

      const blob = await wrapper.vm.generateShareImage(sampleShareData)

      // A 600x400 PNG with content should be at least a few KB
      expect(blob.size).toBeGreaterThan(1000)
      // But not unreasonably large (should be under 100KB for this simple image)
      expect(blob.size).toBeLessThan(100000)
    })

    it('handles data with no pangrams', async () => {
      const wrapper = await mountSuspended(ShareWrapper)

      const dataWithNoPangrams: ShareData = {
        ...sampleShareData,
        pangrams: 0,
        totalPangrams: 0,
      }

      const blob = await wrapper.vm.generateShareImage(dataWithNoPangrams)

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('image/png')
    })

    it('handles high scores', async () => {
      const wrapper = await mountSuspended(ShareWrapper)

      const highScoreData: ShareData = {
        ...sampleShareData,
        score: 999,
        maxScore: 999,
        wordsFound: 100,
        totalWords: 100,
        status: 'Perfect',
      }

      const blob = await wrapper.vm.generateShareImage(highScoreData)

      expect(blob).toBeInstanceOf(Blob)
    })

    it('handles zero score', async () => {
      const wrapper = await mountSuspended(ShareWrapper)

      const zeroScoreData: ShareData = {
        ...sampleShareData,
        score: 0,
        wordsFound: 0,
        status: 'Beginner',
      }

      const blob = await wrapper.vm.generateShareImage(zeroScoreData)

      expect(blob).toBeInstanceOf(Blob)
    })
  })

  describe('shareResults', () => {
    it('generates share data with correct file metadata', async () => {
      const wrapper = await mountSuspended(ShareWrapper)

      // We can't fully test shareResults because navigator.share requires user gesture
      // But we can test generateShareImage which is the core of shareResults
      const blob = await wrapper.vm.generateShareImage(sampleShareData)
      const file = new File([blob], `pangrum-${sampleShareData.date}.png`, { type: 'image/png' })

      expect(file.name).toBe('pangrum-2024-01-15.png')
      expect(file.type).toBe('image/png')
      expect(file.size).toBeGreaterThan(0)
    })
  })
})

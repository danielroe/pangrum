import { beforeEach, describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

// Test wrapper component that exposes useSyncCode
const SyncCodeWrapper = defineComponent({
  setup() {
    const { syncCode, isEnabled, enable, disable, generateCode } = useSyncCode()
    return { syncCode, isEnabled, enable, disable, generateCode }
  },
  template: '<div></div>',
})

describe('useSyncCode', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('initial state', () => {
    it('starts with null syncCode when no localStorage value', async () => {
      const wrapper = await mountSuspended(SyncCodeWrapper)

      expect(wrapper.vm.syncCode).toBeNull()
    })

    it('isEnabled is false when syncCode is null', async () => {
      const wrapper = await mountSuspended(SyncCodeWrapper)

      expect(wrapper.vm.isEnabled).toBe(false)
    })

    it('loads syncCode set by enable()', async () => {
      // Test that enabling sync persists and can be read back
      const wrapper = await mountSuspended(SyncCodeWrapper)

      wrapper.vm.enable('abc123')
      await nextTick()

      expect(wrapper.vm.syncCode).toBe('abc123')
      expect(wrapper.vm.isEnabled).toBe(true)
    })
  })

  describe('enable', () => {
    it('generates a code when called without argument', async () => {
      const wrapper = await mountSuspended(SyncCodeWrapper)

      wrapper.vm.enable()
      await nextTick()

      expect(wrapper.vm.syncCode).not.toBeNull()
      expect(wrapper.vm.syncCode).toHaveLength(6)
      expect(wrapper.vm.isEnabled).toBe(true)
    })

    it('uses provided code when given', async () => {
      const wrapper = await mountSuspended(SyncCodeWrapper)

      wrapper.vm.enable('mycode')
      await nextTick()

      expect(wrapper.vm.syncCode).toBe('mycode')
    })

    it('normalizes code to lowercase', async () => {
      const wrapper = await mountSuspended(SyncCodeWrapper)

      wrapper.vm.enable('MYCODE')
      await nextTick()

      expect(wrapper.vm.syncCode).toBe('mycode')
    })

    it('trims whitespace from code', async () => {
      const wrapper = await mountSuspended(SyncCodeWrapper)

      wrapper.vm.enable('  mycode  ')
      await nextTick()

      expect(wrapper.vm.syncCode).toBe('mycode')
    })

    it('normalizes and trims together', async () => {
      const wrapper = await mountSuspended(SyncCodeWrapper)

      wrapper.vm.enable('  MYCODE  ')
      await nextTick()

      expect(wrapper.vm.syncCode).toBe('mycode')
    })
  })

  describe('disable', () => {
    it('sets syncCode to null', async () => {
      const wrapper = await mountSuspended(SyncCodeWrapper)

      wrapper.vm.enable('mycode')
      await nextTick()
      expect(wrapper.vm.isEnabled).toBe(true)

      wrapper.vm.disable()
      await nextTick()

      expect(wrapper.vm.syncCode).toBeNull()
      expect(wrapper.vm.isEnabled).toBe(false)
    })

    it('removes has-synced flag from localStorage', async () => {
      localStorage.setItem('pangrum-has-synced', 'true')

      const wrapper = await mountSuspended(SyncCodeWrapper)
      wrapper.vm.enable('mycode')
      await nextTick()

      wrapper.vm.disable()
      await nextTick()

      expect(localStorage.getItem('pangrum-has-synced')).toBeNull()
    })
  })

  describe('isEnabled computed', () => {
    it('returns false for null code', async () => {
      const wrapper = await mountSuspended(SyncCodeWrapper)

      expect(wrapper.vm.isEnabled).toBe(false)
    })

    it('returns true for valid code', async () => {
      const wrapper = await mountSuspended(SyncCodeWrapper)

      wrapper.vm.enable('abc123')
      await nextTick()

      expect(wrapper.vm.isEnabled).toBe(true)
    })
  })

  describe('generateCode', () => {
    it('exposes generateSyncCode utility', async () => {
      const wrapper = await mountSuspended(SyncCodeWrapper)

      const code = wrapper.vm.generateCode()

      expect(code).toHaveLength(6)
      expect(code).toBe(code.toLowerCase())
    })

    it('generates unique codes', async () => {
      const wrapper = await mountSuspended(SyncCodeWrapper)

      const codes = new Set<string>()
      for (let i = 0; i < 20; i++) {
        codes.add(wrapper.vm.generateCode())
      }

      expect(codes.size).toBeGreaterThan(15)
    })
  })
})

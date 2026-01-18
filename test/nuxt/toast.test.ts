import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import type { Toast } from '../../app/utils/toast'

// Test wrapper component that exposes toast functionality
const ToastWrapper = defineComponent({
  setup() {
    const toasts = useToasts()

    function add(toast: Toast) {
      addToast(toast)
    }

    function clear() {
      toasts.value = []
    }

    return { toasts, add, clear }
  },
  template: '<div></div>',
})

describe('toast system', () => {
  describe('useToasts', () => {
    it('starts with empty toast array', async () => {
      const wrapper = await mountSuspended(ToastWrapper)
      wrapper.vm.clear()

      expect(wrapper.vm.toasts).toEqual([])
    })
  })

  describe('addToast', () => {
    it('adds a toast to the array', async () => {
      const wrapper = await mountSuspended(ToastWrapper)
      wrapper.vm.clear()

      wrapper.vm.add({ message: 'Test message' })
      await nextTick()

      expect(wrapper.vm.toasts).toHaveLength(1)
      expect(wrapper.vm.toasts[0]?.message).toBe('Test message')
    })

    it('adds multiple toasts', async () => {
      const wrapper = await mountSuspended(ToastWrapper)
      wrapper.vm.clear()

      wrapper.vm.add({ message: 'First' })
      wrapper.vm.add({ message: 'Second' })
      await nextTick()

      expect(wrapper.vm.toasts).toHaveLength(2)
    })

    it('preserves toast type', async () => {
      const wrapper = await mountSuspended(ToastWrapper)
      wrapper.vm.clear()

      wrapper.vm.add({ message: 'Success!', type: 'success' })
      await nextTick()

      expect(wrapper.vm.toasts[0]?.type).toBe('success')
    })

    it('preserves custom duration in toast object', async () => {
      const wrapper = await mountSuspended(ToastWrapper)
      wrapper.vm.clear()

      wrapper.vm.add({ message: 'Custom', duration: 5000 })
      await nextTick()

      expect(wrapper.vm.toasts[0]?.duration).toBe(5000)
    })

    it('handles all toast types', async () => {
      const wrapper = await mountSuspended(ToastWrapper)
      wrapper.vm.clear()

      wrapper.vm.add({ message: 'Info', type: 'info' })
      wrapper.vm.add({ message: 'Success', type: 'success' })
      wrapper.vm.add({ message: 'Error', type: 'error' })
      wrapper.vm.add({ message: 'Celebration', type: 'celebration' })
      await nextTick()

      expect(wrapper.vm.toasts).toHaveLength(4)
      expect(wrapper.vm.toasts.map(t => t.type)).toEqual(['info', 'success', 'error', 'celebration'])
    })
  })
})

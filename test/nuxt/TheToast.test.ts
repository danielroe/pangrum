import { beforeEach, describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { TheToast } from '#components'
import type { Toast } from '../../app/utils/toast'

// Wrapper component that provides toast state
const ToastTestWrapper = defineComponent({
  components: { TheToast },
  setup() {
    const toasts = useToasts()

    function addTestToast(toast: Toast) {
      toasts.value.push(toast)
    }

    function clearToasts() {
      toasts.value = []
    }

    return { toasts, addTestToast, clearToasts }
  },
  template: '<TheToast />',
})

describe('TheToast', () => {
  beforeEach(async () => {
    // Clear any existing toasts
    const wrapper = await mountSuspended(ToastTestWrapper)
    wrapper.vm.clearToasts()
  })

  describe('rendering', () => {
    it('renders nothing when no toasts exist', async () => {
      const wrapper = await mountSuspended(ToastTestWrapper)
      wrapper.vm.clearToasts()
      await nextTick()

      const toast = wrapper.find('.toast')
      expect(toast.exists()).toBe(false)
    })

    it('renders toast message when toast exists', async () => {
      const wrapper = await mountSuspended(ToastTestWrapper)
      wrapper.vm.clearToasts()

      wrapper.vm.addTestToast({ message: 'Test message' })
      await nextTick()

      const toast = wrapper.find('.toast')
      expect(toast.exists()).toBe(true)
      expect(toast.text()).toBe('Test message')
    })

    it('renders only the first toast', async () => {
      const wrapper = await mountSuspended(ToastTestWrapper)
      wrapper.vm.clearToasts()

      wrapper.vm.addTestToast({ message: 'First' })
      wrapper.vm.addTestToast({ message: 'Second' })
      await nextTick()

      const toasts = wrapper.findAll('.toast')
      expect(toasts).toHaveLength(1)
      expect(toasts[0]?.text()).toBe('First')
    })
  })

  describe('accessibility', () => {
    it('has role="status"', async () => {
      const wrapper = await mountSuspended(ToastTestWrapper)

      const container = wrapper.find('[role="status"]')
      expect(container.exists()).toBe(true)
    })

    it('has aria-live="polite"', async () => {
      const wrapper = await mountSuspended(ToastTestWrapper)

      const container = wrapper.find('[aria-live="polite"]')
      expect(container.exists()).toBe(true)
    })

    it('has aria-atomic="true"', async () => {
      const wrapper = await mountSuspended(ToastTestWrapper)

      const container = wrapper.find('[aria-atomic="true"]')
      expect(container.exists()).toBe(true)
    })
  })

  describe('toast types', () => {
    it('applies success class for success toasts', async () => {
      const wrapper = await mountSuspended(ToastTestWrapper)
      wrapper.vm.clearToasts()

      wrapper.vm.addTestToast({ message: 'Success!', type: 'success' })
      await nextTick()

      const toast = wrapper.find('.toast')
      expect(toast.classes()).toContain('toast-success')
    })

    it('applies error class for error toasts', async () => {
      const wrapper = await mountSuspended(ToastTestWrapper)
      wrapper.vm.clearToasts()

      wrapper.vm.addTestToast({ message: 'Error!', type: 'error' })
      await nextTick()

      const toast = wrapper.find('.toast')
      expect(toast.classes()).toContain('toast-error')
    })

    it('applies celebration class for celebration toasts', async () => {
      const wrapper = await mountSuspended(ToastTestWrapper)
      wrapper.vm.clearToasts()

      wrapper.vm.addTestToast({ message: 'Pangram!', type: 'celebration' })
      await nextTick()

      const toast = wrapper.find('.toast')
      expect(toast.classes()).toContain('toast-celebration')
    })

    it('applies info class for info toasts', async () => {
      const wrapper = await mountSuspended(ToastTestWrapper)
      wrapper.vm.clearToasts()

      wrapper.vm.addTestToast({ message: 'Info', type: 'info' })
      await nextTick()

      const toast = wrapper.find('.toast')
      expect(toast.classes()).toContain('toast-info')
    })

    it('applies info class when no type specified', async () => {
      const wrapper = await mountSuspended(ToastTestWrapper)
      wrapper.vm.clearToasts()

      wrapper.vm.addTestToast({ message: 'Default' })
      await nextTick()

      const toast = wrapper.find('.toast')
      expect(toast.classes()).toContain('toast-info')
    })
  })

  describe('styling', () => {
    it('has rounded-full class for pill shape', async () => {
      const wrapper = await mountSuspended(ToastTestWrapper)
      wrapper.vm.clearToasts()

      wrapper.vm.addTestToast({ message: 'Test' })
      await nextTick()

      const toast = wrapper.find('.toast')
      expect(toast.classes()).toContain('rounded-full')
    })

    it('is positioned fixed in center', async () => {
      const wrapper = await mountSuspended(ToastTestWrapper)

      const container = wrapper.find('.fixed.inset-0')
      expect(container.exists()).toBe(true)
    })

    it('is non-interactive (pointer-events-none)', async () => {
      const wrapper = await mountSuspended(ToastTestWrapper)

      const container = wrapper.find('.pointer-events-none')
      expect(container.exists()).toBe(true)
    })
  })
})

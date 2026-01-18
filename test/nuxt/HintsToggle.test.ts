import { beforeEach, describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { HintsToggle } from '#components'

describe('HintsToggle', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('rendering', () => {
    it('renders mobile button', async () => {
      const component = await mountSuspended(HintsToggle)

      // Mobile button has specific classes
      const mobileButton = component.find('button.flex.sm\\:hidden')
      expect(mobileButton.exists()).toBe(true)
    })

    it('renders desktop button', async () => {
      const component = await mountSuspended(HintsToggle)

      // Desktop button has specific classes
      const desktopButton = component.find('button.hidden.sm\\:flex')
      expect(desktopButton.exists()).toBe(true)
    })

    it('has lightbulb icon', async () => {
      const component = await mountSuspended(HintsToggle)

      const icon = component.find('.i-lucide-lightbulb')
      expect(icon.exists()).toBe(true)
    })
  })

  describe('accessibility', () => {
    it('has aria-pressed attribute', async () => {
      const component = await mountSuspended(HintsToggle)

      const buttons = component.findAll('button')
      for (const button of buttons) {
        expect(button.attributes('aria-pressed')).toBeDefined()
      }
    })

    it('has aria-label on mobile button', async () => {
      const component = await mountSuspended(HintsToggle)

      const mobileButton = component.find('button.flex.sm\\:hidden')
      expect(mobileButton.attributes('aria-label')).toBeDefined()
    })
  })

  describe('toggle interaction', () => {
    it('toggles hints when clicked', async () => {
      const component = await mountSuspended(HintsToggle)

      // Find the mobile button and check initial state
      const mobileButton = component.find('button.flex.sm\\:hidden')
      const initialPressed = mobileButton.attributes('aria-pressed')

      // Click to toggle
      await mobileButton.trigger('click')
      await nextTick()

      // Re-find the button (DOM may have changed)
      const updatedButton = component.find('button.flex.sm\\:hidden')
      const newPressed = updatedButton.attributes('aria-pressed')

      // State should have toggled
      expect(newPressed).not.toBe(initialPressed)
    })

    it('toggles state with desktop button', async () => {
      const component = await mountSuspended(HintsToggle)

      const desktopButton = component.find('button.hidden.sm\\:flex')
      const initialPressed = desktopButton.attributes('aria-pressed')

      await desktopButton.trigger('click')
      await nextTick()

      const updatedButton = component.find('button.hidden.sm\\:flex')
      const newPressed = updatedButton.attributes('aria-pressed')

      expect(newPressed).not.toBe(initialPressed)
    })
  })

  describe('visual states', () => {
    it('applies active border class when enabled', async () => {
      const component = await mountSuspended(HintsToggle)

      // Toggle to enabled state
      const button = component.find('button.flex.sm\\:hidden')
      if (button.attributes('aria-pressed') === 'false') {
        await button.trigger('click')
        await nextTick()
      }

      const updatedButton = component.find('button.flex.sm\\:hidden')
      expect(updatedButton.classes()).toContain('border-primary-border')
    })

    it('applies muted border class when disabled', async () => {
      const component = await mountSuspended(HintsToggle)

      // Toggle to disabled state
      const button = component.find('button.flex.sm\\:hidden')
      if (button.attributes('aria-pressed') === 'true') {
        await button.trigger('click')
        await nextTick()
      }

      const updatedButton = component.find('button.flex.sm\\:hidden')
      expect(updatedButton.classes()).toContain('border-muted')
    })
  })
})

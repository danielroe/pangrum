import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { defineComponent, h } from 'vue'

describe('component test example', () => {
  it('can mount components', async () => {
    const TestComponent = defineComponent({
      setup() {
        return () => h('div', 'Hello Nuxt!')
      },
    })

    const component = await mountSuspended(TestComponent)

    expect(component.text()).toBe('Hello Nuxt!')
  })
})

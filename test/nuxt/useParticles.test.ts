import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'

// Test wrapper component that exposes useParticles
const ParticlesWrapper = defineComponent({
  setup() {
    const { particles, isAnimating, triggerCelebration } = useParticles()

    return {
      particles,
      isAnimating,
      triggerCelebration,
    }
  },
  template: '<div></div>',
})

describe('useParticles', () => {
  describe('triggerCelebration', () => {
    it('adds 40 particles when triggered', async () => {
      const wrapper = await mountSuspended(ParticlesWrapper)
      const initialCount = wrapper.vm.particles.length

      wrapper.vm.triggerCelebration(300, 200)
      await nextTick()

      expect(wrapper.vm.particles.length).toBe(initialCount + 40)
    })

    it('sets isAnimating to true when particles exist', async () => {
      const wrapper = await mountSuspended(ParticlesWrapper)

      wrapper.vm.triggerCelebration(300, 200)
      await nextTick()

      expect(wrapper.vm.isAnimating).toBe(true)
    })

    it('creates particles with valid properties', async () => {
      const wrapper = await mountSuspended(ParticlesWrapper)
      const initialCount = wrapper.vm.particles.length

      wrapper.vm.triggerCelebration(300, 200)
      await nextTick()

      // Check the most recently added particle
      const particle = wrapper.vm.particles[initialCount]
      expect(particle).toBeDefined()
      expect(typeof particle!.x).toBe('number')
      expect(typeof particle!.y).toBe('number')
      expect(typeof particle!.vx).toBe('number')
      expect(typeof particle!.vy).toBe('number')
      expect(typeof particle!.radius).toBe('number')
      expect(typeof particle!.color).toBe('string')
      expect(typeof particle!.alpha).toBe('number')
      expect(typeof particle!.decay).toBe('number')
    })

    it('creates particles with valid colors from palette', async () => {
      const wrapper = await mountSuspended(ParticlesWrapper)
      const validColors = ['#14b8a6', '#2dd4bf', '#f59e0b', '#fbbf24', '#ffffff']
      const initialCount = wrapper.vm.particles.length

      wrapper.vm.triggerCelebration(300, 200)
      await nextTick()

      // Check the newly added particles
      const newParticles = wrapper.vm.particles.slice(initialCount)
      expect(newParticles.length).toBe(40)

      for (const particle of newParticles) {
        expect(validColors).toContain(particle.color)
      }
    })

    it('creates particles at specified position', async () => {
      const wrapper = await mountSuspended(ParticlesWrapper)
      const initialCount = wrapper.vm.particles.length

      wrapper.vm.triggerCelebration(150, 250)
      await nextTick()

      // Check newly added particles start at the specified position
      const newParticles = wrapper.vm.particles.slice(initialCount)
      for (const particle of newParticles) {
        expect(particle.x).toBe(150)
        expect(particle.y).toBe(250)
      }
    })

    it('creates particles with initial alpha of 1', async () => {
      const wrapper = await mountSuspended(ParticlesWrapper)
      const initialCount = wrapper.vm.particles.length

      wrapper.vm.triggerCelebration(300, 200)
      await nextTick()

      const newParticles = wrapper.vm.particles.slice(initialCount)
      for (const particle of newParticles) {
        expect(particle.alpha).toBe(1)
      }
    })

    it('creates particles with radius between 2 and 6', async () => {
      const wrapper = await mountSuspended(ParticlesWrapper)
      const initialCount = wrapper.vm.particles.length

      wrapper.vm.triggerCelebration(300, 200)
      await nextTick()

      const newParticles = wrapper.vm.particles.slice(initialCount)
      for (const particle of newParticles) {
        expect(particle.radius).toBeGreaterThanOrEqual(2)
        expect(particle.radius).toBeLessThanOrEqual(6)
      }
    })

    it('accumulates particles when triggered multiple times', async () => {
      const wrapper = await mountSuspended(ParticlesWrapper)
      const initialCount = wrapper.vm.particles.length

      wrapper.vm.triggerCelebration(300, 200)
      await nextTick()
      expect(wrapper.vm.particles.length).toBe(initialCount + 40)

      wrapper.vm.triggerCelebration(300, 200)
      await nextTick()
      expect(wrapper.vm.particles.length).toBe(initialCount + 80)
    })
  })

  describe('particle physics', () => {
    it('particles have velocity components', async () => {
      const wrapper = await mountSuspended(ParticlesWrapper)
      const initialCount = wrapper.vm.particles.length

      wrapper.vm.triggerCelebration(300, 200)
      await nextTick()

      const newParticles = wrapper.vm.particles.slice(initialCount)
      for (const particle of newParticles) {
        // Velocity should be non-zero (particles move)
        expect(particle.vx !== 0 || particle.vy !== 0).toBe(true)
      }
    })

    it('particles have decay rate', async () => {
      const wrapper = await mountSuspended(ParticlesWrapper)
      const initialCount = wrapper.vm.particles.length

      wrapper.vm.triggerCelebration(300, 200)
      await nextTick()

      const newParticles = wrapper.vm.particles.slice(initialCount)
      for (const particle of newParticles) {
        // Decay should be positive (particles fade out)
        expect(particle.decay).toBeGreaterThan(0)
        expect(particle.decay).toBeLessThan(0.03) // max is 0.025
      }
    })
  })
})

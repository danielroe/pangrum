import { beforeEach, describe, expect, it } from 'vitest'

/**
 * Helper to reset tutorial state to initial values.
 * useState persists across tests, so we need to manually reset.
 */
function resetTutorialState() {
  const { currentStep, showTutorial } = useTutorial()
  currentStep.value = 0
  showTutorial.value = false
}

describe('useTutorial', () => {
  beforeEach(() => {
    localStorage.clear()
    resetTutorialState()
  })

  describe('step navigation', () => {
    it('starts at step 0 after reset', () => {
      const { currentStep } = useTutorial()
      expect(currentStep.value).toBe(0)
    })

    it('advances to next step', () => {
      const { currentStep, nextStep } = useTutorial()

      nextStep()

      expect(currentStep.value).toBe(1)
    })

    it('goes back to previous step', () => {
      const { currentStep, nextStep, previousStep } = useTutorial()

      nextStep()
      nextStep()
      previousStep()

      expect(currentStep.value).toBe(1)
    })

    it('does not go below step 0', () => {
      const { currentStep, previousStep } = useTutorial()

      previousStep()
      previousStep()

      expect(currentStep.value).toBe(0)
    })

    it('completes tutorial when advancing past last step', () => {
      const { nextStep, showTutorial, totalSteps, startTutorial } = useTutorial()

      startTutorial()
      expect(showTutorial.value).toBe(true)

      // Advance through all steps
      for (let i = 0; i < totalSteps; i++) {
        nextStep()
      }

      expect(showTutorial.value).toBe(false)
    })
  })

  describe('step indicators', () => {
    it('identifies first step correctly', () => {
      const { isFirstStep, nextStep, previousStep } = useTutorial()

      expect(isFirstStep.value).toBe(true)

      nextStep()
      expect(isFirstStep.value).toBe(false)

      previousStep()
      expect(isFirstStep.value).toBe(true)
    })

    it('identifies last step correctly', () => {
      const { isLastStep, nextStep, totalSteps, startTutorial } = useTutorial()

      startTutorial()
      expect(isLastStep.value).toBe(false)

      // Go to last step (totalSteps - 1 advances)
      for (let i = 0; i < totalSteps - 1; i++) {
        nextStep()
      }

      expect(isLastStep.value).toBe(true)
    })

    it('provides current step ID', () => {
      const { currentStepId, nextStep } = useTutorial()

      expect(currentStepId.value).toBe('welcome')

      nextStep()
      expect(currentStepId.value).toBe('letters')
    })
  })

  describe('tutorial visibility', () => {
    it('starts hidden', () => {
      const { showTutorial } = useTutorial()
      expect(showTutorial.value).toBe(false)
    })

    it('shows when started', () => {
      const { showTutorial, startTutorial } = useTutorial()

      startTutorial()

      expect(showTutorial.value).toBe(true)
    })

    it('hides when skipped', () => {
      const { showTutorial, startTutorial, skipTutorial } = useTutorial()

      startTutorial()
      skipTutorial()

      expect(showTutorial.value).toBe(false)
    })

    it('hides when completed', () => {
      const { showTutorial, startTutorial, completeTutorial } = useTutorial()

      startTutorial()
      completeTutorial()

      expect(showTutorial.value).toBe(false)
    })

    it('resets to step 0 when restarted', () => {
      const { currentStep, nextStep, startTutorial } = useTutorial()

      // Advance partway through
      nextStep()
      nextStep()
      expect(currentStep.value).toBe(2)

      // Restart
      startTutorial()
      expect(currentStep.value).toBe(0)
    })
  })

  describe('first visit detection', () => {
    it('starts tutorial for first-time visitors', () => {
      const { showTutorial, checkFirstVisit } = useTutorial()

      checkFirstVisit()

      expect(showTutorial.value).toBe(true)
    })

    it('does not start tutorial for returning visitors', () => {
      // Simulate a returning visitor
      localStorage.setItem('pangrum-tutorial-seen', 'true')

      const { showTutorial, checkFirstVisit } = useTutorial()

      checkFirstVisit()

      expect(showTutorial.value).toBe(false)
    })

    it('marks tutorial as seen after completion', () => {
      const { completeTutorial } = useTutorial()

      completeTutorial()

      expect(localStorage.getItem('pangrum-tutorial-seen')).toBe('true')
    })

    it('marks tutorial as seen after skipping', () => {
      const { skipTutorial } = useTutorial()

      skipTutorial()

      expect(localStorage.getItem('pangrum-tutorial-seen')).toBe('true')
    })
  })
})

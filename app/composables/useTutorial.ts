export interface TutorialStep {
  id: string
  title: string
  content: string
  highlight?: 'letters' | 'centre' | 'input' | 'score' | 'hints'
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Pangrum',
    content: 'Create words using the letters shown. Each puzzle has a unique set of 7 letters and dozens of valid words to find.',
  },
  {
    id: 'letters',
    title: 'Using the Letters',
    content: 'Tap or click the letters to build words. You can also type on your keyboard. Use each letter as many times as you like.',
    highlight: 'letters',
  },
  {
    id: 'centre',
    title: 'The Centre Letter',
    content: 'Every word must include the highlighted centre letter. Words without it won\'t be accepted.',
    highlight: 'centre',
  },
  {
    id: 'scoring',
    title: 'Scoring',
    content: '4-letter words score 1 point. Longer words score 1 point per letter. Reach higher tiers by earning more points!',
    highlight: 'score',
  },
  {
    id: 'pangrams',
    title: 'Pangrams',
    content: 'A pangram uses all 7 letters at least once. These special words earn 7 bonus points and are marked with a star.',
    highlight: 'letters',
  },
  {
    id: 'hints',
    title: 'Need Help?',
    content: 'Enable hints to see how many words start with each letter pair, and track your progress. Toggle hints with the lightbulb icon.',
    highlight: 'hints',
  },
]

export function useTutorial() {
  const hasSeenTutorial = useLocalStorage('pangrum-tutorial-seen', false)
  const showTutorial = ref(false)
  const currentStep = ref(0)

  function startTutorial() {
    currentStep.value = 0
    showTutorial.value = true
  }

  function nextStep() {
    if (currentStep.value < TUTORIAL_STEPS.length - 1) {
      currentStep.value++
    }
    else {
      completeTutorial()
    }
  }

  function previousStep() {
    if (currentStep.value > 0) {
      currentStep.value--
    }
  }

  function completeTutorial() {
    hasSeenTutorial.value = true
    showTutorial.value = false
  }

  function skipTutorial() {
    hasSeenTutorial.value = true
    showTutorial.value = false
  }

  // Auto-show for first-time visitors
  function checkFirstVisit() {
    if (!hasSeenTutorial.value) {
      startTutorial()
    }
  }

  return {
    hasSeenTutorial,
    showTutorial,
    currentStep,
    currentStepData: computed(() => TUTORIAL_STEPS[currentStep.value]),
    totalSteps: TUTORIAL_STEPS.length,
    isFirstStep: computed(() => currentStep.value === 0),
    isLastStep: computed(() => currentStep.value === TUTORIAL_STEPS.length - 1),
    startTutorial,
    nextStep,
    previousStep,
    completeTutorial,
    skipTutorial,
    checkFirstVisit,
  }
}

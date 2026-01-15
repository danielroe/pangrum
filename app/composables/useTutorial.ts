export interface TutorialStep {
  id: string
  highlight?: 'letters' | 'centre' | 'input' | 'score' | 'hints'
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  { id: 'welcome' },
  { id: 'letters', highlight: 'letters' },
  { id: 'centre', highlight: 'centre' },
  { id: 'scoring', highlight: 'score' },
  { id: 'pangrams', highlight: 'letters' },
  { id: 'hints', highlight: 'hints' },
]

const STORAGE_KEY = 'pangrum-tutorial-seen'

function markTutorialSeen() {
  if (import.meta.client) {
    localStorage.setItem(STORAGE_KEY, 'true')
  }
}

function hasSeen() {
  if (import.meta.client) {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  }
  return false
}

export function useTutorial() {
  const showTutorial = useState('tutorial-show', () => false)
  const currentStep = useState('tutorial-step', () => 0)

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
    markTutorialSeen()
    showTutorial.value = false
  }

  function skipTutorial() {
    markTutorialSeen()
    showTutorial.value = false
  }

  // Auto-show for first-time visitors
  function checkFirstVisit() {
    if (!hasSeen()) {
      startTutorial()
    }
  }

  return {
    showTutorial,
    currentStep,
    currentStepId: computed(() => TUTORIAL_STEPS[currentStep.value]?.id),
    currentStepHighlight: computed(() => TUTORIAL_STEPS[currentStep.value]?.highlight),
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

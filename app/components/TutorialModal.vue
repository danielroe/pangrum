<script setup lang="ts">
const emit = defineEmits<{
  close: []
}>()

const {
  currentStep,
  currentStepData,
  totalSteps,
  isFirstStep,
  isLastStep,
  nextStep,
  previousStep,
  skipTutorial,
  completeTutorial,
} = useTutorial()

const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')

onMounted(() => {
  dialogRef.value?.showModal()
})

onBeforeUnmount(() => {
  if (dialogRef.value?.open) {
    dialogRef.value.close()
  }
})

function handleClick(event: MouseEvent) {
  if (event.target === dialogRef.value) {
    handleSkip()
  }
}

function handleSkip() {
  skipTutorial()
  emit('close')
}

function handleDialogClose() {
  skipTutorial()
  emit('close')
}

function handleNext() {
  if (isLastStep.value) {
    completeTutorial()
    emit('close')
  }
  else {
    nextStep()
  }
}

function handlePrevious() {
  previousStep()
}

// Keyboard navigation
onKeyStroke('ArrowRight', handleNext)
onKeyStroke('ArrowLeft', () => {
  if (!isFirstStep.value) handlePrevious()
})
onKeyStroke('Escape', handleSkip)
</script>

<template>
  <dialog
    ref="dialog"
    class="tutorial-modal fixed m-0 max-w-full bg-surface border-2 border-solid border-muted w-full sm:w-auto sm:min-w-md sm:max-w-lg max-h-[90vh] sm:max-h-[80vh] flex flex-col overflow-hidden p-0"
    @close="handleDialogClose"
    @click="handleClick"
  >
    <div class="flex justify-between items-center p-4 border-b-2 border-solid border-muted">
      <div class="flex items-center gap-3">
        <span class="text-primary font-mono text-sm">
          {{ currentStep + 1 }}/{{ totalSteps }}
        </span>
        <h3 class="text-on-surface font-mono font-bold text-lg m-0">
          {{ currentStepData?.title }}
        </h3>
      </div>
      <button
        type="button"
        class="text-muted-foreground text-sm font-mono border-0 bg-transparent cursor-pointer p-2 -m-2 hover:text-on-surface transition-colors duration-150"
        @click="handleSkip"
      >
        Skip
      </button>
    </div>

    <div class="p-6 flex-grow flex flex-col gap-6">
      <div class="flex justify-center gap-2">
        <button
          v-for="(_, index) in totalSteps"
          :key="index"
          type="button"
          class="w-2 h-2 rounded-full border-0 cursor-pointer transition-all duration-200"
          :class="index === currentStep
            ? 'bg-primary w-6'
            : index < currentStep
              ? 'bg-primary/50 hover:bg-primary/70'
              : 'bg-muted hover:bg-muted-foreground'"
          :aria-label="`Go to step ${index + 1}`"
          @click="currentStep = index"
        />
      </div>

      <div class="flex justify-center py-4">
        <div
          class="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl"
          :class="currentStepData?.highlight === 'centre'
            ? 'bg-primary/20 text-primary'
            : 'bg-surface-elevated text-on-surface'"
        >
          <template v-if="currentStepData?.id === 'welcome'">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-primary"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </template>
          <template v-else-if="currentStepData?.id === 'letters'">
            <div class="flex flex-wrap gap-1 justify-center">
              <span class="w-6 h-6 bg-surface-elevated rounded text-xs flex items-center justify-center font-mono font-bold">A</span>
              <span class="w-6 h-6 bg-surface-elevated rounded text-xs flex items-center justify-center font-mono font-bold">B</span>
              <span class="w-6 h-6 bg-surface-elevated rounded text-xs flex items-center justify-center font-mono font-bold">C</span>
            </div>
          </template>
          <template v-else-if="currentStepData?.id === 'centre'">
            <span class="font-mono font-bold">★</span>
          </template>
          <template v-else-if="currentStepData?.id === 'scoring'">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 20V10" />
              <path d="M18 20V4" />
              <path d="M6 20v-4" />
            </svg>
          </template>
          <template v-else-if="currentStepData?.id === 'pangrams'">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="text-celebration"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </template>
          <template v-else-if="currentStepData?.id === 'hints'">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="text-primary"
            >
              <path d="M9 18h6" />
              <path d="M10 22h4" />
              <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
            </svg>
          </template>
        </div>
      </div>

      <p class="text-on-surface font-mono text-base text-center leading-relaxed m-0">
        {{ currentStepData?.content }}
      </p>
    </div>

    <div class="p-4 border-t-2 border-solid border-muted flex gap-3">
      <button
        v-if="!isFirstStep"
        type="button"
        class="px-4 py-3 font-mono text-sm border-2 border-solid border-muted bg-surface-elevated text-on-surface cursor-pointer transition-colors duration-150 hover:bg-surface-hover flex items-center gap-2"
        @click="handlePrevious"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>
      <button
        type="button"
        class="flex-1 px-4 py-3 font-mono text-sm border-2 border-solid border-primary bg-primary text-surface cursor-pointer transition-colors duration-150 hover:bg-primary-hover flex items-center justify-center gap-2"
        @click="handleNext"
      >
        {{ isLastStep ? 'Start Playing' : 'Next' }}
        <svg
          v-if="!isLastStep"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  </dialog>
</template>

<style scoped>
.tutorial-modal::backdrop {
  background-color: rgba(0, 0, 0, 0.6);
}

.tutorial-modal {
  inset: auto 0 0 0;
}

@media (min-width: 640px) {
  .tutorial-modal {
    inset: 50% auto auto 50%;
    transform: translate(-50%, -50%);
  }
}
</style>

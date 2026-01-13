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
            <span
              class="i-lucide-layers text-5xl text-primary"
              aria-hidden="true"
            />
          </template>
          <template v-else-if="currentStepData?.id === 'letters'">
            <div class="flex flex-wrap gap-1 justify-center">
              <span class="w-6 h-6 bg-surface-elevated rounded text-xs flex items-center justify-center font-mono font-bold">A</span>
              <span class="w-6 h-6 bg-surface-elevated rounded text-xs flex items-center justify-center font-mono font-bold">B</span>
              <span class="w-6 h-6 bg-surface-elevated rounded text-xs flex items-center justify-center font-mono font-bold">C</span>
            </div>
          </template>
          <template v-else-if="currentStepData?.id === 'centre'">
            <span
              class="i-lucide-star text-5xl text-primary"
              aria-hidden="true"
            />
          </template>
          <template v-else-if="currentStepData?.id === 'scoring'">
            <span
              class="i-lucide-bar-chart-3 text-5xl"
              aria-hidden="true"
            />
          </template>
          <template v-else-if="currentStepData?.id === 'pangrams'">
            <span
              class="i-lucide-star text-5xl text-celebration"
              aria-hidden="true"
            />
          </template>
          <template v-else-if="currentStepData?.id === 'hints'">
            <span
              class="i-lucide-lightbulb text-5xl text-primary"
              aria-hidden="true"
            />
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
        <span
          class="i-lucide-chevron-left text-base"
          aria-hidden="true"
        />
        Back
      </button>
      <button
        type="button"
        class="flex-1 px-4 py-3 font-mono text-sm border-2 border-solid border-primary bg-primary text-surface cursor-pointer transition-colors duration-150 hover:bg-primary-hover flex items-center justify-center gap-2"
        @click="handleNext"
      >
        {{ isLastStep ? 'Start Playing' : 'Next' }}
        <span
          v-if="!isLastStep"
          class="i-lucide-chevron-right text-base"
          aria-hidden="true"
        />
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

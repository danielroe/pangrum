<script setup lang="ts">
const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()

const {
  currentStep,
  currentStepId,
  totalSteps,
  isFirstStep,
  isLastStep,
  nextStep,
  previousStep,
  skipTutorial,
  completeTutorial,
} = useTutorial()

const stepTitle = computed(() => currentStepId.value ? t(`tutorial.steps.${currentStepId.value}.title`) : '')
const stepContent = computed(() => currentStepId.value ? t(`tutorial.steps.${currentStepId.value}.content`) : '')

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
    class="tutorial-modal fixed m-0 max-w-full bg-surface rounded-lg border-1 border-solid border-muted w-full sm:w-auto sm:min-w-md sm:max-w-lg max-h-[90vh] sm:max-h-[80vh] flex flex-col overflow-hidden p-0"
    @close="handleDialogClose"
    @click="handleClick"
  >
    <div class="flex justify-between items-center p-4 border-b-1 border-solid border-muted">
      <div class="flex items-center gap-3">
        <span
          class="text-on-surface/70 font-mono text-sm"
          aria-hidden="true"
        >
          {{ currentStep + 1 }}/{{ totalSteps }}
        </span>
        <h3 class="text-on-surface font-mono font-bold text-lg m-0">
          {{ stepTitle }}
        </h3>
      </div>
      <button
        type="button"
        class="px-3 py-1 text-sm font-mono rounded-lg border-1 border-solid border-transparent bg-transparent text-on-surface/70 cursor-pointer hover:bg-surface-hover hover:text-on-surface transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        @click="handleSkip"
      >
        {{ t('tutorial.skip') }}
      </button>
    </div>

    <div class="p-6 flex-grow flex flex-col gap-6">
      <div class="flex justify-center -mx-2">
        <button
          v-for="(_, index) in totalSteps"
          :key="index"
          type="button"
          class="step-indicator relative border-0 cursor-pointer bg-transparent p-3"
          :aria-label="t('tutorial.goToStep', { step: index + 1 })"
          @click="currentStep = index"
        >
          <span
            class="block rounded-full transition-all duration-200"
            :class="index === currentStep
              ? 'bg-primary w-6 h-2'
              : index < currentStep
                ? 'bg-primary/50 w-2 h-2 hover:bg-primary/70'
                : 'bg-muted w-2 h-2 hover:bg-muted-foreground'"
          />
        </button>
      </div>

      <div class="flex justify-center py-4">
        <div class="w-24 h-24 rounded-2xl flex items-center justify-center bg-primary/15">
          <template v-if="currentStepId === 'welcome'">
            <span
              class="i-lucide-layers text-5xl text-primary"
              aria-hidden="true"
            />
          </template>
          <template v-else-if="currentStepId === 'letters'">
            <span
              class="i-lucide-keyboard text-5xl text-primary"
              aria-hidden="true"
            />
          </template>
          <template v-else-if="currentStepId === 'centre'">
            <span
              class="i-lucide-circle-dot text-5xl text-primary"
              aria-hidden="true"
            />
          </template>
          <template v-else-if="currentStepId === 'scoring'">
            <span
              class="i-lucide-trophy text-5xl text-primary"
              aria-hidden="true"
            />
          </template>
          <template v-else-if="currentStepId === 'pangrams'">
            <span
              class="i-lucide-sparkles text-5xl text-primary"
              aria-hidden="true"
            />
          </template>
          <template v-else-if="currentStepId === 'hints'">
            <span
              class="i-lucide-lightbulb text-5xl text-primary"
              aria-hidden="true"
            />
          </template>
        </div>
      </div>

      <p class="text-on-surface font-mono text-base text-center leading-relaxed m-0">
        {{ stepContent }}
      </p>
    </div>

    <div class="p-4 border-t-1 border-solid border-muted flex gap-3">
      <button
        v-if="!isFirstStep"
        type="button"
        class="px-4 py-3 font-mono text-sm rounded-lg border-1 border-solid border-muted bg-surface text-on-surface cursor-pointer transition-colors hover:bg-surface-hover flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        @click="handlePrevious"
      >
        <span
          class="i-lucide-chevron-left text-base"
          aria-hidden="true"
        />
        {{ t('tutorial.back') }}
      </button>
      <button
        type="button"
        class="flex-1 px-4 py-3 font-mono text-sm rounded-lg border-1 border-solid border-primary bg-primary text-on-surface cursor-pointer transition-colors hover:bg-primary-hover flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        :aria-label="isLastStep ? t('tutorial.startPlaying') : t('tutorial.goToStep', { step: currentStep + 2 })"
        @click="handleNext"
      >
        {{ isLastStep ? t('tutorial.startPlaying') : t('tutorial.next') }}
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

/* Landscape: drawer from right */
@media (orientation: landscape) and (max-height: 500px) and (min-width: 500px) {
  .tutorial-modal {
    inset: 0 0 0 auto;
    max-width: 70%;
    max-height: 100vh;
    height: 100%;
    border-radius: 0.5rem 0 0 0.5rem;
  }
}

/* Desktop: centered modal */
@media (min-width: 640px) and (not ((orientation: landscape) and (max-height: 500px) and (min-width: 500px))) {
  .tutorial-modal {
    inset: 50% auto auto 50%;
    transform: translate(-50%, -50%);
  }
}
</style>

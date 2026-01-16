<script setup lang="ts">
const props = defineProps<{
  puzzleDate: string
  onRefresh: () => void
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()

function getRelativeDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diffMs = today.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return t('relativeDate.today')
  if (diffDays === 1) return t('relativeDate.yesterday')
  if (diffDays === -1) return t('relativeDate.tomorrow')
  if (diffDays > 1 && diffDays < 7) return t('relativeDate.daysAgo', { count: diffDays })
  if (diffDays >= 7 && diffDays < 14) return t('relativeDate.lastWeek')
  if (diffDays >= 14 && diffDays < 30) return t('relativeDate.weeksAgo', { count: Math.floor(diffDays / 7) })
  if (diffDays >= 30) return t('relativeDate.overAMonth')
  return dateStr
}

const relativeDate = computed(() => getRelativeDate(props.puzzleDate))

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
    emit('close')
  }
}

function handleRefresh() {
  props.onRefresh()
  emit('close')
}
</script>

<template>
  <dialog
    ref="dialog"
    class="fixed m-0 max-w-full bg-surface rounded-lg border-1 border-solid border-muted w-full sm:w-auto sm:min-w-96 sm:max-w-md max-h-[80vh] sm:max-h-[70vh] flex flex-col overflow-hidden p-0"
    @close="emit('close')"
    @click="handleClick"
  >
    <div class="flex justify-between items-center p-4 border-b-1 border-solid border-muted">
      <h3 class="text-on-surface font-mono font-bold text-lg m-0">
        {{ t('dateMismatch.title') }}
      </h3>
      <button
        type="button"
        class="w-8 h-8 flex items-center justify-center text-on-surface text-xl leading-none rounded-lg border-1 border-solid border-transparent bg-transparent cursor-pointer hover:bg-surface-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        :aria-label="t('common.close')"
        @click="emit('close')"
      >
        ×
      </button>
    </div>

    <div class="p-6 flex-grow flex flex-col gap-4">
      <p class="text-on-surface font-mono text-base m-0">
        {{ t('dateMismatch.message', { date: relativeDate }) }}
      </p>

      <p class="text-muted-foreground font-mono text-sm m-0">
        {{ t('dateMismatch.prompt') }}
      </p>

      <div class="flex gap-3 mt-2">
        <button
          type="button"
          class="flex-1 px-4 py-3 font-mono text-sm rounded-lg border-1 border-solid border-primary bg-primary text-dark cursor-pointer transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          @click="handleRefresh"
        >
          {{ t('dateMismatch.loadToday') }}
        </button>
        <button
          type="button"
          class="flex-1 px-4 py-3 font-mono text-sm rounded-lg border-1 border-solid border-muted bg-surface text-on-surface cursor-pointer transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          @click="emit('close')"
        >
          {{ t('dateMismatch.keepPlaying') }}
        </button>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

dialog {
  inset: auto 0 0 0;
}

/* Landscape: drawer from right */
@media (orientation: landscape) and (max-height: 500px) and (min-width: 500px) {
  dialog {
    inset: 0 0 0 auto;
    max-width: 70%;
    max-height: 100vh;
    height: 100%;
    border-radius: 0.5rem 0 0 0.5rem;
  }
}

/* Desktop: centered modal */
@media (min-width: 640px) and (not ((orientation: landscape) and (max-height: 500px) and (min-width: 500px))) {
  dialog {
    inset: 50% auto auto 50%;
    transform: translate(-50%, -50%);
  }
}
</style>

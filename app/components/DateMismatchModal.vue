<script setup lang="ts">
const props = defineProps<{
  puzzleDate: string
  onRefresh: () => void
}>()

const emit = defineEmits<{
  close: []
}>()

function getRelativeDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const diffMs = today.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  if (diffDays === -1) return 'tomorrow'
  if (diffDays > 1 && diffDays < 7) return `${diffDays} days ago`
  if (diffDays >= 7 && diffDays < 14) return 'last week'
  if (diffDays >= 14 && diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays >= 30) return 'over a month ago'
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
    class="bg-surface border-2 border-muted w-full sm:w-auto sm:min-w-96 sm:max-w-md max-h-[80vh] sm:max-h-[70vh] flex flex-col overflow-hidden p-0 bottom-0 sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
    @close="emit('close')"
    @click="handleClick"
  >
    <div class="flex justify-between items-center p-4 border-b-2 border-muted">
      <h3 class="text-on-surface font-mono font-bold text-lg m-0">
        Different date
      </h3>
      <button
        class="text-on-surface text-2xl leading-none border-0 bg-transparent cursor-pointer p-2 -m-2 hover:opacity-70 transition-opacity"
        @click="emit('close')"
      >
        ×
      </button>
    </div>

    <div class="p-6 flex-grow flex flex-col gap-4">
      <p class="text-on-surface font-mono text-base m-0">
        This is the puzzle from <span class="text-primary font-bold">{{ relativeDate }}</span>.
      </p>

      <p class="text-muted-foreground font-mono text-sm m-0">
        Would you like to load today's puzzle instead?
      </p>

      <div class="flex gap-3 mt-2">
        <button
          class="flex-1 px-4 py-3 font-mono text-sm border-2 border-solid border-primary bg-primary bg-opacity-20 hover:bg-opacity-30 text-on-surface cursor-pointer transition-colors"
          @click="handleRefresh"
        >
          Load today's puzzle
        </button>
        <button
          class="flex-1 px-4 py-3 font-mono text-sm border-2 border-solid border-muted bg-muted hover:bg-muted-foreground text-on-surface cursor-pointer transition-colors"
          @click="emit('close')"
        >
          Keep playing
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
  position: fixed;
  inset: auto 0 0 0;
  margin: 0;
  max-width: 100%;
}

@media (min-width: 640px) {
  dialog {
    position: fixed;
    inset: 50% auto auto 50%;
    transform: translate(-50%, -50%);
    margin: 0;
  }
}
</style>

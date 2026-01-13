<script setup lang="ts">
const props = defineProps<{
  category: string
  foundWords: string[]
  totalWords: string[]
  showRemaining?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

function redactWord(word: string): string {
  return word.split('').map((char, i) => i === 0 ? char : '_').join('')
}

const remainingCount = computed(() => props.totalWords.length - props.foundWords.length)

const sortedFoundWords = computed(() => [...props.foundWords].sort())

const sortedRemainingWords = computed(() => {
  const remaining = [...props.totalWords]

  for (const foundWord of props.foundWords) {
    const redacted = redactWord(foundWord)
    const index = remaining.indexOf(redacted)
    if (index !== -1) {
      remaining.splice(index, 1)
    }
  }

  return remaining.sort()
})

const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')

onMounted(() => {
  dialogRef.value?.showModal()
})

onBeforeUnmount(() => {
  if (dialogRef.value?.open) {
    dialogRef.value.close()
  }
})

// Check if click is on the dialog backdrop (::backdrop pseudo-element)
function handleClick(event: MouseEvent) {
  if (event.target === dialogRef.value) {
    emit('close')
  }
}
</script>

<template>
  <dialog
    ref="dialog"
    class="bg-surface rounded-lg border-1 border-solid border-muted w-full sm:w-auto sm:min-w-96 sm:max-w-2xl max-h-[80vh] sm:max-h-[70vh] flex flex-col overflow-hidden p-0"
    @close="emit('close')"
    @click="handleClick"
  >
    <div class="flex justify-between items-center p-4 border-b-1 border-solid border-muted">
      <h3 class="text-on-surface font-mono font-bold text-lg m-0">
        {{ category }}
      </h3>
      <button
        type="button"
        class="w-8 h-8 flex items-center justify-center text-on-surface text-xl leading-none rounded-lg border-1 border-solid border-transparent bg-transparent cursor-pointer hover:bg-surface-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        aria-label="Close"
        @click="emit('close')"
      >
        ×
      </button>
    </div>

    <div class="p-4 overflow-y-auto flex-grow">
      <p class="text-on-surface font-mono text-sm mb-4">
        {{ foundWords.length }} / {{ totalWords.length }} words found
      </p>

      <div class="space-y-4">
        <div v-if="foundWords.length > 0">
          <h4 class="text-primary font-mono text-sm mb-2">
            Found ({{ foundWords.length }})
          </h4>
          <ul class="p-0 grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-1 text-sm text-on-surface m-0">
            <li
              v-for="word in sortedFoundWords"
              :key="word"
              class="list-none font-mono px-2 py-1 border-1 border-solid border-primary bg-primary/20 transition-colors duration-150"
            >
              {{ word.toLowerCase() }}
            </li>
          </ul>
        </div>

        <div v-if="showRemaining && remainingCount > 0">
          <h4 class="text-muted-foreground font-mono text-sm mb-2">
            Remaining ({{ remainingCount }})
          </h4>
          <ul
            v-if="sortedRemainingWords.length > 0"
            class="p-0 grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-1 text-sm text-on-surface m-0"
          >
            <li
              v-for="word in sortedRemainingWords"
              :key="word"
              class="list-none font-mono px-2 py-1 border-1 border-solid border-muted bg-muted transition-colors duration-150"
            >
              {{ word.replace(/_/g, '-').toLowerCase() }}
            </li>
          </ul>
        </div>
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
    inset: 50% auto auto 50%;
    transform: translate(-50%, -50%);
  }
}
</style>

<script setup lang="ts">
const props = defineProps<{
  word: string
  letters: string[]
  lang: string
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()

const { definition, loading, error, fetchDefinition } = useWordDefinition()

const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')

onMounted(() => {
  dialogRef.value?.showModal()
  fetchDefinition(props.word, props.lang)
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
</script>

<template>
  <dialog
    ref="dialog"
    class="bg-surface rounded-lg border-1 border-solid border-muted w-full sm:w-auto sm:min-w-80 sm:max-w-lg max-h-[80vh] sm:max-h-[70vh] flex flex-col overflow-hidden p-0"
    @close="emit('close')"
    @click="handleClick"
  >
    <div class="flex justify-between items-center p-4 border-b-1 border-solid border-muted gap-3">
      <h3
        class="text-on-surface font-mono font-bold text-lg m-0"
        :class="isPangram(word, props.letters) ? 'text-celebration' : 'text-on-surface'"
      >
        {{ word.toLowerCase() }}
        <span
          v-if="isPangram(word, props.letters)"
          class="text-sm font-normal ml-1"
        >★</span>
      </h3>
      <button
        type="button"
        class="w-8 h-8 flex shrink-0 items-center justify-center text-on-surface text-xl leading-none rounded-lg border-1 border-solid border-transparent bg-transparent cursor-pointer hover:bg-surface-hover transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        :aria-label="t('common.close')"
        @click="emit('close')"
      >
        ×
      </button>
    </div>

    <div class="p-4 overflow-y-auto flex-grow">
      <!-- Loading skeleton -->
      <div
        v-if="loading"
        class="space-y-3 animate-pulse"
      >
        <div class="h-3 w-20 bg-muted rounded" />
        <div class="h-4 w-full bg-muted rounded" />
        <div class="h-4 w-full bg-muted rounded" />
        <div class="h-4 w-3/4 bg-muted rounded" />
        <div class="h-3 w-2/3 bg-muted rounded mt-1" />
      </div>

      <!-- Offline error state -->
      <div
        v-else-if="error === 'offline'"
        class="flex flex-col items-center gap-2 text-center py-6"
      >
        <span
          class="i-lucide-wifi-off text-2xl text-muted"
          aria-hidden="true"
        />
        <p class="text-sm text-muted-foreground m-0">
          {{ t('definition.offline') }}
        </p>
      </div>

      <!-- Not found error state -->
      <div
        v-else-if="error === 'notFound'"
        class="flex flex-col items-center gap-2 text-center py-6"
      >
        <span
          class="i-lucide-circle-x text-2xl text-muted"
          aria-hidden="true"
        />
        <p class="text-sm text-muted-foreground m-0">
          {{ t('definition.notFound') }}
        </p>
      </div>

      <!-- Definition -->
      <div
        v-else-if="definition"
        class="space-y-3"
      >
        <p class="text-xs text-muted-foreground italic m-0">
          {{ definition.partOfSpeech }}
        </p>
        <p class="text-sm text-on-surface m-0 leading-relaxed">
          {{ definition.definition }}
        </p>
        <p
          v-if="definition.example"
          class="text-xs text-muted-foreground italic m-0 border-l-2 border-solid border-muted pl-3"
        >
          {{ definition.example }}
        </p>

        <!-- Base word definition -->
        <div
          v-if="definition.baseWord && definition.baseWordDefinition"
          class="pt-2 border-t-1 border-solid border-muted space-y-2"
        >
          <p class="text-xs text-muted-foreground m-0">
            {{ definition.baseWord }}
            <span class="italic">· {{ definition.baseWordDefinition.partOfSpeech }}</span>
          </p>
          <p class="text-sm text-on-surface m-0 leading-relaxed">
            {{ definition.baseWordDefinition.definition }}
          </p>
          <p
            v-if="definition.baseWordDefinition.example"
            class="text-xs text-muted-foreground italic m-0 border-l-2 border-solid border-muted pl-3"
          >
            {{ definition.baseWordDefinition.example }}
          </p>
        </div>
      </div>
    </div>

    <p class="text-xs text-muted-foreground text-center m-0 px-4 py-2 opacity-60">
      {{ t('definition.englishOnly') }}
    </p>
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

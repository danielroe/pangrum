<script setup lang="ts">
const props = defineProps<{
  word: string
  letters: string[]
  lang: string
}>()

const emit = defineEmits<{
  close: []
}>()

const { t, locale, locales } = useI18n()
const localeName = computed(() => locales.value.find(l => l.code === locale.value)?.name ?? locale.value)

const { definition, loading, error, fetchDefinition } = useWordDefinition()

const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')

onMounted(() => {
  dialogRef.value?.showModal()
  fetchDefinition(props.word, props.lang, locale.value)
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
        <p
          v-if="definition.uiLangFallback"
          class="text-xs text-muted-foreground m-0 pb-1 border-b-1 border-solid border-muted"
        >
          {{ t('definition.noUiLangDefinition', { lang: localeName }) }}
        </p>
        <p class="text-xs text-muted-foreground italic m-0">
          {{ definition.partOfSpeech }}
        </p>
        <p class="text-sm text-on-surface m-0 leading-relaxed">
          {{ definition.definition }}
        </p>
        <div
          v-if="definition.example"
          class="border-l-2 border-solid border-muted pl-3 space-y-1"
        >
          <p class="text-xs text-muted-foreground italic m-0">
            {{ definition.example }}
          </p>
          <p
            v-if="definition.exampleTranslation"
            class="text-xs text-primary/70 m-0 mt-2"
          >
            {{ definition.exampleTranslation }}
          </p>
        </div>

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

        <!-- Capitalized variant (e.g. noun "Leier" alongside verb "leier") -->
        <div
          v-if="definition.capitalizedDefinition"
          class="pt-2 border-t-1 border-solid border-muted space-y-2"
        >
          <p class="text-xs text-muted-foreground italic m-0">
            {{ definition.capitalizedDefinition.partOfSpeech }}
          </p>
          <p class="text-sm text-on-surface m-0 leading-relaxed">
            {{ definition.capitalizedDefinition.definition }}
          </p>
          <p
            v-if="definition.capitalizedDefinition.example"
            class="text-xs text-muted-foreground italic m-0 border-l-2 border-solid border-muted pl-3"
          >
            {{ definition.capitalizedDefinition.example }}
          </p>
          <!-- Base word of the capitalized variant -->
          <div
            v-if="definition.capitalizedDefinition.baseWord && definition.capitalizedDefinition.baseWordDefinition"
            class="pt-1 space-y-1"
          >
            <p class="text-xs text-muted-foreground m-0">
              {{ definition.capitalizedDefinition.baseWord }}
              <span class="italic">· {{ definition.capitalizedDefinition.baseWordDefinition.partOfSpeech }}</span>
            </p>
            <p class="text-sm text-on-surface m-0 leading-relaxed">
              {{ definition.capitalizedDefinition.baseWordDefinition.definition }}
            </p>
          </div>
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

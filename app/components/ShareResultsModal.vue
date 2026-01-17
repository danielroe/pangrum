<script setup lang="ts">
import type { ShareData } from '~/composables/useShare'

const props = defineProps<{
  data: ShareData
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()

const { generateShareImage, shareResults, downloadImage, copyTextToClipboard, copyImageToClipboard, isShareSupported } = useShare()

const dialogRef = useTemplateRef<HTMLDialogElement>('dialog')
const previewUrl = ref<string | null>(null)
const generatedBlob = ref<Blob | null>(null)
const isGenerating = ref(false)
const shareStatus = ref<'idle' | 'sharing' | 'copied' | 'copied-image' | 'downloaded' | 'shared' | 'error'>('idle')

onMounted(async () => {
  dialogRef.value?.showModal()

  // Generate preview image
  isGenerating.value = true
  try {
    const blob = await generateShareImage(props.data)
    generatedBlob.value = blob
    previewUrl.value = URL.createObjectURL(blob)
  }
  catch {
    // Preview failed, not critical
  }
  finally {
    isGenerating.value = false
  }
})

onBeforeUnmount(() => {
  if (dialogRef.value?.open) {
    dialogRef.value.close()
  }
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})

function handleClick(event: MouseEvent) {
  if (event.target === dialogRef.value) {
    emit('close')
  }
}

async function handleShare() {
  shareStatus.value = 'sharing'
  try {
    const result = await shareResults(props.data)
    if (result.shared) {
      trackShareCompleted('native')
      shareStatus.value = 'shared'
      setTimeout(() => emit('close'), 1000)
    }
    else if (result.blob) {
      // Native share not available, download instead
      await downloadImage(result.blob, `pangrum-${props.data.date}.png`)
      trackShareCompleted('download')
      shareStatus.value = 'downloaded'
    }
  }
  catch {
    shareStatus.value = 'error'
  }
}

async function handleCopyText() {
  try {
    await copyTextToClipboard(props.data)
    trackShareCompleted('copy_text')
    shareStatus.value = 'copied'
  }
  catch {
    shareStatus.value = 'error'
  }
}

async function handleCopyImage() {
  shareStatus.value = 'sharing'
  try {
    const blob = generatedBlob.value || await generateShareImage(props.data)
    const success = await copyImageToClipboard(blob)
    if (success) {
      trackShareCompleted('copy_image')
      shareStatus.value = 'copied-image'
    }
    else {
      // Fallback to download if clipboard doesn't support images
      await downloadImage(blob, `pangrum-${props.data.date}.png`)
      trackShareCompleted('download')
      shareStatus.value = 'downloaded'
    }
  }
  catch {
    shareStatus.value = 'error'
  }
}

const statusMessage = computed(() => {
  switch (shareStatus.value) {
    case 'sharing': return t('share.status.preparing')
    case 'copied': return t('share.status.textCopied')
    case 'copied-image': return t('share.status.imageCopied')
    case 'downloaded': return t('share.status.imageDownloaded')
    case 'shared': return t('share.status.shared')
    case 'error': return t('share.status.error')
    default: return ''
  }
})
</script>

<template>
  <dialog
    ref="dialog"
    class="dialog-modal fixed m-0 max-w-full bg-surface rounded-lg border-1 border-solid border-muted w-full sm:w-auto sm:min-w-96 sm:max-w-lg max-h-[90vh] sm:max-h-[80vh] flex flex-col overflow-hidden p-0"
    @close="emit('close')"
    @click="handleClick"
  >
    <div class="flex justify-between items-center p-4 border-b-1 border-solid border-muted">
      <h3 class="text-on-surface font-mono font-bold text-lg m-0">
        {{ t('share.title') }}
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

    <div class="p-4 flex-grow flex flex-col gap-4 overflow-y-auto">
      <!-- Preview -->
      <div class="relative aspect-[3/2] bg-surface-elevated rounded-lg overflow-hidden border-1 border-solid border-muted">
        <img
          v-if="previewUrl"
          :src="previewUrl"
          alt="Share preview"
          class="w-full h-full object-contain"
        >
        <div
          v-else-if="isGenerating"
          class="absolute inset-0 flex items-center justify-center text-muted-foreground"
        >
          {{ t('share.generatingPreview') }}
        </div>
        <div
          v-else
          class="absolute inset-0 flex items-center justify-center text-muted-foreground"
        >
          {{ t('share.previewUnavailable') }}
        </div>
      </div>

      <!-- Stats summary -->
      <div
        v-if="data"
        class="text-center text-sm text-muted-foreground font-mono"
      >
        <span class="text-primary font-bold">{{ data.score }}</span> {{ t('share.points') }}
        <span class="mx-2">·</span>
        {{ data.wordsFound }}/{{ data.totalWords }} {{ t('score.words') }}
        <template v-if="data.totalPangrams > 0">
          <span class="mx-2">·</span>
          {{ t('score.pangramsFound', { found: data.pangrams, total: data.totalPangrams }) }}
        </template>
      </div>

      <!-- Status message -->
      <div
        v-if="statusMessage"
        class="text-center text-sm font-medium"
        :class="shareStatus === 'error' ? 'text-error' : 'text-primary'"
      >
        {{ statusMessage }}
      </div>

      <!-- Action buttons -->
      <div class="flex flex-col gap-2">
        <button
          v-if="isShareSupported"
          type="button"
          class="w-full px-4 py-3 font-mono text-sm rounded-lg border-1 border-solid border-primary bg-primary text-dark cursor-pointer transition-colors hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          :disabled="shareStatus === 'sharing'"
          @click="handleShare"
        >
          <span
            class="i-lucide-share-2 text-lg"
            aria-hidden="true"
          />
          {{ t('share.share') }}
        </button>

        <div class="flex gap-2">
          <!-- Copy Image button (primary action on desktop) -->
          <button
            type="button"
            class="flex-1 px-4 py-3 font-mono text-sm rounded-lg border-1 border-solid border-muted bg-surface text-on-surface cursor-pointer transition-colors hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            :disabled="shareStatus === 'sharing'"
            @click="handleCopyImage"
          >
            <span
              class="i-lucide-copy text-lg"
              aria-hidden="true"
            />
            {{ t('share.copyImage') }}
          </button>

          <!-- Copy Text button -->
          <button
            type="button"
            class="flex-1 px-4 py-3 font-mono text-sm rounded-lg border-1 border-solid border-muted bg-surface text-on-surface cursor-pointer transition-colors hover:bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            :disabled="shareStatus === 'sharing'"
            @click="handleCopyText"
          >
            <span
              class="i-lucide-align-left text-lg"
              aria-hidden="true"
            />
            {{ t('share.copyText') }}
          </button>
        </div>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
.dialog-modal::backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

.dialog-modal {
  inset: auto 0 0 0;
}

/* Landscape: drawer from right */
@media (orientation: landscape) and (max-height: 500px) and (min-width: 500px) {
  .dialog-modal {
    inset: 0 0 0 auto;
    max-width: 70%;
    max-height: 100vh;
    height: 100%;
    border-radius: 0.5rem 0 0 0.5rem;
  }
}

/* Desktop: centered modal */
@media (min-width: 640px) and (not ((orientation: landscape) and (max-height: 500px) and (min-width: 500px))) {
  .dialog-modal {
    inset: 50% auto auto 50%;
    transform: translate(-50%, -50%);
  }
}
</style>

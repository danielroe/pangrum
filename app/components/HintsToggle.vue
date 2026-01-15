<script setup lang="ts">
const { t } = useI18n()
const { hintsEnabled, toggleHints } = useHints()

const label = computed(() => hintsEnabled.value ? t('hintsToggle.hintsOn') : t('hintsToggle.hintsOff'))
</script>

<template>
  <ClientOnly>
    <!-- Mobile trigger (icon only) -->
    <button
      type="button"
      class="w-8 h-8 flex sm:hidden items-center justify-center text-base rounded-lg border-1 border-solid bg-surface hover:bg-surface-hover transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ls:flex ls:w-7 ls:h-7"
      :class="hintsEnabled ? 'border-primary-border' : 'border-muted'"
      :aria-pressed="hintsEnabled"
      :aria-label="label"
      @click="toggleHints"
    >
      <span
        class="i-lucide-lightbulb text-base ls:text-sm"
        :class="hintsEnabled ? 'text-primary' : 'text-on-surface'"
        aria-hidden="true"
      />
    </button>
    <!-- Desktop trigger (icon + label) -->
    <button
      type="button"
      class="hidden sm:flex items-center gap-2 px-3 py-1 text-sm rounded-lg border-1 border-solid bg-surface hover:bg-surface-hover transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ls:hidden"
      :class="hintsEnabled ? 'border-primary-border' : 'border-muted'"
      :aria-pressed="hintsEnabled"
      @click="toggleHints"
    >
      <span
        class="i-lucide-lightbulb text-sm"
        :class="hintsEnabled ? 'text-primary' : 'text-on-surface'"
        aria-hidden="true"
      />
      <span class="text-on-surface">{{ label }}</span>
    </button>
    <template #fallback>
      <!-- Mobile skeleton (full button, just missing interactivity) -->
      <div class="w-8 h-8 flex sm:hidden items-center justify-center rounded-lg border-1 border-solid border-muted bg-surface ls:flex ls:w-7 ls:h-7">
        <span
          class="i-lucide-lightbulb text-base text-on-surface ls:text-sm"
          aria-hidden="true"
        />
      </div>
      <!-- Desktop skeleton -->
      <div class="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-surface border-1 border-solid border-muted ls:hidden">
        <div class="w-4 h-4 rounded bg-muted animate-pulse" />
        <div class="w-14 h-4 rounded bg-muted animate-pulse" />
      </div>
    </template>
  </ClientOnly>
</template>

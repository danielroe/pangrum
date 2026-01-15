<script setup lang="ts">
const { hintsEnabled, toggleHints } = useHints()

const label = computed(() => hintsEnabled.value ? 'Hints on' : 'Hints off')
</script>

<template>
  <ClientOnly>
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
    <template #fallback>
      <div class="w-8 h-8 sm:hidden rounded-lg border-1 border-solid border-muted bg-surface" />
    </template>
  </ClientOnly>

  <ClientOnly>
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
      <div class="hidden sm:block w-24 h-7 rounded-lg bg-surface border-1 border-solid border-muted" />
    </template>
  </ClientOnly>
</template>

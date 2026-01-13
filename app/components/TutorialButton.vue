<script setup lang="ts">
const { startTutorial } = useTutorial()
</script>

<template>
  <ClientOnly>
    <button
      type="button"
      class="w-9 h-9 flex sm:hidden items-center justify-center text-lg rounded-lg border-1 border-solid border-muted bg-surface hover:bg-surface-hover transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
      aria-label="Show tutorial"
      @click="startTutorial"
    >
      <span
        class="i-lucide-circle-help text-lg text-on-surface"
        aria-hidden="true"
      />
    </button>
    <template #fallback>
      <div class="w-9 h-9 sm:hidden rounded-lg border-1 border-solid border-muted bg-surface" />
    </template>
  </ClientOnly>

  <ClientOnly>
    <button
      type="button"
      class="hidden sm:flex items-center gap-2 px-3 py-1 text-sm rounded-lg border-1 border-solid border-muted bg-surface hover:bg-surface-hover transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
      @click="startTutorial"
    >
      <span
        class="i-lucide-circle-help text-sm text-on-surface"
        aria-hidden="true"
      />
      <span class="text-on-surface">How to play</span>
    </button>
    <template #fallback>
      <div class="hidden sm:block w-28 h-7 rounded-lg bg-surface border-1 border-solid border-muted" />
    </template>
  </ClientOnly>
</template>

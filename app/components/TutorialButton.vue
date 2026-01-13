<script setup lang="ts">
const { startTutorial } = useTutorial()
</script>

<template>
  <ClientOnly>
    <button
      type="button"
      class="w-9 h-9 flex sm:hidden items-center justify-center text-lg border-1 border-solid border-muted bg-surface hover:bg-surface-hover transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
      aria-label="Show tutorial"
      @click="startTutorial"
    >
      <span
        class="i-lucide-circle-help text-lg text-on-surface"
        aria-hidden="true"
      />
    </button>
    <template #fallback>
      <div class="w-9 h-9 sm:hidden border-1 border-solid border-muted bg-surface" />
    </template>
  </ClientOnly>

  <ClientOnly>
    <button
      type="button"
      class="hidden sm:flex items-center gap-2 px-3 py-1 text-sm border-1 border-solid border-muted bg-surface hover:bg-surface-hover transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
      @click="startTutorial"
    >
      <span
        class="i-lucide-circle-help text-sm text-on-surface"
        aria-hidden="true"
      />
      <span class="text-on-surface">How to play</span>
    </button>
    <template #fallback>
      <div class="hidden sm:block w-28 h-7 bg-surface border-1 border-solid border-muted" />
    </template>
  </ClientOnly>
</template>

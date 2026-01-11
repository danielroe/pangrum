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
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="text-on-surface"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
        />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line
          x1="12"
          y1="17"
          x2="12.01"
          y2="17"
        />
      </svg>
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
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="text-on-surface"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
        />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line
          x1="12"
          y1="17"
          x2="12.01"
          y2="17"
        />
      </svg>
      <span class="text-on-surface">How to play</span>
    </button>
    <template #fallback>
      <div class="hidden sm:block w-28 h-7 bg-surface border-1 border-solid border-muted" />
    </template>
  </ClientOnly>
</template>

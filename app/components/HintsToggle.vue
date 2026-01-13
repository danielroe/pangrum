<script setup lang="ts">
const { hintsEnabled, toggleHints } = useHints()

const label = computed(() => hintsEnabled.value ? 'Hints on' : 'Hints off')
</script>

<template>
  <ClientOnly>
    <SettingsPopover
      label="Hints"
      class="sm:hidden"
    >
      <template #icon>
        <span
          class="i-lucide-lightbulb text-base"
          aria-hidden="true"
        />
      </template>
      <template #default="{ close }">
        <div class="flex flex-col gap-2">
          <div class="text-sm font-medium text-on-surface">
            Hints
          </div>
          <button
            type="button"
            class="flex items-center gap-2 w-full px-3 py-2 text-sm text-left rounded-lg border-1 border-solid transition-colors"
            :class="!hintsEnabled
              ? 'bg-primary-subtle border-primary-border text-on-surface'
              : 'bg-surface border-muted hover:bg-surface-hover text-on-surface'"
            @click="() => { if (hintsEnabled) toggleHints(); close() }"
          >
            Off
          </button>
          <button
            type="button"
            class="flex items-center gap-2 w-full px-3 py-2 text-sm text-left rounded-lg border-1 border-solid transition-colors"
            :class="hintsEnabled
              ? 'bg-primary-subtle border-primary-border text-on-surface'
              : 'bg-surface border-muted hover:bg-surface-hover text-on-surface'"
            @click="() => { if (!hintsEnabled) toggleHints(); close() }"
          >
            On
          </button>
        </div>
      </template>
    </SettingsPopover>
    <template #fallback>
      <div class="w-9 h-9 sm:hidden rounded-lg border-1 border-solid border-muted bg-surface" />
    </template>
  </ClientOnly>

  <ClientOnly>
    <button
      type="button"
      class="hidden sm:flex items-center gap-2 px-3 py-1 text-sm rounded-lg border-1 border-solid border-muted bg-surface hover:bg-surface-hover transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
      :aria-pressed="hintsEnabled"
      @click="toggleHints"
    >
      <span
        class="i-lucide-lightbulb text-sm"
        aria-hidden="true"
      />
      <span class="text-on-surface">{{ label }}</span>
    </button>
    <template #fallback>
      <div class="hidden sm:block w-24 h-7 rounded-lg bg-surface border-1 border-solid border-muted" />
    </template>
  </ClientOnly>
</template>

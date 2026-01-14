<script setup lang="ts">
const colorMode = useColorMode()

const options = {
  system: { label: 'System', iconClass: 'i-lucide-monitor' },
  light: { label: 'Light', iconClass: 'i-lucide-sun' },
  dark: { label: 'Dark', iconClass: 'i-lucide-moon' },
} as const

function setTheme(value: string) {
  colorMode.preference = value
}

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  setTheme(target.value)
}
</script>

<template>
  <ClientOnly>
    <div class="relative hidden sm:inline-block">
      <select
        :value="colorMode.preference"
        class="theme-select bg-none px-3 py-1 text-sm rounded-lg border-1 border-solid appearance-none pr-8 cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 text-on-surface border-muted bg-surface hover:bg-surface-hover transition-colors"
        aria-label="Select theme"
        @change="handleChange"
      >
        <option
          v-for="(opt, value) in options"
          :key="value"
          :value="value"
        >
          {{ opt.label }}
        </option>
      </select>
      <span
        class="i-lucide-chevron-down pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-60"
        aria-hidden="true"
      />
    </div>
    <template #fallback>
      <div class="hidden sm:block w-20 h-7 rounded-lg bg-surface border-1 border-solid border-muted" />
    </template>
  </ClientOnly>
</template>

<style scoped>
.theme-select::-ms-expand {
  display: none;
}
</style>

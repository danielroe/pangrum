<script setup lang="ts">
const colorMode = useColorMode()

const options = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
} as const

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  colorMode.preference = target.value
}
</script>

<template>
  <div class="relative inline-block">
    <select
      :value="colorMode.preference"
      class="theme-select px-3 py-1 text-sm font-mono border-1 border-solid appearance-none pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 text-on-surface border-muted bg-surface hover:bg-surface-hover transition-colors"
      aria-label="Select theme"
      @change="handleChange"
    >
      <option
        v-for="(label, value) in options"
        :key="value"
        :value="value"
      >
        {{ label }}
      </option>
    </select>
    <span
      class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-60"
      aria-hidden="true"
    >▼</span>
  </div>
</template>

<style scoped>
.theme-select {
  background-image: none;
}

.theme-select::-ms-expand {
  display: none;
}
</style>

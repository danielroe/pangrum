<script setup lang="ts">
const colorMode = useColorMode()

const options = {
  system: { label: 'System', icon: '⚙️' },
  light: { label: 'Light', icon: '☀️' },
  dark: { label: 'Dark', icon: '🌙' },
} as const

type ThemeKey = keyof typeof options

const currentIcon = computed(() => {
  const pref = colorMode.preference as ThemeKey
  return options[pref]?.icon || '⚙️'
})

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
    <SettingsPopover
      :icon="currentIcon"
      label="Theme settings"
      class="sm:hidden"
    >
      <template #default="{ close }">
        <div class="flex flex-col gap-2">
          <div class="text-sm font-medium text-on-surface">
            Theme
          </div>
          <button
            v-for="(opt, value) in options"
            :key="value"
            type="button"
            class="flex items-center gap-2 w-full px-3 py-2 text-sm text-left border-1 border-solid transition-colors"
            :class="colorMode.preference === value
              ? 'bg-primary-subtle border-primary-border text-on-surface'
              : 'bg-surface border-muted hover:bg-surface-hover text-on-surface'"
            @click="() => { setTheme(value); close() }"
          >
            <span>{{ opt.icon }}</span>
            <span>{{ opt.label }}</span>
          </button>
        </div>
      </template>
    </SettingsPopover>
    <template #fallback>
      <div class="w-9 h-9 sm:hidden border-1 border-solid border-muted bg-surface" />
    </template>
  </ClientOnly>

  <ClientOnly>
    <div class="relative hidden sm:inline-block">
      <select
        :value="colorMode.preference"
        class="theme-select px-3 py-1 text-sm font-mono border-1 border-solid appearance-none pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 text-on-surface border-muted bg-surface hover:bg-surface-hover transition-colors"
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
        class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-60"
        aria-hidden="true"
      >▼</span>
    </div>
    <template #fallback>
      <div class="hidden sm:block w-20 h-7 bg-surface border-1 border-solid border-muted" />
    </template>
  </ClientOnly>
</template>

<style scoped>
.theme-select {
  background-image: none;
}

.theme-select::-ms-expand {
  display: none;
}
</style>

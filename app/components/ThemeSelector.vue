<script setup lang="ts">
const colorMode = useColorMode()

const options = {
  system: { label: 'System', iconClass: 'i-lucide-monitor' },
  light: { label: 'Light', iconClass: 'i-lucide-sun' },
  dark: { label: 'Dark', iconClass: 'i-lucide-moon' },
} as const

type ThemeKey = keyof typeof options

const currentIconClass = computed(() => {
  const pref = colorMode.preference as ThemeKey
  return options[pref]?.iconClass || 'i-lucide-monitor'
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
      label="Theme settings"
      class="sm:hidden"
    >
      <template #icon>
        <span
          :class="currentIconClass"
          class="text-base"
          aria-hidden="true"
        />
      </template>
      <template #default="{ close }">
        <div class="flex flex-col gap-2">
          <div class="text-sm font-medium text-on-surface">
            Theme
          </div>
          <button
            v-for="(opt, value) in options"
            :key="value"
            type="button"
            class="flex items-center gap-2 w-full px-3 py-2 text-sm text-left rounded-lg border-1 border-solid transition-colors"
            :class="colorMode.preference === value
              ? 'bg-primary-subtle border-primary-border text-on-surface'
              : 'bg-surface border-muted hover:bg-surface-hover text-on-surface'"
            @click="() => { setTheme(value); close() }"
          >
            <span
              :class="opt.iconClass"
              class="text-sm"
              aria-hidden="true"
            />
            <span>{{ opt.label }}</span>
          </button>
        </div>
      </template>
    </SettingsPopover>
    <template #fallback>
      <div class="w-9 h-9 sm:hidden rounded-lg border-1 border-solid border-muted bg-surface" />
    </template>
  </ClientOnly>

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

<script setup lang="ts">
const language = useLanguage()

const languageCode = computed(() => (String(language.value || 'en').split('-')[0] ?? 'EN').toUpperCase())

function setLanguage(lang: Language) {
  language.value = lang
}

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  setLanguage(target.value as Language)
}
</script>

<template>
  <ClientOnly>
    <SettingsPopover
      icon="🌐"
      label="Language settings"
      class="sm:hidden"
    >
      <template #icon>
        <span class="text-xs font-bold text-on-surface">{{ languageCode }}</span>
      </template>
      <template #default="{ close }">
        <div class="flex flex-col gap-2">
          <div class="text-sm font-medium text-on-surface">
            Language
          </div>
          <button
            v-for="(label, lang) in SUPPORTED_LANGUAGES"
            :key="lang"
            type="button"
            class="flex items-center gap-2 w-full px-3 py-2 text-sm text-left border-1 border-solid transition-colors"
            :class="language === lang
              ? 'bg-primary-subtle border-primary-border text-on-surface'
              : 'bg-surface border-muted hover:bg-surface-hover text-on-surface'"
            @click="() => { setLanguage(lang); close() }"
          >
            {{ label }}
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
        :value="language"
        class="language-select bg-none text-on-surface px-3 py-1 text-sm border-1 border-solid border-muted bg-surface hover:bg-surface-hover transition-colors appearance-none pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
        aria-label="Select language"
        @change="handleChange"
      >
        <option
          v-for="(label, lang) in SUPPORTED_LANGUAGES"
          :key="lang"
          :value="lang"
        >
          {{ label }}
        </option>
      </select>
      <span
        class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-60"
        aria-hidden="true"
      >▼</span>
    </div>
    <template #fallback>
      <div class="hidden sm:block w-28 h-7 bg-surface border-1 border-solid border-muted" />
    </template>
  </ClientOnly>
</template>

<style scoped>
.language-select::-ms-expand {
  display: none;
}
</style>

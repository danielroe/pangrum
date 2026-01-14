<script setup lang="ts">
const language = useLanguage()

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
    <div class="relative hidden sm:inline-block">
      <select
        :value="language"
        class="language-select bg-none text-on-surface px-3 py-1 text-sm rounded-lg border-1 border-solid border-muted bg-surface hover:bg-surface-hover transition-colors appearance-none pr-8 cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
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
        class="i-lucide-chevron-down pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs opacity-60"
        aria-hidden="true"
      />
    </div>
    <template #fallback>
      <div class="hidden sm:block w-28 h-7 rounded-lg bg-surface border-1 border-solid border-muted" />
    </template>
  </ClientOnly>
</template>

<style scoped>
.language-select::-ms-expand {
  display: none;
}
</style>

<script setup lang="ts">
const language = useLanguage()

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  language.value = target.value as Language
}
</script>

<template>
  <div class="relative inline-block">
    <select
      :value="language"
      class="language-select text-on-surface px-3 py-1 text-sm font-mono border-1 border-solid border-muted bg-surface hover:bg-surface-hover transition-colors appearance-none pr-8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
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
</template>

<style scoped>
.language-select {
  background-image: none;
}

.language-select::-ms-expand {
  display: none;
}
</style>

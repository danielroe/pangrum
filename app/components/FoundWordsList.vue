<script setup lang="ts">
const props = defineProps<{
  words: Set<string>
  letters: string[]
}>()

const { t } = useI18n()

const sortedWords = computed(() => [...props.words].sort())

function isPangram(word: string) {
  return props.letters.every(l => word.includes(l))
}

const pangramCount = computed(() => sortedWords.value.filter(isPangram).length)
</script>

<template>
  <div class="hint-panel flex flex-col h-full">
    <header class="hint-panel-header flex items-center gap-2 mb-3">
      <span
        class="i-lucide-list text-primary text-base"
        aria-hidden="true"
      />
      <h3 class="text-sm font-medium text-on-surface m-0">
        {{ t('hints.panels.foundWords') }}
      </h3>
      <span
        v-if="sortedWords.length > 0"
        class="text-xs text-muted-foreground ml-auto tabular-nums"
      >
        {{ sortedWords.length }}
        <span
          v-if="pangramCount > 0"
          class="text-celebration"
        >★{{ pangramCount }}</span>
      </span>
    </header>

    <div
      v-if="sortedWords.length === 0"
      class="hint-panel-empty flex-1 flex flex-col items-center justify-center gap-3 text-center p-4"
    >
      <span
        class="i-lucide-text text-2xl text-muted"
        aria-hidden="true"
      />
      <p class="text-sm text-muted-foreground m-0 max-w-48">
        {{ t('foundWords.empty') }}
      </p>
    </div>

    <ul
      v-else
      class="flex-1 overflow-y-auto grid grid-cols-[repeat(auto-fill,minmax(7rem,1fr))] gap-2 p-0 m-0 list-none content-start"
    >
      <li
        v-for="word of sortedWords"
        :key="word"
        class="word-item font-mono text-sm px-3 py-2 border-1 border-solid rounded-lg transition-all duration-150 hover:-translate-y-px motion-reduce:transition-none"
        :class="isPangram(word)
          ? 'is-pangram bg-celebration-bg border-celebration text-celebration font-semibold'
          : 'bg-surface-elevated border-muted text-on-surface hover:bg-surface-hover'"
        :title="isPangram(word) ? t('foundWords.pangram') : ''"
      >
        {{ word.toLowerCase() }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.word-item.is-pangram {
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.15);
}

.word-item.is-pangram:hover {
  background: rgba(245, 158, 11, 0.2);
  box-shadow: 0 0 16px rgba(245, 158, 11, 0.25);
}
</style>

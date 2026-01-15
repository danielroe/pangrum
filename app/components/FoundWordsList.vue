<script setup lang="ts">
const props = defineProps<{
  words: Set<string>
  letters: string[]
}>()

const sortedWords = computed(() => [...props.words].sort())

function isPangram(word: string) {
  return props.letters.every(l => word.includes(l))
}
</script>

<template>
  <div
    v-if="sortedWords.length === 0"
    class="flex items-center justify-center h-full text-muted-foreground font-mono text-sm text-center p-4"
  >
    Make a guess to get started
  </div>
  <ul
    v-else
    class="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-2 p-0 m-0 list-none content-start"
  >
    <li
      v-for="word of sortedWords"
      :key="word"
      class="word-item font-mono text-sm px-3 py-2 border-1 border-solid rounded-lg transition-all duration-150 hover:-translate-y-px motion-reduce:transition-none"
      :class="isPangram(word)
        ? 'is-pangram bg-celebration-bg border-celebration text-celebration font-semibold'
        : 'bg-surface-elevated border-muted text-on-surface hover:bg-surface-hover'"
      :title="isPangram(word) ? 'Pangram!' : ''"
    >
      {{ word.toLowerCase() }}
    </li>
  </ul>
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

<script setup lang="ts">
const props = defineProps<{
  words: Set<string>
  letters: string[]
}>()

const sortedWords = computed(() => [...props.words].sort())
</script>

<template>
  <div
    v-if="sortedWords.length === 0"
    class="flex items-center justify-center h-full text-white text-opacity-50 font-mono text-sm text-center px-4"
  >
    Make a guess to get started!
  </div>
  <ul
    v-else
    class="p-0 grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-1 text-xs sm:text-sm text-white m-0 w-full"
  >
    <li
      v-for="word of sortedWords"
      :key="word"
      class="list-none font-mono px-2 py-1 border-1 border-solid transition-colors"
      style="contain: layout style;"
      :class="{
        'bg-primary bg-opacity-40 border-primary font-bold': letters.every(l => word.includes(l)),
        'bg-white bg-opacity-5 border-white border-opacity-10': !letters.every(l => word.includes(l)),
      }"
      :title="letters.every(l => word.includes(l)) ? 'Pangram!' : ''"
    >
      {{ word.toLowerCase() }}
    </li>
  </ul>
</template>

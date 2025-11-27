<script setup lang="ts">
const props = defineProps<{
  words: Set<string>
  letters: string[]
}>()

const sortedWords = computed(() => [...props.words].sort())
</script>

<template>
  <ul class="p-0 flex flex-col gap-1 gap-col-6 text-xs sm:text-base sm:flex-wrap justify-start m-0">
    <li 
      v-for="word of sortedWords" 
      :key="word"
      class="list-none" 
      :class="{ 'font-bold': letters.every(l => word.includes(l)) }"
    >
      {{ word.toLowerCase() }}
    </li>
  </ul>
</template>


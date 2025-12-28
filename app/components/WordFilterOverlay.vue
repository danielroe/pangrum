<script setup lang="ts">
defineProps<{
  currentWord: string
  matchingWords: string[]
}>()
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-200"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-150"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2"
  >
    <div
      v-if="matchingWords.length > 0"
      class="absolute left-0 top-full mt-2 bg-black bg-opacity-90 backdrop-blur-sm border border-white border-opacity-20 border-1 border-solid px-4 py-3 z-20 max-h-48 overflow-y-auto min-w-64"
    >
      <div class="text-xs text-white text-opacity-60 mb-2 font-mono uppercase tracking-wider">
        Already found:
      </div>
      <ul
        class="list-none p-0 m-0 grid gap-x-4 gap-y-1"
        :class="matchingWords.length > 8 ? 'grid-cols-2' : 'grid-cols-1'"
      >
        <li
          v-for="matchWord in matchingWords"
          :key="matchWord"
          class="text-sm font-mono lowercase"
        >
          <span class="text-yellow-300">{{ currentWord.toLowerCase() }}</span><span class="text-white text-opacity-60">{{ matchWord.slice(currentWord.length).toLowerCase() }}</span>
        </li>
      </ul>
    </div>
  </Transition>
</template>

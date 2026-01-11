<script setup lang="ts">
defineProps<{
  currentWord: string
  matchingWords: string[]
  matchingIncorrect: string[]
}>()
</script>

<template>
  <Transition
    enter-active-class="transition-all duration-200 ease-out"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-2"
  >
    <div
      v-if="matchingWords.length > 0 || matchingIncorrect.length > 0"
      class="absolute left-0 top-full mt-2 bg-surface-elevated border-1 border-solid border-muted rounded-xl p-4 z-20 max-h-48 overflow-y-auto min-w-64 backdrop-blur-sm shadow-xl"
    >
      <div v-if="matchingWords.length > 0">
        <div class="text-xs font-mono uppercase tracking-wide text-muted-foreground mb-2">
          Already found:
        </div>
        <ul
          class="list-none p-0 m-0 grid gap-y-1 gap-x-4"
          :class="matchingWords.length > 8 ? 'grid-cols-2' : 'grid-cols-1'"
        >
          <li
            v-for="matchWord in matchingWords"
            :key="matchWord"
            class="text-sm font-mono lowercase"
          >
            <span class="text-primary">{{ currentWord.toLowerCase() }}</span><span class="text-muted-foreground">{{ matchWord.slice(currentWord.length).toLowerCase() }}</span>
          </li>
        </ul>
      </div>
      <div
        v-if="matchingIncorrect.length > 0"
        class="mt-3 pt-3 border-t-1 border-solid border-muted"
      >
        <div class="text-xs font-mono uppercase tracking-wide text-muted-foreground mb-2">
          Incorrect:
        </div>
        <ul
          class="list-none p-0 m-0 grid gap-y-1 gap-x-4"
          :class="matchingIncorrect.length > 8 ? 'grid-cols-2' : 'grid-cols-1'"
        >
          <li
            v-for="incorrectWord in matchingIncorrect"
            :key="incorrectWord"
            class="text-sm font-mono lowercase opacity-50 line-through"
          >
            <span class="text-error-light">{{ currentWord.toLowerCase() }}</span><span>{{ incorrectWord.slice(currentWord.length).toLowerCase() }}</span>
          </li>
        </ul>
      </div>
    </div>
  </Transition>
</template>

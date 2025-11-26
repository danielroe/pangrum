<script setup lang="ts">
const { data } = useFetch('/api/words', {
  query: {  
    // letters: 'analdoge'
  }
})

const letters = computed(() => data.value?.letters || [])
const centreLetter = computed(() => data.value?.letters[2]!)
const hashes = computed(() => data.value?.hashes || [])
const validWords = computed(() => data.value?.words || [])

const words = useLocalStorage<Set<string>>(() => `spelling-bee-${letters.value.join('')}`, new Set(), {
  initOnMounted: true,
  serializer: {
    read: (v: string) => new Set(JSON.parse(v)),
    write: (v: Set<string>) => JSON.stringify([...v]),
  },
})
</script>

<template>
  <div class="flex flex-col gap-2 sm:gap-4 text-white px-2 sm:px-6 sm:py-8">
    <h2>spelling bee</h2>
    <div class="flex flex-col-reverse sm:flex-row justify-start gap-8 sm:gap-12 items:start sm:items-end">
      <LetterGrid :letters="letters" :centre-letter="centreLetter" />
      <TheScore class="flex-grow" :words="words" :valid-words="validWords" />
    </div>
    <WordInput v-model:words="words" :hashes="hashes" :letters="letters" :centre-letter="centreLetter" :valid-words="validWords" />
    <div class="flex flex-col-reverse sm:flex-row gap-2 sm:gap-6 items-stretch">
      <WordHints class="w-full sm:w-auto" :words="words" :valid-words="validWords" />
      <div class="relative min-h-24 flex-grow border border-yellow-300 border-2 border-solid overflow-scroll">
        <WordList class="absolute h-[calc(100%-1.5rem)] w-full px-4 py-3" :words="words" :letters="letters" />
      </div>
    </div>
  </div>
</template>

<style>
:root {
  background-color: #333;
  font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
</style>

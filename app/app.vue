<script setup lang="ts">
const { data } = useFetch('/api/words', {
  query: {  
    // letters: 'analdoge'
  }
})

const letters = computed(() => data.value?.letters || [])
const centreLetter = computed(() => data.value?.letters[2] || '')
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
    <h2 class="text-sm absolute top-0 right-4 leading-tight mt-1 opacity-40 font-normal sm:font-bold sm:text-2xl sm:relative sm:opacity-100 sm:right-0">spelling bee</h2>
    <div class="mt-3 sm:mt-0 flex flex-col-reverse sm:flex-row justify-start gap-8 sm:gap-12 items:start sm:items-end">
      <LetterGrid :letters="letters" :centre-letter="centreLetter" />
      <TheScore class="flex-grow" :words="words" :valid-words="validWords" />
    </div>
    <WordInput v-model:words="words" :hashes="hashes" :letters="letters" :centre-letter="centreLetter" :valid-words="validWords" />
    <div class="flex flex-row flex-wrap gap-2 sm:gap-6 items-stretch">
      <WordHints class="max-w-full mr-auto sm:w-auto" :words="words" :valid-words="validWords" />
      <div class="relative min-h-24 min-w-1/3 flex-grow border border-white border-opacity-10 border-1 border-solid overflow-scroll">
        <WordList class="absolute h-[calc(100%-1.5rem)] w-full px-2 py-1 md:px-4 md:py-3" :words="words" :letters="letters" />
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

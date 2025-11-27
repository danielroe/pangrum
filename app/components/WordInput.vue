<script setup lang="ts">
import { hash } from 'ohash'

const props = defineProps<{
  centreLetter: string
  hashes: string[]
  letters: string[]
  validWords: string[]
}>()

const words = defineModel<Set<string>>('words')

const word = useWord()
const input = useTemplateRef('wordInput')

watch(word, (letters) => {
  word.value = letters.replace(/\W/g, '')

  if (letters.at(-1) === '\n') {
    return addWord()
  }

  if (navigator.maxTouchPoints === 0) {
    input.value?.focus()
  }
})

function addWord () {
  const normalisedWord = word.value.toUpperCase()
  try {
    if (!normalisedWord) {
      throw new TypeError('No word')
    }
    if (normalisedWord.length < 4) {
      throw new TypeError('Not long enough')
    }
    if (!normalisedWord.includes(props.centreLetter)) {
      throw new TypeError('Does not contain centre letter')
    }
    if (!normalisedWord.split('').every(letter => props.letters.includes(letter))) {
      throw new TypeError('Uses wrong letters')
    }
    if (!props.hashes.includes(hash(normalisedWord))) {
      throw new TypeError('Not a valid word')
    }

    words.value?.add(normalisedWord)
  } catch {
    // TODO: show error to user
  } finally {
    // clear + prepare for next steps
    word.value = ''
    if (navigator.maxTouchPoints === 0) {
      input.value?.focus()
    }
  }
}
</script>

<template>
  <form class="flex flex-row items-end gap-2xl" @submit.prevent="addWord">
    <label class="flex flex-col gap-2 max-w-full items-stretch overflow-hidden">
      <span class="hidden sm:block">enter your word</span>
      <div class="relative">
        <input
          ref="wordInput"
          v-model="word"
          name="word"
          autofocus
          type="text"
          class="p-2 rounded-none border-none font-bold text-xl text-yellow-300 uppercase tracking-[0.5rem] h-6 bg-transparent outline-none border-b-2 border-b-solid border-white border-opacity-10 border-opacity-20 focus:border-opacity-100 focus:border-yellow-300"
        >
        <!-- TODO: implement with mask instead -->
        <div v-if="word" class="absolute px-2 pt-2 pb-1 rounded-none border-none font-bold text-xl text-white uppercase gap-2 flex font-bold text-xl text-white bg-[#333] bottom-1 top-0 -left-1">
          <span 
            v-for="letter, i of word.toUpperCase().split('')" 
            :key="`${letter}-${i}`"
            class="h-6 flex items-center justify-center"
            :class="[{
              'text-yellow-500': centreLetter === letter,
              'text-white': centreLetter !== letter && letters.includes(letter),
              'text-gray-500': !letters.includes(letter)
            },
          ]"
            >
            {{ letter }}
          </span>
        </div>
      </div>
    </label>
    <button type="submit" class="hidden sm:block bg-yellow-300 text-black border-0 px-3 py-2">
      <span aria-hidden="true">⏎</span>
      <span class="sr-only">Submit word</span>
    </button>
  </form>
</template>


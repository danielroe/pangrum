<script setup lang="ts">
import { hash } from 'ohash'

const props = defineProps<{
  centreLetter: string
  hashes: string[]
  letters: string[]
  validWords: string[]
}>()

const words = defineModel<Set<string>>('words')

const language = useLanguage()

const incorrectGuesses = useLocalStorage<Record<string, string>>(
  () => `glypher-${language.value}-incorrect-${props.letters.join('')}`,
  {},
  {
    initOnMounted: true,
    serializer: {
      read: (v: string) => JSON.parse(v),
      write: (v: Record<string, string>) => JSON.stringify(v),
    },
  },
)

const word = useWord()
const input = useTemplateRef('wordInput')

const matchingWords = computed(() => {
  if (!word.value || word.value.length < 2) return []
  const currentWord = word.value.toUpperCase()
  return [...(words.value || [])].filter(w => w.startsWith(currentWord)).sort()
})

const matchingIncorrect = computed(() => {
  if (!word.value || word.value.length < 2) return []
  const currentWord = word.value.toUpperCase()
  return Object.keys(incorrectGuesses.value)
    .filter(w => w.startsWith(currentWord))
    .sort()
    .slice(0, 10) // Limit to 10 incorrect guesses
})

const wordLetters = computed(() => word.value.toUpperCase().split(''))

watch(word, (letters) => {
  word.value = letters.replace(/\W/g, '')

  if (letters.at(-1) === '\n') {
    return addWord()
  }

  if (navigator.maxTouchPoints === 0) {
    input.value?.focus()
  }
})

function addWord() {
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
    if (words.value?.has(normalisedWord)) {
      throw new TypeError('Already guessed')
    }

    words.value?.add(normalisedWord)

    const isPangram = props.letters.every(letter => normalisedWord.includes(letter))
    const points = scoreWord(normalisedWord)

    if (isPangram) {
      addToast({
        message: `🌟 PANGRAM! +${points} points! 🌟`,
        type: 'celebration',
      })
    }
    else if (points >= 10) {
      addToast({
        message: `✨ Amazing! +${points} points!`,
        type: 'success',
      })
    }
    else {
      addToast({
        message: `🎉 +${points} points!`,
        type: 'success',
      })
    }
  }
  catch (err) {
    const message = (err as Error).toString().replace('TypeError: ', '')
    if (message === 'No word') {
      return
    }

    // Track incorrect guesses (excluding 'already guessed')
    if (normalisedWord && message !== 'Already guessed') {
      incorrectGuesses.value[normalisedWord] = message
    }

    addToast({
      message: (err as Error).toString().replace('TypeError: ', ''),
      type: 'error',
    })
  }
  finally {
    // clear + prepare for next steps
    word.value = ''
    if (navigator.maxTouchPoints === 0) {
      input.value?.focus()
    }
  }
}
</script>

<template>
  <form
    class="flex flex-row items-end gap-2xl relative"
    @submit.prevent="addWord"
  >
    <label class="flex flex-col gap-2 max-w-full items-stretch overflow-hidden">
      <span class="hidden sm:block">enter your word</span>
      <div class="relative flex flex-col">
        <input
          ref="wordInput"
          v-model="word"
          name="word"
          autofocus
          type="text"
          class="p-2 rounded-none border-none font-mono font-bold text-xl uppercase tracking-[0.5rem] h-6 bg-transparent outline-none border-b-2 border-b-solid border-muted focus:border-yellow-300 text-transparent caret-yellow-300"
        >
        <div
          v-if="word"
          aria-hidden="true"
          class="absolute px-2 pt-2 pb-1 rounded-none border-none font-mono font-bold text-xl uppercase tracking-[0.5rem] pointer-events-none flex"
        >
          <span
            v-for="letter, i of wordLetters"
            :key="i"
            class="inline-block"
            :class="{
              'text-yellow-500': centreLetter === letter,
              'text-on-surface': centreLetter !== letter && letters.includes(letter),
              'text-gray-500': !letters.includes(letter),
            }"
          >{{ letter }}</span>
        </div>
      </div>
    </label>
    <button
      type="submit"
      class="hidden sm:block bg-yellow-300 text-black border-0 px-3 py-2 transition-all duration-100 active:bg-yellow-400 focus:outline focus:outline-2 focus:outline-yellow-500 focus:outline-offset-2"
      aria-label="Submit word"
    >
      <span aria-hidden="true">⏎</span>
    </button>

    <WordFilterOverlay
      :current-word="word"
      :matching-words="matchingWords"
      :matching-incorrect="matchingIncorrect"
    />
  </form>
</template>

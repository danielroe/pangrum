<script setup lang="ts">
import { hash } from 'ohash'
import { LANGUAGES } from '#shared/languages'

const props = defineProps<{
  centreLetter: string
  hashes: string[]
  letters: string[]
  validWords: string[]
}>()

const words = defineModel<Set<string>>('words')

const language = useLanguage()

const incorrectGuesses = useLocalStorage<Record<string, string>>(
  () => `pangrum-${language.value}-incorrect-${props.letters.join('')}`,
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
const { triggerCelebration } = useParticles()

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

const invalidChars = computed(() => {
  const lang = LANGUAGES[language.value] || LANGUAGES.en!
  return new RegExp(`[^${lang.alphabet}]`, 'gi')
})

watch(language, () => {
  word.value = ''
})

watch(word, (letters) => {
  word.value = letters.replace(invalidChars.value, '')

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
      triggerCelebration()
      addToast({
        message: `PANGRAM! +${points}`,
        type: 'celebration',
      })
    }
    else if (points >= 10) {
      addToast({
        message: `Amazing! +${points}`,
        type: 'success',
      })
    }
    else {
      addToast({
        message: `+${points}`,
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
    class="flex flex-row items-end gap-4 relative"
    @submit.prevent="addWord"
  >
    <label class="flex flex-col gap-2 flex-1 sm:flex-initial max-w-full overflow-hidden">
      <span class="hidden sm:block text-sm text-muted-foreground">enter your word</span>
      <div class="relative flex flex-col">
        <input
          ref="wordInput"
          v-model="word"
          name="word"
          autofocus
          type="text"
          class="word-input p-2 border-none rounded-none font-mono font-bold text-xl uppercase tracking-widest h-6 bg-transparent outline-none text-transparent caret-primary"
        >
        <div
          v-if="word"
          aria-hidden="true"
          class="absolute p-2 font-mono font-bold text-xl uppercase tracking-widest pointer-events-none flex"
        >
          <span
            v-for="letter, i of wordLetters"
            :key="i"
            class="inline-block transition-colors duration-150"
            :class="{
              'text-letter-centre': centreLetter === letter,
              'text-letter-valid': centreLetter !== letter && letters.includes(letter),
              'text-letter-invalid': !letters.includes(letter),
            }"
          >{{ letter }}</span>
        </div>
        <div class="word-input-underline h-0.5 bg-muted transition-all duration-200" />
      </div>
    </label>
    <button
      type="submit"
      class="submit-button hidden sm:block py-2 px-3 text-lg bg-primary text-dark border-none rounded-lg cursor-pointer transition-all duration-150 hover:bg-primary-hover hover:shadow-lg active:scale-95 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
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

<style scoped>
.word-input::selection {
  background: var(--color-primary-muted);
}

.word-input:focus ~ .word-input-underline {
  background: var(--color-primary);
  box-shadow: 0 2px 8px var(--color-primary-glow);
}

.submit-button:hover {
  box-shadow: 0 4px 12px var(--color-primary-glow);
}
</style>

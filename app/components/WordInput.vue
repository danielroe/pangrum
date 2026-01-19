<script setup lang="ts">
import { hash } from 'ohash'
import { LANGUAGES } from '#shared/languages'

const props = defineProps<{
  centreLetter: string
  hashes: string[]
  letters: string[]
  validWords: string[]
}>()

const emit = defineEmits<{
  wordAdded: [word: string]
}>()

const words = defineModel<Set<string>>('words', { required: true })

const { t } = useI18n()
const language = useLanguage()

const hasTrackedFirstWord = ref(false)

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
  return [...words.value].filter(w => w.startsWith(currentWord)).sort()
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

// Error keys for validation
const ERROR_KEYS = {
  noWord: 'noWord',
  notLongEnough: 'notLongEnough',
  noCentreLetter: 'noCentreLetter',
  wrongLetters: 'wrongLetters',
  notValid: 'notValid',
  alreadyGuessed: 'alreadyGuessed',
} as const

type ErrorKey = typeof ERROR_KEYS[keyof typeof ERROR_KEYS]

function addWord() {
  const normalisedWord = word.value.toUpperCase()
  try {
    if (!normalisedWord) {
      throw new Error(ERROR_KEYS.noWord)
    }
    if (normalisedWord.length < 4) {
      throw new Error(ERROR_KEYS.notLongEnough)
    }
    if (!normalisedWord.includes(props.centreLetter)) {
      throw new Error(ERROR_KEYS.noCentreLetter)
    }
    if (!normalisedWord.split('').every(letter => props.letters.includes(letter))) {
      throw new Error(ERROR_KEYS.wrongLetters)
    }
    if (!props.hashes.includes(hash(normalisedWord))) {
      throw new Error(ERROR_KEYS.notValid)
    }
    if (words.value.has(normalisedWord)) {
      throw new Error(ERROR_KEYS.alreadyGuessed)
    }

    const { percentage } = useScore(() => words.value, () => props.validWords)
    const levelBefore = getLevelKey(percentage.value)

    words.value.add(normalisedWord)
    emit('wordAdded', normalisedWord)

    const levelAfter = getLevelKey(percentage.value)
    const didLevelUp = levelBefore !== levelAfter

    const isPangram = props.letters.every(letter => normalisedWord.includes(letter))
    const points = scoreWord(normalisedWord)

    if (!hasTrackedFirstWord.value) {
      hasTrackedFirstWord.value = true
      trackFirstWord(language.value)
    }

    if (isPangram) {
      trackPangramFound(language.value, words.value.size)
      triggerCelebration()
      addToast({
        message: t('toasts.pangram', { points }),
        type: 'celebration',
      })
    }
    else if (points >= 10) {
      addToast({
        message: t('toasts.amazing', { points }),
        type: 'success',
      })
    }
    else {
      addToast({
        message: t('toasts.points', { points }),
        type: 'success',
      })
    }

    if (didLevelUp) {
      trackLevelReached(levelAfter, language.value)
      trackPuzzleCompleted(language.value, percentage.value)
      addToast({
        message: t('toasts.levelUp', { level: t(`levels.${levelAfter}`) }),
        type: 'celebration',
      })
    }
  }
  catch (err) {
    const errorKey = (err as Error).message as ErrorKey
    if (errorKey === ERROR_KEYS.noWord) {
      return
    }

    // Track incorrect guesses (excluding 'already guessed')
    if (normalisedWord && errorKey !== ERROR_KEYS.alreadyGuessed) {
      incorrectGuesses.value[normalisedWord] = errorKey
    }

    addToast({
      message: t(`toasts.${errorKey}`),
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
    class="flex flex-row items-end gap-4 relative ls:gap-2"
    @submit.prevent="addWord"
  >
    <label class="flex flex-col gap-2 flex-1 sm:flex-initial max-w-full overflow-hidden ls:gap-1">
      <span class="hidden sm:block text-sm text-muted-foreground ls:hidden">{{ t('input.label') }}</span>
      <div class="relative flex flex-col">
        <input
          ref="wordInput"
          v-model="word"
          name="word"
          autocomplete="off"
          autofocus
          type="text"
          :aria-label="t('input.label')"
          class="word-input p-2 border-none rounded-none font-mono font-bold text-2xl sm:text-xl uppercase tracking-widest bg-transparent outline-none text-transparent caret-primary ls:p-1 ls:text-base"
        >
        <div
          v-if="word"
          aria-hidden="true"
          class="absolute p-2 font-mono font-bold text-2xl sm:text-xl uppercase tracking-widest pointer-events-none flex ls:p-1 ls:text-base"
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
      class="submit-button hidden sm:block py-2 px-3 text-lg bg-primary text-dark border-1 border-solid border-primary rounded-lg cursor-pointer transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ls:hidden"
      :aria-label="t('input.submit')"
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

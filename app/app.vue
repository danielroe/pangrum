<script setup lang="ts">
const language = useLanguage()
const today = ref(new Date().toISOString().slice(0, 10))
const { data } = useFetch(() => `/api/words/${language.value}/${today.value}`, {
  server: false,
})
const isOnline = useOnline()

function updateDate() {
  today.value = new Date().toISOString().slice(0, 10)
}

const letters = computed(() => data.value?.letters || [])
const centreLetter = computed(() => data.value?.letters[2] || '')
const hashes = computed(() => data.value?.hashes || [])
const validWords = computed(() => data.value?.words || [])
const pairs = computed(() => data.value?.pairs || {})
const totalPangrams = computed(() => data.value?.pangrams || 0)
const puzzleDate = computed(() => data.value?.date || '')

const words = useLocalStorage<Set<string>>(() => `glypher-${language.value}-${letters.value.join('')}`, new Set(), {
  initOnMounted: true,
  serializer: {
    read: (v: string) => new Set(JSON.parse(v)),
    write: (v: Set<string>) => JSON.stringify([...v]),
  },
})

const showDateMismatchModal = ref(false)

function checkDateMismatch() {
  if (!puzzleDate.value) return

  const today = new Date().toISOString().slice(0, 10)
  if (puzzleDate.value !== today) {
    showDateMismatchModal.value = true
  }
}

function closeDateMismatchModal() {
  pause()
  showDateMismatchModal.value = false
  window.removeEventListener('focus', checkDateMismatch)
}

// Check when loaded + every minute thereafter
onNuxtReady(checkDateMismatch)
const { pause } = useIntervalFn(checkDateMismatch, 60000)

// ... as well as when window regains focus)
if (import.meta.client) {
  window.addEventListener('focus', checkDateMismatch)
}
</script>

<template>
  <TheToast />
  <div class="h-dvh overflow-hidden">
    <div class="flex flex-col h-full gap-2 sm:gap-4 text-white px-2 sm:px-6 py-2 sm:py-8">
      <div class="flex items-start justify-between gap-4 flex-shrink-0">
        <h2 class="text-sm leading-tight mt-1 opacity-40 font-normal sm:font-bold sm:text-2xl sm:opacity-100 flex-shrink-0">
          glypher
          <span
            v-if="!isOnline"
            class="text-xs opacity-60"
          >
            offline
          </span>
        </h2>
        <LanguageSelector class="flex-shrink-0" />
      </div>
      <div
        v-if="data"
        class="mt-3 sm:mt-0 flex flex-col-reverse sm:flex-row justify-start gap-8 sm:gap-12 items:start sm:items-end flex-shrink-0"
      >
        <LetterGrid
          :letters="letters"
          :centre-letter="centreLetter"
        />
        <TheScore
          class="flex-grow"
          :words="words"
          :valid-words="validWords"
        />
      </div>
      <WordInput
        v-if="data"
        v-model:words="words"
        :hashes="hashes"
        :letters="letters"
        :centre-letter="centreLetter"
        :valid-words="validWords"
        class="flex-shrink-0"
      />
      <WordHints
        v-if="data"
        class="max-w-full min-h-0 flex-grow"
        :pairs="pairs"
        :words="words"
        :valid-words="validWords"
        :letters="letters"
        :total-pangrams="totalPangrams"
      />
    </div>
  </div>
  <DateMismatchModal
    v-if="data && showDateMismatchModal"
    :puzzle-date="puzzleDate"
    :on-refresh="updateDate"
    @close="closeDateMismatchModal"
  />
</template>

<style>
:root {
  --at-apply: bg-surface;
  font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

html, body {
  margin: 0;
  -webkit-user-select: none;
  user-select: none;
}

input, textarea {
  -webkit-user-select: text;
  user-select: text;
}
</style>

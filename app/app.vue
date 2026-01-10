<script setup lang="ts">
const language = useLanguage()
const today = ref(new Date().toISOString().slice(0, 10))
const { data } = useFetch(() => `/api/words/${language.value}/${today.value}`, {
  server: false,
})
const isOnline = useOnline()
const { hintsEnabled } = useHints()

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
    <div class="flex flex-col h-full gap-2 sm:gap-4 text-on-surface px-2 sm:px-6 py-2 sm:py-8">
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
        <div class="flex gap-2 items-center flex-shrink-0">
          <HintsToggle />
          <NotificationToggle />
          <ThemeSelector />
          <LanguageSelector />
        </div>
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
        v-if="data && hintsEnabled"
        class="max-w-full min-h-0 flex-grow"
        :pairs="pairs"
        :words="words"
        :valid-words="validWords"
        :letters="letters"
        :total-pangrams="totalPangrams"
      />
      <div
        v-else-if="data && !hintsEnabled"
        class="max-w-full min-h-0 flex-grow overflow-y-auto px-2"
      >
        <FoundWordsList
          :words="words"
          :letters="letters"
        />
      </div>
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
/* Dark theme (default) */
:root {
  --color-primary: #fcd34d;
  --color-primary-hover: #fbbf24;
  --color-success: #f59e0b;
  --color-success-bg: #b45309;
  --color-error: #ef4444;
  --color-error-light: #f87171;
  --color-error-bg: #b91c1c;
  --color-celebration: #22c55e;
  --color-celebration-bg: #15803d;
  --color-surface: #333;
  --color-surface-hover: #444;
  --color-surface-active: #555;
  --color-progress-inactive: #4b5563;
  --color-on-surface: #fff;
  --color-muted: rgba(255, 255, 255, 0.1);
  --color-muted-foreground: rgba(255, 255, 255, 0.5);
  --color-primary-muted: rgba(252, 211, 77, 0.25);
  --color-primary-subtle: rgba(252, 211, 77, 0.1);
  --color-primary-border: rgba(252, 211, 77, 0.3);

  --at-apply: bg-surface;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* Light theme */
html[data-theme='light'] {
  --color-primary: #d97706;
  --color-primary-hover: #b45309;
  --color-success: #ca8a04;
  --color-success-bg: #fef3c7;
  --color-error: #dc2626;
  --color-error-light: #f87171;
  --color-error-bg: #fee2e2;
  --color-celebration: #16a34a;
  --color-celebration-bg: #dcfce7;
  --color-surface: #f5f5f4;
  --color-surface-hover: #e7e5e4;
  --color-surface-active: #d6d3d1;
  --color-progress-inactive: #d1d5db;
  --color-on-surface: #1c1917;
  --color-muted: rgba(0, 0, 0, 0.1);
  --color-muted-foreground: rgba(0, 0, 0, 0.5);
  --color-primary-muted: rgba(217, 119, 6, 0.2);
  --color-primary-subtle: rgba(217, 119, 6, 0.1);
  --color-primary-border: rgba(217, 119, 6, 0.3);
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

<script setup lang="ts">
import type { TheScore } from '#components'

const language = useLanguage()
const selectedDate = ref(new Date().toISOString().slice(0, 10))
const { data } = useFetch(() => `/api/words/${language.value}/${selectedDate.value}`, {
  server: false,
})
const isOnline = useOnline()
const { hintsEnabled } = useHints()
const { showTutorial, checkFirstVisit } = useTutorial()

defineOgImageComponent('Default')

const todayDate = computed(() => new Date().toISOString().slice(0, 10))
const isViewingToday = computed(() => selectedDate.value === todayDate.value)

function goToToday() {
  selectedDate.value = todayDate.value
}

const letters = computed(() => data.value?.letters || [])
const centreLetter = computed(() => data.value?.letters[2] || '')
const hashes = computed(() => data.value?.hashes || [])
const validWords = computed(() => data.value?.words || [])
const pairs = computed(() => data.value?.pairs || {})
const totalPangrams = computed(() => data.value?.pangrams || 0)
const puzzleDate = computed(() => data.value?.date || '')

const words = useLocalStorage<Set<string>>(() => `pangrum-${language.value}-${letters.value.join('')}`, new Set(), {
  initOnMounted: true,
  serializer: {
    read: (v: string) => new Set(JSON.parse(v)),
    write: (v: Set<string>) => JSON.stringify([...v]),
  },
})

const { sendWord } = useSync({
  currentPuzzleKey: () => letters.value.length ? `${language.value}-${letters.value.join('')}` : '',
  currentWords: words,
  currentDate: selectedDate,
  currentLang: language,
  onNavigateToPuzzle: (date, lang) => {
    if (date === selectedDate.value && lang === language.value) {
      return
    }
    if (!isLanguage(lang)) {
      return
    }

    language.value = lang
    selectedDate.value = date
    addToast({
      message: 'Navigated to synced puzzle',
      type: 'success',
    })
  },
})

function handleWordAdded(word: string) {
  sendWord(word)
}

const showDateMismatchModal = ref(false)
const showShareModal = ref(false)
const scoreRef = useTemplateRef<InstanceType<typeof TheScore>>('score')

function checkDateMismatch() {
  if (!puzzleDate.value) return
  if (!isViewingToday.value) return

  if (puzzleDate.value !== todayDate.value) {
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

onNuxtReady(checkFirstVisit)

// ... as well as when window regains focus)
if (import.meta.client) {
  window.addEventListener('focus', checkDateMismatch)
}

function openShareModal() {
  showShareModal.value = true
}

const shareData = computed(() => scoreRef.value?.getShareData())
</script>

<template>
  <NuxtPwaAssets />
  <TheToast />
  <ParticleCanvas />
  <div class="h-100dvh overflow-hidden">
    <div class="flex flex-col h-full gap-3 p-3 text-on-surface md:gap-6 p-8">
      <header class="flex items-start justify-between gap-4 flex-shrink-0">
        <h1 class="text-sm font-normal tracking-[0.15em] lowercase opacity-40 mx-0 mb-0 mt-1 transition-opacity transition-duration-0.2s md:text-2xl md:font-semibold md:opacity-100 md:tracking-widest hover:opacity-100">
          pangrum
          <ClientOnly>
            <span
              v-if="!isOnline"
              class="text-xs opacity-60 ml-2"
            >
              offline
            </span>
          </ClientOnly>
        </h1>
        <div class="flex gap-2 items-center flex-shrink-0">
          <ClientOnly>
            <DatePicker v-model="selectedDate" />
            <template #fallback>
              <div class="w-9 h-9 bg-surface border-1 border-solid border-muted rounded-lg sm:w-24 sm:h-7" />
            </template>
          </ClientOnly>
          <TutorialButton />
          <HintsToggle />
          <SyncToggle />
          <NotificationToggle />
          <ThemeSelector />
          <LanguageSelector />
        </div>
      </header>

      <main
        v-if="data"
        class="flex flex-col flex-1 min-h-0 gap-4 md:gap-6"
      >
        <div class="flex flex-col-reverse gap-8 flex-shrink-0 md:flex-row md:items-end md:gap-12">
          <LetterGrid
            :letters="letters"
            :centre-letter="centreLetter"
          />
          <TheScore
            ref="score"
            class="flex-grow-1"
            :words="words"
            :valid-words="validWords"
            :total-pangrams="totalPangrams"
            :letters="letters"
            :date="selectedDate"
            @share="openShareModal"
          />
        </div>

        <WordInput
          v-model:words="words"
          :hashes="hashes"
          :letters="letters"
          :centre-letter="centreLetter"
          :valid-words="validWords"
          class="flex-shrink-0"
          @word-added="handleWordAdded"
        />

        <section class="flex-1 min-h-0 overflow-y-auto px-0 py-2 md:pb-0 words-section">
          <WordHints
            v-if="hintsEnabled"
            :pairs="pairs"
            :words="words"
            :valid-words="validWords"
            :letters="letters"
            :total-pangrams="totalPangrams"
          />
          <FoundWordsList
            v-else
            :words="words"
            :letters="letters"
          />
        </section>
      </main>
    </div>
  </div>
  <DateMismatchModal
    v-if="data && showDateMismatchModal"
    :puzzle-date="puzzleDate"
    :on-refresh="goToToday"
    @close="closeDateMismatchModal"
  />
  <ShareResultsModal
    v-if="showShareModal && shareData"
    :data="shareData"
    @close="showShareModal = false"
  />
  <TutorialModal
    v-if="showTutorial"
    @close="showTutorial = false"
  />
</template>

<style>
/* Dark theme (default) - Minimal & Zen with Teal/Cyan accent */
:root {
  /* Primary - Teal/Cyan family */
  --color-primary: #14b8a6;
  --color-primary-hover: #0d9488;
  --color-primary-glow: rgba(20, 184, 166, 0.4);
  --color-primary-muted: rgba(20, 184, 166, 0.2);
  --color-primary-subtle: rgba(20, 184, 166, 0.08);
  --color-primary-border: rgba(20, 184, 166, 0.3);

  /* Surface - Deep charcoal */
  --color-surface: #0f0f0f;
  --color-surface-elevated: #1a1a1a;
  --color-surface-hover: #262626;
  --color-surface-active: #333333;

  /* Semantic - Success (green) */
  --color-success: #22c55e;
  --color-success-bg: rgba(34, 197, 94, 0.15);

  /* Semantic - Error (rose, softer than red) */
  --color-error: #f43f5e;
  --color-error-light: #fb7185;
  --color-error-bg: rgba(244, 63, 94, 0.15);

  /* Semantic - Celebration (amber for pangrams) */
  --color-celebration: #f59e0b;
  --color-celebration-bg: rgba(245, 158, 11, 0.15);

  /* Progress indicator */
  --color-progress-inactive: #333333;

  /* Text colors */
  --color-on-surface: #fafafa;
  --color-muted: rgba(250, 250, 250, 0.08);
  --color-muted-foreground: rgba(250, 250, 250, 0.5);

  /* Letter colors for input */
  --color-letter-centre: #2dd4bf;
  --color-letter-valid: #fafafa;
  --color-letter-invalid: #525252;

  --at-apply: bg-surface;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* Light theme */
html[data-theme='light'] {
  /* Primary - Darker teal for light backgrounds */
  --color-primary: #0d9488;
  --color-primary-hover: #0f766e;
  --color-primary-glow: rgba(13, 148, 136, 0.3);
  --color-primary-muted: rgba(13, 148, 136, 0.15);
  --color-primary-subtle: rgba(13, 148, 136, 0.06);
  --color-primary-border: rgba(13, 148, 136, 0.25);

  /* Surface - Warm off-white */
  --color-surface: #fafaf9;
  --color-surface-elevated: #ffffff;
  --color-surface-hover: #f5f5f4;
  --color-surface-active: #e7e5e4;

  /* Semantic - Success */
  --color-success: #16a34a;
  --color-success-bg: rgba(22, 163, 74, 0.1);

  /* Semantic - Error */
  --color-error: #e11d48;
  --color-error-light: #f43f5e;
  --color-error-bg: rgba(225, 29, 72, 0.1);

  /* Semantic - Celebration */
  --color-celebration: #d97706;
  --color-celebration-bg: rgba(217, 119, 6, 0.1);

  /* Progress indicator */
  --color-progress-inactive: #d4d4d4;

  /* Text colors */
  --color-on-surface: #171717;
  --color-muted: rgba(0, 0, 0, 0.06);
  --color-muted-foreground: rgba(0, 0, 0, 0.5);

  /* Letter colors for input */
  --color-letter-centre: #0d9488;
  --color-letter-valid: #171717;
  --color-letter-invalid: #a3a3a3;
}

html, body {
  margin: 0;
  -webkit-user-select: none;
  user-select: none;
  /* Prevent double-tap zoom - feel like native app */
  touch-action: manipulation;
  -webkit-touch-callout: none;
}

/* Ensure all buttons and interactive elements don't trigger zoom */
button, a, input, select, textarea {
  touch-action: manipulation;
}

input, textarea {
  -webkit-user-select: text;
  user-select: text;
}
</style>

<style scoped>
.words-section {
  /* flex-1 min-h-0 overflow-y-auto px-0 py-2 md:pb-0 */
  padding-bottom: env(safe-area-inset-bottom, 1rem);
}

/* Reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>

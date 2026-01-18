<script setup lang="ts">
import type { TheScore } from '#components'
import { hash } from 'ohash'

const { t } = useI18n()
const colorMode = useColorMode()

useHead({
  meta: [{
    name: 'theme-color',
    content: () => colorMode.value === 'light' ? '#fafaf9' : '#0f0f0f',
  }],
})

const language = useLanguage()
const selectedDate = ref(new Date().toISOString().slice(0, 10))
const { data } = useFetch(() => `/api/words/${language.value}/${selectedDate.value}`, {
  server: false,
})
const isOnline = useOnline()
const { hintsEnabled } = useHints()
const { showTutorial, checkFirstVisit } = useTutorial()
const { hasProgress: checkHasProgress, stats: puzzleStats, reload: reloadHistory } = usePuzzleHistory(language)
useAutoUpdate()

const {
  counts: popularityCounts,
  totalPlayers: popularityTotalPlayers,
  loading: popularityLoading,
  connect: connectPopularity,
  submitWord: submitToPopularity,
} = usePopularity(language, selectedDate)

const popularityData = computed(() => {
  if (popularityTotalPlayers.value === 0) return null
  return {
    counts: popularityCounts.value,
    totalPlayers: popularityTotalPlayers.value,
  }
})

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

// Track whether we've submitted for this puzzle (for player count)
const popularitySubmittedKey = computed(() => `pangrum-${language.value}-${selectedDate.value}-popularity-submitted`)
const hasSubmittedForPuzzle = useLocalStorage(popularitySubmittedKey, false, { initOnMounted: true })

const storedWords = useLocalStorage<Set<string>>(() => `pangrum-${language.value}-${selectedDate.value}`, new Set(), {
  initOnMounted: true,
  serializer: {
    read: (v: string) => new Set(JSON.parse(v)),
    write: (v: Set<string>) => JSON.stringify([...v]),
  },
})

// Reload puzzle history when words are added
watch(storedWords, () => reloadHistory(), { deep: true })

// Filter stored words to only include valid words for the current puzzle
// This protects against invalid words from the old localStorage key format bug
const words = computed(() => {
  if (!letters.value.length) return storedWords.value

  const letterSet = new Set(letters.value)
  const centre = centreLetter.value

  return new Set([...storedWords.value].filter((word) => {
    if (!centre || !word.includes(centre)) return false
    return [...word].every(char => letterSet.has(char))
  }))
})

// TODO: Remove this migration code after a few releases
// Migrate words from old localStorage key format (pangrum-{lang}-{letters}) to new format (pangrum-{lang}-{date})
watch(letters, (newLetters) => {
  if (!newLetters.length || !import.meta.client) return

  const oldKey = `pangrum-${language.value}-${newLetters.join('')}`
  const oldData = localStorage.getItem(oldKey)
  if (!oldData) return

  try {
    const oldWords = JSON.parse(oldData) as string[]
    if (!Array.isArray(oldWords) || oldWords.length === 0) return

    // Filter to only valid words (contain centre letter + only use available letters)
    const letterSet = new Set(newLetters)
    const centre = newLetters[2]
    const validOldWords = oldWords.filter((word) => {
      if (!word.includes(centre!)) return false
      return [...word].every(char => letterSet.has(char))
    })

    // Merge valid words into current set
    let migrated = 0
    for (const word of validOldWords) {
      if (!storedWords.value.has(word)) {
        storedWords.value.add(word)
        migrated++
      }
    }

    // Remove old key after successful migration
    localStorage.removeItem(oldKey)

    if (migrated > 0) {
      addToast({
        message: t('toasts.migrated', migrated),
        type: 'success',
      })
    }
  }
  catch {
    // Ignore parse errors, just remove the bad key
    localStorage.removeItem(oldKey)
  }
}, { immediate: true })

const { sendWord } = useSync({
  currentPuzzleKey: () => `${language.value}-${selectedDate.value}`,
  currentWords: storedWords,
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
      message: t('toasts.navigatedToSynced'),
      type: 'success',
    })
  },
})

const hasTrackedStreakThisSession = ref(false)

function handleWordAdded(word: string) {
  sendWord(word)

  // Submit to popularity tracking using ohash to get the word's hash
  const wordHash = hash(word)
  if (hashes.value.includes(wordHash)) {
    const isFirstWord = !hasSubmittedForPuzzle.value
    if (isFirstWord) {
      hasSubmittedForPuzzle.value = true
    }
    submitToPopularity(wordHash, isFirstWord)

    if (isFirstWord && isViewingToday.value && !hasTrackedStreakThisSession.value) {
      hasTrackedStreakThisSession.value = true
      nextTick(() => trackStreakAchieved(puzzleStats.value.currentStreak))
    }
  }
}

const showDateMismatchModal = ref(false)
const showShareModal = ref(false)
const showStatsModal = ref(false)
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

// Connect to popularity tracking when hints are enabled or puzzle changes
watch([hintsEnabled, selectedDate, language], ([hints]) => {
  if (hints) {
    connectPopularity()
  }
}, { immediate: true })

// ... as well as when window regains focus)
if (import.meta.client) {
  window.addEventListener('focus', checkDateMismatch)
}

const shareData = shallowRef<ReturnType<InstanceType<typeof TheScore>['getShareData']>>()

function openShareModal() {
  shareData.value = scoreRef.value?.getShareData()
  showShareModal.value = true
}
</script>

<template>
  <NuxtPwaAssets />
  <TheToast />
  <ParticleCanvas />
  <div class="h-100dvh overflow-hidden touch-none">
    <div class="flex flex-col h-full gap-2 px-2 py-2 text-on-surface sm:gap-3 sm:p-3 md:gap-6 md:p-8 ls:grid ls:grid-cols-[minmax(280px,auto)_1fr] ls:grid-rows-[auto_1fr] ls:gap-3 ls:p-2">
      <header class="flex items-center justify-between gap-2 flex-shrink-0 sm:items-start sm:gap-4 ls:col-span-2 ls:gap-3 ls:py-1 px-1 sm:p-0">
        <h1 class="text-xs font-normal tracking-[0.12em] lowercase opacity-60 m-0 transition-opacity transition-duration-0.2s sm:text-sm sm:mt-1 md:text-2xl md:font-semibold md:opacity-100 md:tracking-widest hover:opacity-100 ls:hidden">
          pangrum
          <ClientOnly>
            <span
              v-if="!isOnline"
              class="text-xs opacity-60 ml-1 sm:ml-2"
            >
              {{ t('app.offline') }}
            </span>
          </ClientOnly>
        </h1>
        <!-- Compact score display for landscape header -->
        <div
          v-if="data"
          class="hidden ls:flex items-center gap-2 ls:py-1"
        >
          <TheScore
            ref="score"
            :words="words"
            :valid-words="validWords"
            :total-pangrams="totalPangrams"
            :letters="letters"
            :date="selectedDate"
            compact
            @share="openShareModal"
          />
        </div>
        <!-- Landscape header skeleton -->
        <div
          v-else
          class="hidden ls:flex items-center gap-3 ls:py-1"
        >
          <div class="w-10 h-6 rounded bg-muted animate-pulse" />
          <div class="w-16 h-4 rounded bg-muted animate-pulse" />
          <div class="w-15 h-1 rounded-full bg-muted animate-pulse" />
          <div class="w-12 h-3 rounded bg-muted animate-pulse" />
        </div>
        <div class="flex gap-1.5 items-center flex-shrink-0 sm:gap-2">
          <DatePicker
            v-model="selectedDate"
            :language="language"
            :has-progress="checkHasProgress"
          />
          <ClientOnly>
            <!-- Mobile statistics button -->
            <button
              type="button"
              class="flex sm:hidden items-center justify-center w-8 h-8 rounded-lg bg-surface border-1 border-solid border-muted text-on-surface transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ls:flex ls:w-7 ls:h-7"
              :class="puzzleStats.totalDaysPlayed > 0 ? 'cursor-pointer hover:bg-surface-hover' : 'opacity-40 cursor-not-allowed'"
              :disabled="puzzleStats.totalDaysPlayed === 0"
              aria-label="View statistics"
              @click="puzzleStats.totalDaysPlayed > 0 && (showStatsModal = true)"
            >
              <span
                class="i-lucide-bar-chart-2 text-base"
                aria-hidden="true"
              />
            </button>
            <!-- Desktop statistics button -->
            <button
              type="button"
              class="hidden sm:flex items-center gap-2 px-3 py-1 text-sm rounded-lg bg-surface border-1 border-solid border-muted text-on-surface transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ls:hidden"
              :class="puzzleStats.totalDaysPlayed > 0 ? 'cursor-pointer hover:bg-surface-hover' : 'opacity-40 cursor-not-allowed'"
              :disabled="puzzleStats.totalDaysPlayed === 0"
              @click="puzzleStats.totalDaysPlayed > 0 && (showStatsModal = true)"
            >
              <span
                class="i-lucide-bar-chart-2 text-sm"
                aria-hidden="true"
              />
              <span>{{ t('header.statistics') }}</span>
            </button>
            <template #fallback>
              <!-- Mobile skeleton (full button, greyed out) -->
              <div class="flex sm:hidden items-center justify-center w-8 h-8 rounded-lg bg-surface border-1 border-solid border-muted opacity-40 ls:flex ls:w-7 ls:h-7">
                <span
                  class="i-lucide-bar-chart-2 text-base text-on-surface"
                  aria-hidden="true"
                />
              </div>
              <!-- Desktop skeleton -->
              <div class="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-surface border-1 border-solid border-muted opacity-40 ls:hidden">
                <div class="w-4 h-4 rounded bg-muted animate-pulse" />
                <div class="w-14 h-4 rounded bg-muted animate-pulse" />
              </div>
            </template>
          </ClientOnly>
          <HintsToggle />
          <SettingsMenu @request-date-change="(date) => selectedDate = date" />
        </div>
      </header>

      <main
        v-if="data"
        class="app-main flex flex-col flex-1 min-h-0 gap-3 sm:gap-4 md:gap-6 ls:contents"
      >
        <!-- Left column in landscape: letter grid + input -->
        <div class="flex flex-col-reverse gap-4 flex-shrink-0 sm:gap-8 md:flex-row md:items-end md:gap-12 ls:flex-col ls:gap-3 ls:row-start-2 ls:self-center ls:justify-self-center">
          <LetterGrid
            :letters="letters"
            :centre-letter="centreLetter"
            class="ls:scale-110 ls:origin-top"
          />
          <TheScore
            ref="score"
            class="flex-grow-1 ls:hidden"
            :words="words"
            :valid-words="validWords"
            :total-pangrams="totalPangrams"
            :letters="letters"
            :date="selectedDate"
            @share="openShareModal"
          />
          <WordInput
            v-model:words="storedWords"
            :hashes="hashes"
            :letters="letters"
            :centre-letter="centreLetter"
            :valid-words="validWords"
            class="input-landscape hidden ls:block ls:w-full"
            @word-added="handleWordAdded"
          />
        </div>

        <WordInput
          v-model:words="storedWords"
          :hashes="hashes"
          :letters="letters"
          :centre-letter="centreLetter"
          :valid-words="validWords"
          class="flex-shrink-0 ls:hidden"
          @word-added="handleWordAdded"
        />

        <!-- Right column in landscape: hints/words slider -->
        <section class="flex-1 min-h-0 min-w-0 flex flex-col px-0 py-1 sm:py-2 md:pb-0 words-section touch-pan-y ls:row-start-2 ls:p-0">
          <WordHints
            v-if="hintsEnabled"
            :pairs="pairs"
            :hashes="hashes"
            :words="words"
            :valid-words="validWords"
            :letters="letters"
            :popularity="popularityData"
            :popularity-loading="popularityLoading"
          />
          <FoundWordsList
            v-else
            class="px-2 pt-2 sm:p-0"
            :words="words"
            :letters="letters"
          />
        </section>
      </main>

      <!-- Loading skeleton shown during SSR and initial client load -->
      <main
        v-else
        class="app-main flex flex-col flex-1 min-h-0 gap-3 sm:gap-4 md:gap-6 ls:contents"
        aria-busy="true"
        aria-label="Loading puzzle..."
      >
        <!-- Left column skeleton -->
        <div class="flex flex-col-reverse gap-4 flex-shrink-0 sm:gap-8 md:flex-row md:items-end md:gap-12 ls:flex-col ls:gap-3 ls:row-start-2 ls:self-center ls:justify-self-center">
          <!-- Letter grid skeleton -->
          <div
            class="flex items-center justify-center sm:justify-start gap-4 select-none"
            style="perspective: 800px"
          >
            <div class="flex flex-col items-center flex-grow sm:flex-grow-0 gap-3">
              <div class="letter-cluster-skeleton">
                <!-- Centre letter skeleton -->
                <div class="letter-skeleton centre-skeleton" />
                <!-- Outer letter skeletons -->
                <div
                  v-for="i in 6"
                  :key="i"
                  class="letter-skeleton outer-skeleton"
                  :style="{ '--index': i }"
                />
              </div>
            </div>
            <!-- Action buttons skeleton (mobile) -->
            <div class="flex flex-col gap-1.5 flex-grow items-center sm:hidden ls:flex ls:gap-1.5">
              <div class="w-10 h-10 rounded-lg bg-surface border-1 border-solid border-muted ls:w-9 ls:h-9" />
              <div class="w-10 h-10 rounded-lg bg-surface border-1 border-solid border-muted ls:w-9 ls:h-9" />
              <div class="w-10 h-10 rounded-lg bg-surface border-1 border-solid border-muted ls:w-9 ls:h-9" />
            </div>
          </div>

          <!-- Score skeleton -->
          <div class="flex flex-col gap-1 flex-grow-1 ls:hidden">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-baseline gap-1.5">
                <div class="w-12 h-8 rounded bg-muted animate-pulse" />
                <div class="w-16 h-4 rounded bg-muted animate-pulse" />
              </div>
            </div>
            <div class="flex flex-col gap-1.5">
              <div class="h-4 mx-1.5 my-2.5 rounded-full bg-muted animate-pulse" />
              <div class="flex items-center justify-between px-px">
                <div class="w-20 h-3 rounded bg-muted animate-pulse" />
                <div class="w-24 h-3 rounded bg-muted animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <!-- Word input skeleton -->
        <div class="flex flex-row items-end gap-4 flex-shrink-0 ls:hidden">
          <div class="flex flex-col gap-2 flex-1 sm:flex-initial max-w-full">
            <div class="hidden sm:block w-20 h-4 rounded bg-muted animate-pulse" />
            <div class="h-8 border-b-2 border-muted" />
          </div>
          <div class="hidden sm:block w-12 h-10 rounded-lg bg-primary/20 animate-pulse" />
        </div>

        <!-- Words section skeleton -->
        <section class="flex-1 min-h-0 flex flex-col px-0 py-1 sm:py-2 md:pb-0 words-section touch-pan-y ls:row-start-2 ls:p-0">
          <div class="flex items-center justify-center h-full text-muted-foreground font-mono text-sm text-center p-4">
            <div class="w-32 h-4 rounded bg-muted animate-pulse" />
          </div>
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
    @close="showShareModal = false; shareData = undefined"
  />
  <TutorialModal
    v-if="showTutorial"
    @close="showTutorial = false"
  />
  <StatsOverview
    v-if="showStatsModal"
    :stats="puzzleStats"
    @close="showStatsModal = false"
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
  --color-on-primary: #022c22;

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
  --color-on-primary: #f0fdfa;

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
  --color-muted-foreground: rgba(0, 0, 0, 0.6);

  /* Letter colors for input */
  --color-letter-centre: #0d9488;
  --color-letter-valid: #171717;
  --color-letter-invalid: #a3a3a3;
}

html, body {
  margin: 0;
  -webkit-user-select: none;
  user-select: none;
  -webkit-touch-callout: none;
  /* prevent iOS bounce scrolling by locking the viewport */
  position: fixed;
  inset: 0;
  overflow: hidden;
  overscroll-behavior: none;
  /* interactive elements opt-in with touch-action: manipulation */
  touch-action: none;
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
  padding-bottom: env(safe-area-inset-bottom, 1rem);
}

/* Letter grid skeleton styles */
.letter-cluster-skeleton {
  --letter-size: clamp(2.75rem, 14vw, 3.5rem);
  --centre-size: clamp(3.25rem, 16vw, 4.25rem);
  --spread: clamp(2.75rem, 14vw, 3.5rem);

  position: relative;
  width: calc(var(--centre-size) + var(--spread) * 2.5);
  height: calc(var(--centre-size) + var(--spread) * 2.3);
}

@media (min-width: 640px) {
  .letter-cluster-skeleton {
    --letter-size: 3rem;
    --centre-size: 3.75rem;
    --spread: 3rem;
  }
}

@media (orientation: landscape) and (max-height: 500px) and (min-width: 500px) {
  .letter-cluster-skeleton {
    --letter-size: clamp(2.25rem, 18vh, 3rem);
    --centre-size: clamp(2.75rem, 22vh, 3.5rem);
    --spread: clamp(2.25rem, 18vh, 3rem);
  }
}

.letter-skeleton {
  position: absolute;
  border-radius: 1rem;
  background: var(--color-surface-elevated);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.centre-skeleton {
  width: var(--centre-size);
  height: var(--centre-size);
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: var(--color-primary-muted);
}

.outer-skeleton {
  width: var(--letter-size);
  height: var(--letter-size);
  border-radius: 0.875rem;
  left: 50%;
  top: 50%;
}

/* Position outer skeletons in hexagonal pattern */
.outer-skeleton:nth-child(2) { transform: translate(-50%, -50%) translate(calc(-0.88 * var(--spread)), calc(-0.84 * var(--spread))); }
.outer-skeleton:nth-child(3) { transform: translate(-50%, -50%) translate(calc(0.92 * var(--spread)), calc(-0.88 * var(--spread))); animation-delay: 0.1s; }
.outer-skeleton:nth-child(4) { transform: translate(-50%, -50%) translate(calc(-1.12 * var(--spread)), calc(0.06 * var(--spread))); animation-delay: 0.15s; }
.outer-skeleton:nth-child(5) { transform: translate(-50%, -50%) translate(calc(1.08 * var(--spread)), calc(0.02 * var(--spread))); animation-delay: 0.05s; }
.outer-skeleton:nth-child(6) { transform: translate(-50%, -50%) translate(calc(-0.64 * var(--spread)), calc(0.92 * var(--spread))); animation-delay: 0.2s; }
.outer-skeleton:nth-child(7) { transform: translate(-50%, -50%) translate(calc(0.72 * var(--spread)), calc(0.88 * var(--spread))); animation-delay: 0.12s; }

@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.7;
  }
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

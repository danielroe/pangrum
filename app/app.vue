<script setup lang="ts">
import type { TheScore } from '#components'

const language = useLanguage()
const selectedDate = ref(new Date().toISOString().slice(0, 10))
const { data } = useFetch(() => `/api/words/${language.value}/${selectedDate.value}`, {
  server: false,
})
const isOnline = useOnline()
const { hintsEnabled } = useHints()

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
  <div class="app-container">
    <div class="app-content">
      <header class="app-header">
        <h1 class="brand">
          pangrum
          <span
            v-if="!isOnline"
            class="offline-badge"
          >
            offline
          </span>
        </h1>
        <div class="header-controls">
          <ClientOnly>
            <DatePicker v-model="selectedDate" />
            <template #fallback>
              <div class="date-picker-fallback" />
            </template>
          </ClientOnly>
          <HintsToggle />
          <NotificationToggle />
          <ThemeSelector />
          <LanguageSelector />
        </div>
      </header>

      <main
        v-if="data"
        class="game-area"
      >
        <div class="game-controls">
          <LetterGrid
            :letters="letters"
            :centre-letter="centreLetter"
          />
          <TheScore
            ref="score"
            class="score-section"
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
          class="word-input-section"
        />

        <section class="words-section">
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

/* App Layout */
.app-container {
  height: 100dvh;
  overflow: hidden;
}

.app-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 0.75rem;
  padding: 0.75rem;
  color: var(--color-on-surface);
}

@media (min-width: 640px) {
  .app-content {
    gap: 1.5rem;
    padding: 2rem;
  }
}

/* Header */
.app-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-shrink: 0;
}

.brand {
  font-size: 0.875rem;
  font-weight: 400;
  letter-spacing: 0.15em;
  text-transform: lowercase;
  opacity: 0.4;
  margin: 0;
  margin-top: 0.25rem;
  transition: opacity 0.2s ease;
}

@media (min-width: 640px) {
  .brand {
    font-size: 1.5rem;
    font-weight: 600;
    opacity: 1;
    letter-spacing: 0.1em;
  }
}

.brand:hover {
  opacity: 1;
}

.offline-badge {
  font-size: 0.75rem;
  opacity: 0.6;
  margin-left: 0.5rem;
}

.header-controls {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-shrink: 0;
}

.date-picker-fallback {
  width: 2.25rem;
  height: 2.25rem;
  background: var(--color-surface-elevated);
  border: 1px solid var(--color-muted);
  border-radius: 0.5rem;
}

@media (min-width: 640px) {
  .date-picker-fallback {
    width: 6rem;
    height: 1.75rem;
  }
}

/* Game Area */
.game-area {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  gap: 1rem;
}

@media (min-width: 640px) {
  .game-area {
    gap: 1.5rem;
  }
}

.game-controls {
  display: flex;
  flex-direction: column-reverse;
  gap: 2rem;
  flex-shrink: 0;
}

@media (min-width: 640px) {
  .game-controls {
    flex-direction: row;
    align-items: flex-end;
    gap: 3rem;
  }
}

.score-section {
  flex-grow: 1;
}

.word-input-section {
  flex-shrink: 0;
}

.words-section {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 0.5rem;
  /* Add bottom padding on mobile for safe area */
  padding-bottom: env(safe-area-inset-bottom, 1rem);
}

@media (min-width: 640px) {
  .words-section {
    padding-bottom: 0;
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

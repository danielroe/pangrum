<script setup lang="ts">
import type { PopularityData } from '~/composables/usePopularity'

const props = defineProps<{
  validWords: string[]
  hashes: string[]
  words: Set<string>
  pairs: Record<string, number>
  letters: string[]
  popularity: PopularityData | null
  popularityLoading: boolean
}>()

const SLIDE_COUNT = 4
const carousel = useTemplateRef('carousel')
const activeSlide = ref(0)

// Track if we're in carousel mode (mobile/landscape) vs grid mode (desktop)
// In grid mode, all slides are visible so we don't want to use inert
const isCarouselMode = ref(true)
function updateCarouselMode() {
  if (!import.meta.client) return
  // lg breakpoint is 1024px - only desktop shows grid layout
  const isDesktop = window.matchMedia('(min-width: 1024px)').matches
  isCarouselMode.value = !isDesktop
}

onMounted(() => {
  updateCarouselMode()
  window.addEventListener('resize', updateCarouselMode)
})

onUnmounted(() => {
  if (import.meta.client) {
    window.removeEventListener('resize', updateCarouselMode)
  }
})

const slideLabels = [
  'Word grid showing counts by prefix and length',
  'Two-letter pairs grid',
  'Word popularity showing how many players found each word',
  'Found words list',
]

function updateActiveSlide() {
  if (!carousel.value) return
  const scrollLeft = carousel.value.scrollLeft
  const slideWidth = carousel.value.offsetWidth
  activeSlide.value = Math.round(scrollLeft / slideWidth) % SLIDE_COUNT
}

function handleKeydown(event: KeyboardEvent) {
  if (!carousel.value) return

  if (event.key === 'ArrowLeft' && activeSlide.value > 0) {
    event.preventDefault()
    goToSlide(activeSlide.value - 1)
  }
  else if (event.key === 'ArrowRight' && activeSlide.value < SLIDE_COUNT - 1) {
    event.preventDefault()
    goToSlide(activeSlide.value + 1)
  }
}

function goToSlide(index: number) {
  if (!carousel.value) return
  carousel.value.scrollTo({
    left: index * carousel.value.offsetWidth,
    behavior: 'smooth',
  })
}

const modalState = ref<{
  category: string
  foundWords: string[]
  totalWords: string[]
  showRemaining: boolean
} | null>(null)

function showGridStats(prefix: string, length: number) {
  const allWords = props.validWords.filter(w => w.startsWith(prefix) && w.length === length)
  const found = [...props.words].filter(w => w.startsWith(prefix) && w.length === length)
  modalState.value = {
    category: `${prefix.toUpperCase()} - ${length} letters`,
    foundWords: found,
    totalWords: allWords,
    showRemaining: false,
  }
}

function showPrefixStats(prefix: string) {
  const allWords = props.validWords.filter(w => w.startsWith(prefix))
  const found = [...props.words].filter(w => w.startsWith(prefix))
  modalState.value = {
    category: `${prefix.toUpperCase()} - all lengths`,
    foundWords: found,
    totalWords: allWords,
    showRemaining: true,
  }
}

function showLengthStats(length: number) {
  const allWords = props.validWords.filter(w => w.length === length)
  const found = [...props.words].filter(w => w.length === length)
  modalState.value = {
    category: `${length} letters - all prefixes`,
    foundWords: found,
    totalWords: allWords,
    showRemaining: true,
  }
}

function showPairStats(prefix: string) {
  if (!(prefix in props.pairs)) return
  const found = [...props.words].filter(w => w.startsWith(prefix))
  const total = props.pairs[prefix]
  modalState.value = {
    category: `${prefix.toUpperCase()}`,
    foundWords: found,
    totalWords: new Array(total).fill(''),
    showRemaining: false,
  }
}

function closeModal() {
  modalState.value = null
}
</script>

<template>
  <div class="select-none h-full min-h-0 flex flex-col">
    <div
      ref="carousel"
      class="flex-1 min-h-0 flex overflow-x-auto snap-x snap-mandatory scroll-smooth touch-pan-x lg:grid lg:grid-cols-2 lg:gap-8 lg:overflow-x-visible lg:overflow-y-auto lg:snap-none motion-reduce:scroll-auto focus:outline-none"
      style="grid-template-areas: 'word-grid pairs-grid' 'popularity-grid word-list'"
      role="region"
      aria-label="Word hints carousel"
      aria-live="polite"
      :aria-roledescription="`${slideLabels[activeSlide]} (panel ${activeSlide + 1} of ${SLIDE_COUNT})`"
      tabindex="0"
      @scroll.passive="updateActiveSlide"
      @keydown="handleKeydown"
    >
      <div
        class="hint-slide min-w-full snap-center touch-pan-y p-2 lg:min-w-0 lg:snap-align-none lg:p-0"
        style="grid-area: word-grid"
        :inert="isCarouselMode && activeSlide !== 0 || undefined"
        :aria-hidden="isCarouselMode && activeSlide !== 0"
      >
        <WordGrid
          :valid-words="validWords"
          :words="words"
          :letters="letters"
          @show-prefix-stats="showPrefixStats"
          @show-length-stats="showLengthStats"
          @show-grid-stats="showGridStats"
        />
      </div>

      <div
        class="hint-slide min-w-full snap-center touch-pan-y p-2 lg:min-w-0 lg:snap-align-none lg:p-0"
        style="grid-area: pairs-grid"
        :inert="isCarouselMode && activeSlide !== 1 || undefined"
        :aria-hidden="isCarouselMode && activeSlide !== 1"
      >
        <PairsGrid
          :pairs="pairs"
          :words="words"
          @show-pair-stats="showPairStats"
        />
      </div>

      <div
        class="hint-slide min-w-full snap-center touch-pan-y p-2 lg:min-w-0 lg:snap-align-none lg:p-0"
        style="grid-area: popularity-grid"
        :inert="isCarouselMode && activeSlide !== 2 || undefined"
        :aria-hidden="isCarouselMode && activeSlide !== 2"
      >
        <PopularityGrid
          :valid-words="validWords"
          :hashes="hashes"
          :words="words"
          :letters="letters"
          :popularity="popularity"
          :loading="popularityLoading"
        />
      </div>

      <div
        class="hint-slide min-w-full snap-center touch-pan-y p-2 lg:min-w-0 lg:snap-align-none lg:p-0"
        style="grid-area: word-list"
        :inert="isCarouselMode && activeSlide !== 3 || undefined"
        :aria-hidden="isCarouselMode && activeSlide !== 3"
      >
        <FoundWordsList
          :words="words"
          :letters="letters"
        />
      </div>
    </div>

    <div
      class="flex justify-center gap-2 mt-3 mb-8 shrink-0 lg:hidden ls:mt-1 ls:mb-1"
      role="tablist"
      aria-label="Carousel navigation"
    >
      <button
        v-for="i in SLIDE_COUNT"
        :key="i"
        type="button"
        role="tab"
        :aria-selected="activeSlide === i - 1"
        :aria-current="activeSlide === i - 1 ? 'true' : undefined"
        class="border-0 rounded-full transition-all duration-300 ease-out focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        :class="[
          activeSlide === i - 1
            ? 'w-6 h-2 bg-primary scale-110'
            : 'w-2 h-2 bg-muted hover:bg-muted-foreground hover:scale-125',
        ]"
        :aria-label="`Go to ${['word grid', 'two-letter pairs', 'popularity', 'word list'][i - 1]}`"
        @click="goToSlide(i - 1)"
      />
    </div>
    <WordStatsModal
      v-if="modalState"
      :category="modalState.category"
      :found-words="modalState.foundWords"
      :total-words="modalState.totalWords"
      :show-remaining="modalState.showRemaining"
      :letters="letters"
      @close="closeModal"
    />
  </div>
</template>

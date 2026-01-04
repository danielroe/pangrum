<script setup lang="ts">
const props = defineProps<{
  validWords: string[]
  words: Set<string>
  pairs: Record<string, number>
  letters: string[]
  totalPangrams: number
}>()

const carousel = useTemplateRef('carousel')
const activeSlide = ref(0)

const foundPangrams = computed(() =>
  [...props.words].filter(w => props.letters.every(l => w.includes(l))).length,
)

const slideLabels = ['Word grid showing counts by prefix and length', 'Two-letter pairs grid', 'Found words list']

function updateActiveSlide() {
  if (!carousel.value) return
  const scrollLeft = carousel.value.scrollLeft
  const slideWidth = carousel.value.offsetWidth
  activeSlide.value = Math.round(scrollLeft / slideWidth) % 3
}

function handleKeydown(event: KeyboardEvent) {
  if (!carousel.value) return

  if (event.key === 'ArrowLeft' && activeSlide.value > 0) {
    event.preventDefault()
    goToSlide(activeSlide.value - 1)
  }
  else if (event.key === 'ArrowRight' && activeSlide.value < 2) {
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
      v-if="totalPangrams > 0"
      class="text-xs sm:text-sm font-mono flex items-center gap-2 px-2 py-1 border-1 border-solid border-primary border-opacity-30 bg-primary bg-opacity-10 flex-shrink-0 mb-2"
    >
      <span class="text-primary">🌟</span>
      <span>
        Pangrams: <span class="font-bold text-primary">{{ foundPangrams }}</span> / {{ totalPangrams }}
      </span>
    </div>
    <div
      ref="carousel"
      class="hints-container flex-1 min-h-0"
      role="region"
      aria-label="Word hints carousel"
      aria-live="polite"
      :aria-roledescription="`${slideLabels[activeSlide]} (panel ${activeSlide + 1} of 3)`"
      tabindex="0"
      @scroll.passive="updateActiveSlide"
      @keydown="handleKeydown"
    >
      <div
        class="hint-panel hint-grid"
        style="grid-area: word-grid"
        :inert="activeSlide !== 0 || undefined"
        :aria-hidden="activeSlide !== 0"
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
        class="hint-panel hint-pairs"
        style="grid-area: pairs-grid"
        :inert="activeSlide !== 1 || undefined"
        :aria-hidden="activeSlide !== 1"
      >
        <PairsGrid
          :pairs="pairs"
          :words="words"
          @show-pair-stats="showPairStats"
        />
      </div>

      <div
        class="hint-panel hint-words"
        style="grid-area: word-list"
        :inert="activeSlide !== 2 || undefined"
        :aria-hidden="activeSlide !== 2"
      >
        <FoundWordsList
          :words="words"
          :letters="letters"
        />
      </div>
    </div>

    <div
      class="flex justify-center gap-2 mt-3 mb-2 flex-shrink-0 lg:hidden"
      role="tablist"
      aria-label="Carousel navigation"
    >
      <button
        v-for="i in 3"
        :key="i"
        type="button"
        role="tab"
        :aria-selected="activeSlide === i - 1"
        :aria-current="activeSlide === i - 1 ? 'true' : undefined"
        class="border-0 outline-0 rounded-full transition-all duration-300 ease-out"
        :class="[
          activeSlide === i - 1
            ? 'w-6 h-2 bg-primary scale-110'
            : 'w-2 h-2 bg-white bg-opacity-30 hover:bg-opacity-50 hover:scale-125',
        ]"
        :aria-label="`Go to ${i === 1 ? 'word grid' : i === 2 ? 'two-letter pairs' : 'word list'}`"
        @click="goToSlide(i - 1)"
      />
    </div>
    <WordStatsModal
      v-if="modalState"
      :category="modalState.category"
      :found-words="modalState.foundWords"
      :total-words="modalState.totalWords"
      :show-remaining="modalState.showRemaining"
      @close="closeModal"
    />
  </div>
</template>

<style scoped>
.hints-container {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
}

@media (prefers-reduced-motion: reduce) {
  .hints-container {
    scroll-behavior: auto;
  }
}

.hint-panel {
  min-width: 100%;
  scroll-snap-align: center;
  overflow-y: auto;
  padding: 0.5rem;
  contain: layout style paint;
}

.hint-grid {
  display: flex;
  justify-content: center;
  align-items: start;
}

.hint-pairs {
  padding-left: 1rem;
  padding-right: 1rem;
}

@media (min-width: 1024px) {
  .hints-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "word-grid pairs-grid"
      "word-list word-list";
    gap: 2rem;
    overflow-x: visible;
    overflow-y: auto;
    scroll-snap-type: none;
  }

  .hint-panel {
    min-width: 0;
    scroll-snap-align: none;
    padding: 0;
  }

  .hint-pairs {
    padding-left: 0;
    padding-right: 0;
  }
}
</style>

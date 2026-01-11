<script setup lang="ts">
const props = defineProps<{
  validWords: string[]
  words: Set<string>
  pairs: Record<string, number>
  letters: string[]
}>()

const carousel = useTemplateRef('carousel')
const activeSlide = ref(0)

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
      ref="carousel"
      class="flex-1 min-h-0 flex overflow-x-auto snap-x snap-mandatory scroll-smooth touch-pan-x lg:grid lg:grid-cols-2 lg:gap-8 lg:overflow-x-visible lg:overflow-y-auto lg:snap-none motion-reduce:scroll-auto"
      style="grid-template-areas: 'word-grid pairs-grid' 'word-list word-list'"
      role="region"
      aria-label="Word hints carousel"
      aria-live="polite"
      :aria-roledescription="`${slideLabels[activeSlide]} (panel ${activeSlide + 1} of 3)`"
      tabindex="0"
      @scroll.passive="updateActiveSlide"
      @keydown="handleKeydown"
    >
      <div
        class="hint-panel min-w-full snap-center overflow-y-auto p-2 lg:min-w-0 lg:snap-align-none lg:p-0 flex justify-center items-start"
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
        class="hint-panel min-w-full snap-center overflow-y-auto p-2 px-4 lg:min-w-0 lg:snap-align-none lg:p-0"
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
        class="hint-panel min-w-full snap-center overflow-y-auto p-2 lg:min-w-0 lg:snap-align-none lg:p-0"
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
      class="flex justify-center gap-2 mt-3 mb-2 shrink-0 lg:hidden"
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
            : 'w-2 h-2 bg-muted hover:bg-muted-foreground hover:scale-125',
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

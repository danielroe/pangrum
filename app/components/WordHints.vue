<script setup lang="ts">
const props = defineProps<{
  validWords: string[]
  words: Set<string>
  pairs: Record<string, number>
  letters: string[]
  totalPangrams: number
}>()

const longestWordLength = computed(() => props.validWords.reduce((acc, w) => w.length > acc ? w.length : acc, 0))

const prefixes = computed(() => new Set(props.validWords.map(m => m.replace(/_/g, ''))))
const remainingWords = computed(() => {
  const r: Record<string, Record<string, number>> = {}
  for (const prefix of prefixes.value) {
    const subset = props.validWords.filter(w => w.startsWith(prefix))
    if (!subset.length) {
      continue
    }
    r[prefix] = {}
    for (let i = 4; i <= longestWordLength.value; i++) {
      const redactedSubset = subset.filter(p => p.length === i)
      if (redactedSubset.length === 0) {
        continue
      }
      r[prefix][i] = redactedSubset.length - [...props.words].filter(w => w.length === i && w.startsWith(prefix)).length
    }
  }
  return r
})

const pairsRemaining = computed(() => {
  const r: Record<string, number> = {}
  for (const prefix in props.pairs) {
    const total = props.pairs[prefix] || 0
    const found = [...props.words].filter(w => w.startsWith(prefix)).length
    const remaining = total - found
    r[prefix] = remaining
  }
  return r
})

const sortedWords = computed(() => [...props.words].sort())
const carousel = useTemplateRef('carousel')
const activeSlide = ref(0)

const foundPangrams = computed(() =>
  [...props.words].filter(w => props.letters.every(l => w.includes(l))).length,
)

function updateActiveSlide() {
  if (!carousel.value) return
  const scrollLeft = carousel.value.scrollLeft
  const slideWidth = carousel.value.offsetWidth
  activeSlide.value = Math.round(scrollLeft / slideWidth) % 3
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
      class="text-xs sm:text-sm font-mono flex items-center gap-2 px-2 py-1 border-1 border-solid border-yellow-300 border-opacity-30 bg-yellow-300 bg-opacity-10 flex-shrink-0 mb-2"
    >
      <span class="text-yellow-300">🌟</span>
      <span>
        Pangrams: <span class="font-bold text-yellow-300">{{ foundPangrams }}</span> / {{ totalPangrams }}
      </span>
    </div>
    <div
      ref="carousel"
      class="hints-container flex-1 min-h-0"
      @scroll="updateActiveSlide"
    >
      <div
        class="hint-panel hint-grid"
        style="grid-area: word-grid"
      >
        <table class="text-white p-2 text-center tabular-nums">
          <tbody>
            <tr>
              <td />
              <td
                v-for="i of longestWordLength - 3"
                :key="`header-${i + 3}`"
                class="font-mono pb-3 cursor-pointer hover:bg-white hover:bg-opacity-10 transition-colors"
                @click="showLengthStats(i + 3)"
              >
                {{ i + 3 }}
              </td>
            </tr>
            <tr
              v-for="(counts, prefix) in remainingWords"
              :key="`row-${prefix}`"
            >
              <td
                class="uppercase font-mono h-5 w-5 pr-4 tracking-widest text-right cursor-pointer hover:bg-white hover:bg-opacity-10 transition-colors"
                @click="showPrefixStats(prefix)"
              >
                {{ prefix }}
              </td>
              <td
                v-for="l of longestWordLength - 3"
                :key="`cell-${prefix}-${l + 3}`"
                class="w-5 h-5 text-xs sm:text-sm lg:h-5 lg:w-5 text-center px-1 font-mono border-white border-opacity-10 border-1 border-solid transition-colors"
                :class="{
                  'bg-white bg-opacity-10 cursor-pointer hover:bg-opacity-20': counts[l + 3] !== undefined && counts[l + 3]! > 0,
                  'bg-yellow-300 text-black cursor-pointer hover:bg-yellow-400': counts[l + 3] === 0,
                }"
                @click="counts[l + 3] !== undefined ? showGridStats(prefix, l + 3) : null"
              >
                {{ counts[l + 3] === undefined ? '' : counts[l + 3] === 0 ? '✔︎' : counts[l + 3] }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        class="hint-panel hint-pairs"
        style="grid-area: pairs-grid"
      >
        <dl
          class="grid font-mono items-center text-sm gap-row-2 grid-cols-[1.75rem_1fr_1.75rem_1fr_1.75rem_1fr] md:grid-cols-[1.75rem_1fr_1.75rem_1fr_1.75rem_1fr_1.75rem_1fr] lg:grid-cols-[1.75rem_1fr_1.75rem_1fr_1.75rem_1fr_1.75rem_1fr_1.75rem_1fr_1.75rem_1fr]"
        >
          <template
            v-for="(count, prefix) in pairs"
            :key="prefix"
          >
            <dd
              class="border-1 border-solid text-center aspect-square inline-block h-7 w-7 place-content-center !m-0 overflow-hidden cursor-pointer transition-all"
              :class="[
                pairsRemaining[prefix] ? 'border-white border-opacity-10 bg-white bg-opacity-10': 'border-yellow-300 bg-yellow-300 text-black',
              ]"
              :aria-label="`${prefix}: ${pairsRemaining[prefix]} ${pairsRemaining[prefix] === 1 ? 'word' : 'words'} remaining`"
              @click="showPairStats(prefix)"
            >
              <span
                v-if="!pairsRemaining[prefix]"
                class="text-lg"
                aria-hidden="true"
              >✔︎</span>
              <span
                v-else
                aria-hidden="true"
              >{{ pairsRemaining[prefix] }}</span>
            </dd>
            <dt
              class="h-7 w-auto leading-none pl-2 place-content-center relative after:border-b-1 after:border-b-solid after:content-[''] after:inline-block after:absolute after:left-0.5 -after:bottom-0.25 after:w-12 after:h-0 cursor-pointer transition-opacity"
              :class="[
                pairsRemaining[prefix] ? 'after:border-white after:border-opacity-10 after:bg-white after:bg-opacity-10': 'after:border-yellow-300',
              ]"
              @click="showPairStats(prefix)"
            >
              {{ prefix }}
            </dt>
          </template>
        </dl>
      </div>

      <div
        class="hint-panel hint-words"
        style="grid-area: word-list"
      >
        <div
          v-if="sortedWords.length === 0"
          class="flex items-center justify-center h-full text-white text-opacity-50 font-mono text-sm text-center px-4"
        >
          Make a guess to get started!
        </div>
        <ul
          v-else
          class="p-0 grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-1 text-xs sm:text-sm text-white m-0 w-full"
        >
          <li
            v-for="word of sortedWords"
            :key="word"
            class="list-none font-mono px-2 py-1 border-1 border-solid transition-colors"
            :class="{
              'bg-yellow-300 bg-opacity-40 border-yellow-300 font-bold': letters.every(l => word.includes(l)),
              'bg-white bg-opacity-5 border-white border-opacity-10': !letters.every(l => word.includes(l)),
            }"
            :title="letters.every(l => word.includes(l)) ? 'Pangram!' : ''"
          >
            {{ word.toLowerCase() }}
          </li>
        </ul>
      </div>
    </div>

    <div class="flex justify-center gap-2 mt-3 mb-2 flex-shrink-0 lg:hidden">
      <button
        v-for="i in 3"
        :key="i"
        type="button"
        class="border-0 outline-0 rounded-full transition-all duration-300 ease-out"
        :class="[
          activeSlide === i - 1
            ? 'w-6 h-2 bg-yellow-300 scale-110'
            : 'w-2 h-2 bg-white bg-opacity-30 hover:bg-opacity-50 hover:scale-125',
        ]"
        :aria-label="`Go to slide ${i}`"
        @click="carousel?.scrollTo({ left: (i - 1) * carousel.offsetWidth, behavior: 'smooth' })"
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
}

.hint-panel {
  min-width: 100%;
  scroll-snap-align: center;
  overflow-y: auto;
  padding: 0.5rem;
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

dd:hover,
dd:has(+ dt:hover) {
  background-color: rgba(255, 255, 255, 0.2);
}

dd.bg-yellow-300:hover,
dd.bg-yellow-300:has(+ dt:hover) {
  background-color: rgb(252, 211, 77);
}

dt:hover,
dd:hover + dt {
  opacity: 0.7;
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

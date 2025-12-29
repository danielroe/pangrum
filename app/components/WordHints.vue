<script setup lang="ts">
const props = defineProps<{
  validWords: string[]
  words: Set<string>
  pairs: Record<string, number>
  letters: string[]
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

function updateActiveSlide() {
  if (!carousel.value) return
  const scrollLeft = carousel.value.scrollLeft
  const slideWidth = carousel.value.offsetWidth
  activeSlide.value = Math.round(scrollLeft / slideWidth) % 3
}
</script>

<template>
  <div class="select-none h-full min-h-0 flex flex-col">
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
                class="font-mono pb-3"
              >
                {{ i + 3 }}
              </td>
            </tr>
            <tr
              v-for="(counts, prefix) in remainingWords"
              :key="`row-${prefix}`"
            >
              <td class="uppercase font-mono h-5 w-5 pr-4 tracking-widest text-right">
                {{ prefix }}
              </td>
              <td
                v-for="l of longestWordLength - 3"
                :key="`cell-${prefix}-${l + 3}`"
                class="w-3 h-3 text-xs sm:text-sm lg:h-5 lg:w-5 text-center px-1 font-mono border-white border-opacity-10 border-1 border-solid transition-colors"
                :class="{
                  'bg-white bg-opacity-10': counts[l + 3] !== undefined && counts[l + 3]! > 0,
                  'bg-yellow-300 text-black': counts[l + 3] === 0,
                }"
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
              class="border-1 border-solid text-center aspect-square inline-block h-7 w-7 place-content-center !m-0 overflow-hidden"
              :class="[
                pairsRemaining[prefix] ? 'border-white border-opacity-10 bg-white bg-opacity-10': 'border-yellow bg-yellow text-black',
              ]"
              :aria-label="`${prefix}: ${pairsRemaining[prefix]} ${pairsRemaining[prefix] === 1 ? 'word' : 'words'} remaining`"
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
              class="h-7 w-auto leading-none pl-2 place-content-center relative after:border-b-1 after:border-b-solid after:content-[''] after:inline-block after:absolute after:left-0.5 -after:bottom-0.25 after:w-12 after:h-0"
              :class="[
                pairsRemaining[prefix] ? 'after:border-white after:border-opacity-10 after:bg-white after:bg-opacity-10': 'after:border-yellow',
              ]"
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
        <ul class="p-0 grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-1 text-xs sm:text-sm text-white m-0 w-full">
          <li
            v-for="word of sortedWords"
            :key="word"
            class="list-none font-mono px-2 py-1 border-1 border-solid border-white border-opacity-10 transition-colors"
            :class="{
              'bg-yellow bg-opacity-20 border-yellow': letters.every(l => word.includes(l)),
              'bg-white bg-opacity-5': !letters.every(l => word.includes(l)),
            }"
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
            ? 'w-6 h-2 bg-yellow scale-110'
            : 'w-2 h-2 bg-white bg-opacity-30 hover:bg-opacity-50 hover:scale-125',
        ]"
        :aria-label="`Go to slide ${i}`"
        @click="carousel?.scrollTo({ left: (i - 1) * carousel.offsetWidth, behavior: 'smooth' })"
      />
    </div>
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

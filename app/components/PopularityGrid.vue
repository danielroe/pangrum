<script setup lang="ts">
import type { PopularityData } from '~/composables/usePopularity'

const props = defineProps<{
  validWords: string[]
  hashes: string[]
  words: Set<string>
  letters: string[]
  popularity: PopularityData | null
  loading: boolean
}>()

const { t } = useI18n()

function isPangram(word: string) {
  return props.letters.every(l => word.includes(l))
}

function isFound(word: string) {
  return props.words.has(word)
}

function getPercentage(wordHash: string): number | null {
  if (!props.popularity || props.popularity.totalPlayers === 0) return null
  const count = props.popularity.counts[wordHash] || 0
  return Math.round((count / props.popularity.totalPlayers) * 100)
}

interface WordWithPopularity {
  word: string
  hash: string
  percentage: number | null
  found: boolean
  pangram: boolean
}

const wordsWithPopularity = computed<WordWithPopularity[]>(() => {
  return props.validWords.map((word, index) => ({
    word,
    hash: props.hashes[index] || '',
    percentage: getPercentage(props.hashes[index] || ''),
    found: isFound(word),
    pangram: isPangram(word),
  })).sort((a, b) => {
    // Sort by popularity (most popular first), then alphabetically
    const aPercent = a.percentage ?? -1
    const bPercent = b.percentage ?? -1
    if (bPercent !== aPercent) return bPercent - aPercent
    return a.word.localeCompare(b.word)
  })
})

const foundCount = computed(() => props.words.size)
const totalWords = computed(() => props.validWords.length)

function redactWord(word: string): string {
  return word.replace(/^(.)(.*)/, (_, first, rest) => first + rest.replace(/./g, '_'))
}
</script>

<template>
  <div class="hint-panel flex flex-col h-full">
    <header class="hint-panel-header flex items-center gap-2 mb-3">
      <span
        class="i-lucide-trending-up text-primary text-base"
        aria-hidden="true"
      />
      <h3 class="text-sm font-medium text-on-surface m-0">
        {{ t('hints.panels.popularity') }}
      </h3>
      <span
        v-if="popularity && popularity.totalPlayers > 0"
        class="text-xs text-muted-foreground ml-auto tabular-nums"
      >
        {{ foundCount }}/{{ totalWords }}
      </span>
    </header>

    <div
      v-if="loading"
      class="hint-panel-empty flex-1 flex flex-col items-center justify-center gap-3 text-center p-4"
    >
      <span
        class="i-lucide-loader-2 text-2xl text-muted-foreground animate-spin"
        aria-hidden="true"
      />
      <p class="text-sm text-muted-foreground m-0">
        {{ t('popularity.loading') }}
      </p>
    </div>

    <div
      v-else-if="!popularity || popularity.totalPlayers === 0"
      class="hint-panel-empty flex-1 flex flex-col items-center justify-center gap-3 text-center p-4"
    >
      <span
        class="i-lucide-users text-2xl text-muted"
        aria-hidden="true"
      />
      <p class="text-sm text-muted-foreground m-0 max-w-48">
        {{ t('popularity.noData') }}
      </p>
    </div>

    <template v-else>
      <ul class="flex-1 overflow-y-auto space-y-1 pr-1 m-0 p-0 list-none">
        <li
          v-for="item in wordsWithPopularity"
          :key="item.hash"
          class="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors duration-150"
          :class="item.pangram
            ? 'bg-celebration-bg/50'
            : item.found
              ? 'bg-surface-elevated'
              : 'bg-surface hover:bg-surface-hover'"
        >
          <span
            class="w-5 text-center shrink-0"
            :class="item.found ? 'text-primary' : 'text-muted'"
          >
            <span v-if="item.found">✓</span>
            <span
              v-else
              class="opacity-30"
            >·</span>
          </span>

          <span
            class="font-mono text-sm flex-1 min-w-0"
            :class="item.pangram
              ? 'text-celebration font-semibold'
              : item.found
                ? 'text-on-surface'
                : 'text-muted-foreground'"
          >
            {{ item.found ? item.word.toLowerCase() : redactWord(item.word).toLowerCase() }}
          </span>

          <div class="flex items-center gap-2 shrink-0">
            <div
              class="w-16 h-1.5 rounded-full overflow-hidden"
              :class="item.found ? 'bg-muted/30' : 'bg-muted/15'"
              :title="t('popularity.foundPercent', { percent: item.percentage ?? 0 })"
            >
              <div
                class="h-full rounded-full transition-all duration-300"
                :class="item.pangram && item.found
                  ? 'bg-celebration'
                  : item.found
                    ? 'bg-primary'
                    : 'bg-muted-foreground/40'"
                :style="{ width: `${item.percentage ?? 0}%` }"
              />
            </div>
            <span
              class="text-xs tabular-nums w-8 text-right"
              :class="item.found ? 'text-on-surface' : 'text-muted-foreground'"
            >
              {{ item.percentage ?? 0 }}%
            </span>
          </div>
        </li>
      </ul>

      <p class="text-xs text-muted-foreground text-center mt-2 pt-2 border-t border-muted/20">
        {{ t('popularity.basedOn', popularity.totalPlayers) }}
      </p>
    </template>
  </div>
</template>

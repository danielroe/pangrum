<script setup lang="ts">
import { hash } from 'ohash'
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

function getPercentage(wordHash: string): number | null {
  if (!props.popularity || props.popularity.totalPlayers === 0) return null
  const count = props.popularity.counts[wordHash] || 0
  return Math.round((count / props.popularity.totalPlayers) * 100)
}

const foundWordsByHash = computed(() => {
  const map = new Map<string, string>()
  for (const word of props.words) {
    map.set(hash(word), word)
  }
  return map
})

interface WordWithPopularity {
  word: string
  displayWord: string
  hash: string
  percentage: number | null
  found: boolean
  pangram: boolean
}

const wordsWithPopularity = computed<WordWithPopularity[]>(() => {
  return props.validWords.map((redactedWord, index) => {
    const wordHash = props.hashes[index] || ''
    const foundWord = foundWordsByHash.value.get(wordHash)

    return {
      word: redactedWord,
      displayWord: foundWord || redactedWord,
      hash: wordHash,
      percentage: getPercentage(wordHash),
      found: !!foundWord,
      pangram: foundWord ? isPangram(foundWord) : false,
    }
  }).sort((a, b) => {
    // Sort by popularity (most popular first), then by hash (to maintain order)
    const aPercent = a.percentage ?? -1
    const bPercent = b.percentage ?? -1
    if (bPercent !== aPercent) return bPercent - aPercent
    return a.hash.localeCompare(b.hash)
  })
})

const foundCount = computed(() => props.words.size)
const totalWords = computed(() => props.validWords.length)
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
      <ul class="flex-1 overflow-y-auto space-y-0.5 pr-1 m-0 p-0 list-none">
        <li
          v-for="(item, index) in wordsWithPopularity"
          :key="item.hash"
          class="flex items-center gap-2 px-2 py-1.5 rounded transition-colors duration-150"
        >
          <span class="w-4 text-xs text-muted-foreground tabular-nums text-right shrink-0">
            {{ index + 1 }}.
          </span>
          <span class="w-5 text-center shrink-0">
            <span
              v-if="item.found"
              class="i-lucide-check text-sm"
              :class="item.pangram ? 'text-celebration' : 'text-primary'"
              aria-hidden="true"
            />
          </span>

          <span
            class="font-mono text-sm flex-1/2 min-w-0"
            :class="item.found
              ? (item.pangram ? 'text-celebration font-semibold' : 'text-on-surface')
              : 'text-muted-foreground'"
          >
            {{ item.found ? item.displayWord.toLowerCase() : formatWordHint(item.word) }}
          </span>

          <div class="flex items-center gap-2 flex-1/2 shrink-0 justify-end">
            <div
              class="w-32 h-4 rounded overflow-hidden"
              :class="item.found ? (item.pangram ? 'bg-celebration/20' : 'bg-primary/20') : 'bg-muted/30'"
              :title="t('popularity.foundPercent', { percent: item.percentage ?? 0 })"
            >
              <div
                class="h-full transition-all duration-300"
                :class="item.found ? (item.pangram ? 'bg-celebration' : 'bg-primary') : 'bg-muted-foreground/50'"
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

<script setup lang="ts">
const props = defineProps<{
  validWords: string[]
  words: Set<string>
  letters: string[]
}>()

const emit = defineEmits<{
  showPrefixStats: [prefix: string]
  showLengthStats: [length: number]
  showGridStats: [prefix: string, length: number]
}>()

const { t } = useI18n()

const longestWordLength = computed(() => props.validWords.reduce((acc, w) => w.length > acc ? w.length : acc, 0))

const prefixes = computed(() => {
  const set = new Set<string>()
  for (const word of props.validWords) {
    set.add(word.slice(0, 1))
  }
  return set
})

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

const totalRemaining = computed(() => {
  let count = 0
  for (const prefix in remainingWords.value) {
    for (const length in remainingWords.value[prefix]) {
      count += remainingWords.value[prefix][length] || 0
    }
  }
  return count
})

const totalWords = computed(() => props.validWords.length)
const foundCount = computed(() => totalWords.value - totalRemaining.value)
</script>

<template>
  <div class="hint-panel flex flex-col h-full">
    <header class="hint-panel-header flex items-center gap-2 mb-3">
      <span
        class="i-lucide-grid-3x3 text-primary text-base"
        aria-hidden="true"
      />
      <h3 class="text-sm font-medium text-on-surface m-0">
        {{ t('hints.panels.wordGrid') }}
      </h3>
      <span class="text-xs text-muted-foreground ml-auto tabular-nums">
        {{ foundCount }}/{{ totalWords }}
      </span>
    </header>

    <div class="flex-1 min-h-0 overflow-y-auto pl-1">
      <table class="text-on-surface text-center tabular-nums border-collapse">
        <tbody>
          <tr>
            <td />
            <td
              v-for="i of longestWordLength - 3"
              :key="`header-${i + 3}`"
              class="p-0"
            >
              <button
                type="button"
                class="w-full h-full font-mono text-xs text-muted-foreground pb-2 cursor-pointer hover:text-on-surface focus:text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded transition-colors duration-150 bg-transparent border-0"
                @click="emit('showLengthStats', i + 3)"
              >
                {{ i + 3 }}
              </button>
            </td>
          </tr>
          <tr
            v-for="(counts, prefix) in remainingWords"
            :key="`row-${prefix}`"
          >
            <td class="p-0">
              <button
                type="button"
                class="w-full h-full uppercase font-mono text-xs text-muted-foreground pr-3 tracking-widest text-right cursor-pointer hover:text-on-surface focus:text-on-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded transition-colors duration-150 bg-transparent border-0"
                @click="emit('showPrefixStats', prefix)"
              >
                {{ prefix }}
              </button>
            </td>
            <td
              v-for="l of longestWordLength - 3"
              :key="`cell-${prefix}-${l + 3}`"
              class="grid-cell w-7 h-7 relative p-0"
            >
              <button
                v-if="counts[l + 3] !== undefined"
                type="button"
                class="w-full h-full flex items-center justify-center text-xs font-mono transition-colors duration-150 bg-transparent border-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-inset"
                :class="counts[l + 3] === 0 ? 'cell-complete' : 'cell-remaining text-on-surface'"
                @click="emit('showGridStats', prefix, l + 3)"
              >
                <span
                  v-if="counts[l + 3] === 0"
                  class="i-lucide-check text-primary text-sm"
                  aria-hidden="true"
                />
                <template v-else>
                  {{ counts[l + 3] }}
                </template>
              </button>
              <span
                v-else
                class="w-full h-full flex items-center justify-center text-muted"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.grid-cell::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  border-right: 1px solid color-mix(in oklch, var(--color-muted) 50%, transparent);
  border-bottom: 1px solid color-mix(in oklch, var(--color-muted) 50%, transparent);
}

tr td:nth-child(2).grid-cell::after {
  border-left: 1px solid color-mix(in oklch, var(--color-muted) 50%, transparent);
}

tbody tr:first-child + tr .grid-cell::after {
  border-top: 1px solid color-mix(in oklch, var(--color-muted) 50%, transparent);
}

.cell-remaining:hover {
  background: color-mix(in oklch, var(--color-primary) 10%, transparent);
}

.cell-complete {
  background: color-mix(in oklch, var(--color-primary) 8%, transparent);
}

.cell-complete:hover {
  background: color-mix(in oklch, var(--color-primary) 15%, transparent);
}
</style>

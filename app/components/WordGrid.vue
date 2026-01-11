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
</script>

<template>
  <table class="text-on-surface text-center tabular-nums border-collapse">
    <tbody>
      <tr>
        <td />
        <td
          v-for="i of longestWordLength - 3"
          :key="`header-${i + 3}`"
          class="font-mono text-xs text-muted-foreground pb-2 cursor-pointer hover:text-on-surface transition-colors duration-150"
          @click="emit('showLengthStats', i + 3)"
        >
          {{ i + 3 }}
        </td>
      </tr>
      <tr
        v-for="(counts, prefix) in remainingWords"
        :key="`row-${prefix}`"
      >
        <td
          class="uppercase font-mono text-xs text-muted-foreground pr-3 tracking-widest text-right cursor-pointer hover:text-on-surface transition-colors duration-150"
          @click="emit('showPrefixStats', prefix)"
        >
          {{ prefix }}
        </td>
        <td
          v-for="l of longestWordLength - 3"
          :key="`cell-${prefix}-${l + 3}`"
          class="grid-cell w-7 h-7 relative text-xs sm:text-sm font-mono transition-colors duration-150"
          :class="{
            'cell-remaining cursor-pointer text-on-surface': counts[l + 3] !== undefined && counts[l + 3]! > 0,
            'cell-complete cursor-pointer text-primary': counts[l + 3] === 0,
            'text-muted cursor-default': counts[l + 3] === undefined,
          }"
          @click="counts[l + 3] !== undefined ? emit('showGridStats', prefix, l + 3) : null"
        >
          {{ counts[l + 3] === undefined ? '' : counts[l + 3] === 0 ? '✓' : counts[l + 3] }}
        </td>
      </tr>
    </tbody>
  </table>
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

.cell-complete:hover {
  background: color-mix(in oklch, var(--color-primary) 15%, transparent);
}
</style>

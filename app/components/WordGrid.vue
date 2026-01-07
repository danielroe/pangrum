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
  <table class="text-white p-2 text-center tabular-nums">
    <tbody>
      <tr>
        <td />
        <td
          v-for="i of longestWordLength - 3"
          :key="`header-${i + 3}`"
          class="font-mono pb-3 cursor-pointer hover:bg-white hover:bg-opacity-10 transition-colors"
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
          class="uppercase font-mono h-5 w-5 pr-4 tracking-widest text-right cursor-pointer hover:bg-white hover:bg-opacity-10 transition-colors"
          @click="emit('showPrefixStats', prefix)"
        >
          {{ prefix }}
        </td>
        <td
          v-for="l of longestWordLength - 3"
          :key="`cell-${prefix}-${l + 3}`"
          class="w-5 h-5 text-xs sm:text-sm lg:h-5 lg:w-5 text-center px-1 font-mono border-white border-opacity-10 border-1 border-solid transition-colors"
          :class="{
            'bg-white bg-opacity-10 cursor-pointer hover:bg-opacity-20': counts[l + 3] !== undefined && counts[l + 3]! > 0,
            'bg-primary text-black cursor-pointer hover:bg-primary-hover': counts[l + 3] === 0,
          }"
          @click="counts[l + 3] !== undefined ? emit('showGridStats', prefix, l + 3) : null"
        >
          {{ counts[l + 3] === undefined ? '' : counts[l + 3] === 0 ? '✔︎' : counts[l + 3] }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
const props = defineProps<{
  validWords: string[]
  words: Set<string>
}>()

const longestWordLength = computed(() => props.validWords.reduce((acc, w) => w.length > acc ? w.length : acc, 0))

const prefixes = computed(() => new Set(props.validWords.map(m => m.slice(0, 2))))
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
        <td></td>
        <td
          v-for="i of longestWordLength - 3"
          class="font-mono pb-3"
        >
          {{ i + 3 }}
        </td>
      </tr>
      <tr v-for="(counts, prefix) in remainingWords">
        <td class="uppercase font-mono h-5 w-5 pr-4 tracking-widest text-right">{{ prefix }}</td>
        <td 
          v-for="l of longestWordLength - 3"
          class="w-3 h-3 text-xs sm:text-sm sm:h-5 sm:w-5 text-center px-1 font-mono border-white border-opacity-10 border-1 border-solid"
          :class="{
            'bg-white bg-opacity-10': counts[l + 3] !== undefined && counts[l + 3]! > 0,
            'bg-yellow-300 text-black': counts[l + 3] === 0
          }"
        >
          {{ counts[l + 3] === undefined ? '' : counts[l + 3] === 0 ? '✔︎' : counts[l + 3] }}
        </td>
      </tr>
    </tbody>
  </table>
</template>


<script setup lang="ts">
const props = defineProps<{
  validWords: string[]
  words: Set<string>
  pairs: Record<string, number>
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
</script>

<template>
  <div class="select-none">
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
            class="w-3 h-3 text-xs sm:text-sm sm:h-5 sm:w-5 text-center px-1 font-mono border-white border-opacity-10 border-1 border-solid transition-colors"
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
    <dl
      class="grid font-mono items-center text-sm grid-cols-[1.75rem_1fr_1.75rem_1fr] gap-row-2"
    >
      <template
        v-for="(count, prefix) in pairs"
        :key="prefix"
      >
        <dd
          class="border-1 border-solid text-center aspect-square inline-block h-7 w-7 place-content-center !m-0"
          :class="[
            pairsRemaining[prefix] ? 'border-white border-opacity-10 bg-white bg-opacity-10': 'border-yellow bg-yellow text-black',
          ]"
        >
          <span
            v-if="!pairsRemaining[prefix]"
            class="text-lg"
            alt=""
            v-text="'✔︎'"
          />
          <span :class="{ 'sr-only': !pairsRemaining[prefix] }">
            {{ pairsRemaining[prefix] }}
          </span>
          <span class="sr-only">{{ pairsRemaining[prefix] === 1 ? 'word' : 'words' }}</span>
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
</template>

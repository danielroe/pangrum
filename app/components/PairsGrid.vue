<script setup lang="ts">
const props = defineProps<{
  pairs: Record<string, number>
  words: Set<string>
}>()

const emit = defineEmits<{
  showPairStats: [prefix: string]
}>()

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
  <dl
    class="grid font-mono items-center text-sm gap-y-1.5 gap-x-1 grid-cols-[1.5rem_1fr_1.5rem_1fr_1.5rem_1fr] md:grid-cols-[1.5rem_1fr_1.5rem_1fr_1.5rem_1fr_1.5rem_1fr] lg:grid-cols-[1.5rem_1fr_1.5rem_1fr_1.5rem_1fr_1.5rem_1fr_1.5rem_1fr_1.5rem_1fr]"
  >
    <template
      v-for="(count, prefix) in pairs"
      :key="prefix"
    >
      <dd
        class="pair-count text-center h-6 w-6 leading-6 m-0 cursor-pointer transition-colors duration-150 text-xs hover:text-primary"
        :class="[
          pairsRemaining[prefix] ? 'text-on-surface': 'text-primary',
        ]"
        :aria-label="`${prefix}: ${pairsRemaining[prefix]} ${pairsRemaining[prefix] === 1 ? 'word' : 'words'} remaining`"
        @click="emit('showPairStats', prefix)"
      >
        <span
          v-if="!pairsRemaining[prefix]"
          aria-hidden="true"
        >✓</span>
        <span
          v-else
          aria-hidden="true"
        >{{ pairsRemaining[prefix] }}</span>
      </dd>
      <dt
        class="pair-label text-xs h-6 leading-6 pl-1 cursor-pointer transition-colors duration-150 hover:text-primary"
        :class="[
          pairsRemaining[prefix] ? 'text-muted-foreground' : 'text-primary',
        ]"
        @click="emit('showPairStats', prefix)"
      >
        {{ prefix }}
      </dt>
    </template>
  </dl>
</template>

<style scoped>
.pair-count:has(+ .pair-label:hover) {
  color: var(--color-primary);
}

.pair-count:hover + .pair-label {
  color: var(--color-primary);
}
</style>

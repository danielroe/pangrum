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
    class="grid font-mono items-center text-sm gap-row-2 grid-cols-[1.75rem_1fr_1.75rem_1fr_1.75rem_1fr] md:grid-cols-[1.75rem_1fr_1.75rem_1fr_1.75rem_1fr_1.75rem_1fr] lg:grid-cols-[1.75rem_1fr_1.75rem_1fr_1.75rem_1fr_1.75rem_1fr_1.75rem_1fr_1.75rem_1fr]"
  >
    <template
      v-for="(count, prefix) in pairs"
      :key="prefix"
    >
      <dd
        class="border-1 border-solid text-center aspect-square inline-block h-7 w-7 place-content-center !m-0 overflow-hidden cursor-pointer transition-all"
        :class="[
          pairsRemaining[prefix] ? 'border-muted bg-muted': 'border-primary bg-primary text-black',
        ]"
        :aria-label="`${prefix}: ${pairsRemaining[prefix]} ${pairsRemaining[prefix] === 1 ? 'word' : 'words'} remaining`"
        @click="emit('showPairStats', prefix)"
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
          pairsRemaining[prefix] ? 'after:border-muted after:bg-muted': 'after:border-primary',
        ]"
        @click="emit('showPairStats', prefix)"
      >
        {{ prefix }}
      </dt>
    </template>
  </dl>
</template>

<style scoped>
dd:hover,
dd:has(+ dt:hover) {
  background-color: var(--color-muted-foreground);
}

dd.bg-primary:hover,
dd.bg-primary:has(+ dt:hover) {
  background-color: var(--color-primary-hover);
}

dt:hover,
dd:hover + dt {
  opacity: 0.7;
}
</style>

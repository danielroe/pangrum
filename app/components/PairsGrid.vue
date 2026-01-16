<script setup lang="ts">
const props = defineProps<{
  pairs: Record<string, number>
  words: Set<string>
}>()

const emit = defineEmits<{
  showPairStats: [prefix: string]
}>()

const { t } = useI18n()

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

const totalPairs = computed(() => Object.keys(props.pairs).length)
const completedPairs = computed(() => {
  return Object.values(pairsRemaining.value).filter(r => r === 0).length
})
</script>

<template>
  <div class="hint-panel flex flex-col h-full">
    <header class="hint-panel-header flex items-center gap-2 mb-3">
      <span
        class="i-lucide-text-cursor-input text-primary text-base"
        aria-hidden="true"
      />
      <h3 class="text-sm font-medium text-on-surface m-0">
        {{ t('hints.panels.twoLetterPairs') }}
      </h3>
      <span class="text-xs text-muted-foreground ml-auto tabular-nums">
        {{ completedPairs }}/{{ totalPairs }}
      </span>
    </header>

    <div class="flex-1 min-h-0 overflow-y-auto">
      <dl
        class="grid font-mono items-center text-sm gap-y-1.5 gap-x-1 grid-cols-[1.5rem_1fr_1.5rem_1fr_1.5rem_1fr] md:grid-cols-[1.5rem_1fr_1.5rem_1fr_1.5rem_1fr_1.5rem_1fr] lg:grid-cols-[1.5rem_1fr_1.5rem_1fr_1.5rem_1fr_1.5rem_1fr_1.5rem_1fr_1.5rem_1fr]"
      >
        <template
          v-for="(count, prefix) in pairs"
          :key="prefix"
        >
          <dd class="m-0">
            <button
              type="button"
              class="pair-count flex items-center justify-center h-6 w-6 rounded cursor-pointer transition-all duration-150 text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 bg-transparent border-0"
              :class="pairsRemaining[prefix]
                ? 'text-on-surface hover:text-primary'
                : 'pair-complete bg-primary/10 text-primary'"
              :aria-label="`${prefix}: ${pairsRemaining[prefix]} ${pairsRemaining[prefix] === 1 ? 'word' : 'words'} remaining`"
              @click="emit('showPairStats', prefix)"
            >
              <span
                v-if="!pairsRemaining[prefix]"
                class="i-lucide-check text-sm"
                aria-hidden="true"
              />
              <span
                v-else
                aria-hidden="true"
              >{{ pairsRemaining[prefix] }}</span>
            </button>
          </dd>
          <dt
            class="pair-label text-xs h-6 leading-6 pl-1 cursor-pointer transition-colors duration-150 hover:text-primary"
            :class="pairsRemaining[prefix] ? 'text-muted-foreground' : 'text-primary'"
            @click="emit('showPairStats', prefix)"
          >
            {{ prefix }}
          </dt>
        </template>
      </dl>
    </div>
  </div>
</template>

<style scoped>
.pair-count:has(+ .pair-label:hover) {
  color: var(--color-primary);
}

.pair-count:hover + .pair-label {
  color: var(--color-primary);
}

.pair-complete:hover {
  background: color-mix(in oklch, var(--color-primary) 15%, transparent);
}
</style>

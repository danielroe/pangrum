<script setup lang="ts">
const props = defineProps<{
  words: Set<string>
  validWords: string[]
  totalPangrams: number
  letters: string[]
  date: string
}>()

const emit = defineEmits<{
  share: []
}>()

const { maxScore, score, percentage } = useScore(() => props.words, () => props.validWords)

const foundPangrams = computed(() => {
  const allLetters = new Set(props.letters.map(l => l.toLowerCase()))
  let count = 0
  for (const word of props.words) {
    const wordLetters = new Set(word.toLowerCase())
    if (allLetters.size === wordLetters.size && [...allLetters].every(l => wordLetters.has(l))) {
      count++
    }
  }
  return count
})

const thresholds = {
  'beginner': 0,
  'novice': 2.5,
  'moving up': 5,
  'good': 8,
  'solid': 15,
  'nice': 25,
  'great': 40,
  'amazing': 50,
  'genius': 70,
  'perfect': 100,
} as const

const thresholdsReversed = Object.entries(thresholds).reverse()
const thresholdsForward = Object.entries(thresholds)

const status = computed(() => {
  for (const [label, threshold] of thresholdsReversed) {
    if (threshold <= percentage.value) {
      return label
    }
  }
  return 'beginner'
})

const nextThreshold = computed(() => {
  for (const [label, threshold] of thresholdsForward) {
    if (threshold > percentage.value) {
      return { label, threshold }
    }
  }
  return { threshold: 0 }
})

const pointsToGo = computed(() => Math.ceil((nextThreshold.value.threshold / 100) * maxScore.value) - score.value)

defineExpose({
  getShareData: () => ({
    date: props.date,
    score: score.value,
    maxScore: maxScore.value,
    wordsFound: props.words.size,
    totalWords: props.validWords.length,
    status: status.value,
    pangrams: foundPangrams.value,
    totalPangrams: props.totalPangrams,
    letters: props.letters,
  }),
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-baseline gap-2 tabular-nums overflow-hidden">
      <span class="score-value font-mono text-4xl font-bold leading-none">
        {{ score }}
      </span>
      <span class="text-base font-medium text-on-surface">
        {{ status }}
      </span>
      <span
        v-if="status !== 'perfect'"
        class="text-sm text-muted-foreground"
      >
        <span class="font-mono font-semibold">{{ pointsToGo }}</span> to {{ nextThreshold.label }}
      </span>
      <!-- Pangram stars -->
      <span
        v-if="totalPangrams > 0"
        class="flex items-center gap-0.5 ml-auto pl-2"
        role="img"
        :aria-label="`${foundPangrams} of ${totalPangrams} pangrams found`"
      >
        <span class="sr-only">{{ foundPangrams }} of {{ totalPangrams }} pangrams found</span>
        <svg
          v-for="i in totalPangrams"
          :key="i"
          class="star transition-all duration-300"
          :class="i <= foundPangrams ? 'filled' : 'text-muted'"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </span>
      <button
        v-if="words.size > 0"
        type="button"
        class="share-btn flex items-center justify-center w-8 h-8 rounded-lg bg-transparent border-1 border-solid border-muted text-muted-foreground cursor-pointer transition-all duration-150 hover:bg-surface-hover hover:text-on-surface hover:border-primary focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        :class="{ 'ml-auto': totalPangrams === 0 }"
        aria-label="Share results"
        @click="emit('share')"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle
            cx="18"
            cy="5"
            r="3"
          />
          <circle
            cx="6"
            cy="12"
            r="3"
          />
          <circle
            cx="18"
            cy="19"
            r="3"
          />
          <line
            x1="8.59"
            y1="13.51"
            x2="15.42"
            y2="17.49"
          />
          <line
            x1="15.41"
            y1="6.51"
            x2="8.59"
            y2="10.49"
          />
        </svg>
      </button>
    </div>

    <div class="flex items-center px-1">
      <template
        v-for="(threshold, label) in thresholds"
        :key="`${label}-dot`"
      >
        <div
          v-if="label !== 'perfect'"
          class="progress-dot w-2 h-2 rounded-full border-1.5 border-transparent shrink-0 transition-all duration-300"
          :class="{
            filled: percentage > threshold,
            current: status === label,
          }"
        />
        <div
          v-if="label !== 'perfect' && label !== 'genius'"
          :key="`${label}-line`"
          class="progress-line flex-1 h-px transition-colors duration-300"
          :class="{
            filled: percentage > threshold,
            active: status === label,
          }"
        />
      </template>
    </div>
  </div>
</template>

<style scoped>
.score-value {
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    color-mix(in oklch, var(--color-primary) 70%, white) 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.star.filled {
  color: var(--color-celebration);
  filter: drop-shadow(0 0 4px rgba(245, 158, 11, 0.5));
}

.progress-dot {
  background: var(--color-progress-inactive);
}

.progress-dot.filled {
  background: var(--color-primary);
  box-shadow: 0 0 8px var(--color-primary-glow);
}

.progress-dot.current {
  transform: scale(1.25);
  animation: dot-pulse 2s ease-in-out infinite;
}

.progress-line {
  background: var(--color-progress-inactive);
}

.progress-line.filled {
  background: linear-gradient(
    90deg,
    var(--color-primary) 0%,
    var(--color-primary-muted) 100%
  );
}

.progress-line.active {
  background: linear-gradient(
    90deg,
    var(--color-primary) 0%,
    var(--color-progress-inactive) 60%
  );
}

@keyframes dot-pulse {
  0%, 100% {
    box-shadow: 0 0 8px var(--color-primary-glow);
  }
  50% {
    box-shadow: 0 0 14px var(--color-primary-glow);
  }
}

@media (prefers-reduced-motion: reduce) {
  .progress-dot.current {
    animation: none;
  }
}
</style>

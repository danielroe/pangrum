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

const thresholdsForward = Object.entries(LEVEL_THRESHOLDS)
const thresholdCount = thresholdsForward.length

const status = computed(() => getLevel(percentage.value))

// Get index of current status for progress calculation
const currentStatusIndex = computed(() => {
  const idx = thresholdsForward.findIndex(([label]) => label === status.value)
  return idx >= 0 ? idx : 0
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

const wordsFound = computed(() => props.words.size)
const totalWords = computed(() => props.validWords.length)

// Calculate visual position for each dot (evenly spaced, not to scale)
function getDotPosition(index: number): number {
  return (index / (thresholdCount - 1)) * 100
}

// Calculate fill width based on current status and progress within segment
const fillWidth = computed(() => {
  const currentIdx = currentStatusIndex.value
  const nextIdx = currentIdx + 1

  if (nextIdx >= thresholdCount) {
    return 100 // Perfect score
  }

  const currentThreshold = thresholdsForward[currentIdx]![1]
  const nextThresholdVal = thresholdsForward[nextIdx]![1]

  // Progress within current segment (0-1)
  const segmentProgress = (percentage.value - currentThreshold) / (nextThresholdVal - currentThreshold)
  const clampedProgress = Math.max(0, Math.min(1, segmentProgress))

  const startPos = getDotPosition(currentIdx)
  const endPos = getDotPosition(nextIdx)

  return startPos + (endPos - startPos) * clampedProgress
})

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
  <div class="flex flex-col gap-1">
    <!-- Score + Status row -->
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-baseline gap-1.5">
        <span class="score-value font-mono font-bold">{{ score }}</span>
        <span class="text-sm font-medium text-on-surface op-70 lowercase tracking-tight">{{ status }}</span>
      </div>

      <div class="flex items-center gap-4">
        <!-- Pangram indicators -->
        <span
          v-if="totalPangrams > 0"
          class="flex items-center gap-px"
          role="img"
          :aria-label="`${foundPangrams} of ${totalPangrams} pangrams found`"
        >
          <span class="sr-only">{{ foundPangrams }} of {{ totalPangrams }} pangrams found</span>
          <span
            v-for="i in totalPangrams"
            :key="i"
            class="i-lucide-star text-2.5 transition-all duration-300"
            :class="i <= foundPangrams
              ? 'text-celebration star-glow'
              : 'text-muted-foreground op-30'"
            aria-hidden="true"
          />
        </span>

        <!-- Share button -->
        <button
          v-if="words.size > 0"
          type="button"
          class="flex items-center justify-center w-7 h-7 p-0 bg-transparent border-1 border-solid border-muted/60 rounded-md text-muted-foreground cursor-pointer transition-all duration-150 hover:bg-surface-hover hover:text-on-surface hover:border-muted active:scale-95 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
          aria-label="Share results"
          @click="emit('share')"
        >
          <span
            class="i-lucide-share-2 text-sm"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>

    <!-- Progress timeline -->
    <div class="flex flex-col gap-1.5">
      <div class="progress-track">
        <!-- Milestone dot rings (behind bar) -->
        <span
          v-for="([label], index) in thresholdsForward"
          :key="`ring-${label}`"
          class="dot-ring"
          :class="{
            reached: index <= currentStatusIndex,
            current: label === status,
          }"
          :style="{ left: `${getDotPosition(index)}%` }"
        />

        <!-- Background track -->
        <div class="track-bg" />

        <!-- Filled portion with traveling pulse -->
        <div
          class="progress-fill"
          :style="{ '--fill-width': `${fillWidth}%`, '--fill-scale': `${fillWidth / 100}` }"
        />

        <!-- Milestone dots (on top of bar) -->
        <span
          v-for="([label], index) in thresholdsForward"
          :key="`dot-${label}`"
          class="milestone-dot"
          :class="{
            reached: index <= currentStatusIndex,
            current: label === status,
          }"
          :style="{ left: `${getDotPosition(index)}%` }"
        />
      </div>

      <!-- Info row -->
      <div class="flex items-center justify-between px-px">
        <span class="flex items-baseline gap-0.5 text-2.75 tabular-nums">
          <span class="font-mono font-semibold text-on-surface">{{ wordsFound }}</span>
          <span class="text-muted-foreground op-40">/</span>
          <span class="font-mono text-muted-foreground">{{ totalWords }}</span>
          <span class="text-muted-foreground op-60 ml-1">words</span>
        </span>

        <span
          v-if="status !== 'perfect'"
          class="flex items-baseline gap-1 text-2.75"
        >
          <span class="font-mono font-semibold text-muted-foreground tabular-nums">{{ pointsToGo }}</span>
          <span class="text-muted-foreground op-60">to {{ nextThreshold.label }}</span>
        </span>
        <span
          v-else
          class="text-celebration text-sm perfect-sparkle"
        >
          <span
            class="i-lucide-sparkles"
            aria-hidden="true"
          />
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.score-value {
  font-size: clamp(1.75rem, 7vw, 2.25rem);
  line-height: 1;
  letter-spacing: -0.025em;
  font-variant-numeric: tabular-nums;
  background: linear-gradient(
    135deg,
    var(--color-primary) 0%,
    color-mix(in oklch, var(--color-primary) 65%, white) 100%
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.star-glow {
  filter: drop-shadow(0 0 3px rgba(245, 158, 11, 0.5));
}

/* Filled progress bar with traveling pulse */
.progress-fill {
  position: absolute;
  inset: 0;
  width: 100%;
  background: var(--color-primary);
  border-radius: 9999px;
  transform-origin: left;
  transform: scaleX(var(--fill-scale, 0));
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  z-index: 2;
}

/* Traveling light pulse along the bar */
.progress-fill::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    transparent 40%,
    color-mix(in oklch, var(--color-primary) 50%, white) 50%,
    transparent 60%,
    transparent 100%
  );
  animation: pulse-travel 2.5s ease-in-out infinite;
}

/* Subtle glow at the end that pulses when pulse arrives */
.progress-fill::after {
  content: '';
  position: absolute;
  right: -1px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  background: color-mix(in oklch, var(--color-primary) 80%, white);
  border-radius: 9999px;
  box-shadow: 0 0 6px var(--color-primary-glow);
  animation: end-pulse 2.5s ease-in-out infinite;
}

/* Progress track container */
.progress-track {
  position: relative;
  height: 4px;
  margin: 0.625rem 0.375rem;
}

.track-bg {
  position: absolute;
  inset: 0;
  background: var(--color-progress-inactive);
  border-radius: 9999px;
  z-index: 1;
}

/* Dot rings - sit behind the bar */
.dot-ring {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  border-radius: 9999px;
  transform: translate(-50%, -50%);
  border: 1px solid var(--color-muted);
  z-index: 0;
}

.dot-ring.reached {
  border-color: var(--color-primary-muted);
}

.dot-ring.current {
  width: 18px;
  height: 18px;
  border-width: 2px;
}

/* Milestone dots - on top of bar */
.milestone-dot {
  position: absolute;
  top: 50%;
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  transform: translate(-50%, -50%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--color-progress-inactive);
  z-index: 3;
}

.milestone-dot.reached {
  background: var(--color-primary);
}

.milestone-dot.current {
  width: 8px;
  height: 8px;
}

.perfect-sparkle {
  animation: sparkle 2s ease-in-out infinite;
}

/* Animations */

/* Pulse travels along the progress bar */
@keyframes pulse-travel {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* End glow intensifies when pulse arrives */
@keyframes end-pulse {
  0%, 80% {
    box-shadow: 0 0 4px var(--color-primary-glow);
    transform: translateY(-50%) scale(1);
  }
  90% {
    box-shadow:
      0 0 8px var(--color-primary-glow),
      0 0 16px var(--color-primary-glow);
    transform: translateY(-50%) scale(1.3);
  }
  100% {
    box-shadow: 0 0 4px var(--color-primary-glow);
    transform: translateY(-50%) scale(1);
  }
}

@keyframes sparkle {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.15);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .progress-fill {
    transition: none;
  }

  .progress-fill::before,
  .progress-fill::after,
  .perfect-sparkle {
    animation: none;
  }
}
</style>

<script setup lang="ts">
const props = defineProps<{
  words: Set<string>
  validWords: string[]
}>()

const { maxScore, score, percentage } = useScore(() => props.words, () => props.validWords)

const thresholds = {
  'beginner': 0,
  'good start': 2.5,
  'moving up': 5,
  'good': 8,
  'solid': 15,
  'nice': 25,
  'great': 40,
  'amazing': 50,
  'genius': 70,
  'queen bee': 100,
}

// const icons = {
//   beginner: '👶',
//   'good start': 2.5,
//   'moving up': 5,
//   'good': 8,
//   'solid': 15,
//   'nice': 25,
//   'great': 40,
//   amazing: 50,
//   genius: 70,
//   'queen bee': 100,
// }

const status = computed(() => {
  for (const [label, threshold] of Object.entries(thresholds).reverse()) {
    if (threshold <= percentage.value) {
      return label
    }
  }
  return 'beginner'
})

const nextThreshold = computed(() => {
  for (const [label, threshold] of Object.entries(thresholds)) {
    if (threshold > percentage.value) {
      return { label, threshold }
    }
  }
  return { threshold: 0 }
})

const pointsToGo = computed(() => Math.ceil((nextThreshold.value.threshold / 100) * maxScore.value) - score.value)
</script>

<template>
  <div class="flex flex-col gap-4 items-stretch">
    <div class="tabular-nums flex flex-row items-baseline gap-2 overflow-hidden max-w-full">
      <span class="text-4xl text-primary font-bold font-mono">
        {{ score }}
      </span>
      <span class="inline-block flex-shrink-0">
        {{ status }}
      </span>
      <div
        v-if="status !== 'queen bee'"
        class="opacity-40 text-sm line-clamp-1"
      >
        (<span class="font-mono">{{ pointsToGo }}</span> more to '{{ nextThreshold.label }}')
      </div>
    </div>
    <div class="flex flex-row px-1 items-center">
      <template
        v-for="(threshold, label) in thresholds"
        :key="`${label}-dot`"
      >
        <div
          v-if="label !== 'queen bee'"
          class="border border-solid border-2 w-2 h-2 rounded-full"
          :class="{ 'bg-primary': percentage > threshold, 'bg-progress-inactive': percentage <= threshold }"
        />
        <div
          v-if="label !== 'queen bee' && label !=='genius'"
          :key="`${label}-status`"
          class="flex-grow relative flex  justify-center items-center"
        >
          <div
            class="absolute border-1 -z-1 w-full"
            :class="{
              'border-primary': percentage > threshold,
              'border-dashed': status === label,
              'border-solid': status !== label,
              'border-progress-inactive': percentage <= threshold,
            }"
          />
        </div>
      </template>
    </div>
  </div>
</template>

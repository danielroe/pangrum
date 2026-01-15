<script setup lang="ts">
import type { PuzzleStats } from '../composables/usePuzzleHistory'

defineProps<{
  stats: PuzzleStats
}>()

const emit = defineEmits<{
  close: []
}>()

const { t } = useI18n()

const dialogRef = useTemplateRef<HTMLDivElement>('dialog')

onClickOutside(dialogRef, () => emit('close'))
onKeyStroke('Escape', () => emit('close'))
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        ref="dialog"
        class="bg-surface-elevated border-1 border-solid border-muted rounded-2xl p-5 w-full max-w-xs shadow-2xl"
        role="dialog"
        aria-labelledby="stats-title"
      >
        <div class="flex items-center justify-between mb-4">
          <h2
            id="stats-title"
            class="text-lg font-semibold text-on-surface"
          >
            {{ t('stats.title') }}
          </h2>
          <button
            type="button"
            class="w-8 h-8 flex items-center justify-center bg-transparent border-1 border-solid border-muted rounded-lg text-muted-foreground cursor-pointer transition-colors hover:bg-surface-hover hover:text-on-surface focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            :aria-label="t('common.close')"
            @click="emit('close')"
          >
            <span
              class="i-lucide-x text-sm"
              aria-hidden="true"
            />
          </button>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <!-- Current Streak -->
          <div class="flex flex-col items-center p-3 bg-surface rounded-xl">
            <span
              class="i-lucide-flame text-xl mb-1"
              :class="stats.currentStreak > 0 ? 'text-celebration' : 'text-muted-foreground'"
              aria-hidden="true"
            />
            <span class="text-2xl font-bold font-mono text-on-surface tabular-nums">{{ stats.currentStreak }}</span>
            <span class="text-xs text-muted-foreground text-center">{{ t('stats.currentStreak') }}</span>
          </div>

          <!-- Longest Streak -->
          <div class="flex flex-col items-center p-3 bg-surface rounded-xl">
            <span
              class="i-lucide-trophy text-xl mb-1 text-primary"
              aria-hidden="true"
            />
            <span class="text-2xl font-bold font-mono text-on-surface tabular-nums">{{ stats.longestStreak }}</span>
            <span class="text-xs text-muted-foreground text-center">{{ t('stats.bestStreak') }}</span>
          </div>

          <!-- Days Played -->
          <div class="flex flex-col items-center p-3 bg-surface rounded-xl">
            <span
              class="i-lucide-calendar-check text-xl mb-1 text-success"
              aria-hidden="true"
            />
            <span class="text-2xl font-bold font-mono text-on-surface tabular-nums">{{ stats.totalDaysPlayed }}</span>
            <span class="text-xs text-muted-foreground text-center">{{ t('stats.daysPlayed') }}</span>
          </div>
        </div>

        <p
          v-if="stats.currentStreak > 0"
          class="mt-4 text-sm text-center text-muted-foreground"
        >
          <span v-if="stats.currentStreak >= 7">
            <span class="text-celebration">{{ t('stats.incredible') }}</span> {{ t('stats.onFire') }}
          </span>
          <span v-else-if="stats.currentStreak >= 3">
            <span class="text-primary">{{ t('stats.nice') }}</span> {{ t('stats.keepGoing') }}
          </span>
          <span v-else>
            {{ t('stats.playTomorrow') }}
          </span>
        </p>
        <p
          v-else
          class="mt-4 text-sm text-center text-muted-foreground"
        >
          {{ t('stats.startStreak') }}
        </p>
      </div>
    </div>
  </Teleport>
</template>

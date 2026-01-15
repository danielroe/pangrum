<script setup lang="ts">
const { t, locale } = useI18n()

const props = defineProps<{
  modelValue: string // YYYY-MM-DD format
  hasProgress?: (date: string) => boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const triggerRef = useTemplateRef<HTMLButtonElement>('trigger')
const popoverRef = useTemplateRef<HTMLDivElement>('popover')

const today = new Date().toISOString().slice(0, 10)
const startDate = '2026-01-01'
const isToday = computed(() => props.modelValue === today)

// Current view month for calendar navigation
const viewDate = ref(new Date(props.modelValue || today))

const viewYear = computed(() => viewDate.value.getFullYear())
const viewMonth = computed(() => viewDate.value.getMonth())

const monthName = computed(() => {
  return viewDate.value.toLocaleDateString(locale.value, { month: 'long', year: 'numeric' })
})

interface CalendarDay {
  date: string
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  isSelected: boolean
  isFuture: boolean
  isPast: boolean
  hasProgress: boolean
}

const calendarDays = computed(() => {
  const year = viewYear.value
  const month = viewMonth.value

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const days: CalendarDay[] = []

  const startPadding = firstDay.getDay()
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startPadding - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i
    const date = new Date(year, month - 1, d).toISOString().slice(0, 10)
    days.push({
      date,
      day: d,
      isCurrentMonth: false,
      isToday: date === today,
      isSelected: date === props.modelValue,
      isFuture: date > today,
      isPast: date < startDate,
      hasProgress: props.hasProgress?.(date) ?? false,
    })
  }

  // Add days of current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d).toISOString().slice(0, 10)
    days.push({
      date,
      day: d,
      isCurrentMonth: true,
      isToday: date === today,
      isSelected: date === props.modelValue,
      isFuture: date > today,
      isPast: date < startDate,
      hasProgress: props.hasProgress?.(date) ?? false,
    })
  }

  const endPadding = 42 - days.length // 6 rows * 7 days
  for (let d = 1; d <= endPadding; d++) {
    const date = new Date(year, month + 1, d).toISOString().slice(0, 10)
    days.push({
      date,
      day: d,
      isCurrentMonth: false,
      isToday: date === today,
      isSelected: date === props.modelValue,
      isFuture: date > today,
      isPast: date < startDate,
      hasProgress: props.hasProgress?.(date) ?? false,
    })
  }

  return days
})

function toggle() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    viewDate.value = new Date(props.modelValue || today)
  }
}

function close() {
  isOpen.value = false
}

function selectDate(date: string) {
  if (date > today || date < startDate) return
  emit('update:modelValue', date)
  close()
}

function goToToday() {
  emit('update:modelValue', today)
  close()
}

function prevMonth() {
  const prev = new Date(viewYear.value, viewMonth.value - 1, 1)
  const startDateObj = new Date(startDate)
  if (prev.getFullYear() > startDateObj.getFullYear()
    || (prev.getFullYear() === startDateObj.getFullYear() && prev.getMonth() >= startDateObj.getMonth())) {
    viewDate.value = prev
  }
}

function nextMonth() {
  const next = new Date(viewYear.value, viewMonth.value + 1, 1)
  if (next <= new Date(today)) {
    viewDate.value = next
  }
}

const displayDate = computed(() => {
  if (isToday.value) return t('datePicker.today')
  const date = new Date(props.modelValue)
  return date.toLocaleDateString(locale.value, { month: 'short', day: 'numeric' })
})

onClickOutside(popoverRef, close, { ignore: [triggerRef] })
onKeyStroke('Escape', close)
</script>

<template>
  <ClientOnly>
    <div class="relative">
      <button
        ref="trigger"
        type="button"
        class="flex sm:hidden items-center justify-center w-8 h-8 rounded-lg bg-surface border-1 border-solid text-on-surface cursor-pointer transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ls:flex ls:w-7 ls:h-7"
        :class="isToday ? 'border-muted' : 'border-primary-border'"
        :aria-label="t('datePicker.selectDate')"
        :aria-expanded="isOpen"
        @click="toggle"
      >
        <span
          class="i-lucide-calendar text-base ls:text-sm"
          aria-hidden="true"
        />
      </button>

      <button
        type="button"
        class="hidden sm:flex items-center justify-center gap-2 px-3 py-1 text-sm rounded-lg bg-surface border-1 border-solid text-on-surface cursor-pointer transition-colors hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ls:hidden"
        :class="isToday ? 'border-muted' : 'border-primary-border'"
        :aria-label="t('datePicker.selectDate')"
        :aria-expanded="isOpen"
        @click="toggle"
      >
        <span
          class="i-lucide-calendar text-sm"
          aria-hidden="true"
        />
        <span>{{ displayDate }}</span>
      </button>

      <Transition
        enter-active-class="transition-opacity duration-150 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-100 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isOpen"
          ref="popover"
          class="popover fixed sm:absolute top-14 sm:top-full right-3 sm:right-auto sm:left-0 mt-0 sm:mt-2 z-50 bg-surface-elevated border-1 border-solid border-muted rounded-xl p-4 w-[min(18rem,calc(100vw-1.5rem))] shadow-xl"
        >
          <div class="flex items-center justify-between mb-3">
            <button
              type="button"
              class="w-8 h-8 flex items-center justify-center bg-surface border-1 border-solid border-muted rounded-lg text-on-surface cursor-pointer transition-colors hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              :aria-label="t('datePicker.previousMonth')"
              :disabled="viewYear <= 2026 && viewMonth <= 0"
              @click="prevMonth"
            >
              <span
                class="i-lucide-chevron-left text-sm"
                aria-hidden="true"
              />
            </button>
            <span class="text-sm font-medium text-on-surface">{{ monthName }}</span>
            <button
              type="button"
              class="w-8 h-8 flex items-center justify-center bg-surface border-1 border-solid border-muted rounded-lg text-on-surface cursor-pointer transition-colors hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              :aria-label="t('datePicker.nextMonth')"
              :disabled="viewYear >= new Date(today).getFullYear() && viewMonth >= new Date(today).getMonth()"
              @click="nextMonth"
            >
              <span
                class="i-lucide-chevron-right text-sm"
                aria-hidden="true"
              />
            </button>
          </div>

          <div class="grid grid-cols-7 gap-1 mb-1">
            <div
              v-for="dayKey in ['su', 'mo', 'tu', 'we', 'th', 'fr', 'sa'] as const"
              :key="dayKey"
              class="text-xs text-center text-muted-foreground p-1"
            >
              {{ t(`datePicker.days.${dayKey}`) }}
            </div>
          </div>

          <div class="grid grid-cols-7 gap-1">
            <button
              v-for="day in calendarDays"
              :key="day.date"
              type="button"
              class="day-button relative aspect-square flex items-center justify-center text-sm bg-transparent border-1 border-solid border-transparent rounded-lg cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1"
              :class="{
                'bg-primary text-primary font-semibold border-primary': day.isSelected,
                'bg-primary-subtle text-on-surface border-primary-border font-semibold': day.isToday && !day.isSelected,
                'text-muted-foreground cursor-not-allowed': day.isFuture || day.isPast,
                'text-muted-foreground': !day.isCurrentMonth && !day.isFuture && !day.isPast,
                'text-on-surface hover:bg-surface-hover hover:border-muted': day.isCurrentMonth && !day.isSelected && !day.isToday && !day.isFuture && !day.isPast,
              }"
              :disabled="day.isFuture || day.isPast"
              @click="() => selectDate(day.date)"
            >
              {{ day.day }}
              <span
                v-if="day.hasProgress && !day.isFuture && !day.isPast"
                class="progress-dot absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                :class="day.isSelected ? 'bg-on-surface/60' : 'bg-primary'"
                aria-hidden="true"
              />
            </button>
          </div>

          <button
            v-if="!isToday"
            type="button"
            class="mt-3 w-full p-2 text-sm bg-primary-subtle border-1 border-solid border-primary-border rounded-lg text-on-surface cursor-pointer transition-colors hover:bg-primary-muted focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
            @click="goToToday"
          >
            {{ t('datePicker.backToToday') }}
          </button>
        </div>
      </Transition>
    </div>
    <template #fallback>
      <!-- Mobile skeleton (full button, just missing interactivity) -->
      <div class="w-8 h-8 flex sm:hidden items-center justify-center rounded-lg bg-surface border-1 border-solid border-muted ls:flex ls:w-7 ls:h-7">
        <span
          class="i-lucide-calendar text-base ls:text-sm"
          aria-hidden="true"
        />
      </div>
      <!-- Desktop skeleton -->
      <div class="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-surface border-1 border-solid border-muted ls:hidden">
        <div class="w-4 h-4 rounded bg-muted animate-pulse" />
        <div class="w-10 h-4 rounded bg-muted animate-pulse" />
      </div>
    </template>
  </ClientOnly>
</template>

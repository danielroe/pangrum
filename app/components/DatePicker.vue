<script setup lang="ts">
const props = defineProps<{
  modelValue: string // YYYY-MM-DD format
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const triggerRef = useTemplateRef<HTMLButtonElement>('trigger')
const popoverRef = useTemplateRef<HTMLDivElement>('popover')

const today = new Date().toISOString().slice(0, 10)
const isToday = computed(() => props.modelValue === today)

// Current view month for calendar navigation
const viewDate = ref(new Date(props.modelValue || today))

const viewYear = computed(() => viewDate.value.getFullYear())
const viewMonth = computed(() => viewDate.value.getMonth())

const monthName = computed(() => {
  return viewDate.value.toLocaleDateString('en', { month: 'long', year: 'numeric' })
})

const calendarDays = computed(() => {
  const year = viewYear.value
  const month = viewMonth.value

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)

  const days: { date: string, day: number, isCurrentMonth: boolean, isToday: boolean, isSelected: boolean, isFuture: boolean }[] = []

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
    })
  }

  // Add days of current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d + 1).toISOString().slice(0, 10)
    days.push({
      date,
      day: d,
      isCurrentMonth: true,
      isToday: date === today,
      isSelected: date === props.modelValue,
      isFuture: date > today,
    })
  }

  const endPadding = 42 - days.length // 6 rows * 7 days
  for (let d = 1; d <= endPadding; d++) {
    const date = new Date(year, month + 1, d + 1).toISOString().slice(0, 10)
    days.push({
      date,
      day: d,
      isCurrentMonth: false,
      isToday: date === today,
      isSelected: date === props.modelValue,
      isFuture: date > today,
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
  if (date > today) return
  emit('update:modelValue', date)
  close()
}

function goToToday() {
  emit('update:modelValue', today)
  close()
}

function prevMonth() {
  viewDate.value = new Date(viewYear.value, viewMonth.value - 1, 1)
}

function nextMonth() {
  const next = new Date(viewYear.value, viewMonth.value + 1, 1)
  if (next <= new Date(today)) {
    viewDate.value = next
  }
}

const displayDate = computed(() => {
  if (isToday.value) return 'Today'
  const date = new Date(props.modelValue)
  return date.toLocaleDateString('en', { month: 'short', day: 'numeric' })
})

onClickOutside(popoverRef, close, { ignore: [triggerRef] })
onKeyStroke('Escape', close)
</script>

<template>
  <div class="relative">
    <button
      ref="trigger"
      type="button"
      class="trigger-btn flex sm:hidden items-center justify-center w-9 h-9 rounded-lg bg-surface-elevated border-1 border-solid text-on-surface cursor-pointer transition-all duration-150 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
      :class="isToday ? 'border-muted' : 'border-primary-border'"
      aria-label="Select puzzle date"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect
          x="3"
          y="4"
          width="18"
          height="18"
          rx="2"
          ry="2"
        />
        <line
          x1="16"
          y1="2"
          x2="16"
          y2="6"
        />
        <line
          x1="8"
          y1="2"
          x2="8"
          y2="6"
        />
        <line
          x1="3"
          y1="10"
          x2="21"
          y2="10"
        />
      </svg>
    </button>

    <button
      type="button"
      class="trigger-btn hidden sm:flex items-center justify-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-surface-elevated border-1 border-solid text-on-surface cursor-pointer transition-all duration-150 hover:bg-surface-hover focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
      :class="isToday ? 'border-muted' : 'border-primary-border'"
      aria-label="Select puzzle date"
      :aria-expanded="isOpen"
      @click="toggle"
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect
          x="3"
          y="4"
          width="18"
          height="18"
          rx="2"
          ry="2"
        />
        <line
          x1="16"
          y1="2"
          x2="16"
          y2="6"
        />
        <line
          x1="8"
          y1="2"
          x2="8"
          y2="6"
        />
        <line
          x1="3"
          y1="10"
          x2="21"
          y2="10"
        />
      </svg>
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
            class="w-8 h-8 flex items-center justify-center bg-transparent border-1 border-solid border-muted rounded-md text-on-surface cursor-pointer transition-colors duration-150 hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous month"
            @click="prevMonth"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span class="text-sm font-medium text-on-surface">{{ monthName }}</span>
          <button
            type="button"
            class="w-8 h-8 flex items-center justify-center bg-transparent border-1 border-solid border-muted rounded-md text-on-surface cursor-pointer transition-colors duration-150 hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next month"
            :disabled="viewYear >= new Date(today).getFullYear() && viewMonth >= new Date(today).getMonth()"
            @click="nextMonth"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <div class="grid grid-cols-7 gap-1 mb-1">
          <div
            v-for="day in ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']"
            :key="day"
            class="text-xs text-center text-muted-foreground p-1"
          >
            {{ day }}
          </div>
        </div>

        <div class="grid grid-cols-7 gap-1">
          <button
            v-for="day in calendarDays"
            :key="day.date"
            type="button"
            class="day-button aspect-square flex items-center justify-center text-sm bg-transparent border-1 border-solid border-transparent rounded-md cursor-pointer transition-all duration-150"
            :class="{
              'bg-primary text-dark font-semibold border-primary': day.isSelected,
              'bg-primary-subtle border-primary-border font-semibold': day.isToday && !day.isSelected,
              'text-muted-foreground cursor-not-allowed': day.isFuture,
              'text-muted-foreground': !day.isCurrentMonth && !day.isFuture,
              'text-on-surface hover:bg-surface-hover hover:border-muted': day.isCurrentMonth && !day.isSelected && !day.isToday && !day.isFuture,
            }"
            :disabled="day.isFuture"
            @click="() => selectDate(day.date)"
          >
            {{ day.day }}
          </button>
        </div>

        <button
          v-if="!isToday"
          type="button"
          class="mt-3 w-full p-2 text-sm bg-primary-subtle border-1 border-solid border-primary-border rounded-lg text-on-surface cursor-pointer transition-colors duration-150 hover:bg-primary-muted"
          @click="goToToday"
        >
          Back to today
        </button>
      </div>
    </Transition>
  </div>
</template>

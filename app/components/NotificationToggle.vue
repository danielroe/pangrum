<script setup lang="ts">
const {
  settings,
  permission,
  isSupported,
  enableNotifications,
  disableNotifications,
  setNotificationTime,
} = useNotifications()

const isEnabled = computed(() => settings.value.enabled && permission.value === 'granted')

const iconClass = computed(() => isEnabled.value ? 'i-lucide-bell' : 'i-lucide-bell-off')
const label = computed(() => isEnabled.value ? 'Reminders on' : 'Reminders off')

async function toggleNotifications() {
  if (isEnabled.value) {
    disableNotifications()
  }
  else {
    await enableNotifications()
  }
}

function handleTimeChange(event: Event) {
  const target = event.target as HTMLInputElement
  setNotificationTime(target.value)
}
</script>

<template>
  <ClientOnly>
    <div
      v-if="isSupported"
      class="reminders-group hidden sm:flex items-center"
    >
      <button
        type="button"
        class="flex items-center gap-2 px-3 py-1 text-sm rounded-l-lg border-1 border-solid border-muted bg-surface hover:bg-surface-hover transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        :class="[isEnabled ? 'border-r-0' : 'rounded-r-lg']"
        :aria-pressed="isEnabled"
        @click="toggleNotifications"
      >
        <span
          :class="iconClass"
          class="text-sm"
          aria-hidden="true"
        />
        <span class="text-on-surface">{{ label }}</span>
      </button>
      <input
        v-if="isEnabled"
        type="time"
        :value="settings.time"
        class="px-2 py-1 text-sm font-mono rounded-r-lg border-1 border-solid border-muted bg-surface text-on-surface focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
        aria-label="Reminder time"
        @change="handleTimeChange"
      >
    </div>
    <template #fallback>
      <div class="hidden sm:block w-32 h-7 rounded-lg bg-surface border-1 border-solid border-muted" />
    </template>
  </ClientOnly>
</template>

<style scoped>
.reminders-group:has(button:focus) input {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px rgba(252, 211, 77, 0.5);
}

.reminders-group:has(input:focus) button {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 1px rgba(252, 211, 77, 0.5);
}
</style>

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
    <SettingsPopover
      v-if="isSupported"
      label="Notification settings"
      class="sm:hidden"
    >
      <template #icon>
        <span
          :class="iconClass"
          class="text-base"
          aria-hidden="true"
        />
      </template>
      <template #default>
        <div class="flex flex-col gap-3">
          <div class="text-sm font-medium text-on-surface">
            Daily Reminders
          </div>
          <button
            type="button"
            class="flex items-center justify-between gap-3 w-full px-3 py-2 text-sm text-on-surface border-1 border-solid border-muted bg-surface hover:bg-surface-hover transition-colors"
            @click="toggleNotifications"
          >
            <span>{{ isEnabled ? 'Enabled' : 'Disabled' }}</span>
            <span
              :class="iconClass"
              class="text-lg"
              aria-hidden="true"
            />
          </button>
          <div
            v-if="isEnabled"
            class="flex flex-col gap-2"
          >
            <label class="text-xs text-muted-foreground">Remind me at:</label>
            <input
              type="time"
              :value="settings.time"
              class="px-3 py-2 text-sm font-mono border-1 border-solid border-muted bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="Reminder time"
              @change="handleTimeChange"
            >
          </div>
        </div>
      </template>
    </SettingsPopover>
    <template #fallback>
      <div class="w-9 h-9 sm:hidden" />
    </template>
  </ClientOnly>

  <ClientOnly>
    <div
      v-if="isSupported"
      class="reminders-group hidden sm:flex items-center"
    >
      <button
        type="button"
        class="flex items-center gap-2 px-3 py-1 text-sm border-1 border-solid border-muted bg-surface hover:bg-surface-hover transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
        :class="{ 'border-r-0': isEnabled }"
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
        class="px-2 py-1 text-sm font-mono border-1 border-solid border-muted bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
        aria-label="Reminder time"
        @change="handleTimeChange"
      >
    </div>
    <template #fallback>
      <div class="hidden sm:block w-32 h-7 bg-surface border-1 border-solid border-muted" />
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

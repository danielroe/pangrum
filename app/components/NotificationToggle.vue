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

const icon = computed(() => isEnabled.value ? '🔔' : '🔕')

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
      :icon="icon"
      label="Notification settings"
      class="sm:hidden"
    >
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
            <span class="text-lg">{{ icon }}</span>
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
      class="hidden sm:flex items-center gap-3"
    >
      <button
        type="button"
        class="relative w-11 h-6 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
        :class="isEnabled ? 'bg-primary' : 'bg-muted-foreground'"
        role="switch"
        :aria-checked="isEnabled"
        aria-label="Enable daily reminder notifications"
        @click="toggleNotifications"
      >
        <span
          class="absolute inset-y-0.5 left-0.5 inline-block h-4 w-4 transform rounded-full bg-on-surface shadow transition duration-200 ease-in-out"
          :class="isEnabled ? 'translate-x-5' : 'translate-x-0'"
        />
      </button>
      <span class="text-sm text-on-surface whitespace-nowrap">
        Reminders
      </span>
      <input
        type="time"
        :value="settings.time"
        :disabled="!isEnabled"
        class="px-2 py-1 text-sm font-mono border-1 border-solid border-muted bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Reminder time"
        @change="handleTimeChange"
      >
    </div>
    <template #fallback>
      <div class="hidden sm:flex items-center gap-3">
        <div class="w-11 h-6 rounded-full bg-muted-foreground" />
        <span class="text-sm text-on-surface whitespace-nowrap">Reminders</span>
        <div class="w-20 h-7 bg-surface border-1 border-solid border-muted" />
      </div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
const colorMode = useColorMode()
const language = useLanguage()
const { startTutorial } = useTutorial()
const {
  settings: notificationSettings,
  permission,
  isSupported: notificationsSupported,
  enableNotifications,
  disableNotifications,
  setNotificationTime,
} = useNotifications()

const {
  syncCode,
  isEnabled: syncEnabled,
  isConnecting,
  canEnableSync,
  isUnavailable,
  inputCode,
  showInput,
  isWaitingForDevice,
  isSynced,
  statusText,
  syncUrl,
  qrSvg,
  resetInput,
  handleEnable,
  handleDisable,
  copyCode,
} = useSyncUI()

const isOpen = ref(false)
const activeSection = ref<'main' | 'theme' | 'language' | 'notifications' | 'sync'>('main')
const triggerRef = useTemplateRef<HTMLButtonElement>('trigger')
const popoverRef = useTemplateRef<HTMLDivElement>('popover')

const isNotificationsEnabled = computed(() => notificationSettings.value.enabled && permission.value === 'granted')

const themeOptions = {
  system: { label: 'System', iconClass: 'i-lucide-monitor' },
  light: { label: 'Light', iconClass: 'i-lucide-sun' },
  dark: { label: 'Dark', iconClass: 'i-lucide-moon' },
} as const

type ThemeKey = keyof typeof themeOptions

const currentThemeIcon = computed(() => {
  const pref = colorMode.preference as ThemeKey
  return themeOptions[pref]?.iconClass || 'i-lucide-monitor'
})

function toggle() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    activeSection.value = 'main'
    resetInput()
  }
}

function close() {
  isOpen.value = false
  activeSection.value = 'main'
}

function setTheme(value: string) {
  colorMode.preference = value
  activeSection.value = 'main'
}

function setLanguageValue(lang: Language) {
  language.value = lang
  activeSection.value = 'main'
}

async function toggleNotifications() {
  if (isNotificationsEnabled.value) {
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

function reloadPage() {
  window.location.reload()
}

onClickOutside(popoverRef, close, { ignore: [triggerRef] })
onKeyStroke('Escape', close)

// Sync icon classes for UnoCSS to detect
// i-lucide-cloud-off i-lucide-cloud text-primary animate-pulse opacity-50
const syncButtonIcon = computed(() => {
  if (!syncEnabled.value) return 'i-lucide-cloud-off'
  if (isUnavailable.value) return 'i-lucide-cloud-off opacity-50'
  if (isConnecting.value || isWaitingForDevice.value) return 'i-lucide-cloud text-primary animate-pulse'
  return 'i-lucide-cloud text-primary'
})
</script>

<template>
  <ClientOnly>
    <div class="relative">
      <!-- Mobile trigger (icon only) -->
      <button
        ref="trigger"
        type="button"
        class="w-8 h-8 flex sm:hidden items-center justify-center text-base rounded-lg border-1 border-solid border-muted bg-surface hover:bg-surface-hover transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ls:flex ls:w-7 ls:h-7"
        aria-label="Settings"
        :aria-expanded="isOpen"
        @click="toggle"
      >
        <span
          class="i-lucide-settings ls:text-sm"
          aria-hidden="true"
        />
      </button>
      <!-- Desktop trigger (icon + label) -->
      <button
        type="button"
        class="hidden sm:flex items-center gap-2 px-3 py-1 text-sm rounded-lg border-1 border-solid border-muted bg-surface hover:bg-surface-hover transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 ls:hidden"
        aria-label="Settings"
        :aria-expanded="isOpen"
        @click="toggle"
      >
        <span
          class="i-lucide-settings text-sm"
          aria-hidden="true"
        />
        <span class="text-on-surface">Settings</span>
      </button>
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="isOpen"
          ref="popover"
          class="absolute right-0 top-full mt-2 z-50 min-w-56 bg-surface-elevated rounded-xl border-1 border-solid border-muted shadow-xl overflow-hidden"
        >
          <!-- Main Menu -->
          <div
            v-if="activeSection === 'main'"
            class="p-2"
          >
            <div class="text-xs font-medium text-muted-foreground px-2 py-1 mb-1">
              Settings
            </div>

            <!-- Theme -->
            <button
              type="button"
              class="flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-lg hover:bg-surface-hover transition-colors text-on-surface"
              @click="activeSection = 'theme'"
            >
              <span class="flex items-center gap-3">
                <span
                  :class="currentThemeIcon"
                  class="text-base"
                  aria-hidden="true"
                />
                <span>Theme</span>
              </span>
              <span class="text-xs text-muted-foreground">{{ themeOptions[colorMode.preference as ThemeKey]?.label }}</span>
            </button>

            <!-- Language -->
            <button
              type="button"
              class="flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-lg hover:bg-surface-hover transition-colors text-on-surface"
              @click="activeSection = 'language'"
            >
              <span class="flex items-center gap-3">
                <span
                  class="i-lucide-globe text-base"
                  aria-hidden="true"
                />
                <span>Language</span>
              </span>
              <span class="text-xs text-muted-foreground">{{ SUPPORTED_LANGUAGES[language] }}</span>
            </button>

            <!-- Notifications (if supported) -->
            <button
              v-if="notificationsSupported"
              type="button"
              class="flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-lg hover:bg-surface-hover transition-colors text-on-surface"
              @click="activeSection = 'notifications'"
            >
              <span class="flex items-center gap-3">
                <span
                  :class="isNotificationsEnabled ? 'i-lucide-bell' : 'i-lucide-bell-off'"
                  class="text-base"
                  aria-hidden="true"
                />
                <span>Reminders</span>
              </span>
              <span class="text-xs text-muted-foreground">{{ isNotificationsEnabled ? 'On' : 'Off' }}</span>
            </button>

            <!-- Sync -->
            <button
              type="button"
              class="flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-lg hover:bg-surface-hover transition-colors text-on-surface"
              @click="activeSection = 'sync'"
            >
              <span class="flex items-center gap-3">
                <span
                  :class="syncButtonIcon"
                  class="text-base"
                  aria-hidden="true"
                />
                <span>Sync</span>
              </span>
              <span class="text-xs text-muted-foreground">{{ syncEnabled ? 'Connected' : 'Off' }}</span>
            </button>

            <!-- Tutorial -->
            <button
              type="button"
              class="flex items-center w-full px-3 py-2.5 text-sm rounded-lg hover:bg-surface-hover transition-colors text-on-surface"
              @click="() => { startTutorial(); close() }"
            >
              <span class="flex items-center gap-3">
                <span
                  class="i-lucide-circle-help text-base"
                  aria-hidden="true"
                />
                <span>How to play</span>
              </span>
            </button>

            <!-- Credits -->
            <div class="mt-2 pt-2 border-t border-solid border-muted">
              <div class="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 text-[10px] text-muted-foreground py-1">
                <span>made with <span class="text-error-light">&#9829;</span> by</span>
                <a
                  href="https://roe.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="hover:text-on-surface transition-colors"
                >daniel roe</a>
                <span aria-hidden="true">·</span>
                <span class="inline-flex items-center gap-1 font-mono opacity-60 hover:opacity-100 transition-opacity">
                  <a
                    :href="`https://github.com/danielroe/pangrum/commit/${$config.public.commitHash}`"
                    target="_blank"
                    rel="noopener noreferrer"
                  >{{ $config.public.commitHash }}</a>
                  <button
                    type="button"
                    title="Refresh app to get latest version"
                    @click="reloadPage"
                  >
                    <span
                      class="i-lucide-refresh-cw text-[10px]"
                      aria-hidden="true"
                    />
                    <span class="sr-only">Refresh app</span>
                  </button>
                </span>
              </div>
            </div>
          </div>

          <!-- Theme Section -->
          <div
            v-else-if="activeSection === 'theme'"
            class="p-2"
          >
            <button
              type="button"
              class="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-muted-foreground hover:text-on-surface transition-colors"
              @click="activeSection = 'main'"
            >
              <span
                class="i-lucide-chevron-left text-sm"
                aria-hidden="true"
              />
              <span>Theme</span>
            </button>
            <div class="mt-1 space-y-1">
              <button
                v-for="(opt, value) in themeOptions"
                :key="value"
                type="button"
                class="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg border-1 border-solid transition-colors"
                :class="colorMode.preference === value
                  ? 'bg-primary-subtle border-primary-border text-on-surface'
                  : 'bg-transparent border-transparent hover:bg-surface-hover text-on-surface'"
                @click="setTheme(value)"
              >
                <span
                  :class="opt.iconClass"
                  class="text-base"
                  aria-hidden="true"
                />
                <span>{{ opt.label }}</span>
              </button>
            </div>
          </div>

          <!-- Language Section -->
          <div
            v-else-if="activeSection === 'language'"
            class="p-2"
          >
            <button
              type="button"
              class="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-muted-foreground hover:text-on-surface transition-colors"
              @click="activeSection = 'main'"
            >
              <span
                class="i-lucide-chevron-left text-sm"
                aria-hidden="true"
              />
              <span>Language</span>
            </button>
            <div class="mt-1 space-y-1">
              <button
                v-for="(label, lang) in SUPPORTED_LANGUAGES"
                :key="lang"
                type="button"
                class="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg border-1 border-solid transition-colors"
                :class="language === lang
                  ? 'bg-primary-subtle border-primary-border text-on-surface'
                  : 'bg-transparent border-transparent hover:bg-surface-hover text-on-surface'"
                @click="setLanguageValue(lang)"
              >
                {{ label }}
              </button>
            </div>
          </div>

          <!-- Notifications Section -->
          <div
            v-else-if="activeSection === 'notifications'"
            class="p-2"
          >
            <button
              type="button"
              class="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-muted-foreground hover:text-on-surface transition-colors"
              @click="activeSection = 'main'"
            >
              <span
                class="i-lucide-chevron-left text-sm"
                aria-hidden="true"
              />
              <span>Reminders</span>
            </button>
            <div class="mt-2 space-y-2 px-1">
              <button
                type="button"
                class="flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-lg text-on-surface border-1 border-solid border-muted bg-surface hover:bg-surface-hover transition-colors"
                @click="toggleNotifications"
              >
                <span>{{ isNotificationsEnabled ? 'Enabled' : 'Disabled' }}</span>
                <span
                  :class="isNotificationsEnabled ? 'i-lucide-bell' : 'i-lucide-bell-off'"
                  class="text-lg"
                  aria-hidden="true"
                />
              </button>
              <div
                v-if="isNotificationsEnabled"
                class="flex flex-col gap-2"
              >
                <label class="text-xs text-muted-foreground">Remind me at:</label>
                <input
                  type="time"
                  :value="notificationSettings.time"
                  class="px-3 py-2 text-sm font-mono rounded-lg border-1 border-solid border-muted bg-surface text-on-surface focus-visible:outline-2 focus-visible:outline-primary"
                  aria-label="Reminder time"
                  @change="handleTimeChange"
                >
              </div>
            </div>
          </div>

          <!-- Sync Section -->
          <div
            v-else-if="activeSection === 'sync'"
            class="p-2"
          >
            <button
              type="button"
              class="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-muted-foreground hover:text-on-surface transition-colors"
              @click="activeSection = 'main'"
            >
              <span
                class="i-lucide-chevron-left text-sm"
                aria-hidden="true"
              />
              <span>Sync</span>
            </button>
            <div class="mt-2 space-y-3 px-1">
              <template v-if="syncEnabled">
                <!-- Status indicator -->
                <div
                  v-if="isUnavailable"
                  class="flex items-center gap-2 p-2 rounded-lg bg-surface border-1 border-solid border-muted"
                >
                  <span class="i-lucide-cloud-off text-on-surface opacity-50 text-sm" />
                  <span class="text-xs text-on-surface opacity-70">Offline - sync paused</span>
                </div>
                <div
                  v-else-if="isConnecting"
                  class="flex items-center gap-2 p-2 rounded-lg bg-primary-subtle"
                >
                  <span class="i-lucide-loader-2 animate-spin text-primary text-sm" />
                  <span class="text-xs text-on-surface">Connecting...</span>
                </div>
                <div
                  v-else-if="isWaitingForDevice"
                  class="flex items-center gap-2 p-2 rounded-lg bg-primary-subtle"
                >
                  <span class="i-lucide-loader-2 animate-spin text-primary text-sm" />
                  <span class="text-xs text-on-surface">Waiting for device...</span>
                </div>
                <div
                  v-else-if="isSynced"
                  class="flex items-center gap-2 p-2 rounded-lg bg-success-bg"
                >
                  <span class="i-lucide-check-circle text-success text-sm" />
                  <span class="text-xs text-on-surface">{{ statusText }}</span>
                </div>

                <!-- QR Code & Code -->
                <div class="flex flex-col gap-2">
                  <p class="text-xs text-on-surface opacity-70">
                    Scan or enter code on another device:
                  </p>
                  <div
                    v-if="qrSvg"
                    class="flex justify-center"
                  >
                    <a
                      :href="syncUrl"
                      target="_blank"
                      class="block p-2 bg-white rounded-lg"
                      title="Open sync link"
                    >
                      <!-- eslint-disable vue/no-v-html -->
                      <div
                        class="w-24 h-24 [&>svg]:w-full [&>svg]:h-full"
                        v-html="qrSvg"
                      />
                    </a>
                  </div>
                  <div class="flex items-center gap-2">
                    <code class="flex-1 px-3 py-2 bg-surface rounded-lg text-sm font-mono tracking-wider text-center text-on-surface border-1 border-solid border-muted">
                      {{ syncCode }}
                    </code>
                    <button
                      type="button"
                      class="p-2 rounded-lg bg-surface hover:bg-surface-hover border-1 border-solid border-muted transition-colors"
                      title="Copy code"
                      @click="copyCode"
                    >
                      <span class="i-lucide-copy text-sm text-on-surface" />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  class="w-full px-3 py-2 text-sm rounded-lg border-1 border-solid border-muted bg-surface hover:bg-surface-hover text-on-surface transition-colors"
                  @click="() => { handleDisable(); close() }"
                >
                  Disconnect
                </button>
              </template>

              <template v-else>
                <p class="text-xs text-on-surface opacity-70">
                  Sync your found words across devices in real-time.
                </p>
                <div
                  v-if="!canEnableSync"
                  class="flex items-center gap-2 p-2 rounded-lg bg-surface border-1 border-solid border-muted"
                >
                  <span class="i-lucide-wifi-off text-on-surface opacity-50 text-sm" />
                  <span class="text-xs text-on-surface opacity-70">You're offline</span>
                </div>

                <div
                  v-if="showInput"
                  class="flex flex-col gap-2"
                >
                  <input
                    v-model="inputCode"
                    type="text"
                    placeholder="Enter sync code"
                    class="w-full px-3 py-2 text-sm rounded-lg border-1 border-solid border-muted bg-surface text-on-surface placeholder:text-on-surface/50 focus:outline-2 focus:outline-primary disabled:opacity-50"
                    maxlength="20"
                    :disabled="!canEnableSync"
                    @keyup.enter="() => { if (canEnableSync) { handleEnable(); close() } }"
                  >
                  <div class="flex gap-2">
                    <button
                      type="button"
                      class="flex-1 px-3 py-2 text-sm rounded-lg border-1 border-solid border-muted bg-surface hover:bg-surface-hover text-on-surface transition-colors"
                      @click="showInput = false"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      class="flex-1 px-3 py-2 text-sm rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      :disabled="!inputCode.trim() || !canEnableSync"
                      @click="() => { handleEnable(); close() }"
                    >
                      Connect
                    </button>
                  </div>
                </div>

                <div
                  v-else
                  class="flex flex-col gap-2"
                >
                  <button
                    type="button"
                    class="w-full px-3 py-2 text-sm rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="!canEnableSync"
                    @click="handleEnable"
                  >
                    Create new sync
                  </button>
                  <button
                    type="button"
                    class="w-full px-3 py-2 text-sm rounded-lg border-1 border-solid border-muted bg-surface hover:bg-surface-hover text-on-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="!canEnableSync"
                    @click="showInput = true"
                  >
                    Join existing sync
                  </button>
                </div>
              </template>
            </div>
          </div>
        </div>
      </Transition>
    </div>
    <template #fallback>
      <div class="w-8 h-8 sm:hidden rounded-lg border-1 border-solid border-muted bg-surface" />
      <div class="hidden sm:block w-24 h-7 rounded-lg border-1 border-solid border-muted bg-surface" />
    </template>
  </ClientOnly>
</template>

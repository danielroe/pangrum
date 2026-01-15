<script setup lang="ts">
const { t, locale, locales, setLocale } = useI18n()

const colorMode = useColorMode()
const puzzleLanguage = useLanguage()
const { startTutorial } = useTutorial()

const availableUILocales = computed(() =>
  (locales.value as Array<{ code: string, name: string }>).map(l => ({
    code: l.code,
    name: l.name,
  })),
)
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
const activeSection = ref<'main' | 'theme' | 'ui-language' | 'puzzle-language' | 'notifications' | 'sync'>('main')
const triggerRef = useTemplateRef<HTMLButtonElement>('trigger')
const popoverRef = useTemplateRef<HTMLDivElement>('popover')

const isNotificationsEnabled = computed(() => notificationSettings.value.enabled && permission.value === 'granted')

const themeOptions = computed(() => ({
  system: { label: t('settings.theme.system'), iconClass: 'i-lucide-monitor' },
  light: { label: t('settings.theme.light'), iconClass: 'i-lucide-sun' },
  dark: { label: t('settings.theme.dark'), iconClass: 'i-lucide-moon' },
}))

type ThemeKey = 'system' | 'light' | 'dark'

const currentThemeIcon = computed(() => {
  const pref = colorMode.preference as ThemeKey
  return themeOptions.value[pref]?.iconClass || 'i-lucide-monitor'
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

function setPuzzleLanguageValue(lang: Language) {
  puzzleLanguage.value = lang
  activeSection.value = 'main'
}

async function setUILocale(code: string) {
  // @ts-expect-error - i18n types are strict but code is validated by availableUILocales
  await setLocale(code)
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
        <span class="text-on-surface">{{ t('header.settings') }}</span>
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
          class="absolute right-0 top-full mt-2 z-50 min-w-72 bg-surface-elevated rounded-xl border-1 border-solid border-muted shadow-xl overflow-hidden"
        >
          <!-- Main Menu -->
          <div
            v-if="activeSection === 'main'"
            class="p-2"
          >
            <div class="text-xs font-medium text-muted-foreground px-2 py-1 mb-1">
              {{ t('settings.title') }}
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
                <span>{{ t('settings.theme.label') }}</span>
              </span>
              <span class="text-xs text-muted-foreground">{{ themeOptions[colorMode.preference as ThemeKey]?.label }}</span>
            </button>

            <!-- UI Language -->
            <button
              type="button"
              class="flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-lg hover:bg-surface-hover transition-colors text-on-surface"
              @click="activeSection = 'ui-language'"
            >
              <span class="flex items-center gap-3">
                <span
                  class="i-lucide-globe text-base"
                  aria-hidden="true"
                />
                <span>{{ t('settings.language.label') }}</span>
              </span>
              <span class="text-xs text-muted-foreground">{{ availableUILocales.find(l => l.code === locale)?.name }}</span>
            </button>

            <!-- Puzzle Language -->
            <button
              type="button"
              class="flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-lg hover:bg-surface-hover transition-colors text-on-surface"
              @click="activeSection = 'puzzle-language'"
            >
              <span class="flex items-center gap-3">
                <span
                  class="i-lucide-book-text text-base"
                  aria-hidden="true"
                />
                <span>{{ t('settings.puzzleLanguage.label') }}</span>
              </span>
              <span class="text-xs text-muted-foreground">{{ SUPPORTED_LANGUAGES[puzzleLanguage] }}</span>
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
                <span>{{ t('settings.notifications.label') }}</span>
              </span>
              <span class="text-xs text-muted-foreground">{{ isNotificationsEnabled ? t('settings.notifications.on') : t('settings.notifications.off') }}</span>
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
                <span>{{ t('settings.sync.label') }}</span>
              </span>
              <span class="text-xs text-muted-foreground">{{ syncEnabled ? t('settings.sync.connected') : t('settings.sync.off') }}</span>
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
                <span>{{ t('settings.howToPlay') }}</span>
              </span>
            </button>

            <!-- Credits -->
            <div class="mt-2 pt-2 border-t border-solid border-muted">
              <div class="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5 text-[10px] text-muted-foreground py-1">
                <span>{{ t('footer.madeWith') }} <span class="text-error-light">&#9829;</span> {{ t('footer.by') }}</span>
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
                    :title="t('footer.refreshApp')"
                    @click="reloadPage"
                  >
                    <span
                      class="i-lucide-refresh-cw text-[10px]"
                      aria-hidden="true"
                    />
                    <span class="sr-only">{{ t('footer.refreshApp') }}</span>
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
              <span>{{ t('settings.theme.label') }}</span>
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

          <!-- UI Language Section -->
          <div
            v-else-if="activeSection === 'ui-language'"
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
              <span>{{ t('settings.language.label') }}</span>
            </button>
            <div class="mt-1 space-y-1">
              <button
                v-for="loc in availableUILocales"
                :key="loc.code"
                type="button"
                class="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg border-1 border-solid transition-colors"
                :class="locale === loc.code
                  ? 'bg-primary-subtle border-primary-border text-on-surface'
                  : 'bg-transparent border-transparent hover:bg-surface-hover text-on-surface'"
                @click="setUILocale(loc.code)"
              >
                {{ loc.name }}
              </button>
            </div>
          </div>

          <!-- Puzzle Language Section -->
          <div
            v-else-if="activeSection === 'puzzle-language'"
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
              <span>{{ t('settings.puzzleLanguage.label') }}</span>
            </button>
            <p class="text-xs text-muted-foreground px-3 py-2">
              {{ t('settings.puzzleLanguage.description') }}
            </p>
            <div class="mt-1 space-y-1">
              <button
                v-for="(label, lang) in SUPPORTED_LANGUAGES"
                :key="lang"
                type="button"
                class="flex items-center gap-3 w-full px-3 py-2.5 text-sm rounded-lg border-1 border-solid transition-colors"
                :class="puzzleLanguage === lang
                  ? 'bg-primary-subtle border-primary-border text-on-surface'
                  : 'bg-transparent border-transparent hover:bg-surface-hover text-on-surface'"
                @click="setPuzzleLanguageValue(lang)"
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
              <span>{{ t('settings.notifications.label') }}</span>
            </button>
            <div class="mt-2 space-y-2 px-1">
              <button
                type="button"
                class="flex items-center justify-between w-full px-3 py-2.5 text-sm rounded-lg text-on-surface border-1 border-solid border-muted bg-surface hover:bg-surface-hover transition-colors"
                @click="toggleNotifications"
              >
                <span>{{ isNotificationsEnabled ? t('settings.notifications.enabled') : t('settings.notifications.disabled') }}</span>
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
                <label class="text-xs text-muted-foreground">{{ t('settings.notifications.remindAt') }}</label>
                <input
                  type="time"
                  :value="notificationSettings.time"
                  class="px-3 py-2 text-sm font-mono rounded-lg border-1 border-solid border-muted bg-surface text-on-surface focus-visible:outline-2 focus-visible:outline-primary"
                  :aria-label="t('settings.notifications.remindAt')"
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
              <span>{{ t('settings.sync.label') }}</span>
            </button>
            <div class="mt-2 space-y-3 px-1">
              <template v-if="syncEnabled">
                <!-- Status indicator -->
                <div
                  v-if="isUnavailable"
                  class="flex items-center gap-2 p-2 rounded-lg bg-surface border-1 border-solid border-muted"
                >
                  <span class="i-lucide-cloud-off text-on-surface opacity-50 text-sm" />
                  <span class="text-xs text-on-surface opacity-70">{{ t('settings.sync.offline') }}</span>
                </div>
                <div
                  v-else-if="isConnecting"
                  class="flex items-center gap-2 p-2 rounded-lg bg-primary-subtle"
                >
                  <span class="i-lucide-loader-2 animate-spin text-primary text-sm" />
                  <span class="text-xs text-on-surface">{{ t('settings.sync.connecting') }}</span>
                </div>
                <div
                  v-else-if="isWaitingForDevice"
                  class="flex items-center gap-2 p-2 rounded-lg bg-primary-subtle"
                >
                  <span class="i-lucide-loader-2 animate-spin text-primary text-sm" />
                  <span class="text-xs text-on-surface">{{ t('settings.sync.waitingForDevice') }}</span>
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
                    {{ t('settings.sync.scanOrEnter') }}
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
                      :title="t('settings.sync.copyCode')"
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
                  {{ t('settings.sync.disconnect') }}
                </button>
              </template>

              <template v-else>
                <p class="text-xs text-on-surface opacity-70">
                  {{ t('settings.sync.description') }}
                </p>
                <div
                  v-if="!canEnableSync"
                  class="flex items-center gap-2 p-2 rounded-lg bg-surface border-1 border-solid border-muted"
                >
                  <span class="i-lucide-wifi-off text-on-surface opacity-50 text-sm" />
                  <span class="text-xs text-on-surface opacity-70">{{ t('settings.sync.youreOffline') }}</span>
                </div>

                <div
                  v-if="showInput"
                  class="flex flex-col gap-2"
                >
                  <input
                    v-model="inputCode"
                    type="text"
                    :placeholder="t('settings.sync.enterCode')"
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
                      {{ t('settings.sync.cancel') }}
                    </button>
                    <button
                      type="button"
                      class="flex-1 px-3 py-2 text-sm rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      :disabled="!inputCode.trim() || !canEnableSync"
                      @click="() => { handleEnable(); close() }"
                    >
                      {{ t('settings.sync.connect') }}
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
                    {{ t('settings.sync.createNew') }}
                  </button>
                  <button
                    type="button"
                    class="w-full px-3 py-2 text-sm rounded-lg border-1 border-solid border-muted bg-surface hover:bg-surface-hover text-on-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="!canEnableSync"
                    @click="showInput = true"
                  >
                    {{ t('settings.sync.joinExisting') }}
                  </button>
                </div>
              </template>
            </div>
          </div>
        </div>
      </Transition>
    </div>
    <template #fallback>
      <!-- Mobile skeleton -->
      <div class="w-8 h-8 sm:hidden rounded-lg border-1 border-solid border-muted bg-surface ls:flex ls:w-7 ls:h-7" />
      <!-- Desktop skeleton -->
      <div class="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-surface border-1 border-solid border-muted ls:hidden">
        <div class="w-4 h-4 rounded bg-muted animate-pulse" />
        <div class="w-14 h-4 rounded bg-muted animate-pulse" />
      </div>
    </template>
  </ClientOnly>
</template>

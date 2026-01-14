<script setup lang="ts">
const {
  syncCode,
  isEnabled,
  inputCode,
  showInput,
  isWaitingForDevice,
  isSynced,
  statusText,
  buttonIcon,
  syncUrl,
  qrSvg,
  resetInput,
  handleEnable,
  handleDisable,
  copyCode,
} = useSyncUI()

// possible values for buttonIcon, listed here for unocss to pick them up:
// i-lucide-cloud-off i-lucide-cloud text-primary animate-pulse
</script>

<template>
  <ClientOnly>
    <SettingsPopover
      label="Sync"
      class="sm:hidden"
      @vue:mounted="resetInput"
    >
      <template #icon>
        <span
          class="text-base"
          :class="buttonIcon"
          aria-hidden="true"
        />
      </template>
      <template #default="{ close }">
        <div class="flex flex-col gap-3 min-w-56">
          <div class="text-sm font-medium text-on-surface">
            Cross-device sync
          </div>

          <template v-if="isEnabled">
            <!-- Status indicator -->
            <div
              v-if="isWaitingForDevice"
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

            <!-- Sync is enabled - show code and disconnect option -->
            <div class="flex flex-col gap-2">
              <p class="text-xs text-on-surface opacity-70">
                Scan or enter code on another device:
              </p>

              <!-- QR Code -->
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
            <!-- Sync is disabled - show enable options -->
            <p class="text-xs text-on-surface opacity-70">
              Sync your found words across devices in real-time.
            </p>

            <div
              v-if="showInput"
              class="flex flex-col gap-2"
            >
              <input
                v-model="inputCode"
                type="text"
                placeholder="Enter sync code"
                class="w-full px-3 py-2 text-sm rounded-lg border-1 border-solid border-muted bg-surface text-on-surface placeholder:text-on-surface/50 focus:outline-2 focus:outline-primary"
                maxlength="20"
                @keyup.enter="() => { handleEnable(); close() }"
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
                  class="flex-1 px-3 py-2 text-sm rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors"
                  :disabled="!inputCode.trim()"
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
                class="w-full px-3 py-2 text-sm rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors"
                @click="handleEnable"
              >
                Create new sync
              </button>
              <button
                type="button"
                class="w-full px-3 py-2 text-sm rounded-lg border-1 border-solid border-muted bg-surface hover:bg-surface-hover text-on-surface transition-colors"
                @click="showInput = true"
              >
                Join existing sync
              </button>
            </div>
          </template>
        </div>
      </template>
    </SettingsPopover>
    <template #fallback>
      <div class="w-9 h-9 sm:hidden rounded-lg border-1 border-solid border-muted bg-surface" />
    </template>
  </ClientOnly>

  <!-- Desktop button -->
  <ClientOnly>
    <SyncToggleDesktop />
    <template #fallback>
      <div class="hidden sm:block w-20 h-7 rounded-lg bg-surface border-1 border-solid border-muted" />
    </template>
  </ClientOnly>
</template>

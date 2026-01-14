<script setup lang="ts">
const {
  syncCode,
  isEnabled,
  isConnecting,
  canEnableSync,
  isUnavailable,
  inputCode,
  showInput,
  isWaitingForDevice,
  isSynced,
  statusText,
  buttonLabel,
  buttonIcon,
  syncUrl,
  qrSvg,
  resetInput,
  handleEnable,
  handleDisable,
  copyCode,
} = useSyncUI()

const showModal = ref(false)

onKeyStroke('Escape', () => {
  if (showModal.value) {
    showModal.value = false
  }
})

function openModal() {
  resetInput()
  showModal.value = true
}

function closeAndDisable() {
  handleDisable()
  showModal.value = false
}
</script>

<template>
  <button
    type="button"
    class="hidden sm:flex items-center gap-2 px-3 py-1 text-sm rounded-lg border-1 border-solid transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
    :class="isEnabled
      ? 'border-primary-border bg-primary-subtle hover:bg-primary-muted'
      : 'border-muted bg-surface hover:bg-surface-hover'"
    @click="openModal"
  >
    <span
      class="text-sm"
      :class="buttonIcon"
      aria-hidden="true"
    />
    <span class="text-on-surface">{{ buttonLabel }}</span>
  </button>

  <!-- Modal -->
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="showModal = false"
      >
        <div class="bg-surface-elevated rounded-xl border-1 border-solid border-muted shadow-2xl p-6 w-full max-w-sm">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-on-surface">
              Cross-device sync
            </h2>
            <button
              type="button"
              class="p-1 rounded-lg hover:bg-surface-hover transition-colors"
              @click="showModal = false"
            >
              <span class="i-lucide-x text-lg text-on-surface" />
            </button>
          </div>

          <template v-if="isEnabled">
            <div class="flex flex-col gap-4">
              <div
                v-if="isUnavailable"
                class="flex items-center gap-2 p-3 rounded-lg bg-surface border-1 border-solid border-muted"
              >
                <span class="i-lucide-cloud-off text-on-surface opacity-50" />
                <span class="text-sm text-on-surface opacity-70">Offline - sync paused</span>
              </div>
              <div
                v-else-if="isConnecting"
                class="flex items-center gap-2 p-3 rounded-lg bg-primary-subtle border-1 border-solid border-primary-border"
              >
                <span class="i-lucide-loader-2 animate-spin text-primary" />
                <span class="text-sm text-on-surface">Connecting to sync server...</span>
              </div>
              <div
                v-else-if="isWaitingForDevice"
                class="flex items-center gap-2 p-3 rounded-lg bg-primary-subtle border-1 border-solid border-primary-border"
              >
                <span class="i-lucide-loader-2 animate-spin text-primary" />
                <span class="text-sm text-on-surface">Waiting for another device to connect...</span>
              </div>
              <div
                v-else-if="isSynced"
                class="flex items-center gap-2 p-3 rounded-lg bg-success-bg border-1 border-solid border-success/30"
              >
                <span class="i-lucide-check-circle text-success" />
                <span class="text-sm text-on-surface">{{ statusText }}</span>
              </div>

              <p class="text-sm text-on-surface opacity-70">
                {{ isSynced ? 'Your progress is syncing across devices.' : 'Scan QR code or enter this code on another device:' }}
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
                    class="w-32 h-32 [&>svg]:w-full [&>svg]:h-full"
                    v-html="qrSvg"
                  />
                </a>
              </div>

              <div class="flex items-center gap-2">
                <code class="flex-1 px-4 py-3 bg-surface rounded-lg text-lg font-mono tracking-widest text-center text-on-surface border-1 border-solid border-muted">
                  {{ syncCode }}
                </code>
                <button
                  type="button"
                  class="p-3 rounded-lg bg-surface hover:bg-surface-hover border-1 border-solid border-muted transition-colors"
                  title="Copy code"
                  @click="copyCode"
                >
                  <span class="i-lucide-copy text-on-surface" />
                </button>
              </div>
              <button
                type="button"
                class="w-full px-4 py-2 text-sm rounded-lg border-1 border-solid border-muted bg-surface hover:bg-surface-hover text-on-surface transition-colors"
                @click="closeAndDisable"
              >
                Disconnect
              </button>
            </div>
          </template>

          <template v-else>
            <!-- Sync is disabled -->
            <div class="flex flex-col gap-4">
              <p class="text-sm text-on-surface opacity-70">
                Sync your found words across devices in real-time. Words you find on one device will instantly appear on others.
              </p>

              <div
                v-if="!canEnableSync"
                class="flex items-center gap-2 p-3 rounded-lg bg-surface border-1 border-solid border-muted"
              >
                <span class="i-lucide-wifi-off text-on-surface opacity-50" />
                <span class="text-sm text-on-surface opacity-70">You're offline. Connect to the internet to enable sync.</span>
              </div>

              <div
                v-if="showInput"
                class="flex flex-col gap-3"
              >
                <input
                  v-model="inputCode"
                  type="text"
                  placeholder="Enter sync code"
                  class="w-full px-4 py-3 text-sm rounded-lg border-1 border-solid border-muted bg-surface text-on-surface placeholder:text-on-surface/50 focus:outline-2 focus:outline-primary text-center font-mono tracking-wider disabled:opacity-50"
                  maxlength="20"
                  autofocus
                  :disabled="!canEnableSync"
                  @keyup.enter="() => { if (canEnableSync) handleEnable() }"
                >
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="flex-1 px-4 py-2 text-sm rounded-lg border-1 border-solid border-muted bg-surface hover:bg-surface-hover text-on-surface transition-colors"
                    @click="showInput = false"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    class="flex-1 px-4 py-2 text-sm rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="!inputCode.trim() || !canEnableSync"
                    @click="handleEnable"
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
                  class="w-full px-4 py-3 text-sm rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="!canEnableSync"
                  @click="handleEnable"
                >
                  Create new sync
                </button>
                <button
                  type="button"
                  class="w-full px-4 py-2 text-sm rounded-lg border-1 border-solid border-muted bg-surface hover:bg-surface-hover text-on-surface transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  :disabled="!canEnableSync"
                  @click="showInput = true"
                >
                  Join existing sync
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

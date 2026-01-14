import { renderSVG } from 'uqr'

export function useSyncUI() {
  const { syncCode, isEnabled, enable, disable } = useSyncCode()
  const { connectedDevices, isConnected, isConnecting, connectionError, hasEverSynced } = useSyncState()
  const isOnline = useOnline()

  const inputCode = ref('')
  const showInput = ref(false)

  const canEnableSync = computed(() => isOnline.value)

  const isUnavailable = computed(() =>
    !isOnline.value || (isEnabled.value && !isConnected.value && !isConnecting.value && connectionError.value !== null),
  )

  function resetInput() {
    inputCode.value = ''
    showInput.value = false
  }

  function handleEnable() {
    if (showInput.value && inputCode.value.trim()) {
      enable(inputCode.value.trim())
    }
    else {
      enable()
    }
  }

  function handleJoinEnable() {
    if (inputCode.value.trim()) {
      enable(inputCode.value.trim())
    }
  }

  function handleDisable() {
    disable()
  }

  function copyCode() {
    if (syncCode.value) {
      navigator.clipboard.writeText(syncCode.value)
    }
  }

  // Waiting for another device if connected but no device has ever synced data
  const isWaitingForDevice = computed(() => isConnected.value && !hasEverSynced.value)
  // Show "synced" state when data has been synced
  const isSynced = computed(() => isConnected.value && hasEverSynced.value)
  // Other devices count (subtract self)
  const otherDevices = computed(() => Math.max(0, connectedDevices.value - 1))

  const statusText = computed(() => {
    if (otherDevices.value > 0) {
      return `${otherDevices.value} other device${otherDevices.value > 1 ? 's' : ''} connected`
    }
    return 'Synced'
  })

  const buttonLabel = computed(() => {
    if (!isEnabled.value) return 'Sync'
    if (isUnavailable.value) return 'Offline'
    if (isConnecting.value) return 'Connecting...'
    if (isWaitingForDevice.value) return 'Waiting...'
    return 'Synced'
  })

  const buttonIcon = computed(() => {
    if (!isEnabled.value) return 'i-lucide-cloud-off'
    if (isUnavailable.value) return 'i-lucide-cloud-off opacity-50'
    if (isConnecting.value) return 'i-lucide-cloud text-primary animate-pulse'
    if (isWaitingForDevice.value) return 'i-lucide-cloud text-primary animate-pulse'
    return 'i-lucide-cloud text-primary'
  })

  // QR code for sync URL
  const syncUrl = computed(() => {
    if (!syncCode.value || !import.meta.client) return ''
    const url = new URL(window.location.href)
    url.search = ''
    url.searchParams.set('sync', syncCode.value)
    return url.toString()
  })

  const qrSvg = computed(() => {
    if (!syncUrl.value) return ''
    return renderSVG(syncUrl.value, { border: 1 })
  })

  return {
    // State
    syncCode,
    isEnabled,
    isOnline,
    isConnecting,
    canEnableSync,
    isUnavailable,
    inputCode,
    showInput,
    isWaitingForDevice,
    isSynced,
    otherDevices,
    statusText,
    buttonLabel,
    buttonIcon,
    syncUrl,
    qrSvg,

    // Actions
    resetInput,
    handleEnable,
    handleJoinEnable,
    handleDisable,
    copyCode,
  }
}

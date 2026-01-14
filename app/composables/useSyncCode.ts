/**
 * Composable for managing the sync code used for cross-device progress sync.
 * The sync code is a user-chosen or generated identifier that links devices together.
 */
export function useSyncCode() {
  const syncCode = useLocalStorage<string | null>('pangrum-sync-code', null, {
    initOnMounted: true,
  })

  const isEnabled = computed(() => syncCode.value !== null && syncCode.value.length > 0)

  function generateCode(): string {
    // Exclude confusing chars: i, l, o, 0, 1
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)]
    }
    return code
  }

  function enable(code?: string) {
    syncCode.value = code?.toLowerCase().trim() || generateCode()
  }

  function disable() {
    syncCode.value = null
    localStorage.removeItem('pangrum-has-synced')
  }

  // Check for ?sync= URL parameter on mount and auto-join
  if (import.meta.client) {
    onNuxtReady(() => {
      const url = new URL(window.location.href)
      const syncParam = url.searchParams.get('sync')
      if (syncParam) {
        // Join the sync with the provided code
        enable(syncParam)
        // Clean up URL (remove ?sync= param)
        url.searchParams.delete('sync')
        window.history.replaceState({}, '', url.pathname + url.search + url.hash)
        addToast({
          message: 'Joined sync from link',
          type: 'success',
        })
      }
    })
  }

  return {
    syncCode: readonly(syncCode),
    isEnabled,
    enable,
    disable,
    generateCode,
  }
}

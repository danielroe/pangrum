import { generateSyncCode } from '../utils/sync'

export function useSyncCode() {
  const { t } = useI18n()
  const syncCode = useLocalStorage<string | null>('pangrum-sync-code', null, {
    initOnMounted: true,
  })

  const isEnabled = computed(() => syncCode.value !== null && syncCode.value.length > 0)

  function enable(code?: string) {
    syncCode.value = code?.toLowerCase().trim() || generateSyncCode()
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
          message: t('settings.syncToasts.joinedFromLink'),
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
    generateCode: generateSyncCode,
  }
}

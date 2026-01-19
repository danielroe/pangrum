import PartySocket from 'partysocket'

interface SyncAllMessage {
  type: 'sync-all'
  puzzles: Record<string, string[]> // { puzzleKey: words[] }
  currentPuzzle?: { puzzleKey: string, date: string, lang: string } // The puzzle the client is currently viewing
  lastActivePuzzle?: { puzzleKey: string, date: string, lang: string } // Most recently played puzzle (server -> client only)
}

interface SyncPuzzleMessage {
  type: 'sync-puzzle'
  puzzleKey: string
  words: string[]
}

interface WordMessage {
  type: 'word'
  puzzleKey: string
  word: string
  date?: string // Date of the puzzle (YYYY-MM-DD)
}

interface SyncStatusMessage {
  type: 'sync-status'
  count: number
  hasEverSynced: boolean
}

type ServerMessage = SyncAllMessage | SyncPuzzleMessage | WordMessage | SyncStatusMessage

function getAllLocalPuzzles(): Record<string, string[]> {
  const puzzles: Record<string, string[]> = {}

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key) continue

    // Match keys like "pangrum-en-2024-01-14" but NOT "pangrum-en-incorrect-..." or old letter-based keys
    if (key.startsWith(STORAGE_PREFIX) && !key.includes(STORAGE_INCORRECT_MARKER)) {
      const puzzleKey = key.slice(STORAGE_PREFIX.length) // "en-2024-01-14"

      // Only include date-based keys, skip old letter-based format (e.g., "en-ABCDEFG")
      if (!DATE_KEY_PATTERN.test(puzzleKey)) continue

      try {
        const value = localStorage.getItem(key)
        if (value) {
          const words = JSON.parse(value) as string[]
          if (Array.isArray(words) && words.length > 0) {
            puzzles[puzzleKey] = words
          }
        }
      }
      catch {
        // Ignore parse errors
      }
    }
  }

  return puzzles
}

function savePuzzleToLocal(puzzleKey: string, words: string[]): void {
  const key = `${STORAGE_PREFIX}${puzzleKey}`
  localStorage.setItem(key, JSON.stringify(words))
}

function getPuzzleFromLocal(puzzleKey: string): string[] {
  const key = `${STORAGE_PREFIX}${puzzleKey}`
  try {
    const value = localStorage.getItem(key)
    if (value) {
      const words = JSON.parse(value)
      if (Array.isArray(words)) {
        return words
      }
    }
  }
  catch {
    // Ignore parse errors
  }
  return []
}

export interface UseSyncOptions {
  /** Current puzzle key (e.g., "en-ABCDEFG") */
  currentPuzzleKey: MaybeRefOrGetter<string>
  /** Current local words ref for the active puzzle (for reactivity) */
  currentWords: Ref<Set<string>>
  /** Current puzzle date (YYYY-MM-DD) */
  currentDate: MaybeRefOrGetter<string>
  /** Current language code */
  currentLang: MaybeRefOrGetter<string>
  /** Called when we should navigate to a different puzzle (from initial sync) */
  onNavigateToPuzzle?: (date: string, lang: string) => void
}

// Global sync state (singleton pattern for cross-component access)
const globalSyncState = {
  isConnected: ref(false),
  isConnecting: ref(false),
  connectionError: ref<string | null>(null),
  connectedDevices: ref(0),
  hasEverSynced: ref(false), // True if any device has ever synced to this room
}

/**
 * Get the current sync state (can be called from any component).
 * This is separate from useSync() so components can read state without needing the full sync setup.
 */
export function useSyncState() {
  return {
    isConnected: readonly(globalSyncState.isConnected),
    isConnecting: readonly(globalSyncState.isConnecting),
    connectionError: readonly(globalSyncState.connectionError),
    connectedDevices: readonly(globalSyncState.connectedDevices),
    hasEverSynced: readonly(globalSyncState.hasEverSynced),
  }
}

export function useSync(options: UseSyncOptions) {
  const { syncCode, isEnabled } = useSyncCode()
  const isOnline = useOnline()
  const config = useRuntimeConfig()
  const { t } = useI18n()

  const socket = shallowRef<PartySocket | null>(null)

  // Use global state refs so other components can access
  const { isConnected, isConnecting, connectionError, connectedDevices, hasEverSynced } = globalSyncState

  function connect() {
    if (!isEnabled.value || !syncCode.value || socket.value) return

    isConnecting.value = true
    connectionError.value = null
    connectedDevices.value = 0

    // Normalize the sync code for use as room ID
    const roomId = normalizeRoomId(syncCode.value)

    socket.value = new PartySocket({
      host: config.public.partykit.host,
      room: roomId,
    })

    socket.value.addEventListener('open', () => {
      isConnected.value = true
      isConnecting.value = false

      sendSyncAll()
    })

    socket.value.addEventListener('message', (event) => {
      handleIncomingMessage(event.data)
    })

    socket.value.addEventListener('close', () => {
      isConnected.value = false
      connectedDevices.value = 0
    })

    socket.value.addEventListener('error', () => {
      connectionError.value = 'Connection error'
      isConnecting.value = false
      isConnected.value = false
    })
  }

  function disconnect() {
    if (socket.value) {
      socket.value.close()
      socket.value = null
    }
    isConnected.value = false
    isConnecting.value = false
    connectedDevices.value = 0
    hasEverSynced.value = false
  }

  function handleIncomingMessage(data: string) {
    let message: ServerMessage
    try {
      message = JSON.parse(data)
    }
    catch {
      return
    }

    if (message.type === 'sync-all') {
      handleSyncAll(message.puzzles, message.lastActivePuzzle?.date, message.lastActivePuzzle?.lang)
    }
    else if (message.type === 'sync-puzzle') {
      // Single puzzle sync
      handleSyncPuzzle(message.puzzleKey, message.words)
    }
    else if (message.type === 'word') {
      // New word from another device
      handleNewWord(message.puzzleKey, message.word)
    }
    else if (message.type === 'sync-status') {
      // Update connection count and sync status
      connectedDevices.value = message.count
      hasEverSynced.value = message.hasEverSynced
    }
  }

  // Track if this is the first sync in this page load (to know when to navigate)
  let hasCompletedInitialSync = false

  // Track if we've ever completed an initial sync (persists across page reloads)
  // This lets us suppress the toast on page reload, but show it when first joining sync
  const HAS_SYNCED_KEY = 'pangrum-has-synced'
  const hadPreviouslyCompletedSync = import.meta.client && localStorage.getItem(HAS_SYNCED_KEY) === 'true'

  function handleSyncAll(remotePuzzles: Record<string, string[]>, lastActiveDate?: string, lastActiveLang?: string) {
    const isInitialSync = !hasCompletedInitialSync

    let totalAdded = 0

    for (const [puzzleKey, remoteWords] of Object.entries(remotePuzzles)) {
      const added = mergePuzzleWords(puzzleKey, remoteWords)
      totalAdded += added
    }

    // Show toast logic:
    // - Initial sync on page load when we've synced before: suppress (silent reconnect)
    // - Initial sync when first joining: show (user just set up sync)
    // - Later syncs during session: show (new words from other devices)
    const suppressToast = isInitialSync && hadPreviouslyCompletedSync
    if (totalAdded > 0 && !suppressToast) {
      addToast({
        message: t('settings.syncToasts.wordsSynced', { count: totalAdded }),
        type: 'success',
      })
    }

    // Mark that we've completed at least one sync (persists across reloads)
    localStorage.setItem(HAS_SYNCED_KEY, 'true')

    // On first sync, navigate to the last active puzzle if we have date info
    if (isInitialSync && !hadPreviouslyCompletedSync && lastActiveDate && lastActiveLang) {
      options.onNavigateToPuzzle?.(lastActiveDate, lastActiveLang)
    }

    hasCompletedInitialSync = true
  }

  function handleSyncPuzzle(puzzleKey: string, remoteWords: string[]) {
    const added = mergePuzzleWords(puzzleKey, remoteWords)

    if (added > 0) {
      addToast({
        message: t('settings.syncToasts.wordsSynced', { count: added }),
        type: 'success',
      })
    }
  }

  function handleNewWord(puzzleKey: string, word: string) {
    const added = mergePuzzleWords(puzzleKey, [word])

    if (added > 0 && puzzleKey === toValue(options.currentPuzzleKey)) {
      // Show toast only for current puzzle
      addToast({
        message: t('settings.syncToasts.wordSynced'),
        type: 'success',
      })
    }
  }

  function mergePuzzleWords(puzzleKey: string, remoteWords: string[]): number {
    const localWords = getPuzzleFromLocal(puzzleKey)
    const localSet = new Set(localWords)
    let added = 0

    for (const word of remoteWords) {
      if (!localSet.has(word)) {
        localSet.add(word)
        added++
      }
    }

    if (added > 0) {
      savePuzzleToLocal(puzzleKey, [...localSet])

      // Update reactive ref if this is the current puzzle
      if (puzzleKey === toValue(options.currentPuzzleKey)) {
        for (const word of remoteWords) {
          options.currentWords.value.add(word)
        }
      }
    }

    return added
  }

  function sendSyncAll() {
    if (!socket.value || socket.value.readyState !== WebSocket.OPEN) return

    const puzzles = getAllLocalPuzzles()
    const message: SyncAllMessage = {
      type: 'sync-all',
      puzzles,
      // Include current puzzle info so server can track last active puzzle
      currentPuzzle: toValue(options.currentPuzzleKey)
        ? {
            puzzleKey: toValue(options.currentPuzzleKey),
            date: toValue(options.currentDate),
            lang: toValue(options.currentLang),
          }
        : undefined,
    }
    socket.value.send(JSON.stringify(message))
  }

  function sendWord(word: string) {
    if (!socket.value || socket.value.readyState !== WebSocket.OPEN) return

    const message: WordMessage = {
      type: 'word',
      puzzleKey: toValue(options.currentPuzzleKey),
      word,
      date: toValue(options.currentDate),
    }
    socket.value.send(JSON.stringify(message))
  }

  // Auto-connect when sync is enabled and online
  watch(
    [isEnabled, isOnline],
    ([enabled, online]) => {
      if (enabled && online) {
        connect()
      }
      else {
        disconnect()
      }
    },
    { immediate: true },
  )

  // Cleanup on unmount
  onUnmounted(() => {
    disconnect()
  })

  return {
    isConnected: readonly(isConnected),
    isConnecting: readonly(isConnecting),
    connectionError: readonly(connectionError),
    connectedDevices: readonly(connectedDevices),
    sendWord,
    sendSyncAll,
    connect,
    disconnect,
  }
}

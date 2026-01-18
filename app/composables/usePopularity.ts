import PartySocket from 'partysocket'

export interface PopularityData {
  counts: Record<string, number>
  totalPlayers: number
}

interface InitMessage {
  type: 'init'
  counts: Record<string, number>
  totalPlayers: number
}

interface UpdateMessage {
  type: 'update'
  wordHash: string
  count: number
  totalPlayers: number
}

interface QueuedSubmission {
  lang: string
  date: string
  wordHash: string
  isFirstWord: boolean
  timestamp: number
}

type ServerMessage = InitMessage | UpdateMessage

const QUEUE_KEY = 'pangrum-popularity-queue'
const MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24 hours

export function usePopularity(
  lang: MaybeRefOrGetter<string>,
  date: MaybeRefOrGetter<string>,
) {
  const config = useRuntimeConfig()
  const isOnline = useOnline()

  const counts = ref<Record<string, number>>({})
  const totalPlayers = ref(0)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  const isConnected = ref(false)

  const socket = shallowRef<PartySocket | null>(null)

  const hasData = computed(() => totalPlayers.value > 0)

  function getQueue(): QueuedSubmission[] {
    if (import.meta.server) return []
    try {
      return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
    }
    catch {
      return []
    }
  }

  function saveQueue(queue: QueuedSubmission[]) {
    if (import.meta.server) return
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
  }

  function queueSubmission(langValue: string, dateValue: string, wordHash: string, isFirstWord: boolean) {
    const queue = getQueue()
    queue.push({
      lang: langValue,
      date: dateValue,
      wordHash,
      isFirstWord,
      timestamp: Date.now(),
    })
    saveQueue(queue)
  }

  async function processQueue() {
    if (import.meta.server) return

    const queue = getQueue()
    if (queue.length === 0) return

    const remaining: QueuedSubmission[] = []
    const now = Date.now()

    const host = config.public.partykit.host
    const protocol = host.startsWith('localhost') ? 'http' : 'https'

    for (const item of queue) {
      if (now - item.timestamp >= MAX_AGE_MS) continue

      const roomId = `${item.lang}-${item.date}`
      const url = `${protocol}://${host}/parties/popularity/${roomId}`

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'word',
            wordHash: item.wordHash,
            isFirstWord: item.isFirstWord,
          }),
        })
        if (!response.ok) {
          remaining.push(item)
        }
      }
      catch {
        remaining.push(item)
      }
    }

    saveQueue(remaining)
  }

  function connect() {
    const langValue = toValue(lang)
    const dateValue = toValue(date)

    if (!langValue || !dateValue) return
    if (socket.value) return

    loading.value = true
    error.value = null

    socket.value = new PartySocket({
      host: config.public.partykit.host,
      party: 'popularity',
      room: `${langValue}-${dateValue}`,
    })

    socket.value.addEventListener('open', () => {
      isConnected.value = true
      processQueue()
    })

    socket.value.addEventListener('message', (event) => {
      handleMessage(event.data)
    })

    socket.value.addEventListener('close', () => {
      isConnected.value = false
      socket.value = null
    })
    socket.value.addEventListener('error', () => {
      error.value = new Error('WebSocket connection error')
      loading.value = false
      isConnected.value = false
      socket.value = null
    })
  }

  function disconnect() {
    if (socket.value) {
      socket.value.close()
      socket.value = null
    }
    isConnected.value = false
  }

  function handleMessage(data: string) {
    let message: ServerMessage
    try {
      message = JSON.parse(data)
    }
    catch {
      return
    }

    if (message.type === 'init') {
      counts.value = message.counts
      totalPlayers.value = message.totalPlayers
      loading.value = false
    }
    else if (message.type === 'update') {
      counts.value[message.wordHash] = message.count
      totalPlayers.value = message.totalPlayers
    }
  }

  function submitWord(wordHash: string, isFirstWord?: boolean) {
    const langValue = toValue(lang)
    const dateValue = toValue(date)

    // Optimistically update local counts
    counts.value[wordHash] = (counts.value[wordHash] || 0) + 1
    if (isFirstWord) {
      totalPlayers.value += 1
    }

    // send via WebSocket if connected
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      socket.value.send(JSON.stringify({
        type: 'word',
        wordHash,
        isFirstWord,
      }))
      return
    }

    // queue for later if not connected
    queueSubmission(langValue, dateValue, wordHash, !!isFirstWord)
  }

  function getPercentage(wordHash: string): number | null {
    if (totalPlayers.value === 0) return null
    const count = counts.value[wordHash] || 0
    return Math.round((count / totalPlayers.value) * 100)
  }

  function getCount(wordHash: string): number {
    return counts.value[wordHash] || 0
  }

  // TODO: remove after migration to partykit is complete
  function reconcileFoundWords(foundWordHashes: string[]) {
    if (!socket.value || socket.value.readyState !== WebSocket.OPEN) return
    if (totalPlayers.value === 0 || foundWordHashes.length === 0) return

    const hasMissingWord = foundWordHashes.some(
      wordHash => (counts.value[wordHash] || 0) === 0,
    )

    if (!hasMissingWord) return

    foundWordHashes.forEach((wordHash, index) => {
      socket.value!.send(JSON.stringify({
        type: 'word',
        wordHash,
        isFirstWord: index === 0,
      }))
    })
  }

  watch(
    [() => toValue(lang), () => toValue(date)],
    () => {
      disconnect()
      counts.value = {}
      totalPlayers.value = 0
      connect()
    },
  )

  watch(isOnline, (online) => {
    if (online) {
      if (!socket.value) {
        connect()
      }
      else {
        processQueue()
      }
    }
  })

  onUnmounted(() => {
    disconnect()
  })

  return {
    counts: readonly(counts),
    totalPlayers: readonly(totalPlayers),
    loading: readonly(loading),
    error: readonly(error),
    isConnected: readonly(isConnected),
    hasData,
    connect,
    disconnect,
    submitWord,
    getPercentage,
    getCount,
    reconcileFoundWords,
  }
}

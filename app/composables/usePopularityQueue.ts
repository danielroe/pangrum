interface QueuedSubmission {
  lang: string
  date: string
  wordHash: string
  isFirstWord: boolean
  timestamp: number
}

const QUEUE_KEY = 'pangrum-popularity-queue'
const MAX_AGE_MS = 24 * 60 * 60 * 1000 // 24 hours

export function usePopularityQueue() {
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

  function queueSubmission(lang: string, date: string, wordHash: string, isFirstWord: boolean) {
    const queue = getQueue()
    queue.push({
      lang,
      date,
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

    for (const item of queue) {
      // Skip expired items
      if (now - item.timestamp >= MAX_AGE_MS) continue

      try {
        await $fetch(`/api/popularity/${item.lang}/${item.date}`, {
          method: 'POST',
          body: {
            wordHash: item.wordHash,
            isFirstWord: item.isFirstWord,
          },
        })
      }
      catch {
        // Keep failed items for retry
        remaining.push(item)
      }
    }

    saveQueue(remaining)
  }

  function hasBackgroundSyncSupport(): boolean {
    if (import.meta.server) return false
    return 'serviceWorker' in navigator && 'SyncManager' in window
  }

  return {
    queueSubmission,
    processQueue,
    hasBackgroundSyncSupport,
  }
}

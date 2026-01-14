import type * as Party from 'partykit/server'

/**
 * PartyKit server for cross-device progress sync in Pangrum.
 *
 * Each room represents a sync code. When users connect with the same sync code,
 * they share progress across devices in real-time.
 */

interface SyncAllMessage {
  type: 'sync-all'
  puzzles: Record<string, string[]> // puzzleKey -> words[]
  /** The puzzle the client is currently viewing */
  currentPuzzle?: { puzzleKey: string, date: string, lang: string }
  /** Most recently played puzzle (server -> client only) */
  lastActivePuzzle?: { puzzleKey: string, date: string, lang: string }
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
  /** Date of the puzzle (YYYY-MM-DD) */
  date?: string
}

interface SyncStatusMessage {
  type: 'sync-status'
  count: number
  hasEverSynced: boolean
}

type ClientMessage = SyncAllMessage | WordMessage

export default class Server implements Party.Server {
  options: Party.ServerOptions = {
    hibernate: true,
  }

  constructor(readonly room: Party.Room) {}

  async onConnect(conn: Party.Connection, _ctx: Party.ConnectionContext) {
    const count = this.getConnectionCount()

    // Mark as synced if we now have multiple connections and there's data
    if (count > 1) {
      const puzzleKeys = await this.getAllPuzzleKeys()
      if (puzzleKeys.length > 0) {
        await this.markAsSynced()
      }
    }

    // Broadcast updated sync status to all clients
    await this.broadcastSyncStatus()

    // Send sync status to the new connection
    const hasEverSynced = await this.hasEverSynced()
    conn.send(JSON.stringify({
      type: 'sync-status',
      count,
      hasEverSynced,
    } satisfies SyncStatusMessage))
  }

  async onClose(_conn: Party.Connection) {
    await this.broadcastSyncStatus()
  }

  async onMessage(message: string, sender: Party.Connection) {
    let data: ClientMessage
    try {
      data = JSON.parse(message)
    }
    catch {
      return // Ignore invalid JSON
    }

    if (data.type === 'sync-all') {
      // Client is syncing all their puzzles - merge and respond
      await this.handleSyncAll(data, sender)
    }
    else if (data.type === 'word') {
      // Client found a new word - store and broadcast
      await this.handleNewWord(data, sender)
    }
  }

  private getConnectionCount(): number {
    return [...this.room.getConnections()].length
  }

  private async broadcastSyncStatus() {
    const count = this.getConnectionCount()
    const hasEverSynced = await this.hasEverSynced()
    this.room.broadcast(JSON.stringify({
      type: 'sync-status',
      count,
      hasEverSynced,
    } satisfies SyncStatusMessage))
  }

  private async handleSyncAll(data: SyncAllMessage, sender: Party.Connection) {
    const { puzzles: clientPuzzles, currentPuzzle } = data
    const serverPuzzles: Record<string, string[]> = {}
    const updatedPuzzles: Record<string, string[]> = {}

    // Get the EXISTING last active puzzle BEFORE updating it
    // This is what we'll send to the client so they can navigate to it
    const lastActivePuzzleData = await this.getLastActivePuzzle()

    // Get all puzzle keys (from both client and server)
    const allKeys = new Set([
      ...Object.keys(clientPuzzles),
      ...(await this.getAllPuzzleKeys()),
    ])

    // Merge each puzzle
    for (const puzzleKey of allKeys) {
      const clientWords = clientPuzzles[puzzleKey] || []
      const serverWords = await this.getWordsForPuzzle(puzzleKey)

      // Merge (union of both sets)
      const merged = [...new Set([...serverWords, ...clientWords])]

      // Track if there are updates
      if (merged.length > serverWords.length) {
        // Server needs to store new words
        await this.setWordsForPuzzle(puzzleKey, merged)
        updatedPuzzles[puzzleKey] = merged
      }

      // Include in response if server has words the client might not have
      if (merged.length > 0) {
        serverPuzzles[puzzleKey] = merged
      }
    }

    // Update last active puzzle AFTER reading (so joining clients get the existing value)
    if (currentPuzzle) {
      await this.setLastActivePuzzle(currentPuzzle)
    }

    // Send merged state back to the sender
    sender.send(JSON.stringify({
      type: 'sync-all',
      puzzles: serverPuzzles,
      lastActivePuzzle: lastActivePuzzleData,
    } satisfies SyncAllMessage))

    // Broadcast updated puzzles to all OTHER connections
    if (Object.keys(updatedPuzzles).length > 0) {
      for (const [puzzleKey, words] of Object.entries(updatedPuzzles)) {
        this.room.broadcast(
          JSON.stringify({
            type: 'sync-puzzle',
            puzzleKey,
            words,
          } satisfies SyncPuzzleMessage),
          [sender.id],
        )
      }
    }
  }

  private async handleNewWord(data: WordMessage, sender: Party.Connection) {
    const { puzzleKey, word, date } = data

    // Get current words and add the new one
    const words = await this.getWordsForPuzzle(puzzleKey)

    if (!words.includes(word)) {
      words.push(word)
      await this.setWordsForPuzzle(puzzleKey, words)

      // Update last active puzzle if date is provided
      if (date) {
        const lang = puzzleKey.split('-')[0] || 'en'
        await this.setLastActivePuzzle({ puzzleKey, date, lang })
      }

      // Broadcast to all OTHER connections (sender already has this word)
      this.room.broadcast(
        JSON.stringify({
          type: 'word',
          puzzleKey,
          word,
        } satisfies WordMessage),
        [sender.id],
      )
    }
  }

  private async getAllPuzzleKeys(): Promise<string[]> {
    const keys: string[] = []
    const items = await this.room.storage.list()
    for (const key of items.keys()) {
      if (key.startsWith('puzzle:')) {
        keys.push(key.slice(7)) // Remove 'puzzle:' prefix
      }
    }
    return keys
  }

  private async getWordsForPuzzle(puzzleKey: string): Promise<string[]> {
    return await this.room.storage.get<string[]>(`puzzle:${puzzleKey}`) ?? []
  }

  private async setWordsForPuzzle(puzzleKey: string, words: string[]): Promise<void> {
    await this.room.storage.put(`puzzle:${puzzleKey}`, words)
  }

  private async getLastActivePuzzle(): Promise<{ puzzleKey: string, date: string, lang: string } | undefined> {
    const data = await this.room.storage.get<{ puzzleKey: string, date: string, lang: string, timestamp: number }>('lastActivePuzzle')
    if (!data) return undefined
    return { puzzleKey: data.puzzleKey, date: data.date, lang: data.lang }
  }

  private async setLastActivePuzzle(puzzle: { puzzleKey: string, date: string, lang: string }): Promise<void> {
    await this.room.storage.put('lastActivePuzzle', {
      ...puzzle,
      timestamp: Date.now(),
    })
  }

  private async hasEverSynced(): Promise<boolean> {
    return await this.room.storage.get<boolean>('hasEverSynced') ?? false
  }

  private async markAsSynced(): Promise<void> {
    await this.room.storage.put('hasEverSynced', true)
  }
}

Server satisfies Party.Worker

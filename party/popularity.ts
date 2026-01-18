import type * as Party from 'partykit/server'

/**
 * PartyKit server for real-time popularity tracking in Pangrum.
 *
 * Each room represents a single puzzle day: `{lang}-{date}` (e.g., "en-2026-01-18")
 * All players on the same puzzle connect to the same room and see real-time updates.
 *
 * On first access, seeds itself from the HTTP API (which reads from KV).
 * After that, tracks all updates in real-time.
 */

interface WordSubmission {
  type: 'word'
  wordHash: string
  isFirstWord?: boolean
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

type ClientMessage = WordSubmission
type _ServerMessage = InitMessage | UpdateMessage

export default class PopularityServer implements Party.Server {
  options: Party.ServerOptions = {
    hibernate: true,
  }

  constructor(readonly room: Party.Room) {}

  async onConnect(conn: Party.Connection, _ctx: Party.ConnectionContext) {
    await this.maybeSeedFromAPI()

    const items = await this.room.storage.list()
    const counts: Record<string, number> = {}
    let totalPlayers = 0

    for (const [key, value] of items) {
      if (key === 'players') {
        totalPlayers = value as number
      }
      else if (key.startsWith('count:')) {
        counts[key.slice(6)] = value as number
      }
    }

    conn.send(JSON.stringify({
      type: 'init',
      counts,
      totalPlayers,
    } satisfies InitMessage))
  }

  async onMessage(message: string, _sender: Party.Connection) {
    let data: ClientMessage
    try {
      data = JSON.parse(message)
    }
    catch {
      return
    }

    if (data.type === 'word') {
      await this.handleWordSubmission(data)
    }
  }

  /**
   * HTTP POST handler for offline queue fallback.
   */
  async onRequest(req: Party.Request): Promise<Response> {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    try {
      const body = await req.json() as ClientMessage
      if (body.type === 'word') {
        await this.handleWordSubmission(body)
        return Response.json({ success: true })
      }
      return new Response('Invalid message type', { status: 400 })
    }
    catch {
      return new Response('Invalid request body', { status: 400 })
    }
  }

  /**
   * Seed data from the HTTP API (which reads from KV) on first access.
   */
  private async maybeSeedFromAPI() {
    const values = await this.room.storage.get(['seeded', 'players'])
    if (values.get('seeded')) return

    await this.room.storage.put('seeded', true)

    if ((values.get('players') as number) > 0) return

    // Parse room ID to get lang and date (format: "lang-date", e.g., "en-2026-01-18")
    const roomId = this.room.id
    const match = roomId.match(/^([a-z]{2}(?:-[a-z]{2})?)-(\d{4}-\d{2}-\d{2})$/)
    if (!match) return

    const [, lang, date] = match

    try {
      const response = await fetch(`https://pangrum.com/api/popularity/${lang}/${date}`)
      if (!response.ok) return

      const data = await response.json() as { counts: Record<string, number>, totalPlayers: number }

      if (data.totalPlayers > 0) {
        const entries: Record<string, number> = { players: data.totalPlayers }
        for (const [wordHash, count] of Object.entries(data.counts)) {
          entries[`count:${wordHash}`] = count
        }
        await this.room.storage.put(entries)
      }
    }
    catch {
      // Seed failed, but that's OK - room will start fresh
    }
  }

  private async handleWordSubmission(data: WordSubmission) {
    const { wordHash, isFirstWord } = data
    const countKey = `count:${wordHash}`

    const values = await this.room.storage.get([countKey, 'players'])
    const currentCount = (values.get(countKey) as number) || 0
    let totalPlayers = (values.get('players') as number) || 0

    const newCount = currentCount + 1
    if (isFirstWord) {
      totalPlayers += 1
    }

    const updates: Record<string, number> = { [countKey]: newCount }
    if (isFirstWord) {
      updates.players = totalPlayers
    }
    await this.room.storage.put(updates)

    this.room.broadcast(JSON.stringify({
      type: 'update',
      wordHash,
      count: newCount,
      totalPlayers,
    } satisfies UpdateMessage))
  }
}

PopularityServer satisfies Party.Worker

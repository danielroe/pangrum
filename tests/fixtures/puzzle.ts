import { hash } from 'ohash'
import type { Page, Route } from '@playwright/test'

// Test puzzle data with known valid words
export const TEST_PUZZLE = {
  // Centre letter is index 2 = 'A'
  letters: ['T', 'R', 'A', 'I', 'N', 'E', 'S'],
  centreLetter: 'A',
  validWords: ['RAIN', 'TRAIN', 'STAIN', 'SATIN', 'ANTS', 'TANS', 'RANT', 'RANTS', 'TRAINS', 'RETAINS'],
  // Uses all 7 letters: R, E, T, A, I, N, S
  pangram: 'RETAINS',
}

// Generate hashes for valid words
export const TEST_HASHES = TEST_PUZZLE.validWords.map(w => hash(w))

// Mock API response
export const TEST_API_RESPONSE = {
  letters: TEST_PUZZLE.letters,
  hashes: TEST_HASHES,
  words: TEST_PUZZLE.validWords.map(w => w[0] + '_'.repeat(w.length - 1)),
  pairs: { RA: 2, TR: 2, ST: 2, SA: 1, AN: 1, TA: 1 },
  pangrams: 1,
  date: new Date().toISOString().slice(0, 10),
  lang: 'en',
}

// Helper to mock the puzzle API
export async function mockPuzzleApi(page: Page) {
  await page.route('**/api/words/**', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(TEST_API_RESPONSE),
    })
  })
}

export async function skipTutorial(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('pangrum-tutorial-seen', 'true')
  })
}

export async function disableHints(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('pangrum-hints-enabled', 'false')
  })
}

export async function enableHints(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('pangrum-hints-enabled', 'true')
  })
}

export async function mockPartyKitConnection(page: Page) {
  await page.addInitScript(() => {
    const OriginalWebSocket = window.WebSocket

    class MockWebSocket extends EventTarget {
      static CONNECTING = 0
      static OPEN = 1
      static CLOSING = 2
      static CLOSED = 3

      url: string
      readyState: number = MockWebSocket.CONNECTING
      protocol: string = ''
      extensions: string = ''
      binaryType: BinaryType = 'blob'
      bufferedAmount: number = 0

      onopen: ((event: Event) => void) | null = null
      onclose: ((event: CloseEvent) => void) | null = null
      onmessage: ((event: MessageEvent) => void) | null = null
      onerror: ((event: Event) => void) | null = null

      constructor(url: string | URL, protocols?: string | string[]) {
        super()
        this.url = url.toString()

        if (this.url.includes('partykit') || this.url.includes('parties/popularity')) {
          setTimeout(() => {
            this.readyState = MockWebSocket.OPEN
            const openEvent = new Event('open')
            this.onopen?.(openEvent)
            this.dispatchEvent(openEvent)

            const initMessage = JSON.stringify({
              type: 'init',
              counts: {},
              totalPlayers: 0,
            })
            const messageEvent = new MessageEvent('message', { data: initMessage })
            this.onmessage?.(messageEvent)
            this.dispatchEvent(messageEvent)
          }, 50)
        }
        else {
          // Use real WebSocket for non-PartyKit connections
          const realSocket = new OriginalWebSocket(url, protocols)
          realSocket.onopen = (e) => {
            this.readyState = MockWebSocket.OPEN
            this.onopen?.(e)
          }
          realSocket.onclose = (e) => {
            this.readyState = MockWebSocket.CLOSED
            this.onclose?.(e)
          }
          realSocket.onmessage = e => this.onmessage?.(e)
          realSocket.onerror = e => this.onerror?.(e)
        }
      }

      send(_data: string | ArrayBuffer | Blob | ArrayBufferView) {
        // Ignore sends in mock
      }

      close(_code?: number, _reason?: string) {
        this.readyState = MockWebSocket.CLOSED
        const closeEvent = new CloseEvent('close', { code: 1000, reason: 'Normal closure' })
        this.onclose?.(closeEvent)
        this.dispatchEvent(closeEvent)
      }
    }

    // Replace global WebSocket with our mock
    // @ts-expect-error - intentionally replacing WebSocket
    window.WebSocket = MockWebSocket
  })
}

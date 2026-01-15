import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: () => { store = {} },
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

describe('usePopularityQueue', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('queues submissions to localStorage', async () => {
    const { usePopularityQueue } = await import('../../app/composables/usePopularityQueue')
    const { queueSubmission } = usePopularityQueue()

    queueSubmission('en', '2024-01-15', 'hash123', true)

    expect(localStorageMock.setItem).toHaveBeenCalled()
    const savedQueue = JSON.parse(localStorageMock.setItem.mock.calls[0][1])
    expect(savedQueue).toHaveLength(1)
    expect(savedQueue[0]).toMatchObject({
      lang: 'en',
      date: '2024-01-15',
      wordHash: 'hash123',
      isFirstWord: true,
    })
  })

  it('queues multiple submissions', async () => {
    const { usePopularityQueue } = await import('../../app/composables/usePopularityQueue')
    const { queueSubmission } = usePopularityQueue()

    queueSubmission('en', '2024-01-15', 'hash1', true)
    queueSubmission('en', '2024-01-15', 'hash2', false)
    queueSubmission('de', '2024-01-16', 'hash3', true)

    const calls = localStorageMock.setItem.mock.calls
    const lastSavedQueue = JSON.parse(calls[calls.length - 1][1])
    expect(lastSavedQueue).toHaveLength(3)
  })
})

describe('popularity percentage calculation', () => {
  function calculatePercentage(counts: Record<string, number>, totalPlayers: number, wordHash: string): number | null {
    if (totalPlayers === 0) return null
    const count = counts[wordHash] || 0
    return Math.round((count / totalPlayers) * 100)
  }

  it('computes percentage correctly', () => {
    const counts = { hash1: 75, hash2: 50, hash3: 10 }
    const totalPlayers = 100

    expect(calculatePercentage(counts, totalPlayers, 'hash1')).toBe(75)
    expect(calculatePercentage(counts, totalPlayers, 'hash2')).toBe(50)
    expect(calculatePercentage(counts, totalPlayers, 'hash3')).toBe(10)
    expect(calculatePercentage(counts, totalPlayers, 'hashUnknown')).toBe(0)
  })

  it('handles zero total players', () => {
    expect(calculatePercentage({ hash1: 10 }, 0, 'hash1')).toBeNull()
  })

  it('rounds percentages correctly', () => {
    expect(calculatePercentage({ hash1: 33 }, 100, 'hash1')).toBe(33)
    expect(calculatePercentage({ hash1: 1 }, 3, 'hash1')).toBe(33)
    expect(calculatePercentage({ hash1: 2 }, 3, 'hash1')).toBe(67)
  })
})

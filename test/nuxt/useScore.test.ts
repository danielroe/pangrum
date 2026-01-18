import { describe, expect, it } from 'vitest'

describe('useScore', () => {
  it('returns 0 score and maxScore with empty inputs', () => {
    const words = ref(new Set<string>())
    const validWords = ref<string[]>([])

    const { score, maxScore, percentage } = useScore(words, validWords)

    expect(score.value).toBe(0)
    expect(maxScore.value).toBe(0)
    expect(percentage.value).toBe(0)
  })

  it('calculates maxScore from all valid words', () => {
    const words = ref(new Set<string>())
    // 4-letter word = 1, 5-letter word = 5
    const validWords = ref(['TEST', 'TESTS'])

    const { maxScore } = useScore(words, validWords)

    expect(maxScore.value).toBe(1 + 5)
  })

  it('calculates score from found words only', () => {
    const words = ref(new Set(['TEST'])) // Only found 'TEST'
    const validWords = ref(['TEST', 'TESTS', 'LONGER'])

    const { score, maxScore } = useScore(words, validWords)

    expect(score.value).toBe(1) // Only TEST found
    expect(maxScore.value).toBe(1 + 5 + 6) // TEST + TESTS + LONGER
  })

  it('calculates percentage correctly', () => {
    const words = ref(new Set(['TEST', 'TESTS'])) // Found 2 words
    const validWords = ref(['TEST', 'TESTS']) // All words found

    const { percentage } = useScore(words, validWords)

    expect(percentage.value).toBe(100)
  })

  it('updates reactively when words change', () => {
    const words = ref(new Set<string>())
    const validWords = ref(['TEST', 'TESTS'])

    const { score, percentage } = useScore(words, validWords)

    expect(score.value).toBe(0)
    expect(percentage.value).toBe(0)

    // Add a word
    words.value = new Set(['TEST'])

    expect(score.value).toBe(1)
    // 1 / 6 = ~17%
    expect(percentage.value).toBe(17)
  })

  it('handles undefined words set gracefully', () => {
    const words = ref<Set<string> | undefined>(undefined)
    const validWords = ref(['TEST'])

    const { score, percentage } = useScore(words, validWords)

    expect(score.value).toBe(0)
    expect(percentage.value).toBe(0)
  })

  it('includes pangram bonus in score calculations', () => {
    // A pangram with 7 unique letters
    const pangramWord = 'ABCDEFG'
    const words = ref(new Set([pangramWord]))
    const validWords = ref([pangramWord])

    const { score, maxScore, percentage } = useScore(words, validWords)

    // 7 letters + 7 bonus = 14
    expect(score.value).toBe(14)
    expect(maxScore.value).toBe(14)
    expect(percentage.value).toBe(100)
  })
})

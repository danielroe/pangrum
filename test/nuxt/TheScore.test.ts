import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { TheScore } from '#components'

describe('TheScore', () => {
  const defaultProps = {
    words: new Set<string>(),
    validWords: ['TEST', 'TESTS', 'SEATING'],
    totalPangrams: 1,
    letters: ['T', 'E', 'S', 'I', 'N', 'G', 'A'],
    date: '2026-01-12',
  }

  it('renders score as 0 when no words found', async () => {
    const component = await mountSuspended(TheScore, {
      props: defaultProps,
    })

    expect(component.text()).toContain('0')
    expect(component.text()).toContain('beginner')
  })

  it('updates score when words are provided', async () => {
    const component = await mountSuspended(TheScore, {
      props: {
        ...defaultProps,
        words: new Set(['TEST']), // 4-letter word = 1 point
      },
    })

    expect(component.text()).toContain('1')
  })

  it('shows correct status based on percentage', async () => {
    // Total possible score: TEST(1) + TESTS(5) + SEATING(7+7=14) = 20
    const component = await mountSuspended(TheScore, {
      props: {
        ...defaultProps,
        words: new Set(['TESTS', 'TEST']), // 5 + 1 = 6 points
      },
    })

    // 6/20 = 30% which is "nice" (25-40%)
    expect(component.text()).toContain('nice')
  })

  it('shows pangram stars based on totalPangrams', async () => {
    const component = await mountSuspended(TheScore, {
      props: {
        ...defaultProps,
        totalPangrams: 3,
      },
    })

    const stars = component.findAll('.star')
    expect(stars).toHaveLength(3)
  })

  it('fills pangram stars when pangrams are found', async () => {
    // SEATING uses all 7 letters (S, E, A, T, I, N, G) - it's a pangram
    const component = await mountSuspended(TheScore, {
      props: {
        ...defaultProps,
        words: new Set(['SEATING']),
        totalPangrams: 2,
      },
    })

    // Find stars and check if any have the 'filled' class
    const allStars = component.findAll('.star')
    const filledStars = allStars.filter(star => star.classes().includes('filled'))
    expect(filledStars).toHaveLength(1)
  })

  it('shows share button when words are found', async () => {
    const component = await mountSuspended(TheScore, {
      props: {
        ...defaultProps,
        words: new Set(['TEST']),
      },
    })

    const shareButton = component.find('button[aria-label="Share results"]')
    expect(shareButton.exists()).toBe(true)
  })

  it('hides share button when no words found', async () => {
    const component = await mountSuspended(TheScore, {
      props: defaultProps,
    })

    const shareButton = component.find('button[aria-label="Share results"]')
    expect(shareButton.exists()).toBe(false)
  })

  it('emits share event when share button clicked', async () => {
    const component = await mountSuspended(TheScore, {
      props: {
        ...defaultProps,
        words: new Set(['TEST']),
      },
    })

    await component.find('button[aria-label="Share results"]').trigger('click')
    expect(component.emitted('share')).toHaveLength(1)
  })

  it('shows "perfect" status at 100%', async () => {
    const component = await mountSuspended(TheScore, {
      props: {
        ...defaultProps,
        words: new Set(['TEST', 'TESTS', 'SEATING']),
      },
    })

    expect(component.text()).toContain('perfect')
  })

  it('shows points needed to reach next threshold', async () => {
    const component = await mountSuspended(TheScore, {
      props: {
        ...defaultProps,
        words: new Set<string>(),
      },
    })

    // At 0 points, next threshold is "novice" (2.5%)
    expect(component.text()).toMatch(/\d+ to novice/)
  })
})

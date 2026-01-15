import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { FoundWordsList } from '#components'

describe('FoundWordsList', () => {
  const defaultProps = {
    words: new Set<string>(),
    letters: ['T', 'E', 'S', 'I', 'N', 'G', 'A'],
  }

  it('shows placeholder message when no words found', async () => {
    const component = await mountSuspended(FoundWordsList, {
      props: defaultProps,
    })

    // Check for either translated text or key (i18n may not load in tests)
    expect(component.text()).toMatch(/Make a guess to get started|foundWords\.empty/)
  })

  it('displays found words in lowercase', async () => {
    const component = await mountSuspended(FoundWordsList, {
      props: {
        ...defaultProps,
        words: new Set(['TEST', 'TESTS']),
      },
    })

    expect(component.text()).toContain('test')
    expect(component.text()).toContain('tests')
  })

  it('sorts words alphabetically', async () => {
    const component = await mountSuspended(FoundWordsList, {
      props: {
        ...defaultProps,
        words: new Set(['TESTS', 'NEST', 'AGENT']),
      },
    })

    const text = component.text()
    const agentIndex = text.indexOf('agent')
    const nestIndex = text.indexOf('nest')
    const testsIndex = text.indexOf('tests')

    expect(agentIndex).toBeLessThan(nestIndex)
    expect(nestIndex).toBeLessThan(testsIndex)
  })

  it('highlights pangrams with special styling', async () => {
    const component = await mountSuspended(FoundWordsList, {
      props: {
        ...defaultProps,
        // SEATING uses all 7 letters (S, E, A, T, I, N, G)
        letters: ['S', 'E', 'A', 'T', 'I', 'N', 'G'],
        words: new Set(['TEST', 'SEATING']),
      },
    })

    const listItems = component.findAll('li')
    const pangramItem = listItems.find(li => li.text().includes('seating'))

    expect(pangramItem?.classes()).toContain('is-pangram')
  })

  it('shows title attribute for pangrams', async () => {
    const component = await mountSuspended(FoundWordsList, {
      props: {
        ...defaultProps,
        letters: ['S', 'E', 'A', 'T', 'I', 'N', 'G'],
        words: new Set(['SEATING']),
      },
    })

    const listItems = component.findAll('li')
    const pangramItem = listItems.find(li => li.text().includes('seating'))

    // Check for either translated text or key (i18n may not load in tests)
    expect(pangramItem?.attributes('title')).toMatch(/Pangram!|foundWords\.pangram/)
  })

  it('renders words as list items', async () => {
    const component = await mountSuspended(FoundWordsList, {
      props: {
        ...defaultProps,
        words: new Set(['TEST', 'TESTS', 'NEST']),
      },
    })

    const listItems = component.findAll('li')
    expect(listItems).toHaveLength(3)
  })
})

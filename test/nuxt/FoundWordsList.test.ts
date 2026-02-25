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

    const buttons = component.findAll('button.word-item')
    const pangramButton = buttons.find(btn => btn.text().includes('seating'))

    expect(pangramButton?.classes()).toContain('is-pangram')
  })

  it('shows title attribute for pangrams', async () => {
    const component = await mountSuspended(FoundWordsList, {
      props: {
        ...defaultProps,
        letters: ['S', 'E', 'A', 'T', 'I', 'N', 'G'],
        words: new Set(['SEATING']),
      },
    })

    const buttons = component.findAll('button.word-item')
    const pangramButton = buttons.find(btn => btn.text().includes('seating'))

    // Check for either translated text or key (i18n may not load in tests)
    expect(pangramButton?.attributes('title')).toMatch(/Pangram!|foundWords\.pangram/)
  })

  it('renders words as buttons inside list items', async () => {
    const component = await mountSuspended(FoundWordsList, {
      props: {
        ...defaultProps,
        words: new Set(['TEST', 'TESTS', 'NEST']),
      },
    })

    const listItems = component.findAll('li')
    expect(listItems).toHaveLength(3)

    const buttons = component.findAll('button.word-item')
    expect(buttons).toHaveLength(3)
  })

  it('clicking a word button opens the definition modal', async () => {
    // Stub the modal to avoid showModal() API limitations in the test context
    const component = await mountSuspended(FoundWordsList, {
      props: {
        ...defaultProps,
        words: new Set(['TEST']),
      },
      global: {
        stubs: { WordDefinitionModal: { template: '<div data-testid="definition-modal" />' } },
      },
    })

    expect(component.find('[data-testid="definition-modal"]').exists()).toBe(false)

    await component.find('button.word-item').trigger('click')

    expect(component.find('[data-testid="definition-modal"]').exists()).toBe(true)
  })

  it('closing the definition modal removes it', async () => {
    const component = await mountSuspended(FoundWordsList, {
      props: {
        ...defaultProps,
        words: new Set(['TEST']),
      },
      global: {
        stubs: {
          WordDefinitionModal: {
            template: '<button data-testid="modal-close" @click="$emit(\'close\')" />',
            emits: ['close'],
          },
        },
      },
    })

    await component.find('button.word-item').trigger('click')
    expect(component.find('[data-testid="modal-close"]').exists()).toBe(true)

    await component.find('[data-testid="modal-close"]').trigger('click')
    expect(component.find('[data-testid="modal-close"]').exists()).toBe(false)
  })
})

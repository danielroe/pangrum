import { describe, expect, it, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { WordInput } from '#components'
import { useWord, useGuessHistory } from '#imports'

describe('WordInput guess history', () => {
  const defaultProps = {
    'centreLetter': 'I',
    'hashes': [],
    'letters': ['T', 'E', 'S', 'I', 'N', 'G', 'A'],
    'validWords': [],
    'words': new Set<string>(),
    'onUpdate:words': () => {},
  }

  beforeEach(() => {
    const word = useWord()
    const guessHistory = useGuessHistory()
    word.value = ''
    guessHistory.value = []
  })

  it('records guesses in history on submit', async () => {
    const word = useWord()
    const guessHistory = useGuessHistory()

    const component = await mountSuspended(WordInput, { props: defaultProps })

    // Type a word and submit via form — will fail validation but still be recorded
    word.value = 'TESTING'
    await component.find('form').trigger('submit')

    expect(guessHistory.value).toContain('TESTING')
  })

  it('cycles back through history with ArrowUp', async () => {
    const word = useWord()
    const guessHistory = useGuessHistory()
    guessHistory.value = ['FIRST', 'SECOND', 'THIRD']

    const component = await mountSuspended(WordInput, { props: defaultProps })
    const input = component.find('input')

    await input.trigger('keydown', { key: 'ArrowUp' })
    expect(word.value).toBe('THIRD')

    await input.trigger('keydown', { key: 'ArrowUp' })
    expect(word.value).toBe('SECOND')

    await input.trigger('keydown', { key: 'ArrowUp' })
    expect(word.value).toBe('FIRST')
  })

  it('does not cycle past the beginning of history', async () => {
    const word = useWord()
    const guessHistory = useGuessHistory()
    guessHistory.value = ['ONLY']

    const component = await mountSuspended(WordInput, { props: defaultProps })
    const input = component.find('input')

    await input.trigger('keydown', { key: 'ArrowUp' })
    expect(word.value).toBe('ONLY')

    // Pressing ArrowUp again stays on the same entry
    await input.trigger('keydown', { key: 'ArrowUp' })
    expect(word.value).toBe('ONLY')
  })

  it('restores saved input when cycling forward past history', async () => {
    const word = useWord()
    const guessHistory = useGuessHistory()
    guessHistory.value = ['PAST']
    word.value = 'CURRENT'

    const component = await mountSuspended(WordInput, { props: defaultProps })
    const input = component.find('input')

    // ArrowUp saves current input and shows history
    await input.trigger('keydown', { key: 'ArrowUp' })
    expect(word.value).toBe('PAST')

    // ArrowDown restores the saved input
    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(word.value).toBe('CURRENT')
  })

  it('does nothing on ArrowUp with empty history', async () => {
    const word = useWord()
    const guessHistory = useGuessHistory()
    guessHistory.value = []
    word.value = 'TYPING'

    const component = await mountSuspended(WordInput, { props: defaultProps })
    const input = component.find('input')

    await input.trigger('keydown', { key: 'ArrowUp' })
    expect(word.value).toBe('TYPING')
  })

  it('does nothing on ArrowDown when not browsing history', async () => {
    const word = useWord()
    const guessHistory = useGuessHistory()
    guessHistory.value = ['PAST']
    word.value = 'CURRENT'

    const component = await mountSuspended(WordInput, { props: defaultProps })
    const input = component.find('input')

    // ArrowDown without first pressing ArrowUp does nothing
    await input.trigger('keydown', { key: 'ArrowDown' })
    expect(word.value).toBe('CURRENT')
  })
})

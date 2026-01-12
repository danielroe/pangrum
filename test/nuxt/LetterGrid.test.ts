import { describe, expect, it } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { LetterGrid } from '#components'

describe('LetterGrid', () => {
  const defaultProps = {
    letters: ['T', 'E', 'S', 'I', 'N', 'G', 'A'],
    centreLetter: 'I',
  }

  it('renders all 7 letter buttons', async () => {
    const component = await mountSuspended(LetterGrid, {
      props: defaultProps,
    })

    const letterButtons = component.findAll('.letter-button')
    expect(letterButtons).toHaveLength(7)
  })

  it('displays the centre letter in a distinct button', async () => {
    const component = await mountSuspended(LetterGrid, {
      props: defaultProps,
    })

    const centreButton = component.find('.centre-letter')
    expect(centreButton.exists()).toBe(true)
    expect(centreButton.text()).toBe('I')
  })

  it('displays outer letters', async () => {
    const component = await mountSuspended(LetterGrid, {
      props: defaultProps,
    })

    const outerButtons = component.findAll('.outer-letter')
    expect(outerButtons).toHaveLength(6)

    const outerLetters = outerButtons.map(b => b.text())
    // Should have all letters except the centre letter
    expect(outerLetters).toContain('T')
    expect(outerLetters).toContain('E')
    expect(outerLetters).toContain('S')
    expect(outerLetters).toContain('N')
    expect(outerLetters).toContain('G')
    expect(outerLetters).toContain('A')
    expect(outerLetters).not.toContain('I')
  })

  it('has shuffle buttons', async () => {
    const component = await mountSuspended(LetterGrid, {
      props: defaultProps,
    })

    // Find buttons with "Shuffle" text or sr-only text
    const buttons = component.findAll('button')
    const shuffleButtons = buttons.filter((b) => {
      const text = b.text()
      const srOnly = b.find('.sr-only')
      return text.includes('Shuffle') || (srOnly.exists() && srOnly.text() === 'Shuffle letters')
    })

    expect(shuffleButtons.length).toBeGreaterThan(0)
  })

  it('has a delete button on mobile', async () => {
    const component = await mountSuspended(LetterGrid, {
      props: defaultProps,
    })

    const buttons = component.findAll('button')
    const deleteButtons = buttons.filter((b) => {
      const srOnly = b.find('.sr-only')
      return srOnly.exists() && srOnly.text() === 'Delete character'
    })

    expect(deleteButtons.length).toBe(1)
  })

  it('has a submit button on mobile', async () => {
    const component = await mountSuspended(LetterGrid, {
      props: defaultProps,
    })

    const buttons = component.findAll('button')
    const submitButtons = buttons.filter((b) => {
      const srOnly = b.find('.sr-only')
      return srOnly.exists() && srOnly.text() === 'Submit word'
    })

    expect(submitButtons.length).toBe(1)
  })
})
